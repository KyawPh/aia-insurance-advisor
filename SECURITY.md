# Security Configuration Guide

## 🔐 Firebase Security Setup

### Environment Variables

1. **Never commit real Firebase keys to version control**
2. **Use the provided `.env.example` as a template**
3. **Set up environment variables in your deployment platform**

### Local Development Setup

```bash
# Copy the example file
cp .env.example .env.local

# Edit .env.local with your real Firebase values
# (Your real values are saved in .env.local.backup)
```

### Production Deployment

**For Vercel:**
```bash
# Set environment variables in Vercel dashboard
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
vercel env add NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
# ... etc for all Firebase variables
```

**For Netlify:**
```bash
# Set in Netlify dashboard under Site Settings > Environment Variables
```

## 🛡️ Firebase Security Rules

### Authentication Rules
Set these in Firebase Console > Authentication > Settings:

1. **Authorized Domains:**
   - `localhost` (for development)
   - `your-domain.com` (your production domain)
   - Remove any unnecessary domains

2. **Email Enumeration Protection:** Enable in Firebase Console

### Firestore Security Rules
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Users can only access their own data
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // Insurance data - read only for authenticated users
    match /insurance-data/{document} {
      allow read: if request.auth != null;
      allow write: if false; // Data is managed through admin
    }
    
    // Admin only access
    match /admin/{document} {
      allow read, write: if request.auth != null && 
        request.auth.token.admin == true;
    }
  }
}
```

## 🔒 Additional Security Measures

### 1. API Key Restrictions
In Google Cloud Console:
1. Go to APIs & Services > Credentials
2. Edit your API key
3. Add application restrictions:
   - HTTP referrers: `your-domain.com/*`, `localhost:3000/*`

### 2. Authentication Security
- Enable email verification
- Set up password policies
- Configure multi-factor authentication
- Set session timeout

### 3. Content Security Policy
Add to `next.config.mjs`:
```javascript
const nextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' *.googleapis.com; style-src 'self' 'unsafe-inline' fonts.googleapis.com; font-src 'self' fonts.gstatic.com; img-src 'self' data: https:; connect-src 'self' *.googleapis.com *.firebaseapp.com;"
          }
        ]
      }
    ]
  }
}
```

## 🚨 Security Checklist

- [ ] Real Firebase keys removed from version control
- [ ] Environment variables configured in deployment platform
- [ ] Firebase authorized domains configured
- [ ] Firestore security rules implemented
- [ ] API key restrictions applied
- [ ] Email verification enabled
- [ ] Content Security Policy configured
- [ ] Regular security audits scheduled

## 📞 Emergency Response

If keys are compromised:
1. Immediately regenerate Firebase API keys
2. Update all deployment environments
3. Review Firebase logs for suspicious activity
4. Check user accounts for unauthorized access
5. Consider forcing password resets if necessary