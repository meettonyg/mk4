<?php
/**
 * Topics Component Template - ARCHITECTURAL COMPLIANCE VERSION
 * 
 * Server-side rendering template for the topics component following
 * scalable architecture principles.
 * 
 * @version 1.0.0-architectural-compliance
 */

// Available variables from component context:
// $loaded_topics - Topics data from MKCG integration or fallback
// $post_id - Current post ID
// $component_id - Unique component instance ID

// Set default values
$loaded_topics = $loaded_topics ?? [];
$post_id = $post_id ?? 0;
$component_id = $component_id ?? 'topics-' . uniqid();
$title = $title ?? 'Speaking Topics';

// Determine data source and prepare topics
$has_topics = !empty($loaded_topics);
$topics_to_display = $has_topics ? $loaded_topics : ['Topic 1', 'Topic 2', 'Topic 3', 'Topic 4', 'Topic 5'];
$data_source = $has_topics ? 'server' : 'fallback';

if (defined('WP_DEBUG') && WP_DEBUG) {
    error_log("Topics Template: Rendering for component {$component_id} with " . count($topics_to_display) . " topics (source: {$data_source})");
}
?>

<div class="content-section editable-element topics-component layout-grid columns-2 <?php echo $has_topics ? 'has-topics' : 'fallback-topics'; ?>" 
     data-element="topics" 
     data-component="topics" 
     data-component-id="<?php echo esc_attr($component_id); ?>"
     data-post-id="<?php echo esc_attr($post_id); ?>"
     data-has-topics="<?php echo $has_topics ? 'true' : 'false'; ?>"
     data-loading-source="<?php echo esc_attr($data_source); ?>"
     data-loading-resolved="true"
     data-template-rendered="true">
    
    <div class="topics-header">
        <h2 class="section-title" contenteditable="true" data-setting="title">
            <?php echo esc_html($title); ?>
        </h2>
    </div>
    
    <div class="topics-container" 
         data-has-topics="<?php echo $has_topics ? 'true' : 'false'; ?>"
         data-loading-source="<?php echo esc_attr($data_source); ?>"
         data-loading-resolved="true">
        
        <?php foreach ($topics_to_display as $index => $topic): ?>
            <div class="topic-item" data-topic-index="<?php echo esc_attr($index); ?>">
                <div class="topic-content">
                    <div class="topic-title" 
                         contenteditable="true" 
                         data-setting="topic_<?php echo ($index + 1); ?>">
                        <?php echo esc_html($topic); ?>
                    </div>
                </div>
            </div>
        <?php endforeach; ?>
    </div>
    
    <?php if (!$has_topics): ?>
        <div class="fallback-notice" style="
            margin-top: 1rem;
            padding: 0.5rem;
            background: #fff3cd;
            border: 1px solid #ffeaa7;
            border-radius: 4px;
            font-size: 0.875rem;
            color: #856404;
        ">
            ⚠️ Fallback mode: Topics loaded from cache. Click to edit directly.
        </div>
    <?php endif; ?>
    
    <?php if ($has_topics && defined('WP_DEBUG') && WP_DEBUG): ?>
        <div class="debug-notice" style="
            margin-top: 1rem;
            padding: 0.5rem;
            background: #e7f3ff;
            border: 1px solid #b3d9ff;
            border-radius: 4px;
            font-size: 0.875rem;
            color: #0066cc;
        ">
            ✅ Live data: <?php echo count($loaded_topics); ?> topics loaded from server
        </div>
    <?php endif; ?>
</div>

<?php
// Include fallback script for client-side fallback handling
$fallback_script_url = plugin_dir_url(__FILE__) . 'fallback.js';
?>
<script src="<?php echo esc_url($fallback_script_url); ?>?v=<?php echo time(); ?>" defer></script>