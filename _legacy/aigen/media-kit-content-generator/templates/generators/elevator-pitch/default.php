<?php
/**
 * Elevator Pitch Generator Template
 * @version 1.0
 */

if (!defined('ABSPATH')) exit;

do_action('mkcg_shortcode_detected', 'mkcg_elevator_pitch');
do_action('mkcg_generator_loaded', 'elevator_pitch');

$template_data = [];
$post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;

if (isset($generator_instance) && method_exists($generator_instance, 'get_template_data')) {
    $template_data = $generator_instance->get_template_data();
} else {
    // Minimal data loading
    $template_data = [
        'post_id' => $post_id,
        'has_data' => false,
        'pitches' => ['30s' => '', '60s' => '', '2min' => '', '5min' => ''],
        'settings' => ['context' => 'networking', 'tone' => 'professional'],
        'personal_info' => ['name' => '', 'title' => '', 'organization' => '']
    ];
}

$js_data = [
    'postId' => $template_data['post_id'],
    'hasData' => $template_data['has_data'] ?? false,
    'noEntryParam' => !isset($_GET['entry']),
    'pitchData' => $template_data
];
?>

<script>
window.MKCG_ElevatorPitch_Data = <?php echo wp_json_encode($js_data); ?>;
</script>

<div class="generator__container elevator-pitch-generator" data-generator="elevator-pitch">
    <div class="generator__header elevator-pitch-generator__header">
        <h1 class="generator__title elevator-pitch-generator__title">Elevator Pitch Generator</h1>
        <p class="generator__subtitle elevator-pitch-generator__subtitle">Create compelling elevator pitches in 4 lengths for any context</p>
    </div>

    <div class="generator__content elevator-pitch-generator__content">
        <input type="hidden" id="elevator-pitch-nonce" value="<?php echo wp_create_nonce('mkcg_nonce'); ?>" />

        <div class="elevator-pitch-generator__panel-layout">
            <div class="elevator-pitch-generator__panel--left">
                
                <!-- Personal Information -->
                <div class="elevator-pitch-generator__section">
                    <h3 class="elevator-pitch-generator__section-title">Personal Information</h3>
                    <div class="elevator-pitch-generator__field">
                        <label for="elevator-pitch-name" class="elevator-pitch-generator__label">Full Name *</label>
                        <input type="text" id="elevator-pitch-name" class="elevator-pitch-generator__input" placeholder="Enter name" value="<?php echo esc_attr($template_data['personal_info']['name'] ?? ''); ?>" required />
                    </div>
                    <div class="elevator-pitch-generator__field">
                        <label for="elevator-pitch-title" class="elevator-pitch-generator__label">Title</label>
                        <input type="text" id="elevator-pitch-title" class="elevator-pitch-generator__input" placeholder="Professional title" value="<?php echo esc_attr($template_data['personal_info']['title'] ?? ''); ?>" />
                    </div>
                    <div class="elevator-pitch-generator__field">
                        <label for="elevator-pitch-organization" class="elevator-pitch-generator__label">Organization</label>
                        <input type="text" id="elevator-pitch-organization" class="elevator-pitch-generator__input" placeholder="Company name" value="<?php echo esc_attr($template_data['personal_info']['organization'] ?? ''); ?>" />
                    </div>
                </div>

                <!-- Authority Hook Integration -->
                <div class="elevator-pitch-generator__section">
                    <h3 class="elevator-pitch-generator__section-title">Authority Hook (Optional)</h3>
                    <button type="button" id="elevator-pitch-authority-hook-toggle" class="elevator-pitch-generator__button elevator-pitch-generator__button--outline">Show Authority Hook Builder</button>
                    <div id="elevator-pitch-authority-hook-builder" class="generator__builder generator__builder--hidden elevator-pitch-generator__builder">
                        <?php
                        if (class_exists('MKCG_Authority_Hook_Service') && isset($GLOBALS['authority_hook_service'])) {
                            echo $GLOBALS['authority_hook_service']->render_builder_interface('elevator-pitch');
                        }
                        ?>
                        <div style="margin-top: 15px; text-align: right;">
                            <button type="button" id="collect-elevator-pitch-authority-hook" class="generator__button generator__button--outline">Collect Authority Hook Data</button>
                        </div>
                    </div>
                </div>

                <!-- Impact Intro Integration -->
                <div class="elevator-pitch-generator__section">
                    <h3 class="elevator-pitch-generator__section-title">Impact Intro (Optional)</h3>
                    <button type="button" id="elevator-pitch-impact-intro-toggle" class="elevator-pitch-generator__button elevator-pitch-generator__button--outline">Show Impact Intro Builder</button>
                    <div id="elevator-pitch-impact-intro-builder" class="generator__builder generator__builder--hidden elevator-pitch-generator__builder">
                        <?php
                        if (class_exists('MKCG_Impact_Intro_Service') && isset($GLOBALS['impact_intro_service'])) {
                            echo $GLOBALS['impact_intro_service']->render_builder_interface('elevator-pitch');
                        }
                        ?>
                        <div style="margin-top: 15px; text-align: right;">
                            <button type="button" id="collect-elevator-pitch-impact-intro" class="generator__button generator__button--outline">Collect Impact Intro Data</button>
                        </div>
                    </div>
                </div>

                <!-- Additional Context -->
                <div class="elevator-pitch-generator__section">
                    <h3 class="elevator-pitch-generator__section-title">Additional Context</h3>
                    <div class="elevator-pitch-generator__field">
                        <label class="elevator-pitch-generator__label">Value Proposition</label>
                        <textarea id="elevator-pitch-value-proposition" class="elevator-pitch-generator__textarea" placeholder="What unique value do you provide?" rows="3"></textarea>
                    </div>
                    <div class="elevator-pitch-generator__field">
                        <label class="elevator-pitch-generator__label">Target Audience</label>
                        <textarea id="elevator-pitch-target-audience" class="elevator-pitch-generator__textarea" placeholder="Who do you serve?" rows="2"></textarea>
                    </div>
                    <div class="elevator-pitch-generator__field">
                        <label class="elevator-pitch-generator__label">Unique Benefit</label>
                        <textarea id="elevator-pitch-unique-benefit" class="elevator-pitch-generator__textarea" placeholder="What makes you different?" rows="2"></textarea>
                    </div>
                    <div class="elevator-pitch-generator__field">
                        <label class="elevator-pitch-generator__label">Call to Action</label>
                        <input type="text" id="elevator-pitch-call-to-action" class="elevator-pitch-generator__input" placeholder="What should people do next?" />
                    </div>
                </div>

                <!-- Settings -->
                <div class="elevator-pitch-generator__section">
                    <h3 class="elevator-pitch-generator__section-title">Pitch Settings</h3>
                    <div class="elevator-pitch-generator__settings">
                        <div class="elevator-pitch-generator__field">
                            <label class="elevator-pitch-generator__label">Context</label>
                            <select id="elevator-pitch-context" class="elevator-pitch-generator__select">
                                <option value="networking">Networking Event</option>
                                <option value="virtual">Virtual Meeting</option>
                                <option value="conference">Conference</option>
                                <option value="email">Email Introduction</option>
                                <option value="media">Media Interview</option>
                            </select>
                        </div>
                        <div class="elevator-pitch-generator__field">
                            <label class="elevator-pitch-generator__label">Tone</label>
                            <select id="elevator-pitch-tone" class="elevator-pitch-generator__select">
                                <option value="professional">Professional</option>
                                <option value="conversational">Conversational</option>
                                <option value="energetic">Energetic</option>
                                <option value="authoritative">Authoritative</option>
                            </select>
                        </div>
                    </div>
                </div>

                <!-- Generate Button -->
                <div class="elevator-pitch-generator__section" style="text-align: center;">
                    <button type="button" id="generate-elevator-pitches-btn" class="elevator-pitch-generator__button">Generate Elevator Pitches</button>
                    <div id="elevator-pitch-loader" class="elevator-pitch-loader" style="display: none;">
                        <div class="elevator-pitch-loader__spinner"></div>
                        <p class="elevator-pitch-loader__text">Generating your elevator pitches...</p>
                    </div>
                </div>

            </div>

            <!-- RIGHT PANEL - Guidance -->
            <div class="elevator-pitch-generator__panel--right">
                <div class="elevator-pitch-generator__guidance">
                    <h4 class="elevator-pitch-generator__guidance-title">What is an Elevator Pitch?</h4>
                    <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
                        A concise, compelling introduction that clearly communicates who you are, what you do, and why it matters.
                    </p>

                    <h4 class="elevator-pitch-generator__guidance-title">Best Practices</h4>
                    <ul class="elevator-pitch-generator__guidance-list">
                        <li class="elevator-pitch-generator__guidance-item">Start with a hook that grabs attention</li>
                        <li class="elevator-pitch-generator__guidance-item">Clearly articulate the problem you solve</li>
                        <li class="elevator-pitch-generator__guidance-item">Highlight your unique approach</li>
                        <li class="elevator-pitch-generator__guidance-item">Include credibility markers</li>
                        <li class="elevator-pitch-generator__guidance-item">End with a clear call to action</li>
                    </ul>

                    <h4 class="elevator-pitch-generator__guidance-title">Four Lengths Generated</h4>
                    <ul class="elevator-pitch-generator__guidance-list">
                        <li class="elevator-pitch-generator__guidance-item">30 seconds (~75 words) - Quick intro</li>
                        <li class="elevator-pitch-generator__guidance-item">60 seconds (~150 words) - Standard pitch</li>
                        <li class="elevator-pitch-generator__guidance-item">2 minutes (~300 words) - Detailed version</li>
                        <li class="elevator-pitch-generator__guidance-item">5 minutes (~750 words) - Full narrative</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Results Section -->
        <div id="elevator-pitch-results-section" class="elevator-pitch-results-section" style="display: none;">
            <h2 style="text-align: center; margin-bottom: 30px;">Your Elevator Pitches</h2>
            <div id="elevator-pitch-results-container"></div>
        </div>

        <div style="margin-top: 20px; text-align: center; color: #6c757d; font-size: 14px;">
            <p id="elevator-pitch-summary">Ready to generate pitches</p>
        </div>
    </div>
</div>
