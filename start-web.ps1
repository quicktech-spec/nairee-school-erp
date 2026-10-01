Write-Host "==========================================" -ForegroundColor Green
Write-Host " Starting Frappe Education Web Portal...  " -ForegroundColor Green
Write-Host " URL: http://localhost:5173              " -ForegroundColor Green
Write-Host "==========================================" -ForegroundColor Green
cd "$PSScriptRoot\web"
npm.cmd run dev
