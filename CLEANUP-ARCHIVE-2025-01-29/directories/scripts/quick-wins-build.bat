@echo off
echo ========================================
echo  Quick Wins - Build Verification
echo ========================================
echo.

cd /d "%~dp0.."

echo [1/4] Checking Node.js and npm...
node --version
npm --version
echo.

echo [2/4] Installing dependencies (if needed)...
if not exist "node_modules\" (
    echo Installing node modules...
    npm install
) else (
    echo Node modules already installed ✓
)
echo.

echo [3/4] Running build...
npm run build
echo.

echo [4/4] Verifying build output...
if exist "dist\gmkb.iife.js" (
    echo ✅ Build successful - gmkb.iife.js created
    for %%A in ("dist\gmkb.iife.js") do (
        echo    File size: %%~zA bytes
    )
) else (
    echo ❌ Build failed - gmkb.iife.js not found
    exit /b 1
)

if exist "dist\gmkb.css" (
    echo ✅ CSS file created
    for %%A in ("dist\gmkb.css") do (
        echo    File size: %%~zA bytes
    )
) else (
    echo ⚠️  CSS file not found (may be optional)
)
echo.

echo ========================================
echo  Build Verification Complete!
echo ========================================
echo.
echo Next: Review the generated reports in /docs
echo.
pause
