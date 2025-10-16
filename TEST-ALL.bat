@echo off
echo.
echo ========================================
echo   COMPONENT ARCHITECTURE TEST SUITE
echo ========================================
echo.

echo [1/3] Running file validation...
call npm run test:architecture
if %errorlevel% neq 0 (
    echo.
    echo ERROR: File validation failed!
    echo Please fix the issues above before building.
    pause
    exit /b 1
)

echo.
echo [2/3] Building project...
call npm run build
if %errorlevel% neq 0 (
    echo.
    echo ERROR: Build failed!
    pause
    exit /b 1
)

echo.
echo [3/3] Generating audit report...
call npm run test:audit

echo.
echo ========================================
echo   ALL TESTS COMPLETE!
echo ========================================
echo.
echo Next steps:
echo   1. Open your browser console
echo   2. Load scripts/test-components-console.js
echo   3. Run: testComponentArchitecture()
echo.
echo Or check COMPONENT-AUDIT-REPORT.md for details
echo.
pause
