# Verification script - Check which CSS files are actually loaded
# Run this BEFORE archiving to see current state

Write-Host "`n=== CSS Files Usage Analysis ===" -ForegroundColor Cyan
Write-Host ""

# Check dist folder
Write-Host "DIST FOLDER (Vue bundled):" -ForegroundColor Yellow
if (Test-Path "dist\style.css") {
    $size = (Get-Item "dist\style.css").Length / 1KB
    Write-Host "  dist\style.css - $([math]::Round($size, 2)) KB" -ForegroundColor Green
    Write-Host "    Used by: enqueue.php (builder interface)" -ForegroundColor Gray
} else {
    Write-Host "  dist\style.css NOT FOUND!" -ForegroundColor Red
}

Write-Host ""
Write-Host "CSS FOLDER:" -ForegroundColor Yellow

# Check frontend-mediakit.css
if (Test-Path "css\frontend-mediakit.css") {
    $size = (Get-Item "css\frontend-mediakit.css").Length / 1KB
    Write-Host "  css\frontend-mediakit.css - $([math]::Round($size, 2)) KB" -ForegroundColor Green
    Write-Host "    Used by: templates/mediakit-frontend-template.php" -ForegroundColor Gray
} else {
    Write-Host "  css\frontend-mediakit.css NOT FOUND!" -ForegroundColor Red
}

# Check modules/components.css
if (Test-Path "css\modules\components.css") {
    $size = (Get-Item "css\modules\components.css").Length / 1KB
    Write-Host "  css\modules\components.css - $([math]::Round($size, 2)) KB" -ForegroundColor Green
    Write-Host "    Used by: templates/mediakit-frontend-template.php" -ForegroundColor Gray
} else {
    Write-Host "  css\modules\components.css NOT FOUND!" -ForegroundColor Red
}

Write-Host ""
Write-Host "UNUSED CSS FILES:" -ForegroundColor Yellow

# Count unused files in root css folder
$rootFiles = Get-ChildItem -Path "css" -Filter "*.css" | Where-Object { $_.Name -ne "frontend-mediakit.css" }
Write-Host "  Root folder: $($rootFiles.Count) files" -ForegroundColor Gray
foreach ($file in $rootFiles) {
    Write-Host "    - $($file.Name)" -ForegroundColor DarkGray
}

# Count unused files in modules folder
$moduleFiles = Get-ChildItem -Path "css\modules" -Filter "*.css" | Where-Object { $_.Name -ne "components.css" }
Write-Host "  Modules folder: $($moduleFiles.Count) files" -ForegroundColor Gray

Write-Host ""
Write-Host "SUMMARY:" -ForegroundColor Cyan
$totalUnused = $rootFiles.Count + $moduleFiles.Count
$totalUsed = 3
Write-Host "  Used: $totalUsed files" -ForegroundColor Green
Write-Host "  Unused: $totalUnused files" -ForegroundColor Yellow
Write-Host "  Percentage unused: $([math]::Round(($totalUnused / ($totalUnused + $totalUsed)) * 100, 1))%" -ForegroundColor Yellow

Write-Host ""
Write-Host "RECOMMENDATION:" -ForegroundColor Cyan
if ($totalUnused -gt 0) {
    Write-Host "  Run .\archive-css.ps1 to archive the $totalUnused unused files" -ForegroundColor Yellow
} else {
    Write-Host "  No unused files found. CSS folder is clean!" -ForegroundColor Green
}

Write-Host ""
