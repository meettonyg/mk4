@echo off
echo Cleaning up old debug files...

REM Remove old debug scripts that might interfere
del /Q debug-*.js 2>nul
del /Q test-*.js 2>nul
del /Q fix-*.js 2>nul
del /Q emergency-*.js 2>nul
del /Q force-*.js 2>nul
del /Q quick-fix-*.js 2>nul

REM Keep the latest test script
echo Keeping test-renderer-fix.js for verification...

echo.
echo Cleanup complete! 
echo.
echo Next steps:
echo 1. Clear your browser cache
echo 2. Reload the Media Kit Builder page
echo 3. Check if components load and buttons work
echo 4. Run test-renderer-fix.js in console to verify
echo.
pause
