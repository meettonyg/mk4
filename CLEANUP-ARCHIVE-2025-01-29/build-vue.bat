@echo off
echo ========================================
echo Building Vue Bundle for Media Kit Builder
echo ========================================
echo.

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    call npm install
    if errorlevel 1 (
        echo Error installing dependencies!
        pause
        exit /b 1
    )
)

echo.
echo Building production bundle...
call npm run build

if errorlevel 1 (
    echo.
    echo ❌ Build failed!
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo.
echo Files generated:
if exist "dist\gmkb.iife.js" (
    echo   ✓ dist\gmkb.iife.js
    for %%A in ("dist\gmkb.iife.js") do echo     Size: %%~zA bytes
)
if exist "dist\style.css" (
    echo   ✓ dist\style.css
    for %%A in ("dist\style.css") do echo     Size: %%~zA bytes
)

echo.
echo Next steps:
echo 1. Upload dist\gmkb.iife.js and dist\style.css to server
echo 2. Test the Media Kit Builder
echo 3. Run verify-vue-mode.js in browser console

echo.
pause