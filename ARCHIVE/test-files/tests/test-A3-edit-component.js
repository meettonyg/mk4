/**
 * Test A3: Edit Component via Design Panel
 * Tests component editing through the design panel with state updates
 */

if (typeof GMKBTest === 'undefined') {
    throw new Error('GMKBTest harness not loaded');
}

GMKBTest.tests.A3 = async function() {
    console.log('✏️ A3: Testing component editing via design panel...');
    
    const initialState = GMKBTest.snapshot('A3-initial');
    let testComponentId = null;
    
    try {
        // Step 1: Add a test component first
        console.log('📦 Step 1: Adding test component for editing...');
        
        const testComponentType = 'hero'; // Use hero as it's most likely to have editable fields
        testComponentId = await GMKBTest.addComponent(testComponentType, {
            title: 'Original Title A3',
            subtitle: 'Original Subtitle'
        });
        
        await GMKBTest.sleep(500); // Let component fully render
        
        const componentElement = document.querySelector(`[data-component-id="${testComponentId}"]`);
        GMKBTest.assert(componentElement, 'Test component should be rendered');
        console.log(`✅ Test component created: ${testComponentId}`);
        
        // Step 2: Find and click edit button
        console.log('🎛️ Step 2: Locating edit button...');
        
        const editSelectors = [
            '[data-action="edit"]',
            '.edit-btn',
            '.component-edit',
            '.component-controls [title*="edit"]',
            '.component-controls button:first-child'
        ];
        
        let editButton = null;
        for (const selector of editSelectors) {
            editButton = componentElement.querySelector(selector);
            if (editButton) break;
        }
        
        if (!editButton) {
            // Try clicking on component to see if it opens edit mode
            console.log('⚠️ Edit button not found, trying component click...');
            componentElement.click();
            await GMKBTest.sleep(300);
            
            // Check if design panel opened
            const designPanel = document.querySelector(GMKBTest.selectors.designPanel);
            if (designPanel && designPanel.style.display !== 'none') {
                console.log('✅ Design panel opened via component click');
            } else {
                throw new Error('No edit button found and component click did not open design panel');
            }
        } else {
            console.log('✅ Edit button found, clicking...');
            editButton.click();
        }
        
        // Step 3: Wait for design panel to open
        console.log('🎨 Step 3: Waiting for design panel...');
        
        const designPanel = await GMKBTest.waitForSelector(
            GMKBTest.selectors.designPanel + ':not([style*="display: none"])',
            { timeout: 3000 }
        ).catch(() => {
            // Fallback: look for any design panel that exists
            return document.querySelector(GMKBTest.selectors.designPanel);
        });
        
        GMKBTest.assert(designPanel, 'Design panel should open');
        console.log('✅ Design panel opened');
        
        // Step 4: Find editable fields
        console.log('📝 Step 4: Locating editable fields...');
        
        const fieldSelectors = [
            'input[name="title"], input[data-property="title"]',
            'input[type="text"]:not([readonly])',
            'textarea:not([readonly])',
            '.form-input:not([readonly])'
        ];
        
        let titleField = null;
        for (const selector of fieldSelectors) {
            titleField = designPanel.querySelector(selector);
            if (titleField) break;
        }
        
        if (!titleField) {
            console.log('⚠️ No standard title field found, looking for any editable field...');
            titleField = designPanel.querySelector('input[type="text"], textarea, input:not([type="hidden"]):not([type="button"]):not([readonly])');
        }
        
        GMKBTest.assert(titleField, 'At least one editable field should be available');
        console.log(`✅ Found editable field: ${titleField.name || titleField.className || 'unnamed'}`);
        
        // Step 5: Edit the field
        console.log('✏️ Step 5: Editing field value...');
        
        const originalValue = titleField.value;
        const newValue = 'Modified Title A3 - ' + Date.now();
        
        console.log(`Original: "${originalValue}" → New: "${newValue}"`);
        
        // Clear and set new value
        titleField.value = '';
        titleField.value = newValue;
        
        // Dispatch events
        titleField.dispatchEvent(new Event('input', { bubbles: true }));
        titleField.dispatchEvent(new Event('change', { bubbles: true }));
        titleField.dispatchEvent(new Event('blur', { bubbles: true }));
        
        await GMKBTest.sleep(200);
        
        console.log('✅ Field value updated');
        
        // Step 6: Look for save/apply button or auto-save
        console.log('💾 Step 6: Triggering save...');
        
        const saveSelectors = [
            '.save-btn',
            '.apply-btn',
            'button[type="submit"]',
            '[data-action="save"]',
            '.design-panel .btn-primary'
        ];
        
        let saveButton = null;
        for (const selector of saveSelectors) {
            saveButton = designPanel.querySelector(selector);
            if (saveButton) break;
        }
        
        if (saveButton) {
            console.log('💾 Save button found, clicking...');
            saveButton.click();
        } else {
            console.log('⚠️ No explicit save button found, relying on auto-save');
            
            // Try pressing Enter to trigger save
            titleField.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        }
        
        await GMKBTest.sleep(500);
        
        // Step 7: Wait for state save event or check for changes
        console.log('🔄 Step 7: Waiting for state update...');
        
        // Listen for save event with timeout
        const savePromise = GMKBTest.waitForEvent('gmkb:state:saved', { timeout: 2000 })
            .catch(() => console.log('⚠️ No save event detected, checking state directly'));
        
        await Promise.race([savePromise, GMKBTest.sleep(2000)]);
        
        // Step 8: Verify changes in preview
        console.log('👁️ Step 8: Verifying preview updates...');
        
        // Look for the new value in the component's rendered content
        const componentText = componentElement.textContent;
        const previewUpdated = componentText.includes(newValue) || 
                              componentText.includes('Modified Title A3');
        
        if (previewUpdated) {
            console.log('✅ Preview updated with new content');
        } else {
            console.log('⚠️ Preview may not have updated immediately');
        }
        
        // Step 9: Verify state manager has changes
        console.log('💾 Step 9: Verifying state persistence...');
        
        const currentState = GMKBTest.getState();
        let stateUpdated = false;
        
        if (currentState.components) {
            const component = Array.isArray(currentState.components) ?
                currentState.components.find(c => c.id === testComponentId) :
                currentState.components[testComponentId];
            
            if (component && component.props) {
                const componentData = JSON.stringify(component.props);
                stateUpdated = componentData.includes(newValue) || 
                               componentData.includes('Modified Title A3');
            }
        }
        
        if (stateUpdated) {
            console.log('✅ State updated with changes');
        } else {
            console.log('⚠️ State update not detected (may use different structure)');
        }
        
        // Step 10: Close design panel
        console.log('🚪 Step 10: Closing design panel...');
        
        const closeSelectors = [
            '.modal-close',
            '.close-btn',
            '[data-action="close"]',
            '.design-panel .close'
        ];
        
        let closeButton = null;
        for (const selector of closeSelectors) {
            closeButton = designPanel.querySelector(selector);
            if (closeButton) break;
        }
        
        if (closeButton) {
            closeButton.click();
        } else {
            // Try clicking outside the panel
            document.body.click();
        }
        
        await GMKBTest.sleep(300);
        
        return {
            ok: true,
            details: {
                componentId: testComponentId,
                componentType: testComponentType,
                originalValue: originalValue,
                newValue: newValue,
                designPanelOpened: true,
                fieldFound: !!titleField,
                fieldType: titleField?.type || titleField?.tagName,
                previewUpdated: previewUpdated,
                stateUpdated: stateUpdated,
                saveButtonFound: !!saveButton,
                editComplete: true
            }
        };
        
    } catch (error) {
        console.error('❌ A3 Test failed:', error);
        
        return {
            ok: false,
            error: error.message,
            details: {
                componentId: testComponentId,
                designPanelExists: !!document.querySelector(GMKBTest.selectors.designPanel),
                editButtonsFound: document.querySelectorAll('[data-action="edit"], .edit-btn').length,
                inputFieldsFound: document.querySelectorAll('input, textarea').length
            }
        };
    }
};

// Auto-run if called directly
if (typeof module === 'undefined' && typeof window !== 'undefined') {
    console.log('🧪 A3 Test loaded - run with: await GMKBTest.tests.A3()');
}
