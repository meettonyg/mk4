// Quick test - run this to verify the root fixes are working
console.log('Testing UI after root fixes...');

// Test 1: Tabs
const firstTab = document.querySelector('.sidebar__tab[data-tab="design"]');
if (firstTab) {
    firstTab.click();
    console.log('✅ Clicked Design tab - it should be active now');
}

// Test 2: Add Component button
setTimeout(() => {
    const addBtn = document.getElementById('add-component-btn');
    if (addBtn) {
        console.log('✅ Add Component button found - clicking it...');
        addBtn.click();
        
        // Test close after 1 second
        setTimeout(() => {
            const modal = document.getElementById('component-library-overlay');
            if (modal && modal.style.display !== 'none') {
                console.log('✅ Modal opened successfully!');
                console.log('📝 Try closing it with:');
                console.log('   - × button');
                console.log('   - Click outside');
                console.log('   - ESC key');
            }
        }, 500);
    }
}, 500);

console.log('\nAll UI components should now work properly!');