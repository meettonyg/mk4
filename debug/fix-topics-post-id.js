/**
 * Topics Post ID Fix
 * Ensures post ID is available for topics component loading
 */
(function() {
    'use strict';
    
    console.log('🔧 Topics Post ID Fix: Initializing...');
    
    // Get post ID from URL
    const urlParams = new URLSearchParams(window.location.search);
    const postId = urlParams.get('mkcg_id') || urlParams.get('post_id') || 0;
    
    if (!postId) {
        console.warn('⚠️ Topics Post ID Fix: No post ID found in URL');
        return;
    }
    
    console.log('✅ Topics Post ID Fix: Using post ID', postId);
    
    // Override the AJAX component render to include post ID
    if (window.jQuery) {
        const originalAjax = jQuery.ajax;
        jQuery.ajax = function(options) {
            // Check if this is a component render request
            if (options.data && typeof options.data === 'object') {
                if (options.data.action === 'guestify_render_component' || 
                    options.data.action === 'gmkb_load_component_template') {
                    
                    // Ensure post_id is in the data
                    if (!options.data.post_id) {
                        options.data.post_id = postId;
                        console.log('📌 Added post_id to AJAX request:', postId);
                    }
                    
                    // Also add to props if component is topics
                    if (options.data.component === 'topics' && options.data.props) {
                        try {
                            let props = typeof options.data.props === 'string' 
                                ? JSON.parse(options.data.props) 
                                : options.data.props;
                            
                            if (!props.post_id) {
                                props.post_id = postId;
                                options.data.props = JSON.stringify(props);
                                console.log('📌 Added post_id to topics props:', postId);
                            }
                        } catch (e) {
                            console.error('Failed to parse props:', e);
                        }
                    }
                }
            }
            
            return originalAjax.call(this, options);
        };
    }
    
    // Also intercept fetch requests
    const originalFetch = window.fetch;
    window.fetch = function(url, options) {
        if (options && options.body && options.body instanceof FormData) {
            const action = options.body.get('action');
            
            if (action === 'guestify_render_component' || action === 'gmkb_load_component_template') {
                // Ensure post_id is in the form data
                if (!options.body.has('post_id')) {
                    options.body.append('post_id', postId);
                    console.log('📌 Added post_id to fetch request:', postId);
                }
                
                // Also add to props if component is topics
                const component = options.body.get('component');
                if (component === 'topics') {
                    const propsStr = options.body.get('props');
                    if (propsStr) {
                        try {
                            let props = JSON.parse(propsStr);
                            if (!props.post_id) {
                                props.post_id = postId;
                                options.body.set('props', JSON.stringify(props));
                                console.log('📌 Added post_id to topics props in fetch:', postId);
                            }
                        } catch (e) {
                            console.error('Failed to parse props in fetch:', e);
                        }
                    }
                }
            }
        }
        
        return originalFetch.call(this, url, options);
    };
    
    console.log('✅ Topics Post ID Fix: Ready');
    
    // Also update gmkbData if it exists
    if (window.gmkbData && !window.gmkbData.post_id) {
        window.gmkbData.post_id = postId;
        console.log('📌 Added post_id to gmkbData:', postId);
    }
})();
