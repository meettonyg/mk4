/**
 * REMOVED: This file has been deleted as part of the jQuery cleanup.
 * 
 * This legacy composable has been replaced by:
 * - MediaUploader component: src/vue/components/shared/MediaUploader.vue
 * - useMediaUpload composable: src/composables/useMediaUpload.js
 * 
 * Date Removed: November 10, 2025
 * Reason: Pure Vue migration - no longer need jQuery/wp.media wrapper
 */

// This file intentionally left as placeholder to prevent import errors
// Will be fully removed in next commit after verification

export function useModernMediaUploader() {
  throw new Error(
    'useModernMediaUploader has been removed. Use MediaUploader component instead. ' +
    'See: src/vue/components/shared/MediaUploader.vue'
  );
}
