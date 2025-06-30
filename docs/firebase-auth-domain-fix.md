# Firebase Auth Domain Configuration

## Problem
When deploying to `insurance-advisor.web.app`, users get "This domain is not authorized" error during Google sign-in because the auth domain is set to `aia-advisor-b5760.firebaseapp.com`.

## Solution
We've configured separate environment variables for production that use the correct auth domain.

### Files Created/Modified:

1. **`.env.production`** - Production environment variables with correct auth domain
2. **`scripts/build-production.sh`** - Build script that uses production environment
3. **`package.json`** - Updated deploy scripts to use production build

### How It Works:

1. Development uses `.env.local` with `aia-advisor-b5760.firebaseapp.com`
2. Production build temporarily switches to `.env.production` with `insurance-advisor.web.app`
3. After build, the original `.env.local` is restored

### Deployment Commands:

```bash
# Deploy to stable (insurance-advisor.web.app)
npm run deploy:stable

# Deploy to all hosting targets
npm run deploy:all

# Just build for production (without deploying)
npm run build:production
```

### Important Notes:

1. **Firebase Console**: Make sure `insurance-advisor.web.app` is in the authorized domains list:
   - Go to Firebase Console > Authentication > Settings > Authorized domains
   - Add `insurance-advisor.web.app` if not already present

2. **Google Cloud Console**: Ensure the domain is also authorized in OAuth consent screen:
   - Go to Google Cloud Console > APIs & Services > OAuth consent screen
   - Add `insurance-advisor.web.app` to authorized domains

3. **Environment Variables**: The `.env.production` file contains sensitive data and is gitignored. Make sure to:
   - Keep a secure backup
   - Never commit it to version control
   - Share securely with team members who need to deploy

### Troubleshooting:

If auth still fails after deployment:
1. Clear browser cache and cookies
2. Check browser console for specific error messages
3. Verify the domain is correctly set in Firebase Console
4. Ensure the production build used the correct environment file