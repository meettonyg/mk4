@echo off
echo ============================================
echo  Media Kit Builder - Rebuild Lean Bundle
echo ============================================
echo.
echo This will rebuild the lean bundle with all
echo the latest fixes for toolbar buttons and UI.
echo.

cd /d "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

:: Check for Node.js
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo [ERROR] Node.js is not installed!
    echo.
    echo Please install Node.js from: https://nodejs.org/
    echo After installing, run this script again.
    echo.
    pause
    exit /b 1
)

echo [OK] Node.js found
echo.

:: Install dependencies if needed
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if %errorlevel% neq 0 (
        echo [ERROR] Failed to install dependencies
        pause
        exit /b 1
    )
    echo.
)

:: Build the bundle
echo Building the lean bundle...
echo This will compile all files in src/ into dist/gmkb.iife.js
echo.

call npm run build

if %errorlevel% equ 0 (
    echo.
    echo ============================================
    echo  BUILD SUCCESSFUL!
    echo ============================================
    echo.
    echo The lean bundle has been rebuilt with:
    echo  - All toolbar button event handlers
    echo  - Sidebar tab switching
    echo  - Drag and drop functionality
    echo  - Component library modal
    echo  - Export functionality
    echo.
    
    :: Re-enable the lean bundle
    powershell -Command "(Get-Content 'includes\enqueue.php') -replace 'define\( ''GMKB_USE_LEAN_BUNDLE'', false \)', 'define( ''GMKB_USE_LEAN_BUNDLE'', true )' | Set-Content 'includes\enqueue.php'"
    
    echo The lean bundle has been re-enabled.
    echo.
    echo Next steps:
    echo 1. Refresh your browser
    echo 2. Test all toolbar buttons
    echo 3. Enjoy the 80%% faster load time!
    echo.
) else (
    echo.
    echo ============================================
    echo  BUILD FAILED
    echo ============================================
    echo.
    echo Please check the error messages above.
    echo Common issues:
    echo - Missing dependencies (run: npm install)
    echo - Syntax errors in src files
    echo.
)

pause
