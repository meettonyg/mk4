/**
 * Test Script for Component Move Controls Fix
 * This script tests that component move up/down operations update the visual position in the DOM
 */

(function() {
    'use strict';
    
    console.log('🧪 COMPONENT MOVE CONTROLS TEST');
    console.log('='.repeat(60));
    
    // Test configuration
    const TEST_DELAY = 2000; // Delay between tests
    let testResults = [];
    
    // Helper function to get component positions
    function getComponentPositions() {
        const container = document.getElementById('media-kit-preview');
        if (!container) {
            console.error('Preview container not found');
            return [];
        }
        
        const components = Array.from(container.children);
        return components.map((el, index) => ({
            id: el.id || el.getAttribute('data-component-id'),
            position: index,
            element: el
        }));
    }
    
    // Helper function to display positions
    function displayPositions(label) {
        const positions = getComponentPositions();
        console.log(`\n${label}:`);
        positions.forEach(pos => {
            console.log(`  Position ${pos.position}: ${pos.id}`);
        });
        return positions;
    }
    
    // Test 1: Initial State Check
    function testInitialState() {
        console.log('\n📋 TEST 1: Initial State Check');
        console.log('-'.repeat(40));
        
        const positions = displayPositions('Initial component positions');
        const hasComponents = positions.length > 0;
        
        if (!hasComponents) {
            console.error('❌ No components found. Please add at least 2 components before running tests.');
            return false;
        }
        
        if (positions.length < 2) {
            console.error('❌ Need at least 2 components for move tests. Current count:', positions.length);
            return false;
        }
        
        console.log('✅ Found', positions.length, 'components ready for testing');
        return true;
    }
    
    // Test 2: Move Down Operation
    async function testMoveDown() {
        console.log('\n📋 TEST 2: Move Down Operation');
        console.log('-'.repeat(40));
        
        const initialPositions = getComponentPositions();
        if (initialPositions.length < 2) return false;
        
        const firstComponent = initialPositions[0];
        console.log('Moving component:', firstComponent.id, 'down');
        
        // Store initial positions for comparison
        const initialOrder = initialPositions.map(p => p.id);
        
        // Trigger move down
        document.dispatchEvent(new CustomEvent('gmkb:component-move-down-requested', {
            detail: { componentId: firstComponent.id }
        }));
        
        // Wait for DOM update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check new positions
        const newPositions = displayPositions('New component positions after move down');
        const newOrder = newPositions.map(p => p.id);
        
        // Verify the move
        const firstComponentNewPos = newPositions.findIndex(p => p.id === firstComponent.id);
        const moveSuccess = firstComponentNewPos === 1; // Should be at position 1 now
        
        if (moveSuccess) {
            console.log('✅ Component successfully moved down from position 0 to position 1');
        } else {
            console.error('❌ Component did not move visually. Still at position:', firstComponentNewPos);
            console.log('Initial order:', initialOrder);
            console.log('Current order:', newOrder);
        }
        
        return moveSuccess;
    }
    
    // Test 3: Move Up Operation
    async function testMoveUp() {
        console.log('\n📋 TEST 3: Move Up Operation');
        console.log('-'.repeat(40));
        
        const initialPositions = getComponentPositions();
        if (initialPositions.length < 2) return false;
        
        const secondComponent = initialPositions[1];
        console.log('Moving component:', secondComponent.id, 'up');
        
        // Store initial positions for comparison
        const initialOrder = initialPositions.map(p => p.id);
        
        // Trigger move up
        document.dispatchEvent(new CustomEvent('gmkb:component-move-up-requested', {
            detail: { componentId: secondComponent.id }
        }));
        
        // Wait for DOM update
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check new positions
        const newPositions = displayPositions('New component positions after move up');
        const newOrder = newPositions.map(p => p.id);
        
        // Verify the move
        const secondComponentNewPos = newPositions.findIndex(p => p.id === secondComponent.id);
        const moveSuccess = secondComponentNewPos === 0; // Should be at position 0 now
        
        if (moveSuccess) {
            console.log('✅ Component successfully moved up from position 1 to position 0');
        } else {
            console.error('❌ Component did not move visually. Still at position:', secondComponentNewPos);
            console.log('Initial order:', initialOrder);
            console.log('Current order:', newOrder);
        }
        
        return moveSuccess;
    }
    
    // Test 4: Rapid Move Operations
    async function testRapidMoves() {
        console.log('\n📋 TEST 4: Rapid Move Operations');
        console.log('-'.repeat(40));
        
        const positions = getComponentPositions();
        if (positions.length < 3) {
            console.log('⚠️ Skipping rapid move test - need at least 3 components');
            return true;
        }
        
        const targetComponent = positions[1];
        console.log('Testing rapid moves on component:', targetComponent.id);
        
        // Move down twice rapidly
        console.log('Executing: Move down → Move down');
        document.dispatchEvent(new CustomEvent('gmkb:component-move-down-requested', {
            detail: { componentId: targetComponent.id }
        }));
        
        await new Promise(resolve => setTimeout(resolve, 100)); // Very short delay
        
        document.dispatchEvent(new CustomEvent('gmkb:component-move-down-requested', {
            detail: { componentId: targetComponent.id }
        }));
        
        // Wait for DOM updates
        await new Promise(resolve => setTimeout(resolve, 500));
        
        const finalPositions = getComponentPositions();
        const finalPos = finalPositions.findIndex(p => p.id === targetComponent.id);
        
        // Component should have moved from position 1 to position 2 or 3 (depending on total count)
        const expectedPos = Math.min(2, positions.length - 1);
        const success = finalPos >= 2;
        
        if (success) {
            console.log('✅ Rapid moves handled correctly. Component at position:', finalPos);
        } else {
            console.error('❌ Rapid moves failed. Component at position:', finalPos, 'expected:', expectedPos);
        }
        
        return success;
    }
    
    // Test 5: State Consistency Check
    async function testStateConsistency() {
        console.log('\n📋 TEST 5: State Consistency Check');
        console.log('-'.repeat(40));
        
        if (!window.enhancedStateManager) {
            console.error('❌ State manager not available');
            return false;
        }
        
        const state = window.enhancedStateManager.getState();
        const stateLayout = state.layout || [];
        const domPositions = getComponentPositions();
        const domOrder = domPositions.map(p => p.id);
        
        console.log('State layout:', stateLayout);
        console.log('DOM order:   ', domOrder);
        
        // Check if they match
        const matches = JSON.stringify(stateLayout) === JSON.stringify(domOrder);
        
        if (matches) {
            console.log('✅ State and DOM are in sync');
        } else {
            console.error('❌ State and DOM are out of sync!');
            
            // Find discrepancies
            stateLayout.forEach((id, index) => {
                if (domOrder[index] !== id) {
                    console.log(`  Mismatch at position ${index}: State has "${id}", DOM has "${domOrder[index]}"`);
                }
            });
        }
        
        return matches;
    }
    
    // Run all tests
    async function runAllTests() {
        console.log('\n🚀 Starting Component Move Controls Tests...');
        console.log('Please ensure you have at least 2-3 components in the preview area.\n');
        
        // Test 1: Initial State
        const test1 = testInitialState();
        testResults.push({ name: 'Initial State Check', passed: test1 });
        
        if (!test1) {
            console.error('\n❌ Cannot proceed without components. Please add components and retry.');
            return;
        }
        
        await new Promise(resolve => setTimeout(resolve, TEST_DELAY));
        
        // Test 2: Move Down
        const test2 = await testMoveDown();
        testResults.push({ name: 'Move Down Operation', passed: test2 });
        
        await new Promise(resolve => setTimeout(resolve, TEST_DELAY));
        
        // Test 3: Move Up
        const test3 = await testMoveUp();
        testResults.push({ name: 'Move Up Operation', passed: test3 });
        
        await new Promise(resolve => setTimeout(resolve, TEST_DELAY));
        
        // Test 4: Rapid Moves
        const test4 = await testRapidMoves();
        testResults.push({ name: 'Rapid Move Operations', passed: test4 });
        
        await new Promise(resolve => setTimeout(resolve, TEST_DELAY));
        
        // Test 5: State Consistency
        const test5 = await testStateConsistency();
        testResults.push({ name: 'State Consistency Check', passed: test5 });
        
        // Display results
        console.log('\n' + '='.repeat(60));
        console.log('📊 TEST RESULTS SUMMARY');
        console.log('='.repeat(60));
        
        testResults.forEach((result, index) => {
            const status = result.passed ? '✅ PASSED' : '❌ FAILED';
            console.log(`Test ${index + 1}: ${result.name} - ${status}`);
        });
        
        const passedTests = testResults.filter(r => r.passed).length;
        const totalTests = testResults.length;
        const allPassed = passedTests === totalTests;
        
        console.log('\n' + '-'.repeat(60));
        console.log(`Overall: ${passedTests}/${totalTests} tests passed`);
        
        if (allPassed) {
            console.log('\n🎉 ALL TESTS PASSED! Component move controls are working correctly.');
        } else {
            console.log('\n⚠️ Some tests failed. Component move controls need attention.');
            console.log('\nRecommended actions:');
            console.log('1. Check browser console for errors');
            console.log('2. Verify enhanced-component-renderer.js is loaded');
            console.log('3. Check that state manager is properly initialized');
            console.log('4. Try running window.debugMoveIssue() for detailed diagnostics');
        }
        
        return allPassed;
    }
    
    // Debug helper function
    window.debugMoveIssue = function() {
        console.group('🔍 Component Move Diagnostics');
        
        // Check if required components are loaded
        console.log('\n1️⃣ Component Availability:');
        console.log('  State Manager:', !!window.enhancedStateManager);
        console.log('  Component Manager:', !!window.enhancedComponentManager);
        console.log('  Component Renderer:', !!window.enhancedComponentRenderer);
        console.log('  DOM Coordinator:', !!window.domRenderCoordinator);
        
        // Check event listeners
        console.log('\n2️⃣ Testing Event Flow:');
        
        // Test state update
        const testHandler = (event) => {
            console.log('  ✅ Event received:', event.type, event.detail);
        };
        
        document.addEventListener('gmkb:component-moved', testHandler, { once: true });
        document.addEventListener('gmkb:render-complete', testHandler, { once: true });
        
        // Get first component
        const components = getComponentPositions();
        if (components.length > 0) {
            console.log('\n3️⃣ Triggering test move on:', components[0].id);
            document.dispatchEvent(new CustomEvent('gmkb:component-move-down-requested', {
                detail: { componentId: components[0].id }
            }));
            
            // Check render mode
            setTimeout(() => {
                if (window.enhancedComponentRenderer) {
                    const stats = window.enhancedComponentRenderer.getStats();
                    console.log('\n4️⃣ Renderer Stats:', stats);
                }
                
                // Check DOM render coordinator
                if (window.domRenderCoordinator) {
                    const status = window.domRenderCoordinator.getStatus();
                    console.log('\n5️⃣ DOM Coordinator Status:', status);
                }
                
                console.groupEnd();
            }, 1000);
        } else {
            console.log('\n❌ No components found for testing');
            console.groupEnd();
        }
    };
    
    // Auto-run tests if requested
    if (window.AUTO_RUN_MOVE_TESTS) {
        runAllTests();
    } else {
        console.log('\n📌 Test script loaded. Run window.runMoveTests() to start testing.');
        console.log('📌 Or run window.debugMoveIssue() for detailed diagnostics.');
        window.runMoveTests = runAllTests;
    }
    
})();
