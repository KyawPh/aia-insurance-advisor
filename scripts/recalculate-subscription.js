import inquirer from 'inquirer';
import chalk from 'chalk';
import { db, formatDate, formatCurrency, BILLING_PERIODS } from './firebase-admin-init.js';

/**
 * Recalculate subscription for users with multiple payments
 * This is useful when a user has made multiple payments but their subscription end date is incorrect
 */
async function recalculateSubscription() {
  try {
    const { email } = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter user email to recalculate subscription:',
        validate: input => input.includes('@') || 'Please enter a valid email'
      }
    ]);
    
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
    const userData = userDoc.data();
    
    console.log(chalk.cyan('\nCurrent subscription info:'));
    console.log(chalk.white(`Plan: ${userData.subscription?.plan || 'not set'}`));
    if (userData.subscription?.subscriptionEnd) {
      console.log(chalk.white(`Current end date: ${formatDate(userData.subscription.subscriptionEnd)}`));
    }
    
    // Get all completed payments for this user, ordered by creation date
    const paymentsSnapshot = await db.collection('payments')
      .where('userId', '==', userId)
      .where('status', '==', 'completed')
      .orderBy('createdAt', 'asc')
      .get();
    
    if (paymentsSnapshot.empty) {
      console.log(chalk.yellow('\nNo completed payments found for this user'));
      return;
    }
    
    console.log(chalk.blue(`\nFound ${paymentsSnapshot.size} completed payments:`));
    console.log(chalk.gray('─'.repeat(80)));
    
    let totalMonths = 0;
    let firstPaymentDate = null;
    let paymentDetails = [];
    
    paymentsSnapshot.docs.forEach((doc, index) => {
      const payment = doc.data();
      const billingPeriod = BILLING_PERIODS[payment.billingPeriod];
      
      if (index === 0) {
        firstPaymentDate = payment.createdAt.toDate();
      }
      
      const months = billingPeriod?.months || 0;
      totalMonths += months;
      
      const paymentInfo = {
        date: formatDate(payment.createdAt.toDate()),
        plan: billingPeriod?.label || payment.billingPeriod,
        amount: formatCurrency(payment.amount),
        months: months,
        reference: payment.paymentReference || 'N/A'
      };
      
      paymentDetails.push(paymentInfo);
      
      console.log(chalk.white(`${index + 1}. ${paymentInfo.date} - ${paymentInfo.plan} (${paymentInfo.months} months) - ${paymentInfo.amount}`));
      console.log(chalk.gray(`   Payment Ref: ${paymentInfo.reference}`));
    });
    
    console.log(chalk.gray('─'.repeat(80)));
    console.log(chalk.yellow(`\nTotal subscription duration: ${totalMonths} months`));
    
    if (!firstPaymentDate) {
      console.log(chalk.red('Error: Could not determine first payment date'));
      return;
    }
    
    // Calculate the correct end date from the first payment
    const correctEndDate = new Date(firstPaymentDate);
    correctEndDate.setMonth(correctEndDate.getMonth() + totalMonths);
    
    console.log(chalk.cyan('\nCalculated subscription dates:'));
    console.log(chalk.white(`Start date: ${formatDate(firstPaymentDate)}`));
    console.log(chalk.white(`End date: ${formatDate(correctEndDate)}`));
    
    // Compare with current end date
    if (userData.subscription?.subscriptionEnd) {
      const currentEnd = userData.subscription.subscriptionEnd.toDate();
      const diff = correctEndDate.getTime() - currentEnd.getTime();
      const diffDays = Math.round(diff / (1000 * 60 * 60 * 24));
      
      if (diffDays === 0) {
        console.log(chalk.green('\n✓ Subscription end date is already correct!'));
        return;
      } else if (diffDays > 0) {
        console.log(chalk.yellow(`\nSubscription should be extended by ${diffDays} days`));
      } else {
        console.log(chalk.yellow(`\nSubscription is ${Math.abs(diffDays)} days longer than calculated`));
      }
    }
    
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
      'subscription.subscriptionStart': firstPaymentDate,
      'subscription.isActive': true,
      'subscription.plan': 'unlimited',
      'lastActivity': new Date()
    });
    
    console.log(chalk.green('\n✓ Subscription dates updated successfully!'));
    
    // Show summary
    console.log(chalk.blue('\nSubscription Summary:'));
    console.log(chalk.white(`User: ${email}`));
    console.log(chalk.white(`Total payments: ${paymentsSnapshot.size}`));
    console.log(chalk.white(`Total duration: ${totalMonths} months`));
    console.log(chalk.white(`Start date: ${formatDate(firstPaymentDate)}`));
    console.log(chalk.white(`End date: ${formatDate(correctEndDate)}`));
    
    // Check if subscription is currently active
    const now = new Date();
    if (correctEndDate > now) {
      const remainingDays = Math.ceil((correctEndDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
      console.log(chalk.green(`\nSubscription is ACTIVE with ${remainingDays} days remaining`));
    } else {
      const expiredDays = Math.ceil((now.getTime() - correctEndDate.getTime()) / (1000 * 60 * 60 * 24));
      console.log(chalk.red(`\nSubscription EXPIRED ${expiredDays} days ago`));
    }
    
  } catch (error) {
    console.error(chalk.red('Error recalculating subscription:'), error);
  }
}

// Main function
async function main() {
  console.log(chalk.blue('═══════════════════════════════════════════════'));
  console.log(chalk.blue.bold('    Recalculate User Subscription'));
  console.log(chalk.blue('    Fix subscription dates from payments'));
  console.log(chalk.blue('═══════════════════════════════════════════════'));
  console.log();
  
  await recalculateSubscription();
  
  const { another } = await inquirer.prompt([
    {
      type: 'confirm',
      name: 'another',
      message: 'Recalculate another user?',
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