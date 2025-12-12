#!/bin/bash
# Represent Yourself - Mac Build & Install Script
# Save to Desktop and double-click, or run: bash ~/Desktop/build-and-install.sh

set -e

APP_NAME="Represent Yourself"
REPO="https://github.com/markdavidlamb/represent-yourself.git"
BUILD_DIR="$HOME/dev/represent-yourself"

echo ""
echo "==========================================="
echo "  Building $APP_NAME"
echo "==========================================="
echo ""

# Check for Homebrew
if ! command -v brew &> /dev/null; then
    echo "Installing Homebrew..."
    /bin/bash -c "$(curl -fsSL https://raw.githubusercontent.com/Homebrew/install/HEAD/install.sh)"
fi

# Check for Node.js
if ! command -v node &> /dev/null; then
    echo "Installing Node.js..."
    brew install node
fi

echo "Node.js: $(node -v)"
echo "npm: $(npm -v)"
echo ""

# Clone or pull latest
if [ -d "$BUILD_DIR" ]; then
    echo ">>> Updating existing repo..."
    cd "$BUILD_DIR"
    git fetch origin
    git reset --hard origin/main
else
    echo ">>> Cloning repo..."
    mkdir -p "$HOME/dev"
    git clone "$REPO" "$BUILD_DIR"
    cd "$BUILD_DIR"
fi

# Clean previous build
echo ">>> Cleaning previous build..."
rm -rf .next out dist 2>/dev/null

# Install dependencies
echo ">>> Installing dependencies..."
npm install

# Build Next.js
echo ">>> Building Next.js..."
npm run build

# Compile Electron TypeScript
echo ">>> Compiling Electron..."
npx tsc -p electron/tsconfig.json

# Build Mac app
echo ">>> Building Mac App..."
npx electron-builder --mac

# Find the built app
APP_PATH=$(find dist -name "*.app" -type d 2>/dev/null | head -1)

if [ -n "$APP_PATH" ]; then
    echo ""
    echo ">>> Installing to Applications..."

    # Close app if running
    osascript -e "quit app \"$APP_NAME\"" 2>/dev/null || true
    sleep 1

    # Remove old version
    rm -rf "/Applications/$APP_NAME.app" 2>/dev/null

    # Copy new version
    cp -R "$APP_PATH" "/Applications/"

    echo ""
    echo "==========================================="
    echo "  SUCCESS!"
    echo "==========================================="
    echo ""
    echo "  Installed to: /Applications/$APP_NAME.app"
    echo ""
    echo "  Opening app..."
    echo ""

    # Open the app
    open "/Applications/$APP_NAME.app"
else
    echo ""
    echo "Build complete! Check: $BUILD_DIR/dist/"
    open "$BUILD_DIR/dist"
fi
