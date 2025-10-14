Write-Host "================================================" -ForegroundColor Cyan
Write-Host " Guestify Media Kit Builder - Rebuild Fix" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$pluginPath = "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

# Change to plugin directory
Set-Location $pluginPath
Write-Host "[1/4] Changed to: $pluginPath" -ForegroundColor Green
Write-Host ""

# Clear old build
Write-Host "[2/4] Clearing old build files..." -ForegroundColor Yellow
if (Test-Path "dist\gmkb.iife.js") {
    Remove-Item "dist\gmkb.iife.js" -Force
    Write-Host "      Removed gmkb.iife.js" -ForegroundColor Gray
}
if (Test-Path "dist\gmkb.css") {
    Remove-Item "dist\gmkb.css" -Force
    Write-Host "      Removed gmkb.css" -ForegroundColor Gray
}
Write-Host "      Done!" -ForegroundColor Green
Write-Host ""

# Build
Write-Host "[3/4] Building production bundle..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host ""
    Write-Host "❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host "   Please check the errors above." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

Write-Host "      Done!" -ForegroundColor Green
Write-Host ""

# Verify
Write-Host "[4/4] Verifying build output..." -ForegroundColor Yellow
if (Test-Path "dist\gmkb.iife.js") {
    $size = (Get-Item "dist\gmkb.iife.js").Length / 1MB
    Write-Host "      ✅ JavaScript bundle created ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
} else {
    Write-Host "      ❌ JavaScript bundle missing!" -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

if (Test-Path "dist\gmkb.css") {
    $size = (Get-Item "dist\gmkb.css").Length / 1KB
    Write-Host "      ✅ CSS bundle created ($([math]::Round($size, 2)) KB)" -ForegroundColor Green
} else {
    Write-Host "      ⚠️  CSS bundle missing" -ForegroundColor Yellow
}
Write-Host ""

Write-Host "================================================" -ForegroundColor Green
Write-Host "  ✅ BUILD SUCCESSFUL!" -ForegroundColor Green
Write-Host "================================================" -ForegroundColor Green
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Clear your browser cache (Ctrl + Shift + R)" -ForegroundColor White
Write-Host "2. Reload the media kit editor" -ForegroundColor White
Write-Host "3. Check the browser console" -ForegroundColor White
Write-Host "4. The 'undefined .value' error should be FIXED!" -ForegroundColor White
Write-Host ""
Write-Host "See PODS-ENRICHMENT-ERROR-FIX.md for details." -ForegroundColor Gray
Write-Host ""
Read-Host "Press Enter to exit"
