# RestPoint Verification Script (PowerShell)
Write-Host "============================================" -ForegroundColor Blue
Write-Host "  RestPoint Verification Script" -ForegroundColor Blue
Write-Host "============================================" -ForegroundColor Blue
Write-Host ""

# Check Docker containers
Write-Host "[INFO] Checking Docker containers..." -ForegroundColor Blue
try {
    \ = docker ps --format "{{.Names}}" 2>&1
    \ = @(
        "restpoint_mariadb", "restpoint_redis", "restpoint_rabbitmq",
        "restpoint_api_gateway", "restpoint_auth_service", "restpoint_tenant_service",
        "restpoint_deceased_service", "restpoint_billing_service", "restpoint_notification_service",
        "restpoint_documents_service", "restpoint_socketio_service", "restpoint_scanner_service",
        "restpoint_mpesa_service", "restpoint_invoice_service", "restpoint_marketplace_service",
        "restpoint_coffin_service", "restpoint_analytics_service", "restpoint_bodycheckout_service",
        "restpoint_edocuments_service", "restpoint_calender_service", "restpoint_chemical_service",
        "restpoint_extra_services", "restpoint_call_service", "restpoint_qrcode_service",
        "restpoint_portal_service", "restpoint_visitors_service", "restpoint_frontend"
    )
    \ = 0
    foreach (\ in \) {
        if (\ -match \) {
            Write-Host "[OK] \ is running" -ForegroundColor Green
            \++
        } else {
            Write-Host "[WARN] \ is NOT running" -ForegroundColor Yellow
        }
    }
    Write-Host ""
    Write-Host "[INFO] Containers running: \/\" -ForegroundColor Blue
} catch {
    Write-Host "[WARN] Docker not available, skipping container check" -ForegroundColor Yellow
}

Write-Host ""

# Check health endpoints
Write-Host "[INFO] Checking health endpoints..." -ForegroundColor Blue
\ = @(
    @{Url="http://localhost:5000/health"; Name="API Gateway"},
    @{Url="http://localhost:5001/health"; Name="Auth Service"},
    @{Url="http://localhost:5002/health"; Name="Tenant Service"},
    @{Url="http://localhost:5003/health"; Name="Deceased Service"},
    @{Url="http://localhost:5020/health"; Name="Billing Service"},
    @{Url="http://localhost:5111/health"; Name="Notification Service"},
    @{Url="http://localhost:5007/health"; Name="Documents Service"},
    @{Url="http://localhost:5013/health"; Name="SocketIO Service"},
    @{Url="http://localhost:5011/health"; Name="MPESA Service"},
    @{Url="http://localhost:5005/health"; Name="Invoice Service"},
    @{Url="http://localhost:5004/health"; Name="Marketplace Service"},
    @{Url="http://localhost:5006/health"; Name="Coffin Service"},
    @{Url="http://localhost:5009/health"; Name="Analytics Service"},
    @{Url="http://localhost:5015/health"; Name="BodyCheckout Service"},
    @{Url="http://localhost:8116/health"; Name="EDocuments Service"},
    @{Url="http://localhost:5010/health"; Name="Calendar Service"},
    @{Url="http://localhost:5105/health"; Name="Chemical Service"},
    @{Url="http://localhost:5016/health"; Name="Extra Services"},
    @{Url="http://localhost:5018/health"; Name="Call Service"},
    @{Url="http://localhost:5012/health"; Name="QRCode Service"},
    @{Url="http://localhost:5019/health"; Name="Portal Service"},
    @{Url="http://localhost:5014/health"; Name="Visitors Service"},
    @{Url="http://localhost:8082/"; Name="Frontend"}
)

\ = 0
foreach (\ in \) {
    try {
        \ = Invoke-WebRequest -Uri \.Url -Method GET -TimeoutSec 3 -UseBasicParsing
        if (\.StatusCode -eq 200 -or \.StatusCode -eq 301 -or \.StatusCode -eq 302) {
            Write-Host "[OK] \ is healthy (\)" -ForegroundColor Green
            \++
        } else {
            Write-Host "[WARN] \ returned \ (\)" -ForegroundColor Yellow
        }
    } catch {
        Write-Host "[WARN] \ is UNHEALTHY (\)" -ForegroundColor Yellow
    }
}

Write-Host ""
Write-Host "[INFO] Healthy endpoints: \/\" -ForegroundColor Blue
Write-Host ""

# Test auth login
Write-Host "[INFO] Testing auth login..." -ForegroundColor Blue
try {
    \ = @{email="admin@example.com"; password="admin123"} | ConvertTo-Json
    \ = Invoke-WebRequest -Uri "http://localhost:5000/v1/restpoint/auth/login" 
        -Method POST -Body \ -ContentType "application/json" -TimeoutSec 5 -UseBasicParsing
    \ = \.Content | ConvertFrom-Json
    if (\.accessToken) {
        Write-Host "[OK] Auth login successful - token received" -ForegroundColor Green
    } elseif (\.success) {
        Write-Host "[OK] Auth login successful" -ForegroundColor Green
    } else {
        Write-Host "[WARN] Auth login response: \" -ForegroundColor Yellow
    }
} catch {
    Write-Host "[WARN] Auth login failed: \" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Blue
Write-Host "  Verification Complete" -ForegroundColor Blue
Write-Host "============================================" -ForegroundColor Blue
