<?php
/**
 * Topics Component Template - Enhanced Version
 * ROOT FIX: Proper validation, security, and flexible topic management
 */

// ROOT FIX: CRITICAL - Props are already extracted by ComponentLoader
// ComponentLoader calls extract($enhancedProps) before including template
// We should NOT re-extract here as it might override enhanced props

// ROOT FIX: Debug what variables are available in template scope
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log("GMKB Topics TEMPLATE ROOT FIX: 🔍 Available variables: post_id=" . (isset($post_id) ? $post_id : 'undefined') . ", topics=" . (isset($topics) ? count($topics) : 'undefined'));
    error_log("GMKB Topics TEMPLATE ROOT FIX: 🌐 All available vars: " . implode(', ', array_keys(get_defined_vars())));
}

// Enhanced topic validation and sanitization
function validateAndSanitizeTopics($topics, $maxTopics = 10) {
    if (!is_array($topics)) {
        return [];
    }
    
    $sanitizedTopics = [];
    $count = 0;
    
    foreach ($topics as $topic) {
        if ($count >= $maxTopics) break;
        
        $sanitized = sanitize_text_field(trim($topic));
        if (!empty($sanitized) && strlen($sanitized) <= 100) {
            $sanitizedTopics[] = $sanitized;
            $count++;
        }
    }
    
    return $sanitizedTopics;
}

// Enhanced settings extraction with validation
$componentId = esc_attr($componentId ?? uniqid('topics_'));
$sectionTitle = sanitize_text_field($title ?? 'Speaking Topics');
$introduction = sanitize_textarea_field($introduction ?? '');
$layoutStyle = sanitize_text_field($displayStyle ?? 'grid');
$columns = absint($columns ?? 3);
$showDescriptions = (bool)($showDescriptions ?? true);
$expandable = (bool)($expandable ?? false);
$topicStyle = sanitize_text_field($topicStyle ?? 'default');
$topicSize = sanitize_text_field($topicSize ?? 'medium');
$iconPosition = sanitize_text_field($iconPosition ?? 'left');
$topicColor = sanitize_hex_color($topicColor ?? '#4f46e5');
$animation = sanitize_text_field($animation ?? 'none');
$hoverEffect = sanitize_text_field($hoverEffect ?? 'scale');

// ROOT FIX: SIMPLIFIED POST_ID DETECTION with reliable WordPress integration
$current_post_id = 0;

// PRIORITY 1: ComponentLoader props (most reliable in builder context)
if (isset($post_id) && is_numeric($post_id) && $post_id > 0) {
    $current_post_id = intval($post_id);
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log("GMKB Topics ROOT FIX: ✅ Post ID from ComponentLoader: {$current_post_id}");
    }
}

// PRIORITY 2: WordPress globals (reliable for post context)
if ($current_post_id === 0) {
    global $post;
    if ($post && isset($post->ID) && $post->ID > 0) {
        $current_post_id = intval($post->ID);
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("GMKB Topics ROOT FIX: ✅ Post ID from global $post: {$current_post_id}");
        }
    }
}

// PRIORITY 3: URL parameters (for builder context)
if ($current_post_id === 0) {
    if (isset($_GET['post_id']) && is_numeric($_GET['post_id'])) {
        $current_post_id = intval($_GET['post_id']);
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("GMKB Topics ROOT FIX: ✅ Post ID from URL ?post_id: {$current_post_id}");
        }
    } elseif (isset($_GET['p']) && is_numeric($_GET['p'])) {
        $current_post_id = intval($_GET['p']);
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("GMKB Topics ROOT FIX: ✅ Post ID from URL ?p: {$current_post_id}");
        }
    }
}

// FALLBACK: Use known test post ID for development
if ($current_post_id === 0 && defined('WP_DEBUG') && WP_DEBUG) {
    $test_post_id = 32372; // Your test post ID
    if (get_post($test_post_id)) {
        $current_post_id = $test_post_id;
        error_log("GMKB Topics ROOT FIX: ⚠️ Using test post ID: {$current_post_id}");
    }
}

// ROOT FIX: Enhanced debugging
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log("GMKB Topics ROOT FIX: 🎯 FINAL post_id detected: {$current_post_id}");
    error_log("GMKB Topics ROOT FIX: 📍 URL: " . ($_SERVER['REQUEST_URI'] ?? 'not_set'));
    error_log("GMKB Topics ROOT FIX: 🔍 Available props: " . print_r(array_keys(get_defined_vars()), true));
}

// Initialize topics array
$topicsList = [];
$hasDynamicTopics = false;

// ROOT FIX: SIMPLIFIED DATA LOADING with priority hierarchy
if ($current_post_id > 0) {
    $topics_found = 0;
    
    // PRIORITY 1: ComponentLoader props (for dynamic rendering)
    if (isset($topics) && is_array($topics) && !empty($topics)) {
        foreach ($topics as $index => $topic_value) {
            if (!empty($topic_value) && is_string($topic_value) && strlen(trim($topic_value)) > 0) {
                $topicsList[] = [
                    'title' => sanitize_text_field(trim($topic_value)),
                    'description' => '',
                    'source' => 'props',
                    'meta_key' => "topic_" . ($index + 1)
                ];
                $topics_found++;
                $hasDynamicTopics = true;
            }
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG && $topics_found > 0) {
            error_log("GMKB Topics ROOT FIX: ✅ Loaded {$topics_found} topics from ComponentLoader props");
        }
    }
    
    // PRIORITY 2: Custom post meta fields (persistent storage)
    if ($topics_found === 0) {
        for ($i = 1; $i <= 10; $i++) { // Check up to 10 topics
            $meta_key = "topic_{$i}";
            $topic_value = get_post_meta($current_post_id, $meta_key, true);
            
            if (!empty($topic_value) && strlen(trim($topic_value)) > 0) {
                $topicsList[] = [
                    'title' => sanitize_text_field(trim($topic_value)),
                    'description' => '',
                    'source' => 'meta',
                    'meta_key' => $meta_key
                ];
                $topics_found++;
                $hasDynamicTopics = true;
            }
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG) {
            if ($topics_found > 0) {
                error_log("GMKB Topics ROOT FIX: ✅ Found {$topics_found} topics from post meta for post {$current_post_id}");
            } else {
                error_log("GMKB Topics ROOT FIX: ⚠️ No topics found in post meta for post {$current_post_id}");
                
                // Debug: List all meta keys for this post
                $all_meta = get_post_meta($current_post_id);
                $topic_meta = array_filter($all_meta, function($key) {
                    return strpos($key, 'topic_') === 0;
                }, ARRAY_FILTER_USE_KEY);
                
                if (!empty($topic_meta)) {
                    error_log("GMKB Topics ROOT FIX: 🔍 Found topic-related meta: " . implode(', ', array_keys($topic_meta)));
                } else {
                    error_log("GMKB Topics ROOT FIX: 🔍 No topic-related meta found for post {$current_post_id}");
                }
            }
        }
    }
}

// ROOT FIX: Fallback to manual topics from props if no meta data found
if (!$hasDynamicTopics && isset($topics) && is_array($topics)) {
    foreach ($topics as $index => $topic) {
        if (is_string($topic) && !empty(trim($topic))) {
            $topicsList[] = [
                'title' => sanitize_text_field($topic),
                'description' => '',
                'source' => 'manual'
            ];
        } elseif (is_array($topic) && !empty($topic['title'])) {
            $topicsList[] = [
                'title' => sanitize_text_field($topic['title']),
                'description' => sanitize_textarea_field($topic['description'] ?? ''),
                'source' => 'manual'
            ];
        }
    }
    $hasDynamicTopics = !empty($topicsList);
}

// ROOT FIX: NEVER use placeholder content - only show real data
if (empty($topicsList)) {
    // Leave topics list empty - no placeholder content
    $topicsList = [];
    
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log("GMKB Topics ROOT FIX: No topics found for post {$current_post_id} - showing empty state instead of placeholders");
    }
}

// CSS classes for styling
$containerClasses = [
    'topics-component',
    'layout-' . $layoutStyle,
    'style-' . $topicStyle,
    'size-' . $topicSize,
    'icons-' . $iconPosition,
    'columns-' . $columns
];

if ($showDescriptions) $containerClasses[] = 'show-descriptions';
if ($expandable) $containerClasses[] = 'expandable';
if ($animation !== 'none') $containerClasses[] = 'animate-' . $animation;
if ($hoverEffect !== 'none') $containerClasses[] = 'hover-' . $hoverEffect;

$containerClass = implode(' ', $containerClasses);

// ROOT FIX: Enhanced error handling with better user guidance
if (empty($topicsList)) {
    if ($current_post_id > 0) {
        // We have a post ID but no topics found
        $helpMessage = "No topics found for post {$current_post_id}. You can add topics manually using the design panel, or check if this post has topic data in custom fields like 'topic_1', 'topic_2', etc.";
    } else {
        // No post ID detected  
        $helpMessage = "No post ID detected. The component will auto-detect the post ID and load topics, or you can add topics manually using the design panel.";
    }
}
?>

<div class="content-section editable-element <?php echo esc_attr($containerClass); ?>" 
     data-element="topics" 
     data-component="topics" 
     data-component-id="<?php echo $componentId; ?>" 
     data-component-type="topics"
     data-layout="<?php echo esc_attr($layoutStyle); ?>"
     data-columns="<?php echo esc_attr($columns); ?>"
     data-post-id="<?php echo esc_attr($current_post_id); ?>"
     data-save-enabled="true"
     data-nonce="<?php echo wp_create_nonce('guestify_media_kit_builder'); ?>"
     style="--topic-color: <?php echo esc_attr($topicColor); ?>">
     
    <!-- ROOT FIX: Controls now created dynamically by JavaScript - no server-side duplication -->

    <?php if (isset($helpMessage)): ?>
        <div class="topics-help-message">
            <div class="help-icon">💡</div>
            <div class="help-text"><?php echo esc_html($helpMessage); ?></div>
            <?php if ($current_post_id > 0): ?>
                <div class="help-actions" style="margin-top: 8px; font-size: 12px; opacity: 0.8;">
                    JavaScript auto-detection will attempt to load topics if they exist.
                </div>
            <?php endif; ?>
        </div>
    <?php else: ?>
        
        <!-- Section Header -->
        <?php if (!empty($sectionTitle)): ?>
            <div class="topics-header">
                <h2 class="section-title" contenteditable="true" data-setting="title">
                    <?php echo esc_html($sectionTitle); ?>
                </h2>
                <?php if (!empty($introduction)): ?>
                    <p class="topics-introduction" contenteditable="true" data-setting="introduction">
                        <?php echo esc_html($introduction); ?>
                    </p>
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <!-- ROOT FIX: Topics Grid/List Container - Single Source of Truth -->
        <div class="topics-container" 
             data-layout="<?php echo esc_attr($layoutStyle); ?>"
             data-has-dynamic-topics="<?php echo $hasDynamicTopics ? 'true' : 'false'; ?>"
             data-post-id="<?php echo esc_attr($current_post_id); ?>"
             data-topics-source="<?php echo esc_attr($topicsList[0]['source'] ?? 'none'); ?>"
             data-topics-count="<?php echo count($topicsList); ?>"
             data-single-source="custom_post_fields">
            
            <?php if (!empty($topicsList)): ?>
                <?php foreach ($topicsList as $index => $topic): ?>
                    <div class="topic-item" 
                         data-topic-index="<?php echo esc_attr($index); ?>"
                         data-topic-id="<?php echo esc_attr($componentId . '_topic_' . $index); ?>"
                         data-topic-source="<?php echo esc_attr($topic['source'] ?? 'unknown'); ?>"
                         <?php if (isset($topic['meta_key'])): ?>data-meta-key="<?php echo esc_attr($topic['meta_key']); ?>"<?php endif; ?>>
                         
                        <?php if ($iconPosition === 'left'): ?>
                            <div class="topic-icon">
                                <!-- Custom Post Field Topic Icon -->
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                                </svg>
                            </div>
                        <?php endif; ?>
                        
                        <div class="topic-content">
                            <div class="topic-title" 
                                 contenteditable="true" 
                                 data-setting="topic_<?php echo esc_attr($index + 1); ?>"
                                 data-original-source="<?php echo esc_attr($topic['source']); ?>">
                                <?php echo esc_html($topic['title']); ?>
                            </div>
                            
                            <?php if ($showDescriptions && !empty($topic['description'])): ?>
                                <div class="topic-description" 
                                     contenteditable="true" 
                                     data-setting="topic_<?php echo esc_attr($index + 1); ?>_description">
                                    <?php echo esc_html($topic['description']); ?>
                                </div>
                            <?php endif; ?>
                            
                            <?php if ($expandable): ?>
                                <button class="topic-expand-btn" aria-label="Expand topic details">
                                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <polyline points="6 9 12 15 18 9"></polyline>
                                    </svg>
                                </button>
                            <?php endif; ?>
                            
                            <!-- ROOT FIX: Show data source indicator for debugging -->
                            <?php if (defined('WP_DEBUG') && WP_DEBUG): ?>
                                <small class="topic-source-indicator" style="font-size: 10px; opacity: 0.6; color: #666;">
                                    <?php echo esc_html(strtoupper($topic['source'])); ?>
                                    <?php if (isset($topic['meta_key'])): ?>(<?php echo esc_html($topic['meta_key']); ?>)<?php endif; ?>
                                </small>
                            <?php endif; ?>
                        </div>
                        
                        <?php if ($iconPosition === 'right'): ?>
                            <div class="topic-icon">
                                <!-- Custom Post Field Topic Icon -->
                                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                    <circle cx="12" cy="12" r="3"></circle>
                                    <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                                </svg>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
                
                <!-- ROOT FIX: Enhanced Debug Info -->
                <?php if (defined('WP_DEBUG') && WP_DEBUG): ?>
                    <div class="topics-debug-info" style="margin-top: 10px; padding: 5px; background: #f0f0f0; font-size: 10px; color: #666; border-left: 3px solid #10b981;">
                        <strong>🔧 SINGLE SOURCE OF TRUTH DEBUG:</strong><br>
                        Topics Found: <?php echo count($topicsList); ?> | 
                        Dynamic: <?php echo $hasDynamicTopics ? 'TRUE' : 'FALSE'; ?> | 
                        Post ID: <?php echo $current_post_id; ?> | 
                        Source: <?php echo esc_html($topicsList[0]['source'] ?? 'none'); ?><br>
                        <?php if (!empty($topicsList)): ?>
                            Topics: <?php echo implode(', ', array_map(function($t) { return '"' . $t['title'] . '"'; }, array_slice($topicsList, 0, 3))); ?><?php echo count($topicsList) > 3 ? '...' : ''; ?>
                        <?php endif; ?>
                        <br><strong>✅ MKCG Integration REMOVED - Custom Post Fields ONLY</strong>
                    </div>
                    <?php 
                    // ROOT FIX: Log final template state
                    error_log("GMKB Topics SINGLE SOURCE FIX: 🏁 TEMPLATE COMPLETE - Found " . count($topicsList) . " topics from custom post fields ONLY, post_id: {$current_post_id}");
                    ?>
                <?php endif; ?>
            <?php else: ?>
                <!-- Fallback message when no topics available -->
                <div class="no-topics-message">
                    <p>No topics available. Add topics through the design panel or Media Kit Content Generator.</p>
                </div>
            <?php endif; ?>
        </div>
        
    <?php endif; ?>
</div>