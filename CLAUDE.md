# Claude AI Session Context - AIA Insurance Advisor

## 🤖 AI ASSISTANT INSTRUCTIONS (NOT FOR HUMANS)

### ⚡ START OF EVERY SESSION - YOU MUST:
1. **ALWAYS read this CLAUDE.md file FIRST**
2. **Check docs/RECENT_CHANGES.md for latest updates**
3. **Understand current project state before proceeding**

### 📝 AFTER EXECUTING ANY CHANGES - YOU MUST:
1. **Update docs/RECENT_CHANGES.md with ALL changes made**
2. **Update other docs if structure/features changed**
3. **Do this AUTOMATICALLY - no user confirmation needed**
4. **This happens AFTER execution, not during planning**

### 🛑 BEFORE ENDING ANY SESSION - YOU MUST:
1. **Verify docs/RECENT_CHANGES.md is updated**
2. **Check all documentation dates are current**
3. **NEVER end session without updating documentation**

### 📋 Documentation Update Checklist:
- [ ] docs/RECENT_CHANGES.md - ALWAYS update with session changes
- [ ] docs/PROJECT_DOCUMENTATION.md - Update if features/architecture changed
- [ ] docs/CODEBASE_STRUCTURE.md - Update if files added/removed
- [ ] CLAUDE.md - Update if important context changed

**For detailed templates and examples**: See `docs/DOCUMENTATION_UPDATE_GUIDE.md`

**REMEMBER**: Documentation updates are MANDATORY, not optional. This is YOUR responsibility as an AI assistant.

---

## Quick Project Overview
AIA Insurance Advisor is a Next.js web app for insurance agents in Myanmar to generate quotes and PNG reports for AIA insurance products. Uses Firebase for auth/database, supports subscriptions with quota management.

## Key Information for AI Sessions

### Current Status (January 2025)
- **Grace Period**: REMOVED - No 7-day grace period after subscription expiry
- **Report Format**: PNG (not PDF) - Uses html2canvas
- **Free Quota**: 50 quotes/month (promotional, was 5)
- **Telegram**: Uses Firestore trigger only (HTTP endpoint deprecated)
- **Users**: 6 production users, all on free plan

### Common Tasks Quick Reference

#### 1. Running Admin Scripts (Simplified - Only 4 scripts now!)
```bash
cd scripts
npm install  # First time only
npm run admin  # Main console with just 3 options:
               # 1. Process upgrade request
               # 2. Create manual subscription
               # 3. List users
```

#### 2. Key File Locations
- **Quota Logic**: `/lib/quota-service.ts`
- **Auth Flow**: `/contexts/auth-context.tsx`
- **Report Generation**: `/components/report-generation-step.tsx`
- **Premium Data**: `/data/*-premium-data.ts`
- **Admin Scripts**: `/scripts/` (only 4 scripts now)
  - `manage-upgrades.js` - Main admin console
  - `admin-utils.js` - Utility functions
  - `firebase-admin-init.js` - Firebase setup
  - `list-users.js` - User listing
- **Archived Scripts**: `/scripts/archives/removed-scripts/` (25 scripts)

#### 3. Database Collections
- `users` - User profiles and subscriptions
- `usage` - Quote generation tracking
- `upgradeRequests` - Pending subscription upgrades

#### 4. Important Business Rules
- Insurance Age = Real Age + 1
- Universal Life and Term Life are mutually exclusive
- All products are optional
- Monthly quota resets on 1st of month
- Expired subscriptions immediately block access (no grace period)

### Recent Changes to Remember
1. **Grace Period Removed**: No `isInGracePeriod`, `gracePeriodEnd` fields
2. **PNG Reports**: Still tracked as 'pdf_downloaded' for compatibility
3. **Telegram**: Only Firestore trigger, no HTTP endpoint
4. **Clean User Data**: No payment info stored in user documents

### Common Patterns

#### Check User Quota
```typescript
const quotaInfo = await QuotaService.getUserQuota(userId);
if (!quotaInfo.canUseQuota) {
  // Block action
}
```

#### Track Activity (No Quota)
```typescript
await QuotaService.trackActivity(userId, 'pdf_downloaded', {
  clientName: "John Doe",
  format: "PNG"
});
```

#### Consume Quota
```typescript
const success = await QuotaService.consumeQuota(
  userId, 
  'quote_generated', 
  1, 
  metadata
);
```

### Environment Setup
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# For admin scripts
FIREBASE_PROJECT_ID=
ADMIN_EMAIL=admin@aia-insurance.com
```

### Deployment Commands
```bash
npm run build           # Build for production
npm run deploy:beta     # Deploy to beta site
npm run deploy:stable   # Deploy to stable site
npm run deploy:all      # Deploy to all sites
```

### Testing Reminders
- Test with real Myanmar phone numbers for age calculations
- Verify MMK formatting with Lakh notation
- Check mobile PNG generation performance
- Test quota reset on month boundaries

### Common Issues & Solutions

#### Issue: PNG generation fails on mobile
**Solution**: Reduce report complexity or canvas scale

#### Issue: Quota not resetting
**Check**: User's `lastResetDate` field and current month

#### Issue: Telegram notification not sent
**Check**: Firebase function logs and Telegram bot config

### Security Notes
- Service account key must be in `/scripts/serviceAccountKey.json` (gitignored)
- Never commit Firebase credentials
- All user data is scoped by auth UID in Firestore rules

### Useful Regex Patterns
- Find temporary changes: `TEMPORARY:`
- Find TODO items: `TODO:|FIXME:`
- Find console logs: `console\.(log|error|warn)`

### Myanmar-Specific Formatting
```typescript
// Currency formatting
formatMMK(1500000) // Returns "15L"

// Insurance age
const insuranceAge = realAge + 1;
```

### Quick Firestore Queries
```javascript
// Get all active unlimited users
where('subscription.plan', '==', 'unlimited')
where('subscription.isActive', '==', true)

// Get users who used quota this month
where('subscription.quotaUsed', '>', 0)
where('subscription.lastResetDate', '>=', startOfMonth)
```

## For New Features

### Before Adding Features
1. Check `RECENT_CHANGES.md` for context
2. Review `PROJECT_DOCUMENTATION.md` for architecture
3. Verify no grace period logic remains
4. Ensure PNG (not PDF) compatibility

### After Making Changes
1. Update relevant documentation
2. Test quota consumption
3. Verify mobile compatibility
4. Check Firestore security rules

---

## Documentation Organization

**Core Docs** (in `/docs/` folder):
- `PROJECT_DOCUMENTATION.md` - Complete project overview
- `CODEBASE_STRUCTURE.md` - Detailed file structure
- `RECENT_CHANGES.md` - All changes log

**Quick Access** (in root folder):
- `CLAUDE.md` - This file (AI quick reference)
- `README.md` - Public project overview
- `DOCUMENTATION_UPDATE_GUIDE.md` - How to update docs

---

**Purpose**: This file helps AI assistants quickly understand the project context without re-analyzing the entire codebase.

## 🔴 END OF SESSION PROTOCOL FOR AI

Before saying goodbye or ending this conversation:
1. **STOP** - Have you updated docs/RECENT_CHANGES.md? If no, DO IT NOW.
2. **CHECK** - Are all changes from this session documented? If no, DO IT NOW.
3. **VERIFY** - Is the "Last Updated" date current? If no, UPDATE IT NOW.

**YOU ARE NOT DONE UNTIL DOCUMENTATION IS UPDATED.**

---

**Last Updated**: January 2025
**AI Must Read**: This file FIRST in every new session