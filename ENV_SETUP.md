# Environment Variables Setup Guide

## Problem: Production App Reading API from Localhost

If your production app is trying to connect to `localhost:3000/api`, it means the production API URL is not configured correctly.

## Solution: Configure Environment Variables

### Step 1: Create `.env.production` File

Create a file named `.env.production` in the project root directory with your production API URL:

```env
VITE_API_BASE_URL=https://api.indicator-app.com/api
```

**Replace `https://api.indicator-app.com/api` with your actual production API URL.**

### Step 2: Rebuild the Application

After creating `.env.production`, rebuild the application:

```bash
npm run build
```

The build process will use the API URL from `.env.production`.

### Step 3: Deploy

Deploy the new build to your server:

```bash
bash deploy.sh
```

## Environment File Examples

### Development (`.env`)
```env
VITE_API_BASE_URL=http://localhost:3000/api
```

### Production (`.env.production`)
```env
# Option 1: Full URL
VITE_API_BASE_URL=https://api.indicator-app.com/api

# Option 2: Same domain (relative path)
VITE_API_BASE_URL=/api

# Option 3: Different subdomain
VITE_API_BASE_URL=https://backend.indicator-app.com/api
```

## How It Works

- **Development**: When running `npm run dev`, Vite uses `.env` file
- **Production**: When running `npm run build`, Vite uses `.env.production` file
- **Fallback**: If no environment variable is set:
  - Development: defaults to `http://localhost:3000/api`
  - Production: defaults to `/api` (relative path, same domain)

## Verification

After building, you can verify the API URL is correct:

1. Open the built files in `dist/`
2. Search for your API URL in the JavaScript files
3. The URL should match what you set in `.env.production`

## Troubleshooting

### Still seeing localhost in production?

1. **Check if `.env.production` exists** in the project root
2. **Verify the file has the correct format**: `VITE_API_BASE_URL=https://your-api-url.com/api`
3. **Make sure you rebuilt** after creating/updating `.env.production`
4. **Clear browser cache** - old JavaScript files might be cached
5. **Check the build output** - look in `dist/assets/` for the main JS file and search for the API URL

### The deploy script warns about localhost

The `deploy.sh` script now checks for localhost in `.env.production` and will:
- Warn you if the file is missing
- **Stop the build** if it detects `localhost` in the production API URL
- Show you the configured API URL if it's correct

## Security Note

⚠️ **Never commit `.env` or `.env.production` files to version control!**

These files are already in `.gitignore`, but double-check before committing.

