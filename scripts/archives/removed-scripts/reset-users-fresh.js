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

async function analyzeCurrentState() {
  log('\n=== Current User State Analysis ===\n', 'blue');
  
  const users = [];
  
  try {
    const usersSnapshot = await db.collection('users').get();
    
    log(`Total Users: ${usersSnapshot.size}\n`, 'cyan');
    
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      
      const userInfo = {
        id: userId,
        email: userData.email || 'No email',
        name: userData.fullName || 'No name',
        data: userData
      };
      
      users.push(userInfo);
      
      // Display current state
      log(`📧 ${userInfo.email}`, 'yellow');
      log(`   Name: ${userInfo.name}`, 'reset');
      
      // Check for fields that need to be removed/reset
      const fieldsToCheck = [
        'paymentMethod',
        'subscriptionEnd',
        'billingPeriod',
        'autoRenew',
        'quotaUsed',
        'paymentHistory',
        'upgradeRequests'
      ];
      
      const foundFields = [];
      
      if (userData.subscription?.paymentMethod) {
        foundFields.push(`paymentMethod: ${userData.subscription.paymentMethod}`);
      }
      if (userData.subscription?.subscriptionEnd) {
        foundFields.push('subscriptionEnd');
      }
      if (userData.subscription?.billingPeriod && userData.subscription.billingPeriod !== 'trial') {
        foundFields.push(`billingPeriod: ${userData.subscription.billingPeriod}`);
      }
      if (userData.subscription?.autoRenew) {
        foundFields.push('autoRenew: true');
      }
      if (userData.subscription?.quotaUsed > 0) {
        foundFields.push(`quotaUsed: ${userData.subscription.quotaUsed}`);
      }
      
      if (foundFields.length > 0) {
        log(`   ⚠️  Fields to reset: ${foundFields.join(', ')}`, 'red');
      } else {
        log(`   ✅ Already in fresh state`, 'green');
      }
      
      log('', 'reset');
    }
    
    return users;
    
  } catch (error) {
    log(`Error analyzing users: ${error.message}`, 'red');
    return [];
  }
}

async function resetUserToFresh(userId, dryRun = false) {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return { success: false, error: 'User not found' };
    }
    
    const userData = userDoc.data();
    const now = new Date();
    
    // Prepare updates - make it look like fresh registration
    const updates = {
      // Keep basic info
      'uid': userData.uid,
      'email': userData.email,
      'fullName': userData.fullName || '',
      'createdAt': userData.createdAt, // Keep original creation date
      'lastLogin': now,
      
      // Fresh subscription state
      'subscription.plan': 'free',
      'subscription.billingPeriod': 'trial',
      'subscription.subscriptionStart': now,
      'subscription.subscriptionEnd': null,
      'subscription.isActive': true,
      'subscription.autoRenew': false,
      'subscription.quotaLimit': 50,
      'subscription.quotaUsed': 0,
      'subscription.lastResetDate': now
    };
    
    // Fields to delete
    const deletions = {
      'subscription.paymentMethod': FieldValue.delete(),
      'subscription.gracePeriodEnd': FieldValue.delete(),
      'subscription.isInGracePeriod': FieldValue.delete(),
      'subscription.dailyQuotaUsed': FieldValue.delete(),
      'subscription.dailyQuotaLimit': FieldValue.delete(),
      'paymentHistory': FieldValue.delete(),
      'upgradeHistory': FieldValue.delete(),
      'lastActivity': FieldValue.delete()
    };
    
    let upgradeRequestsDeleted = 0;
    
    if (!dryRun) {
      // Apply updates
      await userRef.set(updates, { merge: true });
      
      // Apply deletions
      await userRef.update(deletions);
      
      // Also delete any upgrade requests for this user
      const upgradeRequests = await db.collection('upgradeRequests')
        .where('userId', '==', userId)
        .get();
        
      if (!upgradeRequests.empty) {
        const batch = db.batch();
        upgradeRequests.docs.forEach(doc => {
          batch.delete(doc.ref);
        });
        await batch.commit();
        upgradeRequestsDeleted = upgradeRequests.size;
      }
    }
    
    return {
      success: true,
      upgradeRequestsDeleted: upgradeRequestsDeleted
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function resetAllUsers(users, dryRun = false) {
  log(`\n=== ${dryRun ? 'DRY RUN - ' : ''}Resetting Users to Fresh State ===\n`, 'magenta');
  
  let successCount = 0;
  let errorCount = 0;
  let totalUpgradeRequestsDeleted = 0;
  
  for (const user of users) {
    log(`${dryRun ? '[DRY RUN] Would reset' : 'Resetting'}: ${user.email}`, 'yellow');
    
    const result = await resetUserToFresh(user.id, dryRun);
    
    if (result.success) {
      successCount++;
      if (!dryRun) {
        log(`  ✅ Reset to fresh registration state`, 'green');
        log(`  ✅ Quota reset to 0/50`, 'green');
        if (result.upgradeRequestsDeleted > 0) {
          log(`  ✅ Deleted ${result.upgradeRequestsDeleted} upgrade requests`, 'green');
          totalUpgradeRequestsDeleted += result.upgradeRequestsDeleted;
        }
      } else {
        log(`  Would reset to fresh state`, 'cyan');
        log(`  Would reset quota to 0/50`, 'cyan');
        log(`  Would remove payment info`, 'cyan');
      }
    } else {
      errorCount++;
      log(`  ❌ Error: ${result.error}`, 'red');
    }
  }
  
  log(`\n=== ${dryRun ? 'Dry Run' : 'Reset'} Summary ===`, 'blue');
  log(`Successful: ${successCount}`, 'green');
  log(`Errors: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
  if (totalUpgradeRequestsDeleted > 0) {
    log(`Upgrade requests deleted: ${totalUpgradeRequestsDeleted}`, 'green');
  }
  
  return { successCount, errorCount };
}

async function main() {
  const args = process.argv.slice(2);
  const dryRun = !args.includes('--execute');
  
  log('\n=== User Reset Tool - Make Users Look Fresh ===', 'blue');
  
  if (dryRun) {
    log('Running in DRY RUN mode. Use --execute to apply changes.', 'yellow');
  } else {
    log('⚠️  Running in EXECUTE mode. This will reset all users!', 'red');
  }
  
  try {
    // Analyze current state
    const users = await analyzeCurrentState();
    
    if (users.length === 0) {
      log('No users found.', 'red');
      process.exit(1);
    }
    
    // Ask for confirmation if executing
    if (!dryRun) {
      log('\n⚠️  WARNING: This will reset all users to look like fresh registrations!', 'red');
      log('   - All payment info will be removed', 'red');
      log('   - All quotas will be reset to 0', 'red');
      log('   - All upgrade history will be deleted', 'red');
      
      // Add a delay to make sure user sees the warning
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
    
    // Perform reset
    await resetAllUsers(users, dryRun);
    
    if (dryRun) {
      log(`\n💡 To apply these changes, run: node reset-users-fresh.js --execute`, 'cyan');
    } else {
      log(`\n✅ All users have been reset to fresh registration state!`, 'green');
      log('   They now appear as if they just signed up.', 'green');
    }
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
    process.exit(1);
  }
  
  process.exit(0);
}

// Run the script
main();