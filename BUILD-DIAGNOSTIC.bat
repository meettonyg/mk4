@echo off
echo ========================================
echo  BUILD DIAGNOSTIC
echo ========================================
echo.

cd /d "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

echo [1] Current directory:
cd
echo.

echo [2] Checking Node/NPM:
node --version
npm --version
echo.

echo [3] Checking package.json exists:
if exist package.json (
    echo    ✓ package.json found
) else (
    echo    ✗ package.json NOT FOUND!
)
echo.

echo [4] Checking node_modules:
if exist node_modules (
    echo    ✓ node_modules exists
    dir node_modules | find "File(s)" | find /v "0 File(s)"
) else (
    echo    ✗ node_modules NOT FOUND!
    echo    Running: npm install
    call npm install
)
echo.

echo [5] Checking vite:
if exist node_modules\vite (
    echo    ✓ Vite installed
) else (
    echo    ✗ Vite NOT installed!
)
echo.

echo [6] Checking build script in package.json:
type package.json | findstr /C:"build"
echo.

echo [7] Deleting old dist:
if exist dist (
    rmdir /s /q dist
    echo    Deleted old dist
) else (
    echo    No dist to delete
)
echo.

echo [8] Running build with verbose output:
echo.
echo ========================================
call npm run build --verbose
echo ========================================
echo.

echo [9] Checking if dist was created:
if exist dist\gmkb.iife.js (
    echo    ✓ Build created gmkb.iife.js
    echo    Size:
    for %%A in (dist\gmkb.iife.js) do echo    %%~zA bytes
    echo    Modified:
    for %%A in (dist\gmkb.iife.js) do echo    %%~tA
) else (
    echo    ✗ BUILD FAILED - No gmkb.iife.js created!
)
echo.

echo [10] Checking for build errors in npm log:
if exist npm-debug.log (
    echo    Found npm-debug.log - showing last 20 lines:
    type npm-debug.log | more +L-20
)
echo.

pause
