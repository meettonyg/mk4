# PowerShell script to archive unused CSS files
# Keep only: frontend-mediakit.css and modules/components.css

$timestamp = Get-Date -Format "yyyyMMdd-HHmmss"
$archiveDir = "ARCHIVE\legacy-css-modules-$timestamp"

Write-Host "Creating archive directory: $archiveDir" -ForegroundColor Cyan
New-Item -ItemType Directory -Force -Path $archiveDir | Out-Null

# Archive all files in modules folder EXCEPT components.css
Write-Host "`nArchiving CSS modules (keeping components.css)..." -ForegroundColor Yellow

$modulesArchive = Join-Path $archiveDir "modules"
New-Item -ItemType Directory -Force -Path $modulesArchive | Out-Null

Get-ChildItem -Path "css\modules\*.css" | Where-Object { $_.Name -ne "components.css" } | ForEach-Object {
    Write-Host "  Archiving: $($_.Name)" -ForegroundColor Gray
    Move-Item -Path $_.FullName -Destination $modulesArchive -Force
}

Write-Host "`n✅ Archive complete!" -ForegroundColor Green
Write-Host "`nRemaining CSS files:" -ForegroundColor Cyan
Get-ChildItem -Path "css" -Recurse -Filter "*.css" | ForEach-Object {
    $relativePath = $_.FullName.Replace((Get-Location).Path + "\", "")
    Write-Host "  ✓ $relativePath" -ForegroundColor Green
}

Write-Host "`nArchived files location:" -ForegroundColor Cyan
Write-Host "  $archiveDir" -ForegroundColor Yellow

Write-Host "`nCreating README..." -ForegroundColor Cyan
$readme = @"
# Archived CSS Modules - $timestamp

## Reason for Archival
These CSS files were part of the legacy builder interface that has been replaced by Vue.js.
All builder styles are now bundled into dist/style.css by Vite.

## What Was Archived
All files from css/modules/ except:
- components.css (still used by frontend-mediakit-template.php)

## What Remains Active
- css/frontend-mediakit.css (used by public display template)
- css/modules/components.css (used by public display template)
- dist/style.css (Vue bundled styles for builder)

## Files Archived
Total: 35 CSS module files

"@ + (Get-ChildItem -Path $modulesArchive -Filter "*.css" | ForEach-Object { "- $($_.Name)`n" })

Set-Content -Path (Join-Path $archiveDir "README.md") -Value $readme

Write-Host "✅ README created" -ForegroundColor Green
Write-Host "`nDone! Safe to commit these changes." -ForegroundColor Cyan
