@echo off
echo ============================================
echo THEME SWITCHER FIX - FINAL REBUILD
echo ============================================
echo.
echo Fixed: ThemeSwitcher passing undefined themeId
echo Changes: Added validation and logging
echo.
pause

echo [1/3] Cleaning dist...
if exist dist\*.* del /Q dist\*.*
if exist dist rmdir /S /Q dist
echo      ✅ Cleaned
echo.

echo [2/3] Building...
npm run build
if %errorlevel% neq 0 (
    echo      ❌ Build failed
    pause
    exit /b 1
)
echo      ✅ Built
echo.

echo [3/3] Verifying...
if exist dist\gmkb.iife.js (
    echo      ✅ Bundle ready
) else (
    echo      ❌ Bundle missing
    pause
    exit /b 1
)
echo.

echo ============================================
echo THEME SWITCHER FIX - COMPLETE
echo ============================================
echo.
echo ✅ What was fixed:
echo    1. Added validation for themeId (prevents undefined)
echo    2. Added console logging for debugging
echo    3. Removed duplicate save logic
echo    4. Theme store selectTheme now handles save via _trackChange
echo.
echo 📋 TESTING:
echo    1. Hard refresh browser (Ctrl+Shift+R)
echo    2. Click theme button in toolbar
echo    3. Console should show: "[ThemeSwitcher] Selecting theme: creative_bold"
echo    4. Theme should apply immediately
echo    5. Save and refresh - theme should persist
echo.
echo Console should show:
echo    [ThemeSwitcher] Selecting theme: creative_bold
echo    [Theme Store] Theme selected and saved...: creative_bold
echo    ✅ Theme applied: creative_bold
echo    ✅ Auto-saved
echo.
pause
