/**
 * @file state-manager.js - State Management System
 * @description Centralized state management for the Media Kit Builder
 */

import { GMKB } from './gmkb.js';

const StateManager = {
    state: {
        components: {},
        layout: [],
        globalSettings: {}
    },
    
    init() {
        console.log('📋 StateManager: Initialized (Phase 2.3 Simplified)');
        
        // ROOT FIX: Listen for save request from toolbar or any other component
        GMKB.subscribe('gmkb:save-requested', this.handleSaveRequest.bind(this));
        
        // ROOT FIX: Check localStorage FIRST (where previous components are saved)
        let hasLocalStorageData = false;
        const localStorageLoaded = this.loadFromStorage();
        
        if (localStorageLoaded && Object.keys(this.state.components).length > 0) {
            hasLocalStorageData = true;
            console.log('🔄 StateManager: Loaded state from localStorage (PRIORITY)', {
                components: Object.keys(this.state.components).length,
                layout: this.state.layout.length
            });
            
            // ROOT FIX: REMOVED - this event was causing re-renders
            // OLD CODE: GMKB.dispatch('gmkb:saved-state-loaded', { ... });
            console.log('✅ StateManager: State loaded but NO events dispatched to prevent re-renders');
        } else {
            console.log('📝 StateManager: No components found in localStorage');
        }
        
        // SECONDARY: Check WordPress database (only if localStorage was empty)
        if (!hasLocalStorageData && window.gmkbData && window.gmkbData.savedState) {
            const savedState = window.gmkbData.savedState;
            
            if (savedState.components && Object.keys(savedState.components).length > 0) {
                this.state = { ...this.state, ...savedState };
                console.log('🔄 StateManager: Loaded state from WordPress database (FALLBACK)', savedState);
                
                // ROOT FIX: REMOVED - this event was causing re-renders
                // OLD CODE: GMKB.dispatch('gmkb:saved-state-loaded', { ... });
                console.log('✅ StateManager: WordPress state loaded but NO events dispatched to prevent re-renders');
            } else {
                console.log('📝 StateManager: WordPress database state is empty');
            }
        }
        
        // Final check: if no components found anywhere
        if (Object.keys(this.state.components).length === 0) {
            console.log('📝 StateManager: No saved components found in any source (localStorage or WordPress)');
        } else {
            console.log('✅ StateManager: Successfully loaded', Object.keys(this.state.components).length, 'components');
        }
    },
    
    getState() {
        return this.state;
    },
    
    setState(newState) {
        this.state = { ...this.state, ...newState };
        this.saveToStorage(); // No callbacks needed for automatic saves
        GMKB.dispatch('gmkb:state-changed', { state: this.state });
    },
    
    addComponent(component) {
        const id = component.id || 'component-' + Date.now();
        this.state.components[id] = { ...component, id };
        
        if (!this.state.layout.includes(id)) {
            this.state.layout.push(id);
        }
        
        this.saveToStorage(); // No callbacks needed for automatic saves
        GMKB.dispatch('gmkb:component-added', { id, component: this.state.components[id] });
        GMKB.dispatch('gmkb:state-changed', { state: this.state });
        
        return id;
    },
    
    removeComponent(id) {
        if (this.state.components[id]) {
            delete this.state.components[id];
            this.state.layout = this.state.layout.filter(cid => cid !== id);
            
            this.saveToStorage(); // No callbacks needed for automatic saves
            GMKB.dispatch('gmkb:component-removed', { id });
            GMKB.dispatch('gmkb:state-changed', { state: this.state });
            
            return true;
        }
        return false;
    },
    
    updateComponent(id, updates) {
        if (this.state.components[id]) {
            this.state.components[id] = { ...this.state.components[id], ...updates };
            
            this.saveToStorage(); // No callbacks needed for automatic saves
            GMKB.dispatch('gmkb:component-updated', { id, component: this.state.components[id] });
            GMKB.dispatch('gmkb:state-changed', { state: this.state });
            
            return true;
        }
        return false;
    },
    
    async saveToStorage(detail = {}) {
        const { onComplete, onError } = detail; // Get callbacks from the event detail
        try {
            localStorage.setItem('gmkb-state', JSON.stringify(this.state));
            console.log('💾 StateManager: Saved state to localStorage.');

            // Wait for the WordPress save to complete
            const wordpressSuccess = await this.saveToWordPress();

            if (wordpressSuccess) {
                console.log('✅ StateManager: Save process completed successfully.');
                // Let the toolbar know it was successful
                if (onComplete) onComplete({ source: 'StateManager', status: 'success' });
                return true;
            } else {
                // If WordPress save fails, trigger the error callback
                throw new Error('The state could not be saved to WordPress.');
            }

        } catch (error) {
            console.error('❌ StateManager: Failed to complete save process:', error);
            // Let the toolbar know there was an error
            if (onError) onError({ error: error.message });
            return false;
        }
    },
    
    async saveToWordPress() {
        if (!window.gmkbData || !window.gmkbData.postId) {
            console.log('💾 StateManager: No post ID available for WordPress save');
            return false;
        }
        
        try {
            console.log('💾 StateManager: Saving state to WordPress database...');
            
            const response = await fetch(window.gmkbData.ajaxUrl, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
                body: new URLSearchParams({
                    action: 'guestify_save_media_kit',
                    nonce: window.gmkbData.nonce,
                    post_id: window.gmkbData.postId,
                    state: JSON.stringify(this.state)
                })
            });
            
            const data = await response.json();
            
            if (data.success) {
                console.log('✅ StateManager: Saved state to WordPress database');
                return true;
            } else {
                console.warn('⚠️ StateManager: WordPress save failed:', data);
                return false;
            }
        } catch (error) {
            console.error('❌ StateManager: Error saving to WordPress:', error);
            return false;
        }
    },
    
    loadFromStorage() {
        try {
            const saved = localStorage.getItem('gmkb-state');
            if (saved) {
                const data = JSON.parse(saved);
                this.state = { ...this.state, ...data };
                console.log('💾 StateManager: Loaded state from localStorage');
                console.log('💾 StateManager: Components in loaded state:', Object.keys(data.components || {}).length);
                console.log('💾 StateManager: Full loaded data:', data);
                return true;
            }
        } catch (error) {
            console.warn('💾 StateManager: Failed to load from localStorage:', error);
        }
        console.log('💾 StateManager: No saved state found in localStorage');
        return false;
    },
    
    /**
     * Handles the save request event.
     * @param {CustomEvent} event The event object.
     */
    async handleSaveRequest(event) {
        const detail = event.detail || {};
        console.log('💾 StateManager: Save request received.', detail);
        
        const { onComplete, onError } = detail;
        try {
            localStorage.setItem('gmkb-state', JSON.stringify(this.state));
            const wordpressSuccess = await this.saveToWordPress();
    
            if (wordpressSuccess) {
                if (onComplete) onComplete({ source: 'StateManager', status: 'success' });
                return true;
            } else {
                throw new Error('The state could not be saved to WordPress.');
            }
        } catch (error) {
            if (onError) onError({ error: error.message });
            return false;
        }
    }
};

export { StateManager };
