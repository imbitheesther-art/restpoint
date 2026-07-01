@echo off
chcp 65001 >nul
set MYSQL="C:\Program Files\MariaDB 12.3\bin\mysql.exe"
echo Attempting to connect as root without password...
%MYSQL% -u root -e "SELECT 1" 2>&1
if %ERRORLEVEL% NEQ 0 (
    echo Root access failed. Trying with plugin auth switch...
    %MYSQL% -u root --default-auth=mysql_native_password -e "SELECT 1" 2>&1
)
if %ERRORLEVEL% EQU 0 (
    echo Connected! Creating restpoint_user...
    %MYSQL% -u root < d:\restpoint\fix-db.sql
    echo Done.
) else (
    echo Could not connect as root. Check MariaDB installation.
)
pause