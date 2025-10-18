@echo off
REM ========================================
REM ARCHIVE SECTIONSETTINGS.VUE - DEAD CODE REMOVAL
REM ========================================

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║  ARCHIVE SECTIONSETTINGS.VUE - CODE BLOAT REMOVAL   ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo 📋 ANALYSIS SUMMARY:
echo    • SectionSettings.vue = DEPRECATED legacy modal
echo    • SectionEditor.vue = CURRENT inline sidebar
echo    • All calls redirect to SectionEditor.vue
echo    • SectionSettings.vue NEVER opens in production
echo.
echo 🎯 ACTIONS TO PERFORM:
echo    1. Move SectionSettings.vue to _archive
echo    2. Remove import from MediaKitApp.vue
echo    3. Remove deprecated state from UI store
echo    4. Rebuild application
echo.
echo ⚠️  WARNING: This will MODIFY source files
echo.

set /p CONFIRM="Continue with archive? (yes/no): "
if /i not "%CONFIRM%"=="yes" (
    echo.
    echo ❌ Archive cancelled by user
    pause
    exit /b 0
)

echo.
echo ═══════════════════════════════════════════════════════
echo 🔄 STEP 1: Creating archive directory
echo ═══════════════════════════════════════════════════════

if not exist "_archive\sections" (
    mkdir "_archive\sections"
    echo ✅ Created: _archive\sections\
) else (
    echo ✅ Directory exists: _archive\sections\
)

echo.
echo ═══════════════════════════════════════════════════════
echo 🔄 STEP 2: Moving SectionSettings.vue to archive
echo ═══════════════════════════════════════════════════════

if exist "src\vue\components\sections\SectionSettings.vue" (
    move "src\vue\components\sections\SectionSettings.vue" "_archive\sections\SectionSettings.vue"
    echo ✅ Moved: SectionSettings.vue → _archive\sections\
) else (
    echo ⚠️  File not found: SectionSettings.vue
    echo    (May have been moved already)
)

echo.
echo ═══════════════════════════════════════════════════════
echo 🔄 STEP 3: Removing import from MediaKitApp.vue
echo ═══════════════════════════════════════════════════════

REM Create backup
copy "src\vue\components\MediaKitApp.vue" "src\vue\components\MediaKitApp.vue.backup" >nul
echo ✅ Created backup: MediaKitApp.vue.backup

REM Use PowerShell to remove the lines
powershell -Command "(Get-Content 'src\vue\components\MediaKitApp.vue') | Where-Object { $_ -notmatch 'SectionSettings' } | Set-Content 'src\vue\components\MediaKitApp.vue'"

if %errorlevel% equ 0 (
    echo ✅ Removed SectionSettings references from MediaKitApp.vue
) else (
    echo ❌ Failed to update MediaKitApp.vue
    echo    Restoring backup...
    copy "src\vue\components\MediaKitApp.vue.backup" "src\vue\components\MediaKitApp.vue" >nul
    echo ✅ Backup restored
    pause
    exit /b 1
)

echo.
echo ═══════════════════════════════════════════════════════
echo 🔄 STEP 4: Cleaning UI store (manual step)
echo ═══════════════════════════════════════════════════════

echo.
echo ⚠️  MANUAL STEP REQUIRED:
echo.
echo    Edit: src\stores\ui.js
echo.
echo    Remove these deprecated items:
echo    • State: sectionSettingsPanelOpen (line ~37)
echo    • Method: openSectionSettings() (line ~150)
echo    • Method: closeSectionSettings() (line ~156)
echo.
echo    This requires manual editing to ensure safety.
echo    See SECTIONSETTINGS-CODE-BLOAT-ANALYSIS.md for details.
echo.

echo.
echo ═══════════════════════════════════════════════════════
echo 🔄 STEP 5: Rebuilding application
echo ═══════════════════════════════════════════════════════

echo.
echo Building with removed component...
echo.

npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ BUILD FAILED!
    echo.
    echo Restoring files...
    move "_archive\sections\SectionSettings.vue" "src\vue\components\sections\SectionSettings.vue"
    copy "src\vue\components\MediaKitApp.vue.backup" "src\vue\components\MediaKitApp.vue" >nul
    echo ✅ Files restored
    echo.
    echo Check error messages above for details.
    pause
    exit /b 1
)

echo.
echo ╔══════════════════════════════════════════════════════╗
echo ║  ✅ ARCHIVE COMPLETED SUCCESSFULLY!                 ║
echo ╚══════════════════════════════════════════════════════╝
echo.
echo 📦 RESULTS:
echo    • SectionSettings.vue → archived
echo    • MediaKitApp.vue → imports removed
echo    • Build → successful
echo.
echo 📊 CODE REDUCTION:
echo    • ~250 lines removed
echo    • ~15KB bundle size reduction (estimated)
echo.
echo ⚠️  REMAINING MANUAL STEPS:
echo    1. Edit src\stores\ui.js (remove deprecated state/methods)
echo    2. Test section editing in browser
echo    3. Verify SectionEditor.vue still works
echo    4. Commit changes with clear message
echo.
echo 📝 COMMIT MESSAGE SUGGESTION:
echo    "refactor: archive deprecated SectionSettings.vue modal
echo.
echo    - Moved SectionSettings.vue to _archive
echo    - Removed imports from MediaKitApp.vue
echo    - Component was deprecated and redirected to SectionEditor
echo    - All section editing now uses inline sidebar approach
echo    - Bundle size reduced by ~15KB"
echo.
echo ═══════════════════════════════════════════════════════
echo.

REM Show backup location
if exist "src\vue\components\MediaKitApp.vue.backup" (
    echo 💾 BACKUP SAVED: MediaKitApp.vue.backup
    echo    (You can delete this once testing is complete)
    echo.
)

REM Show archived file location
if exist "_archive\sections\SectionSettings.vue" (
    echo 📁 ARCHIVED TO: _archive\sections\SectionSettings.vue
    echo    (Can be permanently deleted after testing)
    echo.
)

pause
