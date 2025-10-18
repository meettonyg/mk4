<?php
/**
 * Media Kit Frontend Display Template
 * 
 * This is the primary template for displaying media kits on the frontend.
 * It automatically renders when viewing any supported custom post type that has media kit data.
 * 
 * Features:
 * - Full theme support with dynamic CSS generation
 * - Section-based layouts (full width, 2-column, 3-column)
 * - Component rendering with lazy loading support
 * - Responsive design with mobile optimization
 * 
 * @package GMKB
 * @since 2.1.0
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
?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>Media Kit Not Available</title>
    <style>
        body::before {
            content: "📄";
            position: fixed;
            top: 20px;
            right: 20px;
            font-size: 24px;
            z-index: 9999;
            background: rgba(255,255,255,0.9);
            padding: 8px 12px;
            border-radius: 50%;
            box-shadow: 0 2px 10px rgba(0,0,0,0.1);
        }
    </style>
</head>
<body>
    <div class="gmkb-error-container" style="padding: 40px; text-align: center; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;">
        <h2>Media Kit Not Available</h2>
        <p>This guest's media kit is currently being updated. Please check back soon.</p>
        <a href="<?php echo home_url(); ?>" class="button">Return Home</a>
    </div>
<?php wp_footer(); ?>
</body>
</html>
<?php
    exit;
}

// ROOT FIX: Get sections and components in proper structure
$sections = isset($media_kit_state['sections']) ? $media_kit_state['sections'] : array();
$components_map = isset($media_kit_state['components']) ? $media_kit_state['components'] : array();

// ROOT FIX: Debug loaded data structure
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('========== MEDIA KIT STATE STRUCTURE ==========');
    error_log('Post ID: ' . $post_id);
    error_log('Has sections: ' . (!empty($sections) ? count($sections) : 0));
    error_log('Has components_map: ' . (!empty($components_map) ? count($components_map) : 0));
    
    if (!empty($sections)) {
        foreach ($sections as $idx => $section) {
            error_log('Section ' . $idx . ': ID=' . ($section['section_id'] ?? 'no-id') . ', Type=' . ($section['section_type'] ?? 'no-type'));
            $sec_comps = $section['components'] ?? array();
            error_log('  - Has ' . count($sec_comps) . ' component references');
            if (!empty($sec_comps)) {
                foreach ($sec_comps as $cidx => $cref) {
                    if (is_array($cref)) {
                        error_log('    [' . $cidx . '] Ref: ' . print_r($cref, true));
                    } else {
                        error_log('    [' . $cidx . '] ID: ' . $cref);
                    }
                }
            }
        }
    }
    
    if (!empty($components_map)) {
        error_log('Components in map:');
        foreach ($components_map as $cid => $comp) {
            error_log('  - ' . $cid . ' => type=' . ($comp['type'] ?? 'no-type') . ', has_props=' . (!empty($comp['props']) ? 'YES' : 'NO') . ', has_settings=' . (!empty($comp['settings']) ? 'YES' : 'NO'));
        }
    }
    error_log('===============================================');
}

// Build ordered component list
$components = array();
if (!empty($media_kit_state['saved_components'])) {
    $components = $media_kit_state['saved_components'];
} elseif (!empty($media_kit_state['layout']) && !empty($components_map)) {
    foreach ($media_kit_state['layout'] as $component_id) {
        if (isset($components_map[$component_id])) {
            $component = $components_map[$component_id];
            $component['id'] = $component_id;
            $components[] = $component;
        }
    }
} elseif (!empty($components_map)) {
    foreach ($components_map as $id => $component) {
        $component['id'] = $id;
        $components[] = $component;
    }
}

// Get global settings
$global_settings = isset($media_kit_state['globalSettings']) ? $media_kit_state['globalSettings'] : array();

// Get post data
$post = get_post($post_id);

?><!DOCTYPE html>
<html <?php language_attributes(); ?>>
<head>
    <meta charset="<?php bloginfo('charset'); ?>">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title><?php echo esc_html($post->post_title ?? get_the_title()); ?> - Media Kit</title>
    
    <!-- SEO Meta Tags -->
    <?php if ($post): ?>
        <meta name="description" content="<?php echo esc_attr(wp_trim_words($post->post_excerpt ?: $post->post_content, 25)); ?>">
        <?php if (has_post_thumbnail($post_id)): ?>
            <meta property="og:image" content="<?php echo get_the_post_thumbnail_url($post_id, 'large'); ?>">
        <?php endif; ?>
    <?php endif; ?>
    
    <?php 
    // ROOT FIX: Clean wp_head() - styling comes from Vue bundle and theme CSS
    // Action hooks are handled in enqueue.php
    wp_head(); 
    ?>
</head>
<body <?php body_class(['gmkb-media-kit-page', 'gmkb-theme--' . esc_attr($global_settings['theme'] ?? 'professional_clean')]); ?>>



<?php
// ROOT FIX: Simplified debug output
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log('✅ MEDIAKIT TEMPLATE: Rendering media kit for post_id=' . $post_id);
}

// Use the enhanced frontend display class if available
if (class_exists('GMKB_Frontend_Display')) {
    try {
    // Get the frontend display instance
    $frontend_display = GMKB_Frontend_Display::get_instance();
    
    // Load theme from media kit state
    $theme_id = isset($media_kit_state['globalSettings']['theme']) ? $media_kit_state['globalSettings']['theme'] : 'professional_clean';
    
    // Render the media kit with theme support
    $frontend_display->render_media_kit_template($media_kit_state, $post_id, $theme_id);
    } catch (Exception $e) {
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('MEDIAKIT TEMPLATE ERROR: ' . $e->getMessage());
        }
        // Fall through to basic display mode
        goto basic_display;
    }
} else {
    basic_display:
    // Basic display mode (when enhanced display class is not available)
    ?>
    <!-- Media Kit Container -->
    <article id="gmkb-media-kit-<?php echo esc_attr($post_id); ?>" 
             class="gmkb-media-kit-container gmkb-frontend-display"
             data-gmkb-theme="<?php echo esc_attr($global_settings['theme'] ?? 'professional_clean'); ?>">
    
    <?php if (empty($components) && empty($sections)): ?>
        <!-- Empty State -->
        <div class="gmkb-empty-state">
            <h2>Media Kit Under Construction</h2>
            <p>This media kit is currently being built. Please check back soon.</p>
        </div>
    <?php else: ?>
        <!-- ROOT FIX: Section-Based Rendering -->
        <?php if (!empty($sections)): ?>
            <!-- Render with sections -->
            <div class="gmkb-sections-wrapper">
                <?php foreach ($sections as $section_index => $section): 
                    $section_id = isset($section['section_id']) ? $section['section_id'] : 'section-' . $section_index;
                    $section_type = isset($section['section_type']) ? $section['section_type'] : 'full_width';
                    $section_layout = isset($section['layout']) ? $section['layout'] : array();
                    $section_components = isset($section['components']) ? $section['components'] : array();
                    $section_settings = isset($section['settings']) ? $section['settings'] : array();
                    
                    // Build section classes
                    $section_classes = array(
                        'gmkb-section',
                        'gmkb-section--' . $section_type
                    );
                    if (!empty($section_settings['fullWidth'])) {
                        $section_classes[] = 'gmkb-section--full-width';
                    }
                    if (!empty($section_settings['reverseOnMobile'])) {
                        $section_classes[] = 'gmkb-section--reverse-mobile';
                    }
                    ?>
                    
                    <section class="<?php echo esc_attr(implode(' ', $section_classes)); ?>" 
                             data-section-id="<?php echo esc_attr($section_id); ?>"
                             data-section-type="<?php echo esc_attr($section_type); ?>">
                        
                        <div class="gmkb-section-inner" style="<?php 
                            if (isset($section_layout['max_width'])) echo 'max-width: ' . esc_attr($section_layout['max_width']) . ';';
                            if (isset($section_layout['padding'])) echo 'padding: ' . esc_attr($section_layout['padding']) . ';';
                        ?>">
                            
                            <?php if ($section_type === 'two_column' || $section_type === 'three_column' || $section_type === 'main_sidebar' || $section_type === 'sidebar_main'): ?>
                                <!-- Multi-column layout -->
                                <div class="gmkb-section-columns gmkb-columns--<?php echo esc_attr($section_layout['columns'] ?? ($section_type === 'three_column' ? 3 : 2)); ?>">
                                    <?php 
                                    // Group components by column
                                    $columns = array();
                                    foreach ($section_components as $comp_ref) {
                                        $column = isset($comp_ref['column']) ? $comp_ref['column'] : 1;
                                        if (!isset($columns[$column])) $columns[$column] = array();
                                        $columns[$column][] = $comp_ref;
                                    }
                                    
                                    // Determine number of columns based on layout type
                                    $num_columns = 1;
                                    if ($section_type === 'three_column') {
                                        $num_columns = 3;
                                    } elseif ($section_type === 'two_column' || $section_type === 'main_sidebar' || $section_type === 'sidebar_main') {
                                        $num_columns = 2;
                                    }
                                    
                                    // Render each column
                                    for ($col = 1; $col <= $num_columns; $col++):
                                    ?>
                                        <div class="gmkb-section-column" data-column="<?php echo $col; ?>">
                                            <?php if (isset($columns[$col])): 
                                                foreach ($columns[$col] as $comp_ref):
                                                    $component_id = $comp_ref['component_id'];
                                                    if (isset($components_map[$component_id])):
                                                        $component = $components_map[$component_id];
                                                        $component['id'] = $component_id;
                                                        render_component($component, $post_id);
                                                    endif;
                                                endforeach;
                                            endif; ?>
                                        </div>
                                    <?php endfor; ?>
                                </div>
                            <?php else: ?>
                                <!-- Single column layout -->
                                <?php 
                                // ROOT FIX: Debug component rendering
                                if (defined('WP_DEBUG') && WP_DEBUG) {
                                    error_log('Section ' . $section_id . ' has ' . count($section_components) . ' component references');
                                    error_log('Components map has ' . count($components_map) . ' components');
                                    foreach ($section_components as $comp_ref) {
                                        $cid = isset($comp_ref['component_id']) ? $comp_ref['component_id'] : 'NO_ID';
                                        $exists = isset($components_map[$cid]) ? 'YES' : 'NO';
                                        error_log('  - Looking for component: ' . $cid . ' - Exists in map: ' . $exists);
                                        if ($exists) {
                                            error_log('  - Component type: ' . ($components_map[$cid]['type'] ?? 'unknown'));
                                        }
                                    }
                                    error_log('Available components in map: ' . implode(', ', array_keys($components_map)));
                                }
                                
                                foreach ($section_components as $comp_ref):
                                    // ROOT FIX: Handle both string IDs and array refs
                                    if (is_string($comp_ref)) {
                                        $component_id = $comp_ref;
                                    } elseif (is_array($comp_ref) && isset($comp_ref['component_id'])) {
                                        $component_id = $comp_ref['component_id'];
                                    } else {
                                        if (defined('WP_DEBUG') && WP_DEBUG) {
                                            error_log('Invalid component reference: ' . print_r($comp_ref, true));
                                        }
                                        continue;
                                    }
                                    
                                    if (isset($components_map[$component_id])):
                                        $component = $components_map[$component_id];
                                        $component['id'] = $component_id;
                                        
                                        if (defined('WP_DEBUG') && WP_DEBUG) {
                                            error_log('✅ Rendering component: ' . $component_id . ' of type: ' . ($component['type'] ?? 'unknown'));
                                        }
                                        
                                        render_component($component, $post_id);
                                    else:
                                        if (defined('WP_DEBUG') && WP_DEBUG) {
                                            error_log('❌ Component ' . $component_id . ' not found in map');
                                        }
                                    endif;
                                endforeach; ?>
                            <?php endif; ?>
                            
                        </div>
                    </section>
                <?php endforeach; ?>
            </div>
        <?php else: ?>
            <!-- Fallback: Render components without sections -->
            <div class="gmkb-components-wrapper">
                <?php foreach ($components as $index => $component): 
                    render_component($component, $post_id, $index);
                ?>
                
            <?php endforeach; ?>
            </div>
        <?php endif; // End sections check ?>
    <?php endif; // End components check ?>
    
</article>
<?php
} // End basic display mode
?>

</body>
</html>

<?php

// ROOT FIX: Helper function to render a component
function render_component($component, $post_id, $index = 0) {
    $component_type = isset($component['type']) ? $component['type'] : 'unknown';
    $component_id = isset($component['id']) ? $component['id'] : 'component-' . $index;
    $component_data = isset($component['data']) ? $component['data'] : array();
    $component_props = isset($component['props']) ? $component['props'] : array();
    
    // ROOT FIX: Also check for settings which might contain props
    if (empty($component_props) && isset($component['settings'])) {
        $component_props = $component['settings'];
    }
    
    // ROOT FIX: Debug component data
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('Rendering component: ' . $component_type . ' with ID: ' . $component_id);
        error_log('Component data: ' . print_r($component_data, true));
        error_log('Component props: ' . print_r($component_props, true));
    }
    ?>
    
    <?php
    // ROOT FIX: Don't double-wrap - component templates already include the wrapper
    // Try to load component template
    $component_template = GMKB_PLUGIN_DIR . "components/{$component_type}/frontend-template.php";
    
    // If no frontend template, try regular template
    if (!file_exists($component_template)) {
        $component_template = GMKB_PLUGIN_DIR . "components/{$component_type}/template.php";
    }
    
    if (file_exists($component_template)) {
        // ROOT FIX: Merge props and data - props take precedence
        $merged_props = array_merge($component_data, $component_props);
        
        // ROOT FIX: Extract merged props as variables for the template
        if (!empty($merged_props)) {
            extract($merged_props, EXTR_SKIP);
        }
        
        // ROOT FIX: Set up the $props array that templates expect
        $props = array_merge($merged_props, array(
            'component_id' => $component_id,
            'is_frontend' => true,
            'post_id' => $post_id
        ));
        
        // ROOT FIX: Also make data available separately
        $data = $component_data;
        
        // ROOT FIX: Pass componentId for template compatibility
        $componentId = $component_id;
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log('Template variables for ' . $component_type . ': ' . print_r(array_keys($merged_props), true));
        }
        
        // Include template (which includes its own wrapper)
        include $component_template;
    } else {
        // Fallback still needs wrapper since it doesn't have a template
        ?>
        <div class="gmkb-component gmkb-component--<?php echo esc_attr($component_type); ?>" 
             data-component-id="<?php echo esc_attr($component_id); ?>"
             data-component-type="<?php echo esc_attr($component_type); ?>"
             data-component-index="<?php echo esc_attr($index); ?>">
            <?php echo render_component_fallback($component_type, $component_data, $component_props); ?>
        </div>
        <?php
    }
    ?>
    <?php
}

// Helper function for basic component rendering
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
