# Media Kit Builder Deployment Script for Windows
Write-Host "Building Media Kit Builder for Production..." -ForegroundColor Green

# 1. Build assets
Write-Host "Building JavaScript assets..." -ForegroundColor Yellow
npm run build

# 2. Check if build succeeded
if (-not (Test-Path "dist\gmkb.iife.js")) {
    Write-Host "Build failed! dist\gmkb.iife.js not found" -ForegroundColor Red
    exit 1
}

Write-Host "Build successful!" -ForegroundColor Green

# 3. Create deployment package
Write-Host "Creating deployment package..." -ForegroundColor Yellow

# Remove old deployment directory if exists
if (Test-Path "deploy-temp") {
    Remove-Item -Recurse -Force deploy-temp
}

# Create deployment directory structure
New-Item -ItemType Directory -Force -Path "deploy-temp\guestify-media-kit-builder" | Out-Null

# Copy required directories
Write-Host "Copying files..." -ForegroundColor Yellow
$folders = @("admin", "components", "css", "dist", "includes", "js", "partials", "system", "templates", "themes")
foreach ($folder in $folders) {
    if (Test-Path $folder) {
        Copy-Item -Path $folder -Destination "deploy-temp\guestify-media-kit-builder\" -Recurse -Force
    }
}

# Copy required files
Copy-Item "guestify-media-kit-builder.php" "deploy-temp\guestify-media-kit-builder\"
Copy-Item "index.php" "deploy-temp\guestify-media-kit-builder\"
if (Test-Path "README.md") {
    Copy-Item "README.md" "deploy-temp\guestify-media-kit-builder\"
}

# Create ZIP file
Write-Host "Creating ZIP file..." -ForegroundColor Yellow
Compress-Archive -Path "deploy-temp\guestify-media-kit-builder" -DestinationPath "guestify-media-kit-builder-production.zip" -Force

# Clean up
Remove-Item -Recurse -Force deploy-temp

Write-Host "Deployment package created: guestify-media-kit-builder-production.zip" -ForegroundColor Green
Write-Host "This ZIP file can be uploaded via WordPress Admin - Plugins - Add New - Upload" -ForegroundColor Cyan
Write-Host ""
Write-Host "Package contents:" -ForegroundColor Yellow
Write-Host "  - Compiled JavaScript (dist/)"
Write-Host "  - All PHP files"
Write-Host "  - All components and themes"
Write-Host "  - All CSS files"
Write-Host "  - NO source files (src/)"
Write-Host "  - NO node_modules"
Write-Host "  - NO development files"
Write-Host ""
Write-Host "Ready to deploy!" -ForegroundColor Green
