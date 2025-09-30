/**
 * WordPress API Service - Final Version
 * This version exclusively uses the admin-ajax.php endpoint for maximum compatibility,
 * bypassing server-level REST API blocks.
 * All original functionality from the 198-line version is preserved.
 */
export class APIService {
  constructor(ajaxUrl, nonce, postId) {
    this.ajaxUrl = ajaxUrl || window.gmkbData?.ajaxUrl;
    this.nonce = nonce || window.gmkbData?.nonce;
    this.postId = this.detectPostId(postId);

    if (!this.ajaxUrl || !this.nonce) {
      console.error('APIService Critical Error: ajaxUrl or nonce is missing. Cannot communicate with WordPress.');
    }
    if (!this.postId) {
      console.error('APIService Critical Error: No post ID could be determined.');
    }
  }

  /**
   * Detects the post ID from multiple potential sources, prioritizing URL parameters.
   */
  detectPostId(passedPostId) {
    const urlParams = new URLSearchParams(window.location.search);
    const mkcgId = urlParams.get('mkcg_id');
    if (mkcgId) {
      console.log('APIService: Using mkcg_id from URL:', mkcgId);
      return parseInt(mkcgId, 10);
    }
    
    if (passedPostId) {
      return passedPostId;
    }
    
    if (window.gmkbData) {
      if (window.gmkbData.postId) return window.gmkbData.postId;
      if (window.gmkbData.post_id) return window.gmkbData.post_id;
    }
    
    const postIdFromUrl = urlParams.get('post_id');
    if (postIdFromUrl) {
      return parseInt(postIdFromUrl, 10);
    }
    
    return null;
  }

  /**
   * Main data loading method. Fetches the entire media kit state.
   */
  async load() {
    if (!this.postId) {
      throw new Error('Cannot load: No post ID available');
    }

    const formData = new FormData();
    formData.append('action', 'gmkb_load_media_kit_vue');
    formData.append('nonce', this.nonce);
    formData.append('post_id', this.postId);

    try {
      const response = await fetch(this.ajaxUrl, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error(`Server returned an error: ${response.status} ${response.statusText}`);
      }

      const result = await response.json();

      if (!result.success) {
        const errorMessage = result.data?.message || 'Failed to load media kit data from the server.';
        throw new Error(errorMessage);
      }
      
      console.log('APIService: Load successful via admin-ajax.', result.data);
      return result.data;

    } catch (error) {
      console.error('APIService: Load operation failed:', error);
      // Re-throw the error so the calling component (MediaKitApp.vue) can catch it and display an error state.
      throw error;
    }
  }

  /**
   * Saves the entire media kit state.
   */
  async save(state) {
    if (!this.postId) {
      throw new Error('Cannot save: No post ID available');
    }

    // Ensure we are saving a clean, well-structured state.
    const cleanState = {
      components: state.components || {},
      layout: state.layout || [],
      sections: state.sections || [],
      theme: state.theme || 'default',
      themeSettings: state.themeSettings || {},
      globalSettings: state.globalSettings || {}
    };

    const formData = new FormData();
    formData.append('action', 'gmkb_save_media_kit_vue');
    formData.append('nonce', this.nonce);
    formData.append('post_id', this.postId);
    formData.append('state', JSON.stringify(cleanState));

    try {
      const response = await fetch(this.ajaxUrl, {
        method: 'POST',
        credentials: 'same-origin',
        body: formData
      });

      const result = await response.json();

      if (!result.success) {
        const errorMessage = result.data?.message || 'Save operation failed.';
        // Handle specific nonce errors for auto-save if needed
        if (result.data === 'Invalid nonce') {
          return { success: false, silent: true, reason: 'nonce_expired' };
        }
        throw new Error(errorMessage);
      }

      console.log('APIService: Save successful via admin-ajax.');
      return result.data;
    } catch (error) {
      console.error('APIService: Save operation failed:', error);
      throw error;
    }
  }

  /**
   * Loads data for a single component. (Preserved functionality)
   */
  async loadComponent(componentId) {
    if (!this.postId) {
      console.error('Cannot load component: No post ID available');
      return null;
    }
    
    const formData = new FormData();
    formData.append('action', 'gmkb_load_component_vue'); // Use a distinct action
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
        throw new Error(result.data?.message || 'Component load failed');
      }
      
      return result.data;
    } catch (error) {
      console.error(`APIService: Component load failed for ${componentId}:`, error);
      return null;
    }
  }

  /**
   * Handles JSON parsing with a fallback for malformed responses.
   * (Preserved functionality)
   */
  async _parseJsonResponse(response) {
    const text = await response.text();
    try {
      return JSON.parse(text);
    } catch (e) {
      console.error('APIService: Invalid JSON response from server:', text);
      // Attempt to recover JSON from a potentially malformed string
      const jsonMatch = text.match(/\{.*\}$/s);
      if (jsonMatch) {
        try {
          return JSON.parse(jsonMatch[0]);
        } catch (e2) {
          throw new Error('Server returned a malformed response.');
        }
      }
      throw new Error('Server returned a non-JSON response.');
    }
  }
}
