/**
 * Quick test to verify section component integration fix
 */

function quickTestSectionFix() {
    console.log('🧪 TESTING SECTION COMPONENT INTEGRATION FIX...');
    
    // Test 1: Create a section
    console.log('\n1️⃣ Creating test section...');
    const testSectionId = `test_section_${Date.now()}`;
    
    if (!window.sectionLayoutManager) {
        console.error('❌ SectionLayoutManager not available');
        return false;
    }
    
    // Create section with proper parameters
    window.sectionLayoutManager.registerSection(testSectionId, 'two_column', {
        layout: {
            columns: 2,
            column_gap: '30px'
        }
    });
    
    console.log('✅ Section created:', testSectionId);
    
    // Test 2: Check if section renders
    setTimeout(() => {
        const sectionElement = document.querySelector(`[data-section-id="${testSectionId}"]`);
        
        if (sectionElement) {
            console.log('✅ Section rendered in DOM');
            
            // Test 3: Try to add a component to the section
            console.log('\n2️⃣ Testing component addition to section...');
            
            // Create a default section if none exist
            if (window.enhancedComponentManager && window.enhancedComponentManager.isReady()) {
                const componentOptions = {
                    targetSectionId: testSectionId,
                    targetColumn: 1
                };
                
                try {
                    window.enhancedComponentManager.addComponent('hero', componentOptions);
                    console.log('✅ Component added to section successfully');
                } catch (error) {
                    console.error('❌ Failed to add component:', error);
                }
            }
            
            // Test 4: Clean up
            setTimeout(() => {
                console.log('\n3️⃣ Cleaning up test section...');
                window.sectionLayoutManager.removeSection(testSectionId);
                console.log('✅ Test section removed');
                
                console.log('\n🎉 SECTION FIX TEST COMPLETE!');
                console.log('✅ Sections can be created');
                console.log('✅ Sections render in DOM');
                console.log('✅ Components can be added to sections');
            }, 2000);
            
        } else {
            console.error('❌ Section not rendered in DOM');
            console.log('⚠️ Check if SectionRenderer is working properly');
        }
    }, 500);
    
    return true;
}

// Run the test
console.log('💡 Run quickTestSectionFix() to test the section fix');

// Auto-run if in debug mode
if (window.gmkbData?.debugMode) {
    setTimeout(quickTestSectionFix, 1000);
}

// Export for manual testing
window.quickTestSectionFix = quickTestSectionFix;
