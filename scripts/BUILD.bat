@echo off
REM Quick Build - Double-click to build
REM No parameters needed - just run it!

title Media Kit Builder - Quick Build

echo.
echo ========================================
echo  Media Kit Builder - Quick Build
echo ========================================
echo.

cd /d "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

echo Current Directory: %CD%
echo.

REM Check if node_modules exists
if not exist "node_modules\" (
    echo Installing dependencies...
    echo.
    call npm install
    echo.
)

echo Building Vue application...
echo.

call npm run build

if errorlevel 1 (
    echo.
    echo ========================================
    echo  BUILD FAILED!
    echo ========================================
    echo.
    pause
    exit /b 1
)

echo.
echo ========================================
echo  BUILD SUCCESSFUL!
echo ========================================
echo.

REM Show dist folder contents
if exist "dist\" (
    echo Build Output:
    dir /b dist\
    echo.
)

echo Next Steps:
echo 1. Clear WordPress cache
echo 2. Clear browser cache (Ctrl+Shift+Delete)
echo 3. Reload the Media Kit Builder page
echo.

pause
