<?php
/**
 * Simplified Builder Template for Pure Vue Mode
 * Architecture-compliant: Minimal PHP, Vue handles all display logic
 */

// Simple post ID detection
$post_id = isset($_GET['mkcg_id']) ? intval($_GET['mkcg_id']) : 
          (isset($_GET['post_id']) ? intval($_GET['post_id']) : 0);

?>

<div class="builder gmkb-builder-container" id="gmkb-builder-container">
    <!-- Toolbar -->
    <div class="toolbar gmkb-toolbar" id="gmkb-toolbar">
        <div class="toolbar__section toolbar__section--left">
            <div class="toolbar__logo">Guestify</div>
            <div class="toolbar__guest-name">Media Kit Builder</div>
            <div class="toolbar__status">
                <div class="toolbar__status-dot"></div>
                <span>Ready</span>
            </div>
        </div>
        
        <div class="toolbar__section toolbar__section--center">
            <div class="toolbar__preview-toggle">
                <button class="toolbar__preview-btn toolbar__preview-btn--active" data-preview="desktop">Desktop</button>
                <button class="toolbar__preview-btn" data-preview="tablet">Tablet</button>
                <button class="toolbar__preview-btn" data-preview="mobile">Mobile</button>
            </div>
        </div>
        
        <div class="toolbar__section toolbar__section--right">
            <button class="toolbar__btn" id="save-btn" title="Save Media Kit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                </svg>
                <span>Save</span>
            </button>
        </div>
    </div>

    <!-- Sidebar -->
    <div class="sidebar gmkb-sidebar" id="gmkb-sidebar">
        <!-- Vue will populate this -->
    </div>

    <!-- Main Preview Area -->
    <div class="preview">
        <div class="preview__container gmkb-preview" id="gmkb-preview-area">
            <div class="media-kit" id="media-kit-preview">
                <!-- Vue app mounts here - no PHP conditional logic -->
                <div id="vue-app-mount">
                    <!-- Vue will replace this entire div -->
                </div>
            </div>
        </div>
    </div>
</div>

<script>
// Minimal initialization data for Vue
window.gmkbInitData = {
    postId: <?php echo json_encode($post_id); ?>,
    ajaxUrl: <?php echo json_encode(admin_url('admin-ajax.php')); ?>,
    nonce: <?php echo json_encode(wp_create_nonce('gmkb_builder_nonce')); ?>
};
</script>
