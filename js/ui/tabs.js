/**
 * Tab switching functionality for the sidebar
 */

/**
 * Set up tab switching functionality
 */
export function setupTabs() {
    const tabs = document.querySelectorAll('.sidebar__tab');
    const contents = document.querySelectorAll('.tab-content');
    
    console.log(`Setting up ${tabs.length} tabs...`);
    
    // **FIX**: Use event delegation to handle tab clicks
    // This ensures it works even if tabs are dynamically created
    const tabContainer = document.querySelector('.sidebar__tabs');
    
    if (tabContainer) {
        // Remove any existing listener
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
            document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('tab-content--active'));
            
            tab.classList.add('sidebar__tab--active');
            
            // **FIX**: Look for both possible content container formats
            let targetContent = document.getElementById(tabName + '-tab');
            if (!targetContent) {
                targetContent = document.getElementById(tabName + '-panel');
            }
            if (!targetContent) {
                // Try finding by class
                targetContent = document.querySelector(`.tab-content[data-tab="${tabName}"]`);
            }
            
            if (targetContent) {
                targetContent.classList.add('tab-content--active');
                console.log(`Activated tab content: ${tabName}`);
            } else {
                console.warn(`Tab content not found for: ${tabName}`);
                // List available tab contents for debugging
                const availableContents = document.querySelectorAll('.tab-content');
                console.log('Available tab contents:', Array.from(availableContents).map(c => c.id || c.className));
            }
        });
        
        console.log('Tab click handler attached to container');
    } else {
        console.error('Tab container .sidebar__tabs not found!');
    }
    
    console.log('Tabs setup complete');
}
