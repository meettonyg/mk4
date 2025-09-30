@echo off
echo ============================================
echo THEME PERSISTENCE FIX - REBUILD
echo ============================================
echo.
echo Fixed: Theme selection now persists after save
echo Changes: Updated selectTheme and applyCustomizations
echo.
pause

echo [1/3] Cleaning dist directory...
if exist dist\*.* del /Q dist\*.*
if exist dist rmdir /S /Q dist
echo      ✅ Cleaned
echo.

echo [2/3] Building Vue bundle...
npm run build
if %errorlevel% neq 0 (
    echo      ❌ Build failed
    pause
    exit /b 1
)
echo      ✅ Build complete
echo.

echo [3/3] Verifying changes...
if exist dist\gmkb.iife.js (
    echo      ✅ Bundle created
    for %%A in (dist\gmkb.iife.js) do echo      Size: %%~zA bytes
) else (
    echo      ❌ Bundle not found
    pause
    exit /b 1
)
echo.

echo ============================================
echo THEME PERSISTENCE FIX - COMPLETE
echo ============================================
echo.
echo ✅ Changes Applied:
echo    1. selectTheme now updates media kit store
echo    2. Triggers _trackChange for auto-save
echo    3. Added logging for debugging
echo.
echo 📋 NEXT STEPS:
echo    1. Hard refresh browser (Ctrl+Shift+R)
echo    2. Select a theme in the builder
echo    3. Console should show:
echo       "[Theme Store] Theme selected and saved..."
echo    4. Save the media kit
echo    5. Refresh page - theme should persist!
echo.
echo 🧪 TESTING:
echo    [ ] Select theme (e.g., Creative Bold)
echo    [ ] Check console for confirmation message
echo    [ ] Save media kit
echo    [ ] Refresh page
echo    [ ] Theme should still be Creative Bold
echo.
pause
