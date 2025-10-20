@echo off
echo ========================================
echo THEME PERSISTENCE FIX - BUILD SCRIPT
echo ========================================
echo.
echo This script rebuilds the Vue bundle with the theme persistence fix.
echo.
echo ROOT CAUSE IDENTIFIED:
echo - ThemeSwitcher and ThemesPanel were updating themeStore only
echo - They were NOT updating mediaKitStore
echo - Result: Theme changes applied visually but not saved
echo.
echo FIX APPLIED:
echo - Both components now update mediaKitStore immediately
echo - Theme changes are now tracked and will be saved
echo.
echo ========================================
echo.

echo Building Vue bundle...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo TESTING INSTRUCTIONS:
    echo 1. Refresh your browser (Ctrl+F5 for hard refresh)
    echo 2. Select a theme from the dropdown OR customizer
    echo 3. Click "Save" in the toolbar
    echo 4. Refresh the page
    echo 5. Theme should persist!
    echo.
    echo The fix ensures mediaKitStore is updated immediately
    echo when you select a theme, so it will be saved when you
    echo click the Save button.
    echo.
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo Make sure you're in the correct directory:
    echo %CD%
    echo.
)

pause
