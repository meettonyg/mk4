# Build Script for Component Controls Visibility Fix
# Run this script from PowerShell to apply the CSS changes

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Component Controls Visibility Fix - Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to plugin directory
$pluginPath = "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"
Set-Location $pluginPath

Write-Host "Current directory: $((Get-Location).Path)" -ForegroundColor Yellow
Write-Host ""

# Check if node_modules exists
if (-not (Test-Path "node_modules")) {
    Write-Host "Installing dependencies..." -ForegroundColor Yellow
    npm install
    Write-Host ""
}

# Run the build
Write-Host "Building Vue application..." -ForegroundColor Yellow
npm run build

# Check build status
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Changes applied:" -ForegroundColor Cyan
    Write-Host "- Fixed component controls visibility" -ForegroundColor White
    Write-Host "- Added overflow: visible to component wrapper" -ForegroundColor White
    Write-Host "- Added overflow: visible to section layout containers" -ForegroundColor White
    Write-Host "- Added overflow: visible to drop zones and component lists" -ForegroundColor White
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Refresh your browser" -ForegroundColor White
    Write-Host "2. Hover over a component" -ForegroundColor White
    Write-Host "3. Verify edit controls are now visible" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Red
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
