/**
 * Test script to verify the duplicate ID fix
 * This script checks that control buttons no longer cause duplicate data-component-id detection
 */

console.log('🧪 TESTING DUPLICATE ID FIX');
console.log('='.repeat(60));

// Function to check for duplicate data-component-id attributes
function checkForDuplicates() {
    const allElements = document.querySelectorAll('[data-component-id]');
    const idMap = new Map();
    
    allElements.forEach(element => {
        const id = element.getAttribute('data-component-id');
        if (!idMap.has(id)) {
            idMap.set(id, []);
        }
        idMap.get(id).push(element);
    });
    
    let duplicatesFound = false;
    idMap.forEach((elements, id) => {
        if (elements.length > 1) {
            duplicatesFound = true;
            console.error(`❌ DUPLICATE FOUND: ${id} appears ${elements.length} times`);
            elements.forEach((el, i) => {
                console.log(`  Instance ${i + 1}:`, {
                    tagName: el.tagName,
                    className: el.className,
                    isControlButton: el.classList.contains('component-control'),
                    parent: el.parentElement?.className
                });
            });
        }
    });
    
    if (!duplicatesFound) {
        console.log('✅ NO DUPLICATES FOUND - Fix is working!');
    }
    
    return !duplicatesFound;
}

// Function to check control buttons use new attribute
function checkControlButtons() {
    const controlButtons = document.querySelectorAll('.component-control');
    let allCorrect = true;
    
    console.log(`\nChecking ${controlButtons.length} control buttons...`);
    
    controlButtons.forEach((button, i) => {
        const hasOldAttribute = button.hasAttribute('data-component-id');
        const hasNewAttribute = button.hasAttribute('data-controls-for');
        
        if (hasOldAttribute) {
            console.error(`❌ Button ${i + 1} still has data-component-id attribute!`);
            allCorrect = false;
        }
        
        if (!hasNewAttribute) {
            console.error(`❌ Button ${i + 1} missing data-controls-for attribute!`);
            allCorrect = false;
        }
    });
    
    if (allCorrect) {
        console.log('✅ All control buttons use correct attributes');
    }
    
    return allCorrect;
}

// Function to test control functionality
function testControlFunctionality() {
    console.log('\nTesting control button functionality...');
    
    const firstComponent = document.querySelector('[data-component-id]');
    if (!firstComponent) {
        console.error('❌ No components found to test');
        return false;
    }
    
    const componentId = firstComponent.getAttribute('data-component-id');
    const editButton = firstComponent.querySelector('[data-action="edit"][data-controls-for="' + componentId + '"]');
    
    if (!editButton) {
        console.error('❌ No edit button found for component', componentId);
        return false;
    }
    
    // Listen for the control action event
    let eventReceived = false;
    const listener = (event) => {
        if (event.detail && event.detail.componentId === componentId) {
            eventReceived = true;
            console.log('✅ Control action event received correctly');
        }
    };
    
    document.addEventListener('gmkb:component-edit-requested', listener);
    
    // Simulate button click
    editButton.click();
    
    // Check if event was received
    setTimeout(() => {
        document.removeEventListener('gmkb:component-edit-requested', listener);
        
        if (!eventReceived) {
            console.error('❌ Control action event not received');
        }
    }, 100);
    
    return eventReceived;
}

// Run all tests
function runAllTests() {
    console.log('Running all tests...\n');
    
    const results = {
        noDuplicates: checkForDuplicates(),
        correctAttributes: checkControlButtons(),
        functionality: false // Will be set asynchronously
    };
    
    // Test functionality with a delay
    setTimeout(() => {
        results.functionality = testControlFunctionality();
        
        // Final summary
        setTimeout(() => {
            console.log('\n' + '='.repeat(60));
            console.log('TEST SUMMARY:');
            console.log(`  No Duplicates: ${results.noDuplicates ? '✅ PASS' : '❌ FAIL'}`);
            console.log(`  Correct Attributes: ${results.correctAttributes ? '✅ PASS' : '❌ FAIL'}`);
            console.log(`  Functionality: ${results.functionality ? '✅ PASS' : '❌ FAIL'}`);
            
            const allPassed = results.noDuplicates && results.correctAttributes && results.functionality;
            console.log(`\nOVERALL: ${allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED'}`);
            
            if (allPassed) {
                console.log('\n🎉 The duplicate ID fix is working correctly!');
            } else {
                console.log('\n⚠️ There are still issues to resolve.');
            }
        }, 200);
    }, 500);
}

// Wait for DOM to be ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', runAllTests);
} else {
    // Run tests after a brief delay to ensure all components are initialized
    setTimeout(runAllTests, 1000);
}

// Expose test functions globally for manual testing
window.duplicateIdTests = {
    checkForDuplicates,
    checkControlButtons,
    testControlFunctionality,
    runAllTests
};

console.log('Test script loaded. Tests will run automatically in 1 second.');
console.log('You can also run tests manually with: window.duplicateIdTests.runAllTests()');
