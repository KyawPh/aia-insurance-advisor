import inquirer from 'inquirer';
import chalk from 'chalk';
import { 
  db, 
  auth,
  calculateSubscriptionEndDate,
  formatDate,
  formatCurrency,
  SUBSCRIPTION_PRICES,
  BILLING_PERIODS
} from './firebase-admin-init.js';

// Utility functions for admin operations

/**
 * Manually create a subscription for a user (e.g., for offline payments)
 */
export async function createManualSubscription(email, billingPeriod, paymentReference) {
  try {
    // Get user by email
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      throw new Error('User not found');
    }

    const now = new Date();
    const subscriptionEnd = calculateSubscriptionEndDate(now, billingPeriod);
    const amount = SUBSCRIPTION_PRICES[billingPeriod];

    // Update user subscription
    await db.collection('users').doc(userRecord.uid).update({
      'subscription.plan': 'unlimited',
      'subscription.billingPeriod': billingPeriod,
      'subscription.subscriptionStart': now,
      'subscription.subscriptionEnd': subscriptionEnd,
      'subscription.isActive': true,
      'subscription.autoRenew': billingPeriod === 'monthly',
      'subscription.isInGracePeriod': false,
      'subscription.gracePeriodEnd': null,
      'subscription.paymentMethod': 'manual',
      'subscription.quotaUsed': 0,
      'subscription.dailyQuotaUsed': 0,
      'subscription.lastPaymentReference': paymentReference,
      'subscription.lastPaymentAmount': amount,
      'subscription.lastPaymentDate': now,
      'lastActivity': now
    });

    // Create payment record
    await db.collection('payments').add({
      userId: userRecord.uid,
      userEmail: email,
      userName: userRecord.displayName || 'N/A',
      amount,
      currency: 'MMK',
      paymentMethod: 'manual',
      paymentReference,
      billingPeriod,
      subscriptionStart: now,
      subscriptionEnd,
      status: 'completed',
      processedBy: process.env.ADMIN_EMAIL || 'admin',
      createdAt: now
    });

    console.log(chalk.green('✓ Subscription created successfully'));
    console.log(chalk.white(`Active until: ${formatDate(subscriptionEnd)}`));

  } catch (error) {
    console.error(chalk.red('Error creating subscription:'), error.message);
  }
}

/**
 * Extend a user's subscription
 */
export async function extendSubscription(email, additionalMonths) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      throw new Error('User not found');
    }

    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    if (!userDoc.exists) {
      throw new Error('User subscription data not found');
    }

    const userData = userDoc.data();
    const currentEnd = userData.subscription?.subscriptionEnd?.toDate() || new Date();
    
    // Calculate new end date
    const newEnd = new Date(currentEnd);
    newEnd.setMonth(newEnd.getMonth() + additionalMonths);

    await db.collection('users').doc(userRecord.uid).update({
      'subscription.subscriptionEnd': newEnd,
      'subscription.isActive': true,
      'subscription.isInGracePeriod': false,
      'lastActivity': new Date()
    });

    console.log(chalk.green('✓ Subscription extended successfully'));
    console.log(chalk.white(`New end date: ${formatDate(newEnd)}`));

  } catch (error) {
    console.error(chalk.red('Error extending subscription:'), error.message);
  }
}

/**
 * Reset user quota (for free trial users)
 */
export async function resetUserQuota(email) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      throw new Error('User not found');
    }

    await db.collection('users').doc(userRecord.uid).update({
      'subscription.quotaUsed': 0,
      'subscription.dailyQuotaUsed': 0,
      'subscription.lastResetDate': new Date(),
      'lastActivity': new Date()
    });

    console.log(chalk.green('✓ User quota reset successfully'));

  } catch (error) {
    console.error(chalk.red('Error resetting quota:'), error.message);
  }
}

/**
 * Cancel a user's subscription
 */
export async function cancelSubscription(email, reason) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      throw new Error('User not found');
    }

    const now = new Date();

    await db.collection('users').doc(userRecord.uid).update({
      'subscription.isActive': false,
      'subscription.autoRenew': false,
      'subscription.cancellationDate': now,
      'subscription.cancellationReason': reason,
      'lastActivity': now
    });

    // Log the cancellation
    await db.collection('subscriptionEvents').add({
      userId: userRecord.uid,
      userEmail: email,
      event: 'subscription_cancelled',
      reason,
      timestamp: now,
      processedBy: process.env.ADMIN_EMAIL || 'admin'
    });

    console.log(chalk.yellow('✓ Subscription cancelled'));

  } catch (error) {
    console.error(chalk.red('Error cancelling subscription:'), error.message);
  }
}

/**
 * Export user data for a given email
 */
export async function exportUserData(email) {
  try {
    const userRecord = await auth.getUserByEmail(email);
    if (!userRecord) {
      throw new Error('User not found');
    }

    // Get user document
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    const userData = userDoc.exists ? userDoc.data() : {};

    // Get usage history
    const usageSnapshot = await db.collection('usage')
      .where('userId', '==', userRecord.uid)
      .orderBy('timestamp', 'desc')
      .limit(50)
      .get();

    const usage = [];
    usageSnapshot.forEach(doc => {
      usage.push({
        id: doc.id,
        ...doc.data(),
        timestamp: formatDate(doc.data().timestamp)
      });
    });

    // Get upgrade requests
    const upgradeSnapshot = await db.collection('upgradeRequests')
      .where('userId', '==', userRecord.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const upgrades = [];
    upgradeSnapshot.forEach(doc => {
      upgrades.push({
        id: doc.id,
        ...doc.data(),
        createdAt: formatDate(doc.data().createdAt)
      });
    });

    // Get payments
    const paymentSnapshot = await db.collection('payments')
      .where('userId', '==', userRecord.uid)
      .orderBy('createdAt', 'desc')
      .get();

    const payments = [];
    paymentSnapshot.forEach(doc => {
      payments.push({
        id: doc.id,
        ...doc.data(),
        createdAt: formatDate(doc.data().createdAt)
      });
    });

    const exportData = {
      user: {
        uid: userRecord.uid,
        email: userRecord.email,
        displayName: userRecord.displayName,
        createdAt: formatDate(userRecord.metadata.creationTime),
        lastSignIn: formatDate(userRecord.metadata.lastSignInTime),
        ...userData
      },
      usage,
      upgradeRequests: upgrades,
      payments
    };

    // Save to file
    const filename = `user_export_${userRecord.uid}_${Date.now()}.json`;
    const fs = await import('fs');
    fs.writeFileSync(filename, JSON.stringify(exportData, null, 2));

    console.log(chalk.green(`✓ User data exported to ${filename}`));

  } catch (error) {
    console.error(chalk.red('Error exporting user data:'), error.message);
  }
}

/**
 * Bulk update subscription prices (for price changes)
 */
export async function bulkUpdatePrices(newPrices) {
  try {
    console.log(chalk.yellow('This will update all pending upgrade requests with new prices.'));
    
    const pendingSnapshot = await db.collection('upgradeRequests')
      .where('status', '==', 'pending')
      .get();

    if (pendingSnapshot.empty) {
      console.log(chalk.gray('No pending requests to update.'));
      return;
    }

    const batch = db.batch();
    let updateCount = 0;

    pendingSnapshot.forEach(doc => {
      const data = doc.data();
      const newAmount = newPrices[data.billingPeriod];
      
      if (newAmount && newAmount !== data.amount) {
        batch.update(doc.ref, {
          amount: newAmount,
          updatedAt: new Date(),
          priceUpdateNote: `Price updated from ${data.amount} to ${newAmount}`
        });
        updateCount++;
      }
    });

    if (updateCount > 0) {
      await batch.commit();
      console.log(chalk.green(`✓ Updated ${updateCount} pending requests with new prices`));
    } else {
      console.log(chalk.gray('No price updates needed.'));
    }

  } catch (error) {
    console.error(chalk.red('Error updating prices:'), error.message);
  }
}

// Recalculate subscription for users with multiple payments
export async function recalculateSubscription(email) {
  try {
    // Get user by email
    const userSnapshot = await db.collection('users')
      .where('email', '==', email)
      .limit(1)
      .get();
    
    if (userSnapshot.empty) {
      console.log(chalk.red(`User with email ${email} not found`));
      return;
    }
    
    const userDoc = userSnapshot.docs[0];
    const userId = userDoc.id;
    
    // Get all completed payments for this user, ordered by creation date
    const paymentsSnapshot = await db.collection('payments')
      .where('userId', '==', userId)
      .where('status', '==', 'completed')
      .orderBy('createdAt', 'asc')
      .get();
    
    if (paymentsSnapshot.empty) {
      console.log(chalk.yellow('No completed payments found for this user'));
      return;
    }
    
    console.log(chalk.blue(`\nFound ${paymentsSnapshot.size} completed payments:`));
    
    let totalMonths = 0;
    let firstPaymentDate = null;
    
    paymentsSnapshot.docs.forEach((doc, index) => {
      const payment = doc.data();
      const billingPeriod = BILLING_PERIODS[payment.billingPeriod];
      
      if (index === 0) {
        firstPaymentDate = payment.createdAt.toDate();
      }
      
      totalMonths += billingPeriod.months;
      
      console.log(chalk.gray(`${index + 1}. ${formatDate(payment.createdAt.toDate())} - ${billingPeriod.label} - ${formatCurrency(payment.amount)}`));
    });
    
    console.log(chalk.yellow(`\nTotal subscription duration: ${totalMonths} months`));
    
    // Calculate the correct end date from the first payment
    const correctEndDate = new Date(firstPaymentDate);
    correctEndDate.setMonth(correctEndDate.getMonth() + totalMonths);
    
    console.log(chalk.white(`Subscription should end on: ${formatDate(correctEndDate)}`));
    
    // Ask for confirmation
    const { confirm } = await inquirer.prompt([
      {
        type: 'confirm',
        name: 'confirm',
        message: `Update subscription end date to ${formatDate(correctEndDate)}?`,
        default: true
      }
    ]);
    
    if (!confirm) {
      console.log(chalk.gray('Operation cancelled'));
      return;
    }
    
    // Update the subscription
    await db.collection('users').doc(userId).update({
      'subscription.subscriptionEnd': correctEndDate,
      'subscription.isActive': true,
      'lastActivity': new Date()
    });
    
    console.log(chalk.green('\n✓ Subscription end date updated successfully!'));
    
  } catch (error) {
    console.error(chalk.red('Error recalculating subscription:'), error);
  }
}

// Interactive CLI for utility functions
export async function runUtilityMenu() {
  const { action } = await inquirer.prompt([
    {
      type: 'list',
      name: 'action',
      message: 'Select utility action:',
      choices: [
        { name: 'Create manual subscription', value: 'manual_sub' },
        { name: 'Extend subscription', value: 'extend' },
        { name: 'Recalculate subscription (fix multiple payments)', value: 'recalculate' },
        { name: 'Reset user quota', value: 'reset_quota' },
        { name: 'Cancel subscription', value: 'cancel' },
        { name: 'Export user data', value: 'export' },
        { name: 'Back to main menu', value: 'back' }
      ]
    }
  ]);

  switch (action) {
    case 'manual_sub':
      const { email, period, reference } = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'User email:',
          validate: input => input.includes('@') || 'Please enter a valid email'
        },
        {
          type: 'list',
          name: 'period',
          message: 'Billing period:',
          choices: Object.entries(BILLING_PERIODS).map(([key, value]) => ({
            name: `${value.label} - ${formatCurrency(SUBSCRIPTION_PRICES[key])}`,
            value: key
          }))
        },
        {
          type: 'input',
          name: 'reference',
          message: 'Payment reference:',
          validate: input => input.trim() !== '' || 'Payment reference is required'
        }
      ]);
      await createManualSubscription(email, period, reference);
      break;

    case 'extend':
      const extendData = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'User email:',
          validate: input => input.includes('@') || 'Please enter a valid email'
        },
        {
          type: 'number',
          name: 'months',
          message: 'Additional months:',
          validate: input => input > 0 || 'Please enter a positive number'
        }
      ]);
      await extendSubscription(extendData.email, extendData.months);
      break;

    case 'recalculate':
      const { recalcEmail } = await inquirer.prompt([
        {
          type: 'input',
          name: 'recalcEmail',
          message: 'User email:',
          validate: input => input.includes('@') || 'Please enter a valid email'
        }
      ]);
      await recalculateSubscription(recalcEmail);
      break;

    case 'reset_quota':
      const { quotaEmail } = await inquirer.prompt([
        {
          type: 'input',
          name: 'quotaEmail',
          message: 'User email:',
          validate: input => input.includes('@') || 'Please enter a valid email'
        }
      ]);
      await resetUserQuota(quotaEmail);
      break;

    case 'cancel':
      const cancelData = await inquirer.prompt([
        {
          type: 'input',
          name: 'email',
          message: 'User email:',
          validate: input => input.includes('@') || 'Please enter a valid email'
        },
        {
          type: 'input',
          name: 'reason',
          message: 'Cancellation reason:',
          validate: input => input.trim() !== '' || 'Reason is required'
        }
      ]);
      await cancelSubscription(cancelData.email, cancelData.reason);
      break;

    case 'export':
      const { exportEmail } = await inquirer.prompt([
        {
          type: 'input',
          name: 'exportEmail',
          message: 'User email:',
          validate: input => input.includes('@') || 'Please enter a valid email'
        }
      ]);
      await exportUserData(exportEmail);
      break;
  }

  return action !== 'back';
}