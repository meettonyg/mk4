# Media Kit Builder - Build Script (PowerShell)
# Builds the Vue.js application bundle

Write-Host "🔨 Media Kit Builder - Build Script" -ForegroundColor Cyan
Write-Host "====================================" -ForegroundColor Cyan
Write-Host ""

# Get the plugin root directory (parent of scripts/)
$PluginRoot = Split-Path -Parent $PSScriptRoot
Write-Host "📁 Plugin Directory: $PluginRoot" -ForegroundColor Gray

# Change to plugin directory
Set-Location $PluginRoot

# Check if node_modules exists
if (-Not (Test-Path "node_modules")) {
    Write-Host "⚠️  node_modules not found. Running npm install first..." -ForegroundColor Yellow
    Write-Host ""
    
    npm install
    
    if ($LASTEXITCODE -ne 0) {
        Write-Host ""
        Write-Host "❌ npm install failed!" -ForegroundColor Red
        exit 1
    }
    
    Write-Host ""
}

# Check if package.json exists
if (-Not (Test-Path "package.json")) {
    Write-Host "❌ package.json not found in $PluginRoot" -ForegroundColor Red
    Write-Host "   Make sure you're in the correct directory" -ForegroundColor Red
    exit 1
}

# Run the build
Write-Host "🚀 Building Vue application..." -ForegroundColor Green
Write-Host ""

npm run build

# Check build result
if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ Build completed successfully!" -ForegroundColor Green
    Write-Host ""
    
    # Check if dist folder exists
    if (Test-Path "dist") {
        Write-Host "📦 Build Output:" -ForegroundColor Cyan
        
        # List dist files with sizes
        Get-ChildItem -Path "dist" -File | ForEach-Object {
            $size = [math]::Round($_.Length / 1KB, 2)
            Write-Host "   - $($_.Name) ($size KB)" -ForegroundColor Gray
        }
        
        Write-Host ""
        
        # Check for main bundle
        if (Test-Path "dist/gmkb.iife.js") {
            $mainBundle = Get-Item "dist/gmkb.iife.js"
            $bundleSize = [math]::Round($mainBundle.Length / 1KB, 2)
            
            Write-Host "📊 Main Bundle: gmkb.iife.js ($bundleSize KB)" -ForegroundColor Cyan
            
            # Warn if bundle is too large
            if ($bundleSize -gt 500) {
                Write-Host "⚠️  Warning: Bundle size is large (>500KB)" -ForegroundColor Yellow
                Write-Host "   Consider code splitting or lazy loading" -ForegroundColor Yellow
            }
        }
        
        Write-Host ""
        Write-Host "🎯 Next Steps:" -ForegroundColor Cyan
        Write-Host "   1. Clear WordPress cache" -ForegroundColor Gray
        Write-Host "   2. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor Gray
        Write-Host "   3. Reload the Media Kit Builder page" -ForegroundColor Gray
        Write-Host ""
    }
} else {
    Write-Host ""
    Write-Host "❌ Build failed!" -ForegroundColor Red
    Write-Host "   Check the error messages above" -ForegroundColor Red
    Write-Host ""
    exit 1
}

Write-Host "✅ Done!" -ForegroundColor Green
