@echo off
echo ========================================
echo REBUILDING WITH RESET BUTTON FIX
echo ========================================
echo.
echo REAL ROOT CAUSE FOUND AND FIXED:
echo.
echo The reset button was missing because component editors
echo use ComponentEditorTemplate.vue, NOT ComponentEditPanel.vue
echo.
echo FIXED FILE:
echo   src/vue/components/sidebar/editors/ComponentEditorTemplate.vue
echo   - Added ComponentResetButton to header
echo   - Imported ComponentResetButton component
echo   - Adjusted CSS for proper layout
echo.
echo This template is used by ALL component editors:
echo   - BiographyEditor.vue
echo   - HeroEditor.vue
echo   - ContactEditor.vue
echo   ... and all other component-specific editors
echo.
echo ========================================
echo.

REM Clean old build
echo Cleaning old build files...
if exist dist\gmkb.iife.js del dist\gmkb.iife.js
if exist dist\gmkb.css del dist\gmkb.css

REM Build with production mode
echo Building production bundle...
call npm run build

REM Check if build was successful
if %errorlevel% neq 0 (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo Please check for errors above.
    pause
    exit /b %errorlevel%
)

echo.
echo ========================================
echo BUILD SUCCESSFUL!
echo ========================================
echo.
echo Reset button is now added to component editors!
echo.
echo NEXT STEPS:
echo 1. Clear browser cache (Ctrl+Shift+R or Cmd+Shift+R)
echo 2. Reload the Media Kit Builder page
echo 3. Edit any component
echo 4. Look for the rotate icon between the title and X button
echo.
echo The reset button will appear in the header like this:
echo   [Edit Biography]  [Reset Icon]  [X]
echo.
echo File generated: dist\gmkb.iife.js
echo ========================================
pause
