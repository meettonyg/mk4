@echo off
echo ============================================
echo CSS ARCHITECTURE FIX - BUILD AND TEST
echo Phases 1-4 Complete
echo ============================================
echo.

echo [1/4] Running npm install...
call npm install
if errorlevel 1 (
    echo ERROR: npm install failed
    pause
    exit /b 1
)
echo.

echo [2/4] Building application...
call npm run build
if errorlevel 1 (
    echo ERROR: Build failed
    pause
    exit /b 1
)
echo.

echo [3/4] Checking for build artifacts...
if exist "dist\assets\index.js" (
    echo SUCCESS: dist\assets\index.js exists
) else (
    echo WARNING: dist\assets\index.js not found
)

if exist "dist\assets\index.css" (
    echo SUCCESS: dist\assets\index.css exists
) else (
    echo WARNING: dist\assets\index.css not found
)
echo.

echo [4/4] Build complete!
echo.
echo ============================================
echo NEXT STEPS:
echo ============================================
echo 1. Open WordPress admin
echo 2. Navigate to Media Kit Builder
echo 3. Open browser console (F12)
echo 4. Look for these messages:
echo    - "ThemeStyleInjector initialized"
echo    - "Theme applied via ThemeStyleInjector"
echo 5. Verify theme switching works
echo 6. Check CSS variables in DOM:
echo    - Inspect element with [data-gmkb-theme]
echo    - Look for --gmkb-* CSS variables
echo.
echo ============================================
echo.

pause
