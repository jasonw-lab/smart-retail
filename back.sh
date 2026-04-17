#!/bin/bash

set -e

# Load BASEPATH and other shell envs.
if [ -f "$HOME/.bashrc" ]; then
    # shellcheck source=/dev/null
    source "$HOME/.bashrc"
fi

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

echo "Starting backend deployment..."

# Pull latest changes
git pull

# Navigate to the docker directory
cd "$SCRIPT_DIR/platform/docker"

# Build and start backend
docker compose --env-file "$ENV_FILE" -f docker-compose-app.yml up -d --build smart-retail-backend

echo ""
echo "=== Backend deployment completed! ==="
