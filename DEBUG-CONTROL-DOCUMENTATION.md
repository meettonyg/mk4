# Debug Control System Documentation

## Overview

The GMKB Debug Control System provides centralized control over debug logging to reduce console noise in production while maintaining the ability to debug specific areas when needed.

## Quick Start

### Enable/Disable Debug Globally

```javascript
// Enable all debug logging
GMKBDebug.enable();

// Disable all debug logging  
GMKBDebug.disable();

// Check current status
GMKBDebug.status();
```

### Control Specific Categories

```javascript
// Enable only hover events
GMKBDebug.enableCategory('hover');

// Disable noisy initialization messages
GMKBDebug.disableCategory('init');

// Enable multiple categories
GMKBDebug.enable(['render', 'state', 'controls']);
```

## Debug Categories

| Category | Default | Description |
|----------|---------|-------------|
| `hover` | OFF | Component hover events (very noisy) |
| `init` | OFF | Initialization success messages |
| `render` | ON | Render operations (important) |
| `state` | ON | State changes (important) |
| `controls` | ON | Control actions (important) |
| `component` | ON | Component operations (important) |
| `error` | ON | Errors (always shown) |
| `perf` | OFF | Performance metrics |
| `loader` | OFF | Template loader operations |
| `save` | ON | Save operations (important) |

## URL Parameters

Control debug settings via URL:

```
// Enable all debug
?debug=true

// Enable specific categories
?debug_categories=hover,init,perf
```

## Persistent Settings

Debug settings are saved to localStorage and persist across sessions:

```javascript
// Reset to defaults
GMKBDebug.reset();

// Settings are automatically saved when changed
GMKBDebug.enableCategory('hover'); // Saved to localStorage
```

## Usage in Code

### Basic Logging

```javascript
// Use category-specific logging
GMKBDebug.log('hover', '🎛️ Showing controls for:', componentId);
GMKBDebug.log('render', 'Processing state changes:', changes);
GMKBDebug.log('error', 'Component failed:', error);
```

### Convenience Methods

```javascript
GMKBDebug.logHover('Mouse entered component');
GMKBDebug.logInit('System initialized');
GMKBDebug.logRender('Rendering complete');
GMKBDebug.logState('State updated');
GMKBDebug.logError('Critical error occurred');
```

### Conditional Logging

```javascript
if (GMKBDebug.categories.hover) {
    // Expensive debug operation only runs if hover debug is enabled
    console.log(calculateExpensiveDebugInfo());
}
```

## Production Recommendations

For production deployment:

1. **Disable noisy categories** by default:
   - `hover` - Component hover events
   - `init` - Initialization messages
   - `perf` - Performance metrics
   - `loader` - Template loading

2. **Keep important categories** enabled:
   - `error` - Always show errors
   - `render` - Important for diagnosing visual issues
   - `state` - Critical for state management issues
   - `controls` - User interaction debugging
   - `save` - Data persistence issues

3. **Default production setup**:
   ```javascript
   // In production initialization
   if (!window.location.hostname.includes('localhost')) {
       GMKBDebug.reset(); // Use default settings
   }
   ```

## Debugging Workflow

1. **User reports issue**: Component moves don't work
2. **Enable specific debug**: `GMKBDebug.enableCategory('controls')`
3. **Reproduce issue**: Watch filtered console output
4. **Disable when done**: `GMKBDebug.disableCategory('controls')`

## Integration Examples

### Before (Noisy)
```javascript
console.log('🎛️ Showing controls for:', componentElement.id);
console.log('🎛️ Hiding controls for:', componentElement.id);
// Floods console with hover events
```

### After (Controlled)
```javascript
if (window.GMKBDebug && window.GMKBDebug.categories.hover) {
    console.log('🎛️ Showing controls for:', componentElement.id);
}
// Silent unless hover debug is explicitly enabled
```

## Console Commands

Quick debugging commands available in browser console:

```javascript
// Check what's enabled
GMKBDebug.status()

// Quick enable for debugging session
GMKBDebug.enable(['hover', 'render'])

// Reset everything
GMKBDebug.reset()
```

## Implementation Status

✅ **Completed**:
- Debug control system created (`debug-control.js`)
- Component hover logging wrapped
- Initialization messages controlled
- Main.js integrated with debug control
- URL parameter support
- localStorage persistence

🔄 **In Progress**:
- Wrapping remaining console.log statements
- Adding debug control to all modules

## Benefits

1. **Cleaner Console**: Production console only shows important messages
2. **Targeted Debugging**: Enable only what you need to debug
3. **Performance**: Expensive debug operations can be skipped entirely
4. **User-Friendly**: Users aren't overwhelmed by debug messages
5. **Developer-Friendly**: Full debug info available when needed
