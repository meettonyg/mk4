// Direct test of the switch statement logic
console.log('=== SWITCH STATEMENT TEST ===');

function testSwitch(action) {
    console.log(`\nTesting action: "${action}"`);
    
    let result = 'no match';
    
    switch (action) {
        case 'Delete':
        case 'delete':
        case '×':
            result = 'DELETE CASE';
            break;
            
        case 'Duplicate':
        case 'duplicate':
        case '⧉':
            result = 'DUPLICATE CASE';
            break;
            
        case 'Move Up':
        case 'moveUp':
        case '↑':
            result = 'MOVE UP CASE';
            break;
            
        case 'Move Down':
        case 'moveDown':
        case '↓':
            result = 'MOVE DOWN CASE';
            break;
            
        default:
            result = 'DEFAULT CASE';
            break;
    }
    
    console.log(`Result: ${result}`);
    return result;
}

// Test all possible values
const testValues = [
    'Delete',
    'delete', 
    '×',
    'Duplicate',
    'duplicate',
    '⧉',
    'Move Up',
    'Move Down',
    '↑',
    '↓'
];

console.log('Testing all values:');
testValues.forEach(val => testSwitch(val));

// Test what actual buttons have
console.log('\n=== ACTUAL BUTTON TEST ===');
const buttons = document.querySelectorAll('.control-btn');
buttons.forEach((btn, index) => {
    console.log(`\nButton ${index + 1}:`);
    console.log('  Title:', btn.title);
    console.log('  Text:', JSON.stringify(btn.textContent));
    console.log('  Text trimmed:', JSON.stringify(btn.textContent.trim()));
    
    const action = btn.title || btn.textContent.trim();
    console.log('  Action would be:', action);
    console.log('  Would trigger:', testSwitch(action));
});

// Character code test
console.log('\n=== CHARACTER CODE TEST ===');
const deleteSymbol = '×';
const duplicateSymbol = '⧉';

console.log('Delete symbol:', deleteSymbol);
console.log('Delete char codes:', Array.from(deleteSymbol).map(c => c.charCodeAt(0)));

console.log('Duplicate symbol:', duplicateSymbol);  
console.log('Duplicate char codes:', Array.from(duplicateSymbol).map(c => c.charCodeAt(0)));

// Test from actual button
const deleteBtn = document.querySelector('.control-btn[title="Delete"]');
if (deleteBtn) {
    const btnText = deleteBtn.textContent;
    console.log('\nActual delete button text:', JSON.stringify(btnText));
    console.log('Char codes:', Array.from(btnText).map(c => c.charCodeAt(0)));
    console.log('Trimmed:', JSON.stringify(btnText.trim()));
    console.log('Trimmed char codes:', Array.from(btnText.trim()).map(c => c.charCodeAt(0)));
}
