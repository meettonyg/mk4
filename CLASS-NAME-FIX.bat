@echo off
echo ========================================
echo  CLASS NAME FIX - FINAL BUILD
echo ========================================
echo.
echo FIXES APPLIED:
echo 1. DevicePreview.vue - Sets BOTH device-mobile AND gmkb-device--mobile classes
echo 2. SectionLayout.vue - CSS matches BOTH naming conventions
echo 3. Observer monitors ALL layout elements including gmkb-section__content
echo.

cd /d "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

echo [1/4] Cleaning old build...
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite

echo.
echo [2/4] Building with fixes...
call npm run build

echo.
echo [3/4] Verifying build...
if exist dist\gmkb.iife.js (
    echo ✓ JavaScript bundle created
) else (
    echo ✗ Build failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Build complete!
echo.
echo ========================================
echo  CRITICAL TEST STEPS
echo ========================================
echo.
echo 1. CLEAR BROWSER CACHE COMPLETELY:
echo    - Press Ctrl+Shift+Delete
echo    - Select "Cached images and files"
echo    - Clear data
echo.
echo 2. RELOAD THE PAGE:
echo    - Press Ctrl+F5
echo.
echo 3. OPEN CONSOLE AND RUN:
echo    document.querySelector('#media-kit-preview').className
echo    Should show: gmkb-device--mobile device-mobile
echo.
echo 4. CHECK OBSERVER:
echo    window.devicePreviewObserver
echo    Should NOT be undefined
echo.
echo 5. VERIFY LAYOUT:
echo    Click Mobile button
echo    Columns should stack to 1 column
echo.
pause
