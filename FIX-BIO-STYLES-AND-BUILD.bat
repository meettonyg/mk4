@echo off
echo ========================================
echo ROOT CAUSE FIX: Biography Styles Issue
echo ========================================
echo.
echo ISSUE FOUND: Biography component had duplicate data-component-id
echo   - ComponentWrapper sets: data-component-id="X"
echo   - Biography also set: data-component-id="X" on component-root
echo   - This caused CSS selector mismatch
echo.
echo CSS selector was: [data-component-id="X"] .component-root
echo But Biography had: <div data-component-id="X" class="component-root">
echo.
echo FIX: Removed data-component-id from Biography.vue template
echo   - Now wrapper has data-component-id
echo   - component-root is a child (correct structure)
echo   - CSS selector will match correctly
echo.
echo ========================================
echo Building Vue bundle...
echo ========================================
echo.

cd /d "%~dp0"

npm run build

echo.
echo ========================================
echo Build complete!
echo ========================================
echo.
echo NEXT STEPS:
echo 1. Reload your WordPress admin page
echo 2. Clear browser cache if styles don't update
echo 3. Check biography component in builder
echo 4. Background color should now apply correctly
echo.
pause
