@echo off
echo.
echo ========================================
echo   BUILDING MEDIA KIT BUILDER
echo ========================================
echo.

cd /d "%~dp0"

echo Step 1: Building project...
call npm run build

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo ❌ BUILD FAILED!
    echo Check the error messages above.
    pause
    exit /b 1
)

echo.
echo ========================================
echo   BUILD SUCCESSFUL!
echo ========================================
echo.
echo Next steps:
echo 1. Go to WordPress admin
echo 2. Press Ctrl+Shift+R to hard reload
echo 3. Open your media kit builder
echo 4. Click on Biography component
echo 5. Change font size from 16px to 24px
echo 6. ✅ IT SHOULD UPDATE INSTANTLY!
echo.
echo If styles don't update instantly, check console (F12)
echo.
pause
