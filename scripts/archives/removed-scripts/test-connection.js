#!/usr/bin/env node

import chalk from 'chalk';
import { db, auth, formatDate } from './firebase-admin-init.js';

console.log(chalk.blue('Testing Firebase Admin SDK connection...'));
console.log();

async function testConnection() {
  try {
    // Test Firestore connection
    console.log(chalk.cyan('1. Testing Firestore connection...'));
    const testDoc = await db.collection('_test').doc('connection').set({
      timestamp: new Date(),
      test: true
    });
    console.log(chalk.green('✓ Firestore connection successful'));
    
    // Clean up test document
    await db.collection('_test').doc('connection').delete();
    
    // Test Auth connection by listing users (limit 1)
    console.log(chalk.cyan('\n2. Testing Auth connection...'));
    const listUsersResult = await auth.listUsers(1);
    console.log(chalk.green('✓ Auth connection successful'));
    console.log(chalk.gray(`  Found ${listUsersResult.users.length} user(s)`));
    
    // Get collection statistics
    console.log(chalk.cyan('\n3. Checking collections...'));
    
    // Check upgrade requests
    const upgradeRequests = await db.collection('upgradeRequests').limit(1).get();
    console.log(chalk.white(`  - upgradeRequests: ${upgradeRequests.empty ? 'empty' : 'has data'}`));
    
    // Check users
    const users = await db.collection('users').limit(1).get();
    console.log(chalk.white(`  - users: ${users.empty ? 'empty' : 'has data'}`));
    
    // Check payments
    const payments = await db.collection('payments').limit(1).get();
    console.log(chalk.white(`  - payments: ${payments.empty ? 'empty' : 'has data'}`));
    
    console.log(chalk.green('\n✅ All tests passed! Firebase Admin SDK is properly configured.'));
    console.log(chalk.gray(`\nProject ID: ${process.env.FIREBASE_PROJECT_ID}`));
    console.log(chalk.gray(`Admin Email: ${process.env.ADMIN_EMAIL}`));
    
  } catch (error) {
    console.error(chalk.red('\n❌ Connection test failed:'));
    console.error(chalk.red(error.message));
    
    if (error.code === 'permission-denied') {
      console.log(chalk.yellow('\nMake sure your service account has the necessary permissions:'));
      console.log(chalk.gray('  - Cloud Datastore User'));
      console.log(chalk.gray('  - Firebase Authentication Admin'));
    }
    
    process.exit(1);
  }
}

// Run test
testConnection().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});