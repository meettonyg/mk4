/**
 * Feature Flags for Media Kit Builder
 * Allows gradual migration to enhanced system
 */

// Feature flags configuration
export const FEATURES = {
    // Use the enhanced state manager with meta support
    USE_ENHANCED_STATE_MANAGER: true,
    
    // Use the enhanced component manager without DOM manipulation
    USE_ENHANCED_COMPONENT_MANAGER: true,
    
    // Use the enhanced component renderer with intelligent diffing
    USE_ENHANCED_COMPONENT_RENDERER: true,
    
    // Use the new initialization sequence
    USE_ENHANCED_INITIALIZATION: true, // Enable enhanced initialization
    
    // Enable batch updates for all operations
    USE_BATCH_UPDATES: true,
    
    // Enable pending action tracking
    USE_PENDING_ACTIONS: true,
    
    // Enable component meta state
    USE_COMPONENT_META: true,
    
    // Enable debug logging
    ENABLE_DEBUG_LOGGING: true
};

// Helper to check if a feature is enabled
export function isFeatureEnabled(featureName) {
    return FEATURES[featureName] === true;
}

// Helper to toggle a feature (for testing)
export function toggleFeature(featureName, enabled = null) {
    if (!(featureName in FEATURES)) {
        console.error(`Unknown feature: ${featureName}`);
        return false;
    }
    
    if (enabled === null) {
        // Toggle
        FEATURES[featureName] = !FEATURES[featureName];
    } else {
        // Set specific value
        FEATURES[featureName] = !!enabled;
    }
    
    console.log(`Feature ${featureName} is now ${FEATURES[featureName] ? 'enabled' : 'disabled'}`);
    
    // Store in localStorage for persistence
    localStorage.setItem('mediaKitFeatures', JSON.stringify(FEATURES));
    
    return FEATURES[featureName];
}

// Load feature flags from localStorage if available
export function loadFeatureFlags() {
    const stored = localStorage.getItem('mediaKitFeatures');
    if (stored) {
        try {
            const storedFeatures = JSON.parse(stored);
            Object.assign(FEATURES, storedFeatures);
            console.log('Feature flags loaded from localStorage');
        } catch (error) {
            console.error('Failed to load feature flags:', error);
        }
    }
}

// Reset all features to defaults
export function resetFeatureFlags() {
    localStorage.removeItem('mediaKitFeatures');
    window.location.reload();
}

// Make available globally for debugging
window.mediaKitFeatures = {
    FEATURES,
    isFeatureEnabled,
    toggleFeature,
    resetFeatureFlags
};

// Auto-load on module import
loadFeatureFlags();