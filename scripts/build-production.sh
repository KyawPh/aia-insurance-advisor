#!/bin/bash

# Production build script for Insurance Advisor
# This script uses production environment variables for the build

echo "🚀 Starting production build..."

# Check if .env.production exists
if [ ! -f .env.production ]; then
    echo "❌ Error: .env.production file not found!"
    echo "Please create .env.production with your production configuration"
    exit 1
fi

# Backup current .env.local if it exists
if [ -f .env.local ]; then
    echo "📦 Backing up .env.local..."
    cp .env.local .env.local.backup
fi

# Use production environment for build
echo "🔧 Setting up production environment..."
cp .env.production .env.local

# Run the build
echo "🏗️  Building application..."
npm run build

# Check if build was successful
if [ $? -eq 0 ]; then
    echo "✅ Build completed successfully!"
else
    echo "❌ Build failed!"
    # Restore backup if build failed
    if [ -f .env.local.backup ]; then
        cp .env.local.backup .env.local
        rm .env.local.backup
    fi
    exit 1
fi

# Restore original .env.local if backup exists
if [ -f .env.local.backup ]; then
    echo "♻️  Restoring original .env.local..."
    cp .env.local.backup .env.local
    rm .env.local.backup
fi

echo "🎉 Production build complete!"