<?php
/**
 * Database Inspection Script for GMKB Saved Components
 * 
 * This script investigates what happened to saved components and checks
 * for data under different meta keys from previous versions.
 */

// Exit if accessed directly
if (!defined('ABSPATH')) {
    // Allow direct access for debugging
    require_once('../../../../wp-config.php');
}

function gmkb_inspect_database_for_saved_components() {
    $post_id = 32372; // The post ID from the logs
    
    echo "<h2>🔍 GMKB Database Inspection for Post ID: {$post_id}</h2>\n";
    echo "<style>body{font-family:monospace;background:#1a1a1a;color:#e2e8f0;padding:20px;} h2,h3{color:#0ea5e9;} .found{color:#10b981;} .empty{color:#f59e0b;} .error{color:#ef4444;}</style>\n";
    
    // Check if post exists
    $post = get_post($post_id);
    if (!$post) {
        echo "<div class='error'>❌ Post {$post_id} does not exist!</div>\n";
        return;
    }
    
    echo "<div class='found'>✅ Post {$post_id} exists: \"{$post->post_title}\" (Status: {$post->post_status})</div>\n";
    
    // Current meta key being used
    echo