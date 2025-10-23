@echo off
echo ========================================
echo  FORCE COMPLETE REBUILD
echo ========================================
echo.
echo The fix IS in DevicePreview.vue
echo But the build isn't updating dist files
echo.

cd /d "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

echo [1] Current time:
echo %date% %time%
echo.

echo [2] DELETE everything that could be cached:
if exist dist (
    attrib -r -h -s dist\*.* /s /d
    rmdir /s /q dist
    echo    ✓ Deleted dist folder
)

if exist node_modules\.vite (
    rmdir /s /q node_modules\.vite  
    echo    ✓ Deleted Vite cache
)

if exist .parcel-cache (
    rmdir /s /q .parcel-cache
    echo    ✓ Deleted Parcel cache
)
echo.

echo [3] Touch source file to force rebuild:
echo // Force rebuild %date% %time% >> src\vue\components\DevicePreview.vue
echo    ✓ Updated DevicePreview.vue timestamp
echo.

echo [4] Run build with Vite directly:
echo ========================================
call npx vite build --force
echo ========================================
echo.

echo [5] Check if files were created:
if exist dist\gmkb.iife.js (
    echo    ✅ BUILD CREATED FILES!
    echo.
    for %%F in (dist\gmkb.iife.js) do (
        echo    File: %%F
        echo    Size: %%~zF bytes
        echo    Date: %%~tF
    )
    echo.
    
    echo [6] Verify fix is in build:
    findstr /C:"overrideLayoutStyles" dist\gmkb.iife.js >nul 2>&1
    if %errorlevel%==0 (
        echo    ✅ FIX CONFIRMED IN BUILD!
        findstr /C:"overrideLayoutStyles" dist\gmkb.iife.js | find /c /v ""
        echo    occurrences of overrideLayoutStyles found
    ) else (
        echo    ❌ Fix not found in build
        echo    This means Vite isn't compiling the Vue files correctly
    )
) else (
    echo    ❌ BUILD FAILED - No files created
    echo.
    echo    Try these steps manually:
    echo    1. Open terminal in project folder
    echo    2. Run: npm install
    echo    3. Run: npx vite build
    echo    4. Check for error messages
)

echo.
echo [7] Remove the timestamp comment we added:
powershell -Command "(Get-Content 'src\vue\components\DevicePreview.vue') | Where-Object { $_ -notmatch '// Force rebuild' } | Set-Content 'src\vue\components\DevicePreview.vue'"
echo    ✓ Cleaned source file
echo.

pause
