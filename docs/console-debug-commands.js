/**
 * Media Kit Builder - Debug Console Commands
 *
 * Paste these in browser console while on media kit builder page
 * to see what data is actually loaded.
 *
 * UPDATED (2025-01-24): Removed deprecated Pods analysis.
 * JSON state is now the single source of truth - all component
 * data is expected to be stored in the state.
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
        console.log('  Data keys:', Object.keys(comp.data || {}));
        console.log('  Props keys:', Object.keys(comp.props || {}));
        console.log('  Settings:', comp.settings ? 'Present' : 'Missing');

        // Show data size
        const dataSize = JSON.stringify(comp.data || {}).length;
        const propsSize = JSON.stringify(comp.props || {}).length;
        console.log(`  Data size: ${dataSize} chars, Props size: ${propsSize} chars`);
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
        if (section.components) {
            console.log('  Components:', section.components);
        }
    });

} else {
    console.error('mediaKitStore not found - are you on the builder page?');
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
            console.log('Match:', Object.keys(data.components || {}).length === Object.keys(currentState.components || {}).length ? 'Yes' : 'No');
        }
    });
} else {
    console.error('gmkbAPI not found');
}

// ============================================
// COMMAND 3: Test Save & Check What Gets Saved
// ============================================
console.log('\n\n=== SAVE TEST ===');
console.log('Run this after making a change:');
console.log('await window.mediaKitStore.save()');
console.log('Then check PHP error log for save messages');

// ============================================
// COMMAND 4: Inspect Specific Component
// ============================================
window.inspectComponent = function(componentId) {
    if (!window.mediaKitStore) {
        console.error('mediaKitStore not found');
        return;
    }

    const comp = window.mediaKitStore.$state.components[componentId];
    if (!comp) {
        console.error(`Component ${componentId} not found`);
        console.log('Available components:', Object.keys(window.mediaKitStore.$state.components));
        return;
    }

    console.log('\n=== COMPONENT INSPECTION ===');
    console.log('ID:', componentId);
    console.log('Type:', comp.type);
    console.log('Full component:', comp);

    // Show data content
    console.log('\n=== DATA CONTENT ===');
    if (comp.data && Object.keys(comp.data).length > 0) {
        Object.entries(comp.data).forEach(([key, value]) => {
            const size = typeof value === 'string' ? value.length : JSON.stringify(value).length;
            console.log(`${key}: ${size} chars`);
            if (typeof value === 'string' && value.length > 0) {
                console.log('  Preview:', value.substring(0, 100) + (value.length > 100 ? '...' : ''));
            }
        });
    } else {
        console.log('No data stored');
    }

    // Show props content
    console.log('\n=== PROPS CONTENT ===');
    if (comp.props && Object.keys(comp.props).length > 0) {
        Object.entries(comp.props).forEach(([key, value]) => {
            const size = typeof value === 'string' ? value.length : JSON.stringify(value).length;
            console.log(`${key}: ${size} chars`);
        });
    } else {
        console.log('No props stored');
    }

    // Show settings
    console.log('\n=== SETTINGS ===');
    console.log(comp.settings || 'No settings');
};

// ============================================
// COMMAND 5: Check for Orphaned Components
// ============================================
window.checkOrphanedComponents = function() {
    if (!window.mediaKitStore) {
        console.error('mediaKitStore not found');
        return;
    }

    const state = window.mediaKitStore.$state;
    const allComponentIds = Object.keys(state.components || {});
    const referencedIds = new Set();

    // Collect all referenced component IDs from sections
    (state.sections || []).forEach(section => {
        if (section.columns) {
            Object.values(section.columns).forEach(comps => {
                comps.forEach(id => referencedIds.add(id));
            });
        }
        if (section.components) {
            section.components.forEach(id => referencedIds.add(id));
        }
    });

    // Find orphans
    const orphans = allComponentIds.filter(id => !referencedIds.has(id));

    if (orphans.length > 0) {
        console.warn('Orphaned components (not in any section):', orphans);
    } else {
        console.log('No orphaned components found');
    }

    // Find missing references
    const missing = [...referencedIds].filter(id => !state.components[id]);
    if (missing.length > 0) {
        console.error('Missing component data (referenced but not stored):', missing);
    } else {
        console.log('All referenced components have data');
    }
};

console.log('\n\nAvailable Commands:');
console.log('1. Inspect specific component: inspectComponent("comp_xxx")');
console.log('2. View all components: window.mediaKitStore.$state.components');
console.log('3. View sections: window.mediaKitStore.$state.sections');
console.log('4. Trigger save: await window.mediaKitStore.save()');
console.log('5. Check for orphans: checkOrphanedComponents()');
