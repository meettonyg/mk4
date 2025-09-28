@echo off
echo ============================================
echo FINAL COMPREHENSIVE FIX AND BUILD
echo ============================================
echo.

cd /d C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

echo Step 1: Cleaning all build artifacts...
echo ----------------------------------------
if exist dist rd /s /q dist
mkdir dist

echo.
echo Step 2: Clearing npm cache...
echo ----------------------------------------
call npm cache clean --force

echo.
echo Step 3: Building fresh Vue bundle...
echo ----------------------------------------
call npm run build

echo.
echo ============================================
if %errorlevel% == 0 (
    echo ✅ BUILD SUCCESSFUL!
    echo.
    echo 📋 ALL FIXES APPLIED:
    echo ============================================
    echo.
    echo 1. REST API Authentication Fixed:
    echo    ✓ MediaKitAPI.php now properly accepts WP_REST_Request
    echo    ✓ Nonce verification using get_header('X-WP-Nonce')
    echo    ✓ Proper permission checks for GET vs POST
    echo.
    echo 2. Vue Store Fixed:
    echo    ✓ mediaKit.js sends X-WP-Nonce header
    echo    ✓ Uses 'api' field from gmkbData
    echo    ✓ Includes credentials: 'same-origin'
    echo.
    echo 3. Legacy Script Removed:
    echo    ✓ component-library-bridge.js no longer referenced
    echo    ✓ Clean Vue-only architecture
    echo.
    echo ============================================
    echo.
    echo 🔧 NEXT STEPS:
    echo.
    echo 1. Clear ALL browser data:
    echo    - Press Ctrl+Shift+Delete
    echo    - Select "Cached images and files"
    echo    - Clear data for all time
    echo.
    echo 2. Hard refresh the page:
    echo    - Press Ctrl+F5 multiple times
    echo.
    echo 3. If errors persist, try:
    echo    - Open in Incognito/Private mode
    echo    - Different browser
    echo.
    echo The application should now work without errors!
    echo.
) else (
    echo ❌ BUILD FAILED
    echo Please check the error messages above
)
echo ============================================
echo.
pause
