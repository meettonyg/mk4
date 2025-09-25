/**
 * Vue Integration Debug & Fix Script
 * Run this in console to diagnose and fix Vue integration issues
 */

window.debugVueIntegration = function() {
    console.group('🔍 Vue Integration Debug');
    
    // 1. Check Vue App
    console.group('Vue App Status');
    console.log('gmkbApp exists:', !!window.gmkbApp);
    console.log('gmkbStore exists:', !!window.gmkbStore);
    console.log('gmkbPinia exists:', !!window.gmkbPinia);
    console.log('Vue mount point exists:', !!document.getElementById('vue-app'));
    console.groupEnd();
    
    // 2. Check Store State
    if (window.gmkbStore) {
        console.group('Store State');
        console.log('Components:', Object.keys(window.gmkbStore.components).length);
        console.log('Sections:', window.gmkbStore.sections.length);
        console.log('Theme:', window.gmkbStore.theme);
        console.log('Has unsaved changes:', window.gmkbStore.hasUnsavedChanges);
        console.groupEnd();
    }
    
    // 3. Check DOM Structure
    console.group('DOM Structure');
    const containers = {
        'Vue App': document.getElementById('vue-app'),
        'Saved Components': document.getElementById('saved-components-container'),
        'Empty State': document.getElementById('empty-state'),
        'Vue Saved Components': document.getElementById('vue-saved-components'),
        'Sections (Legacy)': document.querySelector('.gmkb-sections-container:not(.vue-controlled)'),
        'Sections (Vue)': document.querySelector('.gmkb-sections-container.vue-controlled')
    };
    
    Object.entries(containers).forEach(([name, el]) => {
        if (el) {
            console.log(`${name}:`, {
                exists: true,
                visible: el.style.display !== 'none' && window.getComputedStyle(el).display !== 'none',
                display: el.style.display || 'default'
            });
        } else {
            console.log(`${name}: Not found`);
        }
    });
    console.groupEnd();
    
    // 4. Check Component Rendering
    console.group('Component Rendering');
    const allComponents = document.querySelectorAll('[data-component-id]');
    const vueComponents = document.querySelectorAll('#vue-app [data-component-id]');
    const legacyComponents = Array.from(allComponents).filter(el => !el.closest('#vue-app'));
    
    console.log('Total components in DOM:', allComponents.length);
    console.log('Vue components:', vueComponents.length);
    console.log('Legacy components:', legacyComponents.length);
    
    if (legacyComponents.length > 0) {
        console.warn('Found legacy components that should be removed:', legacyComponents);
    }
    console.groupEnd();
    
    // 5. Check Registry
    console.group('Component Registry');
    console.log('UnifiedComponentRegistry exists:', !!window.UnifiedComponentRegistry);
    console.log('gmkbComponentRegistry exists:', !!window.gmkbComponentRegistry);
    if (window.gmkbComponentRegistry) {
        window.gmkbComponentRegistry.debug();
    }
    console.groupEnd();
    
    // 6. Check Pods Integration
    console.group('Pods Integration');
    console.log('podsDataIntegration exists:', !!window.podsDataIntegration);
    console.log('gmkbPodsIntegration exists:', !!window.gmkbPodsIntegration);
    console.log('Pods data available:', !!(window.gmkbData?.pods_data));
    if (window.gmkbData?.pods_data) {
        console.log('Pods fields:', Object.keys(window.gmkbData.pods_data));
    }
    console.groupEnd();
    
    console.groupEnd();
};

// Auto-fix function
window.fixVueIntegration = function() {
    console.log('🔧 Attempting to fix Vue integration...');
    
    // 1. Hide legacy containers
    const legacySelectors = [
        '#saved-components-container',
        '#empty-state',
        '#components-direct-container',
        '.gmkb-sections-container:not(.vue-controlled)'
    ];
    
    legacySelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(el => {
            if (!el.closest('#vue-app')) {
                el.style.display = 'none';
                console.log(`Hidden: ${selector}`);
            }
        });
    });
    
    // 2. Show Vue app
    const vueApp = document.getElementById('vue-app');
    if (vueApp) {
        vueApp.style.display = 'block';
        console.log('✅ Vue app shown');
    }
    
    // 3. Remove duplicate components
    const allComponents = document.querySelectorAll('[data-component-id]');
    const legacyComponents = Array.from(allComponents).filter(el => !el.closest('#vue-app'));
    legacyComponents.forEach(el => el.remove());
    if (legacyComponents.length > 0) {
        console.log(`✅ Removed ${legacyComponents.length} duplicate components`);
    }
    
    // 4. Fix empty state visibility
    if (window.gmkbStore) {
        const hasContent = window.gmkbStore.componentCount > 0 || window.gmkbStore.sectionCount > 0;
        const vueContainer = document.getElementById('vue-saved-components');
        
        if (vueContainer) {
            vueContainer.style.display = hasContent ? 'block' : 'none';
        }
    }
    
    console.log('✅ Vue integration fixes applied');
};

// Run debug on load
console.log('🔍 Vue Integration Debug loaded. Run debugVueIntegration() to diagnose or fixVueIntegration() to fix.');
