@echo off
echo ============================================
echo THEME ID FIX - FINAL REBUILD
echo ============================================
echo.
echo Fixed: Theme IDs now properly extracted from array keys
echo.
pause

echo Building...
npm run build

echo.
echo ============================================
echo READY TO TEST
echo ============================================
echo.
echo After hard refresh (Ctrl+Shift+R):
echo 1. Click theme button
echo 2. Console should show theme with proper ID:
echo    [ThemeSwitcher] First theme: {id: "creative_bold", ...}
echo 3. Click a theme - it should work!
echo 4. Theme should persist after save/refresh
echo.
pause
