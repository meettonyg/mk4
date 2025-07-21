/**
 * @file ui-coordinator.js - UI Coordination System
 * @description Simple UI coordination system to replace complex UIManager
 * This ensures proper initialization order and prevents re-rendering
 */

import { StateManager } from './state-manager.js';
import { ComponentManager } from '../managers/component-manager.js';

const UICoordinator = {
    initialized: false,
    
    init() {
        if (this.initialized) {
            console.log('ℹ️ UICoordinator: Already initialized, skipping duplicate call');
            return;
        }
        
        console.log('%c🎯 UICoordinator: ROOT FIX - Single initialization start', 'font-weight: bold; color: #2563eb; background: #eff6ff; padding: 4px 8px; border-radius: 4px;');
        
        try {
            // Mark as initialized FIRST to prevent duplicate calls
            this.initialized = true;
            
            // Step 1: Initialize core systems without rendering
            console.log('📋 UICoordinator: Initializing StateManager...');
            StateManager.init();
            
            console.log('🧩 UICoordinator: Initializing ComponentManager (library only)...');
            ComponentManager.init(); // This will ONLY load library, no rendering
            
            console.log('📋 UICoordinator: Checking for saved components...');
            const state = StateManager.getState();
            const componentCount = Object.keys(state.components).length;
            console.log(`📋 UICoordinator: Found ${componentCount} saved components`);
            
            // Step 2: Load and render saved components ONCE
            if (componentCount > 0) {
                console.log('🎯 UICoordinator: Loading saved components...');
                this.loadSavedComponentsOnce();
            } else {
                console.log('📝 UICoordinator: No saved components to load');
            }
            
            console.log('%c✅ UICoordinator: ROOT FIX - Single initialization complete', 'font-weight: bold; color: #10b981; background: #f0fdf4; padding: 4px 8px; border-radius: 4px;');
        } catch (error) {
            console.error('%c❌ UICoordinator: Initialization failed:', 'font-weight: bold; color: #ef4444; background: #fef2f2; padding: 4px 8px; border-radius: 4px;', error);
            // Reset flag if failed
            this.initialized = false;
        }
    },
    
    async loadSavedComponentsOnce() {
        console.log('%c🎯 UICoordinator: Loading saved components with single-render guarantee', 'font-weight: bold; color: #7c3aed; background: #f3e8ff; padding: 4px 8px; border-radius: 4px;');
        
        try {
            // Wait a moment for StateManager to fully initialize
            console.log('⏱️ UICoordinator: Waiting for systems to stabilize...');
            await new Promise(resolve => setTimeout(resolve, 50));
            
            // Check state again
            const state = StateManager.getState();
            const componentCount = Object.keys(state.components).length;
            console.log(`📋 UICoordinator: Ready to load ${componentCount} saved components`);
            
            if (componentCount > 0) {
                // Load saved components EXACTLY ONCE
                console.log('🎨 UICoordinator: Calling ComponentManager.loadSavedComponents()...');
                await ComponentManager.loadSavedComponents();
                console.log('✅ UICoordinator: ComponentManager.loadSavedComponents() completed');
            } else {
                console.log('📝 UICoordinator: No components to load');
            }
            
            console.log('%c✅ UICoordinator: Saved components loaded - no re-renders', 'font-weight: bold; color: #10b981; background: #f0fdf4; padding: 4px 8px; border-radius: 4px;');
        } catch (error) {
            console.error('%c❌ UICoordinator: Error loading saved components:', 'font-weight: bold; color: #ef4444; background: #fef2f2; padding: 4px 8px; border-radius: 4px;', error);
        }
    }
};

export { UICoordinator };
