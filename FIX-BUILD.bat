@echo off
echo ================================================
echo  Guestify Media Kit Builder - Quick Fix Build
echo ================================================
echo.
echo Fixing Pods enrichment error...
echo.

cd /d "%~dp0"

echo [1/3] Cleaning old build...
if exist dist\gmkb.iife.js del /f dist\gmkb.iife.js
if exist dist\gmkb.css del /f dist\gmkb.css
echo      Done!
echo.

echo [2/3] Building production bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ BUILD FAILED!
    echo Please check the errors above.
    pause
    exit /b 1
)
echo      Done!
echo.

echo [3/3] Verifying build output...
if exist dist\gmkb.iife.js (
    echo      ✅ JavaScript bundle created
) else (
    echo      ❌ JavaScript bundle missing!
    pause
    exit /b 1
)

if exist dist\gmkb.css (
    echo      ✅ CSS bundle created
) else (
    echo      ⚠️  CSS bundle missing
)
echo.

echo ================================================
echo  ✅ BUILD SUCCESSFUL!
echo ================================================
echo.
echo Next steps:
echo 1. Clear your browser cache (Ctrl + Shift + R)
echo 2. Reload the media kit editor
echo 3. Check the browser console
echo 4. The undefined error should be gone!
echo.
echo See PODS-ENRICHMENT-ERROR-FIX.md for details.
echo.
pause
