@echo off
echo ===============================================
echo REBUILDING MEDIA KIT WITH RESPONSIVE FIX
echo ===============================================
echo.
echo This build includes:
echo - Fixed CSS class naming inconsistencies
echo - Added device preview mode support
echo - Removed conflicting scoped styles
echo - Support for tablet and mobile responsive layouts
echo.

cd /d "%~dp0"

echo Step 1: Installing dependencies...
call npm install

echo.
echo Step 2: Building Vue bundle...
call npm run build

echo.
echo ===============================================
echo BUILD COMPLETE
echo ===============================================
echo.
echo Next steps:
echo 1. Test in builder: Go to /tools/media-kit/
echo 2. Click Desktop/Tablet/Mobile buttons to test responsive preview
echo 3. Test on frontend: View any published media kit
echo 4. Resize browser window to test actual responsive behavior
echo.
pause
