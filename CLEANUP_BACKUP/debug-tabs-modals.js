/**
 * Debug script for testing tabs and modals
 * Run this in the console to diagnose issues
 */

// Create global debug object
window.mkDebugUI = {
    // Test tab functionality
    testTabs: function() {
        console.log('🔍 Testing tab functionality...');
        
        // Check if tabs exist
        const tabs = document.querySelectorAll('.sidebar__tab');
        const contents = document.querySelectorAll('.tab-content');
        
        console.log(`Found ${tabs.length} tabs and ${contents.length} content panels`);
        
        // List all tabs
        tabs.forEach(tab => {
            console.log(`Tab: ${tab.getAttribute('data-tab')} - Active: ${tab.classList.contains('sidebar__tab--active')}`);
        });
        
        // List all content panels
        contents.forEach(content => {
            console.log(`Content: ${content.id} - Active: ${content.classList.contains('tab-content--active')}`);
        });
        
        // Test clicking each tab
        tabs.forEach((tab, index) => {
            setTimeout(() => {
                console.log(`\n🖱️ Clicking tab: ${tab.getAttribute('data-tab')}`);
                tab.click();
                
                // Check result
                setTimeout(() => {
                    const activeTab = document.querySelector('.sidebar__tab--active');
                    const activeContent = document.querySelector('.tab-content--active');
                    console.log(`Active tab: ${activeTab?.getAttribute('data-tab')}`);
                    console.log(`Active content: ${activeContent?.id}`);
                }, 100);
            }, index * 500);
        });
    },
    
    // Test modal functionality
    testModals: function() {
        console.log('\n🔍 Testing modal functionality...');
        
        // Check if modals exist
        const componentLibrary = document.getElementById('component-library-overlay');
        const templateLibrary = document.getElementById('template-library-overlay');
        const exportModal = document.getElementById('export-overlay');
        const globalSettings = document.getElementById('global-settings-overlay');
        
        console.log('Modal existence:');
        console.log(`- Component Library: ${componentLibrary ? '✅ Found' : '❌ Not found'}`);
        console.log(`- Template Library: ${templateLibrary ? '✅ Found' : '❌ Not found'}`);
        console.log(`- Export Modal: ${exportModal ? '✅ Found' : '❌ Not found'}`);
        console.log(`- Global Settings: ${globalSettings ? '✅ Found' : '❌ Not found'}`);
        
        // Test buttons
        const addComponentBtn = document.getElementById('add-component-btn');
        const addFirstComponentBtn = document.getElementById('add-first-component');
        const loadTemplateBtn = document.getElementById('load-template');
        const exportBtn = document.getElementById('export-btn');
        const themeBtn = document.getElementById('global-theme-btn');
        
        console.log('\nButton existence:');
        console.log(`- Add Component: ${addComponentBtn ? '✅ Found' : '❌ Not found'}`);
        console.log(`- Add First Component: ${addFirstComponentBtn ? '✅ Found' : '❌ Not found'}`);
        console.log(`- Load Template: ${loadTemplateBtn ? '✅ Found' : '❌ Not found'}`);
        console.log(`- Export: ${exportBtn ? '✅ Found' : '❌ Not found'}`);
        console.log(`- Theme: ${themeBtn ? '✅ Found' : '❌ Not found'}`);
    },
    
    // Manually open component library
    openComponentLibrary: function() {
        console.log('🚀 Opening component library...');
        
        // Try multiple methods
        // Method 1: Direct function call
        if (window.showComponentLibraryModal) {
            window.showComponentLibraryModal();
            console.log('✅ Opened via showComponentLibraryModal()');
            return;
        }
        
        // Method 2: Custom event
        document.dispatchEvent(new CustomEvent('show-component-library'));
        console.log('📤 Dispatched show-component-library event');
        
        // Method 3: Manual display
        const modal = document.getElementById('component-library-overlay');
        if (modal) {
            modal.style.display = 'flex';
            console.log('✅ Manually set display to flex');
        } else {
            console.log('❌ Modal not found!');
            
            // Try to create it
            console.log('🔧 Attempting to create modal...');
            if (window.createComponentLibraryModal) {
                window.createComponentLibraryModal();
                console.log('✅ Modal created');
                
                // Try to show it again
                const newModal = document.getElementById('component-library-overlay');
                if (newModal) {
                    newModal.style.display = 'flex';
                    console.log('✅ Modal shown');
                }
            } else {
                console.log('❌ createComponentLibraryModal function not found');
            }
        }
    },
    
    // Fix tab switching manually
    fixTabs: function() {
        console.log('🔧 Fixing tab functionality...');
        
        const tabContainer = document.querySelector('.sidebar__tabs');
        if (!tabContainer) {
            console.error('❌ Tab container not found!');
            return;
        }
        
        // Remove all existing listeners and add new one
        const newContainer = tabContainer.cloneNode(true);
        tabContainer.parentNode.replaceChild(newContainer, tabContainer);
        
        newContainer.addEventListener('click', function(e) {
            const tab = e.target.closest('.sidebar__tab');
            if (!tab) return;
            
            e.preventDefault();
            const tabName = tab.getAttribute('data-tab');
            
            console.log(`Tab clicked: ${tabName}`);
            
            // Update active states
            document.querySelectorAll('.sidebar__tab').forEach(t => t.classList.remove('sidebar__tab--active'));
            tab.classList.add('sidebar__tab--active');
            
            // Hide all content
            document.querySelectorAll('.tab-content').forEach(c => {
                c.classList.remove('tab-content--active');
                c.style.display = 'none';
            });
            
            // Show target content
            const targetContent = document.getElementById(tabName + '-tab');
            if (targetContent) {
                targetContent.classList.add('tab-content--active');
                targetContent.style.display = 'block';
                console.log(`✅ Activated ${tabName} content`);
            } else {
                console.error(`❌ Content not found for ${tabName}`);
            }
        });
        
        console.log('✅ Tab handler reattached');
    },
    
    // Fix component library button
    fixComponentButton: function() {
        console.log('🔧 Fixing component library button...');
        
        const btn = document.getElementById('add-component-btn');
        if (!btn) {
            console.error('❌ Add component button not found!');
            return;
        }
        
        // Clone to remove existing handlers
        const newBtn = btn.cloneNode(true);
        btn.parentNode.replaceChild(newBtn, btn);
        
        newBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Add component button clicked');
            window.mkDebugUI.openComponentLibrary();
        });
        
        console.log('✅ Button handler reattached');
    },
    
    // Run all fixes
    fixAll: function() {
        console.log('🛠️ Running all fixes...');
        this.fixTabs();
        this.fixComponentButton();
        console.log('✅ All fixes applied');
    },
    
    // Check initialization status
    checkInit: function() {
        console.log('📊 Checking initialization status...');
        
        console.log('\nGlobal objects:');
        console.log(`- mediaKitBuilderInitialized: ${window.mediaKitBuilderInitialized}`);
        console.log(`- stateManager: ${window.stateManager ? '✅' : '❌'}`);
        console.log(`- componentManager: ${window.componentManager ? '✅' : '❌'}`);
        console.log(`- componentRenderer: ${window.componentRenderer ? '✅' : '❌'}`);
        
        console.log('\nUI functions:');
        console.log(`- setupTabs: ${window.setupTabs ? '✅' : '❌'}`);
        console.log(`- setupComponentLibraryModal: ${window.setupComponentLibraryModal ? '✅' : '❌'}`);
        console.log(`- showComponentLibraryModal: ${window.showComponentLibraryModal ? '✅' : '❌'}`);
        
        console.log('\nFeature flags:');
        const features = window.guestifyData?.features || {};
        Object.entries(features).forEach(([key, value]) => {
            console.log(`- ${key}: ${value}`);
        });
    }
};

// Run initial checks
console.log('🚀 Media Kit Builder UI Debug Tools Loaded');
console.log('Available commands:');
console.log('- mkDebugUI.testTabs() - Test tab switching');
console.log('- mkDebugUI.testModals() - Check modal status');
console.log('- mkDebugUI.openComponentLibrary() - Open component library');
console.log('- mkDebugUI.fixTabs() - Fix tab functionality');
console.log('- mkDebugUI.fixComponentButton() - Fix add component button');
console.log('- mkDebugUI.fixAll() - Apply all fixes');
console.log('- mkDebugUI.checkInit() - Check initialization status');

// Auto-run basic checks
mkDebugUI.checkInit();
mkDebugUI.testTabs();
mkDebugUI.testModals();
