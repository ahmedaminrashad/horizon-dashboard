#!/bin/bash

# Deployment script for Horizon Dashboard
# Domain: dashboard.indicator-app.com

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="dashboard.indicator-app.com"
BUILD_DIR="dist"
REMOTE_USER="${REMOTE_USER:-your-username}"
REMOTE_HOST="${REMOTE_HOST:-your-server.com}"
REMOTE_PATH="${REMOTE_PATH:-/var/www/dashboard}"

echo -e "${GREEN}🚀 Starting deployment to ${DOMAIN}${NC}\n"

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

# Step 5: Deployment method selection
echo -e "${YELLOW}Select deployment method:${NC}"
echo "1) RSYNC (SSH)"
echo "2) SCP (SSH)"
echo "3) Manual (copy files manually)"
echo "4) Skip deployment (build only)"
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
        if [ -z "$REMOTE_PATH" ] || [ "$REMOTE_PATH" == "/var/www/dashboard.indicator-app.com" ]; then
            read -p "Enter remote path [${REMOTE_PATH}]: " input_path
            REMOTE_PATH=${input_path:-$REMOTE_PATH}
        fi
        
        rsync -avz --delete $BUILD_DIR/ ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
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
        if [ -z "$REMOTE_PATH" ] || [ "$REMOTE_PATH" == "/var/www/dashboard.indicator-app.com" ]; then
            read -p "Enter remote path [${REMOTE_PATH}]: " input_path
            REMOTE_PATH=${input_path:-$REMOTE_PATH}
        fi
        
        scp -r $BUILD_DIR/* ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}/
        echo -e "${GREEN}✓ Deployment completed via SCP${NC}"
        ;;
    3)
        echo -e "\n${YELLOW}📋 Manual deployment instructions:${NC}"
        echo -e "Build files are in: ${GREEN}${BUILD_DIR}/${NC}"
        echo -e "Upload the contents of ${BUILD_DIR}/ to: ${GREEN}${REMOTE_PATH}${NC}"
        echo -e "on server: ${GREEN}${REMOTE_HOST}${NC}"
        echo -e "\nYou can use FTP, SFTP, or any file transfer method."
        ;;
    4)
        echo -e "\n${GREEN}✓ Build completed. Skipping deployment.${NC}"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

echo -e "\n${GREEN}✅ Deployment process completed!${NC}"
echo -e "${GREEN}🌐 Your app should be available at: https://${DOMAIN}${NC}\n"

