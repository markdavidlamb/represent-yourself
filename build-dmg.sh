#!/bin/bash

# Build script for Represent Yourself - macOS DMG
# Run this on your Mac

set -e

echo "========================================"
echo "  Represent Yourself - DMG Builder"
echo "========================================"
echo ""

# Check if running on macOS
if [[ "$(uname)" != "Darwin" ]]; then
    echo "ERROR: This script must be run on macOS to build a DMG"
    exit 1
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed"
    echo "Install it from: https://nodejs.org/"
    exit 1
fi

# Check for npm
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed"
    exit 1
fi

echo "Step 1: Installing dependencies..."
npm install

echo ""
echo "Step 2: Building Next.js app..."
npm run build

echo ""
echo "Step 3: Compiling Electron..."
npm run electron:compile

echo ""
echo "Step 4: Building DMG..."
npx electron-builder --mac

echo ""
echo "========================================"
echo "  BUILD COMPLETE!"
echo "========================================"
echo ""
echo "Your DMG files are in the 'dist' folder:"
ls -la dist/*.dmg 2>/dev/null || echo "(DMG files will be here)"
echo ""
echo "To install: Double-click the DMG and drag the app to Applications"
