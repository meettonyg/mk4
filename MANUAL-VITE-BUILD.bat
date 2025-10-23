@echo off
echo ========================================
echo  MANUAL VITE BUILD
echo ========================================
echo.

cd /d "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

echo [1] Cleaning everything:
if exist dist rmdir /s /q dist
if exist node_modules\.vite rmdir /s /q node_modules\.vite
echo    Cleaned
echo.

echo [2] Running Vite directly:
echo.

REM Try running vite directly
if exist node_modules\.bin\vite (
    echo Using local Vite:
    call node_modules\.bin\vite build
) else (
    echo Vite not found locally, trying npx:
    call npx vite build
)

echo.
echo [3] Check result:
if exist dist\gmkb.iife.js (
    echo ✅ BUILD SUCCESS!
    for %%A in (dist\gmkb.iife.js) do echo Size: %%~zA bytes
    
    echo.
    echo [4] Checking for our fix:
    findstr "overrideLayoutStyles" dist\gmkb.iife.js >nul 2>&1
    if %errorlevel%==0 (
        echo ✅ Fix is in the build!
    ) else (
        echo ❌ Fix NOT in build - source files may not be saved
    )
) else (
    echo ❌ BUILD FAILED!
    echo.
    echo Possible issues:
    echo 1. Vite not installed - run: npm install
    echo 2. Config error - check vite.config.js
    echo 3. Source error - check for JavaScript errors
)

echo.
pause
