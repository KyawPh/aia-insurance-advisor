import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getAuth } from 'firebase-admin/auth';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import readline from 'readline';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '.env') });

// Validate environment variables
if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Error: GOOGLE_APPLICATION_CREDENTIALS not set in .env file');
  process.exit(1);
}

// Initialize Firebase Admin
const serviceAccount = JSON.parse(
  readFileSync(process.env.GOOGLE_APPLICATION_CREDENTIALS, 'utf8')
);

initializeApp({
  credential: cert(serviceAccount),
  projectId: serviceAccount.project_id
});

const db = getFirestore();
const auth = getAuth();

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function askQuestion(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

async function findUserByEmail(email) {
  const usersSnapshot = await db.collection('users')
    .where('email', '==', email)
    .limit(1)
    .get();
  
  if (usersSnapshot.empty) {
    return null;
  }
  
  return {
    id: usersSnapshot.docs[0].id,
    data: usersSnapshot.docs[0].data()
  };
}

async function previewUserData(userId) {
  log('\n=== User Data Preview ===', 'blue');
  
  try {
    // Get user document
    const userDoc = await db.collection('users').doc(userId).get();
    if (userDoc.exists) {
      const userData = userDoc.data();
      log('\n📋 User Profile:', 'yellow');
      log(`   Email: ${userData.email}`, 'reset');
      log(`   Name: ${userData.fullName || 'N/A'}`, 'reset');
      log(`   Plan: ${userData.subscription?.plan || 'N/A'}`, 'reset');
      log(`   Quota Used: ${userData.subscription?.quotaUsed || 0}`, 'reset');
      log(`   Created: ${userData.createdAt?.toDate ? userData.createdAt.toDate().toISOString() : 'N/A'}`, 'reset');
    }
    
    // Count usage records
    const usageSnapshot = await db.collection('usage')
      .where('userId', '==', userId)
      .get();
    log(`\n📊 Usage Records: ${usageSnapshot.size}`, 'yellow');
    
    // Count upgrade requests
    const upgradeSnapshot = await db.collection('upgradeRequests')
      .where('userId', '==', userId)
      .get();
    log(`📈 Upgrade Requests: ${upgradeSnapshot.size}`, 'yellow');
    
    // Check if user exists in Auth
    try {
      await auth.getUser(userId);
      log(`🔐 Firebase Auth Account: Yes`, 'yellow');
    } catch (error) {
      log(`🔐 Firebase Auth Account: No`, 'yellow');
    }
    
    return {
      userDoc: userDoc.exists,
      usageCount: usageSnapshot.size,
      upgradeCount: upgradeSnapshot.size
    };
    
  } catch (error) {
    log(`Error previewing data: ${error.message}`, 'red');
    return null;
  }
}

async function deleteAllUserData(userId, dryRun = false) {
  log(`\n=== ${dryRun ? 'DRY RUN - ' : ''}Deleting User Data ===`, 'magenta');
  
  const results = {
    deleted: [],
    failed: [],
    dryRun
  };
  
  try {
    // 1. Delete user document
    if (!dryRun) {
      await db.collection('users').doc(userId).delete();
    }
    log(`${dryRun ? '[DRY RUN] Would delete' : '✅ Deleted'} user document`, dryRun ? 'yellow' : 'green');
    results.deleted.push('User document');
    
    // 2. Delete usage records
    const usageSnapshot = await db.collection('usage')
      .where('userId', '==', userId)
      .get();
    
    if (!usageSnapshot.empty) {
      if (!dryRun) {
        const batch = db.batch();
        usageSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
      log(`${dryRun ? '[DRY RUN] Would delete' : '✅ Deleted'} ${usageSnapshot.size} usage records`, dryRun ? 'yellow' : 'green');
      results.deleted.push(`${usageSnapshot.size} usage records`);
    }
    
    // 3. Delete upgrade requests
    const upgradeSnapshot = await db.collection('upgradeRequests')
      .where('userId', '==', userId)
      .get();
    
    if (!upgradeSnapshot.empty) {
      if (!dryRun) {
        const batch = db.batch();
        upgradeSnapshot.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
      }
      log(`${dryRun ? '[DRY RUN] Would delete' : '✅ Deleted'} ${upgradeSnapshot.size} upgrade requests`, dryRun ? 'yellow' : 'green');
      results.deleted.push(`${upgradeSnapshot.size} upgrade requests`);
    }
    
    // 4. Delete from Firebase Auth
    try {
      if (!dryRun) {
        await auth.deleteUser(userId);
      }
      log(`${dryRun ? '[DRY RUN] Would delete' : '✅ Deleted'} Firebase Auth account`, dryRun ? 'yellow' : 'green');
      results.deleted.push('Firebase Auth account');
    } catch (error) {
      if (error.code !== 'auth/user-not-found') {
        log(`⚠️  Could not delete Auth account: ${error.message}`, 'yellow');
        results.failed.push('Firebase Auth account');
      }
    }
    
  } catch (error) {
    log(`❌ Error during deletion: ${error.message}`, 'red');
    results.failed.push(`Error: ${error.message}`);
  }
  
  return results;
}

async function main() {
  log('\n=== User Data Deletion Tool ===', 'blue');
  log('This tool will permanently delete all data for a user.', 'yellow');
  log('This action cannot be undone!\n', 'red');
  
  try {
    // Get user email
    const email = await askQuestion('Enter user email to delete: ');
    
    if (!email) {
      log('No email provided. Exiting.', 'red');
      rl.close();
      return;
    }
    
    // Find user
    log(`\nSearching for user: ${email}...`, 'yellow');
    const user = await findUserByEmail(email);
    
    if (!user) {
      log(`❌ No user found with email: ${email}`, 'red');
      rl.close();
      return;
    }
    
    log(`✅ Found user: ${user.data.fullName || 'No name'} (ID: ${user.id})`, 'green');
    
    // Preview data
    const preview = await previewUserData(user.id);
    
    if (!preview) {
      log('Failed to preview user data.', 'red');
      rl.close();
      return;
    }
    
    // Dry run first
    log('\n--- DRY RUN ---', 'yellow');
    await deleteAllUserData(user.id, true);
    
    // Confirm deletion
    const confirm = await askQuestion('\n⚠️  Do you want to permanently delete this user and all their data? (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      log('\nDeletion cancelled.', 'yellow');
      rl.close();
      return;
    }
    
    // Final confirmation
    const finalConfirm = await askQuestion(`\n🚨 FINAL CONFIRMATION: Type "${email}" to confirm deletion: `);
    
    if (finalConfirm !== email) {
      log('\nEmail does not match. Deletion cancelled.', 'yellow');
      rl.close();
      return;
    }
    
    // Perform actual deletion
    const results = await deleteAllUserData(user.id, false);
    
    // Summary
    log('\n=== Deletion Summary ===', 'blue');
    log(`Deleted: ${results.deleted.length} items`, 'green');
    results.deleted.forEach(item => log(`  ✅ ${item}`, 'green'));
    
    if (results.failed.length > 0) {
      log(`\nFailed: ${results.failed.length} items`, 'red');
      results.failed.forEach(item => log(`  ❌ ${item}`, 'red'));
    }
    
    log(`\n✅ User ${email} has been deleted.`, 'green');
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
  }
  
  rl.close();
}

// Handle script arguments
const args = process.argv.slice(2);
if (args.includes('--help')) {
  log('\nUsage: node delete-user.js', 'blue');
  log('\nThis script will:', 'yellow');
  log('  1. Search for a user by email', 'reset');
  log('  2. Preview all data associated with the user', 'reset');
  log('  3. Perform a dry run showing what will be deleted', 'reset');
  log('  4. Ask for confirmation before deleting', 'reset');
  log('  5. Delete all user data from:', 'reset');
  log('     - Firestore users collection', 'reset');
  log('     - Usage records', 'reset');
  log('     - Upgrade requests', 'reset');
  log('     - Firebase Auth', 'reset');
  log('\nThis action is permanent and cannot be undone!', 'red');
  process.exit(0);
}

// Run the script
main();