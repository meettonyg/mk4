@echo off
REM ========================================
REM CSS Architecture Fix - Build and Test
REM ========================================

echo.
echo ========================================
echo CSS ARCHITECTURE FIX - BUILD AND TEST
echo ========================================
echo.

REM Step 1: Run HTML structure audit
echo [1/4] Running HTML structure audit...
node scripts/audit-html-structure.js
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: HTML structure audit failed!
    echo Please fix the components listed above.
    pause
    exit /b 1
)
echo.

REM Step 2: Build the project
echo [2/4] Building project...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ERROR: Build failed!
    echo Check the error messages above.
    pause
    exit /b 1
)
echo.

REM Step 3: Verify files exist
echo [3/4] Verifying build output...
if not exist "dist\media-kit-builder.js" (
    echo ERROR: dist/media-kit-builder.js not found!
    pause
    exit /b 1
)
if not exist "design-system\index.css" (
    echo ERROR: design-system/index.css not found!
    pause
    exit /b 1
)
echo   ✅ All build files present
echo.

REM Step 4: Show manual testing instructions
echo [4/4] Manual Testing Required
echo.
echo ========================================
echo MANUAL TESTING CHECKLIST
echo ========================================
echo.
echo 1. Open WordPress Admin
echo 2. Go to Media Kit Builder
echo 3. Add a Biography component
echo 4. Click "Style" tab in right panel
echo 5. Change "Font Size" to 19px
echo 6. CHECK: Does text immediately change to 19px?
echo.
echo 7. Open Theme Customizer
echo 8. Switch between themes
echo 9. CHECK: Do all components update colors/fonts?
echo.
echo 10. Open browser DevTools (F12)
echo 11. Go to Elements tab
echo 12. Inspect Biography component
echo 13. CHECK: Are CSS variables applied?
echo 14. CHECK: Look for [data-gmkb-theme] attribute
echo 15. CHECK: Look for .gmkb-component classes
echo.
echo ========================================
echo CSS CASCADE VERIFICATION
echo ========================================
echo.
echo In DevTools Console, run:
echo   window.debugBioComponent()
echo.
echo This will show you:
echo   - Component settings from store
echo   - Computed styles from DOM
echo   - Comparison of settings vs rendered
echo.
echo Expected Results:
echo   ✅ Font size from store matches DOM
echo   ✅ CSS specificity shows (0,2,1) for user styles
echo   ✅ No competing styles with !important
echo   ✅ Theme variables visible in computed styles
echo.
echo ========================================
echo.
echo Build complete! Ready for manual testing.
echo.
pause
