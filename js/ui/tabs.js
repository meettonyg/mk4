/**
 * Tab switching functionality for the sidebar
 */

/**
 * Set up tab switching functionality
 */
export function setupTabs() {
    const tabs = document.querySelectorAll('.sidebar__tab');
    const contents = document.querySelectorAll('.tab-content');

    tabs.forEach(tab => {
        tab.addEventListener('click', function() {
            const tabName = this.getAttribute('data-tab');
            
            // Update active states
            tabs.forEach(t => t.classList.remove('sidebar__tab--active'));
            contents.forEach(c => c.classList.remove('tab-content--active'));
            
            this.classList.add('sidebar__tab--active');
            document.getElementById(tabName + '-tab').classList.add('tab-content--active');
        });
    });
}
