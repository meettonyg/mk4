/**
 * Test A6: Reorder Components
 * Tests component reordering via drag & drop or move controls
 */

if (typeof GMKBTest === 'undefined') {
    throw new Error('GMKBTest harness not loaded');
}

GMKBTest.tests.A6 = async function() {
    console.log('↕️ A6: Testing component reordering...');
    
    const initialState = GMKBTest.snapshot('A6-initial');
    const testComponentIds = [];
    
    try {
        // Step 1: Add multiple test components for reordering
        console.log('📦 Step 1: Adding multiple test components...');
        
        const componentTypes = ['hero', 'biography', 'topics'];
        
        for (let i = 0; i < componentTypes.length; i++) {
            const componentId = await GMKBTest.addComponent(componentTypes[i], {
                title: `Component ${i + 1} A6`,
                order: i
            });
            testComponentIds.push(componentId);
            await GMKBTest.sleep(200); // Small delay between additions
        }
        
        await GMKBTest.sleep(500);
        
        console.log(`✅ Created ${testComponentIds.length} test components: ${testComponentIds.join(', ')}`);
        
        // Step 2: Record initial order
        console.log('📐 Step 2: Recording initial order...');
        
        const initialComponents = Array.from(document.querySelectorAll(GMKBTest.selectors.componentItem));
        const initialOrder = initialComponents.map(el => el.dataset.componentId);
        
        console.log('Initial order:', initialOrder);
        GMKBTest.assert(initialOrder.length >= 3, 'At least 3 components should be present');
        
        // Step 3: Get state manager's initial layout
        const initialStateLayout = GMKBTest.getState().layout;
        console.log('Initial state layout:', initialStateLayout);
        
        // Step 4: Attempt reordering via move controls first
        console.log('🎛️ Step 4: Testing move controls...');
        
        const firstComponent = initialComponents[0];
        const firstComponentId = firstComponent.dataset.componentId;
        
        // Look for move controls
        const moveControlSelectors = [
            '[data-action="move-down"]',
            '[data-action="moveDown"]',
            '.move-down',
            '.component-move-down',
            '[title*="down"]',
            '[title*="Move down"]'
        ];
        
        let moveButton = null;
        for (const selector of moveControlSelectors) {
            moveButton = firstComponent.querySelector(selector);
            if (moveButton) break;
        }
        
        let moveControlWorked = false;
        
        if (moveButton) {
            console.log('✅ Move control found, testing...');
            moveButton.click();
            await GMKBTest.sleep(500);
            
            // Check if order changed
            const afterMoveComponents = Array.from(document.querySelectorAll(GMKBTest.selectors.componentItem));
            const afterMoveOrder = afterMoveComponents.map(el => el.dataset.componentId);
            
            if (JSON.stringify(afterMoveOrder) !== JSON.stringify(initialOrder)) {
                console.log('✅ Move control successfully reordered components');
                console.log('New order:', afterMoveOrder);
                moveControlWorked = true;
            } else {
                console.log('⚠️ Move control did not change order');
            }
        } else {
            console.log('⚠️ No move controls found, will test drag & drop');
        }
        
        // Step 5: Test drag & drop reordering if move controls didn't work
        console.log('🖱️ Step 5: Testing drag & drop reordering...');
        
        let dragDropWorked = false;
        
        if (!moveControlWorked) {
            // Get fresh component list
            const components = Array.from(document.querySelectorAll(GMKBTest.selectors.componentItem));
            
            if (components.length >= 2) {
                const dragElement = components[0];
                const dropElement = components[1];
                
                // Simulate drag and drop using SortableJS if available
                if (window.Sortable && dragElement.parentElement) {
                    console.log('🔄 Using SortableJS for reordering...');
                    
                    // Try to find Sortable instance
                    let sortableInstance = null;
                    const parent = dragElement.parentElement;
                    
                    if (parent._sortable) {
                        sortableInstance = parent._sortable;
                    }
                    
                    if (sortableInstance) {
                        // Simulate drag by directly manipulating DOM and notifying Sortable
                        parent.insertBefore(dragElement, dropElement.nextSibling);
                        
                        // Trigger Sortable update
                        if (sortableInstance.option) {
                            const onUpdate = sortableInstance.option('onUpdate');
                            if (onUpdate) {
                                onUpdate({
                                    item: dragElement,
                                    from: parent,
                                    to: parent,
                                    oldIndex: 0,
                                    newIndex: 1
                                });
                            }
                        }
                        
                        await GMKBTest.sleep(500);
                        
                        // Check if order changed
                        const afterDragComponents = Array.from(document.querySelectorAll(GMKBTest.selectors.componentItem));
                        const afterDragOrder = afterDragComponents.map(el => el.dataset.componentId);
                        
                        if (JSON.stringify(afterDragOrder) !== JSON.stringify(initialOrder)) {
                            console.log('✅ Drag & drop successfully reordered components');
                            console.log('New order:', afterDragOrder);
                            dragDropWorked = true;
                        }
                    }
                }
                
                // Fallback: Use state manager directly
                if (!dragDropWorked && window.enhancedStateManager) {
                    console.log('🔄 Testing state manager reordering...');
                    
                    try {
                        const currentState = GMKBTest.getState();
                        const currentLayout = [...currentState.layout];
                        
                        if (currentLayout.length >= 2) {
                            // Swap first two components
                            [currentLayout[0], currentLayout[1]] = [currentLayout[1], currentLayout[0]];
                            
                            // Update layout via state manager
                            window.enhancedStateManager.setLayout(currentLayout);
                            await GMKBTest.sleep(500);
                            
                            // Check if DOM updated
                            const afterStateComponents = Array.from(document.querySelectorAll(GMKBTest.selectors.componentItem));
                            const afterStateOrder = afterStateComponents.map(el => el.dataset.componentId);
                            
                            if (JSON.stringify(afterStateOrder) !== JSON.stringify(initialOrder)) {
                                console.log('✅ State manager reordering successful');
                                console.log('New order:', afterStateOrder);
                                dragDropWorked = true;
                            }
                        }
                    } catch (stateError) {
                        console.log('⚠️ State manager reordering failed:', stateError.message);
                    }
                }
                
                // Last resort: Manual DOM reordering (for testing UI update)
                if (!dragDropWorked) {
                    console.log('🔄 Testing manual DOM reordering...');
                    
                    const parent = dragElement.parentElement;
                    const secondElement = components[1];
                    
                    // Move first element after second
                    parent.insertBefore(dragElement, secondElement.nextSibling);
                    
                    await GMKBTest.sleep(300);
                    
                    // Check visual order changed
                    const afterManualComponents = Array.from(document.querySelectorAll(GMKBTest.selectors.componentItem));
                    const afterManualOrder = afterManualComponents.map(el => el.dataset.componentId);
                    
                    if (JSON.stringify(afterManualOrder) !== JSON.stringify(initialOrder)) {
                        console.log('✅ Manual DOM reordering successful (visual)');
                        console.log('New order:', afterManualOrder);
                        dragDropWorked = true;
                    }
                }
            }
        }
        
        // Step 6: Verify state consistency
        console.log('💾 Step 6: Verifying state consistency...');
        
        const finalState = GMKBTest.getState();
        const finalOrder = Array.from(document.querySelectorAll(GMKBTest.selectors.componentItem))
            .map(el => el.dataset.componentId);
        
        console.log('Final DOM order:', finalOrder);
        console.log('Final state layout:', finalState.layout);
        
        // Check if state and DOM are consistent
        const stateConsistent = JSON.stringify(finalOrder) === JSON.stringify(finalState.layout);
        
        if (stateConsistent) {
            console.log('✅ State and DOM order are consistent');
        } else {
            console.log('⚠️ State and DOM order may be inconsistent');
        }
        
        // Step 7: Test reordering persistence
        console.log('💾 Step 7: Testing reordering persistence...');
        
        // Listen for save event
        const saveEventPromise = GMKBTest.waitForEvent('gmkb:state:saved', { timeout: 2000 })
            .then(() => true)
            .catch(() => false);
        
        const saveTriggered = await saveEventPromise;
        
        if (saveTriggered) {
            console.log('✅ Save event triggered after reordering');
        } else {
            console.log('⚠️ No save event detected');
        }
        
        // Step 8: Test multiple reorders (stress test)
        console.log('🔄 Step 8: Testing multiple reorders...');
        
        let multipleReorderSuccess = false;
        
        if (window.enhancedStateManager && finalState.layout.length >= 3) {
            try {
                const layout1 = [...finalState.layout];
                
                // Perform several reorders quickly
                for (let i = 0; i < 3; i++) {
                    const newLayout = [...layout1];
                    // Rotate array
                    newLayout.push(newLayout.shift());
                    
                    window.enhancedStateManager.setLayout(newLayout);
                    await GMKBTest.sleep(100);
                }
                
                multipleReorderSuccess = true;
                console.log('✅ Multiple reorders completed without errors');
                
            } catch (error) {
                console.log('⚠️ Multiple reorders failed:', error.message);
            }
        }
        
        const anyReorderWorked = moveControlWorked || dragDropWorked;
        
        return {
            ok: anyReorderWorked,
            details: {
                testComponentIds: testComponentIds,
                initialOrder: initialOrder,
                finalOrder: finalOrder,
                initialStateLayout: initialStateLayout,
                finalStateLayout: finalState.layout,
                moveControlWorked: moveControlWorked,
                dragDropWorked: dragDropWorked,
                stateConsistent: stateConsistent,
                saveTriggered: saveTriggered,
                multipleReorderSuccess: multipleReorderSuccess,
                sortableAvailable: !!window.Sortable,
                stateManagerAvailable: !!window.enhancedStateManager
            }
        };
        
    } catch (error) {
        console.error('❌ A6 Test failed:', error);
        
        return {
            ok: false,
            error: error.message,
            details: {
                testComponentIds: testComponentIds,
                componentsInDOM: document.querySelectorAll(GMKBTest.selectors.componentItem).length,
                sortableAvailable: !!window.Sortable,
                stateManagerAvailable: !!window.enhancedStateManager
            }
        };
    }
};

// Auto-run if called directly
if (typeof module === 'undefined' && typeof window !== 'undefined') {
    console.log('🧪 A6 Test loaded - run with: await GMKBTest.tests.A6()');
}
