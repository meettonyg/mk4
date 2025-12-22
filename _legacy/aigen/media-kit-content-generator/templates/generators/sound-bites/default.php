<?php
/**
 * Sound Bite Generator Template
 * @version 1.0
 */

if (!defined('ABSPATH')) exit;

$post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
$post = $post_id ? get_post($post_id) : null;

// Get data from generator
$generator_class = new MKCG_Enhanced_Sound_Bite_Generator();
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
    'sound_bites' => $template_data['sound_bites'] ?? [],
    'noEntryParam' => isset($_GET['noentry'])
];
?>

<script>
window.MKCG_SoundBites_Data = <?php echo wp_json_encode($js_data); ?>;
</script>

<div class="generator__wrapper">
    <div class="sound-bites-generator__container generator__container">

        <div class="sound-bites-generator__header generator__header">
            <h2 class="sound-bites-generator__title">Sound Bite Generator</h2>
            <p class="sound-bites-generator__subtitle">Create quotable, memorable statements perfect for social media and marketing</p>
        </div>

        <div class="sound-bites-generator__content generator__content">

            <div class="sound-bites-generator__panel-layout">

                <!-- LEFT PANEL: Main Form -->
                <div class="sound-bites-generator__main-panel">

                    <div class="sound-bites-generator__section">
                        <h3 class="sound-bites-generator__section-title">Basic Information</h3>

                        <input type="hidden" id="sound-bites-nonce" value="<?php echo esc_attr($nonce); ?>">

                        <div class="sound-bites-generator__field">
                            <label class="sound-bites-generator__label" for="sound-bites-name">Your Name *</label>
                            <input
                                type="text"
                                id="sound-bites-name"
                                class="sound-bites-generator__input"
                                value="<?php echo esc_attr($guest_name); ?>"
                                placeholder="Enter your name"
                            >
                        </div>

                        <div class="sound-bites-generator__field">
                            <label class="sound-bites-generator__label" for="sound-bites-title">Title/Role</label>
                            <input
                                type="text"
                                id="sound-bites-title"
                                class="sound-bites-generator__input"
                                value="<?php echo esc_attr($guest_title); ?>"
                                placeholder="e.g., Innovation Strategist, Leadership Coach"
                            >
                        </div>

                        <div class="sound-bites-generator__field-group">
                            <div class="sound-bites-generator__field">
                                <label class="sound-bites-generator__label" for="sound-bites-style">Style</label>
                                <select id="sound-bites-style" class="sound-bites-generator__select">
                                    <option value="mixed">Mixed (variety)</option>
                                    <option value="one_liners">Punchy One-Liners</option>
                                    <option value="provocative">Provocative Statements</option>
                                    <option value="wisdom">Wisdom Quotes</option>
                                    <option value="contrarian">Contrarian Takes</option>
                                    <option value="actionable">Actionable Insights</option>
                                    <option value="metaphors">Metaphors</option>
                                </select>
                            </div>

                            <div class="sound-bites-generator__field">
                                <label class="sound-bites-generator__label" for="sound-bites-tone">Tone</label>
                                <select id="sound-bites-tone" class="sound-bites-generator__select">
                                    <option value="bold">Bold & Confident</option>
                                    <option value="thoughtful">Thoughtful & Nuanced</option>
                                    <option value="edgy">Edgy & Provocative</option>
                                    <option value="inspirational">Inspirational & Uplifting</option>
                                    <option value="direct">Direct & No-Nonsense</option>
                                </select>
                            </div>

                            <div class="sound-bites-generator__field">
                                <label class="sound-bites-generator__label" for="sound-bites-count">Quantity</label>
                                <select id="sound-bites-count" class="sound-bites-generator__select">
                                    <option value="8">8 Sound Bites</option>
                                    <option value="12" selected>12 Sound Bites</option>
                                    <option value="15">15 Sound Bites</option>
                                    <option value="20">20 Sound Bites</option>
                                </select>
                            </div>
                        </div>
                    </div>

                    <div class="sound-bites-generator__section">
                        <h3 class="sound-bites-generator__section-title">Content Context</h3>

                        <div class="sound-bites-generator__field">
                            <label class="sound-bites-generator__label" for="sound-bites-expertise">Key Expertise Areas</label>
                            <textarea
                                id="sound-bites-expertise"
                                class="sound-bites-generator__textarea"
                                placeholder="What topics do you speak about? What are you known for?"
                            ></textarea>
                        </div>

                        <div class="sound-bites-generator__field">
                            <label class="sound-bites-generator__label" for="sound-bites-philosophies">Key Philosophies & Beliefs</label>
                            <textarea
                                id="sound-bites-philosophies"
                                class="sound-bites-generator__textarea"
                                placeholder="What do you believe strongly? What principles guide your thinking?"
                            ></textarea>
                        </div>

                        <div class="sound-bites-generator__field">
                            <label class="sound-bites-generator__label" for="sound-bites-perspectives">Unique Perspectives</label>
                            <textarea
                                id="sound-bites-perspectives"
                                class="sound-bites-generator__textarea"
                                placeholder="What unique or contrarian views do you have? What makes your perspective different?"
                            ></textarea>
                        </div>
                    </div>

                    <div class="sound-bites-generator__section">
                        <button
                            id="generate-sound-bites-btn"
                            class="sound-bites-generator__button"
                        >
                            Generate Sound Bites
                        </button>
                    </div>

                    <!-- Loading State -->
                    <div id="sound-bites-loader" class="sound-bites-loader">
                        <div class="sound-bites-loader__spinner"></div>
                        <p class="sound-bites-loader__text">Creating quotable sound bites...</p>
                    </div>

                </div>

                <!-- RIGHT PANEL: Optional Builders -->
                <div class="sound-bites-generator__side-panel">

                    <div class="sound-bites-generator__section">
                        <h3 class="sound-bites-generator__section-title">Optional: Enhance Quotes</h3>
                        <p style="color: #6c757d; font-size: 14px; margin-bottom: 20px;">
                            Use these builders to add depth and context to your sound bites.
                        </p>

                        <?php if (class_exists('MKCG_Authority_Hook_Service')): ?>
                        <button
                            id="sound-bites-authority-hook-toggle"
                            class="sound-bites-generator__button sound-bites-generator__button--outline"
                            style="width: 100%; margin-bottom: 15px;"
                        >
                            Show Authority Hook Builder
                        </button>

                        <div id="sound-bites-authority-hook-builder" class="sound-bites-generator__builder sound-bites-generator__builder--hidden">
                            <?php
                            $authority_service = new MKCG_Authority_Hook_Service();
                            echo $authority_service->render_builder('sound-bites');
                            ?>
                            <button
                                id="collect-sound-bites-authority-hook"
                                class="sound-bites-generator__button"
                                style="width: 100%; margin-top: 15px;"
                            >
                                Collect Authority Hook
                            </button>
                        </div>
                        <?php endif; ?>

                        <?php if (class_exists('MKCG_Impact_Intro_Service')): ?>
                        <button
                            id="sound-bites-impact-intro-toggle"
                            class="sound-bites-generator__button sound-bites-generator__button--outline"
                            style="width: 100%; margin-bottom: 15px;"
                        >
                            Show Impact Intro Builder
                        </button>

                        <div id="sound-bites-impact-intro-builder" class="sound-bites-generator__builder sound-bites-generator__builder--hidden">
                            <?php
                            $impact_service = new MKCG_Impact_Intro_Service();
                            echo $impact_service->render_builder('sound-bites');
                            ?>
                            <button
                                id="collect-sound-bites-impact-intro"
                                class="sound-bites-generator__button"
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
            <div id="sound-bites-results-section" class="sound-bites-results-section" style="display: none;">
                <h3 class="sound-bites-generator__section-title">Your Sound Bites</h3>
                <p style="color: #6c757d; margin-bottom: 25px;">
                    Click any quote to copy it to your clipboard. Perfect for social media posts, presentations, and marketing materials.
                </p>

                <div id="sound-bites-container" class="sound-bites-grid"></div>
            </div>

        </div>

    </div>
</div>
