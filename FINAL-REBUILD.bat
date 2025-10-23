@echo off
echo ========================================
echo  FINAL ROOT FIX - REBUILD
echo ========================================
echo.
echo Solution: Removed scoped attribute from SectionLayout.vue
echo This eliminates ALL specificity issues cleanly
echo.

cd /d "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

echo [1/3] Cleaning build...
if exist dist rmdir /s /q dist

echo.
echo [2/3] Building...
call npm run build

echo.
echo [3/3] Done!
echo.
echo ========================================
echo  TEST NOW
echo ========================================
echo 1. Clear browser cache (Ctrl+Shift+R)
echo 2. Click Mobile button
echo 3. Run in console:
echo    getComputedStyle(document.querySelector('.layout-two-column')).gridTemplateColumns
echo.
echo Should show "1fr" for mobile mode
echo.
pause
