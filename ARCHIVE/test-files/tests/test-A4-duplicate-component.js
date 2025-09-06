/**
 * Test A4: Duplicate Component
 * Tests component duplication functionality
 */

if (typeof GMKBTest === 'undefined') {
    throw new Error('GMKBTest harness not loaded');
}

GMKBTest.tests.A4 = async function() {
    console.log('📋 A4: Testing component duplication...');
    
    const initialState = GMKBTest.snapshot('A4-initial');
    let testComponentId = null;
    
    try {
        // Step 1: Add a test component to duplicate
        console.log('📦 Step 1: Adding test component for duplication...');
        
        const testComponentType = 'hero';
        testComponentId = await GMKBTest.addComponent(testComponentType, {
            title: 'Original Component A4',
            subtitle: 'To be duplicated'
        });
        
        await GMKBTest.sleep(500);
        
        const originalElement = document.querySelector(`[data-component-id="${testComponentId}"]`);
        GMKBTest.assert(originalElement, 'Original component should be rendered');
        console.log(`✅ Original component created: ${testComponentId}`);
        
        // Step 2: Count initial components
        console.log('🔢 Step 2: Counting initial components...');
        
        const initialComponents = document.querySelectorAll(GMKBTest.selectors.componentItem);
        const initialCount = initialComponents.length;
        console.log(`✅ Initial component count: ${initialCount}`);
        
        // Step 3: Find and click duplicate button
        console.log('🎛️ Step 3: Locating duplicate button...');
        
        const duplicateSelectors = [
            '[data-action="duplicate"]',
            '.duplicate-btn',
            '.component-duplicate',
            '.component-controls [title*="duplicate"]',
            '.component-controls [title*="copy"]'
        ];
        
        let duplicateButton = null;
        for (const selector of duplicateSelectors) {
            duplicateButton = originalElement.querySelector(selector);
            if (duplicateButton) break;
        }
        
        GMKBTest.assert(duplicateButton, 'Duplicate button should be found');
        console.log('✅ Duplicate button found, clicking...');
        
        // Step 4: Click duplicate and wait for new component
        duplicateButton.click();
        
        console.log('⏳ Step 4: Waiting for component to be duplicated...');
        
        // Wait for new component to appear
        await GMKBTest.sleep(1000);
        
        const newComponents = document.querySelectorAll(GMKBTest.selectors.componentItem);
        const newCount = newComponents.length;
        
        GMKBTest.assert(newCount === initialCount + 1, `Component count should increase by 1 (was ${initialCount}, now ${newCount})`);
        console.log(`✅ Component duplicated - count increased to ${newCount}`);
        
        // Step 5: Find the duplicated component
        console.log('🔍 Step 5: Identifying duplicated component...');
        
        const allComponentIds = Array.from(newComponents).map(el => el.dataset.componentId);
        const newComponentId = allComponentIds.find(id => id !== testComponentId);
        
        GMKBTest.assert(newComponentId, 'New component ID should be found');
        console.log(`✅ Duplicated component ID: ${newComponentId}`);
        
        const duplicatedElement = document.querySelector(`[data-component-id="${newComponentId}"]`);
        GMKBTest.assert(duplicatedElement, 'Duplicated component should be in DOM');
        
        // Step 6: Verify duplicated component properties
        console.log('🔍 Step 6: Verifying duplicated component properties...');
        
        // Check component type matches
        const originalType = originalElement.dataset.componentType;
        const duplicatedType = duplicatedElement.dataset.componentType;
        
        GMKBTest.assert(duplicatedType === originalType, `Component type should match (original: ${originalType}, duplicate: ${duplicatedType})`);
        console.log('✅ Component type matches');
        
        // Check content similarity (should have similar but not identical content)
        const originalText = originalElement.textContent.trim();
        const duplicatedText = duplicatedElement.textContent.trim();
        
        // Content should be similar (may have "Copy" prefix or similar)
        const contentSimilar = duplicatedText.includes('Original Component A4') || 
                              duplicatedText.includes('Copy') ||
                              originalText === duplicatedText;
        
        if (contentSimilar) {
            console.log('✅ Duplicated content is similar to original');
        } else {
            console.log('⚠️ Duplicated content differs from original (may be expected)');
        }
        
        // Step 7: Verify state manager updated
        console.log('💾 Step 7: Verifying state manager updated...');
        
        const currentState = GMKBTest.getState();
        
        // Check if both components are in state
        let bothInState = false;
        if (currentState.components) {
            if (Array.isArray(currentState.components)) {
                const stateIds = currentState.components.map(c => c.id);
                bothInState = stateIds.includes(testComponentId) && stateIds.includes(newComponentId);
            } else {
                bothInState = currentState.components[testComponentId] && currentState.components[newComponentId];
            }
        }
        
        GMKBTest.assert(bothInState, 'Both original and duplicated components should be in state');
        console.log('✅ Both components found in state');
        
        // Step 8: Verify layout updated
        console.log('📐 Step 8: Verifying layout updated...');
        
        const layoutIncludesBoth = currentState.layout.includes(testComponentId) && 
                                  currentState.layout.includes(newComponentId);
        
        GMKBTest.assert(layoutIncludesBoth, 'Both components should be in layout');
        console.log('✅ Both components in layout');
        
        // Step 9: Verify controls attached to duplicated component
        console.log('🎛️ Step 9: Verifying controls on duplicated component...');
        
        const duplicatedControls = duplicatedElement.querySelector('.component-controls, .component-controls--dynamic, [data-action]');
        const hasControls = !!duplicatedControls;
        
        if (hasControls) {
            console.log('✅ Controls attached to duplicated component');
        } else {
            console.log('⚠️ Controls not found on duplicated component');
        }
        
        // Step 10: Test duplicate of duplicate (stress test)
        console.log('🔄 Step 10: Testing duplicate of duplicate...');
        
        const duplicateButton2 = duplicatedElement.querySelector('[data-action="duplicate"], .duplicate-btn, .component-duplicate');
        
        if (duplicateButton2) {
            duplicateButton2.click();
            await GMKBTest.sleep(1000);
            
            const finalComponents = document.querySelectorAll(GMKBTest.selectors.componentItem);
            const finalCount = finalComponents.length;
            
            if (finalCount === newCount + 1) {
                console.log('✅ Duplicate of duplicate successful');
            } else {
                console.log('⚠️ Duplicate of duplicate failed or not immediate');
            }
        } else {
            console.log('⚠️ No duplicate button on duplicated component');
        }
        
        return {
            ok: true,
            details: {
                originalComponentId: testComponentId,
                duplicatedComponentId: newComponentId,
                componentType: originalType,
                initialCount: initialCount,
                finalCount: document.querySelectorAll(GMKBTest.selectors.componentItem).length,
                duplicatedControlsPresent: hasControls,
                contentSimilar: contentSimilar,
                bothInState: bothInState,
                bothInLayout: layoutIncludesBoth
            }
        };
        
    } catch (error) {
        console.error('❌ A4 Test failed:', error);
        
        return {
            ok: false,
            error: error.message,
            details: {
                testComponentId: testComponentId,
                componentsInDOM: document.querySelectorAll(GMKBTest.selectors.componentItem).length,
                duplicateButtonsFound: document.querySelectorAll('[data-action="duplicate"], .duplicate-btn').length,
                currentState: GMKBTest.getState()
            }
        };
    }
};

// Auto-run if called directly
if (typeof module === 'undefined' && typeof window !== 'undefined') {
    console.log('🧪 A4 Test loaded - run with: await GMKBTest.tests.A4()');
}
