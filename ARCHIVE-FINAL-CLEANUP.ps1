# Archive Final Remaining Files
# Moves all remaining non-essential files to archive

$rootDir = "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"
$archiveBase = Join-Path $rootDir "_archive\2025-10-23-root-level-cleanup"

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "  FINAL CLEANUP - NON-ESSENTIAL FILES" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

$totalMoved = 0

# Build Scripts
Write-Host "Moving build scripts..." -ForegroundColor Yellow
$buildScripts = @(
    "ARCHIVE-REMAINING-DOCS.ps1",
    "ARCHIVE-SECTIONSETTINGS.bat",
    "CLASS-NAME-FIX.bat",
    "CLEANUP-ORPHANED-FILES.bat",
    "CREATE-CACHE-CLEAR-SCRIPT.bat",
    "CREATE-PRODUCTION-ZIP.bat",
    "CSS-ARCHITECTURE-BUILD-TEST.bat",
    "EMERGENCY-REBUILD.bat",
    "EXECUTE-ARCHIVAL.ps1",
    "FINAL-FIX-BUILD.bat",
    "FINAL-REBUILD.bat",
    "FIX-BIO-STYLES-AND-BUILD.bat",
    "FIX-BUILD.bat",
    "FIX-FONT-ENCODING-BUILD.bat",
    "JS-OVERRIDE-FIX.bat",
    "MANUAL-VITE-BUILD.bat",
    "REBUILD-FIX.ps1"
)
$buildDir = Join-Path $archiveBase "build-scripts"
foreach ($file in $buildScripts) {
    $source = Join-Path $rootDir $file
    if (Test-Path $source) {
        try {
            Move-Item -Path $source -Destination (Join-Path $buildDir $file) -Force -ErrorAction Stop
            Write-Host "  Moved: $file" -ForegroundColor Green
            $totalMoved++
        }
        catch {
            Write-Host "  Failed: $file" -ForegroundColor Red
        }
    }
}

# Test Scripts
Write-Host "`nMoving test scripts..." -ForegroundColor Yellow
$testScripts = @(
    "verify-component-root.sh",
    "VERIFY-THEME-FIX.sh",
    "test-css-variables.html"
)
$testDir = Join-Path $archiveBase "test-scripts"
foreach ($file in $testScripts) {
    $source = Join-Path $rootDir $file
    if (Test-Path $source) {
        try {
            Move-Item -Path $source -Destination (Join-Path $testDir $file) -Force -ErrorAction Stop
            Write-Host "  Moved: $file" -ForegroundColor Green
            $totalMoved++
        }
        catch {
            Write-Host "  Failed: $file" -ForegroundColor Red
        }
    }
}

# Debug Scripts
Write-Host "`nMoving debug scripts..." -ForegroundColor Yellow
$debugScripts = @(
    "component-error-diagnostic.js"
)
$debugDir = Join-Path $archiveBase "debug-scripts"
foreach ($file in $debugScripts) {
    $source = Join-Path $rootDir $file
    if (Test-Path $source) {
        try {
            Move-Item -Path $source -Destination (Join-Path $debugDir $file) -Force -ErrorAction Stop
            Write-Host "  Moved: $file" -ForegroundColor Green
            $totalMoved++
        }
        catch {
            Write-Host "  Failed: $file" -ForegroundColor Red
        }
    }
}

# Reference Files
Write-Host "`nMoving reference files..." -ForegroundColor Yellow
$refFiles = @(
    "component-compliance-report.json",
    "theme-customizer-preview.html",
    "theme-customizer-preview-v2.html"
)
$refDir = Join-Path $archiveBase "reference"
foreach ($file in $refFiles) {
    $source = Join-Path $rootDir $file
    if (Test-Path $source) {
        try {
            Move-Item -Path $source -Destination (Join-Path $refDir $file) -Force -ErrorAction Stop
            Write-Host "  Moved: $file" -ForegroundColor Green
            $totalMoved++
        }
        catch {
            Write-Host "  Failed: $file" -ForegroundColor Red
        }
    }
}

# Legacy Files
Write-Host "`nMoving legacy files..." -ForegroundColor Yellow
$legacyFiles = @(
    ".deleted-clear-component-cache.php",
    ".deleted-clear-component-cache-web.php",
    "clear-all-caches.php",
    "BASESTYLEPANEL-FIXED-METHODS.js",
    "remove-authority-hook.sql"
)
$legacyDir = Join-Path $archiveBase "legacy-documentation"
foreach ($file in $legacyFiles) {
    $source = Join-Path $rootDir $file
    if (Test-Path $source) {
        try {
            Move-Item -Path $source -Destination (Join-Path $legacyDir $file) -Force -ErrorAction Stop
            Write-Host "  Moved: $file" -ForegroundColor Green
            $totalMoved++
        }
        catch {
            Write-Host "  Failed: $file" -ForegroundColor Red
        }
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Green
Write-Host "  FINAL CLEANUP COMPLETE!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Green
Write-Host ""
Write-Host "Moved $totalMoved files" -ForegroundColor Cyan
Write-Host ""
Write-Host "Essential files remaining at root:" -ForegroundColor Yellow
Write-Host "  - Configuration: 8 files (.gitignore, package.json, etc.)" -ForegroundColor White
Write-Host "  - Documentation: 5 files (README.md, START-HERE-CLEAN.md, etc.)" -ForegroundColor White
Write-Host "  - Scripts: 2 files (BUILD.bat, TEST-ALL.bat)" -ForegroundColor White
Write-Host "  - Core: 1 file (guestify-media-kit-builder.php)" -ForegroundColor White
Write-Host ""
Write-Host "Total at root: ~22 essential files only" -ForegroundColor Green
Write-Host ""
Write-Host "Next: git add -A && git commit -F .git-commit-message-archival-2025-10-23" -ForegroundColor Yellow
Write-Host ""
