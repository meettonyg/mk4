# Media Kit Builder - Quick Build (PowerShell)
# Fast build script for rapid development

param(
    [switch]$Watch,
    [switch]$Dev,
    [switch]$Clean
)

$ErrorActionPreference = "Stop"

# Get plugin root
$PluginRoot = "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

Write-Host "🔨 Media Kit Builder - Quick Build" -ForegroundColor Cyan
Write-Host "===================================" -ForegroundColor Cyan
Write-Host ""

# Change to plugin directory
Set-Location $PluginRoot

# Clean if requested
if ($Clean) {
    Write-Host "🧹 Cleaning old build..." -ForegroundColor Yellow
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force "dist"
        Write-Host "   ✅ Removed dist/" -ForegroundColor Green
    }
    if (Test-Path "node_modules/.vite") {
        Remove-Item -Recurse -Force "node_modules/.vite"
        Write-Host "   ✅ Cleared Vite cache" -ForegroundColor Green
    }
    Write-Host ""
}

# Check node_modules
if (-Not (Test-Path "node_modules")) {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    npm install
    if ($LASTEXITCODE -ne 0) { exit 1 }
    Write-Host ""
}

# Determine build mode
if ($Watch) {
    Write-Host "👀 Starting watch mode..." -ForegroundColor Green
    Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
    Write-Host ""
    npm run watch
}
elseif ($Dev) {
    Write-Host "🔧 Starting development server..." -ForegroundColor Green
    Write-Host ""
    npm run dev
}
else {
    Write-Host "🚀 Building for production..." -ForegroundColor Green
    Write-Host ""
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host ""
        Write-Host "✅ Build complete!" -ForegroundColor Green
        
        # Show bundle info
        if (Test-Path "dist/gmkb.iife.js") {
            $size = [math]::Round((Get-Item "dist/gmkb.iife.js").Length / 1KB, 2)
            Write-Host "📦 Bundle: $size KB" -ForegroundColor Cyan
        }
        
        Write-Host ""
        Write-Host "🎯 Next: Clear caches and reload builder" -ForegroundColor Cyan
    }
}
