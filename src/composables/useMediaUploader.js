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
 * ROOT FIX v4: Enhanced error messaging and retry mechanism
 */
function isWordPressMediaAvailable() {
  const available = typeof window !== 'undefined' && 
         window.wp && 
         window.wp.media &&
         typeof window.wp.media === 'function';
  
  if (!available && typeof console !== 'undefined') {
    // ROOT FIX v4: More detailed debugging
    console.warn('⚠️ WordPress Media Library check:', {
      'window': typeof window !== 'undefined',
      'wp': typeof window !== 'undefined' && window.wp ? 'exists' : 'missing',
      'wp.media': typeof window !== 'undefined' && window.wp && window.wp.media ? 'exists' : 'missing',
      'wp.media type': typeof window !== 'undefined' && window.wp && window.wp.media ? typeof window.wp.media : 'N/A'
    });
    
    // Check for specific missing components
    if (typeof window !== 'undefined' && window.wp && !window.wp.media) {
      console.error(
        '❌ WordPress Media Library not initialized. ' +
        'The scripts are loaded but wp.media is not available. ' +
        'This usually means the media templates were not printed. ' +
        'Checking for missing dependencies...'
      );
      
      // Check for critical dependencies
      const deps = {
        'jQuery': typeof window.jQuery !== 'undefined',
        'Backbone': typeof window.Backbone !== 'undefined',
        'Underscore': typeof window._ !== 'undefined',
        '_wpPluploadSettings': typeof window._wpPluploadSettings !== 'undefined'
      };
      
      console.log('Media Library Dependencies:', deps);
      
      const missing = Object.entries(deps).filter(([key, value]) => !value).map(([key]) => key);
      if (missing.length > 0) {
        console.error('Missing dependencies:', missing.join(', '));
      }
    }
  }
  
  return available;
}

/**
 * Wait for WordPress media to be available
 * ROOT FIX v4: Retry mechanism for race conditions
 */
function waitForWordPressMedia(maxRetries = 10, retryDelay = 500) {
  return new Promise((resolve, reject) => {
    let retries = 0;
    
    const checkMedia = () => {
      if (isWordPressMediaAvailable()) {
        if (retries > 0) {
          console.log(`✅ WordPress Media Library ready after ${retries} retries`);
        }
        resolve(true);
      } else if (retries >= maxRetries) {
        reject(new Error('WordPress Media Library failed to initialize after ' + maxRetries + ' attempts'));
      } else {
        retries++;
        if (retries === 1) {
          console.log('⏳ Waiting for WordPress Media Library to initialize...');
        }
        setTimeout(checkMedia, retryDelay);
      }
    };
    
    checkMedia();
  });
}

/**
 * Open WordPress media library and return selected attachment
 * 
 * ROOT FIX v4: Added retry mechanism for race conditions
 * 
 * @param {Object} options - Media library options
 * @param {string} options.title - Modal title
 * @param {string} options.buttonText - Select button text
 * @param {boolean} options.multiple - Allow multiple selection
 * @param {Object} options.library - Library filter options
 * @returns {Promise<Object|Array>} Selected attachment(s)
 */
async function openWordPressMedia(options = {}) {
  // ROOT FIX v4: Wait for media library to be available
  try {
    await waitForWordPressMedia();
  } catch (error) {
    console.error('Failed to initialize media library:', error);
    throw new Error('WordPress media API is not available');
  }

  return new Promise((resolve, reject) => {
    const defaults = {
      title: 'Select or Upload Media',
      buttonText: 'Use this media',
      multiple: false,
      library: { type: 'image' }
    };

    const settings = { ...defaults, ...options };

    // ROOT FIX v4: Add try-catch for frame creation
    let frame;
    try {
      // Create media frame
      frame = window.wp.media({
        title: settings.title,
        button: {
          text: settings.buttonText
        },
        multiple: settings.multiple,
        library: settings.library
      });
    } catch (error) {
      console.error('Failed to create media frame:', error);
      reject(new Error('Failed to create media upload dialog. Please refresh and try again.'));
      return;
    }

    // Track if selection was made
    let selectionMade = false;

    // When an image is selected
    frame.on('select', () => {
      try {
        selectionMade = true;
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
      // Only reject if no selection was made
      if (!selectionMade) {
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
