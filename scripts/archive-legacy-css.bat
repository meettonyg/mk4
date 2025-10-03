@echo off
REM Archive Legacy CSS Files
REM Run from plugin root directory

SET TIMESTAMP=%date:~10,4%-%date:~4,2%-%date:~7,2%-%time:~0,2%-%time:~3,2%-%time:~6,2%
SET TIMESTAMP=%TIMESTAMP: =0%
SET ARCHIVE_DIR=ARCHIVE\legacy-css-%TIMESTAMP%

echo.
echo ========================================
echo Archive Legacy CSS Files
echo ========================================
echo.

REM Create archive directory
echo Creating archive directory: %ARCHIVE_DIR%
mkdir "%ARCHIVE_DIR%" 2>nul

REM Archive old CSS files
echo.
echo Archiving legacy CSS files...
echo.

if exist "css\frontend-mediakit.css" (
    echo   - css\frontend-mediakit.css
    move "css\frontend-mediakit.css" "%ARCHIVE_DIR%\" >nul
)

if exist "css\modules\components.css" (
    echo   - css\modules\components.css
    move "css\modules\components.css" "%ARCHIVE_DIR%\" >nul
)

REM Create README
echo.
echo Creating archive README...
(
echo # Legacy CSS Files - Archived
echo.
echo These files were replaced by the design system on %date% at %time%
echo.
echo ## Replaced By
echo - `frontend-mediakit.css` → `design-system/index.css`
echo - `modules/components.css` → `design-system/components.css`
echo.
echo ## Why Archived
echo 1. Duplicate styles caused conflicts
echo 2. Different class names than Vue builder
echo 3. Not using design tokens ^(CSS variables^)
echo 4. Hard to maintain two CSS systems
echo.
echo ## Design System Benefits
echo - Single source of truth
echo - Consistent class names
echo - Uses CSS variables for theming
echo - Shared by Vue builder and PHP frontend
echo.
echo ## Can This Be Restored?
echo Yes, but DON'T. The design system is better in every way.
echo If you need specific styles from these files, extract them and
echo add to design-system/components.css using design tokens.
echo.
echo ## Archived Files
) > "%ARCHIVE_DIR%\README.md"

REM List archived files
if exist "%ARCHIVE_DIR%\frontend-mediakit.css" (
    echo   - frontend-mediakit.css >> "%ARCHIVE_DIR%\README.md"
)
if exist "%ARCHIVE_DIR%\components.css" (
    echo   - components.css >> "%ARCHIVE_DIR%\README.md"
)

echo.
echo ========================================
echo Archive Complete!
echo ========================================
echo.
echo Location: %ARCHIVE_DIR%
echo.

REM List what was archived
if exist "%ARCHIVE_DIR%\frontend-mediakit.css" (
    echo Files archived:
    dir /B "%ARCHIVE_DIR%"
    echo.
)

echo.
echo ⚠️  IMPORTANT: Clear all caches after this:
echo    - WordPress cache
echo    - Browser cache ^(Ctrl+Shift+R^)
echo    - CDN cache ^(if any^)
echo.
echo Press any key to continue...
pause >nul
