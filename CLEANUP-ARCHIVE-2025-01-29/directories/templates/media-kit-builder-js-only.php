<?php
/**
 * Media Kit Builder - JavaScript-Only Rendering Template
 * 
 * This template provides:
 * 1. Empty containers for JavaScript to render into
 * 2. Initial state data for JavaScript to consume
 * 3. No component HTML - JavaScript handles all rendering
 */

// Get the saved state from WordPress
$post_id = get_the_ID() ?: (isset($_GET['post_id']) ? intval($_GET['post_id']) : 0);
$saved_state = get_post_meta($post_id, 'gmkb_media_kit_state', true);

// Ensure we have a valid state structure
if (!is_array($saved_state)) {
    $saved_state = [
        'components' => [],
        'sections' => [],
        'layout' => [],
        'globalSettings' => ['layout' => 'vertical'],
        'version' => '2.2.0'
    ];
}
?>

<div id="media-kit-builder" class="gmkb-builder">
    <!-- Toolbar (PHP can still render this as it's UI chrome, not content) -->
    <div id="gmkb-toolbar" class="gmkb-toolbar">
        <!-- Toolbar buttons here -->
    </div>
    
    <!-- Main Content Area -->
    <div id="media-kit-preview" class="gmkb-preview">
        
        <!-- Empty State (only shown if no components) -->
        <div id="empty-state" class="gmkb-empty-state" style="display: none;">
            <div class="gmkb-empty-state__content">
                <h2>Start Building Your Media Kit</h2>
                <p>Add your first component to get started</p>
                <button class="gmkb-btn gmkb-btn--primary" data-action="add-component">
                    Add Component
                </button>
            </div>
        </div>
        
        <!-- Components Container (always present, visibility controlled by JS) -->
        <div id="saved-components-container" class="gmkb-components-container" style="display: none;">
            <!-- Sections Container -->
            <div id="gmkb-sections-container" class="gmkb-sections-container">
                <!-- JavaScript will render all sections here -->
            </div>
            
            <!-- Direct Components Container (for orphans, if any) -->
            <div id="components-direct-container" class="gmkb-components-direct">
                <!-- JavaScript will render orphaned components here -->
            </div>
        </div>
        
    </div>
    
    <!-- Sidebar -->
    <div id="gmkb-sidebar" class="gmkb-sidebar">
        <!-- Sidebar content -->
    </div>
</div>

<script>
    // Pass state to JavaScript as pure data
    // No HTML, just the data structure
    window.gmkbInitialState = <?php echo json_encode($saved_state); ?>;
    
    // Set a flag to indicate we're using JS-only rendering
    window.GMKB_RENDER_MODE = 'client';
    
    // No PHP rendering of components
    window.GMKB_PHP_RENDERED_COMPONENTS = [];
</script>
