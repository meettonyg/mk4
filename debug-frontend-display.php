<?php
/**
 * Debug script for Media Kit Frontend Display
 * Add this to your theme's functions.php temporarily:
 * require_once WP_PLUGIN_DIR . '/mk4/debug-frontend-display.php';
 */

// Hook into WordPress to add debugging
add_action('wp', function() {
    if (!is_singular('guests')) {
        return;
    }
    
    global $post;
    $post_id = $post->ID;
    
    // Check if media kit data exists
    $media_kit_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
    
    error_log('========== GMKB FRONTEND DEBUG ==========');
    error_log('1. Current post ID: ' . $post_id);
    error_log('2. Post type: ' . get_post_type());
    error_log('3. Media kit data exists: ' . (!empty($media_kit_state) ? 'YES' : 'NO'));
    
    if (!empty($media_kit_state)) {
        error_log('4. Media kit structure:');
        error_log('   - Has components: ' . (isset($media_kit_state['components']) ? 'YES (' . count($media_kit_state['components']) . ')' : 'NO'));
        error_log('   - Has saved_components: ' . (isset($media_kit_state['saved_components']) ? 'YES (' . count($media_kit_state['saved_components']) . ')' : 'NO'));
        error_log('   - Has sections: ' . (isset($media_kit_state['sections']) ? 'YES (' . count($media_kit_state['sections']) . ')' : 'NO'));
        error_log('   - Has layout: ' . (isset($media_kit_state['layout']) ? 'YES (' . count($media_kit_state['layout']) . ')' : 'NO'));
    }
    
    // Check if template router is active
    if (class_exists('GMKB_Frontend_Template_Router')) {
        error_log('5. Template Router class: EXISTS');
        error_log('6. Post has media kit (router check): ' . (GMKB_Frontend_Template_Router::post_has_media_kit($post_id) ? 'YES' : 'NO'));
    } else {
        error_log('5. Template Router class: NOT FOUND');
    }
    
    // Check template being used
    add_filter('template_include', function($template) use ($post_id) {
        error_log('7. Template being loaded: ' . $template);
        return $template;
    }, 9999);
    
    // Check if plugin constants are defined
    error_log('8. Plugin constants:');
    error_log('   - GMKB_PLUGIN_DIR: ' . (defined('GMKB_PLUGIN_DIR') ? GMKB_PLUGIN_DIR : 'NOT DEFINED'));
    error_log('   - GMKB_PLUGIN_URL: ' . (defined('GMKB_PLUGIN_URL') ? GMKB_PLUGIN_URL : 'NOT DEFINED'));
    
    // Check if media kit template exists
    if (defined('GMKB_PLUGIN_DIR')) {
        $template_path = GMKB_PLUGIN_DIR . 'templates/mediakit-frontend-template.php';
        error_log('9. Media kit template exists: ' . (file_exists($template_path) ? 'YES at ' . $template_path : 'NO'));
    }
    
    // Check globals
    error_log('10. Global variables:');
    error_log('    - gmkb_using_media_kit_template: ' . (isset($GLOBALS['gmkb_using_media_kit_template']) ? 'SET' : 'NOT SET'));
    error_log('    - gmkb_media_kit_state: ' . (isset($GLOBALS['gmkb_media_kit_state']) ? 'SET' : 'NOT SET'));
    error_log('    - gmkb_media_kit_post_id: ' . (isset($GLOBALS['gmkb_media_kit_post_id']) ? 'SET' : 'NOT SET'));
    
    error_log('========== END GMKB DEBUG ==========');
}, 99);

// Add JavaScript console debugging
add_action('wp_footer', function() {
    if (!is_singular('guests')) {
        return;
    }
    
    global $post;
    $post_id = $post->ID;
    $media_kit_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
    
    ?>
    <script>
    console.log('%c===== GMKB FRONTEND DEBUG =====', 'background: #4CAF50; color: white; padding: 5px;');
    console.log('Post ID:', <?php echo $post_id; ?>);
    console.log('Post Type:', '<?php echo get_post_type(); ?>');
    console.log('Has Media Kit Data:', <?php echo !empty($media_kit_state) ? 'true' : 'false'; ?>);
    
    <?php if (!empty($media_kit_state)): ?>
    console.log('Media Kit Structure:', {
        components: <?php echo isset($media_kit_state['components']) ? count($media_kit_state['components']) : 0; ?>,
        saved_components: <?php echo isset($media_kit_state['saved_components']) ? count($media_kit_state['saved_components']) : 0; ?>,
        sections: <?php echo isset($media_kit_state['sections']) ? count($media_kit_state['sections']) : 0; ?>,
        layout: <?php echo isset($media_kit_state['layout']) ? count($media_kit_state['layout']) : 0; ?>
    });
    
    // Log first component if exists
    <?php 
    if (!empty($media_kit_state['saved_components'][0])) {
        $first = $media_kit_state['saved_components'][0];
        echo "console.log('First Component:', " . json_encode(array(
            'type' => $first['type'] ?? 'unknown',
            'id' => $first['id'] ?? 'no-id',
            'has_props' => isset($first['props']),
            'has_data' => isset($first['data'])
        )) . ");";
    }
    ?>
    <?php endif; ?>
    
    // Check for template router
    console.log('Template Router Active:', typeof GMKB_Frontend_Template_Router !== 'undefined');
    
    // Check DOM for media kit elements
    const mediaKitContainer = document.querySelector('.gmkb-media-kit-container, .gmkb-frontend-display, #gmkb-media-kit-<?php echo $post_id; ?>');
    console.log('Media Kit Container Found:', mediaKitContainer ? 'YES' : 'NO');
    
    if (mediaKitContainer) {
        console.log('Container Classes:', mediaKitContainer.className);
        console.log('Container ID:', mediaKitContainer.id);
        console.log('Container HTML Length:', mediaKitContainer.innerHTML.length);
        console.log('Child Elements:', mediaKitContainer.children.length);
    }
    
    // Check for components in DOM
    const components = document.querySelectorAll('.gmkb-component');
    console.log('Components Found in DOM:', components.length);
    
    if (components.length > 0) {
        components.forEach((comp, idx) => {
            console.log(`Component ${idx}:`, {
                type: comp.dataset.componentType,
                id: comp.dataset.componentId,
                classes: comp.className
            });
        });
    }
    
    // Check for error messages
    const errorElements = document.querySelectorAll('.gmkb-error-container, .gmkb-empty-state');
    if (errorElements.length > 0) {
        console.warn('Error/Empty elements found:', errorElements);
    }
    
    // Check body classes
    console.log('Body Classes:', document.body.className);
    
    // Check if theme template is being used
    const heroSection = document.querySelector('.hero-section');
    console.log('Theme Hero Section Found:', heroSection ? 'YES - Using theme template' : 'NO');
    
    console.log('%c===== END DEBUG =====', 'background: #4CAF50; color: white; padding: 5px;');
    </script>
    <?php
});

// Add visible debug panel
add_action('wp_body_open', function() {
    if (!is_singular('guests') || !isset($_GET['debug'])) {
        return;
    }
    
    global $post;
    $post_id = $post->ID;
    $media_kit_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
    
    ?>
    <div style="position: fixed; top: 0; left: 0; right: 0; background: #333; color: #fff; padding: 10px; z-index: 99999; font-family: monospace; font-size: 12px;">
        <strong>GMKB Debug Panel</strong> | 
        Post: <?php echo $post_id; ?> | 
        Has MK Data: <?php echo !empty($media_kit_state) ? 'YES' : 'NO'; ?> | 
        Components: <?php echo isset($media_kit_state['saved_components']) ? count($media_kit_state['saved_components']) : 0; ?> | 
        Template: <?php echo basename(get_page_template()); ?>
    </div>
    <?php
});
