/**
 * Component Data Diagnostics Script
 * 
 * This script helps diagnose component data integrity issues in the Media Kit Builder.
 * Run this in the browser console to analyze saved state and identify problems.
 */

window.diagnoseSavedComponents = function() {
    console.group('%c🔍 COMPONENT DATA DIAGNOSTICS', 'font-size: 16px; font-weight: bold; color: #2d3748; background: #e6fffa; padding: 4px 8px; border-radius: 4px;');
    
    // Check WordPress data sources
    console.group('%c1. WordPress Data Sources', 'font-weight: bold; color: #d69e2e;');
    
    const gmkbData = window.gmkbData?.savedState;
    const guestifyData = window.guestifyData?.savedState;
    
    console.log('gmkbData.savedState:', gmkbData ? 'Available' : 'Missing');
    console.log('guestifyData.savedState:', guestifyData ? 'Available' : 'Missing');
    
    const wpState = gmkbData || guestifyData;
    if (wpState) {
        console.log('WordPress saved components:', Object.keys(wpState.components || {}).length);
        
        // Analyze each component in WordPress data
        if (wpState.components) {
            Object.entries(wpState.components).forEach(([id, component]) => {
                const issues = [];
                if (!component.type) issues.push('missing type');
                if (!component.id) issues.push('missing id');
                if (!component.props && !component.data) issues.push('missing props/data');
                
                console.log(`  ${id}:`, {
                    type: component.type || 'MISSING',
                    id: component.id || 'MISSING',
                    hasProps: !!(component.props || component.data),
                    issues: issues.length > 0 ? issues : 'none'
                });
            });
        }
    } else {
        console.log('No WordPress saved state found');
    }
    
    console.groupEnd();
    
    // Check localStorage data
    console.group('%c2. LocalStorage Data', 'font-weight: bold; color: #d69e2e;');
    
    try {
        const localState = JSON.parse(localStorage.getItem('guestifyMediaKitState') || '{}');
        console.log('LocalStorage components:', Object.keys(localState.components || {}).length);
        
        if (localState.components) {
            Object.entries(localState.components).forEach(([id, component]) => {
                const issues = [];
                if (!component.type) issues.push('missing type');
                if (!component.id) issues.push('missing id');
                if (!component.props && !component.data) issues.push('missing props/data');
                
                console.log(`  ${id}:`, {
                    type: component.type || 'MISSING',
                    id: component.id || 'MISSING',
                    hasProps: !!(component.props || component.data),
                    issues: issues.length > 0 ? issues : 'none'
                });
            });
        }
    } catch (error) {
        console.error('Error reading localStorage:', error);
    }
    
    console.groupEnd();
    
    // Check current state manager
    console.group('%c3. Current State Manager', 'font-weight: bold; color: #d69e2e;');
    
    if (window.enhancedStateManager) {
        const currentState = window.enhancedStateManager.getState();
        console.log('Current state components:', Object.keys(currentState.components || {}).length);
        console.log('Current layout:', currentState.layout || []);
        
        // Check for inconsistencies
        const componentIds = Object.keys(currentState.components || {});
        const layoutIds = currentState.layout || [];
        
        const missingFromLayout = componentIds.filter(id => !layoutIds.includes(id));
        const missingFromComponents = layoutIds.filter(id => !currentState.components[id]);
        
        if (missingFromLayout.length > 0) {
            console.warn('Components missing from layout:', missingFromLayout);
        }
        
        if (missingFromComponents.length > 0) {
            console.warn('Layout references missing components:', missingFromComponents);
        }
        
        if (missingFromLayout.length === 0 && missingFromComponents.length === 0) {
            console.log('✅ State consistency check passed');
        }
    } else {
        console.error('Enhanced state manager not available');
    }
    
    console.groupEnd();
    
    // Check DOM components
    console.group('%c4. DOM Components', 'font-weight: bold; color: #d69e2e;');
    
    const previewContainer = document.getElementById('media-kit-preview');
    if (previewContainer) {
        const domComponents = Array.from(previewContainer.children);
        console.log('DOM components count:', domComponents.length);
        
        domComponents.forEach((element, index) => {
            console.log(`  ${index + 1}. ${element.id || 'no-id'}:`, {
                tagName: element.tagName,
                classes: element.className,
                hasContent: element.innerHTML.length > 0,
                isPlaceholder: element.classList.contains('component-placeholder'),
                isError: element.classList.contains('component-error')
            });
        });
    } else {
        console.error('Preview container not found');
    }
    
    console.groupEnd();
    
    // Recommendations
    console.group('%c5. Recommendations', 'font-weight: bold; color: #2d3748;');
    
    const recommendations = [];
    
    if (!wpState && !localStorage.getItem('guestifyMediaKitState')) {
        recommendations.push('No saved data found - this is expected for new installations');
    }
    
    if (wpState && wpState.components) {
        const hasInvalidComponents = Object.values(wpState.components).some(comp => !comp.type || !comp.id);
        if (hasInvalidComponents) {
            recommendations.push('Invalid components detected in WordPress data - state validation will attempt recovery');
        }
    }
    
    if (window.enhancedStateManager) {
        const currentState = window.enhancedStateManager.getState();
        const componentIds = Object.keys(currentState.components || {});
        const layoutIds = currentState.layout || [];
        
        if (componentIds.length !== layoutIds.length) {
            recommendations.push('Component/layout mismatch - this will be fixed automatically');
        }
    }
    
    if (previewContainer && previewContainer.children.length === 0 && wpState?.components && Object.keys(wpState.components).length > 0) {
        recommendations.push('Components exist in state but not in DOM - check component renderer initialization');
    }
    
    if (recommendations.length === 0) {
        console.log('✨ No issues detected - everything looks good!');
    } else {
        recommendations.forEach((rec, index) => {
            console.log(`${index + 1}. ${rec}`);
        });
    }
    
    console.groupEnd();
    
    console.groupEnd();
    
    return {
        wpComponents: wpState ? Object.keys(wpState.components || {}).length : 0,
        localComponents: localStorage.getItem('guestifyMediaKitState') ? Object.keys(JSON.parse(localStorage.getItem('guestifyMediaKitState')).components || {}).length : 0,
        stateComponents: window.enhancedStateManager ? Object.keys(window.enhancedStateManager.getState().components || {}).length : 0,
        domComponents: previewContainer ? previewContainer.children.length : 0,
        issues: recommendations.length
    };
};

// Quick diagnosis
window.quickComponentDiagnosis = function() {
    console.log('🔍 Quick Component Diagnosis...');
    const results = window.diagnoseSavedComponents();
    console.log(`📊 Components: WP=${results.wpComponents}, Local=${results.localComponents}, State=${results.stateComponents}, DOM=${results.domComponents}`);
    console.log(`⚠️ Issues: ${results.issues}`);
    return results;
};

// Fix common component issues
window.fixComponentIssues = function() {
    console.log('🔧 Attempting to fix component issues...');
    
    if (window.enhancedStateManager && window.enhancedStateManager.initializeAfterSystems) {
        console.log('Re-initializing state manager...');
        window.enhancedStateManager.initializeAfterSystems().then(() => {
            console.log('✅ State manager re-initialized');
            
            if (window.enhancedComponentRenderer && window.enhancedComponentRenderer.render) {
                console.log('Triggering renderer...');
                window.enhancedComponentRenderer.render().then(success => {
                    console.log(success ? '✅ Components rendered successfully' : '❌ Rendering failed');
                });
            }
        });
    }
};

console.log('🔍 Component Diagnostics Tools Loaded');
console.log('📋 Available functions:');
console.log('  - diagnoseSavedComponents() - Full diagnosis');
console.log('  - quickComponentDiagnosis() - Quick check');
console.log('  - fixComponentIssues() - Attempt repairs');
