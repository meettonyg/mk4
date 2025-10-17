@echo off
echo.
echo ================================================================================
echo     ROOT CAUSE FIX - BIOGRAPHY COMPONENT STYLES
echo ================================================================================
echo.
echo ISSUE:
echo   Biography component styles (background, padding, border) not applying
echo.
echo ROOT CAUSE:
echo   Duplicate data-component-id attribute broke CSS selector matching
echo.
echo FIX:
echo   Removed duplicate attribute from Biography.vue template
echo.
echo FILES CHANGED:
echo   - components/biography/Biography.vue (1 line removed)
echo.
echo ================================================================================
echo.
echo DEPLOYMENT STEPS:
echo.
echo [1/5] Rebuilding Vue bundle...
echo ================================================================================
call npm run build
if errorlevel 1 (
    echo.
    echo ❌ BUILD FAILED!
    echo Please fix build errors and try again.
    pause
    exit /b 1
)

echo.
echo [2/5] Build complete!
echo ================================================================================
echo.
echo [3/5] Checking build output...
dir /b dist\gmkb.iife.js 2>nul
if errorlevel 1 (
    echo ❌ Build file not found!
    pause
    exit /b 1
)
echo ✅ Build file exists
echo.

echo [4/5] Next steps:
echo ================================================================================
echo   1. Reload WordPress admin page (Ctrl+Shift+R)
echo   2. Clear browser cache completely
echo   3. Open media kit builder
echo   4. Select Biography component
echo   5. Change background color in settings panel
echo   6. Verify color applies immediately
echo.
echo [5/5] Verification command:
echo ================================================================================
echo   Open browser console and run:
echo   debugBioComponent()
echo.
echo   Expected output:
echo   ✅ Background color matches settings
echo   ✅ CSS selector structure is correct
echo   ✅ No duplicate data-component-id attributes
echo.
echo ================================================================================
echo DEPLOYMENT COMPLETE!
echo ================================================================================
echo.
echo Documentation:
echo   - ROOT-CAUSE-FIX-BIOGRAPHY-STYLES.md (detailed analysis)
echo   - CRITICAL-FIX-SUMMARY.md (quick reference)
echo   - VISUAL-FIX-SIMPLE.md (visual explanation)
echo.
pause
