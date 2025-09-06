/**
 * Test B2: Auto-save after Edits
 * Tests automatic saving functionality after component modifications
 */

if (typeof GMKBTest === 'undefined') {
    throw new Error('GMKBTest harness not loaded');
}

GMKBTest.tests.B2 = async function() {
    console.log('💾 B2: Testing auto-save functionality...');
    
    const initialState = GMKBTest.snapshot('B2-initial');
    let testComponentId = null;
    
    try {
        // Step 1: Add a test component to trigger auto-save
        console.log('📦 Step 1: Adding test component...');
        
        testComponentId = await GMKBTest.addComponent('hero', {
            title: 'Auto-save Test B2'
        });
        
        await GMKBTest.sleep(500);
        console.log(`✅ Test component created: ${testComponentId}`);
        
        // Step 2: Listen for save events
        console.log('👂 Step 2: Setting up save event listeners...');
        
        let saveEventsHeard = [];
        const saveEventTypes = [
            'gmkb:state:saved',
            'gmkb:auto-save',
            'gmkb:save-complete',
            'state:saved'
        ];
        
        const eventListeners = [];
        saveEventTypes.forEach(eventType => {
            const listener = (event) => {
                saveEventsHeard.push({
                    type: eventType,
                    timestamp: Date.now(),
                    detail: event.detail
                });
                console.log(`📡 Save event detected: ${eventType}`, event.detail);
            };
            
            document.addEventListener(eventType, listener);
            eventListeners.push({ type: eventType, listener });
        });
        
        console.log('✅ Save event listeners established');
        
        // Step 3: Test auto-save after component addition
        console.log('➕ Step 3: Testing auto-save after addition...');
        
        // Wait for potential auto-save after addition
        await GMKBTest.sleep(2000);
        
        const additionSaveEvents = saveEventsHeard.filter(event => 
            Date.now() - event.timestamp < 3000
        );
        
        if (additionSaveEvents.length > 0) {
            console.log(`✅ Auto-save triggered after addition: ${additionSaveEvents.length} events`);
        } else {
            console.log('⚠️ No auto-save detected after addition (may be delayed or disabled)');
        }
        
        // Step 4: Test auto-save after component editing
        console.log('✏️ Step 4: Testing auto-save after editing...');
        
        const componentElement = document.querySelector(`[data-component-id="${testComponentId}"]`);
        GMKBTest.assert(componentElement, 'Test component should exist in DOM');
        
        // Clear previous save events
        saveEventsHeard = [];
        
        // Try to trigger an edit via state manager
        if (window.enhancedStateManager && window.enhancedStateManager.updateComponent) {
            console.log('🔧 Updating component via state manager...');
            
            window.enhancedStateManager.updateComponent(testComponentId, {
                title: 'Auto-save Test B2 - Modified ' + Date.now(),
                modified: true
            });
            
            await GMKBTest.sleep(1500); // Wait for auto-save delay
            
            const editSaveEvents = saveEventsHeard.filter(event => 
                Date.now() - event.timestamp < 2000
            );
            
            if (editSaveEvents.length > 0) {
                console.log(`✅ Auto-save triggered after edit: ${editSaveEvents.length} events`);
            } else {
                console.log('⚠️ No auto-save detected after edit');
            }
        } else {
            console.log('⚠️ Cannot test state manager edit - updateComponent not available');
        }
        
        // Step 5: Test manual save functionality
        console.log('🖱️ Step 5: Testing manual save...');
        
        const saveButton = document.querySelector(GMKBTest.selectors.toolbarSave);
        let manualSaveWorked = false;
        
        if (saveButton) {
            console.log('💾 Save button found, clicking...');
            
            saveEventsHeard = []; // Clear previous events
            saveButton.click();
            
            await GMKBTest.sleep(1000);
            
            const manualSaveEvents = saveEventsHeard.filter(event => 
                Date.now() - event.timestamp < 1500
            );
            
            if (manualSaveEvents.length > 0) {
                console.log(`✅ Manual save triggered: ${manualSaveEvents.length} events`);
                manualSaveWorked = true;
            } else {
                console.log('⚠️ No save events after manual save button click');
            }
        } else {
            console.log('⚠️ Save button not found in DOM');
        }
        
        // Step 6: Test AJAX save request (if possible to observe)
        console.log('📡 Step 6: Testing AJAX save functionality...');
        
        let ajaxIntercepted = false;
        const originalFetch = window.fetch;
        const originalXHROpen = XMLHttpRequest.prototype.open;
        
        const ajaxRequests = [];
        
        // Intercept fetch requests
        window.fetch = function(url, options) {
            if (url.includes('admin-ajax.php') || url.includes('guestify_save')) {
                ajaxRequests.push({ type: 'fetch', url, options, timestamp: Date.now() });
                console.log('📨 AJAX save request intercepted (fetch):', url);
                ajaxIntercepted = true;
            }
            return originalFetch.apply(this, arguments);
        };
        
        // Intercept XMLHttpRequest
        XMLHttpRequest.prototype.open = function(method, url) {
            if (url.includes('admin-ajax.php') || url.includes('guestify_save')) {
                ajaxRequests.push({ type: 'xhr', method, url, timestamp: Date.now() });
                console.log('📨 AJAX save request intercepted (XHR):', method, url);
                ajaxIntercepted = true;
            }
            return originalXHROpen.apply(this, arguments);
        };
        
        // Trigger another save to test AJAX
        if (window.enhancedComponentManager && window.enhancedComponentManager.manualSave) {
            console.log('🔧 Triggering manual save via component manager...');
            
            try {
                await window.enhancedComponentManager.manualSave();
                await GMKBTest.sleep(1000);
                
                if (ajaxIntercepted) {
                    console.log('✅ AJAX save request detected');
                } else {
                    console.log('⚠️ No AJAX save request intercepted');
                }
            } catch (error) {
                console.log('⚠️ Manual save via component manager failed:', error.message);
            }
        }
        
        // Restore original functions
        window.fetch = originalFetch;
        XMLHttpRequest.prototype.open = originalXHROpen;
        
        // Step 7: Test save debouncing (rapid changes)
        console.log('⏰ Step 7: Testing save debouncing...');
        
        saveEventsHeard = []; // Clear events
        
        // Make rapid changes
        if (window.enhancedStateManager) {
            for (let i = 0; i < 5; i++) {
                window.enhancedStateManager.updateComponent(testComponentId, {
                    title: `Rapid change ${i} - ${Date.now()}`
                });
                await GMKBTest.sleep(50); // Very fast changes
            }
            
            await GMKBTest.sleep(2000); // Wait for debounced save
            
            const debouncedSaves = saveEventsHeard.length;
            console.log(`📊 Save events after rapid changes: ${debouncedSaves}`);
            
            // Should be fewer saves than changes due to debouncing
            if (debouncedSaves < 5 && debouncedSaves > 0) {
                console.log('✅ Save debouncing appears to be working');
            } else if (debouncedSaves === 0) {
                console.log('⚠️ No saves triggered after rapid changes');
            } else {
                console.log('⚠️ Debouncing may not be working (too many save events)');
            }
        }
        
        // Step 8: Test save error handling
        console.log('⚠️ Step 8: Testing save error handling...');
        
        // Temporarily break AJAX to test error handling
        const originalAjaxUrl = window.gmkbData?.ajaxUrl;
        let errorHandled = false;
        
        if (originalAjaxUrl && window.gmkbData) {
            window.gmkbData.ajaxUrl = 'http://invalid-url-for-testing/admin-ajax.php';
            
            // Listen for error events
            const errorListener = (event) => {
                if (event.detail?.error || event.type.includes('error')) {
                    errorHandled = true;
                    console.log('📨 Save error event detected:', event.type);
                }
            };
            
            const errorEvents = ['gmkb:save-error', 'gmkb:error', 'state:save-error'];
            errorEvents.forEach(eventType => {
                document.addEventListener(eventType, errorListener);
            });
            
            // Try to save with broken URL
            if (window.enhancedComponentManager?.manualSave) {
                try {
                    await window.enhancedComponentManager.manualSave();
                    await GMKBTest.sleep(1000);
                } catch (error) {
                    errorHandled = true;
                    console.log('✅ Save error properly caught:', error.message);
                }
            }
            
            // Restore original URL
            window.gmkbData.ajaxUrl = originalAjaxUrl;
            
            // Clean up error listeners
            errorEvents.forEach(eventType => {
                document.removeEventListener(eventType, errorListener);
            });
        }
        
        // Clean up save event listeners
        eventListeners.forEach(({ type, listener }) => {
            document.removeEventListener(type, listener);
        });
        
        return {
            ok: true,
            details: {
                testComponentId: testComponentId,
                saveEventsTotal: saveEventsHeard.length,
                additionSaveEvents: additionSaveEvents.length,
                manualSaveWorked: manualSaveWorked,
                ajaxIntercepted: ajaxIntercepted,
                ajaxRequestsCount: ajaxRequests.length,
                errorHandled: errorHandled,
                saveButtonFound: !!document.querySelector(GMKBTest.selectors.toolbarSave),
                stateManagerAvailable: !!window.enhancedStateManager,
                componentManagerAvailable: !!window.enhancedComponentManager
            }
        };
        
    } catch (error) {
        console.error('❌ B2 Test failed:', error);
        
        return {
            ok: false,
            error: error.message,
            details: {
                testComponentId: testComponentId,
                stateManagerAvailable: !!window.enhancedStateManager,
                componentManagerAvailable: !!window.enhancedComponentManager,
                ajaxUrlAvailable: !!(window.gmkbData && window.gmkbData.ajaxUrl)
            }
        };
    }
};

// Auto-run if called directly
if (typeof module === 'undefined' && typeof window !== 'undefined') {
    console.log('🧪 B2 Test loaded - run with: await GMKBTest.tests.B2()');
}
