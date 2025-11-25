#!/bin/bash

# Nginx configuration script for Horizon Dashboard
# Domain: dashboard.indicator-app.com

set -e  # Exit on error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="dashboard.indicator-app.com"
NGINX_SITES_AVAILABLE="/etc/nginx/sites-available"
NGINX_SITES_ENABLED="/etc/nginx/sites-enabled"
APP_ROOT="/var/www/horizon-dashboard"
CONFIG_FILE="${NGINX_SITES_AVAILABLE}/${DOMAIN}"

echo -e "${GREEN}🔧 Setting up Nginx configuration for ${DOMAIN}${NC}\n"

# Check if running as root
if [ "$EUID" -ne 0 ]; then 
    echo -e "${RED}❌ Please run as root (use sudo)${NC}"
    exit 1
fi

# Check if nginx is installed
if ! command -v nginx &> /dev/null; then
    echo -e "${YELLOW}⚠️  Nginx is not installed. Installing...${NC}"
    apt-get update
    apt-get install -y nginx
    echo -e "${GREEN}✓ Nginx installed${NC}\n"
fi

# Create app directory if it doesn't exist
if [ ! -d "$APP_ROOT" ]; then
    echo -e "${YELLOW}📁 Creating app directory: ${APP_ROOT}${NC}"
    mkdir -p $APP_ROOT
    chown -R www-data:www-data $APP_ROOT
    echo -e "${GREEN}✓ Directory created${NC}\n"
fi

# Create nginx configuration file
echo -e "${YELLOW}📝 Creating Nginx configuration...${NC}"

cat > $CONFIG_FILE <<EOF
# Nginx configuration for ${DOMAIN}
# Horizon Dashboard

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
    root ${APP_ROOT};
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

    # API Proxy (if needed)
    # Uncomment and configure if your API is on a different server
    # location /api {
    #     proxy_pass http://localhost:3000;
    #     proxy_http_version 1.1;
    #     proxy_set_header Upgrade \$http_upgrade;
    #     proxy_set_header Connection 'upgrade';
    #     proxy_set_header Host \$host;
    #     proxy_set_header X-Real-IP \$remote_addr;
    #     proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    #     proxy_set_header X-Forwarded-Proto \$scheme;
    #     proxy_cache_bypass \$http_upgrade;
    # }

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

echo -e "${GREEN}✓ Configuration file created: ${CONFIG_FILE}${NC}\n"

# Create symbolic link to enable site
if [ ! -L "${NGINX_SITES_ENABLED}/${DOMAIN}" ]; then
    echo -e "${YELLOW}🔗 Enabling site...${NC}"
    ln -s $CONFIG_FILE ${NGINX_SITES_ENABLED}/${DOMAIN}
    echo -e "${GREEN}✓ Site enabled${NC}\n"
fi

# Test nginx configuration
echo -e "${YELLOW}🧪 Testing Nginx configuration...${NC}"
if nginx -t; then
    echo -e "${GREEN}✓ Nginx configuration is valid${NC}\n"
else
    echo -e "${RED}❌ Nginx configuration test failed!${NC}"
    echo -e "${YELLOW}Please fix the errors above before proceeding.${NC}"
    exit 1
fi

# SSL Certificate setup
echo -e "${YELLOW}🔒 SSL Certificate Setup${NC}"
echo -e "Choose SSL certificate option:"
echo "1) Use Let's Encrypt (Certbot) - Recommended"
echo "2) Use existing certificate"
echo "3) Skip SSL setup (for testing only)"
read -p "Enter choice [1-3]: " ssl_choice

case $ssl_choice in
    1)
        echo -e "\n${YELLOW}📜 Setting up Let's Encrypt SSL certificate...${NC}"
        
        # Check if certbot is installed
        if ! command -v certbot &> /dev/null; then
            echo -e "${YELLOW}Installing Certbot...${NC}"
            apt-get update
            apt-get install -y certbot python3-certbot-nginx
            echo -e "${GREEN}✓ Certbot installed${NC}\n"
        fi
        
        # Temporarily modify config for Let's Encrypt validation
        echo -e "${YELLOW}Creating temporary HTTP config for certificate validation...${NC}"
        
        # Backup current config
        cp $CONFIG_FILE "${CONFIG_FILE}.backup"
        
        # Create temporary HTTP-only config
        cat > $CONFIG_FILE <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    root ${APP_ROOT};
    index index.html;
    
    location / {
        try_files \$uri \$uri/ /index.html;
    }
    
    location ~ /.well-known/acme-challenge {
        allow all;
    }
}
EOF
        
        # Reload nginx
        systemctl reload nginx
        
        # Obtain certificate
        echo -e "${YELLOW}Obtaining SSL certificate...${NC}"
        certbot certonly --nginx -d ${DOMAIN} -d www.${DOMAIN} --non-interactive --agree-tos --email admin@${DOMAIN} || {
            echo -e "${RED}❌ Failed to obtain SSL certificate${NC}"
            echo -e "${YELLOW}Restoring backup configuration...${NC}"
            mv "${CONFIG_FILE}.backup" $CONFIG_FILE
            systemctl reload nginx
            exit 1
        }
        
        # Restore full config
        cat > $CONFIG_FILE <<EOF
# Nginx configuration for ${DOMAIN}
# Horizon Dashboard

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
    root ${APP_ROOT};
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
        
        # Test and reload
        nginx -t && systemctl reload nginx
        
        # Setup auto-renewal
        echo -e "${YELLOW}Setting up automatic certificate renewal...${NC}"
        (crontab -l 2>/dev/null; echo "0 0,12 * * * certbot renew --quiet --nginx") | crontab -
        echo -e "${GREEN}✓ Auto-renewal configured${NC}\n"
        
        echo -e "${GREEN}✓ SSL certificate installed successfully${NC}\n"
        ;;
    2)
        echo -e "\n${YELLOW}Using existing SSL certificate${NC}"
        read -p "Enter certificate path [/etc/ssl/certs/${DOMAIN}.crt]: " cert_path
        cert_path=${cert_path:-/etc/ssl/certs/${DOMAIN}.crt}
        
        read -p "Enter private key path [/etc/ssl/private/${DOMAIN}.key]: " key_path
        key_path=${key_path:-/etc/ssl/private/${DOMAIN}.key}
        
        # Update config with custom paths
        sed -i "s|ssl_certificate /etc/letsencrypt/live/${DOMAIN}/fullchain.pem;|ssl_certificate ${cert_path};|g" $CONFIG_FILE
        sed -i "s|ssl_certificate_key /etc/letsencrypt/live/${DOMAIN}/privkey.pem;|ssl_certificate_key ${key_path};|g" $CONFIG_FILE
        
        # Remove OCSP stapling if not using Let's Encrypt
        sed -i '/ssl_stapling/,/resolver_timeout/d' $CONFIG_FILE
        
        nginx -t && systemctl reload nginx
        echo -e "${GREEN}✓ Configuration updated with custom certificate${NC}\n"
        ;;
    3)
        echo -e "\n${YELLOW}⚠️  Skipping SSL setup. Using HTTP only (not recommended for production)${NC}"
        # Create HTTP-only config
        cat > $CONFIG_FILE <<EOF
server {
    listen 80;
    listen [::]:80;
    server_name ${DOMAIN} www.${DOMAIN};
    
    root ${APP_ROOT};
    index index.html index.htm;
    
    access_log /var/log/nginx/${DOMAIN}-access.log;
    error_log /var/log/nginx/${DOMAIN}-error.log;
    
    gzip on;
    gzip_vary on;
    gzip_proxied any;
    gzip_comp_level 6;
    gzip_types text/plain text/css text/xml text/javascript application/json application/javascript application/xml+rss application/rss+xml font/truetype font/opentype application/vnd.ms-fontobject image/svg+xml;
    
    location / {
        try_files \$uri \$uri/ /index.html;
        
        location ~* \.(jpg|jpeg|png|gif|ico|css|js|svg|woff|woff2|ttf|eot)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
            access_log off;
        }
    }
    
    location ~ /\. {
        deny all;
        access_log off;
        log_not_found off;
    }
}
EOF
        nginx -t && systemctl reload nginx
        echo -e "${GREEN}✓ HTTP-only configuration applied${NC}\n"
        ;;
    *)
        echo -e "${RED}❌ Invalid choice${NC}"
        exit 1
        ;;
esac

# Reload nginx
echo -e "${YELLOW}🔄 Reloading Nginx...${NC}"
systemctl reload nginx
echo -e "${GREEN}✓ Nginx reloaded${NC}\n"

# Final instructions
echo -e "${GREEN}✅ Nginx configuration completed!${NC}\n"
echo -e "${BLUE}📋 Summary:${NC}"
echo -e "  Domain: ${GREEN}${DOMAIN}${NC}"
echo -e "  Config: ${GREEN}${CONFIG_FILE}${NC}"
echo -e "  App Root: ${GREEN}${APP_ROOT}${NC}"
echo -e "  Logs: ${GREEN}/var/log/nginx/${DOMAIN}-*.log${NC}\n"

echo -e "${BLUE}📝 Next Steps:${NC}"
echo -e "  1. Deploy your application files to: ${GREEN}${APP_ROOT}${NC}"
echo -e "  2. Ensure files are owned by www-data: ${GREEN}chown -R www-data:www-data ${APP_ROOT}${NC}"
echo -e "  3. Test your site: ${GREEN}https://${DOMAIN}${NC}\n"

echo -e "${BLUE}🔧 Useful Commands:${NC}"
echo -e "  View logs: ${GREEN}tail -f /var/log/nginx/${DOMAIN}-error.log${NC}"
echo -e "  Test config: ${GREEN}nginx -t${NC}"
echo -e "  Reload nginx: ${GREEN}systemctl reload nginx${NC}"
echo -e "  Restart nginx: ${GREEN}systemctl restart nginx${NC}\n"

