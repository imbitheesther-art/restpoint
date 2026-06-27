# Update all services to use published @montezuma packages
# This script replaces workspace dependencies with versioned dependencies

$services = @(
  "analytics-service",
  "api-gateway",
  "auth-service",
  "billing-service",
  "bodycheckout-service",
  "calender-service",
  "call-service",
  "chemical-service",
  "coffin-service",
  "deceased-service",
  "documents-service",
  "edocuments-service",
  "extra-services",
  "invoice-service",
  "marketplace-service",
  "mpesa-service",
  "notification-service",
  "portal-service",
  "qrcode-service",
  "scanner-service",
  "socketio-service",
  "tenant-service",
  "visitors-service"
)

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Updating services to use published packages" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$updatedCount = 0
$skippedCount = 0

foreach ($service in $services) {
  $pkgJson = "services/$service/package.json"
  
  # Check if service exists
  if (-not (Test-Path $pkgJson)) {
    Write-Host "⚠️  Skipping $service (package.json not found)" -ForegroundColor Yellow
    $skippedCount++
    continue
  }
  
  $content = Get-Content $pkgJson -Raw
  $originalContent = $content
  
  # Replace workspace dependencies with versioned dependencies
  $content = $content -replace '"@montezuma/shared-config": "file:../../packages/shared-config"', '"@montezuma/shared-config": "^1.0.0"'
  $content = $content -replace '"@montezuma/shared-logger": "file:../../packages/shared-logger"', '"@montezuma/shared-logger": "^1.0.0"'
  $content = $content -replace '"@montezuma/shared-services": "file:../../packages/shared-services"', '"@montezuma/shared-services": "^1.0.0"'
  $content = $content -replace '"@montezuma/shared-utils": "file:../../packages/shared-utils"', '"@montezuma/shared-utils": "^1.0.0"'
  
  # Check if any changes were made
  if ($content -ne $originalContent) {
    Set-Content $pkgJson $content
    Write-Host "✅ Updated $service" -ForegroundColor Green
    $updatedCount++
  } else {
    Write-Host "⏭️  Skipping $service (already using published packages)" -ForegroundColor Gray
    $skippedCount++
  }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Updated: $updatedCount services" -ForegroundColor Green
Write-Host "Skipped: $skippedCount services" -ForegroundColor Gray
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Review changes in service package.json files" -ForegroundColor White
Write-Host "2. Run 'npm install' from root or each service directory" -ForegroundColor White
Write-Host "3. Test services with 'npm run dev' or 'npm run build'" -ForegroundColor White
Write-Host "4. Publish shared packages if not already done" -ForegroundColor White
Write-Host ""