#!/bin/bash

set -e

# Get script directory
SCRIPT_DIR="$( cd "$( dirname "${BASH_SOURCE[0]}" )" && pwd )"

echo "Starting backend deployment..."

# Pull latest changes
git pull

# Navigate to the docker directory
cd "$SCRIPT_DIR/platform/docker"

# Build and start backend
docker compose -f docker-compose-app.yml up -d --build smart-retail-backend

echo ""
echo "=== Backend deployment completed! ==="
