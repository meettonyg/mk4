/**
 * Tool Registry Service
 *
 * Provides centralized access to all AI tool metadata using Vite's glob imports.
 *
 * Supports two directory structures:
 * - NEW: /tools/{tool-name}/ with tool.json, meta.json, prompts.php, Component.vue
 * - LEGACY: /src/vue/components/generators/{tool-name}/ with meta.json only
 *
 * The new /tools/ directory is prioritized; legacy paths are for backward compatibility.
 *
 * @package GMKB
 * @subpackage Services
 * @version 2.0.0
 * @since 2.3.0
 */

// Use Vite's glob import to load meta.json files from BOTH directories
// New /tools/ directory (prioritized)
const toolsMetaModules = import.meta.glob('../../../tools/**/meta.json', { eager: true });
const toolsConfigModules = import.meta.glob('../../../tools/**/tool.json', { eager: true });

// Legacy /components/generators/ directory (fallback)
const legacyMetaModules = import.meta.glob('../components/generators/**/meta.json', { eager: true });

/**
 * Category configuration for display and ordering
 *
 * Note: This configuration mirrors GMKB_Tool_Discovery::$categories in PHP.
 * Any changes here should be reflected there for consistency.
 */
const CATEGORY_CONFIG = {
    'message-builder': {
        name: 'Message Builder',
        description: 'Create compelling bios, topics, and core messaging',
        icon: 'ChatBubbleLeftRightIcon', // Feather: message-square
        order: 1,
    },
    'value-builder': {
        name: 'Value Builder',
        description: 'Craft your elevator pitch, sound bites, and authority positioning',
        icon: 'TrophyIcon', // Feather: award
        order: 2,
    },
    'strategy': {
        name: 'Strategy',
        description: 'Develop your brand story, frameworks, and interview preparation',
        icon: 'MapIcon', // Feather: compass
        order: 3,
    },
    'content': {
        name: 'Content',
        description: 'Generate blogs, press releases, and repurposed content',
        icon: 'DocumentTextIcon', // Feather: file-text
        order: 4,
    },
    'social-email': {
        name: 'Social & Email',
        description: 'Create social posts, emails, newsletters, and show notes',
        icon: 'ShareIcon', // Feather: share-2
        order: 5,
    },
};

/**
 * Process and normalize all tool metadata
 * Merges tools from both directories, prioritizing /tools/
 */
function loadTools() {
    const toolsMap = new Map();

    // First, load legacy tools from generators directory
    Object.entries(legacyMetaModules).forEach(([path, module]) => {
        const match = path.match(/generators\/([^/]+)\/meta\.json$/);
        if (match) {
            const slug = match[1];
            const meta = module.default || module;

            toolsMap.set(slug, {
                ...meta,
                slug: slug,
                published: true, // Legacy tools are always published
                _source: 'legacy',
                _path: path,
            });
        }
    });

    // Then, load new tools from /tools/ directory (overrides legacy)
    Object.entries(toolsMetaModules).forEach(([path, module]) => {
        const match = path.match(/tools\/([^/]+)\/meta\.json$/);
        if (match) {
            const slug = match[1];
            const meta = module.default || module;

            // Find corresponding tool.json for additional config
            const toolConfigPath = path.replace('meta.json', 'tool.json');
            const toolConfig = toolsConfigModules[toolConfigPath]?.default || toolsConfigModules[toolConfigPath] || {};

            // Default published to true if not specified
            const isPublished = toolConfig.published !== undefined ? toolConfig.published : true;

            toolsMap.set(slug, {
                ...meta,
                slug: slug,
                id: toolConfig.id || slug,
                icon: toolConfig.icon || meta.icon,
                category: toolConfig.category || meta.category,
                component: toolConfig.component || null,
                supports: toolConfig.supports || {},
                published: isPublished,
                _source: 'tools',
                _path: path,
            });
        }
    });

    // Convert Map to array
    return Array.from(toolsMap.values());
}

// Load all tools on module initialization
const allTools = loadTools();

// Log tool sources in development
if (import.meta.env.DEV) {
    const toolsSources = allTools.reduce(
        (acc, tool) => {
            acc[tool._source] = (acc[tool._source] || 0) + 1;
            return acc;
        },
        { tools: 0, legacy: 0 }
    );
    console.log('[ToolRegistry] Loaded tools:', {
        total: allTools.length,
        fromTools: toolsSources.tools,
        fromLegacy: toolsSources.legacy,
    });
}

/**
 * Tool Registry API
 */
const ToolRegistry = {
    /**
     * Get all published tools
     * @returns {Array} All published tool metadata objects
     */
    getAllTools() {
        return allTools.filter((tool) => tool.published !== false);
    },

    /**
     * Get all tools including unpublished (for admin purposes)
     * @returns {Array} All tool metadata objects
     */
    getAllToolsIncludingUnpublished() {
        return allTools;
    },

    /**
     * Check if a tool is published
     * @param {string} slugOrId - The tool slug or ID
     * @returns {boolean} True if the tool is published
     */
    isToolPublished(slugOrId) {
        const tool = allTools.find((t) => t.slug === slugOrId || t.id === slugOrId);
        return tool ? tool.published !== false : false;
    },

    /**
     * Get only published tools from the new /tools/ directory
     * @returns {Array} Published tools from /tools/ directory
     */
    getNewTools() {
        return allTools.filter((tool) => tool._source === 'tools' && tool.published !== false);
    },

    /**
     * Get only legacy tools (for migration tracking)
     * @returns {Array} Tools from legacy generators directory
     */
    getLegacyTools() {
        return allTools.filter((tool) => tool._source === 'legacy' && tool.published !== false);
    },

    /**
     * Get a tool by its slug
     * @param {string} slug - The tool slug (e.g., 'topics-generator')
     * @returns {Object|null} Tool metadata or null if not found
     */
    getToolBySlug(slug) {
        return allTools.find((tool) => tool.slug === slug) || null;
    },

    /**
     * Get a tool by its ID (from tool.json)
     * @param {string} id - The tool ID (e.g., 'biography-generator')
     * @returns {Object|null} Tool metadata or null if not found
     */
    getToolById(id) {
        return allTools.find((tool) => tool.id === id || tool.slug === id) || null;
    },

    /**
     * Get all published tools in a specific category
     * @param {string} category - The category slug (e.g., 'message-builder')
     * @returns {Array} Published tools in the specified category
     */
    getToolsByCategory(category) {
        return allTools.filter((tool) => tool.category === category && tool.published !== false);
    },

    /**
     * Get published tools organized by category
     * @returns {Object} Object with category slugs as keys and tool arrays as values
     */
    getToolsGroupedByCategory() {
        const grouped = {};

        // Initialize all categories in order
        Object.keys(CATEGORY_CONFIG)
            .sort((a, b) => CATEGORY_CONFIG[a].order - CATEGORY_CONFIG[b].order)
            .forEach((category) => {
                grouped[category] = {
                    ...CATEGORY_CONFIG[category],
                    slug: category,
                    tools: [],
                };
            });

        // Assign only published tools to categories
        allTools.forEach((tool) => {
            // Skip unpublished tools
            if (tool.published === false) {
                return;
            }

            if (grouped[tool.category]) {
                grouped[tool.category].tools.push(tool);
            } else {
                console.warn(`[ToolRegistry] Unknown category: ${tool.category} for tool ${tool.slug}`);
            }
        });

        return grouped;
    },

    /**
     * Get related tools for a given tool
     * @param {string} slug - The tool slug
     * @returns {Array} Related tool metadata objects
     */
    getRelatedTools(slug) {
        const tool = this.getToolBySlug(slug);
        if (!tool || !tool.landingContent?.relatedToolSlugs) {
            return [];
        }

        return tool.landingContent.relatedToolSlugs
            .map((relatedSlug) => this.getToolBySlug(relatedSlug))
            .filter(Boolean);
    },

    /**
     * Get category configuration
     * @param {string} category - The category slug
     * @returns {Object|null} Category config or null if not found
     */
    getCategoryConfig(category) {
        return CATEGORY_CONFIG[category] || null;
    },

    /**
     * Get all category configurations
     * @returns {Object} All category configs
     */
    getAllCategories() {
        return CATEGORY_CONFIG;
    },

    /**
     * Search published tools by keyword
     * @param {string} query - Search query
     * @returns {Array} Matching published tools
     */
    searchTools(query) {
        const lowerQuery = query.toLowerCase();
        return allTools.filter((tool) => {
            // Skip unpublished tools
            if (tool.published === false) {
                return false;
            }
            return (
                tool.name.toLowerCase().includes(lowerQuery) ||
                tool.shortDescription?.toLowerCase().includes(lowerQuery) ||
                tool.seoMeta?.keywords?.some((kw) => kw.toLowerCase().includes(lowerQuery))
            );
        });
    },

    /**
     * Get total published tool count
     * @returns {number} Total number of published tools
     */
    getToolCount() {
        return allTools.filter((tool) => tool.published !== false).length;
    },

    /**
     * Check if a tool uses the new /tools/ architecture
     * @param {string} slug - The tool slug
     * @returns {boolean} True if tool is in /tools/ directory
     */
    isNewArchitecture(slug) {
        const tool = this.getToolBySlug(slug);
        return tool?._source === 'tools';
    },

    /**
     * Get migration status
     * @returns {Object} Migration progress information
     */
    getMigrationStatus() {
        const newTools = this.getNewTools();
        const legacyTools = this.getLegacyTools();

        return {
            total: allTools.length,
            migrated: newTools.length,
            pending: legacyTools.length,
            progress: allTools.length > 0 ? Math.round((newTools.length / allTools.length) * 100) : 0,
            migratedSlugs: newTools.map((t) => t.slug),
            pendingSlugs: legacyTools.map((t) => t.slug),
        };
    },
};

export default ToolRegistry;
export { CATEGORY_CONFIG };
