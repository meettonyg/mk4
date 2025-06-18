// Check if the async import is causing issues
console.log('=== ASYNC IMPORT DEBUG ===');

// Check how many times setupComponentInteractivity is called
let setupCallCount = 0;
const originalSetup = window.componentRenderer?.setupComponentInteractivity;

if (window.componentRenderer && originalSetup) {
    window.componentRenderer.setupComponentInteractivity = function(componentId) {
        setupCallCount++;
        console.log(`setupComponentInteractivity called ${setupCallCount} times for: ${componentId}`);
        return originalSetup.call(this, componentId);
    };
}

// Check if element-editor module is loaded multiple times
let moduleLoadCount = 0;
const originalImport = window.import || ((module) => import(module));

// Monitor imports
console.log('Monitoring module imports...');

// Check existing components
setTimeout(() => {
    console.log('\n=== COMPONENT SETUP STATUS ===');
    const components = document.querySelectorAll('[data-component-id]');
    components.forEach((comp, index) => {
        const hasInteractive = comp.hasAttribute('data-interactive');
        const controls = comp.querySelector('.element-controls');
        console.log(`Component ${index + 1}:`);
        console.log('  ID:', comp.getAttribute('data-component-id'));
        console.log('  Has data-interactive:', hasInteractive);
        console.log('  Has controls:', !!controls);
        
        // Try to detect multiple event listeners
        if (controls) {
            // Create a test button to compare
            const testBtn = document.createElement('button');
            testBtn.className = 'control-btn';
            testBtn.title = 'Test';
            controls.appendChild(testBtn);
            
            // Click it and see how many handlers fire
            let clickCount = 0;
            const testHandler = () => clickCount++;
            
            // Add temporary capture listener
            controls.addEventListener('click', testHandler, true);
            
            // Simulate click
            testBtn.click();
            
            // Remove test
            controls.removeEventListener('click', testHandler, true);
            testBtn.remove();
            
            console.log('  Click handlers detected:', clickCount > 0 ? 'Yes' : 'No');
        }
    });
}, 1000);

// Alternative test: Check if the issue is with the switch statement itself
window.testDirectSwitch = function() {
    console.log('\n=== DIRECT SWITCH TEST ===');
    
    // Get a delete button
    const deleteBtn = document.querySelector('.control-btn[title="Delete"]');
    if (!deleteBtn) {
        console.error('No delete button found');
        return;
    }
    
    // Extract the action the same way the code does
    const action = deleteBtn.getAttribute('data-action') || deleteBtn.title || deleteBtn.textContent.trim();
    console.log('Action extracted:', JSON.stringify(action));
    
    // Test the exact switch logic
    let matched = null;
    switch (action) {
        case 'Delete':
        case 'delete':
        case '×':
            matched = 'DELETE';
            break;
        case 'Duplicate':
        case 'duplicate':
        case '⧉':
            matched = 'DUPLICATE';
            break;
        default:
            matched = 'NONE';
    }
    
    console.log('Switch matched:', matched);
    
    // Now test with the button text
    const buttonText = deleteBtn.textContent.trim();
    console.log('\nButton text:', JSON.stringify(buttonText));
    
    let matchedText = null;
    switch (buttonText) {
        case 'Delete':
        case 'delete':
        case '×':
            matchedText = 'DELETE';
            break;
        case 'Duplicate':
        case 'duplicate':
        case '⧉':
            matchedText = 'DUPLICATE';
            break;
        default:
            matchedText = 'NONE';
    }
    
    console.log('Switch matched with text:', matchedText);
};

console.log('\nRun testDirectSwitch() to test the switch statement directly');
