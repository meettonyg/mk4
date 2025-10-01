@echo off
echo ========================================
echo   Phase 2 API - Rebuild Vue Bundle
echo ========================================
echo.

echo Step 1: Building Vue application...
call npm run build

if %ERRORLEVEL% EQU 0 (
    echo.
    echo ========================================
    echo   BUILD SUCCESSFUL!
    echo ========================================
    echo.
    echo The updated APIService has been compiled into dist/gmkb.iife.js
    echo.
    echo Next steps:
    echo   1. Refresh your browser
    echo   2. Open browser console
    echo   3. Test the API with:
    echo.
    echo      // Direct REST API test
    echo      fetch('/wp-json/gmkb/v2/mediakit/YOUR_POST_ID', {
    echo        headers: { 'X-WP-Nonce': window.gmkbData.restNonce }
    echo      }).then(r =^> r.json()).then(console.log)
    echo.
    echo   OR use the test page at:
    echo      /wp-content/plugins/mk4/test-phase2-api.html
    echo.
) else (
    echo.
    echo ========================================
    echo   BUILD FAILED!
    echo ========================================
    echo.
    echo Please check the error messages above.
    echo Common issues:
    echo   - Node modules not installed: run 'npm install'
    echo   - Syntax errors in JavaScript files
    echo   - Missing dependencies
    echo.
)

pause
