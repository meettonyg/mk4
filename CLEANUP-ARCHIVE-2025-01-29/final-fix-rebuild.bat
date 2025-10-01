@echo off
echo ====================================
echo Complete Fix and Rebuild
echo ====================================
echo.

cd /d C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

echo Cleaning old build artifacts...
if exist dist\gmkb.iife.js del dist\gmkb.iife.js
if exist dist\style.css del dist\style.css

echo.
echo Building fresh Vue bundle with all fixes...
call npm run build

echo.
echo ====================================
if %errorlevel% == 0 (
    echo ✅ Build Successful!
    echo.
    echo 📝 Summary of all fixes applied:
    echo ========================================
    echo.
    echo 1. REST API Permission Fixes:
    echo    - Added proper nonce verification in check_permissions
    echo    - Returns proper WP_Error objects for better error handling
    echo    - Separate permission checks for GET vs POST requests
    echo.
    echo 2. Theme Store Fixes:
    echo    - Uses REST API instead of admin-ajax.php
    echo    - Sends X-WP-Nonce header for authentication
    echo    - Includes credentials: 'same-origin' for cookies
    echo.
    echo 3. MediaKit Store Fixes:
    echo    - Fixed API URL resolution (uses 'api' or 'restUrl')
    echo    - Added X-WP-Nonce header to all API calls
    echo    - Added credentials: 'same-origin' for authentication
    echo    - Fixed save endpoint URL (/save suffix was missing)
    echo.
    echo 4. WordPress Plugin Fixes:
    echo    - MediaKitAPI class is now properly initialized on init hook
    echo    - REST routes are registered early (priority 5)
    echo.
    echo 5. Removed Legacy References:
    echo    - Commented out component-library-bridge.js enqueue
    echo    - No more 404 errors for missing scripts
    echo.
    echo ========================================
    echo.
    echo 🔧 Next Steps:
    echo 1. Clear your browser cache (Ctrl+Shift+Delete)
    echo 2. Reload the media kit builder page
    echo 3. The console errors should be resolved
    echo.
    echo If you still see errors, they might be cached.
    echo Try opening in an incognito/private window.
) else (
    echo ❌ Build Failed - Check errors above
)
echo ====================================
echo.
pause
