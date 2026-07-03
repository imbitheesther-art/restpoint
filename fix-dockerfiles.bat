@echo off
echo Fixing all service Dockerfiles to remove tsconfig.base.json references...

powershell -Command "Get-ChildItem -Path services -Filter Dockerfile -Recurse | ForEach-Object { $c = Get-Content $_.FullName; $c = $c -replace 'tsconfig\.base\.json\s*', ''; Set-Content $_.FullName $c; Write-Host 'Fixed:' $_.FullName }"

echo.
echo Done! All Dockerfiles have been updated.
pause