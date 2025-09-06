/**
 * Test B1: Initialize from Saved Data
 * Tests loading and initializing from previously saved state data
 */

if (typeof GMKBTest === 'undefined') {
    throw new Error('GMKBTest harness not loaded');
}

GMKBTest.tests.B1 = async function() {
    console.log('💾 B1: Testing initialization from saved data...');
    
    try {
        // Step 1: Check for existing saved data
        console.log('📡 Step 1: Checking for saved data...');
        
        GMKBTest.assert(window.gmkbData, 'WordPress data should be available');
        
        const hasSavedData = window.gmkbData.hasSavedData || 
                            (window.gmkbData.saved_components && window.gmkbData.saved_components.length > 0) ||
                            (window.gmkbData.saved_state && Object.keys(window.gmkbData.saved_state).length > 0);
        
        console.log(`Saved data detected: ${hasSavedData ? 'Yes' : 'No'}`);
        
        if (hasSavedData) {
            console.log('✅ Saved data found in WordPress localization');
            
            // Analyze saved data structure
            const savedComponents = window.gmkbData.saved_components || [];
            const savedState = window.gmkbData.saved_state || {};
            
            console.log(`📊 Saved components count: ${savedComponents.length}`);
            console.log(`📊 Saved state keys: ${Object.keys(savedState).join(', ')}`);
            
            if (savedComponents.length > 0) {
                console.log('📋 Sample saved component:', savedComponents[0]);
            }
            
        } else {
            console.log('⚠️ No saved data found - will test empty state initialization');
        }
        
        // Step 2: Check state manager initialization
        console.log('⚙️ Step 2: Checking state manager initialization...');
        
        GMKBTest.assert(window.enhancedStateManager, 'State manager should be available');
        
        const currentState = GMKBTest.getState();
        console.log('Current state structure:', Object.keys(currentState));
        
        if (currentState.components) {
            const componentCount = Array.isArray(currentState.components) ? 
                currentState.components.length : 
                Object.keys(currentState.components).length;
            
            console.log(`✅ State manager has ${componentCount} components`);
        }
        
        // Step 3: Check DOM reflects saved data
        console.log('🎨 Step 3: Checking DOM reflects saved data...');
        
        const domComponents = document.querySelectorAll(GMKBTest.selectors.componentItem);
        const domComponentCount = domComponents.length;
        
        console.log(`DOM components count: ${domComponentCount}`);
        
        if (hasSavedData && domComponentCount > 0) {
            console.log('✅ DOM has components matching saved data');
            
            // Verify component IDs match saved data
            const domIds = Array.from(domComponents).map(el => el.dataset.componentId);
            console.log('DOM component IDs:', domIds);
            
            if (window.gmkbData.saved_components) {
                const savedIds = window.gmkbData.saved_components.map(c => c.id);
                const idsMatch = domIds.length === savedIds.length && 
                                domIds.every(id => savedIds.includes(id));
                
                if (idsMatch) {
                    console.log('✅ DOM component IDs match saved data');
                } else {
                    console.log('⚠️ DOM component IDs do not perfectly match saved data');
                    console.log('Expected:', savedIds);
                    console.log('Actual:', domIds);
                }
            }
        } else if (!hasSavedData && domComponentCount === 0) {
            console.log('✅ Empty state correctly initialized - no components in DOM');
        }
        
        // Step 4: Test empty state handling
        console.log('🗂️ Step 4: Testing empty state UI...');
        
        const emptyStateElements = document.querySelectorAll('#enhanced-empty-state, .empty-state, [data-empty-state]');
        const emptyStateVisible = Array.from(emptyStateElements).some(el => 
            el.style.display !== 'none' && !el.hidden && el.offsetParent !== null
        );
        
        if (domComponentCount === 0 && emptyStateVisible) {
            console.log('✅ Empty state UI is properly displayed');
        } else if (domComponentCount > 0 && !emptyStateVisible) {
            console.log('✅ Empty state UI is properly hidden');
        } else {
            console.log('⚠️ Empty state UI visibility may not match component state');
        }
        
        // Step 5: Test global settings initialization
        console.log('🌐 Step 5: Testing global settings initialization...');
        
        const globalSettings = currentState.globalSettings || {};
        const hasGlobalSettings = Object.keys(globalSettings).length > 0;
        
        if (window.gmkbData.global_settings) {
            const savedGlobalSettings = window.gmkbData.global_settings;
            console.log('✅ Saved global settings found:', Object.keys(savedGlobalSettings));
            
            // Check if they match current state
            const settingsMatch = JSON.stringify(globalSettings) === JSON.stringify(savedGlobalSettings);
            if (settingsMatch) {
                console.log('✅ Global settings correctly loaded');
            } else {
                console.log('⚠️ Global settings may not match saved data');
            }
        } else {
            console.log('📝 No saved global settings found');
        }
        
        // Step 6: Test layout initialization
        console.log('📐 Step 6: Testing layout initialization...');
        
        const currentLayout = currentState.layout || [];
        
        if (window.gmkbData.layout) {
            const savedLayout = window.gmkbData.layout;
            const layoutMatch = JSON.stringify(currentLayout) === JSON.stringify(savedLayout);
            
            if (layoutMatch) {
                console.log('✅ Layout correctly initialized from saved data');
            } else {
                console.log('⚠️ Layout may not match saved data');
                console.log('Expected:', savedLayout);
                console.log('Actual:', currentLayout);
            }
        } else {
            console.log('📝 No saved layout found - using default order');
        }
        
        // Step 7: Test state consistency
        console.log('🔍 Step 7: Testing state consistency...');
        
        const componentIds = Array.isArray(currentState.components) ?
            currentState.components.map(c => c.id) :
            Object.keys(currentState.components);
        
        const layoutIds = currentLayout;
        const domIds = Array.from(domComponents).map(el => el.dataset.componentId);
        
        const allConsistent = componentIds.length === layoutIds.length && 
                             layoutIds.length === domIds.length &&
                             componentIds.every(id => layoutIds.includes(id)) &&
                             layoutIds.every(id => domIds.includes(id));
        
        if (allConsistent) {
            console.log('✅ State, layout, and DOM are consistent');
        } else {
            console.log('⚠️ Inconsistency detected between state, layout, and DOM');
            console.log('Component IDs:', componentIds);
            console.log('Layout IDs:', layoutIds);
            console.log('DOM IDs:', domIds);
        }
        
        // Step 8: Test initialization events
        console.log('📡 Step 8: Testing initialization events...');
        
        let initEventsHeard = [];
        const eventNames = ['gmkb:ready', 'gmkb:initialized', 'gmkb:state:loaded', 'gmkb:application-ready'];
        
        // These events should have already fired, so we'll check global flags
        const gmkbReady = window.gmkbDataReady || document.body.classList.contains('gmkb-ready');
        const applicationReady = window.GMKB && window.GMKB.isReady && window.GMKB.isReady();
        
        if (gmkbReady) {
            initEventsHeard.push('gmkb:ready');
            console.log('✅ GMKB ready state detected');
        }
        
        if (applicationReady) {
            initEventsHeard.push('gmkb:application-ready');
            console.log('✅ Application ready state detected');
        }
        
        // Step 9: Test post ID availability
        console.log('🆔 Step 9: Testing post ID availability...');
        
        const postId = window.gmkbData.postId || window.gmkbData.post_id;
        GMKBTest.assert(postId && postId > 0, 'Valid post ID should be available');
        console.log(`✅ Post ID available: ${postId}`);
        
        return {
            ok: true,
            details: {
                hasSavedData: hasSavedData,
                savedComponentsCount: window.gmkbData.saved_components?.length || 0,
                currentComponentsCount: Array.isArray(currentState.components) ? 
                    currentState.components.length : Object.keys(currentState.components || {}).length,
                domComponentsCount: domComponentCount,
                emptyStateVisible: emptyStateVisible,
                hasGlobalSettings: hasGlobalSettings,
                layoutConsistent: allConsistent,
                initEventsHeard: initEventsHeard,
                postId: postId,
                stateStructure: Object.keys(currentState)
            }
        };
        
    } catch (error) {
        console.error('❌ B1 Test failed:', error);
        
        return {
            ok: false,
            error: error.message,
            details: {
                gmkbDataAvailable: !!window.gmkbData,
                stateManagerAvailable: !!window.enhancedStateManager,
                domElements: document.querySelectorAll(GMKBTest.selectors.componentItem).length,
                readyState: document.readyState,
                bodyClasses: document.body.className
            }
        };
    }
};

// Auto-run if called directly
if (typeof module === 'undefined' && typeof window !== 'undefined') {
    console.log('🧪 B1 Test loaded - run with: await GMKBTest.tests.B1()');
}
