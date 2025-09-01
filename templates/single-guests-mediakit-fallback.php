<?php
/**
 * Fallback Media Kit Template
 * 
 * This template is used when the theme doesn't have single-guests-mediakit.php
 * Displays the saved media kit dynamically with no hardcoded content.
 * 
 * CHECKLIST COMPLIANT:
 * ✅ No Polling: Direct rendering, no waiting
 * ✅ Simplicity First: Minimal HTML, maximum flexibility
 * ✅ Root Cause Fix: Provides complete fallback solution
 */

// Get the media kit state
$media_kit_state = isset($GLOBALS['gmkb_media_kit_state']) ? $GLOBALS['gmkb_media_kit_state'] : null;
$post_id = isset($GLOBALS['gmkb_media_kit_post_id']) ? $GLOBALS['gmkb_media_kit_post_id'] : get_the_ID();

// Fallback if state not in globals
if (!$media_kit_state && $post_id) {
    $media_kit_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
}

// If still no state, show error
if (empty($media_kit_state)) {
    get_header();
    ?>
    <div class="gmkb-error-container" style="padding: 40px; text-align: center;">
        <h2>Media Kit Not Available</h2>
        <p>This guest's media kit is currently being updated. Please check back soon.</p>
        <a href="<?php echo home_url(); ?>" class="button">Return Home</a>
    </div>
    <?php
    get_footer();
    exit;
}

// Get components in proper order
$components = array();
if (!empty($media_kit_state['saved_components'])) {
    $components = $media_kit_state['saved_components'];
} elseif (!empty($media_kit_state['layout']) && !empty($media_kit_state['components'])) {
    foreach ($media_kit_state['layout'] as $component_id) {
        if (isset($media_kit_state['components'][$component_id])) {
            $component = $media_kit_state['components'][$component_id];
            $component['id'] = $component_id;
            $components[] = $component;
        }
    }
} elseif (!empty($media_kit_state['components'])) {
    $components = array_values($media_kit_state['components']);
}

// Get global settings
$global_settings = isset($media_kit_state['globalSettings']) ? $media_kit_state['globalSettings'] : array();

// Get post data
$post = get_post($post_id);

get_header();
?>

<!-- Media Kit Container -->
<article id="gmkb-media-kit-<?php echo esc_attr($post_id); ?>" class="gmkb-media-kit-container gmkb-frontend-display">
    
    <?php if (empty($components)): ?>
        <!-- Empty State -->
        <div class="gmkb-empty-state">
            <h2>Media Kit Under Construction</h2>
            <p>This media kit is currently being built. Please check back soon.</p>
        </div>
    <?php else: ?>
        <!-- Dynamic Component Rendering -->
        <div class="gmkb-components-wrapper">
            <?php foreach ($components as $index => $component): 
                $component_type = isset($component['type']) ? $component['type'] : 'unknown';
                $component_id = isset($component['id']) ? $component['id'] : 'component-' . $index;
                $component_data = isset($component['data']) ? $component['data'] : array();
                $component_props = isset($component['props']) ? $component['props'] : array();
                ?>
                
                <section class="gmkb-component gmkb-component--<?php echo esc_attr($component_type); ?>" 
                         data-component-id="<?php echo esc_attr($component_id); ?>"
                         data-component-type="<?php echo esc_attr($component_type); ?>"
                         data-component-index="<?php echo esc_attr($index); ?>">
                    
                    <?php
                    // Try to load component template
                    $component_template = GMKB_PLUGIN_DIR . "components/{$component_type}/frontend-template.php";
                    
                    // If no frontend template, try regular template
                    if (!file_exists($component_template)) {
                        $component_template = GMKB_PLUGIN_DIR . "components/{$component_type}/template.php";
                    }
                    
                    if (file_exists($component_template)) {
                        // Set up props for template
                        $props = array_merge($component_props, array(
                            'data' => $component_data,
                            'component_id' => $component_id,
                            'is_frontend' => true,
                            'post_id' => $post_id
                        ));
                        
                        // Include template
                        include $component_template;
                    } else {
                        // Fallback rendering
                        echo $this->render_component_fallback($component_type, $component_data, $component_props);
                    }
                    ?>
                </section>
                
            <?php endforeach; ?>
        </div>
    <?php endif; ?>
    
</article>

<?php
get_footer();

// Helper function for fallback rendering
function render_component_fallback($type, $data, $props) {
    ob_start();
    ?>
    <div class="gmkb-component-fallback">
        <div class="gmkb-component-header">
            <h3><?php echo esc_html(ucwords(str_replace('-', ' ', $type))); ?></h3>
        </div>
        <div class="gmkb-component-content">
            <?php
            // Render based on common component types
            switch ($type) {
                case 'hero':
                    if (!empty($data['title'])) echo '<h2>' . esc_html($data['title']) . '</h2>';
                    if (!empty($data['subtitle'])) echo '<p class="subtitle">' . esc_html($data['subtitle']) . '</p>';
                    if (!empty($data['description'])) echo '<div class="description">' . wp_kses_post($data['description']) . '</div>';
                    if (!empty($data['image'])) echo '<img src="' . esc_url($data['image']) . '" alt="' . esc_attr($data['title'] ?? '') . '">';
                    break;
                    
                case 'biography':
                    if (!empty($data['short'])) echo '<div class="bio-short">' . wp_kses_post($data['short']) . '</div>';
                    if (!empty($data['long'])) echo '<div class="bio-long">' . wp_kses_post($data['long']) . '</div>';
                    break;
                    
                case 'topics':
                    if (!empty($data['topics']) && is_array($data['topics'])) {
                        echo '<ul class="topics-list">';
                        foreach ($data['topics'] as $topic) {
                            echo '<li>' . esc_html($topic) . '</li>';
                        }
                        echo '</ul>';
                    }
                    break;
                    
                case 'social':
                    if (!empty($data['links']) && is_array($data['links'])) {
                        echo '<div class="social-links">';
                        foreach ($data['links'] as $platform => $url) {
                            echo '<a href="' . esc_url($url) . '" target="_blank" rel="noopener">' . esc_html($platform) . '</a> ';
                        }
                        echo '</div>';
                    }
                    break;
                    
                default:
                    // Generic data display
                    if (!empty($data)) {
                        echo '<pre class="component-data">' . esc_html(json_encode($data, JSON_PRETTY_PRINT)) . '</pre>';
                    }
                    break;
            }
            ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}
?>
