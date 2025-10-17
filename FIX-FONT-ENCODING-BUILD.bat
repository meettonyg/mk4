@echo off
echo ========================================
echo FONT ENCODING FIX - BUILD AND DEPLOY
echo ========================================
echo.

echo Step 1: Building JavaScript bundle...
echo ======================================
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ BUILD FAILED!
    echo Please fix the errors above and try again.
    pause
    exit /b %errorlevel%
)

echo.
echo ✅ Build completed successfully!
echo.

echo Step 2: File Information
echo ======================================
echo Output: dist\gmkb.iife.js
dir dist\gmkb.iife.js | find "gmkb.iife.js"
echo.

echo ========================================
echo NEXT STEPS (Manual):
echo ========================================
echo.
echo 1. Clear WordPress Caches
echo    - Run: php clear-all-caches.php
echo    - Or use WordPress admin cache plugins
echo.
echo 2. Run Database Cleanup Script
echo    - Upload fix-font-encoding.php to plugin root
echo    - Access: /wp-content/plugins/guestify-media-kit-builder/fix-font-encoding.php
echo    - Review output
echo    - DELETE the script after running
echo.
echo 3. Test in Browser
echo    - Open any media kit
echo    - Edit Biography component
echo    - Change font to "Roboto"
echo    - Check DevTools for clean CSS (no &amp; entities)
echo    - Save and reload to verify persistence
echo.
echo 4. Verify Success
echo    - Font changes apply immediately
echo    - No HTML encoding in CSS
echo    - Multiple saves don't re-encode
echo.
echo 📖 Full instructions: ROOT-CAUSE-FIX-FONT-ENCODING-COMPLETE.md
echo.
pause
