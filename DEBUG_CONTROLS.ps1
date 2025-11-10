# ================================================================
# DEBUG BUILD: Component Controls Visibility Investigation
# ================================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Building with DEBUG logging..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

Set-Location "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

Write-Host "Running: npm run build" -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "Build Successful!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "DEBUG INSTRUCTIONS:" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "1. Hard refresh (Ctrl+F5)" -ForegroundColor White
    Write-Host "2. Open browser console (F12)" -ForegroundColor White
    Write-Host "3. Hover over ANY component" -ForegroundColor White
    Write-Host "4. Look for these messages:" -ForegroundColor White
    Write-Host ""
    Write-Host "   GREEN CIRCLE - MOUSE ENTER - means hover detected" -ForegroundColor Green
    Write-Host "   GAMEPAD - COMPONENT CONTROLS MOUNTED - means controls rendered" -ForegroundColor Green
    Write-Host "   RED CIRCLE - MOUSE LEAVE - means hover lost" -ForegroundColor Red
    Write-Host ""
    Write-Host "5. Copy ALL console output and share it!" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "LOOK FOR:" -ForegroundColor Cyan
    Write-Host "- Does showControls prop = true?" -ForegroundColor White
    Write-Host "- Does actualComponent exist?" -ForegroundColor White
    Write-Host "- Does isHovered get set to true?" -ForegroundColor White
    Write-Host "- Does showControlsComputed = true?" -ForegroundColor White
    Write-Host "- Does ComponentControls mount?" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "Build Failed!" -ForegroundColor Red
    Write-Host ""
}
