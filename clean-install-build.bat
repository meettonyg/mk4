@echo off
echo ====================================
echo Fixing Dependencies and Building
echo ====================================

echo.
echo Cleaning node_modules and package-lock...
if exist node_modules rmdir /s /q node_modules
if exist package-lock.json del package-lock.json

echo.
echo Installing dependencies with correct versions...
call npm install

echo.
echo Building project...
call npm run build

echo.
echo ====================================
if %errorlevel% == 0 (
    echo Build Successful!
    echo.
    echo The Media Kit Builder is ready with:
    echo - Section layouts working
    echo - Native drag and drop support
    echo - No external drag library dependencies
) else (
    echo Build Failed - Check errors above
)
echo ====================================
echo.
pause
