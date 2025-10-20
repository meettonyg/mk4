@echo off
REM Theme Customizer Preview Consolidation Build Script
REM Run this after applying the preview consolidation fix

echo ========================================
echo Theme Customizer Preview Fix - BUILD
echo ========================================
echo.

cd /d "%~dp0"

echo [1/3] Cleaning previous build...
if exist "dist" (
    rd /s /q "dist"
    echo     - Cleaned dist directory
)

echo.
echo [2/3] Building application...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo [3/3] Verifying build...
if not exist "dist\main.js" (
    echo ERROR: Build verification failed - dist\main.js not found
    pause
    exit /b 1
)

echo     - Build verified successfully

echo.
echo ========================================
echo BUILD COMPLETE!
echo ========================================
echo.
echo Next steps:
echo 1. Test in WordPress admin
echo 2. Open Theme Customizer (Ctrl+Shift+T)
echo 3. Verify NO preview panels in tabs
echo 4. Verify LEFT preview updates from all controls
echo.
echo See THEME-CUSTOMIZER-PREVIEW-CONSOLIDATION-FIX.md for testing guide
echo.
pause
