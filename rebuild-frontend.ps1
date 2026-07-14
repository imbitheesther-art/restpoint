# Rebuild and redeploy frontend with fixed asset paths
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
Write-Host "🌐 Visit https://restpoint.co.ke to verify the fix" -ForegroundColor Green