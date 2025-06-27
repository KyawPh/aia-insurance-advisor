import inquirer from 'inquirer';
import chalk from 'chalk';
import Table from 'cli-table3';
import { db, formatDate } from './firebase-admin-init.js';

/**
 * List all users with their subscription and usage details
 */
async function listUsers(options = {}) {
  try {
    const { 
      planFilter = 'all', 
      sortBy = 'recent',
      limit = 50,
      showInactive = false 
    } = options;
    
    console.log(chalk.yellow('Fetching users...'));
    
    // Build query
    let query = db.collection('users');
    
    // Apply plan filter
    if (planFilter === 'free') {
      query = query.where('subscription.plan', '==', 'free');
    } else if (planFilter === 'unlimited') {
      query = query.where('subscription.plan', '==', 'unlimited');
    }
    
    // Apply active filter if not showing inactive
    if (!showInactive) {
      query = query.where('subscription.isActive', '==', true);
    }
    
    // Apply sorting
    if (sortBy === 'recent') {
      query = query.orderBy('lastLogin', 'desc');
    } else if (sortBy === 'created') {
      query = query.orderBy('createdAt', 'desc');
    } else if (sortBy === 'usage') {
      query = query.orderBy('subscription.quotaUsed', 'desc');
    }
    
    // Apply limit
    query = query.limit(limit);
    
    const snapshot = await query.get();
    
    if (snapshot.empty) {
      console.log(chalk.yellow('No users found matching the criteria.'));
      return;
    }
    
    // Create table
    const table = new Table({
      head: [
        chalk.cyan('#'),
        chalk.cyan('Email'),
        chalk.cyan('Name'),
        chalk.cyan('Plan'),
        chalk.cyan('Status'),
        chalk.cyan('Usage'),
        chalk.cyan('Last Login'),
        chalk.cyan('Created')
      ],
      colWidths: [4, 30, 20, 10, 12, 12, 18, 18],
      wordWrap: true
    });
    
    // Collect user data
    const users = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      const sub = data.subscription || {};
      
      users.push({
        id: doc.id,
        email: data.email || 'N/A',
        fullName: data.fullName || data.displayName || 'N/A',
        plan: sub.plan || 'free',
        billingPeriod: sub.billingPeriod || 'trial',
        isActive: sub.isActive !== false,
        isInGracePeriod: sub.isInGracePeriod || false,
        quotaUsed: sub.quotaUsed || 0,
        quotaLimit: sub.quotaLimit || 50,
        subscriptionEnd: sub.subscriptionEnd,
        lastLogin: data.lastLogin,
        createdAt: data.createdAt
      });
    });
    
    // Add users to table
    users.forEach((user, index) => {
      let status = '';
      let statusColor = chalk.white;
      
      if (user.plan === 'unlimited') {
        if (user.isInGracePeriod) {
          status = 'Grace Period';
          statusColor = chalk.yellow;
        } else if (user.isActive) {
          status = 'Active';
          statusColor = chalk.green;
        } else {
          status = 'Expired';
          statusColor = chalk.red;
        }
        
        if (user.subscriptionEnd) {
          const endDate = user.subscriptionEnd.toDate();
          const daysLeft = Math.ceil((endDate - new Date()) / (1000 * 60 * 60 * 24));
          if (daysLeft > 0 && user.isActive) {
            status += ` (${daysLeft}d)`;
          }
        }
      } else {
        status = 'Free Trial';
        statusColor = chalk.blue;
      }
      
      // Format usage
      let usage = '';
      if (user.plan === 'free') {
        usage = `${user.quotaUsed}/${user.quotaLimit}`;
        if (user.quotaLimit > 0) {
          const percentage = Math.round((user.quotaUsed / user.quotaLimit) * 100);
          usage += ` (${percentage}%)`;
        }
      } else if (user.plan === 'unlimited' && user.isActive && !user.isInGracePeriod) {
        usage = '∞ Unlimited';
      } else if (user.isInGracePeriod) {
        usage = '5/day';
      } else {
        usage = 'N/A';
      }
      
      // Format plan display
      let planDisplay = user.plan === 'unlimited' ? 'Unlimited' : 'Free';
      if (user.plan === 'unlimited' && user.billingPeriod) {
        const periodMap = {
          'monthly': 'M',
          '6months': '6M',
          '12months': '12M'
        };
        planDisplay += ` (${periodMap[user.billingPeriod] || user.billingPeriod})`;
      }
      
      table.push([
        chalk.gray(index + 1),
        user.email,
        user.fullName,
        planDisplay,
        statusColor(status),
        usage,
        user.lastLogin ? formatDate(user.lastLogin.toDate()) : 'Never',
        user.createdAt ? formatDate(user.createdAt.toDate()) : 'N/A'
      ]);
    });
    
    console.log(table.toString());
    
    // Summary statistics
    const totalUsers = users.length;
    const freeUsers = users.filter(u => u.plan === 'free').length;
    const unlimitedUsers = users.filter(u => u.plan === 'unlimited').length;
    const activeUnlimited = users.filter(u => u.plan === 'unlimited' && u.isActive && !u.isInGracePeriod).length;
    const gracePeriodUsers = users.filter(u => u.isInGracePeriod).length;
    const totalQuotaUsed = users.filter(u => u.plan === 'free').reduce((sum, u) => sum + u.quotaUsed, 0);
    
    console.log(chalk.blue('\n═══════════════════════════════════════════════'));
    console.log(chalk.blue.bold('Summary:'));
    console.log(chalk.white(`Total Users Shown: ${totalUsers} ${limit < snapshot.size ? `(limited to ${limit})` : ''}`));
    console.log(chalk.white(`Free Trial: ${freeUsers}`));
    console.log(chalk.white(`Unlimited: ${unlimitedUsers} (${activeUnlimited} active, ${gracePeriodUsers} grace period)`));
    if (freeUsers > 0) {
      console.log(chalk.white(`Total Quotes Used (Free): ${totalQuotaUsed}`));
    }
    console.log(chalk.blue('═══════════════════════════════════════════════'));
    
    return users;
    
  } catch (error) {
    console.error(chalk.red('Error listing users:'), error);
    return [];
  }
}

/**
 * Export users to CSV
 */
async function exportToCSV(users) {
  try {
    const { filename } = await inquirer.prompt([
      {
        type: 'input',
        name: 'filename',
        message: 'Enter filename for CSV export:',
        default: `users_export_${Date.now()}.csv`
      }
    ]);
    
    // Create CSV content
    const headers = ['Email', 'Name', 'Plan', 'Billing Period', 'Status', 'Quota Used', 'Quota Limit', 'Last Login', 'Created', 'Subscription End'];
    const rows = users.map(user => [
      user.email,
      user.fullName,
      user.plan,
      user.billingPeriod,
      user.isActive ? 'Active' : 'Inactive',
      user.quotaUsed,
      user.quotaLimit,
      user.lastLogin ? user.lastLogin.toDate().toISOString() : '',
      user.createdAt ? user.createdAt.toDate().toISOString() : '',
      user.subscriptionEnd ? user.subscriptionEnd.toDate().toISOString() : ''
    ]);
    
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');
    
    // Write to file
    const fs = await import('fs');
    fs.writeFileSync(filename, csvContent);
    
    console.log(chalk.green(`✓ Exported ${users.length} users to ${filename}`));
    
  } catch (error) {
    console.error(chalk.red('Error exporting to CSV:'), error);
  }
}

// Main interactive function
async function main() {
  console.log(chalk.blue('═══════════════════════════════════════════════'));
  console.log(chalk.blue.bold('    List All Users'));
  console.log(chalk.blue('═══════════════════════════════════════════════'));
  console.log();
  
  const { options } = await inquirer.prompt([
    {
      type: 'checkbox',
      name: 'options',
      message: 'Select options:',
      choices: [
        { name: 'Show inactive users', value: 'showInactive' },
        { name: 'Export to CSV', value: 'export' }
      ]
    }
  ]);
  
  const { planFilter } = await inquirer.prompt([
    {
      type: 'list',
      name: 'planFilter',
      message: 'Filter by plan:',
      choices: [
        { name: 'All plans', value: 'all' },
        { name: 'Free trial only', value: 'free' },
        { name: 'Unlimited only', value: 'unlimited' }
      ]
    }
  ]);
  
  const { sortBy } = await inquirer.prompt([
    {
      type: 'list',
      name: 'sortBy',
      message: 'Sort by:',
      choices: [
        { name: 'Last login (most recent first)', value: 'recent' },
        { name: 'Creation date (newest first)', value: 'created' },
        { name: 'Quota usage (highest first)', value: 'usage' }
      ]
    }
  ]);
  
  const { limit } = await inquirer.prompt([
    {
      type: 'list',
      name: 'limit',
      message: 'Number of users to display:',
      choices: [
        { name: '25 users', value: 25 },
        { name: '50 users', value: 50 },
        { name: '100 users', value: 100 },
        { name: '200 users', value: 200 },
        { name: 'All users', value: 1000 }
      ],
      default: 50
    }
  ]);
  
  console.log();
  
  const users = await listUsers({
    planFilter,
    sortBy,
    limit,
    showInactive: options.includes('showInactive')
  });
  
  if (options.includes('export') && users.length > 0) {
    console.log();
    await exportToCSV(users);
  }
}

// Run the script
console.log(chalk.blue('Firebase Admin SDK initialized successfully'));
main().catch(error => {
  console.error(chalk.red('Fatal error:'), error);
  process.exit(1);
});