#!/bin/bash

# Build script for Horizon Dashboard
# This script builds the production-ready application

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
BUILD_DIR="dist"

echo -e "${GREEN}🚀 Starting build process${NC}\n"

# Step 1: Clean previous build
echo -e "${YELLOW}📦 Cleaning previous build...${NC}"
rm -rf $BUILD_DIR
echo -e "${GREEN}✓ Cleaned${NC}\n"

# Step 2: Install dependencies (if needed)
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}\n"
fi

# Step 3: Check for production API URL
echo -e "${YELLOW}🔍 Checking environment configuration...${NC}"
if [ ! -f ".env.production" ]; then
    echo -e "${YELLOW}⚠️  Warning: .env.production file not found!${NC}"
    echo -e "${YELLOW}   The app will use default API URL (localhost or /api)${NC}"
    echo -e "${YELLOW}   Create .env.production with VITE_API_BASE_URL for production API${NC}"
    read -p "Continue anyway? (y/n): " continue_build
    if [ "$continue_build" != "y" ] && [ "$continue_build" != "Y" ]; then
        echo -e "${YELLOW}Build cancelled. Create .env.production and try again.${NC}"
        exit 1
    fi
else
    # Check if VITE_API_BASE_URL is set in .env.production
    if ! grep -q "VITE_API_BASE_URL" .env.production || grep -q "^#.*VITE_API_BASE_URL" .env.production; then
        echo -e "${YELLOW}⚠️  Warning: VITE_API_BASE_URL may not be set in .env.production${NC}"
        echo -e "${YELLOW}   The app may use localhost API URL in production!${NC}"
    else
        API_URL=$(grep "^VITE_API_BASE_URL=" .env.production | cut -d '=' -f2)
        if [[ "$API_URL" == *"localhost"* ]]; then
            echo -e "${RED}❌ ERROR: Production API URL contains 'localhost'!${NC}"
            echo -e "${RED}   Update .env.production with your production API URL${NC}"
            exit 1
        fi
        echo -e "${GREEN}✓ Production API URL configured: ${API_URL}${NC}"
    fi
fi
echo ""

# Step 4: Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build failed! Build directory not found.${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed successfully${NC}\n"

# Step 5: Display build info
BUILD_SIZE=$(du -sh $BUILD_DIR | cut -f1)
echo -e "${GREEN}📊 Build size: ${BUILD_SIZE}${NC}\n"

echo -e "${GREEN}✅ Build process completed!${NC}"
echo -e "${GREEN}📦 Build files are ready in: ${BUILD_DIR}/${NC}\n"
echo -e "${YELLOW}Next steps:${NC}"
echo -e "  Deploy the contents of ${GREEN}${BUILD_DIR}/${NC} to your server"
echo -e "  Default deployment path: ${GREEN}/var/www/horizon-dashboard${NC}\n"

