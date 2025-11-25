#!/bin/bash

# Let's Encrypt SSL Certificate Setup Script
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
EMAIL="${SSL_EMAIL:-admin@${DOMAIN}}"
NGINX_CONFIG="/etc/nginx/sites-available/${DOMAIN}"

echo -e "${GREEN}🔒 Setting up Let's Encrypt SSL Certificate for ${DOMAIN}${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

# Check if domain is provided
if [ -z "$DOMAIN" ]; then
    echo -e "${RED}❌ Domain is required${NC}"
    exit 1
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${RED}❌ Nginx is not installed. Please install nginx first.${NC}"
    exit 1
fi

# Check if nginx config exists
if [ ! -f "$NGINX_CONFIG" ]; then
    echo -e "${YELLOW}⚠️  Nginx configuration file not found: ${NGINX_CONFIG}${NC}"
    echo -e "${YELLOW}Please run nginx-operate.sh first to create the configuration.${NC}"
    exit 1
fi

# Check if certbot is installed
if ! command -v certbot &> /dev/null; then
    echo -e "${YELLOW}📦 Installing Certbot...${NC}"
    apt-get update
    apt-get install -y certbot python3-certbot-nginx
    echo -e "${GREEN}✓ Certbot installed${NC}\n"
else
    echo -e "${GREEN}✓ Certbot is already installed${NC}\n"
fi

# Backup nginx config
echo -e "${YELLOW}📋 Backing up nginx configuration...${NC}"
cp "$NGINX_CONFIG" "${NGINX_CONFIG}.backup.$(date +%Y%m%d_%H%M%S)"
echo -e "${GREEN}✓ Backup created${NC}\n"

# Check if certificate already exists
if [ -d "/etc/letsencrypt/live/${DOMAIN}" ]; then
    echo -e "${YELLOW}⚠️  Certificate already exists for ${DOMAIN}${NC}"
    read -p "Do you want to renew/reinstall? (y/n): " renew_choice
    if [ "$renew_choice" != "y" ] && [ "$renew_choice" != "Y" ]; then
        echo -e "${YELLOW}Exiting. Certificate already exists.${NC}"
        exit 0
    fi
fi

# Ensure HTTP server block exists for validation
echo -e "${YELLOW}🔧 Ensuring HTTP server block is configured for validation...${NC}"

# Check if HTTP block exists and allows .well-known
if ! grep -q "location ~ /.well-known/acme-challenge" "$NGINX_CONFIG"; then
    echo -e "${YELLOW}Adding .well-known location block for Let's Encrypt validation...${NC}"
    
    # Create temporary HTTP-only config for validation
    cat > "$NGINX_CONFIG" <<EOF
# Temporary HTTP config for Let's Encrypt validation
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    root /var/www/horizon-dashboard/dist;
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location ~ /.well-known/acme-challenge {
        allow all;
        root /var/www/html;
    }
}
EOF
    
    # Test and reload nginx
    nginx -t && systemctl reload nginx
    echo -e "${GREEN}✓ Temporary HTTP config applied${NC}\n"
fi

# Obtain certificate
echo -e "${YELLOW}📜 Obtaining SSL certificate for ${DOMAIN}...${NC}"
echo -e "${BLUE}This may take a few moments...${NC}\n"

certbot certonly \
    --nginx \
    --non-interactive \
    --agree-tos \
    --email "$EMAIL" \
    -d "$DOMAIN" \
    -d "www.${DOMAIN}" \
    --expand || {
    echo -e "${RED}❌ Failed to obtain SSL certificate${NC}"
    echo -e "${YELLOW}Restoring backup configuration...${NC}"
    mv "${NGINX_CONFIG}.backup"* "$NGINX_CONFIG" 2>/dev/null || true
    systemctl reload nginx
    exit 1
}

echo -e "${GREEN}✓ SSL certificate obtained successfully${NC}\n"

# Restore full nginx configuration with SSL
echo -e "${YELLOW}🔧 Restoring full nginx configuration with SSL...${NC}"

cat > "$NGINX_CONFIG" <<EOF
# Nginx configuration for ${DOMAIN}
# Horizon Dashboard - Operate

# HTTP Server - Redirect to HTTPS
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};

    # Redirect all HTTP requests to HTTPS
    return 301 https://\$server_name\$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    server_name ${DOMAIN} www.${DOMAIN};

    # SSL Configuration (Let's Encrypt)
    ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;
    
    # SSL Security Settings
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers 'ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256:ECDHE-ECDSA-AES256-GCM-SHA384:ECDHE-RSA-AES256-GCM-SHA384:ECDHE-ECDSA-CHACHA20-POLY1305:ECDHE-RSA-CHACHA20-POLY1305:DHE-RSA-AES128-GCM-SHA256:DHE-RSA-AES256-GCM-SHA384';
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    ssl_session_tickets off;
    
    # OCSP Stapling
    ssl_stapling on;
    ssl_stapling_verify on;
    ssl_trusted_certificate /etc/letsencrypt/live/${DOMAIN}/chain.pem;
    resolver 8.8.8.8 8.8.4.4 valid=300s;
    resolver_timeout 5s;

    # Security Headers
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "no-referrer-when-downgrade" always;

    # Root directory
    root /var/www/horizon-dashboard/dist;
    index index.html index.htm;

    # Logging
    access_log /var/log/nginx/${DOMAIN}-access.log;
    error_log /var/log/nginx/${DOMAIN}-error.log;

    # Gzip Compression
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;

    # Main location block
    location / {
        try_files \$uri \$uri/ /index.html;
        
        # Cache static assets
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }

    # Deny access to hidden files
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }

    # Deny access to backup files
    location ~ ~$ {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF

# Test nginx configuration
echo -e "${YELLOW}🧪 Testing nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}\n"
else
    echo -e "${RED}❌ Nginx configuration test failed!${NC}"
    echo -e "${YELLOW}Restoring backup...${NC}"
    mv "${NGINX_CONFIG}.backup"* "$NGINX_CONFIG" 2>/dev/null || true
    exit 1
fi

# Reload nginx
echo -e "${YELLOW}🔄 Reloading nginx...${NC}"
systemctl reload nginx
echo -e "${GREEN}✓ Nginx reloaded${NC}\n"

# Setup auto-renewal
echo -e "${YELLOW}🔄 Setting up automatic certificate renewal...${NC}"
(crontab -l 2>/dev/null | grep -v "certbot renew" ; echo "0 0,12 * * * certbot renew --quiet --nginx") | crontab -
echo -e "${GREEN}✓ Auto-renewal configured (runs twice daily)${NC}\n"

# Test renewal (dry run)
echo -e "${YELLOW}🧪 Testing certificate renewal (dry run)...${NC}"
certbot renew --dry-run
echo -e "${GREEN}✓ Renewal test successful${NC}\n"

# Final summary
echo -e "${GREEN}✅ Let's Encrypt SSL setup completed successfully!${NC}\n"
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "  Domain: ${GREEN}${DOMAIN}${NC}"
echo -e "  Certificate: ${GREEN}/etc/letsencrypt/live/${DOMAIN}/fullchain.pem${NC}"
echo -e "  Private Key: ${GREEN}/etc/letsencrypt/live/${DOMAIN}/privkey.pem${NC}"
echo -e "  Auto-renewal: ${GREEN}Enabled (runs at 00:00 and 12:00 daily)${NC}"
echo -e "  Nginx Config: ${GREEN}${NGINX_CONFIG}${NC}\n"

echo -e "${BLUE}🔗 Your site should now be accessible at:${NC}"
echo -e "  ${GREEN}https://${DOMAIN}${NC}\n"

echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo -e "  Test renewal: ${GREEN}certbot renew --dry-run${NC}"
echo -e "  Renew manually: ${GREEN}certbot renew${NC}"
echo -e "  Check certificate: ${GREEN}certbot certificates${NC}"
echo -e "  Revoke certificate: ${GREEN}certbot revoke --cert-path /etc/letsencrypt/live/${DOMAIN}/cert.pem${NC}\n"

