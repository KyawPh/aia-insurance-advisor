#!/usr/bin/env node

// Restore script for backup created on 2025-06-30T03:12:11.283Z
// Usage: node restore-2025-06-30.js

import { db } from '../firebase-admin-init.js'
import { promises as fs } from 'fs'
import path from 'path'

async function restoreCollection(collectionName, data) {
  console.log(`Restoring ${data.length} documents to ${collectionName}...`)
  
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
  
  console.log(`✓ Restored ${collectionName}`)
}

async function main() {
  console.log('⚠️  WARNING: This will restore data from backup!')
  console.log('Make sure you know what you\'re doing.\n')
  
  const collections = ["users","usage","quotaPlans","upgradeRequests","payments"]
  
  for (const collection of collections) {
    try {
      const filePath = path.join(__dirname, `${collection}.json`)
      const data = JSON.parse(await fs.readFile(filePath, 'utf8'))
      await restoreCollection(collection, data)
    } catch (error) {
      console.error(`Failed to restore ${collection}:`, error.message)
    }
  }
  
  console.log('\n✅ Restore completed!')
}

main().catch(console.error)
