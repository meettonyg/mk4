# Component Verification Script
# Verifies that all components have the required Renderer files

Write-Host "============================================" -ForegroundColor Cyan
Write-Host "  Component Structure Verification" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan
Write-Host ""

$componentsDir = "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4\components"

# Get all subdirectories that are actual components (not files)
$components = Get-ChildItem -Path $componentsDir -Directory | Where-Object {
    $_.Name -notmatch '^[A-Z]' # Exclude uppercase named dirs (likely docs)
}

Write-Host "Found $($components.Count) component directories:" -ForegroundColor Yellow
Write-Host ""

$missingRenderer = @()
$hasRenderer = @()

foreach ($component in $components) {
    $componentName = $component.Name
    $rendererFile = Join-Path $component.FullName "*Renderer.vue"
    
    if (Test-Path $rendererFile -PathType Leaf) {
        $rendererFileName = (Get-Item $rendererFile).Name
        Write-Host "✅ $componentName" -ForegroundColor Green -NoNewline
        Write-Host " → $rendererFileName" -ForegroundColor Gray
        $hasRenderer += $componentName
    } else {
        Write-Host "❌ $componentName" -ForegroundColor Red -NoNewline
        Write-Host " → No Renderer.vue found!" -ForegroundColor Red
        $missingRenderer += $componentName
    }
}

Write-Host ""
Write-Host "============================================" -ForegroundColor Cyan
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "✅ Components with Renderer: $($hasRenderer.Count)" -ForegroundColor Green
Write-Host "❌ Components missing Renderer: $($missingRenderer.Count)" -ForegroundColor Red

if ($missingRenderer.Count -gt 0) {
    Write-Host ""
    Write-Host "Missing Renderer files:" -ForegroundColor Red
    $missingRenderer | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
}

Write-Host ""
Write-Host "Components with Renderer files:" -ForegroundColor Green
$hasRenderer | ForEach-Object { Write-Host "  - $_" -ForegroundColor Gray }

Write-Host ""
Read-Host "Press Enter to close"
