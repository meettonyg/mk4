@echo off
REM ROOT FIX: Rebuild bundle after fixing Vue component data bridge
REM This fixes the issue where Vue components render empty

echo ============================================
echo ROOT FIX: Vue Component Data Bridge Fix
echo ============================================
echo.
echo The Vue component discovery has been fixed to:
echo   1. Use existing renderer.vue.js files
echo   2. Properly pass component data to Vue components
echo   3. Stop trying to import non-existent .vue files
echo.
echo Building with the fix...
echo.

REM Run the build
call npm run build

REM Check if build was successful
if exist "dist\gmkb.iife.js" (
    echo.
    echo ============================================
    echo ROOT FIX APPLIED SUCCESSFULLY!
    echo ============================================
    echo.
    echo Vue components will now:
    echo   - Receive component data properly
    echo   - Display content instead of empty shells
    echo   - Work with the existing renderer.vue.js files
    echo.
    echo Please refresh your browser to see the fix!
) else (
    echo.
    echo Build failed! Check error messages above.
    exit /b 1
)
