<?php
/**
 * Topics Component Template - Enhanced Version
 * ROOT FIX: Proper validation, security, and flexible topic management
 */

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

// ROOT FIX: Dynamic topic processing using MKCG data integration
// Get post_id from props or detect from URL
$current_post_id = 0;
if (isset($post_id) && is_numeric($post_id)) {
    $current_post_id = intval($post_id);
} elseif (isset($_GET['post_id']) && is_numeric($_GET['post_id'])) {
    $current_post_id = intval($_GET['post_id']);
} elseif (isset($_GET['p']) && is_numeric($_GET['p'])) {
    $current_post_id = intval($_GET['p']);
}

// Initialize topics array
$topicsList = [];
$hasDynamicTopics = false;

// ROOT FIX: Try to get topics from MKCG data integration first
if ($current_post_id > 0) {
    // Check if MKCG integration class is available
    if (class_exists('GMKB_MKCG_Data_Integration')) {
        $mkcg_integration = GMKB_MKCG_Data_Integration::get_instance();
        $post_data = $mkcg_integration->get_post_data($current_post_id);
        
        if ($post_data && isset($post_data['topics']['topics']) && !empty($post_data['topics']['topics'])) {
            $mkcg_topics = $post_data['topics']['topics'];
            
            // Convert MKCG topics to component format
            foreach ($mkcg_topics as $topic_key => $topic_value) {
                if (!empty($topic_value)) {
                    $topicsList[] = [
                        'title' => sanitize_text_field($topic_value),
                        'description' => '', // MKCG topics are title-only
                        'source' => 'mkcg',
                        'meta_key' => $topic_key
                    ];
                }
            }
            $hasDynamicTopics = true;
        }
    }
}

// ROOT FIX: Fallback to manual topics from props if no MKCG data
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

        <!-- Topics Grid/List Container -->
        <div class="topics-container" 
             data-layout="<?php echo esc_attr($layoutStyle); ?>"
             data-has-dynamic-topics="<?php echo $hasDynamicTopics ? 'true' : 'false'; ?>"
             data-post-id="<?php echo esc_attr($current_post_id); ?>"
             data-topics-source="<?php echo esc_attr($topicsList[0]['source'] ?? 'none'); ?>">
            
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
                
                <!-- ROOT FIX: Dynamic topics info for debugging -->
                <?php if (defined('WP_DEBUG') && WP_DEBUG): ?>
                    <div class="topics-debug-info" style="margin-top: 10px; padding: 5px; background: #f0f0f0; font-size: 10px; color: #666;">
                        Topics: <?php echo count($topicsList); ?> | Source: <?php echo $hasDynamicTopics ? 'Dynamic' : 'Fallback'; ?> | Post ID: <?php echo $current_post_id; ?>
                    </div>
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