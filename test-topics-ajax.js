// Test Topics AJAX Loading
(function() {
    console.clear();
    console.log('🔍 Testing Topics AJAX Loading...\n');
    
    // Check gmkbData
    console.log('📊 gmkbData check:');
    console.log('  ajaxUrl:', window.gmkbData?.ajaxUrl);
    console.log('  nonce:', window.gmkbData?.nonce ? 'Present' : 'Missing');
    console.log('  post_id:', window.gmkbData?.post_id);
    
    if (!window.gmkbData?.ajaxUrl || !window.gmkbData?.nonce) {
        console.error('❌ Missing AJAX configuration!');
        return;
    }
    
    // Test AJAX request
    const formData = new FormData();
    formData.append('action', 'guestify_render_component');
    formData.append('component', 'topics');
    formData.append('nonce', window.gmkbData.nonce);
    formData.append('post_id', window.gmkbData.post_id || 32372);
    formData.append('props', JSON.stringify({
        post_id: window.gmkbData.post_id || 32372
    }));
    
    console.log('\n🔄 Sending AJAX request...');
    console.log('  URL:', window.gmkbData.ajaxUrl);
    console.log('  Action:', 'guestify_render_component');
    console.log('  Component:', 'topics');
    console.log('  Post ID:', window.gmkbData.post_id || 32372);
    
    fetch(window.gmkbData.ajaxUrl, {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
    })
    .then(response => {
        console.log('\n📥 Response received:');
        console.log('  Status:', response.status);
        console.log('  OK:', response.ok);
        return response.text();
    })
    .then(text => {
        console.log('\n📄 Raw response:', text.substring(0, 500) + '...');
        
        try {
            const data = JSON.parse(text);
            console.log('\n✅ Parsed JSON:', data);
            
            if (data.success && data.data?.html) {
                console.log('\n🎉 Success! Got template HTML');
                
                // Check if topics are in the HTML
                const tempDiv = document.createElement('div');
                tempDiv.innerHTML = data.data.html;
                const topics = tempDiv.querySelectorAll('.topic-item');
                console.log('  Topics found in template:', topics.length);
                
                if (topics.length === 0) {
                    console.log('\n⚠️ Template loaded but no topics found');
                    console.log('Template HTML preview:', tempDiv.innerHTML.substring(0, 300) + '...');
                }
            }
        } catch (e) {
            console.error('❌ Failed to parse JSON:', e);
        }
    })
    .catch(error => {
        console.error('❌ AJAX Error:', error);
    });
})();
