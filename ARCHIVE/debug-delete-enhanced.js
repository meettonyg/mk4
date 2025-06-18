console.log('=== Enhanced Delete Button Debug Script ===');

// Override duplicateComponent to catch any calls
if (window.componentManager) {
    const originalDuplicate = window.componentManager.duplicateComponent;
    window.componentManager.duplicateComponent = async function(sourceComponentId) {
        console.error('!!! DUPLICATE COMPONENT CALLED UNEXPECTEDLY !!!');
        console.error('This should not happen when delete is clicked');
        console.error('Source component:', sourceComponentId);
        console.error('Stack trace:', new Error().stack);
        // Call original
        return originalDuplicate.call(this, sourceComponentId);
    };
}

// Add a global click listener to catch ALL control button clicks
let clickCount = 0;
document.addEventListener('click', function(e) {
    if (e.target.closest('.control-btn')) {
        clickCount++;
        const btn = e.target.closest('.control-btn');
        console.log(`\n=== GLOBAL CLICK HANDLER #${clickCount} ===`);
        console.log('Event phase:', e.eventPhase === 1 ? 'CAPTURE' : e.eventPhase === 2 ? 'TARGET' : 'BUBBLE');
        console.log('Button title:', btn.title);
        console.log('Button text:', btn.textContent);
        console.log('Button HTML:', btn.innerHTML);
        console.log('Is delete button?', btn.title === 'Delete' || btn.textContent.trim() === '×');
    }
}, true); // Capture phase

// Add another listener in bubble phase
document.addEventListener('click', function(e) {
    if (e.target.closest('.control-btn')) {
        const btn = e.target.closest('.control-btn');
        console.log(`\n=== BUBBLE PHASE HANDLER ===`);
        console.log('Button title:', btn.title);
    }
}, false); // Bubble phase

// Test function to check current components
window.debugCheckComponents = function() {
    console.log('\n=== CURRENT COMPONENTS ===');
    const components = document.querySelectorAll('[data-component-id]');
    components.forEach((comp, index) => {
        console.log(`${index + 1}. ${comp.getAttribute('data-component-type')} - ID: ${comp.getAttribute('data-component-id')}`);
        
        // Check if it has multiple event listeners
        const controls = comp.querySelector('.element-controls');
        if (controls) {
            console.log('  Has controls:', !!controls);
            console.log('  data-interactive:', comp.getAttribute('data-interactive'));
        }
    });
    
    // Check state
    if (window.stateManager) {
        const state = window.stateManager.getState();
        console.log('\nComponents in state:', Object.keys(state.components).length);
        Object.entries(state.components).forEach(([id, comp]) => {
            console.log(`  - ${comp.type}: ${id}`);
        });
    }
};

// Check for multiple click handlers on the same button
window.debugInspectButton = function(buttonTitle) {
    const buttons = Array.from(document.querySelectorAll('.control-btn')).filter(btn => btn.title === buttonTitle);
    if (buttons.length === 0) {
        console.log('No buttons found with title:', buttonTitle);
        return;
    }
    
    console.log(`\n=== INSPECTING ${buttons.length} BUTTONS WITH TITLE "${buttonTitle}" ===`);
    buttons.forEach((btn, index) => {
        console.log(`\nButton ${index + 1}:`);
        console.log('  Title:', btn.title);
        console.log('  Text:', btn.textContent);
        console.log('  Parent component:', btn.closest('[data-component-id]')?.getAttribute('data-component-id'));
        
        // Try to see if we can detect event listeners (browser specific)
        if (window.getEventListeners) {
            const listeners = getEventListeners(btn);
            console.log('  Event listeners:', listeners);
        }
    });
};

console.log('\n=== Debug script loaded ===');
console.log('1. Click any delete button to see what happens');
console.log('2. Run debugCheckComponents() to see current state');
console.log('3. Run debugInspectButton("Delete") to inspect delete buttons');
console.log('\nWatching for clicks...');

// Initial state check
setTimeout(() => {
    console.log('\n=== INITIAL STATE CHECK ===');
    window.debugCheckComponents();
}, 500);
