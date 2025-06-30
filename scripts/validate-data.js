#!/usr/bin/env node

import 'dotenv/config'
import { db } from './firebase-admin-init.js'
import { createRequire } from 'module'
import chalk from 'chalk'
import ora from 'ora'
const require = createRequire(import.meta.url)
const inquirer = require('inquirer').default
const Table = require('cli-table3')

async function validateUsers() {
  const issues = []
  const snapshot = await db.collection('users').get()
  
  snapshot.forEach(doc => {
    const data = doc.data()
    const userIssues = []
    
    // Required fields
    if (!data.uid) userIssues.push('Missing uid')
    if (!data.email) userIssues.push('Missing email')
    if (!data.fullName) userIssues.push('Missing fullName')
    if (!data.createdAt) userIssues.push('Missing createdAt')
    if (!data.lastLogin) userIssues.push('Missing lastLogin')
    if (!data.subscription) userIssues.push('Missing subscription object')
    
    // Validate subscription structure
    if (data.subscription) {
      const sub = data.subscription
      
      // Required subscription fields
      if (!sub.plan) userIssues.push('Missing subscription.plan')
      if (!sub.billingPeriod) userIssues.push('Missing subscription.billingPeriod')
      if (sub.quotaLimit === undefined) userIssues.push('Missing subscription.quotaLimit')
      if (sub.quotaUsed === undefined) userIssues.push('Missing subscription.quotaUsed')
      if (sub.isActive === undefined) userIssues.push('Missing subscription.isActive')
      
      // Valid values
      if (sub.plan && !['free', 'unlimited'].includes(sub.plan)) {
        userIssues.push(`Invalid plan: ${sub.plan}`)
      }
      
      if (sub.billingPeriod && !['trial', 'monthly', '6months', '12months'].includes(sub.billingPeriod)) {
        userIssues.push(`Invalid billingPeriod: ${sub.billingPeriod}`)
      }
      
      // Logical validations
      if (sub.quotaUsed < 0) userIssues.push('Negative quotaUsed')
      if (sub.quotaLimit < 0) userIssues.push('Negative quotaLimit')
      if (sub.quotaUsed > sub.quotaLimit && sub.plan === 'free') {
        userIssues.push('quotaUsed exceeds quotaLimit')
      }
      
      // Date validations
      if (sub.plan === 'unlimited' && sub.isActive) {
        const endDate = sub.subscriptionEnd?.toDate()
        if (endDate && endDate < new Date()) {
          userIssues.push('Subscription expired but still active')
        }
      }
      
      // Grace period check
      if (sub.isInGracePeriod && !sub.gracePeriodEnd) {
        userIssues.push('In grace period but no gracePeriodEnd date')
      }
    }
    
    // UID matches document ID
    if (data.uid && data.uid !== doc.id) {
      userIssues.push('uid does not match document ID')
    }
    
    if (userIssues.length > 0) {
      issues.push({
        docId: doc.id,
        email: data.email || 'N/A',
        issues: userIssues
      })
    }
  })
  
  return { collection: 'users', total: snapshot.size, issues }
}

async function validateUsage() {
  const issues = []
  const snapshot = await db.collection('usage').get()
  
  // Get valid user IDs
  const usersSnapshot = await db.collection('users').get()
  const validUserIds = new Set()
  usersSnapshot.forEach(doc => validUserIds.add(doc.id))
  
  snapshot.forEach(doc => {
    const data = doc.data()
    const usageIssues = []
    
    // Required fields
    if (!data.userId) usageIssues.push('Missing userId')
    if (!data.action) usageIssues.push('Missing action')
    if (!data.timestamp) usageIssues.push('Missing timestamp')
    if (data.quotaConsumed === undefined) usageIssues.push('Missing quotaConsumed')
    
    // Valid values
    if (data.action && !['quote_generated', 'pdf_downloaded', 'report_viewed'].includes(data.action)) {
      usageIssues.push(`Invalid action: ${data.action}`)
    }
    
    if (data.quotaConsumed < 0) usageIssues.push('Negative quotaConsumed')
    
    // User exists
    if (data.userId && !validUserIds.has(data.userId)) {
      usageIssues.push('User does not exist')
    }
    
    if (usageIssues.length > 0) {
      issues.push({
        docId: doc.id,
        userId: data.userId || 'N/A',
        action: data.action || 'N/A',
        issues: usageIssues
      })
    }
  })
  
  return { collection: 'usage', total: snapshot.size, issues }
}

async function validateUpgradeRequests() {
  const issues = []
  const snapshot = await db.collection('upgradeRequests').get()
  
  // Get valid user IDs
  const usersSnapshot = await db.collection('users').get()
  const validUserIds = new Set()
  usersSnapshot.forEach(doc => validUserIds.add(doc.id))
  
  snapshot.forEach(doc => {
    const data = doc.data()
    const requestIssues = []
    
    // Required fields
    if (!data.userId) requestIssues.push('Missing userId')
    if (!data.userEmail) requestIssues.push('Missing userEmail')
    if (!data.userName) requestIssues.push('Missing userName')
    if (!data.plan) requestIssues.push('Missing plan')
    if (!data.billingPeriod) requestIssues.push('Missing billingPeriod')
    if (data.amount === undefined) requestIssues.push('Missing amount')
    if (!data.paymentMethod) requestIssues.push('Missing paymentMethod')
    if (!data.status) requestIssues.push('Missing status')
    if (!data.createdAt) requestIssues.push('Missing createdAt')
    
    // Valid values
    if (data.plan && data.plan !== 'unlimited') {
      requestIssues.push(`Invalid plan: ${data.plan}`)
    }
    
    if (data.billingPeriod && !['monthly', '6months', '12months'].includes(data.billingPeriod)) {
      requestIssues.push(`Invalid billingPeriod: ${data.billingPeriod}`)
    }
    
    if (data.paymentMethod && !['wave_money', 'kbz_pay', 'bank_transfer', 'card'].includes(data.paymentMethod)) {
      requestIssues.push(`Invalid paymentMethod: ${data.paymentMethod}`)
    }
    
    if (data.status && !['pending', 'completed', 'rejected'].includes(data.status)) {
      requestIssues.push(`Invalid status: ${data.status}`)
    }
    
    if (data.amount <= 0) requestIssues.push('Invalid amount (must be positive)')
    
    // User exists
    if (data.userId && !validUserIds.has(data.userId)) {
      requestIssues.push('User does not exist')
    }
    
    // Status-specific validations
    if (data.status === 'completed' && !data.paymentReference) {
      requestIssues.push('Completed but no paymentReference')
    }
    
    if (data.status === 'rejected' && !data.rejectionReason) {
      requestIssues.push('Rejected but no rejectionReason')
    }
    
    if (requestIssues.length > 0) {
      issues.push({
        docId: doc.id,
        userEmail: data.userEmail || 'N/A',
        status: data.status || 'N/A',
        issues: requestIssues
      })
    }
  })
  
  return { collection: 'upgradeRequests', total: snapshot.size, issues }
}

async function crossValidate() {
  const issues = []
  
  // Check users with active unlimited subscriptions have corresponding completed upgrade requests
  const usersSnapshot = await db.collection('users').get()
  const upgradeSnapshot = await db.collection('upgradeRequests')
    .where('status', '==', 'completed')
    .get()
  
  const completedUpgrades = new Map()
  upgradeSnapshot.forEach(doc => {
    const data = doc.data()
    if (!completedUpgrades.has(data.userId)) {
      completedUpgrades.set(data.userId, [])
    }
    completedUpgrades.get(data.userId).push(data)
  })
  
  usersSnapshot.forEach(doc => {
    const data = doc.data()
    
    if (data.subscription?.plan === 'unlimited' && data.subscription?.isActive) {
      if (!completedUpgrades.has(doc.id)) {
        issues.push({
          type: 'subscription_without_payment',
          userId: doc.id,
          userEmail: data.email,
          message: 'Active unlimited subscription but no completed upgrade request found'
        })
      }
    }
  })
  
  // Check for users with multiple active subscriptions (shouldn't happen)
  const activeSubscriptions = new Map()
  usersSnapshot.forEach(doc => {
    const data = doc.data()
    if (data.subscription?.isActive && data.subscription?.plan === 'unlimited') {
      const key = data.email
      if (activeSubscriptions.has(key)) {
        issues.push({
          type: 'duplicate_active_subscription',
          userId: doc.id,
          userEmail: data.email,
          message: 'User has multiple active unlimited subscriptions'
        })
      } else {
        activeSubscriptions.set(key, doc.id)
      }
    }
  })
  
  return issues
}

async function main() {
  console.log(chalk.blue('\n🔍 Firebase Data Validation Tool\n'))
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to validate?',
      choices: [
        { name: 'Validate all collections', value: 'all' },
        { name: 'Validate users collection', value: 'users' },
        { name: 'Validate usage collection', value: 'usage' },
        { name: 'Validate upgradeRequests collection', value: 'upgrades' },
        { name: 'Cross-collection validation', value: 'cross' },
        { name: 'Exit', value: 'exit' }
      ]
    }
  ])
  
  if (action === 'exit') {
    process.exit(0)
  }
  
  console.log()
  
  try {
    const results = []
    
    if (action === 'all' || action === 'users') {
      const spinner = ora('Validating users collection...').start()
      const result = await validateUsers()
      results.push(result)
      spinner.succeed(`Validated ${result.total} users`)
    }
    
    if (action === 'all' || action === 'usage') {
      const spinner = ora('Validating usage collection...').start()
      const result = await validateUsage()
      results.push(result)
      spinner.succeed(`Validated ${result.total} usage records`)
    }
    
    if (action === 'all' || action === 'upgrades') {
      const spinner = ora('Validating upgradeRequests collection...').start()
      const result = await validateUpgradeRequests()
      results.push(result)
      spinner.succeed(`Validated ${result.total} upgrade requests`)
    }
    
    // Display results
    console.log()
    let totalIssues = 0
    
    for (const result of results) {
      if (result.issues.length > 0) {
        console.log(chalk.yellow(`\n${result.collection} collection issues (${result.issues.length}):\n`))
        
        // Group issues by type
        const issueTypes = {}
        result.issues.forEach(item => {
          item.issues.forEach(issue => {
            issueTypes[issue] = (issueTypes[issue] || 0) + 1
          })
        })
        
        // Display summary
        Object.entries(issueTypes)
          .sort(([,a], [,b]) => b - a)
          .forEach(([issue, count]) => {
            console.log(`  • ${issue}: ${count} documents`)
          })
        
        // Show sample issues
        console.log(chalk.cyan('\nSample issues:'))
        result.issues.slice(0, 3).forEach(item => {
          console.log(`  Document: ${item.docId}`)
          console.log(`  Email/ID: ${item.email || item.userId || item.userEmail}`)
          console.log(`  Issues: ${item.issues.join(', ')}`)
          console.log()
        })
        
        totalIssues += result.issues.length
      } else {
        console.log(chalk.green(`\n✓ ${result.collection} collection has no issues`))
      }
    }
    
    if (action === 'all' || action === 'cross') {
      const spinner = ora('Running cross-collection validation...').start()
      const crossIssues = await crossValidate()
      spinner.stop()
      
      if (crossIssues.length > 0) {
        console.log(chalk.yellow(`\nCross-collection issues (${crossIssues.length}):\n`))
        
        crossIssues.forEach(issue => {
          console.log(`  • ${issue.type}:`)
          console.log(`    User: ${issue.userEmail}`)
          console.log(`    ${issue.message}`)
          console.log()
        })
        
        totalIssues += crossIssues.length
      } else {
        console.log(chalk.green('\n✓ No cross-collection issues found'))
      }
    }
    
    // Summary
    if (totalIssues > 0) {
      console.log(chalk.yellow(`\n⚠️  Total issues found: ${totalIssues}`))
      console.log(chalk.gray('Run cleanup scripts to fix these issues'))
    } else {
      console.log(chalk.green('\n✅ All validations passed!'))
    }
    
  } catch (error) {
    console.error(chalk.red('Validation failed:'), error)
    process.exit(1)
  }
}

main().catch(console.error)