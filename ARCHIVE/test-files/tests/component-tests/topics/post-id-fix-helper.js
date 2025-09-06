/**
 * Quick Post ID Fix Helper
 * Run this in the browser console to help fix the post ID issue
 */

function quickPostIdFix() {
    console.log('🔧 Quick Post ID Fix Helper');
    console.log('============================');
    
    // Get current URL
    const currentUrl = window.location.href;
    console.log('Current URL:', currentUrl);
    
    // Check if URL has post_id parameter
    const urlParams = new URLSearchParams(window.location.search);
    const postIdParam = urlParams.get('post_id');
    const pParam = urlParams.get('p');
    
    console.log('URL Parameters:');
    console.log('  post_id:', postIdParam || 'NOT FOUND');
    console.log('  p:', pParam || 'NOT FOUND');
    
    // Check DOM for post ID
    const topicsComponent = document.querySelector('.topics-component');
    const bodyPostId = document.body.dataset.postId;
    
    console.log('DOM Post ID Detection:');
    console.log('  Topics component post ID:', topicsComponent?.dataset.postId || 'NOT FOUND');
    console.log('  Body post ID:', bodyPostId || 'NOT FOUND');
    
    // Check window data
    console.log('Window Data:');
    console.log('  gmkbData.postId:', window.gmkbData?.postId || 'NOT FOUND');
    console.log('  guestifyData.postId:', window.guestifyData?.postId || 'NOT FOUND');
    
    // Suggest solutions
    console.log('\\n💡 Solutions:');
    
    if (!postIdParam && !pParam) {
        console.log('1. Add post_id to URL:');
        const fixedUrl = currentUrl + (currentUrl.includes('?') ? '&' : '?') + 'post_id=YOUR_POST_ID';
        console.log('   Example:', fixedUrl);
        
        // Try to get post ID from somewhere
        const detectedPostId = topicsComponent?.dataset.postId || 
                              bodyPostId || 
                              window.gmkbData?.postId || 
                              window.guestifyData?.postId;
        
        if (detectedPostId && detectedPostId !== '0') {
            const autoFixUrl = currentUrl + (currentUrl.includes('?') ? '&' : '?') + 'post_id=' + detectedPostId;
            console.log('   Auto-fix URL:', autoFixUrl);
            console.log('   Run: window.location.href = \"' + autoFixUrl + '\"');
        }
    }
    
    console.log('2. Enable WordPress debug mode in wp-config.php:');
    console.log('   define(\"WP_DEBUG\", true);');
    console.log('   define(\"WP_DEBUG_LOG\", true);');
    
    console.log('3. Check WordPress error log for detailed debugging');
    
    // Return diagnostic object
    return {
        url: currentUrl,
        postIdParam,
        pParam,
        domPostId: topicsComponent?.dataset.postId,
        bodyPostId,
        gmkbDataPostId: window.gmkbData?.postId,
        guestifyDataPostId: window.guestifyData?.postId
    };
}

// Auto-run if in debug mode
if (window.gmkbData?.debugMode) {
    console.log('🔍 Debug mode detected - running post ID diagnostic...');
    setTimeout(quickPostIdFix, 1000);
}

// Make function available globally
window.quickPostIdFix = quickPostIdFix;

console.log('💡 Post ID Fix Helper loaded. Run: quickPostIdFix()');
