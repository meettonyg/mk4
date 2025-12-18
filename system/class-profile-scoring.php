<?php
/**
 * Profile Scoring System (Cialdini Influence Model)
 *
 * Calculates 0-100% "Profile Strength" based on psychological influence principles.
 * This is DISTINCT from Onboarding Gamification points (which track task completion).
 *
 * Purpose: Answer "Is my profile good enough to get a 'Yes' from podcast hosts?"
 *
 * The Four Pillars of Influence:
 * 1. Identity & Liking (20%)   - "I am a real, relatable human"
 * 2. Authority & Expertise (30%) - "I am an expert you can trust"
 * 3. Reciprocity & Value (30%)   - "I give value to your audience"
 * 4. Validation & Social Proof (20%) - "Others trust me"
 *
 * @package GMKB
 * @since 2.2.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Profile_Scoring {

    /**
     * Pillar weights (total = 100)
     */
    const PILLAR_WEIGHTS = [
        'identity'  => 20,
        'authority' => 30,
        'value'     => 30,
        'proof'     => 20,
    ];

    /**
     * Field definitions for each pillar
     */
    const PILLAR_FIELDS = [
        'identity' => [
            'first_name'       => ['points' => 5, 'label' => 'First Name', 'required' => true],
            'guest_title'      => ['points' => 5, 'label' => 'Professional Title', 'required' => true],
            'headshot_primary' => ['points' => 5, 'label' => 'Professional Headshot', 'required' => true],
            'biography'        => ['points' => 5, 'label' => 'Biography', 'required' => true],
        ],
        'authority' => [
            'authority_hook' => ['points' => 15, 'label' => 'Authority Hook', 'required' => false],
            'impact_intro'   => ['points' => 15, 'label' => 'Impact Intro', 'required' => false],
        ],
        'value' => [
            'topics'    => ['points' => 15, 'label' => 'Interview Topics (3+)', 'min_required' => 3, 'required' => false],
            'questions' => ['points' => 10, 'label' => 'Interview Questions (3+)', 'min_required' => 3, 'required' => false],
            'offer'     => ['points' => 5, 'label' => 'Audience Offer/Lead Magnet', 'required' => false, 'fallback' => 'topics_bonus'],
        ],
        'proof' => [
            'social'  => ['points' => 10, 'label' => 'Social Media Links (1+)', 'min_required' => 1, 'required' => false],
            'website' => ['points' => 5, 'label' => 'Website URL', 'required' => false],
            'logos'   => ['points' => 5, 'label' => 'Featured In Logos', 'required' => false, 'fallback' => 'social_bonus'],
        ],
    ];

    /**
     * Topic fields to check
     */
    const TOPIC_FIELDS = ['topic_1', 'topic_2', 'topic_3', 'topic_4', 'topic_5'];

    /**
     * Question fields to check (first 10)
     */
    const QUESTION_FIELDS = [
        'question_1', 'question_2', 'question_3', 'question_4', 'question_5',
        'question_6', 'question_7', 'question_8', 'question_9', 'question_10',
    ];

    /**
     * Social media fields to check
     */
    const SOCIAL_FIELDS = [
        'social_linkedin', 'social_twitter', 'social_instagram',
        'social_facebook', 'social_youtube', 'social_tiktok', 'social_pinterest',
    ];

    /**
     * Calculate the Influence Score for a profile
     *
     * @param int $post_id The guest_profile post ID
     * @return array Score details with breakdown by pillar
     */
    public static function calculate_strength(int $post_id): array {
        $total_score = 0;
        $pillars = [];
        $missing_fields = [];
        $recommendations = [];

        // --- Pillar 1: Identity & Liking (20%) ---
        $identity = self::calculate_identity_pillar($post_id);
        $pillars['identity'] = $identity;
        $total_score += $identity['score'];
        if (!empty($identity['missing'])) {
            $missing_fields = array_merge($missing_fields, $identity['missing']);
        }

        // --- Pillar 2: Authority & Expertise (30%) ---
        $authority = self::calculate_authority_pillar($post_id);
        $pillars['authority'] = $authority;
        $total_score += $authority['score'];
        if (!empty($authority['missing'])) {
            $missing_fields = array_merge($missing_fields, $authority['missing']);
        }

        // --- Pillar 3: Reciprocity & Value (30%) ---
        $value = self::calculate_value_pillar($post_id);
        $pillars['value'] = $value;
        $total_score += $value['score'];
        if (!empty($value['missing'])) {
            $missing_fields = array_merge($missing_fields, $value['missing']);
        }

        // --- Pillar 4: Validation & Social Proof (20%) ---
        $proof = self::calculate_proof_pillar($post_id);
        $pillars['proof'] = $proof;
        $total_score += $proof['score'];
        if (!empty($proof['missing'])) {
            $missing_fields = array_merge($missing_fields, $proof['missing']);
        }

        // Generate recommendations based on missing fields
        $recommendations = self::generate_recommendations($pillars);

        // Determine profile status
        $status = self::determine_status($total_score, $pillars);

        return [
            'profile_id'      => $post_id,
            'total_score'     => min($total_score, 100),
            'percentage'      => min($total_score, 100),
            'status'          => $status,
            'pillars'         => $pillars,
            'missing_fields'  => $missing_fields,
            'recommendations' => $recommendations,
            'is_complete'     => $total_score >= 80,
            'is_publishable'  => $pillars['identity']['score'] === self::PILLAR_WEIGHTS['identity'],
        ];
    }

    /**
     * Calculate Identity & Liking pillar (20%)
     * "I am a real, relatable human"
     */
    private static function calculate_identity_pillar(int $post_id): array {
        $score = 0;
        $max = self::PILLAR_WEIGHTS['identity'];
        $missing = [];
        $fields = [];

        $field_defs = self::PILLAR_FIELDS['identity'];

        foreach ($field_defs as $field_key => $config) {
            $has_value = self::field_has_value($post_id, $field_key);
            $fields[$field_key] = $has_value;

            if ($has_value) {
                $score += $config['points'];
            } else {
                $missing[] = [
                    'field' => $field_key,
                    'label' => $config['label'],
                    'points' => $config['points'],
                    'pillar' => 'identity',
                    'required' => $config['required'] ?? false,
                ];
            }
        }

        return [
            'id'          => 'identity',
            'label'       => 'Identity & Liking',
            'description' => 'Present yourself as a real, relatable professional',
            'score'       => $score,
            'max'         => $max,
            'percentage'  => $max > 0 ? round(($score / $max) * 100) : 0,
            'fields'      => $fields,
            'missing'     => $missing,
        ];
    }

    /**
     * Calculate Authority & Expertise pillar (30%)
     * "I am an expert you can trust"
     */
    private static function calculate_authority_pillar(int $post_id): array {
        $score = 0;
        $max = self::PILLAR_WEIGHTS['authority'];
        $missing = [];
        $fields = [];

        // Authority Hook (15%)
        $has_hook = self::field_has_value($post_id, 'authority_hook');
        $fields['authority_hook'] = $has_hook;
        if ($has_hook) {
            $score += 15;
        } else {
            $missing[] = [
                'field'   => 'authority_hook',
                'label'   => 'Authority Hook',
                'points'  => 15,
                'pillar'  => 'authority',
                'tip'     => 'Define who you help, what results you deliver, and how',
            ];
        }

        // Impact Intro (15%)
        $has_intro = self::field_has_value($post_id, 'impact_intro');
        $fields['impact_intro'] = $has_intro;
        if ($has_intro) {
            $score += 15;
        } else {
            $missing[] = [
                'field'   => 'impact_intro',
                'label'   => 'Impact Intro',
                'points'  => 15,
                'pillar'  => 'authority',
                'tip'     => 'Summarize your expertise in 2-3 compelling sentences',
            ];
        }

        return [
            'id'          => 'authority',
            'label'       => 'Authority & Expertise',
            'description' => 'Demonstrate your expert credibility',
            'score'       => $score,
            'max'         => $max,
            'percentage'  => $max > 0 ? round(($score / $max) * 100) : 0,
            'fields'      => $fields,
            'missing'     => $missing,
        ];
    }

    /**
     * Calculate Reciprocity & Value pillar (30%)
     * "I give value to your audience"
     */
    private static function calculate_value_pillar(int $post_id): array {
        $score = 0;
        $max = self::PILLAR_WEIGHTS['value'];
        $missing = [];
        $fields = [];

        // Topics (15% for 3+, partial credit available)
        $topics_count = self::count_fields($post_id, self::TOPIC_FIELDS);
        $fields['topics'] = $topics_count;

        if ($topics_count >= 3) {
            $score += 15;
        } elseif ($topics_count > 0) {
            // Partial credit: 5% per topic up to 15%
            $score += min($topics_count * 5, 15);
            $missing[] = [
                'field'   => 'topics',
                'label'   => 'Interview Topics',
                'points'  => 15 - ($topics_count * 5),
                'pillar'  => 'value',
                'tip'     => "Add " . (3 - $topics_count) . " more topics to maximize this pillar",
            ];
        } else {
            $missing[] = [
                'field'   => 'topics',
                'label'   => 'Interview Topics (3+)',
                'points'  => 15,
                'pillar'  => 'value',
                'tip'     => 'Define at least 3 expert discussion topics',
            ];
        }

        // Questions (10% for 3+)
        $questions_count = self::count_fields($post_id, self::QUESTION_FIELDS);
        $fields['questions'] = $questions_count;

        if ($questions_count >= 3) {
            $score += 10;
        } else {
            $missing[] = [
                'field'   => 'questions',
                'label'   => 'Interview Questions (3+)',
                'points'  => 10,
                'pillar'  => 'value',
                'tip'     => 'Suggest questions hosts can ask you',
            ];
        }

        // Offer/Lead Magnet (5%) with fallback to extra topics
        $has_offer = self::field_has_value($post_id, 'offer_1_link') ||
                     self::field_has_value($post_id, 'offer_1');
        $fields['offer'] = $has_offer;

        if ($has_offer) {
            $score += 5;
        } else {
            // Fallback: Award points if they have 5 topics (showing extra value)
            if ($topics_count >= 5) {
                $score += 5;
                $fields['topics_bonus'] = true;
            } else {
                $missing[] = [
                    'field'   => 'offer',
                    'label'   => 'Audience Offer',
                    'points'  => 5,
                    'pillar'  => 'value',
                    'tip'     => 'Add a free resource or lead magnet for listeners',
                    'optional' => true,
                ];
            }
        }

        return [
            'id'          => 'value',
            'label'       => 'Reciprocity & Value',
            'description' => 'Show you bring value to podcast audiences',
            'score'       => min($score, $max),
            'max'         => $max,
            'percentage'  => $max > 0 ? round((min($score, $max) / $max) * 100) : 0,
            'fields'      => $fields,
            'missing'     => $missing,
        ];
    }

    /**
     * Calculate Validation & Social Proof pillar (20%)
     * "Others trust me"
     */
    private static function calculate_proof_pillar(int $post_id): array {
        $score = 0;
        $max = self::PILLAR_WEIGHTS['proof'];
        $missing = [];
        $fields = [];

        // Social Media Links (10% for 1+)
        $social_count = self::count_fields($post_id, self::SOCIAL_FIELDS);
        $fields['social'] = $social_count;

        if ($social_count >= 1) {
            $score += 10;
        } else {
            $missing[] = [
                'field'   => 'social',
                'label'   => 'Social Media Links',
                'points'  => 10,
                'pillar'  => 'proof',
                'tip'     => 'Add at least one social media profile (LinkedIn recommended)',
            ];
        }

        // Website (5%)
        $has_website = self::field_has_value($post_id, 'website_primary');
        $fields['website'] = $has_website;

        if ($has_website) {
            $score += 5;
        } else {
            $missing[] = [
                'field'   => 'website',
                'label'   => 'Website URL',
                'points'  => 5,
                'pillar'  => 'proof',
                'tip'     => 'Add your professional website',
            ];
        }

        // Featured Logos (5%) with fallback to extra social links
        $logos = get_post_meta($post_id, 'logos', true);
        $has_logos = !empty($logos) && (is_array($logos) ? count($logos) > 0 : !empty(trim($logos)));
        $fields['logos'] = $has_logos;

        if ($has_logos) {
            $score += 5;
        } else {
            // Fallback: Award points if they have 3+ social links
            if ($social_count >= 3) {
                $score += 5;
                $fields['social_bonus'] = true;
            } else {
                $missing[] = [
                    'field'   => 'logos',
                    'label'   => 'Featured In Logos',
                    'points'  => 5,
                    'pillar'  => 'proof',
                    'tip'     => 'Add logos of publications or podcasts you\'ve been featured on',
                    'optional' => true,
                ];
            }
        }

        return [
            'id'          => 'proof',
            'label'       => 'Validation & Social Proof',
            'description' => 'Demonstrate that others trust you',
            'score'       => $score,
            'max'         => $max,
            'percentage'  => $max > 0 ? round(($score / $max) * 100) : 0,
            'fields'      => $fields,
            'missing'     => $missing,
        ];
    }

    /**
     * Generate prioritized recommendations
     */
    private static function generate_recommendations(array $pillars): array {
        $recommendations = [];

        // Priority 1: Identity pillar must be complete (required for publishing)
        if ($pillars['identity']['score'] < $pillars['identity']['max']) {
            foreach ($pillars['identity']['missing'] as $field) {
                $recommendations[] = [
                    'priority' => 'critical',
                    'field'    => $field['field'],
                    'label'    => $field['label'],
                    'points'   => $field['points'],
                    'message'  => "Add your {$field['label']} to make your profile publishable",
                ];
            }
        }

        // Priority 2: Authority pillar (highest point value per field)
        if ($pillars['authority']['score'] < $pillars['authority']['max']) {
            foreach ($pillars['authority']['missing'] as $field) {
                $recommendations[] = [
                    'priority' => 'high',
                    'field'    => $field['field'],
                    'label'    => $field['label'],
                    'points'   => $field['points'],
                    'message'  => $field['tip'] ?? "Complete your {$field['label']}",
                ];
            }
        }

        // Priority 3: Value pillar
        foreach ($pillars['value']['missing'] as $field) {
            if (!isset($field['optional']) || !$field['optional']) {
                $recommendations[] = [
                    'priority' => 'medium',
                    'field'    => $field['field'],
                    'label'    => $field['label'],
                    'points'   => $field['points'],
                    'message'  => $field['tip'] ?? "Add {$field['label']}",
                ];
            }
        }

        // Priority 4: Proof pillar
        foreach ($pillars['proof']['missing'] as $field) {
            if (!isset($field['optional']) || !$field['optional']) {
                $recommendations[] = [
                    'priority' => 'low',
                    'field'    => $field['field'],
                    'label'    => $field['label'],
                    'points'   => $field['points'],
                    'message'  => $field['tip'] ?? "Add {$field['label']}",
                ];
            }
        }

        // Sort by priority and limit to top 5
        $priority_order = ['critical' => 0, 'high' => 1, 'medium' => 2, 'low' => 3];
        usort($recommendations, function($a, $b) use ($priority_order) {
            $pa = $priority_order[$a['priority']] ?? 99;
            $pb = $priority_order[$b['priority']] ?? 99;
            if ($pa === $pb) {
                return $b['points'] - $a['points']; // Higher points first within same priority
            }
            return $pa - $pb;
        });

        return array_slice($recommendations, 0, 5);
    }

    /**
     * Determine profile status based on score
     */
    private static function determine_status(int $score, array $pillars): array {
        // Check if identity is complete (required for publishing)
        $identity_complete = $pillars['identity']['score'] === $pillars['identity']['max'];

        if (!$identity_complete) {
            return [
                'level'   => 'draft',
                'label'   => 'Draft',
                'message' => 'Complete your basic info to publish',
                'color'   => 'gray',
            ];
        }

        if ($score >= 90) {
            return [
                'level'   => 'excellent',
                'label'   => 'Excellent',
                'message' => 'Your profile is highly compelling!',
                'color'   => 'green',
            ];
        }

        if ($score >= 70) {
            return [
                'level'   => 'strong',
                'label'   => 'Strong',
                'message' => 'Your profile is ready to book interviews',
                'color'   => 'blue',
            ];
        }

        if ($score >= 50) {
            return [
                'level'   => 'good',
                'label'   => 'Good',
                'message' => 'A few additions will make you stand out',
                'color'   => 'yellow',
            ];
        }

        return [
            'level'   => 'needs_work',
            'label'   => 'Needs Work',
            'message' => 'Add more content to improve your chances',
            'color'   => 'orange',
        ];
    }

    /**
     * Helper: Check if field has a non-empty value
     */
    private static function field_has_value(int $post_id, string $key): bool {
        $value = get_post_meta($post_id, $key, true);

        // Handle array values (like images stored as arrays)
        if (is_array($value)) {
            return !empty($value) && (
                isset($value['ID']) ||
                isset($value['url']) ||
                isset($value['id']) ||
                count($value) > 0
            );
        }

        // Handle string/numeric values
        return !empty($value) && !empty(trim((string)$value));
    }

    /**
     * Helper: Count how many fields in a list have values
     */
    private static function count_fields(int $post_id, array $keys): int {
        $count = 0;
        foreach ($keys as $key) {
            if (self::field_has_value($post_id, $key)) {
                $count++;
            }
        }
        return $count;
    }

    /**
     * Get the schema definition for frontend consumption
     */
    public static function get_schema(): array {
        return [
            'pillars' => [
                [
                    'id'          => 'identity',
                    'label'       => 'Identity & Liking',
                    'description' => 'Present yourself as a real, relatable professional',
                    'max_points'  => self::PILLAR_WEIGHTS['identity'],
                    'icon'        => 'user',
                ],
                [
                    'id'          => 'authority',
                    'label'       => 'Authority & Expertise',
                    'description' => 'Demonstrate your expert credibility',
                    'max_points'  => self::PILLAR_WEIGHTS['authority'],
                    'icon'        => 'award',
                ],
                [
                    'id'          => 'value',
                    'label'       => 'Reciprocity & Value',
                    'description' => 'Show you bring value to podcast audiences',
                    'max_points'  => self::PILLAR_WEIGHTS['value'],
                    'icon'        => 'gift',
                ],
                [
                    'id'          => 'proof',
                    'label'       => 'Validation & Social Proof',
                    'description' => 'Demonstrate that others trust you',
                    'max_points'  => self::PILLAR_WEIGHTS['proof'],
                    'icon'        => 'check-circle',
                ],
            ],
            'total_points' => 100,
            'thresholds'   => [
                'draft'      => 0,
                'needs_work' => 1,
                'good'       => 50,
                'strong'     => 70,
                'excellent'  => 90,
            ],
        ];
    }
}
