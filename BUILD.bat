@echo off
echo Building Media Kit Builder...
echo ==============================
echo.
echo MAJOR UPDATE: ALL 16 COMPONENTS FIXED!
echo.
echo COMPREHENSIVE FIXES APPLIED:
echo.
echo 1. ComponentStyleService now supports BOTH builder and frontend
echo    - Builder uses: .component-wrapper
echo    - Frontend uses: .gmkb-component
echo    - CSS generated for both environments
echo.
echo 2. Frontend template fixed to avoid double-wrapping
echo    - Component templates include their own wrapper
echo    - No duplicate .gmkb-component divs
echo.
echo 3. Line-height inheritance fixed in ALL components
echo    - Removed hardcoded line-height from all 16 components
echo    - Line-height now properly inherits from ComponentStyleService
echo.
echo 4. ALL 16 COMPONENTS - Hardcoded values removed:
echo    [x] Biography     [x] Hero          [x] Topics        [x] Stats
echo    [x] Guest-Intro   [x] Contact       [x] Social        [x] Call-to-Action
echo    [x] Logo-Grid     [x] Testimonials  [x] Questions     [x] Video-Intro
echo    [x] Topics-Questions [x] Photo-Gallery [x] Podcast-Player [x] Booking-Calendar
echo.
echo    REMOVED: font-size, font-weight, line-height, fixed colors
echo    ADDED: CSS variables, opacity for hierarchy, inheritance
echo.
echo 5. User now has FULL CONTROL through style panel:
echo    - Typography (size, weight, line-height)
echo    - Colors (via themes and CSS variables)
echo    - Border-radius (consistent across components)
echo    - Visual hierarchy (maintained via opacity)
echo.
echo ==============================

REM Install dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
)

REM Build the project
echo Building production bundle...
npm run build

REM Check if build was successful
if %errorlevel% neq 0 (
    echo Build failed!
    exit /b %errorlevel%
)

echo ==============================
echo Build completed successfully!
echo Output file: dist/gmkb.iife.js
echo.

REM Show file size
echo File size:
dir dist\gmkb.iife.js | find "gmkb.iife.js"
echo.
echo IMPORTANT: Refresh your browser to see the style updates working!
echo ==============================
