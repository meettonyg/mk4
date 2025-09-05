// Quick fix to force topics to load
(function() {
    console.log('🔧 Applying Topics Quick Fix...');
    
    // Wait for component to be ready
    setTimeout(() => {
        const topicsComponent = document.querySelector('.topics-component');
        if (topicsComponent && window.componentManager) {
            const componentId = topicsComponent.getAttribute('data-component-id');
            
            console.log('Found topics component:', componentId);
            
            // Force update with test topics
            window.componentManager.updateComponent(componentId, {
                loaded_topics: [
                    { title: 'Leadership in the Digital Age', description: 'How to lead teams in a remote-first world' },
                    { title: 'Innovation and Creativity', description: 'Fostering innovation in your organization' },
                    { title: 'Personal Branding', description: 'Building your professional brand online' }
                ]
            });
            
            console.log('✅ Updated component with test topics');
            
            // Force re-render
            if (window.enhancedComponentRenderer) {
                window.enhancedComponentRenderer.rerenderComponent(componentId);
            }
        }
    }, 2000);
})();
