@echo off
echo =====================================
echo URL SANITIZATION FIX - BUILD AND TEST
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
echo.
echo 3. Next steps:
echo    a) Open your browser and navigate to your media kit
echo    b) Open browser console (F12)
echo    c) Copy and paste the contents of test-url-sanitization.js
echo    d) Run the tests to verify URLs are no longer corrupted
echo.
echo 4. Manual verification:
echo    - Check that URLs display correctly in components
echo    - Verify social links work
echo    - Ensure website URLs are clickable
echo.
echo 5. If issues persist:
echo    - Clear browser cache (Ctrl+Shift+R)
echo    - Check console for any XSS sanitizer errors
echo    - Use GMKB.debugSanitization() for specific fields
echo.

pause
