@echo off
REM Phase 3: Delete 5 deprecated/disabled files
REM Safe to run - all files are explicitly deprecated or disabled

echo ========================================
echo Phase 3: Deleting Deprecated Files
echo ========================================
echo.

cd /d "%~dp0includes"

echo Deleting enhanced-ajax.php...
if exist enhanced-ajax.php (
    del enhanced-ajax.php
    echo [OK] enhanced-ajax.php deleted
) else (
    echo [SKIP] enhanced-ajax.php not found
)

echo Deleting enhanced-state-loading-coordinator.php...
if exist enhanced-state-loading-coordinator.php (
    del enhanced-state-loading-coordinator.php
    echo [OK] enhanced-state-loading-coordinator.php deleted
) else (
    echo [SKIP] enhanced-state-loading-coordinator.php not found
)

echo Deleting polling-detector-injector.php...
if exist polling-detector-injector.php (
    del polling-detector-injector.php
    echo [OK] polling-detector-injector.php deleted
) else (
    echo [SKIP] polling-detector-injector.php not found
)

echo Deleting gmkb-database-inspector.php...
if exist gmkb-database-inspector.php (
    del gmkb-database-inspector.php
    echo [OK] gmkb-database-inspector.php deleted
) else (
    echo [SKIP] gmkb-database-inspector.php not found
)

echo Deleting gmkb-debug-logger.php...
if exist gmkb-debug-logger.php (
    del gmkb-debug-logger.php
    echo [OK] gmkb-debug-logger.php deleted
) else (
    echo [SKIP] gmkb-debug-logger.php not found
)

echo.
echo ========================================
echo Deletion Complete!
echo ========================================
echo.
echo Next steps:
echo 1. Verify no errors in console
echo 2. Test the builder loads correctly
echo 3. Commit changes to git
echo.
echo Git commit command:
echo git add -A
echo git commit -m "Phase 3: Remove 5 deprecated files"
echo.

pause
