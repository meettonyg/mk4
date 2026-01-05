<?php
/**
 * AI Settings Admin Page
 *
 * Admin interface for managing OpenAI API settings and viewing usage stats.
 *
 * @package GMKB
 * @since 3.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_AI_Settings_Admin {

    /**
     * Option name for storing API key
     */
    const OPTION_API_KEY = 'gmkb_openai_api_key';

    /**
     * Initialize admin hooks
     */
    public static function init(): void {
        add_action('admin_menu', [__CLASS__, 'register_admin_menu']);
        add_action('admin_init', [__CLASS__, 'register_settings']);
        add_action('wp_ajax_gmkb_test_openai_connection', [__CLASS__, 'ajax_test_connection']);
    }

    /**
     * Register admin menu item
     */
    public static function register_admin_menu(): void {
        add_submenu_page(
            'edit.php?post_type=guests',         // Parent slug (under Guests post type)
            'AI Settings',                       // Page title
            'AI Settings',                       // Menu title
            'manage_options',                    // Capability
            'gmkb-ai-settings',                  // Menu slug
            [__CLASS__, 'render_admin_page']     // Callback
        );
    }

    /**
     * Register settings
     */
    public static function register_settings(): void {
        register_setting(
            'gmkb_ai_settings',
            self::OPTION_API_KEY,
            [
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default' => '',
            ]
        );

        add_settings_section(
            'gmkb_ai_api_section',
            'OpenAI API Configuration',
            [__CLASS__, 'render_api_section_description'],
            'gmkb-ai-settings'
        );

        add_settings_field(
            'gmkb_openai_api_key',
            'API Key',
            [__CLASS__, 'render_api_key_field'],
            'gmkb-ai-settings',
            'gmkb_ai_api_section'
        );
    }

    /**
     * Render API section description
     */
    public static function render_api_section_description(): void {
        echo '<p>Configure your OpenAI API key for AI-powered content generation. ';
        echo 'Get your API key from <a href="https://platform.openai.com/api-keys" target="_blank">OpenAI Platform</a>.</p>';

        // Show notice if API key is set via constant
        if (defined('OPENAI_API_KEY') && !empty(OPENAI_API_KEY)) {
            echo '<div class="notice notice-info inline"><p>';
            echo '<strong>Note:</strong> API key is currently set via the <code>OPENAI_API_KEY</code> constant in your configuration. ';
            echo 'This takes priority over the setting below.';
            echo '</p></div>';
        }
    }

    /**
     * Render API key field
     */
    public static function render_api_key_field(): void {
        $api_key = get_option(self::OPTION_API_KEY, '');
        $is_constant = defined('OPENAI_API_KEY') && !empty(OPENAI_API_KEY);
        $display_key = $is_constant ? self::mask_api_key(OPENAI_API_KEY) : self::mask_api_key($api_key);

        ?>
        <input
            type="password"
            id="gmkb_openai_api_key"
            name="<?php echo esc_attr(self::OPTION_API_KEY); ?>"
            value="<?php echo esc_attr($api_key); ?>"
            class="regular-text"
            placeholder="sk-..."
            autocomplete="off"
            <?php echo $is_constant ? 'disabled' : ''; ?>
        />
        <button type="button" class="button button-secondary" onclick="toggleApiKeyVisibility()">
            Show/Hide
        </button>
        <?php if (!empty($api_key) || $is_constant): ?>
            <p class="description">
                Current key: <code><?php echo esc_html($display_key); ?></code>
                <?php if ($is_constant): ?>
                    <em>(from constant)</em>
                <?php endif; ?>
            </p>
        <?php else: ?>
            <p class="description">No API key configured.</p>
        <?php endif; ?>

        <script>
        function toggleApiKeyVisibility() {
            var input = document.getElementById('gmkb_openai_api_key');
            input.type = input.type === 'password' ? 'text' : 'password';
        }
        </script>
        <?php
    }

    /**
     * Mask API key for display
     */
    private static function mask_api_key(string $key): string {
        if (empty($key)) {
            return '';
        }

        if (strlen($key) <= 8) {
            return str_repeat('*', strlen($key));
        }

        return substr($key, 0, 4) . str_repeat('*', strlen($key) - 8) . substr($key, -4);
    }

    /**
     * Get effective API key (constant takes priority)
     */
    private static function get_effective_api_key(): string {
        if (defined('OPENAI_API_KEY') && !empty(OPENAI_API_KEY)) {
            return OPENAI_API_KEY;
        }
        return get_option(self::OPTION_API_KEY, '');
    }

    /**
     * AJAX handler for testing OpenAI connection
     */
    public static function ajax_test_connection(): void {
        check_ajax_referer('gmkb_ai_settings_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Permission denied.']);
            return;
        }

        $api_key = self::get_effective_api_key();

        if (empty($api_key)) {
            wp_send_json_error(['message' => 'No API key configured.']);
            return;
        }

        // Make a minimal test request
        $response = wp_remote_post('https://api.openai.com/v1/chat/completions', [
            'method' => 'POST',
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
            ],
            'body' => wp_json_encode([
                'model' => 'gpt-4o-mini',
                'messages' => [
                    ['role' => 'user', 'content' => 'Respond with only the word "OK"']
                ],
                'max_tokens' => 5
            ]),
            'timeout' => 15,
        ]);

        if (is_wp_error($response)) {
            wp_send_json_error([
                'message' => 'Connection failed: ' . $response->get_error_message()
            ]);
            return;
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code === 200) {
            wp_send_json_success([
                'message' => 'Connection successful! API is working.',
                'model' => $body['model'] ?? 'unknown'
            ]);
        } else {
            $error_message = $body['error']['message'] ?? 'Unknown error (code: ' . $code . ')';
            wp_send_json_error([
                'message' => 'API error: ' . $error_message
            ]);
        }
    }

    /**
     * Render the admin page
     */
    public static function render_admin_page(): void {
        // Check permissions
        if (!current_user_can('manage_options')) {
            wp_die('You do not have sufficient permissions to access this page.');
        }

        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

            <form method="post" action="options.php">
                <?php
                settings_fields('gmkb_ai_settings');
                do_settings_sections('gmkb-ai-settings');
                submit_button('Save Settings');
                ?>
            </form>

            <hr />

            <h2>Connection Test</h2>
            <p>Test your OpenAI API connection to ensure everything is configured correctly.</p>

            <button type="button" id="gmkb-test-connection" class="button button-primary">
                Test Connection
            </button>
            <span id="gmkb-test-result" style="margin-left: 10px;"></span>

            <hr />

            <h2>Configuration Info</h2>
            <table class="widefat" style="max-width: 600px;">
                <tbody>
                    <tr>
                        <th>API Key Source</th>
                        <td>
                            <?php if (defined('OPENAI_API_KEY') && !empty(OPENAI_API_KEY)): ?>
                                <code>OPENAI_API_KEY</code> constant (wp-config.php)
                            <?php elseif (!empty(get_option(self::OPTION_API_KEY))): ?>
                                WordPress option (<code>gmkb_openai_api_key</code>)
                            <?php else: ?>
                                <span style="color: #dc3545;">Not configured</span>
                            <?php endif; ?>
                        </td>
                    </tr>
                    <tr>
                        <th>Default Model</th>
                        <td><code>gpt-4o-mini</code></td>
                    </tr>
                    <tr>
                        <th>Public Rate Limit</th>
                        <td>3 generations per hour (per IP)</td>
                    </tr>
                    <tr>
                        <th>Authenticated Rate Limit</th>
                        <td>10 generations per hour (per user)</td>
                    </tr>
                </tbody>
            </table>

            <script>
            jQuery(document).ready(function($) {
                $('#gmkb-test-connection').on('click', function() {
                    var $button = $(this);
                    var $result = $('#gmkb-test-result');

                    $button.prop('disabled', true).text('Testing...');
                    $result.html('');

                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'gmkb_test_openai_connection',
                            nonce: '<?php echo wp_create_nonce('gmkb_ai_settings_nonce'); ?>'
                        },
                        success: function(response) {
                            var color = response.success ? '#28a745' : '#dc3545';
                            var icon = response.success ? '&#10004; ' : '&#10008; ';
                            $result.empty()
                                .append($('<span>').css('color', color).html(icon))
                                .append(document.createTextNode(response.data.message));
                        },
                        error: function() {
                            $result.empty()
                                .append($('<span>').css('color', '#dc3545').html('&#10008; '))
                                .append(document.createTextNode('Request failed. Please check your browser console for details.'));
                        },
                        complete: function() {
                            $button.prop('disabled', false).text('Test Connection');
                        }
                    });
                });
            });
            </script>
        </div>
        <?php
    }
}

// Initialize
GMKB_AI_Settings_Admin::init();
