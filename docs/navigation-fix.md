# Navigation Fix - Profile to Advisor Page

## Issue
When clicking "Create New Quote" or "View Quote" from the profile page, users were being redirected to the main page before reaching the advisor page, creating a poor user experience.

## Root Cause
The advisor page was using `router.replace('/')` to clean up URL parameters, which caused:
1. Profile navigates to `/advisor?new=true` or `/advisor?view=true&step=3`
2. Advisor page processes params and replaces URL with `/` (root)
3. Main page redirects authenticated users back to `/advisor`
4. Creates a visible redirect loop

## Solution
Changed `router.replace('/')` to `router.replace('/advisor')` in two locations:
- Line 88: For new quote navigation
- Line 111: For view quote navigation

## Code Changes

### Before:
```typescript
// Line 88
router.replace('/')

// Line 111
router.replace('/')
```

### After:
```typescript
// Line 88
router.replace('/advisor')

// Line 111
router.replace('/advisor')
```

## Result
- Direct navigation from profile to advisor page
- No intermediate redirect to main page
- URL parameters are cleanly removed
- Smooth user experience maintained

## Testing
The navigation now works as expected:
1. **New Quote**: Profile → Advisor (fresh state)
2. **View Quote**: Profile → Advisor (with loaded quote data at step 3)