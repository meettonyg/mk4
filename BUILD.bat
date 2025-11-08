@echo off
REM Build script for Guestify Media Kit Builder
REM Run this from the mk4 directory

echo Building Guestify Media Kit Builder...
echo.

REM Change to the correct directory
cd /d "%~dp0"

REM Run the build
call npm run build

echo.
echo Build complete!
echo.
pause
