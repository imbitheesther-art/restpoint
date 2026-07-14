# Rebuild and redeploy frontend with fixes for:
# 1. Asset path 404 errors (vite base path)
# 2. Multi-tenant routing issue (deploymentType detection)
# For Windows PowerShell

Write-Host "🔨 Building frontend Docker image..." -ForegroundColor Cyan
docker-compose build frontend

Write-Host "🚀 Stopping old frontend container..." -ForegroundColor Yellow
docker-compose stop frontend

Write-Host "🗑️  Removing old frontend container..." -ForegroundColor Yellow
docker-compose rm -f frontend

Write-Host "▶️  Starting new frontend container..." -ForegroundColor Green
docker-compose up -d frontend

Write-Host "⏳ Waiting for frontend to be healthy..." -ForegroundColor Cyan
Start-Sleep -Seconds 10

Write-Host "✅ Frontend deployment complete!" -ForegroundColor Green
Write-Host ""
Write-Host "Fixes applied:" -ForegroundColor Cyan
Write-Host "  1. Fixed asset paths - assets now load from root /assets/ instead of tenant subdirectory" -ForegroundColor White
Write-Host "  2. Fixed multi-tenant routing - frontend now respects backend deploymentType setting" -ForegroundColor White
Write-Host ""
Write-Host "🌐 Visit https://restpoint.co.ke/tenant/monezuma-monalisa-funeral-home-nairobi/ to verify" -ForegroundColor Green
