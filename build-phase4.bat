@echo off
REM PHASE 4: Advanced Features Build
REM Adds inline editing, templates, and import/export

echo ============================================
echo PHASE 4: ADVANCED FEATURES BUILD
echo ============================================
echo.
echo New Features Being Added:
echo   [+] Inline Editor - Double-click to edit text
echo   [+] Component Templates - Pre-built configurations
echo   [+] Import/Export - Backup and share media kits
echo   [+] Custom Templates - Save your own templates
echo.
echo Building with advanced features...
echo.

REM Check directory
if not exist "package.json" (
    echo ERROR: Wrong directory. Please run from mk4 folder
    exit /b 1
)

REM Build
echo Building bundle with Phase 4 features...
call npm run build

REM Verify build
if not exist "dist\gmkb.iife.js" (
    echo.
    echo ❌ BUILD FAILED
    echo Check error messages above
    exit /b 1
)

echo.
echo ============================================
echo ✅ PHASE 4 BUILD SUCCESSFUL!
echo ============================================
echo.
echo 🎯 ADVANCED FEATURES NOW AVAILABLE:
echo.
echo 📝 INLINE EDITING:
echo   • Double-click any text to edit
echo   • Press Enter to save, Esc to cancel
echo   • Works on titles, subtitles, descriptions
echo.
echo 📋 COMPONENT TEMPLATES:
echo   • 15+ pre-built templates
echo   • Complete media kit templates
echo   • Save custom templates
echo.
echo 📦 IMPORT/EXPORT:
echo   • Export as JSON or template
echo   • Import and merge media kits
echo   • Include Pods data in exports
echo.
echo ============================================
echo TESTING INSTRUCTIONS:
echo ============================================
echo.
echo 1. Clear browser cache (Ctrl+Shift+R)
echo 2. Open Media Kit Builder
echo 3. Run test-phase4-advanced.js in console
echo 4. Try the interactive features:
echo.
echo   • Double-click text to edit inline
echo   • Click Export button for new options
echo   • Run: phase4.listTemplates()
echo   • Run: phase4.applyKit("kit-speaker")
echo.
echo Phase 4 features are ready to use!
echo.

pause
