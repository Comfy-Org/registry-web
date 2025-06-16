#!/usr/bin/env bash

# Script to build i18n-enabled Next.js application

echo "Building i18n-enabled Next.js application..."

# Step 1: Check for any missing translations
echo "Checking for missing translations..."
node scripts/check-translations.js

# Step 2: Build the application
echo "Building the application..."
npm run build

# Step 3: Output success message
echo "Build completed successfully!"
