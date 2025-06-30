# Quote View Fix - Race Condition

## Issue
When viewing a quote from the profile page, the client information and selected products were not showing correctly due to a race condition.

## Root Cause
Two `useEffect` hooks were competing:
1. First effect: Loads quote data from sessionStorage when `view=true`
2. Second effect: Loads saved data from localStorage, overwriting the quote data

The race condition occurred because:
- Both effects run on component mount
- The second effect didn't know about the view operation
- It would overwrite the quote data with whatever was in localStorage

## Timeline of Events
1. Profile page stores quote in `sessionStorage`
2. Navigates to `/advisor?view=true&step=3`
3. First useEffect loads quote data correctly
4. Second useEffect runs and overwrites with localStorage data
5. Result: Wrong data displayed

## Solution
Added a check in the second useEffect to prevent it from running during quote view:

```typescript
const isViewQuoteFromUrl = searchParams.get('view') === 'true'

if (user && !clientDataLoaded && !isNewQuote && !isViewQuoteFromUrl) {
  // Load from localStorage only if NOT viewing a quote
}
```

## Result
- Quote view now correctly shows the selected quote's data
- Client information displays properly
- Selected products are preserved
- No race condition between the two data loading mechanisms

## Testing
The quote view functionality now works as expected:
1. Click "View Quote" from profile
2. Advisor page loads with correct client data
3. Selected products match the original quote
4. Report displays the same information as when originally generated