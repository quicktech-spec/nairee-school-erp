Write-Host "==========================================" -ForegroundColor Magenta
Write-Host " Starting Frappe Education Mobile App...  " -ForegroundColor Magenta
Write-Host " Scan QR code with Expo Go on Android!    " -ForegroundColor Magenta
Write-Host "==========================================" -ForegroundColor Magenta
cd "$PSScriptRoot\mobile"
npx.cmd expo start
