/**
 * Tab switching functionality for the sidebar
 */

/**
 * ROOT FIX: Enhanced tab switching functionality with better initialization
 */
function setupTabs() {
    console.log('📋 TABS: Setting up tab functionality...');
    
    // ROOT FIX: Direct initialization without delays
    const initializeTabs = () => {
        const tabContainer = document.querySelector('.sidebar__tabs');
        const tabs = document.querySelectorAll('.sidebar__tab');
        const contents = document.querySelectorAll('.tab-content');
        
        if (!tabContainer || tabs.length === 0) {
            console.error('❌ TABS: Tab container or tabs not found');
            return;
        }
        
        console.log(`✅ TABS: Found ${tabs.length} tabs and ${contents.length} content panels`);
        
        // ROOT FIX: Direct event listeners on each tab
        tabs.forEach(tab => {
            tab.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                
                const tabName = this.getAttribute('data-tab');
                if (!tabName) {
                    console.warn('⚠️ TABS: Tab missing data-tab attribute');
                    return;
                }
                
                console.log(`🔄 TABS: Switching to ${tabName} tab`);
                
                // Remove active class from all tabs
                tabs.forEach(t => {
                    t.classList.remove('sidebar__tab--active', 'active');
                });
                
                // Add active class to clicked tab
                this.classList.add('sidebar__tab--active', 'active');
                
                // Hide all content panels
                contents.forEach(content => {
                    content.classList.remove('tab-content--active', 'active');
                    content.style.display = 'none';
                });
                
                // Show the selected content
                const targetContent = document.getElementById(`${tabName}-tab`);
                if (targetContent) {
                    targetContent.classList.add('tab-content--active', 'active');
                    targetContent.style.display = 'block';
                    console.log(`✅ TABS: Activated ${tabName} content`);
                    
                    // Emit event for other systems
                    document.dispatchEvent(new CustomEvent('gmkb:tab-changed', {
                        detail: {
                            tabName: tabName,
                            tabElement: this,
                            contentElement: targetContent
                        }
                    }));
                } else {
                    console.error(`❌ TABS: Content not found for ${tabName}`);
                }
            });
        });
        
        // ROOT FIX: Ensure initial state is correct
        const activeTab = document.querySelector('.sidebar__tab--active');
        if (activeTab) {
            const activeTabName = activeTab.getAttribute('data-tab');
            const activeContent = document.getElementById(`${activeTabName}-tab`);
            if (activeContent) {
                // Hide all contents first
                contents.forEach(content => {
                    content.style.display = 'none';
                });
                // Show active content
                activeContent.style.display = 'block';
            }
        }
        
        console.log('✅ TABS: Tab system initialized successfully');
    };
    
    // Initialize immediately if DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTabs);
    } else {
        initializeTabs();
    }
}

/**
 * ROOT FIX: Switch to a specific tab programmatically
 */
function switchToTab(tabName) {
    const tab = document.querySelector(`[data-tab="${tabName}"]`);
    if (tab) {
        tab.click();
        console.log(`🔄 TABS: Programmatically switched to ${tabName} tab`);
    } else {
        console.error(`❌ TABS: Tab not found: ${tabName}`);
    }
}

// ROOT FIX: Listen for component edit requests and switch to design tab
document.addEventListener('gmkb:component-edit-requested', (event) => {
    console.log('🔧 TABS: Component edit requested, switching to design tab');
    const { componentId } = event.detail;
    
    // Switch to design tab
    switchToTab('design');
    
    // Load the component in design panel if available
    if (window.designPanel && componentId) {
        // Small delay to ensure tab is switched first
        setTimeout(() => {
            console.log(`🎨 TABS: Loading component ${componentId} in design panel`);
            window.designPanel.load(componentId);
        }, 100);
    }
});

// ROOT FIX: Make tabs system available globally
window.setupTabs = setupTabs;
window.switchToTab = switchToTab;

// Auto-initialize when script loads
setupTabs();

// ROOT FIX: Emit event to signal tabs script is loaded
document.dispatchEvent(new CustomEvent('gmkb:tabs-loaded'));

console.log('✅ Tabs System: Available globally and auto-initialized');
