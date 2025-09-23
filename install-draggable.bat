@echo off
echo ====================================
echo Installing vuedraggable for Vue 3
echo ====================================

echo.
echo Installing vuedraggable...
call npm install vuedraggable@next --save

echo.
echo Building project...
call npm run build

echo.
echo ====================================
echo Build Complete!
echo ====================================
echo.
pause
