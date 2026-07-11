# Docker Connection and Image Pull Fix Guide

## Problem Summary
1. **Docker Desktop is not running** - The Docker daemon is stopped
2. **Cannot pull images from Docker Hub** - Network/connectivity issues with docker.io

## Solution Steps

### Step 1: Start Docker Desktop

1. **Start Docker Desktop:**
   - Search for "Docker Desktop" in Windows Start Menu
   - Click to open Docker Desktop
   - Wait for Docker to fully start (whale icon in system tray should be stable)
   - Verify with: `docker info`

2. **Alternative: Start Docker from command line:**
   ```powershell
   # Start Docker Desktop
   Start-Process "C:\Program Files\Docker\Docker\Docker Desktop.exe"
   ```

### Step 2: Configure Docker Daemon for Better Connectivity

Create or modify Docker daemon configuration to use alternative registries and improve connectivity:

**Location:** `%APPDATA%\Docker\daemon.json` (usually `C:\Users\User\AppData\Roaming\Docker\daemon.json`)

```json
{
  "registry-mirrors": [
    "https://docker.mirrors.ustc.edu.cn",
    "https://hub-mirror.c.163.com",
    "https://mirror.baidubce.com"
  ],
  "features": {
    "buildkit": true
  },
  "experimental": false,
  "max-concurrent-downloads": 3,
  "max-concurrent-uploads": 2
}
```

**After modifying daemon.json:**
1. Click "Apply & Restart" in Docker Desktop settings
2. Or restart Docker Desktop completely

### Step 3: Configure Docker to Use Alternative Base Images

If Docker Hub is not accessible, we can modify the Dockerfiles to use alternative base images or a local registry.

#### Option A: Use AWS ECR Public Mirror (Recommended)

AWS provides a public ECR mirror of Docker Official Images:

```dockerfile
# Instead of: FROM node:24-alpine
# Use: FROM public.ecr.aws/docker/library/node:24-alpine

# Instead of: FROM alpine:latest
# Use: FROM public.ecr.aws/docker/library/alpine:latest

# Instead of: FROM nginx:alpine
# Use: FROM public.ecr.aws/docker/library/nginx:alpine

# Instead of: FROM golang:1.25-alpine
# Use: FROM public.ecr.aws/docker/library/golang:1.25-alpine
```

#### Option B: Use Google's Mirror

```dockerfile
FROM mirror.gcr.io/library/node:24-alpine
FROM mirror.gcr.io/library/alpine:latest
FROM mirror.gcr.io/library/nginx:alpine
FROM mirror.gcr.io/library/golang:1.25-alpine
```

### Step 4: Update All Dockerfiles

I'll create a script to update all Dockerfiles to use the AWS ECR Public mirror:

```bash
# Replace docker.io/library/ with public.ecr.aws/docker/library/
# This can be done with sed or manually
```

### Step 5: Network Configuration

If you're behind a corporate proxy:

1. **Configure Docker Desktop proxy settings:**
   - Open Docker Desktop
   - Go to Settings → Resources → Proxies
   - Configure proxy settings if needed

2. **Or configure in daemon.json:**
   ```json
   {
     "proxies": {
       "default": {
         "httpProxy": "http://proxy.company.com:8080",
         "httpsProxy": "http://proxy.company.com:8080",
         "noProxy": "localhost,127.0.0.1"
       }
     }
   }
   ```

### Step 6: Test Docker Connectivity

```powershell
# Test pulling an image
docker pull public.ecr.aws/docker/library/alpine:latest

# Test building a simple image
docker build -t test-image services/hearse-service/Dockerfile services/hearse-service
```

## Quick Fix Script

I can create automated scripts to:
1. Update all Dockerfiles to use alternative registries
2. Configure Docker daemon settings
3. Start Docker Desktop
4. Test the build

## Alternative: Use Pre-built Images

If image pulling continues to fail, consider:
1. Building images on a machine with internet access
2. Pushing to a local registry
3. Pulling from the local registry

## Verification

After applying fixes:
```powershell
# Verify Docker is running
docker info

# Test image pull
docker pull public.ecr.aws/docker/library/node:24-alpine

# Build your services
docker-compose build
```

## Common Issues

1. **"Cannot connect to the Docker daemon"** → Start Docker Desktop
2. **"net/http: request canceled"** → Network issue, check proxy/firewall
3. **"toomanyrequests"** → Rate limited, use mirrors or wait
4. **"manifest unknown"** → Tag doesn't exist, check image tags

## Next Steps

Would you like me to:
1. Update all Dockerfiles to use AWS ECR Public mirror?
2. Create the daemon.json configuration file?
3. Create a PowerShell script to automate the fix?
4. Provide instructions for setting up a local Docker registry?