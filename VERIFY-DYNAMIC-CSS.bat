@echo off
echo ========================================
echo Dynamic Component CSS - Verification
echo ========================================
echo.

echo [1/5] Checking file modifications...
if exist "includes\class-theme-generator.php" (
    echo     [OK] class-theme-generator.php exists
) else (
    echo     [FAIL] class-theme-generator.php not found
    goto :error
)

if exist "includes\class-gmkb-frontend-display.php" (
    echo     [OK] class-gmkb-frontend-display.php exists
) else (
    echo     [FAIL] class-gmkb-frontend-display.php not found
    goto :error
)

echo [2/5] Checking documentation...
if exist "DYNAMIC-COMPONENT-CSS-LOADING.md" (
    echo     [OK] Full documentation created
) else (
    echo     [WARN] Documentation file not found
)

if exist "DYNAMIC-CSS-IMPLEMENTATION-SUMMARY.md" (
    echo     [OK] Implementation summary created
) else (
    echo     [WARN] Summary file not found
)

if exist "QUICK-REF-DYNAMIC-CSS.md" (
    echo     [OK] Quick reference created
) else (
    echo     [WARN] Quick reference file not found
)

echo [3/5] Searching for key code changes...
findstr /C:"public function generate_component_styles" "includes\class-theme-generator.php" >nul
if %ERRORLEVEL% EQU 0 (
    echo     [OK] generate_component_styles is now public
) else (
    echo     [FAIL] Method not found or not public
    goto :error
)

findstr /C:"track_component_usage" "includes\class-gmkb-frontend-display.php" >nul
if %ERRORLEVEL% EQU 0 (
    echo     [OK] Component tracking system added
) else (
    echo     [FAIL] Tracking system not found
    goto :error
)

findstr /C:"$used_components" "includes\class-theme-generator.php" >nul
if %ERRORLEVEL% EQU 0 (
    echo     [OK] Dynamic CSS parameter added
) else (
    echo     [FAIL] Parameter not found
    goto :error
)

echo [4/5] Checking for dynamic CSS comments...
findstr /C:"DYNAMIC LOADING" "includes\class-theme-generator.php" >nul
if %ERRORLEVEL% EQU 0 (
    echo     [OK] Documentation comments present
) else (
    echo     [WARN] Some comments may be missing
)

echo [5/5] Verification complete!
echo.
echo ========================================
echo STATUS: ALL CHECKS PASSED
echo ========================================
echo.
echo Next Steps:
echo 1. Review QUICK-REF-DYNAMIC-CSS.md for testing instructions
echo 2. Test on a simple media kit page (Biography + Hero only)
echo 3. Verify CSS size reduction in page source
echo 4. Check debug.log for tracking messages
echo 5. Commit changes using .git-commit-message-dynamic-css
echo.
echo For detailed information, see:
echo - DYNAMIC-COMPONENT-CSS-LOADING.md (technical details)
echo - DYNAMIC-CSS-IMPLEMENTATION-SUMMARY.md (deployment guide)
echo.
goto :end

:error
echo.
echo ========================================
echo STATUS: VERIFICATION FAILED
echo ========================================
echo.
echo Please check the error messages above and fix any issues.
echo Refer to the documentation files for help.
echo.

:end
pause
