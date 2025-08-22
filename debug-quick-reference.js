/**
 * GMKB Debug Control - Quick Reference
 * ====================================
 * 
 * BROWSER CONSOLE COMMANDS:
 * ------------------------
 * GMKBDebug.enable()                    - Enable all debug logging
 * GMKBDebug.disable()                   - Disable all debug logging
 * GMKBDebug.status()                    - Show current settings
 * GMKBDebug.reset()                     - Reset to defaults
 * 
 * GMKBDebug.enableCategory('hover')     - Enable specific category
 * GMKBDebug.disableCategory('init')     - Disable specific category
 * 
 * URL PARAMETERS:
 * --------------
 * ?debug=true                           - Enable all debug
 * ?debug_categories=hover,render        - Enable specific categories
 * 
 * CATEGORIES:
 * -----------
 * hover     - Component hover events (OFF by default) 
 * init      - Initialization messages (OFF by default)
 * render    - Render operations (ON by default)
 * state     - State changes (ON by default)
 * controls  - Control actions (ON by default)
 * component - Component operations (ON by default)
 * error     - Errors (always ON)
 * perf      - Performance metrics (OFF by default)
 * loader    - Template loading (OFF by default)
 * save      - Save operations (ON by default)
 * 
 * IN YOUR CODE:
 * ------------
 * // Basic usage
 * if (window.GMKBDebug) {
 *     window.GMKBDebug.log('category', 'Your message here');
 * }
 * 
 * // Category check
 * if (window.GMKBDebug && window.GMKBDebug.categories.hover) {
 *     console.log('Detailed hover info');
 * }
 * 
 * // Convenience methods
 * GMKBDebug.logHover('Hover event');
 * GMKBDebug.logInit('Initialized');
 * GMKBDebug.logRender('Rendered');
 * GMKBDebug.logState('State changed');
 * GMKBDebug.logError('Error occurred');
 */

// Make this available as a console helper
window.GMKBDebugHelp = function() {
    console.log(`
🐛 GMKB Debug Control - Quick Reference
======================================

ENABLE/DISABLE:
  GMKBDebug.enable()         - Enable all
  GMKBDebug.disable()        - Disable all
  GMKBDebug.status()         - Show settings
  GMKBDebug.reset()          - Reset defaults

CATEGORIES:
  GMKBDebug.enableCategory('hover')    - Enable one
  GMKBDebug.disableCategory('init')    - Disable one

AVAILABLE CATEGORIES:
  hover     - Mouse hover events (OFF)
  init      - Initialization (OFF)
  render    - Rendering (ON)
  state     - State changes (ON)
  controls  - Button clicks (ON)
  error     - Errors (ON)
  save      - Save operations (ON)

URL PARAMS:
  ?debug=true
  ?debug_categories=hover,render

Type GMKBDebug.status() to see current settings
`);
};

console.log('💡 Type GMKBDebugHelp() for debug control reference');
