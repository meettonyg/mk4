<?php
/**
 * Media Library Test Page
 * 
 * ROOT FIX v4: Test page to verify media library functionality
 * Access via: /wp-admin/admin.php?page=gmkb-media-test
 */

// Add admin menu item for testing
add_action('admin_menu', 'gmkb_add_media_test_page');
function gmkb_add_media_test_page() {
    add_submenu_page(
        null, // Hidden page (no parent)
        'Media Library Test',
        'Media Library Test',
        'manage_options',
        'gmkb-media-test',
        'gmkb_render_media_test_page'
    );
}

function gmkb_render_media_test_page() {
    // Enqueue media library
    wp_enqueue_media();
    ?>
    <div class="wrap">
        <h1>WordPress Media Library Test</h1>
        <p>This page tests if the WordPress Media Library is working correctly.</p>
        
        <div style="margin: 20px 0;">
            <button id="test-media-button" class="button button-primary">
                Open Media Library
            </button>
        </div>
        
        <div id="test-results" style="margin: 20px 0; padding: 20px; background: #f0f0f1; border-left: 4px solid #72aee6;">
            <h3>Test Results:</h3>
            <div id="results-content">Click the button above to test the media library...</div>
        </div>
        
        <div id="selected-media" style="margin: 20px 0;">
            <h3>Selected Media:</h3>
            <div id="media-preview">No media selected yet.</div>
        </div>
    </div>
    
    <script type="text/javascript">
    jQuery(document).ready(function($) {
        var resultsDiv = $('#results-content');
        var previewDiv = $('#media-preview');
        
        // Check if wp.media is available
        function checkMediaLibrary() {
            var checks = {
                'jQuery': typeof jQuery !== 'undefined',
                'wp': typeof wp !== 'undefined',
                'wp.media': typeof wp !== 'undefined' && typeof wp.media !== 'undefined',
                'wp.media function': typeof wp !== 'undefined' && typeof wp.media === 'function',
                'Backbone': typeof Backbone !== 'undefined',
                'Underscore': typeof _ !== 'undefined',
                '_wpPluploadSettings': typeof _wpPluploadSettings !== 'undefined'
            };
            
            var html = '<ul>';
            var allPassed = true;
            
            for (var key in checks) {
                var status = checks[key] ? '✅' : '❌';
                var color = checks[key] ? 'green' : 'red';
                html += '<li style="color: ' + color + '">' + status + ' ' + key + '</li>';
                if (!checks[key]) allPassed = false;
            }
            
            html += '</ul>';
            
            if (allPassed) {
                html = '<p style="color: green; font-weight: bold;">✅ All checks passed! Media library is ready.</p>' + html;
            } else {
                html = '<p style="color: red; font-weight: bold;">❌ Some checks failed. Media library may not work correctly.</p>' + html;
            }
            
            resultsDiv.html(html);
            return allPassed;
        }
        
        // Initial check
        checkMediaLibrary();
        
        // Test button click
        $('#test-media-button').on('click', function(e) {
            e.preventDefault();
            
            // Check again before opening
            if (!checkMediaLibrary()) {
                alert('Media library is not fully loaded. Please check the test results.');
                return;
            }
            
            try {
                // Create media frame
                var frame = wp.media({
                    title: 'Select Test Image',
                    button: {
                        text: 'Use This Image'
                    },
                    multiple: false,
                    library: { type: 'image' }
                });
                
                // When image is selected
                frame.on('select', function() {
                    var attachment = frame.state().get('selection').first().toJSON();
                    
                    // Display selected image
                    var html = '<div>';
                    html += '<p><strong>Success!</strong> Image selected:</p>';
                    html += '<img src="' + attachment.url + '" style="max-width: 300px; height: auto;" />';
                    html += '<p>ID: ' + attachment.id + '</p>';
                    html += '<p>Title: ' + attachment.title + '</p>';
                    html += '<p>URL: ' + attachment.url + '</p>';
                    html += '</div>';
                    
                    previewDiv.html(html);
                    
                    // Update results
                    resultsDiv.html('<p style="color: green; font-weight: bold;">✅ Media Library is working perfectly!</p>');
                });
                
                // Open the frame
                frame.open();
                
            } catch (error) {
                console.error('Media Library Error:', error);
                alert('Failed to open media library: ' + error.message);
                
                resultsDiv.html(
                    '<p style="color: red;">❌ Error: ' + error.message + '</p>' +
                    '<p>Check browser console for more details.</p>'
                );
            }
        });
    });
    </script>
    <?php
}
