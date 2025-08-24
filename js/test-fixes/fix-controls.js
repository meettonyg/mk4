/**
 * Test and fix component controls issues
 */
(function() {
    'use strict';
    
    console.log('🔧 Loading component controls fix script...');
    
    // ROOT FIX: Function to fix all control issues
    window.fixAllControlIssues = function() {
        console.log('🔧 FIXING ALL CONTROL ISSUES');
        console.log('='.repeat(60));
        
        // Step 1: Fix any components missing ID and data-component-id attributes
        const allComponents = document.querySelectorAll('.media-kit-component, .content-section[data-component-type]');
        let fixedCount = 0;
        
        allComponents.forEach(component => {
            let componentId = component.getAttribute('data-component-id') || component.id;
            
            // If no ID at all, try to find from parent or generate one
            if (!componentId) {
                // Look for topics-specific ID pattern
                const parent = component.closest('[id^="topics-"]');
                if (parent) {
                    componentId = parent.id;
                } else {
                    // Generate ID based on component type
                    const type = component.getAttribute('data-component-type') || 'unknown';
                    componentId = `${type}-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
                }
            }
            
            // Ensure both id and data-component-id are set
            if (!component.id) {
                component.id = componentId;
                fixedCount++;
                console.log(`✅ Set id="${componentId}" on component`);
            }
            
            if (!component.hasAttribute('data-component-id')) {
                component.setAttribute('data-component-id', componentId);
                fixedCount++;
                console.log(`✅ Set data-component-id="${componentId}" on component`);
            }
            
            // Ensure component has proper class
            if (!component.classList.contains('media-kit-component')) {
                component.classList.add('media-kit-component');
            }
        });
        
        console.log(`\n📊 Fixed ${fixedCount} component attributes`);
        
        // Step 2: Remove any existing controls to start fresh (including legacy element-controls)
        const existingControls = document.querySelectorAll('.component-controls, .element-controls, .control-btn, .control-toolbar');
        existingControls.forEach(ctrl => ctrl.remove());
        console.log(`🗑️ Removed ${existingControls.length} existing control elements`);
        
        // Step 3: Force attach controls to all components
        let controlsAttachedCount = 0;
        if (window.componentControlsManager) {
            const uniqueComponents = new Map();
            document.querySelectorAll('[data-component-id]').forEach(el => {
                const id = el.getAttribute('data-component-id');
                if (id && el.id === id) { // Only root components
                    uniqueComponents.set(id, el);
                }
            });
            
            console.log(`\n🎯 Attaching controls to ${uniqueComponents.size} components...`);
            
            uniqueComponents.forEach((element, componentId) => {
                const success = window.componentControlsManager.attachControls(element, componentId);
                if (success) {
                    console.log(`✅ Controls attached to ${componentId}`);
                    controlsAttachedCount++;
                } else {
                    console.log(`❌ Failed to attach controls to ${componentId}`);
                }
            });
        }
        
        // Step 4: Enable debug mode to see controls
        document.body.classList.add('gmkb-debug-mode');
        window.GMKBDebugMode = true;
        
        // Step 5: Force show all controls
        const allControls = document.querySelectorAll('.component-controls--dynamic');
        allControls.forEach(controls => {
            controls.style.opacity = '1';
            controls.style.visibility = 'visible';
            controls.style.pointerEvents = 'all';
            controls.style.border = '2px solid lime';
        });
        
        console.log('\n✅ FIX COMPLETE!');
        console.log(`📊 ${allControls.length} control groups now visible`);
        console.log('🖱️ Hover over components to test controls');
        
        return {
            componentsFixed: fixedCount,
            controlsAttached: controlsAttachedCount,
            controlsVisible: allControls.length
        };
    };
    
    // ROOT FIX: Test topics loading
    window.testTopicsLoading = function() {
        console.log('🔍 TESTING TOPICS LOADING');
        console.log('='.repeat(60));
        
        const topicsComponents = document.querySelectorAll('[data-component-type="topics"]');
        console.log(`Found ${topicsComponents.length} topics components`);
        
        topicsComponents.forEach((component, index) => {
            console.log(`\nTopics Component ${index + 1}:`);
            console.log(`  ID: ${component.id}`);
            console.log(`  data-component-id: ${component.getAttribute('data-component-id')}`);
            
            const topicItems = component.querySelectorAll('.topic-item');
            console.log(`  Topics found: ${topicItems.length}`);
            
            topicItems.forEach((item, i) => {
                const title = item.querySelector('.topic-title');
                console.log(`    Topic ${i + 1}: "${title ? title.textContent.trim() : 'NO TITLE'}"`)
            });
            
            const debugNotice = component.querySelector('.debug-notice');
            if (debugNotice) {
                console.log(`  Debug: ${debugNotice.textContent.trim()}`);
            }
        });
    };
    
    // ROOT FIX: Complete diagnostic and fix
    window.diagnoseAndFix = function() {
        console.group('🏥 COMPLETE DIAGNOSIS AND FIX');
        
        // Test topics loading
        window.testTopicsLoading();
        
        console.log('\n' + '='.repeat(60) + '\n');
        
        // Fix all control issues
        const result = window.fixAllControlIssues();
        
        console.groupEnd();
        
        return result;
    };
    
    // Auto-run diagnostic after a short delay
    setTimeout(() => {
        console.log('🤖 Auto-running diagnostic...');
        window.diagnoseAndFix();
    }, 2000);
    
    console.log('✅ Control fix script loaded!');
    console.log('Commands available:');
    console.log('  - diagnoseAndFix() : Complete diagnosis and fix');
    console.log('  - fixAllControlIssues() : Fix control issues only');
    console.log('  - testTopicsLoading() : Test topics data loading');
    
})();
