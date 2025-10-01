@echo off
echo Forcing complete rebuild...
echo.

echo [1/3] Deleting dist folder...
if exist dist rmdir /S /Q dist
echo Done

echo.
echo [2/3] Running build...
npm run build

echo.
echo [3/3] Checking result...
if exist dist\gmkb.iife.js (
    echo SUCCESS - New bundle created
    dir dist\gmkb.iife.js
) else (
    echo ERROR - Bundle not created
)

echo.
pause
