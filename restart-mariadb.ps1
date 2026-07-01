# Stop MariaDB service
Write-Host "Stopping MariaDB service..."
Stop-Service MariaDB -Force
Start-Sleep -Seconds 3

# Start with skip-grant-tables
Write-Host "Starting MariaDB with --skip-grant-tables..."
$myini = "C:\Program Files\MariaDB 12.3\data\my.ini"
$tempini = "C:\Program Files\MariaDB 12.3\data\my_temp.ini"
Copy-Item $myini $tempini -Force

# Add skip-grant-tables
$content = Get-Content $myini
$content += "`nskip-grant-tables"
Set-Content $myini $content

# Start the service
Start-Service MariaDB
Start-Sleep -Seconds 5

Write-Host "MariaDB started with skip-grant-tables. Creating user..."
& "C:\Program Files\MariaDB 12.3\bin\mysql.exe" -u root -e "FLUSH PRIVILEGES; DROP USER IF EXISTS 'restpoint_user'@'%'; DROP USER IF EXISTS 'restpoint_user'@'localhost'; CREATE USER 'restpoint_user'@'%' IDENTIFIED BY 'RestPointUser2024'; CREATE USER 'restpoint_user'@'localhost' IDENTIFIED BY 'RestPointUser2024'; GRANT ALL PRIVILEGES ON *.* TO 'restpoint_user'@'%' WITH GRANT OPTION; GRANT ALL PRIVILEGES ON *.* TO 'restpoint_user'@'localhost' WITH GRANT OPTION; FLUSH PRIVILEGES;"

Write-Host "User created. Restoring config and restarting..."
# Restore original config
Copy-Item $tempini $myini -Force
Remove-Item $tempini -Force

# Restart MariaDB normally
Restart-Service MariaDB
Start-Sleep -Seconds 5

Write-Host "MariaDB restarted normally."