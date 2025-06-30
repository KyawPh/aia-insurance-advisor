# Firebase Functions Deployment Guide

This guide explains how to deploy and configure the Telegram notification Firebase Cloud Function.

## Prerequisites

1. Firebase CLI installed:
   ```bash
   npm install -g firebase-tools
   ```

2. Firebase project already set up (which you have)

3. Telegram bot token and chat ID ready

## Initial Setup

1. Navigate to the functions directory:
   ```bash
   cd functions
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Set up Firebase Functions configuration for Telegram credentials:
   ```bash
   firebase functions:config:set telegram.bot_token="YOUR_BOT_TOKEN" telegram.chat_id="YOUR_CHAT_ID"
   ```

4. Verify configuration:
   ```bash
   firebase functions:config:get
   ```

## Environment Variables

Add the following to your `.env.local` file in the root directory:

```env
# Firebase Functions URL (optional - defaults to auto-generated URL)
NEXT_PUBLIC_FIREBASE_FUNCTIONS_URL=https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net

# Firebase Project ID (required if not using custom functions URL)
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
```

## Deployment

### Deploy Functions Only

From the `functions` directory:
```bash
npm run deploy
```

Or from the root directory:
```bash
firebase deploy --only functions
```

### Deploy Specific Function

To deploy only the Telegram notification function:
```bash
firebase deploy --only functions:sendTelegramNotification
```

### Deploy with Firestore Trigger

To also deploy the automatic Firestore trigger for new users:
```bash
firebase deploy --only functions:onNewUserCreated
```

## Testing

### Test the HTTP Function

1. Get a Firebase ID token (you can use the browser console when logged in):
   ```javascript
   const user = firebase.auth().currentUser;
   const token = await user.getIdToken();
   console.log(token);
   ```

2. Test with cURL:
   ```bash
   curl -X POST \
     https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/sendTelegramNotification \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer YOUR_ID_TOKEN" \
     -d '{
       "type": "new_signup",
       "userData": {
         "email": "test@example.com",
         "displayName": "Test User",
         "signupTime": "2025-06-30T12:00:00Z"
       }
     }'
   ```

### Test Health Check

```bash
curl https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/healthCheck
```

## Monitoring

View function logs:
```bash
firebase functions:log
```

View specific function logs:
```bash
firebase functions:log --only sendTelegramNotification
```

## Security Considerations

1. **Authentication**: The function requires a valid Firebase Auth ID token
2. **CORS**: Configured to accept requests from any origin (you may want to restrict this)
3. **Rate Limiting**: Consider implementing rate limiting for production
4. **Secrets Management**: Telegram credentials are stored in Firebase Functions config

## Updating Telegram Credentials

To update the bot token or chat ID:
```bash
firebase functions:config:set telegram.bot_token="NEW_TOKEN"
firebase functions:config:set telegram.chat_id="NEW_CHAT_ID"
firebase deploy --only functions
```

## Troubleshooting

### Function Not Triggering

1. Check Firebase console for function deployment status
2. Verify environment variables are set correctly
3. Check function logs for errors

### Authentication Errors

1. Ensure the user is properly authenticated
2. Verify the ID token is being sent correctly
3. Check CORS configuration

### Telegram API Errors

1. Verify bot token is correct
2. Ensure bot has permission to send messages to the chat
3. Check Telegram API status

## Migration from API Route

The function replaces the Next.js API route at `/api/telegram-notify`. The main differences:

1. **Authentication**: Now uses Firebase Auth tokens instead of a secret key
2. **Hosting**: Runs on Firebase Functions infrastructure
3. **Automatic Triggers**: Optional Firestore trigger for new user documents
4. **CORS Handling**: Built-in CORS support for cross-origin requests

## Cost Considerations

- Firebase Functions free tier includes 125K invocations/month
- Each new user signup triggers one function call
- Monitor usage in Firebase Console

## Best Practices

1. **Error Handling**: Never let notification failures block user signup
2. **Logging**: Use structured logging for easier debugging
3. **Testing**: Test both success and failure scenarios
4. **Monitoring**: Set up alerts for function errors
5. **Security**: Regularly rotate Telegram bot tokens