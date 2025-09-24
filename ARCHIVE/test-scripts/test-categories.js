// ROOT FIX: Test categories in component library
// Run this in browser console after clicking "Add Component"

console.log('=== Testing Component Categories ===');

// Check if gmkbData has categories
if (window.gmkbData) {
    console.log('Categories in gmkbData:', window.gmkbData.categories);
    console.log('Components in gmkbData:', window.gmkbData.components ? window.gmkbData.components.length : 0);
    
    // Check category distribution
    if (window.gmkbData.components && Array.isArray(window.gmkbData.components)) {
        const categoryMap = {};
        window.gmkbData.components.forEach(comp => {
            const cat = comp.category || 'uncategorized';
            if (!categoryMap[cat]) categoryMap[cat] = [];
            categoryMap[cat].push(comp.type || comp.name);
        });
        console.log('Category Distribution:', categoryMap);
    }
}

// Check if Vue component library is loaded
if (window.Vue && window.Vue.version) {
    console.log('Vue version:', window.Vue.version);
}

// Force refresh component discovery
if (window.GMKB && window.GMKB.refreshComponentDiscovery) {
    console.log('Refreshing component discovery...');
    window.GMKB.refreshComponentDiscovery();
}

console.log('=== End Category Test ===');
