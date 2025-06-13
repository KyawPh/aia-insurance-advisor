# Firebase Hosting Deployment Guide

## 🚀 Quick Deployment

### Prerequisites
- Firebase CLI installed globally: `npm install -g firebase-tools`
- Firebase project created at [Firebase Console](https://console.firebase.google.com)
- Logged into Firebase CLI: `firebase login`

### Step-by-Step Deployment

1. **Login to Firebase** (if not already logged in)
   ```bash
   firebase login
   ```

2. **Create a Firebase Project** (or use existing)
   - Go to [Firebase Console](https://console.firebase.google.com)
   - Click "Add project"
   - Enter project name: `aia-insurance-advisor` (or your preferred name)
   - Follow the setup wizard

3. **Link Local Project to Firebase**
   ```bash
   firebase use --add
   ```
   - Select your Firebase project
   - Enter alias: `default`

4. **Build and Deploy**
   ```bash
   pnpm run deploy
   ```
   Or manually:
   ```bash
   pnpm run build
   firebase deploy --only hosting
   ```

### 🔧 Configuration Files

The project includes these Firebase configuration files:

#### `firebase.json`
```json
{
  "hosting": {
    "public": "out",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [{"source": "**", "destination": "/index.html"}],
    "headers": [...] // Cache optimization headers
  }
}
```

#### `.firebaserc`
```json
{
  "projects": {
    "default": "aia-insurance-advisor"
  }
}
```

#### `next.config.mjs`
Updated with:
- `output: 'export'` - Enables static export
- `trailingSlash: true` - Firebase hosting compatibility
- `images: { unoptimized: true }` - Required for static export

### 📝 Package.json Scripts

Added deployment scripts:
```json
{
  "scripts": {
    "export": "next build",
    "deploy": "npm run export && firebase deploy --only hosting"
  }
}
```

## 🌐 Custom Domain Setup (Optional)

1. **Add Custom Domain in Firebase Console**
   - Go to Firebase Console → Hosting
   - Click "Add custom domain"
   - Enter your domain name
   - Follow DNS configuration instructions

2. **Update DNS Records**
   - Add provided A records to your domain's DNS
   - Firebase will automatically provision SSL certificate

## 🔍 Troubleshooting

### Common Issues

1. **Build Errors**
   ```bash
   # Clear Next.js cache
   rm -rf .next out
   pnpm run build
   ```

2. **Firebase Project Not Found**
   ```bash
   firebase use --add
   # Select correct project
   ```

3. **Permission Errors**
   ```bash
   firebase login --reauth
   ```

4. **404 Errors on Refresh**
   - Ensure `rewrites` are configured in `firebase.json`
   - Single Page Application routing is handled by the rewrite rule

### Environment-Specific Builds

For different environments:

```bash
# Development build
pnpm run build

# Production optimized build
NODE_ENV=production pnpm run build

# Deploy to specific Firebase project
firebase use production
firebase deploy --only hosting
```

## 📊 Performance Optimization

The Firebase configuration includes:

- **Aggressive Caching**: 1-year cache for static assets
- **Compression**: Automatic gzip compression
- **CDN**: Global CDN distribution
- **HTTP/2**: Automatic HTTP/2 support

### Cache Headers
- JavaScript/CSS: `max-age=31536000, immutable`
- Images: `max-age=31536000, immutable`
- HTML: No cache (for updates)

## 🔒 Security Features

- **HTTPS Enforced**: Automatic SSL/TLS
- **Security Headers**: Configured for web security
- **Static Files Only**: No server-side processing risks

## 📈 Monitoring & Analytics

### Firebase Analytics (Optional)
Add to your project:
```bash
firebase init analytics
```

### Performance Monitoring
```bash
firebase init performance
```

## 🚀 Deployment Best Practices

1. **Test Locally First**
   ```bash
   pnpm run build
   firebase emulators:start --only hosting
   ```

2. **Preview Deployments**
   ```bash
   firebase hosting:channel:deploy preview
   ```

3. **Version Management**
   - Firebase keeps deployment history
   - Rollback available in Firebase Console

4. **Automated Deployment** (GitHub Actions)
   ```yaml
   # .github/workflows/deploy.yml
   name: Deploy to Firebase
   on:
     push:
       branches: [main]
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v2
         - uses: actions/setup-node@v2
         - run: npm ci
         - run: npm run build
         - uses: FirebaseExtended/action-hosting-deploy@v0
   ```

## 📞 Support

- **Firebase Documentation**: https://firebase.google.com/docs/hosting
- **Next.js Static Export**: https://nextjs.org/docs/app/building-your-application/deploying/static-exports
- **Firebase CLI Reference**: https://firebase.google.com/docs/cli

---

## 🎉 Post-Deployment Checklist

After successful deployment:

- [ ] Test all pages and functionality
- [ ] Verify mobile responsiveness
- [ ] Test report download functionality
- [ ] Check premium calculations
- [ ] Verify all insurance products load correctly
- [ ] Test form validations
- [ ] Check loading times and performance

Your AIA Insurance Advisor is now live on Firebase! 🚀