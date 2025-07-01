# Complete Scripts Inventory - AIA Insurance Advisor

## Summary Statistics
- **Total Scripts**: 28 scripts (26 standalone + 2 restore scripts in backups)
- **Good/Essential**: 15 scripts
- **Needs Review**: 7 scripts
- **Deprecated/Remove**: 6 scripts

## Detailed Script Analysis

### 🟢 CATEGORY 1: Core Admin Tools (ESSENTIAL - Keep)

#### 1. `manage-upgrades.js` ⭐⭐⭐⭐⭐
- **Purpose**: Main admin console for subscription management
- **Quality**: EXCELLENT - Professional interactive CLI
- **Features**: Process upgrades, view stats, user lookup, utilities menu
- **Dependencies**: Calls `list-users.js` as child process
- **Verdict**: KEEP - Core functionality

#### 2. `firebase-admin-init.js` ⭐⭐⭐⭐⭐
- **Purpose**: Shared Firebase Admin SDK initialization
- **Quality**: EXCELLENT - Centralized configuration
- **Features**: Auth, Firestore, utility functions, constants
- **Used By**: ALL other scripts
- **Verdict**: KEEP - Foundation script

#### 3. `admin-utils.js` ⭐⭐⭐⭐⭐
- **Purpose**: Utility functions library for admin operations
- **Quality**: EXCELLENT - Well-organized functions
- **Functions**:
  - `createManualSubscription()` - Offline payment processing
  - `extendSubscription()` - Add months to subscription
  - `resetUserQuota()` - Reset user quota
  - `cancelSubscription()` - Cancel with reason
  - `exportUserData()` - GDPR compliance export
  - `bulkUpdatePrices()` - Update pending request prices
  - `recalculateSubscription()` - Fix multi-payment subscriptions
  - `bulkUpdateFreeUserQuota()` - Mass quota updates
  - `runUtilityMenu()` - Interactive utilities menu
- **Verdict**: KEEP - Essential utilities

### 🟢 CATEGORY 2: User Management (GOOD - Keep)

#### 4. `list-users.js` ⭐⭐⭐⭐⭐
- **Purpose**: Comprehensive user listing and analysis
- **Quality**: EXCELLENT - Feature-rich with exports
- **Features**: Filter, sort, CSV export, statistics
- **Verdict**: KEEP - Important for user management

#### 5. `delete-user.js` ⭐⭐⭐⭐
- **Purpose**: Complete user deletion (GDPR compliance)
- **Quality**: GOOD - Has safety confirmations
- **Features**: Removes from all collections + Auth
- **Verdict**: KEEP - Legal requirement

#### 6. `fix-user-quota.js` ⭐⭐⭐⭐
- **Purpose**: Fix individual user quota issues
- **Quality**: GOOD - Interactive with validation
- **Features**: Reset quota, create missing subscription data
- **Verdict**: KEEP - Support tool

### 🟢 CATEGORY 3: Backup & Validation (CRITICAL - Keep)

#### 7. `backup-database.js` ⭐⭐⭐⭐⭐
- **Purpose**: Create timestamped full backups
- **Quality**: EXCELLENT - Includes restore scripts
- **Features**: All collections, metadata, restore capability
- **Verdict**: KEEP - Critical for disaster recovery

#### 8. `validate-data.js` ⭐⭐⭐⭐
- **Purpose**: Data integrity validation
- **Quality**: GOOD - Non-destructive checks
- **Features**: Cross-collection consistency, field validation
- **Verdict**: KEEP - Regular health checks

#### 9. `restore.js` (in backup folders) ⭐⭐⭐⭐
- **Purpose**: Restore from specific backup
- **Quality**: GOOD - Auto-generated with backups
- **Location**: `backups/backup-*/restore.js`
- **Verdict**: KEEP - Part of backup system

### 🟡 CATEGORY 4: Bulk Operations (USE CAREFULLY)

#### 10. `update-free-quota.js` ⭐⭐⭐
- **Purpose**: Bulk update free user quotas (5→50)
- **Quality**: GOOD - Has preview and confirmation
- **Features**: Batch updates, safety checks
- **Verdict**: KEEP - Occasional use

#### 11. `recalculate-subscription.js` ⭐⭐⭐
- **Purpose**: Fix subscription dates for multi-payment users
- **Quality**: GOOD - Shows payment history
- **Features**: Recalculates total subscription duration
- **Verdict**: KEEP - Edge case fixes

### 🟡 CATEGORY 5: Cleanup Scripts (REVIEW BEFORE USE)

#### 12. `cleanup-users.js` ⭐⭐⭐
- **Purpose**: Remove inactive/test users
- **Quality**: MODERATE - Needs careful review
- **Risk**: Can delete valid users if criteria too broad
- **Verdict**: REVIEW - Update criteria before use

#### 13. `cleanup-usage.js` ⭐⭐⭐
- **Purpose**: Archive old usage records
- **Quality**: GOOD - Archives before deletion
- **Risk**: Affects historical analytics
- **Verdict**: REVIEW - Check retention policy

#### 14. `cleanup-upgrades.js` ⭐⭐⭐
- **Purpose**: Archive old upgrade requests
- **Quality**: GOOD - Preserves audit trail
- **Risk**: Low if archiving properly
- **Verdict**: REVIEW - Verify archive strategy

### 🟠 CATEGORY 6: Test/Debug Scripts (LIMITED USE)

#### 15. `test-connection.js` ⭐⭐
- **Purpose**: Verify Firebase connection
- **Quality**: BASIC - Simple connection test
- **Use Case**: Initial setup only
- **Verdict**: KEEP - Useful for debugging

#### 16. `test-telegram.js` ⭐⭐
- **Purpose**: Test Telegram bot notifications
- **Quality**: BASIC - Sends test message
- **Use Case**: Debugging notifications
- **Verdict**: KEEP - Occasional debugging

#### 17. `test-api-route.js` ⭐
- **Purpose**: Test API endpoints
- **Quality**: BASIC - Simple HTTP test
- **Use Case**: Development testing
- **Verdict**: REVIEW - May be outdated

#### 18. `test-subscription.js` ⭐
- **Purpose**: Test subscription logic
- **Quality**: UNKNOWN - Need to review
- **Verdict**: REVIEW - Check if still relevant

### 🔵 CATEGORY 7: Setup/Utility Scripts

#### 19. `setup.js` ⭐⭐⭐
- **Purpose**: Initial admin scripts setup
- **Quality**: GOOD - Helps with configuration
- **Features**: Environment setup, instructions
- **Verdict**: KEEP - First-time setup

#### 20. `help.js` ⭐⭐
- **Purpose**: Display help information
- **Quality**: BASIC - Shows available commands
- **Verdict**: KEEP - User guidance

#### 21. `generate-secret.js` ⭐⭐
- **Purpose**: Generate secure random secrets
- **Quality**: SIMPLE - One function
- **Use Case**: API key generation
- **Verdict**: KEEP - Occasional use

### 🔴 CATEGORY 8: Deprecated Scripts (REMOVE)

#### 22. `test-grace-period.js` ❌
- **Status**: DEPRECATED - Grace period removed
- **Risk**: Creates invalid user states
- **Verdict**: DELETE IMMEDIATELY

#### 23. `test-grace-period-simple.js` ❌
- **Status**: DEPRECATED - Grace period removed
- **Risk**: Creates invalid user states
- **Verdict**: DELETE IMMEDIATELY

### 🟣 CATEGORY 9: Historical Migration Scripts

#### 24. `analyze-and-cleanup-users.js` ⚠️
- **Purpose**: Interactive user cleanup (old version)
- **Quality**: RISKY - Manual process
- **Verdict**: ARCHIVE - Use auto version instead

#### 25. `analyze-and-cleanup-users-auto.js` ✓
- **Purpose**: Automated user cleanup
- **Quality**: GOOD - Used for grace period removal
- **Verdict**: ARCHIVE - Migration complete

#### 26. `reset-users-fresh.js` ✓
- **Purpose**: Reset users to fresh state
- **Quality**: GOOD - Used in migration
- **Verdict**: ARCHIVE - Migration complete

#### 27. `final-cleanup-users.js` ✓
- **Purpose**: Final field cleanup
- **Quality**: GOOD - Completed task
- **Verdict**: ARCHIVE - Migration complete

### 🟤 CATEGORY 10: Build Scripts

#### 28. `build-production.sh` ⭐⭐⭐
- **Purpose**: Production build script
- **Quality**: GOOD - Standard build process
- **Location**: Called by npm scripts
- **Verdict**: KEEP - Build process

## Recommendations

### Immediate Actions:
```bash
# 1. Delete deprecated scripts
rm test-grace-period.js
rm test-grace-period-simple.js

# 2. Archive migration scripts
mkdir -p archives/migrations
mv analyze-and-cleanup-users*.js archives/migrations/
mv reset-users-fresh.js archives/migrations/
mv final-cleanup-users.js archives/migrations/
```

### Script Health Matrix:

| Category | Count | Action Required |
|----------|-------|----------------|
| Essential (🟢) | 9 | None - Keep using |
| Good Tools (🟢) | 6 | None - Keep available |
| Review First (🟡) | 5 | Check before using |
| Limited Use (🟠) | 4 | Use only when needed |
| Deprecated (🔴) | 2 | Delete immediately |
| Historical (🟣) | 4 | Archive for reference |

### Usage Frequency Guide:

| Script | Frequency | Who Should Run |
|--------|-----------|----------------|
| manage-upgrades.js | Daily | Admin |
| list-users.js | Weekly | Admin/Support |
| backup-database.js | Daily (automated) | System |
| validate-data.js | Weekly | System |
| fix-user-quota.js | As needed | Support |
| delete-user.js | As needed | Admin (GDPR) |
| cleanup-*.js | Monthly | Admin (with backup) |

### Missing Functionality:
1. **Audit logging** - Track who ran what script when
2. **Automated backups** - Cron job for backup-database.js
3. **Script permissions** - Role-based access control
4. **Monitoring alerts** - Notify on script failures
5. **Batch operations log** - Record bulk changes

---

**Generated**: January 2025
**Total Scripts Analyzed**: 28
**Recommendation**: Remove 2 deprecated scripts, archive 4 migration scripts, keep 22 active scripts