# Firebase Cloud Functions

This directory contains Firebase Cloud Functions for the AIA Insurance Advisor application.

## Functions

### 1. `sendTelegramNotification`
HTTP-triggered function that sends Telegram notifications when called with proper authentication.

**Endpoint**: `https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/sendTelegramNotification`

**Method**: POST

**Authentication**: Requires Firebase Auth Bearer token

**Request Body**:
```json
{
  "type": "new_signup",
  "userData": {
    "email": "user@example.com",
    "displayName": "User Name",
    "signupTime": "2025-06-30T12:00:00Z"
  }
}
```

### 2. `onNewUserCreated`
Firestore-triggered function that automatically sends a Telegram notification when a new user document is created.

**Trigger**: Creation of document in `users` collection

### 3. `healthCheck`
Simple health check endpoint for monitoring.

**Endpoint**: `https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/healthCheck`

**Method**: GET

## Setup

1. Install dependencies:
   ```bash
   npm install
   ```

2. Configure Telegram credentials:
   ```bash
   firebase functions:config:set telegram.bot_token="YOUR_BOT_TOKEN" telegram.chat_id="YOUR_CHAT_ID"
   ```

3. Deploy functions:
   ```bash
   npm run deploy
   ```

## Environment Variables

The functions use Firebase Functions config for sensitive data:
- `telegram.bot_token`: Telegram bot token
- `telegram.chat_id`: Telegram chat ID for notifications

## Testing

Use the provided test script:
```bash
node test-function.js
```

Note: You'll need to update the function URL and provide a valid Firebase Auth token.

## Security

- All HTTP functions require Firebase Authentication
- CORS is enabled for cross-origin requests
- Telegram credentials are stored securely in Firebase config
- No hard-coded secrets in the code