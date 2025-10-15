@echo off
REM =====================================================
REM Production Deployment ZIP Creator
REM Creates a clean ZIP excluding files in .deployignore
REM =====================================================

echo Creating production-ready plugin ZIP...

REM Set variables
set PLUGIN_NAME=guestify-media-kit-builder
set TEMP_DIR=%TEMP%\%PLUGIN_NAME%-production
set ZIP_FILE=%PLUGIN_NAME%-production.zip

REM Clean up any existing temp directory
if exist "%TEMP_DIR%" rmdir /S /Q "%TEMP_DIR%"

REM Create temp directory
mkdir "%TEMP_DIR%"
mkdir "%TEMP_DIR%\%PLUGIN_NAME%"

echo Copying essential files only...

REM Copy essential directories
xcopy /E /I /Q admin "%TEMP_DIR%\%PLUGIN_NAME%\admin" /EXCLUDE:.deployignore
xcopy /E /I /Q components "%TEMP_DIR%\%PLUGIN_NAME%\components"
xcopy /E /I /Q design-system "%TEMP_DIR%\%PLUGIN_NAME%\design-system"
xcopy /E /I /Q dist "%TEMP_DIR%\%PLUGIN_NAME%\dist"
xcopy /E /I /Q includes "%TEMP_DIR%\%PLUGIN_NAME%\includes"
xcopy /E /I /Q system "%TEMP_DIR%\%PLUGIN_NAME%\system"
xcopy /E /I /Q templates "%TEMP_DIR%\%PLUGIN_NAME%\templates"
xcopy /E /I /Q themes "%TEMP_DIR%\%PLUGIN_NAME%\themes"

REM Copy essential files
copy guestify-media-kit-builder.php "%TEMP_DIR%\%PLUGIN_NAME%\"
copy README.md "%TEMP_DIR%\%PLUGIN_NAME%\" 2>nul

echo Creating ZIP file...

REM Create ZIP using PowerShell
powershell -Command "Compress-Archive -Path '%TEMP_DIR%\%PLUGIN_NAME%' -DestinationPath '.\%ZIP_FILE%' -Force"

REM Clean up temp directory
rmdir /S /Q "%TEMP_DIR%"

echo.
echo ✅ Production ZIP created: %ZIP_FILE%
echo.
echo File contains only essential files for production.
echo Upload this ZIP via WordPress admin or extract to plugins directory.
echo.
pause