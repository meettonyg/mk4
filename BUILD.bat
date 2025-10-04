@echo off
echo Building Media Kit Builder...
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
