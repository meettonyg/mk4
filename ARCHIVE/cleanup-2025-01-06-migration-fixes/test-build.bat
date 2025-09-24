@echo off
echo Testing build...
call npm run build
if %errorlevel% neq 0 (
    echo Build failed with errors
    exit /b %errorlevel%
) else (
    echo Build successful!
)