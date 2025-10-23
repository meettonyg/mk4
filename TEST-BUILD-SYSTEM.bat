@echo off
echo ========================================
echo  TESTING BUILD SYSTEM
echo ========================================
echo.

cd /d "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

echo Step 1: Check Node/NPM installation
where node >nul 2>&1
if %errorlevel%==0 (
    echo ✓ Node found: 
    node --version
) else (
    echo ✗ Node.js NOT installed!
    echo Install from: https://nodejs.org/
    pause
    exit /b 1
)

where npm >nul 2>&1
if %errorlevel%==0 (
    echo ✓ NPM found:
    npm --version
) else (
    echo ✗ NPM not found!
    pause
    exit /b 1
)
echo.

echo Step 2: Check dependencies
if exist node_modules\vite (
    echo ✓ Vite is installed
) else (
    echo ✗ Vite not installed
    echo Installing dependencies...
    call npm install
)
echo.

echo Step 3: Simple build test
echo ========================================
call npx vite build --debug
echo ========================================
echo.

echo Step 4: Check results
if exist dist\gmkb.iife.js (
    echo ✅ BUILD WORKS!
) else (
    echo ❌ BUILD BROKEN
    echo.
    echo Check the error messages above
)
echo.

pause
