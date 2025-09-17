/**
 * WordPress API Service - Clean AJAX Integration
 */
export class APIService {
  constructor(ajaxUrl, nonce, postId) {
    this.ajaxUrl = ajaxUrl || window.gmkbData?.ajaxUrl;
    this.nonce = nonce || window.gmkbData?.nonce;
    
    // ROOT FIX: Get post ID from multiple sources with mkcg_id priority
    this.postId = this.detectPostId(postId);
    
    if (!this.postId) {
      console.error('APIService: No post ID available');
    }
  }
  
  /**
   * ROOT FIX: Detect post ID from multiple sources
   * Priority: 1. mkcg_id from URL, 2. Passed postId, 3. gmkbData
   */
  detectPostId(passedPostId) {
    // Priority 1: mkcg_id from URL (highest priority for guest posts)
    const urlParams = new URLSearchParams(window.location.search);
    const mkcgId = urlParams.get('mkcg_id');
    if (mkcgId) {
      console.log('APIService: Using mkcg_id from URL:', mkcgId);
      return parseInt(mkcgId);
    }
    
    // Priority 2: Passed post ID
    if (passedPostId) {
      return passedPostId;
    }
    
    // Priority 3: gmkbData variations
    if (window.gmkbData) {
      if (window.gmkbData.postId) return window.gmkbData.postId;
      if (window.gmkbData.post_id) return window.gmkbData.post_id;
      if (window.gmkbData.mkcg_id) return window.gmkbData.mkcg_id;
    }
    
    // Priority 4: Other URL parameters
    const postIdFromUrl = urlParams.get('post_id');
    if (postIdFromUrl) {
      return parseInt(postIdFromUrl);
    }
    
    const guestId = urlParams.get('guest_id');
    if (guestId) {
      return parseInt(guestId);
    }
    
    return null;
  }

  async save(state) {
    // ROOT FIX: Ensure we have a post ID before saving
    if (!this.postId) {
      // Try to detect it again in case URL changed
      this.postId = this.detectPostId();
      if (!this.postId) {
        throw new Error('Cannot save: No post ID available');
      }
    }
    
    const formData = new FormData();
    formData.append('action', 'gmkb_save_media_kit');
    formData.append('nonce', this.nonce);
    formData.append('post_id', this.postId);
    formData.append('state', JSON.stringify(state));
    
    console.log('APIService: Saving to post ID:', this.postId);
    
    try {
      const response = await fetch(this.ajaxUrl, {
        method: 'POST',
        credentials: 'same-origin', // ROOT FIX: Include credentials for WordPress auth
        body: formData
      });
      
      const text = await response.text();
      let result;
      
      try {
        result = JSON.parse(text);
      } catch (e) {
        console.error('APIService: Invalid JSON response:', text);
        throw new Error('Server returned invalid response');
      }
      
      if (!result.success) {
        // ROOT FIX: Handle nonce errors silently for auto-save
        if (result.data === 'Invalid nonce') {
          // Silently fail for auto-save nonce errors
          return { success: false, silent: true, reason: 'nonce_expired' };
        }
        throw new Error(result.data?.message || result.data || 'Save failed');
      }
      
      console.log('APIService: Save successful', result.data);
      return result.data;
    } catch (error) {
      console.error('APIService: Save failed:', error);
      throw error;
    }
  }

  async load() {
    const formData = new FormData();
    formData.append('action', 'gmkb_load_media_kit');
    formData.append('nonce', this.nonce);
    formData.append('post_id', this.postId);
    
    try {
      const response = await fetch(this.ajaxUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Load failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.data?.message || 'Load failed');
      }
      
      return result.data;
    } catch (error) {
      console.error('Load failed:', error);
      return null;
    }
  }

  async loadComponent(componentId) {
    const formData = new FormData();
    formData.append('action', 'gmkb_load_component');
    formData.append('nonce', this.nonce);
    formData.append('component_id', componentId);
    formData.append('post_id', this.postId);
    
    try {
      const response = await fetch(this.ajaxUrl, {
        method: 'POST',
        body: formData
      });
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.data?.message || 'Load failed');
      }
      
      return result.data;
    } catch (error) {
      console.error('Component load failed:', error);
      return null;
    }
  }
}
