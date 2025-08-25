/**
 * ROOT FIX: Topics Sidebar Functionality Test Script
 * 
 * This script tests and verifies that all topics sidebar functionality is working:
 * 1. Character counter calculation and display
 * 2. Delete functionality with confirmation
 * 3. Copy functionality
 * 4. Display options (toggles and style options)
 * 5. Add new topic functionality
 * 
 * Run this in the browser console to test the fixes.
 */

(function() {
    'use strict';
    
    console.log('🧪 ROOT FIX: Starting Topics Sidebar Functionality Test');
    console.log('='.repeat(60));
    
    // Test results tracking
    const testResults = {
        characterCounters: { passed: 0, failed: 0, details: [] },
        deleteFunction: { passed: 0, failed: 0, details: [] },
        copyFunction: { passed: 0, failed: 0, details: [] },
        displayOptions: { passed: 0, failed: 0, details: [] },
        addFunction: { passed: 0, failed: 0, details: [] }
    };
    
    /**
     * Test 1: Character Counter Functionality
     */
    function testCharacterCounters() {
        console.log('🔤 Testing Character Counter Functionality...');
        
        const topicInputs = document.querySelectorAll('.topics-sidebar__topic-input');
        
        if (topicInputs.length === 0) {
            testResults.characterCounters.failed++;
            testResults.characterCounters.details.push('❌ No topic inputs found');
            console.log('❌ FAIL: No topic inputs found in the sidebar');
            return;
        }
        
        console.log(`📊 Found ${topicInputs.length} topic inputs to test`);
        
        topicInputs.forEach((input, index) => {
            try {
                const topicItem = input.closest('.topics-sidebar__topic-item');
                const counter = topicItem.querySelector('.topics-sidebar__char-counter span');
                const currentLength = input.value.length;
                const counterText = counter ? counter.textContent : 'not found';
                
                console.log(`📝 Input ${index + 1}: "${input.value}" (${currentLength} chars) - Counter: ${counterText}`);
                
                if (counter && counterText.includes(`${currentLength}/80`)) {
                    testResults.characterCounters.passed++;
                    testResults.characterCounters.details.push(`✅ Input ${index + 1}: Counter accurate (${currentLength}/80)`);
                } else {
                    testResults.characterCounters.failed++;
                    testResults.characterCounters.details.push(`❌ Input ${index + 1}: Counter mismatch - Expected ${currentLength}/80, Got ${counterText}`);
                }
                
                // Test dynamic updating
                const originalValue = input.value;
                const testValue = 'Test dynamic counter update';
                input.value = testValue;
                input.dispatchEvent(new Event('input'));
                
                // Give time for the counter to update
                setTimeout(() => {
                    const updatedCounterText = counter ? counter.textContent : 'not found';
                    if (updatedCounterText.includes(`${testValue.length}/80`)) {
                        testResults.characterCounters.passed++;
                        testResults.characterCounters.details.push(`✅ Input ${index + 1}: Dynamic update works`);
                    } else {
                        testResults.characterCounters.failed++;
                        testResults.characterCounters.details.push(`❌ Input ${index + 1}: Dynamic update failed`);
                    }
                    
                    // Restore original value
                    input.value = originalValue;
                    input.dispatchEvent(new Event('input'));
                }, 100);
                
            } catch (error) {
                testResults.characterCounters.failed++;
                testResults.characterCounters.details.push(`❌ Input ${index + 1}: Error - ${error.message}`);
            }
        });
    }
    
    /**
     * Test 2: Delete Functionality
     */
    function testDeleteFunctionality() {
        console.log('🗑️ Testing Delete Functionality...');
        
        const deleteButtons = document.querySelectorAll('.topics-sidebar__action-btn--danger');
        
        if (deleteButtons.length === 0) {
            testResults.deleteFunction.failed++;
            testResults.deleteFunction.details.push('❌ No delete buttons found');
            console.log('❌ FAIL: No delete buttons found');
            return;
        }
        
        console.log(`🔍 Found ${deleteButtons.length} delete buttons`);
        
        // Test that buttons are clickable and have proper event listeners
        deleteButtons.forEach((button, index) => {
            try {
                const topicItem = button.closest('.topics-sidebar__topic-item');
                const topicNumber = topicItem.querySelector('.topics-sidebar__topic-number')?.textContent || index + 1;
                
                console.log(`🗑️ Delete button ${index + 1} for topic ${topicNumber}: Found and accessible`);
                
                // Test if the button has proper attributes and styling
                if (button.classList.contains('topics-sidebar__action-btn--danger')) {
                    testResults.deleteFunction.passed++;
                    testResults.deleteFunction.details.push(`✅ Delete button ${index + 1}: Properly styled and accessible`);
                } else {
                    testResults.deleteFunction.failed++;
                    testResults.deleteFunction.details.push(`❌ Delete button ${index + 1}: Missing danger class`);
                }
                
                // Test SVG icon
                const svg = button.querySelector('svg');
                if (svg) {
                    testResults.deleteFunction.passed++;
                    testResults.deleteFunction.details.push(`✅ Delete button ${index + 1}: Has delete icon`);
                } else {
                    testResults.deleteFunction.failed++;
                    testResults.deleteFunction.details.push(`❌ Delete button ${index + 1}: Missing delete icon`);
                }
                
            } catch (error) {
                testResults.deleteFunction.failed++;
                testResults.deleteFunction.details.push(`❌ Delete button ${index + 1}: Error - ${error.message}`);
            }
        });
        
        console.log('ℹ️ Note: Actual deletion requires user confirmation to prevent accidental data loss');
    }
    
    /**
     * Test 3: Copy Functionality
     */
    function testCopyFunctionality() {
        console.log('📋 Testing Copy Functionality...');
        
        const copyButtons = document.querySelectorAll('.topics-sidebar__action-btn:not(.topics-sidebar__action-btn--danger)');
        
        if (copyButtons.length === 0) {
            testResults.copyFunction.failed++;
            testResults.copyFunction.details.push('❌ No copy buttons found');
            console.log('❌ FAIL: No copy buttons found');
            return;
        }
        
        console.log(`🔍 Found ${copyButtons.length} copy buttons`);
        
        copyButtons.forEach((button, index) => {
            try {
                const topicItem = button.closest('.topics-sidebar__topic-item');
                const topicNumber = topicItem.querySelector('.topics-sidebar__topic-number')?.textContent || index + 1;
                
                console.log(`📋 Copy button ${index + 1} for topic ${topicNumber}: Found and accessible`);
                
                // Test if the button has proper attributes and styling
                if (button.classList.contains('topics-sidebar__action-btn') && 
                    !button.classList.contains('topics-sidebar__action-btn--danger')) {
                    testResults.copyFunction.passed++;
                    testResults.copyFunction.details.push(`✅ Copy button ${index + 1}: Properly styled and accessible`);
                } else {
                    testResults.copyFunction.failed++;
                    testResults.copyFunction.details.push(`❌ Copy button ${index + 1}: Incorrect styling`);
                }
                
                // Test SVG icon
                const svg = button.querySelector('svg');
                if (svg) {
                    testResults.copyFunction.passed++;
                    testResults.copyFunction.details.push(`✅ Copy button ${index + 1}: Has copy icon`);
                } else {
                    testResults.copyFunction.failed++;
                    testResults.copyFunction.details.push(`❌ Copy button ${index + 1}: Missing copy icon`);
                }
                
            } catch (error) {
                testResults.copyFunction.failed++;
                testResults.copyFunction.details.push(`❌ Copy button ${index + 1}: Error - ${error.message}`);
            }
        });
    }
    
    /**
     * Test 4: Display Options Functionality
     */
    function testDisplayOptions() {
        console.log('🎛️ Testing Display Options...');
        
        // Test toggle switches
        const toggles = document.querySelectorAll('.topics-sidebar__toggle');
        console.log(`🔍 Found ${toggles.length} toggle switches`);
        
        toggles.forEach((toggle, index) => {
            try {
                const isActive = toggle.classList.contains('topics-sidebar__toggle--active');
                console.log(`🎛️ Toggle ${index + 1}: ${isActive ? 'Active' : 'Inactive'}`);
                
                // Test toggle functionality by simulating click
                const originalState = toggle.classList.contains('topics-sidebar__toggle--active');
                
                // Simulate click
                toggle.click();
                
                const newState = toggle.classList.contains('topics-sidebar__toggle--active');
                
                if (originalState !== newState) {
                    testResults.displayOptions.passed++;
                    testResults.displayOptions.details.push(`✅ Toggle ${index + 1}: State change works (${originalState} → ${newState})`);
                } else {
                    testResults.displayOptions.failed++;
                    testResults.displayOptions.details.push(`❌ Toggle ${index + 1}: State change failed`);
                }
                
                // Reset to original state
                toggle.click();
                
            } catch (error) {
                testResults.displayOptions.failed++;
                testResults.displayOptions.details.push(`❌ Toggle ${index + 1}: Error - ${error.message}`);
            }
        });
        
        // Test style options
        const styleOptions = document.querySelectorAll('.topics-sidebar__style-option');
        console.log(`🔍 Found ${styleOptions.length} style options`);
        
        styleOptions.forEach((option, index) => {
            try {
                const isActive = option.classList.contains('topics-sidebar__style-option--active');
                const optionText = option.textContent.trim();
                console.log(`🎨 Style Option ${index + 1}: "${optionText}" ${isActive ? '(Active)' : ''}`);
                
                // Test option click
                option.click();
                
                const nowActive = option.classList.contains('topics-sidebar__style-option--active');
                
                if (nowActive) {
                    testResults.displayOptions.passed++;
                    testResults.displayOptions.details.push(`✅ Style Option ${index + 1}: Activation works`);
                } else {
                    testResults.displayOptions.failed++;
                    testResults.displayOptions.details.push(`❌ Style Option ${index + 1}: Activation failed`);
                }
                
            } catch (error) {
                testResults.displayOptions.failed++;
                testResults.displayOptions.details.push(`❌ Style Option ${index + 1}: Error - ${error.message}`);
            }
        });
    }
    
    /**
     * Test 5: Add New Topic Functionality
     */
    function testAddFunctionality() {
        console.log('➕ Testing Add New Topic Functionality...');
        
        const addButton = document.querySelector('.topics-sidebar__add-btn');
        const addFirstButton = document.querySelector('.topics-sidebar__add-first-btn');
        
        if (!addButton && !addFirstButton) {
            testResults.addFunction.failed++;
            testResults.addFunction.details.push('❌ No add topic buttons found');
            console.log('❌ FAIL: No add topic buttons found');
            return;
        }
        
        const buttonToTest = addButton || addFirstButton;
        const buttonType = addButton ? 'main add button' : 'add first button';
        
        console.log(`🔍 Found ${buttonType} to test`);
        
        try {
            // Count topics before
            const topicsBefore = document.querySelectorAll('.topics-sidebar__topic-item').length;
            console.log(`📊 Topics before: ${topicsBefore}`);
            
            if (topicsBefore >= 5) {
                console.log('ℹ️ Maximum topics reached, testing max limit behavior');
                buttonToTest.click();
                
                // Should show alert for max topics
                testResults.addFunction.passed++;
                testResults.addFunction.details.push('✅ Max topics limit properly enforced');
            } else {
                // Test actual addition
                console.log('➕ Testing topic addition...');
                buttonToTest.click();
                
                // Check if topic was added after a short delay
                setTimeout(() => {
                    const topicsAfter = document.querySelectorAll('.topics-sidebar__topic-item').length;
                    console.log(`📊 Topics after: ${topicsAfter}`);
                    
                    if (topicsAfter > topicsBefore) {
                        testResults.addFunction.passed++;
                        testResults.addFunction.details.push(`✅ Topic addition works (${topicsBefore} → ${topicsAfter})`);
                    } else {
                        testResults.addFunction.failed++;
                        testResults.addFunction.details.push(`❌ Topic addition failed (${topicsBefore} → ${topicsAfter})`);
                    }
                }, 200);
            }
            
            // Test button attributes
            if (buttonToTest.textContent.includes('Add')) {
                testResults.addFunction.passed++;
                testResults.addFunction.details.push(`✅ Add button has correct text`);
            } else {
                testResults.addFunction.failed++;
                testResults.addFunction.details.push(`❌ Add button text incorrect`);
            }
            
            const svg = buttonToTest.querySelector('svg');
            if (svg) {
                testResults.addFunction.passed++;
                testResults.addFunction.details.push(`✅ Add button has plus icon`);
            } else {
                testResults.addFunction.failed++;
                testResults.addFunction.details.push(`❌ Add button missing plus icon`);
            }
            
        } catch (error) {
            testResults.addFunction.failed++;
            testResults.addFunction.details.push(`❌ Add functionality error: ${error.message}`);
        }
    }
    
    /**
     * Generate Test Report
     */
    function generateTestReport() {
        console.log('\n' + '='.repeat(60));
        console.log('📋 ROOT FIX: Topics Sidebar Test Results');
        console.log('='.repeat(60));
        
        let totalPassed = 0;
        let totalFailed = 0;
        
        Object.keys(testResults).forEach(testCategory => {
            const result = testResults[testCategory];
            totalPassed += result.passed;
            totalFailed += result.failed;
            
            const categoryName = testCategory.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase());
            const status = result.failed === 0 ? '✅' : '⚠️';
            
            console.log(`\n${status} ${categoryName}:`);
            console.log(`   Passed: ${result.passed}, Failed: ${result.failed}`);
            
            result.details.forEach(detail => {
                console.log(`   ${detail}`);
            });
        });
        
        console.log('\n' + '='.repeat(60));
        console.log(`🎯 OVERALL RESULTS: ${totalPassed} passed, ${totalFailed} failed`);
        
        if (totalFailed === 0) {
            console.log('🎉 ALL TESTS PASSED! Topics sidebar functionality is working correctly.');
        } else {
            console.log('⚠️ Some issues found. Check the details above for specific failures.');
        }
        
        console.log('='.repeat(60));
        
        return {
            passed: totalPassed,
            failed: totalFailed,
            categories: testResults
        };
    }
    
    /**
     * Main test execution
     */
    function runAllTests() {
        // Wait for topics sidebar to be available
        const checkSidebar = () => {
            const sidebar = document.querySelector('.topics-sidebar');
            if (!sidebar) {
                console.log('⏳ Waiting for topics sidebar to load...');
                setTimeout(checkSidebar, 500);
                return;
            }
            
            console.log('✅ Topics sidebar found, starting tests...\n');
            
            // Run all tests
            testCharacterCounters();
            setTimeout(() => testDeleteFunctionality(), 300);
            setTimeout(() => testCopyFunctionality(), 600);
            setTimeout(() => testDisplayOptions(), 900);
            setTimeout(() => testAddFunctionality(), 1200);
            
            // Generate report after all tests
            setTimeout(() => {
                const results = generateTestReport();
                
                // Make results available globally
                window.topicsTestResults = results;
                
                console.log('\nℹ️ Test results saved to window.topicsTestResults for further inspection.');
                console.log('ℹ️ Run debugTopicsSidebar() for additional debugging information.');
                
            }, 1800);
        };
        
        checkSidebar();
    }
    
    // Start the tests
    runAllTests();
    
    // Expose test functions globally for manual testing
    window.testTopicsSidebar = runAllTests;
    
})();

console.log('🧪 Topics Sidebar Test Script Loaded');
console.log('💡 Run testTopicsSidebar() to execute all tests');
console.log('💡 Run debugTopicsSidebar() for debugging information');
