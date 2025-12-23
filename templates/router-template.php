<?php
/**
 * GMKB Router Template
 * Template for tools pages served by the standalone router
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

get_header();

// Get the router instance and render the page
if (function_exists('gmkb_tools_router')) {
    $router = gmkb_tools_router();
    if ($router && method_exists($router, 'render_page')) {
        $router->render_page();
    } else {
        echo '<div class="gmkb-error" style="padding: 2rem; text-align: center;">Router not available.</div>';
    }
} else {
    echo '<div class="gmkb-error" style="padding: 2rem; text-align: center;">Tools router not loaded.</div>';
}

get_footer();
