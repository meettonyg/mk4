@echo off
echo ============================================
echo FORCE REBUILD - Media Kit Builder
echo ============================================
echo.

echo [1/4] Cleaning dist directory...
if exist dist\*.* del /Q dist\*.*
if exist dist rmdir /S /Q dist
echo      Dist directory cleaned
echo.

echo [2/4] Clearing npm cache...
npm cache clean --force
echo      Cache cleared
echo.

echo [3/4] Building Vue bundle (this may take a minute)...
npm run build
echo      Build complete
echo.

echo [4/4] Verifying build output...
if exist dist\gmkb.iife.js (
    echo      ✅ gmkb.iife.js created successfully
    for %%A in (dist\gmkb.iife.js) do echo      File size: %%~zA bytes
) else (
    echo      ❌ Build failed - gmkb.iife.js not found
    pause
    exit /b 1
)

if exist dist\style.css (
    echo      ✅ style.css created successfully
    for %%A in (dist\style.css) do echo      File size: %%~zA bytes
) else (
    echo      ⚠️  Warning - style.css not found
)

echo.
echo ============================================
echo BUILD COMPLETE!
echo ============================================
echo.
echo Next steps:
echo 1. Hard refresh your browser (Ctrl+Shift+R)
echo 2. Check console for: [Theme Store] messages
echo 3. Verify no more 403 errors in console
echo.
pause
