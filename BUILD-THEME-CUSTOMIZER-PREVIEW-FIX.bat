@echo off
echo ========================================
echo THEME CUSTOMIZER PREVIEW FIX
echo ========================================
echo.
echo ISSUE IDENTIFIED:
echo - Theme customizer preview not updating in real-time
echo - Page background and other fields don't apply to preview
echo.
echo ROOT CAUSE:
echo - Direct mutation of nested objects broke Vue reactivity
echo - store.tempCustomizations.colors[key] = value
echo - Vue couldn't detect the nested property change
echo.
echo FIX APPLIED:
echo - Changed to immutable updates
echo - store.tempCustomizations.colors = { ...colors, [key]: value }
echo - Vue now properly detects all changes
echo.
echo AFFECTED UPDATE METHODS:
echo - updateColor()       ✓ Fixed
echo - updateTypography()  ✓ Fixed
echo - updateSpacing()     ✓ Fixed
echo - updateEffects()     ✓ Fixed
echo - applyColorPreset()  ✓ Already correct
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
    echo 4. Change "Page Background" color
    echo 5. Watch the preview update IMMEDIATELY
    echo.
    echo 6. Test ALL fields:
    echo    Colors Tab:
    echo    - Primary Color ✓
    echo    - Primary Text Color ✓
    echo    - Secondary Color ✓
    echo    - Page Background ✓
    echo    - Card Background ✓
    echo    - Text Color ✓
    echo    - Link Color ✓
    echo    - Link Hover Color ✓
    echo.
    echo    Typography Tab:
    echo    - Primary Font ✓
    echo    - Heading Font ✓
    echo    - Base Font Size ✓
    echo    - Heading Scale ✓
    echo    - Line Height ✓
    echo    - Font Weight ✓
    echo.
    echo    Spacing Tab:
    echo    - Base Unit ✓
    echo    - Component Gap ✓
    echo    - Section Padding ✓
    echo    - Container Max Width ✓
    echo.
    echo    Effects Tab:
    echo    - Border Radius ✓
    echo    - Shadow Intensity ✓
    echo    - Animation Speed ✓
    echo    - Gradient Backgrounds ✓
    echo    - Blur Effects ✓
    echo.
    echo 7. Click "Apply Changes"
    echo 8. Click "Save"
    echo 9. Refresh page
    echo 10. Theme should persist
    echo.
    echo ========================================
    echo DEBUG CONSOLE LOGS:
    echo ========================================
    echo.
    echo When you change a field, you should see:
    echo   [Theme Store] Updated color background: #6f2525
    echo   [ThemeCustomizer] tempCustomizations changed
    echo   [ThemeCustomizer] mergedTheme changed
    echo   [ThemeCustomizer] Preview styles updated
    echo.
    echo This confirms the reactivity chain is working.
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
