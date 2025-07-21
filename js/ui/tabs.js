/**
 * Tab switching functionality for the sidebar
 */

/**
 * ROOT FIX: Enhanced tab switching functionality with better initialization
 */
function setupTabs() {
    console.log('📋 TABS: Setting up enhanced tab functionality...');
    
    // Wait for DOM to be ready
    const initializeTabs = () => {
        const tabs = document.querySelectorAll('.sidebar__tab');
        const contents = document.querySelectorAll('.tab-content');
        
        console.log(`🔍 TABS: Found ${tabs.length} tabs and ${contents.length} content panels`);
        
        // ROOT FIX: Use event delegation with improved error handling
        const tabContainer = document.querySelector('.sidebar__tabs');
        
        if (!tabContainer) {
            console.error('❌ TABS: Tab container .sidebar__tabs not found!');
            // Try alternative selectors
            const altContainer = document.querySelector('.sidebar .tabs, .sidebar nav, .sidebar .navigation');
            if (altContainer) {
                console.log('🔄 TABS: Using alternative tab container');
                setupTabEventHandlers(altContainer);
            } else {
                console.error('❌ TABS: No suitable tab container found anywhere');
            }
            return;
        }
        
        setupTabEventHandlers(tabContainer);
        
        // ROOT FIX: Set initial active tab if none is active
        const activeTab = document.querySelector('.sidebar__tab--active');
        if (!activeTab && tabs.length > 0) {
            console.log('📌 TABS: No active tab found, setting first tab as active');
            activateTab(tabs[0]);
        }
        
        console.log('✅ TABS: Enhanced tabs setup complete');
    };
    
    // ROOT FIX: Delayed initialization to ensure DOM is ready
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeTabs);
    } else {
        // DOM already ready, wait a tick for dynamic content
        setTimeout(initializeTabs, 100);
    }
}

/**
 * ROOT FIX: Setup event handlers for tab container
 * @param {HTMLElement} tabContainer - Tab container element
 */
function setupTabEventHandlers(tabContainer) {
    // Remove any existing listener to prevent duplicates
    const newContainer = tabContainer.cloneNode(true);
    tabContainer.parentNode.replaceChild(newContainer, tabContainer);
    
    newContainer.addEventListener('click', function(e) {
        const tab = e.target.closest('.sidebar__tab, .tab, [data-tab]');
        if (!tab) return;
        
        e.preventDefault();
        e.stopPropagation();
        
        activateTab(tab);
    });
    
    console.log('✅ TABS: Event handlers attached to tab container');
}

/**
 * ROOT FIX: Activate a specific tab
 * @param {HTMLElement} tab - Tab element to activate
 */
function activateTab(tab) {
    const tabName = tab.getAttribute('data-tab') || tab.getAttribute('data-target');
    
    if (!tabName) {
        console.warn('⚠️ TABS: Tab element missing data-tab attribute');
        return;
    }
    
    console.log(`📋 TABS: Activating tab: ${tabName}`);
    
    // Remove active class from all tabs and content
    document.querySelectorAll('.sidebar__tab, .tab').forEach(t => {
        t.classList.remove('sidebar__tab--active', 'tab--active', 'active');
    });
    document.querySelectorAll('.tab-content').forEach(c => {
        c.classList.remove('tab-content--active', 'active');
    });
    
    // Add active class to clicked tab
    tab.classList.add('sidebar__tab--active');
    
    // ROOT FIX: Enhanced content targeting with multiple strategies
    let targetContent = findTabContent(tabName);
    
    if (targetContent) {
        targetContent.classList.add('tab-content--active');
        console.log(`✅ TABS: Activated tab content: ${tabName}`);
        
        // ROOT FIX: Dispatch tab change event for other systems
        document.dispatchEvent(new CustomEvent('gmkb:tab-changed', {
            detail: {
                tabName: tabName,
                tabElement: tab,
                contentElement: targetContent,
                timestamp: Date.now()
            }
        }));
        
    } else {
        console.warn(`⚠️ TABS: Tab content not found for: ${tabName}`);
        // Enhanced debugging for missing content
        logAvailableTabContents();
    }
}

/**
 * ROOT FIX: Find tab content using multiple strategies
 * @param {string} tabName - Name of the tab
 * @returns {HTMLElement|null} Tab content element
 */
function findTabContent(tabName) {
    // Strategy 1: Standard ID patterns
    let targetContent = document.getElementById(tabName + '-tab');
    if (targetContent) return targetContent;
    
    targetContent = document.getElementById(tabName + '-panel');
    if (targetContent) return targetContent;
    
    targetContent = document.getElementById(tabName + '-content');
    if (targetContent) return targetContent;
    
    targetContent = document.getElementById(tabName);
    if (targetContent) return targetContent;
    
    // Strategy 2: Data attribute matching
    targetContent = document.querySelector(`[data-tab="${tabName}"]`);
    if (targetContent) return targetContent;
    
    targetContent = document.querySelector(`[data-target="${tabName}"]`);
    if (targetContent) return targetContent;
    
    // Strategy 3: Class-based matching
    targetContent = document.querySelector(`.tab-content.${tabName}, .tab-panel.${tabName}`);
    if (targetContent) return targetContent;
    
    return null;
}

/**
 * ROOT FIX: Enhanced debugging for available tab contents
 */
function logAvailableTabContents() {
    const availableContents = document.querySelectorAll('.tab-content, [data-tab], [id*="tab"], [id*="panel"]');
    console.group('🔍 TABS: Available tab contents debugging');
    console.log('Total elements found:', availableContents.length);
    
    availableContents.forEach((el, index) => {
        console.log(`${index + 1}:`, {
            id: el.id,
            classes: el.className,
            dataTab: el.getAttribute('data-tab'),
            dataTarget: el.getAttribute('data-target')
        });
    });
    
    console.groupEnd();
}

// ROOT FIX: Make tabs system available globally instead of ES6 export
window.setupTabs = setupTabs;
window.GMKBTabs = {
    setupTabs,
    setupTabEventHandlers,
    activateTab,
    findTabContent,
    logAvailableTabContents
};

console.log('✅ Tabs System: Available globally and ready');
