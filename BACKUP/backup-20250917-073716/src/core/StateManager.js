/**
 * State Manager Export
 * 
 * Phase 2: Enhanced State Management
 * This file exports the EnhancedStateManager as the main StateManager
 */

// Export the enhanced version as the main StateManager
export { EnhancedStateManager as StateManager } from './EnhancedStateManager.js';
export { EnhancedStateManager } from './EnhancedStateManager.js';

// Also export action types for convenience
export { default as ACTION_TYPES } from '../constants/actionTypes.js';
