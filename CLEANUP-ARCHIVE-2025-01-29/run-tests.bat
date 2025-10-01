@echo off
REM Phase 4: Run Component Tests
REM 
REM This script runs all component tests with various options

echo.
echo ========================================
echo   Phase 4: Component Test Runner
echo ========================================
echo.

:menu
echo Choose an option:
echo.
echo   1. Run all tests (once)
echo   2. Run tests in watch mode
echo   3. Run tests with coverage report
echo   4. Open test UI in browser
echo   5. Generate missing test files
echo   6. Exit
echo.

set /p choice="Enter your choice (1-6): "

if "%choice%"=="1" goto run_tests
if "%choice%"=="2" goto watch_tests
if "%choice%"=="3" goto coverage_tests
if "%choice%"=="4" goto ui_tests
if "%choice%"=="5" goto generate_tests
if "%choice%"=="6" goto end

echo Invalid choice. Please try again.
echo.
goto menu

:run_tests
echo.
echo Running all tests...
call npm test
goto menu

:watch_tests
echo.
echo Starting test watch mode (press Ctrl+C to stop)...
call npm run test:watch
goto menu

:coverage_tests
echo.
echo Running tests with coverage report...
call npm run test:coverage
echo.
echo Coverage report generated in coverage/index.html
echo Opening coverage report...
start coverage\index.html
goto menu

:ui_tests
echo.
echo Opening test UI in browser...
call npm run test:ui
goto menu

:generate_tests
echo.
echo Generating missing test files...
node scripts/generate-component-tests.js
goto menu

:end
echo.
echo Exiting...
