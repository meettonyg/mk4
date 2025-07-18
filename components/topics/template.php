<?php
/**
 * Topics Component Template - PHASE 1.1 ROOT FIX COMPLETE
 * ✅ ELIMINATES infinite "Loading your topics..." state
 * ✅ NO JavaScript dependency for basic display
 * ✅ Direct server-side topic loading
 * ✅ Graceful fallback for ALL scenarios
 * ✅ Zero race conditions
 */

// PHASE 1.1 FIX: Ensure WordPress context
if (!defined('ABSPATH')) {
    exit;
}

// PHASE 1.1 FIX: Extract component props with enhanced fallbacks
$componentId = esc_attr($componentId ?? uniqid('topics_'));
$sectionTitle = sanitize_text_field($title ?? 'Speaking Topics');

// PHASE 1.2 FIX: ENHANCED POST ID DETECTION with ComponentLoader integration
$current_post_id = 0;
$post_id_source = 'none';

// Priority 1: From ComponentLoader extracted props (AJAX context)
if (isset($post_id) && is_numeric($post_id) && $post_id > 0) {
    $current_post_id = intval($post_id);
    $post_id_source = 'component-loader-props';
// Priority 2: URL parameters (enhanced parsing)
} elseif (!empty($_GET['post_id']) && is_numeric($_GET['post_id'])) {
    $current_post_id = intval($_GET['post_id']);
    $post_id_source = 'url-get-post_id';
} elseif (!empty($_GET['p']) && is_numeric($_GET['p'])) {
    $current_post_id = intval($_GET['p']);
    $post_id_source = 'url-get-p';
// Priority 2.5: Check $_REQUEST as fallback for URL parameters
} elseif (!empty($_REQUEST['post_id']) && is_numeric($_REQUEST['post_id'])) {
    $current_post_id = intval($_REQUEST['post_id']);
    $post_id_source = 'request-post_id';
// Priority 3: Global post object
} elseif (isset($GLOBALS['post']) && is_object($GLOBALS['post']) && isset($GLOBALS['post']->ID)) {
    $current_post_id = intval($GLOBALS['post']->ID);
    $post_id_source = 'global-post';
// Priority 4: WordPress get_the_ID() if in loop
} elseif (function_exists('get_the_ID') && get_the_ID()) {
    $current_post_id = intval(get_the_ID());
    $post_id_source = 'wp-get_the_id';
}

// PHASE 1.2 FIX: Enhanced debugging for post ID detection with ComponentLoader context
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log("PHASE 1.2 Topics POST ID DEBUG: Source='{$post_id_source}', ID={$current_post_id}");
    error_log("PHASE 1.2 Available variables: post_id=" . (isset($post_id) ? $post_id : 'unset') . ", componentId=" . (isset($componentId) ? $componentId : 'unset'));
    error_log("PHASE 1.2 URL params: GET_post_id=" . ($_GET['post_id'] ?? 'null') . ", REQUEST_post_id=" . ($_REQUEST['post_id'] ?? 'null'));
    if (isset($props)) {
        error_log("PHASE 1.2 Props available: " . print_r($props, true));
    }
}

// ROOT FIX: SINGLE-STEP RENDER - Use pre-loaded topics data from props
$topicsList = [];
$topicsFound = false;
$loadingSource = 'none';

// Priority 1: Check for pre-loaded topics from single-step render
if (isset($props['loaded_topics']) && is_array($props['loaded_topics'])) {
    $loadedTopics = $props['loaded_topics'];
    
    // Handle both formats: array of objects with title/description OR indexed array
    foreach ($loadedTopics as $index => $topic) {
        if (is_array($topic) && isset($topic['title']) && !empty(trim($topic['title']))) {
            $topicsList[] = [
                'title' => sanitize_text_field(trim($topic['title'])),
                'description' => sanitize_text_field(trim($topic['description'] ?? '')),
                'index' => $index,
                'meta_key' => "topic_" . ($index + 1),
                'source' => 'single_step_render'
            ];
            $topicsFound = true;
            $loadingSource = 'single_step_render';
        } elseif (is_string($topic) && !empty(trim($topic))) {
            $topicsList[] = [
                'title' => sanitize_text_field(trim($topic)),
                'description' => '',
                'index' => $index,
                'meta_key' => "topic_" . ($index + 1),
                'source' => 'single_step_render'
            ];
            $topicsFound = true;
            $loadingSource = 'single_step_render';
        }
    }
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log("ROOT FIX Topics Template: Using pre-loaded topics data, found " . count($topicsList) . " topics");
    }
}

// Fallback: If no pre-loaded data, try direct database loading (for backwards compatibility)
if (!$topicsFound && $current_post_id > 0) {
    // Method 1: Try direct custom post fields (topic_1, topic_2, etc.)
    for ($i = 1; $i <= 5; $i++) {
        $topic_value = get_post_meta($current_post_id, "topic_{$i}", true);
        if (!empty($topic_value) && strlen(trim($topic_value)) > 0) {
            $topicsList[] = [
                'title' => sanitize_text_field(trim($topic_value)),
                'index' => $i - 1,
                'meta_key' => "topic_{$i}",
                'source' => 'custom_fields_fallback'
            ];
            $topicsFound = true;
            $loadingSource = 'custom_fields_fallback';
        }
    }
    
    // Method 2: Fallback to MKCG meta fields if no custom fields found
    if (!$topicsFound) {
        for ($i = 1; $i <= 5; $i++) {
            $topic_value = get_post_meta($current_post_id, "mkcg_topic_{$i}", true);
            if (!empty($topic_value) && strlen(trim($topic_value)) > 0) {
                $topicsList[] = [
                    'title' => sanitize_text_field(trim($topic_value)),
                    'index' => $i - 1,
                    'meta_key' => "mkcg_topic_{$i}",
                    'source' => 'mkcg_fields_fallback'
                ];
                $topicsFound = true;
                $loadingSource = 'mkcg_fields_fallback';
            }
        }
    }
    
    // Method 3: Check for JSON-stored topics as final fallback
    if (!$topicsFound) {
        $json_topics = get_post_meta($current_post_id, 'topics_data', true);
        if (!empty($json_topics)) {
            $decoded_topics = json_decode($json_topics, true);
            if (is_array($decoded_topics)) {
                foreach ($decoded_topics as $index => $topic_data) {
                    if (!empty($topic_data['title'])) {
                        $topicsList[] = [
                            'title' => sanitize_text_field(trim($topic_data['title'])),
                            'index' => $index,
                            'meta_key' => 'topics_data',
                            'source' => 'json_data_fallback'
                        ];
                        $topicsFound = true;
                        $loadingSource = 'json_data_fallback';
                    }
                }
            }
        }
    }
}

// PHASE 1.1 FIX: Enhanced CSS classes and loading state indicators
$containerClass = 'topics-component layout-grid columns-2';
if ($topicsFound) {
    $containerClass .= ' has-topics';
} else {
    $containerClass .= ' no-topics';
}

// ROOT FIX: Comprehensive debugging for single-step render
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log("ROOT FIX Topics Template: Post ID {$current_post_id} (source: {$post_id_source}), Found " . count($topicsList) . " topics from data source '{$loadingSource}'");
    if (!empty($topicsList)) {
        error_log("ROOT FIX Topics: " . implode(', ', array_column($topicsList, 'title')));
    }
    if ($current_post_id === 0) {
        error_log("ROOT FIX Topics WARNING: No post ID detected. Single-step render issue?");
        error_log("ROOT FIX Debug context: URL params=" . print_r($_GET, true) . ", Available vars: post_id=" . (isset($post_id) ? $post_id : 'unset'));
    }
    if (isset($props['loaded_topics'])) {
        error_log("ROOT FIX Topics: Pre-loaded topics available in props: " . count($props['loaded_topics']) . " entries");
    } else {
        error_log("ROOT FIX Topics: No pre-loaded topics in props, using fallback loading");
    }
}
?>

<div class="content-section editable-element <?php echo esc_attr($containerClass); ?>" 
     data-element="topics" 
     data-component="topics" 
     data-component-id="<?php echo $componentId; ?>" 
     data-component-type="topics"
     data-post-id="<?php echo esc_attr($current_post_id); ?>"
     data-save-enabled="true"
     data-nonce="<?php echo wp_create_nonce('guestify_media_kit_builder'); ?>"
     data-loading-resolved="true"
     data-loading-source="<?php echo esc_attr($loadingSource); ?>"
     data-single-step-render="true"
     data-root-fix="complete">

    <!-- PHASE 1.1 FIX: Section Header -->
    <div class="topics-header">
        <h2 class="section-title" contenteditable="true" data-setting="title">
            <?php echo esc_html($sectionTitle); ?>
        </h2>
    </div>

    <!-- PHASE 1.1 FIX: Topics Container - IMMEDIATE RESOLUTION -->
    <div class="topics-container" 
         data-post-id="<?php echo esc_attr($current_post_id); ?>"
         data-topics-count="<?php echo count($topicsList); ?>"
         data-has-topics="<?php echo $topicsFound ? 'true' : 'false'; ?>"
         data-loading-source="<?php echo esc_attr($loadingSource); ?>"
         data-loading-resolved="true"
         data-phase="1.2-complete">
        
        <?php if ($topicsFound && !empty($topicsList)): ?>
            <!-- PHASE 1.1 FIX: Display actual topics with enhanced metadata -->
            <?php foreach ($topicsList as $topic): ?>
                <div class="topic-item" 
                     data-topic-index="<?php echo esc_attr($topic['index']); ?>"
                     data-meta-key="<?php echo esc_attr($topic['meta_key']); ?>"
                     data-source="<?php echo esc_attr($topic['source']); ?>">
                    <div class="topic-content">
                        <h3 class="topic-title"><?php echo esc_html($topic['title']); ?></h3>
                        <?php if (!empty($topic['description'])): ?>
                            <p class="topic-description"><?php echo esc_html($topic['description']); ?></p>
                        <?php endif; ?>
                        <!-- PHASE 1.1 FIX: Add data source indicator for debugging -->
                        <?php if (defined('WP_DEBUG') && WP_DEBUG): ?>
                            <small class="debug-info" style="opacity: 0.6; font-size: 0.8em;">Source: <?php echo esc_html($topic['source']); ?></small>
                        <?php endif; ?>
                    </div>
                </div>
            <?php endforeach; ?>
            
        <?php else: ?>
            <!-- PHASE 1.1 FIX: Clear empty state - ZERO loading ambiguity -->
            <div class="no-topics-message" style="padding: 20px; text-align: center; color: #666; border: 1px dashed #ddd; border-radius: 8px;">
                <div style="font-size: 1.1em; margin-bottom: 10px;">📝 <strong>No topics found</strong></div>
                <p style="margin-bottom: 15px;">Add topics to showcase your speaking expertise.</p>
                
                <?php if ($current_post_id > 0): ?>
                <div style="margin-bottom: 15px;">
                <p style="margin-bottom: 15px;">No data source is linked. Please link a data source in the Content panel to automatically load topics.</p>
                </div>
                    
                    <?php if (defined('WP_DEBUG') && WP_DEBUG): ?>
                        <details style="font-size: 0.9em; color: #999; margin-top: 10px;">
                            <summary style="cursor: pointer;">Debug Info</summary>
                            <div style="margin-top: 5px; text-align: left;">
                                <strong>Post ID:</strong> <?php echo esc_html($current_post_id); ?> (<?php echo esc_html($post_id_source); ?>)<br>
                                <strong>Data Source:</strong> <?php echo esc_html($loadingSource); ?><br>
                                <strong>URL post_id:</strong> <?php echo esc_html($_GET['post_id'] ?? 'not set'); ?><br>
                                <strong>ComponentLoader post_id:</strong> <?php echo esc_html(isset($post_id) ? $post_id : 'not passed'); ?><br>
                                <strong>Resolution:</strong> Server-side complete (Phase 1.2)
                            </div>
                        </details>
                    <?php endif; ?>
                <?php else: ?>
                    <p style="color: #d63384; font-size: 0.9em;">⚠️ No topics found in the linked data source. You can add topics by editing the source post.</p>
                <?php endif; ?>
            </div>
        <?php endif; ?>
    </div>
    
    <!-- ROOT FIX: Single-step render - no loading prevention needed -->
    <script>
    // ROOT FIX: Ensure topics display immediately without loading states
    document.addEventListener('DOMContentLoaded', function() {
        const container = document.querySelector('[data-component-id="<?php echo $componentId; ?>"] .topics-container');
        if (container) {
            // Remove any loading indicators that might be added by other scripts (defensive)
            const loadingElements = container.querySelectorAll('.loading-indicator, .loading-message, [data-loading="true"]');
            loadingElements.forEach(el => el.remove());
            
            // Mark as resolved via single-step render
            container.setAttribute('data-loading-resolved', 'true');
            container.setAttribute('data-single-step-render', 'true');
            container.setAttribute('data-root-fix-complete', 'true');
            
            console.log('✅ ROOT FIX: Topics rendered via single-step render for <?php echo $componentId; ?> - no loading state needed');
            console.log('📊 ROOT FIX: Data source: <?php echo $loadingSource; ?>, Topics found: <?php echo count($topicsList); ?>');
        }
    });
    
    // Global function for add topic button
    function openTopicsDesignPanel() {
        if (window.GMKB && window.GMKB.dispatch) {
            window.GMKB.dispatch('topics:design-panel:open-request', {
                componentId: '<?php echo $componentId; ?>',
                source: 'empty-state-button'
            });
        } else {
            // Fallback: trigger generic event
            const event = new CustomEvent('openDesignPanel', {
                detail: { component: 'topics', componentId: '<?php echo $componentId; ?>' }
            });
            window.dispatchEvent(event);
        }
    }
    </script>
    
    <!-- ROOT FIX: Styles for single-step render -->
    <style>
    /* ROOT FIX: Ensure no loading states ever show */
    .topics-component[data-single-step-render="true"] .loading-indicator,
    .topics-component[data-single-step-render="true"] .loading-message,
    .topics-component[data-single-step-render="true"] [data-loading="true"] {
        display: none !important;
    }
    
    /* Backwards compatibility */
    .topics-component[data-loading-resolved="true"] .loading-indicator,
    .topics-component[data-loading-resolved="true"] .loading-message,
    .topics-component[data-loading-resolved="true"] [data-loading="true"] {
        display: none !important;
    }
    
    /* Visual feedback for loaded state */
    .topics-component.has-topics {
        border-left: 3px solid #10b981;
    }
    
    .topics-component.no-topics {
        border-left: 3px solid #f59e0b;
    }
    
    /* Topic items enhancement */
    .topic-item {
        position: relative;
        margin-bottom: 1rem;
        padding: 0.75rem;
        background: #f8f9fa;
        border-radius: 6px;
        transition: background-color 0.2s;
    }
    
    .topic-item:hover {
        background: #e9ecef;
    }
    
    .topic-title {
        font-weight: 500;
        line-height: 1.4;
        min-height: 1.5em;
    }
    
    .topic-title:focus {
        outline: 2px solid #0073aa;
        outline-offset: 2px;
        background: white;
    }
    
    /* Debug info styling */
    .debug-info {
        display: block;
        margin-top: 0.25rem;
        font-style: italic;
    }
    
    /* Add topic button enhancement */
    .btn-add-topic:hover {
        background: #005a87 !important;
        transform: translateY(-1px);
    }
    
    .btn-add-topic:active {
        transform: translateY(0);
    }
    </style>
    
</div>
