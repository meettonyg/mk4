# Profile Image Debug Script

**Run this in the browser console to diagnose the profile photo issue:**

```javascript
// === PROFILE PHOTO DIAGNOSTIC ===
console.log('🔍 === PROFILE PHOTO DIAGNOSTIC ===');

// 1. Check if component exists in registry
const registry = window.GMKB?.services?.registry;
console.log('1. Registry available:', !!registry);

if (registry) {
  const profilePhotoComponent = registry.get('profile-photo');
  console.log('2. Profile Photo component in registry:', !!profilePhotoComponent);
  if (profilePhotoComponent) {
    console.log('   Component details:', profilePhotoComponent);
  }
}

// 2. Check Pods data for profile photo field
const podsData = window.gmkbData?.pods_data || window.gmkbData?.podsData;
console.log('3. Pods data available:', !!podsData);
console.log('4. Pods data keys:', Object.keys(podsData || {}));

// Look for profile photo related fields
const profileFields = Object.keys(podsData || {}).filter(key => 
  key.toLowerCase().includes('photo') || 
  key.toLowerCase().includes('image') || 
  key.toLowerCase().includes('avatar') ||
  key.toLowerCase().includes('profile')
);
console.log('5. Profile-related fields:', profileFields);

profileFields.forEach(field => {
  console.log(`   ${field}:`, podsData[field]);
});

// 3. Check media kit store for components
const store = window.GMKB?.stores?.mediaKit;
console.log('6. MediaKit store available:', !!store);

if (store) {
  const components = store.components;
  console.log('7. Total components in store:', Object.keys(components || {}).length);
  
  // Find profile photo component
  const profilePhotoComponents = Object.entries(components || {}).filter(([id, comp]) => 
    comp.type === 'profile-photo'
  );
  
  console.log('8. Profile Photo components:', profilePhotoComponents.length);
  
  profilePhotoComponents.forEach(([id, comp]) => {
    console.log(`   Component ${id}:`, comp);
    console.log(`   - Has data:`, !!comp.data);
    console.log(`   - Data:`, comp.data);
    console.log(`   - Has settings:`, !!comp.settings);
    console.log(`   - Settings:`, comp.settings);
  });
}

// 4. Check DOM for profile photo elements
const profilePhotoElements = document.querySelectorAll('[data-component-type="profile-photo"]');
console.log('9. Profile photo elements in DOM:', profilePhotoElements.length);

profilePhotoElements.forEach((el, i) => {
  console.log(`   Element ${i}:`, el);
  console.log(`   - Component ID:`, el.dataset.componentId);
  console.log(`   - Visible:`, el.offsetParent !== null);
  console.log(`   - Display:`, window.getComputedStyle(el).display);
  console.log(`   - innerHTML length:`, el.innerHTML.length);
  
  // Check for img tags
  const imgs = el.querySelectorAll('img');
  console.log(`   - Images found:`, imgs.length);
  imgs.forEach((img, j) => {
    console.log(`     Image ${j} src:`, img.src);
    console.log(`     Image ${j} alt:`, img.alt);
    console.log(`     Image ${j} display:`, window.getComputedStyle(img).display);
  });
});

// 5. Check Vue component instances
if (window.GMKB?.vueInstance) {
  console.log('10. Vue instance available:', true);
  // Try to find profile photo in Vue component tree
  // This is harder to do without devtools, but we can log the instance
  console.log('    Vue root component:', window.GMKB.vueInstance.$options.name);
}

console.log('🔍 === DIAGNOSTIC COMPLETE ===');
console.log('Copy this output and send it for analysis');
```

**After running, answer these questions:**

1. **Are there profile photo related fields in Pods data?**
2. **Is there a profile-photo component in the store?**
3. **Does the component have data?**
4. **Are there profile photo elements in the DOM?**
5. **If elements exist, do they contain img tags?**
6. **If img tags exist, what's in the src attribute?**
