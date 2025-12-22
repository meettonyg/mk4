<?php
/**
 * Interview Prep Generator Template
 * @version 1.0
 */

if (!defined('ABSPATH')) exit;

$post_id = isset($_GET['post_id']) ? intval($_GET['post_id']) : 0;
$post = $post_id ? get_post($post_id) : null;

// Get data from generator
$generator_class = new MKCG_Enhanced_Interview_Prep_Generator();
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
    'qa_pairs' => $template_data['qa_pairs'] ?? [],
    'noEntryParam' => isset($_GET['noentry'])
];
?>

<script>
window.MKCG_InterviewPrep_Data = <?php echo wp_json_encode($js_data); ?>;
</script>

<div class="generator__wrapper">
    <div class="interview-prep-generator__container generator__container">

        <div class="interview-prep-generator__header generator__header">
            <h2 class="interview-prep-generator__title">Interview Prep Generator</h2>
            <p class="interview-prep-generator__subtitle">Generate anticipated interview questions with prepared, strategic answers</p>
        </div>

        <div class="interview-prep-generator__content generator__content">

            <div class="interview-prep-generator__panel-layout">

                <!-- LEFT PANEL: Main Form -->
                <div class="interview-prep-generator__main-panel">

                    <div class="interview-prep-generator__section">
                        <h3 class="interview-prep-generator__section-title">Basic Information</h3>

                        <input type="hidden" id="interview-prep-nonce" value="<?php echo esc_attr($nonce); ?>">

                        <div class="interview-prep-generator__field">
                            <label class="interview-prep-generator__label" for="interview-prep-name">Your Name *</label>
                            <input
                                type="text"
                                id="interview-prep-name"
                                class="interview-prep-generator__input"
                                value="<?php echo esc_attr($guest_name); ?>"
                                placeholder="Enter your name"
                            >
                        </div>

                        <div class="interview-prep-generator__field">
                            <label class="interview-prep-generator__label" for="interview-prep-title">Title/Role</label>
                            <input
                                type="text"
                                id="interview-prep-title"
                                class="interview-prep-generator__input"
                                value="<?php echo esc_attr($guest_title); ?>"
                                placeholder="e.g., Marketing Expert, Tech Founder"
                            >
                        </div>

                        <div class="interview-prep-generator__field-group">
                            <div class="interview-prep-generator__field">
                                <label class="interview-prep-generator__label" for="interview-prep-type">Interview Type</label>
                                <select id="interview-prep-type" class="interview-prep-generator__select">
                                    <option value="podcast">Podcast (conversational)</option>
                                    <option value="media">Media/TV/Radio (concise)</option>
                                    <option value="conference">Conference Q&A (professional)</option>
                                    <option value="virtual">Virtual Summit (educational)</option>
                                    <option value="print">Print/Written (detailed)</option>
                                </select>
                            </div>

                            <div class="interview-prep-generator__field">
                                <label class="interview-prep-generator__label" for="interview-prep-depth">Question Difficulty</label>
                                <select id="interview-prep-depth" class="interview-prep-generator__select">
                                    <option value="moderate">Moderate (balanced)</option>
                                    <option value="light">Light (easy warm-up)</option>
                                    <option value="deep">Deep (challenging)</option>
                                </select>
                            </div>
                        </div>

                        <div class="interview-prep-generator__field">
                            <label class="interview-prep-generator__label" for="interview-prep-count">Number of Questions</label>
                            <select id="interview-prep-count" class="interview-prep-generator__select">
                                <option value="5">5 Questions</option>
                                <option value="8" selected>8 Questions</option>
                                <option value="10">10 Questions</option>
                                <option value="12">12 Questions</option>
                            </select>
                        </div>
                    </div>

                    <div class="interview-prep-generator__section">
                        <h3 class="interview-prep-generator__section-title">Interview Context</h3>

                        <div class="interview-prep-generator__field">
                            <label class="interview-prep-generator__label" for="interview-prep-expertise">Key Expertise Areas</label>
                            <textarea
                                id="interview-prep-expertise"
                                class="interview-prep-generator__textarea"
                                placeholder="What topics are you an expert in? What should the host know about your expertise?"
                            ></textarea>
                        </div>

                        <div class="interview-prep-generator__field">
                            <label class="interview-prep-generator__label" for="interview-prep-messages">Key Messages</label>
                            <textarea
                                id="interview-prep-messages"
                                class="interview-prep-generator__textarea"
                                placeholder="What are the main points you want to communicate in this interview?"
                            ></textarea>
                        </div>

                        <div class="interview-prep-generator__field">
                            <label class="interview-prep-generator__label" for="interview-prep-audience">Audience Context</label>
                            <textarea
                                id="interview-prep-audience"
                                class="interview-prep-generator__textarea"
                                placeholder="Who is the audience? What are their challenges, interests, or needs?"
                            ></textarea>
                        </div>
                    </div>

                    <div class="interview-prep-generator__section">
                        <button
                            id="generate-interview-prep-btn"
                            class="interview-prep-generator__button"
                        >
                            Generate Interview Prep
                        </button>
                    </div>

                    <!-- Loading State -->
                    <div id="interview-prep-loader" class="interview-prep-loader">
                        <div class="interview-prep-loader__spinner"></div>
                        <p class="interview-prep-loader__text">Generating interview questions and answers...</p>
                    </div>

                </div>

                <!-- RIGHT PANEL: Optional Builders -->
                <div class="interview-prep-generator__side-panel">

                    <div class="interview-prep-generator__section">
                        <h3 class="interview-prep-generator__section-title">Optional: Enhance Q&A</h3>
                        <p style="color: #6c757d; font-size: 14px; margin-bottom: 20px;">
                            Use these builders to provide additional context for better Q&A.
                        </p>

                        <?php if (class_exists('MKCG_Authority_Hook_Service')): ?>
                        <button
                            id="interview-prep-authority-hook-toggle"
                            class="interview-prep-generator__button interview-prep-generator__button--outline"
                            style="width: 100%; margin-bottom: 15px;"
                        >
                            Show Authority Hook Builder
                        </button>

                        <div id="interview-prep-authority-hook-builder" class="interview-prep-generator__builder interview-prep-generator__builder--hidden">
                            <?php
                            $authority_service = new MKCG_Authority_Hook_Service();
                            echo $authority_service->render_builder('interview-prep');
                            ?>
                            <button
                                id="collect-interview-prep-authority-hook"
                                class="interview-prep-generator__button"
                                style="width: 100%; margin-top: 15px;"
                            >
                                Collect Authority Hook
                            </button>
                        </div>
                        <?php endif; ?>

                        <?php if (class_exists('MKCG_Impact_Intro_Service')): ?>
                        <button
                            id="interview-prep-impact-intro-toggle"
                            class="interview-prep-generator__button interview-prep-generator__button--outline"
                            style="width: 100%; margin-bottom: 15px;"
                        >
                            Show Impact Intro Builder
                        </button>

                        <div id="interview-prep-impact-intro-builder" class="interview-prep-generator__builder interview-prep-generator__builder--hidden">
                            <?php
                            $impact_service = new MKCG_Impact_Intro_Service();
                            echo $impact_service->render_builder('interview-prep');
                            ?>
                            <button
                                id="collect-interview-prep-impact-intro"
                                class="interview-prep-generator__button"
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
            <div id="interview-prep-results-section" class="interview-prep-results-section" style="display: none;">
                <h3 class="interview-prep-generator__section-title">Your Interview Q&A</h3>
                <p style="color: #6c757d; margin-bottom: 25px;">
                    Review these questions and answers. Click "Copy Both" to copy Q&A together for easy reference.
                </p>

                <div id="interview-qa-container"></div>
            </div>

        </div>

    </div>
</div>
