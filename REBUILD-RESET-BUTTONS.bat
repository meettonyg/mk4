@echo off
echo ================================
echo REBUILDING WITH RESET BUTTONS
echo ================================
echo.
echo ROOT CAUSE FOUND: Reset button components exist in source code but
echo were not included in the compiled bundle (dist/gmkb.iife.js)
echo.
echo The following reset components will be included:
echo - ComponentResetButton.vue (component-level reset)
echo - SectionResetButton.vue (section-level reset)  
echo - GlobalResetModal.vue (global reset modal)
echo.
echo These are registered in main.js as global components.
echo ================================
echo.

REM Clean old build
echo Cleaning old build...
if exist dist\gmkb.iife.js del dist\gmkb.iife.js
if exist dist\gmkb.css del dist\gmkb.css

REM Build with production mode
echo Building production bundle with reset buttons...
call npm run build

REM Check if build was successful
if %errorlevel% neq 0 (
    echo.
    echo ================================
    echo BUILD FAILED!
    echo ================================
    echo Please check for errors above.
    pause
    exit /b %errorlevel%
)

echo.
echo ================================
echo BUILD SUCCESSFUL!
echo ================================
echo.
echo Reset button components are now included in the bundle.
echo.
echo NEXT STEPS:
echo 1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
echo 2. Reload the Media Kit Builder page
echo 3. You should now see:
echo    - Rotate icon in component edit panels (top-right)
echo    - Reset buttons in section headers
echo    - Red "Reset All" button in main toolbar
echo.
echo File generated: dist\gmkb.iife.js
echo ================================
pause
