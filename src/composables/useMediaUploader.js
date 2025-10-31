/**
 * WordPress Media Uploader Composable
 * 
 * Provides WordPress media library integration for Vue components.
 * This composable wraps the WordPress wp.media API to enable:
 * - Opening the WordPress media library modal
 * - Selecting or uploading images
 * - Returning attachment data (ID, URL, metadata)
 * 
 * Usage:
 * const { openMediaLibrary, isUploading } = useMediaUploader();
 * 
 * const handleUpload = async () => {
 *   const attachment = await openMediaLibrary({
 *     title: 'Select Image',
 *     buttonText: 'Use This Image',
 *     multiple: false,
 *     library: { type: 'image' }
 *   });
 *   console.log(attachment); // { id, url, alt, title, ... }
 * };
 */

import { ref } from 'vue';

/**
 * Check if WordPress media API is available
 */
function isWordPressMediaAvailable() {
  return typeof window !== 'undefined' && 
         window.wp && 
         window.wp.media;
}

/**
 * Open WordPress media library and return selected attachment
 * 
 * @param {Object} options - Media library options
 * @param {string} options.title - Modal title
 * @param {string} options.buttonText - Select button text
 * @param {boolean} options.multiple - Allow multiple selection
 * @param {Object} options.library - Library filter options
 * @returns {Promise<Object|Array>} Selected attachment(s)
 */
function openWordPressMedia(options = {}) {
  return new Promise((resolve, reject) => {
    if (!isWordPressMediaAvailable()) {
      reject(new Error('WordPress media API is not available'));
      return;
    }

    const defaults = {
      title: 'Select or Upload Media',
      buttonText: 'Use this media',
      multiple: false,
      library: { type: 'image' }
    };

    const settings = { ...defaults, ...options };

    // Create media frame
    const frame = window.wp.media({
      title: settings.title,
      button: {
        text: settings.buttonText
      },
      multiple: settings.multiple,
      library: settings.library
    });

    // When an image is selected
    frame.on('select', () => {
      try {
        const selection = frame.state().get('selection');
        
        if (settings.multiple) {
          // Return array of attachments for multiple selection
          const attachments = selection.map(attachment => {
            const data = attachment.toJSON();
            return formatAttachment(data);
          });
          resolve(attachments);
        } else {
          // Return single attachment
          const attachment = selection.first().toJSON();
          resolve(formatAttachment(attachment));
        }
      } catch (error) {
        reject(error);
      }
    });

    // Handle close without selection
    frame.on('close', () => {
      // Check if anything was selected
      const selection = frame.state().get('selection');
      if (!selection || selection.length === 0) {
        reject(new Error('No media selected'));
      }
    });

    // Open the modal
    frame.open();
  });
}

/**
 * Format WordPress attachment data for consistent usage
 * 
 * @param {Object} attachment - Raw WordPress attachment object
 * @returns {Object} Formatted attachment data
 */
function formatAttachment(attachment) {
  return {
    id: attachment.id || null,
    url: attachment.url || attachment.guid || '',
    alt: attachment.alt || attachment.title || '',
    title: attachment.title || '',
    caption: attachment.caption || '',
    description: attachment.description || '',
    filename: attachment.filename || '',
    mime: attachment.mime || attachment.type || '',
    width: attachment.width || null,
    height: attachment.height || null,
    sizes: attachment.sizes || {},
    // Include full raw data for advanced usage
    raw: attachment
  };
}

/**
 * Main composable function
 */
export function useMediaUploader() {
  const isUploading = ref(false);
  const error = ref(null);

  /**
   * Open media library and get selected media
   * 
   * @param {Object} options - Media library options
   * @returns {Promise<Object|Array>} Selected attachment(s)
   */
  const openMediaLibrary = async (options = {}) => {
    isUploading.value = true;
    error.value = null;

    try {
      const result = await openWordPressMedia(options);
      isUploading.value = false;
      return result;
    } catch (err) {
      error.value = err.message || 'Failed to upload media';
      isUploading.value = false;
      
      // Only throw if it's not a user cancellation
      if (err.message !== 'No media selected') {
        console.error('Media upload error:', err);
        throw err;
      }
      
      return null;
    }
  };

  /**
   * Open media library for single image selection
   * 
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Selected image attachment
   */
  const selectImage = async (options = {}) => {
    return await openMediaLibrary({
      title: 'Select Image',
      buttonText: 'Use This Image',
      multiple: false,
      library: { type: 'image' },
      ...options
    });
  };

  /**
   * Open media library for multiple image selection
   * 
   * @param {Object} options - Additional options
   * @returns {Promise<Array>} Selected image attachments
   */
  const selectImages = async (options = {}) => {
    return await openMediaLibrary({
      title: 'Select Images',
      buttonText: 'Use These Images',
      multiple: true,
      library: { type: 'image' },
      ...options
    });
  };

  /**
   * Open media library for logo selection (optimized settings)
   * 
   * @param {Object} options - Additional options
   * @returns {Promise<Object>} Selected logo attachment
   */
  const selectLogo = async (options = {}) => {
    return await openMediaLibrary({
      title: 'Select Logo',
      buttonText: 'Use This Logo',
      multiple: false,
      library: { 
        type: 'image',
        // Prefer SVG and PNG for logos
        uploadedTo: null
      },
      ...options
    });
  };

  /**
   * Check if media API is available
   * 
   * @returns {boolean} True if WordPress media API is available
   */
  const isAvailable = () => isWordPressMediaAvailable();

  return {
    // State
    isUploading,
    error,
    
    // Methods
    openMediaLibrary,
    selectImage,
    selectImages,
    selectLogo,
    isAvailable
  };
}
