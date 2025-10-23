@echo off
echo ========================================
echo  MOBILE RESPONSIVE FIX - REBUILD SCRIPT
echo ========================================
echo.
echo This script will rebuild the Vue application with the mobile responsive fixes.
echo.

cd /d "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

echo [1/5] Cleaning old build files...
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo.
echo [2/5] Installing dependencies (if needed)...
call npm install

echo.
echo [3/5] Building the project...
call npm run build

echo.
echo [4/5] Verifying build...
if exist dist\gmkb.css (
    echo ✓ CSS file built successfully
) else (
    echo ✗ ERROR: CSS file not found!
    pause
    exit /b 1
)

if exist dist\gmkb.iife.js (
    echo ✓ JavaScript file built successfully
) else (
    echo ✗ ERROR: JavaScript file not found!
    pause
    exit /b 1
)

echo.
echo [5/5] Build complete!
echo.
echo ========================================
echo  NEXT STEPS:
echo ========================================
echo 1. Clear your browser cache (Ctrl+Shift+R)
echo 2. Clear WordPress cache if using a caching plugin
echo 3. Test the device preview buttons (Mobile/Tablet)
echo 4. Test on an actual mobile device
echo.
echo If issues persist, check the browser console for errors.
echo.
pause
