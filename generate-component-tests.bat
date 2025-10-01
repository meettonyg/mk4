@echo off
echo.
echo =========================================
echo   Generating Component Test Files
echo =========================================
echo.

echo Running test generator...
node scripts\generate-component-tests.js

if errorlevel 1 (
    echo.
    echo ERROR: Test generation failed
    pause
    exit /b 1
)

echo.
echo =========================================
echo   Generation Complete!
echo =========================================
echo.
echo Next steps:
echo   1. Review generated files in tests/unit/components/
echo   2. Add component-specific test data
echo   3. Run: npm run test:watch
echo.
echo To run tests now, type: npm test
echo.
pause
