/**
 * Tool Registry Service
 *
 * Provides centralized access to all AI tool metadata using Vite's glob imports.
 * This service loads all meta.json files from the generators directory and provides
 * methods for querying tools by slug, category, or related tools.
 *
 * @package GMKB
 * @subpackage Services
 * @version 1.0.0
 * @since 2.3.0
 */

// Use Vite's glob import to load all meta.json files eagerly
const metaModules = import.meta.glob('../components/generators/**/meta.json', { eager: true });

/**
 * Category configuration for display and ordering
 */
const CATEGORY_CONFIG = {
    'message-builder': {
        name: 'Message Builder',
        description: 'Create compelling bios, topics, and core messaging',
        order: 1,
    },
    'value-builder': {
        name: 'Value Builder',
        description: 'Craft your elevator pitch, sound bites, and authority positioning',
        order: 2,
    },
    'strategy': {
        name: 'Strategy',
        description: 'Develop your brand story, frameworks, and interview preparation',
        order: 3,
    },
    'content': {
        name: 'Content',
        description: 'Generate blogs, press releases, and repurposed content',
        order: 4,
    },
    'social-email': {
        name: 'Social & Email',
        description: 'Create social posts, emails, newsletters, and show notes',
        order: 5,
    },
};

/**
 * Process and normalize all tool metadata
 */
function loadTools() {
    const tools = [];

    Object.entries(metaModules).forEach(([path, module]) => {
        // Extract the slug from the path (e.g., '../components/generators/topics-generator/meta.json' -> 'topics-generator')
        const match = path.match(/generators\/([^/]+)\/meta\.json$/);
        if (match) {
            const slug = match[1];
            const meta = module.default || module;

            // Ensure slug matches directory name
            if (meta.slug !== slug) {
                console.warn(`[ToolRegistry] Slug mismatch: ${meta.slug} !== ${slug}`);
            }

            tools.push({
                ...meta,
                slug: slug, // Use directory name as canonical slug
            });
        }
    });

    return tools;
}

// Load all tools on module initialization
const allTools = loadTools();

/**
 * Tool Registry API
 */
const ToolRegistry = {
    /**
     * Get all tools
     * @returns {Array} All tool metadata objects
     */
    getAllTools() {
        return allTools;
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
     * Get all tools in a specific category
     * @param {string} category - The category slug (e.g., 'message-builder')
     * @returns {Array} Tools in the specified category
     */
    getToolsByCategory(category) {
        return allTools.filter((tool) => tool.category === category);
    },

    /**
     * Get tools organized by category
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

        // Assign tools to categories
        allTools.forEach((tool) => {
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
     * Search tools by keyword
     * @param {string} query - Search query
     * @returns {Array} Matching tools
     */
    searchTools(query) {
        const lowerQuery = query.toLowerCase();
        return allTools.filter((tool) => {
            return (
                tool.name.toLowerCase().includes(lowerQuery) ||
                tool.shortDescription.toLowerCase().includes(lowerQuery) ||
                tool.seoMeta?.keywords?.some((kw) => kw.toLowerCase().includes(lowerQuery))
            );
        });
    },

    /**
     * Get total tool count
     * @returns {number} Total number of tools
     */
    getToolCount() {
        return allTools.length;
    },
};

export default ToolRegistry;
export { CATEGORY_CONFIG };
