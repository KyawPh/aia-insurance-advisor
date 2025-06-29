# AIA Insurance Advisor - Admin Scripts

This directory contains administrative scripts for managing the AIA Insurance Advisor application, particularly for handling upgrade requests and subscription management.

## Setup Instructions

### 1. Install Dependencies

```bash
cd scripts
npm install
```

### 2. Configure Firebase Admin SDK

1. Go to your Firebase Console
2. Navigate to Project Settings > Service Accounts
3. Click "Generate New Private Key" to download your service account JSON file
4. Save the file as `serviceAccountKey.json` in the `scripts` directory
5. **IMPORTANT**: Never commit this file to version control. It's already added to `.gitignore`
6. Use `serviceAccountKey.example.json` as a template if needed

### 3. Set Up Environment Variables

1. Copy the example environment file:
   ```bash
   cp .env.example .env
   ```

2. Edit `.env` and set the following:
   ```
   GOOGLE_APPLICATION_CREDENTIALS=./serviceAccountKey.json
   FIREBASE_PROJECT_ID=your-firebase-project-id
   ADMIN_EMAIL=your-admin-email@example.com
   ```

## Available Scripts

### Main Admin Tool

The main script for managing subscription upgrade requests and admin tasks:

```bash
npm run admin
```

Features:
- List pending upgrade requests
- List all upgrade requests
- Process (approve/reject) upgrade requests
- View user subscription details
- List all users with comprehensive details
- View upgrade statistics and revenue
- Admin utilities menu (core functions only)

### List All Users

View a comprehensive list of all users in the system:

```bash
npm run list-users
```

Features:
- View all users with email, name, plan, usage, and status
- Filter by plan type (free/unlimited/all)
- Sort by last login, creation date, or usage
- Show/hide inactive users
- Export to CSV for further analysis
- Display usage statistics and summaries

### One-Time Fix Scripts

These scripts are for specific maintenance tasks and fixes:

#### Update All Free Users Quota
```bash
npm run update-quota
```
- Updates all free users from old quota (5) to new quota (50)
- Shows preview before making changes
- Handles users without subscription data

#### Fix Individual User Quota
```bash
npm run fix-quota
```
- Fix quota data for a specific user by email
- Reset quota usage and set proper limits
- Create missing subscription data

#### Recalculate Subscription Duration
```bash
npm run recalculate
```
- Fix subscription end dates for users with multiple payments
- Calculates total duration from all completed payments
- Shows detailed payment history

## Core Admin Features

### 1. Main Admin Console (`npm run admin`)

#### Upgrade Request Management
- View all pending requests that need processing
- See all requests with their status
- Process requests (approve with payment reference or reject with reason)
- Automatically updates user subscription on approval

#### User Subscription Lookup
- Look up any user by email
- View current subscription status
- See quota usage (for free/grace period users)
- View recent upgrade request history

#### Statistics Dashboard
- Total requests by status (pending/completed/rejected)
- Revenue summary and breakdown by billing period
- Active subscription count

#### Admin Utilities Menu
Clean, focused menu with only core functions:
- **Create manual subscription** - For offline payments
- **Extend subscription** - Add months to existing subscription
- **Reset user quota** - Reset quota usage to 0
- **Cancel subscription** - Deactivate with reason
- **Export user data** - Full data export to JSON

## Upgrade Approval Flow

When approving an upgrade request:

1. **User Subscription Update**:
   - Plan set to "unlimited"
   - Billing period applied
   - Subscription dates calculated
   - Quotas reset
   - Payment info stored

2. **Request Status Update**:
   - Status changed to "completed"
   - Payment reference stored
   - Processing timestamp and admin recorded

3. **Payment Record Creation**:
   - Complete payment history maintained
   - Links to upgrade request
   - Used for revenue reporting

## Security Notes

- Keep your service account key secure
- Never commit the service account key to version control
- The `.gitignore` file is configured to exclude sensitive files
- Only authorized administrators should have access to these scripts

## Database Collections Used

- `users` - User subscription data
- `upgradeRequests` - Upgrade request records
- `payments` - Payment history

## Troubleshooting

### "Firebase configuration missing" error
- Ensure your `.env` file exists and contains valid values
- Check that your service account key file path is correct

### "Permission denied" errors
- Verify your service account has the necessary Firestore permissions
- Check that you're using the correct Firebase project ID

### "User not found" when looking up subscriptions
- The user must have logged in at least once to create their user document
- Try using the exact email address they use for authentication

## Future Enhancements

Potential improvements for the admin system:

1. **Email Notifications**: Send automatic emails when requests are approved/rejected
2. **Bulk Operations**: Process multiple requests at once
3. **Export Reports**: Generate CSV/Excel reports for accounting
4. **Webhook Integration**: Notify external systems of subscription changes
5. **Audit Logging**: Detailed activity logs for compliance
6. **Dashboard UI**: Web-based admin interface instead of CLI