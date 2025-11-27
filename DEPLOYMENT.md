# Deployment Guide

## Overview

This guide explains how to deploy the Horizon Dashboard application to `dashboard.indicator-app.com`.

## Directory Structure

### Local (Development Machine)
- **Build Directory**: `dist/` 
  - This is where Vite builds your production-ready files
  - Created automatically when you run `npm run build`
  - Contains: HTML, CSS, JS, and static assets

### Remote (Production Server)
- **Deployment Directory**: `/var/www/horizon-dashboard`
  - This is where nginx serves your application files
  - Must match the `APP_ROOT` in `nginx.sh`
  - Files should be owned by `www-data:www-data`

## Deployment Process

### Step 1: Setup Nginx (One-time setup on server)

**On your Linux server**, run:

```bash
sudo bash nginx.sh
```

This will:
- Install nginx (if needed)
- Create configuration file for `dashboard.indicator-app.com`
- Set up SSL certificate (Let's Encrypt recommended)
- Configure security headers and optimizations

**Prerequisites:**
- DNS must point `dashboard.indicator-app.com` to your server IP
- Ports 80 and 443 must be open in firewall
- Server must have root/sudo access

### Step 2: Deploy Application Files

**On your local development machine**, run:

```bash
bash deploy.sh
```

Or if you're on Windows (using Git Bash or WSL):

```bash
bash deploy.sh
```

The script will:
1. Clean previous build
2. Install dependencies (if needed)
3. Build the application (`npm run build`)
4. Ask you to choose deployment method

### Deployment Methods

#### Option 1: RSYNC (Recommended)
- Fast and efficient (only transfers changed files)
- Automatically deletes old files on server
- Best for regular updates

**Requirements:**
- SSH access to server
- RSYNC installed on both machines

**Usage:**
```bash
bash deploy.sh
# Choose option 1
# Enter: username, server IP/hostname, deployment path
```

**Example:**
```
Enter remote username: ubuntu
Enter remote host: 192.168.1.100
Enter remote path [/var/www/horizon-dashboard]: (press Enter for default)
```

#### Option 2: SCP
- Simple file copy
- Works if RSYNC is not available
- Slower for large updates

**Usage:**
```bash
bash deploy.sh
# Choose option 2
# Enter: username, server IP/hostname, deployment path
```

#### Option 3: Manual Upload
- Use FTP/SFTP client (FileZilla, WinSCP, etc.)
- Upload contents of `dist/` folder to `/var/www/horizon-dashboard/`

**Steps:**
1. Run `bash deploy.sh` and choose option 3 (or just run `npm run build`)
2. Connect to server via FTP/SFTP
3. Navigate to `/var/www/horizon-dashboard/`
4. Upload all files from local `dist/` folder

#### Option 4: Build Only
- Just builds the app locally
- You handle deployment manually

## Complete Deployment Workflow

### First Time Setup

1. **On Server** - Setup Nginx:
   ```bash
   sudo bash nginx.sh
   # Choose SSL option 1 (Let's Encrypt)
   ```

2. **On Local Machine** - Build and Deploy:
   ```bash
   bash deploy.sh
   # Choose deployment method (1, 2, or 3)
   ```

3. **On Server** - Set correct permissions:
   ```bash
   sudo chown -R www-data:www-data /var/www/horizon-dashboard
   sudo chmod -R 755 /var/www/horizon-dashboard
   ```

4. **Test** - Visit `https://dashboard.indicator-app.com`

### Regular Updates

1. **On Local Machine**:
   ```bash
   bash deploy.sh
   # Choose your preferred method
   ```

2. **On Server** (if needed):
   ```bash
   sudo chown -R www-data:www-data /var/www/horizon-dashboard
   ```

## Environment Variables

**⚠️ IMPORTANT: Set your production API URL before building!**

The application uses environment variables to configure the API endpoint. Without proper configuration, production builds will try to connect to `localhost`, which will fail.

### Setup Environment Files

1. **For Development** (local development):
   Create `.env` file in the project root:
   ```env
   VITE_API_BASE_URL=http://localhost:3000/api
   ```

2. **For Production** (before building):
   Create `.env.production` file in the project root:
   ```env
   VITE_API_BASE_URL=https://api.indicator-app.com/api
   ```
   
   Or if your API is on the same domain:
   ```env
   VITE_API_BASE_URL=/api
   ```

### Important Notes

- **Never commit `.env` or `.env.production` files** to version control (they're in `.gitignore`)
- The `deploy.sh` script will warn you if `.env.production` is missing or contains `localhost`
- If `VITE_API_BASE_URL` is not set in production, the app will default to `/api` (relative path)
- Always verify your API URL before deploying to production

## Directory Summary

| Location | Path | Purpose |
|----------|------|---------|
| **Local Build** | `./dist/` | Production build output (created by Vite) |
| **Remote Deployment** | `/var/www/horizon-dashboard/` | Nginx web root (serves the app) |
| **Nginx Config** | `/etc/nginx/sites-available/dashboard.indicator-app.com` | Server configuration |
| **Nginx Logs** | `/var/log/nginx/dashboard.indicator-app.com-*.log` | Access and error logs |

## Troubleshooting

### Build fails
```bash
# Clean and rebuild
rm -rf dist node_modules
npm install
npm run build
```

### Permission errors on server
```bash
sudo chown -R www-data:www-data /var/www/horizon-dashboard
sudo chmod -R 755 /var/www/horizon-dashboard
```

### Nginx not serving files
```bash
# Check nginx config
sudo nginx -t

# Check nginx status
sudo systemctl status nginx

# View error logs
sudo tail -f /var/log/nginx/dashboard.indicator-app.com-error.log
```

### SSL certificate issues
```bash
# Renew certificate manually
sudo certbot renew

# Check certificate status
sudo certbot certificates
```

### Files not updating
- Clear browser cache
- Check if files were uploaded correctly
- Verify nginx is serving from correct directory

## Quick Reference Commands

### Local (Development)
```bash
# Build only
npm run build

# Build and deploy
bash deploy.sh
```

### Server (Production)
```bash
# Setup nginx (first time)
sudo bash nginx.sh

# Check nginx config
sudo nginx -t

# Reload nginx
sudo systemctl reload nginx

# View logs
sudo tail -f /var/log/nginx/dashboard.indicator-app.com-error.log

# Fix permissions
sudo chown -R www-data:www-data /var/www/horizon-dashboard
```

## Security Checklist

- [ ] SSL certificate installed and auto-renewing
- [ ] Firewall configured (ports 80, 443 open)
- [ ] File permissions set correctly (www-data:www-data)
- [ ] Nginx security headers enabled
- [ ] API endpoints use HTTPS
- [ ] Environment variables secured (not in git)

## Support

If you encounter issues:
1. Check nginx error logs: `/var/log/nginx/dashboard.indicator-app.com-error.log`
2. Verify DNS points to correct server
3. Ensure ports 80/443 are accessible
4. Check file permissions on deployment directory


