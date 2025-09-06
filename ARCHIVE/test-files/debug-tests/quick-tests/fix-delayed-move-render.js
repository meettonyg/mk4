/**
 * FIX: Component Move Delayed Render Issue
 * 
 * This patch fixes the issue where component movement doesn't update the DOM immediately.
 * The problem occurs in enhanced-component-renderer.js in the onStateChange method.
 */

// In enhanced-component-renderer.js, find the onStateChange method
// Look for this code block (around line 480-520):

/*
FIND THIS:
        if (allComponentsExist && this.lastState && 
            Object.keys(this.lastState.components || {}).length === componentIds.length) {
            // All components exist and count hasn't changed - likely just a state sync
            this.logger.debug('RENDER', 'All components already in DOM, skipping re-render', {
                componentCount: componentIds.length,
                existingComponents: componentIds
            });
            this.lastStateHash = stateHash; // Update hash to prevent future duplicate checks
            this.lastState = this.cloneState(newState); // Update lastState
            return;
        }
*/

// REPLACE WITH THIS:
        // ROOT FIX: Check if layout has changed (components moved)
        const layoutChanged = this.lastState && 
            JSON.stringify(this.lastState.layout) !== JSON.stringify(newState.layout);
        
        if (allComponentsExist && this.lastState && 
            Object.keys(this.lastState.components || {}).length === componentIds.length &&
            !layoutChanged) {
            // All components exist, count hasn't changed, and layout hasn't changed - likely just a state sync
            this.logger.debug('RENDER', 'All components already in DOM and no layout change, skipping re-render', {
                componentCount: componentIds.length,
                existingComponents: componentIds,
                layoutChanged: false
            });
            this.lastStateHash = stateHash; // Update hash to prevent future duplicate checks
            this.lastState = this.cloneState(newState); // Update lastState
            return;
        }
        
        if (layoutChanged) {
            this.logger.info('RENDER', 'Layout changed - components moved, processing render');
        }

// ALTERNATIVE: If you can't find the exact code, add this as a temporary fix
// at the beginning of the onStateChange method:

        // TEMPORARY FIX: Force render when layout changes
        if (this.lastState && newState && 
            JSON.stringify(this.lastState.layout) !== JSON.stringify(newState.layout)) {
            this.logger.info('RENDER', 'Layout changed - forcing render for component movement');
            // Don't return early, continue with normal render process
        }
