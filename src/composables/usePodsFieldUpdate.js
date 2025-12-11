/**
 * DEPRECATED: usePodsFieldUpdate Composable
 *
 * @deprecated Since 2.2.0 - Pods field updates are deprecated for Media Kit Builder.
 *
 * WARNING: This composable still WORKS but should NOT be used in new code.
 * The Media Kit Builder now uses JSON state as the single source of truth.
 *
 * WHEN TO USE THIS:
 * - Profile Editor (editing profile fields directly via Profile API)
 * - Admin screens that need to update native WordPress meta fields
 *
 * WHEN NOT TO USE THIS:
 * - Media Kit Builder components (use component.data from JSON state instead)
 * - AI tools saving to builder (save to JSON state)
 *
 * BACKGROUND:
 * The circular sync between JSON state and Pods fields caused data loss:
 * - The "Write Arc" (component-field-sync.php) was broken due to action hook typo
 * - The "Read Arc" (Vue enrichment) overwrote valid JSON with stale Pods data
 *
 * @see src/stores/mediaKit.js - Component data from JSON state
 * @see includes/api/v2/class-gmkb-profile-api.php - Profile field CRUD (use this instead)
 *
 * @version 3.0.0 (deprecated)
 */

import { ref } from 'vue';
import { useMediaKitStore } from '../stores/mediaKit';

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
   * ROOT FIX: System is always ready at this point - no need to wait
   * The composable is only used after full application initialization
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
      // ROOT FIX: No system wait needed - we're already initialized
      // This composable only runs after full app initialization
      // Removed: await systemReadiness.waitForSystem('core');
      
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

      // ROOT FIX: Check that gmkbData exists
      if (!window.gmkbData || !window.gmkbData.apiSettings) {
        throw new Error('System not initialized - gmkbData not available');
      }
      
      const { apiUrl, nonce } = window.gmkbData.apiSettings;
      
      if (!apiUrl || !nonce) {
        throw new Error('API settings incomplete - missing apiUrl or nonce');
      }
      
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
