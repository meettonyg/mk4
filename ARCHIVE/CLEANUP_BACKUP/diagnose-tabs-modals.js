/**
 * Diagnostic script for tabs and modals
 * Run this in console to diagnose why tabs and modals aren't working
 */

console.log('🔍 Diagnosing Tabs and Modals...\n');

// Test 1: Check if tabs exist
console.log('1️⃣ Tab Elements:');
const tabs = document.querySelectorAll('.sidebar__tab');
const tabContents = document.querySelectorAll('.tab-content');
console.log(`   Tabs found: ${tabs.length}`);
console.log(`   Tab contents found: ${tabContents.length}`);
tabs.forEach((tab, i) => {
    console.log(`   Tab ${i}: ${tab.dataset.tab} (active: ${tab.classList.contains('sidebar__tab--active')})`);
});

// Test 2: Check if setupTabs was called
console.log('\n2️⃣ Tab Initialization:');
console.log(`   setupTabs function exists: ${typeof setupTabs !== 'undefined'}`);

// Test 3: Manually setup tabs to see if it works
console.log('\n3️⃣ Manually Setting Up Tabs:');
function manualSetupTabs() {
    const tabs = document.querySelectorAll('.sidebar__tab');
    const contents = document.querySelectorAll('.tab-content');
    
    if (tabs.length === 0 || contents.length === 0) {
        console.error('   ❌ No tabs or contents found!');
        return;
    }
    
    tabs.forEach(tab => {
        // Remove existing listeners
        const newTab = tab.cloneNode(true);
        tab.parentNode.replaceChild(newTab, tab);
        
        newTab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            console.log(`   Tab clicked: ${tabName}`);
            
            // Update active states
            document.querySelectorAll('.sidebar__tab').forEach(t => t.classList.remove('sidebar__tab--active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('tab-content--active'));
            
            this.classList.add('sidebar__tab--active');
            const content = document.getElementById(tabName + '-tab');
            if (content) {
                content.classList.add('tab-content--active');
                console.log(`   ✅ Switched to ${tabName} tab`);
            } else {
                console.error(`   ❌ Content not found for ${tabName}-tab`);
            }
        });
    });
    
    console.log('   ✅ Tabs manually set up');
}
manualSetupTabs();

// Test 4: Check modals
console.log('\n4️⃣ Modal Elements:');
const componentLibraryModal = document.getElementById('component-library-overlay');
const templateLibraryModal = document.getElementById('template-library-modal');
const exportModal = document.querySelector('.modal--export');
console.log(`   Component Library Modal: ${!!componentLibraryModal}`);
console.log(`   Template Library Modal: ${!!templateLibraryModal}`);
console.log(`   Export Modal: ${!!exportModal}`);

// Test 5: Check modal triggers
console.log('\n5️⃣ Modal Triggers:');
const addComponentBtn = document.getElementById('add-component-btn');
const exportBtn = document.getElementById('export-btn');
console.log(`   Add Component Button: ${!!addComponentBtn}`);
console.log(`   Export Button: ${!!exportBtn}`);

// Test 6: Manually setup component library modal
console.log('\n6️⃣ Setting Up Component Library Modal:');
if (addComponentBtn) {
    // Remove existing listeners
    const newBtn = addComponentBtn.cloneNode(true);
    addComponentBtn.parentNode.replaceChild(newBtn, addComponentBtn);
    
    newBtn.addEventListener('click', () => {
        console.log('   Add Component clicked');
        document.dispatchEvent(new CustomEvent('show-component-library'));
    });
    console.log('   ✅ Component library button set up');
}

// Test 7: Check if modules are loaded
console.log('\n7️⃣ Module Status:');
console.log(`   setupComponentLibraryModal: ${typeof setupComponentLibraryModal !== 'undefined'}`);
console.log(`   showComponentLibraryModal: ${typeof showComponentLibraryModal !== 'undefined'}`);
console.log(`   setupTemplateLibrary: ${typeof setupTemplateLibrary !== 'undefined'}`);

// Test 8: Check initialization status
console.log('\n8️⃣ Initialization Status:');
console.log(`   mediaKitBuilderInitialized: ${window.mediaKitBuilderInitialized}`);
console.log(`   Enhanced init used: ${typeof mediaKitBuilderInit !== 'undefined'}`);

// Test 9: Force import modules
console.log('\n9️⃣ Force Loading Modules:');
Promise.all([
    import('./js/modals/component-library.js').then(m => {
        if (m.setupComponentLibraryModal) {
            m.setupComponentLibraryModal();
            console.log('   ✅ Component library module loaded');
        }
    }),
    import('./js/modals/template-library.js').then(() => {
        console.log('   ✅ Template library module loaded');
    }),
    import('./js/ui/tabs.js').then(m => {
        if (m.setupTabs) {
            m.setupTabs();
            console.log('   ✅ Tabs module loaded');
        }
    })
]).catch(err => {
    console.error('   ❌ Error loading modules:', err);
});

console.log('\n✨ Diagnostic complete! Try clicking the tabs now.');