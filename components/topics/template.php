<?php
/**
 * Topics Component Template - DEFINITIVE FIX
 * This version uses a more robust method to calculate the path to the
 * reusable controls partial, resolving the "File Not Found" error.
 */

// Set default values from passed props
$props = $props ?? [];
$loaded_topics = $props['loaded_topics'] ?? [];
$post_id = $props['post_id'] ?? 0;
$componentId = $props['componentId'] ?? 'topics-' . uniqid();
$title = $props['title'] ?? 'Speaking Topics';

$has_topics = !empty($loaded_topics);
$topics_to_display = $has_topics ? $loaded_topics : []; // Show nothing if no topics
?>

<div class="content-section editable-element topics-component" 
     data-component-id="<?php echo esc_attr($componentId); ?>">
    
    <?php
    // --- START OF DEFINITIVE FIX ---
    // This method is more explicit. It goes up two directories from the current
    // file's location to find the plugin's root directory.
    $plugin_root_dir = dirname( __DIR__, 2 );
    $controls_partial_path = $plugin_root_dir . '/partials/component-controls.php';

    // We will leave a debug comment in the HTML source for verification.
    echo "<!-- Controls Path Check: " . esc_html($controls_partial_path) . " -->\n";

    if (file_exists($controls_partial_path)) {
        include $controls_partial_path;
    } else {
        // This fallback message will appear if the path is still incorrect.
        echo '<div style="color: red; border: 1px solid red; padding: 5px; margin: 5px;">Controls partial not found. Please check file path.</div>';
    }
    // --- END OF DEFINITIVE FIX ---
    ?>
    
    <div class="topics-header">
        <h2 class="section-title" contenteditable="true" data-setting="title">
            <?php echo esc_html($title); ?>
        </h2>
    </div>
    
    <div class="topics-container">
        <?php if ($has_topics): ?>
            <?php foreach ($topics_to_display as $index => $topic): ?>
                <div class="topic-item" data-topic-index="<?php echo esc_attr($index); ?>">
                    <div class="topic-content">
                        <div class="topic-title" contenteditable="true">
                            <?php 
                            $topic_title = is_array($topic) && isset($topic['title']) ? $topic['title'] : $topic;
                            echo esc_html($topic_title); 
                            ?>
                        </div>
                    </div>
                </div>
            <?php endforeach; ?>
        <?php else: ?>
             <div class="no-topics-message">
                <p>No topics found. Click 'Edit' to add your speaking topics.</p>
            </div>
        <?php endif; ?>
    </div>
    
    <?php if ($has_topics && defined('WP_DEBUG') && WP_DEBUG): ?>
        <div class="debug-notice" style="margin-top: 1rem; padding: 0.5rem; background: #e7f3ff; border: 1px solid #b3d9ff; border-radius: 4px; font-size: 0.875rem; color: #0066cc;">
            ✅ Live data: <?php echo count($loaded_topics); ?> topics loaded from server.
        </div>
    <?php endif; ?>
</div>
