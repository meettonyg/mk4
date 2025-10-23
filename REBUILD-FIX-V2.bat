@echo off
echo ========================================
echo  MOBILE RESPONSIVE FIX - REBUILD SCRIPT V2
echo ========================================
echo.
echo This will rebuild with the COMPLETE mobile responsive fix.
echo.

cd /d "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

echo [1/6] Cleaning cache and old files...
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo.
echo [2/6] Checking node_modules...
if not exist node_modules (
    echo Installing dependencies...
    call npm install
)

echo.
echo [3/6] Building project with updated CSS...
call npm run build

echo.
echo [4/6] Verifying CSS build...
if exist dist\gmkb.css (
    echo ✓ CSS file created
    findstr /C:"device-mobile" dist\gmkb.css >nul
    if %errorlevel%==0 (
        echo ✓ Device preview CSS rules found in bundle!
    ) else (
        echo ⚠ Warning: device-mobile rules might not be in bundle
    )
) else (
    echo ✗ ERROR: CSS file not created!
    pause
    exit /b 1
)

echo.
echo [5/6] Verifying JavaScript build...
if exist dist\gmkb.iife.js (
    echo ✓ JavaScript bundle created
) else (
    echo ✗ ERROR: JavaScript not built!
    pause
    exit /b 1
)

echo.
echo [6/6] Build complete!
echo.
echo ========================================
echo  ✅ FIX APPLIED - TEST INSTRUCTIONS
echo ========================================
echo.
echo 1. Clear browser cache: Ctrl+Shift+R
echo 2. Clear WordPress cache if using plugin
echo 3. Open Media Kit Builder
echo 4. Click "Mobile" button
echo 5. Verify sections stack to 1 column
echo.
echo If issues persist:
echo - Open browser console (F12)
echo - Check for JavaScript errors
echo - Verify class "device-mobile" is on #media-kit-preview
echo.
pause
