/**
 * Test A5: Delete Component
 * Tests component deletion functionality with state cleanup
 */

if (typeof GMKBTest === 'undefined') {
    throw new Error('GMKBTest harness not loaded');
}

GMKBTest.tests.A5 = async function() {
    console.log('🗑️ A5: Testing component deletion...');
    
    const initialState = GMKBTest.snapshot('A5-initial');
    let testComponentId = null;
    
    try {
        // Step 1: Add test components (multiple for better testing)
        console.log('📦 Step 1: Adding test components for deletion...');
        
        const testComponentType = 'hero';
        testComponentId = await GMKBTest.addComponent(testComponentType, {
            title: 'Component to Delete A5'
        });
        
        // Add a second component to ensure we're not deleting everything
        const keepComponentId = await GMKBTest.addComponent('biography', {
            title: 'Component to Keep A5'
        });
        
        await GMKBTest.sleep(500);
        
        const targetElement = document.querySelector(`[data-component-id="${testComponentId}"]`);
        const keepElement = document.querySelector(`[data-component-id="${keepComponentId}"]`);
        
        GMKBTest.assert(targetElement, 'Target component should be rendered');
        GMKBTest.assert(keepElement, 'Keep component should be rendered');
        console.log(`✅ Test components created: ${testComponentId} (delete), ${keepComponentId} (keep)`);
        
        // Step 2: Count initial components
        console.log('🔢 Step 2: Counting initial components...');
        
        const initialComponents = document.querySelectorAll(GMKBTest.selectors.componentItem);
        const initialCount = initialComponents.length;
        console.log(`✅ Initial component count: ${initialCount}`);
        
        // Step 3: Find and click delete button
        console.log('🎛️ Step 3: Locating delete button...');
        
        const deleteSelectors = [
            '[data-action="delete"]',
            '.delete-btn',
            '.component-delete',
            '.component-controls [title*="delete"]',
            '.component-controls [title*="remove"]',
            '.component-controls .btn-danger'
        ];
        
        let deleteButton = null;
        for (const selector of deleteSelectors) {
            deleteButton = targetElement.querySelector(selector);
            if (deleteButton) break;
        }
        
        GMKBTest.assert(deleteButton, 'Delete button should be found');
        console.log('✅ Delete button found');
        
        // Step 4: Handle confirmation if present
        console.log('⚠️ Step 4: Clicking delete button...');
        
        // Listen for confirmation dialogs
        let confirmationHandled = false;
        
        const originalConfirm = window.confirm;
        window.confirm = function(message) {
            console.log('📋 Confirmation dialog appeared:', message);
            confirmationHandled = true;
            return true; // Confirm deletion
        };
        
        // Click delete button
        deleteButton.click();
        
        // Restore original confirm
        setTimeout(() => {
            window.confirm = originalConfirm;
        }, 100);
        
        console.log('🗑️ Delete button clicked' + (confirmationHandled ? ' (confirmation handled)' : ''));
        
        // Step 5: Wait for component to be removed
        console.log('⏳ Step 5: Waiting for component removal...');
        
        // Wait for DOM removal
        let removalComplete = false;
        for (let i = 0; i < 20; i++) { // Wait up to 2 seconds
            const stillExists = document.querySelector(`[data-component-id="${testComponentId}"]`);
            if (!stillExists) {
                removalComplete = true;
                break;
            }
            await GMKBTest.sleep(100);
        }
        
        GMKBTest.assert(removalComplete, 'Component should be removed from DOM');
        console.log('✅ Component removed from DOM');
        
        // Step 6: Verify component count decreased
        console.log('🔢 Step 6: Verifying component count...');
        
        const finalComponents = document.querySelectorAll(GMKBTest.selectors.componentItem);
        const finalCount = finalComponents.length;
        
        GMKBTest.assert(finalCount === initialCount - 1, `Component count should decrease by 1 (was ${initialCount}, now ${finalCount})`);
        console.log(`✅ Component count correctly decreased to ${finalCount}`);
        
        // Step 7: Verify other component still exists
        console.log('👀 Step 7: Verifying other components remain...');
        
        const keepElementStillExists = document.querySelector(`[data-component-id="${keepComponentId}"]`);
        GMKBTest.assert(keepElementStillExists, 'Other components should remain');
        console.log('✅ Other components preserved');
        
        // Step 8: Verify state manager updated
        console.log('💾 Step 8: Verifying state cleanup...');
        
        const currentState = GMKBTest.getState();
        
        // Check component removed from state
        let componentRemovedFromState = true;
        if (currentState.components) {
            if (Array.isArray(currentState.components)) {
                const stateIds = currentState.components.map(c => c.id);
                componentRemovedFromState = !stateIds.includes(testComponentId);
            } else {
                componentRemovedFromState = !currentState.components[testComponentId];
            }
        }
        
        GMKBTest.assert(componentRemovedFromState, 'Component should be removed from state');
        console.log('✅ Component removed from state');
        
        // Step 9: Verify layout updated
        console.log('📐 Step 9: Verifying layout cleanup...');
        
        const layoutCleanedUp = !currentState.layout.includes(testComponentId);
        GMKBTest.assert(layoutCleanedUp, 'Component should be removed from layout');
        console.log('✅ Component removed from layout');
        
        // Step 10: Test deletion of last component (empty state handling)
        console.log('🔄 Step 10: Testing empty state handling...');
        
        // Delete the remaining test component
        const keepDeleteButton = keepElementStillExists.querySelector('[data-action="delete"], .delete-btn, .component-delete');
        let emptyStateShown = false;
        
        if (keepDeleteButton) {
            keepDeleteButton.click();
            await GMKBTest.sleep(1000);
            
            // Check if empty state is shown
            const emptyStateElements = document.querySelectorAll('#enhanced-empty-state, .empty-state, [data-empty-state]');
            emptyStateShown = Array.from(emptyStateElements).some(el => 
                el.style.display !== 'none' && !el.hidden
            );
            
            if (emptyStateShown) {
                console.log('✅ Empty state shown when no components remain');
            } else {
                console.log('⚠️ Empty state not detected (may be handled differently)');
            }
        }
        
        // Step 11: Listen for save event
        console.log('💾 Step 11: Waiting for auto-save...');
        
        const saveEventPromise = GMKBTest.waitForEvent('gmkb:state:saved', { timeout: 2000 })
            .then(() => {
                console.log('✅ Auto-save triggered after deletion');
                return true;
            })
            .catch(() => {
                console.log('⚠️ No auto-save event detected');
                return false;
            });
        
        const saveEventFired = await saveEventPromise;
        
        return {
            ok: true,
            details: {
                deletedComponentId: testComponentId,
                keepComponentId: keepComponentId,
                initialCount: initialCount,
                finalCount: finalCount,
                confirmationShown: confirmationHandled,
                domRemovalSuccess: removalComplete,
                stateCleanup: componentRemovedFromState,
                layoutCleanup: layoutCleanedUp,
                emptyStateShown: emptyStateShown,
                autoSaveTriggered: saveEventFired
            }
        };
        
    } catch (error) {
        console.error('❌ A5 Test failed:', error);
        
        return {
            ok: false,
            error: error.message,
            details: {
                testComponentId: testComponentId,
                componentsInDOM: document.querySelectorAll(GMKBTest.selectors.componentItem).length,
                deleteButtonsFound: document.querySelectorAll('[data-action="delete"], .delete-btn').length,
                elementStillExists: !!document.querySelector(`[data-component-id="${testComponentId}"]`)
            }
        };
    }
};

// Auto-run if called directly
if (typeof module === 'undefined' && typeof window !== 'undefined') {
    console.log('🧪 A5 Test loaded - run with: await GMKBTest.tests.A5()');
}
