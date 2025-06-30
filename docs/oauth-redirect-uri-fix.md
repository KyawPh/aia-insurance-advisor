# Fix OAuth Redirect URI Mismatch

## Problem
Error 400: redirect_uri_mismatch - The redirect URI `https://insurance-advisor.web.app/__/auth/handler` is not registered in Google Cloud Console.

## Solution

### Step 1: Go to Google Cloud Console
1. Visit https://console.cloud.google.com
2. Select your project (aia-advisor-b5760)
3. Navigate to **APIs & Services** → **Credentials**

### Step 2: Find Your OAuth 2.0 Client ID
1. Look for your Web Client ID (should be named something like "Web client" or your app name)
2. Click on it to edit

### Step 3: Add Authorized Redirect URIs
Add ALL of these redirect URIs:

```
https://insurance-advisor.web.app/__/auth/handler
https://aia-advisor-b5760.firebaseapp.com/__/auth/handler
https://aia-advisor-b5760.web.app/__/auth/handler
http://localhost:3000/__/auth/handler
```

### Step 4: Save Changes
1. Click "Save" at the bottom
2. Wait a few minutes for changes to propagate (usually instant, but can take up to 5 minutes)

### Step 5: Also Check Authorized JavaScript Origins
Make sure these origins are also added:

```
https://insurance-advisor.web.app
https://aia-advisor-b5760.firebaseapp.com
https://aia-advisor-b5760.web.app
http://localhost:3000
http://localhost
```

## Why This Happens

Firebase Auth uses the pattern `https://[your-domain]/__/auth/handler` for OAuth callbacks. Each domain you use needs to be explicitly registered in Google Cloud Console.

## Quick Navigation

1. Direct link to credentials: https://console.cloud.google.com/apis/credentials?project=aia-advisor-b5760
2. Look for the OAuth 2.0 Client IDs section
3. Click on your web client to edit

## Verification

After adding the redirect URIs:
1. Clear your browser cache
2. Try signing in again at https://insurance-advisor.web.app
3. The OAuth flow should now work correctly

## Additional Notes

- The `__/auth/handler` path is Firebase's standard OAuth callback handler
- You need to add this for every domain you deploy to
- localhost entries are for development
- Changes usually take effect immediately but can take up to 5 minutes