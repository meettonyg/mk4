# ================================================================
# FIX: Component Controls Not Visible - Z-Index Issue
# ================================================================
# 
# ROOT CAUSE:
# - EditorPanel has z-index: 9999
# - ComponentControls had z-index: 1000
# - When sidebar editor opens, it covered the controls
#
# FIX APPLIED:
# - Increased ComponentControls z-index to 10000
# - Now controls render above EditorPanel overlay
#
# FILES MODIFIED:
# - src/vue/components/builder/ComponentControls.vue
#   Changed z-index: 1000 → z-index: 10000
#
# ================================================================

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Building Vue Bundle with Z-Index Fix..." -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to plugin directory
Set-Location "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

# Run npm build
Write-Host "Running: npm run build" -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Green
    Write-Host "✅ Build Successful!" -ForegroundColor Green
    Write-Host "============================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "NEXT STEPS:" -ForegroundColor Cyan
    Write-Host "1. Hard refresh browser (Ctrl+F5)" -ForegroundColor White
    Write-Host "2. Hover over any component" -ForegroundColor White
    Write-Host "3. Controls should now be visible!" -ForegroundColor White
    Write-Host ""
    Write-Host "If controls still not visible, check:" -ForegroundColor Yellow
    Write-Host "- Browser console for errors" -ForegroundColor White
    Write-Host "- Ensure no browser extensions blocking z-index" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "============================================" -ForegroundColor Red
    Write-Host "❌ Build Failed!" -ForegroundColor Red
    Write-Host "============================================" -ForegroundColor Red
    Write-Host ""
    Write-Host "Check the error messages above and fix any issues." -ForegroundColor Yellow
}
