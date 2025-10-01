@echo off
REM Phase 4: Generate Component Tests
REM 
REM This script generates test files for all Vue components

echo.
echo ========================================
echo   Phase 4: Generate Component Tests
echo ========================================
echo.

echo Checking Node.js...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    pause
    exit /b 1
)

echo.
echo Installing test dependencies (if needed)...
call npm install

echo.
echo Generating test files...
node scripts/generate-component-tests.js

echo.
echo ========================================
echo   Test Generation Complete!
echo ========================================
echo.
echo Next steps:
echo   1. Review generated test files in tests/unit/components/
echo   2. Add component-specific test data
echo   3. Run tests: npm test
echo   4. Check coverage: npm run test:coverage
echo.

pause
