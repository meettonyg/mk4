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
import BiographyGenerator from './vue/components/ai/BiographyGenerator.vue';
import TopicsGenerator from './vue/components/ai/TopicsGenerator.vue';
import QuestionsGenerator from './vue/components/ai/QuestionsGenerator.vue';
import TaglineGenerator from './vue/components/ai/TaglineGenerator.vue';
import GuestIntroGenerator from './vue/components/ai/GuestIntroGenerator.vue';
import AuthorityHookBuilder from './vue/components/ai/AuthorityHookBuilder.vue';
import OffersGenerator from './vue/components/ai/OffersGenerator.vue';

/**
 * Component registry for data-gmkb-tool attribute values
 */
const TOOL_COMPONENTS = {
    'biography': BiographyGenerator,
    'topics': TopicsGenerator,
    'questions': QuestionsGenerator,
    'tagline': TaglineGenerator,
    'guest-intro': GuestIntroGenerator,
    'authority-hook': AuthorityHookBuilder,
    'offers': OffersGenerator,
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
    const nonce = container.dataset.nonce || '';

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

    // Store nonce globally for API calls
    if (nonce && !window.gmkbSeoTools) {
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
