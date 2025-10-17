@echo off
echo ========================================
echo ROOT CAUSE FIX - Font Encoding
echo ========================================
echo.
echo Fixed at 3 levels:
echo 1. PHP JSON encoding (enqueue.php)
echo 2. HTML option values (TypographyControl.vue)
echo 3. CSS generation (ComponentStyleService.js)
echo.
echo Building...
echo ========================================

call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ BUILD FAILED!
    pause
    exit /b %errorlevel%
)

echo.
echo ✅ Build completed successfully!
echo.
echo DEPLOYMENT:
echo ===========
echo 1. Upload dist/gmkb.iife.js to server
echo 2. Clear caches
echo 3. Test font changes
echo.
echo NO DATABASE MIGRATION NEEDED
echo NO CLEANUP SCRIPTS NEEDED
echo System is self-healing
echo.
echo Full docs: ROOT-CAUSE-TRUE-FIX-FONT-ENCODING.md
echo.
pause
