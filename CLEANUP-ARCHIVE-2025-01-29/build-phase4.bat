@echo off
echo ======================================
echo Building Media Kit Builder - Phase 4
echo ======================================

echo Cleaning previous build...
if exist dist rd /s /q dist

echo Installing dependencies...
call npm install

echo Building with Vite...
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ Build failed! Please check the error messages above.
    pause
    exit /b 1
)

echo.
echo ✅ Build completed successfully!
echo.
echo Phase 4 Implementation Complete:
echo - Enhanced Section component with VueDraggable
echo - Section controls and settings
echo - Component wrapper with hover controls
echo - MediaKitBuilder with section reordering
echo - Supporting components (Toolbar, EmptyState, Toast)
echo - Optimized drag and drop between sections
echo.
pause
