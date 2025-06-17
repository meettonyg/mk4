@echo off
REM Git commit for component edit loss fix

cd /d "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

git add js/components/component-manager.js
git add js/components/component-renderer.js
git add DUPLICATE_COMPONENT_FIX.md
git add COMPONENT_EDIT_LOSS_FIX.md

git commit -m "Fix: Prevent content loss when moving components" -m "" -m "- Added saveActiveEditableContent() to save unsaved edits before actions" -m "- Made component control actions (move, duplicate, delete) async" -m "- Enhanced contenteditable tracking with focus/blur events" -m "- Ensures all edits are preserved during component manipulation" -m "" -m "Previously, clicking move arrows while editing would lose changes." -m "Now all edits are automatically saved before any action."

echo.
echo Commit completed successfully!
pause
