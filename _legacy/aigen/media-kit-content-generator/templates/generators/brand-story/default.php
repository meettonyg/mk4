<?php
/**
 * Personal Brand Story Suite Generator Template
 * @version 1.0
 */

if (!defined('ABSPATH')) exit;

$post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
$post = $post_id ? get_post($post_id) : null;

// Get data from generator
$generator_class = new MKCG_Enhanced_Brand_Story_Generator();
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
window.MKCG_BrandStory_Data = <?php echo wp_json_encode($js_data); ?>;
</script>

<div class="generator__wrapper">
    <div class="brand-story-generator__container generator__container">

        <div class="brand-story-generator__header generator__header">
            <h2 class="brand-story-generator__title">Personal Brand Story Suite</h2>
            <p class="brand-story-generator__subtitle">Create compelling narratives that showcase your journey, values, mission, and expertise</p>
        </div>

        <div class="brand-story-generator__content generator__content">

            <div class="brand-story-generator__panel-layout">

                <!-- LEFT PANEL: Main Form -->
                <div class="brand-story-generator__main-panel">

                    <div class="brand-story-generator__section">
                        <h3 class="brand-story-generator__section-title">Basic Information</h3>

                        <input type="hidden" id="brand-story-nonce" value="<?php echo esc_attr($nonce); ?>">

                        <div class="brand-story-generator__field">
                            <label class="brand-story-generator__label" for="brand-story-name">Your Name *</label>
                            <input
                                type="text"
                                id="brand-story-name"
                                class="brand-story-generator__input"
                                value="<?php echo esc_attr($guest_name); ?>"
                                placeholder="Enter your name"
                            >
                        </div>

                        <div class="brand-story-generator__field">
                            <label class="brand-story-generator__label" for="brand-story-title">Title/Role</label>
                            <input
                                type="text"
                                id="brand-story-title"
                                class="brand-story-generator__input"
                                value="<?php echo esc_attr($guest_title); ?>"
                                placeholder="e.g., Leadership Coach, Tech Entrepreneur"
                            >
                        </div>

                        <div class="brand-story-generator__field">
                            <label class="brand-story-generator__label" for="brand-story-tone">Tone</label>
                            <select id="brand-story-tone" class="brand-story-generator__select">
                                <option value="authentic">Authentic & Personal</option>
                                <option value="professional">Professional & Polished</option>
                                <option value="inspirational">Inspirational & Motivating</option>
                                <option value="conversational">Conversational & Relatable</option>
                            </select>
                        </div>
                    </div>

                    <div class="brand-story-generator__section">
                        <h3 class="brand-story-generator__section-title">Story Context</h3>

                        <div class="brand-story-generator__field">
                            <label class="brand-story-generator__label" for="brand-story-background">Background & Journey</label>
                            <textarea
                                id="brand-story-background"
                                class="brand-story-generator__textarea"
                                placeholder="Share key moments from your journey, challenges overcome, transformative experiences..."
                            ></textarea>
                        </div>

                        <div class="brand-story-generator__field">
                            <label class="brand-story-generator__label" for="brand-story-values">Core Values & Beliefs</label>
                            <textarea
                                id="brand-story-values"
                                class="brand-story-generator__textarea"
                                placeholder="What principles guide your work? What do you believe in strongly?"
                            ></textarea>
                        </div>
                    </div>

                    <div class="brand-story-generator__section">
                        <button
                            id="generate-brand-stories-btn"
                            class="brand-story-generator__button"
                        >
                            Generate Brand Stories
                        </button>
                    </div>

                    <!-- Loading State -->
                    <div id="brand-story-loader" class="brand-story-loader">
                        <div class="brand-story-loader__spinner"></div>
                        <p class="brand-story-loader__text">Crafting your brand stories...</p>
                    </div>

                </div>

                <!-- RIGHT PANEL: Optional Builders -->
                <div class="brand-story-generator__side-panel">

                    <div class="brand-story-generator__section">
                        <h3 class="brand-story-generator__section-title">Optional: Enhance Stories</h3>
                        <p style="color: #6c757d; font-size: 14px; margin-bottom: 20px;">
                            Use these builders to provide additional context for richer stories.
                        </p>

                        <?php if (class_exists('MKCG_Authority_Hook_Service')): ?>
                        <button
                            id="brand-story-authority-hook-toggle"
                            class="brand-story-generator__button brand-story-generator__button--outline"
                            style="width: 100%; margin-bottom: 15px;"
                        >
                            Show Authority Hook Builder
                        </button>

                        <div id="brand-story-authority-hook-builder" class="brand-story-generator__builder brand-story-generator__builder--hidden">
                            <?php
                            $authority_service = new MKCG_Authority_Hook_Service();
                            echo $authority_service->render_builder('brand-story');
                            ?>
                            <button
                                id="collect-brand-story-authority-hook"
                                class="brand-story-generator__button"
                                style="width: 100%; margin-top: 15px;"
                            >
                                Collect Authority Hook
                            </button>
                        </div>
                        <?php endif; ?>

                        <?php if (class_exists('MKCG_Impact_Intro_Service')): ?>
                        <button
                            id="brand-story-impact-intro-toggle"
                            class="brand-story-generator__button brand-story-generator__button--outline"
                            style="width: 100%; margin-bottom: 15px;"
                        >
                            Show Impact Intro Builder
                        </button>

                        <div id="brand-story-impact-intro-builder" class="brand-story-generator__builder brand-story-generator__builder--hidden">
                            <?php
                            $impact_service = new MKCG_Impact_Intro_Service();
                            echo $impact_service->render_builder('brand-story');
                            ?>
                            <button
                                id="collect-brand-story-impact-intro"
                                class="brand-story-generator__button"
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
            <div id="brand-stories-results-section" class="brand-stories-results-section" style="display: none;">
                <h3 class="brand-story-generator__section-title">Your Brand Story Suite</h3>

                <div class="brand-story-results-grid">
                    <div id="origin-story-container"></div>
                    <div id="manifesto-container"></div>
                    <div id="mission-container"></div>
                    <div id="signature-story-container"></div>
                </div>
            </div>

        </div>

    </div>
</div>
