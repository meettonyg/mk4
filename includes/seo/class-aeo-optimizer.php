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
     * Entity Clarity scoring values
     */
    private const SCORE_ENTITY_FULL_NAME = 20;
    private const SCORE_ENTITY_JOB_TITLE = 20;
    private const SCORE_ENTITY_ORGANIZATION = 15;
    private const SCORE_ENTITY_HEADSHOT = 20;
    private const SCORE_ENTITY_DESCRIPTION = 25;

    /**
     * Expertise Depth scoring values
     */
    private const SCORE_EXPERTISE_TOPICS_FULL = 30;       // 3+ topics
    private const SCORE_EXPERTISE_TOPIC_EACH = 10;        // Per topic (< 3)
    private const SCORE_EXPERTISE_AUTHORITY_HOOK = 25;
    private const SCORE_EXPERTISE_IMPACT_INTRO = 20;
    private const SCORE_EXPERTISE_TAGS = 15;
    private const SCORE_EXPERTISE_CREDENTIALS = 10;
    private const MIN_TOPICS_FOR_FULL_SCORE = 3;

    /**
     * Social Validation scoring values
     */
    private const SCORE_SOCIAL_LINKS_FULL = 50;           // 2+ social links
    private const SCORE_SOCIAL_LINKS_SINGLE = 25;         // 1 social link
    private const SCORE_SOCIAL_LINKEDIN = 20;
    private const SCORE_SOCIAL_WEBSITE = 20;
    private const SCORE_SOCIAL_LOGOS = 10;
    private const MIN_SOCIAL_FOR_FULL_SCORE = 2;

    /**
     * Content Richness scoring values
     */
    private const SCORE_CONTENT_BIO_LONG = 30;            // 500+ chars
    private const SCORE_CONTENT_BIO_MEDIUM = 20;          // 200+ chars
    private const SCORE_CONTENT_BIO_SHORT = 10;           // Any content
    private const BIO_LENGTH_LONG = 500;
    private const BIO_LENGTH_MEDIUM = 200;
    private const SCORE_CONTENT_QUESTIONS_FULL = 40;      // 5+ questions
    private const SCORE_CONTENT_QUESTIONS_SOME = 25;      // 3+ questions
    private const SCORE_CONTENT_QUESTIONS_FEW = 10;       // Any questions
    private const MIN_QUESTIONS_FOR_FULL_SCORE = 5;
    private const MIN_QUESTIONS_FOR_SOME_SCORE = 3;
    private const SCORE_CONTENT_WHY_BOOK = 20;
    private const SCORE_CONTENT_PODCAST_INTRO = 10;

    /**
     * Freshness scoring values (days thresholds)
     */
    private const FRESHNESS_EXCELLENT_DAYS = 30;
    private const FRESHNESS_GOOD_DAYS = 90;
    private const FRESHNESS_FAIR_DAYS = 180;
    private const FRESHNESS_STALE_DAYS = 365;
    private const SCORE_FRESHNESS_EXCELLENT = 100;
    private const SCORE_FRESHNESS_GOOD = 75;
    private const SCORE_FRESHNESS_FAIR = 50;
    private const SCORE_FRESHNESS_STALE = 25;

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

        // Full name
        $has_name = $this->has_field('first_name') && $this->has_field('last_name');
        $checks['full_name'] = $has_name;
        if ($has_name) {
            $score += self::SCORE_ENTITY_FULL_NAME;
        } else {
            $recommendations[] = [
                'factor' => 'entity_clarity',
                'field' => 'name',
                'message' => 'Add your full name (first and last) for clear identity',
                'impact' => self::SCORE_ENTITY_FULL_NAME,
            ];
        }

        // Job title
        $has_title = $this->has_field('guest_title');
        $checks['job_title'] = $has_title;
        if ($has_title) {
            $score += self::SCORE_ENTITY_JOB_TITLE;
        } else {
            $recommendations[] = [
                'factor' => 'entity_clarity',
                'field' => 'guest_title',
                'message' => 'Add your professional title/role',
                'impact' => self::SCORE_ENTITY_JOB_TITLE - 5,
            ];
        }

        // Organization
        $has_company = $this->has_field('company');
        $checks['organization'] = $has_company;
        if ($has_company) {
            $score += self::SCORE_ENTITY_ORGANIZATION;
        } else {
            $recommendations[] = [
                'factor' => 'entity_clarity',
                'field' => 'company',
                'message' => 'Add your organization or business name',
                'impact' => self::SCORE_ENTITY_ORGANIZATION - 5,
            ];
        }

        // Headshot
        $has_image = $this->has_field('headshot_primary');
        $checks['headshot'] = $has_image;
        if ($has_image) {
            $score += self::SCORE_ENTITY_HEADSHOT;
        } else {
            $recommendations[] = [
                'factor' => 'entity_clarity',
                'field' => 'headshot_primary',
                'message' => 'Add a professional headshot for visual identity',
                'impact' => self::SCORE_ENTITY_HEADSHOT - 5,
            ];
        }

        // Unique description
        $has_tagline = $this->has_field('tagline');
        $has_authority = $this->has_field('authority_hook');
        $has_description = $has_tagline || $has_authority;
        $checks['description'] = $has_description;
        if ($has_description) {
            $score += self::SCORE_ENTITY_DESCRIPTION;
        } else {
            $recommendations[] = [
                'factor' => 'entity_clarity',
                'field' => 'tagline',
                'message' => 'Add a tagline or authority hook to describe what you do',
                'impact' => self::SCORE_ENTITY_DESCRIPTION - 5,
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

        // Topics - need MIN_TOPICS_FOR_FULL_SCORE+ for full credit
        $topic_fields = GMKB_Profile_Schema::get_fields_by_group('topics');
        $topic_count = 0;
        foreach ($topic_fields as $field) {
            if (strpos($field, 'topic_') === 0 && $this->has_field($field)) {
                $topic_count++;
            }
        }
        $checks['topics'] = $topic_count;

        if ($topic_count >= self::MIN_TOPICS_FOR_FULL_SCORE) {
            $score += self::SCORE_EXPERTISE_TOPICS_FULL;
        } elseif ($topic_count > 0) {
            $score += $topic_count * self::SCORE_EXPERTISE_TOPIC_EACH;
            $recommendations[] = [
                'factor' => 'expertise_depth',
                'field' => 'topics',
                'message' => "Add " . (self::MIN_TOPICS_FOR_FULL_SCORE - $topic_count) . " more expertise topics (you have {$topic_count})",
                'impact' => (self::MIN_TOPICS_FOR_FULL_SCORE - $topic_count) * self::SCORE_EXPERTISE_TOPIC_EACH,
            ];
        } else {
            $recommendations[] = [
                'factor' => 'expertise_depth',
                'field' => 'topics',
                'message' => 'Add at least ' . self::MIN_TOPICS_FOR_FULL_SCORE . ' expertise topics you can discuss',
                'impact' => self::SCORE_EXPERTISE_AUTHORITY_HOOK,
            ];
        }

        // Authority hook
        $has_hook = $this->has_field('authority_hook');
        $checks['authority_hook'] = $has_hook;
        if ($has_hook) {
            $score += self::SCORE_EXPERTISE_AUTHORITY_HOOK;
        } else {
            $recommendations[] = [
                'factor' => 'expertise_depth',
                'field' => 'authority_hook',
                'message' => 'Create an authority hook explaining who you help and how',
                'impact' => self::SCORE_EXPERTISE_AUTHORITY_HOOK - 5,
            ];
        }

        // Impact intro
        $has_impact = $this->has_field('impact_intro');
        $checks['impact_intro'] = $has_impact;
        if ($has_impact) {
            $score += self::SCORE_EXPERTISE_IMPACT_INTRO;
        } else {
            $recommendations[] = [
                'factor' => 'expertise_depth',
                'field' => 'impact_intro',
                'message' => 'Add an impact intro with your key achievements',
                'impact' => self::SCORE_EXPERTISE_IMPACT_INTRO - 5,
            ];
        }

        // Expertise tags
        $expertise_tags = $this->get_field('expertise_tags');
        $has_tags = is_array($expertise_tags) && count($expertise_tags) >= self::MIN_TOPICS_FOR_FULL_SCORE;
        $checks['expertise_tags'] = $has_tags;
        if ($has_tags) {
            $score += self::SCORE_EXPERTISE_TAGS;
        }

        // Credentials - alumni, awards, certifications
        $has_credentials = $this->has_field('alumni_of') ||
                          $this->has_field('awards') ||
                          $this->has_field('certifications');
        $checks['credentials'] = $has_credentials;
        if ($has_credentials) {
            $score += self::SCORE_EXPERTISE_CREDENTIALS;
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

        // Social links - need MIN_SOCIAL_FOR_FULL_SCORE+ for full credit
        $social_fields = GMKB_Profile_Schema::get_fields_by_group('social');
        $social_count = 0;
        foreach ($social_fields as $field) {
            if (strpos($field, 'social_') === 0 && $this->has_field($field)) {
                $social_count++;
            }
        }
        $checks['social_count'] = $social_count;

        if ($social_count >= self::MIN_SOCIAL_FOR_FULL_SCORE) {
            $score += self::SCORE_SOCIAL_LINKS_FULL;
        } elseif ($social_count === 1) {
            $score += self::SCORE_SOCIAL_LINKS_SINGLE;
            $recommendations[] = [
                'factor' => 'social_validation',
                'field' => 'social',
                'message' => 'Add at least one more social media profile link',
                'impact' => self::SCORE_SOCIAL_LINKEDIN - 5,
            ];
        } else {
            $recommendations[] = [
                'factor' => 'social_validation',
                'field' => 'social',
                'message' => 'Add social media profile links (LinkedIn highly recommended)',
                'impact' => self::SCORE_SOCIAL_LINKEDIN,
            ];
        }

        // LinkedIn specifically
        $has_linkedin = $this->has_field('social_linkedin');
        $checks['linkedin'] = $has_linkedin;
        if ($has_linkedin) {
            $score += self::SCORE_SOCIAL_LINKEDIN;
        } else {
            $recommendations[] = [
                'factor' => 'social_validation',
                'field' => 'social_linkedin',
                'message' => 'Add your LinkedIn profile URL',
                'impact' => self::SCORE_SOCIAL_LINKEDIN - 5,
            ];
        }

        // Website
        $has_website = $this->has_field('website_primary');
        $checks['website'] = $has_website;
        if ($has_website) {
            $score += self::SCORE_SOCIAL_WEBSITE;
        } else {
            $recommendations[] = [
                'factor' => 'social_validation',
                'field' => 'website_primary',
                'message' => 'Add your professional website URL',
                'impact' => self::SCORE_SOCIAL_LOGOS,
            ];
        }

        // Featured logos / press mentions
        $logos = $this->get_field('logos');
        $has_logos = is_array($logos) ? !empty($logos) : !empty($logos);
        $checks['logos'] = $has_logos;
        if ($has_logos) {
            $score += self::SCORE_SOCIAL_LOGOS;
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

        // Biography depth
        $biography = $this->get_field('biography');
        $bio_length = strlen(wp_strip_all_tags($biography));
        $checks['biography_length'] = $bio_length;

        if ($bio_length >= self::BIO_LENGTH_LONG) {
            $score += self::SCORE_CONTENT_BIO_LONG;
        } elseif ($bio_length >= self::BIO_LENGTH_MEDIUM) {
            $score += self::SCORE_CONTENT_BIO_MEDIUM;
        } elseif ($bio_length > 0) {
            $score += self::SCORE_CONTENT_BIO_SHORT;
            $recommendations[] = [
                'factor' => 'content_richness',
                'field' => 'biography',
                'message' => 'Expand your biography to at least ' . self::BIO_LENGTH_MEDIUM . ' characters for better AI understanding',
                'impact' => self::SCORE_CONTENT_BIO_MEDIUM - self::SCORE_CONTENT_BIO_SHORT,
            ];
        } else {
            $recommendations[] = [
                'factor' => 'content_richness',
                'field' => 'biography',
                'message' => 'Add a detailed professional biography',
                'impact' => self::SCORE_CONTENT_BIO_MEDIUM,
            ];
        }

        // Interview questions for FAQ - dynamically from schema
        $question_fields = GMKB_Profile_Schema::get_fields_by_group('questions');
        $question_count = 0;
        foreach ($question_fields as $field) {
            if ($this->has_field($field)) {
                $question_count++;
            }
        }
        $checks['question_count'] = $question_count;

        if ($question_count >= self::MIN_QUESTIONS_FOR_FULL_SCORE) {
            $score += self::SCORE_CONTENT_QUESTIONS_FULL;
        } elseif ($question_count >= self::MIN_QUESTIONS_FOR_SOME_SCORE) {
            $score += self::SCORE_CONTENT_QUESTIONS_SOME;
            $recommendations[] = [
                'factor' => 'content_richness',
                'field' => 'questions',
                'message' => 'Add ' . (self::MIN_QUESTIONS_FOR_FULL_SCORE - $question_count) . ' more interview questions for richer FAQ schema',
                'impact' => self::SCORE_CONTENT_QUESTIONS_FEW,
            ];
        } elseif ($question_count > 0) {
            $score += self::SCORE_CONTENT_QUESTIONS_FEW;
            $recommendations[] = [
                'factor' => 'content_richness',
                'field' => 'questions',
                'message' => 'Add at least ' . self::MIN_QUESTIONS_FOR_FULL_SCORE . ' interview questions you can answer',
                'impact' => self::SCORE_CONTENT_QUESTIONS_SOME - self::SCORE_CONTENT_QUESTIONS_FEW,
            ];
        } else {
            $recommendations[] = [
                'factor' => 'content_richness',
                'field' => 'questions',
                'message' => 'Add interview questions - these become FAQ rich snippets',
                'impact' => self::SCORE_CONTENT_QUESTIONS_SOME,
            ];
        }

        // Why book you / value proposition
        $has_why = $this->has_field('why_book_you');
        $checks['why_book_you'] = $has_why;
        if ($has_why) {
            $score += self::SCORE_CONTENT_WHY_BOOK;
        }

        // Podcast intro
        $has_intro = $this->has_field('podcast_intro');
        $checks['podcast_intro'] = $has_intro;
        if ($has_intro) {
            $score += self::SCORE_CONTENT_PODCAST_INTRO;
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

            if ($days_ago <= self::FRESHNESS_EXCELLENT_DAYS) {
                $score += self::SCORE_FRESHNESS_EXCELLENT; // Updated in last month
            } elseif ($days_ago <= self::FRESHNESS_GOOD_DAYS) {
                $score += self::SCORE_FRESHNESS_GOOD; // Updated in last 3 months
            } elseif ($days_ago <= self::FRESHNESS_FAIR_DAYS) {
                $score += self::SCORE_FRESHNESS_FAIR; // Updated in last 6 months
            } elseif ($days_ago <= self::FRESHNESS_STALE_DAYS) {
                $score += self::SCORE_FRESHNESS_STALE; // Updated in last year
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
