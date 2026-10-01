Write-Host "==========================================================" -ForegroundColor Cyan
Write-Host " Launching Frappe Education School Management Ecosystem   " -ForegroundColor Cyan
Write-Host " - Backend API:  http://localhost:5000                   " -ForegroundColor Yellow
Write-Host " - Web Portal:   http://localhost:5173                   " -ForegroundColor Green
Write-Host " - Mobile Expo:  Available via .\start-mobile.ps1        " -ForegroundColor Magenta
Write-Host "==========================================================" -ForegroundColor Cyan

# Launch backend in a new process
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$PSScriptRoot\start-backend.ps1'"

# Wait 2 seconds for backend initialization
Start-Sleep -Seconds 2

# Launch web in a new process
Start-Process powershell -ArgumentList "-NoExit", "-Command", "& '$PSScriptRoot\start-web.ps1'"

Write-Host "Both Backend and Web servers are now running in their own windows!" -ForegroundColor Green
Write-Host "To run the Mobile app for Android, simply run: .\start-mobile.ps1" -ForegroundColor Yellow
