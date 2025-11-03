# Quick Build Script
# Run this to rebuild the plugin after the fix

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Guestify Media Kit Builder - BUILD" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to plugin directory
$pluginDir = "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"
Set-Location $pluginDir

Write-Host "📂 Working Directory: $pluginDir" -ForegroundColor Yellow
Write-Host ""

# Run build
Write-Host "🔨 Building Vue application..." -ForegroundColor Green
npm run build

# Check if build was successful
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Cyan
    Write-Host "1. Refresh your WordPress builder page" -ForegroundColor White
    Write-Host "2. Try dragging Profile Photo component" -ForegroundColor White
    Write-Host "3. Verify no 'Unknown component type' error" -ForegroundColor White
    Write-Host ""
    Write-Host "Console verification commands:" -ForegroundColor Cyan
    Write-Host "window.gmkbComponentRegistry.has('profile-photo')" -ForegroundColor Gray
    Write-Host "window.gmkbComponentRegistry.getAll().map(c => c.type)" -ForegroundColor Gray
} else {
    Write-Host ""
    Write-Host "❌ BUILD FAILED!" -ForegroundColor Red
    Write-Host "Please check the error messages above." -ForegroundColor Red
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan

# Keep window open
Read-Host "Press Enter to close"
