/**
 * Nonce Manager Service
 * ROOT FIX: Event-driven nonce management with automatic refresh
 * No polling - refreshes on 401/403 errors or before critical operations
 */

class NonceManager {
  constructor() {
    this.nonce = window.gmkbData?.nonce || window.gmkbData?.ajaxNonce || '';
    this.restNonce = window.gmkbData?.restNonce || window.gmkbData?.nonce || '';
    this.refreshing = false;
    this.lastRefresh = Date.now();
    this.refreshCallbacks = [];
    
    // Listen for nonce refresh events
    document.addEventListener('gmkb:nonce-refreshed', (e) => {
      this.nonce = e.detail.nonce;
      this.restNonce = e.detail.restNonce || e.detail.nonce;
      this.lastRefresh = Date.now();
      console.log('✅ Nonce updated via event');
    });
  }
  
  /**
   * Get current nonce for AJAX requests
   */
  getNonce() {
    return this.nonce;
  }
  
  /**
   * Get current REST nonce
   */
  getRestNonce() {
    return this.restNonce;
  }
  
  /**
   * Check if nonce is likely expired (12+ hours old)
   */
  isLikelyExpired() {
    const twelveHours = 12 * 60 * 60 * 1000;
    return (Date.now() - this.lastRefresh) > twelveHours;
  }
  
  /**
   * Refresh nonce from WordPress
   * ROOT FIX: Event-driven, no polling
   */
  async refreshNonce() {
    // Prevent multiple simultaneous refreshes
    if (this.refreshing) {
      return new Promise((resolve) => {
        this.refreshCallbacks.push(resolve);
      });
    }
    
    this.refreshing = true;
    console.log('🔄 Refreshing WordPress nonce...');
    
    try {
      const formData = new FormData();
      formData.append('action', 'gmkb_refresh_nonce');
      
      const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });
      
      if (!response.ok) {
        throw new Error('Failed to refresh nonce: HTTP ' + response.status);
      }
      
      const data = await response.json();
      
      if (data.success && data.data) {
        this.nonce = data.data.nonce || data.data.ajaxNonce || this.nonce;
        this.restNonce = data.data.restNonce || data.data.rest_nonce || this.restNonce;
        this.lastRefresh = Date.now();
        
        // Update global data
        if (window.gmkbData) {
          window.gmkbData.nonce = this.nonce;
          window.gmkbData.ajaxNonce = this.nonce;
          window.gmkbData.restNonce = this.restNonce;
        }
        
        console.log('✅ Nonce refreshed successfully');
        
        // Dispatch event for other systems
        document.dispatchEvent(new CustomEvent('gmkb:nonce-refreshed', {
          detail: { 
            nonce: this.nonce, 
            restNonce: this.restNonce,
            timestamp: this.lastRefresh
          }
        }));
        
        // Resolve all waiting callbacks
        this.refreshCallbacks.forEach(cb => cb(this.nonce));
        this.refreshCallbacks = [];
        
        return this.nonce;
      } else {
        throw new Error(data.data || 'Failed to refresh nonce');
      }
    } catch (error) {
      console.error('❌ Nonce refresh failed:', error);
      
      // Resolve callbacks with current nonce
      this.refreshCallbacks.forEach(cb => cb(this.nonce));
      this.refreshCallbacks = [];
      
      throw error;
    } finally {
      this.refreshing = false;
    }
  }
  
  /**
   * Make an AJAX request with automatic nonce refresh on failure
   * ROOT FIX: Automatic retry with fresh nonce
   */
  async ajaxRequest(action, data = {}, retryCount = 0) {
    const formData = new FormData();
    formData.append('action', action);
    formData.append('nonce', this.getNonce());
    
    // Add other data
    Object.keys(data).forEach(key => {
      if (typeof data[key] === 'object') {
        formData.append(key, JSON.stringify(data[key]));
      } else {
        formData.append(key, data[key]);
      }
    });
    
    try {
      const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
        method: 'POST',
        body: formData,
        credentials: 'same-origin'
      });
      
      const result = await response.json();
      
      // Check for nonce error and retry once
      if (!result.success && retryCount === 0) {
        const errorMsg = result.data?.message || result.data || '';
        if (errorMsg.toLowerCase().includes('nonce') || errorMsg.toLowerCase().includes('session')) {
          console.log('🔄 Nonce error detected, refreshing and retrying...');
          await this.refreshNonce();
          return this.ajaxRequest(action, data, 1);
        }
      }
      
      return result;
    } catch (error) {
      console.error('AJAX request failed:', error);
      throw error;
    }
  }
}

// Create singleton instance
const nonceManager = new NonceManager();

// Make it globally available
if (typeof window !== 'undefined') {
  window.gmkbNonceManager = nonceManager;
}

export default nonceManager;
