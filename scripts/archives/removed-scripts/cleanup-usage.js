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
const ARCHIVE_DAYS = 365 // Archive records older than 1 year
const BATCH_SIZE = 500 // Firestore batch limit

async function getUsageStats() {
  const snapshot = await db.collection('usage').get()
  const stats = {
    total: 0,
    byAction: {},
    byUser: {},
    oldRecords: 0,
    orphanedRecords: 0
  }
  
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - ARCHIVE_DAYS)
  
  // Get all user IDs for orphan check
  const usersSnapshot = await db.collection('users').get()
  const validUserIds = new Set()
  usersSnapshot.forEach(doc => validUserIds.add(doc.id))
  
  snapshot.forEach(doc => {
    const data = doc.data()
    stats.total++
    
    // Count by action
    stats.byAction[data.action] = (stats.byAction[data.action] || 0) + 1
    
    // Count by user
    stats.byUser[data.userId] = (stats.byUser[data.userId] || 0) + 1
    
    // Check if old
    const timestamp = data.timestamp?.toDate()
    if (timestamp && timestamp < cutoffDate) {
      stats.oldRecords++
    }
    
    // Check if orphaned
    if (!validUserIds.has(data.userId)) {
      stats.orphanedRecords++
    }
  })
  
  return stats
}

async function getOldRecords(days) {
  const cutoffDate = new Date()
  cutoffDate.setDate(cutoffDate.getDate() - days)
  
  const snapshot = await db.collection('usage')
    .where('timestamp', '<', cutoffDate)
    .orderBy('timestamp', 'asc')
    .get()
  
  const records = []
  snapshot.forEach(doc => {
    const data = doc.data()
    records.push({
      id: doc.id,
      userId: data.userId,
      action: data.action,
      timestamp: data.timestamp?.toDate()?.toISOString().split('T')[0] || 'Unknown',
      quotaConsumed: data.quotaConsumed
    })
  })
  
  return records
}

async function getOrphanedRecords() {
  // Get all valid user IDs
  const usersSnapshot = await db.collection('users').get()
  const validUserIds = new Set()
  usersSnapshot.forEach(doc => validUserIds.add(doc.id))
  
  // Find usage records with invalid user IDs
  const usageSnapshot = await db.collection('usage').get()
  const orphaned = []
  
  usageSnapshot.forEach(doc => {
    const data = doc.data()
    if (!validUserIds.has(data.userId)) {
      orphaned.push({
        id: doc.id,
        userId: data.userId,
        action: data.action,
        timestamp: data.timestamp?.toDate()?.toISOString().split('T')[0] || 'Unknown',
        quotaConsumed: data.quotaConsumed
      })
    }
  })
  
  return orphaned
}

async function archiveRecords(records, archivePath) {
  // Save records to archive file
  const archiveData = records.map(r => ({
    id: r.id,
    userId: r.userId,
    action: r.action,
    timestamp: r.timestamp,
    quotaConsumed: r.quotaConsumed
  }))
  
  await fs.mkdir(path.dirname(archivePath), { recursive: true })
  await fs.writeFile(archivePath, JSON.stringify(archiveData, null, 2))
  
  // Delete from Firestore
  const batch = db.batch()
  let batchCount = 0
  let totalDeleted = 0
  
  for (const record of records) {
    batch.delete(db.collection('usage').doc(record.id))
    batchCount++
    
    if (batchCount === BATCH_SIZE) {
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

async function aggregateUserStats(records) {
  const userStats = {}
  
  records.forEach(record => {
    if (!userStats[record.userId]) {
      userStats[record.userId] = {
        totalQuota: 0,
        actionCounts: {},
        firstActivity: record.timestamp,
        lastActivity: record.timestamp
      }
    }
    
    const stats = userStats[record.userId]
    stats.totalQuota += record.quotaConsumed || 0
    stats.actionCounts[record.action] = (stats.actionCounts[record.action] || 0) + 1
    
    if (record.timestamp < stats.firstActivity) {
      stats.firstActivity = record.timestamp
    }
    if (record.timestamp > stats.lastActivity) {
      stats.lastActivity = record.timestamp
    }
  })
  
  return userStats
}

async function main() {
  console.log(chalk.blue('\n🧹 Firebase Usage Records Cleanup Tool\n'))
  
  const spinner = ora('Analyzing usage records...').start()
  const stats = await getUsageStats()
  spinner.stop()
  
  // Display statistics
  console.log(chalk.cyan('Usage Statistics:'))
  console.log(`  • Total records: ${stats.total.toLocaleString()}`)
  console.log(`  • Old records (>${ARCHIVE_DAYS} days): ${stats.oldRecords.toLocaleString()}`)
  console.log(`  • Orphaned records: ${stats.orphanedRecords.toLocaleString()}`)
  console.log()
  
  console.log(chalk.cyan('Records by action:'))
  Object.entries(stats.byAction)
    .sort(([,a], [,b]) => b - a)
    .slice(0, 5)
    .forEach(([action, count]) => {
      console.log(`  • ${action}: ${count.toLocaleString()}`)
    })
  console.log()
  
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Archive old usage records', value: 'archive' },
        { name: 'Remove orphaned records', value: 'orphaned' },
        { name: 'View detailed statistics', value: 'stats' },
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
      const oldSpinner = ora('Finding old records...').start()
      const oldRecords = await getOldRecords(ARCHIVE_DAYS)
      oldSpinner.stop()
      
      if (oldRecords.length > 0) {
        console.log(chalk.yellow(`\nFound ${oldRecords.length.toLocaleString()} records older than ${ARCHIVE_DAYS} days\n`))
        
        // Show sample
        const table = new Table({
          head: ['User ID', 'Action', 'Date', 'Quota'],
          colWidths: [30, 20, 15, 10]
        })
        
        oldRecords.slice(0, 5).forEach(record => {
          table.push([
            record.userId.substring(0, 28) + '...',
            record.action,
            record.timestamp,
            record.quotaConsumed
          ])
        })
        
        console.log(table.toString())
        if (oldRecords.length > 5) {
          console.log(chalk.gray(`... and ${(oldRecords.length - 5).toLocaleString()} more\n`))
        }
        
        // Aggregate stats before deletion
        const userStats = await aggregateUserStats(oldRecords)
        
        const { confirmArchive } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmArchive',
            message: `Archive and delete ${oldRecords.length.toLocaleString()} old records?`,
            default: false
          }
        ])
        
        if (confirmArchive) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
          const archivePath = path.join(process.cwd(), 'archives', `usage-archive-${timestamp}.json`)
          
          const archiveSpinner = ora('Archiving and deleting old records...').start()
          
          // Save aggregated stats
          await fs.writeFile(
            path.join(path.dirname(archivePath), `usage-stats-${timestamp}.json`),
            JSON.stringify(userStats, null, 2)
          )
          
          const deleted = await archiveRecords(oldRecords, archivePath)
          archiveSpinner.succeed(`Archived and deleted ${deleted.toLocaleString()} records`)
          console.log(chalk.gray(`Archive saved to: ${archivePath}`))
        }
      } else {
        console.log(chalk.green('✓ No old records found'))
      }
    }
    
    if (action === 'orphaned' || action === 'comprehensive') {
      const orphanSpinner = ora('Finding orphaned records...').start()
      const orphanedRecords = await getOrphanedRecords()
      orphanSpinner.stop()
      
      if (orphanedRecords.length > 0) {
        console.log(chalk.yellow(`\nFound ${orphanedRecords.length} orphaned records (user no longer exists)\n`))
        
        const table = new Table({
          head: ['User ID', 'Action', 'Date', 'Quota'],
          colWidths: [30, 20, 15, 10]
        })
        
        orphanedRecords.slice(0, 5).forEach(record => {
          table.push([
            record.userId.substring(0, 28) + '...',
            record.action,
            record.timestamp,
            record.quotaConsumed
          ])
        })
        
        console.log(table.toString())
        if (orphanedRecords.length > 5) {
          console.log(chalk.gray(`... and ${orphanedRecords.length - 5} more\n`))
        }
        
        const { confirmDelete } = await inquirer.prompt([
          {
            type: 'confirm',
            name: 'confirmDelete',
            message: `Delete all ${orphanedRecords.length} orphaned records?`,
            default: false
          }
        ])
        
        if (confirmDelete) {
          const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
          const archivePath = path.join(process.cwd(), 'archives', `orphaned-usage-${timestamp}.json`)
          
          const deleteSpinner = ora('Deleting orphaned records...').start()
          const deleted = await archiveRecords(orphanedRecords, archivePath)
          deleteSpinner.succeed(`Deleted ${deleted} orphaned records`)
        }
      } else {
        console.log(chalk.green('✓ No orphaned records found'))
      }
    }
    
    if (action === 'stats') {
      console.log(chalk.cyan('\nDetailed Usage Statistics:\n'))
      
      // Top users by record count
      const topUsers = Object.entries(stats.byUser)
        .sort(([,a], [,b]) => b - a)
        .slice(0, 10)
      
      console.log(chalk.yellow('Top 10 users by activity:'))
      const userTable = new Table({
        head: ['User ID', 'Record Count'],
        colWidths: [40, 15]
      })
      
      for (const [userId, count] of topUsers) {
        userTable.push([userId, count.toLocaleString()])
      }
      console.log(userTable.toString())
      
      // Calculate size estimates
      const avgRecordSize = 200 // bytes (estimated)
      const totalSize = stats.total * avgRecordSize
      const oldSize = stats.oldRecords * avgRecordSize
      
      console.log(chalk.cyan('\nStorage estimates:'))
      console.log(`  • Total size: ~${(totalSize / 1024 / 1024).toFixed(2)} MB`)
      console.log(`  • Old records size: ~${(oldSize / 1024 / 1024).toFixed(2)} MB`)
      console.log(`  • Potential savings: ~${(oldSize / 1024 / 1024).toFixed(2)} MB`)
    }
    
    console.log(chalk.green('\n✅ Cleanup completed!\n'))
    
  } catch (error) {
    console.error(chalk.red('Cleanup failed:'), error)
    process.exit(1)
  }
}

main().catch(console.error)