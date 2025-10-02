# System Directory Audit - Verification Script
# Run this to determine which files are actually used

Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   System Directory Audit" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

$PluginRoot = "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"
Set-Location $PluginRoot

# ========================================
# 1. CHECK COMPONENTLOADER/DESIGNPANEL STATUS
# ========================================
Write-Host "1. Checking Already-Archived Files" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Gray

$legacyFiles = @(
    @{Path="system\ComponentLoader.php"; Name="ComponentLoader.php"},
    @{Path="system\DesignPanel.php"; Name="DesignPanel.php"}
)

foreach ($file in $legacyFiles) {
    if (Test-Path $file.Path) {
        Write-Host "   WARNING: $($file.Name) (should be archived)" -ForegroundColor Red
        Write-Host "      Location: $($file.Path)" -ForegroundColor Gray
    } else {
        Write-Host "   ARCHIVED: $($file.Name)" -ForegroundColor Green
    }
}

# ========================================
# 2. CHECK VUE IMPORTS FROM SYSTEM/
# ========================================
Write-Host ""
Write-Host "2. Checking Vue Imports from system/" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Gray

$vueImports = Get-ChildItem -Path "src" -Recurse -Include "*.js","*.vue" -ErrorAction SilentlyContinue | 
    Select-String -Pattern "from\s+['\`"].*system/" -ErrorAction SilentlyContinue

if ($vueImports) {
    Write-Host "   WARNING: FOUND Vue imports from system/:" -ForegroundColor Yellow
    $vueImports | ForEach-Object {
        Write-Host "      $($_.Path):$($_.LineNumber)" -ForegroundColor Gray
        Write-Host "      -> $($_.Line.Trim())" -ForegroundColor White
    }
} else {
    Write-Host "   NO Vue imports from system/ found" -ForegroundColor Green
    Write-Host "      -> All system/*.js files appear to be legacy!" -ForegroundColor Gray
}

# ========================================
# 3. CHECK PHP ABSTRACT CLASS USAGE
# ========================================
Write-Host ""
Write-Host "3. Checking PHP Abstract Class Usage" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Gray

$phpUsage = Get-ChildItem -Path "includes","system" -Recurse -Include "*.php" -ErrorAction SilentlyContinue | 
    Select-String -Pattern "Abstract_Component_Integration|Component_Integration_Registry" -ErrorAction SilentlyContinue

if ($phpUsage) {
    Write-Host "   WARNING: FOUND usage:" -ForegroundColor Yellow
    $phpUsage | ForEach-Object {
        Write-Host "      $($_.Path):$($_.LineNumber)" -ForegroundColor Gray
        Write-Host "      -> $($_.Line.Trim())" -ForegroundColor White
    }
} else {
    Write-Host "   NO usage found" -ForegroundColor Green
    Write-Host "      -> Abstract_Component_Integration.php appears unused" -ForegroundColor Gray
    Write-Host "      -> Component_Integration_Registry.php appears unused" -ForegroundColor Gray
}

# ========================================
# 4. LIST ALL SYSTEM FILES
# ========================================
Write-Host ""
Write-Host "4. System Directory Contents" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Gray

$systemFiles = Get-ChildItem -Path "system" -File -ErrorAction SilentlyContinue
$systemFileCount = ($systemFiles | Measure-Object).Count

Write-Host "   Total files: $systemFileCount" -ForegroundColor Cyan
Write-Host ""

# Group by extension
$phpFiles = $systemFiles | Where-Object { $_.Extension -eq ".php" }
$jsFiles = $systemFiles | Where-Object { $_.Extension -eq ".js" }
$cssFiles = $systemFiles | Where-Object { $_.Extension -eq ".css" }

Write-Host "   PHP Files: $($phpFiles.Count)" -ForegroundColor White
$phpFiles | ForEach-Object {
    $sizeKB = [math]::Round($_.Length / 1KB, 2)
    Write-Host "      - $($_.Name) - ${sizeKB} KB" -ForegroundColor Gray
}

Write-Host ""
Write-Host "   JavaScript Files: $($jsFiles.Count)" -ForegroundColor White
$jsFiles | ForEach-Object {
    $sizeKB = [math]::Round($_.Length / 1KB, 2)
    Write-Host "      - $($_.Name) - ${sizeKB} KB" -ForegroundColor Gray
}

if ($cssFiles.Count -gt 0) {
    Write-Host ""
    Write-Host "   CSS Files: $($cssFiles.Count)" -ForegroundColor White
    $cssFiles | ForEach-Object {
        $sizeKB = [math]::Round($_.Length / 1KB, 2)
        Write-Host "      - $($_.Name) - ${sizeKB} KB" -ForegroundColor Gray
    }
}

# ========================================
# 5. CHECK FILES LOADED BY PLUGIN
# ========================================
Write-Host ""
Write-Host "5. Files Explicitly Loaded by Plugin" -ForegroundColor Yellow
Write-Host "-----------------------------------" -ForegroundColor Gray

$mainPlugin = Get-Content "guestify-media-kit-builder.php" -Raw
$enqueueFile = Get-Content "includes\enqueue.php" -Raw -ErrorAction SilentlyContinue

$loadedFiles = @()

# Check main plugin file
if ($mainPlugin -match "system/ComponentDiscovery\.php") {
    $loadedFiles += "ComponentDiscovery.php"
}
if ($mainPlugin -match "system/Base_Component_Data_Service\.php") {
    $loadedFiles += "Base_Component_Data_Service.php"
}
if ($mainPlugin -match "system/version-control/VersionManager\.php") {
    $loadedFiles += "VersionManager.php"
}

# Check enqueue file
if ($enqueueFile -and $enqueueFile -match "system/ThemeDiscovery\.php") {
    $loadedFiles += "ThemeDiscovery.php"
}

if ($loadedFiles.Count -gt 0) {
    Write-Host "   Actively loaded:" -ForegroundColor Green
    $loadedFiles | ForEach-Object {
        Write-Host "      - $_" -ForegroundColor White
    }
} else {
    Write-Host "   WARNING: No system files found in load statements" -ForegroundColor Yellow
}

# ========================================
# 6. SUMMARY & RECOMMENDATIONS
# ========================================
Write-Host ""
Write-Host "================================================" -ForegroundColor Cyan
Write-Host "   Summary & Recommendations" -ForegroundColor Cyan
Write-Host "================================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Analysis:" -ForegroundColor Cyan
Write-Host "   - Total system files: $systemFileCount" -ForegroundColor White
Write-Host "   - Actively loaded: $($loadedFiles.Count)" -ForegroundColor White
Write-Host "   - Potentially unused: $($systemFileCount - $loadedFiles.Count)" -ForegroundColor White
Write-Host ""

Write-Host "Files to KEEP:" -ForegroundColor Green
Write-Host "   - ComponentDiscovery.php" -ForegroundColor White
Write-Host "   - ThemeDiscovery.php" -ForegroundColor White
Write-Host "   - Base_Component_Data_Service.php" -ForegroundColor White
Write-Host "   - version-control/VersionManager.php" -ForegroundColor White
Write-Host ""

if (!$vueImports) {
    Write-Host "Likely LEGACY (Archive candidates):" -ForegroundColor Yellow
    Write-Host "   - ALL JavaScript files in system/ ($($jsFiles.Count) files)" -ForegroundColor White
    Write-Host "     -> No Vue imports found, appear to be from old architecture" -ForegroundColor Gray
}

if (!$phpUsage) {
    Write-Host ""
    Write-Host "Unused PHP files (Archive candidates):" -ForegroundColor Yellow
    Write-Host "   - Abstract_Component_Integration.php" -ForegroundColor White
    Write-Host "   - Component_Integration_Registry.php" -ForegroundColor White
}

# Check if legacy files still exist
$hasLegacyFiles = (Test-Path "system\ComponentLoader.php") -or (Test-Path "system\DesignPanel.php")
if ($hasLegacyFiles) {
    Write-Host ""
    Write-Host "Action Required:" -ForegroundColor Red
    Write-Host "   - ComponentLoader.php and/or DesignPanel.php still in system/" -ForegroundColor White
    Write-Host "     -> These should be in ARCHIVE/legacy-rendering/" -ForegroundColor Gray
}

Write-Host ""
Write-Host "Next Steps:" -ForegroundColor Cyan
Write-Host "   1. Review this analysis" -ForegroundColor White
Write-Host "   2. Archive unused files (see SYSTEM-AUDIT-REPORT.md)" -ForegroundColor White
Write-Host "   3. Keep only the 4 actively-used files" -ForegroundColor White
Write-Host ""

# Save results to file
$results = @"
# System Audit Results
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Actively Loaded Files
$($loadedFiles | ForEach-Object { "- $_" } | Out-String)

## Vue Imports from system/
$(if ($vueImports) { "Found imports:`n$($vueImports | ForEach-Object { "- $($_.Path):$($_.LineNumber)" } | Out-String)" } else { "NO Vue imports found - all JS files appear legacy" })

## PHP Abstract Class Usage
$(if ($phpUsage) { "Found usage:`n$($phpUsage | ForEach-Object { "- $($_.Path):$($_.LineNumber)" } | Out-String)" } else { "NO usage found - Abstract classes appear unused" })

## Recommendation
KEEP: ComponentDiscovery.php, ThemeDiscovery.php, Base_Component_Data_Service.php, VersionManager.php
ARCHIVE: All other files (estimated $(($systemFileCount - $loadedFiles.Count)) files)
"@

$results | Out-File "SYSTEM-AUDIT-RESULTS.txt" -Encoding UTF8

Write-Host "Results saved to: SYSTEM-AUDIT-RESULTS.txt" -ForegroundColor Gray
Write-Host ""
