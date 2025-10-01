@echo off
echo ====================================
echo Building Vue Bundle - Phase 3
echo ====================================
echo.

echo Cleaning dist folder...
if exist dist rmdir /s /q dist
mkdir dist

echo.
echo Running Vite build...
npm run build

echo.
if errorlevel 1 (
    echo ❌ Build FAILED
    pause
    exit /b 1
) else (
    echo ✅ Build SUCCESSFUL
    echo.
    echo Phase 3 Pure Vue template is ready!
    echo.
    echo Next steps:
    echo 1. Test builder page with ?mkcg_id=123
    echo 2. Check console for initialization steps 1-7
    echo 3. Verify page source is minimal (< 100 lines)
    echo.
    pause
)
