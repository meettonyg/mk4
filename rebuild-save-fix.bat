@echo off
echo ========================================
echo Rebuilding Media Kit Builder - Save Fix
echo ========================================
echo.

echo [1/3] Installing dependencies...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)

echo.
echo [2/3] Building Vue application...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)

echo.
echo [3/3] Verifying build output...
if exist "dist\gmkb.iife.js" (
    echo ✅ Build successful!
    echo ✅ dist\gmkb.iife.js created
    for %%A in ("dist\gmkb.iife.js") do echo    Size: %%~zA bytes
) else (
    echo ❌ ERROR: dist\gmkb.iife.js not found
    pause
    exit /b 1
)

echo.
echo ========================================
echo Build complete! 
echo.
echo CHANGES MADE:
echo - Consolidated save() method to use direct AJAX
echo - Removed duplicate saveToWordPress() logic
echo - Save now properly writes to WordPress database via gmkb_save_media_kit action
echo - Added clear success logging
echo.
echo NEXT STEPS:
echo 1. Refresh your WordPress admin page
echo 2. Make a change in the builder
echo 3. Click Save
echo 4. Check console for "✅ Saved to WordPress database"
echo ========================================
pause
