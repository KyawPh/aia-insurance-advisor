import chalk from 'chalk';

console.log(chalk.blue('═══════════════════════════════════════════════════════════════'));
console.log(chalk.blue.bold('    AIA Insurance Advisor - Admin Scripts Help'));
console.log(chalk.blue('═══════════════════════════════════════════════════════════════'));
console.log();

console.log(chalk.cyan.bold('Main Admin Tool:'));
console.log(chalk.white('  npm run admin         ') + chalk.gray('- Main admin console for managing subscriptions'));
console.log(chalk.white('  npm run list-users    ') + chalk.gray('- List all users with filters and export options'));
console.log();

console.log(chalk.cyan.bold('One-Time Fix Scripts:'));
console.log(chalk.white('  npm run update-quota  ') + chalk.gray('- Update all free users to 50 quota limit'));
console.log(chalk.white('  npm run fix-quota     ') + chalk.gray('- Fix quota for a specific user'));
console.log(chalk.white('  npm run recalculate   ') + chalk.gray('- Recalculate subscription from payment history'));
console.log();

console.log(chalk.cyan.bold('Other Commands:'));
console.log(chalk.white('  npm run setup         ') + chalk.gray('- Initial setup for admin scripts'));
console.log(chalk.white('  npm run test          ') + chalk.gray('- Test Firebase connection'));
console.log();

console.log(chalk.yellow.bold('Core Admin Functions (available in admin menu):'));
console.log(chalk.gray('  • Process upgrade requests'));
console.log(chalk.gray('  • View user subscriptions'));
console.log(chalk.gray('  • List all users'));
console.log(chalk.gray('  • View statistics and revenue'));
console.log(chalk.gray('  • Create manual subscriptions'));
console.log(chalk.gray('  • Extend subscriptions'));
console.log(chalk.gray('  • Reset user quotas'));
console.log(chalk.gray('  • Cancel subscriptions'));
console.log(chalk.gray('  • Export user data'));
console.log();

console.log(chalk.green('For detailed documentation, see scripts/README.md'));
console.log(chalk.blue('═══════════════════════════════════════════════════════════════'));