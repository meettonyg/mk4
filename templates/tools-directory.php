<?php
/**
 * Tools Directory Template
 */
if (!defined('ABSPATH')) exit;

get_header();

if (function_exists('gmkb_tools_router')) {
    $router = gmkb_tools_router();
    $router->render_page();
} else {
    echo '<p>Router not loaded</p>';
}

get_footer();
