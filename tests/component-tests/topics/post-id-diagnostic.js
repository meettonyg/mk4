/**
 * Post ID Detection Diagnostic Script
 * Helps identify why post ID detection is failing
 */

console.log('🔍 Post ID Detection Diagnostic Starting...');

// Check URL parameters
const urlParams = new URLSearchParams(window.location.search);
const postIdFromUrl = urlParams.get('post_id') || urlParams.get('p');
console.log('📍 URL post_id parameter:', postIdFromUrl);
console.log('📍 Current URL:', window.location.href);

// Check window data objects
console.log('📍 window.gmkbData:', window.gmkbData);
console.log('📍 window.guestifyData:', window.guestifyData);
console.log('📍 window.guestifyMediaKit:', window.guestifyMediaKit);

// Check DOM elements for post ID
const elementsWithPostId = document.querySelectorAll('[data-post-id]');
console.log('📍 Elements with data-post-id:', elementsWithPostId);

elementsWithPostId.forEach(element => {
    console.log(`  - ${element.tagName}.${element.className}: ${element.dataset.postId}`);
});

// Check topics component specifically
const topicsComponents = document.querySelectorAll('.topics-component, [data-component="topics"]');
console.log('📍 Topics components found:', topicsComponents.length);

topicsComponents.forEach((component, index) => {
    console.log(`  Component ${index}:`, {
        postId: component.dataset.postId,
        componentId: component.dataset.componentId,
        hasTopics: component.dataset.hasTopics,
        topicsCount: component.dataset.topicsCount
    });
});

// Check for post ID in page body
const bodyPostId = document.body.dataset.postId;
console.log('📍 Body post ID:', bodyPostId);

// Check for WordPress post data
if (typeof wp !== 'undefined' && wp.data) {
    console.log('📍 WordPress data available:', wp.data);
}

// Summary
console.log('📋 Post ID Detection Summary:');
console.log('  URL parameter:', postIdFromUrl || 'NOT FOUND');
console.log('  Window data:', window.gmkbData?.postId || 'NOT FOUND');
console.log('  DOM elements:', elementsWithPostId.length > 0 ? 'FOUND' : 'NOT FOUND');
console.log('  Topics components:', topicsComponents.length);

// Recommendation
if (!postIdFromUrl && !window.gmkbData?.postId && elementsWithPostId.length === 0) {
    console.error('❌ NO POST ID FOUND! Topics cannot load without a post ID.');
    console.log('💡 Recommendations:');
    console.log('  1. Add ?post_id=YOUR_POST_ID to the URL');
    console.log('  2. Ensure gmkbData.postId is set');
    console.log('  3. Check WordPress context and global $post object');
} else {
    console.log('✅ Post ID detection diagnostic complete');
}
