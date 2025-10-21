@echo off
echo ====================================
echo CACHE FIX VERIFICATION v2
echo ====================================
echo.
echo This script verifies the enhanced cache clearing fix.
echo.
echo Checking files...
echo.

findstr /C:"delete_post_meta_cache($post_id)" includes\api\MediaKitAPI.php > nul
if %errorlevel% == 0 (
    echo [PASS] MediaKitAPI.php - delete_post_meta_cache() added
) else (
    echo [FAIL] MediaKitAPI.php - delete_post_meta_cache() MISSING
)

findstr /C:"function_exists('clean_post_cache')" includes\api\MediaKitAPI.php > nul
if %errorlevel% == 0 (
    echo [PASS] MediaKitAPI.php - Defensive function_exists() checks added
) else (
    echo [FAIL] MediaKitAPI.php - Defensive function_exists() checks MISSING
)

findstr /C:"GMKB Cache Clear" includes\api\MediaKitAPI.php > nul
if %errorlevel% == 0 (
    echo [PASS] MediaKitAPI.php - Debug logging added
) else (
    echo [FAIL] MediaKitAPI.php - Debug logging MISSING
)

findstr /C:"wp_cache_delete('gmkb_media_kit_state'" includes\api\MediaKitAPI.php > nul
if %errorlevel% == 0 (
    echo [PASS] MediaKitAPI.php - Targeted cache key clearing added
) else (
    echo [FAIL] MediaKitAPI.php - Targeted cache key clearing MISSING
)

echo.
echo ====================================
echo.
echo ENHANCED TESTING INSTRUCTIONS:
echo.
echo 1. Enable WP_DEBUG in wp-config.php:
echo    define('WP_DEBUG', true);
echo    define('WP_DEBUG_LOG', true);
echo.
echo 2. Open your media kit in the builder
echo.
echo 3. Change the theme (e.g., professional_clean to modern_dark)
echo.
echo 4. Click Save
echo.
echo 5. Check debug.log for: [GMKB Cache Clear] Post ID: X, Theme: modern_dark
echo.
echo 6. Refresh the page (F5)
echo.
echo 7. Theme should persist as modern_dark
echo.
echo 8. Check the frontend - should show modern_dark
echo.
echo If ALL of these work, the fix is successful!
echo.
echo TROUBLESHOOTING:
echo - If you don't see the cache clear log, check if WP_DEBUG is enabled
echo - If theme still doesn't persist, you may have a persistent cache plugin
echo   (Redis, Memcached, WP Super Cache, etc.) that needs to be cleared
echo - Try disabling cache plugins temporarily to test
echo.
pause
