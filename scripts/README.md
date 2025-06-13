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
4. Save the file in the `scripts` directory (e.g., `serviceAccountKey.json`)

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

### Manage Upgrade Requests

The main script for managing subscription upgrade requests:

```bash
npm run manage-upgrades
```

Features:
- List pending upgrade requests
- List all upgrade requests
- Process (approve/reject) upgrade requests
- View user subscription details
- View upgrade statistics and revenue

## Script Features

### 1. List Upgrade Requests
- View all pending requests that need processing
- See all requests with their status
- Displays user info, plan details, payment method, and creation date

### 2. Process Upgrade Requests
- Select a pending request to process
- View complete request details
- Approve with payment reference
- Reject with reason
- Automatically updates user subscription on approval

### 3. User Subscription Management
- Look up any user by email
- View current subscription status
- See quota usage (for free/grace period users)
- View recent upgrade request history

### 4. Statistics Dashboard
- Total requests by status
- Revenue summary
- Revenue breakdown by billing period
- Active subscription count

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