# Quick Build & Test Script
# Run this from PowerShell in the mk4 directory

Write-Host "`n========================================" -ForegroundColor Cyan
Write-Host "🔨 Building Media Kit Vue Components" -ForegroundColor Cyan
Write-Host "========================================`n" -ForegroundColor Cyan

# Navigate to correct directory
Set-Location "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

Write-Host "📍 Current directory: $(Get-Location)`n" -ForegroundColor Yellow

# Run build
Write-Host "🏗️  Running npm build...`n" -ForegroundColor Green
npm run build

if ($LASTEXITCODE -eq 0) {
    Write-Host "`n✅ BUILD SUCCESSFUL!" -ForegroundColor Green
    Write-Host "`n📝 Next Steps:" -ForegroundColor Cyan
    Write-Host "  1. Refresh your WordPress admin page" -ForegroundColor White
    Write-Host "  2. Open Profile Photo editor → Advanced tab" -ForegroundColor White
    Write-Host "  3. You should see 'Object Position' with box icons" -ForegroundColor White
    Write-Host "  4. Open Biography editor → Advanced tab" -ForegroundColor White
    Write-Host "  5. You should see 'Text Alignment' with text line icons`n" -ForegroundColor White
} else {
    Write-Host "`n❌ BUILD FAILED - Check errors above" -ForegroundColor Red
}

Write-Host "========================================`n" -ForegroundColor Cyan
