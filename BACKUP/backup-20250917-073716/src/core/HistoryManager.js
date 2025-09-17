/**
 * History Manager for Undo/Redo
 * 
 * Proper implementation that stores only diffs, not complete states
 * This prevents the exponential data growth that was crashing the system
 */

export class HistoryManager {
    constructor(maxSize = 10) {
        this.maxSize = maxSize;
        this.past = [];
        this.future = [];
        this.isRecording = true;
    }

    /**
     * Record an action for undo/redo
     * Stores only the CHANGE, not the entire state
     */
    recordAction(action) {
        if (!this.isRecording) return;

        // Store both the action and its inverse for proper undo/redo
        const historyEntry = {
            action: this.cleanAction(action),
            inverseAction: this.getInverseAction(action)
        };

        // Add to history
        this.past.push(historyEntry);
        
        // Clear future when new action is recorded
        this.future = [];

        // Limit history size
        if (this.past.length > this.maxSize) {
            this.past.shift(); // Remove oldest
        }
    }

    /**
     * Clean action to remove non-serializable data
     */
    cleanAction(action) {
        // Store only the essential data needed to undo/redo
        return {
            type: action.type,
            timestamp: Date.now(),
            // For component actions, store minimal data
            data: this.extractMinimalData(action)
        };
    }

    /**
     * Extract only the minimal data needed to reverse an action
     */
    extractMinimalData(action) {
        switch (action.type) {
            case 'ADD_COMPONENT':
                // For redo, we need full component data
                return {
                    componentId: action.payload.id,
                    componentData: this.cleanComponentData(action.payload)
                };
                
            case 'DELETE_COMPONENT':
                // To undo: need the component data (but cleaned)
                return {
                    componentId: action.payload.id,
                    componentData: this.cleanComponentData(action.payload)
                };
                
            case 'UPDATE_COMPONENT':
                // To undo: need the previous values
                // This should be passed in the action.payload.previousValues
                return {
                    componentId: action.payload.id,
                    previousValues: action.payload.previousValues || {}
                };
                
            case 'MOVE_COMPONENT':
                // To undo: need the previous position
                return {
                    componentId: action.payload.componentId,
                    fromIndex: action.payload.fromIndex,
                    toIndex: action.payload.toIndex
                };
                
            default:
                // For other actions, store minimal payload
                return action.payload ? 
                    JSON.parse(JSON.stringify(action.payload)) : // Deep clone to remove references
                    null;
        }
    }

    /**
     * Clean component data to remove circular references
     */
    cleanComponentData(component) {
        if (!component) return null;
        
        // Extract ONLY the absolute minimum needed to recreate the component
        const cleaned = {
            id: component.id,
            type: component.type,
            sectionId: component.sectionId
        };
        
        // Only store simple string/number props, max 5 properties
        if (component.props && typeof component.props === 'object') {
            cleaned.props = {};
            let propCount = 0;
            for (const key in component.props) {
                if (propCount >= 5) break; // Limit to 5 props
                const val = component.props[key];
                if (typeof val === 'string' && val.length < 100) {
                    cleaned.props[key] = val;
                    propCount++;
                } else if (typeof val === 'number' || typeof val === 'boolean') {
                    cleaned.props[key] = val;
                    propCount++;
                }
            }
        }
        
        // Similar for data, but even more restrictive
        if (component.data && typeof component.data === 'object') {
            cleaned.data = {};
            let dataCount = 0;
            for (const key in component.data) {
                if (dataCount >= 3) break; // Only 3 data properties
                const val = component.data[key];
                if ((typeof val === 'string' && val.length < 50) || 
                    typeof val === 'number' || 
                    typeof val === 'boolean') {
                    cleaned.data[key] = val;
                    dataCount++;
                }
            }
        }
        
        return cleaned;
    }

    /**
     * Get inverse action for undo
     */
    getInverseAction(originalAction) {
        // First clean the action
        const action = this.cleanAction(originalAction);
        
        switch (action.type) {
            case 'ADD_COMPONENT':
                return {
                    type: 'DELETE_COMPONENT',
                    payload: action.data.componentId
                };
                
            case 'DELETE_COMPONENT':
                return {
                    type: 'ADD_COMPONENT',
                    payload: action.data.componentData
                };
                
            case 'UPDATE_COMPONENT':
                return {
                    type: 'UPDATE_COMPONENT',
                    payload: {
                        id: action.data.componentId,
                        updates: action.data.previousValues
                    }
                };
                
            case 'MOVE_COMPONENT':
                return {
                    type: 'MOVE_COMPONENT',
                    payload: {
                        componentId: action.data.componentId,
                        fromIndex: action.data.toIndex,
                        toIndex: action.data.fromIndex
                    }
                };
                
            default:
                return null;
        }
    }

    /**
     * Undo last action
     */
    undo() {
        if (this.past.length === 0) return null;
        
        const lastEntry = this.past.pop();
        this.future.unshift(lastEntry);
        
        // Return the inverse action to apply
        return lastEntry.inverseAction;
    }

    /**
     * Redo last undone action
     */
    redo() {
        if (this.future.length === 0) return null;
        
        const nextEntry = this.future.shift();
        this.past.push(nextEntry);
        
        // Reconstruct the proper action format with payload
        const action = nextEntry.action;
        let properAction = {
            type: action.type,
            payload: null
        };
        
        // Reconstruct payload based on action type
        switch (action.type) {
            case 'ADD_COMPONENT':
                properAction.payload = action.data.componentData;
                break;
                
            case 'DELETE_COMPONENT':
                properAction.payload = action.data.componentId;
                break;
                
            case 'UPDATE_COMPONENT':
                properAction.payload = {
                    id: action.data.componentId,
                    updates: action.data.updates || action.data.previousValues
                };
                break;
                
            case 'MOVE_COMPONENT':
                properAction.payload = {
                    componentId: action.data.componentId,
                    fromIndex: action.data.fromIndex,
                    toIndex: action.data.toIndex
                };
                break;
                
            default:
                properAction.payload = action.data;
        }
        
        return properAction;
    }

    /**
     * Clear all history
     */
    clear() {
        this.past = [];
        this.future = [];
    }

    /**
     * Get history stats
     */
    getStats() {
        return {
            pastCount: this.past.length,
            futureCount: this.future.length,
            maxSize: this.maxSize,
            // Calculate approximate memory usage (in bytes)
            estimatedSize: JSON.stringify(this.past).length + JSON.stringify(this.future).length
        };
    }
}

export default HistoryManager;
