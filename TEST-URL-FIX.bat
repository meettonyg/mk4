@echo off
REM ===================================================================
REM URL DETECTION FIX - QUICK TEST
REM ===================================================================
REM Run this to verify the regex fix works correctly
REM ===================================================================

echo.
echo ======================================
echo URL DETECTION REGEX FIX TEST
echo ======================================
echo.
echo Testing the fixed regex patterns...
echo.

cd /d "%~dp0"
php test-url-detection.php

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ======================================
    echo ✅ TEST SCRIPT EXECUTED SUCCESSFULLY
    echo ======================================
    echo.
) else (
    echo.
    echo ======================================
    echo ❌ TEST SCRIPT FAILED TO RUN
    echo ======================================
    echo.
    echo Make sure PHP is installed and in your PATH.
    echo Try running: php --version
    echo.
)

echo.
echo NEXT STEPS:
echo -----------
echo 1. Review test results above
echo 2. Clear WordPress cache
echo 3. Visit /media-kit/?mkcg_id=32372
echo 4. Check WordPress debug.log for "✅ GMKB: Detected BUILDER page"
echo.

pause
