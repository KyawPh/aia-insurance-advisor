#!/usr/bin/env node

import 'dotenv/config'
import { db } from './firebase-admin-init.js'
import { createRequire } from 'module'
import chalk from 'chalk'
import ora from 'ora'
const require = createRequire(import.meta.url)
const inquirer = require('inquirer').default
const Table = require('cli-table3')

// Cleanup criteria
const INACTIVE_DAYS = 180 // 6 months
const TEST_EMAIL_PATTERNS = [
  /test@/i,
  /demo@/i,
  /example@/i,
  /^\d+@/,
  /temp.*@/i,
  /fake@/i
]

async function getInactiveUsers(daysInactive) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - daysInactive)
  
  const snapshot = await db.collection('users').get()
  const inactiveUsers = []
  
  snapshot.forEach(doc => {
    const data = doc.data()
    const lastLogin = data.lastLogin?.toDate()
    
    if (!lastLogin || lastLogin < cutoffDate) {
      inactiveUsers.push({
        id: doc.id,
        email: data.email,
        fullName: data.fullName,
        lastLogin: lastLogin?.toISOString().split('T')[0] || 'Never',
        plan: data.subscription?.plan || 'unknown',
        quotaUsed: data.subscription?.quotaUsed || 0
      })
    }
  })
  
  return inactiveUsers
}

async function getTestUsers() {
  const snapshot = await db.collection('users').get()
  const testUsers = []
  
  snapshot.forEach(doc => {
    const data = doc.data()
    const email = data.email || ''
    
    if (TEST_EMAIL_PATTERNS.some(pattern => pattern.test(email))) {
      testUsers.push({
        id: doc.id,
        email: data.email,
        fullName: data.fullName,
        createdAt: data.createdAt?.toDate()?.toISOString().split('T')[0] || 'Unknown',
        plan: data.subscription?.plan || 'unknown'
      })
    }
  })
  
  return testUsers
}

async function getUsersWithInvalidData() {
  const snapshot = await db.collection('users').get()
  const invalidUsers = []
  
  snapshot.forEach(doc => {
    const data = doc.data()
    const issues = []
    
    // Check for missing required fields
    if (!data.uid) issues.push('Missing uid')
    if (!data.email) issues.push('Missing email')
    if (!data.subscription) issues.push('Missing subscription object')
    
    // Check for invalid subscription data
    if (data.subscription) {
      const sub = data.subscription
      if (sub.quotaUsed < 0) issues.push('Negative quota used')
      if (sub.quotaLimit < 0) issues.push('Negative quota limit')
      if (sub.isActive && sub.plan === 'unlimited') {
        const endDate = sub.subscriptionEnd?.toDate()
        if (endDate && endDate < new Date()) {
          issues.push('Expired but still active')
        }
      }
    }
    
    if (issues.length > 0) {
      invalidUsers.push({
        id: doc.id,
        email: data.email || 'N/A',
        fullName: data.fullName || 'N/A',
        issues: issues
      })
    }
  })
  
  return invalidUsers
}

async function fixUserData(userId, fixes) {
  const updates = {}
  
  if (fixes.includes('subscription')) {
    // Create default subscription object
    updates.subscription = {
      plan: 'free',
      billingPeriod: 'monthly',
      quotaLimit: 50,
      quotaUsed: 0,
      quotaResetDate: new Date(),
      isActive: true,
      subscriptionStart: new Date(),
      subscriptionEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 days
    }
  }
  
  if (fixes.includes('quota')) {
    updates['subscription.quotaUsed'] = 0
    updates['subscription.quotaLimit'] = 50
  }
  
  if (fixes.includes('expiredActive')) {
    updates['subscription.isActive'] = false
    updates['subscription.plan'] = 'free'
    updates['subscription.quotaLimit'] = 50
  }
  
  await db.collection('users').doc(userId).update(updates)
}

async function deleteUsers(userIds) {
  let batch = db.batch()
  let batchCount = 0
  
  for (const userId of userIds) {
    // Also delete related usage records
    const usageSnapshot = await db.collection('usage')
      .where('userId', '==', userId)
      .get()
    
    for (const doc of usageSnapshot.docs) {
      batch.delete(doc.ref)
      batchCount++
      
      if (batchCount === 500) {
        await batch.commit()
        batch = db.batch()
        batchCount = 0
      }
    }
    
    // Delete user document
    batch.delete(db.collection('users').doc(userId))
    batchCount++
    
    if (batchCount === 500) {
      await batch.commit()
      batch = db.batch()
      batchCount = 0
    }
  }
  
  if (batchCount > 0) {
    await batch.commit()
  }
}

async function main() {
  console.log(chalk.blue('\n🧹 Firebase Users Cleanup Tool\n'))
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Find and remove inactive users', value: 'inactive' },
        { name: 'Find and remove test/demo users', value: 'test' },
        { name: 'Fix users with invalid data', value: 'fix' },
        { name: 'Comprehensive cleanup (all of the above)', value: 'comprehensive' },
        { name: 'Exit', value: 'exit' }
      ]
    }
  ])
  
  if (action === 'exit') {
    process.exit(0)
  }
  
  console.log()
  
  try {
    if (action === 'inactive' || action === 'comprehensive') {
      const spinner = ora('Finding inactive users...').start()
      const inactiveUsers = await getInactiveUsers(INACTIVE_DAYS)
      spinner.stop()
      
      if (inactiveUsers.length > 0) {
        console.log(chalk.yellow(`\nFound ${inactiveUsers.length} inactive users (no login in ${INACTIVE_DAYS} days):\n`))
        
        const table = new Table({
          head: ['Email', 'Name', 'Last Login', 'Plan', 'Quota Used'],
          colWidths: [30, 25, 15, 10, 12]
        })
        
        inactiveUsers.slice(0, 10).forEach(user => {
          table.push([user.email, user.fullName, user.lastLogin, user.plan, user.quotaUsed])
        })
        
        console.log(table.toString())
        if (inactiveUsers.length > 10) {
          console.log(chalk.gray(`... and ${inactiveUsers.length - 10} more\n`))
        }
        
        const { confirmDelete } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmDelete',
            message: `Delete all ${inactiveUsers.length} inactive users?`,
            default: false
          }
        ])
        
        if (confirmDelete) {
          const deleteSpinner = ora('Deleting inactive users...').start()
          await deleteUsers(inactiveUsers.map(u => u.id))
          deleteSpinner.succeed(`Deleted ${inactiveUsers.length} inactive users`)
        }
      } else {
        console.log(chalk.green('✓ No inactive users found'))
      }
    }
    
    if (action === 'test' || action === 'comprehensive') {
      const spinner = ora('Finding test/demo users...').start()
      const testUsers = await getTestUsers()
      spinner.stop()
      
      if (testUsers.length > 0) {
        console.log(chalk.yellow(`\nFound ${testUsers.length} test/demo users:\n`))
        
        const table = new Table({
          head: ['Email', 'Name', 'Created', 'Plan'],
          colWidths: [30, 25, 15, 10]
        })
        
        testUsers.forEach(user => {
          table.push([user.email, user.fullName, user.createdAt, user.plan])
        })
        
        console.log(table.toString())
        
        const { confirmDelete } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmDelete',
            message: `Delete all ${testUsers.length} test users?`,
            default: false
          }
        ])
        
        if (confirmDelete) {
          const deleteSpinner = ora('Deleting test users...').start()
          await deleteUsers(testUsers.map(u => u.id))
          deleteSpinner.succeed(`Deleted ${testUsers.length} test users`)
        }
      } else {
        console.log(chalk.green('✓ No test users found'))
      }
    }
    
    if (action === 'fix' || action === 'comprehensive') {
      const spinner = ora('Finding users with invalid data...').start()
      const invalidUsers = await getUsersWithInvalidData()
      spinner.stop()
      
      if (invalidUsers.length > 0) {
        console.log(chalk.yellow(`\nFound ${invalidUsers.length} users with invalid data:\n`))
        
        for (const user of invalidUsers.slice(0, 5)) {
          console.log(chalk.cyan(`${user.email}:`))
          user.issues.forEach(issue => console.log(`  • ${issue}`))
          console.log()
        }
        
        if (invalidUsers.length > 5) {
          console.log(chalk.gray(`... and ${invalidUsers.length - 5} more\n`))
        }
        
        const { confirmFix } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmFix',
            message: `Fix data for all ${invalidUsers.length} users?`,
            default: true
          }
        ])
        
        if (confirmFix) {
          const fixSpinner = ora('Fixing user data...').start()
          let fixed = 0
          
          for (const user of invalidUsers) {
            const fixes = []
            
            if (user.issues.some(i => i.includes('Missing subscription'))) {
              fixes.push('subscription')
            }
            if (user.issues.some(i => i.includes('quota'))) {
              fixes.push('quota')
            }
            if (user.issues.some(i => i.includes('Expired but still active'))) {
              fixes.push('expiredActive')
            }
            
            if (fixes.length > 0) {
              await fixUserData(user.id, fixes)
              fixed++
            }
          }
          
          fixSpinner.succeed(`Fixed data for ${fixed} users`)
        }
      } else {
        console.log(chalk.green('✓ All users have valid data'))
      }
    }
    
    console.log(chalk.green('\n✅ Cleanup completed!\n'))
    
  } catch (error) {
    console.error(chalk.red('Cleanup failed:'), error)
    process.exit(1)
  }
}

main().catch(console.error)