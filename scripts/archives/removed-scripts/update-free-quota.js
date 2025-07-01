import inquirer from 'inquirer';
import chalk from 'chalk';
import { db } from './firebase-admin-init.js';

/**
 * Update all free users to new quota limit
 */
async function updateFreeUserQuota() {
  const OLD_QUOTA = 5;
  const NEW_QUOTA = 50;
  
  try {
    console.log(chalk.blue('═══════════════════════════════════════════════'));
    console.log(chalk.blue.bold('    Update Free User Quota'));
    console.log(chalk.blue('    Changing quota from 5 to 50'));
    console.log(chalk.blue('═══════════════════════════════════════════════'));
    console.log();

    // First, let's count how many users need updating
    console.log(chalk.yellow('Analyzing users...'));
    
    const freeUsersSnapshot = await db.collection('users')
      .where('subscription.plan', '==', 'free')
      .get();
    
    console.log(chalk.white(`Found ${freeUsersSnapshot.size} free trial users`));
    
    // Count users with old quota
    let usersToUpdate = 0;
    let alreadyUpdated = 0;
    
    freeUsersSnapshot.forEach(doc => {
      const data = doc.data();
      const currentQuota = data.subscription?.quotaLimit;
      
      if (currentQuota === OLD_QUOTA || !currentQuota) {
        usersToUpdate++;
      } else if (currentQuota === NEW_QUOTA) {
        alreadyUpdated++;
      }
    });
    
    console.log(chalk.yellow(`\nUsers with old quota (5): ${usersToUpdate}`));
    console.log(chalk.green(`Users already updated (50): ${alreadyUpdated}`));
    
    if (usersToUpdate === 0) {
      console.log(chalk.green('\n✓ All users already have the new quota limit!'));
      return;
    }
    
    // Confirm the update
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Update ${usersToUpdate} users from ${OLD_QUOTA} to ${NEW_QUOTA} quota limit?`,
        default: true
      }
    ]);
    
    if (!confirm) {
      console.log(chalk.gray('Operation cancelled'));
      return;
    }
    
    // Perform the update
    console.log(chalk.yellow('\nUpdating users...'));
    
    const batch = db.batch();
    let batchCount = 0;
    let totalUpdated = 0;
    
    for (const doc of freeUsersSnapshot.docs) {
      const data = doc.data();
      const currentQuota = data.subscription?.quotaLimit;
      
      // Only update users with old quota or no quota set
      if (currentQuota === OLD_QUOTA || !currentQuota) {
        batch.update(doc.ref, {
          'subscription.quotaLimit': NEW_QUOTA,
          'lastActivity': new Date()
        });
        
        batchCount++;
        totalUpdated++;
        
        // Firestore has a limit of 500 operations per batch
        if (batchCount === 500) {
          await batch.commit();
          console.log(chalk.gray(`  Updated ${totalUpdated} users...`));
          batchCount = 0;
        }
      }
    }
    
    // Commit any remaining updates
    if (batchCount > 0) {
      await batch.commit();
    }
    
    console.log(chalk.green(`\n✓ Successfully updated ${totalUpdated} users to ${NEW_QUOTA} quota limit!`));
    
    // Also check for users without subscription object
    console.log(chalk.yellow('\nChecking for users without subscription data...'));
    
    const usersWithoutSubSnapshot = await db.collection('users')
      .where('subscription', '==', null)
      .get();
    
    if (!usersWithoutSubSnapshot.empty) {
      console.log(chalk.yellow(`Found ${usersWithoutSubSnapshot.size} users without subscription data`));
      
      const { fixMissing } = await inquirer.prompt([
        {
          type: 'confirm',
          name: 'fixMissing',
          message: 'Create default subscription data for these users?',
          default: true
        }
      ]);
      
      if (fixMissing) {
        const now = new Date();
        let fixedCount = 0;
        
        for (const doc of usersWithoutSubSnapshot.docs) {
          await doc.ref.update({
            subscription: {
              plan: 'free',
              billingPeriod: 'trial',
              subscriptionStart: now,
              subscriptionEnd: null,
              isActive: true,
              autoRenew: false,
              isInGracePeriod: false,
              quotaLimit: NEW_QUOTA,
              quotaUsed: 0,
              dailyQuotaUsed: 0,
              dailyQuotaLimit: 5,
              lastResetDate: now
            },
            lastActivity: now
          });
          fixedCount++;
        }
        
        console.log(chalk.green(`✓ Created subscription data for ${fixedCount} users`));
      }
    }
    
    // Show summary
    console.log(chalk.blue('\n═══════════════════════════════════════════════'));
    console.log(chalk.green.bold('Update Complete!'));
    console.log(chalk.white(`All free users now have ${NEW_QUOTA} quotes per month`));
    console.log(chalk.blue('═══════════════════════════════════════════════'));
    
  } catch (error) {
    console.error(chalk.red('Error updating user quotas:'), error);
  }
}

// Add option to update specific user
async function updateSingleUserQuota() {
  try {
    const { email } = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter user email to update:',
        validate: input => input.includes('@') || 'Please enter a valid email'
      }
    ]);
    
    // Find user by email
    const userSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (userSnapshot.empty) {
      console.log(chalk.red('User not found'));
      return;
    }
    
    const userDoc = userSnapshot.docs[0];
    const userData = userDoc.data();
    
    console.log(chalk.cyan('\nCurrent user data:'));
    console.log(chalk.white(`Plan: ${userData.subscription?.plan || 'free'}`));
    console.log(chalk.white(`Current quota limit: ${userData.subscription?.quotaLimit || 'not set'}`));
    console.log(chalk.white(`Quota used: ${userData.subscription?.quotaUsed || 0}`));
    
    const { newQuota } = await inquirer.prompt([
      {
        type: 'number',
        name: 'newQuota',
        message: 'Enter new quota limit:',
        default: 50,
        validate: input => input > 0 || 'Quota must be positive'
      }
    ]);
    
    await userDoc.ref.update({
      'subscription.quotaLimit': newQuota,
      'lastActivity': new Date()
    });
    
    console.log(chalk.green(`\n✓ Updated ${email} quota limit to ${newQuota}`));
    
  } catch (error) {
    console.error(chalk.red('Error updating user quota:'), error);
  }
}

// Main menu
async function main() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'What would you like to do?',
      choices: [
        { name: 'Update all free users to 50 quota', value: 'update_all' },
        { name: 'Update single user quota', value: 'update_single' },
        { name: 'Exit', value: 'exit' }
      ]
    }
  ]);
  
  switch (action) {
    case 'update_all':
      await updateFreeUserQuota();
      break;
    case 'update_single':
      await updateSingleUserQuota();
      break;
    case 'exit':
      console.log(chalk.blue('Goodbye!'));
      process.exit(0);
  }
  
  // Ask if user wants to continue
  const { continueAction } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'continueAction',
      message: 'Would you like to perform another action?',
      default: false
    }
  ]);
  
  if (continueAction) {
    await main();
  }
}

// Run the script
console.log(chalk.blue('Firebase Admin SDK initialized successfully'));
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});