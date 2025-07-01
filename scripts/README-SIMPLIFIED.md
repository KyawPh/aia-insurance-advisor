# AIA Insurance Admin Scripts - Simplified

## Quick Start
```bash
npm run admin
```

## Available Scripts (Only 4!)

### 1. manage-upgrades.js
**Main admin console** with 3 simple options:
- **Process upgrade request** - Approve pending requests with payment reference
- **Create manual subscription** - Upgrade users with offline payments
- **List all users** - View users and their subscription status

### 2. admin-utils.js
Utility functions library (used by manage-upgrades.js)

### 3. firebase-admin-init.js
Firebase configuration (required by all scripts)

### 4. list-users.js
View and export user data

## Common Tasks

### Upgrade User from App Request
```bash
npm run admin
→ Select "Process an upgrade request"
→ Choose the request
→ Enter payment reference
→ Done!
```

### Upgrade User with Offline Payment
```bash
npm run admin
→ Select "Create manual subscription"
→ Enter user email
→ Choose plan (Monthly/6 Months/12 Months)
→ Enter payment reference
→ Done!
```

### View All Users
```bash
npm run admin
→ Select "List all users"
→ Filter and sort as needed
```

## That's It!
Only 3 menu options, 4 scripts total. Simple and focused on subscription management.

---

**Note**: All other scripts have been archived to `archives/removed-scripts/` if you ever need them.