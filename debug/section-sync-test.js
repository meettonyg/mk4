/**
 * Section Synchronization Test Script
 * Tests the fixes for section sync and drag-drop issues
 */

(function() {
    'use strict';
    
    console.log('🧪 Section Sync Test Starting...');
    
    // Test 1: Section Synchronization
    function testSectionSync() {
        console.group('📊 Test 1: Section Synchronization');
        
        // Check state
        const state = window.enhancedStateManager?.getState();
        const stateSections = state?.sections || [];
        console.log(`State sections: ${stateSections.length}`);
        stateSections.forEach(s => console.log(`  - ${s.section_id}: ${s.section_type}`));
        
        // Check section manager
        const managerSections = window.sectionLayoutManager?.getAllSections() || [];
        console.log(`Manager sections: ${managerSections.length}`);
        managerSections.forEach(s => console.log(`  - ${s.section_id}: ${s.section_type}`));
        
        // Check DOM
        const domSections = document.querySelectorAll('[data-section-id]');
        console.log(`DOM sections: ${domSections.length}`);
        domSections.forEach(s => console.log(`  - ${s.dataset.sectionId}`));
        
        // Verify sync
        const inSync = stateSections.length === managerSections.length && 
                      stateSections.length === domSections.length;
        
        if (inSync) {
            console.log('✅ PASS: Sections are synchronized');
        } else {
            console.error('❌ FAIL: Section mismatch detected');
        }
        
        console.groupEnd();
        return inSync;
    }
    
    // Test 2: Add Component to Section
    async function testAddComponent() {
        console.group('📦 Test 2: Add Component to Section');
        
        // Get or create a section
        let section = window.sectionLayoutManager?.getSections()[0];
        if (!section) {
            console.log('Creating test section...');
            section = window.sectionLayoutManager?.createSection('full_width');
        }
        
        if (!section) {
            console.error('❌ FAIL: Could not create section');
            console.groupEnd();
            return false;
        }
        
        console.log(`Using section: ${section.section_id}`);
        
        // Add a component
        const initialCount = Object.keys(window.enhancedStateManager?.getState()?.components || {}).length;
        
        await window.enhancedComponentManager?.addComponent('hero', {
            targetSectionId: section.section_id,
            targetColumn: 1,
            testComponent: true
        });
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const finalCount = Object.keys(window.enhancedStateManager?.getState()?.components || {}).length;
        const componentAdded = finalCount > initialCount;
        
        // Check if component is in section
        const updatedSection = window.sectionLayoutManager?.getSection(section.section_id);
        const componentInSection = updatedSection?.components?.length > 0;
        
        // Check DOM
        const sectionElement = document.querySelector(`[data-section-id="${section.section_id}"]`);
        const componentInDOM = sectionElement?.querySelector('[data-component-id]') !== null;
        
        if (componentAdded && componentInSection && componentInDOM) {
            console.log('✅ PASS: Component added to section successfully');
        } else {
            console.error('❌ FAIL: Component not properly added to section');
            console.log(`  Component added: ${componentAdded}`);
            console.log(`  In section data: ${componentInSection}`);
            console.log(`  In DOM: ${componentInDOM}`);
        }
        
        console.groupEnd();
        return componentAdded && componentInSection && componentInDOM;
    }
    
    // Test 3: Drop Zone Detection
    function testDropZones() {
        console.group('🎯 Test 3: Drop Zone Detection');
        
        const dropZones = document.querySelectorAll('[data-drop-zone="true"]');
        console.log(`Found ${dropZones.length} drop zones`);
        
        // Check each section has drop zones
        const sections = document.querySelectorAll('[data-section-id]');
        let allSectionsHaveDropZones = true;
        
        sections.forEach(section => {
            const sectionDropZones = section.querySelectorAll('[data-drop-zone="true"]');
            const hasDropZones = sectionDropZones.length > 0;
            
            console.log(`Section ${section.dataset.sectionId}: ${sectionDropZones.length} drop zones`);
            
            if (!hasDropZones) {
                allSectionsHaveDropZones = false;
            }
        });
        
        if (allSectionsHaveDropZones && dropZones.length > 0) {
            console.log('✅ PASS: All sections have drop zones');
        } else {
            console.error('❌ FAIL: Some sections missing drop zones');
        }
        
        console.groupEnd();
        return allSectionsHaveDropZones;
    }
    
    // Test 4: Drag Data Setup
    function testDragSetup() {
        console.group('🔄 Test 4: Drag Setup');
        
        const draggableComponents = document.querySelectorAll('[data-component-id][draggable="true"]');
        const draggableLibraryItems = document.querySelectorAll('.component-card[draggable="true"], [data-component-type][draggable="true"]');
        
        console.log(`Draggable components: ${draggableComponents.length}`);
        console.log(`Draggable library items: ${draggableLibraryItems.length}`);
        
        const hasDraggables = draggableComponents.length > 0 || draggableLibraryItems.length > 0;
        
        if (hasDraggables) {
            console.log('✅ PASS: Elements are draggable');
        } else {
            console.error('❌ FAIL: No draggable elements found');
        }
        
        console.groupEnd();
        return hasDraggables;
    }
    
    // Test 5: Section Remove
    async function testSectionRemove() {
        console.group('🗑️ Test 5: Section Remove');
        
        // Create a test section
        const testSection = window.sectionLayoutManager?.createSection('full_width', {
            manual_creation: true
        });
        
        if (!testSection) {
            console.error('❌ FAIL: Could not create test section');
            console.groupEnd();
            return false;
        }
        
        const sectionId = testSection.section_id;
        console.log(`Created test section: ${sectionId}`);
        
        // Wait for render
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Check it exists
        const existsInManager = window.sectionLayoutManager?.getSection(sectionId) !== null;
        const existsInDOM = document.querySelector(`[data-section-id="${sectionId}"]`) !== null;
        
        if (!existsInManager || !existsInDOM) {
            console.error('❌ FAIL: Test section not properly created');
            console.groupEnd();
            return false;
        }
        
        // Remove it
        const removed = window.sectionLayoutManager?.removeSection(sectionId);
        
        // Wait for cleanup
        await new Promise(resolve => setTimeout(resolve, 200));
        
        // Verify removal
        const stillInManager = window.sectionLayoutManager?.getSection(sectionId) !== null;
        const stillInDOM = document.querySelector(`[data-section-id="${sectionId}"]`) !== null;
        const stillInState = window.enhancedStateManager?.getState()?.sections?.find(s => s.section_id === sectionId) !== undefined;
        
        if (removed && !stillInManager && !stillInDOM && !stillInState) {
            console.log('✅ PASS: Section removed successfully');
        } else {
            console.error('❌ FAIL: Section not properly removed');
            console.log(`  Removal reported: ${removed}`);
            console.log(`  Still in manager: ${stillInManager}`);
            console.log(`  Still in DOM: ${stillInDOM}`);
            console.log(`  Still in state: ${stillInState}`);
        }
        
        console.groupEnd();
        return removed && !stillInManager && !stillInDOM && !stillInState;
    }
    
    // Run all tests
    async function runAllTests() {
        console.log('=====================================');
        console.log('🧪 SECTION SYNC & DRAG-DROP TEST SUITE');
        console.log('=====================================\n');
        
        const results = {
            sectionSync: false,
            addComponent: false,
            dropZones: false,
            dragSetup: false,
            sectionRemove: false
        };
        
        // Run tests with delays
        results.sectionSync = testSectionSync();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        results.addComponent = await testAddComponent();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        results.dropZones = testDropZones();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        results.dragSetup = testDragSetup();
        await new Promise(resolve => setTimeout(resolve, 500));
        
        results.sectionRemove = await testSectionRemove();
        
        // Summary
        console.log('\n=====================================');
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('=====================================');
        
        let passCount = 0;
        let failCount = 0;
        
        for (const [test, passed] of Object.entries(results)) {
            if (passed) {
                console.log(`✅ ${test}: PASS`);
                passCount++;
            } else {
                console.error(`❌ ${test}: FAIL`);
                failCount++;
            }
        }
        
        console.log(`\nTotal: ${passCount} passed, ${failCount} failed`);
        
        if (failCount === 0) {
            console.log('🎉 ALL TESTS PASSED! Section sync and drag-drop are working correctly.');
        } else {
            console.error('⚠️ Some tests failed. Please review the issues above.');
        }
        
        return failCount === 0;
    }
    
    // Wait for systems to be ready
    function waitForSystems() {
        const checkSystems = () => {
            if (window.enhancedStateManager && 
                window.sectionLayoutManager && 
                window.enhancedComponentManager &&
                window.sectionComponentIntegration) {
                console.log('✅ All systems ready, starting tests...\n');
                runAllTests();
            } else {
                console.log('⏳ Waiting for systems...');
                setTimeout(checkSystems, 500);
            }
        };
        
        checkSystems();
    }
    
    // Start tests
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', waitForSystems);
    } else {
        waitForSystems();
    }
    
})();
