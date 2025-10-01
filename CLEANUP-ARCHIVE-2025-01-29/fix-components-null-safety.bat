@echo off
echo.
echo =========================================
echo   Fixing Null-Safety Issues
echo =========================================
echo.

echo This will add optional chaining (?.) to component data access
echo to prevent null/undefined errors in tests.
echo.
pause

echo.
echo Running fix script...
node scripts\fix-null-safety-comprehensive.js

if errorlevel 1 (
    echo.
    echo ERROR: Fix script failed
    pause
    exit /b 1
)

echo.
echo =========================================
echo   Fixes Complete!
echo =========================================
echo.
echo Now run tests: npm test
echo.
pause
