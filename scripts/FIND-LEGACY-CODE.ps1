# Legacy Code Detection Script
# Searches for architectural violations and technical debt

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  LEGACY CODE HUNTER" -ForegroundColor Cyan
Write-Host "  Finding Architectural Violations" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$projectRoot = "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"
Set-Location $projectRoot

# Output file
$outputFile = "LEGACY-CODE-REPORT.md"
$findings = @()

function Add-Finding {
    param(
        [string]$Category,
        [string]$Severity,
        [string]$File,
        [int]$LineNumber,
        [string]$Code,
        [string]$Reason
    )
    
    $script:findings += [PSCustomObject]@{
        Category = $Category
        Severity = $Severity
        File = $File
        LineNumber = $LineNumber
        Code = $Code
        Reason = $Reason
    }
}

Write-Host "Scanning for legacy patterns..." -ForegroundColor Yellow
Write-Host ""

# Get all JS and Vue files
$jsFiles = Get-ChildItem -Path "src" -Filter "*.js" -Recurse -File
$vueFiles = Get-ChildItem -Path "src" -Filter "*.vue" -Recurse -File
$allFiles = $jsFiles + $vueFiles

# ============================================
# 1. HARDCODED COMPONENT MAPS
# ============================================
Write-Host "1. Searching for hardcoded component maps..." -ForegroundColor Cyan

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    $lines = Get-Content $file.FullName
    
    # Pattern 1: const componentMap = { ... }
    if ($content -match 'const\s+componentMap\s*=') {
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match 'const\s+componentMap\s*=') {
                Add-Finding -Category "Hardcoded Component Map" -Severity "HIGH" `
                    -File $file.FullName.Replace($projectRoot, "") `
                    -LineNumber ($i + 1) `
                    -Code $lines[$i].Trim() `
                    -Reason "Hardcoded component map - should use UnifiedComponentRegistry"
                Write-Host "  [X] Found: $($file.Name):$($i + 1)" -ForegroundColor Red
            }
        }
    }
    
    # Pattern 2: Multiple defineAsyncComponent calls
    $asyncCount = ([regex]::Matches($content, "defineAsyncComponent")).Count
    if ($asyncCount -gt 3) {
        Add-Finding -Category "Hardcoded Component Map" -Severity "MEDIUM" `
            -File $file.FullName.Replace($projectRoot, "") `
            -LineNumber 0 `
            -Code "$asyncCount defineAsyncComponent calls" `
            -Reason "Multiple hardcoded components - consider using registry"
        $msg = "  [!] Found: $($file.Name) ($asyncCount defineAsyncComponent calls)"
        Write-Host $msg -ForegroundColor Yellow
    }
}

# ============================================
# 2. POLLING PATTERNS
# ============================================
Write-Host ""
Write-Host "2. Searching for polling patterns..." -ForegroundColor Cyan

foreach ($file in $allFiles) {
    $lines = Get-Content $file.FullName
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        # Detect setTimeout used for waiting/polling
        if ($line -match 'setTimeout') {
            $context = $lines[[Math]::Max(0, $i-2)..[Math]::Min($lines.Count-1, $i+2)] -join " "
            
            if ($context -match "retry|wait|check|poll|ready|loaded" -and 
                $context -notmatch "debounce|throttle|delay|animation") {
                Add-Finding -Category "Polling Pattern" -Severity "HIGH" `
                    -File $file.FullName.Replace($projectRoot, "") `
                    -LineNumber ($i + 1) `
                    -Code $line.Trim() `
                    -Reason "Potential polling pattern - should use event-driven approach"
                Write-Host "  [X] Found: $($file.Name):$($i + 1)" -ForegroundColor Red
            }
        }
        
        # Detect setInterval (almost always polling)
        if ($line -match 'setInterval' -and $line -notmatch 'clearInterval|autosave') {
            Add-Finding -Category "Polling Pattern" -Severity "HIGH" `
                -File $file.FullName.Replace($projectRoot, "") `
                -LineNumber ($i + 1) `
                -Code $line.Trim() `
                -Reason "setInterval detected - should use event-driven approach"
            Write-Host "  [X] Found: $($file.Name):$($i + 1)" -ForegroundColor Red
        }
    }
}

# ============================================
# 3. GLOBAL OBJECT SNIFFING
# ============================================
Write-Host ""
Write-Host "3. Searching for global object sniffing..." -ForegroundColor Cyan

foreach ($file in $allFiles) {
    $lines = Get-Content $file.FullName
    
    for ($i = 0; $i -lt $lines.Count; $i++) {
        $line = $lines[$i]
        
        if ($line -match '(if|while)\s*\(.*window\.\w+' -and 
            $line -notmatch 'window\.location|window\.document|window\.console|window\.addEventListener') {
            
            Add-Finding -Category "Global Object Sniffing" -Severity "MEDIUM" `
                -File $file.FullName.Replace($projectRoot, "") `
                -LineNumber ($i + 1) `
                -Code $line.Trim() `
                -Reason "Checking for global object existence - should use events or imports"
            Write-Host "  [!] Found: $($file.Name):$($i + 1)" -ForegroundColor Yellow
        }
    }
}

# ============================================
# 4. DUPLICATE SERVICE LOGIC
# ============================================
Write-Host ""
Write-Host "4. Searching for duplicate service logic..." -ForegroundColor Cyan

$servicePatterns = @(
    @{ Pattern = 'fetch.*wp-json|axios.*wp-json'; Service = 'APIService'; Description = 'Direct API calls' },
    @{ Pattern = 'document\.createElement.*style'; Service = 'ComponentStyleService'; Description = 'Manual style injection' },
    @{ Pattern = 'localStorage\.getItem|localStorage\.setItem'; Service = 'StorageService'; Description = 'Direct localStorage access' }
)

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    
    # Skip service files themselves
    if ($file.Name -match "Service\.js$|Service\.vue$") {
        continue
    }
    
    foreach ($pattern in $servicePatterns) {
        if ($content -match $pattern.Pattern) {
            $lines = Get-Content $file.FullName
            for ($i = 0; $i -lt $lines.Count; $i++) {
                if ($lines[$i] -match $pattern.Pattern) {
                    Add-Finding -Category "Duplicate Logic" -Severity "LOW" `
                        -File $file.FullName.Replace($projectRoot, "") `
                        -LineNumber ($i + 1) `
                        -Code $lines[$i].Trim() `
                        -Reason "$($pattern.Description) - should use $($pattern.Service)"
                }
            }
        }
    }
}

# ============================================
# 5. HARDCODED FIELD MAPPINGS
# ============================================
Write-Host ""
Write-Host "5. Searching for hardcoded field mappings..." -ForegroundColor Cyan

foreach ($file in $allFiles) {
    $content = Get-Content $file.FullName -Raw
    $lines = Get-Content $file.FullName
    
    if ($content -match 'fieldMapping\s*=|fieldMap\s*=') {
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match 'fieldMapping|fieldMap') {
                Add-Finding -Category "Hardcoded Mappings" -Severity "MEDIUM" `
                    -File $file.FullName.Replace($projectRoot, "") `
                    -LineNumber ($i + 1) `
                    -Code $lines[$i].Trim() `
                    -Reason "Hardcoded field mapping - should use component.json schema"
                Write-Host "  [!] Found: $($file.Name):$($i + 1)" -ForegroundColor Yellow
            }
        }
    }
}

# ============================================
# 6. DEPRECATED PATTERNS
# ============================================
Write-Host ""
Write-Host "6. Searching for deprecated patterns..." -ForegroundColor Cyan

$deprecatedPatterns = @(
    @{ Pattern = '\$.ajax|\$.get|\$.post'; Name = 'jQuery AJAX' },
    @{ Pattern = 'EventBus\.\$emit|EventBus\.\$on'; Name = 'EventBus' },
    @{ Pattern = 'this\.\$root|this\.\$parent'; Name = 'Vue 2 parent access' }
)

foreach ($file in $allFiles) {
    $lines = Get-Content $file.FullName
    
    foreach ($pattern in $deprecatedPatterns) {
        for ($i = 0; $i -lt $lines.Count; $i++) {
            if ($lines[$i] -match $pattern.Pattern) {
                Add-Finding -Category "Deprecated Pattern" -Severity "MEDIUM" `
                    -File $file.FullName.Replace($projectRoot, "") `
                    -LineNumber ($i + 1) `
                    -Code $lines[$i].Trim() `
                    -Reason "$($pattern.Name) - use modern alternatives"
                Write-Host "  [!] Found: $($file.Name):$($i + 1)" -ForegroundColor Yellow
            }
        }
    }
}

# ============================================
# GENERATE REPORT
# ============================================
Write-Host ""
Write-Host "Generating report..." -ForegroundColor Green

$highCount = ($findings | Where-Object { $_.Severity -eq "HIGH" }).Count
$mediumCount = ($findings | Where-Object { $_.Severity -eq "MEDIUM" }).Count
$lowCount = ($findings | Where-Object { $_.Severity -eq "LOW" }).Count

$report = @"
# Legacy Code Detection Report
Generated: $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

## Summary

Total Issues Found: $($findings.Count)

### By Severity
- HIGH: $highCount
- MEDIUM: $mediumCount
- LOW: $lowCount

### By Category
"@

$categories = $findings | Group-Object Category
foreach ($cat in $categories) {
    $report += "`n- $($cat.Name): $($cat.Count)"
}

$report += "`n`n---`n`n## Findings`n"

# Group by severity
$highPriority = $findings | Where-Object { $_.Severity -eq "HIGH" } | Sort-Object Category, File
$mediumPriority = $findings | Where-Object { $_.Severity -eq "MEDIUM" } | Sort-Object Category, File
$lowPriority = $findings | Where-Object { $_.Severity -eq "LOW" } | Sort-Object Category, File

if ($highPriority.Count -gt 0) {
    $report += "`n### HIGH Priority Issues`n`n"
    foreach ($finding in $highPriority) {
        $report += "**[$($finding.Category)]** $($finding.File)`n"
        $report += "- Line: $($finding.LineNumber)`n"
        $report += "- Code: ``$($finding.Code)```n"
        $report += "- Reason: $($finding.Reason)`n`n"
    }
}

if ($mediumPriority.Count -gt 0) {
    $report += "`n### MEDIUM Priority Issues`n`n"
    foreach ($finding in $mediumPriority) {
        $report += "**[$($finding.Category)]** $($finding.File)`n"
        $report += "- Line: $($finding.LineNumber)`n"
        $report += "- Code: ``$($finding.Code)```n"
        $report += "- Reason: $($finding.Reason)`n`n"
    }
}

if ($lowPriority.Count -gt 0) {
    $report += "`n### LOW Priority Issues`n`n"
    foreach ($finding in $lowPriority) {
        $report += "**[$($finding.Category)]** $($finding.File)`n"
        $report += "- Line: $($finding.LineNumber)`n"
        $report += "- Code: ``$($finding.Code)```n"
        $report += "- Reason: $($finding.Reason)`n`n"
    }
}

$report | Out-File -FilePath $outputFile -Encoding UTF8

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "SCAN COMPLETE!" -ForegroundColor Green
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Results:" -ForegroundColor Cyan
Write-Host "  Total Issues: $($findings.Count)" -ForegroundColor White
Write-Host "  HIGH: $highCount" -ForegroundColor Red
Write-Host "  MEDIUM: $mediumCount" -ForegroundColor Yellow
Write-Host "  LOW: $lowCount" -ForegroundColor Blue
Write-Host ""
Write-Host "Full report saved to: $outputFile" -ForegroundColor Green
Write-Host ""

if (Test-Path $outputFile) {
    Start-Process $outputFile
}

Read-Host "Press Enter to close"
