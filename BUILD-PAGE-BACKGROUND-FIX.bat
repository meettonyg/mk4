@echo off
echo ========================================
echo PAGE BACKGROUND FIX - Phase 4
echo ========================================
echo.
echo ISSUE IDENTIFIED:
echo - Page Background field was updating component backgrounds
echo - Not updating the actual page background
echo.
echo ROOT CAUSE:
echo - ComponentStyleService used --gmkb-color-background (page)
echo - Should use --gmkb-color-surface (components)
echo - #media-kit-preview had hardcoded white background
echo.
echo COLOR SYSTEM CLARIFIED:
echo - background = Page background (body/main container)
echo - surface = Component/card backgrounds
echo.
echo FIXES APPLIED:
echo 1. ComponentStyleService now uses --gmkb-color-surface
echo 2. #media-kit-preview now uses --gmkb-color-background
echo.
echo ========================================
echo.

echo Building Vue bundle...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo TESTING INSTRUCTIONS:
    echo ========================================
    echo.
    echo 1. HARD REFRESH browser (Ctrl+F5^)
    echo 2. Open Theme Customizer
    echo 3. Go to "Colors" tab
    echo.
    echo 4. Change "Page Background" to red
    echo    Result: Preview area background turns red
    echo    Components stay white/surface color
    echo.
    echo 5. Change "Card Background" to blue  
    echo    Result: Components turn blue
    echo    Page background stays red
    echo.
    echo 6. Click "Apply Changes"
    echo 7. Close customizer
    echo 8. Main preview should show both:
    echo    - Red page background
    echo    - Blue component backgrounds
    echo.
    echo 9. Click "Save" → Refresh
    echo 10. Colors should persist
    echo.
    echo ========================================
    echo COLOR MAPPING:
    echo ========================================
    echo.
    echo Page Background    → --gmkb-color-background
    echo                       Applied to: #media-kit-preview
    echo.
    echo Card Background    → --gmkb-color-surface  
    echo                       Applied to: components
    echo.
    echo Primary Color      → --gmkb-color-primary
    echo                       Applied to: buttons, accents
    echo.
    echo Text Color         → --gmkb-color-text
    echo                       Applied to: all text content
    echo.
    echo ========================================
    echo WHAT CHANGED:
    echo ========================================
    echo.
    echo ComponentStyleService.js:
    echo   OLD: var(--gmkb-color-background, #ffffff^)
    echo   NEW: var(--gmkb-color-surface, #ffffff^)
    echo.
    echo builder.css:
    echo   OLD: background: #ffffff;
    echo   NEW: background: var(--gmkb-color-background, #ffffff^);
    echo.
    echo Now the page uses "background" and components use "surface"!
    echo.
) else (
    echo.
    echo ========================================
    echo BUILD FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo.
)

pause
