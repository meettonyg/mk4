// Run this in your browser console to test topics loading

(function() {
    console.clear();
    console.log('🔍 COMPREHENSIVE TOPICS DIAGNOSTIC');
    console.log('===================================\n');
    
    // 1. Check post ID
    const postId = 32372; // From your URL
    console.log('📝 Testing with Post ID:', postId);
    
    // 2. Check if we have AJAX URL and nonce
    console.log('\n🔧 AJAX Configuration:');
    console.log('AJAX URL:', window.gmkbData?.ajaxurl || 'NOT FOUND');
    console.log('Nonce:', window.gmkbData?.nonce ? 'Present' : 'NOT FOUND');
    
    // 3. Test direct AJAX call to load topics
    console.log('\n🔄 Testing AJAX Topics Load...');
    
    const formData = new FormData();
    formData.append('action', 'load_stored_topics');
    formData.append('post_id', postId);
    formData.append('media_kit_post_id', postId); // Try both parameter names
    formData.append('nonce', window.gmkbData?.nonce || '');
    
    fetch(window.gmkbData?.ajaxurl || '/wp-admin/admin-ajax.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    })
    .then(response => {
        console.log('Response status:', response.status);
        return response.json();
    })
    .then(data => {
        console.log('\n📊 AJAX Response:', data);
        
        if (data.success && data.data) {
            console.log('✅ Success:', data.data.message);
            console.log('📈 Topics count:', data.data.total_topics);
            console.log('🔍 Data source:', data.data.data_source);
            console.log('📋 Topics data:', data.data.topics);
            
            if (data.data.topics && Object.keys(data.data.topics).length > 0) {
                console.log('\n✨ TOPICS FOUND:');
                Object.entries(data.data.topics).forEach(([key, value]) => {
                    if (value) {
                        console.log(`  ${key}: "${value}"`);
                    }
                });
            } else {
                console.log('\n❌ No topics data in response');
            }
            
            // Debug info if available
            if (data.data.debug) {
                console.log('\n🐛 Debug info:', data.data.debug);
            }
        } else {
            console.error('\n❌ Failed:', data.message || 'Unknown error');
            if (data.data) {
                console.log('Error details:', data.data);
            }
        }
    })
    .catch(error => {
        console.error('\n❌ AJAX Error:', error);
    });
    
    // 4. Check component state
    console.log('\n📦 Checking Component State...');
    if (window.componentManager) {
        const components = window.componentManager.getAllComponents();
        const topicsComponent = Object.values(components).find(c => c.type === 'topics');
        if (topicsComponent) {
            console.log('Topics component found:', topicsComponent);
            console.log('Component props:', topicsComponent.props);
        } else {
            console.log('No topics component in component manager');
        }
    }
    
    // 5. Check DOM
    console.log('\n🌐 Checking DOM...');
    const topicsElements = document.querySelectorAll('.topics-component, [data-component-type="topics"]');
    console.log(`Found ${topicsElements.length} topics element(s) in DOM`);
    
    topicsElements.forEach((el, i) => {
        const topics = el.querySelectorAll('.topic-item');
        console.log(`Component ${i + 1}: ${topics.length} topics displayed`);
    });
    
    // 6. Try alternate AJAX action
    console.log('\n🔄 Testing alternate AJAX action (save_custom_topics with GET)...');
    
    const altFormData = new FormData();
    altFormData.append('action', 'save_custom_topics');
    altFormData.append('post_id', postId);
    altFormData.append('topics', '[]'); // Empty topics to trigger load
    altFormData.append('nonce', window.gmkbData?.nonce || '');
    
    // Note: This is just to test if the handler responds
    fetch(window.gmkbData?.ajaxurl || '/wp-admin/admin-ajax.php', {
        method: 'POST',
        body: altFormData,
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        console.log('\nAlternate action response:', data);
    })
    .catch(error => {
        console.error('Alternate action error:', error);
    });
})();

// Also create a function to manually test the render
window.testTopicsRender = function() {
    console.log('\n🎨 Testing Manual Render...');
    
    // Try to get the enhanced component renderer
    if (window.enhancedComponentRenderer) {
        const testTopics = [
            { title: 'Test Topic 1', description: '' },
            { title: 'Test Topic 2', description: '' },
            { title: 'Test Topic 3', description: '' }
        ];
        
        console.log('Attempting to update component with test topics...');
        
        // Find topics component
        const components = window.componentManager?.getAllComponents() || {};
        const topicsComponentId = Object.keys(components).find(id => components[id].type === 'topics');
        
        if (topicsComponentId) {
            // Update component props
            window.componentManager.updateComponent(topicsComponentId, {
                loaded_topics: testTopics,
                topics: testTopics
            });
            
            console.log('✅ Updated component with test topics');
        } else {
            console.log('❌ No topics component found to update');
        }
    } else {
        console.log('❌ Enhanced component renderer not available');
    }
};

console.log('\n💡 Run testTopicsRender() to test rendering with dummy data');
