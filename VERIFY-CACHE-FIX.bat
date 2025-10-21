@echo off
echo ====================================
echo CACHE FIX VERIFICATION
echo ====================================
echo.
echo This script verifies that the cache clearing fix has been applied.
echo.
echo Checking files...
echo.

findstr /C:"ROOT FIX: Clear ALL caches" includes\api\MediaKitAPI.php > nul
if %errorlevel% == 0 (
    echo [PASS] MediaKitAPI.php - Main save cache clearing added
) else (
    echo [FAIL] MediaKitAPI.php - Main save cache clearing MISSING
)

findstr /C:"ROOT FIX: Clear cache after saving theme customizations" includes\api\MediaKitAPI.php > nul
if %errorlevel% == 0 (
    echo [PASS] MediaKitAPI.php - Theme customization cache clearing added
) else (
    echo [FAIL] MediaKitAPI.php - Theme customization cache clearing MISSING
)

findstr /C:"ROOT FIX: Clear cache after deleting theme customizations" includes\api\MediaKitAPI.php > nul
if %errorlevel% == 0 (
    echo [PASS] MediaKitAPI.php - Theme deletion cache clearing added
) else (
    echo [FAIL] MediaKitAPI.php - Theme deletion cache clearing MISSING
)

findstr /C:"ROOT FIX: Clear cache after updating theme selection" includes\api\class-rest-theme-controller.php > nul
if %errorlevel% == 0 (
    echo [PASS] REST Theme Controller - Cache clearing added
) else (
    echo [FAIL] REST Theme Controller - Cache clearing MISSING
)

echo.
echo ====================================
echo.
echo TESTING INSTRUCTIONS:
echo.
echo 1. Clear all WordPress caches (if using a caching plugin)
echo 2. Open your media kit in the builder
echo 3. Change the theme (e.g., from professional_clean to modern_dark)
echo 4. Click Save
echo 5. Refresh the page (F5)
echo 6. The new theme should persist
echo 7. Check the frontend preview - it should show the new theme
echo.
echo If the theme persists after refresh, the fix is working!
echo.
pause
