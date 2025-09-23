@echo off
echo ====================================
echo Installing Dependencies and Building
echo ====================================

echo.
echo Installing vue-draggable-next...
call npm install vue-draggable-next --legacy-peer-deps

echo.
echo Verifying installation...
if exist node_modules\vue-draggable-next (
    echo vue-draggable-next installed successfully
) else (
    echo Failed to install vue-draggable-next
    echo Trying alternative approach...
    call npm install vuedraggable@next --legacy-peer-deps
)

echo.
echo Building project...
call npm run build

echo.
echo ====================================
if %errorlevel% == 0 (
    echo Build Successful!
) else (
    echo Build Failed - Check errors above
)
echo ====================================
echo.
pause
