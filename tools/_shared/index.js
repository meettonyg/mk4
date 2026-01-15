/**
 * Shared Tool Components
 *
 * Common components used across all AI tools.
 *
 * @package GMKB
 * @subpackage Tools/Shared
 */

// NEW: Unified Tool Architecture (recommended)
export { default as StandardAiTool } from './StandardAiTool.vue';
export { default as AuthorityContext } from './AuthorityContext.vue';

// LEGACY: These will be deprecated in favor of StandardAiTool
export { default as GeneratorLayout } from './GeneratorLayout.vue';
export { default as GuidancePanel } from './GuidancePanel.vue';
export { default as AiToolLayout } from './AiToolLayout.vue';
export { default as AuthorityHookSection } from './AuthorityHookSection.vue';

// Shared utilities
export { default as ProfileContextBanner } from './ProfileContextBanner.vue';
export { default as EmbeddedToolWrapper } from './EmbeddedToolWrapper.vue';
export { default as EmbeddedToolApp } from './EmbeddedToolApp.vue';
export { EMBEDDED_PROFILE_DATA_KEY } from './constants';
