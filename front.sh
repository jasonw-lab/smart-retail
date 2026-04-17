#!/bin/bash

set -e

# Load BASEPATH and other shell envs.
if [ -f "$HOME/.bashrc" ]; then
    # shellcheck source=/dev/null
    source "$HOME/.bashrc"
fi

# Setup Node.js (Volta)
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
echo "node version: $(node -v)"
echo "npm version: $(npm -v)"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"
ENV_FILE="${BASEPATH}/nginx/apps-env/mall-retail/platform/docker/.env.prod"

if [ -z "$BASEPATH" ]; then
    echo "Error: BASEPATH is not set"
    exit 1
fi

if [ ! -d "$BASEPATH" ]; then
    echo "Error: BASEPATH does not exist: $BASEPATH"
    exit 1
fi

if [ ! -f "$ENV_FILE" ]; then
    echo "Error: .env file not found at $ENV_FILE"
    exit 1
fi

echo "Loaded from: $ENV_FILE"
echo "BASEPATH: $BASEPATH"

# Deploy directory
DEPLOY_DIR="$BASEPATH/nginx/html/retail"

echo "Starting build process for frontend..."

# Pull latest changes
git pull

# Navigate to the frontend directory
cd "$SCRIPT_DIR/apps/frontend"

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Build the project
echo "Building the project..."
pnpm build

# Create target directory
echo "Creating target directory..."
rm -rf "${DEPLOY_DIR:?}"
mkdir -p "$DEPLOY_DIR"

# Copy the built assets to the target directory
echo "Copying built assets to $DEPLOY_DIR..."
cp -r dist/* "$DEPLOY_DIR/"

echo ""
echo "=== Build and deployment completed! ==="
echo "  BASEPATH: $BASEPATH"
echo "  Dist:     $DEPLOY_DIR"
