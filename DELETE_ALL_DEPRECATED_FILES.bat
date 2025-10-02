@echo off
REM Phase 3: Delete ALL deprecated files (dev environment - no need to wait)
REM Safe to run - all files are explicitly deprecated or replaced by REST API v2

echo ========================================
echo Phase 3: Deleting ALL Deprecated Files
echo ========================================
echo.
echo This will delete 10 deprecated files:
echo - 5 debug/disabled files
echo - 5 AJAX handlers (replaced by REST API v2)
echo.
pause

cd /d "%~dp0includes"

echo.
echo === Deleting Debug/Disabled Files ===
echo.

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
echo === Deleting AJAX Handlers (Replaced by REST API v2) ===
echo.

echo Deleting gmkb-ajax-handlers.php...
if exist gmkb-ajax-handlers.php (
    del gmkb-ajax-handlers.php
    echo [OK] gmkb-ajax-handlers.php deleted
) else (
    echo [SKIP] gmkb-ajax-handlers.php not found
)

echo Deleting theme-ajax-handlers.php...
if exist theme-ajax-handlers.php (
    del theme-ajax-handlers.php
    echo [OK] theme-ajax-handlers.php deleted
) else (
    echo [SKIP] theme-ajax-handlers.php not found
)

echo Deleting theme-customizer-ajax.php...
if exist theme-customizer-ajax.php (
    del theme-customizer-ajax.php
    echo [OK] theme-customizer-ajax.php deleted
) else (
    echo [SKIP] theme-customizer-ajax.php not found
)

echo Deleting class-gmkb-mkcg-refresh-ajax-handlers.php...
if exist class-gmkb-mkcg-refresh-ajax-handlers.php (
    del class-gmkb-mkcg-refresh-ajax-handlers.php
    echo [OK] class-gmkb-mkcg-refresh-ajax-handlers.php deleted
) else (
    echo [SKIP] class-gmkb-mkcg-refresh-ajax-handlers.php not found
)

echo Deleting version-history-handler.php...
if exist version-history-handler.php (
    del version-history-handler.php
    echo [OK] version-history-handler.php deleted
) else (
    echo [SKIP] version-history-handler.php not found
)

echo.
echo ========================================
echo Deletion Complete!
echo ========================================
echo.
echo Files deleted: 10
echo Files remaining: 9 essential files
echo.
echo REMAINING FILES (all essential):
echo   1. component-field-sync.php
echo   2. component-pods-enrichment.php
echo   3. component-data-sanitization.php
echo   4. enqueue.php
echo   5. frontend-template-router.php
echo   6. ComponentDiscovery.php
echo   7. class-gmkb-frontend-display.php
echo   8. class-gmkb-mkcg-data-integration.php
echo   9. class-theme-generator.php
echo.
echo Next steps:
echo 1. Test the builder loads correctly
echo 2. Verify REST API endpoints work
echo 3. Check browser console for errors
echo 4. Commit changes to git
echo.
echo Git commit command:
echo git add -A
echo git commit -m "Phase 3: Remove 10 deprecated files, REST API v2 only"
echo.

pause
