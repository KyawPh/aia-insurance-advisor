#!/bin/bash

# AIA Insurance Advisor - Firebase Deployment Script
echo "🚀 Starting Firebase deployment for AIA Insurance Advisor..."

# Check if Firebase CLI is installed
if ! command -v firebase &> /dev/null; then
    echo "❌ Firebase CLI not found. Installing..."
    npm install -g firebase-tools
fi

# Check if user is logged in
if ! firebase projects:list &> /dev/null; then
    echo "🔐 Please login to Firebase:"
    firebase login
fi

echo "📦 Building the application..."
pnpm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Check if Firebase project is configured
if [ ! -f ".firebaserc" ]; then
    echo "🔧 Setting up Firebase project..."
    firebase use --add
fi

echo "🚀 Deploying to Firebase Hosting..."
firebase deploy --only hosting

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌐 Your AIA Insurance Advisor is now live!"
    echo ""
    echo "Next steps:"
    echo "1. Test the live application"
    echo "2. Check all features work correctly"
    echo "3. Share the URL with stakeholders"
    echo ""
    firebase hosting:sites:list
else
    echo "❌ Deployment failed. Please check the errors above."
    exit 1
fi