import inquirer from 'inquirer';
import chalk from 'chalk';
import { db, auth } from './firebase-admin-init.js';

/**
 * Fix quota data for a specific user
 */
async function fixUserQuota() {
  try {
    const { email } = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter user email to fix quota:',
        validate: input => input.includes('@') || 'Please enter a valid email'
      }
    ]);
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(email).catch(() => null);
    
    if (!userRecord) {
      console.log(chalk.red('User not found in Auth.'));
      return;
    }
    
    // Get user document
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      console.log(chalk.red('User document not found in Firestore.'));
      return;
    }
    
    const userData = userDoc.data();
    const sub = userData.subscription || {};
    
    console.log(chalk.cyan('\nCurrent subscription data:'));
    console.log(chalk.white(`Plan: ${sub.plan || 'not set'}`));
    console.log(chalk.white(`Quota Limit: ${sub.quotaLimit || 'not set'}`));
    console.log(chalk.white(`Quota Used: ${sub.quotaUsed || 0}`));
    console.log(chalk.white(`Last Reset Date: ${sub.lastResetDate ? sub.lastResetDate.toDate().toLocaleDateString() : 'not set'}`));
    
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Reset quota to 0 and set limit to 50', value: 'reset' },
          { name: 'Just update quota limit to 50', value: 'update_limit' },
          { name: 'Set custom quota values', value: 'custom' },
          { name: 'Cancel', value: 'cancel' }
        ]
      }
    ]);
    
    if (action === 'cancel') {
      console.log(chalk.gray('Operation cancelled'));
      return;
    }
    
    const now = new Date();
    let updates = {};
    
    switch (action) {
      case 'reset':
        updates = {
          'subscription.quotaLimit': 50,
          'subscription.quotaUsed': 0,
          'subscription.lastResetDate': now,
          'lastActivity': now
        };
        break;
        
      case 'update_limit':
        updates = {
          'subscription.quotaLimit': 50,
          'lastActivity': now
        };
        break;
        
      case 'custom':
        const customValues = await inquirer.prompt([
          {
            type: 'number',
            name: 'quotaLimit',
            message: 'Enter quota limit:',
            default: 50,
            validate: input => input > 0 || 'Must be positive'
          },
          {
            type: 'number',
            name: 'quotaUsed',
            message: 'Enter quota used:',
            default: sub.quotaUsed || 0,
            validate: input => input >= 0 || 'Must be non-negative'
          }
        ]);
        updates = {
          'subscription.quotaLimit': customValues.quotaLimit,
          'subscription.quotaUsed': customValues.quotaUsed,
          'subscription.lastResetDate': now,
          'lastActivity': now
        };
        break;
    }
    
    // If subscription doesn't exist, create it
    if (!userData.subscription) {
      updates.subscription = {
        plan: 'free',
        billingPeriod: 'trial',
        subscriptionStart: now,
        subscriptionEnd: null,
        isActive: true,
        autoRenew: false,
        isInGracePeriod: false,
        quotaLimit: 50,
        quotaUsed: 0,
        dailyQuotaUsed: 0,
        dailyQuotaLimit: 5,
        lastResetDate: now
      };
    }
    
    await db.collection('users').doc(userRecord.uid).update(updates);
    
    console.log(chalk.green('\n✓ User quota fixed successfully!'));
    
    // Show updated values
    const updatedDoc = await db.collection('users').doc(userRecord.uid).get();
    const updatedSub = updatedDoc.data().subscription;
    
    console.log(chalk.cyan('\nUpdated subscription data:'));
    console.log(chalk.white(`Quota Limit: ${updatedSub.quotaLimit}`));
    console.log(chalk.white(`Quota Used: ${updatedSub.quotaUsed}`));
    console.log(chalk.white(`Quota Remaining: ${updatedSub.quotaLimit - updatedSub.quotaUsed}`));
    
  } catch (error) {
    console.error(chalk.red('Error fixing user quota:'), error);
  }
}

// Main function
async function main() {
  console.log(chalk.blue('═══════════════════════════════════════════════'));
  console.log(chalk.blue.bold('    Fix User Quota Data'));
  console.log(chalk.blue('═══════════════════════════════════════════════'));
  console.log();
  
  await fixUserQuota();
  
  const { another } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'another',
      message: 'Fix another user?',
      default: false
    }
  ]);
  
  if (another) {
    await main();
  }
}

// Run the script
console.log(chalk.blue('Firebase Admin SDK initialized successfully'));
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});