// === COPY AND PASTE THIS ENTIRE BLOCK INTO CONSOLE ===

console.clear();
console.log('=== DELETE BUTTON DEBUG TEST ===\n');

// Test 1: Check what happens in switch statement
console.log('TEST 1: Switch Statement Test');
function testSwitch(value) {
    switch(value) {
        case 'Delete':
        case 'delete':
        case '×':
            return 'DELETE';
        case 'Duplicate':
        case 'duplicate':
        case '⧉':
            return 'DUPLICATE';
        default:
            return 'NO MATCH';
    }
}

// Test common values
['Delete', 'delete', '×', 'Duplicate', 'duplicate', '⧉'].forEach(val => {
    console.log(`  "${val}" -> ${testSwitch(val)}`);
});

// Test 2: Check actual buttons
console.log('\nTEST 2: Actual Button Analysis');
const deleteButtons = document.querySelectorAll('.control-btn[title="Delete"]');
console.log(`Found ${deleteButtons.length} delete buttons`);

if (deleteButtons.length > 0) {
    const btn = deleteButtons[0];
    console.log('First delete button:');
    console.log('  title:', JSON.stringify(btn.title));
    console.log('  textContent:', JSON.stringify(btn.textContent));
    console.log('  textContent.trim():', JSON.stringify(btn.textContent.trim()));
    console.log('  innerHTML:', btn.innerHTML);
    
    // Test what it would match
    console.log('\nWhat would it match?');
    console.log('  Using title:', testSwitch(btn.title));
    console.log('  Using text:', testSwitch(btn.textContent.trim()));
}

// Test 3: Monitor actual clicks
console.log('\nTEST 3: Click Monitor Active');
console.log('Now click a DELETE button and watch what happens...\n');

let eventCount = 0;
const clickHandler = function(e) {
    const btn = e.target.closest('.control-btn');
    if (!btn) return;
    
    eventCount++;
    console.log(`\n=== CONTROL BUTTON EVENT #${eventCount} ===`);
    console.log('Phase:', e.eventPhase === 1 ? 'CAPTURE' : e.eventPhase === 2 ? 'TARGET' : 'BUBBLE');
    console.log('Button title:', JSON.stringify(btn.title));
    console.log('Button text:', JSON.stringify(btn.textContent.trim()));
    console.log('Is Delete?', btn.title === 'Delete');
    console.log('Is Duplicate?', btn.title === 'Duplicate');
    
    // Log if duplicate is called
    if (btn.title === 'Delete') {
        console.log('DELETE BUTTON CONFIRMED - This should delete, not duplicate!');
        
        // Check component count
        const before = document.querySelectorAll('[data-component-id]').length;
        console.log('Components before:', before);
        
        setTimeout(() => {
            const after = document.querySelectorAll('[data-component-id]').length;
            console.log('Components after:', after);
            console.log('Change:', after - before);
            
            if (after > before) {
                console.error('ERROR: Component was DUPLICATED instead of deleted!');
            } else if (after < before) {
                console.log('SUCCESS: Component was deleted');
            } else {
                console.log('NO CHANGE: Same number of components');
            }
        }, 1000);
    }
};

// Add listeners
document.addEventListener('click', clickHandler, true);  // Capture
document.addEventListener('click', clickHandler, false); // Bubble

// Test 4: Check for duplicate event listeners
console.log('\nTEST 4: Checking for multiple event listeners...');
const testComponent = document.querySelector('[data-component-id]');
if (testComponent) {
    console.log('Test component:', testComponent.getAttribute('data-component-id'));
    console.log('Has data-interactive:', testComponent.hasAttribute('data-interactive'));
    
    // In Chrome DevTools Console, you can use:
    // getEventListeners(document.querySelector('.element-controls'))
    console.log('To see event listeners in Chrome, run:');
    console.log('getEventListeners(document.querySelector(".element-controls"))');
}

console.log('\n=== READY - Click a delete button now ===');
