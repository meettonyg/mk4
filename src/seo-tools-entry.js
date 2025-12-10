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

// Import generator components (standalone mode only)
// Original tools
import BiographyGenerator from './vue/components/ai/BiographyGenerator.vue';
import TopicsGenerator from './vue/components/ai/TopicsGenerator.vue';
import QuestionsGenerator from './vue/components/ai/QuestionsGenerator.vue';
import TaglineGenerator from './vue/components/ai/TaglineGenerator.vue';
import GuestIntroGenerator from './vue/components/ai/GuestIntroGenerator.vue';
import AuthorityHookBuilder from './vue/components/ai/AuthorityHookBuilder.vue';
import OffersGenerator from './vue/components/ai/OffersGenerator.vue';

// Value Builder tools
import ElevatorPitchGenerator from './vue/components/ai/ElevatorPitchGenerator.vue';
import SoundBiteGenerator from './vue/components/ai/SoundBiteGenerator.vue';
import PersonaGenerator from './vue/components/ai/PersonaGenerator.vue';
import ImpactIntroBuilder from './vue/components/ai/ImpactIntroBuilder.vue';

// Strategy tools
import BrandStoryGenerator from './vue/components/ai/BrandStoryGenerator.vue';
import SignatureStoryGenerator from './vue/components/ai/SignatureStoryGenerator.vue';
import CredibilityStoryGenerator from './vue/components/ai/CredibilityStoryGenerator.vue';
import FrameworkGenerator from './vue/components/ai/FrameworkGenerator.vue';
import InterviewPrepGenerator from './vue/components/ai/InterviewPrepGenerator.vue';

// Content tools
import BlogGenerator from './vue/components/ai/BlogGenerator.vue';
import ContentRepurposerGenerator from './vue/components/ai/ContentRepurposerGenerator.vue';
import PressReleaseGenerator from './vue/components/ai/PressReleaseGenerator.vue';

// Social/Email tools
import SocialPostGenerator from './vue/components/ai/SocialPostGenerator.vue';
import EmailWriterGenerator from './vue/components/ai/EmailWriterGenerator.vue';
import NewsletterGenerator from './vue/components/ai/NewsletterGenerator.vue';
import YoutubeDescriptionGenerator from './vue/components/ai/YoutubeDescriptionGenerator.vue';
import PodcastNotesGenerator from './vue/components/ai/PodcastNotesGenerator.vue';
import SeoOptimizerGenerator from './vue/components/ai/SeoOptimizerGenerator.vue';

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
 * Initialize all SEO tools on the page
 *
 * @returns {number} Number of tools initialized
 */
function initializeAll() {
    const containers = document.querySelectorAll('[data-gmkb-tool]');
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
