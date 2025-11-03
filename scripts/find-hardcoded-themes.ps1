#Requires -Version 5.1

<#
.SYNOPSIS
    Finds hard-coded theme references in the Guestify Media Kit codebase.

.DESCRIPTION
    Scans JavaScript, Vue, and PHP files for hard-coded theme IDs, theme objects,
    and theme arrays that should be loaded from ThemeDiscovery instead.
    
.PARAMETER Path
    Root path to scan (defaults to current directory)

.PARAMETER OutputFormat
    Output format: 'console' (default), 'json', or 'markdown'

.PARAMETER ExcludePaths
    Paths to exclude from scanning

.EXAMPLE
    .\find-hardcoded-themes.ps1
    
.EXAMPLE
    .\find-hardcoded-themes.ps1 -OutputFormat markdown

.NOTES
    Author: Tony (with Claude)
    Date: 2025-11-03
    Version: 1.0.0
#>

param(
    [Parameter(Mandatory=$false)]
    [string]$Path = (Get-Location),
    
    [Parameter(Mandatory=$false)]
    [ValidateSet('console', 'json', 'markdown')]
    [string]$OutputFormat = 'console',
    
    [Parameter(Mandatory=$false)]
    [string[]]$ExcludePaths = @()
)

# Color output helpers
function Write-ColorOutput {
    param(
        [string]$Message,
        [string]$Color = 'White'
    )
    
    $colorMap = @{
        'Red' = [System.ConsoleColor]::Red
        'Green' = [System.ConsoleColor]::Green
        'Yellow' = [System.ConsoleColor]::Yellow
        'Blue' = [System.ConsoleColor]::Blue
        'Cyan' = [System.ConsoleColor]::Cyan
        'Magenta' = [System.ConsoleColor]::Magenta
        'White' = [System.ConsoleColor]::White
    }
    
    $previousColor = $host.UI.RawUI.ForegroundColor
    $host.UI.RawUI.ForegroundColor = $colorMap[$Color]
    Write-Output $Message
    $host.UI.RawUI.ForegroundColor = $previousColor
}

# Patterns to search for
$themePatterns = @(
    @{
        Name = "Hard-coded Theme ID"
        Pattern = '''(professional_clean|creative_bold|minimal_elegant|modern_dark|corporate_professional|vibrant_creative)'''
        Severity = "HIGH"
        Reason = "Theme ID hard-coded in string - should use themeStore.activeThemeId or load from registry"
    },
    @{
        Name = "Inline Theme Object"
        Pattern = '\{\s*id:\s*[''"][\w_-]+[''"]\s*,\s*name:\s*[''"]'
        Severity = "HIGH"
        Reason = "Theme object defined inline - should use ThemeDiscovery.getTheme()"
    },
    @{
        Name = "Theme Array Definition"
        Pattern = 'themes\s*[=:]\s*\[\s*\{\s*id:'
        Severity = "HIGH"
        Reason = "Theme array hard-coded - should use ThemeDiscovery.getThemes()"
    },
    @{
        Name = "Direct Theme Property Access"
        Pattern = 'theme\.(colors|typography|spacing|effects)\.'
        Severity = "MEDIUM"
        Reason = "Direct theme property access - should use themeStore.mergedTheme"
    },
    @{
        Name = "Default Theme Fallback"
        Pattern = '\|\|\s*[''"](?:professional_clean|creative_bold|minimal_elegant|modern_dark)[''"]'
        Severity = "MEDIUM"
        Reason = "Hard-coded default theme - should use themeStore.getDefaultTheme()"
    },
    @{
        Name = "Hard-coded Theme Color"
        Pattern = 'primary:\s*[''"]#[0-9a-fA-F]{6}[''"]'
        Severity = "MEDIUM"
        Reason = "Theme color hard-coded - should reference theme.colors.primary"
    },
    @{
        Name = "Hard-coded Font Family"
        Pattern = 'fontFamily:\s*[''"](?:Inter|Roboto|Open Sans|Lato|Montserrat|Poppins)[''"]'
        Severity = "MEDIUM"
        Reason = "Font family hard-coded - should reference theme.typography.fontFamily"
    },
    @{
        Name = "Theme Switch Statement"
        Pattern = 'switch\s*\(.*theme.*\)\s*\{\s*case\s*[''"]'
        Severity = "HIGH"
        Reason = "Theme logic in switch statement - should use theme registry lookup"
    },
    @{
        Name = "Theme Conditional Chain"
        Pattern = 'if\s*\(theme\s*===\s*[''"][^''"]+'
        Severity = "MEDIUM"
        Reason = "Theme conditionals - consider using theme registry or theme properties"
    }
)

# Default excluded paths
$defaultExcludePaths = @(
    'node_modules',
    'dist',
    'themes',
    'system\ThemeDiscovery.php',
    '.git',
    'vendor',
    'scripts',
    'tests',
    'ARCHIVED',
    'DEPRECATED'
)

$allExcludedPaths = $defaultExcludePaths + $ExcludePaths
$fileExtensions = @('*.js', '*.vue', '*.ts', '*.jsx', '*.tsx', '*.php')
$findings = @()

Write-ColorOutput "`n🔍 Scanning for hard-coded themes in: $Path`n" -Color Cyan

$totalFiles = 0
$scannedFiles = 0

foreach ($extension in $fileExtensions) {
    $files = Get-ChildItem -Path $Path -Filter $extension -Recurse -File -ErrorAction SilentlyContinue
    $totalFiles += $files.Count
    
    foreach ($file in $files) {
        $shouldExclude = $false
        foreach ($excludePath in $allExcludedPaths) {
            if ($file.FullName -like "*$excludePath*") {
                $shouldExclude = $true
                break
            }
        }
        
        if ($shouldExclude) { continue }
        
        $scannedFiles++
        
        try {
            $content = Get-Content -Path $file.FullName -Raw -ErrorAction Stop
        } catch {
            Write-Warning "Could not read file: $($file.FullName)"
            continue
        }
        
        foreach ($patternInfo in $themePatterns) {
            $matches = Select-String -InputObject $content -Pattern $patternInfo.Pattern -AllMatches
            
            if ($matches) {
                foreach ($match in $matches.Matches) {
                    $lineNumber = ($content.Substring(0, $match.Index) -split "`n").Count
                    $lines = $content -split "`n"
                    $matchedLine = $lines[$lineNumber - 1].Trim()
                    
                    $isLegitimate = $false
                    
                    if ($matchedLine -match '^\s*(//|/\*|\*|#)') {
                        $isLegitimate = $true
                    }
                    
                    if ($file.Name -like '*ThemeDiscovery*' -or 
                        $file.Name -like '*theme-discovery*' -or
                        $file.Name -like '*ThemeStore*' -or
                        $matchedLine -like '*getTheme(*' -or
                        $matchedLine -like '*loadTheme(*') {
                        $isLegitimate = $true
                    }
                    
                    if ($file.FullName -like '*test*' -or 
                        $file.FullName -like '*spec*') {
                        $isLegitimate = $true
                    }
                    
                    if ($file.Name -eq 'enqueue.php' -and $matchedLine -like '*fallback*') {
                        $isLegitimate = $true
                    }
                    
                    if (-not $isLegitimate) {
                        $relativePath = $file.FullName.Replace($Path, '').TrimStart('\', '/')
                        
                        $findings += [PSCustomObject]@{
                            File = $relativePath
                            Line = $lineNumber
                            Pattern = $patternInfo.Name
                            Severity = $patternInfo.Severity
                            Reason = $patternInfo.Reason
                            Code = $matchedLine
                        }
                    }
                }
            }
        }
    }
}

$findings = $findings | Sort-Object @{Expression={
    switch ($_.Severity) {
        'HIGH' { 1 }
        'MEDIUM' { 2 }
        'LOW' { 3 }
    }
}}, File, Line

Write-ColorOutput "`n📊 Scan Complete" -Color Green
Write-ColorOutput "Files scanned: $scannedFiles / $totalFiles" -Color White
Write-ColorOutput "Hard-coded themes found: $($findings.Count)`n" -Color $(if ($findings.Count -eq 0) { 'Green' } else { 'Yellow' })

if ($findings.Count -eq 0) {
    Write-ColorOutput "✅ No hard-coded themes detected!" -Color Green
    exit 0
}

$highSeverity = $findings | Where-Object { $_.Severity -eq 'HIGH' }
$mediumSeverity = $findings | Where-Object { $_.Severity -eq 'MEDIUM' }
$lowSeverity = $findings | Where-Object { $_.Severity -eq 'LOW' }

Write-ColorOutput "Severity Breakdown:" -Color Cyan
Write-ColorOutput "  HIGH: $($highSeverity.Count)" -Color Red
Write-ColorOutput "  MEDIUM: $($mediumSeverity.Count)" -Color Yellow
Write-ColorOutput "  LOW: $($lowSeverity.Count)" -Color White

switch ($OutputFormat) {
    'json' {
        $outputFile = Join-Path $Path "hardcoded-themes-report.json"
        $findings | ConvertTo-Json -Depth 10 | Out-File -FilePath $outputFile -Encoding UTF8
        Write-ColorOutput "`n📄 JSON report saved to: $outputFile" -Color Green
    }
    'markdown' {
        $mdOutput = "# Hard-Coded Themes Report`n`n"
        $mdOutput += "Generated: $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')`n`n"
        $mdOutput += "## Summary`n`nTotal: $($findings.Count)`n`n"
        $mdOutput += "- HIGH: $($highSeverity.Count)`n"
        $mdOutput += "- MEDIUM: $($mediumSeverity.Count)`n"
        $mdOutput += "- LOW: $($lowSeverity.Count)`n`n"
        
        foreach ($severity in @('HIGH', 'MEDIUM', 'LOW')) {
            $severityFindings = $findings | Where-Object { $_.Severity -eq $severity }
            if ($severityFindings.Count -gt 0) {
                $mdOutput += "### $severity Priority`n`n"
                foreach ($finding in $severityFindings) {
                    $mdOutput += "**$($finding.Pattern)** - $($finding.File):$($finding.Line)`n"
                    $mdOutput += "- Code: ``$($finding.Code)```n"
                    $mdOutput += "- Reason: $($finding.Reason)`n`n"
                }
            }
        }
        
        $outputFile = Join-Path $Path "hardcoded-themes-report.md"
        $mdOutput | Out-File -FilePath $outputFile -Encoding UTF8
        Write-ColorOutput "`n📄 Markdown report: $outputFile" -Color Green
    }
    'console' {
        foreach ($severity in @('HIGH', 'MEDIUM', 'LOW')) {
            $severityFindings = $findings | Where-Object { $_.Severity -eq $severity }
            if ($severityFindings.Count -gt 0) {
                $color = switch ($severity) {
                    'HIGH' { 'Red' }
                    'MEDIUM' { 'Yellow' }
                    'LOW' { 'White' }
                }
                Write-ColorOutput "`n=== $severity PRIORITY ===" -Color $color
                foreach ($finding in $severityFindings) {
                    Write-ColorOutput "$($finding.File):$($finding.Line)" -Color $color
                    Write-ColorOutput "  $($finding.Code)" -Color White
                    Write-ColorOutput "  $($finding.Reason)`n" -Color White
                }
            }
        }
    }
}

Write-ColorOutput "`n💡 Recommendations:" -Color Cyan
Write-ColorOutput "1. Use themeStore.activeThemeId for current theme" -Color White
Write-ColorOutput "2. Use ThemeDiscovery.getTheme() for loading themes" -Color White
Write-ColorOutput "3. Use themeStore.mergedTheme for theme properties" -Color White

if ($highSeverity.Count -gt 0) {
    Write-ColorOutput "`n⚠️  $($highSeverity.Count) high-severity issues found!" -Color Red
    exit 1
}
exit 0
