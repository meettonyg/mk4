# Rebuild the Lean Bundle - NOW WITH DEBUGGING

You need to rebuild the bundle to include the debugging that will help us understand why the toolbar buttons aren't working.

## Steps:

1. **Run the rebuild script**:
   ```
   REBUILD-LEAN-BUNDLE.bat
   ```

2. **Upload to host**:
   - `dist/gmkb.iife.js` (the rebuilt bundle with debug logging)

3. **Refresh browser and check console**

You should see messages like:
- "Setting up UI handlers..."
- "Toolbar found, attaching handlers..." (or "Toolbar not found, retrying...")
- "✓ Theme button handler attached" (or warnings if buttons not found)
- etc.

This will tell us exactly what's happening with the toolbar button initialization.

## What Changed in Source:
- Added console logging to track initialization
- Fixed device preview button selector (`.toolbar__preview-btn` instead of `[data-device]`)
- Added debug messages for each button attachment

The rebuild is necessary to include these diagnostic messages that will reveal the root cause.
