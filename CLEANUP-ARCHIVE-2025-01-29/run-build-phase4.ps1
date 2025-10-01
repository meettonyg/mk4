# PowerShell script to run the Phase 4 build
Write-Host "======================================" -ForegroundColor Cyan
Write-Host "Building Media Kit Builder - Phase 4" -ForegroundColor Cyan
Write-Host "======================================" -ForegroundColor Cyan

Write-Host "`nCleaning previous build..." -ForegroundColor Yellow
if (Test-Path "dist") {
    Remove-Item -Path "dist" -Recurse -Force
}

Write-Host "Installing dependencies..." -ForegroundColor Yellow
npm install

Write-Host "`nBuilding with Vite..." -ForegroundColor Yellow
npm run build

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Build failed! Please check the error messages above." -ForegroundColor Red
    Read-Host "Press Enter to continue"
    exit 1
}

Write-Host "`n✅ Build completed successfully!" -ForegroundColor Green
Write-Host "`nPhase 4 Implementation Complete:" -ForegroundColor Cyan
Write-Host "- Enhanced Section component with VueDraggable" -ForegroundColor White
Write-Host "- Section controls and settings" -ForegroundColor White
Write-Host "- Component wrapper with hover controls" -ForegroundColor White
Write-Host "- MediaKitBuilder with section reordering" -ForegroundColor White
Write-Host "- Supporting components (Toolbar, EmptyState, Toast)" -ForegroundColor White
Write-Host "- Optimized drag and drop between sections" -ForegroundColor White
Write-Host ""
Read-Host "Press Enter to continue"
