@echo off
echo ==========================================
echo   ARCHITECTURE SEPARATION TOOL
echo   Separating Legacy from Vue/Vite
echo ==========================================
echo.

echo This tool will separate legacy JavaScript from the Vue/Vite system
echo to prevent conflicts and ensure clean architecture.
echo.

set /p confirm="Continue? (Y/N): "
if /i not "%confirm%"=="Y" (
    echo Cancelled.
    pause
    exit /b 0
)

echo.
echo [1/5] Creating backup...
if not exist "BACKUP" mkdir BACKUP
xcopy /E /I /Y js BACKUP\js-backup-%date:~-4,4%%date:~-10,2%%date:~-7,2% >nul 2>&1
echo Backup created in BACKUP folder
echo.

echo [2/5] Creating js-legacy directory for legacy files...
if not exist "js-legacy" (
    mkdir js-legacy
    echo Created js-legacy directory
) else (
    echo js-legacy directory already exists
)
echo.

echo [3/5] Moving legacy files to js-legacy...

REM Move all legacy JavaScript to js-legacy
if exist "js" (
    xcopy /E /I /Y js js-legacy >nul 2>&1
    echo Legacy files copied to js-legacy
    
    REM Remove legacy files from js directory
    echo Cleaning js directory...
    rd /S /Q js 2>nul
    mkdir js
    echo js directory cleaned
) else (
    echo No js directory found to move
)
echo.

echo [4/5] Creating clean js directory structure for shared utilities...
mkdir js\utils 2>nul
mkdir js\api 2>nul
mkdir js\shared 2>nul

REM Create a README in js directory
echo # JavaScript Directory > js\README.md
echo. >> js\README.md
echo This directory contains ONLY shared utilities that work with both architectures. >> js\README.md
echo. >> js\README.md
echo - `/utils` - Shared utility functions >> js\README.md
echo - `/api` - API integration (WordPress AJAX, REST) >> js\README.md
echo - `/shared` - Shared constants and helpers >> js\README.md
echo. >> js\README.md
echo **DO NOT** put architecture-specific code here! >> js\README.md
echo - Vue code goes in `/src` >> js\README.md
echo - Legacy code goes in `/js-legacy` >> js\README.md

echo Created clean js directory structure
echo.

echo [5/5] Creating architecture switcher...

REM Create switcher script
echo @echo off > switch-architecture.bat
echo echo ===================================== >> switch-architecture.bat
echo echo    GMKB ARCHITECTURE SWITCHER >> switch-architecture.bat
echo echo ===================================== >> switch-architecture.bat
echo echo. >> switch-architecture.bat
echo echo Current architecture can be changed in: >> switch-architecture.bat
echo echo includes/architecture-config.php >> switch-architecture.bat
echo echo. >> switch-architecture.bat
echo echo Options: >> switch-architecture.bat
echo echo   'vue'    - Vue 3 + Vite (RECOMMENDED) >> switch-architecture.bat
echo echo   'legacy' - Legacy JavaScript >> switch-architecture.bat
echo echo   'hybrid' - Both (DEBUGGING ONLY) >> switch-architecture.bat
echo echo. >> switch-architecture.bat
echo echo Edit architecture-config.php to switch. >> switch-architecture.bat
echo pause >> switch-architecture.bat

echo Architecture switcher created
echo.

echo ==========================================
echo          SEPARATION COMPLETE!
echo ==========================================
echo.
echo Directory structure:
echo   /src          - Vue 3 source files
echo   /dist         - Vue built bundle
echo   /js           - Shared utilities only
echo   /js-legacy    - Legacy JavaScript files
echo   /components   - Self-contained components
echo   /themes       - Self-contained themes
echo.
echo Next steps:
echo 1. Update includes/enqueue.php to include architecture-config.php
echo 2. Set GMKB_ARCHITECTURE_MODE in architecture-config.php
echo 3. Rebuild Vue bundle with: rebuild-lean-bundle.bat
echo.
pause