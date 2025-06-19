// Test empty state buttons fix
console.log('🧪 Testing Empty State Buttons Fix\n');

// Test 1: Check if buttons exist
const addComponentBtn = document.getElementById('add-first-component');
const loadTemplateBtn = document.getElementById('load-template');

console.log('1. Empty state buttons exist:');
console.log('   - Add Component:', addComponentBtn ? '✅ Yes' : '❌ No');
console.log('   - Load Template:', loadTemplateBtn ? '✅ Yes' : '❌ No');

// Test 2: Check if event listeners are attached
console.log('\n2. Event listeners attached:');
if (addComponentBtn) {
    const hasListener = addComponentBtn.onclick || addComponentBtn.hasAttribute('data-listener-attached');
    console.log('   - Add Component:', hasListener ? '✅ Yes' : '⚠️ Needs refresh');
}
if (loadTemplateBtn) {
    const hasListener = loadTemplateBtn.onclick || loadTemplateBtn.hasAttribute('data-listener-attached');
    console.log('   - Load Template:', hasListener ? '✅ Yes' : '⚠️ Needs refresh');
}

// Test 3: Quick fix to add listeners immediately
console.log('\n3. Applying immediate fix...');

if (addComponentBtn && !addComponentBtn.hasAttribute('data-empty-state-fixed')) {
    addComponentBtn.addEventListener('click', () => {
        console.log('Empty state Add Component clicked');
        const modal = document.getElementById('component-library-overlay');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('modal--open');
        }
    });
    addComponentBtn.setAttribute('data-empty-state-fixed', 'true');
    console.log('   ✅ Add Component button fixed');
}

if (loadTemplateBtn && !loadTemplateBtn.hasAttribute('data-empty-state-fixed')) {
    loadTemplateBtn.addEventListener('click', () => {
        console.log('Empty state Load Template clicked');
        const modal = document.getElementById('template-library-modal');
        if (modal) {
            modal.style.display = 'flex';
            modal.classList.add('modal--open');
        }
    });
    loadTemplateBtn.setAttribute('data-empty-state-fixed', 'true');
    console.log('   ✅ Load Template button fixed');
}

console.log('\n✅ Empty state buttons should now work!');
console.log('💡 For permanent fix, refresh the page with Ctrl+F5');
