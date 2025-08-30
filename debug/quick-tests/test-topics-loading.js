/**
 * Test Topics Loading Diagnostic
 * Run this in the browser console to diagnose topics loading issues
 */

(function() {
    console.log('🔍 TOPICS LOADING DIAGNOSTIC');
    console.log('============================');
    
    // Get current post ID from various sources
    let postId = 0;
    
    // Try to get from URL
    const urlParams = new URLSearchParams(window.location.search);
    postId = urlParams.get('mkcg_id') || urlParams.get('post_id') || urlParams.get('p') || 0;
    
    // Try to get from gmkbData
    if (!postId && window.gmkbData && window.gmkbData.post_id) {
        postId = window.gmkbData.post_id;
    }
    
    // Try to get from body attribute
    if (!postId) {
        const bodyPostId = document.body.getAttribute('data-post-id');
        if (bodyPostId) postId = bodyPostId;
    }
    
    console.log('📝 Post ID detected:', postId);
    
    if (!postId || postId == 0) {
        console.error('❌ No post ID found! Cannot test topics loading.');
        console.log('Make sure you have ?mkcg_id=YOUR_POST_ID in the URL');
        return;
    }
    
    // Test direct AJAX load
    console.log('\n🔄 Testing direct AJAX topics load...');
    
    const formData = new FormData();
    formData.append('action', 'load_stored_topics');
    formData.append('post_id', postId);
    formData.append('nonce', window.gmkbData ? window.gmkbData.nonce : '');
    
    fetch(window.gmkbData ? window.gmkbData.ajaxurl : '/wp-admin/admin-ajax.php', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        console.log('✅ AJAX Response:', data);
        
        if (data.success && data.data) {
            console.log('📊 Topics found:', data.data.total_topics);
            console.log('📋 Topics data:', data.data.topics);
            console.log('🔍 Data source:', data.data.data_source);
            
            // Display topics
            if (data.data.topics) {
                console.log('\n📝 TOPICS CONTENT:');
                Object.entries(data.data.topics).forEach(([key, value]) => {
                    if (value) {
                        console.log(`  ${key}: "${value}"`);
                    }
                });
            }
        } else {
            console.error('❌ Failed to load topics:', data.message || 'Unknown error');
        }
    })
    .catch(error => {
        console.error('❌ AJAX Error:', error);
    });
    
    // Check if topics component exists in DOM
    console.log('\n🔍 Checking DOM for topics components...');
    const topicsComponents = document.querySelectorAll('[data-component-type="topics"], .topics-component');
    console.log(`Found ${topicsComponents.length} topics component(s) in DOM`);
    
    topicsComponents.forEach((component, index) => {
        console.log(`\n📦 Topics Component ${index + 1}:`);
        console.log('  ID:', component.id || 'No ID');
        console.log('  Classes:', component.className);
        
        const topicItems = component.querySelectorAll('.topic-item');
        console.log(`  Topics displayed: ${topicItems.length}`);
        
        topicItems.forEach((item, i) => {
            const topicTitle = item.querySelector('.topic-title');
            if (topicTitle) {
                console.log(`    Topic ${i + 1}: "${topicTitle.textContent.trim()}"`);
            }
        });
    });
    
    // Check state manager
    if (window.stateManager) {
        console.log('\n📊 Checking State Manager...');
        const state = window.stateManager.getState();
        if (state && state.components) {
            const topicsComponents = Object.entries(state.components).filter(([id, comp]) => 
                comp.type === 'topics'
            );
            console.log(`Found ${topicsComponents.length} topics component(s) in state`);
            
            topicsComponents.forEach(([id, comp]) => {
                console.log(`\n  Component ${id}:`);
                console.log('    Props:', comp.props);
                if (comp.props && comp.props.loaded_topics) {
                    console.log('    Loaded topics count:', comp.props.loaded_topics.length);
                }
            });
        }
    }
    
    console.log('\n✅ Diagnostic complete!');
})();

// Export as global function for easy access
window.testTopicsLoading = function() {
    console.clear();
    eval(arguments.callee.toString().match(/function[^{]+\{([\s\S]*)\}$/)[1]);
};