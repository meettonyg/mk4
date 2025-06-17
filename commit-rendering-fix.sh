#!/bin/bash
# Commit the media kit rendering fix

cd "C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4"

# Add the modified files
git add js/main.js
git add RENDERING_FIX_IMPLEMENTED.md

# Commit with descriptive message
git commit -m "Fix: Media kit components not rendering after page reload

- Added explicit render trigger after loading state from localStorage
- Fixed race condition where state was loaded before renderer was ready
- Ensures skipInitialRender flag is cleared before forcing render
- Added 50ms delay to ensure all systems are initialized
- Dispatches gmkb-state-changed event for other listeners

Issue: Saved media kits were showing blank page instead of components
Solution: Force component renderer to process state after localStorage load"

echo "Commit completed successfully!"
