@echo off
echo ========================================
echo  Phase 1: Component Migration Audit
echo ========================================
echo.

cd /d "%~dp0.."

echo Checking Node.js installation...
node --version
if errorlevel 1 (
    echo ERROR: Node.js is not installed or not in PATH
    echo Please install Node.js from https://nodejs.org
    pause
    exit /b 1
)

echo.
echo Running component audit...
echo.

node scripts\phase1-audit.js

echo.
echo ========================================
echo  Audit Complete!
echo ========================================
echo.
echo Generated files:
echo   - docs\COMPONENT-INVENTORY.md
echo   - docs\component-inventory.json
echo.
echo Please review the reports and make Go/No-Go decision.
echo.
pause
