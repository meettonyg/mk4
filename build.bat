@echo off
echo ====================================
echo Building Media Kit Builder
echo ====================================

echo.
echo Building with Vite...
call npm run build

echo.
echo ====================================
if %errorlevel% == 0 (
    echo Build Successful!
    echo.
    echo Section layouts should now be working:
    echo - Drop zones visible with dashed borders
    echo - Columns properly displayed
    echo - Drag and drop functionality enabled
) else (
    echo Build Failed - Check errors above
)
echo ====================================
echo.
pause
