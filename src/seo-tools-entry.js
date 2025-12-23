/**
 * SEO Tools Standalone Entry Point
 *
 * Part of the Unified AI Generator Architecture ("Modular Widgets")
 * This entry creates a self-contained Vue application for public-facing AI generators.
 *
 * Features:
 * - Auto-mounts to elements with [data-gmkb-tool] attribute
 * - Self-contained Pinia store (no external Vue app dependency)
 * - CSS isolation via scoped wrapper class
 * - IP-based rate limiting (no WordPress auth required)
 *
 * Usage in WordPress:
 * ```php
 * // Shortcode handler outputs:
 * <div data-gmkb-tool="biography" data-nonce="<?php echo $nonce; ?>"></div>
 * ```
 *
 * @package GMKB
 * @subpackage SEO Tools
 * @version 1.0.0
 * @since 2.2.0
 */

import { createApp, h } from 'vue';
import { createPinia } from 'pinia';

// Import standalone CSS (includes reset wrapper)
import './styles/ai-standalone.css';
import './styles/ai-shared.css';

// Import generator components from /tools/ directory (standalone mode only)
// Message Builder tools
import BiographyGenerator from '@tools/biography-generator/BiographyGenerator.vue';
import TopicsGenerator from '@tools/topics-generator/TopicsGenerator.vue';
import QuestionsGenerator from '@tools/questions-generator/QuestionsGenerator.vue';
import TaglineGenerator from '@tools/tagline-generator/TaglineGenerator.vue';
import GuestIntroGenerator from '@tools/guest-intro-generator/GuestIntroGenerator.vue';
import AuthorityHookBuilder from '@tools/authority-hook-builder/AuthorityHookBuilder.vue';
import OffersGenerator from '@tools/offers-generator/OffersGenerator.vue';

// Value Builder tools
import ElevatorPitchGenerator from '@tools/elevator-pitch-generator/ElevatorPitchGenerator.vue';
import SoundBiteGenerator from '@tools/sound-bite-generator/SoundBiteGenerator.vue';
import PersonaGenerator from '@tools/persona-generator/PersonaGenerator.vue';
import ImpactIntroBuilder from '@tools/impact-intro-builder/ImpactIntroBuilder.vue';

// Strategy tools
import BrandStoryGenerator from '@tools/brand-story-generator/BrandStoryGenerator.vue';
import SignatureStoryGenerator from '@tools/signature-story-generator/SignatureStoryGenerator.vue';
import CredibilityStoryGenerator from '@tools/credibility-story-generator/CredibilityStoryGenerator.vue';
import FrameworkGenerator from '@tools/framework-builder/FrameworkGenerator.vue';
import InterviewPrepGenerator from '@tools/interview-prep-generator/InterviewPrepGenerator.vue';

// Content tools
import BlogGenerator from '@tools/blog-generator/BlogGenerator.vue';
import ContentRepurposerGenerator from '@tools/content-repurposer/ContentRepurposerGenerator.vue';
import PressReleaseGenerator from '@tools/press-release-generator/PressReleaseGenerator.vue';

// Social/Email tools
import SocialPostGenerator from '@tools/social-post-generator/SocialPostGenerator.vue';
import EmailWriterGenerator from '@tools/email-writer/EmailWriterGenerator.vue';
import NewsletterGenerator from '@tools/newsletter-writer/NewsletterGenerator.vue';
import YoutubeDescriptionGenerator from '@tools/youtube-description-generator/YoutubeDescriptionGenerator.vue';
import PodcastNotesGenerator from '@tools/podcast-notes-generator/PodcastNotesGenerator.vue';
import SeoOptimizerGenerator from '@tools/seo-optimizer/SeoOptimizerGenerator.vue';

/**
 * Component registry for data-gmkb-tool attribute values
 * Includes both short names (legacy) and full slugs (new architecture)
 */
const TOOL_COMPONENTS = {
    // Original tools - short names (legacy) + full slugs
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
    'authority-hook': AuthorityHookBuilder,
    'authority-hook-builder': AuthorityHookBuilder,
    'offers': OffersGenerator,
    'offers-generator': OffersGenerator,

    // Value Builder tools
    'elevator-pitch': ElevatorPitchGenerator,
    'elevator-pitch-generator': ElevatorPitchGenerator,
    'sound-bite': SoundBiteGenerator,
    'sound-bite-generator': SoundBiteGenerator,
    'persona': PersonaGenerator,
    'persona-generator': PersonaGenerator,
    'impact-intro': ImpactIntroBuilder,
    'impact-intro-builder': ImpactIntroBuilder,

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
    'content-repurpose': ContentRepurposerGenerator,
    'content-repurposer': ContentRepurposerGenerator,
    'press-release': PressReleaseGenerator,
    'press-release-generator': PressReleaseGenerator,

    // Social/Email tools
    'social-post': SocialPostGenerator,
    'social-post-generator': SocialPostGenerator,
    'email': EmailWriterGenerator,
    'email-writer': EmailWriterGenerator,
    'newsletter': NewsletterGenerator,
    'newsletter-writer': NewsletterGenerator,
    'youtube-description': YoutubeDescriptionGenerator,
    'youtube-description-generator': YoutubeDescriptionGenerator,
    'podcast-notes': PodcastNotesGenerator,
    'podcast-notes-generator': PodcastNotesGenerator,
    'seo-optimizer': SeoOptimizerGenerator,
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
 * Initialize all SEO tools on the page
 *
 * @returns {number} Number of tools initialized
 */
function initializeAll() {
    // Support both attribute formats
    const containers = document.querySelectorAll('[data-gmkb-tool], [data-tool]');
    let count = 0;

    containers.forEach((container) => {
        if (initializeTool(container)) {
            count++;
        }
    });

    console.log(`[GMKBSeoTools] Initialized ${count} tool(s)`);
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
    initAll: initializeAll,
    mountTool: mountTool,  // Alias for shortcode compatibility
    destroy: destroyTool,
    destroyAll: destroyAll,
    version: '1.0.0',
};

// Auto-initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeAll);
} else {
    // DOM already loaded (script loaded async or deferred)
    initializeAll();
}

// Support dynamic content (e.g., AJAX-loaded elements)
// Observe for new elements with data-gmkb-tool
const observer = new MutationObserver((mutations) => {
    mutations.forEach((mutation) => {
        mutation.addedNodes.forEach((node) => {
            if (node.nodeType === Node.ELEMENT_NODE) {
                // Check if the added node is a tool container
                if (node.hasAttribute && node.hasAttribute('data-gmkb-tool')) {
                    initializeTool(node);
                }
                // Check children of added node
                const children = node.querySelectorAll ? node.querySelectorAll('[data-gmkb-tool]') : [];
                children.forEach(initializeTool);
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
    initializeAll,
    destroyTool,
    destroyAll,
};
