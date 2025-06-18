// Debugging helper for component loading issues
// Run this in the console to get detailed information

console.group('🔍 Component Loading Debug');

// 1. Check guestifyData
console.log('1. Checking guestifyData:');
if (window.guestifyData) {
    console.log('✅ guestifyData exists');
    console.log('   - ajaxUrl:', guestifyData.ajaxUrl);
    console.log('   - pluginUrl:', guestifyData.pluginUrl);
    console.log('   - components count:', guestifyData.components?.length || 0);
    
    // List component directories
    if (guestifyData.components) {
        console.log('   - Component directories:');
        guestifyData.components.forEach(c => {
            console.log(`     • ${c.directory} (${c.name})`);
        });
    }
} else {
    console.log('❌ guestifyData not found');
}

// 2. Check component manager
console.log('\n2. Checking Component Manager:');
if (window.gmkbDebug?.componentManager) {
    const cm = gmkbDebug.componentManager;
    console.log('✅ Component Manager exists');
    console.log('   - Initialized:', cm.initialized);
    console.log('   - Registry size:', cm.componentRegistry.size);
    console.log('   - Loaded schemas:', cm.loadedSchemas.size);
    
    // Test component name mapping
    const testNames = ['bio', 'biography', 'hero', 'stats'];
    console.log('   - Testing component resolution:');
    testNames.forEach(name => {
        const mapped = {
            'bio': 'biography',
            'calendar': 'booking-calendar',
            'cta': 'call-to-action',
            'gallery': 'photo-gallery',
            'podcast': 'podcast-player',
            'video': 'video-intro'
        }[name] || name;
        console.log(`     • ${name} → ${mapped}`);
    });
} else {
    console.log('❌ Component Manager not found');
}

// 3. Test schema loading
console.log('\n3. Testing Schema Loading:');
async function testSchemaLoad(componentType) {
    const paths = [
        `/wp-content/plugins/guestify-media-kit-builder/components/${componentType}/component.json`,
        `${window.guestifyData?.pluginUrl || ''}/components/${componentType}/component.json`
    ];
    
    console.log(`   Testing ${componentType}:`);
    for (const path of paths) {
        try {
            const response = await fetch(path);
            if (response.ok) {
                console.log(`   ✅ Found at: ${path}`);
                const schema = await response.json();
                console.log(`      Schema:`, schema);
                return;
            }
        } catch (e) {
            console.log(`   ❌ Failed at: ${path}`);
        }
    }
    console.log(`   ❌ No schema found for ${componentType}`);
}

// Test a few components
(async () => {
    await testSchemaLoad('biography');
    await testSchemaLoad('hero');
    
    console.log('\n4. Manual Component Add Test:');
    console.log('To manually test adding a component, run:');
    console.log(`gmkbDebug.componentManager.addComponent('biography', null, 'inside')`);
    
    console.groupEnd();
})();
