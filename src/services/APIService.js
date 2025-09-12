/**
 * WordPress API Service - Clean AJAX Integration
 */
export class APIService {
  constructor(ajaxUrl, nonce, postId) {
    this.ajaxUrl = ajaxUrl || window.gmkbData?.ajaxUrl;
    this.nonce = nonce || window.gmkbData?.nonce;
    this.postId = postId || window.gmkbData?.postId;
  }

  async save(state) {
    const formData = new FormData();
    formData.append('action', 'gmkb_save_media_kit');
    formData.append('nonce', this.nonce);
    formData.append('post_id', this.postId);
    formData.append('state', JSON.stringify(state));
    
    try {
      const response = await fetch(this.ajaxUrl, {
        method: 'POST',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error(`Save failed: ${response.statusText}`);
      }
      
      const result = await response.json();
      if (!result.success) {
        throw new Error(result.data?.message || 'Save failed');
      }
      
      return result.data;
    } catch (error) {
      console.error('Save failed:', error);
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
