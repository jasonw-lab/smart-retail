#!/bin/bash

set -e

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

echo "Starting backend deployment..."

# Pull latest changes
git pull

# Navigate to the docker directory
cd "$SCRIPT_DIR/platform/docker"

# Build and start backend
docker compose --env-file "$ENV_FILE" -f docker-compose-app.yml up -d --build smart-retail-backend

echo ""
echo "=== Backend deployment completed! ==="
