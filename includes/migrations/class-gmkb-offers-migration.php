<?php
/**
 * Formidable Offers to Native Offers Migration
 *
 * Migrates offer data from Formidable Forms (linked entries and post meta)
 * to the native gmkb_offer CPT system.
 *
 * @package GMKB
 * @subpackage Migrations
 * @since 2.3.0
 */

namespace GMKB\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Offers_Migration
 *
 * Handles migration of offers from:
 * 1. Formidable linked entries (complex offers)
 * 2. Post meta fields (simple offers: offer_1, offer_1_link, etc.)
 *
 * to the native gmkb_offer Custom Post Type.
 */
class Offers_Migration {

    /**
     * Option name for tracking migration status
     */
    const MIGRATION_OPTION = 'gmkb_offers_migration_status';

    /**
     * Migration version
     */
    const MIGRATION_VERSION = '1.0.0';

    /**
     * Formidable offer form ID (linked entries form)
     */
    const FRM_OFFER_FORM_ID = 8; // Adjust based on actual form ID

    /**
     * Field mapping: Formidable field ID => Native offer field
     */
    const FRM_FIELD_MAP = [
        '1526' => 'title',           // offer_name
        '9587' => 'title',           // offer_title (alternate)
        '1536' => 'description',     // description
        '9201' => 'type',            // offer_type (gift, prize, deal)
        '1540' => 'format',          // format
        '9547' => 'cta_text',        // call_to_action
        '9269' => 'url',             // landing_page
        '1529' => 'retail_value',    // value
        '9271' => 'price_cost',      // price
        '9619' => 'discount_percent', // discount
        '7207' => 'code',            // offer_code
        '7208' => 'redemption_instructions', // how_to_redeem
        '1527' => 'expiry_date',     // expiry_date
        '9595' => 'quantity_limit',  // quantity
        '1538' => 'scarcity_text',   // scarcity
        '1528' => 'reason',          // reason
        '9017' => 'notes',           // notes
        '9617' => 'video_url',       // video_link
        '1505' => 'image_id',        // cta_image (attachment ID)
        '1260' => 'status',          // status
        '1691' => 'author_id',       // user_id
        '2089' => 'org_id',          // org_id
    ];

    /**
     * Offer type mapping from Formidable to native taxonomy
     */
    const TYPE_MAP = [
        'gift'      => 'gift',
        'giveaway'  => 'prize',
        'prize'     => 'prize',
        'discount'  => 'deal',
        'deal'      => 'deal',
        'coupon'    => 'deal',
        'free'      => 'gift',
        ''          => 'gift', // default
    ];

    /**
     * Single instance
     *
     * @var Offers_Migration|null
     */
    private static $instance = null;

    /**
     * Migration log
     *
     * @var array
     */
    private $log = [];

    /**
     * Statistics
     *
     * @var array
     */
    private $stats = [
        'profiles_processed' => 0,
        'simple_offers_migrated' => 0,
        'linked_offers_migrated' => 0,
        'offers_linked_to_profiles' => 0,
        'errors' => 0,
        'skipped' => 0,
    ];

    /**
     * Get singleton instance
     *
     * @return Offers_Migration
     */
    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Constructor
     */
    private function __construct() {
        // Register WP-CLI command if available
        if (defined('WP_CLI') && WP_CLI) {
            \WP_CLI::add_command('gmkb migrate-offers', [$this, 'cli_migrate']);
        }
    }

    /**
     * Initialize hooks
     */
    public static function init() {
        self::instance();
    }

    /**
     * Check if migration is needed
     *
     * @return bool
     */
    public function is_migration_needed() {
        $status = get_option(self::MIGRATION_OPTION);

        if ($status && !empty($status['completed'])) {
            return false;
        }

        // Check if there are profiles with legacy offer data
        global $wpdb;

        $count = $wpdb->get_var("
            SELECT COUNT(DISTINCT post_id) FROM {$wpdb->postmeta}
            WHERE meta_key IN ('offer_1', 'offer_2', 'offer_1_link', 'offer_2_link')
            AND meta_value != ''
        ");

        return $count > 0;
    }

    /**
     * Run migration
     *
     * @param array $options Migration options
     * @return array Migration result
     */
    public function run_migration($options = []) {
        $defaults = [
            'dry_run' => false,
            'limit' => 0,           // 0 = no limit
            'profile_id' => 0,      // 0 = all profiles
            'skip_linked' => false, // Skip Formidable linked entries
            'skip_simple' => false, // Skip simple post meta offers
        ];

        $options = wp_parse_args($options, $defaults);

        $this->log('Starting offers migration', 'info');
        $this->log('Options: ' . json_encode($options), 'debug');

        $start_time = microtime(true);

        // Get profiles to process
        $profiles = $this->get_profiles_to_migrate($options);

        if (empty($profiles)) {
            $this->log('No profiles found to migrate', 'warning');
            return $this->get_result('No profiles to migrate');
        }

        $this->log(sprintf('Found %d profiles to process', count($profiles)), 'info');

        foreach ($profiles as $profile_id) {
            $this->migrate_profile_offers($profile_id, $options);
            $this->stats['profiles_processed']++;

            if ($options['limit'] > 0 && $this->stats['profiles_processed'] >= $options['limit']) {
                $this->log('Reached profile limit', 'info');
                break;
            }
        }

        $elapsed = round(microtime(true) - $start_time, 2);

        // Save migration status
        if (!$options['dry_run']) {
            $this->save_migration_status();
        }

        $this->log(sprintf('Migration completed in %s seconds', $elapsed), 'info');

        return $this->get_result('Migration completed', $elapsed);
    }

    /**
     * Get profiles that need migration
     *
     * @param array $options
     * @return array Profile IDs
     */
    private function get_profiles_to_migrate($options) {
        global $wpdb;

        if (!empty($options['profile_id'])) {
            return [$options['profile_id']];
        }

        // Get profiles with legacy offer data
        $profile_ids = $wpdb->get_col("
            SELECT DISTINCT p.ID
            FROM {$wpdb->posts} p
            LEFT JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
            WHERE p.post_type = 'guests'
            AND p.post_status IN ('publish', 'draft', 'private')
            AND (
                (pm.meta_key IN ('offer_1', 'offer_2') AND pm.meta_value != '')
                OR (pm.meta_key LIKE 'offer_%_entry' AND pm.meta_value != '')
            )
            ORDER BY p.ID ASC
        ");

        return $profile_ids ?: [];
    }

    /**
     * Migrate offers for a single profile
     *
     * @param int $profile_id
     * @param array $options
     */
    private function migrate_profile_offers($profile_id, $options) {
        $this->log(sprintf('Processing profile #%d', $profile_id), 'debug');

        $created_offer_ids = [];

        // 1. Migrate simple post meta offers
        if (!$options['skip_simple']) {
            $simple_offers = $this->migrate_simple_offers($profile_id, $options);
            $created_offer_ids = array_merge($created_offer_ids, $simple_offers);
        }

        // 2. Migrate Formidable linked entries
        if (!$options['skip_linked'] && class_exists('FrmEntry')) {
            $linked_offers = $this->migrate_linked_offers($profile_id, $options);
            $created_offer_ids = array_merge($created_offer_ids, $linked_offers);
        }

        // 3. Link all created offers to the profile
        if (!empty($created_offer_ids) && !$options['dry_run']) {
            $this->link_offers_to_profile($profile_id, $created_offer_ids);
        }
    }

    /**
     * Migrate simple post meta offers (offer_1, offer_1_link, etc.)
     *
     * @param int $profile_id
     * @param array $options
     * @return array Created offer IDs
     */
    private function migrate_simple_offers($profile_id, $options) {
        $created_ids = [];

        // Get simple offer fields
        $offer_data = [
            1 => [
                'title' => get_post_meta($profile_id, 'offer_1', true),
                'url' => get_post_meta($profile_id, 'offer_1_link', true),
                'description' => get_post_meta($profile_id, 'offer_1_description', true),
                'cta_text' => get_post_meta($profile_id, 'cta_1', true),
            ],
            2 => [
                'title' => get_post_meta($profile_id, 'offer_2', true),
                'url' => get_post_meta($profile_id, 'offer_2_link', true),
                'description' => get_post_meta($profile_id, 'offer_2_description', true),
                'cta_text' => get_post_meta($profile_id, 'cta_2', true),
            ],
        ];

        // Also check legacy fields
        $legacy_1 = get_post_meta($profile_id, 'offer_1_legacy', true);
        $legacy_2 = get_post_meta($profile_id, 'offer_2_legacy', true);

        if ($legacy_1 && empty($offer_data[1]['title'])) {
            $offer_data[1]['title'] = $legacy_1;
        }
        if ($legacy_2 && empty($offer_data[2]['title'])) {
            $offer_data[2]['title'] = $legacy_2;
        }

        foreach ($offer_data as $num => $data) {
            // Skip if no title
            if (empty($data['title'])) {
                continue;
            }

            // Check if offer already exists (by title + profile)
            if ($this->offer_exists($data['title'], $profile_id)) {
                $this->log(sprintf('Skipping duplicate simple offer: %s', $data['title']), 'debug');
                $this->stats['skipped']++;
                continue;
            }

            $this->log(sprintf('Migrating simple offer %d: %s', $num, $data['title']), 'debug');

            if ($options['dry_run']) {
                $this->stats['simple_offers_migrated']++;
                continue;
            }

            // Create native offer
            $offer_id = $this->create_native_offer([
                'title' => $data['title'],
                'description' => $data['description'] ?: '',
                'type' => 'gift', // Default for simple offers
                'cta_text' => $data['cta_text'] ?: 'Learn More',
                'url' => $data['url'] ?: '',
                'status' => 'publish',
                'author_id' => get_post_field('post_author', $profile_id),
                'migrated_from' => 'simple_meta',
                'source_profile_id' => $profile_id,
            ]);

            if ($offer_id) {
                $created_ids[] = $offer_id;
                $this->stats['simple_offers_migrated']++;
            } else {
                $this->stats['errors']++;
            }
        }

        return $created_ids;
    }

    /**
     * Migrate Formidable linked entry offers
     *
     * @param int $profile_id
     * @param array $options
     * @return array Created offer IDs
     */
    private function migrate_linked_offers($profile_id, $options) {
        $created_ids = [];

        // Get linked entry IDs from profile meta
        $linked_fields = [
            'offer_1_entry' => get_post_meta($profile_id, 'offer_1_entry', true),
            'offer_2_entry' => get_post_meta($profile_id, 'offer_2_entry', true),
            'offer_3_entry' => get_post_meta($profile_id, 'offer_3_entry', true),
        ];

        foreach ($linked_fields as $field => $entry_id) {
            if (empty($entry_id)) {
                continue;
            }

            // Get Formidable entry data
            $entry_data = $this->get_formidable_entry($entry_id);

            if (empty($entry_data)) {
                $this->log(sprintf('Formidable entry not found: %s', $entry_id), 'warning');
                continue;
            }

            // Get title from entry
            $title = $entry_data['title'] ?? $entry_data['offer_name'] ?? '';

            if (empty($title)) {
                $this->log(sprintf('Skipping entry %s - no title', $entry_id), 'debug');
                $this->stats['skipped']++;
                continue;
            }

            // Check if already migrated
            if ($this->offer_exists($title, $profile_id)) {
                $this->log(sprintf('Skipping duplicate linked offer: %s', $title), 'debug');
                $this->stats['skipped']++;
                continue;
            }

            $this->log(sprintf('Migrating linked offer: %s (entry %s)', $title, $entry_id), 'debug');

            if ($options['dry_run']) {
                $this->stats['linked_offers_migrated']++;
                continue;
            }

            // Map Formidable data to native format
            $native_data = $this->map_frm_to_native($entry_data, $profile_id);

            $offer_id = $this->create_native_offer($native_data);

            if ($offer_id) {
                $created_ids[] = $offer_id;
                $this->stats['linked_offers_migrated']++;

                // Store reference to original Formidable entry
                update_post_meta($offer_id, '_migrated_from_frm_entry', $entry_id);
            } else {
                $this->stats['errors']++;
            }
        }

        return $created_ids;
    }

    /**
     * Get Formidable entry data
     *
     * @param int $entry_id
     * @return array
     */
    private function get_formidable_entry($entry_id) {
        if (!class_exists('FrmEntry') || !class_exists('FrmEntryMeta')) {
            return [];
        }

        $entry = \FrmEntry::getOne($entry_id);
        if (!$entry) {
            return [];
        }

        $metas = \FrmEntryMeta::getAll(['it.entry_id' => $entry_id], '', '', true);

        $data = [];
        foreach ($metas as $meta) {
            $field_id = $meta->field_id;
            $native_key = self::FRM_FIELD_MAP[$field_id] ?? null;

            if ($native_key) {
                $data[$native_key] = maybe_unserialize($meta->meta_value);
            }
        }

        return $data;
    }

    /**
     * Map Formidable entry data to native offer format
     *
     * @param array $frm_data
     * @param int $profile_id
     * @return array
     */
    private function map_frm_to_native($frm_data, $profile_id) {
        // Map offer type
        $raw_type = strtolower(trim($frm_data['type'] ?? ''));
        $type = self::TYPE_MAP[$raw_type] ?? 'gift';

        // Map status
        $status_map = [
            'active' => 'publish',
            'draft' => 'draft',
            'inactive' => 'private',
            '' => 'publish',
        ];
        $raw_status = strtolower(trim($frm_data['status'] ?? ''));
        $status = $status_map[$raw_status] ?? 'publish';

        return [
            'title' => $frm_data['title'] ?? '',
            'description' => $frm_data['description'] ?? '',
            'type' => $type,
            'status' => $status,
            'format' => $frm_data['format'] ?? '',
            'cta_text' => $frm_data['cta_text'] ?? 'Learn More',
            'url' => $frm_data['url'] ?? '',
            'retail_value' => floatval($frm_data['retail_value'] ?? 0),
            'price_cost' => floatval($frm_data['price_cost'] ?? 0),
            'discount_percent' => floatval($frm_data['discount_percent'] ?? 0),
            'code' => $frm_data['code'] ?? '',
            'redemption_instructions' => $frm_data['redemption_instructions'] ?? '',
            'expiry_date' => $this->format_date($frm_data['expiry_date'] ?? ''),
            'quantity_limit' => intval($frm_data['quantity_limit'] ?? 0),
            'scarcity_text' => $frm_data['scarcity_text'] ?? '',
            'reason' => $frm_data['reason'] ?? '',
            'notes' => $frm_data['notes'] ?? '',
            'video_url' => $frm_data['video_url'] ?? '',
            'image_id' => intval($frm_data['image_id'] ?? 0),
            'author_id' => intval($frm_data['author_id'] ?? get_post_field('post_author', $profile_id)),
            'migrated_from' => 'formidable',
            'source_profile_id' => $profile_id,
        ];
    }

    /**
     * Create native gmkb_offer post
     *
     * @param array $data
     * @return int|false Offer ID or false on failure
     */
    private function create_native_offer($data) {
        $post_data = [
            'post_type' => 'gmkb_offer',
            'post_title' => sanitize_text_field($data['title']),
            'post_content' => wp_kses_post($data['description']),
            'post_status' => $data['status'] ?? 'publish',
            'post_author' => $data['author_id'] ?? get_current_user_id(),
        ];

        $offer_id = wp_insert_post($post_data, true);

        if (is_wp_error($offer_id)) {
            $this->log('Failed to create offer: ' . $offer_id->get_error_message(), 'error');
            return false;
        }

        // Set offer type taxonomy
        if (!empty($data['type'])) {
            wp_set_object_terms($offer_id, $data['type'], 'offer_type');
        }

        // Save meta fields
        $meta_fields = [
            'format', 'cta_text', 'url', 'retail_value', 'price_cost',
            'discount_percent', 'code', 'redemption_instructions', 'expiry_date',
            'quantity_limit', 'scarcity_text', 'reason', 'notes', 'video_url',
            'image_id', 'migrated_from', 'source_profile_id',
        ];

        foreach ($meta_fields as $field) {
            if (isset($data[$field]) && $data[$field] !== '') {
                update_post_meta($offer_id, $field, $data[$field]);
            }
        }

        // Initialize tracking
        update_post_meta($offer_id, 'click_count', 0);

        $this->log(sprintf('Created offer #%d: %s', $offer_id, $data['title']), 'debug');

        return $offer_id;
    }

    /**
     * Link offers to profile
     *
     * @param int $profile_id
     * @param array $offer_ids
     */
    private function link_offers_to_profile($profile_id, $offer_ids) {
        if (empty($offer_ids)) {
            return;
        }

        // Get existing associated offers
        $existing = get_post_meta($profile_id, 'associated_offers', true);
        $existing = is_array($existing) ? $existing : [];

        // Merge and dedupe
        $all_offers = array_unique(array_merge($existing, $offer_ids));

        update_post_meta($profile_id, 'associated_offers', $all_offers);

        $this->stats['offers_linked_to_profiles'] += count($offer_ids);

        $this->log(sprintf('Linked %d offers to profile #%d', count($offer_ids), $profile_id), 'debug');
    }

    /**
     * Check if an offer already exists
     *
     * @param string $title
     * @param int $profile_id
     * @return bool
     */
    private function offer_exists($title, $profile_id) {
        global $wpdb;

        $exists = $wpdb->get_var($wpdb->prepare("
            SELECT p.ID FROM {$wpdb->posts} p
            INNER JOIN {$wpdb->postmeta} pm ON p.ID = pm.post_id
            WHERE p.post_type = 'gmkb_offer'
            AND p.post_title = %s
            AND pm.meta_key = 'source_profile_id'
            AND pm.meta_value = %d
            LIMIT 1
        ", $title, $profile_id));

        return !empty($exists);
    }

    /**
     * Format date for storage
     *
     * @param string $date
     * @return string
     */
    private function format_date($date) {
        if (empty($date)) {
            return '';
        }

        $timestamp = strtotime($date);
        return $timestamp ? date('Y-m-d', $timestamp) : '';
    }

    /**
     * Save migration status
     */
    private function save_migration_status() {
        $status = [
            'version' => self::MIGRATION_VERSION,
            'completed' => true,
            'completed_at' => current_time('mysql'),
            'stats' => $this->stats,
        ];

        update_option(self::MIGRATION_OPTION, $status);
    }

    /**
     * Log a message
     *
     * @param string $message
     * @param string $level
     */
    private function log($message, $level = 'info') {
        $this->log[] = [
            'time' => current_time('mysql'),
            'level' => $level,
            'message' => $message,
        ];

        if (defined('WP_CLI') && WP_CLI) {
            switch ($level) {
                case 'error':
                    \WP_CLI::error($message, false);
                    break;
                case 'warning':
                    \WP_CLI::warning($message);
                    break;
                case 'debug':
                    if (\WP_CLI::get_config('debug')) {
                        \WP_CLI::debug($message);
                    }
                    break;
                default:
                    \WP_CLI::log($message);
            }
        }

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log(sprintf('[GMKB Offers Migration] [%s] %s', strtoupper($level), $message));
        }
    }

    /**
     * Get migration result
     *
     * @param string $message
     * @param float $elapsed
     * @return array
     */
    private function get_result($message, $elapsed = 0) {
        return [
            'success' => $this->stats['errors'] === 0,
            'message' => $message,
            'stats' => $this->stats,
            'elapsed' => $elapsed,
            'log' => $this->log,
        ];
    }

    /**
     * WP-CLI command handler
     *
     * ## OPTIONS
     *
     * [--dry-run]
     * : Preview migration without making changes
     *
     * [--limit=<number>]
     * : Limit number of profiles to process
     *
     * [--profile=<id>]
     * : Migrate a specific profile only
     *
     * [--skip-linked]
     * : Skip Formidable linked entries
     *
     * [--skip-simple]
     * : Skip simple post meta offers
     *
     * ## EXAMPLES
     *
     *     wp gmkb migrate-offers --dry-run
     *     wp gmkb migrate-offers --limit=10
     *     wp gmkb migrate-offers --profile=123
     *
     * @param array $args
     * @param array $assoc_args
     */
    public function cli_migrate($args, $assoc_args) {
        $options = [
            'dry_run' => isset($assoc_args['dry-run']),
            'limit' => intval($assoc_args['limit'] ?? 0),
            'profile_id' => intval($assoc_args['profile'] ?? 0),
            'skip_linked' => isset($assoc_args['skip-linked']),
            'skip_simple' => isset($assoc_args['skip-simple']),
        ];

        if ($options['dry_run']) {
            \WP_CLI::log('Running in DRY RUN mode - no changes will be made');
        }

        $result = $this->run_migration($options);

        \WP_CLI::log('');
        \WP_CLI::log('=== Migration Results ===');
        \WP_CLI::log(sprintf('Profiles processed: %d', $result['stats']['profiles_processed']));
        \WP_CLI::log(sprintf('Simple offers migrated: %d', $result['stats']['simple_offers_migrated']));
        \WP_CLI::log(sprintf('Linked offers migrated: %d', $result['stats']['linked_offers_migrated']));
        \WP_CLI::log(sprintf('Offers linked to profiles: %d', $result['stats']['offers_linked_to_profiles']));
        \WP_CLI::log(sprintf('Skipped (duplicates): %d', $result['stats']['skipped']));
        \WP_CLI::log(sprintf('Errors: %d', $result['stats']['errors']));

        if ($result['elapsed']) {
            \WP_CLI::log(sprintf('Time elapsed: %s seconds', $result['elapsed']));
        }

        if ($result['success']) {
            \WP_CLI::success($result['message']);
        } else {
            \WP_CLI::error($result['message']);
        }
    }

    /**
     * Reset migration status (for re-running)
     */
    public function reset_migration() {
        delete_option(self::MIGRATION_OPTION);
        $this->log('Migration status reset', 'info');
    }

    /**
     * Get migration status
     *
     * @return array|false
     */
    public function get_migration_status() {
        return get_option(self::MIGRATION_OPTION);
    }
}

// Initialize
add_action('plugins_loaded', ['GMKB\Migrations\Offers_Migration', 'init']);
