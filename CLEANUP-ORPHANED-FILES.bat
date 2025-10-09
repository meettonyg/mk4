@echo off
cls
echo ========================================
echo   CLEANUP ORPHANED FILES
echo ========================================
echo.
echo This will DELETE orphaned components:
echo  - Section.vue (NOT USED)
echo  - SectionControls.vue (NOT USED)
echo.
echo These files are NOT imported anywhere.
echo We've verified they're safe to delete.
echo.
echo ========================================
echo.
pause

echo.
echo Step 1: Final verification search...
echo.

findstr /s /i "Section.vue" src\vue\components\*.vue > nul
if %errorlevel% equ 0 (
    echo ⚠️  WARNING: Found references to Section.vue
    echo Please review before deleting!
    pause
    exit /b 1
)

findstr /s /i "SectionControls" src\vue\components\*.vue > nul
if %errorlevel% equ 0 (
    echo ⚠️  WARNING: Found references to SectionControls
    echo Please review before deleting!
    pause
    exit /b 1
)

echo ✅ No references found - safe to delete
echo.

echo Step 2: Deleting orphaned files...
echo.

if exist "src\vue\components\sections\Section.vue" (
    del "src\vue\components\sections\Section.vue"
    echo ✅ Deleted Section.vue
) else (
    echo ℹ️  Section.vue not found
)

if exist "src\vue\components\sections\SectionControls.vue" (
    del "src\vue\components\sections\SectionControls.vue"
    echo ✅ Deleted SectionControls.vue
) else (
    echo ℹ️  SectionControls.vue not found
)

echo.
echo Step 3: Check if sections folder can be removed...
echo.

dir /b "src\vue\components\sections" 2>nul | findstr "." > nul
if %errorlevel% equ 0 (
    echo ℹ️  sections/ folder still has files - keeping it
    echo    Remaining files:
    dir /b "src\vue\components\sections"
) else (
    echo ✅ sections/ folder is empty
    echo Do you want to delete the empty folder? (Y/N)
    set /p confirm=
    if /i "%confirm%"=="Y" (
        rmdir "src\vue\components\sections"
        echo ✅ Deleted empty sections/ folder
    )
)

echo.
echo ========================================
echo ✅ CLEANUP COMPLETE
echo ========================================
echo.
echo Dead code removed:
echo  ✅ Section.vue (orphaned)
echo  ✅ SectionControls.vue (orphaned)
echo.
echo Active components remain:
echo  ✅ SectionLayoutEnhanced.vue
echo  ✅ SectionSettings.vue
echo.
echo Next: Run FINAL-FIX-BUILD.bat to rebuild
echo.
pause
