/**
 * Conditional System Loader
 * Uses feature flags to determine which implementations to use
 */

import { FEATURES, isFeatureEnabled } from './feature-flags.js';

// Import both legacy and enhanced versions
import { stateManager as legacyStateManager } from '../services/state-manager.js';
import enhancedStateManager from './enhanced-state-manager.js';

import { componentManager as legacyComponentManager } from '../components/component-manager.js';
import { enhancedComponentManager } from './enhanced-component-manager.js';

import { componentRenderer as legacyComponentRenderer } from '../components/component-renderer.js';
import { enhancedComponentRenderer } from './enhanced-component-renderer.js';

/**
 * Get the appropriate state manager based on feature flags
 */
export function getStateManager() {
    if (isFeatureEnabled('USE_ENHANCED_STATE_MANAGER')) {
        console.log('Using enhanced state manager');
        return enhancedStateManager;
    } else {
        console.log('Using legacy state manager');
        return legacyStateManager;
    }
}

/**
 * Get the appropriate component manager based on feature flags
 */
export function getComponentManager() {
    if (isFeatureEnabled('USE_ENHANCED_COMPONENT_MANAGER')) {
        console.log('Using enhanced component manager');
        return enhancedComponentManager;
    } else {
        console.log('Using legacy component manager');
        return legacyComponentManager;
    }
}

/**
 * Get the appropriate component renderer based on feature flags
 */
export function getComponentRenderer() {
    if (isFeatureEnabled('USE_ENHANCED_COMPONENT_RENDERER')) {
        console.log('Using enhanced component renderer');
        return enhancedComponentRenderer;
    } else {
        console.log('Using legacy component renderer');
        return legacyComponentRenderer;
    }
}

/**
 * Initialize the appropriate systems based on feature flags
 */
export async function initializeSystems() {
    console.log('Initializing systems with feature flags:', FEATURES);
    
    // Get the appropriate implementations
    const stateManager = getStateManager();
    const componentManager = getComponentManager();
    const componentRenderer = getComponentRenderer();
    
    // Make them globally available
    window.stateManager = stateManager;
    window.componentManager = componentManager;
    window.componentRenderer = componentRenderer;
    
    // Also expose with specific names
    if (isFeatureEnabled('USE_ENHANCED_STATE_MANAGER')) {
        window.enhancedStateManager = stateManager;
    }
    if (isFeatureEnabled('USE_ENHANCED_COMPONENT_MANAGER')) {
        window.enhancedComponentManager = componentManager;
    }
    if (isFeatureEnabled('USE_ENHANCED_COMPONENT_RENDERER')) {
        window.enhancedComponentRenderer = componentRenderer;
    }
    
    // Don't initialize here - let main.js or media-kit-builder-init.js handle it
    console.log('Systems loaded and exposed globally');
}

/**
 * Check if we should use the enhanced initialization
 */
export function shouldUseEnhancedInit() {
    return isFeatureEnabled('USE_ENHANCED_INITIALIZATION');
}

// Export for debugging
window.conditionalLoader = {
    getStateManager,
    getComponentManager,
    getComponentRenderer,
    initializeSystems,
    shouldUseEnhancedInit
};