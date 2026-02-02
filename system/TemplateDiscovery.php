<?php
/**
 * Template Discovery System
 *
 * Discovers and loads persona-based starter templates.
 * Templates define LAYOUT (sections, components) - NOT visual styling.
 *
 * For visual styling, see ThemeDiscovery.
 *
 * @package GMKB/System
 * @since 5.0.0
 */

if (!defined('ABSPATH')) {
    exit;
}

class TemplateDiscovery {

    private $templates_dir;
    private $templates = array();
    private $cache_key = 'gmkb_starter_templates_cache';
    private $manifest_cache_key = 'gmkb_filter_manifest_cache';
    private $cache_duration = 3600; // 1 hour

    /**
     * Constructor
     *
     * @param string $templates_dir Path to starter-templates directory
     */
    public function __construct($templates_dir) {
        $this->templates_dir = $templates_dir;

        if (!is_dir($this->templates_dir)) {
            // Create directory if it doesn't exist
            if (!mkdir($this->templates_dir, 0755, true)) {
                throw new Exception('Templates directory not found and could not be created: ' . $this->templates_dir);
            }
        }
    }

    /**
     * Scan for templates
     *
     * @param bool $force_fresh Force fresh scan without cache
     * @return array Array of templates
     */
    public function scan($force_fresh = false) {
        // Try cache first unless forced fresh
        if (!$force_fresh) {
            $cached_templates = get_transient($this->cache_key);
            if ($cached_templates !== false) {
                // Auto-bust cache if template directory count changed
                $template_dirs = glob($this->templates_dir . '/*', GLOB_ONLYDIR);
                if (count($template_dirs) !== count($cached_templates)) {
                    $force_fresh = true;
                } else {
                    $this->templates = $cached_templates;
                    return $this->templates;
                }
            }
        }

        $this->templates = array();

        // Scan templates directory
        $template_dirs = glob($this->templates_dir . '/*', GLOB_ONLYDIR);

        foreach ($template_dirs as $template_path) {
            $template_id = basename($template_path);
            $template_file = $template_path . '/template.json';

            if (file_exists($template_file)) {
                $template_data = json_decode(file_get_contents($template_file), true);

                if ($template_data && isset($template_data['template_id'])) {
                    // Ensure template has all required data
                    $template_data['path'] = $template_path;
                    $template_data['directory'] = $template_id;

                    // Add preview image URL if exists (supports preview_image + png/jpg/svg fallbacks)
                    $preview_candidates = array();

                    if (!empty($template_data['preview_image'])) {
                        $preview_candidates[] = $template_path . '/' . ltrim($template_data['preview_image'], '/');
                    }

                    $preview_candidates[] = $template_path . '/preview.png';
                    $preview_candidates[] = $template_path . '/preview.jpg';
                    $preview_candidates[] = $template_path . '/preview.svg';

                    foreach ($preview_candidates as $preview_image) {
                        if (file_exists($preview_image)) {
                            $preview_file = basename($preview_image);
                            // Use GMKB_PLUGIN_URL constant for reliable URL generation
                            // plugins_url() can fail when passed a directory path instead of file path
                            if (defined('GMKB_PLUGIN_URL')) {
                                $template_data['preview_url'] = GMKB_PLUGIN_URL . 'starter-templates/' . $template_id . '/' . $preview_file;
                            } else {
                                // Fallback to plugins_url with __FILE__ as reference
                                $template_data['preview_url'] = plugins_url('starter-templates/' . $template_id . '/' . $preview_file, dirname(__FILE__) . '/dummy.php');
                            }
                            break;
                        }
                    }

                    $this->templates[$template_id] = $template_data;
                }
            }
        }

        // Sort by sort_order
        uasort($this->templates, function($a, $b) {
            $order_a = isset($a['metadata']['sort_order']) ? $a['metadata']['sort_order'] : 100;
            $order_b = isset($b['metadata']['sort_order']) ? $b['metadata']['sort_order'] : 100;
            return $order_a - $order_b;
        });

        // Cache the results
        set_transient($this->cache_key, $this->templates, $this->cache_duration);

        return $this->templates;
    }

    /**
     * Get all discovered templates
     *
     * @return array
     */
    public function getTemplates() {
        if (empty($this->templates)) {
            $this->scan();
        }
        return $this->templates;
    }

    /**
     * Get a specific template
     *
     * @param string $template_id Template identifier
     * @return array|null Template data or null if not found
     */
    public function getTemplate($template_id) {
        $templates = $this->getTemplates();
        return isset($templates[$template_id]) ? $templates[$template_id] : null;
    }

    /**
     * Get templates by persona type
     *
     * @param string $persona_type Persona type (author, speaker, podcast-guest, etc.)
     * @return array Filtered templates
     */
    public function getTemplatesByPersona($persona_type) {
        $templates = $this->getTemplates();
        return array_filter($templates, function($template) use ($persona_type) {
            return isset($template['persona']['type']) && $template['persona']['type'] === $persona_type;
        });
    }

    /**
     * Get list of all persona types
     *
     * @return array Array of persona types with labels
     */
    public function getPersonaTypes() {
        $templates = $this->getTemplates();
        $personas = array();

        foreach ($templates as $template) {
            if (isset($template['persona']['type']) && isset($template['persona']['label'])) {
                $type = $template['persona']['type'];
                if (!isset($personas[$type])) {
                    $personas[$type] = array(
                        'type' => $type,
                        'label' => $template['persona']['label'],
                        'icon' => isset($template['persona']['icon']) ? $template['persona']['icon'] : 'fa-solid fa-user'
                    );
                }
            }
        }

        return array_values($personas);
    }

    /**
     * Get templates by use case
     *
     * @param string $use_case Use case string (e.g., 'General Bio', 'Book Launch')
     * @return array Filtered templates
     */
    public function getTemplatesByUseCase($use_case) {
        $templates = $this->getTemplates();
        return array_filter($templates, function($template) use ($use_case) {
            return isset($template['persona']['use_case']) && $template['persona']['use_case'] === $use_case;
        });
    }

    /**
     * Get templates by layout variant
     *
     * @param string $layout_variant Layout variant (e.g., 'standard', 'split-layout', 'center-stack')
     * @return array Filtered templates
     */
    public function getTemplatesByLayoutVariant($layout_variant) {
        $templates = $this->getTemplates();
        return array_filter($templates, function($template) use ($layout_variant) {
            return isset($template['persona']['layout_variant']) && $template['persona']['layout_variant'] === $layout_variant;
        });
    }

    /**
     * Get filter manifest for multi-dimensional template filtering
     *
     * Returns a nested structure for powering the tiered filter UI:
     * - personas: Array of unique persona types with their labels and icons
     * - use_cases: Array of unique use cases across all templates
     * - layout_variants: Array of unique layout variants across all templates
     * - manifest: Nested map of Persona -> Use Cases -> Layout Variants
     *
     * Results are cached for performance (same duration as template cache).
     *
     * @param bool $force_fresh Force fresh build without cache
     * @return array Filter manifest for frontend consumption
     */
    public function getFilterManifest($force_fresh = false) {
        // Try cache first unless forced fresh
        if (!$force_fresh) {
            $cached_manifest = get_transient($this->manifest_cache_key);
            if ($cached_manifest !== false) {
                return $cached_manifest;
            }
        }

        $templates = $this->getTemplates();

        $personas = array();
        $use_cases = array();
        $layout_variants = array();
        $manifest = array();

        foreach ($templates as $template) {
            // Use null coalescing operator for cleaner code
            $persona = $template['persona'] ?? [];
            $persona_type = $persona['type'] ?? 'unknown';
            $persona_label = $persona['label'] ?? ucfirst($persona_type);
            $persona_icon = $persona['icon'] ?? 'fa-solid fa-user';
            $use_case = $persona['use_case'] ?? 'General Bio';
            $layout_variant = $persona['layout_variant'] ?? 'standard';

            // Collect unique personas
            if (!isset($personas[$persona_type])) {
                $personas[$persona_type] = array(
                    'type' => $persona_type,
                    'label' => $persona_label,
                    'icon' => $persona_icon
                );
            }

            // Collect unique use cases (using array keys for O(1) lookups)
            $use_cases[$use_case] = true;

            // Collect unique layout variants (using array keys for O(1) lookups)
            $layout_variants[$layout_variant] = true;

            // Build the nested manifest: persona -> use_case -> layout_variants[]
            if (!isset($manifest[$persona_type])) {
                $manifest[$persona_type] = array();
            }
            if (!isset($manifest[$persona_type][$use_case])) {
                $manifest[$persona_type][$use_case] = array();
            }
            if (!in_array($layout_variant, $manifest[$persona_type][$use_case])) {
                $manifest[$persona_type][$use_case][] = $layout_variant;
            }
        }

        // Extract keys and sort for consistent ordering
        $use_cases = array_keys($use_cases);
        $layout_variants = array_keys($layout_variants);
        sort($use_cases);
        sort($layout_variants);

        $result = array(
            'personas' => array_values($personas),
            'use_cases' => $use_cases,
            'layout_variants' => $layout_variants,
            'manifest' => $manifest
        );

        // Cache the result
        set_transient($this->manifest_cache_key, $result, $this->cache_duration);

        return $result;
    }

    /**
     * Clear template cache (includes filter manifest cache)
     */
    public function clearCache() {
        delete_transient($this->cache_key);
        delete_transient($this->manifest_cache_key);
    }

    /**
     * Force refresh templates
     *
     * @return array
     */
    public function forceRefresh() {
        $this->clearCache();
        return $this->scan(true);
    }

    /**
     * Get template for REST API response (summary view)
     *
     * @param string $template_id Template identifier
     * @return array|null Simplified template data for list views
     */
    public function getTemplateSummary($template_id) {
        $template = $this->getTemplate($template_id);
        if (!$template) {
            return null;
        }

        return array(
            'id' => $template['template_id'],
            'name' => $template['template_name'],
            'description' => isset($template['description']) ? $template['description'] : '',
            'persona' => isset($template['persona']) ? $template['persona'] : null,
            'preview_url' => isset($template['preview_url']) ? $template['preview_url'] : null,
            'metadata' => isset($template['metadata']) ? $template['metadata'] : array()
        );
    }

    /**
     * Get all template summaries
     *
     * @return array Array of template summaries
     */
    public function getAllSummaries() {
        $templates = $this->getTemplates();
        $summaries = array();

        foreach ($templates as $id => $template) {
            $summaries[$id] = $this->getTemplateSummary($id);
        }

        return $summaries;
    }
}
