# Batch Fix Script for Component Spacing Compliance
# This script automatically fixes common spacing compliance issues

$componentsDir = "components"

Write-Host "Starting batch fix for spacing compliance..." -ForegroundColor Cyan
Write-Host ""

$filesFixed = 0
$totalReplacements = 0

# Get all Vue files
$vueFiles = Get-ChildItem -Path $componentsDir -Filter "*.vue" -Recurse

foreach ($file in $vueFiles) {
    Write-Host "Processing: $($file.Name)" -ForegroundColor Yellow
    
    $content = Get-Content $file.FullName -Raw
    $originalContent = $content
    $replacements = 0
    
    # Fix common spacing patterns
    
    # Pattern 1: padding: 16px
    if ($content -match 'padding:\s*16px') {
        $content = $content -replace 'padding:\s*16px', 'padding: var(--gmkb-spacing-md, 16px)'
        $replacements++
        Write-Host "  Fixed: padding: 16px" -ForegroundColor Green
    }
    
    # Pattern 2: padding: 8px
    if ($content -match 'padding:\s*8px') {
        $content = $content -replace 'padding:\s*8px', 'padding: var(--gmkb-spacing-sm, 8px)'
        $replacements++
        Write-Host "  Fixed: padding: 8px" -ForegroundColor Green
    }
    
    # Pattern 3: padding: 6px
    if ($content -match 'padding:\s*6px') {
        $content = $content -replace 'padding:\s*6px', 'padding: var(--gmkb-space-1, 6px)'
        $replacements++
        Write-Host "  Fixed: padding: 6px" -ForegroundColor Green
    }
    
    # Pattern 4: padding: 12px
    if ($content -match 'padding:\s*12px') {
        $content = $content -replace 'padding:\s*12px', 'padding: var(--gmkb-space-3, 12px)'
        $replacements++
        Write-Host "  Fixed: padding: 12px" -ForegroundColor Green
    }
    
    # Pattern 5: margin: 2rem
    if ($content -match 'margin:\s*2rem') {
        $content = $content -replace 'margin:\s*2rem', 'margin: var(--gmkb-spacing-xl, 2rem)'
        $replacements++
        Write-Host "  Fixed: margin: 2rem" -ForegroundColor Green
    }
    
    # Pattern 6: padding: 3rem
    if ($content -match 'padding:\s*3rem') {
        $content = $content -replace 'padding:\s*3rem', 'padding: var(--gmkb-spacing-xxl, 3rem)'
        $replacements++
        Write-Host "  Fixed: padding: 3rem" -ForegroundColor Green
    }
    
    # Save if changes were made
    if ($content -ne $originalContent) {
        Set-Content -Path $file.FullName -Value $content -NoNewline
        $filesFixed++
        $totalReplacements += $replacements
        Write-Host "  Saved $($file.Name) with $replacements fixes" -ForegroundColor Cyan
    } else {
        Write-Host "  No changes needed" -ForegroundColor Gray
    }
    
    Write-Host ""
}

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Batch Fix Complete!" -ForegroundColor Green
Write-Host "  Files modified: $filesFixed" -ForegroundColor White
Write-Host "  Total replacements: $totalReplacements" -ForegroundColor White
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "NEXT STEPS:" -ForegroundColor Yellow
Write-Host "1. Run: npm run build" -ForegroundColor White
Write-Host "2. Run: node scripts\check-component-compliance.cjs components\" -ForegroundColor White
Write-Host "3. Review the new compliance report" -ForegroundColor White
Write-Host "4. Test the components with different themes" -ForegroundColor White
