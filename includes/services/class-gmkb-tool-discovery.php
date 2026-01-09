<?php
/**
 * GMKB Tool Discovery Service
 *
 * Discovers and loads AI tools from the self-contained /tools/ directory.
 * Each tool folder contains: tool.json, meta.json, prompts.php, and Vue component.
 *
 * @package GMKB
 * @subpackage Services
 * @version 1.0.0
 * @since 2.3.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class GMKB_Tool_Discovery {

    /**
     * Singleton instance
     * @var GMKB_Tool_Discovery
     */
    private static $instance = null;

    /**
     * Path to tools directory
     * @var string
     */
    private $tools_path;

    /**
     * Cache of discovered tools
     * @var array
     */
    private $tools_cache = null;

    /**
     * Cache of loaded prompts
     * @var array
     */
    private $prompts_cache = [];

    /**
     * Map of directory names to tool IDs for slug resolution
     * @var array
     */
    private $dir_to_id_map = [];

    /**
     * Category configuration
     *
     * Note: This configuration is mirrored in ToolRegistry.js (CATEGORY_CONFIG).
     * Any changes here should be reflected there for consistency.
     *
     * @var array
     */
    private $categories = [
        'message-builder' => [
            'name' => 'Message Builder',
            'description' => 'Create compelling bios, topics, and core messaging',
            'icon' => 'message-square',
            'order' => 1,
        ],
        'value-builder' => [
            'name' => 'Value Builder',
            'description' => 'Craft your elevator pitch, sound bites, and authority positioning',
            'icon' => 'award',
            'order' => 2,
        ],
        'strategy' => [
            'name' => 'Strategy',
            'description' => 'Develop your brand story, frameworks, and interview preparation',
            'icon' => 'compass',
            'order' => 3,
        ],
        'content' => [
            'name' => 'Content',
            'description' => 'Generate blogs, press releases, and repurposed content',
            'icon' => 'file-text',
            'order' => 4,
        ],
        'social-email' => [
            'name' => 'Social & Email',
            'description' => 'Create social posts, emails, newsletters, and show notes',
            'icon' => 'share-2',
            'order' => 5,
        ],
    ];

    /**
     * Get singleton instance
     *
     * @return GMKB_Tool_Discovery
     */
    public static function instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }

    /**
     * Private constructor
     */
    private function __construct() {
        $this->tools_path = GMKB_PLUGIN_DIR . 'tools/';
    }

    /**
     * Discover all tools in the tools directory
     *
     * @return array Associative array of tools by ID
     */
    private function discover_tools() {
        if (null !== $this->tools_cache) {
            return $this->tools_cache;
        }

        $this->tools_cache = [];

        // Check if tools directory exists
        if (!is_dir($this->tools_path)) {
            return $this->tools_cache;
        }

        // Scan for tool directories (skip _shared and hidden folders)
        $dirs = glob($this->tools_path . '*', GLOB_ONLYDIR);

        foreach ($dirs as $dir) {
            $dir_name = basename($dir);

            // Skip special directories
            if (strpos($dir_name, '_') === 0 || strpos($dir_name, '.') === 0) {
                continue;
            }

            $tool_json = $dir . '/tool.json';

            if (file_exists($tool_json)) {
                $json_content = file_get_contents($tool_json);
                $tool_config = json_decode($json_content, true);

                if ($tool_config && isset($tool_config['id'])) {
                    // Add path information
                    $tool_config['_path'] = $dir . '/';
                    $tool_config['_dir'] = $dir_name;

                    // Check for additional files
                    $tool_config['_has_prompts'] = file_exists($dir . '/prompts.php');
                    $tool_config['_has_meta'] = file_exists($dir . '/meta.json');
                    $tool_config['_has_component'] = file_exists($dir . '/' . ($tool_config['component'] ?? 'Component.vue'));

                    // Default published to true if not specified
                    if (!isset($tool_config['published'])) {
                        $tool_config['published'] = true;
                    }

                    $this->tools_cache[$tool_config['id']] = $tool_config;

                    // Also map directory name to tool ID for slug resolution
                    // This allows /tools/biography/ to find biography-generator
                    if ($dir_name !== $tool_config['id']) {
                        $this->dir_to_id_map[$dir_name] = $tool_config['id'];
                    }
                }
            }
        }

        return $this->tools_cache;
    }

    /**
     * Get all discovered tools (only published tools)
     *
     * @return array Array of all published tool configurations
     */
    public function get_all_tools() {
        $tools = $this->discover_tools();

        // Filter to only published tools
        $published_tools = array_filter($tools, function($tool) {
            return !empty($tool['published']);
        });

        return array_values($published_tools);
    }

    /**
     * Get all discovered tools including unpublished ones (for admin purposes)
     *
     * @return array Array of all tool configurations
     */
    public function get_all_tools_including_unpublished() {
        return array_values($this->discover_tools());
    }

    /**
     * Check if a tool is published
     *
     * @param string $tool_id The tool ID or directory slug
     * @return bool True if the tool is published, false otherwise
     */
    public function is_tool_published($tool_id) {
        $tools = $this->discover_tools();

        // Direct ID lookup
        if (isset($tools[$tool_id])) {
            return !empty($tools[$tool_id]['published']);
        }

        // Directory name fallback
        if (isset($this->dir_to_id_map[$tool_id])) {
            $canonical_id = $this->dir_to_id_map[$tool_id];
            return isset($tools[$canonical_id]) && !empty($tools[$canonical_id]['published']);
        }

        return false;
    }

    /**
     * Get a tool by its ID or directory slug
     *
     * Supports both canonical tool IDs (e.g., 'biography-generator') and
     * directory-based slugs (e.g., 'biography'). This allows URL routing
     * via /tools/biography/ to work even when the tool.json ID differs.
     *
     * @param string $tool_id The tool ID or directory slug
     * @return array|null Tool configuration or null if not found
     */
    public function get_tool($tool_id) {
        $tools = $this->discover_tools();

        // Direct ID lookup (e.g., 'biography-generator')
        if (isset($tools[$tool_id])) {
            return $tools[$tool_id];
        }

        // Directory name fallback (e.g., 'biography' → 'biography-generator')
        if (isset($this->dir_to_id_map[$tool_id])) {
            $canonical_id = $this->dir_to_id_map[$tool_id];
            return isset($tools[$canonical_id]) ? $tools[$canonical_id] : null;
        }

        return null;
    }

    /**
     * Get tool configuration (tool.json)
     *
     * @param string $tool_id Tool ID
     * @return array|null Tool configuration or null
     */
    public function get_tool_config($tool_id) {
        return $this->get_tool($tool_id);
    }

    /**
     * Get tool metadata (meta.json) for SEO and landing pages
     *
     * @param string $tool_id Tool ID
     * @return array|null Metadata or null
     */
    public function get_tool_metadata($tool_id) {
        $tool = $this->get_tool($tool_id);

        if (!$tool || !$tool['_has_meta']) {
            return null;
        }

        $meta_file = $tool['_path'] . 'meta.json';
        $json_content = file_get_contents($meta_file);

        return json_decode($json_content, true);
    }

    /**
     * Get tool prompts configuration (prompts.php)
     *
     * @param string $tool_id Tool ID
     * @return array|null Prompts configuration or null
     */
    public function get_tool_prompts($tool_id) {
        // Check cache first
        if (isset($this->prompts_cache[$tool_id])) {
            return $this->prompts_cache[$tool_id];
        }

        $tool = $this->get_tool($tool_id);

        if (!$tool || !$tool['_has_prompts']) {
            return null;
        }

        $prompts_file = $tool['_path'] . 'prompts.php';

        // Load the prompts array
        $prompts = include $prompts_file;

        // Cache for future use
        $this->prompts_cache[$tool_id] = $prompts;

        return $prompts;
    }

    /**
     * Get tools by category
     *
     * @param string $category Category slug
     * @return array Array of tools in the category
     */
    public function get_tools_by_category($category) {
        $all_tools = $this->get_all_tools();

        return array_filter($all_tools, function($tool) use ($category) {
            return isset($tool['category']) && $tool['category'] === $category;
        });
    }

    /**
     * Get tools grouped by category
     *
     * @return array Tools organized by category
     */
    public function get_tools_grouped_by_category() {
        $all_tools = $this->get_all_tools();
        $grouped = [];

        // Initialize categories
        foreach ($this->categories as $slug => $config) {
            $grouped[$slug] = array_merge($config, [
                'slug' => $slug,
                'tools' => [],
            ]);
        }

        // Assign tools to categories
        foreach ($all_tools as $tool) {
            $category = isset($tool['category']) ? $tool['category'] : 'message-builder';
            if (isset($grouped[$category])) {
                $grouped[$category]['tools'][] = $tool;
            }
        }

        // Sort by order
        uasort($grouped, function($a, $b) {
            return $a['order'] - $b['order'];
        });

        return $grouped;
    }

    /**
     * Resolve a slug to its canonical tool ID
     *
     * Handles both canonical IDs and directory name aliases.
     * Useful for redirecting from legacy slugs to canonical URLs.
     *
     * @param string $slug The tool slug or directory name
     * @return string|null Canonical tool ID or null if not found
     */
    public function resolve_canonical_id($slug) {
        $tools = $this->discover_tools();

        // Already canonical
        if (isset($tools[$slug])) {
            return $slug;
        }

        // Resolve from directory name
        if (isset($this->dir_to_id_map[$slug])) {
            return $this->dir_to_id_map[$slug];
        }

        return null;
    }

    /**
     * Check if a slug is a directory alias (not the canonical ID)
     *
     * @param string $slug The slug to check
     * @return bool True if this is an alias
     */
    public function is_directory_alias($slug) {
        return isset($this->dir_to_id_map[$slug]);
    }

    /**
     * Get the directory-to-ID mapping
     *
     * @return array Map of directory names to canonical tool IDs
     */
    public function get_directory_map() {
        $this->discover_tools(); // Ensure map is populated
        return $this->dir_to_id_map;
    }

    /**
     * Check if a tool exists
     *
     * @param string $tool_id Tool ID or directory slug
     * @return bool True if tool exists
     */
    public function tool_exists($tool_id) {
        return $this->get_tool($tool_id) !== null;
    }

    /**
     * Get tool count
     *
     * @return int Number of discovered tools
     */
    public function get_tool_count() {
        return count($this->discover_tools());
    }

    /**
     * Get category configuration
     *
     * @param string $category Category slug
     * @return array|null Category config or null
     */
    public function get_category_config($category) {
        return isset($this->categories[$category]) ? $this->categories[$category] : null;
    }

    /**
     * Get all categories
     *
     * @return array All category configurations
     */
    public function get_all_categories() {
        return $this->categories;
    }

    /**
     * Get tool IDs that support a specific feature
     *
     * @param string $feature Feature name (e.g., 'standalone', 'builder', 'modal')
     * @return array Array of tool IDs
     */
    public function get_tools_supporting($feature) {
        $all_tools = $this->get_all_tools();
        $matching = [];

        foreach ($all_tools as $tool) {
            if (isset($tool['supports'][$feature]) && $tool['supports'][$feature]) {
                $matching[] = $tool['id'];
            }
        }

        return $matching;
    }

    /**
     * Validate tool prompts configuration
     *
     * @param string $tool_id Tool ID
     * @return array Validation result with 'valid' boolean and 'errors' array
     */
    public function validate_tool_prompts($tool_id) {
        $prompts = $this->get_tool_prompts($tool_id);
        $errors = [];

        if (!$prompts) {
            return ['valid' => false, 'errors' => ['Prompts file not found or invalid']];
        }

        // Check required keys
        $required_keys = ['validation', 'settings', 'system_prompt', 'user_prompt', 'parser'];

        foreach ($required_keys as $key) {
            if (!isset($prompts[$key])) {
                $errors[] = "Missing required key: {$key}";
            }
        }

        // Check user_prompt is callable
        if (isset($prompts['user_prompt']) && !is_callable($prompts['user_prompt'])) {
            $errors[] = "user_prompt must be a callable function";
        }

        // Check parser is callable
        if (isset($prompts['parser']) && !is_callable($prompts['parser'])) {
            $errors[] = "parser must be a callable function";
        }

        return [
            'valid' => empty($errors),
            'errors' => $errors
        ];
    }

    /**
     * Clear the discovery cache
     */
    public function clear_cache() {
        $this->tools_cache = null;
        $this->prompts_cache = [];
        $this->dir_to_id_map = [];
    }

    /**
     * Get the tools directory path
     *
     * @return string Path to tools directory
     */
    public function get_tools_path() {
        return $this->tools_path;
    }
}

/**
 * Helper function to access the singleton
 *
 * @return GMKB_Tool_Discovery
 */
function gmkb_tool_discovery() {
    return GMKB_Tool_Discovery::instance();
}
