// Direct test to check what's happening with the AJAX request
(function() {
    console.clear();
    console.log('🔍 Testing Component Template Loading...\n');
    
    // First check gmkbData
    if (!window.gmkbData) {
        console.error('❌ gmkbData not found!');
        return;
    }
    
    console.log('✅ gmkbData found');
    console.log('  ajaxUrl:', window.gmkbData.ajaxUrl);
    console.log('  nonce:', window.gmkbData.nonce ? 'Present' : 'Missing');
    console.log('  post_id:', window.gmkbData.post_id);
    
    // Now test the AJAX request directly
    const formData = new FormData();
    formData.append('action', 'guestify_render_component');
    formData.append('component', 'topics');
    formData.append('nonce', window.gmkbData.nonce);
    formData.append('post_id', window.gmkbData.post_id || 32372);
    formData.append('props', JSON.stringify({
        post_id: window.gmkbData.post_id || 32372,
        component_id: 'test-topics-' + Date.now()
    }));
    
    console.log('\n🔄 Sending test AJAX request...');
    
    fetch(window.gmkbData.ajaxUrl, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    })
    .then(response => {
        console.log('\n📥 Response status:', response.status);
        return response.text();
    })
    .then(text => {
        console.log('\n📄 Raw response (first 500 chars):', text.substring(0, 500));
        
        try {
            const data = JSON.parse(text);
            console.log('\n✅ Parsed response:', data);
            
            if (data.success) {
                console.log('\n🎉 SUCCESS! Got template');
                
                // Check the HTML
                if (data.data && data.data.html) {
                    const tempDiv = document.createElement('div');
                    tempDiv.innerHTML = data.data.html;
                    
                    const topics = tempDiv.querySelectorAll('.topic-item');
                    console.log('  Topics found:', topics.length);
                    
                    if (topics.length === 0) {
                        console.log('\n⚠️ No topics in template');
                        console.log('Template preview:', tempDiv.textContent.substring(0, 200));
                    } else {
                        console.log('✅ Topics found in template!');
                        topics.forEach((topic, i) => {
                            console.log(`  Topic ${i + 1}:`, topic.textContent.trim());
                        });
                    }
                }
            } else {
                console.error('\n❌ Error:', data.data);
            }
        } catch (e) {
            console.error('\n❌ Failed to parse JSON:', e);
            console.log('Response was:', text);
        }
    })
    .catch(error => {
        console.error('\n❌ Fetch error:', error);
    });
})();
