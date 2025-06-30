#!/usr/bin/env node

import 'dotenv/config'
import { db } from './firebase-admin-init.js'
import { promises as fs } from 'fs'
import path from 'path'
import { createRequire } from 'module'
import chalk from 'chalk'
import ora from 'ora'
const require = createRequire(import.meta.url)
const inquirer = require('inquirer').default
const Table = require('cli-table3')

// Cleanup criteria
const ARCHIVE_MONTHS = 6 // Archive completed/rejected requests older than 6 months

async function getUpgradeStats() {
  const snapshot = await db.collection('upgradeRequests').get()
  const stats = {
    total: 0,
    byStatus: {
      pending: 0,
      completed: 0,
      rejected: 0
    },
    byPlan: {},
    byPaymentMethod: {},
    oldCompleted: 0,
    oldRejected: 0,
    orphaned: 0
  }
  
  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - ARCHIVE_MONTHS)
  
  // Get valid user IDs
  const usersSnapshot = await db.collection('users').get()
  const validUserIds = new Set()
  usersSnapshot.forEach(doc => validUserIds.add(doc.id))
  
  snapshot.forEach(doc => {
    const data = doc.data()
    stats.total++
    
    // Count by status
    stats.byStatus[data.status] = (stats.byStatus[data.status] || 0) + 1
    
    // Count by plan
    stats.byPlan[data.plan] = (stats.byPlan[data.plan] || 0) + 1
    
    // Count by payment method
    stats.byPaymentMethod[data.paymentMethod] = (stats.byPaymentMethod[data.paymentMethod] || 0) + 1
    
    // Check if old and completed/rejected
    const createdAt = data.createdAt?.toDate()
    if (createdAt && createdAt < cutoffDate) {
      if (data.status === 'completed') stats.oldCompleted++
      if (data.status === 'rejected') stats.oldRejected++
    }
    
    // Check if orphaned
    if (!validUserIds.has(data.userId)) {
      stats.orphaned++
    }
  })
  
  return stats
}

async function getOldRequests(months) {
  const cutoffDate = new Date()
  cutoffDate.setMonth(cutoffDate.getMonth() - months)
  
  const snapshot = await db.collection('upgradeRequests')
    .where('status', 'in', ['completed', 'rejected'])
    .get()
  
  const oldRequests = []
  
  snapshot.forEach(doc => {
    const data = doc.data()
    const createdAt = data.createdAt?.toDate()
    
    if (createdAt && createdAt < cutoffDate) {
      oldRequests.push({
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        status: data.status,
        plan: data.plan,
        amount: data.amount,
        paymentMethod: data.paymentMethod,
        createdAt: createdAt.toISOString().split('T')[0],
        processedAt: data.processedAt?.toDate()?.toISOString().split('T')[0] || 'N/A'
      })
    }
  })
  
  return oldRequests
}

async function getOrphanedRequests() {
  // Get all valid user IDs
  const usersSnapshot = await db.collection('users').get()
  const validUserIds = new Set()
  usersSnapshot.forEach(doc => validUserIds.add(doc.id))
  
  // Find requests with invalid user IDs
  const requestsSnapshot = await db.collection('upgradeRequests').get()
  const orphaned = []
  
  requestsSnapshot.forEach(doc => {
    const data = doc.data()
    if (!validUserIds.has(data.userId)) {
      orphaned.push({
        id: doc.id,
        userId: data.userId,
        userEmail: data.userEmail,
        userName: data.userName,
        status: data.status,
        plan: data.plan,
        amount: data.amount,
        createdAt: data.createdAt?.toDate()?.toISOString().split('T')[0] || 'Unknown'
      })
    }
  })
  
  return orphaned
}

async function archiveRequests(requests, archivePath) {
  // Save to archive
  await fs.mkdir(path.dirname(archivePath), { recursive: true })
  await fs.writeFile(archivePath, JSON.stringify(requests, null, 2))
  
  // Delete from Firestore
  const batch = db.batch()
  let batchCount = 0
  let totalDeleted = 0
  
  for (const request of requests) {
    batch.delete(db.collection('upgradeRequests').doc(request.id))
    batchCount++
    
    if (batchCount === 500) {
      await batch.commit()
      totalDeleted += batchCount
      batch = db.batch()
      batchCount = 0
    }
  }
  
  if (batchCount > 0) {
    await batch.commit()
    totalDeleted += batchCount
  }
  
  return totalDeleted
}

async function calculateRevenue(requests) {
  const revenue = {
    total: 0,
    byMonth: {},
    byPaymentMethod: {},
    byBillingPeriod: {}
  }
  
  requests.forEach(request => {
    if (request.status === 'completed') {
      revenue.total += request.amount
      
      // By month
      const month = request.createdAt.substring(0, 7) // YYYY-MM
      revenue.byMonth[month] = (revenue.byMonth[month] || 0) + request.amount
      
      // By payment method
      revenue.byPaymentMethod[request.paymentMethod] = 
        (revenue.byPaymentMethod[request.paymentMethod] || 0) + request.amount
    }
  })
  
  return revenue
}

async function main() {
  console.log(chalk.blue('\n🧹 Firebase Upgrade Requests Cleanup Tool\n'))
  
  const spinner = ora('Analyzing upgrade requests...').start()
  const stats = await getUpgradeStats()
  spinner.stop()
  
  // Display statistics
  console.log(chalk.cyan('Upgrade Request Statistics:'))
  console.log(`  • Total requests: ${stats.total}`)
  console.log(`  • Pending: ${stats.byStatus.pending}`)
  console.log(`  • Completed: ${stats.byStatus.completed}`)
  console.log(`  • Rejected: ${stats.byStatus.rejected}`)
  console.log(`  • Old completed (>${ARCHIVE_MONTHS} months): ${stats.oldCompleted}`)
  console.log(`  • Old rejected (>${ARCHIVE_MONTHS} months): ${stats.oldRejected}`)
  console.log(`  • Orphaned requests: ${stats.orphaned}`)
  console.log()
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Archive old completed/rejected requests', value: 'archive' },
        { name: 'Remove orphaned requests', value: 'orphaned' },
        { name: 'View revenue report', value: 'revenue' },
        { name: 'Comprehensive cleanup', value: 'comprehensive' },
        { name: 'Exit', value: 'exit' }
      ]
    }
  ])
  
  if (action === 'exit') {
    process.exit(0)
  }
  
  console.log()
  
  try {
    if (action === 'archive' || action === 'comprehensive') {
      const oldSpinner = ora('Finding old requests...').start()
      const oldRequests = await getOldRequests(ARCHIVE_MONTHS)
      oldSpinner.stop()
      
      if (oldRequests.length > 0) {
        console.log(chalk.yellow(`\nFound ${oldRequests.length} old requests (>${ARCHIVE_MONTHS} months):\n`))
        
        // Group by status
        const completed = oldRequests.filter(r => r.status === 'completed')
        const rejected = oldRequests.filter(r => r.status === 'rejected')
        
        const table = new Table({
          head: ['Email', 'Status', 'Plan', 'Amount', 'Created', 'Processed'],
          colWidths: [25, 12, 10, 10, 12, 12]
        })
        
        oldRequests.slice(0, 10).forEach(request => {
          table.push([
            request.userEmail.substring(0, 23) + '...',
            request.status,
            request.plan,
            `$${request.amount}`,
            request.createdAt,
            request.processedAt
          ])
        })
        
        console.log(table.toString())
        if (oldRequests.length > 10) {
          console.log(chalk.gray(`... and ${oldRequests.length - 10} more\n`))
        }
        
        console.log(`Breakdown: ${completed.length} completed, ${rejected.length} rejected`)
        
        // Calculate revenue before archiving
        const revenue = await calculateRevenue(completed)
        console.log(chalk.cyan(`\nRevenue from requests to be archived: $${revenue.total.toFixed(2)}`))
        
        const { confirmArchive } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmArchive',
            message: `Archive and delete ${oldRequests.length} old requests?`,
            default: false
          }
        ])
        
        if (confirmArchive) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
          const archivePath = path.join(process.cwd(), 'archives', `upgrade-requests-${timestamp}.json`)
          
          const archiveSpinner = ora('Archiving old requests...').start()
          
          // Save revenue report
          await fs.writeFile(
            path.join(path.dirname(archivePath), `revenue-report-${timestamp}.json`),
            JSON.stringify(revenue, null, 2)
          )
          
          const deleted = await archiveRequests(oldRequests, archivePath)
          archiveSpinner.succeed(`Archived and deleted ${deleted} requests`)
          console.log(chalk.gray(`Archive saved to: ${archivePath}`))
        }
      } else {
        console.log(chalk.green('✓ No old requests found'))
      }
    }
    
    if (action === 'orphaned' || action === 'comprehensive') {
      const orphanSpinner = ora('Finding orphaned requests...').start()
      const orphanedRequests = await getOrphanedRequests()
      orphanSpinner.stop()
      
      if (orphanedRequests.length > 0) {
        console.log(chalk.yellow(`\nFound ${orphanedRequests.length} orphaned requests:\n`))
        
        const table = new Table({
          head: ['Email', 'Status', 'Plan', 'Amount', 'Created'],
          colWidths: [30, 12, 10, 10, 12]
        })
        
        orphanedRequests.forEach(request => {
          table.push([
            request.userEmail,
            request.status,
            request.plan,
            `$${request.amount}`,
            request.createdAt
          ])
        })
        
        console.log(table.toString())
        
        const { confirmDelete } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmDelete',
            message: `Delete all ${orphanedRequests.length} orphaned requests?`,
            default: false
          }
        ])
        
        if (confirmDelete) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
          const archivePath = path.join(process.cwd(), 'archives', `orphaned-requests-${timestamp}.json`)
          
          const deleteSpinner = ora('Deleting orphaned requests...').start()
          const deleted = await archiveRequests(orphanedRequests, archivePath)
          deleteSpinner.succeed(`Deleted ${deleted} orphaned requests`)
        }
      } else {
        console.log(chalk.green('✓ No orphaned requests found'))
      }
    }
    
    if (action === 'revenue') {
      const allRequests = []
      const snapshot = await db.collection('upgradeRequests')
        .where('status', '==', 'completed')
        .get()
      
      snapshot.forEach(doc => {
        const data = doc.data()
        allRequests.push({
          ...data,
          createdAt: data.createdAt?.toDate()?.toISOString().split('T')[0] || 'Unknown'
        })
      })
      
      const revenue = await calculateRevenue(allRequests)
      
      console.log(chalk.cyan('\n💰 Revenue Report\n'))
      console.log(chalk.green(`Total Revenue: $${revenue.total.toFixed(2)}`))
      
      console.log(chalk.cyan('\nRevenue by Payment Method:'))
      Object.entries(revenue.byPaymentMethod).forEach(([method, amount]) => {
        console.log(`  • ${method}: $${amount.toFixed(2)}`)
      })
      
      console.log(chalk.cyan('\nRevenue by Month:'))
      const recentMonths = Object.entries(revenue.byMonth)
        .sort(([a], [b]) => b.localeCompare(a))
        .slice(0, 6)
      
      recentMonths.forEach(([month, amount]) => {
        console.log(`  • ${month}: $${amount.toFixed(2)}`)
      })
    }
    
    console.log(chalk.green('\n✅ Cleanup completed!\n'))
    
  } catch (error) {
    console.error(chalk.red('Cleanup failed:'), error)
    process.exit(1)
  }
}

main().catch(console.error)