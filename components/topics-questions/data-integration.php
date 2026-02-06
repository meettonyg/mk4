<?php
/**
 * Topics & Questions Component - Data Integration
 *
 * PHASE 8: Uses native WordPress post_meta ONLY - NO Pods dependency
 * Combined component that loads both topics and questions data
 *
 * @package Guestify/Components/TopicsQuestions
 * @version 3.0.0-native
 */

if (!defined('ABSPATH')) {
    exit;
}

class Topics_Questions_Data_Integration {

    protected static $component_type = 'topics-questions';

    /**
     * Load topics and questions data from native WordPress meta
     */
    public static function load_component_data($post_id) {
        $result = array(
            'topics' => array(),
            'questions' => array(),
            'topics_count' => 0,
            'questions_count' => 0,
            'source' => 'native_meta',
            'component_type' => self::$component_type,
            'success' => false,
            'message' => '',
            'timestamp' => current_time('mysql')
        );

        if (!is_numeric($post_id) || $post_id <= 0) {
            $result['message'] = 'Invalid post ID';
            return $result;
        }

        // Load topics (1-5)
        for ($i = 1; $i <= 5; $i++) {
            $topic_value = get_post_meta($post_id, "topic_{$i}", true);

            if (!empty($topic_value)) {
                $topic_data = self::parse_topic_string(trim($topic_value), $i);
                $result['topics'][] = $topic_data;
                $result['topics_count']++;
            }
        }

        // Load questions (1-25)
        for ($i = 1; $i <= 25; $i++) {
            $question_value = get_post_meta($post_id, "question_{$i}", true);

            if (!empty($question_value)) {
                $result['questions'][] = array(
                    'id' => 'question_' . $i,
                    'index' => $i,
                    'question' => trim($question_value),
                    'text' => trim($question_value)
                );
                $result['questions_count']++;
            }
        }

        if ($result['topics_count'] > 0 || $result['questions_count'] > 0) {
            $result['success'] = true;
            $result['message'] = "Loaded {$result['topics_count']} topics and {$result['questions_count']} questions";
        } else {
            $result['message'] = 'No topics or questions found';
        }

        return $result;
    }

    /**
     * Parse topic string into structured data
     */
    private static function parse_topic_string($topic_string, $index) {
        $topic_data = array(
            'id' => 'topic_' . $index,
            'index' => $index,
            'title' => '',
            'description' => ''
        );

        if (strpos($topic_string, ':') !== false) {
            list($title, $description) = explode(':', $topic_string, 2);
            $topic_data['title'] = trim($title);
            $topic_data['description'] = trim($description);
        } else {
            $topic_data['title'] = $topic_string;
        }

        $topic_data['name'] = $topic_data['title'];
        $topic_data['text'] = $topic_data['title'];

        return $topic_data;
    }

    /**
     * Save topics and questions data to native WordPress meta
     */
    public static function save_component_data($post_id, $data) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return array('success' => false, 'message' => 'Invalid post ID');
        }

        $topics_count = 0;
        $questions_count = 0;

        // Save topics
        $topics = isset($data['topics']) ? $data['topics'] : array();
        for ($i = 1; $i <= 5; $i++) {
            $meta_key = "topic_{$i}";

            if (isset($topics[$i - 1])) {
                $topic = $topics[$i - 1];
                $topic_string = is_array($topic)
                    ? ($topic['title'] ?? '') . (!empty($topic['description']) ? ': ' . $topic['description'] : '')
                    : $topic;

                if (!empty(trim($topic_string))) {
                    update_post_meta($post_id, $meta_key, sanitize_text_field(trim($topic_string)));
                    $topics_count++;
                } else {
                    delete_post_meta($post_id, $meta_key);
                }
            } else {
                delete_post_meta($post_id, $meta_key);
            }
        }

        // Save questions
        $questions = isset($data['questions']) ? $data['questions'] : array();
        for ($i = 1; $i <= 25; $i++) {
            $meta_key = "question_{$i}";

            if (isset($questions[$i - 1])) {
                $question = $questions[$i - 1];
                $question_text = is_array($question) ? ($question['question'] ?? $question['text'] ?? '') : $question;

                if (!empty(trim($question_text))) {
                    update_post_meta($post_id, $meta_key, wp_kses_post(trim($question_text)));
                    $questions_count++;
                } else {
                    delete_post_meta($post_id, $meta_key);
                }
            } else {
                delete_post_meta($post_id, $meta_key);
            }
        }

        return array(
            'success' => true,
            'topics_count' => $topics_count,
            'questions_count' => $questions_count,
            'message' => "Saved {$topics_count} topics and {$questions_count} questions"
        );
    }

    /**
     * Check if topics or questions data exists
     */
    public static function has_component_data($post_id) {
        if (!is_numeric($post_id) || $post_id <= 0) {
            return false;
        }

        // Check topics
        for ($i = 1; $i <= 5; $i++) {
            $topic = get_post_meta($post_id, "topic_{$i}", true);
            if (!empty($topic)) return true;
        }

        // Check questions
        for ($i = 1; $i <= 25; $i++) {
            $question = get_post_meta($post_id, "question_{$i}", true);
            if (!empty($question)) return true;
        }

        return false;
    }

    /**
     * Prepare template props
     */
    public static function prepare_template_props($component_data, $existing_props = array()) {
        $props = $existing_props;

        $props['topics'] = $component_data['topics'] ?? array();
        $props['questions'] = $component_data['questions'] ?? array();
        $props['topics_count'] = count($props['topics']);
        $props['questions_count'] = count($props['questions']);
        $props['has_topics'] = !empty($props['topics']);
        $props['has_questions'] = !empty($props['questions']);
        $props['has_content'] = $props['has_topics'] || $props['has_questions'];

        return $props;
    }
}

/**
 * Enrich topics-questions props for frontend rendering
 */
add_filter('gmkb_enrich_topics-questions_props', function($props, $post_id) {
    $data = Topics_Questions_Data_Integration::load_component_data($post_id);

    if ($data['success']) {
        $props = Topics_Questions_Data_Integration::prepare_template_props($data, $props);
    }

    return $props;
}, 10, 2);

GMKB_Logger::startup('Topics & Questions Data Integration loaded');
