#!/bin/bash
# Git commit for component controls and library fixes

cd "C:/Users/seoge/OneDrive/Desktop/CODE-Guestify/MEDIAKIT/PLUGIN/mk4"

# Add the changes
git add src/core/Renderer.js
git add src/main.js
git add css/component-controls.css
git add css/component-library.css
git add includes/enqueue.php

# Commit with descriptive message
git commit -m "Fix component controls and library modal

ROOT CAUSE FIXES:
1. Component Controls Professional Styling
   - Replaced emoji controls with SVG icons
   - Added hover states and transitions
   - Created component-controls.css

2. Component Library Modal Fixed
   - Now properly loads components from multiple sources
   - Falls back to default list when gmkbData is empty
   - Added icons for each component type
   - Grid layout with professional styling

3. Updated Files:
   - src/core/Renderer.js: SVG icons instead of emojis
   - src/main.js: Enhanced renderComponentLibrary function
   - css/component-controls.css: Professional control styling
   - css/component-library.css: Modal grid layout styling
   - includes/enqueue.php: Load new CSS files

RESOLVED ISSUES:
- Component controls now use professional SVG icons
- Component library modal properly displays all available components
- Improved visual consistency with sections
- Better user experience with hover states and transitions"

echo "Changes committed successfully!"
