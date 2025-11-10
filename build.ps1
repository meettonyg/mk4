# Quick Build & Test Script
# Run this from PowerShell in the mk4 directory

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "🔨 Building Media Kit Vue Components" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Navigate to correct directory
Set-Location "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

Write-Host "📍 Current directory: $(Get-Location)" -ForegroundColor Yellow
Write-Host ""

# Run build
Write-Host "🏗️  Running npm build..." -ForegroundColor Green
Write-Host ""
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host ""
    Write-Host "📝 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Refresh your WordPress admin page" -ForegroundColor White
    Write-Host "  2. Open Logo Grid component editor" -ForegroundColor White
    Write-Host "  3. Click 'Upload Logo(s)' button" -ForegroundColor White
    Write-Host "  4. Verify MediaUploader modal opens with gallery" -ForegroundColor White
    Write-Host "  5. Test uploading files and selecting from media library" -ForegroundColor White
    Write-Host ""
} else {
    Write-Host ""
    Write-Host "❌ BUILD FAILED - Check errors above" -ForegroundColor Red
    Write-Host ""
}

Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
