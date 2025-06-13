import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import { 
  db, 
  auth,
  BILLING_PERIODS,
  SUBSCRIPTION_PRICES,
  calculateSubscriptionEndDate,
  formatDate,
  formatCurrency
} from './firebase-admin-init.js';
import { runUtilityMenu } from './admin-utils.js';

// Admin email from environment
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || 'admin@aia-insurance.com';

// Main menu options
const MAIN_MENU_CHOICES = {
  LIST_PENDING: 'List pending upgrade requests',
  LIST_ALL: 'List all upgrade requests',
  PROCESS_REQUEST: 'Process an upgrade request',
  VIEW_USER: 'View user subscription details',
  STATS: 'View upgrade statistics',
  UTILITIES: 'Admin utilities',
  EXIT: 'Exit'
};

// Display banner
function displayBanner() {
  console.clear();
  console.log(chalk.blue('═══════════════════════════════════════════════'));
  console.log(chalk.blue.bold('    AIA Insurance Advisor - Admin Console'));
  console.log(chalk.blue('           Upgrade Request Management'));
  console.log(chalk.blue('═══════════════════════════════════════════════'));
  console.log();
}

// List upgrade requests
async function listUpgradeRequests(status = null) {
  try {
    let query = db.collection('upgradeRequests');
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    query = query.orderBy('createdAt', 'desc').limit(20);
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      console.log(chalk.yellow('No upgrade requests found.'));
      return;
    }
    
    const table = new Table({
      head: [
        chalk.cyan('ID'),
        chalk.cyan('User'),
        chalk.cyan('Email'),
        chalk.cyan('Plan'),
        chalk.cyan('Amount'),
        chalk.cyan('Payment'),
        chalk.cyan('Status'),
        chalk.cyan('Created')
      ],
      colWidths: [15, 20, 30, 10, 12, 12, 12, 20]
    });
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const statusColor = getStatusColor(data.status);
      
      table.push([
        doc.id.substring(0, 12) + '...',
        data.userName || 'N/A',
        data.userEmail,
        BILLING_PERIODS[data.billingPeriod]?.label || data.billingPeriod,
        formatCurrency(data.amount),
        data.paymentMethod,
        statusColor(data.status),
        formatDate(data.createdAt)
      ]);
    });
    
    console.log(table.toString());
    console.log(chalk.gray(`\nShowing ${snapshot.size} requests`));
    
  } catch (error) {
    console.error(chalk.red('Error listing upgrade requests:'), error);
  }
}

// Get status color
function getStatusColor(status) {
  switch (status) {
    case 'pending':
      return chalk.yellow;
    case 'processing':
      return chalk.blue;
    case 'completed':
      return chalk.green;
    case 'rejected':
      return chalk.red;
    default:
      return chalk.white;
  }
}

// Process upgrade request
async function processUpgradeRequest() {
  try {
    // Get pending requests
    const pendingSnapshot = await db.collection('upgradeRequests')
      .where('status', '==', 'pending')
      .orderBy('createdAt', 'asc')
      .get();
    
    if (pendingSnapshot.empty) {
      console.log(chalk.yellow('No pending upgrade requests found.'));
      return;
    }
    
    // Prepare choices for selection
    const choices = pendingSnapshot.docs.map(doc => {
      const data = doc.data();
      return {
        name: `${data.userName} (${data.userEmail}) - ${BILLING_PERIODS[data.billingPeriod]?.label} - ${formatCurrency(data.amount)}`,
        value: doc.id
      };
    });
    
    // Select request to process
    const { requestId } = await inquirer.prompt([
      {
        type: 'list',
        name: 'requestId',
        message: 'Select upgrade request to process:',
        choices
      }
    ]);
    
    // Get the selected request
    const requestDoc = await db.collection('upgradeRequests').doc(requestId).get();
    const requestData = requestDoc.data();
    
    // Display request details
    console.log(chalk.cyan('\nUpgrade Request Details:'));
    console.log(chalk.white(`User: ${requestData.userName} (${requestData.userEmail})`));
    console.log(chalk.white(`Plan: ${BILLING_PERIODS[requestData.billingPeriod]?.label}`));
    console.log(chalk.white(`Amount: ${formatCurrency(requestData.amount)}`));
    console.log(chalk.white(`Payment Method: ${requestData.paymentMethod}`));
    if (requestData.phoneNumber) {
      console.log(chalk.white(`Phone: ${requestData.phoneNumber}`));
    }
    if (requestData.notes) {
      console.log(chalk.white(`Notes: ${requestData.notes}`));
    }
    console.log(chalk.white(`Created: ${formatDate(requestData.createdAt)}`));
    
    // Action selection
    const { action } = await inquirer.prompt([
      {
        type: 'list',
        name: 'action',
        message: 'What would you like to do?',
        choices: [
          { name: 'Approve and activate subscription', value: 'approve' },
          { name: 'Reject request', value: 'reject' },
          { name: 'Cancel', value: 'cancel' }
        ]
      }
    ]);
    
    if (action === 'cancel') {
      console.log(chalk.gray('Operation cancelled.'));
      return;
    }
    
    if (action === 'approve') {
      await approveUpgradeRequest(requestId, requestData);
    } else if (action === 'reject') {
      await rejectUpgradeRequest(requestId, requestData);
    }
    
  } catch (error) {
    console.error(chalk.red('Error processing upgrade request:'), error);
  }
}

// Approve upgrade request
async function approveUpgradeRequest(requestId, requestData) {
  try {
    // Get payment reference
    const { paymentReference } = await inquirer.prompt([
      {
        type: 'input',
        name: 'paymentReference',
        message: 'Enter payment reference/transaction ID:',
        validate: input => input.trim() !== '' || 'Payment reference is required'
      }
    ]);
    
    const now = new Date();
    
    // Get current user data to check existing subscription
    const userDoc = await db.collection('users').doc(requestData.userId).get();
    const userData = userDoc.data();
    const currentSubscription = userData?.subscription;
    
    let subscriptionStart = now;
    let subscriptionEnd;
    
    // If user has an active subscription, extend from the current end date
    if (currentSubscription?.subscriptionEnd && currentSubscription.isActive) {
      const currentEnd = currentSubscription.subscriptionEnd.toDate();
      // If current subscription hasn't expired yet, extend from that date
      if (currentEnd > now) {
        subscriptionStart = currentEnd; // New subscription starts when current one ends
        subscriptionEnd = calculateSubscriptionEndDate(currentEnd, requestData.billingPeriod);
      } else {
        // If expired, start from now
        subscriptionEnd = calculateSubscriptionEndDate(now, requestData.billingPeriod);
      }
    } else {
      // No active subscription, start from now
      subscriptionEnd = calculateSubscriptionEndDate(now, requestData.billingPeriod);
    }
    
    // Start a batch write
    const batch = db.batch();
    
    // Update user subscription
    const userRef = db.collection('users').doc(requestData.userId);
    const subscriptionUpdate = {
      'subscription.plan': 'unlimited',
      'subscription.billingPeriod': requestData.billingPeriod,
      'subscription.isActive': true,
      'subscription.autoRenew': requestData.billingPeriod === 'monthly',
      'subscription.isInGracePeriod': false,
      'subscription.gracePeriodEnd': null,
      'subscription.paymentMethod': requestData.paymentMethod,
      'subscription.quotaUsed': 0,
      'subscription.dailyQuotaUsed': 0,
      'subscription.lastPaymentReference': paymentReference,
      'subscription.lastPaymentAmount': requestData.amount,
      'subscription.lastPaymentDate': now,
      'lastActivity': now
    };
    
    // Only update subscription dates if extending or starting new
    if (!currentSubscription?.isActive || subscriptionStart.getTime() === now.getTime()) {
      subscriptionUpdate['subscription.subscriptionStart'] = now;
    }
    subscriptionUpdate['subscription.subscriptionEnd'] = subscriptionEnd;
    
    batch.update(userRef, subscriptionUpdate);
    
    // Update upgrade request
    const requestRef = db.collection('upgradeRequests').doc(requestId);
    batch.update(requestRef, {
      status: 'completed',
      paymentReference,
      processedAt: now,
      processedBy: ADMIN_EMAIL,
      updatedAt: now
    });
    
    // Create payment record
    const paymentRef = db.collection('payments').doc();
    batch.set(paymentRef, {
      userId: requestData.userId,
      userEmail: requestData.userEmail,
      userName: requestData.userName,
      amount: requestData.amount,
      currency: 'MMK',
      paymentMethod: requestData.paymentMethod,
      paymentReference,
      billingPeriod: requestData.billingPeriod,
      subscriptionStart: subscriptionStart,
      subscriptionEnd,
      status: 'completed',
      upgradeRequestId: requestId,
      processedBy: ADMIN_EMAIL,
      createdAt: now,
      isExtension: currentSubscription?.isActive && currentSubscription.subscriptionEnd?.toDate() > now
    });
    
    // Commit the batch
    await batch.commit();
    
    console.log(chalk.green('\n✓ Upgrade request approved successfully!'));
    if (currentSubscription?.isActive && currentSubscription.subscriptionEnd?.toDate() > now) {
      console.log(chalk.yellow(`Extended subscription from: ${formatDate(currentSubscription.subscriptionEnd.toDate())}`));
    }
    console.log(chalk.white(`Subscription now active until: ${formatDate(subscriptionEnd)}`));
    
    // Send notification (optional - you can implement email notification here)
    console.log(chalk.gray('Note: User will be notified via email (not implemented in this demo)'));
    
  } catch (error) {
    console.error(chalk.red('Error approving upgrade request:'), error);
  }
}

// Reject upgrade request
async function rejectUpgradeRequest(requestId, requestData) {
  try {
    // Get rejection reason
    const { reason } = await inquirer.prompt([
      {
        type: 'input',
        name: 'reason',
        message: 'Enter rejection reason:',
        validate: input => input.trim() !== '' || 'Rejection reason is required'
      }
    ]);
    
    const now = new Date();
    
    // Update upgrade request
    await db.collection('upgradeRequests').doc(requestId).update({
      status: 'rejected',
      rejectionReason: reason,
      processedAt: now,
      processedBy: ADMIN_EMAIL,
      updatedAt: now
    });
    
    console.log(chalk.yellow('\n✓ Upgrade request rejected.'));
    console.log(chalk.gray('Note: User will be notified via email (not implemented in this demo)'));
    
  } catch (error) {
    console.error(chalk.red('Error rejecting upgrade request:'), error);
  }
}

// View user subscription details
async function viewUserSubscription() {
  try {
    const { email } = await inquirer.prompt([
      {
        type: 'input',
        name: 'email',
        message: 'Enter user email:',
        validate: input => input.includes('@') || 'Please enter a valid email'
      }
    ]);
    
    // Get user by email
    const userRecord = await auth.getUserByEmail(email).catch(() => null);
    
    if (!userRecord) {
      console.log(chalk.yellow('User not found in Auth.'));
      return;
    }
    
    // Get user document
    const userDoc = await db.collection('users').doc(userRecord.uid).get();
    
    if (!userDoc.exists) {
      console.log(chalk.yellow('User subscription data not found.'));
      return;
    }
    
    const userData = userDoc.data();
    const sub = userData.subscription || {};
    
    console.log(chalk.cyan('\nUser Subscription Details:'));
    console.log(chalk.white(`Email: ${email}`));
    console.log(chalk.white(`User ID: ${userRecord.uid}`));
    console.log(chalk.white(`Plan: ${sub.plan || 'free'}`));
    console.log(chalk.white(`Billing Period: ${sub.billingPeriod || 'trial'}`));
    console.log(chalk.white(`Status: ${sub.isActive ? chalk.green('Active') : chalk.red('Inactive')}`));
    
    if (sub.subscriptionStart) {
      console.log(chalk.white(`Start Date: ${formatDate(sub.subscriptionStart)}`));
    }
    if (sub.subscriptionEnd) {
      console.log(chalk.white(`End Date: ${formatDate(sub.subscriptionEnd)}`));
    }
    
    if (sub.plan === 'free') {
      console.log(chalk.white(`Quota Used: ${sub.quotaUsed || 0}/${sub.quotaLimit || 5}`));
    } else if (sub.isInGracePeriod) {
      console.log(chalk.yellow('In Grace Period'));
      console.log(chalk.white(`Grace Period Ends: ${formatDate(sub.gracePeriodEnd)}`));
      console.log(chalk.white(`Daily Quota: ${sub.dailyQuotaUsed || 0}/${sub.dailyQuotaLimit || 5}`));
    }
    
    // Show recent upgrade requests
    const recentRequests = await db.collection('upgradeRequests')
      .where('userId', '==', userRecord.uid)
      .orderBy('createdAt', 'desc')
      .limit(5)
      .get();
    
    if (!recentRequests.empty) {
      console.log(chalk.cyan('\nRecent Upgrade Requests:'));
      const table = new Table({
        head: [chalk.cyan('Date'), chalk.cyan('Plan'), chalk.cyan('Status')],
        colWidths: [25, 15, 15]
      });
      
      recentRequests.forEach(doc => {
        const data = doc.data();
        const statusColor = getStatusColor(data.status);
        table.push([
          formatDate(data.createdAt),
          BILLING_PERIODS[data.billingPeriod]?.label || data.billingPeriod,
          statusColor(data.status)
        ]);
      });
      
      console.log(table.toString());
    }
    
  } catch (error) {
    console.error(chalk.red('Error viewing user subscription:'), error);
  }
}

// View statistics
async function viewStatistics() {
  try {
    console.log(chalk.cyan('\nUpgrade Request Statistics:'));
    
    // Get counts by status
    const statuses = ['pending', 'processing', 'completed', 'rejected'];
    const counts = {};
    
    for (const status of statuses) {
      const snapshot = await db.collection('upgradeRequests')
        .where('status', '==', status)
        .get();
      counts[status] = snapshot.size;
    }
    
    // Display status counts
    const statusTable = new Table({
      head: [chalk.cyan('Status'), chalk.cyan('Count')],
      colWidths: [20, 10]
    });
    
    for (const [status, count] of Object.entries(counts)) {
      const statusColor = getStatusColor(status);
      statusTable.push([statusColor(status), count]);
    }
    
    console.log(statusTable.toString());
    
    // Get revenue statistics
    const completedSnapshot = await db.collection('upgradeRequests')
      .where('status', '==', 'completed')
      .get();
    
    let totalRevenue = 0;
    const revenueByPeriod = {};
    
    completedSnapshot.forEach(doc => {
      const data = doc.data();
      totalRevenue += data.amount;
      
      const period = BILLING_PERIODS[data.billingPeriod]?.label || data.billingPeriod;
      revenueByPeriod[period] = (revenueByPeriod[period] || 0) + data.amount;
    });
    
    console.log(chalk.cyan('\nRevenue Summary:'));
    console.log(chalk.white(`Total Revenue: ${formatCurrency(totalRevenue)}`));
    
    if (Object.keys(revenueByPeriod).length > 0) {
      const revenueTable = new Table({
        head: [chalk.cyan('Billing Period'), chalk.cyan('Revenue')],
        colWidths: [20, 20]
      });
      
      for (const [period, revenue] of Object.entries(revenueByPeriod)) {
        revenueTable.push([period, formatCurrency(revenue)]);
      }
      
      console.log(revenueTable.toString());
    }
    
    // Get active subscriptions count
    const activeSubsSnapshot = await db.collection('users')
      .where('subscription.plan', '==', 'unlimited')
      .where('subscription.isActive', '==', true)
      .get();
    
    console.log(chalk.cyan('\nActive Subscriptions:'));
    console.log(chalk.white(`Total Active: ${activeSubsSnapshot.size}`));
    
  } catch (error) {
    console.error(chalk.red('Error viewing statistics:'), error);
  }
}

// Main menu
async function mainMenu() {
  while (true) {
    displayBanner();
    
    const { choice } = await inquirer.prompt([
      {
        type: 'list',
        name: 'choice',
        message: 'What would you like to do?',
        choices: Object.values(MAIN_MENU_CHOICES)
      }
    ]);
    
    console.log();
    
    switch (choice) {
      case MAIN_MENU_CHOICES.LIST_PENDING:
        await listUpgradeRequests('pending');
        break;
        
      case MAIN_MENU_CHOICES.LIST_ALL:
        await listUpgradeRequests();
        break;
        
      case MAIN_MENU_CHOICES.PROCESS_REQUEST:
        await processUpgradeRequest();
        break;
        
      case MAIN_MENU_CHOICES.VIEW_USER:
        await viewUserSubscription();
        break;
        
      case MAIN_MENU_CHOICES.STATS:
        await viewStatistics();
        break;
        
      case MAIN_MENU_CHOICES.UTILITIES:
        const continueUtilities = await runUtilityMenu();
        if (!continueUtilities) continue;
        break;
        
      case MAIN_MENU_CHOICES.EXIT:
        console.log(chalk.blue('Goodbye!'));
        process.exit(0);
    }
    
    // Pause before returning to menu
    await inquirer.prompt([
      {
        type: 'input',
        name: 'continue',
        message: '\nPress Enter to continue...'
      }
    ]);
  }
}

// Start the application
(async () => {
  try {
    displayBanner();
    console.log(chalk.gray(`Admin: ${ADMIN_EMAIL}`));
    console.log(chalk.gray(`Project: ${process.env.FIREBASE_PROJECT_ID}`));
    console.log();
    
    await mainMenu();
  } catch (error) {
    console.error(chalk.red('Fatal error:'), error);
    process.exit(1);
  }
})();