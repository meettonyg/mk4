/**
 * Media Kit Builder - Debug Console Commands
 * 
 * Paste these in browser console while on media kit builder page
 * to see what data is actually loaded
 */

// ============================================
// COMMAND 1: View Current State in Builder
// ============================================
console.log('=== MEDIA KIT BUILDER STATE ===');
if (window.mediaKitStore) {
    const state = window.mediaKitStore.$state;
    console.log('Full State:', state);
    console.log('Components Count:', Object.keys(state.components || {}).length);
    console.log('Sections Count:', (state.sections || []).length);
    console.log('Theme:', state.theme);
    
    // Show each component
    console.log('\n=== COMPONENTS ===');
    Object.entries(state.components || {}).forEach(([id, comp]) => {
        console.log(`\n${id}:`);
        console.log('  Type:', comp.type);
        console.log('  Has _usesPods:', !!comp._usesPods);
        console.log('  Data keys:', Object.keys(comp.data || {}));
        console.log('  Props keys:', Object.keys(comp.props || {}));
        
        // Check for bloat
        if (comp.data) {
            const bloatFields = ['biography', 'name', 'title', 'topics', 'description'];
            const hasBloat = bloatFields.some(field => 
                comp.data[field] && 
                typeof comp.data[field] === 'string' && 
                comp.data[field].length > 50
            );
            if (hasBloat) {
                console.warn('  ⚠️ HAS BLOAT - Contains hardcoded Pods data');
            } else {
                console.log('  ✓ Clean - No bloat detected');
            }
        }
    });
    
    // Show sections
    console.log('\n=== SECTIONS ===');
    (state.sections || []).forEach((section, i) => {
        console.log(`\nSection ${i + 1}: ${section.section_id}`);
        console.log('  Type:', section.type || section.layout);
        if (section.columns) {
            Object.entries(section.columns).forEach(([col, comps]) => {
                console.log(`  Column ${col}:`, comps);
            });
        }
    });
    
} else {
    console.error('❌ mediaKitStore not found - are you on the builder page?');
}

// ============================================
// COMMAND 2: Check Database vs Memory
// ============================================
console.log('\n\n=== DATABASE VS MEMORY CHECK ===');
if (window.gmkbAPI) {
    window.gmkbAPI.load().then(data => {
        console.log('Data loaded from database:', data);
        
        // Compare with current state
        if (window.mediaKitStore) {
            const currentState = window.mediaKitStore.$state;
            console.log('\nComparison:');
            console.log('DB Components:', Object.keys(data.components || {}).length);
            console.log('Memory Components:', Object.keys(currentState.components || {}).length);
            console.log('Match:', Object.keys(data.components || {}).length === Object.keys(currentState.components || {}).length ? '✓' : '✗');
        }
    });
} else {
    console.error('❌ gmkbAPI not found');
}

// ============================================
// COMMAND 3: Test Save & Check What Gets Saved
// ============================================
console.log('\n\n=== SAVE TEST ===');
console.log('Run this after making a change:');
console.log('await window.mediaKitStore.save()');
console.log('Then check PHP error log for sanitization messages');

// ============================================
// COMMAND 4: Inspect Specific Component
// ============================================
window.inspectComponent = function(componentId) {
    if (!window.mediaKitStore) {
        console.error('❌ mediaKitStore not found');
        return;
    }
    
    const comp = window.mediaKitStore.$state.components[componentId];
    if (!comp) {
        console.error(`❌ Component ${componentId} not found`);
        console.log('Available components:', Object.keys(window.mediaKitStore.$state.components));
        return;
    }
    
    console.log('\n=== COMPONENT INSPECTION ===');
    console.log('ID:', componentId);
    console.log('Type:', comp.type);
    console.log('Full component:', comp);
    
    // Check for bloat
    console.log('\n=== BLOAT CHECK ===');
    const bloatFields = {
        biography: ['biography', 'name', 'full_name'],
        hero: ['title', 'subtitle', 'description'],
        topics: ['topics', 'topic_1', 'topic_2', 'topic_3', 'topic_4', 'topic_5'],
        questions: ['questions', 'question_1', 'question_2'],
        contact: ['email', 'phone', 'website']
    };
    
    const fieldsToCheck = bloatFields[comp.type] || [];
    let foundBloat = false;
    
    fieldsToCheck.forEach(field => {
        if (comp.data && comp.data[field]) {
            const value = comp.data[field];
            const size = typeof value === 'string' ? value.length : JSON.stringify(value).length;
            if (size > 50) {
                console.warn(`⚠️ ${field}: ${size} chars (BLOAT)`);
                console.log('  Preview:', typeof value === 'string' ? value.substring(0, 100) : value);
                foundBloat = true;
            } else {
                console.log(`✓ ${field}: ${size} chars (OK)`);
            }
        }
    });
    
    if (!foundBloat) {
        console.log('✓ No bloat detected');
    }
    
    console.log('\n=== PODS MARKERS ===');
    console.log('_usesPods:', comp._usesPods);
    console.log('_podsType:', comp._podsType);
    console.log('_dataSource:', comp.data?._dataSource);
};

console.log('\n\n📋 Available Commands:');
console.log('1. Inspect specific component: inspectComponent("comp_1759276076956_k53drqyl4")');
console.log('2. View all components: window.mediaKitStore.$state.components');
console.log('3. View sections: window.mediaKitStore.$state.sections');
console.log('4. Trigger save: await window.mediaKitStore.save()');
