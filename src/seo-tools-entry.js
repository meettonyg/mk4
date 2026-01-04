/**
 * SEO Tools Standalone Entry Point
 *
 * Thin mounting layer for Vue applications on public-facing AI tool pages.
 * All tool-specific configuration comes from each tool's meta.json.
 *
 * @package GMKB
 * @subpackage SEO Tools
 * @version 4.0.0
 */

import { createApp, h } from 'vue';
import { createPinia } from 'pinia';

import './styles/ai-standalone.css';
import './styles/ai-shared.css';

import {
  toolModules,
  buildComponentRegistry,
  EmbeddedToolApp
} from '@tools';

import ToolDirectoryPage from '@tools/ToolDirectoryPage.vue';
import ToolLandingPage from '@tools/ToolLandingPage.vue';
import DynamicToolPage from '@tools/DynamicToolPage.vue';

// Build component registries from tool modules
const TOOL_COMPONENTS = buildComponentRegistry('Widget', true);
const EMBEDDED_GENERATORS = buildComponentRegistry('Generator');

// Store mounted app instances
const mountedApps = new Map();

/**
 * Ensure global nonce is available for API calls
 */
function ensureNonce() {
  if (!window.gmkbSeoTools) {
    window.gmkbSeoTools = {
      nonce: window.gmkbPublicNonce || window.gmkbPublicData?.publicNonce || ''
    };
  }
}

/**
 * Create and mount a Vue app with Pinia
 */
function mountApp(container, component, props = {}) {
  if (mountedApps.has(container)) {
    return mountedApps.get(container);
  }

  const app = createApp({
    render: () => h('div', { class: 'gmkb-standalone-scope' }, [h(component, props)])
  });

  app.use(createPinia());
  app.mount(container);
  mountedApps.set(container, app);

  return app;
}

/**
 * Initialize a tool widget [data-gmkb-tool]
 */
function initializeTool(container, toolTypeOverride = null) {
  const toolType = toolTypeOverride || container.dataset.gmkbTool || container.dataset.tool;
  const Component = TOOL_COMPONENTS[toolType];

  if (!Component) {
    console.error(`[GMKBSeoTools] Unknown tool: ${toolType}`);
    return null;
  }

  ensureNonce();

  const app = mountApp(container, Component, {
    mode: 'standalone',
    onApplied: (data) => container.dispatchEvent(new CustomEvent('gmkb:applied', { detail: data, bubbles: true })),
    onGenerated: (data) => container.dispatchEvent(new CustomEvent('gmkb:generated', { detail: data, bubbles: true }))
  });

  console.log(`[GMKBSeoTools] Mounted ${toolType}`);
  return app;
}

/**
 * Initialize tool directory page [data-gmkb-page-type="directory"]
 */
function initializeDirectory(container) {
  const app = mountApp(container, ToolDirectoryPage, {
    baseUrl: container.dataset.gmkbBaseUrl || '/tools/'
  });

  console.log('[GMKBSeoTools] Mounted directory');
  return app;
}

/**
 * Initialize dynamic tool page [data-gmkb-page-type="tool"]
 */
function initializeToolPage(container) {
  ensureNonce();

  const mode = container.dataset.gmkbMode || 'landing';
  const PageComponent = mode === 'use' ? DynamicToolPage : ToolLandingPage;

  const app = mountApp(container, PageComponent, {
    toolSlug: container.dataset.gmkbToolSlug || '',
    directoryUrl: container.dataset.gmkbDirectoryUrl || '/tools/'
  });

  console.log(`[GMKBSeoTools] Mounted tool page`);
  return app;
}

/**
 * Initialize PLG embedded tool [data-mode="embedded"]
 */
function initializeEmbeddedTool(container) {
  const toolSlug = container.dataset.tool || '';
  const GeneratorComponent = EMBEDDED_GENERATORS[toolSlug];

  if (!GeneratorComponent) {
    console.error(`[GMKBSeoTools] No generator for: ${toolSlug}`);
    return null;
  }

  ensureNonce();

  // Parse data attributes
  let intents = [], meta = {};
  try {
    intents = JSON.parse(container.dataset.intents || '[]');
    meta = JSON.parse(container.dataset.meta || '{}');
  } catch (e) {
    console.error('[GMKBSeoTools] Failed to parse tool data:', e);
  }

  const isLoggedIn = !!(window.gmkbStandaloneTools?.isLoggedIn || window.gmkbUserData?.isLoggedIn);
  const socialLoginHtml = window.gmkbSocialLogin?.html || '';

  const app = mountApp(container, EmbeddedToolApp, {
    toolSlug,
    intents,
    meta,
    generatorComponent: GeneratorComponent,
    isLoggedIn,
    socialLoginHtml,
    onGenerated: (data) => container.dispatchEvent(new CustomEvent('gmkb:generated', { detail: data, bubbles: true })),
    onSaveClick: (data) => container.dispatchEvent(new CustomEvent('gmkb:save-click', { detail: data, bubbles: true })),
    onGateShown: (data) => container.dispatchEvent(new CustomEvent('gmkb:gate-shown', { detail: data, bubbles: true })),
    onGateSignup: (data) => container.dispatchEvent(new CustomEvent('gmkb:gate-signup', { detail: data, bubbles: true }))
  });

  console.log(`[GMKBSeoTools] Mounted embedded: ${toolSlug}`);
  return app;
}

/**
 * Initialize all SEO tools on page
 */
function initializeAll() {
  let count = 0;

  document.querySelectorAll('[data-gmkb-tool]').forEach(el => { if (initializeTool(el)) count++; });
  document.querySelectorAll('[data-gmkb-page-type="directory"]').forEach(el => { if (initializeDirectory(el)) count++; });
  document.querySelectorAll('[data-gmkb-page-type="tool"]').forEach(el => { if (initializeToolPage(el)) count++; });
  document.querySelectorAll('[data-mode="embedded"]').forEach(el => { if (initializeEmbeddedTool(el)) count++; });

  console.log(`[GMKBSeoTools] Initialized ${count} component(s)`);
  return count;
}

/**
 * Destroy a mounted tool
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
 * Destroy all mounted tools
 */
function destroyAll() {
  mountedApps.forEach(app => app.unmount());
  mountedApps.clear();
}

// Export API
window.GMKBSeoTools = {
  init: initializeTool,
  initDirectory: initializeDirectory,
  initToolPage: initializeToolPage,
  initEmbedded: initializeEmbeddedTool,
  initAll: initializeAll,
  mountTool: initializeTool,
  destroy: destroyTool,
  destroyAll,
  version: '4.0.0'
};

// Auto-initialize
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', initializeAll);
} else {
  initializeAll();
}

// Watch for dynamically added elements
new MutationObserver(mutations => {
  mutations.forEach(mutation => {
    mutation.addedNodes.forEach(node => {
      if (node.nodeType !== Node.ELEMENT_NODE) return;

      if (node.hasAttribute?.('data-gmkb-tool')) initializeTool(node);
      if (node.getAttribute?.('data-gmkb-page-type') === 'directory') initializeDirectory(node);
      if (node.getAttribute?.('data-gmkb-page-type') === 'tool') initializeToolPage(node);
      if (node.getAttribute?.('data-mode') === 'embedded') initializeEmbeddedTool(node);

      node.querySelectorAll?.('[data-gmkb-tool]').forEach(initializeTool);
      node.querySelectorAll?.('[data-gmkb-page-type="directory"]').forEach(initializeDirectory);
      node.querySelectorAll?.('[data-gmkb-page-type="tool"]').forEach(initializeToolPage);
      node.querySelectorAll?.('[data-mode="embedded"]').forEach(initializeEmbeddedTool);
    });
  });
}).observe(document.body, { childList: true, subtree: true });

export {
  initializeTool,
  initializeDirectory,
  initializeToolPage,
  initializeEmbeddedTool,
  initializeAll,
  destroyTool,
  destroyAll
};
