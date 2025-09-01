/**
 * WordPress Save/Load Pipeline Test
 * ROOT CAUSE ANALYSIS: Diagnose why saved data doesn't load on refresh
 */

(function() {
    'use strict';
    
    console.log('%c🔍 WORDPRESS SAVE/LOAD TEST', 'font-size: 16px; font-weight: bold; color: #4CAF50');
    
    // Test 1: Check what WordPress is providing
    window.testWordPressLoad = function() {
        console.group('📥 Test 1: WordPress Data Analysis');
        
        const wpData = window.gmkbData;
        if (!wpData) {
            console.error('❌ No WordPress data available (gmkbData missing)');
            console.groupEnd();
            return;
        }
        
        console.log('✅ WordPress data found');
        console.log('Post ID:', wpData.postId || wpData.post_id);
        
        // Check saved_state structure
        if (wpData.saved_state) {
            console.log('📊 saved_state structure:');
            console.log('- Type:', typeof wpData.saved_state);
            console.log('- Is Array:', Array.isArray(wpData.saved_state));
            console.log('- Keys:', Object.keys(wpData.saved_state));
            
            if (wpData.saved_state.components) {
                console.log('📦 Components in saved_state:');
                console.log('  - Type:', typeof wpData.saved_state.components);
                console.log('  - Is Array:', Array.isArray(wpData.saved_state.components));
                console.log('  - Keys:', Object.keys(wpData.saved_state.components));
                console.log('  - Count:', Object.keys(wpData.saved_state.components).length);
                
                // Check if it's an empty array being treated as object
                if (Array.isArray(wpData.saved_state.components) && wpData.saved_state.components.length === 0) {
                    console.warn('⚠️ Components is empty array [] - this causes issues!');
                    console.log('Should be empty object {} instead');
                }
                
                // Show first component if exists
                const firstKey = Object.keys(wpData.saved_state.components)[0];
                if (firstKey) {
                    console.log('  - First component:', firstKey, wpData.saved_state.components[firstKey]);
                }
            }
            
            // Check saved_components array
            if (wpData.saved_state.saved_components) {
                console.log('📋 saved_components array:');
                console.log('  - Type:', typeof wpData.saved_state.saved_components);
                console.log('  - Is Array:', Array.isArray(wpData.saved_state.saved_components));
                console.log('  - Length:', wpData.saved_state.saved_components.length);
                if (wpData.saved_state.saved_components.length > 0) {
                    console.log('  - First item:', wpData.saved_state.saved_components[0]);
                }
            }
        } else {
            console.log('❌ No saved_state in WordPress data');
        }
        
        // Check legacy saved_components
        if (wpData.saved_components) {
            console.log('📋 Legacy saved_components:');
            console.log('- Type:', typeof wpData.saved_components);
            console.log('- Is Array:', Array.isArray(wpData.saved_components));
            console.log('- Length:', wpData.saved_components.length);
        }
        
        console.groupEnd();
    };
    
    // Test 2: Check component format
    window.checkComponentFormat = function() {
        console.group('🔧 Test 2: Component Format Check');
        
        const state = window.enhancedStateManager?.getState();
        if (!state) {
            console.error('❌ State manager not available');
            console.groupEnd();
            return;
        }
        
        console.log('Current state components:');
        console.log('- Type:', typeof state.components);
        console.log('- Is Array:', Array.isArray(state.components));
        console.log('- Keys:', Object.keys(state.components || {}));
        console.log('- Count:', Object.keys(state.components || {}).length);
        
        // Check if components is incorrectly an array
        if (Array.isArray(state.components)) {
            console.error('❌ CRITICAL: state.components is an array - should be object!');
            console.log('This will prevent proper component storage and retrieval');
        } else if (typeof state.components === 'object') {
            console.log('✅ state.components is correctly an object');
        }
        
        console.groupEnd();
    };
    
    // Test 3: Test save functionality
    window.testSimpleSave = async function() {
        console.group('💾 Test 3: Simple Save Test');
        
        // Add a test component
        const testId = 'test-' + Date.now();
        const testComponent = {
            id: testId,
            type: 'hero',
            props: { title: 'Save Test Component' },
            timestamp: Date.now()
        };
        
        console.log('Adding test component:', testId);
        window.enhancedStateManager?.addComponent(testComponent);
        
        // Get state after adding
        const stateAfterAdd = window.enhancedStateManager?.getState();
        console.log('State after adding:');
        console.log('- Components type:', typeof stateAfterAdd?.components);
        console.log('- Component added:', stateAfterAdd?.components[testId]);
        console.log('- Layout includes ID:', stateAfterAdd?.layout?.includes(testId));
        
        // Trigger save
        console.log('Triggering WordPress save...');
        if (window.wordPressSaveIntegration) {
            try {
                const result = await window.wordPressSaveIntegration.save('test-save');
                console.log('✅ Save result:', result);
                
                // Check what was sent
                console.log('Components sent:', Object.keys(stateAfterAdd?.components || {}));
                console.log('Components format:', typeof stateAfterAdd?.components);
            } catch (error) {
                console.error('❌ Save failed:', error);
            }
        } else {
            console.error('❌ WordPress save integration not available');
        }
        
        console.groupEnd();
    };
    
    // Test 4: Direct database check
    window.checkDatabaseFormat = async function() {
        console.group('🗄️ Test 4: Database Format Check');
        
        const wpData = window.gmkbData;
        if (!wpData || !wpData.postId) {
            console.error('❌ No post ID available');
            console.groupEnd();
            return;
        }
        
        // Make a direct AJAX call to load the state
        const formData = new FormData();
        formData.append('action', 'guestify_load_media_kit');
        formData.append('post_id', wpData.postId);
        
        try {
            const response = await fetch(wpData.ajaxUrl + '?action=guestify_load_media_kit&post_id=' + wpData.postId);
            const result = await response.json();
            
            console.log('Database response:', result);
            
            if (result.success && result.data?.state) {
                const dbState = result.data.state;
                console.log('📊 Database state structure:');
                console.log('- Components type:', typeof dbState.components);
                console.log('- Components is array:', Array.isArray(dbState.components));
                console.log('- Components keys:', Object.keys(dbState.components || {}));
                console.log('- Components count:', Object.keys(dbState.components || {}).length);
                
                // Check for the array/object issue
                if (Array.isArray(dbState.components) && dbState.components.length === 0) {
                    console.error('❌ FOUND THE ISSUE: Database has components as empty array []');
                    console.log('This needs to be an empty object {} for JavaScript compatibility');
                }
            }
        } catch (error) {
            console.error('Failed to check database:', error);
        }
        
        console.groupEnd();
    };
    
    // Test 5: Fix empty array issue
    window.fixEmptyArrayIssue = function() {
        console.group('🔧 Test 5: Fix Empty Array Issue');
        
        const state = window.enhancedStateManager?.getState();
        if (!state) {
            console.error('❌ State manager not available');
            console.groupEnd();
            return;
        }
        
        // Check if components is an array
        if (Array.isArray(state.components)) {
            console.log('❌ Found components as array - fixing...');
            
            // Convert array to object
            const componentsObj = {};
            if (state.components.length > 0) {
                state.components.forEach(comp => {
                    if (comp && comp.id) {
                        componentsObj[comp.id] = comp;
                    }
                });
            }
            
            // Update state with fixed components
            window.enhancedStateManager?.applyTransaction({
                type: 'SET_STATE',
                payload: {
                    ...state,
                    components: componentsObj
                }
            });
            
            console.log('✅ Converted components array to object');
            console.log('New components:', componentsObj);
        } else {
            console.log('✅ Components is already an object');
        }
        
        console.groupEnd();
    };
    
    // Auto-run initial test
    console.log('\n🚀 Running initial WordPress load test...\n');
    testWordPressLoad();
    
    console.log('\n📋 Available test commands:');
    console.log('- testWordPressLoad() - Check what WordPress provides');
    console.log('- checkComponentFormat() - Check current state format');
    console.log('- testSimpleSave() - Test save functionality');
    console.log('- checkDatabaseFormat() - Check database directly');
    console.log('- fixEmptyArrayIssue() - Fix array/object issue');
    
})();
