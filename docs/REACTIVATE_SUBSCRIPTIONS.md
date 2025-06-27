# Reactivating Subscription Features

This guide explains how to restore the subscription and payment features that were temporarily hidden for the promotional period.

## Overview

During the promotional period, the following changes were made:
- Free quota increased from 5 to 50 quotes per month
- Monthly quota reset logic added
- All subscription/upgrade UI elements hidden
- Payment and billing features commented out

## Quick Checklist

To reactivate subscriptions, follow these steps:

1. [ ] Update quota limits back to original values
2. [ ] Remove monthly reset logic
3. [ ] Uncomment subscription UI elements
4. [ ] Restore upgrade prompts and buttons
5. [ ] Re-enable billing tab in profile
6. [ ] Test subscription flows

## Files Modified

### 1. **data/subscription-plans-data.ts**
- **Line 18**: Change `quotaLimit: 50` back to `quotaLimit: 5`
- **Line 19**: Change description back to original
- **Lines 21-22**: Restore original features array
- **Search for**: `TEMPORARY:`

### 2. **lib/quota-service.ts**
- **Line 82**: Change `quotaLimit: 50` back to `quotaLimit: 5`
- **Lines 120-136**: Remove monthly reset logic block
- **Line 141**: Change `50` back to `5`
- **Line 171**: Change `50` back to `5`
- **Lines 219, 221**: Change `50` back to `5`
- **Search for**: `TEMPORARY:`

### 3. **contexts/auth-context.tsx**
- **Line 62**: Change `quotaLimit: 50` back to `quotaLimit: 5`
- **Search for**: `TEMPORARY:`

### 4. **app/profile/page.tsx**
- **Lines 552-553**: Change grid back from `grid-cols-4` to `grid-cols-5`
- **Lines 575-583**: Uncomment Plans/Billing tab
- **Lines 619-696**: Uncomment subscription status alerts
- **Lines 792-824**: Uncomment upgrade prompts section
- **Lines 1230-1393**: Uncomment entire Plans tab content
- **Search for**: `TEMPORARY:`

### 5. **components/quota-guard.tsx**
- **Lines 68-71**: Restore original quota exceeded messages
- **Lines 117-177**: Uncomment upgrade card
- **Lines 220**: Restore upgrade action text
- **Lines 244-253**: Uncomment upgrade button
- **Search for**: `TEMPORARY:`

### 6. **app/page.tsx**
- **Line 382**: Change "Monthly Quota:" back to "Quota:"
- **Line 427**: Remove "This Month" from quota badge
- **Search for**: `TEMPORARY:`

## Search Patterns

Use these search patterns to find all temporary modifications:

```bash
# Find all TEMPORARY comments
grep -r "TEMPORARY:" --include="*.ts" --include="*.tsx" .

# Find specific quota values
grep -r "quotaLimit: 50" --include="*.ts" --include="*.tsx" .

# Find monthly reset logic
grep -r "monthly reset\|Monthly reset" --include="*.ts" --include="*.tsx" .
```

## Testing Checklist

After reactivating subscriptions:

1. **Quota System**
   - [ ] Verify free trial shows 5 quotes limit
   - [ ] Test quota consumption
   - [ ] Verify quota doesn't reset monthly
   - [ ] Test grace period logic (7 days, 5 quotes/day)

2. **UI Elements**
   - [ ] Profile page shows Plans/Billing tab
   - [ ] Upgrade prompts appear for free users
   - [ ] Low quota warnings show upgrade buttons
   - [ ] Quota exceeded screen shows upgrade options

3. **Subscription Flow**
   - [ ] Test upgrade dialog functionality
   - [ ] Verify payment method selection
   - [ ] Test upgrade request creation
   - [ ] Check admin scripts for processing upgrades

4. **Edge Cases**
   - [ ] Test expired subscription behavior
   - [ ] Verify grace period activation
   - [ ] Test subscription renewal flow
   - [ ] Check quota reset for expired users

## Original Subscription Pricing

For reference, here are the original subscription plans:

### Free Trial
- 5 quotes total (one-time)
- No expiration
- Basic features

### Unlimited Plan
- **Monthly**: 15,000 MMK/month
- **6 Months**: 10,000 MMK/month (60,000 MMK total, 25% savings)
- **12 Months**: 8,000 MMK/month (96,000 MMK total, 47% savings)

### Grace Period
- Activates after subscription expires
- 7 days duration
- 5 quotes per day limit
- Resets daily at midnight

## Admin Tools

The admin scripts in `/scripts/` remain fully functional:
- `manage-upgrades.js` - Process upgrade requests
- `admin-utils.js` - User management utilities
- No modifications needed for these tools

## Additional Notes

1. All original code is preserved in comments
2. No database schema changes were made
3. Firebase security rules remain unchanged
4. User data and upgrade requests are preserved
5. Admin functionality remains intact

## Support

If you encounter any issues during reactivation:
1. Check all TEMPORARY comments were addressed
2. Clear browser cache and test in incognito mode
3. Verify Firebase configuration is correct
4. Check console for any JavaScript errors
5. Test with both new and existing user accounts

---

**Last Updated**: January 2025  
**Promotional Period Duration**: TBD by management