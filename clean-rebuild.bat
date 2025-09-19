@echo off
echo Cleaning and rebuilding...
echo.
echo Removing old dist files...
del /Q dist\*.*
echo.
echo Rebuilding bundle...
npm run build
echo.
echo Build complete! Clear your browser cache (Ctrl+F5) to see the changes.
pause
