/**
 * Test Architecture Fix
 * Verifies that the central ID generation is working correctly
 */
(function() {
    'use strict';
    
    console.log('=== TESTING ARCHITECTURE FIX ===');
    
    // Wait for systems to be ready
    const runTests = () => {
        console.log('\n🔍 Checking Systems...\n');
        
        // Test 1: Check if ID Generator exists
        if (window.gmkbIDGenerator) {
            console.log('✅ ID Generator found');
            
            // Test generating IDs
            const testComponentId = window.gmkbIDGenerator.generateComponentId('test');
            const testSectionId = window.gmkbIDGenerator.generateSectionId();
            
            console.log('  Generated test component ID:', testComponentId);
            console.log('  Generated test section ID:', testSectionId);
            
            // Check format
            const hasCorrectFormat = testComponentId.includes('test-') && testSectionId.includes('section-');
            console.log(hasCorrectFormat ? '  ✅ ID format is correct' : '  ❌ ID format is incorrect');
            
            // Get stats
            const stats = window.gmkbIDGenerator.getStats();
            console.log('  Statistics:', stats);
        } else {
            console.log('❌ ID Generator NOT found');
        }
        
        console.log('');
        
        // Test 2: Check Component Manager
        if (window.enhancedComponentManager) {
            console.log('✅ Component Manager found');
            
            // Check if it has the ID generator
            if (window.enhancedComponentManager.idGenerator) {
                console.log('  ✅ Component Manager has ID generator reference');
            } else {
                console.log('  ❌ Component Manager missing ID generator reference');
            }
        } else {
            console.log('❌ Component Manager NOT found');
        }
        
        console.log('');
        
        // Test 3: Check Section Manager
        if (window.sectionLayoutManager) {
            console.log('✅ Section Manager found');
            
            // Check if it has the ID generator
            if (window.sectionLayoutManager.idGenerator) {
                console.log('  ✅ Section Manager has ID generator reference');
            } else {
                console.log('  ❌ Section Manager missing ID generator reference');
            }
        } else {
            console.log('❌ Section Manager NOT found');
        }
        
        console.log('');
        
        // Test 4: Test creating a new component
        console.log('📦 Testing new component creation...');
        
        if (window.enhancedComponentManager && window.enhancedComponentManager.addComponent) {
            // Create a test component
            window.enhancedComponentManager.addComponent('hero', {
                title: 'Architecture Test Hero',
                subtitle: 'Testing central ID generation'
            }).then(componentId => {
                console.log('  ✅ Created test component with ID:', componentId);
                
                // Check ID format
                if (componentId.includes('hero-') && componentId.split('-').length >= 3) {
                    console.log('  ✅ New component uses correct ID format');
                } else {
                    console.log('  ❌ Component ID format unexpected:', componentId);
                }
                
                // Clean up - remove test component
                setTimeout(() => {
                    if (window.enhancedComponentManager.removeComponent) {
                        window.enhancedComponentManager.removeComponent(componentId);
                        console.log('  🧹 Test component removed');
                    }
                }, 2000);
            }).catch(error => {
                console.log('  ❌ Failed to create test component:', error.message);
            });
        } else {
            console.log('  ❌ Component Manager not ready for testing');
        }
        
        console.log('');
        
        // Test 5: Check for duplicate IDs
        console.log('🔍 Checking for duplicate component IDs...');
        
        const componentElements = document.querySelectorAll('[data-component-id]');
        const componentIds = Array.from(componentElements).map(el => el.dataset.componentId);
        const uniqueIds = new Set(componentIds);
        
        if (componentIds.length === uniqueIds.size) {
            console.log('  ✅ No duplicate component IDs found');
            console.log('  Total components:', componentIds.length);
        } else {
            const duplicates = componentIds.filter((id, index) => componentIds.indexOf(id) !== index);
            console.log('  ❌ Found duplicate IDs:', [...new Set(duplicates)]);
        }
        
        console.log('');
        console.log('=== ARCHITECTURE FIX TEST COMPLETE ===');
        console.log('');
        
        // Show quick stats
        if (window.gmkbIDGenerator) {
            const finalStats = window.gmkbIDGenerator.getStats();
            console.log('Final ID Generator Stats:', finalStats);
        }
    };
    
    // Run tests when systems are ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', () => {
            setTimeout(runTests, 1000);
        });
    } else {
        setTimeout(runTests, 1000);
    }
    
    // Export test function for manual use
    window.testArchitectureFix = runTests;
    
    console.log('Architecture Fix Test: Ready');
    console.log('Run testArchitectureFix() to test manually');
    
})();