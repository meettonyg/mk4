/**
 * Test Section Edit Panel
 * Debug script to test section edit panel functionality
 */

(function() {
    'use strict';
    
    console.log('🧪 Test Section Edit Panel Script Loading...');
    
    // Wait for DOM ready
    function onReady(callback) {
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', callback);
        } else {
            callback();
        }
    }
    
    onReady(() => {
        console.log('🧪 Testing Section Edit Panel...');
        
        // Test 1: Check if section edit panel exists
        function checkEditPanel() {
            const panel = document.getElementById('section-edit-panel');
            if (panel) {
                console.log('✅ Section edit panel found in DOM');
                return true;
            } else {
                console.log('❌ Section edit panel NOT found');
                return false;
            }
        }
        
        // Test 2: Try to trigger edit panel
        function triggerEditPanel(sectionId = 'test-section-123') {
            console.log(`🔧 Triggering edit panel for section: ${sectionId}`);
            
            // Dispatch the edit event
            document.dispatchEvent(new CustomEvent('gmkb:section-edit-requested', {
                detail: { sectionId }
            }));
        }
        
        // Test 3: Create a test section if none exist
        function createTestSection() {
            if (window.sectionLayoutManager) {
                const sectionId = `test_section_${Date.now()}`;
                console.log(`🔧 Creating test section: ${sectionId}`);
                
                const section = window.sectionLayoutManager.registerSection(sectionId, 'full_width');
                if (section) {
                    console.log('✅ Test section created successfully');
                    return sectionId;
                }
            } else {
                console.log('❌ SectionLayoutManager not available');
            }
            return null;
        }
        
        // Test 4: Find first existing section
        function findFirstSection() {
            const section = document.querySelector('.gmkb-section');
            if (section) {
                const sectionId = section.dataset.sectionId || section.id?.replace('section-', '');
                console.log(`✅ Found existing section: ${sectionId}`);
                return sectionId;
            }
            console.log('❌ No sections found in DOM');
            return null;
        }
        
        // Run tests
        window.testSectionEditPanel = function() {
            console.log('===== SECTION EDIT PANEL TESTS =====');
            
            // Check if panel exists
            if (!checkEditPanel()) {
                // Try to initialize it
                if (!window.sectionEditPanel) {
                    console.log('🔧 Initializing SectionEditPanel...');
                    window.sectionEditPanel = new window.SectionEditPanel();
                    setTimeout(() => checkEditPanel(), 500);
                }
            }
            
            // Find or create a section
            let sectionId = findFirstSection();
            if (!sectionId) {
                sectionId = createTestSection();
            }
            
            // Trigger edit panel
            if (sectionId) {
                setTimeout(() => {
                    triggerEditPanel(sectionId);
                    
                    // Check if panel opened
                    setTimeout(() => {
                        const panel = document.getElementById('section-edit-panel');
                        if (panel && panel.style.display !== 'none') {
                            console.log('✅ Edit panel opened successfully!');
                        } else {
                            console.log('❌ Edit panel did not open');
                            
                            // Try to show it manually
                            if (panel) {
                                panel.style.display = 'block';
                                console.log('🔧 Manually showed edit panel');
                            }
                        }
                    }, 500);
                }, 1000);
            }
            
            console.log('===== TESTS COMPLETE =====');
        };
        
        // Auto-run tests
        setTimeout(() => {
            window.testSectionEditPanel();
        }, 2000);
        
        // Add console commands
        console.log(`
📝 Section Edit Panel Test Commands:
• testSectionEditPanel() - Run all tests
• document.dispatchEvent(new CustomEvent('gmkb:section-edit-requested', {detail:{sectionId:'YOUR_SECTION_ID'}})) - Open edit panel
• sectionEditPanel.openPanel('YOUR_SECTION_ID') - Direct open
        `);
    });
})();
