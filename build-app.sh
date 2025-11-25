#!/bin/bash

# Build and deployment script for Horizon Dashboard - Operate
# Domain: operate.indicator-app.com

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="operate.indicator-app.com"
BUILD_DIR="dist"
REMOTE_USER="${REMOTE_USER:-your-username}"
REMOTE_HOST="${REMOTE_HOST:-your-server.com}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/horizon-operate}"

echo -e "${GREEN}🚀 Starting build and deployment for ${DOMAIN}${NC}\n"

# Step 1: Clean previous build
echo -e "${YELLOW}📦 Cleaning previous build...${NC}"
rm -rf $BUILD_DIR
echo -e "${GREEN}✓ Cleaned${NC}\n"

# Step 2: Install dependencies (if needed)
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📥 Installing dependencies...${NC}"
    npm install
    echo -e "${GREEN}✓ Dependencies installed${NC}\n"
else
    echo -e "${BLUE}ℹ️  Dependencies already installed${NC}\n"
fi

# Step 3: Check for environment variables
echo -e "${YELLOW}🔧 Checking environment configuration...${NC}"
if [ -f ".env.production" ]; then
    echo -e "${GREEN}✓ Found .env.production file${NC}"
elif [ -f ".env" ]; then
    echo -e "${YELLOW}⚠️  Found .env file (consider using .env.production for production builds)${NC}"
else
    echo -e "${YELLOW}⚠️  No .env file found. Using default environment variables.${NC}"
fi
echo ""

# Step 4: Build the application
echo -e "${YELLOW}🔨 Building application for production...${NC}"
npm run build

if [ ! -d "$BUILD_DIR" ]; then
    echo -e "${RED}❌ Build failed! Build directory not found.${NC}"
    exit 1
fi

# Verify index.html exists
if [ ! -f "$BUILD_DIR/index.html" ]; then
    echo -e "${RED}❌ Build failed! index.html not found in ${BUILD_DIR}${NC}"
    exit 1
fi

echo -e "${GREEN}✓ Build completed successfully${NC}\n"

# Step 5: Display build info
BUILD_SIZE=$(du -sh $BUILD_DIR | cut -f1)
FILE_COUNT=$(find $BUILD_DIR -type f | wc -l)
echo -e "${GREEN}📊 Build Statistics:${NC}"
echo -e "  Size: ${BUILD_SIZE}"
echo -e "  Files: ${FILE_COUNT}"
echo -e "  Directory: ${BUILD_DIR}/"
echo ""

# Step 6: Deployment method selection
echo -e "${YELLOW}Select deployment method:${NC}"
echo "1) RSYNC (SSH) - Recommended"
echo "2) SCP (SSH)"
echo "3) Manual (copy files manually)"
echo "4) Build only (skip deployment)"
read -p "Enter choice [1-4]: " choice

case $choice in
    1)
        echo -e "\n${YELLOW}📤 Deploying via RSYNC...${NC}"
        if [ -z "$REMOTE_USER" ] || [ "$REMOTE_USER" == "your-username" ]; then
            read -p "Enter remote username: " REMOTE_USER
        fi
        if [ -z "$REMOTE_HOST" ] || [ "$REMOTE_HOST" == "your-server.com" ]; then
            read -p "Enter remote host: " REMOTE_HOST
        fi
        if [ -z "$REMOTE_PATH" ] || [ "$REMOTE_PATH" == "/var/www/horizon-operate" ]; then
            read -p "Enter remote path [${REMOTE_PATH}]: " input_path
            REMOTE_PATH=${input_path:-$REMOTE_PATH}
        fi
        
        echo -e "${BLUE}Syncing files to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/${NC}"
        rsync -avz --delete --progress $BUILD_DIR/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
        echo -e "${GREEN}✓ Deployment completed via RSYNC${NC}"
        ;;
    2)
        echo -e "\n${YELLOW}📤 Deploying via SCP...${NC}"
        if [ -z "$REMOTE_USER" ] || [ "$REMOTE_USER" == "your-username" ]; then
            read -p "Enter remote username: " REMOTE_USER
        fi
        if [ -z "$REMOTE_HOST" ] || [ "$REMOTE_HOST" == "your-server.com" ]; then
            read -p "Enter remote host: " REMOTE_HOST
        fi
        if [ -z "$REMOTE_PATH" ] || [ "$REMOTE_PATH" == "/var/www/horizon-operate" ]; then
            read -p "Enter remote path [${REMOTE_PATH}]: " input_path
            REMOTE_PATH=${input_path:-$REMOTE_PATH}
        fi
        
        echo -e "${BLUE}Copying files to ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/${NC}"
        scp -r $BUILD_DIR/* ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
        echo -e "${GREEN}✓ Deployment completed via SCP${NC}"
        ;;
    3)
        echo -e "\n${YELLOW}📋 Manual deployment instructions:${NC}"
        echo -e "Build files are in: ${GREEN}${BUILD_DIR}/${NC}"
        echo -e "Upload the contents of ${GREEN}${BUILD_DIR}/${NC} to: ${GREEN}${REMOTE_PATH}${NC}"
        echo -e "on server: ${GREEN}${REMOTE_HOST}${NC}"
        echo -e "\nYou can use FTP, SFTP, or any file transfer method."
        echo -e "\n${BLUE}After uploading, set correct permissions on the server:${NC}"
        echo -e "  ${GREEN}sudo chown -R www-data:www-data ${REMOTE_PATH}${NC}"
        echo -e "  ${GREEN}sudo chmod -R 755 ${REMOTE_PATH}${NC}"
        ;;
    4)
        echo -e "\n${GREEN}✓ Build completed. Skipping deployment.${NC}"
        echo -e "${BLUE}Build files are ready in: ${GREEN}${BUILD_DIR}/${NC}"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

# Step 7: Post-deployment instructions
if [ "$choice" != "4" ] && [ "$choice" != "3" ]; then
    echo -e "\n${BLUE}📝 Post-deployment steps (run on server):${NC}"
    echo -e "  1. Set file permissions: ${GREEN}sudo chown -R www-data:www-data ${REMOTE_PATH}${NC}"
    echo -e "  2. Set directory permissions: ${GREEN}sudo chmod -R 755 ${REMOTE_PATH}${NC}"
    echo -e "  3. Reload nginx: ${GREEN}sudo systemctl reload nginx${NC}"
    echo -e "  4. Verify deployment: ${GREEN}ls -la ${REMOTE_PATH}/index.html${NC}"
    echo ""
fi

echo -e "${GREEN}✅ Build and deployment process completed!${NC}"
echo -e "${GREEN}🌐 Your app should be available at: https://${DOMAIN}${NC}\n"

# Display summary
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "  Domain: ${GREEN}${DOMAIN}${NC}"
echo -e "  Build Directory: ${GREEN}${BUILD_DIR}/${NC}"
echo -e "  Remote Path: ${GREEN}${REMOTE_PATH}${NC}"
if [ "$choice" != "4" ] && [ "$choice" != "3" ]; then
    echo -e "  Remote Host: ${GREEN}${REMOTE_HOST}${NC}"
fi
echo ""

