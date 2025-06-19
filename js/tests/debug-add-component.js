/**
 * Debug script for Add Component and Load Template issues
 * Run this in the console to diagnose the problem
 */

console.log('🔍 Debugging Add Component and Load Template...\n');

// Test 1: Check global managers
console.log('1️⃣ Checking Global Managers:');
console.log('window.componentManager:', typeof window.componentManager);
console.log('window.stateManager:', typeof window.stateManager);
console.log('window.componentRenderer:', typeof window.componentRenderer);
console.log('window.enhancedComponentManager:', typeof window.enhancedComponentManager);
console.log('window.enhancedStateManager:', typeof window.enhancedStateManager);
console.log('window.enhancedComponentRenderer:', typeof window.enhancedComponentRenderer);

// Test 2: Check if they're the same
console.log('\n2️⃣ Manager Identity Check:');
console.log('componentManager === enhancedComponentManager:', window.componentManager === window.enhancedComponentManager);
console.log('stateManager === enhancedStateManager:', window.stateManager === window.enhancedStateManager);

// Test 3: Check initialization
console.log('\n3️⃣ Initialization Status:');
if (window.enhancedComponentManager) {
    console.log('enhancedComponentManager.initialized:', window.enhancedComponentManager.initialized);
}
if (window.enhancedStateManager) {
    console.log('enhancedStateManager has state:', !!window.enhancedStateManager.state);
}
if (window.enhancedComponentRenderer) {
    console.log('enhancedComponentRenderer.initialized:', window.enhancedComponentRenderer.initialized);
}

// Test 4: Check template loader
console.log('\n4️⃣ Template Loader:');
console.log('window.templateLoader:', typeof window.templateLoader);
if (window.templateLoader) {
    console.log('Templates available:', window.templateLoader.getTemplates().length);
}

// Test 5: Check modals
console.log('\n5️⃣ Modal Elements:');
console.log('Component library modal:', !!document.getElementById('component-library-overlay'));
console.log('Template library modal:', !!document.getElementById('template-library-modal'));
console.log('Add component button:', !!document.getElementById('add-component-btn'));
console.log('Load template button:', !!document.getElementById('load-template'));

// Test 6: Try to trigger component library
console.log('\n6️⃣ Testing Component Library:');
try {
    document.dispatchEvent(new CustomEvent('show-component-library'));
    setTimeout(() => {
        const modal = document.getElementById('component-library-overlay');
        if (modal && modal.style.display !== 'none') {
            console.log('✅ Component library opened successfully');
            modal.style.display = 'none';
        } else {
            console.log('❌ Component library failed to open');
        }
    }, 100);
} catch (error) {
    console.error('❌ Error opening component library:', error);
}

// Test 7: Try to trigger template library
console.log('\n7️⃣ Testing Template Library:');
try {
    document.dispatchEvent(new CustomEvent('show-template-library'));
    setTimeout(() => {
        const modal = document.getElementById('template-library-modal');
        if (modal && modal.style.display !== 'none') {
            console.log('✅ Template library opened successfully');
            modal.style.display = 'none';
        } else {
            console.log('❌ Template library failed to open');
        }
    }, 100);
} catch (error) {
    console.error('❌ Error opening template library:', error);
}

// Test 8: Feature flags
console.log('\n8️⃣ Feature Flags:');
if (window.mediaKitFeatures) {
    console.log('Feature flags:', window.mediaKitFeatures.FEATURES);
} else {
    console.log('❌ Feature flags not found');
}

// Test 9: Initialization check
console.log('\n9️⃣ Initialization:');
console.log('mediaKitBuilderInitialized:', window.mediaKitBuilderInitialized);
console.log('shouldUseEnhancedInit:', typeof window.conditionalLoader?.shouldUseEnhancedInit === 'function' ? window.conditionalLoader.shouldUseEnhancedInit() : 'N/A');

console.log('\n✨ Debug complete! Check results above.');