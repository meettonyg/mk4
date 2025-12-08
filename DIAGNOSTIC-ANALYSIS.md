# COMPONENT CONTROLS VISIBILITY ISSUE - DIAGNOSTIC ANALYSIS

## OBSERVATION: Section Controls Work, Component Controls Don't

**Date**: November 10, 2025

### Current State
- ✅ **Section controls**: Visible and functional
- ❌ **Component controls**: Present in DOM but NOT visible

### Critical Differences Found

#### 1. Z-Index Hierarchy
**Section Header**:
```css
.gmkb-section__header {
  z-index: 100;  /* Works fine */
}
```

**Component Controls**:
```css
.component-controls {
  z-index: 1000;  /* Higher but still not visible */
}
```

**Analysis**: Z-index is NOT the issue since section controls work at z-index: 100

---

#### 2. Positioning Context
**Section Header**:
- Parent: `.gmkb-section` with `position: relative` ✅
- Positioned: `top: -40px`
- Space allocated: `padding-top: 50px` on `.gmkb-sections-container` ✅

**Component Controls**:
- Parent: `.component-wrapper` with `position: relative` ✅  
- Positioned: `top: -35px`
- Space allocated: `padding-top: 50px` on `.gmkb-sections-container` ✅

**Analysis**: Both have proper positioning context

---

#### 3. Visibility Triggers
**Section Header**:
```css
.gmkb-section__header {
  opacity: 0;
  visibility: hidden;
}

.gmkb-section:hover .gmkb-section__header {
  opacity: 1;
  visibility: visible;
}
```
✅ Controlled by hover on `.gmkb-section`

**Component Controls**:
```vue
<ComponentControls
  v-if="showControlsComputed && actualComponent"
  ...
/>
```
```javascript
const showControlsComputed = computed(() => {
  return props.showControls && (isHovered.value || isSelected.value);
})
```
❌ Controlled by Vue reactivity + hover state

**CRITICAL FINDING**: Component controls use `v-if` which completely removes them from DOM when false. Section controls use CSS `opacity: 0` which keeps them in DOM.

---

#### 4. HTML Evidence from Provided Snippet

**Biography Component** (hovering):
```html
<div class="component-wrapper component-wrapper--hovering">
  <div class="component-controls">
    <!-- Controls are IN DOM -->
  </div>
</div>
```
- Has `component-wrapper--hovering` class ✅
- Controls ARE in DOM ✅
- **But NOT visible** ❌

**Logo Grid Component** (not hovering):
```html
<div class="component-wrapper component-wrapper--logo-grid">
  <!---->  <!-- Empty comment, no controls -->
</div>
```
- No hovering class
- Controls NOT in DOM (v-if=false)

---

## ROOT CAUSE HYPOTHESIS

The component controls ARE being rendered (as evidenced by Biography component HTML), but they are **invisible due to CSS**.

### Possible Causes (in order of likelihood):

### 1. **CSS Scoping Issue** ⭐⭐⭐⭐⭐
ComponentControls.vue uses `<style scoped>` which may be creating CSS specificity issues.

**Problem**: Scoped styles get a unique attribute (e.g., `data-v-5a02dc0a`) which may not match parent containers, causing styles to not apply correctly.

**Evidence**: In the HTML, component-controls has `data-v-5a02dc0a` attribute.

**Fix Recommendation**:
```vue
<!-- BEFORE -->
<style scoped>
.component-controls { ... }
</style>

<!-- AFTER -->
<style>
/* Make it global, use more specific selectors */
.component-wrapper .component-controls { ... }
</style>
```

---

### 2. **Parent Container CSS Interference** ⭐⭐⭐⭐
The `.component-wrapper` or its children might have CSS that's hiding the controls.

**Check These**:
- `.gmkb-component` class on component content
- `.component-root` overflow/transform
- Any global CSS affecting `.component-controls`

**Fix Recommendation**: Add more aggressive !important rules to component controls

---

### 3. **Transform/Translate Issue** ⭐⭐⭐
Component content might have transform that creates a new stacking context.

**Check**: Any transform properties on Biography/Logo Grid components

**Fix Recommendation**: Force `transform: none !important` on control bar

---

### 4. **Color/Background Issue** ⭐⭐
Controls might be rendering but invisible due to white-on-white or transparent background.

**Evidence**: Controls have `background: white` which should be visible against dark interface.

**Fix Recommendation**: Add bright contrasting background color for debugging

---

### 5. **Viewport/Clip Issue** ⭐
First component's controls at `top: -35px` might be clipped by browser viewport or a parent container.

**Evidence**: We added `padding-top: 50px` which should fix this.

**Fix Recommendation**: Check if there's a parent with `overflow: hidden` or `clip-path`

---

## RECOMMENDED DIAGNOSTIC STEPS

### Step 1: Remove Scoped Styles
**File**: `ComponentControls.vue`

**Change**:
```vue
<style>  <!-- Remove 'scoped' -->
.component-wrapper .component-controls {
  position: absolute;
  top: -35px;
  left: 0;
  right: 0;
  z-index: 1000;
  pointer-events: none;
}

.component-wrapper .component-controls__bar {
  background: #ff00ff !important; /* Bright magenta for debugging */
  border: 3px solid #00ff00 !important; /* Bright green border */
  /* ... rest of styles with !important */
}
</style>
```

**Why**: This will eliminate CSS scoping as a variable

---

### Step 2: Add Debug Background Color
Make the controls bar BRIGHT and impossible to miss.

**Temporary Debug Styles**:
```css
.component-controls__bar {
  background: #ff00ff !important; /* Bright magenta */
  border: 5px solid #00ff00 !important; /* Bright green */
  padding: 20px !important; /* Make it bigger */
  min-height: 60px !important;
}
```

---

### Step 3: Check for Transform/Filter Inheritance
Add this to force clean rendering:

```css
.component-controls {
  transform: none !important;
  filter: none !important;
  perspective: none !important;
  will-change: auto !important;
}
```

---

### Step 4: Force Render Above Everything
```css
.component-controls {
  position: fixed !important; /* Escape all parent contexts */
  top: 100px !important; /* Visible position for testing */
  left: 50% !important;
  transform: translateX(-50%) !important;
  z-index: 999999 !important;
}
```

**Why**: If this makes controls visible, we know it's a parent container issue

---

### Step 5: Browser DevTools Inspection

Run this in browser console when hovering Biography component:
```javascript
const ctrl = document.querySelector('.component-controls__bar');
if (ctrl) {
  const computed = window.getComputedStyle(ctrl);
  console.log('Component Controls Computed Styles:', {
    display: computed.display,
    visibility: computed.visibility,
    opacity: computed.opacity,
    zIndex: computed.zIndex,
    position: computed.position,
    top: computed.top,
    left: computed.left,
    right: computed.right,
    background: computed.background,
    transform: computed.transform,
    clipPath: computed.clipPath,
    width: computed.width,
    height: computed.height
  });
  
  // Check bounding rect
  const rect = ctrl.getBoundingClientRect();
  console.log('Bounding Rect:', rect);
  
  // Highlight element
  ctrl.style.outline = '10px solid red';
} else {
  console.log('Controls bar not found in DOM');
}
```

---

## RECOMMENDED FIX (Without Editing Yet)

**Primary Hypothesis**: CSS scoped styles issue

**Recommended Changes**:
1. Remove `scoped` from `<style>` in ComponentControls.vue
2. Use more specific selectors: `.component-wrapper .component-controls`  
3. Add debug bright colors temporarily
4. Force all visibility with !important

**Would you like me to implement these changes?**

**Alternative Approach**: If scoping isn't the issue, we may need to check:
- Global CSS files that might be affecting controls
- Theme CSS that might be overriding styles
- WordPress admin bar or other overlays blocking controls
- Browser extensions interfering with display

---

## QUESTIONS TO ANSWER

1. **Can you inspect the Biography component controls in DevTools?**
   - Right-click Biography component → Inspect
   - Find `.component-controls__bar` element
   - Check computed styles for display/visibility/opacity
   - Check bounding box (should show position/size)

2. **Are the controls appearing at all, even partially?**
   - Try zooming out browser (Ctrl + Scroll)
   - Try scrolling up to see if they're above viewport

3. **Do you see ANY visual artifacts where controls should be?**
   - Outline/border/shadow/glow?
   - Space above component?

4. **Can you run the browser console debug script above?**
   - This will give us exact computed CSS values

---

## NEXT STEPS

**DO NOT EDIT YET - Awaiting Your Approval for**:

1. Remove scoped styles from ComponentControls.vue
2. Add bright debug colors (magenta background, green border)
3. Add aggressive !important overrides
4. Test browser console diagnostic script

Please confirm which approach you'd like to take, or provide DevTools inspection results for more targeted fix.
