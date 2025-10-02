# Media Kit Builder - Development Helper
# All-in-one script for common development tasks

param(
    [Parameter(Position=0)]
    [ValidateSet("build", "watch", "dev", "clean", "install", "lint", "test", "help")]
    [string]$Command = "help",
    
    [switch]$Force
)

$PluginRoot = "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

function Show-Header {
    Write-Host ""
    Write-Host "╔════════════════════════════════════════════╗" -ForegroundColor Cyan
    Write-Host "║   Media Kit Builder - Dev Helper          ║" -ForegroundColor Cyan
    Write-Host "╚════════════════════════════════════════════╝" -ForegroundColor Cyan
    Write-Host ""
}

function Show-Help {
    Write-Host "Available Commands:" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "  build     " -NoNewline -ForegroundColor Green
    Write-Host "- Build for production"
    Write-Host "  watch     " -NoNewline -ForegroundColor Green
    Write-Host "- Watch mode (auto-rebuild on changes)"
    Write-Host "  dev       " -NoNewline -ForegroundColor Green
    Write-Host "- Development server with hot reload"
    Write-Host "  clean     " -NoNewline -ForegroundColor Green
    Write-Host "- Clean build artifacts and caches"
    Write-Host "  install   " -NoNewline -ForegroundColor Green
    Write-Host "- Install/update dependencies"
    Write-Host "  lint      " -NoNewline -ForegroundColor Green
    Write-Host "- Run code linter"
    Write-Host "  test      " -NoNewline -ForegroundColor Green
    Write-Host "- Run tests"
    Write-Host "  help      " -NoNewline -ForegroundColor Green
    Write-Host "- Show this help"
    Write-Host ""
    Write-Host "Examples:" -ForegroundColor Yellow
    Write-Host "  .\dev.ps1 build         " -NoNewline -ForegroundColor Gray
    Write-Host "# Production build"
    Write-Host "  .\dev.ps1 watch         " -NoNewline -ForegroundColor Gray
    Write-Host "# Watch for changes"
    Write-Host "  .\dev.ps1 clean -Force  " -NoNewline -ForegroundColor Gray
    Write-Host "# Clean and rebuild"
    Write-Host ""
}

function Invoke-Build {
    Write-Host "🚀 Building for production..." -ForegroundColor Green
    Set-Location $PluginRoot
    npm run build
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Build successful!" -ForegroundColor Green
        if (Test-Path "dist/gmkb.iife.js") {
            $size = [math]::Round((Get-Item "dist/gmkb.iife.js").Length / 1KB, 2)
            Write-Host "📦 Bundle size: $size KB" -ForegroundColor Cyan
        }
    }
}

function Invoke-Watch {
    Write-Host "👀 Starting watch mode..." -ForegroundColor Green
    Write-Host "   File changes will trigger auto-rebuild" -ForegroundColor Gray
    Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
    Write-Host ""
    Set-Location $PluginRoot
    npm run watch
}

function Invoke-Dev {
    Write-Host "🔧 Starting development server..." -ForegroundColor Green
    Write-Host "   Hot reload enabled" -ForegroundColor Gray
    Write-Host "   Press Ctrl+C to stop" -ForegroundColor Gray
    Write-Host ""
    Set-Location $PluginRoot
    npm run dev
}

function Invoke-Clean {
    Write-Host "🧹 Cleaning build artifacts..." -ForegroundColor Yellow
    Set-Location $PluginRoot
    
    $cleaned = 0
    
    if (Test-Path "dist") {
        Remove-Item -Recurse -Force "dist"
        Write-Host "   ✅ Removed dist/" -ForegroundColor Green
        $cleaned++
    }
    
    if (Test-Path "node_modules/.vite") {
        Remove-Item -Recurse -Force "node_modules/.vite"
        Write-Host "   ✅ Cleared Vite cache" -ForegroundColor Green
        $cleaned++
    }
    
    if ($Force -and (Test-Path "node_modules")) {
        Write-Host "   🗑️  Removing node_modules..." -ForegroundColor Yellow
        Remove-Item -Recurse -Force "node_modules"
        Write-Host "   ✅ Removed node_modules/" -ForegroundColor Green
        $cleaned++
    }
    
    if ($cleaned -eq 0) {
        Write-Host "   ℹ️  Nothing to clean" -ForegroundColor Gray
    } else {
        Write-Host ""
        Write-Host "✅ Cleaned $cleaned item(s)" -ForegroundColor Green
        
        if ($Force) {
            Write-Host ""
            Write-Host "💡 Run 'install' command to reinstall dependencies" -ForegroundColor Cyan
        }
    }
}

function Invoke-Install {
    Write-Host "📦 Installing dependencies..." -ForegroundColor Yellow
    Set-Location $PluginRoot
    
    if (Test-Path "package-lock.json") {
        npm ci
    } else {
        npm install
    }
    
    if ($LASTEXITCODE -eq 0) {
        Write-Host "✅ Dependencies installed!" -ForegroundColor Green
    }
}

function Invoke-Lint {
    Write-Host "🔍 Running linter..." -ForegroundColor Yellow
    Set-Location $PluginRoot
    
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts.lint) {
            npm run lint
        } else {
            Write-Host "⚠️  No lint script found in package.json" -ForegroundColor Yellow
        }
    }
}

function Invoke-Test {
    Write-Host "🧪 Running tests..." -ForegroundColor Yellow
    Set-Location $PluginRoot
    
    if (Test-Path "package.json") {
        $packageJson = Get-Content "package.json" | ConvertFrom-Json
        if ($packageJson.scripts.test) {
            npm run test
        } else {
            Write-Host "⚠️  No test script found in package.json" -ForegroundColor Yellow
        }
    }
}

# Main execution
Show-Header

switch ($Command) {
    "build"   { Invoke-Build }
    "watch"   { Invoke-Watch }
    "dev"     { Invoke-Dev }
    "clean"   { Invoke-Clean }
    "install" { Invoke-Install }
    "lint"    { Invoke-Lint }
    "test"    { Invoke-Test }
    "help"    { Show-Help }
    default   { Show-Help }
}

Write-Host ""
