@echo off
cd /d "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

echo ========================================
echo PHASE 1: AGGRESSIVE CLEANUP - COMPLETE
echo ========================================
echo.

echo Step 1: Removing ARCHIVE directory...
if exist ARCHIVE (
    rmdir /S /Q ARCHIVE
    echo [DONE] ARCHIVE directory deleted
) else (
    echo [SKIP] ARCHIVE directory not found
)

echo.
echo Step 2: Removing debug directory...
if exist debug (
    rmdir /S /Q debug
    echo [DONE] debug directory deleted
) else (
    echo [SKIP] debug directory not found
)

echo.
echo Step 3: Removing test files...
del /Q test-*.* 2>nul
del /Q *test*.js 2>nul
del /Q *test*.php 2>nul
echo [DONE] Test files removed

echo.
echo Step 4: Removing documentation files (keeping only essential)...
del /Q *-COMPLETE.md 2>nul
del /Q *-FIX.md 2>nul
del /Q FIXES_*.md 2>nul
del /Q *-SUMMARY.md 2>nul
echo [DONE] Old documentation removed

echo.
echo Step 5: Removing build scripts (keeping only essential)...
del /Q cleanup*.sh 2>nul
del /Q move-*.bat 2>nul
del /Q move-*.sh 2>nul
del /Q rebuild-*.bat 2>nul
del /Q git-commit-*.txt 2>nul
del /Q commit_*.md 2>nul
echo [DONE] Old build scripts removed

echo.
echo Step 6: Removing temporary and backup files...
del /Q *.old 2>nul
del /Q *.backup 2>nul
del /Q *.deprecated 2>nul
del /Q *-backup.* 2>nul
del /Q delete-archive.bat 2>nul
del /Q phase1-cleanup.bat 2>nul
del /Q phase1-aggressive-cleanup.js 2>nul
echo [DONE] Temporary files removed

echo.
echo ========================================
echo CLEANUP COMPLETE!
echo ========================================
echo.
echo Files/Folders Removed:
echo - ARCHIVE directory (200+ old files)
echo - debug directory
echo - Test files (*test*.js, *test*.php)
echo - Old documentation (*-COMPLETE.md, *-FIX.md)
echo - Build scripts (cleanup*.sh, rebuild-*.bat)
echo - Temporary files (*.old, *.backup)
echo.
echo Next Steps:
echo 1. Review js/main.js and remove commented code
echo 2. Review includes/enqueue.php and remove commented code
echo 3. Commit changes: git add . && git commit -m "Phase 1: Aggressive cleanup complete"
echo 4. Proceed to Phase 2: State Management Enhancement
echo.
pause