console.log('=== TESTING DELETE BUTTON ISSUE ===');

// Simple test to see what's happening
function testDeleteButton() {
    // Find a component with delete button
    const deleteBtn = document.querySelector('.control-btn[title="Delete"]');
    if (!deleteBtn) {
        console.error('No delete button found!');
        return;
    }
    
    console.log('Found delete button:', deleteBtn);
    console.log('Button properties:');
    console.log('  title:', deleteBtn.title);
    console.log('  textContent:', JSON.stringify(deleteBtn.textContent));
    console.log('  innerHTML:', deleteBtn.innerHTML);
    
    // Check what component it belongs to
    const component = deleteBtn.closest('[data-component-id]');
    if (component) {
        console.log('Parent component:', component.getAttribute('data-component-id'));
    }
    
    // Simulate a click to see what happens
    console.log('\n=== SIMULATING DELETE CLICK ===');
    console.log('Components before click:', document.querySelectorAll('[data-component-id]').length);
    
    // Override confirm to auto-accept
    const originalConfirm = window.confirm;
    window.confirm = () => {
        console.log('Confirm dialog would appear here');
        return true; // Auto-accept
    };
    
    // Click the button
    deleteBtn.click();
    
    // Restore confirm
    window.confirm = originalConfirm;
    
    // Check result after a delay
    setTimeout(() => {
        console.log('Components after click:', document.querySelectorAll('[data-component-id]').length);
        
        // Check if duplicate was called
        if (window.componentManager && window.componentManager.duplicateComponent.toString().includes('CALLED ===')) {
            console.log('Duplicate component method has debug logging');
        }
    }, 1000);
}

// Test the action matching
function testActionMatching() {
    console.log('\n=== TESTING ACTION MATCHING ===');
    
    const testCases = [
        { action: 'Delete', expected: 'delete' },
        { action: 'delete', expected: 'delete' },
        { action: '×', expected: 'delete' },
        { action: 'Duplicate', expected: 'duplicate' },
        { action: 'duplicate', expected: 'duplicate' },
        { action: '⧉', expected: 'duplicate' }
    ];
    
    testCases.forEach(test => {
        console.log(`Testing action "${test.action}"`);
        
        // Simulate the logic from component-renderer
        let finalAction = test.action;
        if (!['Delete', 'delete', 'Duplicate', 'duplicate', 'Move Up', 'moveUp', 'Move Down', 'moveDown'].includes(test.action)) {
            finalAction = test.action; // Would be buttonText in real code
        }
        
        // Check which case it would match
        let matched = 'none';
        switch (finalAction) {
            case 'Delete':
            case 'delete':
            case '×':
                matched = 'delete';
                break;
            case 'Duplicate':
            case 'duplicate':
            case '⧉':
                matched = 'duplicate';
                break;
        }
        
        console.log(`  Final action: "${finalAction}"`);
        console.log(`  Would match: ${matched}`);
        console.log(`  Expected: ${test.expected}`);
        console.log(`  Correct: ${matched === test.expected ? '✓' : '✗'}`);
    });
}

// Run tests
console.log('Running tests in 1 second...');
setTimeout(() => {
    testActionMatching();
    console.log('\nNow testing actual delete button...');
    testDeleteButton();
}, 1000);
