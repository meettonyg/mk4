@echo off
color 0A
echo.
echo ================================================================================
echo     TESTING GUIDE - Component Style Updates
echo ================================================================================
echo.
echo STEP 1: BUILD
echo ================================================================================
echo   Run this command first:
echo   npm run build
echo.
pause
echo.
echo Building...
call npm run build
if errorlevel 1 (
    color 0C
    echo.
    echo ❌ BUILD FAILED!
    echo Fix errors above and try again.
    pause
    exit /b 1
)
echo.
echo ✅ Build successful!
echo.
pause

echo.
echo STEP 2: RELOAD WORDPRESS
echo ================================================================================
echo.
echo   1. Go to WordPress admin
echo   2. Press Ctrl+Shift+R (hard reload)
echo   3. Press Ctrl+F5 (clear cache)
echo   4. Open media kit builder
echo.
pause

echo.
echo STEP 3: QUICK SMOKE TEST (5 minutes)
echo ================================================================================
echo.
echo   Test ANY one component:
echo.
echo   1. Add Biography component to canvas
echo   2. Click to select it
echo   3. Open Style Panel (right side)
echo.
echo   4. Change FONT SIZE from 16px to 24px
echo      ✅ EXPECTED: Text gets bigger INSTANTLY (no reload)
echo.
echo   5. Change TEXT COLOR to blue (#3b82f6)
echo      ✅ EXPECTED: Text turns blue INSTANTLY
echo.
echo   6. Change BACKGROUND COLOR to light gray (#f3f4f6)
echo      ✅ EXPECTED: Background changes INSTANTLY
echo.
echo   7. Change PADDING to 30px all sides
echo      ✅ EXPECTED: Space inside increases INSTANTLY
echo.
echo ================================================================================
echo   Did all 4 changes update INSTANTLY?
echo ================================================================================
echo.
choice /C YN /M "Did the smoke test PASS"

if errorlevel 2 goto failed
if errorlevel 1 goto passed

:passed
color 0A
echo.
echo ================================================================================
echo   ✅ SMOKE TEST PASSED!
echo ================================================================================
echo.
echo   The fix is working! Style changes update instantly.
echo.
echo   OPTIONAL: Test more components to verify
echo   See TESTING-GUIDE.md for detailed test plan
echo.
goto end

:failed
color 0C
echo.
echo ================================================================================
echo   ❌ SMOKE TEST FAILED
echo ================================================================================
echo.
echo   Troubleshooting steps:
echo.
echo   1. Check browser console (F12) for errors
echo   2. Make sure you did hard reload (Ctrl+Shift+R)
echo   3. Clear browser cache completely (Ctrl+F5)
echo   4. Try different component type
echo.
echo   Debug commands (in browser console):
echo     debugComponentList()     - List all components
echo     debugBioComponent()      - Test Biography specifically
echo.
echo   If still not working, check console output above
echo   and share any error messages.
echo.

:end
echo ================================================================================
pause
