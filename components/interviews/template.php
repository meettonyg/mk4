<?php
/**
 * Interviews Component - Server-side Template
 *
 * Renders featured interviews for Media Kit display.
 *
 * @package GMKB
 * @subpackage Components
 */

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Render interviews component
 *
 * @param array $data Component data
 * @param array $settings Component settings
 * @return string HTML output
 */
function gmkb_render_interviews_component($data = [], $settings = []) {
    // Extract options with defaults
    $title = $data['customTitle'] ?? 'Featured Interviews';
    $title_alignment = $data['titleAlignment'] ?? 'center';
    $layout = $data['layout'] ?? 'grid';
    $columns = $data['columns'] ?? '2';
    $card_style = $data['cardStyle'] ?? 'elevated';
    $max_interviews = (int) ($data['maxInterviews'] ?? 6);
    $show_podcast_name = $data['showPodcastName'] ?? true;
    $show_host_name = $data['showHostName'] ?? true;
    $show_date = $data['showDate'] ?? true;
    $show_duration = $data['showDuration'] ?? true;
    $show_topics = $data['showTopics'] ?? true;
    $show_listen_button = $data['showListenButton'] ?? true;

    // Get interviews
    $interviews = [];

    // Use embedded interviews data if available
    if (!empty($data['interviewsData']) && is_array($data['interviewsData'])) {
        $interviews = $data['interviewsData'];
    }
    // Or fetch by selected IDs
    elseif (!empty($data['selectedInterviewIds']) && is_array($data['selectedInterviewIds'])) {
        $interviews = gmkb_get_interviews_by_ids($data['selectedInterviewIds']);
    }
    // Or fetch by profile ID
    elseif (!empty($data['profileId'])) {
        $interviews = gmkb_get_profile_interviews($data['profileId']);
    }

    // Limit
    $interviews = array_slice(array_values($interviews), 0, $max_interviews);

    // Start output
    ob_start();
    ?>
    <div class="component-root interviews-component">
        <?php if ($title): ?>
            <h2 class="interviews-title" style="text-align: <?php echo esc_attr($title_alignment); ?>">
                <?php echo esc_html($title); ?>
            </h2>
        <?php endif; ?>

        <?php if (empty($interviews)): ?>
            <div class="interviews-empty">
                <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
                    <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                    <line x1="12" y1="19" x2="12" y2="23"/>
                    <line x1="8" y1="23" x2="16" y2="23"/>
                </svg>
                <p>No interviews available</p>
            </div>
        <?php elseif ($layout === 'grid'): ?>
            <div class="interviews-grid grid-<?php echo esc_attr($columns); ?>">
                <?php foreach ($interviews as $interview): ?>
                    <?php echo gmkb_render_interview_card($interview, $card_style, $show_podcast_name, $show_host_name, $show_date, $show_duration, $show_topics, $show_listen_button); ?>
                <?php endforeach; ?>
            </div>
        <?php elseif ($layout === 'list'): ?>
            <div class="interviews-list">
                <?php foreach ($interviews as $interview): ?>
                    <?php echo gmkb_render_interview_list_item($interview, $card_style, $show_podcast_name, $show_host_name, $show_date, $show_duration, $show_topics, $show_listen_button); ?>
                <?php endforeach; ?>
            </div>
        <?php elseif ($layout === 'featured' && !empty($interviews[0])): ?>
            <div class="interviews-featured">
                <?php echo gmkb_render_interview_featured($interviews[0], $card_style, $show_podcast_name, $show_host_name, $show_date, $show_duration, $show_topics, $show_listen_button); ?>
            </div>
        <?php endif; ?>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Render a single interview card (grid layout)
 */
function gmkb_render_interview_card($interview, $card_style, $show_podcast_name, $show_host_name, $show_date, $show_duration, $show_topics, $show_listen_button) {
    $topics = $interview['topics'] ?? [];
    if (is_string($topics)) {
        $topics = array_filter(array_map('trim', explode(',', $topics)));
    }

    ob_start();
    ?>
    <div class="interview-card card-<?php echo esc_attr($card_style); ?>">
        <div class="interview-content">
            <h3 class="interview-title"><?php echo esc_html($interview['title']); ?></h3>

            <?php if ($show_podcast_name && !empty($interview['podcast_name'])): ?>
                <div class="interview-podcast">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polygon points="10 8 16 12 10 16 10 8"/>
                    </svg>
                    <?php echo esc_html($interview['podcast_name']); ?>
                </div>
            <?php endif; ?>

            <?php if ($show_host_name && !empty($interview['host_name'])): ?>
                <div class="interview-host">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                        <circle cx="12" cy="7" r="4"/>
                    </svg>
                    <?php echo esc_html($interview['host_name']); ?>
                </div>
            <?php endif; ?>

            <div class="interview-meta">
                <?php if ($show_date && !empty($interview['publish_date'])): ?>
                    <span class="interview-date">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
                            <line x1="16" y1="2" x2="16" y2="6"/>
                            <line x1="8" y1="2" x2="8" y2="6"/>
                            <line x1="3" y1="10" x2="21" y2="10"/>
                        </svg>
                        <?php echo esc_html(gmkb_format_interview_date($interview['publish_date'])); ?>
                    </span>
                <?php endif; ?>
                <?php if ($show_duration && !empty($interview['duration'])): ?>
                    <span class="interview-duration">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <circle cx="12" cy="12" r="10"/>
                            <polyline points="12 6 12 12 16 14"/>
                        </svg>
                        <?php echo esc_html($interview['duration']); ?>
                    </span>
                <?php endif; ?>
            </div>

            <?php if ($show_topics && !empty($topics)): ?>
                <div class="interview-topics">
                    <?php foreach (array_slice($topics, 0, 3) as $topic): ?>
                        <span class="topic-tag"><?php echo esc_html($topic); ?></span>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <?php if ($show_listen_button && !empty($interview['episode_url'])): ?>
                <a href="<?php echo esc_url($interview['episode_url']); ?>" class="interview-cta" target="_blank" rel="noopener">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    Listen Now
                </a>
            <?php endif; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Render a single interview list item
 */
function gmkb_render_interview_list_item($interview, $card_style, $show_podcast_name, $show_host_name, $show_date, $show_duration, $show_topics, $show_listen_button) {
    $topics = $interview['topics'] ?? [];
    if (is_string($topics)) {
        $topics = array_filter(array_map('trim', explode(',', $topics)));
    }

    ob_start();
    ?>
    <div class="interview-list-item card-<?php echo esc_attr($card_style); ?>">
        <div class="interview-list-content">
            <div class="interview-list-header">
                <h3 class="interview-title"><?php echo esc_html($interview['title']); ?></h3>
                <?php if ($show_duration && !empty($interview['duration'])): ?>
                    <span class="interview-duration-badge"><?php echo esc_html($interview['duration']); ?></span>
                <?php endif; ?>
            </div>

            <div class="interview-list-details">
                <?php if ($show_podcast_name && !empty($interview['podcast_name'])): ?>
                    <span class="detail-item"><?php echo esc_html($interview['podcast_name']); ?></span>
                <?php endif; ?>
                <?php if ($show_host_name && !empty($interview['host_name'])): ?>
                    <span class="detail-item">with <?php echo esc_html($interview['host_name']); ?></span>
                <?php endif; ?>
                <?php if ($show_date && !empty($interview['publish_date'])): ?>
                    <span class="detail-item"><?php echo esc_html(gmkb_format_interview_date($interview['publish_date'])); ?></span>
                <?php endif; ?>
            </div>

            <?php if ($show_topics && !empty($topics)): ?>
                <div class="interview-topics">
                    <?php foreach (array_slice($topics, 0, 4) as $topic): ?>
                        <span class="topic-tag"><?php echo esc_html($topic); ?></span>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <div class="interview-list-footer">
                <?php if ($show_listen_button && !empty($interview['episode_url'])): ?>
                    <a href="<?php echo esc_url($interview['episode_url']); ?>" class="interview-cta" target="_blank" rel="noopener">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <polygon points="5 3 19 12 5 21 5 3"/>
                        </svg>
                        Listen Now
                    </a>
                <?php endif; ?>
            </div>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Render featured interview
 */
function gmkb_render_interview_featured($interview, $card_style, $show_podcast_name, $show_host_name, $show_date, $show_duration, $show_topics, $show_listen_button) {
    $topics = $interview['topics'] ?? [];
    if (is_string($topics)) {
        $topics = array_filter(array_map('trim', explode(',', $topics)));
    }

    ob_start();
    ?>
    <div class="interview-featured-card card-<?php echo esc_attr($card_style); ?>">
        <div class="interview-featured-content">
            <h3 class="interview-featured-title"><?php echo esc_html($interview['title']); ?></h3>

            <?php if ($show_podcast_name && !empty($interview['podcast_name'])): ?>
                <div class="interview-featured-podcast">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <circle cx="12" cy="12" r="10"/>
                        <polygon points="10 8 16 12 10 16 10 8"/>
                    </svg>
                    <?php echo esc_html($interview['podcast_name']); ?>
                </div>
            <?php endif; ?>

            <div class="interview-featured-meta">
                <?php if ($show_host_name && !empty($interview['host_name'])): ?>
                    <span class="meta-item">with <?php echo esc_html($interview['host_name']); ?></span>
                <?php endif; ?>
                <?php if ($show_date && !empty($interview['publish_date'])): ?>
                    <span class="meta-item"><?php echo esc_html(gmkb_format_interview_date($interview['publish_date'])); ?></span>
                <?php endif; ?>
                <?php if ($show_duration && !empty($interview['duration'])): ?>
                    <span class="meta-item"><?php echo esc_html($interview['duration']); ?></span>
                <?php endif; ?>
            </div>

            <?php if ($show_topics && !empty($topics)): ?>
                <div class="interview-featured-topics">
                    <?php foreach ($topics as $topic): ?>
                        <span class="topic-tag"><?php echo esc_html($topic); ?></span>
                    <?php endforeach; ?>
                </div>
            <?php endif; ?>

            <?php if ($show_listen_button && !empty($interview['episode_url'])): ?>
                <a href="<?php echo esc_url($interview['episode_url']); ?>" class="interview-featured-cta" target="_blank" rel="noopener">
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                    </svg>
                    Listen to Episode
                </a>
            <?php endif; ?>
        </div>
    </div>
    <?php
    return ob_get_clean();
}

/**
 * Get interviews by IDs from PIT tables
 *
 * NOTE: The gmkb_interview CPT was removed. Interview data now comes from
 * PIT tables (pit_speaking_credits, pit_engagements, pit_podcasts).
 * The IDs passed here should be speaking_credit IDs.
 *
 * @param array $ids Array of speaking_credit IDs
 * @return array Formatted interview data
 */
function gmkb_get_interviews_by_ids($ids) {
    if (empty($ids)) return [];

    global $wpdb;
    $credits_table = $wpdb->prefix . 'pit_speaking_credits';
    $engagements_table = $wpdb->prefix . 'pit_engagements';
    $podcasts_table = $wpdb->prefix . 'pit_podcasts';

    // Check if tables exist
    $table_exists = $wpdb->get_var(
        $wpdb->prepare("SHOW TABLES LIKE %s", $credits_table)
    );
    if ($table_exists !== $credits_table) {
        return [];
    }

    $placeholders = implode(',', array_fill(0, count($ids), '%d'));
    $results = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT
                sc.id as credit_id,
                sc.guest_id,
                e.id as engagement_id,
                e.episode_title,
                e.episode_url,
                e.publish_date,
                e.duration,
                e.topics,
                p.podcast_name,
                p.host_name,
                p.artwork_url
            FROM {$credits_table} sc
            LEFT JOIN {$engagements_table} e ON sc.engagement_id = e.id
            LEFT JOIN {$podcasts_table} p ON e.podcast_id = p.id
            WHERE sc.id IN ($placeholders)",
            ...$ids
        )
    );

    $interviews = [];
    foreach ($results as $row) {
        $topics = $row->topics;
        if (is_string($topics)) {
            $topics = array_filter(array_map('trim', explode(',', $topics)));
        }

        $interviews[] = [
            'id' => (int) $row->credit_id,
            'title' => $row->episode_title ?: 'Untitled Episode',
            'podcast_name' => $row->podcast_name ?: '',
            'episode_url' => $row->episode_url ?: '',
            'publish_date' => $row->publish_date ?: '',
            'host_name' => $row->host_name ?: '',
            'duration' => $row->duration ?: '',
            'topics' => $topics ?: [],
            'artwork_url' => $row->artwork_url ?: '',
        ];
    }

    return $interviews;
}

/**
 * Get profile's featured interviews from PIT tables
 *
 * NOTE: The gmkb_interview CPT was removed. This function now queries
 * the PIT tables to get interviews associated with the profile's guest.
 *
 * @param int $profile_id Profile post ID
 * @return array Formatted interview data
 */
function gmkb_get_profile_interviews($profile_id) {
    // First check for stored featured interview IDs (speaking_credit IDs)
    $interview_ids = get_post_meta($profile_id, 'featured_interviews', true);
    if (!empty($interview_ids) && is_array($interview_ids)) {
        return gmkb_get_interviews_by_ids($interview_ids);
    }

    // Fallback: Get all interviews for the profile's guest from PIT tables
    global $wpdb;
    $credits_table = $wpdb->prefix . 'pit_speaking_credits';
    $engagements_table = $wpdb->prefix . 'pit_engagements';
    $podcasts_table = $wpdb->prefix . 'pit_podcasts';

    // Check if tables exist
    $table_exists = $wpdb->get_var(
        $wpdb->prepare("SHOW TABLES LIKE %s", $credits_table)
    );
    if ($table_exists !== $credits_table) {
        return [];
    }

    // Get guest_id from profile (check common meta keys)
    $guest_id = get_post_meta($profile_id, 'pit_guest_id', true);
    if (!$guest_id) {
        $guest_id = get_post_meta($profile_id, 'guest_id', true);
    }
    if (!$guest_id) {
        return [];
    }

    $results = $wpdb->get_results(
        $wpdb->prepare(
            "SELECT
                sc.id as credit_id,
                e.episode_title,
                e.episode_url,
                e.publish_date,
                e.duration,
                e.topics,
                p.podcast_name,
                p.host_name,
                p.artwork_url
            FROM {$credits_table} sc
            LEFT JOIN {$engagements_table} e ON sc.engagement_id = e.id
            LEFT JOIN {$podcasts_table} p ON e.podcast_id = p.id
            WHERE sc.guest_id = %d
            ORDER BY e.publish_date DESC
            LIMIT 10",
            $guest_id
        )
    );

    $interviews = [];
    foreach ($results as $row) {
        $topics = $row->topics;
        if (is_string($topics)) {
            $topics = array_filter(array_map('trim', explode(',', $topics)));
        }

        $interviews[] = [
            'id' => (int) $row->credit_id,
            'title' => $row->episode_title ?: 'Untitled Episode',
            'podcast_name' => $row->podcast_name ?: '',
            'episode_url' => $row->episode_url ?: '',
            'publish_date' => $row->publish_date ?: '',
            'host_name' => $row->host_name ?: '',
            'duration' => $row->duration ?: '',
            'topics' => $topics ?: [],
            'artwork_url' => $row->artwork_url ?: '',
        ];
    }

    return $interviews;
}

/**
 * Format interview date
 */
function gmkb_format_interview_date($date_str) {
    $timestamp = strtotime($date_str);
    if (!$timestamp) return $date_str;
    return date('M j, Y', $timestamp);
}
