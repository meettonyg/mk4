@echo off
echo ================================================
echo FIXING DOUBLE URL PATH ISSUE
echo ================================================
echo.

cd /d C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

echo The issue was: gmkb/v1 was appearing twice in the URL
echo Fixed: mediaKit.js now checks if apiUrl already contains gmkb/v1
echo.

echo Rebuilding Vue bundle with URL fix...
call npm run build

echo.
echo ================================================
if %errorlevel% == 0 (
    echo ✅ BUILD SUCCESSFUL!
    echo.
    echo The URL path issue is now fixed!
    echo.
    echo Please:
    echo 1. Clear browser cache (Ctrl+Shift+Delete)
    echo 2. Hard refresh the page (Ctrl+F5)
    echo.
    echo The API calls should now work correctly:
    echo   - /wp-json/gmkb/v1/mediakit/32372 (correct)
    echo   - NOT: /wp-json/gmkb/v1/gmkb/v1/mediakit/32372 (wrong)
) else (
    echo ❌ BUILD FAILED
)
echo ================================================
pause
