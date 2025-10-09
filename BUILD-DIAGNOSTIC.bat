@echo off
cls
echo ========================================
echo   BUILD DIAGNOSTIC
echo ========================================
echo.

echo Current time: %TIME%
echo.

echo Step 1: Check current dist files...
echo.
if exist "dist\gmkb.iife.js" (
    echo ✅ gmkb.iife.js EXISTS
    dir dist\gmkb.iife.js | findstr "gmkb.iife.js"
    echo.
    echo First line of file:
    for /f "delims=" %%a in ('type dist\gmkb.iife.js ^| more +0 ^| findstr /n "^" ^| findstr "^1:"') do echo %%a
) else (
    echo ❌ gmkb.iife.js DOES NOT EXIST
)
echo.

echo Step 2: Delete old file...
if exist "dist\gmkb.iife.js" (
    del dist\gmkb.iife.js
    if exist "dist\gmkb.iife.js" (
        echo ❌ FAILED to delete - file may be locked!
        echo.
        echo Is the file open in an editor?
        echo Is a process using it?
        pause
        exit /b 1
    ) else (
        echo ✅ File deleted successfully
    )
) else (
    echo ℹ️  File doesn't exist
)
echo.

echo Step 3: Build...
echo.
call npm run build
if %errorlevel% neq 0 (
    echo ❌ Build failed!
    pause
    exit /b %errorlevel%
)
echo.

echo Step 4: Check new file...
echo.
if exist "dist\gmkb.iife.js" (
    echo ✅ NEW gmkb.iife.js created!
    dir dist\gmkb.iife.js | findstr "gmkb.iife.js"
    echo.
    echo First line of new file:
    for /f "delims=" %%a in ('type dist\gmkb.iife.js ^| more +0 ^| findstr /n "^" ^| findstr "^1:"') do echo %%a
    echo.
    echo File size:
    for %%A in (dist\gmkb.iife.js) do echo %%~zA bytes
) else (
    echo ❌ File was NOT created!
    echo Build succeeded but file is missing!
    echo.
    echo Check if vite is writing to a different location!
    echo.
    dir /s gmkb.iife.js
)
echo.

echo ========================================
echo DIAGNOSTIC COMPLETE
echo ========================================
echo.
echo Current time: %TIME%
echo.
echo Compare timestamps above!
echo.
pause
