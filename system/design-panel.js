/**
 * Design Panel JavaScript
 */
document.addEventListener('DOMContentLoaded', function() {
    // Tab switching functionality
    const tabs = document.querySelectorAll('.design-panel-tab');
    const tabContents = document.querySelectorAll('[data-tab-content]');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            const tabName = tab.dataset.tab;
            
            // Remove active class from all tabs
            tabs.forEach(t => t.classList.remove('active'));
            
            // Add active class to clicked tab
            tab.classList.add('active');
            
            // Hide all tab contents
            tabContents.forEach(content => {
                content.classList.add('hidden');
            });
            
            // Show selected tab content
            const selectedContent = document.querySelector(`[data-tab-content="${tabName}"]`);
            if (selectedContent) {
                selectedContent.classList.remove('hidden');
            }
        });
    });
    
    // Component selection functionality
    const componentItems = document.querySelectorAll('.component-item');
    
    componentItems.forEach(item => {
        item.addEventListener('click', () => {
            const componentName = item.dataset.component;
            const isPremium = item.classList.contains('premium');
            
            if (isPremium) {
                // Check if user has premium access
                if (!userHasPremiumAccess()) {
                    showPremiumModal();
                    return;
                }
            }
            
            // Add component to canvas
            addComponentToCanvas(componentName);
        });
    });
    
    // Function to check if user has premium access
    function userHasPremiumAccess() {
        // This would be replaced with actual logic to check if the user has premium access
        // For now, we'll just return true for simplicity
        return true;
    }
    
    // Function to show premium modal
    function showPremiumModal() {
        alert('This is a premium component. Please upgrade to access this feature.');
    }
    
    // Function to add component to canvas
    function addComponentToCanvas(componentName) {
        // This would be replaced with actual logic to add the component to the canvas
        console.log(`Adding component: ${componentName}`);
        
        // For now, we'll just show an alert
        alert(`Component "${componentName}" added to canvas.`);
    }
});
