<?php
/**
 * PHASE 2: SIMPLIFIED BUILDER TEMPLATE - Pure Vue Implementation
 * Updated to include proper toolbar and sidebar structure
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

// Get post title if available
$guest_name = 'Media Kit';
if ($post_id > 0) {
    $post = get_post($post_id);
    if ($post) {
        $guest_name = esc_html($post->post_title);
    }
}
?>

<div class="builder gmkb-builder-container" id="gmkb-builder-container">

    <!-- Full toolbar structure for proper functionality -->
    <div class="toolbar gmkb-toolbar" id="gmkb-toolbar">
        <div class="toolbar__section toolbar__section--left">
            <div class="toolbar__logo">Guestify</div>
            <div class="toolbar__guest-name">Editing: <?php echo $guest_name; ?></div>
            
            <div class="toolbar__status">
                <div class="toolbar__status-dot"></div>
                <span>Saved</span>
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
            <button class="toolbar__btn" id="global-theme-btn" title="Theme Settings">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
                    <circle cx="12" cy="12" r="3"></circle>
                    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                <span>Theme</span>
            </button>
            <button class="toolbar__btn" id="undo-btn" disabled title="Undo Last Action">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
                    <path d="M3 7v6h6"></path>
                    <path d="M21 17a9 9 0 00-9-9 9 9 0 00-6 2.3L3 13"></path>
                </svg>
                <span>Undo</span>
            </button>
            <button class="toolbar__btn" id="redo-btn" disabled title="Redo Last Action">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
                    <path d="M21 7v6h-6"></path>
                    <path d="M3 17a9 9 0 019-9 9 9 0 016 2.3l3 2.7"></path>
                </svg>
                <span>Redo</span>
            </button>
            <button class="toolbar__btn toolbar__btn--primary" id="save-btn" title="Save Media Kit">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="display: inline-block; vertical-align: middle; margin-right: 6px;">
                    <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"></path>
                    <polyline points="17,21 17,13 7,13 7,21"></polyline>
                    <polyline points="7,3 7,8 15,8"></polyline>
                </svg>
                <span>Save</span>
            </button>
        </div>
    </div>

    <!-- Sidebar with buttons -->
    <div class="sidebar gmkb-sidebar" id="gmkb-sidebar">
        <div class="sidebar-tabs">
            <div class="sidebar-tab sidebar-tab--active" data-tab="components">
                <span class="sidebar-tab__label">Components</span>
            </div>
        </div>
        
        <div class="sidebar-content">
            <div class="sidebar-panel sidebar-panel--active" data-panel="components">
                <!-- Add Component button -->
                <div class="sidebar-section">
                    <button class="btn btn--primary btn--full-width" id="add-component-btn" data-action="add-component">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <line x1="12" y1="5" x2="12" y2="19"></line>
                            <line x1="5" y1="12" x2="19" y2="12"></line>
                        </svg>
                        Add Component
                    </button>
                </div>
                
                <!-- Add Section button -->
                <div class="sidebar-section">
                    <button class="btn btn--secondary btn--full-width" id="add-section-btn" data-action="add-section">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                            <line x1="12" y1="8" x2="12" y2="16"></line>
                            <line x1="8" y1="12" x2="16" y2="12"></line>
                        </svg>
                        Add Section
                    </button>
                </div>
                
                <!-- Component list will be populated by Vue -->
                <div class="sidebar-section" id="component-list">
                    <!-- Vue will populate this -->
                </div>
            </div>
        </div>
    </div>

    <!-- Preview area with the expected container ID -->
    <div class="preview">
        <div class="preview__container gmkb-preview" id="gmkb-preview-area">
            <!-- CRITICAL: Vue expects this exact ID -->
            <div class="media-kit" id="media-kit-preview">
                <!-- Vue will mount here and replace this content -->
                <div class="gmkb-loading" style="padding: 50px; text-align: center;">
                    <div class="loading-spinner"></div>
                    <p>Loading Media Kit Builder...</p>
                </div>
            </div>
        </div>
    </div>
    
</div>

<script>
// Simple button handlers that work with Vue store
document.addEventListener('DOMContentLoaded', function() {
    // Add Component button
    const addComponentBtn = document.getElementById('add-component-btn');
    if (addComponentBtn) {
        addComponentBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Open component library modal
            if (window.gmkbStore && window.gmkbStore.openComponentLibrary) {
                window.gmkbStore.openComponentLibrary();
            } else {
                // Fallback: dispatch event
                document.dispatchEvent(new CustomEvent('gmkb:open-component-library'));
            }
        });
    }
    
    // Add Section button
    const addSectionBtn = document.getElementById('add-section-btn');
    if (addSectionBtn) {
        addSectionBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Add default section
            if (window.gmkbStore) {
                window.gmkbStore.addSection('full_width');
            }
        });
    }
    
    // Theme button
    const themeBtn = document.getElementById('global-theme-btn');
    if (themeBtn) {
        themeBtn.addEventListener('click', function(e) {
            e.preventDefault();
            // Open theme customizer
            if (window.themeStore && window.themeStore.openCustomizer) {
                window.themeStore.openCustomizer();
            }
        });
    }
});
</script>

<!-- All other styles handled via enqueued CSS files -->
<!-- All scripts handled via Vue bundle -->