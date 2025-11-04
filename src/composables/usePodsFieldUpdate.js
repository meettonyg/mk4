/**
 * usePodsFieldUpdate Composable
 * 
 * Provides functionality to update individual Pods fields via REST API.
 * Used by components that need to save data directly to Pods custom fields.
 * 
 * ARCHITECTURE: 
 * - Event-driven (no polling)
 * - Promise-based async operations  
 * - Automatic store synchronization
 * - Comprehensive error handling
 * - Debug logging support
 * 
 * ROOT FIX: Ensure system is ready before making API calls
 * Uses SystemReadiness service to guarantee gmkbData is initialized
 * No defensive coding - we KNOW the data exists when we use it
 * 
 * @version 3.0.0
 * @since Profile Photo Upload Implementation
 */

import { ref } from 'vue';
import { useMediaKitStore } from '../stores/mediaKit';
import systemReadiness from '../services/SystemReadiness';

/**
 * Composable for updating Pods fields
 * 
 * @returns {Object} Composable interface
 */
export function usePodsFieldUpdate() {
  const store = useMediaKitStore();
  const isUpdating = ref(false);
  const lastError = ref(null);

  /**
   * Update a single Pods field
   * 
   * ROOT FIX: Ensure system is ready before proceeding
   * This guarantees window.gmkbData and all its properties are initialized
   * 
   * @param {number} postId - The post ID
   * @param {string} fieldName - The Pods field name
   * @param {*} value - The field value
   * @returns {Promise<*>} The saved value
   */
  const updatePodsField = async (postId, fieldName, value) => {
    if (isUpdating.value) {
      throw new Error('Update already in progress');
    }

    isUpdating.value = true;
    lastError.value = null;

    try {
      // ROOT FIX: Wait for system to be ready before proceeding
      // This ensures window.gmkbData and apiSettings are fully initialized
      await systemReadiness.waitForSystem('core');
      
      if (window.gmkbDebug || window.gmkbData?.debugMode) {
        console.log('🔄 usePodsFieldUpdate: Starting field update', {
          postId,
          fieldName,
          valueType: typeof value,
          value: typeof value === 'object' ? JSON.stringify(value) : value
        });
      }

      // Validate inputs
      if (!postId || !fieldName) {
        throw new Error('Post ID and field name are required');
      }

      // ROOT FIX: Now we KNOW apiSettings exists because system is ready
      // No defensive coding needed - the data is guaranteed to be there
      const { apiUrl, nonce } = window.gmkbData.apiSettings;
      const endpoint = `${apiUrl}/pods/${postId}/field/${fieldName}`;
      
      if (window.gmkbDebug || window.gmkbData?.debugMode) {
        console.log('📡 usePodsFieldUpdate: Using endpoint', endpoint);
      }

      // Make the REST API call
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-WP-Nonce': nonce
        },
        credentials: 'same-origin',
        body: JSON.stringify({
          value: value
        })
      });

      if (window.gmkbDebug || window.gmkbData?.debugMode) {
        console.log('📨 usePodsFieldUpdate: Response received', {
          status: response.status,
          statusText: response.statusText,
          ok: response.ok
        });
      }

      // Handle HTTP errors
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        const errorMessage = errorData.message || `HTTP ${response.status}: ${response.statusText}`;
        
        if (window.gmkbDebug || window.gmkbData?.debugMode) {
          console.error('❌ usePodsFieldUpdate: HTTP error', {
            status: response.status,
            message: errorMessage,
            errorData
          });
        }
        
        throw new Error(errorMessage);
      }

      // Parse response
      const result = await response.json();

      if (window.gmkbDebug || window.gmkbData?.debugMode) {
        console.log('✅ usePodsFieldUpdate: Response parsed', {
          success: result.success,
          field: result.field,
          valueType: typeof result.value
        });
      }

      // Validate response
      if (!result.success) {
        throw new Error(result.message || 'API returned failure status');
      }

      // Update store with the saved value
      if (store.podsData && typeof store.podsData === 'object') {
        // Update the Pods data in the store
        store.podsData[fieldName] = result.value;
        
        if (window.gmkbDebug || window.gmkbData?.debugMode) {
          console.log('🏪 usePodsFieldUpdate: Store updated', {
            field: fieldName,
            storeValue: store.podsData[fieldName]
          });
        }
      }

      if (window.gmkbDebug || window.gmkbData?.debugMode) {
        console.log('✅ usePodsFieldUpdate: Field update complete', {
          field: fieldName,
          savedValue: result.value
        });
      }

      return result.value;

    } catch (error) {
      lastError.value = error.message;
      
      if (window.gmkbDebug || window.gmkbData?.debugMode) {
        console.error('❌ usePodsFieldUpdate: Field update failed', {
          error: error.message,
          stack: error.stack
        });
      }
      
      throw error;
    } finally {
      isUpdating.value = false;
    }
  };

  /**
   * Update multiple Pods fields in sequence
   * 
   * @param {number} postId - The post ID
   * @param {Object} fields - Object with field names as keys and values as values
   * @returns {Promise<Object>} Object with saved values
   */
  const updatePodsFields = async (postId, fields) => {
    if (!fields || typeof fields !== 'object') {
      throw new Error('Fields must be an object');
    }

    const results = {};
    const fieldNames = Object.keys(fields);

    if (window.gmkbDebug) {
      console.log('🔄 usePodsFieldUpdate: Starting batch update', {
        postId,
        fieldCount: fieldNames.length,
        fields: fieldNames
      });
    }

    for (const fieldName of fieldNames) {
      try {
        const savedValue = await updatePodsField(postId, fieldName, fields[fieldName]);
        results[fieldName] = savedValue;
      } catch (error) {
        if (window.gmkbDebug) {
          console.error(`❌ usePodsFieldUpdate: Failed to update field ${fieldName}:`, error.message);
        }
        // Continue with other fields even if one fails
        results[fieldName] = { error: error.message };
      }
    }

    if (window.gmkbDebug) {
      const successCount = Object.values(results).filter(v => !v.error).length;
      console.log('✅ usePodsFieldUpdate: Batch update complete', {
        total: fieldNames.length,
        successful: successCount,
        failed: fieldNames.length - successCount
      });
    }

    return results;
  };

  /**
   * Clear the last error
   */
  const clearError = () => {
    lastError.value = null;
  };

  // Return composable interface
  return {
    // State
    isUpdating,
    lastError,
    
    // Methods
    updatePodsField,
    updatePodsFields,
    clearError
  };
}
