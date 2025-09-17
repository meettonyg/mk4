/**
 * Universal Component Sync State Manager Extension
 * ROOT FIX: Prevents state bloat by only saving essential fields
 */

// Override the updateComponent method to clean data before saving
if (window.enhancedStateManager) {
    const originalUpdateComponent = window.enhancedStateManager.updateComponent;
    
    window.enhancedStateManager.updateComponent = function(componentId, updates) {
        // ROOT FIX: Clean the update to only include essential fields
        const state = this.getState();
        const existingComponent = state.components?.[componentId];
        
        if (!existingComponent) {
            // Component doesn't exist, use original method
            return originalUpdateComponent.call(this, componentId, updates);
        }
        
        // Create a clean update object
        const cleanUpdate = {
            id: componentId,
            type: existingComponent.type,
            sectionId: existingComponent.sectionId
        };
        
        // Only include props if they contain actual content changes
        if (updates.props) {
            cleanUpdate.props = {};
            
            // For topics, only save the topics array
            if (existingComponent.type === 'topics') {
                if (updates.props.topics !== undefined) {
                    cleanUpdate.props.topics = updates.props.topics;
                }
            } else if (existingComponent.type === 'hero') {
                // For hero, only save text fields
                ['title', 'subtitle', 'description'].forEach(field => {
                    if (updates.props[field] !== undefined) {
                        cleanUpdate.props[field] = updates.props[field];
                    }
                });
            } else {
                // For other components, only save defined props
                cleanUpdate.props = updates.props;
            }
        }
        
        // Don't include data field (it's redundant)
        // Don't include timestamps or metadata
        
        // Call original with clean update
        return originalUpdateComponent.call(this, componentId, cleanUpdate);
    };
    
    console.log('✅ State Manager enhanced to prevent bloat');
}