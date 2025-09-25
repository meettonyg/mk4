<?php
/**
 * PHASE 2: SIMPLIFIED BUILDER TEMPLATE - Pure Vue Implementation
 * 
 * This template provides a single, clean Vue mount point.
 * All legacy containers and complexity removed.
 * Vue handles all rendering and state management.
 */

// Simple post ID detection
$post_id = 0;
if (isset($_GET['mkcg_id'])) {
    $post_id = intval($_GET['mkcg_id']);
} elseif (isset($_GET['post_id'])) {
    $post_id = intval($_GET['post_id']);
} elseif (isset($_GET['guest_id'])) {
    $post_id = intval($_GET['guest_id']);
}

// Page title
$page_title = 'Media Kit Builder';
if ($post_id > 0) {
    $post = get_post($post_id);
    if ($post) {
        $page_title .= ' - ' . esc_html($post->post_title);
    }
}
?>

<div class="wrap gmkb-builder-page">
    <h1><?php echo esc_html($page_title); ?></h1>
    
    <!-- PHASE 2 FIX: Single Vue mount point - clean and simple -->
    <div id="gmkb-vue-app" class="gmkb-builder-container">
        <!-- Vue will handle everything here -->
        <div class="gmkb-loading">
            <div class="loading-spinner"></div>
            <p>Loading Media Kit Builder...</p>
        </div>
    </div>
    
    <!-- Hidden data for Vue app (if needed) -->
    <?php if ($post_id > 0): ?>
    <script type="application/json" id="gmkb-initial-data">
    <?php 
        $saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);
        echo wp_json_encode([
            'postId' => $post_id,
            'savedState' => $saved_state ?: null,
            'ajaxUrl' => admin_url('admin-ajax.php'),
            'nonce' => wp_create_nonce('gmkb_nonce')
        ]);
    ?>
    </script>
    <?php endif; ?>
</div>

<!-- All styles handled via enqueued CSS files -->
<!-- All scripts handled via Vue bundle -->