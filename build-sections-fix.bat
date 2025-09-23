@echo off
echo ====================================
echo Building Media Kit Builder - Section Layout Fix
echo ====================================

echo.
echo Installing dependencies...
call npm install

echo.
echo Building project...
call npm run build

echo.
echo ====================================
echo Build Complete!
echo ====================================
echo.
echo Next steps:
echo 1. Test adding sections using the layout buttons
echo 2. Drag components from library to sections
echo 3. Test multi-column layouts
echo 4. Verify save/load functionality
echo.
pause
