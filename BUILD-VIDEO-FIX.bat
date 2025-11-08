@echo off
REM Video URL Fix - Build and Test
REM Run this after the fix to compile and verify

echo ============================================
echo VIDEO URL FIX - BUILD AND TEST
echo ============================================
echo.

echo [1/3] Building Vue components...
call npm run build
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Build failed!
    pause
    exit /b 1
)
echo ✓ Build complete
echo.

echo [2/3] Checking output files...
if exist "dist\admin-bundle.js" (
    echo ✓ Admin bundle generated
) else (
    echo ✗ Admin bundle missing
)

if exist "dist\frontend-bundle.js" (
    echo ✓ Frontend bundle generated
) else (
    echo ✗ Frontend bundle missing
)
echo.

echo [3/3] Next steps:
echo.
echo 1. Open WordPress admin
echo 2. Go to Media Kit Builder
echo 3. Add/Edit a Video Intro component
echo 4. Test pasting these URLs:
echo    - https://youtube.com/watch?v=dQw4w9WgXcQ
echo    - https://youtu.be/dQw4w9WgXcQ
echo    - https://vimeo.com/123456789
echo.
echo 5. Verify video appears in preview
echo 6. Save and view frontend
echo.

echo ============================================
echo BUILD COMPLETE - READY FOR TESTING
echo ============================================
pause
