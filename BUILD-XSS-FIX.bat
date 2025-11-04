@echo off
echo =====================================
echo XSS SANITIZER FIX - BUILD AND TEST
echo =====================================
echo.

echo 1. Building application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo 2. Build successful!
echo 3. Checking for XSS sanitizer in build...

findstr /C:"XSSSanitizer" dist\gmkb.iife.js >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] XSS Sanitizer found in build
) else (
    echo    [WARNING] XSS Sanitizer might be missing from build
)

findstr /C:"__GMKB_XSS_SANITIZER_LOADED__" dist\gmkb.iife.js >nul 2>&1
if %errorlevel% equ 0 (
    echo    [OK] XSS Sanitizer side-effect marker found
) else (
    echo    [INFO] Side-effect marker not found - might be minified
)

echo.
echo 4. Deployment instructions:
echo    - The built file is at: dist\gmkb.iife.js
echo    - Deploy this to your WordPress site
echo    - Hard refresh browser: Ctrl+Shift+R
echo.
echo 5. Testing in browser console:
echo    ^> GMKB.services.xss
echo      Should return: Object with sanitization methods
echo.
echo    ^> GMKB.debugSanitization('https://example.com', 'website')
echo      Should show: Detected type: url, URL preserved
echo.
echo    ^> GMKB.debugSanitization('CEO ^& Founder', 'position')
echo      Should show: Detected type: text, HTML escaped
echo.
echo 6. If XSS sanitizer is still not found:
echo    - Clear browser cache completely
echo    - Check for console errors during load
echo    - Verify window.GMKB exists
echo    - Check window.__GMKB_XSS_SANITIZER_LOADED__
echo.

pause
