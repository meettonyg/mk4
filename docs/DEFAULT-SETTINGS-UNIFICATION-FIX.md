# Default Settings Unification Fix

## Issue
There were **three different sources** defining default CSS values, and they **didn't match**. This caused inconsistencies where:
- Components created via the store used one set of defaults
- The Style/Advanced panels showed different defaults
- Missing settings would fall back to incorrect values

## The Mismatch

### Before (Inconsistent):

| Setting | componentSchema.js (Official) | Panel Defaults | Match? |
|---------|------------------------------|----------------|--------|
| Margin Top/Bottom | 32px | 0px | ❌ NO |
| Padding Top/Bottom | 40px | 20px | ❌ NO |
| Border Radius | 8px | 0px | ❌ NO |
| Box Shadow | '0 2px 4px rgba(0,0,0,0.05)' | 'none' | ❌ NO |

### The Problem Flow:
1. **Component Creation** (via store) → Used `componentSchema.js` defaults
2. **Panel Display** → Used local `getDefaultSettings()` function  
3. **Missing Settings** → Panel showed wrong values

## The Fix

### What Changed:
Both `BaseStylePanel.vue` and `BaseAdvancedPanel.vue` now:
1. **Import** the centralized defaults from `componentSchema.js`
2. **Removed** their local `getDefaultSettings()` functions
3. **Use** the imported function as the single source of truth

### Code Changes:

#### Before (3 sources of truth):
```javascript
// componentSchema.js
export const DEFAULT_SETTINGS = { margin: 32px, ... }

// BaseStylePanel.vue
function getDefaultSettings() { return { margin: 0px, ... } }  // ❌ Different!

// BaseAdvancedPanel.vue  
function getDefaultSettings() { return { margin: 0px, ... } }  // ❌ Different!
```

#### After (1 source of truth):
```javascript
// componentSchema.js
export const DEFAULT_SETTINGS = { margin: 32px, ... }  // ✅ Single source

// BaseStylePanel.vue
import { getDefaultSettings } from '../../../../utils/componentSchema.js';  // ✅ Import

// BaseAdvancedPanel.vue
import { getDefaultSettings } from '../../../../utils/componentSchema.js';  // ✅ Import
```

## Files Modified

1. **BaseStylePanel.vue**
   - Added import: `import { getDefaultSettings } from '../../../../utils/componentSchema.js'`
   - Removed local `getDefaultSettings()` function (45 lines removed)
   - Updated `componentSettings` computed to use imported function

2. **BaseAdvancedPanel.vue**
   - Added import: `import { getDefaultSettings } from '../../../../utils/componentSchema.js'`
   - Removed local `getDefaultSettings()` function (38 lines removed)
   - Updated `componentSettings` computed to use imported function

## Benefits

✅ **Single Source of Truth** - All defaults come from `componentSchema.js`  
✅ **Consistency** - Components and panels show the same values  
✅ **Maintainability** - Update defaults in one place, not three  
✅ **Correctness** - Panels now display the actual default values  
✅ **Reduced Code** - Removed 83 lines of duplicate code

## The Official Defaults (from componentSchema.js)

```javascript
DEFAULT_SETTINGS = {
  style: {
    spacing: {
      margin: { top: 32, right: 0, bottom: 32, left: 0, unit: 'px' },
      padding: { top: 40, right: 20, bottom: 40, left: 20, unit: 'px' }
    },
    background: {
      color: '#ffffff',
      opacity: 100
    },
    typography: {
      fontFamily: 'system-ui, -apple-system, sans-serif',
      fontSize: { value: 16, unit: 'px' },
      fontWeight: '400',
      lineHeight: { value: 1.6, unit: 'unitless' },
      color: '#1e293b',
      textAlign: 'left'
    },
    border: {
      width: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
      color: '#e5e7eb',
      style: 'solid',
      radius: { topLeft: 8, topRight: 8, bottomRight: 8, bottomLeft: 8, unit: 'px' }
    },
    effects: {
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
      opacity: 100
    }
  },
  advanced: {
    layout: {
      width: { type: 'auto', value: 100, unit: '%' },
      alignment: 'left'
    },
    responsive: {
      hideOnMobile: false,
      hideOnTablet: false,
      hideOnDesktop: false
    },
    custom: {
      cssClasses: '',
      cssId: '',
      attributes: {}
    }
  }
}
```

## Testing

✅ New components get correct defaults  
✅ Panels display correct default values  
✅ Missing settings fall back to correct defaults  
✅ All three sources now point to the same values

## Architectural Improvement

This change enforces the **Single Source of Truth** principle:
- One canonical definition in `componentSchema.js`
- All other code imports and uses this definition
- Future default changes only need to be made in one place
- Eliminates risk of inconsistent defaults across the codebase
