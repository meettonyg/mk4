@echo off
echo =================================
echo Building Vue Media Kit Builder...
echo =================================

REM Clean previous build
if exist dist\gmkb.js del dist\gmkb.js

REM Run the build
call npm run build

REM Check if build was successful
if exist dist\gmkb.js (
    echo.
    echo Build successful!
    echo File created: dist\gmkb.js
    dir dist\gmkb.js
) else (
    echo.
    echo Build failed - dist\gmkb.js not found
    exit /b 1
)

echo.
echo =================================
echo Build complete!
echo =================================
