/**
 * WordPress Integration Composable
 * Provides clean interface for Vue components to interact with WordPress
 * Architecture-compliant: Event-driven, no polling, uses bridge API
 */

import { ref, onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '../stores/mediaKit';

export function useWordPressIntegration() {
  const store = useMediaKitStore();
  const bridgeReady = ref(false);
  const bridgeError = ref(null);
  
  /**
   * Initialize WordPress bridge connection
   */
  async function initializeBridge() {
    console.log('🔌 WordPress Integration: Initializing bridge...');
    
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        bridgeError.value = 'Bridge initialization timeout';
        reject(new Error('Bridge initialization timeout'));
      }, 10000);
      
      // Check if bridge already exists
      if (window.gmkbBridge && typeof window.gmkbBridge.initialize === 'function') {
        clearTimeout(timeout);
        bridgeReady.value = true;
        console.log('✅ WordPress Integration: Bridge already ready');
        resolve(window.gmkbBridge);
        return;
      }
      
      // Set up event listeners
      const handleBridgeReady = (event) => {
        clearTimeout(timeout);
        bridgeReady.value = true;
        bridgeError.value = null;
        console.log('✅ WordPress Integration: Bridge ready via event');
        resolve(event.detail?.bridge || window.gmkbBridge);
      };
      
      const handleBridgeFailed = (event) => {
        clearTimeout(timeout);
        const error = event.detail?.reason || 'Bridge initialization failed';
        bridgeError.value = error;
        bridgeReady.value = false;
        console.error('❌ WordPress Integration: Bridge failed', error);
        reject(new Error(error));
      };
      
      // Listen for bridge events
      document.addEventListener('gmkb:bridge:ready', handleBridgeReady, { once: true });
      document.addEventListener('gmkb:bridge:failed', handleBridgeFailed, { once: true });
    });
  }
  
  /**
   * Load component definitions from WordPress
   */
  async function loadComponents() {
    if (!bridgeReady.value) {
      throw new Error('Bridge not ready');
    }
    
    try {
      console.log('📦 WordPress Integration: Loading components...');
      const components = await window.gmkbBridge.getComponents();
      console.log('✅ WordPress Integration: Loaded', components.length, 'components');
      return components;
    } catch (error) {
      console.error('❌ WordPress Integration: Failed to load components', error);
      throw error;
    }
  }
  
  /**
   * Load themes from WordPress
   */
  async function loadThemes() {
    if (!bridgeReady.value) {
      throw new Error('Bridge not ready');
    }
    
    try {
      console.log('🎨 WordPress Integration: Loading themes...');
      const themes = await window.gmkbBridge.getThemes();
      console.log('✅ WordPress Integration: Loaded', themes.length, 'themes');
      return themes;
    } catch (error) {
      console.error('❌ WordPress Integration: Failed to load themes', error);
      throw error;
    }
  }
  
  /**
   * Load Pods data for current post
   */
  async function loadPodsData() {
    if (!bridgeReady.value) {
      throw new Error('Bridge not ready');
    }
    
    try {
      console.log('📊 WordPress Integration: Loading Pods data...');
      const data = await window.gmkbBridge.getPodsData();
      console.log('✅ WordPress Integration: Loaded Pods data');
      return data;
    } catch (error) {
      console.error('❌ WordPress Integration: Failed to load Pods data', error);
      throw error;
    }
  }
  
  /**
   * Save media kit state
   */
  async function saveMediaKit(state) {
    if (!bridgeReady.value) {
      throw new Error('Bridge not ready');
    }
    
    try {
      console.log('💾 WordPress Integration: Saving media kit...');
      const result = await window.gmkbBridge.saveMediaKit(state);
      console.log('✅ WordPress Integration: Save successful');
      return result;
    } catch (error) {
      console.error('❌ WordPress Integration: Save failed', error);
      throw error;
    }
  }
  
  /**
   * Update single component
   */
  async function updateComponent(componentId, data) {
    if (!bridgeReady.value) {
      throw new Error('Bridge not ready');
    }
    
    try {
      console.log('📝 WordPress Integration: Updating component', componentId);
      const result = await window.gmkbBridge.updateComponent(componentId, data);
      console.log('✅ WordPress Integration: Component updated');
      return result;
    } catch (error) {
      console.error('❌ WordPress Integration: Update failed', error);
      throw error;
    }
  }
  
  /**
   * Delete component
   */
  async function deleteComponent(componentId) {
    if (!bridgeReady.value) {
      throw new Error('Bridge not ready');
    }
    
    try {
      console.log('🗑️ WordPress Integration: Deleting component', componentId);
      const result = await window.gmkbBridge.deleteComponent(componentId);
      console.log('✅ WordPress Integration: Component deleted');
      return result;
    } catch (error) {
      console.error('❌ WordPress Integration: Delete failed', error);
      throw error;
    }
  }
  
  /**
   * Auto-save functionality
   */
  const autoSaveInterval = ref(null);
  const autoSaveEnabled = ref(true);
  const lastAutoSave = ref(null);
  
  function startAutoSave(intervalMs = 60000) {
    if (!autoSaveEnabled.value) return;
    
    stopAutoSave();
    
    console.log('⏰ WordPress Integration: Starting auto-save every', intervalMs / 1000, 'seconds');
    
    autoSaveInterval.value = setInterval(async () => {
      if (store.isDirty && bridgeReady.value) {
        try {
          console.log('💾 WordPress Integration: Auto-saving...');
          await store.save();
          lastAutoSave.value = new Date();
          console.log('✅ WordPress Integration: Auto-save complete');
        } catch (error) {
          console.error('❌ WordPress Integration: Auto-save failed', error);
        }
      }
    }, intervalMs);
  }
  
  function stopAutoSave() {
    if (autoSaveInterval.value) {
      clearInterval(autoSaveInterval.value);
      autoSaveInterval.value = null;
      console.log('⏸️ WordPress Integration: Auto-save stopped');
    }
  }
  
  /**
   * Handle page unload - prompt if unsaved changes
   */
  function handleBeforeUnload(event) {
    if (store.isDirty) {
      event.preventDefault();
      event.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
      return event.returnValue;
    }
  }
  
  // Set up lifecycle hooks
  onMounted(() => {
    window.addEventListener('beforeunload', handleBeforeUnload);
  });
  
  onUnmounted(() => {
    window.removeEventListener('beforeunload', handleBeforeUnload);
    stopAutoSave();
  });
  
  return {
    // State
    bridgeReady,
    bridgeError,
    autoSaveEnabled,
    lastAutoSave,
    
    // Methods
    initializeBridge,
    loadComponents,
    loadThemes,
    loadPodsData,
    saveMediaKit,
    updateComponent,
    deleteComponent,
    startAutoSave,
    stopAutoSave
  };
}
