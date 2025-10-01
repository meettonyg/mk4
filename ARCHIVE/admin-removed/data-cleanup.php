<?php
/**
 * Topics Data Cleanup Script
 * ROOT FIX: Removes whitespace from all existing topics data in the database
 * This script should be run once to clean up existing data, then can be removed
 * 
 * @package Guestify/Admin
 * @version 1.0.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class to handle one-time cleanup of topics data
 */
class Topics_Data_Cleanup {
    
    /**
     * Run the cleanup process
     */
    public static function run_cleanup() {
        global $wpdb;
        
        $cleaned_count = 0;
        $error_count = 0;
        
        // ROOT FIX: Get all posts that might have topics data
        $posts_with_topics = $wpdb->get_results("
            SELECT DISTINCT post_id 
            FROM {$wpdb->postmeta} 
            WHERE meta_key LIKE 'mkcg_topic_%' 
               OR meta_key LIKE 'topic_%' 
               OR meta_key = 'topics_data'
        ");
        
        if (empty($posts_with_topics)) {
            error_log('Topics Data Cleanup: No posts with topics data found');
            return array(
                'success' => true,
                'message' => 'No topics data found to clean',
                'cleaned' => 0,
                'errors' => 0
            );
        }
        
        error_log('Topics Data Cleanup: Found ' . count($posts_with_topics) . ' posts with topics data');
        
        foreach ($posts_with_topics as $post_row) {
            $post_id = $post_row->post_id;
            $post_cleaned = false;
            
            // ROOT FIX: Clean MKCG topic fields (primary storage)
            for ($i = 1; $i <= 5; $i++) {
                $meta_key = "mkcg_topic_{$i}";
                $topic_value = get_post_meta($post_id, $meta_key, true);
                
                if (!empty($topic_value) && is_string($topic_value)) {
                    // Check if value has whitespace that needs trimming
                    $trimmed_value = trim($topic_value);
                    
                    if ($trimmed_value !== $topic_value) {
                        // Update with trimmed value
                        $result = update_post_meta($post_id, $meta_key, $trimmed_value);
                        if ($result !== false) {
                            $post_cleaned = true;
                            error_log("Cleaned {$meta_key} for post {$post_id}: '{$topic_value}' -> '{$trimmed_value}'");
                        } else {
                            $error_count++;
                            error_log("ERROR: Failed to clean {$meta_key} for post {$post_id}");
                        }
                    }
                }
            }
            
            // ROOT FIX: Clean custom topic fields (fallback storage)
            for ($i = 1; $i <= 5; $i++) {
                $meta_key = "topic_{$i}";
                $topic_value = get_post_meta($post_id, $meta_key, true);
                
                if (!empty($topic_value) && is_string($topic_value)) {
                    // Check if value has whitespace that needs trimming
                    $trimmed_value = trim($topic_value);
                    
                    if ($trimmed_value !== $topic_value) {
                        // Update with trimmed value
                        $result = update_post_meta($post_id, $meta_key, $trimmed_value);
                        if ($result !== false) {
                            $post_cleaned = true;
                            error_log("Cleaned {$meta_key} for post {$post_id}: '{$topic_value}' -> '{$trimmed_value}'");
                        } else {
                            $error_count++;
                            error_log("ERROR: Failed to clean {$meta_key} for post {$post_id}");
                        }
                    }
                }
            }
            
            // ROOT FIX: Clean JSON topics data
            $json_topics = get_post_meta($post_id, 'topics_data', true);
            if (!empty($json_topics)) {
                $decoded_topics = json_decode($json_topics, true);
                if (is_array($decoded_topics)) {
                    $needs_update = false;
                    
                    foreach ($decoded_topics as &$topic_data) {
                        if (isset($topic_data['title']) && is_string($topic_data['title'])) {
                            $trimmed_title = trim($topic_data['title']);
                            if ($trimmed_title !== $topic_data['title']) {
                                $topic_data['title'] = $trimmed_title;
                                $needs_update = true;
                            }
                        }
                        
                        if (isset($topic_data['description']) && is_string($topic_data['description'])) {
                            $trimmed_desc = trim($topic_data['description']);
                            if ($trimmed_desc !== $topic_data['description']) {
                                $topic_data['description'] = $trimmed_desc;
                                $needs_update = true;
                            }
                        }
                    }
                    
                    if ($needs_update) {
                        $updated_json = json_encode($decoded_topics);
                        $result = update_post_meta($post_id, 'topics_data', $updated_json);
                        if ($result !== false) {
                            $post_cleaned = true;
                            error_log("Cleaned JSON topics_data for post {$post_id}");
                        } else {
                            $error_count++;
                            error_log("ERROR: Failed to clean JSON topics_data for post {$post_id}");
                        }
                    }
                }
            }
            
            if ($post_cleaned) {
                $cleaned_count++;
                
                // Update timestamp to track when cleanup was performed
                update_post_meta($post_id, 'topics_cleanup_timestamp', current_time('mysql'));
            }
        }
        
        // Clear any caches
        wp_cache_flush();
        
        $result = array(
            'success' => true,
            'message' => "Cleanup complete: {$cleaned_count} posts cleaned",
            'cleaned' => $cleaned_count,
            'errors' => $error_count,
            'total_posts' => count($posts_with_topics)
        );
        
        error_log('Topics Data Cleanup Complete: ' . json_encode($result));
        
        return $result;
    }
    
    /**
     * AJAX handler for running cleanup from admin
     */
    public static function ajax_run_cleanup() {
        // Check user permissions
        if (!current_user_can('manage_options')) {
            wp_die('Unauthorized');
        }
        
        // Verify nonce
        check_ajax_referer('gmkb_admin_nonce', 'nonce');
        
        // Run the cleanup
        $result = self::run_cleanup();
        
        // Return result as JSON
        wp_send_json($result);
    }
}

// Hook into WordPress admin init to add admin menu
add_action('admin_init', function() {
    // Check if cleanup has already been run
    $cleanup_run = get_option('gmkb_topics_cleanup_completed', false);
    
    if (!$cleanup_run) {
        // Add admin notice
        add_action('admin_notices', function() {
            ?>
            <div class="notice notice-warning is-dismissible">
                <p><strong>Guestify Media Kit:</strong> Topics data cleanup is available. 
                   <a href="#" id="run-topics-cleanup" class="button button-primary">Run Cleanup Now</a>
                </p>
                <div id="cleanup-result" style="display:none; margin-top:10px;"></div>
            </div>
            <script>
            jQuery(document).ready(function($) {
                $('#run-topics-cleanup').on('click', function(e) {
                    e.preventDefault();
                    var button = $(this);
                    button.prop('disabled', true).text('Running cleanup...');
                    
                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'gmkb_run_topics_cleanup',
                            nonce: '<?php echo wp_create_nonce('gmkb_admin_nonce'); ?>'
                        },
                        success: function(response) {
                            if (response.success) {
                                $('#cleanup-result')
                                    .html('<strong>✅ ' + response.message + '</strong><br>Cleaned: ' + response.cleaned + ' posts | Errors: ' + response.errors)
                                    .show()
                                    .css('color', 'green');
                                button.text('Cleanup Complete').addClass('button-success');
                                
                                // Hide the notice after 5 seconds
                                setTimeout(function() {
                                    button.closest('.notice').fadeOut();
                                }, 5000);
                            } else {
                                $('#cleanup-result')
                                    .html('<strong>❌ Error:</strong> ' + (response.message || 'Unknown error'))
                                    .show()
                                    .css('color', 'red');
                                button.prop('disabled', false).text('Retry Cleanup');
                            }
                        },
                        error: function() {
                            $('#cleanup-result')
                                .html('<strong>❌ Error:</strong> Failed to run cleanup')
                                .show()
                                .css('color', 'red');
                            button.prop('disabled', false).text('Retry Cleanup');
                        }
                    });
                });
            });
            </script>
            <?php
        });
    }
});

// Register AJAX handler
add_action('wp_ajax_gmkb_run_topics_cleanup', array('Topics_Data_Cleanup', 'ajax_run_cleanup'));

// AUTO-RUN: Optionally run cleanup automatically on plugin activation or admin init
// Uncomment the line below to run cleanup automatically when an admin page loads
// add_action('admin_init', function() { Topics_Data_Cleanup::run_cleanup(); }, 99);

// ROOT FIX: Also hook into save_post to ensure new data is always trimmed
add_filter('update_post_metadata', function($check, $object_id, $meta_key, $meta_value, $prev_value) {
    // Check if this is a topics-related meta field
    $topics_fields = array();
    for ($i = 1; $i <= 5; $i++) {
        $topics_fields[] = "mkcg_topic_{$i}";
        $topics_fields[] = "topic_{$i}";
    }
    
    if (in_array($meta_key, $topics_fields) && is_string($meta_value)) {
        // Trim the value before it's saved
        $trimmed_value = trim($meta_value);
        if ($trimmed_value !== $meta_value) {
            // Update with trimmed value instead
            remove_filter('update_post_metadata', __FUNCTION__, 10);
            update_post_meta($object_id, $meta_key, $trimmed_value);
            add_filter('update_post_metadata', __FUNCTION__, 10, 5);
            
            // Prevent the original untrimmed value from being saved
            return true;
        }
    }
    
    return $check;
}, 10, 5);
