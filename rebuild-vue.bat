@echo off
echo Rebuilding Vue Media Kit Builder...
echo.
echo Cleaning old build...
if exist dist\gmkb.iife.js del dist\gmkb.iife.js

echo.
echo Building with Vite...
call npm run build

echo.
echo Build complete!
echo.
pause
