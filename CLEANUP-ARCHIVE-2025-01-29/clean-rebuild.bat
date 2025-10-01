@echo off
echo ====================================
echo Cleaning and Rebuilding Vue Bundle
echo ====================================
echo.

cd /d C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

echo Cleaning old build artifacts...
if exist dist\gmkb.iife.js del dist\gmkb.iife.js
if exist dist\style.css del dist\style.css

echo.
echo Building fresh Vue bundle...
call npm run build

echo.
echo ====================================
if %errorlevel% == 0 (
    echo Build Successful!
    echo.
    echo Summary of fixes applied:
    echo ----------------------------------------
    echo 1. REST API endpoints added for themes
    echo    - GET /wp-json/gmkb/v1/themes/custom
    echo    - POST /wp-json/gmkb/v1/themes/custom
    echo.
    echo 2. Permission checks updated
    echo    - More flexible for viewing (GET requests)
    echo    - Proper checks for editing (POST requests)
    echo.
    echo 3. Theme store updated to use REST API
    echo    - No more admin-ajax.php calls
    echo    - Proper error handling
    echo.
    echo 4. Removed unused script references
    echo    - component-library-bridge.js removed
    echo.
    echo 5. API initialization fixed
    echo    - REST routes registered on init hook
    echo ----------------------------------------
    echo.
    echo Please clear your browser cache and reload the page.
) else (
    echo Build Failed - Check errors above
)
echo ====================================
echo.
pause
