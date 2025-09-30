@echo off
REM Media Kit Builder - Legacy Code Archival Script (Windows)
REM This script safely archives all legacy JavaScript and related files
REM Run this after verifying Vue-only mode works correctly

echo =========================================
echo Media Kit Builder - Legacy Code Archival
echo =========================================
echo.

REM Get current date/time for archive naming
for /f "tokens=1-4 delims=/ " %%a in ('date /t') do set DATE=%%d%%b%%c
for /f "tokens=1-2 delims=: " %%a in ('time /t') do set TIME=%%a%%b
set TIME=%TIME: =%
set ARCHIVE_DIR=ARCHIVE\legacy-removal-%DATE%_%TIME%

REM Create archive directory
echo Creating archive directory: %ARCHIVE_DIR%
if not exist "ARCHIVE" mkdir "ARCHIVE"
if not exist "%ARCHIVE_DIR%" mkdir "%ARCHIVE_DIR%"

REM ================================================
REM ARCHIVE LEGACY JAVASCRIPT
REM ================================================
echo.
echo Archiving legacy JavaScript files...
if exist "js" (
    echo   Moving: js
    move "js" "%ARCHIVE_DIR%\" >nul 2>&1
) else (
    echo   Skipping: js ^(not found^)
)

if exist "js-legacy" (
    echo   Moving: js-legacy
    move "js-legacy" "%ARCHIVE_DIR%\" >nul 2>&1
) else (
    echo   Skipping: js-legacy ^(not found^)
)

REM ================================================
REM ARCHIVE LEGACY SYSTEM FILES
REM ================================================
echo.
echo Archiving legacy system files...
if exist "system" (
    if not exist "%ARCHIVE_DIR%\system" mkdir "%ARCHIVE_DIR%\system"
    echo   Moving JavaScript files from system\
    move "system\*.js" "%ARCHIVE_DIR%\system\" >nul 2>&1
)

REM ================================================
REM ARCHIVE LEGACY ENQUEUE FILES
REM ================================================
echo.
echo Archiving legacy enqueue files...
if not exist "%ARCHIVE_DIR%\includes" mkdir "%ARCHIVE_DIR%\includes"

if exist "includes\enqueue.php" (
    echo   Moving: includes\enqueue.php
    move "includes\enqueue.php" "%ARCHIVE_DIR%\includes\" >nul 2>&1
)

if exist "includes\enqueue-separated.php" (
    echo   Moving: includes\enqueue-separated.php
    move "includes\enqueue-separated.php" "%ARCHIVE_DIR%\includes\" >nul 2>&1
)

REM ================================================
REM ARCHIVE LEGACY TEMPLATES
REM ================================================
echo.
echo Archiving legacy template files...
if not exist "%ARCHIVE_DIR%\templates" mkdir "%ARCHIVE_DIR%\templates"

if exist "templates\builder-template-backup.php" (
    echo   Moving: templates\builder-template-backup.php
    move "templates\builder-template-backup.php" "%ARCHIVE_DIR%\templates\" >nul 2>&1
)

if exist "templates\builder-template.php" (
    echo   Moving: templates\builder-template.php
    move "templates\builder-template.php" "%ARCHIVE_DIR%\templates\" >nul 2>&1
)

if exist "templates\partials" (
    echo   Moving: templates\partials
    move "templates\partials" "%ARCHIVE_DIR%\templates\" >nul 2>&1
)

REM ================================================
REM ARCHIVE BUILD SCRIPTS
REM ================================================
echo.
echo Archiving legacy build scripts...

for %%f in (build.bat build.sh build.js rebuild.bat clean-rebuild.bat force-rebuild.bat rebuild-vue.bat) do (
    if exist "%%f" (
        echo   Moving: %%f
        move "%%f" "%ARCHIVE_DIR%\" >nul 2>&1
    )
)

REM ================================================
REM ARCHIVE LEGACY DEBUG FILES
REM ================================================
echo.
echo Archiving legacy debug files...
if not exist "%ARCHIVE_DIR%\debug" mkdir "%ARCHIVE_DIR%\debug"

if exist "debug" (
    echo   Moving JavaScript files from debug\
    move "debug\*.js" "%ARCHIVE_DIR%\debug\" >nul 2>&1
)

REM Move test files
for %%f in (test-*.js) do (
    if exist "%%f" (
        echo   Moving: %%f
        move "%%f" "%ARCHIVE_DIR%\" >nul 2>&1
    )
)

REM ================================================
REM CREATE ARCHIVE INFO FILE
REM ================================================
echo.
echo Creating archive info file...
(
echo Media Kit Builder - Legacy Code Archive
echo =========================================
echo Archive Date: %DATE% %TIME%
echo Archive Reason: Migration to 100%% Vue Architecture
echo.
echo This archive contains all legacy JavaScript and related files
echo that were removed during the migration to Vue-only architecture.
echo.
echo Contents:
echo - js\              : Legacy JavaScript files ^(60+ files^)
echo - system\*.js      : Legacy system JavaScript
echo - includes\        : Legacy enqueue files  
echo - templates\       : Legacy PHP templates
echo - build scripts    : Legacy build tools
echo - debug\           : Legacy debug tools
echo.
echo To restore ^(NOT RECOMMENDED^):
echo 1. Copy files back to their original locations
echo 2. Update guestify-media-kit-builder.php to use enqueue.php
echo 3. Add back GMKB_PURE_VUE_MODE constant
echo.
echo For questions, check LEGACY-REMOVAL-PLAN.md
) > "%ARCHIVE_DIR%\ARCHIVE_INFO.txt"

REM ================================================
REM CREATE RESTORATION SCRIPT
REM ================================================
echo.
echo Creating restoration script ^(for emergency use only^)...
(
echo @echo off
echo echo WARNING: This will restore legacy code and break Vue-only mode!
echo set /p confirmation="Are you sure? ^(type 'yes' to continue^): "
echo.
echo if not "%%confirmation%%"=="yes" ^(
echo     echo Restoration cancelled
echo     exit /b 1
echo ^)
echo.
echo REM Restore files
echo if exist "js" xcopy /E /I /Y "js" "..\..\js\" ^>nul 2^>^&1
echo if exist "system" xcopy /E /I /Y "system\*.js" "..\..\system\" ^>nul 2^>^&1
echo if exist "includes" xcopy /E /I /Y "includes\*" "..\..\includes\" ^>nul 2^>^&1
echo if exist "templates" xcopy /E /I /Y "templates\*" "..\..\templates\" ^>nul 2^>^&1
echo.
echo echo Legacy files restored. You must now:
echo echo 1. Edit guestify-media-kit-builder.php
echo echo 2. Change require to use enqueue.php instead of enqueue-vue-only.php
echo echo 3. Add define^('GMKB_PURE_VUE_MODE', false^);
) > "%ARCHIVE_DIR%\restore-legacy.bat"

REM ================================================
REM SUMMARY
REM ================================================
echo.
echo =========================================
echo Archive Complete!
echo =========================================
echo Archive location: %ARCHIVE_DIR%
echo.
echo Next steps:
echo 1. Test the Media Kit Builder
echo 2. Verify everything works with Vue-only mode
echo 3. If all good, you can delete the archive later
echo.
echo To delete archive permanently:
echo   rmdir /s /q "%ARCHIVE_DIR%"
echo.
echo Done!
echo.
pause