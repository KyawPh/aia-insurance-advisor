import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
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

// Create readline interface
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

async function analyzeUsers() {
  log('\n=== User Analysis Report ===\n', 'blue');
  
  const users = [];
  const usageStats = {};
  
  try {
    // Get all users
    const usersSnapshot = await db.collection('users').get();
    
    log(`Total Users: ${usersSnapshot.size}\n`, 'cyan');
    
    // Analyze each user
    for (const doc of usersSnapshot.docs) {
      const userData = doc.data();
      const userId = doc.id;
      
      // Count usage records
      const usageSnapshot = await db.collection('usage')
        .where('userId', '==', userId)
        .where('action', '==', 'quote_generated')
        .get();
      
      const userInfo = {
        id: userId,
        email: userData.email || 'No email',
        name: userData.fullName || 'No name',
        plan: userData.subscription?.plan || 'unknown',
        billingPeriod: userData.subscription?.billingPeriod || 'unknown',
        quotaLimit: userData.subscription?.quotaLimit || 0,
        quotaUsed: userData.subscription?.quotaUsed || 0,
        totalQuotes: usageSnapshot.size,
        isActive: userData.subscription?.isActive,
        subscriptionEnd: userData.subscription?.subscriptionEnd,
        // Grace period fields to remove
        hasGracePeriodFields: !!(
          userData.subscription?.isInGracePeriod !== undefined ||
          userData.subscription?.gracePeriodEnd ||
          userData.subscription?.dailyQuotaUsed !== undefined ||
          userData.subscription?.dailyQuotaLimit !== undefined
        ),
        gracePeriodFields: []
      };
      
      // Check for grace period fields
      if (userData.subscription?.isInGracePeriod !== undefined) {
        userInfo.gracePeriodFields.push('isInGracePeriod');
      }
      if (userData.subscription?.gracePeriodEnd) {
        userInfo.gracePeriodFields.push('gracePeriodEnd');
      }
      if (userData.subscription?.dailyQuotaUsed !== undefined) {
        userInfo.gracePeriodFields.push('dailyQuotaUsed');
      }
      if (userData.subscription?.dailyQuotaLimit !== undefined) {
        userInfo.gracePeriodFields.push('dailyQuotaLimit');
      }
      
      users.push(userInfo);
      
      // Display user info
      log(`📧 ${userInfo.email}`, 'yellow');
      log(`   Name: ${userInfo.name}`, 'reset');
      log(`   Plan: ${userInfo.plan} (${userInfo.billingPeriod})`, userInfo.plan === 'unlimited' ? 'magenta' : 'reset');
      log(`   Quota: ${userInfo.quotaUsed}/${userInfo.quotaLimit === -1 ? '∞' : userInfo.quotaLimit}`, 'reset');
      log(`   Total Quotes Generated: ${userInfo.totalQuotes}`, 'green');
      
      if (userInfo.subscriptionEnd) {
        const endDate = userInfo.subscriptionEnd.toDate ? userInfo.subscriptionEnd.toDate() : new Date(userInfo.subscriptionEnd);
        const isExpired = endDate < new Date();
        log(`   Subscription End: ${endDate.toISOString()} ${isExpired ? '(EXPIRED)' : '(ACTIVE)'}`, isExpired ? 'red' : 'green');
      }
      
      if (userInfo.hasGracePeriodFields) {
        log(`   ⚠️  Has grace period fields: ${userInfo.gracePeriodFields.join(', ')}`, 'red');
      }
      
      log('', 'reset');
    }
    
    // Summary statistics
    log('=== Summary Statistics ===', 'blue');
    const freePlanUsers = users.filter(u => u.plan === 'free').length;
    const unlimitedPlanUsers = users.filter(u => u.plan === 'unlimited').length;
    const usersWithGracePeriod = users.filter(u => u.hasGracePeriodFields).length;
    
    log(`Free Plan Users: ${freePlanUsers}`, 'reset');
    log(`Unlimited Plan Users: ${unlimitedPlanUsers}`, 'magenta');
    log(`Users with Grace Period Fields: ${usersWithGracePeriod}`, 'red');
    log(`Total Quotes Generated: ${users.reduce((sum, u) => sum + u.totalQuotes, 0)}`, 'green');
    
    return users;
    
  } catch (error) {
    log(`Error analyzing users: ${error.message}`, 'red');
    return [];
  }
}

async function cleanupUser(userId, dryRun = false) {
  try {
    const userRef = db.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return { success: false, error: 'User not found' };
    }
    
    const userData = userDoc.data();
    const now = new Date();
    
    // Prepare updates
    const updates = {
      'subscription.plan': 'free',
      'subscription.billingPeriod': 'trial',
      'subscription.subscriptionStart': userData.subscription?.subscriptionStart || now,
      'subscription.subscriptionEnd': null,
      'subscription.isActive': true,
      'subscription.autoRenew': false,
      'subscription.quotaLimit': 50, // Promotional quota
      'subscription.quotaUsed': userData.subscription?.quotaUsed || 0,
      'subscription.lastResetDate': userData.subscription?.lastResetDate || now,
      'lastActivity': now
    };
    
    // Fields to delete
    const deletions = {
      'subscription.isInGracePeriod': FieldValue.delete(),
      'subscription.gracePeriodEnd': FieldValue.delete(),
      'subscription.dailyQuotaUsed': FieldValue.delete(),
      'subscription.dailyQuotaLimit': FieldValue.delete()
    };
    
    if (!dryRun) {
      // Apply updates
      await userRef.update(updates);
      
      // Apply deletions
      await userRef.update(deletions);
    }
    
    return {
      success: true,
      changes: {
        updates: Object.keys(updates),
        deletions: Object.keys(deletions)
      }
    };
    
  } catch (error) {
    return { success: false, error: error.message };
  }
}

async function cleanupAllUsers(users, dryRun = false) {
  log(`\n=== ${dryRun ? 'DRY RUN - ' : ''}Cleaning Up All Users ===\n`, 'magenta');
  
  let successCount = 0;
  let errorCount = 0;
  
  for (const user of users) {
    log(`${dryRun ? '[DRY RUN] Would process' : 'Processing'}: ${user.email}`, 'yellow');
    
    const result = await cleanupUser(user.id, dryRun);
    
    if (result.success) {
      successCount++;
      if (!dryRun) {
        log(`  ✅ Converted to free plan`, 'green');
        log(`  ✅ Removed grace period fields`, 'green');
      } else {
        log(`  Would convert to free plan`, 'cyan');
        log(`  Would remove grace period fields`, 'cyan');
      }
    } else {
      errorCount++;
      log(`  ❌ Error: ${result.error}`, 'red');
    }
  }
  
  log(`\n=== ${dryRun ? 'Dry Run' : 'Cleanup'} Summary ===`, 'blue');
  log(`Successful: ${successCount}`, 'green');
  log(`Errors: ${errorCount}`, errorCount > 0 ? 'red' : 'green');
  
  return { successCount, errorCount };
}

async function main() {
  log('\n=== User Analysis and Cleanup Tool ===', 'blue');
  
  try {
    // Analyze users first
    const users = await analyzeUsers();
    
    if (users.length === 0) {
      log('No users found.', 'red');
      rl.close();
      return;
    }
    
    // Ask if user wants to proceed with cleanup
    log('\n📋 Do you want to convert all users to free plan and clean up data? (yes/no): ', 'cyan');
    const proceed = await askQuestion('');
    
    if (proceed.toLowerCase() !== 'yes') {
      log('\nCleanup cancelled.', 'yellow');
      rl.close();
      return;
    }
    
    // Dry run first
    await cleanupAllUsers(users, true);
    
    // Confirm actual cleanup
    const confirm = await askQuestion('\n⚠️  Do you want to apply these changes? This will modify all user data! (yes/no): ');
    
    if (confirm.toLowerCase() !== 'yes') {
      log('\nCleanup cancelled.', 'yellow');
      rl.close();
      return;
    }
    
    // Perform actual cleanup
    const results = await cleanupAllUsers(users, false);
    
    if (results.successCount > 0) {
      log(`\n✅ Successfully cleaned up ${results.successCount} users!`, 'green');
      log('All users are now on the free plan with clean data.', 'green');
    }
    
  } catch (error) {
    log(`\n❌ Error: ${error.message}`, 'red');
  }
  
  rl.close();
}

// Handle script arguments
const args = process.argv.slice(2);
if (args.includes('--help')) {
  log('\nUsage: node analyze-and-cleanup-users.js', 'blue');
  log('\nThis script will:', 'yellow');
  log('  1. Analyze all users and show their usage statistics', 'reset');
  log('  2. Convert all users to free plan', 'reset');
  log('  3. Remove grace period fields:', 'reset');
  log('     - isInGracePeriod', 'reset');
  log('     - gracePeriodEnd', 'reset');
  log('     - dailyQuotaUsed', 'reset');
  log('     - dailyQuotaLimit', 'reset');
  log('  4. Set quota limit to 50 (promotional)', 'reset');
  log('\nThe script will show a dry run before making changes.', 'cyan');
  process.exit(0);
}

// Run the script
main();