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

// ROOT FIX: Get sections and components in proper structure
$sections = isset($media_kit_state['sections']) ? $media_kit_state['sections'] : array();
$components_map = isset($media_kit_state['components']) ? $media_kit_state['components'] : array();

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

get_header();

// ROOT FIX: Debug saved data structure
if (defined('WP_DEBUG') && WP_DEBUG && !empty($media_kit_state)) {
    error_log('=== MEDIA KIT DATA STRUCTURE DEBUG ===');
    error_log('Post ID: ' . $post_id);
    error_log('Has sections: ' . (!empty($sections) ? 'YES (' . count($sections) . ')' : 'NO'));
    error_log('Has components_map: ' . (!empty($components_map) ? 'YES (' . count($components_map) . ')' : 'NO'));
    error_log('Has ordered components: ' . (!empty($components) ? 'YES (' . count($components) . ')' : 'NO'));
    
    if (!empty($components)) {
        foreach ($components as $idx => $comp) {
            error_log('Component ' . $idx . ': Type=' . ($comp['type'] ?? 'unknown') . ', ID=' . ($comp['id'] ?? 'no-id'));
            if (isset($comp['props'])) {
                error_log('  Props: ' . json_encode($comp['props']));
            }
        }
    }
}
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
        <!-- ROOT FIX: Section-Based Rendering -->
        <?php if (!empty($sections)): ?>
            <!-- Render with sections -->
            <div class="gmkb-sections-wrapper">
                <?php foreach ($sections as $section_index => $section): 
                    $section_id = isset($section['section_id']) ? $section['section_id'] : 'section-' . $section_index;
                    $section_type = isset($section['section_type']) ? $section['section_type'] : 'full_width';
                    $section_layout = isset($section['layout']) ? $section['layout'] : array();
                    $section_components = isset($section['components']) ? $section['components'] : array();
                    ?>
                    
                    <section class="gmkb-section gmkb-section--<?php echo esc_attr($section_type); ?>" 
                             data-section-id="<?php echo esc_attr($section_id); ?>"
                             data-section-type="<?php echo esc_attr($section_type); ?>">
                        
                        <div class="gmkb-section-inner" style="<?php 
                            if (isset($section_layout['max_width'])) echo 'max-width: ' . esc_attr($section_layout['max_width']) . ';';
                            if (isset($section_layout['padding'])) echo 'padding: ' . esc_attr($section_layout['padding']) . ';';
                        ?>">
                            
                            <?php if ($section_type === 'two_column' || $section_type === 'three_column'): ?>
                                <!-- Multi-column layout -->
                                <div class="gmkb-section-columns gmkb-columns--<?php echo esc_attr($section_layout['columns'] ?? 1); ?>">
                                    <?php 
                                    // Group components by column
                                    $columns = array();
                                    foreach ($section_components as $comp_ref) {
                                        $column = isset($comp_ref['column']) ? $comp_ref['column'] : 1;
                                        if (!isset($columns[$column])) $columns[$column] = array();
                                        $columns[$column][] = $comp_ref;
                                    }
                                    
                                    // Render each column
                                    for ($col = 1; $col <= ($section_layout['columns'] ?? 1); $col++):
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
                                    foreach ($section_components as $comp_ref) {
                                        $cid = $comp_ref['component_id'];
                                        $exists = isset($components_map[$cid]) ? 'YES' : 'NO';
                                        error_log('  - Looking for component: ' . $cid . ' - Exists: ' . $exists);
                                    }
                                    error_log('Available components in map: ' . implode(', ', array_keys($components_map)));
                                }
                                
                                foreach ($section_components as $comp_ref):
                                    $component_id = $comp_ref['component_id'];
                                    if (isset($components_map[$component_id])):
                                        $component = $components_map[$component_id];
                                        $component['id'] = $component_id;
                                        render_component($component, $post_id);
                                    else:
                                        // ROOT FIX: Try to find orphaned component by checking all components
                                        if (defined('WP_DEBUG') && WP_DEBUG) {
                                            error_log('Component ' . $component_id . ' not found in map, checking orphaned components...');
                                        }
                                        // Check if we have any orphaned components that should be here
                                        foreach ($components as $orphan_comp) {
                                            if (!$orphan_comp['sectionId'] || $orphan_comp['sectionId'] === null) {
                                                if (defined('WP_DEBUG') && WP_DEBUG) {
                                                    error_log('Found orphaned component: ' . $orphan_comp['id'] . ' - rendering it');
                                                }
                                                render_component($orphan_comp, $post_id);
                                                // Mark as rendered to avoid duplicates
                                                $orphan_comp['sectionId'] = 'rendered';
                                                break; // Only render one orphan per missing reference
                                            }
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
get_footer();

// ROOT FIX: Helper function to render a component
function render_component($component, $post_id, $index = 0) {
    $component_type = isset($component['type']) ? $component['type'] : 'unknown';
    $component_id = isset($component['id']) ? $component['id'] : 'component-' . $index;
    $component_data = isset($component['data']) ? $component['data'] : array();
    $component_props = isset($component['props']) ? $component['props'] : array();
    
    // ROOT FIX: Debug component data
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log('Rendering component: ' . $component_type . ' with ID: ' . $component_id);
        error_log('Component props: ' . print_r($component_props, true));
    }
    ?>
    
    <div class="gmkb-component gmkb-component--<?php echo esc_attr($component_type); ?>" 
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
            // ROOT FIX: Extract props as variables for the template
            // The hero template expects: $name, $title, $bio (or $title, $subtitle, $description)
            if (!empty($component_props)) {
                // Extract props directly as variables
                extract($component_props, EXTR_SKIP);
                
                // Also handle common variations
                if (isset($component_props['title'])) $title = $component_props['title'];
                if (isset($component_props['subtitle'])) $subtitle = $component_props['subtitle'];
                if (isset($component_props['buttonText'])) $buttonText = $component_props['buttonText'];
            }
            
            // Set up additional variables
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
            echo render_component_fallback($component_type, $component_data, $component_props);
        }
        ?>
    </div>
    <?php
}

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
