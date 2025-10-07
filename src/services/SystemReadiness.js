/**
 * System Readiness Coordinator
 * 
 * Manages initialization order and dependencies between systems.
 * Prevents race conditions by ensuring proper initialization sequence.
 * 
 * Issue #24 FIX: Removed EventBus dependency, using DOM CustomEvents
 * 
 * @implements Checklist: No Polling, Event-Driven Initialization
 */


class SystemReadiness {
  constructor() {
    this.requiredSystems = new Set([
      'store',
      'theme',
      'components',
      'api'
    ]);
    
    this.readySystems = new Set();
    this.startTime = Date.now();
    this.initialized = false;
  }

  /**
   * Mark a system as ready
   * 
   * @param {string} systemName - Name of the system
   * @param {*} systemData - Optional system data/instance
   */
  markReady(systemName, systemData = null) {
    if (this.readySystems.has(systemName)) {
      console.warn(`[SystemReadiness] System '${systemName}' already marked as ready`);
      return;
    }
    
    this.readySystems.add(systemName);
    
    // Issue #24 FIX: Emit individual system ready event using DOM CustomEvent
    document.dispatchEvent(new CustomEvent(`gmkb:system:${systemName}:ready`, {
      detail: systemData
    }));
    
    // Log readiness
    const elapsed = Date.now() - this.startTime;
    console.log(`[SystemReadiness] ✅ ${systemName} ready (${elapsed}ms)`);
    
    // Check if all systems are ready
    this.checkAllSystemsReady();
  }

  /**
   * Check if all required systems are ready
   */
  checkAllSystemsReady() {
    const allReady = Array.from(this.requiredSystems).every(system => 
      this.readySystems.has(system)
    );
    
    if (allReady && !this.initialized) {
      this.initialized = true;
      const totalTime = Date.now() - this.startTime;
      
      console.log(`[SystemReadiness] 🎉 All systems ready! (${totalTime}ms)`);
      
      // Issue #24 FIX: Emit global ready event using DOM CustomEvent
      document.dispatchEvent(new CustomEvent('gmkb:app:ready', {
        detail: {
          systems: Array.from(this.readySystems),
          initTime: totalTime
        }
      }));
    }
  }

  /**
   * Wait for a specific system to be ready
   * 
   * Issue #24 FIX: Replaced EventBus with DOM event listener
   * 
   * @param {string} systemName - Name of the system
   * @param {number} timeout - Optional timeout in milliseconds
   * @returns {Promise} Resolves when system is ready
   */
  async waitForSystem(systemName, timeout = 10000) {
    if (this.readySystems.has(systemName)) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      const eventName = `gmkb:system:${systemName}:ready`;
      
      const handler = () => {
        clearTimeout(timeoutId);
        resolve();
      };
      
      document.addEventListener(eventName, handler, { once: true });
      
      const timeoutId = setTimeout(() => {
        document.removeEventListener(eventName, handler);
        reject(new Error(`Timeout waiting for system: ${systemName}`));
      }, timeout);
    });
  }

  /**
   * Wait for all systems to be ready
   * 
   * Issue #24 FIX: Replaced EventBus with DOM event listener
   * 
   * @param {number} timeout - Optional timeout in milliseconds
   * @returns {Promise} Resolves when all systems are ready
   */
  async waitForAll(timeout = 10000) {
    if (this.initialized) {
      return Promise.resolve();
    }
    
    return new Promise((resolve, reject) => {
      const handler = () => {
        clearTimeout(timeoutId);
        resolve();
      };
      
      document.addEventListener('gmkb:app:ready', handler, { once: true });
      
      const timeoutId = setTimeout(() => {
        document.removeEventListener('gmkb:app:ready', handler);
        reject(new Error('Timeout waiting for all systems'));
      }, timeout);
    });
  }

  /**
   * Add a required system
   * 
   * @param {string} systemName - Name of the system
   */
  addRequiredSystem(systemName) {
    this.requiredSystems.add(systemName);
    this.checkAllSystemsReady();
  }

  /**
   * Remove a required system
   * 
   * @param {string} systemName - Name of the system
   */
  removeRequiredSystem(systemName) {
    this.requiredSystems.delete(systemName);
    this.checkAllSystemsReady();
  }

  /**
   * Reset the coordinator (useful for testing)
   */
  reset() {
    this.readySystems.clear();
    this.initialized = false;
    this.startTime = Date.now();
  }

  /**
   * Get status information
   * 
   * @returns {Object} Status info
   */
  getStatus() {
    return {
      initialized: this.initialized,
      requiredSystems: Array.from(this.requiredSystems),
      readySystems: Array.from(this.readySystems),
      pendingSystems: Array.from(this.requiredSystems).filter(s => !this.readySystems.has(s)),
      elapsedTime: Date.now() - this.startTime
    };
  }
}

// Export singleton instance
const systemReadiness = new SystemReadiness();

// Expose to window in development for debugging
if (typeof window !== 'undefined' && (process.env.NODE_ENV === 'development' || window.gmkbData?.debugMode)) {
  window.__systemReadiness = systemReadiness;
  window.__systemStatus = () => systemReadiness.getStatus();
  console.log('[SystemReadiness] ✅ System readiness coordinator initialized');
}

export default systemReadiness;
