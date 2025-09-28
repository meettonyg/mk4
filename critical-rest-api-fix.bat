@echo off
echo ================================================
echo CRITICAL FIX: REST API Authentication
echo ================================================
echo.

cd /d C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

echo The following critical fixes have been applied:
echo ------------------------------------------------
echo.
echo 1. REST API Nonce Fix (enqueue-separated.php):
echo    - Changed nonce from 'gmkb_nonce' to 'wp_rest'
echo    - Added 'api' field with full REST URL
echo    - Separated REST nonce from AJAX nonce
echo.
echo 2. Removed Legacy Script (enqueue-separated.php):
echo    - Removed component-library-bridge.js reference
echo    - This eliminates the 404 error
echo.
echo 3. Data Localization Fix:
echo    - Changed to use 'gmkbData' as primary
echo    - Vue bundle expects this variable name
echo.
echo ------------------------------------------------
echo.
echo Cleaning and rebuilding...
echo.

REM Clean old artifacts
if exist dist\gmkb.iife.js del dist\gmkb.iife.js
if exist dist\style.css del dist\style.css

echo Building Vue bundle with fixes...
call npm run build

echo.
echo ================================================
if %errorlevel% == 0 (
    echo ✅ BUILD SUCCESSFUL!
    echo.
    echo The 403 Forbidden errors should now be fixed!
    echo.
    echo IMPORTANT: Clear your browser cache completely:
    echo 1. Press Ctrl+Shift+Delete
    echo 2. Select "Cached images and files"
    echo 3. Clear for "All time"
    echo 4. Hard refresh with Ctrl+F5
    echo.
    echo If you still see errors, they are cached.
    echo Try opening in Incognito/Private mode.
) else (
    echo ❌ BUILD FAILED
    echo Check the errors above
)
echo ================================================
echo.
pause
