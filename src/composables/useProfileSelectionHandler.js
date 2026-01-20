/**
 * useProfileSelectionHandler - Composable for handling profile selection events
 *
 * Centralizes the logic for handling profile-selected and profile-cleared events
 * from ProfileSelector component across all generator tools.
 *
 * @package GMKB
 * @subpackage Composables
 * @version 1.0.0
 * @since 2.4.0
 */

import { toRef, isRef } from 'vue';

/**
 * Creates handlers for profile selection events
 *
 * @param {Object} options Configuration options
 * @param {Ref} options.profileIdRef - Reactive ref to store the selected profile ID
 * @param {Function} options.onDataLoaded - Callback when profile data is loaded (receives data)
 * @param {Function} options.onCleared - Optional callback when profile is cleared
 * @param {Ref|String} options.mode - The current mode ('default' or 'integrated')
 * @returns {Object} Event handlers for ProfileSelector
 *
 * @example
 * const { handleProfileSelected, handleProfileCleared } = useProfileSelectionHandler({
 *   profileIdRef: selectedProfileId,
 *   onDataLoaded: populateFromProfile,
 *   onCleared: clearFormFields,
 *   mode: toRef(props, 'mode'),
 * });
 */
export function useProfileSelectionHandler({
  profileIdRef,
  onDataLoaded,
  onCleared,
  mode
}) {
  // Ensure mode is a ref
  const modeRef = isRef(mode) ? mode : toRef({ value: mode }, 'value');

  /**
   * Handle profile selected from ProfileSelector
   * Sets the profile ID and calls the data loaded callback
   *
   * @param {Object} event - The profile-selected event
   * @param {number} event.id - The selected profile ID
   * @param {Object} event.data - The profile data
   */
  function handleProfileSelected({ id, data }) {
    console.log('[useProfileSelectionHandler] handleProfileSelected called:', {
      id,
      hasData: !!data,
      dataKeys: data ? Object.keys(data).length : 0,
      mode: modeRef.value,
      hasOnDataLoaded: !!onDataLoaded
    });

    if (modeRef.value === 'default') {
      // Set the profile ID in the composable instance so saves work correctly
      if (id) {
        profileIdRef.value = id;
      }
      if (data && onDataLoaded) {
        console.log('[useProfileSelectionHandler] Calling onDataLoaded with profile data');
        onDataLoaded(data);
      }
    } else {
      console.log('[useProfileSelectionHandler] Mode is not default, skipping data load');
    }
  }

  /**
   * Handle profile cleared from ProfileSelector
   * Clears the profile ID and calls the cleared callback
   */
  function handleProfileCleared() {
    // Clear the profile ID so saves are disabled
    profileIdRef.value = null;
    if (onCleared) {
      onCleared();
    }
  }

  return {
    handleProfileSelected,
    handleProfileCleared,
  };
}

export default useProfileSelectionHandler;
