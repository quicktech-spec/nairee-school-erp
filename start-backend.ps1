Write-Host "==========================================" -ForegroundColor Cyan
Write-Host " Starting Frappe Education Backend API... " -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
cd "$PSScriptRoot\backend"
node src/server.js
