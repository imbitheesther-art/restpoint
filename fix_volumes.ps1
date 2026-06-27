$path = 'd:\\new-repo\\docker-compose.yml'
$content = Get-Content $path -Raw
if ($content -notmatch 'loki_data:') {
    $content = $content.TrimEnd() + "`r`n  loki_data:`r`n    driver: local`r`n"
    Set-Content $path -Value $content
    Write-Output "OK: Added loki_data volume."
} else {
    Write-Output "SKIP: loki_data already present."
}
