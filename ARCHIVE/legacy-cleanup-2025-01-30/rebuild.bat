@echo off
echo ========================================
echo  Rebuilding Vue Media Kit Builder
echo ========================================
echo.

echo [1/3] Cleaning old build...
if exist dist\gmkb.iife.js (
    del dist\gmkb.iife.js
    echo       Old bundle removed
) else (
    echo       No old bundle found
)

echo.
echo [2/3] Building with Vite...
call npm run build

echo.
echo [3/3] Build complete!
echo.
echo ========================================
echo  Ready to test!
echo ========================================
echo.
echo Clear your browser cache and reload the page.
echo.
pause
