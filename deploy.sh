#!/bin/bash

# Build script for Horizon Dashboard
# This script: sets default env, pulls latest code, and builds

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="dist"
DEFAULT_API_URL="https://api.indicator-app.com/api"

echo -e "${GREEN}🚀 Starting deployment process${NC}\n"

# Step 1: Set default .env.production
echo -e "${YELLOW}📝 Setting default .env.production...${NC}"
cat > .env.production <<EOF
VITE_API_BASE_URL=${DEFAULT_API_URL}
EOF
echo -e "${GREEN}✓ .env.production configured with: ${DEFAULT_API_URL}${NC}\n"

# Step 2: Pull latest code from git
echo -e "${YELLOW}📥 Pulling latest code from git...${NC}"
git pull
echo -e "${GREEN}✓ Git pull completed${NC}\n"

# Step 3: Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build failed! Build directory not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed successfully${NC}\n"

# Step 4: Display build info
BUILD_SIZE=$(du -sh $BUILD_DIR | cut -f1)
echo -e "${GREEN}📊 Build size: ${BUILD_SIZE}${NC}\n"

echo -e "${GREEN}✅ Deployment process completed!${NC}"
echo -e "${GREEN}📦 Build files are ready in: ${BUILD_DIR}/${NC}\n"
