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

// Process and validate topics
$defaultTopics = [
    ['title' => 'Technology Innovation', 'description' => 'Latest trends in tech and innovation'],
    ['title' => 'Digital Transformation', 'description' => 'Helping businesses adapt to digital age'],
    ['title' => 'Leadership & Strategy', 'description' => 'Effective leadership in modern organizations'],
    ['title' => 'Future of Work', 'description' => 'Remote work and workplace evolution']
];

// Enhanced topic processing
if (isset($topics) && is_array($topics)) {
    $processedTopics = [];
    foreach ($topics as $index => $topic) {
        if (is_string($topic)) {
            $processedTopics[] = [
                'title' => sanitize_text_field($topic),
                'description' => ''
            ];
        } elseif (is_array($topic)) {
            $processedTopics[] = [
                'title' => sanitize_text_field($topic['title'] ?? $topic[0] ?? ''),
                'description' => sanitize_textarea_field($topic['description'] ?? $topic[1] ?? '')
            ];
        }
    }
    $topicsList = array_filter($processedTopics, function($topic) {
        return !empty($topic['title']);
    });
} else {
    $topicsList = $defaultTopics;
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

// Error handling
if (empty($topicsList)) {
    $errorMessage = 'No valid topics found. Please add some topics in the design panel.';
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
        <div class="topics-container" data-layout="<?php echo esc_attr($layoutStyle); ?>">
            <?php foreach ($topicsList as $index => $topic): ?>
                <div class="topic-item" 
                     data-topic-index="<?php echo esc_attr($index); ?>"
                     data-topic-id="<?php echo esc_attr($componentId . '_topic_' . $index); ?>">
                     
                    <?php if ($iconPosition === 'left'): ?>
                        <div class="topic-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                            </svg>
                        </div>
                    <?php endif; ?>
                    
                    <div class="topic-content">
                        <div class="topic-title" 
                             contenteditable="true" 
                             data-setting="topic_<?php echo esc_attr($index + 1); ?>">
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
                    </div>
                    
                    <?php if ($iconPosition === 'right'): ?>
                        <div class="topic-icon">
                            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <circle cx="12" cy="12" r="3"></circle>
                                <path d="M12 1v6m0 6v6m11-7h-6m-6 0H1"></path>
                            </svg>
                        </div>
                    <?php endif; ?>
                </div>
            <?php endforeach; ?>
        </div>
        
    <?php endif; ?>
</div>