# Build Script - Component Controls Visibility Fix V2
# This applies the complete fix including z-index, padding, and visibility overrides

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Component Controls Fix V2 - Build" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to plugin directory
$pluginPath = "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"
Set-Location $pluginPath

Write-Host "Current directory: $((Get-Location).Path)" -ForegroundColor Yellow
Write-Host ""

Write-Host "Changes being applied:" -ForegroundColor Cyan
Write-Host "  1. Increased z-index to 1000" -ForegroundColor White
Write-Host "  2. Added forced visibility overrides (!important)" -ForegroundColor White
Write-Host "  3. Added 50px top padding to sections container" -ForegroundColor White
Write-Host "  4. Added overflow: visible throughout hierarchy" -ForegroundColor White
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
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Hard refresh browser (Ctrl+F5)" -ForegroundColor White
    Write-Host "2. Hover over ANY component" -ForegroundColor White
    Write-Host "3. Controls should now be visible above component" -ForegroundColor White
    Write-Host ""
    Write-Host "What you should see:" -ForegroundColor Cyan
    Write-Host "  - White control bar with blue border" -ForegroundColor White
    Write-Host "  - Component name (Biography, Logo Grid, etc.)" -ForegroundColor White
    Write-Host "  - 5 buttons: Up, Down, Edit, Duplicate, Delete" -ForegroundColor White
    Write-Host ""
    Write-Host "If still not visible:" -ForegroundColor Yellow
    Write-Host "  - Clear browser cache completely" -ForegroundColor White
    Write-Host "  - Try incognito/private browsing mode" -ForegroundColor White
    Write-Host "  - Check browser console (F12) for errors" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Red
    Write-Host ""
}

Write-Host "Press any key to exit..."
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")
