@echo off
echo ====================================
echo Installing Vue Draggable for Vue 3
echo ====================================

echo.
echo Installing vue-draggable-next...
call npm install vue-draggable-next --save

echo.
echo Building project...
call npm run build

echo.
echo ====================================
echo Build Complete!
echo ====================================
echo.
echo The Vue-based drag and drop should now work properly
echo.
pause
