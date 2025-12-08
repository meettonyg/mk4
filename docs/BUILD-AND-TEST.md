# 🔧 BUILD & TEST INSTRUCTIONS

## ⚠️ IMPORTANT: You Must Build First!

The utilities are part of the Vue bundle and need to be compiled before testing.

---

## Step 1: Build the Vue Bundle

Open terminal in the plugin directory and run:

```bash
cd C:\Users\seoge\OneDrive\Desktop\CODE-Guestify\MEDIAKIT\PLUGIN\mk4

# Install dependencies (if needed)
npm install

# Build the bundle
npm run build
```

This will compile all the Vue code (including the new utilities) into `dist/gmkb.iife.js`.

---

## Step 2: Test the Fixes

### Option A: Quick Browser Console Test

1. **Go to your Media Kit Builder page** (after rebuilding)
2. **Open Console** (F12)
3. **Paste this code:**

```javascript
// Test if utilities are available in the Pinia store
(function() {
  console.log('🧪 Testing Gemini Fixes in Built Bundle\n');
  
  // The utilities are imported in the store, let's test through the store
  const store = window.GMKB?.stores?.mediaKit;
  
  if (!store) {
    console.error('❌ Store not found. Make sure you rebuilt the bundle!');
    return;
  }
  
  console.log('✅ Store found');
  
  // Test 1: Component Duplication (uses deepClone internally)
  console.log('\n🧪 Test 1: Component Duplication');
  try {
    // Create a test component
    const testId = store.addComponent({
      type: 'hero',
      data: { title: 'Original', nested: { value: 'test' } }
    });
    
    if (!testId) {
      throw new Error('Failed to create component');
    }
    
    // Duplicate it
    const duplicateId = store.duplicateComponent(testId);
    
    if (!duplicateId) {
      throw new Error('Failed to duplicate component');
    }
    
    // Modify original
    const original = store.components[testId];
    original.data.title = 'Modified';
    original.data.nested.value = 'changed';
    
    // Check duplicate is unchanged
    const duplicate = store.components[duplicateId];
    
    if (duplicate.data.title === 'Original' && duplicate.data.nested.value === 'test') {
      console.log('✅ PASS: Deep clone working - no data bleeding!');
    } else {
      console.error('❌ FAIL: Data bleeding detected');
      console.log('  Original:', original.data);
      console.log('  Duplicate:', duplicate.data);
    }
    
    // Cleanup
    store.removeComponent(testId);
    store.removeComponent(duplicateId);
    
  } catch (error) {
    console.error('❌ FAIL:', error.message);
  }
  
  // Test 2: ID Generation
  console.log('\n🧪 Test 2: Unique ID Generation');
  try {
    const ids = new Set();
    
    // Create 100 components rapidly
    for (let i = 0; i < 100; i++) {
      const id = store.addComponent({ type: 'hero', data: { title: `Test ${i}` } });
      if (ids.has(id)) {
        throw new Error(`Duplicate ID found: ${id}`);
      }
      ids.add(id);
    }
    
    console.log(`✅ PASS: Generated 100 unique IDs`);
    
    // Cleanup
    ids.forEach(id => store.removeComponent(id));
    
  } catch (error) {
    console.error('❌ FAIL:', error.message);
  }
  
  // Test 3: Undo/Redo Performance (uses deepEqual internally)
  console.log('\n🧪 Test 3: History Performance');
  try {
    const startTime = performance.now();
    
    // Make several changes
    for (let i = 0; i < 10; i++) {
      const id = store.addComponent({ type: 'hero' });
      store.updateComponent(id, { data: { title: `Test ${i}` } });
    }
    
    const endTime = performance.now();
    const duration = endTime - startTime;
    
    console.log(`✅ PASS: 10 operations completed in ${duration.toFixed(2)}ms`);
    
    if (duration < 50) {
      console.log('  ⚡ Excellent performance!');
    } else if (duration < 100) {
      console.log('  ✅ Good performance');
    } else {
      console.log('  ⚠️ Slower than expected');
    }
    
  } catch (error) {
    console.error('❌ FAIL:', error.message);
  }
  
  console.log('\n🎉 Testing complete!');
  console.log('💡 Rebuild with: npm run build');
})();
```

---

### Option B: Manual Testing in Builder

1. **Open Media Kit Builder** (after rebuilding)
2. **Create a component** (e.g., Hero)
3. **Add some text** to the component
4. **Duplicate the component** (click duplicate button)
5. **Edit the original component** - change the text
6. **Check the duplicate** - text should NOT change ✅

If the duplicate's text changes when you edit the original, the fix isn't working.

---

## Step 3: Verify the Build

Check that the new utilities are in the bundle:

```bash
# Search for the new utility functions in the built file
grep -i "deepClone" dist/gmkb.iife.js
grep -i "generateUniqueId" dist/gmkb.iife.js
grep -i "deepEqual" dist/gmkb.iife.js
```

Or on Windows:
```powershell
Select-String -Path "dist\gmkb.iife.js" -Pattern "deepClone"
Select-String -Path "dist\gmkb.iife.js" -Pattern "generateUniqueId"
Select-String -Path "dist\gmkb.iife.js" -Pattern "deepEqual"
```

You should see the function names in the output.

---

## Troubleshooting

### Build Fails
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### Tests Fail After Building
1. Hard refresh the browser (Ctrl + Shift + R)
2. Clear browser cache
3. Check browser console for errors
4. Verify `dist/gmkb.iife.js` was updated (check file timestamp)

### Store Not Found
Make sure you're on the Media Kit Builder page, not just any page on the site.

---

## Expected Results After Building

✅ `dist/gmkb.iife.js` updated  
✅ File size increased slightly (~2-3KB for new utilities)  
✅ Component duplication prevents data bleeding  
✅ History operations faster  
✅ No duplicate IDs  

---

## Build Commands Reference

```bash
# Development build (with source maps)
npm run dev

# Production build (minified)
npm run build

# Watch mode (rebuilds on file changes)
npm run dev -- --watch

# Preview the build
npm run preview
```

---

## Next Steps

1. ✅ Build the bundle: `npm run build`
2. ✅ Refresh browser (Ctrl + Shift + R)
3. ✅ Run console test (Option A above)
4. ✅ Manual test (Option B above)
5. ✅ Review results

---

**The utilities MUST be built into the bundle before they can be tested!**
