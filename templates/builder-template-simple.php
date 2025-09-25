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

<div class="builder gmkb-builder-container" id="gmkb-builder-container">
    <!-- Simplified toolbar -->
    <div class="toolbar gmkb-toolbar" id="gmkb-toolbar">
        <div class="toolbar__section toolbar__section--left">
            <div class="toolbar__logo">Guestify</div>
            <div class="toolbar__guest-name">Editing: <?php echo esc_html($page_title); ?></div>
        </div>
        
        <div class="toolbar__section toolbar__section--right">
            <button class="toolbar__btn toolbar__btn--primary" id="save-btn" title="Save Media Kit">
                <span>Save</span>
            </button>
        </div>
    </div>

    <!-- Simplified sidebar -->
    <div class="sidebar gmkb-sidebar" id="gmkb-sidebar">
        <!-- Vue will populate this -->
    </div>

    <!-- Preview area with the expected container ID -->
    <div class="preview">
        <div class="preview__container gmkb-preview" id="gmkb-preview-area">
            <!-- CRITICAL: Vue expects this exact ID -->
            <div class="media-kit" id="media-kit-preview">
                <!-- Vue will mount here and replace this content -->
                <div class="gmkb-loading" style="padding: 50px; text-align: center;">
                    <div class="loading-spinner" style="
                        border: 3px solid #f3f3f3;
                        border-top: 3px solid #3498db;
                        border-radius: 50%;
                        width: 40px;
                        height: 40px;
                        animation: spin 1s linear infinite;
                        margin: 0 auto 20px;
                    "></div>
                    <p>Loading Media Kit Builder...</p>
                </div>
            </div>
        </div>
    </div>
</div>

<style>
@keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
}

/* Minimal required styles */
.gmkb-builder-container {
    display: flex;
    flex-direction: column;
    height: 100vh;
}

.toolbar {
    display: flex;
    justify-content: space-between;
    padding: 10px 20px;
    background: #fff;
    border-bottom: 1px solid #ddd;
}

.toolbar__section {
    display: flex;
    align-items: center;
    gap: 10px;
}

.sidebar {
    position: fixed;
    left: 0;
    top: 60px;
    width: 300px;
    height: calc(100vh - 60px);
    background: #f8f8f8;
    border-right: 1px solid #ddd;
    overflow-y: auto;
}

.preview {
    margin-left: 300px;
    padding: 20px;
    background: #f5f5f5;
    min-height: calc(100vh - 60px);
}

.media-kit {
    background: white;
    border-radius: 8px;
    padding: 20px;
    min-height: 500px;
}
</style>

<!-- All other styles handled via enqueued CSS files -->
<!-- All scripts handled via Vue bundle -->