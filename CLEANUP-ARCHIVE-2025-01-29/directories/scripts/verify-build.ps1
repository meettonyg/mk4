# Quick Wins - Build Verification
Write-Host "========================================"
Write-Host " Quick Wins - Build Verification"
Write-Host "========================================"
Write-Host ""

Write-Host "[1/4] Checking Node.js and npm..."
$nodeVersion = node --version
$npmVersion = npm --version
Write-Host "  Node.js: $nodeVersion"
Write-Host "  npm: $npmVersion"
Write-Host ""

Write-Host "[2/4] Checking dependencies..."
if (Test-Path "node_modules") {
    Write-Host "  OK - Node modules already installed"
} else {
    Write-Host "  Installing node modules..."
    npm install
}
Write-Host ""

Write-Host "[3/4] Running build..."
npm run build
Write-Host ""

Write-Host "[4/4] Verifying build output..."

if (Test-Path "dist\gmkb.iife.js") {
    $fileSize = (Get-Item "dist\gmkb.iife.js").Length
    $fileSizeKB = [math]::Round($fileSize / 1KB, 2)
    Write-Host "  OK - Build successful - gmkb.iife.js created"
    Write-Host "    File size: $fileSizeKB KB"
} else {
    Write-Host "  ERROR - Build failed - gmkb.iife.js not found"
    exit 1
}

if (Test-Path "dist\gmkb.css") {
    $cssSize = (Get-Item "dist\gmkb.css").Length
    $cssSizeKB = [math]::Round($cssSize / 1KB, 2)
    Write-Host "  OK - CSS file created"
    Write-Host "    File size: $cssSizeKB KB"
} else {
    Write-Host "  WARNING - CSS file not found (may be optional)"
}

Write-Host ""
Write-Host "========================================"
Write-Host " Build Verification Complete!"
Write-Host "========================================"
Write-Host ""
