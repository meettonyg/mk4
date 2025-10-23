@echo off
echo ========================================
echo  EMERGENCY REBUILD WITH FIXES
echo ========================================
echo.
echo CRITICAL: Your current build does NOT have the fixes!
echo We need to rebuild NOW.
echo.

cd /d "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

echo [1/5] Deleting old build completely...
if exist dist (
    rmdir /s /q dist
    echo    Old dist folder deleted
)

echo.
echo [2/5] Clearing Vite cache...
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
    echo    Vite cache cleared
)

echo.
echo [3/5] Building with ALL fixes...
call npm run build

echo.
echo [4/5] Verifying the fix is in the build...
findstr "overrideLayoutStyles" dist\gmkb.iife.js >nul 2>&1
if %errorlevel%==0 (
    echo    ✅ FIX CONFIRMED IN BUILD!
) else (
    echo    ❌ ERROR: Fix still not in build!
    echo    Something is wrong with the build process
    pause
    exit /b 1
)

echo.
echo [5/5] Build successful!
echo.
echo ========================================
echo  CRITICAL NEXT STEPS
echo ========================================
echo.
echo 1. CLEAR BROWSER CACHE COMPLETELY:
echo    - Open browser DevTools (F12)
echo    - Right-click the refresh button
echo    - Select "Empty Cache and Hard Reload"
echo.
echo 2. TEST IMMEDIATELY:
echo    - Click Mobile button
echo    - Check console:
echo      window.devicePreviewObserver
echo.
echo If observer is still undefined after this:
echo - WordPress might be caching the old file
echo - Clear WordPress cache if you have a plugin
echo.
pause
