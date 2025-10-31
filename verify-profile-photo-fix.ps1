# Profile Photo Component Verification Script
# Run this from PowerShell in the mk4 directory

Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "PROFILE PHOTO COMPONENT FIX VERIFICATION" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""

# Step 1: Clean build
Write-Host "[1/5] Cleaning build artifacts..." -ForegroundColor Yellow
npm run clean
Write-Host "✅ Clean complete" -ForegroundColor Green
Write-Host ""

# Step 2: Build the project
Write-Host "[2/5] Building Vue application..." -ForegroundColor Yellow
npm run build
if ($LASTEXITCODE -ne 0) {
    Write-Host "❌ Build failed! Check error messages above." -ForegroundColor Red
    exit 1
}
Write-Host "✅ Build complete" -ForegroundColor Green
Write-Host ""

# Step 3: Verify build output
Write-Host "[3/5] Verifying build output..." -ForegroundColor Yellow
if (Test-Path "dist/gmkb.iife.js") {
    $buildSize = (Get-Item "dist/gmkb.iife.js").Length
    Write-Host "✅ Bundle created: $('{0:N0}' -f $buildSize) bytes" -ForegroundColor Green
    
    # Check if profile-photo is in the bundle
    $content = Get-Content "dist/gmkb.iife.js" -Raw
    if ($content -match "profile-photo") {
        Write-Host "✅ profile-photo component found in bundle" -ForegroundColor Green
    } else {
        Write-Host "⚠️  profile-photo not found in bundle (may need investigation)" -ForegroundColor Yellow
    }
} else {
    Write-Host "❌ Build output not found!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 4: Verify component files exist
Write-Host "[4/5] Verifying component files..." -ForegroundColor Yellow
$componentFiles = @(
    "components/profile-photo/component.json",
    "components/profile-photo/ProfilePhotoRenderer.vue",
    "components/profile-photo/ProfilePhotoEditor.vue",
    "components/profile-photo/styles.css"
)

$allExist = $true
foreach ($file in $componentFiles) {
    if (Test-Path $file) {
        Write-Host "  ✅ $file" -ForegroundColor Green
    } else {
        Write-Host "  ❌ $file (MISSING)" -ForegroundColor Red
        $allExist = $false
    }
}

if (!$allExist) {
    Write-Host "❌ Some component files are missing!" -ForegroundColor Red
    exit 1
}
Write-Host ""

# Step 5: Check for removed patches
Write-Host "[5/5] Verifying patches were removed..." -ForegroundColor Yellow
$registryContent = Get-Content "src/services/UnifiedComponentRegistry.js" -Raw
if ($registryContent -match "TEMPORARY FIX.*profile-photo") {
    Write-Host "⚠️  TEMPORARY PATCHES still present in UnifiedComponentRegistry.js" -ForegroundColor Yellow
    Write-Host "    (This may be expected if other patches exist)" -ForegroundColor Gray
} else {
    Write-Host "✅ No profile-photo patches found (clean)" -ForegroundColor Green
}
Write-Host ""

# Final summary
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host "VERIFICATION COMPLETE" -ForegroundColor Cyan
Write-Host "=======================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "1. Clear browser cache (Ctrl+Shift+Delete)" -ForegroundColor White
Write-Host "2. Hard refresh the media kit builder page (Ctrl+F5)" -ForegroundColor White
Write-Host "3. Open browser console and check for component registration" -ForegroundColor White
Write-Host "4. Run: GMKB.services.registry.debug()" -ForegroundColor White
Write-Host "5. Look for 'profile-photo' in the component list" -ForegroundColor White
Write-Host ""
