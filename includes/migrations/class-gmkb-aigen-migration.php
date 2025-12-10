<?php
/**
 * AIGEN to GMKB Migration
 *
 * Migrates AI generator data from the legacy aigen plugin to the mk4 architecture.
 * This includes authority hook data, generation history, and user preferences.
 *
 * @package GMKB
 * @subpackage Migrations
 * @since 2.2.0
 */

namespace GMKB\Migrations;

if (!defined('ABSPATH')) {
    exit;
}

/**
 * Class Aigen_Migration
 *
 * Handles migration of data from legacy AI Content Generator (aigen) plugin
 * to the unified GMKB architecture.
 */
class Aigen_Migration {

    /**
     * Option name for tracking migration status
     */
    const MIGRATION_OPTION = 'gmkb_aigen_migration_status';

    /**
     * Migration version
     */
    const MIGRATION_VERSION = '1.0.0';

    /**
     * Single instance
     *
     * @var Aigen_Migration|null
     */
    private static $instance = null;

    /**
     * Migration log
     *
     * @var array
     */
    private $log = [];

    /**
     * Get singleton instance
     *
     * @return Aigen_Migration
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
        // Add admin action for manual migration
        add_action('admin_init', [$this, 'maybe_run_migration']);

        // Add admin notice for pending migration
        add_action('admin_notices', [$this, 'migration_notice']);
    }

    /**
     * Check if migration is needed and run if auto-migrate is enabled
     */
    public function maybe_run_migration() {
        if (!$this->is_migration_needed()) {
            return;
        }

        // Only auto-run if explicitly enabled
        if (get_option('gmkb_auto_migrate_aigen', false)) {
            $this->run_migration();
        }
    }

    /**
     * Check if migration is needed
     *
     * @return bool
     */
    public function is_migration_needed() {
        $status = get_option(self::MIGRATION_OPTION);

        if ($status && isset($status['completed']) && $status['completed']) {
            return false;
        }

        // Check if aigen plugin data exists
        return $this->has_aigen_data();
    }

    /**
     * Check if aigen data exists
     *
     * @return bool
     */
    private function has_aigen_data() {
        global $wpdb;

        // Check for aigen post meta
        $count = $wpdb->get_var(
            "SELECT COUNT(*) FROM {$wpdb->postmeta}
             WHERE meta_key LIKE 'mkcg_%'
             OR meta_key LIKE '_mkcg_%'"
        );

        return $count > 0;
    }

    /**
     * Run the migration
     *
     * @param bool $dry_run If true, don't actually save changes
     * @return array Migration results
     */
    public function run_migration($dry_run = false) {
        $this->log = [];
        $this->log('Starting AIGEN to GMKB migration', 'info');
        $this->log('Dry run: ' . ($dry_run ? 'Yes' : 'No'), 'info');

        $results = [
            'authority_hooks' => 0,
            'generation_history' => 0,
            'user_preferences' => 0,
            'posts_updated' => 0,
            'errors' => [],
        ];

        try {
            // Migrate authority hook data
            $results['authority_hooks'] = $this->migrate_authority_hooks($dry_run);

            // Migrate generation history (if stored)
            $results['generation_history'] = $this->migrate_generation_history($dry_run);

            // Migrate user preferences
            $results['user_preferences'] = $this->migrate_user_preferences($dry_run);

            // Update media kit posts with migrated data
            $results['posts_updated'] = $this->migrate_post_meta($dry_run);

            // Mark migration as complete
            if (!$dry_run) {
                $this->mark_migration_complete($results);
            }

            $this->log('Migration completed successfully', 'success');

        } catch (\Exception $e) {
            $this->log('Migration error: ' . $e->getMessage(), 'error');
            $results['errors'][] = $e->getMessage();
        }

        $results['log'] = $this->log;
        return $results;
    }

    /**
     * Migrate authority hook data
     *
     * @param bool $dry_run
     * @return int Number of hooks migrated
     */
    private function migrate_authority_hooks($dry_run) {
        global $wpdb;
        $count = 0;

        // Find posts with authority hook data
        $posts_with_hooks = $wpdb->get_results(
            "SELECT DISTINCT post_id FROM {$wpdb->postmeta}
             WHERE meta_key LIKE 'mkcg_hook_%'
             OR meta_key LIKE '_authority_hook_%'"
        );

        foreach ($posts_with_hooks as $post) {
            $hook_data = $this->get_authority_hook_for_post($post->post_id);

            if (!empty($hook_data)) {
                if (!$dry_run) {
                    // Store in new format
                    update_post_meta($post->post_id, 'gmkb_authority_hook', $hook_data);
                }
                $count++;
                $this->log("Migrated authority hook for post {$post->post_id}", 'info');
            }
        }

        return $count;
    }

    /**
     * Get authority hook data for a post
     *
     * @param int $post_id
     * @return array
     */
    private function get_authority_hook_for_post($post_id) {
        $hook = [];

        // Map old meta keys to new format
        $key_map = [
            'who' => ['mkcg_hook_who', '_authority_hook_who', 'hook_who'],
            'what' => ['mkcg_hook_what', '_authority_hook_what', 'hook_what'],
            'when' => ['mkcg_hook_when', '_authority_hook_when', 'hook_when'],
            'how' => ['mkcg_hook_how', '_authority_hook_how', 'hook_how'],
            'where' => ['mkcg_hook_where', '_authority_hook_where', 'hook_where'],
            'why' => ['mkcg_hook_why', '_authority_hook_why', 'hook_why'],
        ];

        foreach ($key_map as $new_key => $old_keys) {
            foreach ($old_keys as $old_key) {
                $value = get_post_meta($post_id, $old_key, true);
                if (!empty($value)) {
                    $hook[$new_key] = sanitize_text_field($value);
                    break;
                }
            }
        }

        return $hook;
    }

    /**
     * Migrate generation history
     *
     * @param bool $dry_run
     * @return int Number of history entries migrated
     */
    private function migrate_generation_history($dry_run) {
        global $wpdb;
        $count = 0;

        // Check for stored generation history (may be in options or custom table)
        $old_history = get_option('mkcg_generation_history', []);

        if (!empty($old_history) && is_array($old_history)) {
            $new_history = [];

            foreach ($old_history as $entry) {
                $new_entry = [
                    'type' => $this->map_content_type($entry['type'] ?? ''),
                    'params' => $entry['params'] ?? $entry['input'] ?? [],
                    'content' => $entry['content'] ?? $entry['output'] ?? '',
                    'timestamp' => $entry['timestamp'] ?? time(),
                ];

                if (!empty($new_entry['type'])) {
                    $new_history[] = $new_entry;
                    $count++;
                }
            }

            if (!$dry_run && !empty($new_history)) {
                update_option('gmkb_ai_generation_history', $new_history);
            }
        }

        $this->log("Migrated {$count} generation history entries", 'info');
        return $count;
    }

    /**
     * Map old content type to new format
     *
     * @param string $old_type
     * @return string
     */
    private function map_content_type($old_type) {
        $map = [
            'bio' => 'biography',
            'biography' => 'biography',
            'topic' => 'topics',
            'topics' => 'topics',
            'question' => 'questions',
            'questions' => 'questions',
            'tagline' => 'tagline',
            'intro' => 'guest_intro',
            'guest_intro' => 'guest_intro',
            'offer' => 'offers',
            'offers' => 'offers',
        ];

        return $map[$old_type] ?? $old_type;
    }

    /**
     * Migrate user preferences
     *
     * @param bool $dry_run
     * @return int Number of users with preferences migrated
     */
    private function migrate_user_preferences($dry_run) {
        $count = 0;

        // Get all users with aigen preferences
        $users = get_users(['meta_key' => 'mkcg_preferences']);

        foreach ($users as $user) {
            $old_prefs = get_user_meta($user->ID, 'mkcg_preferences', true);

            if (!empty($old_prefs) && is_array($old_prefs)) {
                $new_prefs = [
                    'defaultTone' => $old_prefs['tone'] ?? 'professional',
                    'defaultLength' => $old_prefs['length'] ?? 'medium',
                    'defaultPOV' => $old_prefs['pov'] ?? 'third',
                ];

                if (!$dry_run) {
                    update_user_meta($user->ID, 'gmkb_ai_preferences', $new_prefs);
                }
                $count++;
            }
        }

        $this->log("Migrated preferences for {$count} users", 'info');
        return $count;
    }

    /**
     * Migrate post meta data
     *
     * @param bool $dry_run
     * @return int Number of posts updated
     */
    private function migrate_post_meta($dry_run) {
        global $wpdb;
        $count = 0;

        // Get posts with aigen meta
        $posts = $wpdb->get_col(
            "SELECT DISTINCT post_id FROM {$wpdb->postmeta}
             WHERE meta_key LIKE 'mkcg_%'"
        );

        foreach ($posts as $post_id) {
            $migrated = false;

            // Migrate generated content fields
            $content_fields = [
                'mkcg_generated_bio' => 'gmkb_ai_biography',
                'mkcg_generated_topics' => 'gmkb_ai_topics',
                'mkcg_generated_questions' => 'gmkb_ai_questions',
                'mkcg_generated_tagline' => 'gmkb_ai_tagline',
                'mkcg_generated_intro' => 'gmkb_ai_guest_intro',
            ];

            foreach ($content_fields as $old_key => $new_key) {
                $value = get_post_meta($post_id, $old_key, true);
                if (!empty($value)) {
                    if (!$dry_run) {
                        update_post_meta($post_id, $new_key, $value);
                    }
                    $migrated = true;
                }
            }

            if ($migrated) {
                $count++;
                $this->log("Migrated post meta for post {$post_id}", 'info');
            }
        }

        return $count;
    }

    /**
     * Mark migration as complete
     *
     * @param array $results
     */
    private function mark_migration_complete($results) {
        $status = [
            'completed' => true,
            'version' => self::MIGRATION_VERSION,
            'date' => current_time('mysql'),
            'results' => [
                'authority_hooks' => $results['authority_hooks'],
                'generation_history' => $results['generation_history'],
                'user_preferences' => $results['user_preferences'],
                'posts_updated' => $results['posts_updated'],
            ],
        ];

        update_option(self::MIGRATION_OPTION, $status);
        $this->log('Migration status saved', 'info');
    }

    /**
     * Add log entry
     *
     * @param string $message
     * @param string $level
     */
    private function log($message, $level = 'info') {
        $this->log[] = [
            'time' => current_time('H:i:s'),
            'level' => $level,
            'message' => $message,
        ];

        if (defined('WP_DEBUG') && WP_DEBUG) {
            error_log("[GMKB Migration] [{$level}] {$message}");
        }
    }

    /**
     * Display admin notice for pending migration
     */
    public function migration_notice() {
        if (!current_user_can('manage_options')) {
            return;
        }

        if (!$this->is_migration_needed()) {
            return;
        }

        $migrate_url = add_query_arg([
            'action' => 'gmkb_migrate_aigen',
            '_wpnonce' => wp_create_nonce('gmkb_migrate_aigen'),
        ], admin_url('admin.php'));

        ?>
        <div class="notice notice-info is-dismissible">
            <p>
                <strong>Guestify Media Kit Builder:</strong>
                Legacy AI Content Generator data detected.
                <a href="<?php echo esc_url($migrate_url); ?>">Migrate now</a>
                to use AI features in the new builder.
            </p>
        </div>
        <?php
    }

    /**
     * Get migration status
     *
     * @return array|false
     */
    public function get_migration_status() {
        return get_option(self::MIGRATION_OPTION, false);
    }

    /**
     * Rollback migration
     *
     * @return bool
     */
    public function rollback() {
        global $wpdb;

        // Delete migrated meta
        $wpdb->query(
            "DELETE FROM {$wpdb->postmeta}
             WHERE meta_key LIKE 'gmkb_ai_%'
             OR meta_key = 'gmkb_authority_hook'"
        );

        // Delete migrated options
        delete_option('gmkb_ai_generation_history');
        delete_option(self::MIGRATION_OPTION);

        // Delete user meta
        $wpdb->query(
            "DELETE FROM {$wpdb->usermeta}
             WHERE meta_key = 'gmkb_ai_preferences'"
        );

        return true;
    }
}

// Initialize
Aigen_Migration::instance();
