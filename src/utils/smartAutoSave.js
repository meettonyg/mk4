/**
 * Smart Auto-Save System - Phase 13
 * 
 * Intelligent auto-save with batching, quiet periods, and conflict prevention
 * Prevents excessive saves and improves performance
 * 
 * @version 1.0.0
 */

import eventBus from '@/services/EventBus';

export class SmartAutoSave {
  constructor(saveFunction, options = {}) {
    this.saveFunction = saveFunction;
    
    // Configuration with defaults
    this.options = {
      minInterval: 2000,      // Minimum 2 seconds between saves
      maxInterval: 10000,     // Force save after 10 seconds
      quietPeriod: 1000,      // Wait 1 second after last change
      batchSize: 5,           // Batch 5 changes before saving
      retryAttempts: 3,       // Retry failed saves 3 times
      retryDelay: 2000,       // Wait 2 seconds between retries
      conflictResolution: 'merge', // 'merge', 'overwrite', or 'skip'
      enableDebugLog: process.env.NODE_ENV === 'development',
      ...options
    };
    
    // State tracking
    this.pendingChanges = [];
    this.lastSaveTime = 0;
    this.lastChangeTime = 0;
    this.saveTimer = null;
    this.forceTimer = null;
    this.isSaving = false;
    this.saveCount = 0;
    this.failureCount = 0;
    this.retryQueue = [];
    
    // Performance metrics
    this.metrics = {
      totalSaves: 0,
      totalChanges: 0,
      averageBatchSize: 0,
      averageInterval: 0,
      lastSaveDuration: 0
    };
    
    // Initialize
    this.setupEventListeners();
    this.log('✅ Smart auto-save initialized', this.options);
  }

  /**
   * Track a change for auto-save
   * @param {Object} change - Change object with type and data
   */
  trackChange(change) {
    // Add timestamp and unique ID
    const trackedChange = {
      ...change,
      id: this.generateChangeId(),
      timestamp: Date.now()
    };
    
    this.pendingChanges.push(trackedChange);
    this.lastChangeTime = Date.now();
    this.metrics.totalChanges++;
    
    this.log(`📝 Change tracked: ${change.type}`, { 
      pendingCount: this.pendingChanges.length,
      batchSize: this.options.batchSize 
    });
    
    // Emit change event
    eventBus.emit('autosave:change-tracked', trackedChange);
    
    // Schedule save
    this.scheduleAutoSave();
  }

  /**
   * Schedule auto-save with intelligent timing
   */
  scheduleAutoSave() {
    // Don't schedule if currently saving
    if (this.isSaving) {
      this.log('⏸️ Save in progress, deferring schedule');
      return;
    }
    
    // Clear existing timers
    this.clearTimers();
    
    const timeSinceLastSave = Date.now() - this.lastSaveTime;
    const timeSinceLastChange = Date.now() - this.lastChangeTime;
    
    // Determine if we should save immediately
    const shouldSaveImmediately = this.shouldSaveImmediately(
      timeSinceLastSave,
      timeSinceLastChange
    );
    
    if (shouldSaveImmediately) {
      this.log('⚡ Immediate save triggered');
      this.performSave('immediate');
    } else {
      // Schedule save after quiet period
      const quietDelay = this.options.quietPeriod;
      
      this.saveTimer = setTimeout(() => {
        this.performSave('quiet');
      }, quietDelay);
      
      // Also set a maximum interval timer
      const maxDelay = Math.max(
        0,
        this.options.maxInterval - timeSinceLastSave
      );
      
      if (maxDelay > 0) {
        this.forceTimer = setTimeout(() => {
          this.performSave('forced');
        }, maxDelay);
      }
      
      this.log(`⏰ Save scheduled in ${quietDelay}ms (force in ${maxDelay}ms)`);
    }
  }

  /**
   * Determine if save should happen immediately
   */
  shouldSaveImmediately(timeSinceLastSave, timeSinceLastChange) {
    // Check batch size threshold
    if (this.pendingChanges.length >= this.options.batchSize) {
      return timeSinceLastSave >= this.options.minInterval;
    }
    
    // Check maximum interval
    if (timeSinceLastSave >= this.options.maxInterval && this.pendingChanges.length > 0) {
      return true;
    }
    
    // Check for critical changes
    const hasCriticalChange = this.pendingChanges.some(c => c.priority === 'critical');
    if (hasCriticalChange && timeSinceLastSave >= this.options.minInterval) {
      return true;
    }
    
    return false;
  }

  /**
   * Perform the actual save operation
   */
  async performSave(trigger = 'manual') {
    // Check if we have changes to save
    if (this.pendingChanges.length === 0 && this.retryQueue.length === 0) {
      this.log('ℹ️ No changes to save');
      return;
    }
    
    // Prevent concurrent saves
    if (this.isSaving) {
      this.log('⚠️ Save already in progress');
      return;
    }
    
    this.clearTimers();
    this.isSaving = true;
    
    // Combine pending changes with retry queue
    const changesToSave = [
      ...this.retryQueue,
      ...this.pendingChanges
    ];
    
    // Clear pending changes (move to processing)
    this.pendingChanges = [];
    this.retryQueue = [];
    
    const saveStartTime = Date.now();
    
    this.log(`💾 Starting save (${trigger})`, {
      changes: changesToSave.length,
      trigger
    });
    
    try {
      // Emit pre-save event
      eventBus.emit('autosave:before-save', { changes: changesToSave, trigger });
      
      // Perform save
      const result = await this.saveFunction(changesToSave);
      
      // Update metrics
      this.lastSaveTime = Date.now();
      this.saveCount++;
      this.metrics.totalSaves++;
      this.metrics.lastSaveDuration = Date.now() - saveStartTime;
      this.metrics.averageBatchSize = 
        (this.metrics.averageBatchSize * (this.metrics.totalSaves - 1) + changesToSave.length) / 
        this.metrics.totalSaves;
      
      // Calculate average interval
      if (this.metrics.totalSaves > 1) {
        const interval = this.lastSaveTime - (this.lastSaveTime - this.metrics.lastSaveDuration);
        this.metrics.averageInterval = 
          (this.metrics.averageInterval * (this.metrics.totalSaves - 2) + interval) / 
          (this.metrics.totalSaves - 1);
      }
      
      // Emit success event
      eventBus.emit('autosave:save-success', {
        changes: changesToSave.length,
        duration: this.metrics.lastSaveDuration,
        trigger,
        result
      });
      
      this.log(`✅ Save completed`, {
        changes: changesToSave.length,
        duration: `${this.metrics.lastSaveDuration}ms`,
        trigger
      });
      
      // Reset failure count on success
      this.failureCount = 0;
      
    } catch (error) {
      this.failureCount++;
      
      this.log(`❌ Save failed (attempt ${this.failureCount})`, error);
      
      // Emit failure event
      eventBus.emit('autosave:save-error', {
        error,
        changes: changesToSave.length,
        attempt: this.failureCount
      });
      
      // Handle retry logic
      if (this.failureCount < this.options.retryAttempts) {
        // Add changes back to retry queue
        this.retryQueue = changesToSave;
        
        // Schedule retry
        setTimeout(() => {
          this.log(`🔄 Retrying save (${this.failureCount + 1}/${this.options.retryAttempts})`);
          this.isSaving = false;
          this.performSave('retry');
        }, this.options.retryDelay * Math.pow(2, this.failureCount - 1)); // Exponential backoff
      } else {
        // Max retries exceeded
        this.log('⛔ Max retries exceeded, changes may be lost');
        
        // Emit critical failure event
        eventBus.emit('autosave:critical-failure', {
          changes: changesToSave,
          error
        });
        
        // Optionally try to save to local storage as backup
        this.saveToLocalBackup(changesToSave);
      }
    } finally {
      this.isSaving = false;
      
      // If we have new pending changes, schedule next save
      if (this.pendingChanges.length > 0) {
        this.scheduleAutoSave();
      }
    }
  }

  /**
   * Force an immediate save
   */
  async forceSave() {
    this.log('🔴 Force save requested');
    this.clearTimers();
    await this.performSave('forced');
  }

  /**
   * Clear all timers
   */
  clearTimers() {
    if (this.saveTimer) {
      clearTimeout(this.saveTimer);
      this.saveTimer = null;
    }
    
    if (this.forceTimer) {
      clearTimeout(this.forceTimer);
      this.forceTimer = null;
    }
  }

  /**
   * Save changes to local storage as backup
   */
  saveToLocalBackup(changes) {
    try {
      const backup = {
        changes,
        timestamp: Date.now(),
        version: '1.0.0'
      };
      
      localStorage.setItem('gmkb_autosave_backup', JSON.stringify(backup));
      
      this.log('💾 Changes backed up to local storage');
      
      // Emit backup event
      eventBus.emit('autosave:local-backup', backup);
      
    } catch (error) {
      this.log('❌ Failed to save local backup', error);
    }
  }

  /**
   * Restore changes from local backup
   */
  restoreFromBackup() {
    try {
      const backup = localStorage.getItem('gmkb_autosave_backup');
      if (!backup) return null;
      
      const data = JSON.parse(backup);
      
      // Check if backup is recent (within 1 hour)
      if (Date.now() - data.timestamp < 3600000) {
        this.log('♻️ Restored changes from backup', data);
        return data.changes;
      }
      
      return null;
    } catch (error) {
      this.log('❌ Failed to restore backup', error);
      return null;
    }
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    // Listen for manual save triggers
    eventBus.on('autosave:trigger', () => {
      this.forceSave();
    });
    
    // Listen for pause/resume
    eventBus.on('autosave:pause', () => {
      this.pause();
    });
    
    eventBus.on('autosave:resume', () => {
      this.resume();
    });
    
    // Listen for window events
    if (typeof window !== 'undefined') {
      // Save before page unload
      window.addEventListener('beforeunload', (e) => {
        if (this.pendingChanges.length > 0) {
          this.forceSave();
          e.returnValue = 'You have unsaved changes';
        }
      });
      
      // Save when window loses focus
      window.addEventListener('blur', () => {
        if (this.pendingChanges.length > 0) {
          this.performSave('blur');
        }
      });
    }
  }

  /**
   * Pause auto-save
   */
  pause() {
    this.clearTimers();
    this.paused = true;
    this.log('⏸️ Auto-save paused');
  }

  /**
   * Resume auto-save
   */
  resume() {
    this.paused = false;
    this.log('▶️ Auto-save resumed');
    
    if (this.pendingChanges.length > 0) {
      this.scheduleAutoSave();
    }
  }

  /**
   * Get current status
   */
  getStatus() {
    return {
      pendingChanges: this.pendingChanges.length,
      retryQueue: this.retryQueue.length,
      isSaving: this.isSaving,
      isPaused: this.paused,
      lastSaveTime: this.lastSaveTime,
      saveCount: this.saveCount,
      failureCount: this.failureCount,
      metrics: { ...this.metrics }
    };
  }

  /**
   * Generate unique change ID
   */
  generateChangeId() {
    return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Log message (only in debug mode)
   */
  log(message, data = null) {
    if (!this.options.enableDebugLog) return;
    
    if (data) {
      console.log(`[AutoSave] ${message}`, data);
    } else {
      console.log(`[AutoSave] ${message}`);
    }
  }

  /**
   * Destroy and clean up
   */
  destroy() {
    this.clearTimers();
    
    // Save any pending changes
    if (this.pendingChanges.length > 0) {
      this.forceSave();
    }
    
    // Clear state
    this.pendingChanges = [];
    this.retryQueue = [];
    
    this.log('🔚 Auto-save destroyed');
  }
}

// Export factory function
export function createAutoSave(saveFunction, options = {}) {
  return new SmartAutoSave(saveFunction, options);
}

// Expose for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.SmartAutoSave = SmartAutoSave;
  console.log('[SmartAutoSave] Class available at window.SmartAutoSave');
}
