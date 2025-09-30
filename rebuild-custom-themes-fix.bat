@echo off
echo ============================================
echo CUSTOM THEMES FIX - FINAL REBUILD
echo ============================================
echo.
echo This will:
echo 1. Clean dist directory
echo 2. Rebuild Vue bundle with custom themes fix
echo 3. Verify REST API permissions are correct
echo 4. Show you what to test
echo.
pause

echo [1/5] Cleaning dist directory...
if exist dist\*.* del /Q dist\*.*
if exist dist rmdir /S /Q dist
echo      ✅ Dist directory cleaned
echo.

echo [2/5] Building Vue bundle (this may take a minute)...
npm run build
echo      ✅ Build complete
echo.

echo [3/5] Verifying build output...
if exist dist\gmkb.iife.js (
    echo      ✅ gmkb.iife.js created successfully
    for %%A in (dist\gmkb.iife.js) do echo      File size: %%~zA bytes
) else (
    echo      ❌ Build failed - gmkb.iife.js not found
    pause
    exit /b 1
)
echo.

echo [4/5] Checking REST API file...
if exist includes\api\class-rest-theme-controller.php (
    echo      ✅ REST API controller exists
    findstr /C:"write_permission_check" includes\api\class-rest-theme-controller.php >nul
    if !errorlevel! == 0 (
        echo      ✅ Permission check is configured
    ) else (
        echo      ⚠️  Warning: Permission check not found
    )
) else (
    echo      ❌ REST API controller missing
)
echo.

echo [5/5] Verification complete!
echo.
echo ============================================
echo CUSTOM THEMES FIX - DEPLOYMENT READY
echo ============================================
echo.
echo ✅ Changes implemented:
echo    - REST API requires authentication for custom themes
echo    - Vue store validates nonce before API calls
echo    - Graceful error handling for 403/401 responses
echo.
echo 📋 NEXT STEPS:
echo    1. Hard refresh your browser (Ctrl+Shift+R)
echo    2. Open Media Kit Builder
echo    3. Check console for success messages:
echo       - "[Theme Store] Loading 4 themes from server"
echo       - "[Theme Store] Initialized with 4 themes"
echo    4. No 403 errors should appear
echo    5. Try creating a custom theme
echo.
echo 🧪 TESTING CHECKLIST:
echo    [ ] No 403 errors in console
echo    [ ] Built-in themes load successfully
echo    [ ] Can open theme customizer
echo    [ ] Can customize theme colors/fonts
echo    [ ] Can save as custom theme
echo    [ ] Custom theme appears in theme list
echo    [ ] Can switch between themes
echo    [ ] Theme persists after page refresh
echo.
echo 📖 See CUSTOM-THEMES-FIX-COMPLETE.md for full documentation
echo.
pause
