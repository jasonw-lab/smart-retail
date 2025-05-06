#!/bin/bash

# This script cleans up Redis data to resolve RDB format compatibility issues

echo "Stopping Redis container if running..."
docker stop youlai-redis || true

echo "Cleaning up Redis data directory..."
rm -rf /mydata/redis/data/*

echo "Redis data directory has been cleaned. You can now restart the Redis container."
echo "Use 'docker-compose -f docker-compose-env.yml up -d redis' to start Redis with a clean state."