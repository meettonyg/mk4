/**
 * Shared Tool Components
 *
 * Common components used across all AI tools.
 *
 * @package GMKB
 * @subpackage Tools/Shared
 */

// Layout Components
export { default as GeneratorLayout } from './GeneratorLayout.vue';
export { default as GuidancePanel } from './GuidancePanel.vue';
export { default as AiToolLayout } from './AiToolLayout.vue';

// Builder Components
export { default as AuthorityHookSection } from './AuthorityHookSection.vue';
export { default as AuthorityHookBuilder } from './AuthorityHookBuilder.vue';
export { default as ImpactIntroBuilder } from './ImpactIntroBuilder.vue';

// Profile Components
export { default as ProfileSelector } from './ProfileSelector.vue';

/**
 * @deprecated Use ProfileSelector instead. This component is kept for backwards
 * compatibility but should not be used in new code. All tools have been migrated
 * to use ProfileSelector as of 2026-01-17.
 */
export { default as ProfileContextBanner } from './ProfileContextBanner.vue';

// Embedded Tool Components
export { default as EmbeddedToolWrapper } from './EmbeddedToolWrapper.vue';
export { default as EmbeddedToolApp } from './EmbeddedToolApp.vue';

// Constants
export { EMBEDDED_PROFILE_DATA_KEY, IS_EMBEDDED_CONTEXT_KEY } from './constants';
