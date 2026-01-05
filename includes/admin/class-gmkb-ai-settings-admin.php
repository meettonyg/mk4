<?php
/**
 * AI Settings Admin Page
 *
 * Admin interface for managing AI provider settings with support for
 * multiple providers (OpenAI, Google Gemini, Anthropic Claude).
 *
 * @package GMKB
 * @since 3.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_AI_Settings_Admin {

    /**
     * Option names
     */
    const OPTION_PROVIDER = 'gmkb_ai_provider';
    const OPTION_MODEL = 'gmkb_ai_model';
    const OPTION_OPENAI_KEY = 'gmkb_openai_api_key';
    const OPTION_GEMINI_KEY = 'gmkb_gemini_api_key';
    const OPTION_ANTHROPIC_KEY = 'gmkb_anthropic_api_key';

    /**
     * Available providers and their models
     */
    private static function get_providers(): array {
        return [
            'openai' => [
                'name' => 'OpenAI',
                'models' => [
                    'gpt-4o' => 'GPT-4o (Latest)',
                    'gpt-4o-mini' => 'GPT-4o Mini (Fast & Cheap)',
                    'gpt-4-turbo' => 'GPT-4 Turbo',
                    'gpt-3.5-turbo' => 'GPT-3.5 Turbo (Legacy)',
                ],
                'default_model' => 'gpt-4o-mini',
                'key_option' => self::OPTION_OPENAI_KEY,
                'key_placeholder' => 'sk-...',
                'docs_url' => 'https://platform.openai.com/api-keys',
            ],
            'gemini' => [
                'name' => 'Google Gemini',
                'models' => [
                    'gemini-1.5-pro' => 'Gemini 1.5 Pro',
                    'gemini-1.5-flash' => 'Gemini 1.5 Flash (Fast)',
                    'gemini-1.0-pro' => 'Gemini 1.0 Pro',
                ],
                'default_model' => 'gemini-1.5-flash',
                'key_option' => self::OPTION_GEMINI_KEY,
                'key_placeholder' => 'AIza...',
                'docs_url' => 'https://aistudio.google.com/app/apikey',
            ],
            'anthropic' => [
                'name' => 'Anthropic Claude',
                'models' => [
                    'claude-sonnet-4-20250514' => 'Claude Sonnet 4 (Latest)',
                    'claude-3-5-sonnet-20241022' => 'Claude 3.5 Sonnet',
                    'claude-3-5-haiku-20241022' => 'Claude 3.5 Haiku (Fast)',
                    'claude-3-opus-20240229' => 'Claude 3 Opus',
                ],
                'default_model' => 'claude-3-5-sonnet-20241022',
                'key_option' => self::OPTION_ANTHROPIC_KEY,
                'key_placeholder' => 'sk-ant-...',
                'docs_url' => 'https://console.anthropic.com/settings/keys',
            ],
        ];
    }

    /**
     * Initialize admin hooks
     */
    public static function init(): void {
        add_action('admin_menu', [__CLASS__, 'register_admin_menu']);
        add_action('admin_init', [__CLASS__, 'register_settings']);
        add_action('wp_ajax_gmkb_test_ai_connection', [__CLASS__, 'ajax_test_connection']);
    }

    /**
     * Register admin menu item
     */
    public static function register_admin_menu(): void {
        add_submenu_page(
            'edit.php?post_type=guests',
            'AI Settings',
            'AI Settings',
            'manage_options',
            'gmkb-ai-settings',
            [__CLASS__, 'render_admin_page']
        );
    }

    /**
     * Register settings
     */
    public static function register_settings(): void {
        // Provider selection
        register_setting('gmkb_ai_settings', self::OPTION_PROVIDER, [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'openai',
        ]);

        // Model selection
        register_setting('gmkb_ai_settings', self::OPTION_MODEL, [
            'type' => 'string',
            'sanitize_callback' => 'sanitize_text_field',
            'default' => 'gpt-4o-mini',
        ]);

        // API Keys for each provider
        foreach (self::get_providers() as $provider_id => $provider) {
            register_setting('gmkb_ai_settings', $provider['key_option'], [
                'type' => 'string',
                'sanitize_callback' => 'sanitize_text_field',
                'default' => '',
            ]);
        }
    }

    /**
     * Get current provider
     */
    public static function get_current_provider(): string {
        return get_option(self::OPTION_PROVIDER, 'openai');
    }

    /**
     * Get current model
     */
    public static function get_current_model(): string {
        return get_option(self::OPTION_MODEL, 'gpt-4o-mini');
    }

    /**
     * Get API key for a provider
     */
    public static function get_api_key(string $provider = null): string {
        if ($provider === null) {
            $provider = self::get_current_provider();
        }

        $providers = self::get_providers();
        if (!isset($providers[$provider])) {
            return '';
        }

        // Check for legacy constant (OpenAI only)
        if ($provider === 'openai' && defined('OPENAI_API_KEY') && !empty(OPENAI_API_KEY)) {
            return OPENAI_API_KEY;
        }

        return get_option($providers[$provider]['key_option'], '');
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
     * AJAX handler for testing connection
     */
    public static function ajax_test_connection(): void {
        check_ajax_referer('gmkb_ai_settings_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Permission denied.']);
            return;
        }

        $provider = isset($_POST['provider']) ? sanitize_text_field($_POST['provider']) : self::get_current_provider();
        $providers = self::get_providers();

        if (!isset($providers[$provider])) {
            wp_send_json_error(['message' => 'Invalid provider.']);
            return;
        }

        $api_key = self::get_api_key($provider);

        if (empty($api_key)) {
            wp_send_json_error(['message' => 'No API key configured for ' . $providers[$provider]['name'] . '.']);
            return;
        }

        $result = self::test_provider_connection($provider, $api_key);

        if ($result['success']) {
            wp_send_json_success($result);
        } else {
            wp_send_json_error($result);
        }
    }

    /**
     * Test connection for a specific provider
     */
    private static function test_provider_connection(string $provider, string $api_key): array {
        switch ($provider) {
            case 'openai':
                return self::test_openai($api_key);
            case 'gemini':
                return self::test_gemini($api_key);
            case 'anthropic':
                return self::test_anthropic($api_key);
            default:
                return ['success' => false, 'message' => 'Unknown provider.'];
        }
    }

    /**
     * Test OpenAI connection
     */
    private static function test_openai(string $api_key): array {
        $response = wp_remote_post('https://api.openai.com/v1/chat/completions', [
            'headers' => [
                'Authorization' => 'Bearer ' . $api_key,
                'Content-Type' => 'application/json',
            ],
            'body' => wp_json_encode([
                'model' => 'gpt-4o-mini',
                'messages' => [['role' => 'user', 'content' => 'Say OK']],
                'max_tokens' => 5
            ]),
            'timeout' => 15,
        ]);

        return self::parse_test_response($response, 'OpenAI');
    }

    /**
     * Test Gemini connection
     */
    private static function test_gemini(string $api_key): array {
        $url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=' . $api_key;

        $response = wp_remote_post($url, [
            'headers' => ['Content-Type' => 'application/json'],
            'body' => wp_json_encode([
                'contents' => [['parts' => [['text' => 'Say OK']]]]
            ]),
            'timeout' => 15,
        ]);

        return self::parse_test_response($response, 'Gemini');
    }

    /**
     * Test Anthropic connection
     */
    private static function test_anthropic(string $api_key): array {
        $response = wp_remote_post('https://api.anthropic.com/v1/messages', [
            'headers' => [
                'x-api-key' => $api_key,
                'Content-Type' => 'application/json',
                'anthropic-version' => '2023-06-01',
            ],
            'body' => wp_json_encode([
                'model' => 'claude-3-5-haiku-20241022',
                'max_tokens' => 10,
                'messages' => [['role' => 'user', 'content' => 'Say OK']]
            ]),
            'timeout' => 15,
        ]);

        return self::parse_test_response($response, 'Anthropic');
    }

    /**
     * Parse test response
     */
    private static function parse_test_response($response, string $provider_name): array {
        if (is_wp_error($response)) {
            return [
                'success' => false,
                'message' => 'Connection failed: ' . $response->get_error_message()
            ];
        }

        $code = wp_remote_retrieve_response_code($response);
        $body = json_decode(wp_remote_retrieve_body($response), true);

        if ($code === 200) {
            return [
                'success' => true,
                'message' => $provider_name . ' connection successful!'
            ];
        }

        $error = $body['error']['message'] ?? $body['error']['message'] ?? 'Unknown error (code: ' . $code . ')';
        return [
            'success' => false,
            'message' => $provider_name . ' error: ' . $error
        ];
    }

    /**
     * Render the admin page
     */
    public static function render_admin_page(): void {
        if (!current_user_can('manage_options')) {
            wp_die('You do not have sufficient permissions to access this page.');
        }

        $providers = self::get_providers();
        $current_provider = self::get_current_provider();
        $current_model = self::get_current_model();

        ?>
        <div class="wrap">
            <h1><?php echo esc_html(get_admin_page_title()); ?></h1>

            <form method="post" action="options.php">
                <?php settings_fields('gmkb_ai_settings'); ?>

                <h2>AI Provider</h2>
                <p>Select your preferred AI provider for content generation.</p>

                <table class="form-table">
                    <tr>
                        <th scope="row">Active Provider</th>
                        <td>
                            <select name="<?php echo esc_attr(self::OPTION_PROVIDER); ?>" id="gmkb-ai-provider">
                                <?php foreach ($providers as $id => $provider): ?>
                                    <option value="<?php echo esc_attr($id); ?>" <?php selected($current_provider, $id); ?>>
                                        <?php echo esc_html($provider['name']); ?>
                                    </option>
                                <?php endforeach; ?>
                            </select>
                        </td>
                    </tr>
                    <tr>
                        <th scope="row">Model</th>
                        <td>
                            <select name="<?php echo esc_attr(self::OPTION_MODEL); ?>" id="gmkb-ai-model">
                                <?php foreach ($providers as $provider_id => $provider): ?>
                                    <?php foreach ($provider['models'] as $model_id => $model_name): ?>
                                        <option
                                            value="<?php echo esc_attr($model_id); ?>"
                                            data-provider="<?php echo esc_attr($provider_id); ?>"
                                            <?php selected($current_model, $model_id); ?>
                                            <?php echo $provider_id !== $current_provider ? 'style="display:none;"' : ''; ?>
                                        >
                                            <?php echo esc_html($model_name); ?>
                                        </option>
                                    <?php endforeach; ?>
                                <?php endforeach; ?>
                            </select>
                        </td>
                    </tr>
                </table>

                <hr />

                <h2>API Keys</h2>
                <p>Configure API keys for each provider. Only the active provider's key is required.</p>

                <?php
                // Show legacy constant notice for OpenAI
                if (defined('OPENAI_API_KEY') && !empty(OPENAI_API_KEY)):
                ?>
                    <div class="notice notice-warning inline" style="margin: 10px 0;">
                        <p><strong>Legacy Configuration Detected:</strong> OpenAI API key is set via <code>OPENAI_API_KEY</code> constant.
                        You can remove it from wp-config.php and manage the key here instead.</p>
                    </div>
                <?php endif; ?>

                <table class="form-table">
                    <?php foreach ($providers as $id => $provider):
                        $key = get_option($provider['key_option'], '');
                        $is_legacy = ($id === 'openai' && defined('OPENAI_API_KEY') && !empty(OPENAI_API_KEY));
                        $display_key = $is_legacy ? self::mask_api_key(OPENAI_API_KEY) : self::mask_api_key($key);
                    ?>
                    <tr class="gmkb-provider-key" data-provider="<?php echo esc_attr($id); ?>">
                        <th scope="row">
                            <?php echo esc_html($provider['name']); ?> API Key
                            <?php if ($id === $current_provider): ?>
                                <span style="color: #2271b1; font-weight: normal;">(active)</span>
                            <?php endif; ?>
                        </th>
                        <td>
                            <input
                                type="password"
                                name="<?php echo esc_attr($provider['key_option']); ?>"
                                id="<?php echo esc_attr($provider['key_option']); ?>"
                                value="<?php echo esc_attr($key); ?>"
                                class="regular-text"
                                placeholder="<?php echo esc_attr($provider['key_placeholder']); ?>"
                                autocomplete="off"
                                <?php echo $is_legacy ? 'disabled' : ''; ?>
                            />
                            <button type="button" class="button" onclick="toggleKeyVisibility('<?php echo esc_js($provider['key_option']); ?>')">
                                Show/Hide
                            </button>
                            <button type="button" class="button gmkb-test-provider" data-provider="<?php echo esc_attr($id); ?>">
                                Test
                            </button>
                            <span class="gmkb-test-result" data-provider="<?php echo esc_attr($id); ?>"></span>
                            <p class="description">
                                <?php if ($is_legacy): ?>
                                    Using constant: <code><?php echo esc_html($display_key); ?></code>
                                <?php elseif (!empty($key)): ?>
                                    Configured: <code><?php echo esc_html($display_key); ?></code>
                                <?php else: ?>
                                    <a href="<?php echo esc_url($provider['docs_url']); ?>" target="_blank">Get API key</a>
                                <?php endif; ?>
                            </p>
                        </td>
                    </tr>
                    <?php endforeach; ?>
                </table>

                <?php submit_button('Save Settings'); ?>
            </form>

            <hr />

            <h2>Rate Limits</h2>
            <table class="widefat" style="max-width: 500px;">
                <tbody>
                    <tr>
                        <th>Public (anonymous)</th>
                        <td>3 generations per hour (per IP)</td>
                    </tr>
                    <tr>
                        <th>Authenticated users</th>
                        <td>10 generations per hour (per user)</td>
                    </tr>
                </tbody>
            </table>

            <script>
            function toggleKeyVisibility(fieldId) {
                var input = document.getElementById(fieldId);
                input.type = input.type === 'password' ? 'text' : 'password';
            }

            jQuery(document).ready(function($) {
                // Update model dropdown when provider changes
                $('#gmkb-ai-provider').on('change', function() {
                    var provider = $(this).val();
                    var $modelSelect = $('#gmkb-ai-model');

                    $modelSelect.find('option').hide();
                    $modelSelect.find('option[data-provider="' + provider + '"]').show();

                    // Select first visible option
                    var $firstVisible = $modelSelect.find('option[data-provider="' + provider + '"]:first');
                    if ($firstVisible.length) {
                        $modelSelect.val($firstVisible.val());
                    }
                });

                // Test provider connection
                $('.gmkb-test-provider').on('click', function() {
                    var $button = $(this);
                    var provider = $button.data('provider');
                    var $result = $('.gmkb-test-result[data-provider="' + provider + '"]');

                    $button.prop('disabled', true).text('Testing...');
                    $result.html('');

                    $.ajax({
                        url: ajaxurl,
                        type: 'POST',
                        data: {
                            action: 'gmkb_test_ai_connection',
                            provider: provider,
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
                                .append(document.createTextNode('Request failed.'));
                        },
                        complete: function() {
                            $button.prop('disabled', false).text('Test');
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
