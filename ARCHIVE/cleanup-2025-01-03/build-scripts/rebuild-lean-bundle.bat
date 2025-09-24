@echo off
echo ========================================
echo      Vue/Vite Lean Bundle Builder
echo ========================================
echo.

echo [1/4] Checking Node.js installation...
node --version >nul 2>&1
if errorlevel 1 (
    echo ERROR: Node.js is not installed!
    echo Please install Node.js from https://nodejs.org/
    pause
    exit /b 1
)
echo Node.js found: 
node --version
echo.

echo [2/4] Installing/updating dependencies...
if not exist "node_modules" (
    echo Installing dependencies for first time...
    call npm install
) else (
    echo Dependencies already installed
)
echo.

echo [3/4] Building lean bundle with Vite...
call npm run build

echo.
echo [4/4] Verifying build output...
if exist "dist\gmkb.iife.js" (
    echo.
    echo ========================================
    echo     BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo Lean bundle created at: dist\gmkb.iife.js
    for %%I in ("dist\gmkb.iife.js") do echo Bundle size: %%~zI bytes
    echo.
    echo NEXT STEPS:
    echo 1. Clear your browser cache (Ctrl+Shift+Delete)
    echo 2. Reload the Media Kit Builder page
    echo 3. Open console and check for "LEAN BUNDLE" message
    echo 4. Run runLeanBundleDiagnostic() to verify
    echo.
) else (
    echo.
    echo ========================================
    echo     BUILD FAILED!
    echo ========================================
    echo.
    echo The bundle was not created. Check the errors above.
    echo.
)

pause