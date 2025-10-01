@echo off
echo ====================================
echo Building Media Kit Builder Vue Bundle
echo ====================================
echo.

cd /d C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

echo Current directory: %CD%
echo.

echo Running npm run build...
call npm run build

echo.
echo ====================================
if %errorlevel% == 0 (
    echo Build Successful!
    echo.
    echo Changes Applied:
    echo 1. Fixed 401 error - now using REST API for themes
    echo 2. Fixed 404 error - removed unused script reference
    echo 3. Updated import paths in Vue components
    echo.
    echo The application should now load without errors.
) else (
    echo Build Failed - Check errors above
)
echo ====================================
echo.
pause
