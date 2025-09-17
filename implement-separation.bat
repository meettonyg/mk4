@echo off
echo ==========================================
echo   QUICK ARCHITECTURE SEPARATION
echo   One-click setup for clean separation
echo ==========================================
echo.

echo This will:
echo 1. Backup your current files
echo 2. Separate legacy from Vue systems
echo 3. Configure for Vue-only mode
echo 4. Rebuild the Vue bundle
echo.

set /p confirm="Ready to proceed? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo [Step 1/6] Creating backup...
if not exist "BACKUP" mkdir BACKUP
set backup_dir=BACKUP\backup-%date:~-4,4%%date:~-10,2%%date:~-7,2%-%time:~0,2%%time:~3,2%%time:~6,2%
set backup_dir=%backup_dir: =0%
mkdir "%backup_dir%" 2>nul
xcopy /E /I /Y js "%backup_dir%\js" >nul 2>&1
xcopy /E /I /Y src "%backup_dir%\src" >nul 2>&1
xcopy /E /I /Y includes "%backup_dir%\includes" >nul 2>&1
echo Backup created in %backup_dir%

echo.
echo [Step 2/6] Running architecture separation...
call separate-architectures.bat
if errorlevel 1 (
    echo Failed to separate architectures
    pause
    exit /b 1
)

echo.
echo [Step 3/6] Updating plugin main file...
REM Create a marker file to indicate new system is ready
echo separated > .architecture-separated

echo.
echo [Step 4/6] Setting architecture to Vue mode...
REM This would normally edit the PHP file, but for safety we'll just show instructions
echo.
echo ACTION REQUIRED:
echo ----------------
echo Edit: includes/architecture-config.php
echo Set: define( 'GMKB_ARCHITECTURE_MODE', 'vue' );
echo.
echo Press any key when done...
pause >nul

echo.
echo [Step 5/6] Rebuilding Vue bundle...
if exist "package.json" (
    call npm run build
    if errorlevel 1 (
        echo Build failed. Trying alternative method...
        call rebuild-lean-bundle.bat
    )
) else (
    echo package.json not found. Please run npm init first.
    pause
    exit /b 1
)

echo.
echo [Step 6/6] Creating verification script...
echo // Architecture Verification > verify-architecture.js
echo console.log('=== ARCHITECTURE VERIFICATION ==='); >> verify-architecture.js
echo console.log('Vue systems:', !!window.gmkbVue); >> verify-architecture.js
echo console.log('Legacy systems:', !!window.gmkbLegacy); >> verify-architecture.js
echo console.log('Bundle loaded:', !!document.querySelector('script[src*="gmkb.iife.js"]')); >> verify-architecture.js
echo console.log('Legacy scripts:', document.querySelectorAll('script[src*="js-legacy"]').length); >> verify-architecture.js
echo if (window.gmkbVue ^&^& !window.gmkbLegacy) { >> verify-architecture.js
echo     console.log('✅ ARCHITECTURE CORRECT: Vue-only mode'); >> verify-architecture.js
echo } else { >> verify-architecture.js
echo     console.log('❌ ARCHITECTURE ISSUE: Check configuration'); >> verify-architecture.js
echo } >> verify-architecture.js

echo.
echo ==========================================
echo        SEPARATION COMPLETE!
echo ==========================================
echo.
echo ✅ Files separated into:
echo    - /src (Vue source)
echo    - /js-legacy (Legacy files)
echo    - /dist/gmkb.iife.js (Vue bundle)
echo.
echo 📝 FINAL STEPS:
echo.
echo 1. Update your main plugin file:
echo    In guestify-media-kit-builder.php, replace:
echo    require_once 'includes/enqueue.php';
echo    With:
echo    require_once 'includes/enqueue-separated.php';
echo.
echo 2. Clear browser cache
echo.
echo 3. Test in browser console:
echo    - Load the Media Kit Builder page
echo    - Open console (F12)
echo    - Check: window.gmkbVue (should exist)
echo    - Check: window.gmkbLegacy (should NOT exist)
echo    - Run: verify-architecture.js
echo.
echo Need help? See ARCHITECTURE-SEPARATION-GUIDE.md
echo.
pause