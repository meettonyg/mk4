@echo off
echo ========================================
echo Rebuilding Media Kit Builder Bundle
echo ========================================
echo.

echo Cleaning dist folder...
rmdir /s /q dist 2>nul

echo Building with Vite...
call npm run build

echo.
echo ========================================
echo Build Complete!
echo ========================================
echo.
echo Bundle location: dist/gmkb.iife.js
echo.
pause
