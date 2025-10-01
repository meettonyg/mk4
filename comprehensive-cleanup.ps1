# Comprehensive Cleanup Script
# Archives all obsolete files, keeps only essentials

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  COMPREHENSIVE CLEANUP - Media Kit Builder" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Create archive directory
$archive = "CLEANUP-ARCHIVE-2025-01-29"
if (-not (Test-Path $archive)) {
    New-Item -ItemType Directory -Path $archive -Force | Out-Null
}

# Define files to KEEP
$keep_files = @(
    ".gitattributes",
    ".gitignore",
    "guestify-media-kit-builder.php",
    "index.php",
    "package.json",
    "package-lock.json",
    "vite.config.js",
    "vitest.config.js",
    "build.js",
    "README.md",
    "PHASE-5-CHECKLIST.md",
    "PHASE-5-CODE-CHANGES.md",
    "PHASE-5-COMPLETE-REPORT.md",
    "PHASE-5-FINAL-STATUS.md",
    "PHASE-5-IMPLEMENTATION-SUMMARY.md",
    "CLEANUP-PLAN.md",
    "CLEANUP-EXECUTE.md",
    "cleanup-remaining.ps1",
    "comprehensive-cleanup.ps1"
)

Write-Host "Files to keep: $($keep_files.Count)" -ForegroundColor Green
Write-Host ""

# Get all files in root
$all_files = Get-ChildItem -File
$moved_count = 0
$kept_count = 0

Write-Host "Processing $($all_files.Count) files..." -ForegroundColor Yellow
Write-Host ""

foreach ($file in $all_files) {
    if ($keep_files -contains $file.Name) {
        Write-Host "[KEEP] $($file.Name)" -ForegroundColor Green
        $kept_count++
    }
    else {
        try {
            Move-Item $file.FullName $archive -Force
            Write-Host "[MOVE] $($file.Name)" -ForegroundColor Gray
            $moved_count++
        }
        catch {
            Write-Host "[FAIL] $($file.Name) - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  CLEANUP COMPLETE" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Files kept:     $kept_count" -ForegroundColor Green
Write-Host "Files archived: $moved_count" -ForegroundColor Yellow
Write-Host "Archive location: $archive" -ForegroundColor Cyan
Write-Host ""

# Show what remains
Write-Host "Remaining files in root:" -ForegroundColor Cyan
Write-Host ""
Get-ChildItem -File | Format-Table Name, Length -AutoSize

# Verify build still works
Write-Host ""
Write-Host "Verifying build..." -ForegroundColor Yellow
$buildResult = npm run build 2>&1
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build: SUCCESS" -ForegroundColor Green
}
else {
    Write-Host "Build: FAILED" -ForegroundColor Red
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Review remaining files above" -ForegroundColor White
Write-Host "2. Test plugin in WordPress" -ForegroundColor White
Write-Host "3. Commit: git add . && git commit -m 'Cleanup: Archive obsolete files'" -ForegroundColor White
