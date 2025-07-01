# Scripts Cleanup - Focus on Subscription Management

## Core Subscription Management Scripts (KEEP - 7 scripts)
These are essential for managing user subscriptions:

1. **manage-upgrades.js** - Main admin console for subscriptions ⭐
2. **list-users.js** - View users and their subscription status ⭐
3. **fix-user-quota.js** - Fix individual user subscription issues
4. **update-free-quota.js** - Bulk update subscription quotas
5. **recalculate-subscription.js** - Fix subscription dates for multi-payments
6. **admin-utils.js** - Core subscription utility functions ⭐
7. **firebase-admin-init.js** - Foundation for all scripts ⭐

## Scripts NOT Related to Subscription Management (29 - 7 = 22 scripts)

### Testing/Debug Scripts (6)
Not needed for production subscription management:
- `test-api-route.js` - API testing
- `test-connection.js` - Connection testing
- `test-subscription.js` - Subscription testing
- `test-telegram.js` - Telegram testing
- `verify-admin-utils.js` - Our alignment verification
- `help.js` - Basic help display

### Database Maintenance Scripts (7)
General database operations, not subscription-specific:
- `backup-database.js` - General backup (could keep for safety)
- `cleanup-test-users.js` - Remove test data
- `cleanup-upgrades.js` - Archive old requests
- `cleanup-usage.js` - Archive usage data
- `cleanup-users.js` - Remove inactive users
- `validate-data.js` - General data validation
- `delete-user.js` - GDPR compliance (could keep for legal)

### Historical Migration Scripts (4)
One-time migrations, no longer needed:
- `analyze-and-cleanup-users-auto.js`
- `analyze-and-cleanup-users.js`
- `reset-users-fresh.js`
- `final-cleanup-users.js`

### Setup/Utility Scripts (3)
One-time or rarely used:
- `setup.js` - Initial setup
- `generate-secret.js` - Generate API keys
- `build-production.sh` - Build script (not admin-related)

### Backup Restore Scripts (2)
Auto-generated with backups:
- `backups/backup-2025-06-30T03-12-11/restore.js`
- `backups/backup-2025-06-30T03-48-00/restore.js`

## Recommended Actions

### Option 1: Minimal Setup (7 scripts only)
Keep ONLY subscription management scripts:
```bash
# Create archive folder
mkdir -p archives/non-subscription

# Move all non-subscription scripts
mv test-*.js archives/non-subscription/
mv cleanup-*.js archives/non-subscription/
mv analyze-*.js archives/non-subscription/
mv reset-users-fresh.js archives/non-subscription/
mv final-cleanup-users.js archives/non-subscription/
mv setup.js archives/non-subscription/
mv generate-secret.js archives/non-subscription/
mv help.js archives/non-subscription/
mv verify-admin-utils.js archives/non-subscription/
mv validate-data.js archives/non-subscription/
```

### Option 2: Balanced Setup (10 scripts)
Keep subscription + essential safety scripts:
- All 7 subscription scripts
- `backup-database.js` (for safety)
- `delete-user.js` (for GDPR)
- `validate-data.js` (for health checks)

### Option 3: Conservative Setup (15 scripts)
Keep subscription + safety + occasional maintenance:
- All from Option 2
- Selected cleanup scripts for maintenance
- Test connection script for debugging

## Summary

You currently have 29 scripts (after deleting grace period scripts).
- Only 7 are directly related to subscription management
- 22 scripts are for testing, cleanup, migration, or general utilities

For a focused subscription management setup, you could reduce from 29 to just 7-10 scripts.