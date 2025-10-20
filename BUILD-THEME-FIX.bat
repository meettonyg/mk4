@echo off
REM Theme Customizer Preview Fix - Build Script
REM This script rebuilds the Vue application with the dark theme fix

echo =====================================
echo Theme Customizer Preview Fix
echo Building Vue Application
echo =====================================
echo.

REM Navigate to plugin directory
cd /d "%~dp0"

echo Current directory: %CD%
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo [ERROR] node_modules not found!
    echo Please run: npm install
    echo.
    pause
    exit /b 1
)

echo [1/2] Cleaning old build...
if exist "dist\" (
    rmdir /s /q dist
    echo Old build cleaned
) else (
    echo No old build found
)
echo.

echo [2/2] Building Vue application...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo [ERROR] Build failed!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo =====================================
echo Build Complete!
echo =====================================
echo.
echo Next Steps:
echo 1. Refresh your WordPress admin page
echo 2. Open Theme Customizer (Ctrl+Shift+T)
echo 3. Select "Modern Dark" theme
echo 4. Verify preview shows dark background
echo.
echo Expected: Preview background = #111827 (dark)
echo Expected: Text color = #f3f4f6 (light)
echo.
pause
