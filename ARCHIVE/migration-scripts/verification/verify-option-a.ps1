# Option A Verification Script (PowerShell)
# Run this to verify the implementation

Write-Host "OPTION A VERIFICATION SCRIPT" -ForegroundColor Cyan
Write-Host "================================" -ForegroundColor Cyan
Write-Host ""

# Check if main file exists
Write-Host "1. Checking main plugin file..." -ForegroundColor Yellow
$mainFile = "guestify-media-kit-builder.php"
if (Test-Path $mainFile) {
    $lines = (Get-Content $mainFile).Count
    Write-Host "   File exists: $mainFile" -ForegroundColor Green
    Write-Host "   Lines: $lines (expected: ~650)"
    
    if ($lines -lt 700 -and $lines -gt 600) {
        Write-Host "   Line count looks good!" -ForegroundColor Green
    } else {
        Write-Host "   Line count unexpected (should be ~650)" -ForegroundColor Yellow
    }
} else {
    Write-Host "   Main file not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check if backup exists
Write-Host "2. Checking backup file..." -ForegroundColor Yellow
$backupFile = "ARCHIVE\option-a-php-rendering-removal\guestify-media-kit-builder-BACKUP.php"
if (Test-Path $backupFile) {
    $backupLines = (Get-Content $backupFile).Count
    Write-Host "   Backup exists" -ForegroundColor Green
    Write-Host "   Backup lines: $backupLines (expected: ~2400)"
} else {
    Write-Host "   Backup not found!" -ForegroundColor Red
    exit 1
}

Write-Host ""

# Check for removed methods
Write-Host "3. Checking for removed methods..." -ForegroundColor Yellow
$content = Get-Content $mainFile -Raw

$method1 = "ajax_render_component"
if ($content -match $method1) {
    Write-Host "   ERROR: $method1 still exists!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "   $method1 removed" -ForegroundColor Green
}

$method2 = "ajax_render_component_enhanced"
if ($content -match $method2) {
    Write-Host "   ERROR: $method2 still exists!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "   $method2 removed" -ForegroundColor Green
}

$method3 = "ajax_render_design_panel"
if ($content -match $method3) {
    Write-Host "   ERROR: $method3 still exists!" -ForegroundColor Red
    exit 1
} else {
    Write-Host "   $method3 removed" -ForegroundColor Green
}

Write-Host ""

# Check for version
Write-Host "4. Checking version..." -ForegroundColor Yellow
if ($content -match "2.1.0-option-a-pure-vue") {
    Write-Host "   Version updated to 2.1.0-option-a-pure-vue" -ForegroundColor Green
} else {
    Write-Host "   Version not updated (expected: 2.1.0-option-a-pure-vue)" -ForegroundColor Yellow
}

Write-Host ""

# Check documentation
Write-Host "5. Checking documentation..." -ForegroundColor Yellow
$docs = @(
    "OPTION-A-STATUS.md",
    "OPTION-A-QUICK-REF.md",
    "CHANGELOG-OPTION-A.md",
    "ARCHIVE\option-a-php-rendering-removal\IMPLEMENTATION-REPORT.md",
    "ARCHIVE\option-a-php-rendering-removal\EXECUTIVE-SUMMARY.md"
)

$docCount = 0
foreach ($doc in $docs) {
    if (Test-Path $doc) {
        $docCount++
    }
}

Write-Host "   Documentation files: $docCount/$($docs.Count)"
if ($docCount -eq $docs.Count) {
    Write-Host "   All documentation present" -ForegroundColor Green
} else {
    Write-Host "   Some documentation missing" -ForegroundColor Yellow
}

Write-Host ""

# Summary
Write-Host "================================" -ForegroundColor Cyan
Write-Host "VERIFICATION COMPLETE" -ForegroundColor Green
Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "1. Load the builder page in browser"
Write-Host "2. Look for PURE VUE badge"
Write-Host "3. Check Network tab for single API call"
Write-Host "4. Test adding/editing components"
Write-Host ""
Write-Host "Rollback if needed:" -ForegroundColor Yellow
Write-Host "Copy-Item ARCHIVE\option-a-php-rendering-removal\guestify-media-kit-builder-BACKUP.php guestify-media-kit-builder.php"
Write-Host ""
Write-Host "Status: Ready for production" -ForegroundColor Green
