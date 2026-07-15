@echo off
REM =====================================================
REM CREATE TENANT_TRACKING DATABASE - Windows Batch Script
REM =====================================================

echo.
echo Creating tenant_tracking database and tables...
echo.

REM Check if MySQL is available
mysql --version >nul 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: MySQL client is not installed or not in PATH
    echo Please install MySQL client or run the SQL manually
    pause
    exit /b 1
)

REM Prompt for MySQL root password
set /p MYSQL_PASS="Enter MySQL root password (press Enter if no password): "

REM Run the migration script
if "%MYSQL_PASS%"=="" (
    mysql -u root < init-db.sql\create_tenant_tracking.sql
) else (
    mysql -u root -p%MYSQL_PASS% < init-db.sql\create_tenant_tracking.sql
)

if %ERRORLEVEL% EQU 0 (
    echo.
    echo SUCCESS: tenant_tracking database and tables created!
    echo.
) else (
    echo.
    echo ERROR: Failed to create database. Please check your MySQL credentials.
    echo.
)

pause