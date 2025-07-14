<?php
/**
 * Topics Component Template - Enhanced Version
 * ROOT FIX: Proper validation, security, and flexible topic management
 */

// ROOT FIX: CRITICAL - Extract variables from ComponentLoader props FIRST
// This ensures enhanced props from ComponentLoader are properly available
extract($props ?? []);

// ROOT FIX: Debug what props were actually passed to template
if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log("GMKB Topics TEMPLATE ROOT FIX: 📦 Props received: " . print_r($props ?? [], true));
    error_log("GMKB Topics TEMPLATE ROOT FIX: 🔑 Variables after extract: post_id=" . ($post_id ?? 'undefined') . ", topics=" . (isset($topics) ? count($topics) : 'undefined'));
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

// ROOT FIX: PROPS-FIRST POST_ID DETECTION (ComponentLoader Enhanced)
$current_post_id = 0;

// PRIORITY 1: Props from ComponentLoader (MOST RELIABLE)
if (isset($post_id) && is_numeric($post_id) && $post_id > 0) {
    $current_post_id = intval($post_id);
    if (defined('WP_DEBUG') && WP_DEBUG) {
        error_log("GMKB Topics ROOT FIX: ✅ Post ID from ComponentLoader props: {$current_post_id}");
    }
}

// PRIORITY 2: URL parameters (?post_id=32372)
if ($current_post_id === 0) {
    if (isset($_GET['post_id']) && is_numeric($_GET['post_id']) && $_GET['post_id'] > 0) {
        $current_post_id = intval($_GET['post_id']);
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("GMKB Topics ROOT FIX: ✅ Post ID from URL ?post_id: {$current_post_id}");
        }
    } elseif (isset($_GET['p']) && is_numeric($_GET['p']) && $_GET['p'] > 0) {
        $current_post_id = intval($_GET['p']);
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("GMKB Topics ROOT FIX: ✅ Post ID from URL ?p: {$current_post_id}");
        }
    }
}

// PRIORITY 3: WordPress context (fallback)
if ($current_post_id === 0 && function_exists('get_the_ID')) {
    $wp_post_id = get_the_ID();
    if ($wp_post_id && $wp_post_id > 0) {
        $current_post_id = $wp_post_id;
        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("GMKB Topics ROOT FIX: ✅ Post ID from WordPress get_the_ID(): {$current_post_id}");
        }
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

// ROOT FIX: ENHANCED MKCG DATA INTEGRATION (Props-First)
if ($current_post_id > 0) {
    // PRIORITY 1: Check if topics data was passed via ComponentLoader props
    if (isset($topics) && is_array($topics) && !empty($topics)) {
        foreach ($topics as $index => $topic_value) {
            if (!empty($topic_value) && is_string($topic_value)) {
                $topicsList[] = [
                    'title' => sanitize_text_field($topic_value),
                    'description' => '',
                    'source' => 'componentloader_props',
                    'meta_key' => "topic_" . ($index + 1)
                ];
                $hasDynamicTopics = true;
            }
        }
        
        if (defined('WP_DEBUG') && WP_DEBUG && $hasDynamicTopics) {
            error_log("GMKB Topics ROOT FIX: ✅ Loaded " . count($topicsList) . " topics from ComponentLoader props");
        }
    }
    
    // PRIORITY 2: MKCG Integration Class (if props didn't work)
    if (!$hasDynamicTopics && class_exists('GMKB_MKCG_Data_Integration')) {
        $mkcg_integration = GMKB_MKCG_Data_Integration::get_instance();
        $post_data = $mkcg_integration->get_post_data($current_post_id);
        
        if ($post_data && isset($post_data['topics']['topics']) && !empty($post_data['topics']['topics'])) {
            $mkcg_topics = $post_data['topics']['topics'];
            
            foreach ($mkcg_topics as $topic_key => $topic_value) {
                if (!empty($topic_value)) {
                    $topicsList[] = [
                        'title' => sanitize_text_field($topic_value),
                        'description' => '',
                        'source' => 'mkcg_integration',
                        'meta_key' => $topic_key
                    ];
                }
            }
            $hasDynamicTopics = true;
            
            if (defined('WP_DEBUG') && WP_DEBUG) {
                error_log("GMKB Topics ROOT FIX: ✅ Loaded " . count($topicsList) . " topics from MKCG Integration");
            }
        }
    }
    
    // PRIORITY 3: Direct Meta Key Detection (USER'S FORMAT: topic_1, topic_2, etc.)
    if (!$hasDynamicTopics) {
        $meta_formats = [
            'topic_',       // USER'S FORMAT (topic_1, topic_2, etc.) - HIGHEST PRIORITY
            'mkcg_topic_',  // Original MKCG format
            'topics_',      // Plural topics format
            '_topic_',      // Underscore prefix format
            'speaking_topic_', // Descriptive format
            'pod_topic_'    // Pods plugin format
        ];
        
        foreach ($meta_formats as $format) {
            $topics_found_this_format = 0;
            
            for ($i = 1; $i <= 5; $i++) {
                $meta_key = $format . $i;
                $topic_value = get_post_meta($current_post_id, $meta_key, true);
                
                if (!empty($topic_value)) {
                    $topicsList[] = [
                        'title' => sanitize_text_field($topic_value),
                        'description' => '',
                        'source' => 'direct_meta_' . rtrim($format, '_'),
                        'meta_key' => $meta_key
                    ];
                    $topics_found_this_format++;
                    $hasDynamicTopics = true;
                }
            }
            
            // If we found topics with this format, log and stop trying other formats
            if ($topics_found_this_format > 0) {
                if (defined('WP_DEBUG') && WP_DEBUG) {
                    error_log("GMKB Topics ROOT FIX: ✅ Found {$topics_found_this_format} topics using format '{$format}' for post {$current_post_id}");
                }
                break;
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

// ROOT FIX: Only use fallback defaults if absolutely no topics found
if (empty($topicsList)) {
    // Minimal fallback - just one example topic
    $topicsList = [
        [
            'title' => 'Add Your Speaking Topics',
            'description' => 'Click to edit and add your expertise areas',
            'source' => 'placeholder'
        ]
    ];
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

// ROOT FIX: Enhanced error handling with dynamic context
if (empty($topicsList)) {
    if ($current_post_id > 0) {
        $errorMessage = 'No topics found for this post. Check the Media Kit Content Generator or add topics manually in the design panel.';
    } else {
        $errorMessage = 'No post ID detected. Topics will be loaded when viewing a specific post with MKCG data.';
    }
} elseif (!$hasDynamicTopics) {
    // Show subtle indicator when using fallback data
    $fallbackMessage = 'Using placeholder topics. Connect to a post with MKCG data to see dynamic topics.';
}
?>

<div class="content-section editable-element <?php echo esc_attr($containerClass); ?>" 
     data-element="topics" 
     data-component="topics" 
     data-component-id="<?php echo $componentId; ?>" 
     data-component-type="topics"
     data-layout="<?php echo esc_attr($layoutStyle); ?>"
     data-columns="<?php echo esc_attr($columns); ?>"
     style="--topic-color: <?php echo esc_attr($topicColor); ?>">
     
    <!-- Enhanced Element Controls -->
    <div class="element-controls">
        <button class="control-btn" title="Edit Topics" data-action="edit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
            </svg>
        </button>
        <button class="control-btn" title="Move Up" data-action="move-up">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="18 15 12 9 6 15"></polyline>
            </svg>
        </button>
        <button class="control-btn" title="Move Down" data-action="move-down">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"></polyline>
            </svg>
        </button>
        <button class="control-btn" title="Duplicate" data-action="duplicate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
            </svg>
        </button>
        <button class="control-btn" title="Delete" data-action="delete">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="3 6 5 6 21 6"></polyline>
                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2 2h4a2 2 0 0 1 2 2v2"></path>
            </svg>
        </button>
    </div>

    <?php if (isset($errorMessage)): ?>
        <div class="topics-error-message">
            <div class="error-icon">⚠️</div>
            <div class="error-text"><?php echo esc_html($errorMessage); ?></div>
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

        <!-- ROOT FIX: Topics Grid/List Container with CORRECT Data Attributes -->
        <div class="topics-container" 
             data-layout="<?php echo esc_attr($layoutStyle); ?>"
             data-has-dynamic-topics="<?php echo $hasDynamicTopics ? 'true' : 'false'; ?>"
             data-post-id="<?php echo esc_attr($current_post_id); ?>"
             data-topics-source="<?php echo esc_attr($topicsList[0]['source'] ?? 'none'); ?>"
             data-topics-count="<?php echo count($topicsList); ?>">
            
            <?php if (!empty($topicsList)): ?>
                <?php foreach ($topicsList as $index => $topic): ?>
                    <div class="topic-item" 
                         data-topic-index="<?php echo esc_attr($index); ?>"
                         data-topic-id="<?php echo esc_attr($componentId . '_topic_' . $index); ?>"
                         data-topic-source="<?php echo esc_attr($topic['source'] ?? 'unknown'); ?>"
                         <?php if (isset($topic['meta_key'])): ?>data-meta-key="<?php echo esc_attr($topic['meta_key']); ?>"<?php endif; ?>>
                         
                        <?php if ($iconPosition === 'left'): ?>
                            <div class="topic-icon">
                                <?php if ($topic['source'] === 'mkcg'): ?>
                                    <!-- MKCG Source Icon -->
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                                    </svg>
                                <?php elseif ($topic['source'] === 'placeholder'): ?>
                                    <!-- Placeholder Icon -->
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                <?php else: ?>
                                    <!-- Default Topic Icon -->
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="3"></circle>
                                        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                                    </svg>
                                <?php endif; ?>
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
                            <?php if (defined('WP_DEBUG') && WP_DEBUG && $topic['source'] !== 'placeholder'): ?>
                                <small class="topic-source-indicator" style="font-size: 10px; opacity: 0.6; color: #666;">
                                    <?php echo esc_html(strtoupper($topic['source'])); ?>
                                    <?php if (isset($topic['meta_key'])): ?>(<?php echo esc_html($topic['meta_key']); ?>)<?php endif; ?>
                                </small>
                            <?php endif; ?>
                        </div>
                        
                        <?php if ($iconPosition === 'right'): ?>
                            <div class="topic-icon">
                                <?php if ($topic['source'] === 'mkcg'): ?>
                                    <!-- MKCG Source Icon -->
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"></path>
                                    </svg>
                                <?php elseif ($topic['source'] === 'placeholder'): ?>
                                    <!-- Placeholder Icon -->
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <line x1="12" y1="5" x2="12" y2="19"></line>
                                        <line x1="5" y1="12" x2="19" y2="12"></line>
                                    </svg>
                                <?php else: ?>
                                    <!-- Default Topic Icon -->
                                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                        <circle cx="12" cy="12" r="3"></circle>
                                        <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                                    </svg>
                                <?php endif; ?>
                            </div>
                        <?php endif; ?>
                    </div>
                <?php endforeach; ?>
                
                <!-- ROOT FIX: Enhanced Debug Info -->
                <?php if (defined('WP_DEBUG') && WP_DEBUG): ?>
                    <div class="topics-debug-info" style="margin-top: 10px; padding: 5px; background: #f0f0f0; font-size: 10px; color: #666; border-left: 3px solid #10b981;">
                        <strong>🔧 ROOT FIX DEBUG:</strong><br>
                        Topics Found: <?php echo count($topicsList); ?> | 
                        Dynamic: <?php echo $hasDynamicTopics ? 'TRUE' : 'FALSE'; ?> | 
                        Post ID: <?php echo $current_post_id; ?> | 
                        Source: <?php echo esc_html($topicsList[0]['source'] ?? 'none'); ?><br>
                        <?php if (!empty($topicsList)): ?>
                            Topics: <?php echo implode(', ', array_map(function($t) { return '"' . $t['title'] . '"'; }, array_slice($topicsList, 0, 3))); ?><?php echo count($topicsList) > 3 ? '...' : ''; ?>
                        <?php endif; ?>
                    </div>
                    <?php 
                    // ROOT FIX: Log final template state
                    error_log("GMKB Topics ROOT FIX: 🏁 TEMPLATE COMPLETE - Found " . count($topicsList) . " topics, dynamic: " . ($hasDynamicTopics ? 'TRUE' : 'FALSE') . ", post_id: {$current_post_id}");
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