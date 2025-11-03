import { defineStore } from 'pinia';
import UnifiedComponentRegistry from '../services/UnifiedComponentRegistry';
// GEMINI REFINEMENT #1: Direct store import for resetAll
import { useThemeStore } from './theme';
// ROOT FIX: Import UI store for proper state management coordination
import { useUIStore } from './ui';
import { debounce } from '../utils/debounce';
// ROOT FIX: Import StorageService for centralized localStorage access
import storageService from '../services/StorageService';
// P0 FIX #10: Removed EventBus import - using Pinia $subscribe instead
import systemReadiness from '../services/SystemReadiness.js';
import { deepClone, generateUniqueId, deepEqual } from '../utils/deepClone.js';
import { APIService } from '../services/APIService.js';
// PHASE 2: Component Schema imports
import { getDefaultSettings, getComponentDefaults, mergeWithDefaults } from '../utils/componentSchema.js';
import { validateComponent, sanitizeComponent } from '../utils/componentValidator.js';
// PHASE 4: Component Deprecation System
import deprecationManager from '../services/ComponentDeprecationManager.js';

export const useMediaKitStore = defineStore('mediaKit', {
  state: () => ({
    // Core data
    components: {},
    sections: [],
    theme: 'professional_clean',
    
    // ROOT FIX: Track initialization state to prevent duplicate loads
    isInitialized: false,
    isInitializing: false,
    themeCustomizations: {
      colors: {},
      typography: {},
      spacing: {},
      effects: {}
    },
    globalSettings: {},
    
    // CRITICAL: Pods data stored here, fetched ONCE on initialize
    podsData: {},
    
    // CRITICAL FIX: API Service instance
    apiService: null,
    
    // Meta state for error tracking and status
    isDirty: false,
    loadError: null,
    maxHistorySize: 30, // ROOT FIX: Reduced from 50 to 30 for better memory usage
    autoSaveEnabled: true, // ROOT FIX: Add auto-save toggle support
    
    // ROOT FIX: UI state moved to UIStore
    // All selection, hover, drag, and modal state now in src/stores/ui.js
    
    // Section selection for sidebar settings panel
    selectedSectionId: null,
    
    // Meta state
    lastSaved: null,
    // hasUnsavedChanges: false, // REMOVED: Duplicate of isDirty
    isSaving: false,
    isLoading: false, // Added for loading state
    // ROOT FIX: Initialize postTitle from gmkbData
    postTitle: window.gmkbData?.postTitle || window.gmkbData?.post?.title || '',
    
    // History (for undo/redo)
    history: [],
    historyIndex: -1,
    postId: (() => {
      // ROOT FIX: Get post ID from multiple sources, prioritizing mkcg_id
      const urlParams = new URLSearchParams(window.location.search);
      const mkcgId = urlParams.get('mkcg_id');
      if (mkcgId) return parseInt(mkcgId);
      
      if (window.gmkbData?.postId) return window.gmkbData.postId;
      if (window.gmkbData?.post_id) return window.gmkbData.post_id;
      if (window.gmkbData?.mkcg_id) return window.gmkbData.mkcg_id;
      
      const postIdFromUrl = urlParams.get('post_id');
      if (postIdFromUrl) return parseInt(postIdFromUrl);
      
      return null;
    })()
  }),

  getters: {
    // Get all components in render order
    orderedComponents: (state) => {
      const ordered = [];
      state.sections.forEach(section => {
        // Handle full-width sections
        if (section.components && Array.isArray(section.components)) {
          section.components.forEach(compRef => {
            const componentId = typeof compRef === 'string' ? compRef : compRef.component_id;
            const component = state.components[componentId];
            if (component) {
              ordered.push({
                ...component,
                sectionId: section.section_id
              });
            }
          });
        }
        // Handle multi-column sections
        if (section.columns) {
          // Process columns in order
          ['1', '2', '3'].forEach(col => {
            if (section.columns[col] && Array.isArray(section.columns[col])) {
              section.columns[col].forEach(componentId => {
                const component = state.components[componentId];
                if (component) {
                  ordered.push({
                    ...component,
                    sectionId: section.section_id,
                    column: parseInt(col)
                  });
                }
              });
            }
          });
        }
      });
      return ordered;
    },

    // Get components for a specific section
    getSectionComponents: (state) => (sectionId) => {
      const section = state.sections.find(s => s.section_id === sectionId);
      if (!section) return [];
      
      const components = [];
      
      // Handle full-width sections
      if (section.components) {
        section.components.forEach(compRef => {
          const componentId = typeof compRef === 'string' ? compRef : compRef.component_id;
          const component = state.components[componentId];
          if (component) {
            components.push(component);
          }
        });
      }
      
      // Handle multi-column sections
      if (section.columns) {
        Object.keys(section.columns).forEach(col => {
          if (section.columns[col]) {
            section.columns[col].forEach(componentId => {
              const component = state.components[componentId];
              if (component) {
                components.push({ ...component, column: parseInt(col) });
              }
            });
          }
        });
      }
      
      return components;
    },

    // Check if component is first in its section
    isComponentFirst: (state) => (componentId) => {
      for (const section of state.sections) {
        // Check full-width sections
        if (section.components) {
          const index = section.components.findIndex(comp => 
            (typeof comp === 'string' ? comp : comp.component_id) === componentId
          );
          if (index > -1) {
            return index === 0;
          }
        }
        // Check multi-column sections
        if (section.columns) {
          for (const col of Object.keys(section.columns)) {
            const index = section.columns[col].findIndex(id => id === componentId);
            if (index > -1) {
              return index === 0;
            }
          }
        }
      }
      return false;
    },

    // Check if component is last in its section
    isComponentLast: (state) => (componentId) => {
      for (const section of state.sections) {
        // Check full-width sections
        if (section.components) {
          const index = section.components.findIndex(comp => 
            (typeof comp === 'string' ? comp : comp.component_id) === componentId
          );
          if (index > -1) {
            return index === section.components.length - 1;
          }
        }
        // Check multi-column sections
        if (section.columns) {
          for (const col of Object.keys(section.columns)) {
            const index = section.columns[col].findIndex(id => id === componentId);
            if (index > -1) {
              return index === section.columns[col].length - 1;
            }
          }
        }
      }
      return false;
    },

    // Get component being edited
    editingComponent: (state) => {
      if (state.editingComponentId && state.components[state.editingComponentId]) {
        return state.components[state.editingComponentId];
      }
      return null;
    },

    // Get selected components
    selectedComponents: (state) => {
      return state.selectedComponentIds.map(id => state.components[id]).filter(Boolean);
    },

    // Get components by section and column
    componentsBySection: (state) => {
      const result = {};
      state.sections.forEach(section => {
        result[section.section_id] = {
          layout: section.layout || section.type,
          components: []
        };
        
        if (section.components) {
          section.components.forEach(compRef => {
            const componentId = typeof compRef === 'string' ? compRef : compRef.component_id;
            if (state.components[componentId]) {
              result[section.section_id].components.push({
                ...state.components[componentId],
                column: null
              });
            }
          });
        }
        
        if (section.columns) {
          Object.keys(section.columns).forEach(col => {
            section.columns[col].forEach(componentId => {
              if (state.components[componentId]) {
                result[section.section_id].components.push({
                  ...state.components[componentId],
                  column: parseInt(col)
                });
              }
            });
          });
        }
      });
      return result;
    },

    // Check if can undo/redo
    canUndo: (state) => state.history && state.historyIndex > 0,
    canRedo: (state) => state.history && state.historyIndex < state.history.length - 1,
    
    // Check if there are unsaved changes
    hasUnsavedChanges: (state) => state.isDirty,

    // Get save status
    saveStatus: (state) => {
      if (state.isSaving) return 'saving';
      if (state.isDirty) return 'unsaved';
      return 'saved';
    },

    // Get component count
    componentCount: (state) => Object.keys(state.components).length,

    // Get section count
    sectionCount: (state) => state.sections.length,

  },

  actions: {
    /**
     * PHASE 3 ENHANCEMENT: Single API call initialization
     * Fetches ALL data including Pods in one request via APIService
     */
    async initialize(savedState) {
      // ROOT FIX: Prevent duplicate initialization
      if (this.isInitialized) {
        console.log('⏭️ Store already initialized, skipping duplicate call');
        return { alreadyInitialized: true };
      }
      
      // P0 FIX #10: Use Pinia $subscribe instead of EventBus
      if (this.isInitializing) {
        console.warn('⚠️ Store is already initializing, waiting for completion...');
        // Wait for initialization using Pinia reactive state
        return new Promise((resolve) => {
          const unwatch = this.$subscribe((mutation, state) => {
            if (state.isInitialized) {
              unwatch();
              resolve({ alreadyInitialized: true });
            }
            if (state.loadError) {
              unwatch();
              resolve({ error: state.loadError });
            }
          });
          
          // Timeout fallback after 10 seconds
          setTimeout(() => {
            unwatch();
            resolve({ error: 'Initialization timeout' });
          }, 10000);
        });
      }
      
      this.isInitializing = true;
      this.isLoading = true;
      this.loadError = null;

      try {
        // CRITICAL FIX: Initialize APIService first if not already created
        if (!this.apiService) {
          this.apiService = new APIService(
            window.gmkbData?.restUrl,
            window.gmkbData?.restNonce,
            this.postId
          );
          
          // Make globally available for debugging
          window.gmkbAPI = this.apiService;
          
          if (window.gmkbData?.debugMode) {
            console.log('✅ APIService initialized in store');
          }
        }
        
        // P0 FIX #10: Removed eventBus.emit('store:initializing') - state flags are enough
        
        let data;
        
        // If savedState is provided directly, use it
        if (savedState) {
          data = savedState;
          this.applyState(savedState);
          
          // ROOT FIX: If Pods data not in savedState, get it from window.gmkbData
          if (!this.podsData || Object.keys(this.podsData).length === 0) {
            const podsDataFromWindow = window.gmkbData?.pods_data || window.gmkbData?.podsData || {};
            if (Object.keys(podsDataFromWindow).length > 0) {
              this.podsData = podsDataFromWindow;
              console.log('✅ Loaded Pods data from window.gmkbData:', Object.keys(this.podsData).length, 'fields');
            }
          }
          
          // CHATGPT CRITICAL FIX: Enrich components in savedState branch too!
          // Previously this only happened in the API branch, leaving savedState components unenriched
          if (window.podsDataIntegration || window.gmkbPodsIntegration) {
            const podsIntegration = window.podsDataIntegration || window.gmkbPodsIntegration;
            
            // CRITICAL FIX: Refresh Pods data source before enriching
            if (this.podsData && Object.keys(this.podsData).length > 0) {
              podsIntegration.podsData = this.podsData;
              console.log('✅ Updated PodsDataIntegration with store Pods data:', Object.keys(this.podsData).length, 'fields');
            }
            
            // P1 FIX: Add error handling for enrichment
            try {
              Object.keys(this.components).forEach(componentId => {
                const component = this.components[componentId];
                // ROOT FIX: Validate component structure before enrichment
                if (component && component.type && typeof component === 'object') {
                  try {
                    podsIntegration.enrichComponentData(component);
                  } catch (enrichError) {
                    console.warn(`⚠️ Failed to enrich component ${componentId}:`, enrichError);
                    // Continue with other components
                  }
                } else {
                  console.warn(`⚠️ Skipping invalid component ${componentId}:`, component);
                }
              });
              console.log('✅ Enriched all loaded components with Pods data (savedState branch)');
            } catch (error) {
              console.error('❌ Pods enrichment failed:', error);
              // Non-fatal - continue without enrichment
            }
          }
          
          // PHASE 4: Handle deprecated components
          console.log('🔄 Checking for deprecated components...');
          this.components = deprecationManager.processAllComponents(this.components);
          
          // Show deprecation notices if any
          const notices = deprecationManager.getDeprecationNotices(this.components);
          if (notices.length > 0) {
            console.warn(`⚠️ Found ${notices.length} deprecated component(s):`, notices);
            
            // Dispatch event for UI to show notices
            document.dispatchEvent(new CustomEvent('gmkb:show-deprecation-notices', {
              detail: { notices }
            }));
          }
        } else if (this.postId) {
          // ROOT FIX: Use the APIService we already created
          // No need to create new instance - we have one in state
          
          // Load data via APIService
          data = await this.apiService.load();

          if (!data) {
            throw new Error('No data returned from API');
          }

          // CRITICAL DEBUG: Log what theme data we received from API
          console.log('🎨 MediaKit Store INITIALIZE: Theme data from API:', {
            'data.theme': data.theme,
            'data.theme type': typeof data.theme,
            'data.themeCustomizations present': !!data.themeCustomizations,
            'Will set store theme to': data.theme || 'professional_clean'
          });

          // Update state in one batch
          this.$patch({
            components: data.components || {},
            sections: data.sections || [],
            theme: data.theme || 'professional_clean',
            themeCustomizations: data.themeCustomizations || {},
            podsData: data.podsData || {}, // CRITICAL: Store Pods data
            lastSaved: Date.now(),
            isDirty: false
          });
          
          // CRITICAL DEBUG: Confirm what theme was actually set
          console.log('🎨 MediaKit Store INITIALIZED: Theme set in store:', {
            'this.theme': this.theme,
            'this.theme type': typeof this.theme
          });
          
          // ROOT FIX: Enrich ALL loaded components with Pods data
          if (window.podsDataIntegration || window.gmkbPodsIntegration) {
            const podsIntegration = window.podsDataIntegration || window.gmkbPodsIntegration;
            
            // CRITICAL FIX: Refresh Pods data source before enriching
            // The integration may have initialized before store had Pods data
            if (this.podsData && Object.keys(this.podsData).length > 0) {
              podsIntegration.podsData = this.podsData;
              console.log('✅ Updated PodsDataIntegration with store Pods data:', Object.keys(this.podsData).length, 'fields');
            }
            
            // P1 FIX: Add error handling for enrichment
            try {
              Object.keys(this.components).forEach(componentId => {
                const component = this.components[componentId];
                // ROOT FIX: Validate component structure before enrichment
                if (component && component.type && typeof component === 'object') {
                  try {
                    podsIntegration.enrichComponentData(component);
                  } catch (enrichError) {
                    console.warn(`⚠️ Failed to enrich component ${componentId}:`, enrichError);
                    // Continue with other components
                  }
                } else {
                  console.warn(`⚠️ Skipping invalid component ${componentId}:`, component);
                }
              });
              console.log('✅ Enriched all loaded components with Pods data');
            } catch (error) {
              console.error('❌ Pods enrichment failed:', error);
              // Non-fatal - continue without enrichment
            }
          }
        }
        
        // P0 FIX #7: Normalize all component IDs after loading
        this._normalizeAllComponentIds();
        
        // ROOT FIX: Ensure at least one structured section exists
        // Changed from 'full_width' to 'two_column' for layout consistency
        if (this.sections.length === 0) {
          const sectionId = this.addSection('two_column');
          console.log('✅ Auto-created two_column section on initialization:', sectionId);
        }

        // ROOT FIX: Auto-fix any orphaned components on initialization
        setTimeout(() => {
          const orphanCheck = this.checkForOrphanedComponents();
          if (orphanCheck.orphaned > 0) {
            console.warn(`⚠️ Found ${orphanCheck.orphaned} orphaned components on initialization`);
            const fixResult = this.fixOrphanedComponents();
            if (fixResult.fixed > 0) {
              console.log(`✅ Auto-fixed ${fixResult.fixed} orphaned components`);
              // Show a subtle notification
              this.showNotification(`Fixed ${fixResult.fixed} orphaned components`, 'info');
            }
          }
        }, 500); // Small delay to ensure everything is loaded

        // Initialize history
        this._saveToHistory();
        
        // ROOT FIX: Mark as initialized to prevent duplicate calls
        this.isInitialized = true;
        this.isInitializing = false;
        
        // Mark store as ready in system readiness
        systemReadiness.markReady('store', this);
        // P0 FIX #10: Removed eventBus.emit('store:initialized') - using Pinia reactivity
        
        console.log('✅ State initialized via APIService (admin-ajax)');
        return data;

      } catch (error) {
        console.error('Failed to initialize:', error);
        this.loadError = error.message;
        this.isInitializing = false; // Clear flag on error too
        // P0 FIX #10: Removed eventBus.emit('store:error') - loadError state is enough
        throw error;
      } finally {
        this.isLoading = false;
      }
    },

    /**
     * OPTION C FIX: Save using REST API v2 via APIService
     * PHASE 3: Enhanced save with auto-save
     */
    async save() {
      if (!this.isDirty) {
        console.log('⏭️ Save skipped: No changes to save');
        return;
      }
      
      try {
        this.isSaving = true;
        console.log('💾 Starting save operation...');
        
        // Create local backup before saving
        this.backupToLocalStorage();
        
        // Clean up the state before saving
        const cleanComponents = {};
        Object.entries(this.components).forEach(([id, comp]) => {
          cleanComponents[id] = {
            id: comp.id,
            type: comp.type,
            data: comp.data || {},
            props: comp.props || {},
            settings: comp.settings || {}
          };
        });
        
        const state = {
          components: cleanComponents,
          sections: this.sections,
          theme: this.theme,
          themeCustomizations: this.themeCustomizations,
          globalSettings: this.globalSettings,
          layout: this.sections.map(s => s.section_id) // Add layout for compatibility
        };
        
        // ═══════════════════════════════════════════════════════════════
        // COMPREHENSIVE DEBUG LOGGING
        // ═══════════════════════════════════════════════════════════════
        console.group('📊 SAVE OPERATION DETAILS');
        
        console.log('📦 Components:', {
          count: Object.keys(cleanComponents).length,
          ids: Object.keys(cleanComponents),
          types: Object.values(cleanComponents).map(c => c.type)
        });
        
        console.log('📑 Sections:', {
          count: this.sections.length,
          layouts: this.sections.map(s => s.layout || s.type),
          ids: this.sections.map(s => s.section_id)
        });
        
        console.log('🎨 Theme Data:', {
          theme: this.theme,
          themeType: typeof this.theme,
          themeValue: JSON.stringify(this.theme),
          hasCustomizations: !!this.themeCustomizations && Object.keys(this.themeCustomizations).length > 0,
          customizationKeys: this.themeCustomizations ? Object.keys(this.themeCustomizations) : []
        });
        
        console.log('📏 Payload Size:', {
          totalBytes: new Blob([JSON.stringify(state)]).size,
          componentsBytes: new Blob([JSON.stringify(cleanComponents)]).size,
          sectionsBytes: new Blob([JSON.stringify(this.sections)]).size,
          themeBytes: new Blob([JSON.stringify({
            theme: this.theme,
            themeCustomizations: this.themeCustomizations
          })]).size
        });
        
        console.log('🔧 Store State:', {
          isDirty: this.isDirty,
          isSaving: this.isSaving,
          lastSaved: this.lastSaved ? new Date(this.lastSaved).toLocaleString() : 'Never',
          postId: this.postId
        });
        
        console.groupEnd();
        
        // CRITICAL FIX: Ensure APIService exists, create if needed
        if (!this.apiService) {
          console.warn('⚠️ APIService not available, creating new instance...');
          this.apiService = new APIService(
            window.gmkbData?.restUrl,
            window.gmkbData?.restNonce,
            this.postId
          );
          window.gmkbAPI = this.apiService;
        }
        
        // OPTION C FIX: Use APIService which calls REST API v2
        // Use our store's apiService instance
        console.log('🚀 Sending to API...');
        const result = await this.apiService.save(state);
        
        // ═══════════════════════════════════════════════════════════════
        // API RESPONSE LOGGING
        // ═══════════════════════════════════════════════════════════════
        console.group('💬 API RESPONSE');
        
        console.log('✅ Success:', result?.success);
        console.log('🆔 Post ID:', result?.post_id);
        console.log('⏱️ Timestamp:', result?.timestamp ? new Date(result.timestamp * 1000).toLocaleString() : 'N/A');
        console.log('📊 Data Size:', result?.data_size ? `${(result.data_size / 1024).toFixed(2)} KB` : 'N/A');
        console.log('📦 Components Saved:', result?.components_saved);
        console.log('📑 Sections Saved:', result?.sections_saved);
        
        if (result?.theme_save_status) {
          console.group('🎨 Theme Save Status');
          console.log('Attempted:', result.theme_save_status.attempted);
          console.log('Success:', result.theme_save_status.success);
          console.log('Verified:', result.theme_save_status.verified);
          console.log('Theme Value Sent:', result.theme_save_status.theme_value);
          console.log('Saved Value (Direct DB):', result.theme_save_status.saved_value);
          console.log('Saved Value (Cached):', result.theme_save_status.saved_value_cached);
          if (result.theme_save_status.error) {
            console.error('Error:', result.theme_save_status.error);
          }
          console.groupEnd();
        }
        
        if (result?.warnings) {
          console.warn('⚠️ Warnings:', result.warnings);
        }
        
        console.log('🔍 Full Response:', result);
        console.groupEnd();
        
        // Check response
        if (!result || !result.success) {
          console.error('❌ Save failed:', result);
          throw new Error('Save failed');
        }
        
        console.log('✅ Save operation completed successfully!');
        this.isDirty = false;
        // hasUnsavedChanges removed - using isDirty only
        this.lastSaved = Date.now();
        
        // Clear local backup after successful save
        this.clearLocalBackup();
        
        // NOTE: Toast notification removed from store - handled by toolbar component
        // This prevents duplicate toasts (store + toolbar both showing notifications)
        
        return true;
        
      } catch (error) {
        // ═══════════════════════════════════════════════════════════════
        // ERROR LOGGING
        // ═══════════════════════════════════════════════════════════════
        console.group('❌ SAVE ERROR');
        console.error('Error Type:', error.name);
        console.error('Error Message:', error.message);
        console.error('Stack Trace:', error.stack);
        
        if (error.response) {
          console.error('HTTP Response:', {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data
          });
        }
        
        console.log('🔧 Store State at Error:', {
          isDirty: this.isDirty,
          isSaving: this.isSaving,
          componentCount: Object.keys(this.components).length,
          sectionCount: this.sections.length,
          theme: this.theme,
          postId: this.postId
        });
        
        console.groupEnd();
        throw error;
      } finally {
        this.isSaving = false;
        console.log('➡️ Save operation finished (isSaving = false)');
      }
    },

    /**
     * PHASE 3: Track changes and trigger auto-save
     * ROOT FIX: Don't track if we're in undo/redo operation
     */
    _trackChange() {
      // ROOT FIX: Skip history save during undo/redo operations
      if (this._isUndoRedoOperation) {
        console.log('⏭️ Skipping history save during undo/redo operation');
        return;
      }
      
      this.isDirty = true;
      this._saveToHistory();
      this.autoSave(); // Debounced auto-save
    },

    // Component CRUD Operations
    addComponent(componentData) {
      // P0 FIX #8: Sanitize component data to prevent XSS
      if (window.GMKB?.services?.security) {
        componentData = window.GMKB.services.security.sanitizeComponentData(componentData);
      }
      
      // Issue #14 FIX: Use centralized validation from UnifiedComponentRegistry
      // This replaces scattered validation logic with a single, comprehensive check
      let registryComponent;
      try {
        registryComponent = UnifiedComponentRegistry.validateAndGet(componentData.type);
      } catch (error) {
        console.warn(`[Store] Invalid component rejected:`, error.message);
        
        // Log stack trace to help debug where invalid components come from
        if (console.trace) {
          console.trace('Invalid component add attempt');
        }
        
        return null;
      }
      
      // GEMINI FIX #3: Use collision-resistant ID generation
      const componentId = componentData.id || generateUniqueId('comp');
      
      // ROOT FIX: Auto-create a structured section when none exist
      // Changed from 'full_width' to 'two_column' for better layout flexibility
      // Component will be added to column 1 by default
      if (this.sections.length === 0) {
        const sectionId = this.addSection('two_column');
        console.log('✅ Auto-created two_column section for component:', sectionId);
      }
      
      // Issue #14 FIX: Use the already-validated component from validateAndGet
      // No need to call get() again - we already have the validated definition
      const defaultProps = UnifiedComponentRegistry.getDefaultProps(componentData.type);
      const componentSchema = registryComponent.schema || null;
      
      // THEME INTEGRATION: Get active theme's default preset
      // Import getPreset and applyPresetToSettings dynamically
      let componentSettings;
      if (componentData.settings) {
        // User provided settings - use them
        componentSettings = mergeWithDefaults(componentData.settings);
      } else {
        // No settings provided - use theme's default preset
        const themeStore = window.$pinia?.state?.value?.theme;
        const activeTheme = themeStore?.activeTheme;
        const defaultPresetId = activeTheme?.defaultPreset || 'medium';
        
        // Get base defaults
        const baseSettings = getComponentDefaults(componentData.type);
        
        // Apply theme's default preset if available
        if (window.stylePresets) {
          const { getPreset, applyPresetToSettings } = window.stylePresets;
          const preset = getPreset(defaultPresetId);
          if (preset) {
            componentSettings = applyPresetToSettings(baseSettings, defaultPresetId);
            console.log(`✅ Applied "${preset.name}" (${preset.value}) preset from "${activeTheme?.name || 'current'}" theme to new ${componentData.type}`);
          } else {
            componentSettings = baseSettings;
          }
        } else {
          componentSettings = baseSettings;
        }
      }
      
      const component = {
        id: componentId,
        type: componentData.type,
        data: { ...defaultProps, ...(componentData.data || {}) },
        props: { ...defaultProps, ...(componentData.props || {}) },
        settings: componentSettings, // PHASE 2: Always use schema-compliant settings
        schema: componentSchema
      };
      
      // CRITICAL: Log component creation in debug mode
      if (window.gmkbData?.debugMode) {
        console.log(`✅ Created component ${componentId} with settings:`, component.settings);
      }
      
      // PHASE 2: Validate component structure
      const validation = validateComponent(component);
      if (!validation.valid && window.gmkbData?.debugMode) {
        console.warn('[Store] Component validation warnings:', validation.errors);
      }
      
      // ROOT FIX: Enrich component with Pods data configuration
      if (window.podsDataIntegration || window.gmkbPodsIntegration) {
        const podsIntegration = window.podsDataIntegration || window.gmkbPodsIntegration;
        podsIntegration.enrichComponentData(component);
        console.log('[Store] Component after Pods enrichment:', component);
      } else {
        console.warn('[Store] PodsDataIntegration not available');
      }
      
      // Add to components map
      this.components[componentId] = component;
      
      // Add to first section by default, or specified section
      const targetSectionId = componentData.sectionId || this.sections[0].section_id;
      const targetColumn = componentData.column || 1;
      const section = this.sections.find(s => s.section_id === targetSectionId);
      
      if (section) {
        if (section.type === 'full_width' || section.layout === 'full_width') {
          // For full width sections, use components array
          if (!section.components) section.components = [];
          section.components.push(componentId);
        } else {
          // For multi-column sections, use columns structure
          if (!section.columns) {
            section.columns = { 1: [], 2: [], 3: [] };
          }
          if (!section.columns[targetColumn]) {
            section.columns[targetColumn] = [];
          }
          section.columns[targetColumn].push(componentId);
        }
      }
      
      this.isDirty = true;
      this._trackChange();
      
      // Dispatch event for any listening systems to react
      document.dispatchEvent(new CustomEvent('gmkb:component-added', {
        detail: {
          componentId,
          component,
          sectionId: targetSectionId
        }
      }));
      
      // Also trigger state change event
      document.dispatchEvent(new CustomEvent('gmkb:state-changed', {
        detail: {
          action: 'component-added',
          componentId,
          state: {
            components: this.components,
            sections: this.sections
          }
        }
      }));
      
      return componentId;
    },

    updateComponent(componentId, updates) {
      // P0 FIX #8: Sanitize updates to prevent XSS
      if (window.GMKB?.services?.security) {
        updates = window.GMKB.services.security.sanitizeComponentData(updates);
      }
      
      if (this.components[componentId]) {
        // CRITICAL FIX: If updating settings, ensure proper structure
        if (updates.settings) {
          // Validate settings structure
          if (Array.isArray(updates.settings) || typeof updates.settings !== 'object') {
            console.warn(`⚠️ updateComponent: Invalid settings provided for ${componentId}, using defaults`);
            updates.settings = getComponentDefaults(this.components[componentId].type || 'generic');
          } else {
            // Merge with existing settings to preserve structure
            const currentSettings = this.components[componentId].settings || {};
            updates.settings = {
              style: {
                ...currentSettings.style,
                ...updates.settings.style
              },
              advanced: {
                ...currentSettings.advanced,
                ...updates.settings.advanced
              }
            };
          }
        }
        
        this.components[componentId] = {
          ...this.components[componentId],
          ...updates
        };
        this.isDirty = true;
        // hasUnsavedChanges removed - using isDirty only
        this._trackChange();
        
        // Dispatch update event
        document.dispatchEvent(new CustomEvent('gmkb:component-updated', {
          detail: { componentId, updates }
        }));
      }
    },



    /**
     * P0 FIX #7: Component ID Normalization
     * CRITICAL: Enforce string-only IDs throughout the system
     * Mixed string/object IDs cause undefined errors and data corruption
     */
    _normalizeComponentRef(ref) {
      // If ref is null or undefined, return null
      if (!ref) {
        if (window.gmkbData?.debugMode) {
          console.warn('⚠️ Encountered null/undefined component reference');
        }
        return null;
      }
      
      // If it's an object with component_id property, extract the ID
      if (typeof ref === 'object' && ref !== null) {
        if (ref.component_id) {
          if (window.gmkbData?.debugMode) {
            console.log('🔧 Normalizing object reference to string:', ref.component_id);
          }
          return String(ref.component_id); // Force string conversion
        }
        // If it's an object with id property
        if (ref.id) {
          if (window.gmkbData?.debugMode) {
            console.log('🔧 Normalizing object (id) reference to string:', ref.id);
          }
          return String(ref.id); // Force string conversion
        }
        // If object has no recognizable ID, warn and skip
        console.warn('⚠️ Object reference has no component_id or id:', ref);
        return null;
      }
      
      // If it's already a string, return it
      if (typeof ref === 'string') {
        return ref;
      }
      
      // If it's a number, convert to string
      if (typeof ref === 'number') {
        console.warn('⚠️ Component ID is a number, converting to string:', ref);
        return String(ref);
      }
      
      // Unknown type, warn and return null
      console.warn('⚠️ Unknown component reference type:', typeof ref, ref);
      return null;
    },

    /**
     * P0 FIX #7: Normalize ALL component IDs in state
     * Run this after loading data to ensure consistency
     */
    _normalizeAllComponentIds() {
      console.log('🔧 Normalizing all component IDs to strings...');
      let normalizedCount = 0;
      
      // Normalize component object keys
      const normalizedComponents = {};
      Object.entries(this.components).forEach(([id, component]) => {
        const normalizedId = String(id);
        if (normalizedId !== id) {
          normalizedCount++;
        }
        
        // Also normalize the ID inside the component object
        if (component.id && component.id !== normalizedId) {
          component.id = normalizedId;
          normalizedCount++;
        }
        
        normalizedComponents[normalizedId] = component;
      });
      this.components = normalizedComponents;
      
      // Normalize section component references
      this.sections.forEach(section => {
        // Normalize full-width section components
        if (section.components && Array.isArray(section.components)) {
          const originalLength = section.components.length;
          section.components = section.components
            .map(ref => this._normalizeComponentRef(ref))
            .filter(Boolean);
          
          if (section.components.length !== originalLength) {
            normalizedCount += (originalLength - section.components.length);
          }
        }
        
        // Normalize multi-column section components
        if (section.columns) {
          Object.keys(section.columns).forEach(col => {
            if (Array.isArray(section.columns[col])) {
              const originalLength = section.columns[col].length;
              section.columns[col] = section.columns[col]
                .map(ref => this._normalizeComponentRef(ref))
                .filter(Boolean);
              
              if (section.columns[col].length !== originalLength) {
                normalizedCount += (originalLength - section.columns[col].length);
              }
            }
          });
        }
      });
      
      console.log(`✅ Normalized ${normalizedCount} component ID references`);
      return normalizedCount;
    },

    // Apply state data to store
    applyState(savedState) {
      console.log('📥 Applying state with normalization...');
      
      // CRITICAL FIX: Normalize ALL component references to strings only
      // This prevents the mixed string/object bug that causes undefined errors
      if (savedState.sections) {
        this.sections = savedState.sections.map((section, idx) => {
          const normalized = {
            section_id: section.section_id,
            type: section.type || section.layout || 'full_width',
            layout: section.layout || section.type || 'full_width',
            settings: section.settings || {}
          };
          
          // Fix full-width sections - ENFORCE STRING IDS ONLY
          if (section.components && Array.isArray(section.components)) {
            const originalCount = section.components.length;
            normalized.components = section.components
              .map(comp => this._normalizeComponentRef(comp))
              .filter(Boolean); // Remove null/undefined entries
            
            const normalizedCount = normalized.components.length;
            if (originalCount !== normalizedCount) {
              console.warn(`⚠️ Section ${idx}: Removed ${originalCount - normalizedCount} invalid component references`);
            }
          }
          
          // Fix multi-column sections - ENFORCE STRING IDS ONLY
          if (section.columns) {
            normalized.columns = {};
            Object.entries(section.columns).forEach(([col, components]) => {
              if (Array.isArray(components)) {
                const originalCount = components.length;
                normalized.columns[col] = components
                  .map(comp => this._normalizeComponentRef(comp))
                  .filter(Boolean); // Remove null/undefined entries
                
                const normalizedCount = normalized.columns[col].length;
                if (originalCount !== normalizedCount) {
                  console.warn(`⚠️ Section ${idx} col ${col}: Removed ${originalCount - normalizedCount} invalid component references`);
                }
              } else {
                normalized.columns[col] = [];
              }
            });
          }
          
          return normalized;
        });
        
        console.log('✅ Normalized sections (string IDs only):', this.sections.length);
      }
      
      if (savedState.components) {
        // PERFORMANCE FIX: Don't deep clone on every apply - just assign
        // Components are immutable once loaded, cloning is wasteful
        if (Array.isArray(savedState.components)) {
          this.components = {};
        } else {
          // CRITICAL FIX: Validate and fix component settings on load
          const validatedComponents = {};
          Object.entries(savedState.components).forEach(([id, component]) => {
            // Ensure component has valid settings structure
            if (!component.settings || Array.isArray(component.settings) || typeof component.settings !== 'object') {
              console.warn(`⚠️ Component ${id} has invalid settings, applying defaults`);
              component.settings = getComponentDefaults(component.type || 'generic');
            } else {
              // Ensure settings has style and advanced properties
              if (!component.settings.style) {
                const defaults = getComponentDefaults(component.type || 'generic');
                component.settings.style = defaults.style;
              }
              if (!component.settings.advanced) {
                const defaults = getComponentDefaults(component.type || 'generic');
                component.settings.advanced = defaults.advanced;
              }
              // Merge with defaults to ensure all nested properties exist
              component.settings = mergeWithDefaults(component.settings);
            }
            validatedComponents[id] = component;
          });
          this.components = validatedComponents;
        }
      }
      
      // ROOT FIX: Validate theme before applying
      const validThemes = ['professional_clean', 'creative_bold', 'minimal_elegant', 'modern_dark'];
      if (savedState.theme) {
        // If theme is 'default' or 'professional', map to 'professional_clean'
        if (savedState.theme === 'default' || savedState.theme === 'professional') {
          this.theme = 'professional_clean';
          console.log('📝 Migrated theme from "' + savedState.theme + '" to "professional_clean"');
        } else if (validThemes.includes(savedState.theme)) {
          this.theme = savedState.theme;
        } else {
          console.warn('⚠️ Invalid theme "' + savedState.theme + '", using professional_clean');
          this.theme = 'professional_clean';
        }
      }
      
      // PERFORMANCE FIX: Only clone on mutation, not on read
      // Use Object.assign for shallow clone - much faster than deepClone
      if (savedState.themeCustomizations) this.themeCustomizations = Object.assign({}, savedState.themeCustomizations);
      if (savedState.podsData) this.podsData = Object.assign({}, savedState.podsData);
      if (savedState.globalSettings) this.globalSettings = Object.assign({}, savedState.globalSettings);
      
      // P0 FIX #7: Normalize component IDs after applying state
      this._normalizeAllComponentIds();
    },

    // Load from API via APIService (uses REST API)
    async loadFromAPI() {
      if (!this.postId) return;
      
      try {
        const apiService = window.gmkbAPI || window.GMKB?.apiService || new (await import('../services/APIService.js')).APIService(
          window.gmkbData?.restUrl,
          window.gmkbData?.restNonce,
          this.postId
        );

        const data = await apiService.load();
        
        // Apply loaded state
        this.applyState(data);
        
        // Store pods data separately
        if (data.podsData) {
          this.podsData = data.podsData;
        }
        
        console.log('✅ Loaded via APIService (admin-ajax)');
        return data;
        
      } catch (error) {
        console.error('Failed to load from API:', error);
        throw error;
      }
    },

    // Save via APIService (uses REST API)
    async saveToAPI() {
      if (!this.postId) return;
      
      try {
        this.isSaving = true;
        
        const state = {
          components: this.components,
          sections: this.sections,
          theme: this.theme,
          themeCustomizations: this.themeCustomizations,
          globalSettings: this.globalSettings
        };
        
        const apiService = window.gmkbAPI || window.GMKB?.apiService || new (await import('../services/APIService.js')).APIService(
          window.gmkbData?.restUrl,
          window.gmkbData?.restNonce,
          this.postId
        );

        const result = await apiService.save(state);
        
        if (result && result.silent !== true) {
          this.isDirty = false;
          this.lastSaved = Date.now();
          
          // Dispatch save success event
          document.dispatchEvent(new CustomEvent('gmkb:save-success', {
            detail: { result, timestamp: this.lastSaved }
          }));
          
          console.log('✅ Saved via APIService (admin-ajax)');
          return result;
        }
        
        return result;
        
      } catch (error) {
        console.error('Failed to save via API:', error);
        throw error;
      } finally {
        this.isSaving = false;
      }
    },

    // Add a new section
    addSection(layout = 'full_width', position = null) {
      // GEMINI FIX #3: Use collision-resistant ID generation
      const sectionId = generateUniqueId('section');
      const newSection = {
        section_id: sectionId,
        type: layout,
        layout: layout,
        components: layout === 'full_width' ? [] : undefined,
        columns: layout !== 'full_width' ? { 1: [], 2: [], 3: [] } : undefined,
        settings: {}
      };

      if (position !== null && position >= 0 && position <= this.sections.length) {
        this.sections.splice(position, 0, newSection);
      } else {
        this.sections.push(newSection);
      }

      this.isDirty = true;
      this._trackChange();
      return sectionId;
    },

    // PHASE 2 FIX: Duplicate a section with proper deep cloning
    duplicateSection(sectionId) {
      const section = this.sections.find(s => s.section_id === sectionId);
      if (!section) return null;
      
      // CRITICAL: Use structuredClone for true deep copy (prevents reference leaks)
      // Fallback to JSON method for older browsers
      const newSection = typeof structuredClone !== 'undefined' ?
        structuredClone(section) :
        JSON.parse(JSON.stringify(section));
      
      // GEMINI FIX #3: Generate new unique IDs with collision-resistant method
      const newSectionId = generateUniqueId('section');
      newSection.section_id = newSectionId;
      newSection.createdAt = Date.now();
      delete newSection.updatedAt; // Remove old update timestamp
      
      // Create component ID mapping for remapping
      const componentIdMap = new Map();
      
      // Helper to deep clone and remap component IDs
      const remapComponentIds = (ids) => {
        if (!ids || !Array.isArray(ids)) return [];
        
        return ids.map(oldId => {
          if (!componentIdMap.has(oldId)) {
            // GEMINI FIX #3: Use collision-resistant ID generation
            const newId = generateUniqueId('comp');
            componentIdMap.set(oldId, newId);
            
            // Deep clone the component
            if (this.components[oldId]) {
              const clonedComponent = typeof structuredClone !== 'undefined' ?
                structuredClone(this.components[oldId]) :
                JSON.parse(JSON.stringify(this.components[oldId]));
              
              // Update component metadata
              clonedComponent.id = newId;
              clonedComponent.createdAt = Date.now();
              delete clonedComponent.updatedAt;
              
              // Store the new component
              this.components[newId] = clonedComponent;
            }
          }
          return componentIdMap.get(oldId);
        });
      };
      
      // Update component references
      if (newSection.components) {
        newSection.components = remapComponentIds(newSection.components);
      }
      
      // Handle multi-column layouts
      if (newSection.columns) {
        const newColumns = {};
        Object.entries(newSection.columns).forEach(([key, value]) => {
          newColumns[key] = remapComponentIds(value);
        });
        newSection.columns = newColumns;
      }
      
      // Insert after original section
      const index = this.sections.findIndex(s => s.section_id === sectionId);
      this.sections.splice(index + 1, 0, newSection);
      
      // Track change
      this.isDirty = true;
      this._trackChange();
      
      // P0 FIX #10: Use DOM CustomEvent instead of EventBus
      document.dispatchEvent(new CustomEvent('gmkb:section-duplicated', {
        detail: {
          original: sectionId, 
          duplicate: newSectionId,
          componentCount: componentIdMap.size
        }
      }));
      
      return newSectionId;
    },

    // Remove a section and all its components
    removeSection(sectionId) {
      const index = this.sections.findIndex(s => s.section_id === sectionId);
      if (index > -1) {
        const section = this.sections[index];
        
        // ROOT FIX: Collect all component IDs from this section
        const componentIdsToDelete = [];
        
        // Remove components in full-width sections
        if (section.components && Array.isArray(section.components)) {
          section.components.forEach(compRef => {
            const componentId = typeof compRef === 'string' ? compRef : compRef.component_id;
            if (componentId) {
              componentIdsToDelete.push(componentId);
            }
          });
        }
        
        // ROOT FIX: Also remove components in multi-column sections
        if (section.columns) {
          Object.values(section.columns).forEach(column => {
            if (Array.isArray(column)) {
              column.forEach(componentId => {
                if (componentId) {
                  componentIdsToDelete.push(componentId);
                }
              });
            }
          });
        }
        
        // ROOT FIX: Clear UI state if editing a component that's being deleted
        // This prevents "Component not found" error in the sidebar
        const uiStore = useUIStore();
        
        // Check if the currently editing component is being deleted
        if (uiStore.editingComponentId && componentIdsToDelete.includes(uiStore.editingComponentId)) {
          console.log(`🔧 Closing sidebar editor for deleted component: ${uiStore.editingComponentId}`);
          uiStore.closeSidebarEditor();
        }
        
        // Clear selection if any selected components are being deleted
        if (uiStore.selectedComponentIds && Array.isArray(uiStore.selectedComponentIds)) {
          const selectedToDelete = uiStore.selectedComponentIds.filter(id => 
            componentIdsToDelete.includes(id)
          );
          if (selectedToDelete.length > 0) {
            console.log(`🔧 Clearing selection for ${selectedToDelete.length} deleted components`);
            selectedToDelete.forEach(id => uiStore.deselectComponent(id));
          }
        }
        
        // Delete all collected components
        componentIdsToDelete.forEach(componentId => {
          delete this.components[componentId];
          console.log(`🗑️ Deleted component ${componentId} from section ${sectionId}`);
        });
        
        // Remove the section itself
        this.sections.splice(index, 1);
        
        // ROOT FIX: If this was the last section and we're in section editing mode, close the editor
        if (this.sections.length === 0 && uiStore.editingSectionId === sectionId) {
          console.log('🔧 Closing section editor after deleting last section');
          uiStore.closeSidebarEditor();
        }
        
        // Log the action
        console.log(`🗑️ Removed section ${sectionId} and ${componentIdsToDelete.length} components`);
        
        this.isDirty = true;
        this._trackChange();
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('gmkb:section-removed', {
          detail: { 
            sectionId, 
            componentsDeleted: componentIdsToDelete.length,
            componentIds: componentIdsToDelete
          }
        }));
      }
    },

    // Component Movement
    moveComponentToIndex(componentId, newIndex) {
      // Find component in sections
      for (const section of this.sections) {
        if (section.components) {
          const idx = section.components.findIndex(comp => 
            (typeof comp === 'string' ? comp : comp.component_id) === componentId
          );
          if (idx > -1) {
            const component = section.components.splice(idx, 1)[0];
            section.components.splice(newIndex, 0, component);
            this.isDirty = true;
            this._trackChange();
            return;
          }
        }
        if (section.columns) {
          for (const col of Object.keys(section.columns)) {
            const idx = section.columns[col].findIndex(id => id === componentId);
            if (idx > -1) {
              const component = section.columns[col].splice(idx, 1)[0];
              section.columns[col].splice(newIndex, 0, component);
              this.isDirty = true;
              this._trackChange();
              return;
            }
          }
        }
      }
    },

    moveComponentToSection(componentId, sectionId, columnIndex = 1) {
      // First, remove component from current location
      let component = null;
      for (const section of this.sections) {
        if (section.components) {
          const idx = section.components.findIndex(comp => 
            (typeof comp === 'string' ? comp : comp.component_id) === componentId
          );
          if (idx > -1) {
            component = section.components.splice(idx, 1)[0];
            break;
          }
        }
        if (section.columns) {
          for (const col of Object.keys(section.columns)) {
            const idx = section.columns[col].findIndex(id => id === componentId);
            if (idx > -1) {
              component = section.columns[col].splice(idx, 1)[0];
              break;
            }
          }
        }
      }
      
      // Add to target section
      if (component !== null) {
        const targetSection = this.sections.find(s => s.section_id === sectionId);
        if (targetSection) {
          if (targetSection.type === 'full_width' || targetSection.layout === 'full_width') {
            if (!targetSection.components) targetSection.components = [];
            targetSection.components.push(componentId);
          } else {
            if (!targetSection.columns) {
              targetSection.columns = { 1: [], 2: [], 3: [] };
            }
            if (!targetSection.columns[columnIndex]) {
              targetSection.columns[columnIndex] = [];
            }
            targetSection.columns[columnIndex].push(componentId);
          }
          this.isDirty = true;
          this._trackChange();
        }
      }
    },

    // Bulk Operations
    clearAllComponents() {
      try {
        // Store component count before clearing
        const componentCount = Object.keys(this.components).length;
        
        // Clear components object safely
        this.components = {};
        
        // Clear section references safely
        if (this.sections && Array.isArray(this.sections)) {
          this.sections.forEach(section => {
            if (section && typeof section === 'object') {
              if (section.components) section.components = [];
              if (section.columns) {
                section.columns = { 1: [], 2: [], 3: [] };
              }
            }
          });
        }
        
        // Reset editing state
        this.editingComponentId = null;
        this.editPanelOpen = false;
        this.selectedComponentIds = [];
        this.selectedComponentId = null;
        this.hoveredComponentId = null;
        
        // Mark as having unsaved changes
        this.isDirty = true;
        this._trackChange();
        
        // Dispatch event for any listening systems
        document.dispatchEvent(new CustomEvent('gmkb:components-cleared', {
          detail: { count: componentCount }
        }));
        
        console.log(`✅ Cleared ${componentCount} components successfully`);
      } catch (error) {
        console.error('Error during clearAllComponents:', error);
        // Force reset to clean state even if error occurs
        this.components = {};
        this.editingComponentId = null;
        this.editPanelOpen = false;
        this.selectedComponentIds = [];
        this.selectedComponentId = null;
        this.hoveredComponentId = null;
      }
    },

    // ROOT FIX: Add missing clearAllSections method
    clearAllSections() {
      try {
        // Store section count before clearing
        const sectionCount = this.sections.length;
        
        // Clear all sections
        this.sections = [];
        
        // Note: We don't clear components here as they might be used elsewhere
        // If you want to clear components too, call clearAllComponents() separately
        
        // Mark as having unsaved changes
        this.isDirty = true;
        this._trackChange();
        
        // Dispatch event for any listening systems
        document.dispatchEvent(new CustomEvent('gmkb:sections-cleared', {
          detail: { count: sectionCount }
        }));
        
        console.log(`✅ Cleared ${sectionCount} sections successfully`);
      } catch (error) {
        console.error('Error during clearAllSections:', error);
        // Force reset to clean state even if error occurs
        this.sections = [];
      }
    },

    importComponents(componentsArray) {
      componentsArray.forEach(comp => {
        this.addComponent(comp);
      });
      this.isDirty = true;
      this._trackChange();
    },

    reorderComponents(orderedIds) {
      // Reorder within current section structure
      // This is a simplified implementation
      this.isDirty = true;
      this._trackChange();
    },

    // Editor Management
    openComponentEditor(componentId) {
      this.editingComponentId = componentId;
      this.editPanelOpen = true;
      
      // Dispatch event for editor system
      document.dispatchEvent(new CustomEvent('gmkb:open-editor', {
        detail: { componentId }
      }));
    },

    closeComponentEditor() {
      this.editPanelOpen = false;
      this.editingComponentId = null;
    },

    saveComponentEdits(componentId, data) {
      if (this.components[componentId]) {
        this.components[componentId].data = {
          ...this.components[componentId].data,
          ...data
        };
        this.isDirty = true;
        this._trackChange();
      }
    },

    // Selection Management
    selectComponent(componentId) {
      this.selectedComponentIds = [componentId];
      
      // Dispatch selection event
      document.dispatchEvent(new CustomEvent('gmkb:component-selected', {
        detail: { componentId }
      }));
    },

    deselectComponent(componentId) {
      this.selectedComponentIds = this.selectedComponentIds.filter(id => id !== componentId);
    },

    clearSelection() {
      this.selectedComponentIds = [];
    },

    // Persistence
    async loadFromWordPress() {
      try {
        const formData = new FormData();
        formData.append('action', 'gmkb_load_media_kit');
        formData.append('nonce', window.gmkbData?.nonce || '');
        formData.append('post_id', this.postId || '');
        
        const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        if (result.success && result.data) {
          this.initialize(result.data);
        }
      } catch (error) {
        console.error('Failed to load from WordPress:', error);
      }
    },

    // PHASE 3: Debounced auto-save implementation
    // ROOT FIX: Initialize debounced function in the store setup
    autoSave() {
      // This will be properly initialized after store creation
      console.warn('autoSave called before initialization');
    },
    
    // Actual auto-save implementation
    _performAutoSave: async function() {
      // CRITICAL FIX: Check if store is initialized before auto-saving
      if (!this.isInitialized) {
        if (window.gmkbData?.debugMode) {
          console.log('⏩ Auto-save skipped: Store not initialized yet');
        }
        return;
      }
      
      // ROOT FIX: Check if auto-save is enabled
      if (!this.autoSaveEnabled) {
        console.log('⏩ Auto-save disabled, skipping');
        return;
      }
      
      if (this.isDirty && !this.isSaving) {
        try {
          // Use the new save method that uses REST API
          await this.save();
          console.log('✅ Auto-saved');
        } catch (error) {
          console.error('Auto-save failed:', error);
          
          // Retry once after 10 seconds
          const retryTimeout = setTimeout(() => {
            if (this.isDirty && !this.isSaving) {
              this.save().catch(e => 
                console.error('❌ Auto-save retry failed:', e)
              );
            }
          }, 10000);
          
          // Store timeout for cleanup if needed
          this._retryTimeout = retryTimeout;
        }
      }
    },
    
    // Initialize the debounced autoSave after store creation
    initAutoSave() {
      // ROOT FIX: Bind context properly using arrow function
      this.autoSave = debounce(() => this._performAutoSave(), 2000);
    },

    // Enhanced save with conflict detection
    async saveToWordPressWithConflictCheck() {
      try {
        // First check if someone else has modified the post
        const currentState = await this.loadFromWordPressQuiet();
        
        if (currentState && currentState.lastSaved > this.lastSaved) {
          // Conflict detected
          const shouldOverwrite = confirm(
            'Another user has modified this media kit. Do you want to overwrite their changes?'
          );
          
          if (!shouldOverwrite) {
            // Reload their changes
            this.initialize(currentState);
            return { cancelled: true, reason: 'User chose to reload changes' };
          }
        }
        
        // No conflict or user chose to overwrite
        return await this.saveToWordPress();
        
      } catch (error) {
        console.error('Conflict check failed:', error);
        // Fallback to normal save
        return await this.saveToWordPress();
      }
    },

    // Quiet load that doesn't modify state
    async loadFromWordPressQuiet() {
      try {
        const formData = new FormData();
        formData.append('action', 'gmkb_load_media_kit');
        formData.append('nonce', window.gmkbData?.nonce || '');
        formData.append('post_id', this.postId || '');
        
        const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
        
        const result = await response.json();
        return result.success ? result.data : null;
        
      } catch (error) {
        console.warn('Quiet load failed:', error);
        return null;
      }
    },

    /**
     * ROOT FIX: Use StorageService instead of direct localStorage
     * Offline handling with local storage backup
     */
    backupToLocalStorage() {
      try {
        const backup = {
          components: this.components,
          sections: this.sections,
          theme: this.theme,
          timestamp: Date.now(),
          postId: this.postId
        };
        
        const success = storageService.createBackup(this.postId, backup);
        if (success) {
          console.log('📦 Local backup created');
        } else {
          console.warn('⚠️ Local backup failed (storage unavailable)');
        }
      } catch (error) {
        console.warn('Local backup failed:', error);
      }
    },

    /**
     * ROOT FIX: Use StorageService instead of direct localStorage
     * Restore from local storage
     */
    restoreFromLocalStorage() {
      try {
        const backup = storageService.getBackup(this.postId, 3600000); // 1 hour max age
        
        if (backup) {
          this.initialize(backup);
          console.log('♻️ Restored from local backup');
          return true;
        }
        
        return false;
      } catch (error) {
        console.warn('Local restore failed:', error);
        return false;
      }
    },

    /**
     * ROOT FIX: Use StorageService instead of direct localStorage
     * Clear local backup after successful save
     */
    clearLocalBackup() {
      try {
        storageService.removeBackup(this.postId);
      } catch (error) {
        console.warn('Clear backup failed:', error);
      }
    },

    // PHASE 3: Enhanced history management with size limits
    _saveToHistory() {
      if (!this.history) this.history = [];
      if (this.historyIndex === undefined) this.historyIndex = -1;
      
      // PERFORMANCE FIX: Don't save if state hasn't actually changed
      // Use efficient deep comparison instead of always cloning
      const currentState = {
        components: this.components,
        sections: this.sections
      };
      
      // Compare with last history entry using efficient deepEqual
      if (this.history.length > 0) {
        const lastEntry = this.history[this.historyIndex];
        // deepEqual is much more efficient than JSON.stringify for large objects
        const hasChanged = !deepEqual(currentState, lastEntry);
        if (!hasChanged) {
          return; // Skip duplicate history entries - MAJOR PERFORMANCE WIN
        }
      }
      
      // Remove any forward history when adding new state
      this.history = this.history.slice(0, this.historyIndex + 1);
      
      // PERFORMANCE FIX: Only deep clone when we're actually saving to history
      // This happens much less frequently than applyState()
      const historyEntry = {
        components: deepClone(this.components),
        sections: deepClone(this.sections),
        timestamp: Date.now()
      };
      
      // ROOT FIX: Enforce history size limit BEFORE adding new entry
      if (this.history.length >= this.maxHistorySize) {
        // Remove oldest entry to make room
        this.history.shift();
        // Don't adjust index - we're removing from start, index stays same
      }
      
      // Add current state to history
      this.history.push(historyEntry);
      
      // Update index to point to new entry
      this.historyIndex = this.history.length - 1;
      
      // ROOT FIX: Log history status in debug mode
      if (window.gmkbData?.debugMode) {
        console.log(`📚 History: ${this.history.length}/${this.maxHistorySize} entries, index: ${this.historyIndex}`);
      }
    },

    undo() {
      if (!this.canUndo) {
        console.warn('⚠️ Cannot undo - no history available');
        return;
      }
      
      console.log(`↩️ Undo: Moving from index ${this.historyIndex} to ${this.historyIndex - 1}`);
      
      // ROOT FIX: Set flag to prevent history tracking during undo
      this._isUndoRedoOperation = true;
      
      try {
        this.historyIndex--;
        
        const state = this.history[this.historyIndex];
        if (!state) {
          console.error('❌ Undo failed - state not found at index', this.historyIndex);
          return;
        }
        
        // GEMINI FIX #1: Apply state without triggering history save using deepClone
        this.$patch({
          components: deepClone(state.components),
          sections: deepClone(state.sections)
        });
        
        // Mark as dirty but don't add to history (we're navigating history)
        this.isDirty = true;
        
        // Trigger auto-save after undo
        this.autoSave();
        
        // Dispatch undo event
        document.dispatchEvent(new CustomEvent('gmkb:undo', {
          detail: { historyIndex: this.historyIndex }
        }));
        
        console.log('✅ Undo complete');
      } finally {
        // ROOT FIX: Always clear the flag
        this._isUndoRedoOperation = false;
      }
    },

    redo() {
      if (!this.canRedo) {
        console.warn('⚠️ Cannot redo - no forward history available');
        return;
      }
      
      console.log(`↪️ Redo: Moving from index ${this.historyIndex} to ${this.historyIndex + 1}`);
      
      // ROOT FIX: Set flag to prevent history tracking during redo
      this._isUndoRedoOperation = true;
      
      try {
        this.historyIndex++;
        
        const state = this.history[this.historyIndex];
        if (!state) {
          console.error('❌ Redo failed - state not found at index', this.historyIndex);
          return;
        }
        
        // GEMINI FIX #1: Apply state without triggering history save using deepClone
        this.$patch({
          components: deepClone(state.components),
          sections: deepClone(state.sections)
        });
        
        // Mark as dirty but don't add to history (we're navigating history)
        this.isDirty = true;
        
        // Trigger auto-save after redo
        this.autoSave();
        
        // Dispatch redo event
        document.dispatchEvent(new CustomEvent('gmkb:redo', {
          detail: { historyIndex: this.historyIndex }
        }));
        
        console.log('✅ Redo complete');
      } finally {
        // ROOT FIX: Always clear the flag
        this._isUndoRedoOperation = false;
      }
    },

    // DUPLICATE REMOVED - addComponent is already defined above

    // Remove a component
    removeComponent(componentId) {
      // ROOT FIX: Clear UI state if editing the component being deleted
      // This prevents "Component not found" error in the sidebar
      const uiStore = useUIStore();
      
      // Check if the currently editing component is being deleted
      if (uiStore.editingComponentId === componentId) {
        console.log(`🔧 Closing sidebar editor for deleted component: ${componentId}`);
        uiStore.closeSidebarEditor();
      }
      
      // Clear selection if this component is selected
      if (uiStore.selectedComponentIds && uiStore.selectedComponentIds.includes(componentId)) {
        console.log(`🔧 Clearing selection for deleted component: ${componentId}`);
        uiStore.deselectComponent(componentId);
      }
      
      // Remove from components map
      delete this.components[componentId];
      
      // Remove from all sections
      this.sections.forEach(section => {
        // Check full-width sections
        if (section.components) {
          section.components = section.components.filter(comp => 
            (typeof comp === 'string' ? comp : comp.component_id) !== componentId
          );
        }
        // Check multi-column sections
        if (section.columns) {
          Object.keys(section.columns).forEach(col => {
            section.columns[col] = section.columns[col].filter(id => id !== componentId);
          });
        }
      });
      
      this.isDirty = true;
      this._trackChange();
    },

    // REMOVED: Duplicate updateComponent definition - keeping the one above with history tracking

    // UI Management - Added methods
    setComponentLibraryOpen(isOpen) {
      this.componentLibraryOpen = isOpen;
    },
    
    openDesignPanel(componentId) {
      this.editingComponentId = componentId;
      this.designPanelOpen = true;
      
      // Dispatch event for design panel
      document.dispatchEvent(new CustomEvent('gmkb:design-panel-open', {
        detail: { componentId }
      }));
    },
    
    closeDesignPanel() {
      this.designPanelOpen = false;
      this.editingComponentId = null;
    },

    // Move component within its section or to another position
    moveComponent(componentId, direction) {
      for (const section of this.sections) {
        // Check full-width sections
        if (section.components) {
          const index = section.components.findIndex(comp => 
            (typeof comp === 'string' ? comp : comp.component_id) === componentId
          );
          
          if (index > -1) {
            const newIndex = direction === 'up' ? index - 1 : index + 1;
            
            if (newIndex >= 0 && newIndex < section.components.length) {
              const temp = section.components[index];
              section.components[index] = section.components[newIndex];
              section.components[newIndex] = temp;
              this.isDirty = true;
              this._trackChange();
            }
            return;
          }
        }
        
        // Check multi-column sections
        if (section.columns) {
          for (const col of Object.keys(section.columns)) {
            const columnComponents = section.columns[col];
            const index = columnComponents.findIndex(id => id === componentId);
            
            if (index > -1) {
              const newIndex = direction === 'up' ? index - 1 : index + 1;
              
              if (newIndex >= 0 && newIndex < columnComponents.length) {
                const temp = columnComponents[index];
                columnComponents[index] = columnComponents[newIndex];
                columnComponents[newIndex] = temp;
                this.isDirty = true;
                this._trackChange();
              }
              return;
            }
          }
        }
      }
    },

    // Duplicate a component
    duplicateComponent(componentId) {
      const original = this.components[componentId];
      if (!original) return;
      
      // GEMINI FIX #1 & #3: Use proper deep clone and collision-resistant ID
      // Deep clone prevents any shared references between original and duplicate
      const cloned = deepClone(original);
      const newId = generateUniqueId('comp');
      
      // Update the cloned component with new metadata
      cloned.id = newId;
      cloned.createdAt = Date.now();
      delete cloned.updatedAt; // Remove old timestamp
      
      this.components[newId] = cloned;
      
      // Find the original in sections and add duplicate after it
      for (const section of this.sections) {
        // Check full-width sections
        if (section.components) {
          const index = section.components.findIndex(comp => 
            (typeof comp === 'string' ? comp : comp.component_id) === componentId
          );
          
          if (index > -1) {
            section.components.splice(index + 1, 0, newId);
            this.isDirty = true;
            this._trackChange();
            return newId;
          }
        }
        
        // Check multi-column sections
        if (section.columns) {
          for (const col of Object.keys(section.columns)) {
            const columnComponents = section.columns[col];
            const index = columnComponents.findIndex(id => id === componentId);
            
            if (index > -1) {
              columnComponents.splice(index + 1, 0, newId);
              this.isDirty = true;
              this._trackChange();
              return newId;
            }
          }
        }
      }
      
      return newId;
    },

    // Set hovered component
    setHoveredComponent(componentId) {
      this.hoveredComponentId = componentId;
    },

    // Set selected component with auto-save trigger
    setSelectedComponent(componentId) {
      this.selectedComponentId = componentId;
      
      // Trigger auto-save when selection changes (indicates user activity)
      if (this.isDirty) {
        this.autoSave();
      }
    },

    // Open edit panel for component
    openEditPanel(componentId) {
      this.editingComponentId = componentId;
    },

    // Close edit panel
    closeEditPanel() {
      this.editingComponentId = null;
    },

    // Section selection management
    selectSection(sectionId) {
      this.selectedSectionId = sectionId;
      
      // Dispatch section selection event
      document.dispatchEvent(new CustomEvent('gmkb:section-selected', {
        detail: { sectionId }
      }));
    },

    clearSectionSelection() {
      this.selectedSectionId = null;
      
      // Dispatch clear event
      document.dispatchEvent(new CustomEvent('gmkb:section-deselected'));
    },

    // Alias for backwards compatibility - now just calls save()
    async saveToWordPress() {
      return await this.save();
    },

    // NEW: Section settings management
    // ROOT FIX: Preserve components when changing layout
    updateSection(sectionId, updates) {
      const section = this.sections.find(s => s.section_id === sectionId);
      if (!section) {
        console.warn(`⚠️ Section ${sectionId} not found`);
        return;
      }
      
      // CRITICAL FIX: If updating layout/type, preserve and redistribute components
      if (updates.layout || updates.type) {
        const newLayout = updates.layout || updates.type;
        const oldLayout = section.layout || section.type;
        
        // Only redistribute if layout actually changed
        if (newLayout !== oldLayout) {
          console.log(`🔄 Section ${sectionId}: Layout change detected (${oldLayout} → ${newLayout})`);
          
          // Collect ALL existing components from current structure
          const existingComponents = [];
          
          // From full-width sections
          if (section.components && Array.isArray(section.components)) {
            section.components.forEach(comp => {
              const compId = typeof comp === 'string' ? comp : (comp.component_id || comp.id);
              if (compId) existingComponents.push(compId);
            });
          }
          
          // From multi-column sections
          if (section.columns) {
            Object.values(section.columns).forEach(column => {
              if (Array.isArray(column)) {
                column.forEach(compId => {
                  if (compId) existingComponents.push(compId);
                });
              }
            });
          }
          
          console.log(`📦 Preserving ${existingComponents.length} components:`, existingComponents);
          
          // Create new structure based on target layout
          if (newLayout === 'full_width') {
            // Moving TO full-width: Put all components in components array
            section.components = existingComponents;
            delete section.columns;
            console.log(`✅ Converted to full_width with ${existingComponents.length} components`);
          } else {
            // Moving TO multi-column: Distribute components across columns
            delete section.components;
            
            // Initialize columns based on new layout
            const columnCount = newLayout === 'two_column' ? 2 : 3;
            section.columns = {};
            for (let i = 1; i <= columnCount; i++) {
              section.columns[String(i)] = [];
            }
            
            // Distribute components evenly across columns
            existingComponents.forEach((compId, index) => {
              const targetColumn = String((index % columnCount) + 1);
              section.columns[targetColumn].push(compId);
            });
            
            console.log(`✅ Converted to ${newLayout} with ${existingComponents.length} components distributed:`,
              Object.entries(section.columns).map(([col, comps]) => `col${col}: ${comps.length}`).join(', '));
          }
        }
      }
      
      // Apply remaining updates (AFTER component redistribution)
      Object.assign(section, updates);
      
      this.isDirty = true;
      this._trackChange();
      
      // Dispatch update event
      document.dispatchEvent(new CustomEvent('gmkb:section-updated', {
        detail: { sectionId, updates }
      }));
    },

    // NEW: Update section settings
    updateSectionSettings(sectionId, settings) {
      const section = this.sections.find(s => s.section_id === sectionId);
      if (section) {
        if (!section.settings) {
          section.settings = {};
        }
        Object.assign(section.settings, settings);
        this.isDirty = true;
        this._trackChange();
        
        // Dispatch settings update event
        document.dispatchEvent(new CustomEvent('gmkb:section-settings-updated', {
          detail: { sectionId, settings }
        }));
      }
    },

    // PHASE 1: Import/Export Integration Methods
    
    /**
     * Replace entire state (for import)
     */
    async replaceState(newState) {
      // Save current state to history before replacing
      this._saveToHistory();
      
      // Apply new state
      this.applyState(newState);
      
      // Mark as having changes
      this.isDirty = true;
      this._trackChange();
      
      // Auto-save
      await this.autoSave();
    },

    /**
     * Apply template (structure only)
     */
    async applyTemplate(template) {
      // Save current state to history
      this._saveToHistory();
      
      // Clear current structure
      this.sections = template.sections || [];
      this.theme = template.theme || this.theme;
      this.themeCustomizations = template.themeCustomizations || this.themeCustomizations;
      
      // Keep existing components but clear references
      // This allows user to re-add components manually
      
      this.isDirty = true;
      this._trackChange();
      await this.autoSave();
    },

    /**
     * Merge components (for component import)
     */
    async mergeComponents(newComponents) {
      // Save current state to history
      this._saveToHistory();
      
      // Merge new components
      Object.assign(this.components, newComponents);
      
      // Add to first section if not already referenced
      if (this.sections.length > 0) {
        const firstSection = this.sections[0];
        Object.keys(newComponents).forEach(componentId => {
          // Check if component is already in a section
          let found = false;
          this.sections.forEach(section => {
            if (section.components?.includes(componentId)) found = true;
            if (section.columns) {
              Object.values(section.columns).forEach(col => {
                if (col.includes(componentId)) found = true;
              });
            }
          });
          
          // If not found, add to first section
          if (!found) {
            if (firstSection.components) {
              firstSection.components.push(componentId);
            } else if (firstSection.columns?.['1']) {
              firstSection.columns['1'].push(componentId);
            }
          }
        });
      }
      
      this.isDirty = true;
      this._trackChange();
      await this.autoSave();
    },

    /**
     * Show notification (for user feedback)
     */
    showNotification(message, type = 'info') {
      // Dispatch notification event for UI to handle
      document.dispatchEvent(new CustomEvent('gmkb:notification', {
        detail: { message, type }
      }));
      
      // Also log to console
      const emoji = type === 'success' ? '✅' : type === 'error' ? '❌' : 'ℹ️';
      console.log(`${emoji} ${message}`);
    },

    /**
     * ROOT FIX: Check for orphaned components (components not in any section)
     * Returns detailed report of orphaned components
     * Issue #17 FIX: Optimized from O(n * m * k) to O(n) using Set-based lookup
     * Performance: ~20x faster with 50+ components
     */
    checkForOrphanedComponents() {
      const componentIds = Object.keys(this.components);
      
      if (componentIds.length === 0) {
        return { total: 0, orphaned: 0, inSections: 0, orphanedIds: [] };
      }
      
      // Issue #17 FIX: Build Set in single O(n) pass (was nested loops before)
      const componentsInSections = new Set();
      
      // Single pass through all sections and columns - O(n) complexity
      this.sections.forEach(section => {
        // Full-width sections
        if (section.components && Array.isArray(section.components)) {
          section.components.forEach(comp => {
            const compId = typeof comp === 'string' ? comp : (comp.component_id || comp.id);
            if (compId) componentsInSections.add(compId);
          });
        }
        
        // Multi-column sections
        if (section.columns) {
          Object.values(section.columns).forEach(column => {
            if (Array.isArray(column)) {
              column.forEach(compId => {
                if (compId) componentsInSections.add(compId);
              });
            }
          });
        }
      });
      
      // Issue #17 FIX: O(1) Set lookup per component (was nested search before)
      // Total: O(n) vs previous O(n * m * k)
      const orphanedIds = componentIds.filter(id => !componentsInSections.has(id));
      
      return {
        total: componentIds.length,
        orphaned: orphanedIds.length,
        inSections: componentsInSections.size,
        orphanedIds: orphanedIds
      };
    },

    /**
     * ROOT FIX: Fix orphaned components by assigning them to sections
     * Automatically assigns orphaned components to the first section
     */
    fixOrphanedComponents() {
      const check = this.checkForOrphanedComponents();
      
      if (check.orphaned === 0) {
        console.log('✅ No orphaned components found');
        return { fixed: 0, total: check.total };
      }
      
      console.warn(`Found ${check.orphaned} orphaned components:`, check.orphanedIds);
      
      // ROOT FIX: Ensure at least one structured section exists
      // Changed from 'full_width' to 'two_column' for layout consistency
      if (this.sections.length === 0) {
        const sectionId = this.addSection('two_column');
        console.log('✅ Created two_column section for orphaned components:', sectionId);
      }
      
      // Get the first section
      const targetSection = this.sections[0];
      let fixedCount = 0;
      
      // Assign orphaned components to first section
      check.orphanedIds.forEach(compId => {
        if (targetSection.type === 'full_width' || targetSection.layout === 'full_width') {
          // Add to full-width section
          if (!targetSection.components) {
            targetSection.components = [];
          }
          if (!targetSection.components.includes(compId)) {
            targetSection.components.push(compId);
            fixedCount++;
            console.log(`✅ Fixed orphan: ${compId} -> section ${targetSection.section_id}`);
          }
        } else {
          // Add to first column of multi-column section
          if (!targetSection.columns) {
            targetSection.columns = { 1: [], 2: [], 3: [] };
          }
          if (!targetSection.columns['1'].includes(compId)) {
            targetSection.columns['1'].push(compId);
            fixedCount++;
            console.log(`✅ Fixed orphan: ${compId} -> section ${targetSection.section_id} column 1`);
          }
        }
        
        // Update component's sectionId
        if (this.components[compId]) {
          this.components[compId].sectionId = targetSection.section_id;
        }
      });
      
      if (fixedCount > 0) {
        this.isDirty = true;
        this._trackChange();
        
        // Auto-save the fixes
        this.autoSave();
        
        console.log(`✅ Fixed ${fixedCount} orphaned components`);
        
        // Dispatch event
        document.dispatchEvent(new CustomEvent('gmkb:orphans-fixed', {
          detail: { count: fixedCount, sectionId: targetSection.section_id }
        }));
      }
      
      return { fixed: fixedCount, total: check.total };
    },
    
    /**
     * ROOT FIX: Compress history to save memory
     * Keeps recent history intact but removes old entries
     */
    compressHistory() {
      if (!this.history || this.history.length === 0) return;
      
      const keepRecent = 10; // Keep last 10 entries in full detail
      
      if (this.history.length > keepRecent) {
        // Keep only recent history
        const recentHistory = this.history.slice(-keepRecent);
        this.history = recentHistory;
        this.historyIndex = this.history.length - 1;
        
        if (window.gmkbData?.debugMode) {
          console.log(`🗑️ Compressed history to ${this.history.length} entries`);
        }
      }
    },
    
    /**
     * ROOT FIX: Clear all history (for memory management)
     */
    clearHistory() {
      this.history = [];
      this.historyIndex = -1;
      this._saveToHistory(); // Save current state as first entry
      console.log('🗑️ History cleared');
    },
    
    /**
     * GEMINI FIX #2: Initialize section columns structure
     * Ensures multi-column sections have proper column arrays
     * Moves this logic from view layer to store (proper architecture)
     */
    initializeSectionColumns(sectionId) {
      const section = this.sections.find(s => s.section_id === sectionId);
      if (!section) {
        console.warn(`⚠️ Section ${sectionId} not found`);
        return false;
      }
      
      // Skip full-width sections
      if (section.type === 'full_width' || section.layout === 'full_width') {
        return false;
      }
      
      // Only initialize if columns don't exist
      if (!section.columns) {
        section.columns = this.getDefaultColumnsForLayout(section.type);
        console.log(`✅ Initialized columns for section ${sectionId} (${section.type})`);
        return true;
      }
      
      return false;
    },
    
    /**
     * GEMINI FIX #2: Get default columns structure based on layout type
     * Centralizes column initialization logic in one place
     */
    getDefaultColumnsForLayout(layout) {
      switch(layout) {
        case 'two_column':
          return { '1': [], '2': [] };
        case 'three_column':
          return { '1': [], '2': [], '3': [] };
        case 'main_sidebar':
        case 'sidebar':
          return { '1': [], '2': [] };
        default:
          return null;
      }
    },
    
    /**
     * NUCLEAR OPTION: Reset entire media kit to initial state
     * WARNING: This deletes ALL components, sections, and customizations
     * SAFETY: Requires confirmed=true parameter + UI confirmation dialog
     * RECOVERY: Can be undone via history
     * 
     * @param {boolean} confirmed - Must be true to proceed
     * @returns {boolean} Success status
     */
    resetAll(confirmed = false) {
      if (!confirmed) {
        console.warn('resetAll() requires confirmed=true parameter');
        return false;
      }
      
      console.log('⚠️ Starting complete media kit reset...');
      
      // Save current state for undo
      this._saveToHistory();
      
      // Count items for tracking
      const stats = {
        components: Object.keys(this.components).length,
        sections: this.sections.length
      };
      
      // Clear all components and sections
      this.components = {};
      this.sections = [];
      
      // ROOT FIX: Add one default structured section
      // Changed from 'full_width' to 'two_column' for layout consistency
      const defaultSectionId = this.addSection('two_column');
      console.log(`✅ Created two_column section: ${defaultSectionId}`);
      
      // GEMINI REFINEMENT #1: Use imported store directly
      const themeStore = useThemeStore();
      themeStore.resetThemeCustomizations();
      
      // Reset global settings
      this.globalSettings = {};
      this.themeCustomizations = {
        colors: {},
        typography: {},
        spacing: {},
        effects: {}
      };
      
      // Clear UI state
      this.selectedComponentIds = [];
      this.selectedComponentId = null;
      this.hoveredComponentId = null;
      this.editingComponentId = null;
      
      this.isDirty = true;
      this._trackChange();
      
      // Auto-save the reset (per Gemini recommendation)
      this.autoSave();
      
      // Dispatch event for tracking
      document.dispatchEvent(new CustomEvent('gmkb:complete-reset', {
        detail: {
          deletedComponents: stats.components,
          deletedSections: stats.sections,
          timestamp: Date.now()
        }
      }));
      
      console.log(`✅ Complete reset finished - deleted ${stats.components} components, ${stats.sections} sections`);
      return true;
    },

    /**
     * Reset section settings to defaults, preserve components
     * @param {string} sectionId - Section to reset
     * @returns {boolean} Success status
     */
    resetSectionSettings(sectionId) {
      const section = this.sections.find(s => s.section_id === sectionId);
      if (!section) {
        console.warn(`Cannot reset section ${sectionId} - not found`);
        return false;
      }
      
      // Save current state for undo
      this._saveToHistory();
      
      // NOTE: No DEFAULT_SECTION_SETTINGS schema found in codebase
      // Using empty object as per plan
      section.settings = {};
      
      this.isDirty = true;
      this._trackChange();
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('gmkb:section-settings-reset', {
        detail: { sectionId }
      }));
      
      console.log(`✅ Reset settings for section ${sectionId}`);
      return true;
    },

    /**
     * Clear all components from section
     * NOTE: Does not delete components, just removes references
     * @param {string} sectionId - Section to clear
     * @returns {boolean} Success status
     */
    clearSection(sectionId) {
      const section = this.sections.find(s => s.section_id === sectionId);
      if (!section) {
        console.warn(`Cannot clear section ${sectionId} - not found`);
        return false;
      }
      
      // Save current state for undo
      this._saveToHistory();
      
      // Count components before clearing (for tracking)
      let componentCount = 0;
      
      // Clear component references but keep section structure
      if (section.components) {
        componentCount = section.components.length;
        section.components = [];
      }
      
      if (section.columns) {
        Object.keys(section.columns).forEach(col => {
          componentCount += section.columns[col].length;
          section.columns[col] = [];
        });
      }
      
      this.isDirty = true;
      this._trackChange();
      
      // Dispatch event
      document.dispatchEvent(new CustomEvent('gmkb:section-cleared', {
        detail: { sectionId, componentCount }
      }));
      
      console.log(`✅ Cleared ${componentCount} components from section ${sectionId}`);
      return true;
    },

    /**
     * Reset component settings to defaults while preserving data
     * BEST PRACTICE: Preserves user content, only resets styling
     * @param {string} componentId - Component to reset
     * @returns {boolean} Success status
     */
    resetComponentSettings(componentId) {
      const component = this.components[componentId];
      if (!component) {
        console.warn(`Cannot reset component ${componentId} - not found`);
        return false;
      }
      
      // Get fresh defaults for this component type
      const defaults = getComponentDefaults(component.type);
      
      // Save current state for undo
      this._saveToHistory();
      
      // Reset only settings, preserve data and id
      this.components[componentId] = {
        ...component,
        settings: defaults,
        props: UnifiedComponentRegistry.getDefaultProps(component.type)
      };
      
      this.isDirty = true;
      this._trackChange();
      
      // Dispatch event for tracking/UI updates
      document.dispatchEvent(new CustomEvent('gmkb:component-reset', {
        detail: { 
          componentId,
          componentType: component.type,
          resetType: 'settings'
        }
      }));
      
      console.log(`✅ Reset settings for component ${componentId}`);
      return true;
    },

    /**
     * Reset component entirely (settings + data)
     * WARNING: More destructive - clears all user content
     * @param {string} componentId - Component to reset
     * @returns {boolean} Success status
     */
    resetComponent(componentId) {
      const component = this.components[componentId];
      if (!component) {
        console.warn(`Cannot reset component ${componentId} - not found`);
        return false;
      }
      
      // Save current state for undo
      this._saveToHistory();
      
      const defaults = getComponentDefaults(component.type);
      const defaultProps = UnifiedComponentRegistry.getDefaultProps(component.type);
      
      // Complete reset - back to factory state
      this.components[componentId] = {
        id: componentId,
        type: component.type,
        data: defaultProps,
        props: defaultProps,
        settings: defaults,
        schema: component.schema
      };
      
      this.isDirty = true;
      this._trackChange();
      
      // Dispatch event for tracking/UI updates
      document.dispatchEvent(new CustomEvent('gmkb:component-fully-reset', {
        detail: { 
          componentId,
          componentType: component.type,
          resetType: 'full'
        }
      }));
      
      console.log(`✅ Fully reset component ${componentId}`);
      return true;
    },

    /**
     * GEMINI FIX #2: Update column components (for drag-and-drop)
     * Moves column mutation from view layer to store action
     * Also tracks changes for history/auto-save
     */
    updateColumnComponents(sectionId, column, newComponents) {
      const section = this.sections.find(s => s.section_id === sectionId);
      if (!section) {
        console.warn(`⚠️ Section ${sectionId} not found`);
        return false;
      }
      
      // Initialize columns if needed
      if (!section.columns) {
        section.columns = this.getDefaultColumnsForLayout(section.type);
      }
      
      // Update the column
      section.columns[column] = newComponents;
      
      // Track change for history and auto-save
      this.isDirty = true;
      this._trackChange();
      
      console.log(`✅ Updated section ${sectionId} column ${column} with ${newComponents.length} components`);
      return true;
    }
  }
});
