# Fix Docker build timeouts for all services
# This script updates all service Dockerfiles to use increased network timeouts

Write-Host "Fixing Docker build timeouts for all services..." -ForegroundColor Green

# List of all service Dockerfiles
$services = @(
    "services/tenant-service/Dockerfile",
    "services/auth-service/Dockerfile",
    "services/deceased-service/Dockerfile",
    "services/hearse-service/Dockerfile",
    "services/invoice-service/Dockerfile",
    "services/workshop-service/Dockerfile",
    "services/chemical-service/Dockerfile",
    "services/leave-service/Dockerfile",
    "services/documents-service/Dockerfile",
    "services/support-service/Dockerfile",
    "services/billing-service/Dockerfile",
    "services/bodycheckout-service/Dockerfile",
    "services/coffin-service/Dockerfile",
    "services/extra-services/Dockerfile",
    "services/scanner-service/Dockerfile",
    "services/notification-service/Dockerfile",
    "services/analytics-service/Dockerfile",
    "services/calender-service/Dockerfile",
    "services/mpesa-service/Dockerfile",
    "services/visitors-service/Dockerfile",
    "services/edocuments-service/Dockerfile",
    "FrontendClient/Dockerfile"
)

foreach ($dockerfile in $services) {
    if (Test-Path $dockerfile) {
        Write-Host "  Updating $dockerfile..." -ForegroundColor Yellow
        
        # Read the file content
        $content = Get-Content $dockerfile -Raw
        
        # Replace yarn install line with timeout-enabled version
        $content = $content -replace 'RUN yarn install --no-lockfile && yarn cache clean', 'RUN yarn config set network-timeout 600000 && yarn install --no-lockfile --network-timeout 600000 && yarn cache clean'
        
        # Also handle npm install if present
        $content = $content -replace 'RUN npm install --production', 'RUN npm config set fetch-retry-maxtimeout 600000 && npm install --production'
        
        # Write the updated content back
        Set-Content $dockerfile $content
        
        Write-Host "    ✓ Updated $dockerfile" -ForegroundColor Green
    } else {
        Write-Host "    ⚠ Skipping $dockerfile (not found)" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host '✅ All Dockerfiles updated with increased network timeouts (600s)' -ForegroundColor Green
Write-Host ""
Write-Host 'To rebuild, run:' -ForegroundColor Cyan
Write-Host '  docker-compose build --no-cache' -ForegroundColor White
Write-Host ""
Write-Host 'Or for individual service:' -ForegroundColor Cyan
Write-Host '  docker-compose build workshop-service' -ForegroundColor White
