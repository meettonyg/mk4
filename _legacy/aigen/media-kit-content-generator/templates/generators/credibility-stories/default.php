<?php
/**
 * Credibility Stories Suite Generator Template
 * @version 1.0
 */

if (!defined('ABSPATH')) exit;

$post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
$post = $post_id ? get_post($post_id) : null;

// Get data from generator
$generator_class = new MKCG_Enhanced_Credibility_Stories_Generator();
$template_data = $generator_class->get_template_data();

$guest_name = '';
$guest_title = '';
if ($post) {
    $guest_name = get_post_meta($post_id, '_guest_name', true) ?: $post->post_title;
    $guest_title = get_post_meta($post_id, '_guest_title', true);
}

$nonce = wp_create_nonce('mkcg_nonce');

// Localize data for JavaScript
$js_data = [
    'postId' => $post_id,
    'hasData' => $template_data['has_data'],
    'stories' => $template_data['stories'] ?? [],
    'noEntryParam' => isset($_GET['noentry'])
];
?>

<script>
window.MKCG_CredibilityStories_Data = <?php echo wp_json_encode($js_data); ?>;
</script>

<div class="generator__wrapper">
    <div class="credibility-stories-generator__container generator__container">

        <div class="credibility-stories-generator__header generator__header">
            <h2 class="credibility-stories-generator__title">Credibility Stories Suite</h2>
            <p class="credibility-stories-generator__subtitle">Create authentic personal stories that build trust, demonstrate resilience, and connect deeply with your audience</p>
        </div>

        <div class="credibility-stories-generator__content generator__content">

            <div class="credibility-stories-generator__panel-layout">

                <!-- LEFT PANEL: Main Form -->
                <div class="credibility-stories-generator__main-panel">

                    <div class="credibility-stories-generator__section">
                        <h3 class="credibility-stories-generator__section-title">Basic Information</h3>

                        <input type="hidden" id="credibility-stories-nonce" value="<?php echo esc_attr($nonce); ?>">

                        <div class="credibility-stories-generator__field">
                            <label class="credibility-stories-generator__label" for="credibility-stories-name">Your Name *</label>
                            <input
                                type="text"
                                id="credibility-stories-name"
                                class="credibility-stories-generator__input"
                                value="<?php echo esc_attr($guest_name); ?>"
                                placeholder="Enter your name"
                            >
                        </div>

                        <div class="credibility-stories-generator__field">
                            <label class="credibility-stories-generator__label" for="credibility-stories-title">Title/Role</label>
                            <input
                                type="text"
                                id="credibility-stories-title"
                                class="credibility-stories-generator__input"
                                value="<?php echo esc_attr($guest_title); ?>"
                                placeholder="e.g., Leadership Coach, Entrepreneur"
                            >
                        </div>

                        <div class="credibility-stories-generator__field">
                            <label class="credibility-stories-generator__label" for="credibility-stories-tone">Tone</label>
                            <select id="credibility-stories-tone" class="credibility-stories-generator__select">
                                <option value="authentic">Authentic & Vulnerable</option>
                                <option value="professional">Professional Yet Personal</option>
                                <option value="inspiring">Inspiring & Motivational</option>
                                <option value="conversational">Conversational & Relatable</option>
                            </select>
                        </div>

                        <div class="credibility-stories-generator__field">
                            <label class="credibility-stories-generator__label" for="credibility-stories-vulnerability">Vulnerability Level</label>
                            <select id="credibility-stories-vulnerability" class="credibility-stories-generator__select">
                                <option value="moderate">Moderate (Balanced)</option>
                                <option value="high">High (Very Open)</option>
                                <option value="low">Low (Focus on Lessons)</option>
                            </select>
                            <p class="credibility-stories-generator__help-text">How openly vulnerable should the stories be?</p>
                        </div>
                    </div>

                    <div class="credibility-stories-generator__section">
                        <h3 class="credibility-stories-generator__section-title">Story Context</h3>

                        <div class="credibility-stories-generator__field">
                            <label class="credibility-stories-generator__label" for="credibility-stories-breakthrough">Breakthrough Moment</label>
                            <textarea
                                id="credibility-stories-breakthrough"
                                class="credibility-stories-generator__textarea"
                                placeholder="What was your 'aha moment' or key insight that changed everything? What did you discover?"
                            ></textarea>
                        </div>

                        <div class="credibility-stories-generator__field">
                            <label class="credibility-stories-generator__label" for="credibility-stories-challenge">Challenge or Failure</label>
                            <textarea
                                id="credibility-stories-challenge"
                                class="credibility-stories-generator__textarea"
                                placeholder="What significant setback, failure, or difficult period did you face? How did you overcome it?"
                            ></textarea>
                        </div>

                        <div class="credibility-stories-generator__field">
                            <label class="credibility-stories-generator__label" for="credibility-stories-mentors">Key Mentors & Influences</label>
                            <textarea
                                id="credibility-stories-mentors"
                                class="credibility-stories-generator__textarea"
                                placeholder="Who shaped your thinking? What did you learn from them?"
                            ></textarea>
                        </div>

                        <div class="credibility-stories-generator__field">
                            <label class="credibility-stories-generator__label" for="credibility-stories-journey">Personal Transformation Journey</label>
                            <textarea
                                id="credibility-stories-journey"
                                class="credibility-stories-generator__textarea"
                                placeholder="How have you personally transformed? Who were you before vs. who are you now?"
                            ></textarea>
                        </div>
                    </div>

                    <div class="credibility-stories-generator__section">
                        <button
                            id="generate-credibility-stories-btn"
                            class="credibility-stories-generator__button"
                        >
                            Generate Credibility Stories
                        </button>
                    </div>

                    <!-- Loading State -->
                    <div id="credibility-stories-loader" class="credibility-stories-loader">
                        <div class="credibility-stories-loader__spinner"></div>
                        <p class="credibility-stories-loader__text">Crafting your credibility stories...</p>
                    </div>

                </div>

                <!-- RIGHT PANEL: Optional Builders -->
                <div class="credibility-stories-generator__side-panel">

                    <div class="credibility-stories-generator__section">
                        <h3 class="credibility-stories-generator__section-title">Optional: Enhance Stories</h3>
                        <p style="color: #6c757d; font-size: 14px; margin-bottom: 20px;">
                            Use these builders to provide additional context for richer stories.
                        </p>

                        <?php if (class_exists('MKCG_Authority_Hook_Service')): ?>
                        <button
                            id="credibility-stories-authority-hook-toggle"
                            class="credibility-stories-generator__button credibility-stories-generator__button--outline"
                            style="width: 100%; margin-bottom: 15px;"
                        >
                            Show Authority Hook Builder
                        </button>

                        <div id="credibility-stories-authority-hook-builder" class="credibility-stories-generator__builder credibility-stories-generator__builder--hidden">
                            <?php
                            $authority_service = new MKCG_Authority_Hook_Service();
                            echo $authority_service->render_builder('credibility-stories');
                            ?>
                            <button
                                id="collect-credibility-stories-authority-hook"
                                class="credibility-stories-generator__button"
                                style="width: 100%; margin-top: 15px;"
                            >
                                Collect Authority Hook
                            </button>
                        </div>
                        <?php endif; ?>

                        <?php if (class_exists('MKCG_Impact_Intro_Service')): ?>
                        <button
                            id="credibility-stories-impact-intro-toggle"
                            class="credibility-stories-generator__button credibility-stories-generator__button--outline"
                            style="width: 100%; margin-bottom: 15px;"
                        >
                            Show Impact Intro Builder
                        </button>

                        <div id="credibility-stories-impact-intro-builder" class="credibility-stories-generator__builder credibility-stories-generator__builder--hidden">
                            <?php
                            $impact_service = new MKCG_Impact_Intro_Service();
                            echo $impact_service->render_builder('credibility-stories');
                            ?>
                            <button
                                id="collect-credibility-stories-impact-intro"
                                class="credibility-stories-generator__button"
                                style="width: 100%; margin-top: 15px;"
                            >
                                Collect Impact Intro
                            </button>
                        </div>
                        <?php endif; ?>
                    </div>

                </div>

            </div>

            <!-- Results Section -->
            <div id="credibility-stories-results-section" class="credibility-stories-results-section" style="display: none;">
                <h3 class="credibility-stories-generator__section-title">Your Credibility Stories</h3>

                <div class="credibility-stories-results-grid">
                    <div id="aha-moment-story-container"></div>
                    <div id="failure-comeback-story-container"></div>
                    <div id="mentor-story-container"></div>
                    <div id="transformation-story-container"></div>
                </div>
            </div>

        </div>

    </div>
</div>
