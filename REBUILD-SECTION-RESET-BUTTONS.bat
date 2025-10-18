@echo off
REM ========================================
REM SECTION RESET BUTTONS - ROOT FIX BUILD
REM ========================================

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║  SECTION RESET BUTTONS - ROOT CAUSE FIX              ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo ✅ FIX APPLIED:
echo    - Added Reset Settings button to Section Editor
echo    - Added Clear Section button to Section Editor
echo    - Buttons now appear between title and back arrow
echo.
echo 📁 FILE MODIFIED:
echo    - src/vue/components/sidebar/SectionEditor.vue
echo.
echo ⚙️  BUILDING APPLICATION...
echo.

REM Navigate to project directory
cd /d "%~dp0"

REM Install dependencies if needed
if not exist "node_modules" (
    echo 📦 Installing dependencies first...
    echo.
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Dependency installation failed!
        pause
        exit /b %errorlevel%
    )
)

REM Build the project
echo 🔨 Building Vue application...
echo.
npm run build

REM Check if build was successful
if %errorlevel% neq 0 (
    echo.
    echo ❌ BUILD FAILED!
    echo.
    echo Please check the error messages above.
    pause
    exit /b %errorlevel%
)

echo.
echo ╔═══════════════════════════════════════════════════════╗
echo ║  ✅ BUILD COMPLETED SUCCESSFULLY!                    ║
echo ╚═══════════════════════════════════════════════════════╝
echo.
echo 📦 OUTPUT: dist/gmkb.iife.js
echo.
echo 🔄 NEXT STEPS:
echo    1. Refresh your browser (Ctrl+Shift+R)
echo    2. Open "Edit Section" in your media kit
echo    3. Look for buttons between title and back arrow
echo.
echo 🎯 EXPECTED RESULT:
echo    [← Back]  Edit Section  [Reset Settings] [Clear]
echo.
echo 📝 For details, see: SECTION-RESET-BUTTONS-ROOT-CAUSE-FIXED.md
echo.

REM Show file size
echo 📊 Build output size:
dir dist\gmkb.iife.js 2>nul | find "gmkb.iife.js"
echo.
echo ═══════════════════════════════════════════════════════
pause
