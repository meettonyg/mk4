# Alignment Controls - Testing Checklist

## Pre-Test Setup
- [ ] Run build: `.\build.ps1` from PowerShell
- [ ] Build completed successfully
- [ ] Refresh WordPress admin page (hard refresh: Ctrl+Shift+R)
- [ ] Open Media Kit Builder

---

## Test 1: Profile Photo Component (Visual Component)

### Setup
- [ ] Add or select Profile Photo component
- [ ] Click to open editor sidebar
- [ ] Navigate to "Advanced" tab

### Expected UI
- [ ] Label shows "Object Position" (not "Alignment")
- [ ] Three buttons visible (Left, Center, Right)
- [ ] Icons show **box shapes** with container lines (not text lines)
- [ ] Icons clearly indicate left/center/right positioning

### Functional Tests
- [ ] Click "Position Left" button
  - [ ] Button highlights/activates
  - [ ] Image moves to left side of container in preview
  - [ ] Change is immediate (no delay)
  
- [ ] Click "Position Center" button
  - [ ] Button highlights/activates  
  - [ ] Image centers in container in preview
  - [ ] Change is immediate
  
- [ ] Click "Position Right" button
  - [ ] Button highlights/activates
  - [ ] Image moves to right side of container in preview
  - [ ] Change is immediate

### Save & Frontend Test
- [ ] Save media kit
- [ ] View media kit on frontend
- [ ] Positioning matches what you saw in preview

---

## Test 2: Biography Component (Text Component)

### Setup
- [ ] Add or select Biography component
- [ ] Click to open editor sidebar
- [ ] Navigate to "Advanced" tab

### Expected UI
- [ ] Label shows "Text Alignment" (not "Object Position")
- [ ] Four buttons visible (Left, Center, Right, Justify)
- [ ] Icons show **horizontal lines** (text patterns, not boxes)
- [ ] Icons clearly indicate text alignment

### Functional Tests
- [ ] Click "Align Text Left" button
  - [ ] Button highlights/activates
  - [ ] Biography text aligns left in preview
  - [ ] Change is immediate
  
- [ ] Click "Center Text" button
  - [ ] Button highlights/activates
  - [ ] Biography text centers in preview
  - [ ] Change is immediate
  
- [ ] Click "Align Text Right" button
  - [ ] Button highlights/activates
  - [ ] Biography text aligns right in preview
  - [ ] Change is immediate
  
- [ ] Click "Justify Text" button
  - [ ] Button highlights/activates
  - [ ] Biography text fully justified in preview
  - [ ] Change is immediate

### Save & Frontend Test
- [ ] Save media kit
- [ ] View media kit on frontend
- [ ] Text alignment matches what you saw in preview

---

## Test 3: Other Text Components

Quickly verify these also show "Text Alignment":
- [ ] Topics component
- [ ] Contact component
- [ ] Testimonials component
- [ ] CTA component

---

## Test 4: Other Visual Components

Quickly verify these also show "Object Position":
- [ ] Hero component
- [ ] Logo component (if available)
- [ ] Gallery component (if available)

---

## Test 5: Section Controls

### Setup
- [ ] Click on a section (not a component)
- [ ] Open section editor
- [ ] Navigate to "Advanced" tab

### Expected Behavior
- [ ] Should NOT see text alignment controls
- [ ] Should NOT see object position controls
- [ ] Sections have their own positioning system

---

## Test 6: Cross-Browser Check

Test in at least one other browser:
- [ ] Chrome/Edge
- [ ] Firefox
- [ ] Safari (if available)

---

## Test 7: Responsive Behavior

- [ ] Desktop view: Icons display properly
- [ ] Tablet view: Icons display properly
- [ ] Mobile view: Icons display properly (may stack)

---

## Issue Reporting

If any test fails, document:
1. Which test failed
2. What you expected to see
3. What actually happened
4. Browser console errors (F12)
5. Screenshot if helpful

---

## Success Criteria

All tests must pass for successful implementation:
- ✅ Visual components show object positioning with box icons
- ✅ Text components show text alignment with line icons
- ✅ Controls work in real-time preview
- ✅ Changes persist after save
- ✅ Frontend matches builder preview
- ✅ No console errors

---

## Rollback Instructions

If critical issues found:
1. Git revert: `git checkout HEAD -- src/vue/components/sidebar/editors/BaseAdvancedPanel.vue src/services/ComponentStyleService.js`
2. Rebuild: `npm run build`
3. Document issues for later fix
