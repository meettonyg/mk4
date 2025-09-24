@echo off
echo Rebuilding Media Kit Builder to fix runtime errors...

echo.
echo Cleaning up...
if exist dist rd /s /q dist

echo.
echo Building application...
call npm run build

if %errorlevel% neq 0 (
    echo Build failed!
    pause
    exit /b 1
)

echo.
echo ========================================
echo BUILD COMPLETE! Fixes applied:
echo - Fixed Pinia store getComponentsInOrder getter
echo - Fixed DOM manipulation null parent issue
echo - Improved error handling
echo ========================================
echo.
echo Please test the application now.
pause
