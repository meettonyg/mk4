/**
 * Modern Media Upload Composable
 * 
 * jQuery-free media upload using WordPress REST API
 * Provides drag-and-drop, multiple file uploads, and progress tracking
 * 
 * @version 1.0.0
 */

import { ref, computed } from 'vue';

export function useMediaUpload() {
  const uploading = ref(false);
  const uploadProgress = ref(0);
  const uploadError = ref(null);
  const uploadedFiles = ref([]);

  /**
   * Upload files to WordPress media library via REST API
   * 
   * @param {FileList|File[]} files - Files to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Array>} Uploaded media objects
   */
  async function uploadFiles(files, options = {}) {
    const {
      multiple = true,
      allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'],
      maxSize = 10 * 1024 * 1024, // 10MB default
      onProgress = null
    } = options;

    // Reset state
    uploading.value = true;
    uploadProgress.value = 0;
    uploadError.value = null;
    uploadedFiles.value = [];

    // Convert FileList to Array
    const fileArray = Array.from(files);

    // Validate files
    const validFiles = [];
    for (const file of fileArray) {
      // Check file type
      if (!allowedTypes.includes(file.type)) {
        uploadError.value = `Invalid file type: ${file.name}. Allowed: ${allowedTypes.join(', ')}`;
        uploading.value = false;
        throw new Error(uploadError.value);
      }

      // Check file size
      if (file.size > maxSize) {
        uploadError.value = `File too large: ${file.name}. Max size: ${Math.round(maxSize / 1024 / 1024)}MB`;
        uploading.value = false;
        throw new Error(uploadError.value);
      }

      validFiles.push(file);

      // If not multiple, only take first file
      if (!multiple) break;
    }

    console.log(`📤 Uploading ${validFiles.length} file(s)...`);

    // Upload files
    const results = [];
    for (let i = 0; i < validFiles.length; i++) {
      const file = validFiles[i];
      
      try {
        const result = await uploadSingleFile(file, {
          onProgress: (percent) => {
            // Calculate overall progress
            const fileProgress = (i / validFiles.length) + (percent / 100 / validFiles.length);
            uploadProgress.value = Math.round(fileProgress * 100);
            
            if (onProgress) {
              onProgress(uploadProgress.value, i, validFiles.length);
            }
          }
        });

        results.push(result);
        uploadedFiles.value.push(result);
      } catch (error) {
        console.error(`Failed to upload ${file.name}:`, error);
        uploadError.value = `Failed to upload ${file.name}: ${error.message}`;
        // Continue with other files
      }
    }

    uploading.value = false;
    uploadProgress.value = 100;

    console.log(`✅ Uploaded ${results.length}/${validFiles.length} file(s) successfully`);

    return results;
  }

  /**
   * Upload a single file to WordPress
   * 
   * @param {File} file - File to upload
   * @param {Object} options - Upload options
   * @returns {Promise<Object>} Uploaded media object
   */
  async function uploadSingleFile(file, options = {}) {
    const { onProgress = null } = options;

    // Create FormData
    const formData = new FormData();
    formData.append('file', file);

    // Get WordPress REST API nonce
    const nonce = window.gmkbData?.restNonce || wp.apiSettings?.nonce;
    if (!nonce) {
      throw new Error('WordPress REST API nonce not available');
    }

    // Upload via WordPress REST API
    const response = await fetch('/wp-json/wp/v2/media', {
      method: 'POST',
      headers: {
        'X-WP-Nonce': nonce
      },
      body: formData
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Upload failed');
    }

    const media = await response.json();

    console.log(`✅ Uploaded: ${file.name} → ${media.id}`);

    // Return normalized media object
    return {
      id: media.id,
      url: media.source_url,
      thumbnail: media.media_details?.sizes?.thumbnail?.source_url || media.source_url,
      medium: media.media_details?.sizes?.medium?.source_url || media.source_url,
      large: media.media_details?.sizes?.large?.source_url || media.source_url,
      full: media.source_url,
      title: media.title?.rendered || file.name,
      alt: media.alt_text || '',
      caption: media.caption?.rendered || '',
      description: media.description?.rendered || '',
      filename: file.name,
      filesize: file.size,
      mime_type: media.mime_type,
      width: media.media_details?.width,
      height: media.media_details?.height,
      uploaded: new Date().toISOString()
    };
  }

  /**
   * Open native file picker
   * 
   * @param {Object} options - Picker options
   * @returns {Promise<Array>} Selected and uploaded files
   */
  async function openFilePicker(options = {}) {
    const {
      multiple = true,
      accept = 'image/*'
    } = options;

    return new Promise((resolve, reject) => {
      // Create hidden file input
      const input = document.createElement('input');
      input.type = 'file';
      input.multiple = multiple;
      input.accept = accept;
      input.style.display = 'none';

      // Handle file selection
      input.addEventListener('change', async (e) => {
        const files = e.target.files;
        if (files && files.length > 0) {
          try {
            const uploaded = await uploadFiles(files, options);
            resolve(uploaded);
          } catch (error) {
            reject(error);
          }
        } else {
          resolve([]);
        }

        // Cleanup
        document.body.removeChild(input);
      });

      // Handle cancel
      input.addEventListener('cancel', () => {
        resolve([]);
        document.body.removeChild(input);
      });

      // Trigger file picker
      document.body.appendChild(input);
      input.click();
    });
  }

  /**
   * Delete a media file from WordPress
   * 
   * @param {number} mediaId - Media ID to delete
   * @returns {Promise<boolean>} Success status
   */
  async function deleteMedia(mediaId) {
    const nonce = window.gmkbData?.restNonce || wp.apiSettings?.nonce;
    if (!nonce) {
      throw new Error('WordPress REST API nonce not available');
    }

    const response = await fetch(`/wp-json/wp/v2/media/${mediaId}?force=true`, {
      method: 'DELETE',
      headers: {
        'X-WP-Nonce': nonce
      }
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Delete failed');
    }

    console.log(`🗑️ Deleted media: ${mediaId}`);
    return true;
  }

  return {
    // State
    uploading: computed(() => uploading.value),
    uploadProgress: computed(() => uploadProgress.value),
    uploadError: computed(() => uploadError.value),
    uploadedFiles: computed(() => uploadedFiles.value),

    // Methods
    uploadFiles,
    uploadSingleFile,
    openFilePicker,
    deleteMedia
  };
}
