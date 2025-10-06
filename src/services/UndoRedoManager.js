/**
 * Undo/Redo Manager
 * 
 * Provides comprehensive undo/redo functionality with batching,
 * keyboard shortcuts, and history management.
 * 
 * @version 2.0.0
 */

import eventBus from './EventBus.js';

export class UndoRedoManager {
  constructor(options = {}) {
    this.maxHistorySize = options.maxHistorySize || 50;
    this.batchDelay = options.batchDelay || 300;
    this.history = [];
    this.currentIndex = -1;
    this.isApplyingHistory = false;
    this.batchTimeout = null;
    this.batchedChanges = [];
    this.enabled = true;
    
    console.log('✅ UndoRedoManager initialized', {
      maxHistorySize: this.maxHistorySize,
      batchDelay: this.batchDelay
    });
  }

  /**
   * Record a change for undo/redo
   * 
   * @param {Object} change - Change to record
   * @param {string} change.type - Type of change (add, remove, update, move)
   * @param {string} change.target - Target identifier
   * @param {*} change.oldValue - Previous value
   * @param {*} change.newValue - New value
   */
  record(change) {
    if (this.isApplyingHistory || !this.enabled) {
      return;
    }
    
    console.log('📝 Recording change:', change);
    
    // Clear batch timeout if exists
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
    }
    
    // Add to batch
    this.batchedChanges.push({
      ...change,
      timestamp: Date.now()
    });
    
    // Set new batch timeout
    this.batchTimeout = setTimeout(() => {
      this.commitBatch();
    }, this.batchDelay);
  }

  /**
   * Commit batched changes as single history entry
   */
  commitBatch() {
    if (this.batchedChanges.length === 0) {
      return;
    }
    
    const entry = {
      id: this.generateId(),
      timestamp: Date.now(),
      changes: [...this.batchedChanges],
      type: this.getBatchType(this.batchedChanges),
      description: this.getBatchDescription(this.batchedChanges)
    };
    
    // Remove any history after current index
    this.history = this.history.slice(0, this.currentIndex + 1);
    
    // Add new entry
    this.history.push(entry);
    this.currentIndex++;
    
    // Trim history if needed
    if (this.history.length > this.maxHistorySize) {
      const removed = this.history.shift();
      this.currentIndex--;
      console.log('🗑️ Trimmed old history entry:', removed.description);
    }
    
    // Clear batch
    this.batchedChanges = [];
    this.batchTimeout = null;
    
    console.log('✅ History entry committed:', {
      index: this.currentIndex,
      total: this.history.length,
      description: entry.description
    });
    
    // Emit event
    eventBus.emit('undoredo:recorded', entry);
  }

  /**
   * Get batch type from changes
   * 
   * @param {Array} changes - Changes
   * @returns {string} Batch type
   */
  getBatchType(changes) {
    if (changes.length === 1) {
      return changes[0].type;
    }
    
    const types = new Set(changes.map(c => c.type));
    if (types.size === 1) {
      return changes[0].type;
    }
    
    return 'batch';
  }

  /**
   * Get human-readable description of batch
   * 
   * @param {Array} changes - Changes
   * @returns {string} Description
   */
  getBatchDescription(changes) {
    if (changes.length === 0) {
      return 'Unknown change';
    }
    
    if (changes.length === 1) {
      const change = changes[0];
      switch (change.type) {
        case 'add':
          return `Add ${change.target}`;
        case 'remove':
          return `Remove ${change.target}`;
        case 'update':
          return `Update ${change.target}`;
        case 'move':
          return `Move ${change.target}`;
        default:
          return `Change ${change.target}`;
      }
    }
    
    return `${changes.length} changes`;
  }

  /**
   * Undo last change
   * 
   * @returns {Promise<Object|null>} Undone entry or null
   */
  async undo() {
    if (!this.canUndo()) {
      console.warn('⚠️ Cannot undo: no history');
      return null;
    }
    
    // Commit any pending batch first
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.commitBatch();
    }
    
    this.isApplyingHistory = true;
    const entry = this.history[this.currentIndex];
    this.currentIndex--;
    
    console.log('↩️ Undoing:', entry.description);
    
    try {
      // Create reverse operations
      const reverseOps = this.createReverseOperations(entry.changes);
      await this.applyOperations(reverseOps);
      
      console.log('✅ Undo complete');
      eventBus.emit('undoredo:undo', entry);
      
      return entry;
    } catch (error) {
      console.error('❌ Undo failed:', error);
      // Restore index on failure
      this.currentIndex++;
      throw error;
    } finally {
      this.isApplyingHistory = false;
    }
  }

  /**
   * Redo previously undone change
   * 
   * @returns {Promise<Object|null>} Redone entry or null
   */
  async redo() {
    if (!this.canRedo()) {
      console.warn('⚠️ Cannot redo: at latest history');
      return null;
    }
    
    this.isApplyingHistory = true;
    this.currentIndex++;
    const entry = this.history[this.currentIndex];
    
    console.log('↪️ Redoing:', entry.description);
    
    try {
      await this.applyOperations(entry.changes);
      
      console.log('✅ Redo complete');
      eventBus.emit('undoredo:redo', entry);
      
      return entry;
    } catch (error) {
      console.error('❌ Redo failed:', error);
      // Restore index on failure
      this.currentIndex--;
      throw error;
    } finally {
      this.isApplyingHistory = false;
    }
  }

  /**
   * Create reverse operations for changes
   * 
   * @param {Array} changes - Changes to reverse
   * @returns {Array} Reverse operations
   */
  createReverseOperations(changes) {
    return changes.map(change => {
      switch (change.type) {
        case 'add':
          return { 
            ...change, 
            type: 'remove',
            oldValue: change.newValue,
            newValue: change.oldValue
          };
          
        case 'remove':
          return { 
            ...change, 
            type: 'add',
            oldValue: change.newValue,
            newValue: change.oldValue
          };
          
        case 'update':
          return { 
            ...change, 
            oldValue: change.newValue,
            newValue: change.oldValue
          };
          
        case 'move':
          return {
            ...change,
            oldValue: { 
              fromIndex: change.newValue?.toIndex,
              toIndex: change.newValue?.fromIndex
            },
            newValue: {
              fromIndex: change.oldValue?.toIndex,
              toIndex: change.oldValue?.fromIndex
            }
          };
          
        default:
          return change;
      }
    }).reverse();
  }

  /**
   * Apply operations
   * 
   * @param {Array} operations - Operations to apply
   */
  async applyOperations(operations) {
    for (const op of operations) {
      eventBus.emit('undoredo:apply', op);
    }
  }

  /**
   * Check if can undo
   * 
   * @returns {boolean} Whether undo is possible
   */
  canUndo() {
    return this.enabled && this.currentIndex >= 0;
  }

  /**
   * Check if can redo
   * 
   * @returns {boolean} Whether redo is possible
   */
  canRedo() {
    return this.enabled && this.currentIndex < this.history.length - 1;
  }

  /**
   * Get current history state
   * 
   * @returns {Object} History state
   */
  getState() {
    return {
      canUndo: this.canUndo(),
      canRedo: this.canRedo(),
      currentIndex: this.currentIndex,
      historyLength: this.history.length,
      currentEntry: this.history[this.currentIndex] || null,
      nextEntry: this.history[this.currentIndex + 1] || null
    };
  }

  /**
   * Get history entries
   * 
   * @param {number} limit - Max entries to return
   * @returns {Array} History entries
   */
  getHistory(limit = 10) {
    const start = Math.max(0, this.currentIndex - limit + 1);
    const end = this.currentIndex + 1;
    return this.history.slice(start, end).reverse();
  }

  /**
   * Clear history
   */
  clear() {
    this.history = [];
    this.currentIndex = -1;
    this.batchedChanges = [];
    
    if (this.batchTimeout) {
      clearTimeout(this.batchTimeout);
      this.batchTimeout = null;
    }
    
    console.log('🗑️ History cleared');
    eventBus.emit('undoredo:cleared');
  }

  /**
   * Enable/disable history recording
   * 
   * @param {boolean} enabled - Whether to enable
   */
  setEnabled(enabled) {
    this.enabled = enabled;
    console.log(enabled ? '✅ History enabled' : '⏸️ History disabled');
  }

  /**
   * Generate unique ID
   * 
   * @returns {string} Unique ID
   */
  generateId() {
    return `history_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}

/**
 * Setup keyboard shortcuts for undo/redo
 * 
 * @param {UndoRedoManager} manager - Manager instance
 */
export function setupUndoRedoShortcuts(manager) {
  document.addEventListener('keydown', (e) => {
    // Don't trigger in input fields
    if (e.target.tagName === 'INPUT' || 
        e.target.tagName === 'TEXTAREA' ||
        e.target.contentEditable === 'true') {
      return;
    }
    
    // Ctrl/Cmd + Z (Undo)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
      e.preventDefault();
      manager.undo().catch(err => console.error('Undo error:', err));
      return;
    }
    
    // Ctrl/Cmd + Y or Ctrl/Cmd + Shift + Z (Redo)
    if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
      e.preventDefault();
      manager.redo().catch(err => console.error('Redo error:', err));
      return;
    }
  });
  
  console.log('⌨️ Undo/Redo keyboard shortcuts registered');
}

// Export singleton instance
export const undoRedoManager = new UndoRedoManager();
