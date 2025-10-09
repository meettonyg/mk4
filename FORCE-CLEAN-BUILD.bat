@echo off
cls
echo ========================================
echo   FORCE CLEAN BUILD
echo ========================================
echo.
echo This will:
echo 1. Delete old dist files
echo 2. Rebuild completely
echo 3. Verify new files exist
echo.
pause

echo.
echo Step 1: Deleting old dist files...
if exist "dist\gmkb.iife.js" del "dist\gmkb.iife.js"
if exist "dist\gmkb.css" del "dist\gmkb.css"
echo ✅ Old files deleted
echo.

echo Step 2: Clean build...
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b %errorlevel%
)
echo.

echo Step 3: Verify new files exist...
if not exist "dist\gmkb.iife.js" (
    echo ❌ gmkb.iife.js NOT created!
    pause
    exit /b 1
)
if not exist "dist\gmkb.css" (
    echo ❌ gmkb.css NOT created!
    pause
    exit /b 1
)
echo ✅ New files confirmed
echo.

echo Step 4: Show file info...
dir dist\gmkb.*
echo.

echo ========================================
echo ✅ CLEAN BUILD COMPLETE
echo ========================================
echo.
echo CRITICAL NEXT STEPS:
echo.
echo 1. Clear WordPress cache (if any)
echo 2. Close browser COMPLETELY
echo 3. Reopen browser
echo 4. Hard refresh page (Ctrl+Shift+R)
echo 5. Check console for new structure:
echo.
echo    window.GMKB.stores      (should exist)
echo    window.GMKB.app         (should exist)
echo    window.GMKB.architecture (should be 'pure-vue')
echo.
echo If STILL seeing old structure:
echo  - Check WordPress is loading from dist/ folder
echo  - Check file timestamps in dist/
echo  - Check browser Network tab for gmkb.iife.js
echo.
pause
