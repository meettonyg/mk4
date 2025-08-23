/**
 * Test script for post ID detection and data flow
 * Place this in the browser console when on the media kit builder page
 */

console.group('🔍 Post ID Detection Test');

// Test 1: Check WordPress data availability
console.log('1️⃣ WordPress Data Check:');
if (window.gmkbData) {
    console.log('✅ gmkbData available');
    console.log('   Post ID:', window.gmkbData.postId || 'NOT SET');
    console.log('   AJAX URL:', window.gmkbData.ajaxUrl || 'NOT SET');
    console.log('   Nonce:', window.gmkbData.nonce ? 'SET' : 'NOT SET');
} else {
    console.error('❌ gmkbData not available');
}

// Test 2: Check URL parameters
console.log('\n2️⃣ URL Parameters Check:');
const urlParams = new URLSearchParams(window.location.search);
const possibleParams = ['post_id', 'p', 'page_id', 'mkcg_id', 'media_kit_id'];
let foundParam = false;

possibleParams.forEach(param => {
    const value = urlParams.get(param);
    if (value) {
        console.log(`✅ Found ${param}:`, value);
        foundParam = true;
    }
});

if (!foundParam) {
    console.warn('⚠️ No post ID parameter found in URL');
    console.log('   Add one of these to the URL: ' + possibleParams.join(', '));
}

// Test 3: Check component manager
console.log('\n3️⃣ Component Manager Check:');
if (window.enhancedComponentManager) {
    console.log('✅ Component Manager available');
    
    // Test WordPress data access
    try {
        const wpData = window.enhancedComponentManager.getWordPressData();
        console.log('   Post ID from manager:', wpData.postId || 'NOT SET');
        console.log('   Data source:', wpData === window.gmkbData ? 'gmkbData' : 'other');
    } catch (error) {
        console.error('❌ Error accessing WordPress data:', error.message);
    }
} else {
    console.warn('⚠️ Component Manager not available yet');
}

// Test 4: Test AJAX call for topics
console.log('\n4️⃣ Topics AJAX Test:');
async function testTopicsLoad() {
    if (!window.gmkbData || !window.gmkbData.postId) {
        console.error('❌ Cannot test - no post ID available');
        return;
    }
    
    const formData = new FormData();
    formData.append('action', 'load_stored_topics');
    formData.append('nonce', window.gmkbData.nonce);
    formData.append('post_id', window.gmkbData.postId);
    
    console.log('📡 Sending AJAX request to load topics...');
    console.log('   Post ID:', window.gmkbData.postId);
    
    try {
        const response = await fetch(window.gmkbData.ajaxUrl, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.success) {
            console.log('✅ Topics loaded successfully');
            console.log('   Topics count:', data.data.total_topics);
            console.log('   Data source:', data.data.data_source);
            console.log('   Post ID confirmed:', data.data.post_id);
        } else {
            console.error('❌ Topics load failed:', data.message);
        }
    } catch (error) {
        console.error('❌ AJAX error:', error);
    }
}

// Test 5: Check saved state
console.log('\n5️⃣ Saved State Check:');
if (window.gmkbData && window.gmkbData.saved_state) {
    const state = window.gmkbData.saved_state;
    const componentCount = Object.keys(state.components || {}).length;
    console.log('✅ Saved state available');
    console.log('   Components:', componentCount);
    console.log('   Has saved components array:', Array.isArray(state.saved_components));
} else {
    console.log('ℹ️ No saved state in WordPress data');
}

console.groupEnd();

// Provide test functions
window.postIdTests = {
    testTopicsLoad,
    
    // Test saving with current post ID
    async testSave() {
        if (!window.gmkbData || !window.gmkbData.postId) {
            console.error('Cannot test save - no post ID');
            return;
        }
        
        console.log('Testing save with post ID:', window.gmkbData.postId);
        
        if (window.enhancedComponentManager && window.enhancedComponentManager.manualSave) {
            try {
                await window.enhancedComponentManager.manualSave();
                console.log('✅ Save completed');
            } catch (error) {
                console.error('❌ Save failed:', error);
            }
        } else {
            console.error('Component manager not available');
        }
    },
    
    // Get current post ID from all sources
    getPostId() {
        const sources = {
            'gmkbData': window.gmkbData?.postId,
            'URL post_id': new URLSearchParams(window.location.search).get('post_id'),
            'URL p': new URLSearchParams(window.location.search).get('p'),
            'Body data-post-id': document.body.getAttribute('data-post-id')
        };
        
        console.table(sources);
        
        // Find first valid post ID
        for (const [source, id] of Object.entries(sources)) {
            if (id && parseInt(id) > 0) {
                console.log(`✅ Using post ID ${id} from ${source}`);
                return parseInt(id);
            }
        }
        
        console.error('❌ No valid post ID found');
        return 0;
    }
};

console.log('\n📚 Available test functions:');
console.log('- postIdTests.testTopicsLoad() - Test loading topics');
console.log('- postIdTests.testSave() - Test saving state');
console.log('- postIdTests.getPostId() - Get post ID from all sources');
