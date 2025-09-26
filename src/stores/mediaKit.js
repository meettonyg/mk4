/**
 * Media Kit Store - Pinia
 * Architecture-compliant: Single source of truth for Vue application
 * Event-driven communication with WordPress backend via bridge
 */

import { defineStore } from 'pinia';
import { ref, computed } from 'vue';

export const useMediaKitStore = defineStore('mediaKit', () => {
  // ==========================================
  // STATE
  // ==========================================
  
  // Loading & Error States
  const isLoading = ref(true);
  const hasError = ref(false);
  const errorMessage = ref('');
  
  // Core Data
  const savedState = ref(null);
  const components = ref([]);
  const themes = ref([]);
  const podsData = ref({});
  
  // Current Working State
  const currentComponents = ref({});
  const currentSections = ref([]);
  const currentLayout = ref([]);
  const globalSettings = ref({
    theme: 'modern',
    customTheme: null
  });
  
  // Metadata
  const postId = ref(0);
  const lastSaved = ref(null);
  const isDirty = ref(false);
  
  // ==========================================
  // GETTERS
  // ==========================================
  
  const hasContent = computed(() => {
    return Object.keys(currentComponents.value).length > 0 || 
           currentSections.value.length > 0;
  });
  
  const shouldShowEmptyState = computed(() => {
    return !isLoading.value && !hasError.value && !hasContent.value;
  });
  
  const componentCount = computed(() => {
    return Object.keys(currentComponents.value).length;
  });
  
  const availableComponents = computed(() => {
    // Transform component definitions for UI
    return components.value.map(comp => ({
      ...comp,
      id: comp.type,
      label: comp.title || comp.name,
      category: comp.category || 'general',
      icon: comp.icon || 'component'
    }));
  });
  
  const activeTheme = computed(() => {
    return themes.value.find(t => t.slug === globalSettings.value.theme) || themes.value[0];
  });
  
  // ==========================================
  // ACTIONS
  // ==========================================
  
  /**
   * Initialize store by loading data from WordPress
   */
  async function initialize() {
    console.log('🚀 MediaKit Store: Initializing...');
    isLoading.value = true;
    hasError.value = false;
    errorMessage.value = '';
    
    try {
      // Wait for bridge to be ready
      await waitForBridge();
      
      // Load initial state from WordPress
      const data = await window.gmkbBridge.getInitialState();
      
      console.log('📦 MediaKit Store: Received data from WordPress', data);
      
      // Set post ID
      postId.value = data.postId || window.gmkbData?.postId || 0;
      
      // Set saved state or defaults
      if (data.savedState && typeof data.savedState === 'object') {
        savedState.value = data.savedState;
        
        // Apply saved state to current working state
        currentComponents.value = data.savedState.components || {};
        currentSections.value = data.savedState.sections || [];
        currentLayout.value = data.savedState.layout || [];
        globalSettings.value = data.savedState.globalSettings || globalSettings.value;
        
        console.log('✅ MediaKit Store: Loaded saved state with', Object.keys(currentComponents.value).length, 'components');
      } else {
        // Initialize with empty state
        savedState.value = getDefaultState();
        currentComponents.value = {};
        currentSections.value = [];
        currentLayout.value = [];
        
        console.log('📝 MediaKit Store: Initialized with empty state');
      }
      
      // Set component definitions
      components.value = data.components || [];
      
      // Set themes
      themes.value = data.themes || [];
      
      // Set Pods data
      podsData.value = data.podsData || {};
      
      // Set last saved time
      lastSaved.value = data.timestamp || null;
      
      // Reset dirty flag
      isDirty.value = false;
      
      console.log('✅ MediaKit Store: Initialization complete');
      
    } catch (error) {
      console.error('❌ MediaKit Store: Initialization failed', error);
      hasError.value = true;
      errorMessage.value = error.message || 'Failed to load media kit data';
      
      // Set default state on error
      savedState.value = getDefaultState();
      currentComponents.value = {};
      currentSections.value = [];
      currentLayout.value = [];
      
    } finally {
      isLoading.value = false;
    }
  }
  
  /**
   * Save current state to WordPress
   */
  async function save() {
    console.log('💾 MediaKit Store: Saving...');
    
    try {
      const stateToSave = {
        components: currentComponents.value,
        sections: currentSections.value,
        layout: currentLayout.value,
        globalSettings: globalSettings.value,
        version: '2.0.0'
      };
      
      const result = await window.gmkbBridge.saveMediaKit(stateToSave);
      
      console.log('✅ MediaKit Store: Save successful', result);
      
      // Update saved state
      savedState.value = stateToSave;
      lastSaved.value = new Date();
      isDirty.value = false;
      
      return result;
      
    } catch (error) {
      console.error('❌ MediaKit Store: Save failed', error);
      throw error;
    }
  }
  
  /**
   * Add a new component
   */
  function addComponent(componentType, props = {}) {
    const componentId = `${componentType}_${Date.now()}`;
    
    const newComponent = {
      id: componentId,
      type: componentType,
      props: props,
      ...getComponentDefaults(componentType)
    };
    
    currentComponents.value[componentId] = newComponent;
    currentLayout.value.push(componentId);
    isDirty.value = true;
    
    console.log('➕ MediaKit Store: Added component', componentId);
    
    return componentId;
  }
  
  /**
   * Update component props
   */
  function updateComponent(componentId, updates) {
    if (currentComponents.value[componentId]) {
      currentComponents.value[componentId] = {
        ...currentComponents.value[componentId],
        ...updates
      };
      isDirty.value = true;
      
      console.log('📝 MediaKit Store: Updated component', componentId);
    }
  }
  
  /**
   * Remove a component
   */
  function removeComponent(componentId) {
    if (currentComponents.value[componentId]) {
      delete currentComponents.value[componentId];
      
      // Remove from layout
      const layoutIndex = currentLayout.value.indexOf(componentId);
      if (layoutIndex > -1) {
        currentLayout.value.splice(layoutIndex, 1);
      }
      
      // Remove from sections
      currentSections.value.forEach(section => {
        if (section.components) {
          const sectionIndex = section.components.indexOf(componentId);
          if (sectionIndex > -1) {
            section.components.splice(sectionIndex, 1);
          }
        }
      });
      
      isDirty.value = true;
      
      console.log('🗑️ MediaKit Store: Removed component', componentId);
    }
  }
  
  /**
   * Add a new section
   */
  function addSection(type = 'full', components = []) {
    const newSection = {
      id: `section_${Date.now()}`,
      type: type,
      layout: type,
      components: components
    };
    
    currentSections.value.push(newSection);
    isDirty.value = true;
    
    console.log('➕ MediaKit Store: Added section', newSection.id);
    
    return newSection.id;
  }
  
  /**
   * Update theme
   */
  function updateTheme(themeName) {
    globalSettings.value.theme = themeName;
    isDirty.value = true;
    
    console.log('🎨 MediaKit Store: Changed theme to', themeName);
  }
  
  /**
   * Reset to saved state
   */
  function resetToSaved() {
    if (savedState.value) {
      currentComponents.value = { ...savedState.value.components };
      currentSections.value = [...savedState.value.sections];
      currentLayout.value = [...savedState.value.layout];
      globalSettings.value = { ...savedState.value.globalSettings };
      isDirty.value = false;
      
      console.log('🔄 MediaKit Store: Reset to saved state');
    }
  }
  
  // ==========================================
  // HELPER FUNCTIONS
  // ==========================================
  
  function getDefaultState() {
    return {
      components: {},
      sections: [],
      layout: [],
      globalSettings: {
        theme: 'modern',
        customTheme: null
      },
      version: '2.0.0'
    };
  }
  
  function getComponentDefaults(type) {
    const componentDef = components.value.find(c => c.type === type);
    return {
      name: componentDef?.name || type,
      title: componentDef?.title || type,
      category: componentDef?.category || 'general'
    };
  }
  
  async function waitForBridge() {
    return new Promise((resolve, reject) => {
      const timeout = setTimeout(() => {
        reject(new Error('Bridge initialization timeout'));
      }, 10000);
      
      // Check if bridge already exists
      if (window.gmkbBridge && window.gmkbBridge.initialize) {
        clearTimeout(timeout);
        resolve();
        return;
      }
      
      // Wait for bridge ready event
      document.addEventListener('gmkb:bridge:ready', () => {
        clearTimeout(timeout);
        resolve();
      }, { once: true });
      
      // Wait for bridge failed event
      document.addEventListener('gmkb:bridge:failed', (event) => {
        clearTimeout(timeout);
        reject(new Error(event.detail?.reason || 'Bridge initialization failed'));
      }, { once: true });
    });
  }
  
  // ==========================================
  // RETURN PUBLIC API
  // ==========================================
  
  return {
    // State
    isLoading,
    hasError,
    errorMessage,
    savedState,
    components,
    themes,
    podsData,
    currentComponents,
    currentSections,
    currentLayout,
    globalSettings,
    postId,
    lastSaved,
    isDirty,
    
    // Getters
    hasContent,
    shouldShowEmptyState,
    componentCount,
    availableComponents,
    activeTheme,
    
    // Actions
    initialize,
    save,
    addComponent,
    updateComponent,
    removeComponent,
    addSection,
    updateTheme,
    resetToSaved
  };
});
