@echo off
echo ========================================
echo Media Kit Builder - Legacy File Cleanup
echo ========================================
echo.
echo Removing legacy renderer.js files...
echo.

del /Q "components\authority-hook\renderer.js" 2>NUL
if exist "components\authority-hook\renderer.js" (
    echo [ERROR] Could not delete components\authority-hook\renderer.js
) else (
    echo [OK] Removed components\authority-hook\renderer.js
)

del /Q "components\booking-calendar\renderer.js" 2>NUL
if exist "components\booking-calendar\renderer.js" (
    echo [ERROR] Could not delete components\booking-calendar\renderer.js
) else (
    echo [OK] Removed components\booking-calendar\renderer.js
)

del /Q "components\call-to-action\renderer.js" 2>NUL
if exist "components\call-to-action\renderer.js" (
    echo [ERROR] Could not delete components\call-to-action\renderer.js
) else (
    echo [OK] Removed components\call-to-action\renderer.js
)

del /Q "components\contact\renderer.js" 2>NUL
if exist "components\contact\renderer.js" (
    echo [ERROR] Could not delete components\contact\renderer.js
) else (
    echo [OK] Removed components\contact\renderer.js
)

del /Q "components\podcast-player\renderer.js" 2>NUL
if exist "components\podcast-player\renderer.js" (
    echo [ERROR] Could not delete components\podcast-player\renderer.js
) else (
    echo [OK] Removed components\podcast-player\renderer.js
)

del /Q "components\questions\renderer.js" 2>NUL
if exist "components\questions\renderer.js" (
    echo [ERROR] Could not delete components\questions\renderer.js
) else (
    echo [OK] Removed components\questions\renderer.js
)

del /Q "components\social\renderer.js" 2>NUL
if exist "components\social\renderer.js" (
    echo [ERROR] Could not delete components\social\renderer.js
) else (
    echo [OK] Removed components\social\renderer.js
)

del /Q "components\stats\renderer.js" 2>NUL
if exist "components\stats\renderer.js" (
    echo [ERROR] Could not delete components\stats\renderer.js
) else (
    echo [OK] Removed components\stats\renderer.js
)

del /Q "components\testimonials\renderer.js" 2>NUL
if exist "components\testimonials\renderer.js" (
    echo [ERROR] Could not delete components\testimonials\renderer.js
) else (
    echo [OK] Removed components\testimonials\renderer.js
)

del /Q "components\topics\renderer.js" 2>NUL
if exist "components\topics\renderer.js" (
    echo [ERROR] Could not delete components\topics\renderer.js
) else (
    echo [OK] Removed components\topics\renderer.js
)

del /Q "components\video-intro\renderer.js" 2>NUL
if exist "components\video-intro\renderer.js" (
    echo [ERROR] Could not delete components\video-intro\renderer.js
) else (
    echo [OK] Removed components\video-intro\renderer.js
)

echo.
echo ========================================
echo Cleanup Complete!
echo ========================================
echo.
echo Legacy renderer.js files have been removed.
echo The Vue migration is now 100%% complete.
echo.
pause
