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

// Import unified generator CSS for two-panel layout
import './styles/generator-unified.css';

// Import generator components from /tools/ (root level)
// Message Builder tools
import BiographyGenerator from '../tools/biography/Generator.vue';
import TopicsGenerator from '../tools/topics/Generator.vue';
import QuestionsGenerator from '../tools/questions/Generator.vue';
import TaglineGenerator from '../tools/tagline/Generator.vue';
import GuestIntroGenerator from '../tools/guest-intro/Generator.vue';
import AuthorityHookBuilder from '../tools/authority-hook/Generator.vue';
import OffersGenerator from '../tools/offers/Generator.vue';

// Value Builder tools
import ElevatorPitchGenerator from '../tools/elevator-pitch/Generator.vue';
import SoundBiteGenerator from '../tools/sound-bite/Generator.vue';
import PersonaGenerator from '../tools/persona/Generator.vue';
import ImpactIntroBuilder from '../tools/impact-intro/Generator.vue';

// Strategy tools
import BrandStoryGenerator from '../tools/brand-story/Generator.vue';
import SignatureStoryGenerator from '../tools/signature-story/Generator.vue';
import CredibilityStoryGenerator from '../tools/credibility-story/Generator.vue';
import FrameworkGenerator from '../tools/framework/Generator.vue';
import InterviewPrepGenerator from '../tools/interview-prep/Generator.vue';

// Content tools
import BlogGenerator from '../tools/blog/Generator.vue';
import ContentRepurposerGenerator from '../tools/content-repurpose/Generator.vue';
import PressReleaseGenerator from '../tools/press-release/Generator.vue';

// Social/Email tools
import SocialPostGenerator from '../tools/social-post/Generator.vue';
import EmailWriterGenerator from '../tools/email/Generator.vue';
import NewsletterGenerator from '../tools/newsletter/Generator.vue';
import YoutubeDescriptionGenerator from '../tools/youtube-description/Generator.vue';
import PodcastNotesGenerator from '../tools/podcast-notes/Generator.vue';
import SeoOptimizerGenerator from '../tools/seo-optimizer/Generator.vue';

// Page-level components
import ToolDirectoryPage from '../tools/ToolDirectoryPage.vue';
import DynamicToolPage from '../tools/DynamicToolPage.vue';

/**
 * Component registry for data-gmkb-tool attribute values
 */
const TOOL_COMPONENTS = {
    // Original tools
    'biography': BiographyGenerator,
    'topics': TopicsGenerator,
    'questions': QuestionsGenerator,
    'tagline': TaglineGenerator,
    'guest-intro': GuestIntroGenerator,
    'authority-hook': AuthorityHookBuilder,
    'offers': OffersGenerator,

    // Value Builder tools
    'elevator-pitch': ElevatorPitchGenerator,
    'sound-bite': SoundBiteGenerator,
    'persona': PersonaGenerator,
    'impact-intro': ImpactIntroBuilder,

    // Strategy tools
    'brand-story': BrandStoryGenerator,
    'signature-story': SignatureStoryGenerator,
    'credibility-story': CredibilityStoryGenerator,
    'framework': FrameworkGenerator,
    'interview-prep': InterviewPrepGenerator,

    // Content tools
    'blog': BlogGenerator,
    'content-repurpose': ContentRepurposerGenerator,
    'press-release': PressReleaseGenerator,

    // Social/Email tools
    'social-post': SocialPostGenerator,
    'email': EmailWriterGenerator,
    'newsletter': NewsletterGenerator,
    'youtube-description': YoutubeDescriptionGenerator,
    'podcast-notes': PodcastNotesGenerator,
    'seo-optimizer': SeoOptimizerGenerator,
};

/**
 * Store mounted app instances for cleanup
 */
const mountedApps = new Map();

/**
 * Initialize a single SEO tool instance
 *
 * @param {HTMLElement} container - The container element with data-gmkb-tool
 * @returns {Object|null} Vue app instance or null if initialization failed
 */
function initializeTool(container) {
    const toolType = container.dataset.gmkbTool;

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

    // Get tool slug from data attribute
    const toolSlug = container.dataset.gmkbToolSlug || '';
    const directoryUrl = container.dataset.gmkbDirectoryUrl || '/tools/';

    // Store nonce globally for API calls
    if (!window.gmkbSeoTools) {
        const nonce = window.gmkbPublicNonce || (window.gmkbPublicData && window.gmkbPublicData.publicNonce) || '';
        window.gmkbSeoTools = { nonce };
    }

    // Create Vue app with DynamicToolPage
    const app = createApp({
        name: 'GMKBDynamicToolPage',
        render() {
            return h('div', { class: 'gmkb-standalone-scope' }, [
                h(DynamicToolPage, {
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
 * Initialize all SEO tools on the page
 *
 * Handles three types of containers:
 * - [data-gmkb-tool] - Individual tool widgets
 * - [data-gmkb-page-type="directory"] - Tool directory page
 * - [data-gmkb-page-type="tool"] - Dynamic tool page
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

    console.log(`[GMKBSeoTools] Initialized ${count} component(s)`);
    return count;
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
    initAll: initializeAll,
    destroy: destroyTool,
    destroyAll: destroyAll,
    version: '2.0.0',
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

                // Check children of added node for all types
                if (node.querySelectorAll) {
                    const toolChildren = node.querySelectorAll('[data-gmkb-tool]');
                    toolChildren.forEach(initializeTool);

                    const directoryChildren = node.querySelectorAll('[data-gmkb-page-type="directory"]');
                    directoryChildren.forEach(initializeDirectory);

                    const toolPageChildren = node.querySelectorAll('[data-gmkb-page-type="tool"]');
                    toolPageChildren.forEach(initializeToolPage);
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
    initializeAll,
    destroyTool,
    destroyAll,
};
