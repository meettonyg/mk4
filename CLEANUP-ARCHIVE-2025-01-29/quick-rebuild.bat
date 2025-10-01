@echo off
echo ============================================
echo THEME DEBUG - Quick Rebuild
echo ============================================
echo.

echo [1/2] Building...
npm run build

echo.
echo [2/2] Testing instructions:
echo    1. Hard refresh (Ctrl+Shift+R)
echo    2. Click theme button
echo    3. Check console for theme structure
echo    4. Look for: "[ThemeSwitcher] First theme:"
echo.
pause
