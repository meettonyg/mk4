@echo off
echo ========================================
echo   Reverting Non-Compliant Changes
echo ========================================
echo.

echo Reverting changes to legacy systems that violate architecture...
echo.

REM These files shouldn't be modified as they're legacy and shouldn't load with lean bundle
git checkout -- js/core/enhanced-component-renderer-simplified.js
git checkout -- js/core/client-only-renderer.js
git checkout -- system/SectionRenderer.js
git checkout -- js/core/component-controls-manager.js

echo.
echo Legacy files reverted to original state.
echo.
echo Now rebuilding the lean bundle...
echo.

call rebuild-lean-bundle.bat

echo.
echo ========================================
echo          CLEANUP COMPLETE
echo ========================================
echo.
echo The system is now architecture-compliant:
echo - Legacy files restored
echo - Lean bundle rebuilt
echo - Only Vue/Vite system should load
echo.
pause