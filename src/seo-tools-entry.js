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

// Import generator components from consolidated /tools/ directories
// Message Builder tools
import BiographyWidget from '@tools/biography/Widget.vue';
import TopicsWidget from '@tools/topics/Widget.vue';
import QuestionsWidget from '@tools/questions/Widget.vue';
import TaglineWidget from '@tools/tagline/Widget.vue';
import GuestIntroWidget from '@tools/guest-intro/Widget.vue';
import AuthorityHookWidget from '@tools/authority-hook/Widget.vue';
import OffersWidget from '@tools/offers/Widget.vue';

// Value Builder tools
import ElevatorPitchWidget from '@tools/elevator-pitch/Widget.vue';
import SoundBiteWidget from '@tools/sound-bite/Widget.vue';
import PersonaWidget from '@tools/persona/Widget.vue';
import ImpactIntroWidget from '@tools/impact-intro/Widget.vue';

// Strategy tools
import BrandStoryWidget from '@tools/brand-story/Widget.vue';
import SignatureStoryWidget from '@tools/signature-story/Widget.vue';
import CredibilityStoryWidget from '@tools/credibility-story/Widget.vue';
import FrameworkWidget from '@tools/framework/Widget.vue';
import InterviewPrepWidget from '@tools/interview-prep/Widget.vue';

// Content tools
import BlogWidget from '@tools/blog/Widget.vue';
import ContentRepurposerWidget from '@tools/content-repurpose/Widget.vue';
import PressReleaseWidget from '@tools/press-release/Widget.vue';

// Social/Email tools
import SocialPostWidget from '@tools/social-post/Widget.vue';
import EmailWidget from '@tools/email/Widget.vue';
import NewsletterWidget from '@tools/newsletter/Widget.vue';
import YoutubeDescriptionWidget from '@tools/youtube-description/Widget.vue';
import PodcastNotesWidget from '@tools/podcast-notes/Widget.vue';
import SeoOptimizerWidget from '@tools/seo-optimizer/Widget.vue';
import PodcastDetailsExtractorWidget from '@tools/podcast-details-extractor/Widget.vue';

// Page components for directory and tool pages
import ToolDirectoryPage from '@tools/ToolDirectoryPage.vue';
import ToolLandingPage from '@tools/ToolLandingPage.vue';
import DynamicToolPage from '@tools/DynamicToolPage.vue';

// PLG Embedded tool components
import { EmbeddedToolWrapper } from '@tools/_shared';
import AuthorityHookGenerator from '@tools/authority-hook/Generator.vue';
import BiographyGenerator from '@tools/biography/Generator.vue';
import ElevatorPitchGenerator from '@tools/elevator-pitch/Generator.vue';
import TaglineGenerator from '@tools/tagline/Generator.vue';
import TopicsGenerator from '@tools/topics/Generator.vue';
import QuestionsGenerator from '@tools/questions/Generator.vue';
import GuestIntroGenerator from '@tools/guest-intro/Generator.vue';
import OffersGenerator from '@tools/offers/Generator.vue';
import ImpactIntroGenerator from '@tools/impact-intro/Generator.vue';
import PersonaGenerator from '@tools/persona/Generator.vue';
import SoundBiteGenerator from '@tools/sound-bite/Generator.vue';
import BrandStoryGenerator from '@tools/brand-story/Generator.vue';
import SignatureStoryGenerator from '@tools/signature-story/Generator.vue';
import CredibilityStoryGenerator from '@tools/credibility-story/Generator.vue';
import FrameworkGenerator from '@tools/framework/Generator.vue';
import InterviewPrepGenerator from '@tools/interview-prep/Generator.vue';
import BlogGenerator from '@tools/blog/Generator.vue';
import ContentRepurposeGenerator from '@tools/content-repurpose/Generator.vue';
import PressReleaseGenerator from '@tools/press-release/Generator.vue';
import SocialPostGenerator from '@tools/social-post/Generator.vue';
import EmailGenerator from '@tools/email/Generator.vue';
import NewsletterGenerator from '@tools/newsletter/Generator.vue';
import YoutubeDescriptionGenerator from '@tools/youtube-description/Generator.vue';
import PodcastNotesGenerator from '@tools/podcast-notes/Generator.vue';
import SeoOptimizerGenerator from '@tools/seo-optimizer/Generator.vue';
import PodcastDetailsExtractorGenerator from '@tools/podcast-details-extractor/Generator.vue';

/**
 * Component registry for data-gmkb-tool attribute values
 * Supports both short names and legacy full slugs for backwards compatibility
 */
const TOOL_COMPONENTS = {
    // Message Builder tools
    'biography': BiographyWidget,
    'biography-generator': BiographyWidget,
    'topics': TopicsWidget,
    'topics-generator': TopicsWidget,
    'questions': QuestionsWidget,
    'questions-generator': QuestionsWidget,
    'tagline': TaglineWidget,
    'tagline-generator': TaglineWidget,
    'guest-intro': GuestIntroWidget,
    'guest-intro-generator': GuestIntroWidget,
    'authority-hook': AuthorityHookWidget,
    'authority-hook-builder': AuthorityHookWidget,
    'offers': OffersWidget,
    'offers-generator': OffersWidget,

    // Value Builder tools
    'elevator-pitch': ElevatorPitchWidget,
    'elevator-pitch-generator': ElevatorPitchWidget,
    'sound-bite': SoundBiteWidget,
    'sound-bite-generator': SoundBiteWidget,
    'persona': PersonaWidget,
    'persona-generator': PersonaWidget,
    'impact-intro': ImpactIntroWidget,
    'impact-intro-builder': ImpactIntroWidget,

    // Strategy tools
    'brand-story': BrandStoryWidget,
    'brand-story-generator': BrandStoryWidget,
    'signature-story': SignatureStoryWidget,
    'signature-story-generator': SignatureStoryWidget,
    'credibility-story': CredibilityStoryWidget,
    'credibility-story-generator': CredibilityStoryWidget,
    'framework': FrameworkWidget,
    'framework-builder': FrameworkWidget,
    'interview-prep': InterviewPrepWidget,
    'interview-prep-generator': InterviewPrepWidget,

    // Content tools
    'blog': BlogWidget,
    'blog-generator': BlogWidget,
    'content-repurpose': ContentRepurposerWidget,
    'content-repurposer': ContentRepurposerWidget,
    'press-release': PressReleaseWidget,
    'press-release-generator': PressReleaseWidget,

    // Social/Email tools
    'social-post': SocialPostWidget,
    'social-post-generator': SocialPostWidget,
    'email': EmailWidget,
    'email-writer': EmailWidget,
    'newsletter': NewsletterWidget,
    'newsletter-writer': NewsletterWidget,
    'youtube-description': YoutubeDescriptionWidget,
    'youtube-description-generator': YoutubeDescriptionWidget,
    'podcast-notes': PodcastNotesWidget,
    'podcast-notes-generator': PodcastNotesWidget,
    'seo-optimizer': SeoOptimizerWidget,
    'podcast-details-extractor': PodcastDetailsExtractorWidget,
};

/**
 * Generator component registry for PLG embedded mode
 * Maps tool slugs to their full Generator components (not widgets)
 */
const EMBEDDED_GENERATORS = {
    // Message Builder tools
    'authority-hook': AuthorityHookGenerator,
    'authority-hook-builder': AuthorityHookGenerator,
    'biography': BiographyGenerator,
    'biography-generator': BiographyGenerator,
    'topics': TopicsGenerator,
    'topics-generator': TopicsGenerator,
    'questions': QuestionsGenerator,
    'questions-generator': QuestionsGenerator,
    'tagline': TaglineGenerator,
    'tagline-generator': TaglineGenerator,
    'guest-intro': GuestIntroGenerator,
    'guest-intro-generator': GuestIntroGenerator,
    'offers': OffersGenerator,
    'offers-generator': OffersGenerator,

    // Value Builder tools
    'elevator-pitch': ElevatorPitchGenerator,
    'elevator-pitch-generator': ElevatorPitchGenerator,
    'sound-bite': SoundBiteGenerator,
    'sound-bite-generator': SoundBiteGenerator,
    'persona': PersonaGenerator,
    'persona-generator': PersonaGenerator,
    'impact-intro': ImpactIntroGenerator,
    'impact-intro-builder': ImpactIntroGenerator,

    // Strategy tools
    'brand-story': BrandStoryGenerator,
    'brand-story-generator': BrandStoryGenerator,
    'signature-story': SignatureStoryGenerator,
    'signature-story-generator': SignatureStoryGenerator,
    'credibility-story': CredibilityStoryGenerator,
    'credibility-story-generator': CredibilityStoryGenerator,
    'framework': FrameworkGenerator,
    'framework-builder': FrameworkGenerator,
    'interview-prep': InterviewPrepGenerator,
    'interview-prep-generator': InterviewPrepGenerator,

    // Content tools
    'blog': BlogGenerator,
    'blog-generator': BlogGenerator,
    'content-repurpose': ContentRepurposeGenerator,
    'content-repurposer': ContentRepurposeGenerator,
    'press-release': PressReleaseGenerator,
    'press-release-generator': PressReleaseGenerator,

    // Social/Email tools
    'social-post': SocialPostGenerator,
    'social-post-generator': SocialPostGenerator,
    'email': EmailGenerator,
    'email-writer': EmailGenerator,
    'newsletter': NewsletterGenerator,
    'newsletter-writer': NewsletterGenerator,
    'youtube-description': YoutubeDescriptionGenerator,
    'youtube-description-generator': YoutubeDescriptionGenerator,
    'podcast-notes': PodcastNotesGenerator,
    'podcast-notes-generator': PodcastNotesGenerator,
    'seo-optimizer': SeoOptimizerGenerator,
    'podcast-details-extractor': PodcastDetailsExtractorGenerator,
};

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
            return h('div', { class: 'gmkb-standalone-scope' }, [
                h(EmbeddedToolWrapper, {
                    intents: intents,
                    defaultHeading: meta.hero?.contextHeading || 'Create your hook',
                    defaultDescription: meta.hero?.contextDescription || '',
                    isGenerating: this.isGenerating,
                    canGenerate: this.canGenerate,
                    generateButtonText: `Generate ${meta.name || 'Hook'}`,
                    previewContent: this.previewContent,
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
