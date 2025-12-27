<?php
/**
 * AEO (Answer Engine Optimization) Optimizer
 *
 * Calculates an AEO score for user profiles and provides recommendations
 * to improve visibility in AI-powered answer engines (ChatGPT, Google SGE,
 * Perplexity, etc.).
 *
 * @package GMKB
 * @since 2.3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_AEO_Optimizer {

    /**
     * Scoring weights for different factors
     */
    const WEIGHTS = [
        'entity_clarity' => 25,    // Clear Person schema with unique identity
        'expertise_depth' => 25,   // Topics, knowsAbout, authority content
        'social_validation' => 20, // sameAs links, social proof
        'content_richness' => 20,  // FAQ, speakable content, biography depth
        'freshness' => 10,         // Recent updates, date signals
    ];

    /**
     * Profile post ID
     *
     * @var int
     */
    private int $post_id;

    /**
     * Cached profile data
     *
     * @var array|null
     */
    private ?array $profile_data = null;

    /**
     * Constructor
     *
     * @param int $post_id Profile post ID
     */
    public function __construct(int $post_id) {
        $this->post_id = $post_id;
    }

    /**
     * Get profile data (cached)
     *
     * @return array Profile data
     */
    private function get_profile_data(): array {
        if ($this->profile_data !== null) {
            return $this->profile_data;
        }

        $this->profile_data = [];
        $meta = get_post_meta($this->post_id);

        foreach ($meta as $key => $values) {
            $this->profile_data[$key] = isset($values[0]) ? maybe_unserialize($values[0]) : '';
        }

        // Add post data
        $post = get_post($this->post_id);
        if ($post) {
            $this->profile_data['_post_modified'] = $post->post_modified;
            $this->profile_data['_post_date'] = $post->post_date;
        }

        return $this->profile_data;
    }

    /**
     * Get a profile field value
     *
     * @param string $key Field key
     * @param mixed  $default Default value
     * @return mixed Field value
     */
    private function get_field(string $key, $default = '') {
        $data = $this->get_profile_data();
        return $data[$key] ?? $default;
    }

    /**
     * Check if a field has a non-empty value
     *
     * @param string $key Field key
     * @return bool Whether field has value
     */
    private function has_field(string $key): bool {
        $value = $this->get_field($key);

        if (is_array($value)) {
            return !empty($value);
        }

        return !empty(trim((string) $value));
    }

    /**
     * Calculate the complete AEO score
     *
     * @return array Score details with breakdown and recommendations
     */
    public function calculate_score(): array {
        $scores = [];
        $recommendations = [];

        // Calculate each factor
        $entity = $this->check_entity_clarity();
        $scores['entity_clarity'] = $entity;
        $recommendations = array_merge($recommendations, $entity['recommendations']);

        $expertise = $this->check_expertise_depth();
        $scores['expertise_depth'] = $expertise;
        $recommendations = array_merge($recommendations, $expertise['recommendations']);

        $social = $this->check_social_validation();
        $scores['social_validation'] = $social;
        $recommendations = array_merge($recommendations, $social['recommendations']);

        $content = $this->check_content_richness();
        $scores['content_richness'] = $content;
        $recommendations = array_merge($recommendations, $content['recommendations']);

        $freshness = $this->check_freshness();
        $scores['freshness'] = $freshness;
        $recommendations = array_merge($recommendations, $freshness['recommendations']);

        // Calculate total score
        $total = 0;
        foreach ($scores as $factor => $data) {
            $weight = self::WEIGHTS[$factor] ?? 0;
            $total += ($data['score'] / 100) * $weight;
        }

        // Sort recommendations by impact
        usort($recommendations, function($a, $b) {
            return $b['impact'] - $a['impact'];
        });

        // Limit to top 5 recommendations
        $recommendations = array_slice($recommendations, 0, 5);

        return [
            'profile_id' => $this->post_id,
            'total_score' => round($total),
            'max_score' => 100,
            'grade' => $this->get_grade($total),
            'factors' => $scores,
            'recommendations' => $recommendations,
            'summary' => $this->generate_summary($total, $scores),
        ];
    }

    /**
     * Check Entity Clarity factor (25%)
     * "Can AI clearly identify who this person is?"
     *
     * @return array Factor score and recommendations
     */
    private function check_entity_clarity(): array {
        $score = 0;
        $max = 100;
        $recommendations = [];
        $checks = [];

        // Full name (20%)
        $has_name = $this->has_field('first_name') && $this->has_field('last_name');
        $checks['full_name'] = $has_name;
        if ($has_name) {
            $score += 20;
        } else {
            $recommendations[] = [
                'factor' => 'entity_clarity',
                'field' => 'name',
                'message' => 'Add your full name (first and last) for clear identity',
                'impact' => 20,
            ];
        }

        // Job title (20%)
        $has_title = $this->has_field('guest_title');
        $checks['job_title'] = $has_title;
        if ($has_title) {
            $score += 20;
        } else {
            $recommendations[] = [
                'factor' => 'entity_clarity',
                'field' => 'guest_title',
                'message' => 'Add your professional title/role',
                'impact' => 15,
            ];
        }

        // Organization (15%)
        $has_company = $this->has_field('company');
        $checks['organization'] = $has_company;
        if ($has_company) {
            $score += 15;
        } else {
            $recommendations[] = [
                'factor' => 'entity_clarity',
                'field' => 'company',
                'message' => 'Add your organization or business name',
                'impact' => 10,
            ];
        }

        // Headshot (20%)
        $has_image = $this->has_field('headshot_primary');
        $checks['headshot'] = $has_image;
        if ($has_image) {
            $score += 20;
        } else {
            $recommendations[] = [
                'factor' => 'entity_clarity',
                'field' => 'headshot_primary',
                'message' => 'Add a professional headshot for visual identity',
                'impact' => 15,
            ];
        }

        // Unique description (25%)
        $has_tagline = $this->has_field('tagline');
        $has_authority = $this->has_field('authority_hook');
        $has_description = $has_tagline || $has_authority;
        $checks['description'] = $has_description;
        if ($has_description) {
            $score += 25;
        } else {
            $recommendations[] = [
                'factor' => 'entity_clarity',
                'field' => 'tagline',
                'message' => 'Add a tagline or authority hook to describe what you do',
                'impact' => 20,
            ];
        }

        return [
            'score' => $score,
            'max' => $max,
            'label' => 'Entity Clarity',
            'description' => 'How clearly AI can identify who you are',
            'checks' => $checks,
            'recommendations' => $recommendations,
        ];
    }

    /**
     * Check Expertise Depth factor (25%)
     * "Does this person demonstrate deep expertise?"
     *
     * @return array Factor score and recommendations
     */
    private function check_expertise_depth(): array {
        $score = 0;
        $max = 100;
        $recommendations = [];
        $checks = [];

        // Topics (30%) - need 3+ for full credit
        $topic_count = 0;
        for ($i = 1; $i <= 5; $i++) {
            if ($this->has_field("topic_{$i}")) {
                $topic_count++;
            }
        }
        $checks['topics'] = $topic_count;

        if ($topic_count >= 3) {
            $score += 30;
        } elseif ($topic_count > 0) {
            $score += $topic_count * 10;
            $recommendations[] = [
                'factor' => 'expertise_depth',
                'field' => 'topics',
                'message' => "Add " . (3 - $topic_count) . " more expertise topics (you have {$topic_count})",
                'impact' => (3 - $topic_count) * 10,
            ];
        } else {
            $recommendations[] = [
                'factor' => 'expertise_depth',
                'field' => 'topics',
                'message' => 'Add at least 3 expertise topics you can discuss',
                'impact' => 25,
            ];
        }

        // Authority hook (25%)
        $has_hook = $this->has_field('authority_hook');
        $checks['authority_hook'] = $has_hook;
        if ($has_hook) {
            $score += 25;
        } else {
            $recommendations[] = [
                'factor' => 'expertise_depth',
                'field' => 'authority_hook',
                'message' => 'Create an authority hook explaining who you help and how',
                'impact' => 20,
            ];
        }

        // Impact intro (20%)
        $has_impact = $this->has_field('impact_intro');
        $checks['impact_intro'] = $has_impact;
        if ($has_impact) {
            $score += 20;
        } else {
            $recommendations[] = [
                'factor' => 'expertise_depth',
                'field' => 'impact_intro',
                'message' => 'Add an impact intro with your key achievements',
                'impact' => 15,
            ];
        }

        // Expertise tags (15%)
        $expertise_tags = $this->get_field('expertise_tags');
        $has_tags = is_array($expertise_tags) && count($expertise_tags) >= 3;
        $checks['expertise_tags'] = $has_tags;
        if ($has_tags) {
            $score += 15;
        }

        // Credentials - alumni, awards, certifications (10%)
        $has_credentials = $this->has_field('alumni_of') ||
                          $this->has_field('awards') ||
                          $this->has_field('certifications');
        $checks['credentials'] = $has_credentials;
        if ($has_credentials) {
            $score += 10;
        }

        return [
            'score' => min($score, $max),
            'max' => $max,
            'label' => 'Expertise Depth',
            'description' => 'Demonstrated knowledge and authority signals',
            'checks' => $checks,
            'recommendations' => $recommendations,
        ];
    }

    /**
     * Check Social Validation factor (20%)
     * "Is this person verified across the web?"
     *
     * @return array Factor score and recommendations
     */
    private function check_social_validation(): array {
        $score = 0;
        $max = 100;
        $recommendations = [];
        $checks = [];

        // Social links (50%) - need 2+ for full credit
        $social_fields = [
            'social_linkedin',
            'social_twitter',
            'social_instagram',
            'social_facebook',
            'social_youtube',
            'social_tiktok',
        ];
        $social_count = 0;
        foreach ($social_fields as $field) {
            if ($this->has_field($field)) {
                $social_count++;
            }
        }
        $checks['social_count'] = $social_count;

        if ($social_count >= 2) {
            $score += 50;
        } elseif ($social_count === 1) {
            $score += 25;
            $recommendations[] = [
                'factor' => 'social_validation',
                'field' => 'social',
                'message' => 'Add at least one more social media profile link',
                'impact' => 15,
            ];
        } else {
            $recommendations[] = [
                'factor' => 'social_validation',
                'field' => 'social',
                'message' => 'Add social media profile links (LinkedIn highly recommended)',
                'impact' => 20,
            ];
        }

        // LinkedIn specifically (20%)
        $has_linkedin = $this->has_field('social_linkedin');
        $checks['linkedin'] = $has_linkedin;
        if ($has_linkedin) {
            $score += 20;
        } else {
            $recommendations[] = [
                'factor' => 'social_validation',
                'field' => 'social_linkedin',
                'message' => 'Add your LinkedIn profile URL',
                'impact' => 15,
            ];
        }

        // Website (20%)
        $has_website = $this->has_field('website_primary');
        $checks['website'] = $has_website;
        if ($has_website) {
            $score += 20;
        } else {
            $recommendations[] = [
                'factor' => 'social_validation',
                'field' => 'website_primary',
                'message' => 'Add your professional website URL',
                'impact' => 10,
            ];
        }

        // Featured logos / press mentions (10%)
        $logos = $this->get_field('logos');
        $has_logos = is_array($logos) ? !empty($logos) : !empty($logos);
        $checks['logos'] = $has_logos;
        if ($has_logos) {
            $score += 10;
        }

        return [
            'score' => min($score, $max),
            'max' => $max,
            'label' => 'Social Validation',
            'description' => 'Cross-platform identity verification',
            'checks' => $checks,
            'recommendations' => $recommendations,
        ];
    }

    /**
     * Check Content Richness factor (20%)
     * "Is there substantial, answerable content?"
     *
     * @return array Factor score and recommendations
     */
    private function check_content_richness(): array {
        $score = 0;
        $max = 100;
        $recommendations = [];
        $checks = [];

        // Biography depth (30%)
        $biography = $this->get_field('biography');
        $bio_length = strlen(wp_strip_all_tags($biography));
        $checks['biography_length'] = $bio_length;

        if ($bio_length >= 500) {
            $score += 30;
        } elseif ($bio_length >= 200) {
            $score += 20;
        } elseif ($bio_length > 0) {
            $score += 10;
            $recommendations[] = [
                'factor' => 'content_richness',
                'field' => 'biography',
                'message' => 'Expand your biography to at least 200 words for better AI understanding',
                'impact' => 15,
            ];
        } else {
            $recommendations[] = [
                'factor' => 'content_richness',
                'field' => 'biography',
                'message' => 'Add a detailed professional biography',
                'impact' => 20,
            ];
        }

        // Interview questions for FAQ (40%) - need 5+ for full credit
        $question_count = 0;
        for ($i = 1; $i <= 25; $i++) {
            if ($this->has_field("question_{$i}")) {
                $question_count++;
            }
        }
        $checks['question_count'] = $question_count;

        if ($question_count >= 5) {
            $score += 40;
        } elseif ($question_count >= 3) {
            $score += 25;
            $recommendations[] = [
                'factor' => 'content_richness',
                'field' => 'questions',
                'message' => 'Add ' . (5 - $question_count) . ' more interview questions for richer FAQ schema',
                'impact' => 10,
            ];
        } elseif ($question_count > 0) {
            $score += 10;
            $recommendations[] = [
                'factor' => 'content_richness',
                'field' => 'questions',
                'message' => 'Add at least 5 interview questions you can answer',
                'impact' => 15,
            ];
        } else {
            $recommendations[] = [
                'factor' => 'content_richness',
                'field' => 'questions',
                'message' => 'Add interview questions - these become FAQ rich snippets',
                'impact' => 25,
            ];
        }

        // Why book you / value proposition (20%)
        $has_why = $this->has_field('why_book_you');
        $checks['why_book_you'] = $has_why;
        if ($has_why) {
            $score += 20;
        }

        // Podcast intro (10%)
        $has_intro = $this->has_field('podcast_intro');
        $checks['podcast_intro'] = $has_intro;
        if ($has_intro) {
            $score += 10;
        }

        return [
            'score' => min($score, $max),
            'max' => $max,
            'label' => 'Content Richness',
            'description' => 'Depth of answerable content',
            'checks' => $checks,
            'recommendations' => $recommendations,
        ];
    }

    /**
     * Check Freshness factor (10%)
     * "Is this content recent and maintained?"
     *
     * @return array Factor score and recommendations
     */
    private function check_freshness(): array {
        $score = 0;
        $max = 100;
        $recommendations = [];
        $checks = [];

        // Last modified date
        $modified = $this->get_field('_post_modified');
        $checks['last_modified'] = $modified;

        if ($modified) {
            $modified_time = strtotime($modified);
            $now = time();
            $days_ago = ($now - $modified_time) / (60 * 60 * 24);

            if ($days_ago <= 30) {
                $score += 100; // Updated in last month
            } elseif ($days_ago <= 90) {
                $score += 75; // Updated in last 3 months
            } elseif ($days_ago <= 180) {
                $score += 50; // Updated in last 6 months
            } elseif ($days_ago <= 365) {
                $score += 25; // Updated in last year
                $recommendations[] = [
                    'factor' => 'freshness',
                    'field' => 'profile',
                    'message' => 'Review and update your profile - it hasn\'t been updated recently',
                    'impact' => 5,
                ];
            } else {
                $recommendations[] = [
                    'factor' => 'freshness',
                    'field' => 'profile',
                    'message' => 'Your profile is over a year old - consider updating it',
                    'impact' => 8,
                ];
            }

            $checks['days_since_update'] = round($days_ago);
        }

        return [
            'score' => min($score, $max),
            'max' => $max,
            'label' => 'Freshness',
            'description' => 'How recently the profile was updated',
            'checks' => $checks,
            'recommendations' => $recommendations,
        ];
    }

    /**
     * Get letter grade for score
     *
     * @param int $score Total score
     * @return string Letter grade
     */
    private function get_grade(int $score): string {
        if ($score >= 90) return 'A';
        if ($score >= 80) return 'B';
        if ($score >= 70) return 'C';
        if ($score >= 60) return 'D';
        return 'F';
    }

    /**
     * Generate summary text based on score
     *
     * @param int   $score  Total score
     * @param array $factors Factor scores
     * @return string Summary text
     */
    private function generate_summary(int $score, array $factors): string {
        if ($score >= 90) {
            return 'Excellent! Your profile is highly optimized for AI visibility. You\'re likely to appear in AI-generated answers.';
        }

        if ($score >= 80) {
            return 'Great job! Your profile has strong AEO signals. A few improvements could push you to the top tier.';
        }

        if ($score >= 70) {
            return 'Good foundation! Focus on the recommendations below to improve your AI visibility.';
        }

        if ($score >= 60) {
            return 'Your profile needs work to be visible to AI systems. Follow the recommendations to improve.';
        }

        // Find weakest factor
        $weakest = null;
        $weakest_score = 100;
        foreach ($factors as $key => $factor) {
            if ($factor['score'] < $weakest_score) {
                $weakest_score = $factor['score'];
                $weakest = $factor['label'];
            }
        }

        return "Your profile has low AI visibility. Start by improving your {$weakest} - it's your biggest opportunity.";
    }

    /**
     * Get optimization recommendations as actionable items
     *
     * @return array Array of recommendation objects
     */
    public function get_recommendations(): array {
        $result = $this->calculate_score();
        return $result['recommendations'];
    }

    /**
     * Get just the score number
     *
     * @return int AEO score (0-100)
     */
    public function get_score(): int {
        $result = $this->calculate_score();
        return $result['total_score'];
    }
}
