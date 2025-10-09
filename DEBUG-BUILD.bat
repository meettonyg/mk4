@echo off
echo ========================================
echo   DEBUGGING BUILD - Elementor Sidebar
echo ========================================
echo.

echo [1/2] Building with Vite...
call npm run build

if %errorlevel% neq 0 (
    echo.
    echo ❌ BUILD FAILED
    exit /b %errorlevel%
)

echo.
echo ========================================
echo ✅ BUILD SUCCESSFUL
echo ========================================
echo.
echo Next Steps:
echo 1. Clear browser cache (Ctrl+Shift+R)
echo 2. Click section settings button
echo 3. Check console for debug logs
echo 4. Look for red debug box in top-right
echo.
echo Debug logs to watch for:
echo   - "UI Store: Opening section editor"
echo   - "SidebarTabs: Mode changed"
echo   - "SectionEditor: Component MOUNTED"
echo.
pause
