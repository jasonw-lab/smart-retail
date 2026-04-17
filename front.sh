#!/bin/bash

set -e

# Setup Node.js (Volta)
export VOLTA_HOME="$HOME/.volta"
export PATH="$VOLTA_HOME/bin:$PATH"
echo "node version: $(node -v)"
echo "npm version: $(npm -v)"

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

extract_basepath_from_file() {
    local file="$1"
    local line

    [ -f "$file" ] || return 1

    line="$(grep -E '^[[:space:]]*(export[[:space:]]+)?BASEPATH[[:space:]]*=' "$file" | tail -n 1 || true)"
    [ -n "$line" ] || return 1

    printf '%s\n' "$line" \
        | sed -E "s/^[[:space:]]*(export[[:space:]]+)?BASEPATH[[:space:]]*=[[:space:]]*//; s/[[:space:]]+$//; s/^['\"]//; s/['\"]$//"
}

resolve_basepath() {
    local candidate=""
    local source_file=""

    if [ -n "${BASEPATH:-}" ]; then
        BASEPATH_SOURCE="environment"
        export BASEPATH
        return 0
    fi

    for source_file in \
        "$HOME/.bashrc" \
        "$HOME/.bash_profile" \
        "$HOME/.profile" \
        "$HOME/.zshrc" \
        "$HOME/.zprofile" \
        "$SCRIPT_DIR/platform/docker/.env.prod" \
        "$SCRIPT_DIR/platform/docker/.env"; do
        candidate="$(extract_basepath_from_file "$source_file" || true)"
        if [ -n "$candidate" ]; then
            BASEPATH="$candidate"
            BASEPATH_SOURCE="$source_file"
            export BASEPATH
            return 0
        fi
    done

    return 1
}

resolve_basepath || true

ENV_FILE="${BASEPATH}/nginx/apps-env/mall-retail/platform/docker/.env.prod"

if [ -z "$BASEPATH" ]; then
    echo "Error: BASEPATH is not set"
    echo "Checked environment, shell profile files, and project .env files."
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
echo "BASEPATH source: ${BASEPATH_SOURCE:-unknown}"

# Deploy directory
DEPLOY_DIR="$BASEPATH/nginx/html/retail"

echo "Starting build process for frontend..."

# Navigate to the frontend directory
cd "$SCRIPT_DIR/apps/frontend"

# Install dependencies
echo "Installing dependencies..."
HUSKY=0 pnpm install --frozen-lockfile

# Build production assets without running the slower type-check on VPS.
# Keep type validation in CI or local development instead.
echo "Building the project..."
pnpm build-only

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
