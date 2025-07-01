#!/usr/bin/env node

/**
 * Verify that admin-utils.js functions are aligned with current user schema
 * This script checks that no removed fields are referenced
 */

import { readFileSync } from 'fs';
import chalk from 'chalk';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Fields that have been removed from user documents
const REMOVED_FIELDS = [
  'isInGracePeriod',
  'gracePeriodEnd',
  'dailyQuotaUsed',
  'dailyQuotaLimit',
  'lastPaymentReference',
  'lastPaymentAmount',
  'lastPaymentDate'
];

// Current valid subscription fields
const VALID_SUBSCRIPTION_FIELDS = [
  'plan',
  'billingPeriod',
  'quotaLimit',
  'quotaUsed',
  'lastResetDate',
  'isActive',
  'subscriptionStart',
  'subscriptionEnd',
  'autoRenew'
];

function checkFile(filePath) {
  console.log(chalk.blue(`\nChecking ${filePath}...`));
  
  try {
    const content = readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    let issuesFound = 0;
    
    lines.forEach((line, index) => {
      // Check for removed fields
      REMOVED_FIELDS.forEach(field => {
        if (line.includes(`'subscription.${field}'`) || line.includes(`"subscription.${field}"`)) {
          console.log(chalk.red(`❌ Line ${index + 1}: References removed field 'subscription.${field}'`));
          console.log(chalk.gray(`   ${line.trim()}`));
          issuesFound++;
        }
      });
      
      // Check for direct assignment of removed fields
      REMOVED_FIELDS.forEach(field => {
        if (line.includes(`${field}:`) && line.includes('subscription')) {
          console.log(chalk.yellow(`⚠️  Line ${index + 1}: Possible reference to removed field '${field}'`));
          console.log(chalk.gray(`   ${line.trim()}`));
        }
      });
    });
    
    if (issuesFound === 0) {
      console.log(chalk.green('✅ No references to removed fields found!'));
    } else {
      console.log(chalk.red(`\n❌ Found ${issuesFound} references to removed fields`));
    }
    
    // Check for proper field usage
    console.log(chalk.blue('\nChecking for proper field usage...'));
    
    // Check if lastResetDate is used when resetting quota
    if (content.includes('quotaUsed') && !content.includes('lastResetDate')) {
      console.log(chalk.yellow('⚠️  Warning: quotaUsed is updated without updating lastResetDate'));
    }
    
    // Check for isActive logic
    const isActiveUpdates = content.match(/['"]subscription\.isActive['"]\s*:\s*true/g);
    if (isActiveUpdates) {
      console.log(chalk.yellow(`⚠️  Found ${isActiveUpdates.length} places where isActive is set to true`));
      console.log(chalk.gray('   Make sure to check subscription expiry before setting isActive'));
    }
    
  } catch (error) {
    console.error(chalk.red('Error reading file:'), error.message);
  }
}

// Main execution
console.log(chalk.blue.bold('Admin Utils Alignment Verification'));
console.log(chalk.gray('Checking for references to removed fields...\n'));

// Check admin-utils.js
checkFile(join(__dirname, 'admin-utils.js'));

// Also check manage-upgrades.js since it uses admin-utils
checkFile(join(__dirname, 'manage-upgrades.js'));

console.log(chalk.blue('\n\nValid subscription fields for reference:'));
VALID_SUBSCRIPTION_FIELDS.forEach(field => {
  console.log(chalk.green(`  ✓ subscription.${field}`));
});

console.log(chalk.blue('\n\nRemoved fields (do not use):'));
REMOVED_FIELDS.forEach(field => {
  console.log(chalk.red(`  ✗ subscription.${field}`));
});

console.log(chalk.gray('\nVerification complete.\n'));