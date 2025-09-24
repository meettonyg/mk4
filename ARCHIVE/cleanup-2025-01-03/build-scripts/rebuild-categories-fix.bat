@echo off
echo ========================================
echo ROOT FIX: Categories Support for Components
echo ========================================
echo.

echo Step 1: Clear browser cache
echo - Press Ctrl+Shift+Delete in browser
echo - Clear cached images and files
echo - Clear cookies for your WordPress site
echo.
pause

echo Step 2: Clear WordPress cache
echo - Go to WordPress admin
echo - Clear any caching plugins (if installed)
echo.
pause

echo Step 3: Rebuild the bundle
echo Building...
call npm run build

echo.
echo ========================================
echo BUILD COMPLETE - Categories Fix Applied
echo ========================================
echo.
echo IMPORTANT: Test the following:
echo 1. Open the Media Kit Builder page
echo 2. Click "Add Component" button
echo 3. You should now see:
echo    - Categories in the left sidebar
echo    - Components filtered by category
echo    - "All Components" option at top
echo.
echo The fix ensures:
echo - ComponentDiscovery.php scans and creates categories
echo - Categories are passed to JavaScript via gmkbData
echo - Vue component library displays categories
echo.
pause
