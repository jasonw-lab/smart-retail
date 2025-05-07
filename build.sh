#!/bin/bash

# Exit on error
set -e

echo "Starting build process for frontend..."

# Navigate to the frontend directory
cd frontend

# Install dependencies
echo "Installing dependencies..."
pnpm install

# Build the project
echo "Building the project..."
pnpm build

# Create target directory if it doesn't exist
echo "Creating target directory if it doesn't exist..."
mkdir -p /mydata/nginx/html/retail

# Copy the built assets to the target directory
echo "Copying built assets to /mydata/nginx/html/retail..."
cp -r dist/* /mydata/nginx/html/retail/

echo "Build and deployment completed successfully!"