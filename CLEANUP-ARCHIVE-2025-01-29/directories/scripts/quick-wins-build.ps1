# Quick Wins - Build Verification (PowerShell)
# Run from plugin root directory

Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Quick Wins - Build Verification" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Change to script directory's parent (plugin root)
$scriptPath = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location (Split-Path -Parent $scriptPath)

Write-Host "[1/4] Checking Node.js and npm..." -ForegroundColor Yellow
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "  Node.js: $nodeVersion" -ForegroundColor Green
Write-Host "  npm: $npmVersion" -ForegroundColor Green
Write-Host ""

Write-Host "[2/4] Checking dependencies..." -ForegroundColor Yellow
if (Test-Path "node_modules") {
    Write-Host "  ✓ Node modules already installed" -ForegroundColor Green
} else {
    Write-Host "  Installing node modules..." -ForegroundColor Yellow
    npm install
}
Write-Host ""

Write-Host "[3/4] Running build..." -ForegroundColor Yellow
npm run build
Write-Host ""

Write-Host "[4/4] Verifying build output..." -ForegroundColor Yellow

$buildSuccess = $false
$fileSizeKB = 0

if (Test-Path "dist/gmkb.iife.js") {
    $fileSize = (Get-Item "dist/gmkb.iife.js").Length
    $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
    Write-Host "  ✓ Build successful - gmkb.iife.js created" -ForegroundColor Green
    Write-Host "    File size: $fileSizeKB KB" -ForegroundColor Gray
    $buildSuccess = $true
} else {
    Write-Host "  ✗ Build failed - gmkb.iife.js not found" -ForegroundColor Red
    Write-Host ""
    Write-Host "Please check the build errors above." -ForegroundColor Yellow
    exit 1
}

if (Test-Path "dist/gmkb.css") {
    $cssSize = (Get-Item "dist/gmkb.css").Length
    $cssSizeKB = [math]::Round($cssSize / 1KB, 2)
    Write-Host "  ✓ CSS file created" -ForegroundColor Green
    Write-Host "    File size: $cssSizeKB KB" -ForegroundColor Gray
} else {
    Write-Host "  ⚠ CSS file not found (may be optional)" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host " Build Verification Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Summary:" -ForegroundColor Cyan
Write-Host "  - Node.js: $nodeVersion" -ForegroundColor Gray
Write-Host "  - Build: Success ✓" -ForegroundColor Gray
Write-Host "  - Output: dist/gmkb.iife.js ($fileSizeKB KB)" -ForegroundColor Gray
Write-Host ""
Write-Host "Next: Review reports in /docs folder" -ForegroundColor Yellow
Write-Host "Then: Complete backup checklist before Phase 2" -ForegroundColor Yellow
Write-Host ""
