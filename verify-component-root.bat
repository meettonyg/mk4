@echo off
REM Verification Script for CSS Architecture Fix
REM Checks that all PHP templates have the component-root wrapper

echo =========================================
echo CSS ARCHITECTURE VERIFICATION
echo =========================================
echo.

REM Check each component
echo Checking components:
echo.

for /d %%d in (components\*) do (
    if exist "%%d\template.php" (
        findstr /C:"component-root" "%%d\template.php" >nul
        if errorlevel 1 (
            echo [X] %%~nd - MISSING component-root
        ) else (
            echo [OK] %%~nd
        )
    )
)

echo.
echo =========================================
echo.
echo If all components show [OK], you're ready for production!
echo.
echo Next steps:
echo 1. Run: npm run build
echo 2. Test in builder
echo 3. Test on frontend
echo 4. Deploy
echo.
pause
