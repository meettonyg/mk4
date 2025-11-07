@echo off
echo ============================================
echo Building Media Kit Builder with XSS Fix
echo ============================================
echo.

cd /d "%~dp0"

echo Running npm run build...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ============================================
    echo BUILD SUCCESSFUL!
    echo ============================================
    echo.
    echo The XSS configuration fixes have been applied.
    echo Please refresh your browser to test the changes.
    echo.
) else (
    echo.
    echo ============================================
    echo BUILD FAILED!
    echo ============================================
    echo.
    echo Check the error messages above.
    echo.
)

pause
