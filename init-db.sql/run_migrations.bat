@echo off
echo ========================================
echo Running Database Migrations
echo ========================================
echo.

REM Check if Docker is running
docker info >nul 2>&1
if %errorlevel% neq 0 (
    echo ERROR: Docker is not running. Please start Docker Desktop first.
    pause
    exit /b 1
)

echo [1/3] Creating tenant_tracking database and tables...
docker-compose exec -T mysql mysql -u root -proot_password tenant_tracking < init-db.sql\init.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create tenant_tracking database
    pause
    exit /b 1
)
echo ✓ tenant_tracking database initialized
echo.

echo [2/3] Creating restpoint_main database tables...
docker-compose exec -T mysql mysql -u root -proot_password restpoint_main < init-db.sql\init.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to create restpoint_main tables
    pause
    exit /b 1
)
echo ✓ restpoint_main tables created
echo.

echo [3/3] Running additional migrations...
docker-compose exec -T mysql mysql -u root -proot_password restpoint_main < services\deceased-service\migartions\next-of-kin.sql
if %errorlevel% neq 0 (
    echo ERROR: Failed to run next-of-kin migration
    pause
    exit /b 1
)
echo ✓ Next of kin migration completed
echo.

echo ========================================
echo All migrations completed successfully!
echo ========================================
pause