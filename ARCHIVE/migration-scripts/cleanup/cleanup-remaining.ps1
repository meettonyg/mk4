# Cleanup Remaining Files Script
# Finishes the cleanup by moving Phase 4 files and other remaining obsolete files

Write-Host "Starting cleanup of remaining files..." -ForegroundColor Cyan

# Ensure archive directory exists
if (-not (Test-Path "CLEANUP-ARCHIVE-2025-01-29")) {
    New-Item -ItemType Directory -Path "CLEANUP-ARCHIVE-2025-01-29" -Force | Out-Null
}

$moved_count = 0

# List of remaining files to move
$files_to_move = @(
    "PHASE-4-FIXES-APPLIED.md",
    "PHASE-4-TEST-FAILURES-FIX.md",
    "PHASE-4-VERIFICATION-COMPLETE.md",
    "PHASE-4-INDEX.md",
    "BUGFIX-COMPONENT-MOVE-CONTROLS.md",
    "fix-component.ps1",
    "generate-component-tests.bat"
)

Write-Host "Moving remaining files..." -ForegroundColor Yellow

foreach ($file in $files_to_move) {
    if (Test-Path $file) {
        try {
            Move-Item $file "CLEANUP-ARCHIVE-2025-01-29/" -Force
            Write-Host "  Moved: $file" -ForegroundColor Green
            $moved_count++
        }
        catch {
            Write-Host "  Failed: $file - $($_.Exception.Message)" -ForegroundColor Red
        }
    }
    else {
        Write-Host "  Not found: $file" -ForegroundColor Gray
    }
}

Write-Host ""
Write-Host "Cleanup complete!" -ForegroundColor Green
Write-Host "Files moved: $moved_count" -ForegroundColor Cyan
Write-Host ""

# Show what markdown files remain
Write-Host "Remaining markdown files in root:" -ForegroundColor Yellow
Get-ChildItem *.md | Select-Object Name | Format-Table -AutoSize

# Final count
$total_files = (Get-ChildItem -File).Count
Write-Host "Total files in root directory: $total_files" -ForegroundColor Cyan
