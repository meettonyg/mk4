<?php
/**
 * Persona Generator Template - Unified BEM Architecture
 * Following established generator patterns with two-panel layout
 *
 * @version 1.0
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Trigger asset loading for templates accessed directly
do_action('mkcg_shortcode_detected', 'mkcg_persona');
do_action('mkcg_generator_loaded', 'persona');

// Comprehensive data loading following established pattern
$template_data = [];
$debug_info = [];

// Primary Method: Try to get data from generator instance
if (isset($generator_instance) && method_exists($generator_instance, 'get_template_data')) {
    $template_data = $generator_instance->get_template_data();
    $debug_info[] = '✅ Got data from generator instance';
    error_log('MKCG Persona Template: Got data from generator instance');
} else {
    $debug_info[] = '⚠️ Generator instance not available';

    // Try to get post ID from various sources
    $post_id = 0;
    if (isset($_GET['post_id']) && intval($_GET['post_id']) > 0) {
        $post_id = intval($_GET['post_id']);
        $debug_info[] = "📍 Using post_id from URL: {$post_id}";
    } else if (isset($_GET['entry']) && intval($_GET['entry']) > 0) {
        $post_id = intval($_GET['entry']);
        $debug_info[] = "📍 Using entry from URL: {$post_id}";
    } else {
        // Get the most recent guest post for testing
        $recent_guest = get_posts([
            'post_type' => 'guests',
            'post_status' => 'publish',
            'numberposts' => 1,
            'orderby' => 'date',
            'order' => 'DESC'
        ]);
        if (!empty($recent_guest)) {
            $post_id = $recent_guest[0]->ID;
            $debug_info[] = "🎯 Using most recent guest post: {$post_id}";
        }
    }

    if ($post_id > 0) {
        // Load Authority Hook and Impact Intro data using services
        $authority_hook_components = [];
        $impact_intro_components = [];

        // Load Authority Hook data
        if (class_exists('MKCG_Authority_Hook_Service')) {
            try {
                $authority_hook_service = new MKCG_Authority_Hook_Service();
                $authority_hook_data = $authority_hook_service->get_authority_hook_data($post_id);

                if (!empty($authority_hook_data)) {
                    $authority_hook_components = [
                        'who' => $authority_hook_data['components']['who'] ?? '',
                        'what' => $authority_hook_data['components']['what'] ?? '',
                        'when' => $authority_hook_data['components']['when'] ?? '',
                        'how' => $authority_hook_data['components']['how'] ?? '',
                        'complete' => $authority_hook_data['complete'] ?? ''
                    ];
                    $debug_info[] = "✅ Authority Hook loaded: " . strlen($authority_hook_components['complete']) . " chars";
                } else {
                    $debug_info[] = "⚠️ Authority Hook service returned empty data";
                }
            } catch (Exception $e) {
                $debug_info[] = "❌ Authority Hook service error: " . $e->getMessage();
            }
        }

        // Load Impact Intro data
        if (class_exists('MKCG_Impact_Intro_Service')) {
            try {
                $impact_intro_service = new MKCG_Impact_Intro_Service();
                $impact_intro_data = $impact_intro_service->get_impact_intro_data($post_id);

                if (!empty($impact_intro_data)) {
                    $impact_intro_components = [
                        'where' => $impact_intro_data['components']['where'] ?? '',
                        'why' => $impact_intro_data['components']['why'] ?? '',
                        'complete' => $impact_intro_data['complete'] ?? ''
                    ];
                    $debug_info[] = "✅ Impact Intro loaded: " . strlen($impact_intro_components['complete']) . " chars";
                } else {
                    $debug_info[] = "⚠️ Impact Intro service returned empty data";
                }
            } catch (Exception $e) {
                $debug_info[] = "❌ Impact Intro service error: " . $e->getMessage();
            }
        }

        // Load persona-specific data
        $persona_data = [
            'selected_persona' => get_post_meta($post_id, '_persona_selected', true),
            'generated_personas' => get_post_meta($post_id, '_persona_options', true) ?: [],
            'style' => get_post_meta($post_id, '_persona_style', true) ?: 'strategic',
            'focus' => get_post_meta($post_id, '_persona_focus', true) ?: 'expertise',
            'depth' => get_post_meta($post_id, '_persona_depth', true) ?: 'comprehensive'
        ];

        $additional_context = [
            'industry' => get_post_meta($post_id, '_guest_industry', true),
            'unique_factors' => get_post_meta($post_id, '_persona_unique_factors', true),
            'additional_notes' => get_post_meta($post_id, '_persona_additional_notes', true)
        ];

        $personal_info = [
            'name' => get_post_meta($post_id, '_guest_name', true) ?: get_the_title($post_id),
            'title' => get_post_meta($post_id, '_guest_title', true),
            'organization' => get_post_meta($post_id, '_guest_company', true)
        ];

        $template_data = [
            'post_id' => $post_id,
            'authority_hook_components' => $authority_hook_components,
            'impact_intro_components' => $impact_intro_components,
            'persona_data' => $persona_data,
            'additional_context' => $additional_context,
            'personal_info' => $personal_info,
            'has_data' => !empty($authority_hook_components['complete']) || !empty($impact_intro_components['complete'])
        ];

        $debug_info[] = "✅ Template data loaded for post {$post_id}";

    } else {
        $debug_info[] = "❌ No valid post ID found";

        // Create empty structure when no data found
        $template_data = [
            'post_id' => 0,
            'authority_hook_components' => [
                'who' => '',
                'what' => '',
                'when' => '',
                'how' => '',
                'complete' => ''
            ],
            'impact_intro_components' => [
                'where' => '',
                'why' => '',
                'complete' => ''
            ],
            'persona_data' => [
                'selected_persona' => '',
                'generated_personas' => [],
                'style' => 'strategic',
                'focus' => 'expertise',
                'depth' => 'comprehensive'
            ],
            'additional_context' => [
                'industry' => '',
                'unique_factors' => '',
                'additional_notes' => ''
            ],
            'personal_info' => [
                'name' => '',
                'title' => '',
                'organization' => ''
            ],
            'has_data' => false
        ];
    }

    error_log('MKCG Persona Template: ' . implode(' | ', $debug_info));
}

// Extract data for easier access in template
$post_id = $template_data['post_id'];
$authority_hook_components = $template_data['authority_hook_components'] ?? [];
$impact_intro_components = $template_data['impact_intro_components'] ?? [];
$persona_data = $template_data['persona_data'] ?? [];
$additional_context = $template_data['additional_context'] ?? [];
$personal_info = $template_data['personal_info'] ?? [];
$has_data = $template_data['has_data'] ?? false;

// Debug logging
error_log('MKCG Persona Template: Authority Hook Complete: ' . ($authority_hook_components['complete'] ?? 'EMPTY'));
error_log('MKCG Persona Template: Impact Intro Complete: ' . ($impact_intro_components['complete'] ?? 'EMPTY'));
error_log('MKCG Persona Template: Has Data: ' . ($has_data ? 'true' : 'false'));

// Prepare data for JavaScript
$js_data = [
    'postId' => $post_id,
    'hasData' => $has_data,
    'noEntryParam' => !isset($_GET['entry']),
    'authorityHook' => $authority_hook_components,
    'impactIntro' => $impact_intro_components,
    'personaData' => $persona_data,
    'additionalContext' => $additional_context,
    'personalInfo' => $personal_info
];
?>

<script>
window.MKCG_Persona_Data = <?php echo wp_json_encode($js_data); ?>;
console.log('📊 Persona Data Available:', window.MKCG_Persona_Data);
</script>

<div class="generator__container persona-generator" data-generator="persona">
    <div class="generator__header persona-generator__header">
        <h1 class="generator__title persona-generator__title">Professional Persona Generator</h1>
        <p class="generator__subtitle persona-generator__subtitle">Create compelling professional personas that define how you want to be perceived in your industry</p>
    </div>

    <div class="generator__content persona-generator__content">
        <!-- Nonce field -->
        <input type="hidden" id="persona-nonce" value="<?php echo wp_create_nonce('mkcg_nonce'); ?>" />

        <!-- TWO-PANEL LAYOUT -->
        <div class="persona-generator__panel-layout">
            <!-- LEFT PANEL - Main Input Area -->
            <div class="persona-generator__panel--left">

                <!-- Personal Information Section -->
                <div class="persona-generator__section">
                    <h3 class="persona-generator__section-title">Personal Information</h3>

                    <div class="persona-generator__field">
                        <label for="persona-name" class="persona-generator__label">Full Name *</label>
                        <input
                            type="text"
                            id="persona-name"
                            class="persona-generator__input"
                            placeholder="Enter full name"
                            value="<?php echo esc_attr($personal_info['name'] ?? ''); ?>"
                            required
                        />
                        <p class="persona-generator__field-hint">The name that will be associated with this persona</p>
                    </div>

                    <div class="persona-generator__field">
                        <label for="persona-title" class="persona-generator__label">Professional Title</label>
                        <input
                            type="text"
                            id="persona-title"
                            class="persona-generator__input"
                            placeholder="e.g., CEO, Marketing Director, Tech Consultant"
                            value="<?php echo esc_attr($personal_info['title'] ?? ''); ?>"
                        />
                    </div>

                    <div class="persona-generator__field">
                        <label for="persona-organization" class="persona-generator__label">Organization</label>
                        <input
                            type="text"
                            id="persona-organization"
                            class="persona-generator__input"
                            placeholder="Company or organization name"
                            value="<?php echo esc_attr($personal_info['organization'] ?? ''); ?>"
                        />
                    </div>
                </div>

                <!-- Authority Hook Integration -->
                <div class="persona-generator__section persona-generator__authority-hook">
                    <h3 class="persona-generator__section-title">Authority Hook (Optional)</h3>
                    <p class="persona-generator__field-hint">Use the Authority Hook Builder to define your core expertise and value proposition.</p>

                    <button
                        type="button"
                        id="persona-authority-hook-toggle"
                        class="persona-generator__button persona-generator__button--outline persona-generator__service-toggle"
                    >
                        Show Authority Hook Builder
                    </button>

                    <div id="persona-generator-authority-hook-builder" class="generator__builder generator__builder--hidden persona-generator__builder">
                        <?php
                        // Render Authority Hook Service Builder
                        if (class_exists('MKCG_Authority_Hook_Service') && isset($GLOBALS['authority_hook_service'])) {
                            echo $GLOBALS['authority_hook_service']->render_builder_interface('persona-generator');
                        }
                        ?>
                        <div style="margin-top: 15px; text-align: right;">
                            <button type="button" id="collect-persona-authority-hook" class="generator__button generator__button--outline">
                                Collect Authority Hook Data
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Impact Intro Integration -->
                <div class="persona-generator__section persona-generator__impact-intro">
                    <h3 class="persona-generator__section-title">Impact Intro (Optional)</h3>
                    <p class="persona-generator__field-hint">Use the Impact Intro Builder to highlight your credentials and mission.</p>

                    <button
                        type="button"
                        id="persona-impact-intro-toggle"
                        class="persona-generator__button persona-generator__button--outline persona-generator__service-toggle"
                    >
                        Show Impact Intro Builder
                    </button>

                    <div id="persona-generator-impact-intro-builder" class="generator__builder generator__builder--hidden persona-generator__builder">
                        <?php
                        // Render Impact Intro Service Builder
                        if (class_exists('MKCG_Impact_Intro_Service') && isset($GLOBALS['impact_intro_service'])) {
                            echo $GLOBALS['impact_intro_service']->render_builder_interface('persona-generator');
                        }
                        ?>
                        <div style="margin-top: 15px; text-align: right;">
                            <button type="button" id="collect-persona-impact-intro" class="generator__button generator__button--outline">
                                Collect Impact Intro Data
                            </button>
                        </div>
                    </div>
                </div>

                <!-- Additional Context Section -->
                <div class="persona-generator__section">
                    <h3 class="persona-generator__section-title">Additional Context</h3>

                    <div class="persona-generator__field">
                        <label for="persona-industry" class="persona-generator__label">Industry/Niche</label>
                        <input
                            type="text"
                            id="persona-industry"
                            class="persona-generator__input"
                            placeholder="e.g., Technology, Healthcare, Finance"
                            value="<?php echo esc_attr($additional_context['industry'] ?? ''); ?>"
                        />
                        <p class="persona-generator__field-hint">What industry or niche are you operating in?</p>
                    </div>

                    <div class="persona-generator__field">
                        <label for="persona-unique-factors" class="persona-generator__label">Unique Factors</label>
                        <textarea
                            id="persona-unique-factors"
                            class="persona-generator__textarea"
                            placeholder="What makes this person unique? Special achievements, perspectives, or approaches..."
                            rows="4"
                        ><?php echo esc_textarea($additional_context['unique_factors'] ?? ''); ?></textarea>
                    </div>

                    <div class="persona-generator__field">
                        <label for="persona-additional-notes" class="persona-generator__label">Additional Notes</label>
                        <textarea
                            id="persona-additional-notes"
                            class="persona-generator__textarea"
                            placeholder="Any other information that should inform the persona generation..."
                            rows="3"
                        ><?php echo esc_textarea($additional_context['additional_notes'] ?? ''); ?></textarea>
                    </div>
                </div>

                <!-- Persona Settings Section -->
                <div class="persona-generator__section">
                    <h3 class="persona-generator__section-title">Persona Settings</h3>

                    <div class="persona-generator__settings">
                        <div class="persona-generator__field persona-generator__setting">
                            <label for="persona-style" class="persona-generator__label">Style</label>
                            <select id="persona-style" class="persona-generator__select">
                                <option value="strategic" <?php selected($persona_data['style'] ?? 'strategic', 'strategic'); ?>>Strategic</option>
                                <option value="tactical" <?php selected($persona_data['style'] ?? '', 'tactical'); ?>>Tactical</option>
                                <option value="thought-leader" <?php selected($persona_data['style'] ?? '', 'thought-leader'); ?>>Thought Leader</option>
                                <option value="practitioner" <?php selected($persona_data['style'] ?? '', 'practitioner'); ?>>Practitioner</option>
                                <option value="innovator" <?php selected($persona_data['style'] ?? '', 'innovator'); ?>>Innovator</option>
                            </select>
                            <p class="persona-generator__field-hint">Overall approach and positioning</p>
                        </div>

                        <div class="persona-generator__field persona-generator__setting">
                            <label for="persona-focus" class="persona-generator__label">Focus</label>
                            <select id="persona-focus" class="persona-generator__select">
                                <option value="expertise" <?php selected($persona_data['focus'] ?? 'expertise', 'expertise'); ?>>Expertise</option>
                                <option value="impact" <?php selected($persona_data['focus'] ?? '', 'impact'); ?>>Impact</option>
                                <option value="innovation" <?php selected($persona_data['focus'] ?? '', 'innovation'); ?>>Innovation</option>
                                <option value="leadership" <?php selected($persona_data['focus'] ?? '', 'leadership'); ?>>Leadership</option>
                                <option value="results" <?php selected($persona_data['focus'] ?? '', 'results'); ?>>Results</option>
                            </select>
                            <p class="persona-generator__field-hint">Primary emphasis area</p>
                        </div>

                        <div class="persona-generator__field persona-generator__setting">
                            <label for="persona-depth" class="persona-generator__label">Depth</label>
                            <select id="persona-depth" class="persona-generator__select">
                                <option value="concise" <?php selected($persona_data['depth'] ?? '', 'concise'); ?>>Concise</option>
                                <option value="comprehensive" <?php selected($persona_data['depth'] ?? 'comprehensive', 'comprehensive'); ?>>Comprehensive</option>
                                <option value="detailed" <?php selected($persona_data['depth'] ?? '', 'detailed'); ?>>Detailed</option>
                            </select>
                            <p class="persona-generator__field-hint">Level of detail in descriptions</p>
                        </div>
                    </div>
                </div>

                <!-- Generate Button -->
                <div class="persona-generator__section" style="text-align: center;">
                    <button
                        type="button"
                        id="generate-personas-btn"
                        class="persona-generator__button"
                    >
                        Generate Personas
                    </button>

                    <!-- Loading Indicator -->
                    <div id="persona-loader" class="persona-loader" style="display: none;">
                        <div class="persona-loader__spinner"></div>
                        <p class="persona-loader__text">Generating your professional personas...</p>
                    </div>
                </div>

            </div>

            <!-- RIGHT PANEL - Guidance -->
            <div class="persona-generator__panel--right">
                <div class="persona-generator__guidance">
                    <h4 class="persona-generator__guidance-title">What are Professional Personas?</h4>
                    <p style="color: #6c757d; font-size: 14px; line-height: 1.6; margin-bottom: 15px;">
                        Professional personas help define how you want to be perceived in your industry. They serve as positioning statements for media appearances, speaking engagements, and thought leadership.
                    </p>

                    <h4 class="persona-generator__guidance-title">Tips for Best Results</h4>
                    <ul class="persona-generator__guidance-list">
                        <li class="persona-generator__guidance-item">Fill in Authority Hook for stronger positioning</li>
                        <li class="persona-generator__guidance-item">Include Impact Intro for credibility</li>
                        <li class="persona-generator__guidance-item">Specify your unique factors clearly</li>
                        <li class="persona-generator__guidance-item">Choose style that matches your goals</li>
                        <li class="persona-generator__guidance-item">Review all 5 options before selecting</li>
                    </ul>

                    <h4 class="persona-generator__guidance-title">How to Use</h4>
                    <ul class="persona-generator__guidance-list">
                        <li class="persona-generator__guidance-item">Enter your basic information</li>
                        <li class="persona-generator__guidance-item">Optionally add Authority Hook and Impact Intro</li>
                        <li class="persona-generator__guidance-item">Provide context about your industry</li>
                        <li class="persona-generator__guidance-item">Select style, focus, and depth</li>
                        <li class="persona-generator__guidance-item">Click "Generate Personas" to create options</li>
                        <li class="persona-generator__guidance-item">Select the persona that resonates most</li>
                    </ul>
                </div>
            </div>
        </div>

        <!-- Results Section -->
        <div id="persona-results-section" class="persona-results-section" style="display: none;">
            <div class="persona-results__header">
                <h2 class="persona-results__title">Your Generated Personas</h2>
                <p class="persona-results__subtitle">Review the options below and select the one that best represents your professional identity</p>
            </div>

            <!-- Selected Persona Display -->
            <div id="selected-persona-display" style="display: none;"></div>

            <!-- Persona Options Container -->
            <div id="persona-options-container" class="persona-options-container">
                <!-- Personas will be dynamically inserted here -->
            </div>
        </div>

        <!-- Summary Display -->
        <div style="margin-top: 20px; text-align: center; color: #6c757d; font-size: 14px;">
            <p id="persona-summary">Ready to generate personas</p>
        </div>
    </div>
</div>
