@echo off
echo ====================================
echo Installing Vue Draggable and Building
echo ====================================

echo.
echo Installing vue-draggable-next with legacy peer deps...
call npm install vue-draggable-next --legacy-peer-deps

echo.
echo Building project...
call npm run build

echo.
echo ====================================
echo Build Complete!
echo ====================================
echo.
pause
