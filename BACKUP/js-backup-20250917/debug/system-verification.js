/**
 * Final System Verification Test
 * ROOT FIX: Single source of truth for testing
 * No fallbacks, no workarounds - just definitive tests
 */

window.SystemVerification = {
    
    async run() {
        console.clear();
        console.log('🔍 SYSTEM VERIFICATION - ROOT FIXES APPLIED');
        console.log('='.repeat(50));
        
        const results = {
            passed: [],
            failed: []
        };
        
        // Test 1: AJAX Endpoints
        console.log('\n📡 Testing AJAX Endpoints...');
        
        const endpoints = [
            { action: 'gmkb_get_available_components' },
            { action: 'gmkb_get_themes' },
            { action: 'gmkb_save_media_kit', post_id: gmkbData.postId || gmkbData.post_id || 0 },
            { action: 'gmkb_load_media_kit', post_id: gmkbData.postId || gmkbData.post_id || 0 }
        ];
        
        for (const endpoint of endpoints) {
            try {
                const params = {
                    action: endpoint.action,
                    nonce: gmkbData.nonce || ''
                };
                
                // Add additional parameters if present
                if (endpoint.post_id) {
                    params.post_id = endpoint.post_id;
                }
                
                const response = await fetch(gmkbData.ajaxUrl, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/x-www-form-urlencoded',
                    },
                    body: new URLSearchParams(params)
                });
                
                if (response.ok) {
                    const data = await response.json();
                    if (data.success !== false) {
                        console.log(`✅ ${endpoint.action}: Working`);
                        results.passed.push(endpoint.action);
                    } else {
                        console.log(`❌ ${endpoint.action}: Failed - ${data.data}`);
                        results.failed.push(endpoint.action);
                    }
                } else {
                    console.log(`❌ ${endpoint.action}: HTTP ${response.status}`);
                    results.failed.push(endpoint.action);
                }
            } catch (e) {
                console.log(`❌ ${endpoint.action}: ${e.message}`);
                results.failed.push(endpoint.action);
            }
        }
        
        // Test 2: Component Discovery
        console.log('\n🔧 Testing Component Discovery...');
        
        try {
            const response = await fetch(gmkbData.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'gmkb_get_available_components',
                    nonce: gmkbData.nonce
                })
            });
            
            const data = await response.json();
            if (data.success && data.data.components) {
                console.log(`✅ Component Discovery: ${data.data.total || data.data.components.length} components found`);
                results.passed.push('component_discovery');
            } else {
                console.log(`❌ Component Discovery: Failed`);
                results.failed.push('component_discovery');
            }
        } catch (e) {
            console.log(`❌ Component Discovery: ${e.message}`);
            results.failed.push('component_discovery');
        }
        
        // Test 3: Theme Discovery
        console.log('\n🎨 Testing Theme Discovery...');
        
        try {
            const response = await fetch(gmkbData.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'gmkb_get_themes',
                    nonce: gmkbData.nonce
                })
            });
            
            const data = await response.json();
            if (data.success && data.data.themes) {
                console.log(`✅ Theme Discovery: ${data.data.total || data.data.themes.length} themes found`);
                results.passed.push('theme_discovery');
            } else {
                console.log(`❌ Theme Discovery: Failed`);
                results.failed.push('theme_discovery');
            }
        } catch (e) {
            console.log(`❌ Theme Discovery: ${e.message}`);
            results.failed.push('theme_discovery');
        }
        
        // Test 4: State Schema
        console.log('\n📋 Testing State Schema...');
        
        if (window.enhancedStateManager) {
            const state = window.enhancedStateManager.getState();
            
            // Check for theme property at root
            if (state && typeof state === 'object') {
                if ('theme' in state) {
                    console.log(`✅ State Schema: 'theme' property exists in state`);
                    results.passed.push('state_theme');
                } else if (window.defaultState && 'theme' in window.defaultState) {
                    console.log(`✅ State Schema: 'theme' property exists in default`);
                    results.passed.push('state_theme');
                } else {
                    console.log(`❌ State Schema: 'theme' property missing`);
                    results.failed.push('state_theme');
                }
                
                // Check required properties
                const required = ['layout', 'components', 'globalSettings'];
                for (const prop of required) {
                    if (prop in state) {
                        console.log(`✅ State Schema: '${prop}' property exists`);
                        results.passed.push(`state_${prop}`);
                    } else {
                        console.log(`❌ State Schema: '${prop}' property missing`);
                        results.failed.push(`state_${prop}`);
                    }
                }
            } else {
                console.log(`⚠️ State Schema: State is not an object or is null`);
                results.failed.push('state_invalid');
            }
        } else {
            console.log(`⚠️ State Schema: State manager not available`);
            results.failed.push('state_manager');
        }
        
        // Test 5: UI Elements
        console.log('\n🖼️ Testing UI Elements...');
        
        const uiElements = {
            'save-btn': 'Save Button',
            'gmkb-builder-container': 'Builder Container',
            'gmkb-sidebar': 'Sidebar',
            'gmkb-preview-area': 'Preview Area'
        };
        
        for (const [id, name] of Object.entries(uiElements)) {
            const element = document.getElementById(id) || 
                           document.querySelector(`.${id}`) ||
                           document.querySelector(`[data-id="${id}"]`);
            
            if (element) {
                console.log(`✅ ${name}: Found`);
                results.passed.push(id);
            } else {
                console.log(`❌ ${name}: Not found`);
                results.failed.push(id);
            }
        }
        
        // Final Report
        console.log('\n' + '='.repeat(50));
        console.log('📊 VERIFICATION RESULTS');
        console.log('='.repeat(50));
        console.log(`✅ Passed: ${results.passed.length}`);
        console.log(`❌ Failed: ${results.failed.length}`);
        console.log(`Success Rate: ${((results.passed.length / (results.passed.length + results.failed.length)) * 100).toFixed(1)}%`);
        
        if (results.failed.length > 0) {
            console.log('\n❌ Failed Tests:');
            results.failed.forEach(test => console.log(`  - ${test}`));
        }
        
        if (results.failed.length === 0) {
            console.log('\n🎉 ALL SYSTEMS OPERATIONAL - NO FALLBACKS NEEDED!');
        }
        
        return results;
    }
};

console.log('✅ System Verification Loaded');
console.log('Run: SystemVerification.run() to test all root fixes');
