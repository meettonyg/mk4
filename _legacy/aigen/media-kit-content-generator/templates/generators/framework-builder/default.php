<?php
if (!defined('ABSPATH')) exit;

do_action('mkcg_shortcode_detected', 'mkcg_framework_builder');
do_action('mkcg_generator_loaded', 'framework_builder');

$template_data = [];
$post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;

if (isset($generator_instance) && method_exists($generator_instance, 'get_template_data')) {
    $template_data = $generator_instance->get_template_data();
} else {
    $template_data = [
        'post_id' => $post_id,
        'has_data' => false,
        'framework_names' => [],
        'framework_steps' => [],
        'settings' => ['framework_type' => 'process', 'step_count' => 5]
    ];
}

$js_data = [
    'postId' => $template_data['post_id'],
    'hasData' => $template_data['has_data'] ?? false,
    'noEntryParam' => !isset($_GET['entry']),
    'frameworkData' => $template_data
];
?>

<script>
window.MKCG_Framework_Data = <?php echo wp_json_encode($js_data); ?>;
</script>

<div class="generator__container framework-builder-generator">
    <div class="generator__header framework-builder-generator__header">
        <h1 class="generator__title framework-builder-generator__title">Signature Framework Builder</h1>
        <p class="generator__subtitle">Create your branded methodology and step-by-step process</p>
    </div>

    <div class="generator__content framework-builder-generator__content">
        <input type="hidden" id="framework-nonce" value="<?php echo wp_create_nonce('mkcg_nonce'); ?>" />

        <div class="framework-builder-generator__panel-layout">
            <div class="framework-builder-generator__panel--left">
                
                <div class="framework-builder-generator__section">
                    <h3 class="framework-builder-generator__section-title">Basic Information</h3>
                    <div class="framework-builder-generator__field">
                        <label class="framework-builder-generator__label">Your Name *</label>
                        <input type="text" id="framework-name" class="framework-builder-generator__input" placeholder="Enter name" required />
                    </div>
                    <div class="framework-builder-generator__field">
                        <label class="framework-builder-generator__label">Title</label>
                        <input type="text" id="framework-title" class="framework-builder-generator__input" placeholder="Professional title" />
                    </div>
                    <div class="framework-builder-generator__field">
                        <label class="framework-builder-generator__label">Expertise Area</label>
                        <textarea id="framework-expertise-area" class="framework-builder-generator__textarea" placeholder="What is your main area of expertise?" rows="3"></textarea>
                    </div>
                </div>

                <div class="framework-builder-generator__section">
                    <h3 class="framework-builder-generator__section-title">Authority Hook (Optional)</h3>
                    <button type="button" id="framework-authority-hook-toggle" class="framework-builder-generator__button framework-builder-generator__button--outline">Show Authority Hook Builder</button>
                    <div id="framework-authority-hook-builder" class="generator__builder generator__builder--hidden framework-builder-generator__builder">
                        <?php
                        if (class_exists('MKCG_Authority_Hook_Service') && isset($GLOBALS['authority_hook_service'])) {
                            echo $GLOBALS['authority_hook_service']->render_builder_interface('framework-builder');
                        }
                        ?>
                        <div style="margin-top: 15px; text-align: right;">
                            <button type="button" id="collect-framework-authority-hook" class="generator__button generator__button--outline">Collect Authority Hook</button>
                        </div>
                    </div>
                </div>

                <div class="framework-builder-generator__section">
                    <h3 class="framework-builder-generator__section-title">Framework Settings</h3>
                    <div class="framework-builder-generator__field">
                        <label class="framework-builder-generator__label">Framework Type</label>
                        <select id="framework-type" class="framework-builder-generator__select">
                            <option value="process">Process/Method</option>
                            <option value="system">System/Model</option>
                            <option value="pillars">Pillars/Principles</option>
                            <option value="steps">Step-by-Step Guide</option>
                        </select>
                    </div>
                    <div class="framework-builder-generator__field">
                        <label class="framework-builder-generator__label">Number of Steps</label>
                        <select id="framework-step-count" class="framework-builder-generator__select">
                            <option value="3">3 Steps</option>
                            <option value="4">4 Steps</option>
                            <option value="5" selected>5 Steps</option>
                            <option value="6">6 Steps</option>
                            <option value="7">7 Steps</option>
                        </select>
                    </div>
                </div>

                <div class="framework-builder-generator__section" style="text-align: center;">
                    <button type="button" id="generate-framework-btn" class="framework-builder-generator__button">Generate Framework</button>
                    <div id="framework-loader" class="framework-loader" style="display: none;">
                        <div class="framework-loader__spinner"></div>
                        <p>Generating your signature framework...</p>
                    </div>
                </div>

            </div>

            <div class="framework-builder-generator__panel--right">
                <div style="background: #f8f9fa; border-radius: 8px; padding: 20px;">
                    <h4 style="font-size: 16px; font-weight: 700; color: #2c3e50; margin-bottom: 12px;">What You'll Get</h4>
                    <ul style="list-style: none; padding: 0; margin: 0;">
                        <li style="padding: 8px 0; color: #495057; font-size: 14px;">→ 5 framework name options</li>
                        <li style="padding: 8px 0; color: #495057; font-size: 14px;">→ Complete step-by-step process</li>
                        <li style="padding: 8px 0; color: #495057; font-size: 14px;">→ Descriptions for each step</li>
                        <li style="padding: 8px 0; color: #495057; font-size: 14px;">→ Professional methodology</li>
                    </ul>
                </div>
            </div>
        </div>

        <div id="framework-results-section" class="framework-results-section" style="display: none;">
            <h2 style="text-align: center; margin-bottom: 30px;">Your Signature Framework</h2>
            
            <h3 style="margin-bottom: 20px;">Framework Names (Select One)</h3>
            <div id="framework-names-container"></div>

            <h3 style="margin-top: 40px; margin-bottom: 20px;">Framework Steps</h3>
            <div id="framework-steps-container"></div>
        </div>
    </div>
</div>
