# Admin Utils Functions Overview

`admin-utils.js` is a utility library that provides subscription management functions. It's not a standalone script - it's imported and used by other scripts, particularly `manage-upgrades.js`.

## Functions Available in admin-utils.js

### 1. `createManualSubscription(email, billingPeriod, paymentReference)`
**Purpose**: Create a subscription for offline payments
**Use Case**: When someone pays cash/bank transfer
**What it does**:
- Updates user to unlimited plan
- Sets subscription dates
- Creates payment record
- Resets quota

### 2. `extendSubscription(email, additionalMonths)`
**Purpose**: Add months to existing subscription
**Use Case**: Manual extension, compensation, special deals
**What it does**:
- Adds X months to current end date
- Checks if still active after extension

### 3. `resetUserQuota(email)`
**Purpose**: Reset a user's quota to 0
**Use Case**: Fix quota issues, support requests
**What it does**:
- Sets quotaUsed to 0
- Updates lastResetDate

### 4. `cancelSubscription(email, reason)`
**Purpose**: Cancel a user's subscription
**Use Case**: User requests, payment issues
**What it does**:
- Sets isActive to false
- Logs cancellation reason
- Creates cancellation record

### 5. `exportUserData(email)`
**Purpose**: Export all user data (GDPR compliance)
**Use Case**: User data requests, legal requirements
**What it does**:
- Exports user profile
- Exports usage history
- Exports payment records
- Saves to JSON file

### 6. `bulkUpdatePrices(newPrices)`
**Purpose**: Update prices on pending upgrade requests
**Use Case**: Price changes
**What it does**:
- Updates all pending requests with new prices
- Adds audit note

### 7. `recalculateSubscription(email)`
**Purpose**: Fix subscription dates for multiple payments
**Use Case**: User paid multiple times, dates are wrong
**What it does**:
- Finds all payments
- Calculates total months
- Updates end date

### 8. `bulkUpdateFreeUserQuota()`
**Purpose**: Update quota for all free users (5→50)
**Use Case**: Promotional quota increase
**What it does**:
- Updates all free users
- Batch processing for performance

### 9. `runUtilityMenu()`
**Purpose**: Interactive menu for utilities
**Called By**: manage-upgrades.js
**Provides Access To**:
- Create manual subscription
- Extend subscription
- Reset user quota
- Cancel subscription
- Export user data

## How It's Used

### In manage-upgrades.js:
```javascript
import { runUtilityMenu } from './admin-utils.js';

// When user selects "Admin utilities" from main menu
case MAIN_MENU_CHOICES.UTILITIES:
  await runUtilityMenu();
  break;
```

### Could be used directly:
```javascript
import { resetUserQuota, extendSubscription } from './admin-utils.js';

// Fix a user's quota
await resetUserQuota('user@email.com');

// Give someone 3 extra months
await extendSubscription('user@email.com', 3);
```

## Summary

`admin-utils.js` is like a toolbox - it contains all the subscription management functions that other scripts can use. The main way to access these functions is through:

1. **manage-upgrades.js** → Admin Utilities menu
2. Or by creating custom scripts that import specific functions

It's not meant to be run directly - it's a shared library of admin functions.