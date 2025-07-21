// Quick test for tabs and modals - Copy and paste this entire block into the console

(async () => {
    console.log('🚀 Starting Media Kit Builder UI Test...\n');
    
    // Test 1: Check initialization
    console.log('1️⃣ Checking initialization status...');
    console.log(`- Builder initialized: ${window.mediaKitBuilderInitialized ? '✅' : '❌'}`);
    console.log(`- State Manager: ${window.stateManager ? '✅' : '❌'}`);
    console.log(`- Component Manager: ${window.componentManager ? '✅' : '❌'}`);
    console.log(`- Component Renderer: ${window.componentRenderer ? '✅' : '❌'}`);
    
    // Test 2: Tab functionality
    console.log('\n2️⃣ Testing tab switching...');
    const tabs = document.querySelectorAll('.sidebar__tab');
    console.log(`Found ${tabs.length} tabs`);
    
    // Click Design tab
    const designTab = document.querySelector('[data-tab="design"]');
    if (designTab) {
        designTab.click();
        console.log('✅ Clicked Design tab');
        
        // Check if it worked
        setTimeout(() => {
            const activeContent = document.querySelector('.tab-content--active');
            console.log(`Active content: ${activeContent?.id || 'none'}`);
        }, 100);
    } else {
        console.log('❌ Design tab not found');
    }
    
    // Test 3: Component Library Modal
    console.log('\n3️⃣ Testing component library modal...');
    
    // Method 1: Click button
    const addBtn = document.getElementById('add-component-btn');
    if (addBtn) {
        console.log('Found add component button, clicking...');
        addBtn.click();
        
        setTimeout(() => {
            const modal = document.getElementById('component-library-overlay');
            if (modal && modal.style.display !== 'none') {
                console.log('✅ Modal opened successfully!');
                console.log('Close it by clicking × or outside the modal');
            } else {
                console.log('❌ Modal did not open, trying alternative method...');
                
                // Method 2: Direct display
                if (modal) {
                    modal.style.display = 'flex';
                    console.log('✅ Modal opened manually');
                } else {
                    console.log('❌ Modal element not found');
                }
            }
        }, 500);
    } else {
        console.log('❌ Add component button not found');
    }
    
    // Test 4: Quick fixes if needed
    console.log('\n4️⃣ Applying quick fixes...');
    
    // Fix tabs
    const tabContainer = document.querySelector('.sidebar__tabs');
    if (tabContainer && !tabContainer.hasAttribute('data-fixed')) {
        tabContainer.setAttribute('data-fixed', 'true');
        tabContainer.addEventListener('click', function(e) {
            const tab = e.target.closest('.sidebar__tab');
            if (!tab) return;
            
            const tabName = tab.getAttribute('data-tab');
            document.querySelectorAll('.sidebar__tab').forEach(t => t.classList.remove('sidebar__tab--active'));
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('tab-content--active'));
            
            tab.classList.add('sidebar__tab--active');
            const content = document.getElementById(tabName + '-tab');
            if (content) content.classList.add('tab-content--active');
        });
        console.log('✅ Tab handler fixed');
    }
    
    // Fix component button
    const componentBtn = document.getElementById('add-component-btn');
    if (componentBtn && !componentBtn.hasAttribute('data-fixed')) {
        componentBtn.setAttribute('data-fixed', 'true');
        componentBtn.addEventListener('click', function(e) {
            e.preventDefault();
            const modal = document.getElementById('component-library-overlay');
            if (modal) {
                modal.style.display = 'flex';
            } else {
                // Try to trigger modal creation
                if (window.showComponentLibraryModal) {
                    window.showComponentLibraryModal();
                } else {
                    document.dispatchEvent(new CustomEvent('show-component-library'));
                }
            }
        });
        console.log('✅ Component button fixed');
    }
    
    console.log('\n✨ Test complete! Try clicking tabs and the "Add Component" button now.');
})();
