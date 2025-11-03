/**
 * Storage Service
 * 
 * ROOT FIX: Centralized localStorage access
 * 
 * ARCHITECTURE COMPLIANCE:
 * - Single source of truth for browser storage operations
 * - Consistent error handling across all storage operations
 * - Type-safe storage with automatic JSON serialization
 * - Namespace support to prevent key collisions
 * - Storage quota management
 * 
 * BENEFITS:
 * - Eliminates scattered localStorage.* calls throughout codebase
 * - Easy to add encryption or compression later
 * - Simplified testing with mockable interface
 * - Consistent error handling
 * - Protection against quota exceeded errors
 */

class StorageService {
  constructor(namespace = 'gmkb') {
    this.namespace = namespace;
    this.isAvailable = this._checkAvailability();
    
    if (!this.isAvailable) {
      console.warn('⚠️ localStorage is not available - storage operations will be no-ops');
    }
  }
  
  /**
   * Check if localStorage is available
   * Some browsers disable it in private mode or when quota is exceeded
   */
  _checkAvailability() {
    try {
      const test = '__storage_test__';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch (e) {
      return false;
    }
  }
  
  /**
   * Generate namespaced key
   * @param {string} key - The storage key
   * @returns {string} Namespaced key
   */
  _getKey(key) {
    return `${this.namespace}_${key}`;
  }
  
  /**
   * Store data in localStorage
   * Automatically serializes objects to JSON
   * 
   * @param {string} key - Storage key
   * @param {any} value - Value to store (will be JSON serialized)
   * @returns {boolean} Success status
   */
  set(key, value) {
    if (!this.isAvailable) {
      console.warn('localStorage not available, skipping set:', key);
      return false;
    }
    
    try {
      const serialized = JSON.stringify(value);
      const namespacedKey = this._getKey(key);
      localStorage.setItem(namespacedKey, serialized);
      
      if (window.gmkbData?.debugMode) {
        console.log(`💾 StorageService.set: ${key} (${serialized.length} bytes)`);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to store ${key}:`, error);
      
      // Handle quota exceeded
      if (error.name === 'QuotaExceededError') {
        console.warn('⚠️ Storage quota exceeded - attempting cleanup');
        this._attemptCleanup();
        
        // Retry once after cleanup
        try {
          const serialized = JSON.stringify(value);
          const namespacedKey = this._getKey(key);
          localStorage.setItem(namespacedKey, serialized);
          console.log('✅ Storage successful after cleanup');
          return true;
        } catch (retryError) {
          console.error('❌ Storage failed even after cleanup:', retryError);
          return false;
        }
      }
      
      return false;
    }
  }
  
  /**
   * Retrieve data from localStorage
   * Automatically deserializes JSON
   * 
   * @param {string} key - Storage key
   * @param {any} defaultValue - Default value if key doesn't exist
   * @returns {any} Retrieved value or default
   */
  get(key, defaultValue = null) {
    if (!this.isAvailable) {
      return defaultValue;
    }
    
    try {
      const namespacedKey = this._getKey(key);
      const serialized = localStorage.getItem(namespacedKey);
      
      if (serialized === null) {
        return defaultValue;
      }
      
      const value = JSON.parse(serialized);
      
      if (window.gmkbData?.debugMode) {
        console.log(`📖 StorageService.get: ${key}`);
      }
      
      return value;
    } catch (error) {
      console.error(`❌ Failed to retrieve ${key}:`, error);
      return defaultValue;
    }
  }
  
  /**
   * Remove item from localStorage
   * 
   * @param {string} key - Storage key
   * @returns {boolean} Success status
   */
  remove(key) {
    if (!this.isAvailable) {
      return false;
    }
    
    try {
      const namespacedKey = this._getKey(key);
      localStorage.removeItem(namespacedKey);
      
      if (window.gmkbData?.debugMode) {
        console.log(`🗑️ StorageService.remove: ${key}`);
      }
      
      return true;
    } catch (error) {
      console.error(`❌ Failed to remove ${key}:`, error);
      return false;
    }
  }
  
  /**
   * Check if key exists in storage
   * 
   * @param {string} key - Storage key
   * @returns {boolean} True if key exists
   */
  has(key) {
    if (!this.isAvailable) {
      return false;
    }
    
    const namespacedKey = this._getKey(key);
    return localStorage.getItem(namespacedKey) !== null;
  }
  
  /**
   * Clear all namespaced storage
   * Only removes items with our namespace prefix
   * 
   * @returns {number} Number of items cleared
   */
  clear() {
    if (!this.isAvailable) {
      return 0;
    }
    
    try {
      const prefix = `${this.namespace}_`;
      const keys = [];
      
      // Find all keys with our namespace
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key && key.startsWith(prefix)) {
          keys.push(key);
        }
      }
      
      // Remove them
      keys.forEach(key => localStorage.removeItem(key));
      
      console.log(`🗑️ StorageService.clear: Removed ${keys.length} items`);
      return keys.length;
    } catch (error) {
      console.error('❌ Failed to clear storage:', error);
      return 0;
    }
  }
  
  /**
   * Get all keys with our namespace
   * 
   * @returns {string[]} Array of keys (without namespace prefix)
   */
  keys() {
    if (!this.isAvailable) {
      return [];
    }
    
    const prefix = `${this.namespace}_`;
    const keys = [];
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        // Remove prefix
        keys.push(key.substring(prefix.length));
      }
    }
    
    return keys;
  }
  
  /**
   * Get storage size estimate
   * 
   * @returns {Object} Storage statistics
   */
  getStats() {
    if (!this.isAvailable) {
      return { available: false };
    }
    
    const prefix = `${this.namespace}_`;
    let totalBytes = 0;
    let itemCount = 0;
    
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const value = localStorage.getItem(key);
        if (value) {
          totalBytes += new Blob([value]).size;
          itemCount++;
        }
      }
    }
    
    return {
      available: true,
      itemCount,
      totalBytes,
      totalKB: (totalBytes / 1024).toFixed(2),
      totalMB: (totalBytes / 1024 / 1024).toFixed(2)
    };
  }
  
  /**
   * Attempt cleanup of old or large items
   * Called automatically on quota exceeded errors
   */
  _attemptCleanup() {
    console.log('🧹 Attempting storage cleanup...');
    
    const prefix = `${this.namespace}_`;
    const items = [];
    
    // Collect all namespaced items with size and timestamp
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(prefix)) {
        const value = localStorage.getItem(key);
        if (value) {
          try {
            const data = JSON.parse(value);
            items.push({
              key,
              size: new Blob([value]).size,
              timestamp: data.timestamp || 0,
              value: data
            });
          } catch (e) {
            // Not JSON, just include size
            items.push({
              key,
              size: new Blob([value]).size,
              timestamp: 0
            });
          }
        }
      }
    }
    
    // Sort by timestamp (oldest first)
    items.sort((a, b) => a.timestamp - b.timestamp);
    
    // Remove oldest 25% of items
    const toRemove = Math.ceil(items.length * 0.25);
    let removed = 0;
    let freedBytes = 0;
    
    for (let i = 0; i < toRemove && i < items.length; i++) {
      const item = items[i];
      localStorage.removeItem(item.key);
      removed++;
      freedBytes += item.size;
    }
    
    console.log(`🧹 Cleanup complete: Removed ${removed} items, freed ${(freedBytes / 1024).toFixed(2)} KB`);
  }
  
  /**
   * Backup-specific methods for media kit data
   */
  
  /**
   * Create a backup of media kit state
   * 
   * @param {number} postId - Post ID for namespacing
   * @param {Object} state - State to backup
   * @returns {boolean} Success status
   */
  createBackup(postId, state) {
    const backup = {
      ...state,
      timestamp: Date.now(),
      postId
    };
    
    return this.set(`backup_${postId}`, backup);
  }
  
  /**
   * Retrieve a backup of media kit state
   * 
   * @param {number} postId - Post ID for namespacing
   * @param {number} maxAge - Maximum age in milliseconds (default: 1 hour)
   * @returns {Object|null} Backup data or null
   */
  getBackup(postId, maxAge = 3600000) {
    const backup = this.get(`backup_${postId}`);
    
    if (!backup) {
      return null;
    }
    
    // Check age
    const age = Date.now() - backup.timestamp;
    if (age > maxAge) {
      console.log(`♻️ Backup too old (${(age / 1000).toFixed(0)}s), ignoring`);
      this.remove(`backup_${postId}`);
      return null;
    }
    
    return backup;
  }
  
  /**
   * Remove a backup
   * 
   * @param {number} postId - Post ID for namespacing
   * @returns {boolean} Success status
   */
  removeBackup(postId) {
    return this.remove(`backup_${postId}`);
  }
}

// Create and export singleton instance
const storageService = new StorageService('gmkb');

// Make globally available for debugging
if (typeof window !== 'undefined') {
  window.gmkbStorage = storageService;
}

export default storageService;
