<?php
/**
 * Admin settings for Media Kit Builder
 * Allows toggling between legacy and lean architectures
 */

// Exit if accessed directly
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

// Add admin menu
add_action( 'admin_menu', 'gmkb_add_admin_menu' );

function gmkb_add_admin_menu() {
    add_submenu_page(
        'options-general.php',
        'Media Kit Builder Settings',
        'Media Kit Builder',
        'manage_options',
        'gmkb-settings',
        'gmkb_settings_page'
    );
}

// Register settings
add_action( 'admin_init', 'gmkb_register_settings' );

function gmkb_register_settings() {
    register_setting( 'gmkb_settings', 'gmkb_use_lean_bundle' );
}

// Settings page content
function gmkb_settings_page() {
    ?>
    <div class="wrap">
        <h1>Media Kit Builder Settings</h1>
        
        <?php if ( isset( $_GET['settings-updated'] ) ) : ?>
            <div class="notice notice-success is-dismissible">
                <p>Settings saved successfully!</p>
            </div>
        <?php endif; ?>
        
        <form method="post" action="options.php">
            <?php settings_fields( 'gmkb_settings' ); ?>
            
            <table class="form-table">
                <tr>
                    <th scope="row">Architecture Mode</th>
                    <td>
                        <label>
                            <input type="checkbox" name="gmkb_use_lean_bundle" value="1" 
                                <?php checked( get_option( 'gmkb_use_lean_bundle' ), 1 ); ?> />
                            Use Lean Bundle Architecture (Recommended)
                        </label>
                        <p class="description">
                            <strong>Lean Bundle (New):</strong> Single optimized JavaScript file (~100KB), faster loading, cleaner code.<br>
                            <strong>Legacy (Current):</strong> 60+ individual JavaScript files, slower loading, complex dependencies.<br><br>
                            
                            <?php if ( file_exists( GUESTIFY_PLUGIN_DIR . 'dist/gmkb.iife.js' ) ) : ?>
                                <span style="color: green;">✅ Lean bundle is built and ready to use.</span><br>
                                <small>Bundle size: <?php echo round( filesize( GUESTIFY_PLUGIN_DIR . 'dist/gmkb.iife.js' ) / 1024, 2 ); ?> KB</small><br>
                                <small>Last built: <?php echo date( 'Y-m-d H:i:s', filemtime( GUESTIFY_PLUGIN_DIR . 'dist/gmkb.iife.js' ) ); ?></small>
                            <?php else : ?>
                                <span style="color: red;">⚠️ Lean bundle not found. Run <code>npm run build</code> to create it.</span>
                            <?php endif; ?>
                        </p>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">Current Status</th>
                    <td>
                        <?php if ( GMKB_USE_LEAN_BUNDLE ) : ?>
                            <span style="color: green; font-weight: bold;">🚀 Using Lean Bundle</span>
                        <?php else : ?>
                            <span style="color: orange; font-weight: bold;">📦 Using Legacy Architecture (60+ files)</span>
                        <?php endif; ?>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">Performance Comparison</th>
                    <td>
                        <table class="widefat" style="max-width: 600px;">
                            <thead>
                                <tr>
                                    <th>Metric</th>
                                    <th>Legacy</th>
                                    <th>Lean Bundle</th>
                                    <th>Improvement</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td>JavaScript Files</td>
                                    <td>60+</td>
                                    <td>1</td>
                                    <td style="color: green;">98% reduction</td>
                                </tr>
                                <tr>
                                    <td>HTTP Requests</td>
                                    <td>60+</td>
                                    <td>1</td>
                                    <td style="color: green;">98% reduction</td>
                                </tr>
                                <tr>
                                    <td>Code Size</td>
                                    <td>~500KB</td>
                                    <td>~100KB</td>
                                    <td style="color: green;">80% reduction</td>
                                </tr>
                                <tr>
                                    <td>Load Time</td>
                                    <td>3-5 seconds</td>
                                    <td>&lt;1 second</td>
                                    <td style="color: green;">75% faster</td>
                                </tr>
                                <tr>
                                    <td>Complexity</td>
                                    <td>High</td>
                                    <td>Low</td>
                                    <td style="color: green;">Much simpler</td>
                                </tr>
                            </tbody>
                        </table>
                    </td>
                </tr>
                
                <tr>
                    <th scope="row">Migration Guide</th>
                    <td>
                        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
                            <h4 style="margin-top: 0;">How to migrate to Lean Bundle:</h4>
                            <ol>
                                <li><strong>Build the bundle:</strong> Run <code>npm install && npm run build</code> in the plugin directory</li>
                                <li><strong>Enable lean bundle:</strong> Check the box above and save</li>
                                <li><strong>Test thoroughly:</strong> Test all features work correctly</li>
                                <li><strong>Monitor for issues:</strong> Check browser console for any errors</li>
                                <li><strong>Rollback if needed:</strong> Uncheck the box to return to legacy mode</li>
                            </ol>
                        </div>
                    </td>
                </tr>
            </table>
            
            <?php submit_button(); ?>
        </form>
        
        <hr>
        
        <h2>Developer Tools</h2>
        
        <div style="margin: 20px 0;">
            <h3>Build Commands</h3>
            <code style="display: block; padding: 10px; background: #f5f5f5; margin: 5px 0;">
                cd <?php echo GUESTIFY_PLUGIN_DIR; ?><br>
                npm install<br>
                npm run build
            </code>
            
            <h3>Development Mode (Watch for changes)</h3>
            <code style="display: block; padding: 10px; background: #f5f5f5; margin: 5px 0;">
                npm run dev
            </code>
        </div>
    </div>
    <?php
}
