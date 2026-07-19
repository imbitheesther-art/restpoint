@echo off
REM RestPoint Monitoring Stack - Quick Start Script for Windows
REM This script starts the complete monitoring stack

echo ==========================================
echo RestPoint Monitoring Stack
echo ==========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo X Error: Docker is not running. Please start Docker first.
    pause
    exit /b 1
)

echo + Docker is running

REM Check if docker compose is available (Docker Compose V2)
docker compose version >nul 2>&1
if %errorlevel% neq 0 (
    echo X Error: docker compose is not installed.
    pause
    exit /b 1
)

echo + docker compose is available
echo.

REM Create necessary directories
echo Creating necessary directories...
if not exist "prometheus\alerts" mkdir prometheus\alerts
if not exist "grafana\provisioning\datasources" mkdir grafana\provisioning\datasources
if not exist "grafana\provisioning\dashboards" mkdir grafana\provisioning\dashboards
if not exist "grafana\dashboards" mkdir grafana\dashboards
if not exist "blackbox-exporter" mkdir blackbox-exporter
if not exist "loki" mkdir loki
if not exist "promtail" mkdir promtail

echo + Directories created
echo.

REM Start the monitoring stack
echo Starting monitoring services...
docker compose up -d

REM Wait for services to be ready
echo.
echo Waiting for services to start...
timeout /t 10 /nobreak >nul

REM Check service status
echo.
echo Service Status:
echo ----------------------------------------
docker compose ps

echo.
echo ==========================================
echo Monitoring Stack Started!
echo ==========================================
echo.
echo Access URLs:
echo   Grafana:      http://localhost:3001 (admin / admin123)
echo   Prometheus:   http://localhost:9090
echo   Uptime Kuma:  http://localhost:3002
echo   cAdvisor:     http://localhost:8081
echo   Loki:         http://localhost:3100
echo.
echo Next Steps:
echo   1. Access Grafana and import dashboards (see README.md for dashboard IDs)
echo   2. Configure Uptime Kuma with your notification preferences
echo   3. Add custom metrics to your application (see README.md)
echo   4. Set up alerts in Grafana
echo.
echo To view logs: docker compose logs -f
echo To stop:      docker compose down
echo.
pause