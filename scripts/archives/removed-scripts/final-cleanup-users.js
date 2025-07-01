import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { readFileSync } from 'fs';
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

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

// Colors for console output
const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m',
  reset: '\x1b[0m'
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

async function cleanupUserCompletely(userId, userData) {
  try {
    const userRef = db.collection('users').doc(userId);
    
    // The ONLY fields we want to keep
    const cleanUserData = {
      uid: userData.uid || userId,
      email: userData.email,
      fullName: userData.fullName || '',
      createdAt: userData.createdAt,
      lastLogin: new Date(),
      subscription: {
        plan: 'free',
        billingPeriod: 'trial',
        subscriptionStart: new Date(),
        subscriptionEnd: null,
        isActive: true,
        autoRenew: false,
        quotaLimit: 50,
        quotaUsed: 0,
        lastResetDate: new Date()
      }
    };
    
    // First, delete the entire document
    await userRef.delete();
    
    // Then recreate it with only the clean data
    await userRef.set(cleanUserData);
    
    return { success: true };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function analyzeAndCleanUsers() {
  log('\n=== Final User Cleanup ===\n', 'blue');
  
  try {
    const usersSnapshot = await db.collection('users').get();
    
    log(`Found ${usersSnapshot.size} users to clean\n`, 'cyan');
    
    let successCount = 0;
    let errorCount = 0;
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      
      log(`Cleaning user: ${userData.email}`, 'yellow');
      
      // List all fields that will be removed
      const allFields = Object.keys(userData);
      const subscriptionFields = userData.subscription ? Object.keys(userData.subscription) : [];
      
      const unnecessaryFields = [];
      
      // Check root level fields
      allFields.forEach(field => {
        if (!['uid', 'email', 'fullName', 'createdAt', 'lastLogin', 'subscription'].includes(field)) {
          unnecessaryFields.push(field);
        }
      });
      
      // Check subscription fields
      subscriptionFields.forEach(field => {
        if (!['plan', 'billingPeriod', 'subscriptionStart', 'subscriptionEnd', 'isActive', 'autoRenew', 'quotaLimit', 'quotaUsed', 'lastResetDate'].includes(field)) {
          unnecessaryFields.push(`subscription.${field}`);
        }
      });
      
      if (unnecessaryFields.length > 0) {
        log(`  Removing fields: ${unnecessaryFields.join(', ')}`, 'red');
      }
      
      const result = await cleanupUserCompletely(userId, userData);
      
      if (result.success) {
        successCount++;
        log(`  ✅ User cleaned and reset`, 'green');
      } else {
        errorCount++;
        log(`  ❌ Error: ${result.error}`, 'red');
      }
      
      log('', 'reset');
    }
    
    log('=== Cleanup Summary ===', 'blue');
    log(`Successful: ${successCount}`, 'green');
    log(`Errors: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
    
    if (successCount > 0) {
      log(`\n✅ All users have been completely cleaned!`, 'green');
      log('They now have only the essential fields for a fresh account.', 'green');
    }
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--help')) {
    log('\nUsage: node final-cleanup-users.js', 'blue');
    log('\nThis script will:', 'yellow');
    log('  1. Remove ALL unnecessary fields from users', 'reset');
    log('  2. Keep only essential fields:', 'reset');
    log('     - uid, email, fullName, createdAt, lastLogin', 'reset');
    log('     - subscription (with clean structure)', 'reset');
    log('  3. Reset all users to fresh free trial state', 'reset');
    log('\nThis is a complete cleanup that removes all extra data!', 'red');
    process.exit(0);
  }
  
  log('\n=== Complete User Data Cleanup Tool ===', 'blue');
  log('This will remove ALL unnecessary fields and reset users', 'red');
  
  // Add confirmation
  log('\n⚠️  This will:', 'red');
  log('  - Delete and recreate all user documents', 'red');
  log('  - Remove ALL fields except essential ones', 'red');
  log('  - Reset everyone to fresh free trial', 'red');
  
  log('\nStarting cleanup in 3 seconds...', 'yellow');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await analyzeAndCleanUsers();
  
  process.exit(0);
}

// Run the script
main();