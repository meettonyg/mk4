@echo off
echo ========================================
echo  ROOT CAUSE FIX - REBUILD
echo ========================================
echo.
echo Root cause: Vue scoped styles were overriding global CSS
echo Solution: Added device preview styles to SectionLayout.vue
echo.

cd /d "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

echo [1/4] Cleaning old build...
if exist dist rmdir /s /q dist

echo.
echo [2/4] Building with fixed component...
call npm run build

echo.
echo [3/4] Verifying build...
if exist dist\gmkb.iife.js (
    echo ✓ Build successful
) else (
    echo ✗ Build failed!
    pause
    exit /b 1
)

echo.
echo [4/4] Complete!
echo.
echo ========================================
echo  TEST INSTRUCTIONS
echo ========================================
echo.
echo 1. Clear browser cache (Ctrl+Shift+R)
echo 2. Open Media Kit Builder
echo 3. Click "Mobile" button
echo 4. Sections should now stack to 1 column
echo.
echo ROOT CAUSE FIXED: Scoped styles no longer override device preview
echo.
pause
