@echo off
echo ========================================
echo   REBUILD - Enhanced Debug Logging
echo ========================================
echo.
echo Changes:
echo  - Added bright colored logs (Red/Green circles)
echo  - Logs appear IMMEDIATELY on button click
echo  - Shows if UI Store methods exist
echo.

call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ BUILD FAILED
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo ✅ BUILD COMPLETE
echo ========================================
echo.
echo TESTING STEPS:
echo.
echo 1. Hard refresh browser (Ctrl+Shift+R)
echo 2. Open console (F12)
echo 3. Click section eye icon
echo    Look for: 🔴🔴🔴 SECTION BUTTON CLICKED!
echo.
echo 4. Click component pencil icon  
echo    Look for: 🟢🟢🟢 COMPONENT EDIT CLICKED!
echo.
echo If you DON'T see these logs = buttons not wired
echo If you DO see these logs = check what comes after
echo.
pause
