# Directory Cleanup Script
# Cleans up obsolete files from specific directories

Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  DIRECTORY CLEANUP - Media Kit Builder" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""

# Create archive directory
$archive = "CLEANUP-ARCHIVE-2025-01-29/directories"
if (-not (Test-Path $archive)) {
    New-Item -ItemType Directory -Path $archive -Force | Out-Null
}

$total_moved = 0

# ============================================
# 1. Clean /templates directory
# ============================================
Write-Host "1. Cleaning /templates directory..." -ForegroundColor Yellow

$templates_to_archive = @(
    "templates/builder-template.php",
    "templates/builder-template-backup.php",
    "templates/builder-template-simple.php",
    "templates/builder-template-vue.php",
    "templates/media-kit-builder-js-only.php"
)

$templates_moved = 0
foreach ($file in $templates_to_archive) {
    if (Test-Path $file) {
        $destDir = Join-Path $archive "templates"
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Move-Item $file $destDir -Force
        Write-Host "   [MOVE] $(Split-Path $file -Leaf)" -ForegroundColor Gray
        $templates_moved++
    }
}
Write-Host "   Archived: $templates_moved files" -ForegroundColor Cyan
Write-Host ""
$total_moved += $templates_moved

# ============================================
# 2. Archive /scripts directory ENTIRELY
# ============================================
Write-Host "2. Archiving /scripts directory..." -ForegroundColor Yellow

if (Test-Path "scripts") {
    $scripts_count = (Get-ChildItem "scripts" -File).Count
    Move-Item "scripts" $archive -Force
    Write-Host "   [MOVE] Entire scripts/ directory ($scripts_count files)" -ForegroundColor Gray
    Write-Host "   Archived: $scripts_count files" -ForegroundColor Cyan
    $total_moved += $scripts_count
}
else {
    Write-Host "   [SKIP] scripts/ directory not found" -ForegroundColor Gray
}
Write-Host ""

# ============================================
# 3. Clean /tests directory
# ============================================
Write-Host "3. Cleaning /tests directory..." -ForegroundColor Yellow

$tests_to_archive = @(
    "tests/comprehensive-diagnostics.js",
    "tests/diagnostic-fix-tool.js",
    "tests/state-manager-tests.js",
    "tests/vue-integration-debug.js",
    "tests/vue-migration-test-fixed.js",
    "tests/vue-migration-test-suite.js"
)

$tests_moved = 0
foreach ($file in $tests_to_archive) {
    if (Test-Path $file) {
        $destDir = Join-Path $archive "tests"
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Move-Item $file $destDir -Force
        Write-Host "   [MOVE] $(Split-Path $file -Leaf)" -ForegroundColor Gray
        $tests_moved++
    }
}
Write-Host "   Archived: $tests_moved files" -ForegroundColor Cyan
Write-Host ""
$total_moved += $tests_moved

# ============================================
# 4. Clean /docs directory
# ============================================
Write-Host "4. Cleaning /docs directory..." -ForegroundColor Yellow

$docs_to_archive = @(
    "docs/PHASE1-COMPLETE.md",
    "docs/PHASE1-REPORT.md",
    "docs/QUICK-WINS-COMPLETE.md",
    "docs/IMPLEMENTATION-REPORT-FINAL.md",
    "docs/REPORTS-REVIEW-SUMMARY.md",
    "docs/THEME-ID-ALIGNMENT-COMPLETE.md",
    "docs/THEME-SYSTEM-COMPLETE.md",
    "docs/component-schema-completion-report.md",
    "docs/COMPONENT-INVENTORY.md",
    "docs/COMPONENT-LIBRARY-EXECUTION-PROMPTS.md",
    "docs/COMPONENT-LIBRARY-PROJECT-CHECKLIST.md",
    "docs/CONVERSION-PLAN.md",
    "docs/phase-2-state-management.md",
    "docs/BACKUP-CHECKLIST.md",
    "docs/component-inventory.json",
    "docs/component-lifecycle-spec.md",
    "docs/CONSOLE_REFERENCE.md",
    "docs/DATA-FLOW-MAP.md",
    "docs/DYNAMIC_COMPONENT_INTEGRATION.md",
    "docs/MIGRATION_GUIDE.md",
    "docs/RENDERING_EDGE_CASES.md",
    "docs/SCHEMA-VALIDATION.md",
    "docs/SCHEMA_DRIVEN_SYSTEM.md",
    "docs/SCHEMA_FIRST_ARCHITECTURE.md",
    "docs/ARCHITECTURE_REFINEMENTS.md"
)

$docs_moved = 0
foreach ($file in $docs_to_archive) {
    if (Test-Path $file) {
        $destDir = Join-Path $archive "docs"
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Move-Item $file $destDir -Force
        Write-Host "   [MOVE] $(Split-Path $file -Leaf)" -ForegroundColor Gray
        $docs_moved++
    }
}

# Archive subdirectories in docs
$docs_subdirs = @("archive", "fixes", "implementation-plan", "issues")
foreach ($subdir in $docs_subdirs) {
    $path = "docs/$subdir"
    if (Test-Path $path) {
        $destDir = Join-Path $archive "docs"
        if (-not (Test-Path $destDir)) {
            New-Item -ItemType Directory -Path $destDir -Force | Out-Null
        }
        Move-Item $path $destDir -Force
        Write-Host "   [MOVE] $subdir/ directory" -ForegroundColor Gray
        $docs_moved++
    }
}

Write-Host "   Archived: $docs_moved items" -ForegroundColor Cyan
Write-Host ""
$total_moved += $docs_moved

# ============================================
# 5. Delete /js directory (verified unused)
# ============================================
Write-Host "5. Deleting /js directory (verified unused)..." -ForegroundColor Yellow

if (Test-Path "js") {
    $js_count = (Get-ChildItem "js" -Recurse -File).Count
    Remove-Item "js" -Recurse -Force
    Write-Host "   [DELETE] Entire js/ directory ($js_count files)" -ForegroundColor Red
    Write-Host "   Reason: All code moved to /src" -ForegroundColor Gray
}
else {
    Write-Host "   [SKIP] js/ directory already removed" -ForegroundColor Green
}
Write-Host ""

# ============================================
# 6. Delete /logs directory (empty/transient)
# ============================================
Write-Host "6. Deleting /logs directory..." -ForegroundColor Yellow

if (Test-Path "logs") {
    Remove-Item "logs" -Recurse -Force -ErrorAction SilentlyContinue
    Write-Host "   [DELETE] logs/ directory (transient files)" -ForegroundColor Red
}
else {
    Write-Host "   [SKIP] logs/ directory not found" -ForegroundColor Gray
}
Write-Host ""

# ============================================
# Summary
# ============================================
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host "  DIRECTORY CLEANUP COMPLETE" -ForegroundColor Cyan
Write-Host "===================================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Total files archived: $total_moved" -ForegroundColor Cyan
Write-Host "Directories deleted: 2 (js/, logs/)" -ForegroundColor Yellow
Write-Host "Archive location: $archive" -ForegroundColor Cyan
Write-Host ""

# Verify structure
Write-Host "Remaining directories:" -ForegroundColor Cyan
Get-ChildItem -Directory | Select-Object Name | Format-Table -AutoSize

# Verify build still works
Write-Host "Verifying build..." -ForegroundColor Yellow
$buildResult = npm run build 2>&1 | Out-Null
if ($LASTEXITCODE -eq 0) {
    Write-Host "Build: SUCCESS" -ForegroundColor Green
}
else {
    Write-Host "Build: FAILED - Check build output" -ForegroundColor Red
}

Write-Host ""
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Test plugin in WordPress" -ForegroundColor White
Write-Host "2. Review DIRECTORY-CLEANUP-AUDIT.md for details" -ForegroundColor White
Write-Host "3. Commit if everything works" -ForegroundColor White
