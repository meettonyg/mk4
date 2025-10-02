@echo off
REM Production Build and ZIP Creation Script
REM This script builds the Vue app and creates a production-ready ZIP file

echo ========================================
echo   Guestify Media Kit Builder
echo   Production Build Script
echo ========================================
echo.

REM Step 1: Build the Vue app
echo [1/4] Building Vue application...
call npm run build
if %errorlevel% neq 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo ✓ Build complete
echo.

REM Step 2: Check if dist exists
if not exist "dist\gmkb.iife.js" (
    echo ERROR: dist/gmkb.iife.js not found after build!
    pause
    exit /b 1
)
echo [2/4] Build verification passed
echo.

REM Step 3: Create production ZIP
echo [3/4] Creating production ZIP...

REM Use PowerShell to create ZIP (Windows 10+)
powershell -Command "& {Compress-Archive -Path 'guestify-media-kit-builder.php', 'dist', 'includes', 'components', 'system', 'assets', 'templates' -DestinationPath 'mk4-production.zip' -Force}"

if %errorlevel% neq 0 (
    echo ERROR: ZIP creation failed!
    pause
    exit /b 1
)
echo ✓ ZIP created: mk4-production.zip
echo.

REM Step 4: Show file size
echo [4/4] Deployment package ready:
for %%I in (mk4-production.zip) do echo    Size: %%~zI bytes
echo.

echo ========================================
echo   BUILD COMPLETE!
echo ========================================
echo.
echo Next steps:
echo   1. Upload mk4-production.zip to WordPress
echo   2. Or extract and upload via FTP
echo   3. See DEPLOYMENT-CHECKLIST.md for details
echo.
pause
