# npm Registry Setup Guide

## Issue: Package Too Large (E413 Error)

Your package is 38.5 MB which exceeds the default Verdaccio limit. Here's how to fix it:

## Solution 1: Restart Verdaccio with New Config (RECOMMENDED)

1. **Stop your current Verdaccio server** (if running)

2. **Copy the config file to Verdaccio's config location:**
   ```bash
   # Windows
   copy verdaccio-config.yaml "%USERPROFILE%\.config\verdaccio\config.yaml"
   
   # Or if Verdaccio is installed globally
   copy verdaccio-config.yaml "C:\Users\BOOK BUNKS\.config\verdaccio\config.yaml"
   ```

3. **Start Verdaccio with the new config:**
   ```bash
   verdaccio --config "%USERPROFILE%\.config\verdaccio\config.yaml"
   ```

4. **Verify it's running:**
   ```bash
   npm whoami --registry http://localhost:4873/
   ```

## Solution 2: Use Docker with Custom Config

If you're running Verdaccio in Docker:

```bash
# Stop existing container
docker stop verdaccio
docker rm verdaccio

# Run with custom config
docker run -d \
  -p 4873:4873 \
  -v $(pwd)/verdaccio-config.yaml:/verdaccio/conf/config.yaml \
  -v verdaccio-storage:/verdaccio/storage \
  --name verdaccio \
  verdaccio/verdaccio:latest
```

## Solution 3: Quick One-Liner (Temporary)

Start Verdaccio with inline config:

```bash
verdaccio --listen 0.0.0.0:4873 --storage ./storage --config <(echo '{"max_body_size": "500mb", "middlewares": {"upload": {"max_file_size": "100mb", "max_body_size": "500mb"}}}')
```

## After Configuring

1. **Login to registry:**
   ```bash
   npm adduser --registry http://localhost:4873/
   # Username: welt
   # Password: 40045355Welttallis
   ```

2. **Publish your package:**
   ```bash
   npm publish --registry http://localhost:4873/
   ```

## What Changed

The new config increases:
- `max_body_size`: 100mb → **500mb**
- `max_file_size`: 10mb → **100mb**
- `upload.max_body_size`: 100mb → **500mb**

This allows your 38.5 MB package to be published successfully.

## Verify Success

After publishing, verify the package is available:

```bash
npm view @montezuma/restpoint --registry http://localhost:4873/
```

You should see:
- name: @montezuma/restpoint
- version: 1.0.0
- description: Restpoint — Modern Kenyan Mortuary Management SaaS Platform

## Troubleshooting

If you still get errors:

1. **Check Verdaccio logs:**
   ```bash
   # If running in Docker
   docker logs verdaccio
   
   # If running locally
   tail -f ~/.config/verdaccio/logs/verdaccio.log
   ```

2. **Restart Verdaccio completely:**
   ```bash
   # Kill all verdaccio processes
   taskkill /F /IM verdaccio.exe  # Windows
   pkill -f verdaccio              # Linux/Mac
   
   # Start fresh
   verdaccio --config ~/.config/verdaccio/config.yaml
   ```

3. **Clear npm cache:**
   ```bash
   npm cache clean --force
   ```

## Auto-Update Setup

Once published, your software can auto-update:

```bash
# Check for updates
node scripts/auto-update.js check

# Update to latest version
node scripts/auto-update.js update

# Setup registry credentials
node scripts/auto-update.js setup