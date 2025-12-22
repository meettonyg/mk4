<?php
/**
 * Essential Business Stories Suite Generator Template
 * @version 1.0
 */

if (!defined('ABSPATH')) exit;

$post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
$post = $post_id ? get_post($post_id) : null;

// Get data from generator
$generator_class = new MKCG_Enhanced_Business_Stories_Generator();
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
window.MKCG_BusinessStories_Data = <?php echo wp_json_encode($js_data); ?>;
</script>

<div class="generator__wrapper">
    <div class="business-stories-generator__container generator__container">

        <div class="business-stories-generator__header generator__header">
            <h2 class="business-stories-generator__title">Essential Business Stories Suite</h2>
            <p class="business-stories-generator__subtitle">Create the four critical stories every business needs based on the Duct Tape Marketing framework</p>
        </div>

        <div class="business-stories-generator__content generator__content">

            <div class="business-stories-generator__panel-layout">

                <!-- LEFT PANEL: Main Form -->
                <div class="business-stories-generator__main-panel">

                    <div class="business-stories-generator__section">
                        <h3 class="business-stories-generator__section-title">Basic Information</h3>

                        <input type="hidden" id="business-stories-nonce" value="<?php echo esc_attr($nonce); ?>">

                        <div class="business-stories-generator__field">
                            <label class="business-stories-generator__label" for="business-stories-name">Your Name *</label>
                            <input
                                type="text"
                                id="business-stories-name"
                                class="business-stories-generator__input"
                                value="<?php echo esc_attr($guest_name); ?>"
                                placeholder="Enter your name"
                            >
                        </div>

                        <div class="business-stories-generator__field">
                            <label class="business-stories-generator__label" for="business-stories-title">Title/Role</label>
                            <input
                                type="text"
                                id="business-stories-title"
                                class="business-stories-generator__input"
                                value="<?php echo esc_attr($guest_title); ?>"
                                placeholder="e.g., CEO, Founder, Business Coach"
                            >
                        </div>

                        <div class="business-stories-generator__field">
                            <label class="business-stories-generator__label" for="business-stories-industry">Industry</label>
                            <input
                                type="text"
                                id="business-stories-industry"
                                class="business-stories-generator__input"
                                placeholder="e.g., Technology, Healthcare, Consulting"
                            >
                        </div>

                        <div class="business-stories-generator__field">
                            <label class="business-stories-generator__label" for="business-stories-tone">Tone</label>
                            <select id="business-stories-tone" class="business-stories-generator__select">
                                <option value="professional">Professional & Authoritative</option>
                                <option value="authentic">Authentic & Personal</option>
                                <option value="inspiring">Inspiring & Motivational</option>
                                <option value="conversational">Conversational & Approachable</option>
                            </select>
                        </div>
                    </div>

                    <div class="business-stories-generator__section">
                        <h3 class="business-stories-generator__section-title">Business Context</h3>

                        <div class="business-stories-generator__field">
                            <label class="business-stories-generator__label" for="business-stories-target-customer">Target Customer</label>
                            <textarea
                                id="business-stories-target-customer"
                                class="business-stories-generator__textarea"
                                placeholder="Who do you serve? What are their challenges?"
                            ></textarea>
                        </div>

                        <div class="business-stories-generator__field">
                            <label class="business-stories-generator__label" for="business-stories-origin">Origin Story Context (Optional)</label>
                            <textarea
                                id="business-stories-origin"
                                class="business-stories-generator__textarea"
                                placeholder="How did your business start? What was the founding story?"
                            ></textarea>
                        </div>

                        <div class="business-stories-generator__field">
                            <label class="business-stories-generator__label" for="business-stories-competitors">Competitive Landscape</label>
                            <textarea
                                id="business-stories-competitors"
                                class="business-stories-generator__textarea"
                                placeholder="Who are your competitors? How are you different?"
                            ></textarea>
                        </div>

                        <div class="business-stories-generator__field">
                            <label class="business-stories-generator__label" for="business-stories-results">Customer Results</label>
                            <textarea
                                id="business-stories-results"
                                class="business-stories-generator__textarea"
                                placeholder="What transformations have your customers experienced? Include specific examples."
                            ></textarea>
                        </div>

                        <div class="business-stories-generator__field">
                            <label class="business-stories-generator__label" for="business-stories-approach">Unique Approach/Philosophy</label>
                            <textarea
                                id="business-stories-approach"
                                class="business-stories-generator__textarea"
                                placeholder="What industry beliefs do you challenge? What's your contrarian view?"
                            ></textarea>
                        </div>
                    </div>

                    <div class="business-stories-generator__section">
                        <button
                            id="generate-business-stories-btn"
                            class="business-stories-generator__button"
                        >
                            Generate Business Stories
                        </button>
                    </div>

                    <!-- Loading State -->
                    <div id="business-stories-loader" class="business-stories-loader">
                        <div class="business-stories-loader__spinner"></div>
                        <p class="business-stories-loader__text">Crafting your business stories...</p>
                    </div>

                </div>

                <!-- RIGHT PANEL: Optional Builders -->
                <div class="business-stories-generator__side-panel">

                    <div class="business-stories-generator__section">
                        <h3 class="business-stories-generator__section-title">Optional: Enhance Stories</h3>
                        <p style="color: #6c757d; font-size: 14px; margin-bottom: 20px;">
                            Use these builders to provide additional context for richer stories.
                        </p>

                        <?php if (class_exists('MKCG_Authority_Hook_Service')): ?>
                        <button
                            id="business-stories-authority-hook-toggle"
                            class="business-stories-generator__button business-stories-generator__button--outline"
                            style="width: 100%; margin-bottom: 15px;"
                        >
                            Show Authority Hook Builder
                        </button>

                        <div id="business-stories-authority-hook-builder" class="business-stories-generator__builder business-stories-generator__builder--hidden">
                            <?php
                            $authority_service = new MKCG_Authority_Hook_Service();
                            echo $authority_service->render_builder('business-stories');
                            ?>
                            <button
                                id="collect-business-stories-authority-hook"
                                class="business-stories-generator__button"
                                style="width: 100%; margin-top: 15px;"
                            >
                                Collect Authority Hook
                            </button>
                        </div>
                        <?php endif; ?>

                        <?php if (class_exists('MKCG_Impact_Intro_Service')): ?>
                        <button
                            id="business-stories-impact-intro-toggle"
                            class="business-stories-generator__button business-stories-generator__button--outline"
                            style="width: 100%; margin-bottom: 15px;"
                        >
                            Show Impact Intro Builder
                        </button>

                        <div id="business-stories-impact-intro-builder" class="business-stories-generator__builder business-stories-generator__builder--hidden">
                            <?php
                            $impact_service = new MKCG_Impact_Intro_Service();
                            echo $impact_service->render_builder('business-stories');
                            ?>
                            <button
                                id="collect-business-stories-impact-intro"
                                class="business-stories-generator__button"
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
            <div id="business-stories-results-section" class="business-stories-results-section" style="display: none;">
                <h3 class="business-stories-generator__section-title">Your Essential Business Stories</h3>

                <div class="business-stories-results-grid">
                    <div id="purpose-story-container"></div>
                    <div id="positioning-story-container"></div>
                    <div id="transformation-story-container"></div>
                    <div id="contrarian-story-container"></div>
                </div>
            </div>

        </div>

    </div>
</div>
