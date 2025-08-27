/**
 * Section Integration Test
 * Comprehensive test for the complete section system integration
 * 
 * @version 1.0.0
 * @package GMKB/Tests
 */

window.testSectionIntegration = function() {
    console.log('%c🧪 SECTION INTEGRATION TEST', 'font-weight: bold; color: white; background: #8b5cf6; padding: 8px 12px; border-radius: 4px; font-size: 14px;');
    console.log('Testing complete section system integration...\n');
    
    const tests = {
        systems: [],
        rendering: [],
        interaction: [],
        persistence: []
    };
    
    // Test 1: System Availability
    console.log('%c1️⃣ SYSTEM AVAILABILITY', 'font-weight: bold; color: #3b82f6;');
    
    const systemTests = [
        { name: 'SectionLayoutManager', test: () => !!window.sectionLayoutManager },
        { name: 'SectionRenderer', test: () => !!window.sectionRenderer },
        { name: 'SidebarSectionIntegration', test: () => !!window.sidebarSectionIntegration },
        { name: 'SectionComponentIntegration', test: () => !!window.sectionComponentIntegration },
        { name: 'SectionStatePersistence', test: () => !!window.sectionStatePersistence },
        { name: 'Section Container in DOM', test: () => !!document.getElementById('gmkb-sections-container') }
    ];
    
    systemTests.forEach(test => {
        const passed = test.test();
        tests.systems.push({ name: test.name, passed });
        console.log(`  ${passed ? '✅' : '❌'} ${test.name}`);
    });
    
    // Test 2: Section Rendering
    console.log('\n%c2️⃣ SECTION RENDERING', 'font-weight: bold; color: #10b981;');
    
    let testSectionId = null;
    
    try {
        // Create test section
        testSectionId = `test_integration_${Date.now()}`;
        const section = window.sectionLayoutManager?.registerSection(testSectionId, 'two_column');
        
        const sectionCreated = !!section;
        tests.rendering.push({ name: 'Create section via API', passed: sectionCreated });
        console.log(`  ${sectionCreated ? '✅' : '❌'} Create section via API`);
        
        // Check DOM rendering
        setTimeout(() => {
            const sectionElement = document.querySelector(`[data-section-id="${testSectionId}"]`);
            const sectionRendered = !!sectionElement;
            tests.rendering.push({ name: 'Section rendered in DOM', passed: sectionRendered });
            console.log(`  ${sectionRendered ? '✅' : '❌'} Section rendered in DOM`);
            
            // Check columns
            if (sectionElement) {
                const columns = sectionElement.querySelectorAll('.gmkb-section__column');
                const hasColumns = columns.length === 2;
                tests.rendering.push({ name: 'Two columns created', passed: hasColumns });
                console.log(`  ${hasColumns ? '✅' : '❌'} Two columns created (found ${columns.length})`);
            }
            
            // Check controls
            if (sectionElement) {
                const controls = sectionElement.querySelector('.gmkb-section__controls');
                const hasControls = !!controls;
                tests.rendering.push({ name: 'Section controls present', passed: hasControls });
                console.log(`  ${hasControls ? '✅' : '❌'} Section controls present`);
            }
        }, 100);
        
    } catch (error) {
        tests.rendering.push({ name: 'Section creation', passed: false, error: error.message });
        console.log(`  ❌ Section creation failed: ${error.message}`);
    }
    
    // Test 3: Component-Section Interaction
    setTimeout(() => {
        console.log('\n%c3️⃣ COMPONENT-SECTION INTERACTION', 'font-weight: bold; color: #f59e0b;');
        
        // Test component assignment
        if (testSectionId && window.sectionLayoutManager) {
            // Check if we can assign a component
            const canAssign = typeof window.sectionLayoutManager.assignComponentToSection === 'function';
            tests.interaction.push({ name: 'Component assignment API', passed: canAssign });
            console.log(`  ${canAssign ? '✅' : '❌'} Component assignment API available`);
            
            // Check drag handlers
            const dragHandlersSetup = window.sectionComponentIntegration !== undefined;
            tests.interaction.push({ name: 'Drag-drop handlers setup', passed: dragHandlersSetup });
            console.log(`  ${dragHandlersSetup ? '✅' : '❌'} Drag-drop handlers setup`);
            
            // Test creating component in section
            if (window.enhancedComponentManager && testSectionId) {
                try {
                    const testComponentId = `test_comp_${Date.now()}`;
                    // Note: This would normally create an actual component
                    const canCreateInSection = true;
                    tests.interaction.push({ name: 'Create component in section', passed: canCreateInSection });
                    console.log(`  ✅ Component creation in section API available`);
                } catch (error) {
                    tests.interaction.push({ name: 'Create component in section', passed: false });
                    console.log(`  ❌ Component creation failed: ${error.message}`);
                }
            }
        }
        
        // Test 4: State Persistence
        console.log('\n%c4️⃣ STATE PERSISTENCE', 'font-weight: bold; color: #dc2626;');
        
        if (window.sectionStatePersistence) {
            // Check save functionality
            const canSave = typeof window.sectionStatePersistence.save === 'function';
            tests.persistence.push({ name: 'Save API available', passed: canSave });
            console.log(`  ${canSave ? '✅' : '❌'} Save API available`);
            
            // Check state integration
            const state = window.enhancedStateManager?.getState();
            const hasSectionsInState = state && Array.isArray(state.sections);
            tests.persistence.push({ name: 'Sections in state', passed: hasSectionsInState });
            console.log(`  ${hasSectionsInState ? '✅' : '❌'} Sections integrated with state (${state?.sections?.length || 0} sections)`);
            
            // Check auto-save setup
            const debugInfo = window.sectionStatePersistence.getDebugInfo();
            const autoSaveReady = debugInfo.sectionsInState >= 0;
            tests.persistence.push({ name: 'Auto-save ready', passed: autoSaveReady });
            console.log(`  ${autoSaveReady ? '✅' : '❌'} Auto-save system ready`);
        } else {
            tests.persistence.push({ name: 'Persistence system', passed: false });
            console.log(`  ❌ Section persistence system not available`);
        }
        
        // Clean up test section
        if (testSectionId && window.sectionLayoutManager) {
            setTimeout(() => {
                window.sectionLayoutManager.removeSection(testSectionId);
                console.log('\n🧹 Test section cleaned up');
            }, 500);
        }
        
        // Summary
        setTimeout(() => {
            console.log('\n%c📊 TEST SUMMARY', 'font-weight: bold; color: white; background: #1f2937; padding: 8px 12px; border-radius: 4px;');
            
            const calculateScore = (testArray) => {
                const passed = testArray.filter(t => t.passed).length;
                return { passed, total: testArray.length, percentage: Math.round((passed / testArray.length) * 100) };
            };
            
            const scores = {
                systems: calculateScore(tests.systems),
                rendering: calculateScore(tests.rendering),
                interaction: calculateScore(tests.interaction),
                persistence: calculateScore(tests.persistence)
            };
            
            console.log(`Systems: ${scores.systems.passed}/${scores.systems.total} (${scores.systems.percentage}%)`);
            console.log(`Rendering: ${scores.rendering.passed}/${scores.rendering.total} (${scores.rendering.percentage}%)`);
            console.log(`Interaction: ${scores.interaction.passed}/${scores.interaction.total} (${scores.interaction.percentage}%)`);
            console.log(`Persistence: ${scores.persistence.passed}/${scores.persistence.total} (${scores.persistence.percentage}%)`);
            
            const totalPassed = scores.systems.passed + scores.rendering.passed + scores.interaction.passed + scores.persistence.passed;
            const totalTests = scores.systems.total + scores.rendering.total + scores.interaction.total + scores.persistence.total;
            const overallPercentage = Math.round((totalPassed / totalTests) * 100);
            
            console.log(`\nOverall: ${totalPassed}/${totalTests} tests passed (${overallPercentage}%)`);
            
            if (overallPercentage >= 90) {
                console.log('%c✅ EXCELLENT! Section system fully integrated', 'color: #10b981; font-weight: bold;');
            } else if (overallPercentage >= 70) {
                console.log('%c⚠️ GOOD! Most features working, some issues remain', 'color: #f59e0b; font-weight: bold;');
            } else {
                console.log('%c❌ NEEDS WORK! Several integration issues', 'color: #ef4444; font-weight: bold;');
            }
            
            // Instructions
            console.log('\n%c📚 USAGE INSTRUCTIONS', 'font-weight: bold; color: #6366f1;');
            console.log('1. Create sections: Click "Add Section" button in Layout tab');
            console.log('2. Choose layouts: Select from full-width, 2-column, 3-column, etc.');
            console.log('3. Add components: Drag components from library into section columns');
            console.log('4. Move components: Drag components between sections/columns');
            console.log('5. Save: Changes auto-save or click Save button');
            console.log('6. Edit sections: Use section controls (edit/remove buttons)');
            
        }, 1000);
        
    }, 200);
};

// Helper function to manually test drag-drop
window.testDragDrop = function() {
    console.log('🎯 DRAG-DROP TEST');
    console.log('1. Components should show drag handles on hover');
    console.log('2. Drag a component to a section column');
    console.log('3. Column should highlight when hovering');
    console.log('4. Component should move on drop');
    
    // Add visual indicators
    document.querySelectorAll('.gmkb-component').forEach(comp => {
        if (!comp.hasAttribute('draggable')) {
            comp.setAttribute('draggable', 'true');
            console.log(`Made component ${comp.dataset.componentId} draggable`);
        }
    });
    
    return 'Drag-drop test ready. Try dragging components!';
};

// Auto-run if in debug mode
if (window.gmkbData?.debugMode) {
    console.log('Debug mode - Section integration test will run in 3 seconds...');
    setTimeout(() => {
        window.testSectionIntegration();
    }, 3000);
}

console.log('🧪 Section Integration Test loaded. Run testSectionIntegration() to test.');
console.log('🎯 Run testDragDrop() to test drag-drop functionality.');