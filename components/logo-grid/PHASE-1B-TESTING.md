# Phase 1B Testing Guide: Layout Options

## Quick Browser Console Tests

### 1. Test Layout Selector Presence
```javascript
// Check if layout selector exists
const layoutSelect = document.querySelector('#layout-style');
console.log('Layout selector found:', !!layoutSelect);
console.log('Current layout:', layoutSelect?.value);

// Should show: true, "grid"
```

### 2. Test Layout Change to Carousel
```javascript
// Change to carousel
const layoutSelect = document.querySelector('#layout-style');
layoutSelect.value = 'carousel';
layoutSelect.dispatchEvent(new Event('change'));

// Check if carousel settings panel appears
setTimeout(() => {
  const carouselSettings = document.querySelector('.carousel-settings');
  console.log('Carousel settings visible:', !!carouselSettings);
  console.log('Columns dropdown hidden:', !document.querySelector('#columns'));
}, 100);

// Should show: true, true
```

### 3. Test Conditional UI
```javascript
// Test Grid mode
document.querySelector('#layout-style').value = 'grid';
document.querySelector('#layout-style').dispatchEvent(new Event('change'));

setTimeout(() => {
  console.log('Grid mode checks:');
  console.log('  Columns dropdown visible:', !!document.querySelector('#columns'));
  console.log('  Carousel settings hidden:', !document.querySelector('.carousel-settings'));
}, 100);

// Should show: true, true
```

### 4. Test Autoplay Conditional
```javascript
// Uncheck autoplay
const autoplayCheckbox = document.querySelector('.carousel-settings input[type="checkbox"]');
autoplayCheckbox.checked = false;
autoplayCheckbox.dispatchEvent(new Event('change'));

setTimeout(() => {
  const speedInput = document.querySelector('#autoplay-speed');
  console.log('Autoplay speed hidden when disabled:', !speedInput);
}, 100);

// Should show: true
```

### 5. Test Data Persistence
```javascript
// Get current component data
const store = window.__VUE_APP__?.config?.globalProperties?.$store;
const componentId = 'your-logo-grid-component-id'; // Replace with actual ID

// Log saved data
console.log('Saved layout:', store?.state?.components?.[componentId]?.data?.layoutStyle);
console.log('Saved carousel settings:', store?.state?.components?.[componentId]?.data?.carouselSettings);

// If grid/masonry, carouselSettings should be undefined
```

---

## Visual Checks

### Layout Selector
- ✅ Dropdown with 3 options: Grid, Masonry, Carousel
- ✅ Default selected: "Standard Grid"
- ✅ Field hint: "Choose how your logos are displayed"

### Grid Mode (Default)
When "Standard Grid" selected:
- ✅ "Grid Columns" dropdown visible
- ✅ Options: Auto, 3, 4, 6 columns
- ✅ "Carousel Settings" panel NOT visible

### Masonry Mode
When "Masonry (Pinterest Style)" selected:
- ✅ "Grid Columns" dropdown visible
- ✅ Same column options as grid
- ✅ "Carousel Settings" panel NOT visible

### Carousel Mode
When "Carousel/Slider" selected:
- ✅ "Grid Columns" dropdown NOT visible
- ✅ "Carousel Settings" panel visible with blue background
- ✅ Panel contains:
  - ☑ Autoplay checkbox
  - # Autoplay Speed input (if autoplay checked)
  - # Slides to Show (Desktop) 1-8
  - # Slides to Show (Tablet) 1-6
  - # Slides to Show (Mobile) 1-3
  - ☑ Show Navigation Arrows checkbox
  - ☑ Show Pagination Dots checkbox

---

## Interaction Tests

### 1. Layout Switching
**Test sequence:**
1. Start with Grid selected
2. Change to Carousel
   - Carousel settings panel should slide in
   - Columns dropdown should disappear
3. Change to Masonry
   - Carousel settings panel should disappear
   - Columns dropdown should reappear
4. Change back to Grid
   - Should maintain previous column selection

**Expected:** Smooth transitions, no errors

### 2. Autoplay Toggle
**Test sequence:**
1. Select Carousel layout
2. Autoplay should be checked by default
3. "Autoplay Speed" input should be visible (default: 3000)
4. Uncheck autoplay
5. "Autoplay Speed" input should disappear
6. Check autoplay again
7. "Autoplay Speed" input should reappear with preserved value

**Expected:** Conditional visibility, no layout shift

### 3. Slide Number Validation
**Test each input:**
- Desktop slides: Try 0, 4, 9
  - ✅ 0 rejected (min: 1)
  - ✅ 4 accepted
  - ✅ 9 rejected (max: 8)
  
- Tablet slides: Try 0, 3, 7
  - ✅ 0 rejected (min: 1)
  - ✅ 3 accepted
  - ✅ 7 rejected (max: 6)
  
- Mobile slides: Try 0, 2, 4
  - ✅ 0 rejected (min: 1)
  - ✅ 2 accepted
  - ✅ 4 rejected (max: 3)

### 4. Autoplay Speed Validation
**Test input:**
- Try 500 → rejected (min: 1000)
- Try 3000 → accepted
- Try 11000 → rejected (max: 10000)
- Try 2500 → accepted (step: 500)
- Try 2450 → rounded to nearest 500

---

## Dark Mode Tests

Toggle dark mode and verify carousel settings panel:

### Colors
- ✅ Background: Dark blue (#0c4a6e)
- ✅ Border: Medium blue (#0369a1)
- ✅ Subsection title: Light blue (#7dd3fc)
- ✅ Input backgrounds: Very dark (#0f172a)
- ✅ Input borders: Dark gray (#334155)
- ✅ Text: Light gray (#f3f4f6)

### Hover States
- ✅ Checkboxes change color on hover
- ✅ Inputs get pink focus ring
- ✅ No broken contrast

---

## Data Persistence Tests

### Test 1: Grid Mode Save
```javascript
// Steps:
1. Select "Standard Grid"
2. Choose "4 Columns"
3. Save component
4. Reload page
5. Check layout selector → Should be "Standard Grid"
6. Check columns selector → Should be "4 Columns"
7. Check saved data → carouselSettings should be UNDEFINED
```

### Test 2: Carousel Mode Save
```javascript
// Steps:
1. Select "Carousel/Slider"
2. Set autoplay: true
3. Set autoplay speed: 5000
4. Set desktop slides: 6
5. Set arrows: false
6. Save component
7. Reload page
8. Check layout selector → Should be "Carousel/Slider"
9. Check carousel settings → All values preserved
10. Check saved data → carouselSettings should exist
```

### Test 3: Switch and Save
```javascript
// Steps:
1. Select "Carousel/Slider"
2. Configure carousel settings
3. Save component
4. Select "Standard Grid"
5. Save component
6. Check saved data → carouselSettings should be REMOVED (no bloat)
7. Reload page
8. Select "Carousel/Slider" again
9. Check carousel settings → Should use defaults (not previous values)
```

---

## Edge Cases

### 1. Missing Carousel Settings
**Scenario:** Load old component data without carouselSettings
```javascript
// Should:
- Initialize default carousel settings when switching to carousel
- Not crash or show errors
- Use sensible defaults
```

### 2. Invalid Slide Numbers
**Scenario:** Manually edit localStorage/database with invalid values
```javascript
// Should:
- Clamp to valid ranges
- Not crash component
- Show corrected values in UI
```

### 3. Rapid Layout Switching
**Scenario:** Click layout selector multiple times quickly
```javascript
// Should:
- Debounce updates (300ms)
- Not create multiple save requests
- Final state matches last selection
```

---

## Performance Checks

### Rendering
- Layout switch: < 50ms
- Carousel panel appear: < 100ms
- No unnecessary re-renders of logo list

### Memory
- No memory leaks when switching layouts
- Carousel settings cleaned up when switching away
- No orphaned event listeners

---

## Integration with Phase 1A

Verify collapsible items still work:
- ✅ Logos remain collapsible in all layouts
- ✅ Expansion state persists during layout changes
- ✅ Duplicate button works in all layouts
- ✅ No conflicts between features

---

## Quick Pass/Fail Test Sequence

Run through this complete sequence:

1. ✅ Load page → Grid mode, columns visible
2. ✅ Change to Carousel → Settings panel appears
3. ✅ Check autoplay → Speed input appears
4. ✅ Uncheck autoplay → Speed input disappears
5. ✅ Set desktop slides to 6 → Accepted
6. ✅ Set desktop slides to 10 → Rejected (max 8)
7. ✅ Change to Masonry → Carousel panel disappears
8. ✅ Change back to Carousel → Settings restored
9. ✅ Save component
10. ✅ Reload page → Carousel mode + settings preserved
11. ✅ Change to Grid → Columns visible
12. ✅ Save component
13. ✅ Check database → No carousel settings (clean)
14. ✅ Toggle dark mode → Carousel panel styled correctly
15. ✅ No console errors throughout

If all ✅, Phase 1B is working correctly!

---

## Expected Default Values

### Grid Mode
```javascript
{
  layoutStyle: 'grid',
  columns: 'auto'
  // No carouselSettings
}
```

### Carousel Mode
```javascript
{
  layoutStyle: 'carousel',
  carouselSettings: {
    autoplay: true,
    autoplaySpeed: 3000,
    slidesToShow: 4,
    slidesToShowTablet: 3,
    slidesToShowMobile: 2,
    infinite: true,
    arrows: true,
    dots: true
  }
  // No columns
}
```

---

## Common Issues & Solutions

### Issue: Carousel settings not appearing
**Solution:** Check if `layoutStyle === 'carousel'` in Vue DevTools

### Issue: Autoplay speed always hidden
**Solution:** Check if `carouselSettings.autoplay === true`

### Issue: Settings not persisting
**Solution:** Verify `updateComponent()` is called on change

### Issue: Old carousel settings appearing
**Solution:** Clear browser cache / localStorage

### Issue: Layout switch laggy
**Solution:** Check for console errors, verify debounce working

---

## Browser Compatibility

Test in:
- ✅ Chrome/Edge (Chromium)
- ✅ Firefox
- ✅ Safari (if available)

Features to verify:
- Number input min/max enforcement
- Checkbox styling
- Conditional rendering (v-if)
- Select dropdown functionality
