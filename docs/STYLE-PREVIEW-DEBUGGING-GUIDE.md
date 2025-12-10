# Component Style Preview Debugging Guide

## Quick Start - Debug in Browser Console

The ComponentStyleService has built-in debugging commands you can run in the browser console:

### 1. **Quick Bio Component Debug** (Recommended First Step)
```javascript
debugBioComponent()
```
This automatically finds your Biography component and runs a comprehensive debug.

### 2. **List All Components**
```javascript
debugComponentList()
```
Shows a table of all components, their types, and whether they have styles applied.

### 3. **Debug Specific Component**
```javascript
// Option A: Check store settings
debugComponentSettings('component-id')

// Option B: Check rendered DOM styles
debugComponentRendered('component-id')

// Option C: Compare both (recommended)
debugComponentCompare('component-id')
```

## Understanding the Output

### When you run `debugComponentCompare('component-id')`:

You'll see **3 main sections**:

#### 1. **Settings Debug** (What the Store Has)
- Shows the raw settings object from the Pinia store
- This is what the Style/Advanced panels should display
- This is what gets saved to the database

#### 2. **Rendered Styles** (What the DOM Shows)
- Shows the computed CSS styles from the browser
- This is what you actually see on screen
- Includes wrapper (margin) and component-root (everything else)

#### 3. **Injected CSS** (What the Service Applied)
- Shows the actual `<style>` tag content injected into `<head>`
- This is the generated CSS that should be styling the component

## Common Issues & Fixes

### Issue 1: Settings Updated But DOM Didn't Change

**Symptoms:**
- You change a value in the Style tab
- The value saves in the store
- But the preview doesn't update

**Debug Steps:**
```javascript
// 1. First check if settings are saving
debugComponentSettings('your-component-id')
// Look for the property you changed - is it updated?

// 2. Check if CSS was generated
debugComponentRendered('your-component-id')
// Scroll to "Injected CSS" section - is the CSS there?

// 3. Check if DOM element exists
document.querySelector('[data-component-id="your-component-id"] .component-root')
// Should return an element, not null
```

**Possible Causes:**
1. **Missing `.component-root` element** → Component not using V2 architecture
2. **CSS not generated** → Service didn't receive the update
3. **CSS generated but overridden** → Check for conflicting styles with higher specificity

### Issue 2: Typography Not Applying

**Symptoms:**
- Font changes don't appear in preview
- Text color doesn't change

**Debug:**
```javascript
debugComponentRendered('your-component-id')
// Check the Typography section in the output
```

**Possible Causes:**
1. **Missing `.component-root`** → Typography targets `.component-root` 
2. **Child elements overriding** → Typography doesn't cascade if children have their own styles
3. **Typography object format mismatch** → Check if fontSize has `.value` and `.unit` properties

**Fix:** Typography might need `!important` or component needs to use V2 architecture.

### Issue 3: Spacing (Margin/Padding) Not Working

**Symptoms:**
- Margin/padding values don't affect layout

**Debug:**
```javascript
debugComponentRendered('your-component-id')
// Check Margin (on wrapper) and Padding (on component-root)
```

**Architecture Note:**
- **Margin** → Applied to `[data-component-id="..."]` (wrapper)
- **Padding** → Applied to `[data-component-id="..."] .component-root`

**If margin shows 0px but you set 32px:**
```javascript
// Check if alignment is overriding margin
debugComponentSettings('your-component-id')
// Look at: settings.advanced.layout.alignment
// If alignment is 'center' or 'right', it overrides margin-left/right
```

### Issue 4: Border Radius Not Showing

**Symptoms:**
- Set border-radius to 8px but corners stay sharp

**Debug:**
```javascript
debugComponentRendered('your-component-id')
// Check Border section
```

**Common Cause:** Border radius only shows if there's:
1. A border (border-width > 0), OR
2. A background color different from parent, OR
3. A box shadow

**Quick Test:**
Set border width to 1px and see if radius appears.

### Issue 5: Background Color Not Applying

**Symptoms:**
- Background color set but not visible

**Debug:**
```javascript
debugComponentRendered('your-component-id')
// Check Background section
// Also check if opacity is at 100%
```

**Possible Causes:**
1. **Opacity set to 0** → Makes component invisible
2. **Background opacity < 100** → Makes color semi-transparent
3. **No `.component-root` element** → Background targets `.component-root`
4. **Child elements covering it** → Children have their own backgrounds

## Architecture Requirements

For styles to apply correctly, components **MUST** use the V2 architecture:

### Required HTML Structure:
```html
<div data-component-id="component-123">  <!-- Wrapper (margin) -->
  <div class="component-root">            <!-- Root (everything else) -->
    <!-- Component content here -->
  </div>
</div>
```

### Check if Component Uses V2:
```javascript
// Should return an element
document.querySelector('[data-component-id="your-id"] .component-root')

// If returns null, component needs migration to V2
```

## Manual Inspection Checklist

If debug commands don't reveal the issue:

### 1. **Check Store**
```javascript
window.gmkbStore.components['component-id'].settings
```

### 2. **Check Injected Style Tag**
```javascript
document.getElementById('component-styles-component-id')
```

### 3. **Check DOM Element**
```javascript
document.querySelector('[data-component-id="component-id"]')
```

### 4. **Check Computed Styles**
```javascript
window.getComputedStyle(
  document.querySelector('[data-component-id="component-id"] .component-root')
)
```

## Real-Time Monitoring

To watch styles update in real-time:

```javascript
// Watch specific component
const componentId = 'your-component-id';

// Monitor store changes
window.gmkbStore.$subscribe((mutation, state) => {
  const component = state.components[componentId];
  if (component) {
    console.log('Store updated:', component.settings);
  }
});

// Monitor DOM changes
const observer = new MutationObserver((mutations) => {
  console.log('DOM changed:', mutations);
});

const target = document.querySelector(`[data-component-id="${componentId}"]`);
if (target) {
  observer.observe(target, { 
    attributes: true, 
    attributeFilter: ['style', 'class'],
    subtree: true 
  });
}
```

## Settings Object Structure Reference

### Valid Settings Object:
```javascript
{
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
      fontFamily: 'system-ui',
      fontSize: { value: 16, unit: 'px' },  // NOTE: Object with value/unit
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

## Common Style Properties Not Working

If specific properties aren't applying:

### Typography fontSize/lineHeight Format
```javascript
// ❌ WRONG (won't work)
fontSize: 16
lineHeight: 1.6

// ✅ CORRECT
fontSize: { value: 16, unit: 'px' }
lineHeight: { value: 1.6, unit: 'unitless' }
```

### Border Radius Not Visible
```javascript
// Need BOTH radius AND either:
// 1. Border width > 0
// 2. Background color
// 3. Box shadow
```

### Alignment Overriding Margin
```javascript
// If alignment is 'center' or 'right':
// margin-left/right are auto, ignoring your margin values
```

## Getting Help

When reporting style preview issues, provide:

1. **Component ID**: `'component-123'`
2. **Debug output**: Run `debugComponentCompare('component-123')` and copy output
3. **Which property**: Specific setting that's not working
4. **Expected vs Actual**: What you set vs what you see
5. **Browser console errors**: Any red errors in console

## Pro Tip: Console Shortcuts

Add to browser console for quick access:

```javascript
// Quick aliases
window.d = debugComponentCompare;
window.dl = debugComponentList;
window.db = debugBioComponent;

// Now you can just type:
d('component-123')  // instead of debugComponentCompare('component-123')
dl()                // instead of debugComponentList()
db()                // instead of debugBioComponent()
```
