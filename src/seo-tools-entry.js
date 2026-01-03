/**
 * SEO Tools Standalone Entry Point
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * This entry creates a self-contained Vue application for public-facing AI generators.
 *
 * Features:
 * - Auto-mounts to elements with [data-gmkb-tool] attribute
 * - Tool directory page [data-gmkb-page-type="directory"]
 * - Individual tool pages [data-gmkb-page-type="tool"]
 * - Self-contained Pinia store (no external Vue app dependency)
 * - CSS isolation via scoped wrapper class
 * - IP-based rate limiting (no WordPress auth required)
 *
 * Usage in WordPress:
 * ```php
 * // Individual tool widget:
 * <div data-gmkb-tool="biography"></div>
 *
 * // Tool directory page:
 * <div data-gmkb-page-type="directory" data-gmkb-base-url="/tools/"></div>
 *
 * // Individual tool page:
 * <div data-gmkb-page-type="tool" data-gmkb-tool-slug="biography"></div>
 * ```
 *
 * @package GMKB
 * @subpackage SEO Tools
 * @version 2.0.0
 * @since 2.2.0
 */

import { createApp, h } from 'vue';
import { createPinia } from 'pinia';

// Import standalone CSS (includes reset wrapper)
import './styles/ai-standalone.css';
import './styles/ai-shared.css';

// Auto-discovery: Import all tool modules from centralized registry
import { toolModules, EmbeddedToolWrapper } from '@tools';

// Page components for directory and tool pages
import ToolDirectoryPage from '@tools/ToolDirectoryPage.vue';
import ToolLandingPage from '@tools/ToolLandingPage.vue';
import DynamicToolPage from '@tools/DynamicToolPage.vue';

/**
 * Legacy alias mappings for backwards compatibility
 * Maps legacy slugs to their canonical tool slugs
 */
const LEGACY_ALIASES = {
    'biography-generator': 'biography',
    'topics-generator': 'topics',
    'questions-generator': 'questions',
    'tagline-generator': 'tagline',
    'guest-intro-generator': 'guest-intro',
    'authority-hook-builder': 'authority-hook',
    'offers-generator': 'offers',
    'elevator-pitch-generator': 'elevator-pitch',
    'sound-bite-generator': 'sound-bite',
    'persona-generator': 'persona',
    'impact-intro-builder': 'impact-intro',
    'brand-story-generator': 'brand-story',
    'signature-story-generator': 'signature-story',
    'credibility-story-generator': 'credibility-story',
    'framework-builder': 'framework',
    'interview-prep-generator': 'interview-prep',
    'blog-generator': 'blog',
    'content-repurposer': 'content-repurpose',
    'press-release-generator': 'press-release',
    'social-post-generator': 'social-post',
    'email-writer': 'email',
    'newsletter-writer': 'newsletter',
    'youtube-description-generator': 'youtube-description',
    'podcast-notes-generator': 'podcast-notes',
};

/**
 * Build component registry dynamically from toolModules
 * Auto-discovers Widget components from each tool's index.js
 */
function buildToolComponents() {
    const components = {};

    Object.entries(toolModules).forEach(([slug, module]) => {
        // Get Widget component (default export is Widget for most tools)
        const Widget = module.Widget || module.default;
        if (Widget) {
            components[slug] = Widget;
        }
    });

    // Add legacy aliases
    Object.entries(LEGACY_ALIASES).forEach(([alias, canonicalSlug]) => {
        if (components[canonicalSlug]) {
            components[alias] = components[canonicalSlug];
        }
    });

    return components;
}

/**
 * Build embedded generators registry dynamically from toolModules
 * Auto-discovers Generator components from each tool's index.js
 */
function buildEmbeddedGenerators() {
    const generators = {};

    Object.entries(toolModules).forEach(([slug, module]) => {
        // Get Generator component
        const Generator = module.Generator;
        if (Generator) {
            generators[slug] = Generator;
        }
    });

    // Add legacy aliases
    Object.entries(LEGACY_ALIASES).forEach(([alias, canonicalSlug]) => {
        if (generators[canonicalSlug]) {
            generators[alias] = generators[canonicalSlug];
        }
    });

    return generators;
}

/**
 * Component registry for data-gmkb-tool attribute values
 * Auto-generated from toolModules with legacy alias support
 */
const TOOL_COMPONENTS = buildToolComponents();

/**
 * Generator component registry for PLG embedded mode
 * Auto-generated from toolModules with legacy alias support
 */
const EMBEDDED_GENERATORS = buildEmbeddedGenerators();

/**
 * Store mounted app instances for cleanup
 */
const mountedApps = new Map();

/**
 * Initialize a single SEO tool instance
 *
 * @param {HTMLElement} container - The container element with data-gmkb-tool or data-tool
 * @param {string} [toolTypeOverride] - Optional tool type to use instead of data attribute
 * @returns {Object|null} Vue app instance or null if initialization failed
 */
function initializeTool(container, toolTypeOverride = null) {
    // Support both data-gmkb-tool and data-tool attributes
    const toolType = toolTypeOverride || container.dataset.gmkbTool || container.dataset.tool;

    // Validate tool type
    const Component = TOOL_COMPONENTS[toolType];
    if (!Component) {
        console.error(`[GMKBSeoTools] Unknown tool type: ${toolType}`);
        return null;
    }

    // Check if already mounted
    if (mountedApps.has(container)) {
        console.warn(`[GMKBSeoTools] Tool already mounted on element`);
        return mountedApps.get(container);
    }

    // Store nonce globally for API calls (from wp_localize_script)
    if (!window.gmkbSeoTools) {
        const nonce = window.gmkbPublicNonce || (window.gmkbPublicData && window.gmkbPublicData.publicNonce) || '';
        window.gmkbSeoTools = { nonce };
    }

    // Create Vue app with the component
    const app = createApp({
        name: 'GMKBSeoToolWrapper',
        render() {
            return h('div', { class: 'gmkb-standalone-scope' }, [
                h(Component, {
                    mode: 'standalone',
                    onApplied: (data) => {
                        // Emit custom event for external listeners
                        container.dispatchEvent(new CustomEvent('gmkb:applied', {
                            detail: data,
                            bubbles: true,
                        }));
                    },
                    onGenerated: (data) => {
                        // Emit custom event for external listeners
                        container.dispatchEvent(new CustomEvent('gmkb:generated', {
                            detail: data,
                            bubbles: true,
                        }));
                    },
                }),
            ]);
        },
    });

    // Create and install Pinia store
    const pinia = createPinia();
    app.use(pinia);

    // Mount the app
    app.mount(container);

    // Store reference for cleanup
    mountedApps.set(container, app);

    console.log(`[GMKBSeoTools] Mounted ${toolType} tool`);

    return app;
}

/**
 * Initialize the tool directory page
 *
 * @param {HTMLElement} container - The container element with data-gmkb-page-type="directory"
 * @returns {Object|null} Vue app instance or null if initialization failed
 */
function initializeDirectory(container) {
    // Check if already mounted
    if (mountedApps.has(container)) {
        console.warn(`[GMKBSeoTools] Directory already mounted on element`);
        return mountedApps.get(container);
    }

    // Get base URL from data attribute
    const baseUrl = container.dataset.gmkbBaseUrl || '/tools/';

    // Create Vue app with ToolDirectoryPage
    const app = createApp({
        name: 'GMKBToolDirectory',
        render() {
            return h('div', { class: 'gmkb-standalone-scope' }, [
                h(ToolDirectoryPage, {
                    baseUrl: baseUrl,
                }),
            ]);
        },
    });

    // Create and install Pinia store
    const pinia = createPinia();
    app.use(pinia);

    // Mount the app
    app.mount(container);

    // Store reference for cleanup
    mountedApps.set(container, app);

    console.log(`[GMKBSeoTools] Mounted tool directory`);

    return app;
}

/**
 * Initialize a dynamic tool page
 *
 * @param {HTMLElement} container - The container element with data-gmkb-page-type="tool"
 * @returns {Object|null} Vue app instance or null if initialization failed
 */
function initializeToolPage(container) {
    // Check if already mounted
    if (mountedApps.has(container)) {
        console.warn(`[GMKBSeoTools] Tool page already mounted on element`);
        return mountedApps.get(container);
    }

    // Get tool slug and mode from data attributes
    const toolSlug = container.dataset.gmkbToolSlug || '';
    const directoryUrl = container.dataset.gmkbDirectoryUrl || '/tools/';
    const mode = container.dataset.gmkbMode || 'landing'; // 'landing' or 'use'

    // Store nonce globally for API calls
    if (!window.gmkbSeoTools) {
        const nonce = window.gmkbPublicNonce || (window.gmkbPublicData && window.gmkbPublicData.publicNonce) || '';
        window.gmkbSeoTools = { nonce };
    }

    // Choose component based on mode
    const PageComponent = mode === 'use' ? DynamicToolPage : ToolLandingPage;

    // Create Vue app with appropriate page component
    const app = createApp({
        name: mode === 'use' ? 'GMKBDynamicToolPage' : 'GMKBToolLandingPage',
        render() {
            return h('div', { class: 'gmkb-standalone-scope' }, [
                h(PageComponent, {
                    toolSlug: toolSlug,
                    directoryUrl: directoryUrl,
                }),
            ]);
        },
    });

    // Create and install Pinia store
    const pinia = createPinia();
    app.use(pinia);

    // Mount the app
    app.mount(container);

    // Store reference for cleanup
    mountedApps.set(container, app);

    console.log(`[GMKBSeoTools] Mounted dynamic tool page: ${toolSlug || '(auto-detect)'}`);

    return app;
}

/**
 * Initialize a PLG (Product-Led Growth) embedded tool
 *
 * This is used for the new VEED-style landing pages where the tool
 * is embedded directly in the hero section with intent tabs.
 *
 * @param {HTMLElement} container - The container element with data-mode="embedded"
 * @returns {Object|null} Vue app instance or null if initialization failed
 */
function initializeEmbeddedTool(container) {
    // Check if already mounted
    if (mountedApps.has(container)) {
        console.warn(`[GMKBSeoTools] Embedded tool already mounted on element`);
        return mountedApps.get(container);
    }

    // Get configuration from data attributes
    const toolSlug = container.dataset.tool || '';
    const mode = container.dataset.mode || 'embedded';

    // Parse intents and meta from data attributes
    let intents = [];
    let meta = {};
    try {
        intents = JSON.parse(container.dataset.intents || '[]');
        meta = JSON.parse(container.dataset.meta || '{}');
    } catch (e) {
        console.error('[GMKBSeoTools] Failed to parse embedded tool data:', e);
    }

    // Find the generator component for this tool
    const GeneratorComponent = EMBEDDED_GENERATORS[toolSlug];
    if (!GeneratorComponent) {
        console.error(`[GMKBSeoTools] No embedded generator for tool: ${toolSlug}`);
        return null;
    }

    // Store nonce globally for API calls
    if (!window.gmkbSeoTools) {
        const nonce = window.gmkbPublicNonce || (window.gmkbPublicData && window.gmkbPublicData.publicNonce) || '';
        window.gmkbSeoTools = { nonce };
    }

    // Check if user is logged in (check both possible sources)
    const isLoggedIn = !!(window.gmkbStandaloneTools?.isLoggedIn || window.gmkbUserData?.isLoggedIn);

    // Build related tools array from meta.relatedToolSlugs
    const relatedTools = buildRelatedTools(meta.relatedToolSlugs || [], toolSlug);

    // Get testimonial from meta
    const testimonial = meta.socialProof?.testimonial || null;

    // Create Vue app with EmbeddedToolWrapper containing the Generator
    const app = createApp({
        name: 'GMKBEmbeddedTool',
        data() {
            return {
                currentIntent: intents[0] || null,
                previewContent: '',
                isGenerating: false,
                canGenerate: false,
            };
        },
        methods: {
            handleIntentChange(intent) {
                this.currentIntent = intent;
            },
            handlePreviewUpdate({ previewHtml }) {
                this.previewContent = previewHtml;
            },
            handleGenerate() {
                // Trigger generate on the child generator component
                if (this.$refs.generator && this.$refs.generator.handleGenerate) {
                    this.isGenerating = true;
                    this.$refs.generator.handleGenerate();
                }
            },
            handleSaveClick() {
                // Emit event for analytics
                container.dispatchEvent(new CustomEvent('gmkb:save-click', {
                    bubbles: true,
                    detail: { tool: toolSlug }
                }));
            },
            handleGateShown(data) {
                // Track soft gate impression for analytics
                container.dispatchEvent(new CustomEvent('gmkb:gate-shown', {
                    bubbles: true,
                    detail: { tool: toolSlug, ...data }
                }));
            },
            handleGateSignup() {
                // Track signup intent from gate
                container.dispatchEvent(new CustomEvent('gmkb:gate-signup', {
                    bubbles: true,
                    detail: { tool: toolSlug }
                }));
            },
        },
        render() {
            // Extract tool display name for dynamic labels
            const toolDisplayName = meta.name || 'Content';
            // Create a noun form (lowercase, for use in sentences)
            const contentNoun = toolDisplayName.toLowerCase()
                .replace(' generator', '')
                .replace(' builder', '')
                .replace(' writer', '');

            return h('div', { class: 'gmkb-standalone-scope' }, [
                h(EmbeddedToolWrapper, {
                    intents: intents,
                    defaultHeading: meta.hero?.contextHeading || `Create your ${contentNoun}`,
                    defaultDescription: meta.hero?.contextDescription || '',
                    isGenerating: this.isGenerating,
                    canGenerate: this.canGenerate,
                    generateButtonText: `Generate ${toolDisplayName}`,
                    previewContent: this.previewContent,
                    // Tool-specific labels
                    resultLabel: `Your ${toolDisplayName}`,
                    contentNoun: contentNoun,
                    previewLabel: `Sample ${toolDisplayName}`,
                    // PLG conversion props
                    toolSlug: toolSlug,
                    isLoggedIn: isLoggedIn,
                    relatedTools: relatedTools,
                    testimonial: testimonial,
                    registerUrl: '/register/',
                    // Event handlers
                    onIntentChange: this.handleIntentChange,
                    onGenerate: this.handleGenerate,
                    onSaveClick: this.handleSaveClick,
                    onGateShown: this.handleGateShown,
                    onGateSignup: this.handleGateSignup,
                }, {
                    // Form slot - render the generator in embedded mode
                    // Uses scoped slot to receive profileData from EmbeddedToolWrapper
                    form: (slotProps) => h(GeneratorComponent, {
                        ref: 'generator',
                        mode: 'embedded',
                        intent: this.currentIntent,
                        profileData: slotProps.profileData,
                        onPreviewUpdate: this.handlePreviewUpdate,
                        onGenerated: (data) => {
                            this.isGenerating = false;
                            container.dispatchEvent(new CustomEvent('gmkb:generated', {
                                detail: data,
                                bubbles: true,
                            }));
                        },
                        'onUpdate:can-generate': (value) => {
                            this.canGenerate = value;
                        },
                    }),
                    // Preview slot - show generated or live preview content
                    preview: () => this.previewContent
                        ? h('p', {
                            class: 'preview-hook',
                            innerHTML: this.previewContent
                        })
                        : null,
                }),
            ]);
        },
    });

    // Create and install Pinia store
    const pinia = createPinia();
    app.use(pinia);

    // Mount the app
    app.mount(container);

    // Store reference for cleanup
    mountedApps.set(container, app);

    console.log(`[GMKBSeoTools] Mounted embedded tool: ${toolSlug}`);

    return app;
}

/**
 * Build related tools array from slugs for PLG expansion panel
 *
 * @param {string[]} slugs - Array of tool slugs
 * @param {string} currentSlug - Current tool slug (to exclude)
 * @returns {Array} Array of related tool objects
 */
function buildRelatedTools(slugs, currentSlug) {
    // Tool metadata for building related tools cards
    const toolMeta = {
        'biography-generator': {
            name: 'Biography Generator',
            description: 'Turn your hook into a full professional bio',
            icon: '📝',
            url: '/tools/biography/',
            requiresAccount: false
        },
        'biography': {
            name: 'Biography Generator',
            description: 'Turn your hook into a full professional bio',
            icon: '📝',
            url: '/tools/biography/',
            requiresAccount: false
        },
        'elevator-pitch-generator': {
            name: 'Elevator Pitch',
            description: 'Expand your hook into a 30-second pitch',
            icon: '🎯',
            url: '/tools/elevator-pitch/',
            requiresAccount: false
        },
        'elevator-pitch': {
            name: 'Elevator Pitch',
            description: 'Expand your hook into a 30-second pitch',
            icon: '🎯',
            url: '/tools/elevator-pitch/',
            requiresAccount: false
        },
        'tagline-generator': {
            name: 'Tagline Generator',
            description: 'Condense your hook into a punchy tagline',
            icon: '✨',
            url: '/tools/tagline/',
            requiresAccount: false
        },
        'tagline': {
            name: 'Tagline Generator',
            description: 'Condense your hook into a punchy tagline',
            icon: '✨',
            url: '/tools/tagline/',
            requiresAccount: false
        },
        'impact-intro-builder': {
            name: 'Impact Intro',
            description: 'Create a compelling introduction statement',
            icon: '💫',
            url: '/tools/impact-intro/',
            requiresAccount: false
        },
        'impact-intro': {
            name: 'Impact Intro',
            description: 'Create a compelling introduction statement',
            icon: '💫',
            url: '/tools/impact-intro/',
            requiresAccount: false
        },
        'interview-prep-generator': {
            name: 'Interview Prep',
            description: 'Prepare talking points for podcast interviews',
            icon: '🎙️',
            url: '/tools/interview-prep/',
            requiresAccount: true
        },
        'podcast-pitch': {
            name: 'Podcast Pitch',
            description: 'Use your hook to pitch podcast hosts',
            icon: '📧',
            url: '/dashboard/pitches/',
            requiresAccount: true
        }
    };

    return slugs
        .filter(slug => slug !== currentSlug)
        .slice(0, 3) // Max 3 related tools
        .map(slug => ({
            slug,
            ...(toolMeta[slug] || {
                name: slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
                description: 'Continue building your messaging',
                icon: '🔧',
                url: `/tools/${slug}/`,
                requiresAccount: false
            })
        }));
}

/**
 * Initialize all SEO tools on the page
 *
 * Handles four types of containers:
 * - [data-gmkb-tool] - Individual tool widgets
 * - [data-gmkb-page-type="directory"] - Tool directory page
 * - [data-gmkb-page-type="tool"] - Dynamic tool page
 * - [data-mode="embedded"] - PLG embedded tools in landing pages
 *
 * @returns {number} Number of tools initialized
 */
function initializeAll() {
    let count = 0;

    // Initialize individual tool widgets
    const toolContainers = document.querySelectorAll('[data-gmkb-tool]');
    toolContainers.forEach((container) => {
        if (initializeTool(container)) {
            count++;
        }
    });

    // Initialize directory pages
    const directoryContainers = document.querySelectorAll('[data-gmkb-page-type="directory"]');
    directoryContainers.forEach((container) => {
        if (initializeDirectory(container)) {
            count++;
        }
    });

    // Initialize dynamic tool pages
    const toolPageContainers = document.querySelectorAll('[data-gmkb-page-type="tool"]');
    toolPageContainers.forEach((container) => {
        if (initializeToolPage(container)) {
            count++;
        }
    });

    // Initialize PLG embedded tools
    const embeddedContainers = document.querySelectorAll('[data-mode="embedded"]');
    embeddedContainers.forEach((container) => {
        if (initializeEmbeddedTool(container)) {
            count++;
        }
    });

    console.log(`[GMKBSeoTools] Initialized ${count} component(s)`);
    return count;
}

/**
 * Mount a tool to a specific element (alias for shortcode compatibility)
 *
 * @param {HTMLElement} container - The container element
 * @param {string} toolType - The tool type/slug
 * @param {Object} [config] - Optional configuration (unused, for API compatibility)
 * @returns {Object|null} Vue app instance
 */
function mountTool(container, toolType, config = {}) {
    return initializeTool(container, toolType);
}

/**
 * Destroy a mounted tool instance
 *
 * @param {HTMLElement} container - The container element
 * @returns {boolean} Whether the tool was successfully destroyed
 */
function destroyTool(container) {
    const app = mountedApps.get(container);
    if (app) {
        app.unmount();
        mountedApps.delete(container);
        return true;
    }
    return false;
}

/**
 * Destroy all mounted tool instances
 */
function destroyAll() {
    mountedApps.forEach((app, container) => {
        app.unmount();
    });
    mountedApps.clear();
}

// Export API for external use
window.GMKBSeoTools = {
    init: initializeTool,
    initDirectory: initializeDirectory,
    initToolPage: initializeToolPage,
    initEmbedded: initializeEmbeddedTool,
    initAll: initializeAll,
    mountTool: mountTool,  // Alias for shortcode compatibility
    destroy: destroyTool,
    destroyAll: destroyAll,
    version: '2.1.0',
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll);
} else {
    // DOM already loaded (script loaded async or deferred)
    initializeAll();
}

// Support dynamic content (e.g., AJAX-loaded elements)
// Observe for new elements with gmkb data attributes
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if the added node is a tool container
                if (node.hasAttribute && node.hasAttribute('data-gmkb-tool')) {
                    initializeTool(node);
                }
                // Check if the added node is a directory page
                if (node.hasAttribute && node.getAttribute('data-gmkb-page-type') === 'directory') {
                    initializeDirectory(node);
                }
                // Check if the added node is a tool page
                if (node.hasAttribute && node.getAttribute('data-gmkb-page-type') === 'tool') {
                    initializeToolPage(node);
                }
                // Check if the added node is an embedded tool
                if (node.hasAttribute && node.getAttribute('data-mode') === 'embedded') {
                    initializeEmbeddedTool(node);
                }

                // Check children of added node for all types
                if (node.querySelectorAll) {
                    const toolChildren = node.querySelectorAll('[data-gmkb-tool]');
                    toolChildren.forEach(initializeTool);

                    const directoryChildren = node.querySelectorAll('[data-gmkb-page-type="directory"]');
                    directoryChildren.forEach(initializeDirectory);

                    const toolPageChildren = node.querySelectorAll('[data-gmkb-page-type="tool"]');
                    toolPageChildren.forEach(initializeToolPage);

                    const embeddedChildren = node.querySelectorAll('[data-mode="embedded"]');
                    embeddedChildren.forEach(initializeEmbeddedTool);
                }
            }
        });
    });
});

// Start observing
observer.observe(document.body, {
    childList: true,
    subtree: true,
});

export {
    initializeTool,
    initializeDirectory,
    initializeToolPage,
    initializeEmbeddedTool,
    initializeAll,
    destroyTool,
    destroyAll,
};
