@echo off
REM Cleanup script for temporary debug files
REM Run from the mk4 directory

echo Cleaning up temporary debug files...

REM JavaScript debug files
del /f debug-empty-state.js 2>nul
del /f debug-empty-state-styles.js 2>nul
del /f empty-state-fix.js 2>nul
del /f quick-fix-empty-state-styles.js 2>nul
del /f empty-state-centering-patch.js 2>nul
del /f test-empty-state-centering.js 2>nul
del /f emergency-css-fix.js 2>nul
del /f force-inline-centering.js 2>nul

REM CSS debug files (optional - uncomment if you want to remove)
REM del /f css\modules\empty-state-fix.css 2>nul

echo.
echo Debug files cleaned up!
echo.
echo Documentation files preserved:
echo - EMPTY_STATE_COMPLETE_FIX_SUMMARY.md
echo - EMPTY_STATE_CENTERING_FINAL.md
echo - CSS_MODULE_LOADING_ISSUE.md
echo - CSS_IMPORT_FIX_FINAL.md
echo - DELETE_BUTTON_FIX_SUMMARY.md
echo - DEBUG_FILES_CLEANUP.md
echo.
pause