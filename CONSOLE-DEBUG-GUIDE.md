# CONSOLE DEBUGGING GUIDE - Component Controls

Run these commands ONE AT A TIME in your browser console while hovering over a component.

## Step 1: Check if hover detection works

```javascript
// Run this, then hover over Biography component
document.addEventListener('mouseenter', (e) => {
  if (e.target.closest('.component-wrapper')) {
    console.log('✅ Mouse entered component wrapper');
    console.log('Classes:', e.target.closest('.component-wrapper').className);
  }
}, true);
```

Expected: Should log when you hover over component

---

## Step 2: Check Vue component state

```javascript
// Hover over Biography, then run this
const wrapper = document.querySelector('.component-wrapper--biography');
if (wrapper) {
  console.log('Found wrapper:', wrapper);
  console.log('Has hovering class?', wrapper.classList.contains('component-wrapper--hovering'));
  
  // Check for controls in DOM
  const controls = wrapper.querySelector('.component-controls');
  console.log('Controls in DOM?', !!controls);
  
  if (controls) {
    console.log('Controls element:', controls);
    console.log('Controls display:', window.getComputedStyle(controls).display);
    console.log('Controls position:', window.getComputedStyle(controls).position);
  }
}
```

Expected: Should show if controls exist and their styles

---

## Step 3: Check showControlsComputed logic

```javascript
// Find the Vue component instance
const wrapper = document.querySelector('.component-wrapper--biography');
if (wrapper && wrapper.__vueParentComponent) {
  const vueInstance = wrapper.__vueParentComponent;
  console.log('Vue instance:', vueInstance);
  console.log('Props:', vueInstance.props);
  console.log('Show controls prop:', vueInstance.props.showControls);
}
```

Expected: Should show Vue component data

---

## Step 4: Force render controls (bypass Vue logic)

```javascript
// Manually inject controls HTML to test CSS
const wrapper = document.querySelector('.component-wrapper--biography');
if (wrapper) {
  const testControls = document.createElement('div');
  testControls.className = 'component-controls';
  testControls.style.cssText = `
    position: absolute;
    top: -35px;
    left: 0;
    right: 0;
    z-index: 9999;
    background: red;
    padding: 20px;
    border: 5px solid yellow;
  `;
  testControls.innerHTML = '<div style="color: white; font-size: 20px; font-weight: bold;">TEST CONTROLS</div>';
  
  wrapper.insertBefore(testControls, wrapper.firstChild);
  console.log('✅ Test controls injected');
  console.log('Can you see RED bar with yellow border above component?');
}
```

Expected: Should show bright red bar above component

---

## Step 5: Check actual computed position of controls

```javascript
// Hover Biography, then run
const wrapper = document.querySelector('.component-wrapper--hovering');
if (wrapper) {
  const controls = wrapper.querySelector('.component-controls');
  if (controls) {
    const rect = controls.getBoundingClientRect();
    const computed = window.getComputedStyle(controls);
    
    console.log('Controls Bounding Box:', {
      top: rect.top,
      left: rect.left,
      width: rect.width,
      height: rect.height,
      bottom: rect.bottom,
      right: rect.right
    });
    
    console.log('Controls Computed Styles:', {
      position: computed.position,
      top: computed.top,
      left: computed.left,
      right: computed.right,
      zIndex: computed.zIndex,
      display: computed.display,
      visibility: computed.visibility,
      opacity: computed.opacity
    });
    
    console.log('Is control visible on screen?', 
      rect.top >= 0 && 
      rect.left >= 0 && 
      rect.bottom <= window.innerHeight && 
      rect.right <= window.innerWidth
    );
  } else {
    console.log('❌ No controls found in DOM');
  }
} else {
  console.log('❌ No hovered wrapper found - hover over Biography first!');
}
```

Expected: Should show exact position and whether visible

---

## Step 6: Check v-if condition

```javascript
// Check why v-if might be false
const wrapper = document.querySelector('.component-wrapper--biography');
if (wrapper) {
  console.log('Wrapper classes:', wrapper.className);
  console.log('Has --hovering?', wrapper.classList.contains('component-wrapper--hovering'));
  console.log('Has --selected?', wrapper.classList.contains('component-wrapper--selected'));
  
  // Check data attributes
  console.log('Component ID:', wrapper.getAttribute('data-component-id'));
  console.log('Draggable:', wrapper.getAttribute('data-draggable'));
}
```

Expected: Should show state that controls v-if

---

## Step 7: Check parent overflow chain (Again after build)

```javascript
const wrapper = document.querySelector('.component-wrapper--biography');
if (wrapper) {
  console.log('🔍 Checking overflow on parents:');
  let current = wrapper;
  let depth = 0;
  
  while (current && depth < 15) {
    const computed = window.getComputedStyle(current);
    const tagName = current.tagName.toLowerCase();
    const classes = current.className || 'no-class';
    
    console.log(`${depth}: ${tagName}.${classes}`, {
      overflow: computed.overflow,
      overflowX: computed.overflowX,
      overflowY: computed.overflowY,
      position: computed.position,
      zIndex: computed.zIndex
    });
    
    current = current.parentElement;
    depth++;
  }
}
```

Expected: Should show if any parent still has overflow issue

---

## Step 8: Nuclear test - Inject controls with !important everywhere

```javascript
const wrapper = document.querySelector('.component-wrapper--biography');
if (wrapper) {
  const nuclear = document.createElement('div');
  nuclear.innerHTML = `
    <div style="
      position: absolute !important;
      top: -50px !important;
      left: 0 !important;
      right: 0 !important;
      z-index: 999999 !important;
      background: #ff00ff !important;
      border: 10px solid #00ff00 !important;
      padding: 30px !important;
      font-size: 24px !important;
      font-weight: bold !important;
      color: white !important;
      text-align: center !important;
      display: block !important;
      visibility: visible !important;
      opacity: 1 !important;
    ">
      NUCLEAR TEST - CAN YOU SEE THIS?
    </div>
  `;
  
  wrapper.insertBefore(nuclear.firstElementChild, wrapper.firstChild);
  console.log('✅ Nuclear test injected');
  console.log('If you CANNOT see bright magenta bar, the problem is NOT CSS');
}
```

Expected: IMPOSSIBLE to miss if CSS is working

---

## INSTRUCTIONS:

1. **Open browser DevTools** (F12)
2. **Go to Console tab**
3. **Run Step 1** - hover over Biography component
4. **Run Step 2** - check if controls exist
5. **Run Step 4** - inject red test controls
6. **Tell me what you see** after each step

**Which step should we start with?**

Or paste results from any/all steps and I'll diagnose!
