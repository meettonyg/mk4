@echo off
echo ====================================
echo Force Clean Rebuild - Component Controls Fix
echo ====================================
echo.

cd /d C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

echo Step 1: Cleaning dist folder...
if exist dist (
    rmdir /s /q dist
    mkdir dist
) else (
    mkdir dist
)

echo.
echo Step 2: Clearing Vite cache...
if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite
)

echo.
echo Step 3: Building fresh Vue bundle...
call npm run build

echo.
echo ====================================
if %errorlevel% == 0 (
    echo Build Successful!
    echo.
    echo Component Controls Fix Applied:
    echo ----------------------------------------
    echo 1. ComponentWrapper.vue: Changed v-if to v-show
    echo 2. ComponentWrapper.vue: Combined visibility logic
    echo 3. ComponentControls.vue: Removed v-show from root
    echo 4. ComponentControls.vue: Removed isVisible prop
    echo ----------------------------------------
    echo.
    echo IMPORTANT: 
    echo 1. Clear browser cache (Ctrl+Shift+Delete)
    echo 2. Hard refresh (Ctrl+Shift+R)
    echo 3. Component controls should now appear on hover!
) else (
    echo Build Failed - Check errors above
)
echo ====================================
echo.
pause
