@echo off
REM PHASE 2 BUILD: Complete Vue Component Migration
REM This builds the bundle with all Vue components properly configured

echo ============================================
echo PHASE 2: Vue Component Migration Build
echo ============================================
echo.
echo Components Fixed:
echo   - hero (already working)
echo   - biography (already working)  
echo   - guest-intro (restored and fixed)
echo   - logo-grid (restored and fixed)
echo   - photo-gallery (restored and fixed)
echo   - topics-questions (restored and fixed)
echo.
echo All components now use correct parameter order:
echo   render(data, container) instead of render(container, data)
echo.
echo Building bundle with all fixes...
echo.

REM Check if we're in the right directory
if not exist "package.json" (
    echo ERROR: package.json not found
    echo Please run this script from: C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4
    exit /b 1
)

REM Run the build
call npm run build

REM Check if build was successful
if exist "dist\gmkb.iife.js" (
    echo.
    echo ============================================
    echo PHASE 2 BUILD SUCCESSFUL!
    echo ============================================
    echo.
    echo All Vue components should now:
    echo   1. Receive data from state manager
    echo   2. Display content properly
    echo   3. Support theme switching
    echo   4. Handle component controls
    echo.
    echo Next steps:
    echo   1. Clear browser cache (Ctrl+Shift+R)
    echo   2. Refresh the Media Kit Builder page
    echo   3. Run test-phase2-vue-migration.js in console
    echo   4. Verify all components display content
    echo.
    echo If components work, Phase 2 is complete!
) else (
    echo.
    echo Build failed! Check error messages above.
    exit /b 1
)
