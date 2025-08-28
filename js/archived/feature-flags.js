/**
 * @file feature-flags.js
 * @description Defines feature flags for toggling new and experimental features
 * in the Media Kit Builder. This allows for a gradual rollout and testing of new functionality.
 *
 * This version includes a fix to properly export the 'featureFlags' object,
 * making it accessible to other modules like the conditional loader.
 */

// FIX: Export the featureFlags constant to make it available to other modules.
export const featureFlags = {
    // --- Core System Flags ---
    USE_ENHANCED_STATE_MANAGER: true,
    USE_ENHANCED_COMPONENT_MANAGER: true,
    USE_ENHANCED_COMPONENT_RENDERER: true,
    USE_ENHANCED_INITIALIZATION: true,

    // --- Performance & Optimization Flags ---
    USE_BATCH_UPDATES: true, // Group multiple state updates into one render cycle
    USE_TEMPLATE_CACHING: true, // Cache component templates in memory
    USE_DEBOUNCED_RENDERING: true, // Debounce re-render calls to avoid excessive updates

    // --- UI & Feature Flags ---
    ENABLE_DRAG_AND_DROP: true,
    ENABLE_INLINE_EDITING: true,
    ENABLE_DESIGN_PANEL_V2: false, // Example of a disabled feature
    ENABLE_PERFORMANCE_MONITOR: true, // Toggle for the performance monitoring dashboard

    // --- Data & Schema Flags ---
    ENABLE_SCHEMA_VALIDATION: true, // Validate component props against a schema
    ENABLE_AUTO_SAVE: true,
    ENABLE_PRESET_TEMPLATES: true, // Changed from false to true
};
