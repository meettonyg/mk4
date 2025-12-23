/**
 * AI Tools - Main Index
 *
 * Central export for all AI tool components.
 * Each tool follows a consistent folder structure:
 *   - index.vue: Entry point combining layout + generator + guide
 *   - *Generator.vue: Left panel with tool logic
 *   - *Guide.vue: Right panel with static guidance content
 *
 * @package GMKB
 * @subpackage AI-Tools
 * @version 1.0.0
 */

// Shared Components
export * from './_shared/index.js';

// Tool Registry & Dynamic Pages
export { default as TOOL_REGISTRY, getToolBySlug, getAllTools, getToolsByCategory, TOOL_CATEGORIES } from './toolRegistry.js';
export { default as ToolDirectoryPage } from './ToolDirectoryPage.vue';
export { default as DynamicToolPage } from './DynamicToolPage.vue';

// Biography Tool (structured folder)
export * from './biography/index.js';

// Future tools will be exported here:
// export * from './elevator-pitch/index.js';
// export * from './blog/index.js';
// export * from './tagline/index.js';
// export * from './guest-intro/index.js';
// export * from './topics/index.js';
// export * from './questions/index.js';
// export * from './email/index.js';
// export * from './social-post/index.js';
// etc.
