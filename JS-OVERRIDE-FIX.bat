@echo off
echo ========================================
echo  JAVASCRIPT OVERRIDE FIX - REBUILD
echo ========================================
echo.
echo Root cause: JavaScript (likely draggable) is clearing inline styles
echo Solution: DevicePreview.vue now forcefully maintains responsive styles
echo.

cd /d "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

echo [1/3] Cleaning...
if exist dist rmdir /s /q dist

echo.
echo [2/3] Building with JS fix...
call npm run build

echo.
echo [3/3] Complete!
echo.
echo ========================================
echo  HOW IT WORKS
echo ========================================
echo.
echo When you click Mobile:
echo 1. DevicePreview sets inline styles (1fr)
echo 2. If draggable tries to clear them...
echo 3. MutationObserver re-applies our styles!
echo 4. Result: Mobile layout stays active
echo.
echo ========================================
echo  TEST INSTRUCTIONS
echo ========================================
echo 1. Clear browser cache (Ctrl+Shift+R)
echo 2. Click "Mobile" button
echo 3. Sections should stack to 1 column
echo 4. Try dragging - layout should stay mobile
echo.
pause
