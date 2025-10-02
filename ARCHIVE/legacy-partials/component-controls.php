<?php
/**
 * Reusable Component Controls Partial
 *
 * ROOT FIX: This template now provides only an empty container.
 * All control buttons are dynamically created by ComponentControlsManager.
 *
 * ARCHITECTURAL CHANGE: Server-side control rendering eliminated to prevent
 * conflicts with client-side ComponentControlsManager system.
 *
 * @version 2.0.0 - Dynamic Controls Only
 * @package Guestify
 */

// Ensure WordPress context
if (!defined('ABSPATH')) {
    exit;
}
?>
<!-- ROOT FIX: Empty container for ComponentControlsManager to populate -->
<div class="component-controls">
    <!-- Controls will be dynamically created by ComponentControlsManager -->
</div>
