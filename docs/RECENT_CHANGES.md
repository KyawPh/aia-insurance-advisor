# AIA Insurance Advisor - Recent Changes Log

## Overview
This document tracks significant changes made to the AIA Insurance Advisor codebase, particularly those that affect system behavior, data structure, or require special attention during future development.

## January 2025 Changes

### 1. Grace Period Functionality Removal
**Date**: January 2025  
**Impact**: High  
**Files Modified**:
- `/lib/quota-service.ts`
- `/app/(protected)/profile/page.tsx`
- `/app/(protected)/advisor/page.tsx`
- `/components/quota-guard.tsx`

**Changes Made**:
- Removed all grace period logic (7-day period after subscription expiry)
- Removed `isInGracePeriod`, `gracePeriodEnd`, `dailyQuotaUsed`, `dailyQuotaLimit` fields
- Simplified subscription expiry to immediate suspension
- Removed UI warnings about grace period
- Cleaned up "Daily quota resets at midnight" messages

**Migration Notes**:
- Existing users with grace period fields were cleaned up via scripts
- No grace period fields should be added to new users
- Expired subscriptions now immediately prevent quota usage

### 2. Telegram Notification Consolidation
**Date**: January 2025  
**Impact**: Medium  
**Files Modified**:
- `/contexts/auth-context.tsx` (removed direct API call)
- `/app/api/telegram-notify/route.ts` (to be deleted)
- `/functions/index.js` (removed HTTP function)

**Changes Made**:
- Removed direct Telegram API call from auth context (lines 72-102)
- Removed `sendTelegramNotification` HTTP function
- Kept only Firestore trigger `onNewUserCreated` for automatic notifications
- More secure approach using Cloud Functions

**Migration Notes**:
- Telegram notifications still work via Firestore trigger
- No client-side changes needed
- Consider removing `/app/api/telegram-notify/` directory

### 3. PDF to PNG Report Migration
**Date**: January 2025  
**Impact**: Medium  
**Files Modified**:
- `/components/report-generation-step.tsx`
- Package dependencies (removed jsPDF)

**Changes Made**:
- Replaced PDF generation with PNG using html2canvas
- Better mobile compatibility and sharing
- Maintained tracking action as 'pdf_downloaded' for backward compatibility
- Added metadata `format: 'PNG'` to track actual format

**Current Implementation**:
```typescript
// Line 49 in report-generation-step.tsx
TRACK_ACTION_TYPE: 'pdf_downloaded' as const, // Keep as pdf_downloaded for compatibility
```

**Migration Notes**:
- Old PDF reports no longer accessible
- Consider renaming action to 'report_downloaded' in future
- PNG generation may be slower on older devices

### 4. User Data Cleanup
**Date**: January 2025  
**Impact**: Low  
**Users Affected**: 6 production users

**Changes Made**:
- Converted all users to free plan
- Removed payment information
- Reset quotas to fresh registration state
- Removed deprecated fields:
  - `isInGracePeriod`
  - `gracePeriodEnd`
  - `dailyQuotaUsed`
  - `dailyQuotaLimit`
  - `lastPaymentReference`
  - `lastPaymentAmount`
  - `lastPaymentDate`

**Scripts Used**:
1. `analyze-and-cleanup-users-auto.js` - Initial analysis and conversion
2. `reset-users-fresh.js` - Reset to fresh state
3. `final-cleanup-users.js` - Complete field cleanup

### 5. Quota Limit Increase (Promotional)
**Date**: January 2025  
**Impact**: Medium  
**Files Modified**:
- `/lib/quota-service.ts`
- Various UI components showing quota

**Changes Made**:
- Increased free plan quota from 5 to 50 quotes/month
- Added "TEMPORARY" comments for easy reversal
- Updated all quota limit references

**Code Markers**:
```typescript
// TEMPORARY: Changed from 5 to 50 for promotional period
quotaLimit: 50
```

**Migration Notes**:
- Search for "TEMPORARY" comments to revert changes
- Update Firestore rules if quota limits change

## Database Schema Changes

### Removed Fields
From `users` collection documents:
- `subscription.isInGracePeriod`
- `subscription.gracePeriodEnd`
- `subscription.dailyQuotaUsed`
- `subscription.dailyQuotaLimit`
- `subscription.lastPaymentReference`
- `subscription.lastPaymentAmount`
- `subscription.lastPaymentDate`

### Current User Schema
```javascript
{
  uid: string,
  email: string,
  displayName: string,
  fullName: string,
  photoURL: string,
  createdAt: Timestamp,
  lastLogin: Timestamp,
  lastActivity: Timestamp,
  subscription: {
    plan: 'free' | 'unlimited',
    billingPeriod: 'trial' | 'monthly' | '6months' | '12months',
    quotaLimit: number,
    quotaUsed: number,
    lastResetDate: Timestamp,
    isActive: boolean,
    subscriptionStart: Timestamp,
    subscriptionEnd: Timestamp | null,
    autoRenew: boolean
  }
}
```

## Tracking Changes

### Current Tracking Actions
1. `quote_generated` - Consumes 1 quota
2. `pdf_downloaded` - No quota consumption (actually PNG now)
3. `report_viewed` - No quota consumption

### Tracking Metadata
```javascript
{
  clientName: string,
  selectedProducts: string[],
  totalPremium?: number,
  format: 'PNG',  // Added to indicate actual format
  viewMethod: 'download' | 'share'
}
```

## Known Issues After Changes

1. **Firestore Rules**: Plan validation still includes old plan names
   - Rules check for plans: `['free', 'standard', 'premium', 'enterprise']`
   - Actual plans: `['free', 'unlimited']`

2. **Tracking Nomenclature**: 
   - Still uses 'pdf_downloaded' for PNG downloads
   - Consider updating in next major version

3. **API Endpoint**: 
   - `/app/api/telegram-notify/` still exists but unused
   - Should be removed to clean up codebase

## Deployment Notes

### Functions Deployment
After removing grace period:
```bash
firebase deploy --only functions
```

### Hosting Deployment
No special considerations - standard deployment:
```bash
npm run deploy:all
```

## Testing Checklist

After these changes, verify:
- [ ] New user signup flow works
- [ ] Telegram notifications are sent
- [ ] PNG reports generate correctly
- [ ] Quota tracking works for free users
- [ ] Expired subscriptions block access
- [ ] No grace period UI elements remain
- [ ] Monthly quota reset works

## Scripts Folder Analysis
**Date**: January 2025  
**Impact**: Low  
**Files Modified**:
- `/scripts/SCRIPTS_ANALYSIS.md` (initial analysis)
- `/scripts/ALL_SCRIPTS_CATEGORIZED.md` (comprehensive inventory)

**Changes Made**:
- Analyzed all 28 scripts (including embedded functions)
- Created detailed categorization with quality ratings
- Identified 2 deprecated scripts for immediate deletion
- Found 4 migration scripts to archive
- Documented all functions in admin-utils.js

**Script Categories Found**:
- Essential Scripts: 15 (keep and use)
- Review Before Use: 7 (need careful consideration)
- Deprecated: 2 (delete immediately)
- Historical: 4 (archive for reference)

**Action Items**:
- Delete `test-grace-period.js` and `test-grace-period-simple.js` (deprecated)
- Archive migration scripts to `archives/migrations/`
- Add audit logging for admin actions
- Set up automated daily backups
- Create role-based access control

---

## Admin Scripts Alignment Issues Fixed
**Date**: January 2025  
**Impact**: High  
**Files Fixed**:
- `/scripts/admin-utils.js` - All functions aligned
- `/scripts/manage-upgrades.js` - approveUpgradeRequest() fixed

**Fixes Applied**:
1. **Removed Grace Period References**:
   - `createManualSubscription()` - Removed 6 invalid fields
   - `extendSubscription()` - Removed grace period field
   - `approveUpgradeRequest()` - Cleaned up all invalid fields

2. **Fixed Non-existent Fields**:
   - `resetUserQuota()` - Removed dailyQuotaUsed
   - Payment fields moved to payments collection only

3. **Added Proper Logic**:
   - `recalculateSubscription()` - Now checks expiry before setting isActive
   - `extendSubscription()` - Checks if new date is in future

**Bulk Operations Status**:
- ✅ `bulkUpdatePrices()` - Aligned (works on upgradeRequests)
- ✅ `bulkUpdateFreeUserQuota()` - Aligned
- ✅ `recalculateSubscription()` - Fixed with expiry check

**Status**: All admin scripts now aligned with current user schema. Safe to use.

---

## Admin Scripts Major Simplification
**Date**: January 2025  
**Impact**: High  
**Files Modified**:
- `/scripts/manage-upgrades.js` - Simplified menu to 3 options
- Moved 25 scripts to `/scripts/archives/removed-scripts/`

**Changes Made**:
1. **Simplified Admin Menu**:
   - Removed all complex menu options
   - Moved "Create manual subscription" to main menu
   - Only 3 options now: Process request, Create manual, List users

2. **Reduced Scripts from 29 to 4**:
   - Kept: `manage-upgrades.js`, `admin-utils.js`, `firebase-admin-init.js`, `list-users.js`
   - Archived 25 scripts including all test, cleanup, and migration scripts

3. **Archived Scripts Include**:
   - All test scripts (test-*.js)
   - All cleanup scripts (cleanup-*.js)
   - All migration scripts (analyze-*, reset-*, final-*)
   - Utility scripts (validate-data, backup-database, etc.)

**New Workflow**:
```bash
npm run admin
# Shows only 3 options:
# 1. Process an upgrade request
# 2. Create manual subscription (offline payment)
# 3. List all users
```

**Files Location**:
- Active scripts: `/scripts/` (only 4 files)
- Archived scripts: `/scripts/archives/removed-scripts/` (25 files)

---

## Documentation Reorganization
**Date**: January 2025  
**Impact**: Low  
**Files Moved**:
- `RECENT_CHANGES.md` → `/docs/RECENT_CHANGES.md`
- `CODEBASE_STRUCTURE.md` → `/docs/CODEBASE_STRUCTURE.md`
- `PROJECT_DOCUMENTATION.md` → `/docs/PROJECT_DOCUMENTATION.md`
- `DOCUMENTATION_UPDATE_GUIDE.md` → `/docs/DOCUMENTATION_UPDATE_GUIDE.md`

**Files Kept in Root**:
- `CLAUDE.md` - For easy AI access
- `README.md` - Standard location

**Updates Made**:
- Updated all references in other files
- Updated paths in documentation guide
- Created clear separation between detailed docs (in `/docs/`) and quick access files (in root)
- DOCUMENTATION_UPDATE_GUIDE.md moved to docs folder as detailed reference while CLAUDE.md provides quick mandatory instructions

---

## AI Assistant Instructions Enhanced
**Date**: January 2025  
**Impact**: High (for AI behavior)
**Files Modified**:
- `/CLAUDE.md` - Added mandatory AI instructions

**Changes Made**:
1. **Added AI-Only Instructions Section**:
   - Clear commands for AI to read CLAUDE.md first
   - Mandatory documentation updates after execution
   - End of session protocol

2. **Created Auto-Update Requirements**:
   - Documentation updates happen automatically
   - No user confirmation needed for doc updates
   - Must update before ending any session

3. **Enhanced Instructions Include**:
   - Start of session checklist
   - After execution checklist
   - End of session verification

**Purpose**: Ensure AI assistants automatically update documentation without needing reminders.

---

---

## TODO.md Created for Future Improvements
**Date**: January 2025  
**Impact**: Low  
**Files Created**:
- `/docs/TODO.md` - Comprehensive list of future improvements

**Purpose**:
- Track planned features and technical debt
- Provide quick implementation guide for high-priority items
- Document what's missing in the project
- Serve as roadmap for future development sessions

**High Priority Items Documented**:
1. Firebase Analytics implementation
2. Testing infrastructure setup
3. Error monitoring integration

**Categories Covered**:
- High/Medium/Low priority features
- Security & compliance improvements
- Business features
- Technical debt items

---

**Last Updated**: January 2025  
**Next Review**: Before any major feature additions