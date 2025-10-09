@echo off
echo ============================================
echo SECTION SETTINGS SIDEBAR - ROOT FIX BUILD
echo ============================================
echo.

echo [1/4] Cleaning previous build...
rmdir /s /q dist 2>nul
rmdir /s /q node_modules\.vite 2>nul
echo      Done!
echo.

echo [2/4] Installing dependencies...
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo      Done!
echo.

echo [3/4] Building production bundle...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: build failed
    pause
    exit /b 1
)
echo      Done!
echo.

echo [4/4] Clearing WordPress caches...
php clear-all-caches.php
echo      Done!
echo.

echo ============================================
echo BUILD COMPLETE!
echo ============================================
echo.
echo The Section Settings panel is now implemented as
echo an Elementor-style RIGHT SIDEBAR (not a modal).
echo.
echo NEXT STEPS:
echo 1. Clear your browser cache (Ctrl+Shift+Delete)
echo 2. Hard reload the page (Ctrl+F5)
echo 3. Click the settings button on any section
echo 4. The panel should slide in from the RIGHT side
echo.
echo If you still see a modal instead of a sidebar,
echo check the browser console for debug messages.
echo.
pause
