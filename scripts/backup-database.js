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

async function backupCollection(collectionName, backupDir) {
  const spinner = ora(`Backing up ${collectionName} collection...`).start()
  
  try {
    const snapshot = await db.collection(collectionName).get()
    const docs = []
    
    snapshot.forEach(doc => {
      docs.push({
        id: doc.id,
        data: doc.data(),
        createTime: doc.createTime?.toDate().toISOString(),
        updateTime: doc.updateTime?.toDate().toISOString()
      })
    })
    
    const filePath = path.join(backupDir, `${collectionName}.json`)
    await fs.writeFile(filePath, JSON.stringify(docs, null, 2))
    
    spinner.succeed(`Backed up ${docs.length} documents from ${collectionName}`)
    return { collection: collectionName, count: docs.length, file: filePath }
  } catch (error) {
    spinner.fail(`Failed to backup ${collectionName}: ${error.message}`)
    throw error
  }
}

async function createBackupDirectory() {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5)
  const backupDir = path.join(process.cwd(), 'backups', `backup-${timestamp}`)
  
  await fs.mkdir(backupDir, { recursive: true })
  return backupDir
}

async function main() {
  console.log(chalk.blue('\n🔐 Firebase Database Backup Tool\n'))
  
  // Collections to backup
  const collections = ['users', 'usage', 'quotaPlans', 'upgradeRequests', 'payments']
  
  // Show what will be backed up
  console.log('Collections to backup:')
  collections.forEach(col => console.log(`  • ${col}`))
  console.log()
  
  const { confirm } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'confirm',
      message: 'Do you want to proceed with the backup?',
      default: true
    }
  ])
  
  if (!confirm) {
    console.log(chalk.yellow('Backup cancelled'))
    process.exit(0)
  }
  
  console.log()
  
  try {
    // Create backup directory
    const backupDir = await createBackupDirectory()
    console.log(chalk.green(`✓ Created backup directory: ${backupDir}\n`))
    
    // Backup metadata
    const metadata = {
      timestamp: new Date().toISOString(),
      projectId: process.env.FIREBASE_PROJECT_ID,
      collections: collections,
      backupDir: backupDir
    }
    
    // Backup each collection
    const results = []
    for (const collection of collections) {
      try {
        const result = await backupCollection(collection, backupDir)
        results.push(result)
      } catch (error) {
        console.error(chalk.red(`Error backing up ${collection}:`, error.message))
      }
    }
    
    // Save metadata
    metadata.results = results
    await fs.writeFile(
      path.join(backupDir, 'metadata.json'), 
      JSON.stringify(metadata, null, 2)
    )
    
    // Summary
    console.log(chalk.green('\n✅ Backup completed successfully!\n'))
    console.log('Summary:')
    results.forEach(result => {
      console.log(`  • ${result.collection}: ${result.count} documents`)
    })
    console.log(`\nBackup location: ${chalk.cyan(backupDir)}`)
    
    // Create a restore script
    const restoreScript = `#!/usr/bin/env node

// Restore script for backup created on ${metadata.timestamp}
// Usage: node restore-${metadata.timestamp.split('T')[0]}.js

import { db } from '../firebase-admin-init.js'
import { promises as fs } from 'fs'
import path from 'path'

async function restoreCollection(collectionName, data) {
  console.log(\`Restoring \${data.length} documents to \${collectionName}...\`)
  
  const batch = db.batch()
  let batchCount = 0
  
  for (const doc of data) {
    const ref = db.collection(collectionName).doc(doc.id)
    batch.set(ref, doc.data)
    batchCount++
    
    // Firestore has a limit of 500 operations per batch
    if (batchCount === 500) {
      await batch.commit()
      batch = db.batch()
      batchCount = 0
    }
  }
  
  if (batchCount > 0) {
    await batch.commit()
  }
  
  console.log(\`✓ Restored \${collectionName}\`)
}

async function main() {
  console.log('⚠️  WARNING: This will restore data from backup!')
  console.log('Make sure you know what you\\'re doing.\\n')
  
  const collections = ${JSON.stringify(collections)}
  
  for (const collection of collections) {
    try {
      const filePath = path.join(__dirname, \`\${collection}.json\`)
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'))
      await restoreCollection(collection, data)
    } catch (error) {
      console.error(\`Failed to restore \${collection}:\`, error.message)
    }
  }
  
  console.log('\\n✅ Restore completed!')
}

main().catch(console.error)
`
    
    await fs.writeFile(
      path.join(backupDir, `restore.js`),
      restoreScript
    )
    
    await fs.chmod(path.join(backupDir, `restore.js`), '755')
    
    console.log(chalk.gray(`\nRestore script created: ${path.join(backupDir, 'restore.js')}`))
    
  } catch (error) {
    console.error(chalk.red('Backup failed:'), error)
    process.exit(1)
  }
}

main().catch(console.error)