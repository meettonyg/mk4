/**
 * Modern Media Uploader - jQuery-Free Alternative
 * Uses native browser file input and WordPress REST API
 * 
 * This composable provides media upload functionality without
 * requiring jQuery, Backbone, or the WordPress Media Library
 */

import { ref } from 'vue';

export function useModernMediaUploader() {
  const isUploading = ref(false);
  const uploadProgress = ref(0);
  const error = ref(null);

  /**
   * Upload file directly to WordPress via REST API
   * @param {File} file - The file to upload
   * @returns {Promise<Object>} The uploaded attachment data
   */
  async function uploadFile(file) {
    isUploading.value = true;
    uploadProgress.value = 0;
    error.value = null;

    try {
      // Create FormData
      const formData = new FormData();
      formData.append('file', file);

      // Get REST nonce from gmkbData
      const restNonce = window.gmkbData?.restNonce || '';
      
      // Upload via WordPress REST API
      const response = await fetch('/wp-json/wp/v2/media', {
        method: 'POST',
        headers: {
          'X-WP-Nonce': restNonce
        },
        body: formData
      });

      if (!response.ok) {
        throw new Error(`Upload failed: ${response.statusText}`);
      }

      const attachment = await response.json();
      
      // Format response similar to media library
      return {
        id: attachment.id,
        url: attachment.source_url,
        alt: attachment.alt_text || '',
        title: attachment.title?.rendered || '',
        caption: attachment.caption?.rendered || '',
        width: attachment.media_details?.width || null,
        height: attachment.media_details?.height || null,
        sizes: attachment.media_details?.sizes || {}
      };

    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isUploading.value = false;
      uploadProgress.value = 0;
    }
  }

  /**
   * Open file selector and upload selected image
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Selected and uploaded attachment
   */
  async function selectAndUploadImage(options = {}) {
    return new Promise((resolve, reject) => {
      // Create hidden file input
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = options.accept || 'image/*';
      input.multiple = options.multiple || false;

      input.onchange = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) {
          reject(new Error('No file selected'));
          return;
        }

        try {
          if (options.multiple) {
            const uploads = await Promise.all(
              Array.from(files).map(file => uploadFile(file))
            );
            resolve(uploads);
          } else {
            const result = await uploadFile(files[0]);
            resolve(result);
          }
        } catch (error) {
          reject(error);
        }
      };

      // Trigger file selection
      input.click();
    });
  }

  /**
   * Select from existing media (requires custom UI)
   * This would open a Vue modal with media library grid
   */
  async function selectFromLibrary() {
    // Fetch existing media
    const response = await fetch('/wp-json/wp/v2/media?per_page=100', {
      headers: {
        'X-WP-Nonce': window.gmkbData?.restNonce || ''
      }
    });

    if (!response.ok) {
      throw new Error('Failed to fetch media library');
    }

    const media = await response.json();
    
    // You would implement a Vue modal here to display the media
    // and allow selection, returning the selected item(s)
    console.log('Available media:', media);
    
    // For now, just return the media list
    return media.map(item => ({
      id: item.id,
      url: item.source_url,
      alt: item.alt_text || '',
      title: item.title?.rendered || '',
      thumbnail: item.media_details?.sizes?.thumbnail?.source_url || item.source_url
    }));
  }

  return {
    isUploading,
    uploadProgress,
    error,
    uploadFile,
    selectAndUploadImage,
    selectFromLibrary
  };
}
