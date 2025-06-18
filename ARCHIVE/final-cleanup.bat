@echo off
echo ========================================
echo FINAL CLEANUP - Guestify Media Kit Fix
echo ========================================
echo.

echo Removing old debug and test files...
del /Q debug-*.js 2>nul
del /Q test-*.js 2>nul
del /Q fix-*.js 2>nul
del /Q emergency-*.js 2>nul
del /Q force-*.js 2>nul
del /Q quick-fix-*.js 2>nul
del /Q migrate-*.js 2>nul
del /Q comprehensive-fix.js 2>nul
del /Q diagnostics.js 2>nul

echo.
echo Keeping essential test files:
echo - final-test-suite.js (comprehensive testing)
echo - IMPLEMENTATION_COMPLETE.md (documentation)
echo.

echo ========================================
echo NEXT STEPS:
echo ========================================
echo 1. Clear your browser cache COMPLETELY
echo 2. Reload the Media Kit Builder page
echo 3. Run final-test-suite.js in console
echo 4. Verify all tests pass
echo.
echo If everything works, you can delete:
echo - All .md files except IMPLEMENTATION_COMPLETE.md
echo - All .bat/.sh files
echo - final-test-suite.js (after testing)
echo.
pause
