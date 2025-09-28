@echo off
echo ================================================
echo FINAL COMPREHENSIVE URL FIX
echo ================================================
echo.

cd /d C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

echo Fixed Issues:
echo - mediaKit.js: Double URL path for /mediakit endpoint
echo - theme.js: Double URL path for /themes/custom endpoint
echo.
echo Building with ALL URL fixes...

call npm run build

echo.
echo ================================================
if %errorlevel% == 0 (
    echo ✅ BUILD SUCCESSFUL!
    echo.
    echo All REST API endpoints should now work correctly:
    echo   ✓ /wp-json/gmkb/v1/mediakit/{id}
    echo   ✓ /wp-json/gmkb/v1/mediakit/{id}/save
    echo   ✓ /wp-json/gmkb/v1/themes/custom
    echo.
    echo Please clear your browser cache and refresh!
) else (
    echo ❌ BUILD FAILED
)
echo ================================================
pause
