/**
 * NonceManager - Handles WordPress nonce lifecycle
 * ROOT FIX: Event-driven nonce refresh without polling
 */

class NonceManager {
  constructor() {
    this.nonce = window.gmkbData?.nonce || window.gmkbData?.restNonce || '';
    this.nonceRefreshInterval = null;
    this.lastRefresh = Date.now();
    this.setupEventListeners();
  }
  
  /**
   * Setup event-driven refresh triggers
   */
  setupEventListeners() {
    // Refresh when tab regains focus
    document.addEventListener('visibilitychange', () => {
      if (!document.hidden) {
        const timeSinceRefresh = Date.now() - this.lastRefresh;
        // Refresh if more than 30 minutes since last refresh
        if (timeSinceRefresh > 1800000) {
          this.refreshNonce();
        }
      }
    });
    
    // Listen for nonce expiration events
    window.addEventListener('gmkb:nonce:expired', () => {
      this.refreshNonce();
    });
    
    // Listen for 403 errors from API calls
    window.addEventListener('gmkb:api:unauthorized', () => {
      this.refreshNonce();
    });
  }
  
  /**
   * Refresh the nonce from WordPress
   */
  async refreshNonce() {
    try {
      console.log('🔄 Refreshing WordPress nonce...');
      
      const formData = new FormData();
      formData.append('action', 'gmkb_refresh_nonce');
      
      const response = await fetch(
        window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php',
        {
          method: 'POST',
          body: formData,
          credentials: 'same-origin'
        }
      );
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }
      
      const data = await response.json();
      
      if (data.success && data.data?.nonce) {
        this.nonce = data.data.nonce;
        this.lastRefresh = Date.now();
        
        // Update global config
        if (window.gmkbData) {
          window.gmkbData.nonce = data.data.nonce;
          window.gmkbData.restNonce = data.data.nonce;
        }
        
        // Dispatch success event
        window.dispatchEvent(new CustomEvent('gmkb:nonce:refreshed', {
          detail: { nonce: this.nonce }
        }));
        
        console.log('✅ Nonce refreshed successfully');
        return this.nonce;
      } else {
        throw new Error(data.data?.message || 'Failed to refresh nonce');
      }
    } catch (error) {
      console.error('❌ Failed to refresh nonce:', error);
      
      // Dispatch failure event
      window.dispatchEvent(new CustomEvent('gmkb:nonce:refresh-failed', {
        detail: { error: error.message }
      }));
      
      throw error;
    }
  }
  
  /**
   * Get current nonce
   */
  getNonce() {
    return this.nonce;
  }
  
  /**
   * Check if nonce is likely expired (heuristic)
   */
  isLikelyExpired() {
    const timeSinceRefresh = Date.now() - this.lastRefresh;
    // WordPress nonces typically expire after 12-24 hours
    return timeSinceRefresh > 43200000; // 12 hours
  }
  
  /**
   * Handle API error and determine if nonce refresh needed
   */
  handleApiError(error) {
    if (error.status === 403 || error.message?.includes('Invalid nonce')) {
      // Trigger refresh
      window.dispatchEvent(new CustomEvent('gmkb:nonce:expired'));
      return true;
    }
    return false;
  }
}

// Create singleton instance
const nonceManager = new NonceManager();

// Export for use in other modules
export default nonceManager;

// Make available globally for debugging
if (typeof window !== 'undefined') {
  window.gmkbNonceManager = nonceManager;
}
