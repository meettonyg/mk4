@echo off
REM Build Script for Media Kit Builder Vue Bundle
REM This rebuilds the gmkb.iife.js bundle with the fixed source code

echo ============================================
echo Media Kit Builder - Rebuild Vue Bundle
echo ============================================

REM Check if npm is installed
where npm >nul 2>nul
if %errorlevel% neq 0 (
    echo ERROR: npm is not installed
    echo Please install Node.js and npm first
    exit /b 1
)

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please run this script from the plugin root directory
    exit /b 1
)

echo.
echo Installing dependencies...
call npm install

echo.
echo Building the bundle...
call npm run build

REM Check if build was successful
if exist "dist\gmkb.iife.js" (
    echo.
    echo Build successful!
    echo Bundle created at: dist\gmkb.iife.js
    echo.
    echo The bundle now includes:
    echo   - Fixed APIService with mkcg_id detection
    echo   - Proper post ID handling
    echo   - Better error handling
    echo.
    echo The save functionality should now work correctly!
) else (
    echo.
    echo Build failed!
    echo Please check the error messages above
    exit /b 1
)
