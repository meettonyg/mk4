/**
 * Test A2: Add Component → Render → Attach Controls
 * Tests the complete component addition flow with rendering and control attachment
 */

if (typeof GMKBTest === 'undefined') {
    throw new Error('GMKBTest harness not loaded');
}

GMKBTest.tests.A2 = async function() {
    console.log('📦 A2: Testing component addition, rendering, and control attachment...');
    
    const initialState = GMKBTest.snapshot('A2-initial');
    
    try {
        // Step 1: Get available component types
        console.log('📋 Step 1: Getting available component types...');
        GMKBTest.assert(window.gmkbData.components.length > 0, 'Components should be available');
        
        const testComponentType = window.gmkbData.components[0].type;
        console.log(`✅ Using component type: ${testComponentType}`);
        
        // Step 2: Add component via component manager
        console.log('➕ Step 2: Adding component via manager...');
        GMKBTest.assert(window.enhancedComponentManager, 'Component manager should be available');
        GMKBTest.assert(window.enhancedComponentManager.addComponent, 'addComponent method should exist');
        
        const componentId = await GMKBTest.addComponent(testComponentType, {
            title: 'Test Component A2'
        });
        
        console.log(`✅ Component added with ID: ${componentId}`);
        
        // Step 3: Wait for component to render in DOM
        console.log('🎨 Step 3: Waiting for component to render...');
        const componentElement = await GMKBTest.waitForSelector(
            `[data-component-id="${componentId}"]`,
            { timeout: 3000 }
        );
        
        GMKBTest.assert(componentElement, 'Component should render in DOM');
        console.log('✅ Component rendered in DOM');
        
        // Step 4: Verify component attributes
        console.log('🔍 Step 4: Verifying component attributes...');
        GMKBTest.assert(componentElement.dataset.componentId === componentId, 'Component ID should match');
        GMKBTest.assert(componentElement.dataset.componentType === testComponentType, 'Component type should match');
        
        // Step 5: Wait for controls to attach
        console.log('🎛️ Step 5: Waiting for controls to attach...');
        
        // Try multiple control selectors as controls may be implemented differently
        const controlSelectors = [
            '.component-controls',
            '.component-controls--dynamic',
            '[data-action="edit"]',
            '.edit-btn'
        ];
        
        let controls = null;
        for (const selector of controlSelectors) {
            controls = componentElement.querySelector(selector);
            if (controls) break;
        }
        
        // If no controls found, wait a bit and trigger control attachment
        if (!controls) {
            console.log('⚠️ Controls not found, requesting attachment...');
            
            // Dispatch event to request control attachment
            document.dispatchEvent(new CustomEvent('gmkb:request-controls-attachment', {
                detail: { componentId }
            }));
            
            await GMKBTest.sleep(500);
            
            // Try again
            for (const selector of controlSelectors) {
                controls = componentElement.querySelector(selector);
                if (controls) break;
            }
        }
        
        const hasControls = !!controls;
        console.log(`${hasControls ? '✅' : '⚠️'} Controls ${hasControls ? 'found' : 'not found'}`);
        
        // Step 6: Test control buttons if available
        let editButton = null;
        let duplicateButton = null;
        let deleteButton = null;
        
        if (controls) {
            console.log('🔘 Step 6: Testing control buttons...');
            
            // Look for edit button
            editButton = componentElement.querySelector('[data-action="edit"], .edit-btn, .component-edit');
            if (editButton) {
                console.log('✅ Edit button found');
            }
            
            // Look for duplicate button
            duplicateButton = componentElement.querySelector('[data-action="duplicate"], .duplicate-btn, .component-duplicate');
            if (duplicateButton) {
                console.log('✅ Duplicate button found');
            }
            
            // Look for delete button
            deleteButton = componentElement.querySelector('[data-action="delete"], .delete-btn, .component-delete');
            if (deleteButton) {
                console.log('✅ Delete button found');
            }
        }
        
        // Step 7: Verify state manager updated
        console.log('💾 Step 7: Verifying state manager updated...');
        const currentState = GMKBTest.getState();
        const componentInState = currentState.components.find ? 
            currentState.components.find(c => c.id === componentId) :
            currentState.components[componentId];
        
        GMKBTest.assert(componentInState, 'Component should be in state');
        console.log('✅ Component found in state manager');
        
        // Step 8: Verify layout updated
        console.log('📐 Step 8: Verifying layout updated...');
        const layoutIncludesComponent = currentState.layout.includes(componentId);
        GMKBTest.assert(layoutIncludesComponent, 'Component should be in layout');
        console.log('✅ Component added to layout');
        
        return {
            ok: true,
            details: {
                componentId,
                componentType: testComponentType,
                rendered: true,
                controlsAttached: hasControls,
                editButton: !!editButton,
                duplicateButton: !!duplicateButton,
                deleteButton: !!deleteButton,
                inState: !!componentInState,
                inLayout: layoutIncludesComponent,
                element: componentElement.tagName
            }
        };
        
    } catch (error) {
        console.error('❌ A2 Test failed:', error);
        
        return {
            ok: false,
            error: error.message,
            details: {
                initialState: initialState,
                currentState: GMKBTest.getState(),
                componentManager: !!window.enhancedComponentManager,
                elementsInDOM: document.querySelectorAll('[data-component-id]').length
            }
        };
    }
};

// Auto-run if called directly
if (typeof module === 'undefined' && typeof window !== 'undefined') {
    console.log('🧪 A2 Test loaded - run with: await GMKBTest.tests.A2()');
}
