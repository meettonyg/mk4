import { defineStore } from 'pinia';
import UnifiedComponentRegistry from '../vue/services/UnifiedComponentRegistry';
import { debounce } from '../utils/debounce';
import eventBus from '../services/EventBus.js';
import systemReadiness from '../services/SystemReadiness.js';

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
    
    // Meta state for error tracking and status
    isDirty: false,
    loadError: null,
    maxHistorySize: 30, // ROOT FIX: Reduced from 50 to 30 for better memory usage
    autoSaveEnabled: true, // ROOT FIX: Add auto-save toggle support
    
    // UI state
    selectedComponentId: null,
    selectedComponentIds: [], // For multi-select support
    hoveredComponentId: null,
    editingComponentId: null,
    editPanelOpen: false,
    isDragging: false,
    draggedComponentId: null,
    dropTargetId: null,
    componentLibraryOpen: false,  // Added for component library modal
    designPanelOpen: false,  // Added for design panel
    
    // Meta state
    lastSaved: null,
    hasUnsavedChanges: false,
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
      
      // ROOT FIX: Check if already initializing
      if (this.isInitializing) {
        console.warn('⚠️ Store is already initializing, waiting for completion...');
        // Wait for initialization to complete
        while (this.isInitializing && !this.isInitialized) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
        return { alreadyInitialized: true };
      }
      
      this.isInitializing = true;
      this.isLoading = true;
      this.loadError = null;

      try {
        // Emit initialization start event
        eventBus.emit('store:initializing');
        
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
            
            Object.keys(this.components).forEach(componentId => {
              const component = this.components[componentId];
              if (component) {
                podsIntegration.enrichComponentData(component);
              }
            });
            console.log('✅ Enriched all loaded components with Pods data (savedState branch)');
          }
        } else if (this.postId) {
          // ROOT FIX: Use APIService with REST URL (not AJAX URL)
          // Get APIService from window or create new instance
          const apiService = window.gmkbAPI || window.GMKB?.apiService || new (await import('../services/APIService.js')).APIService(
            window.gmkbData?.restUrl,     // ← Use REST URL
            window.gmkbData?.restNonce,   // ← Use REST nonce
            this.postId
          );

          // Load data via APIService (uses admin-ajax, not REST)
          data = await apiService.load();

          if (!data) {
            throw new Error('No data returned from API');
          }

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
          
          // ROOT FIX: Enrich ALL loaded components with Pods data
          if (window.podsDataIntegration || window.gmkbPodsIntegration) {
            const podsIntegration = window.podsDataIntegration || window.gmkbPodsIntegration;
            
            // CRITICAL FIX: Refresh Pods data source before enriching
            // The integration may have initialized before store had Pods data
            if (this.podsData && Object.keys(this.podsData).length > 0) {
              podsIntegration.podsData = this.podsData;
              console.log('✅ Updated PodsDataIntegration with store Pods data:', Object.keys(this.podsData).length, 'fields');
            }
            
            Object.keys(this.components).forEach(componentId => {
              const component = this.components[componentId];
              if (component) {
                podsIntegration.enrichComponentData(component);
              }
            });
            console.log('✅ Enriched all loaded components with Pods data');
          }
        }
        
        // Ensure at least one section exists
        if (this.sections.length === 0) {
          this.addSection('full_width');
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
        eventBus.emit('store:initialized', { 
          componentCount: Object.keys(this.components).length,
          sectionCount: this.sections.length 
        });
        
        console.log('✅ State initialized via APIService (admin-ajax)');
        return data;

      } catch (error) {
        console.error('Failed to initialize:', error);
        this.loadError = error.message;
        this.isInitializing = false; // Clear flag on error too
        eventBus.emit('store:error', error);
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
      if (!this.isDirty) return;
      
      try {
        this.isSaving = true;
        
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
        
        // OPTION C FIX: Use APIService which calls REST API v2
        const apiService = window.gmkbAPI || window.GMKB?.apiService;
        
        if (!apiService) {
          throw new Error('APIService not available');
        }
        
        const result = await apiService.save(state);
        
        // Check response
        if (!result || !result.success) {
          console.error('Save failed:', result);
          throw new Error('Save failed');
        }
        
        console.log('✅ Saved to WordPress via REST API v2:', result);
        this.isDirty = false;
        this.hasUnsavedChanges = false;
        this.lastSaved = Date.now();
        
        // Clear local backup after successful save
        this.clearLocalBackup();
        
        // Show success message
        if (typeof window.showToast === 'function') {
          window.showToast('Media kit saved successfully', 'success');
        }
        
        return true;
        
      } catch (error) {
        console.error('Failed to save:', error);
        throw error;
      } finally {
        this.isSaving = false;
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
      // ROOT FIX: Clean the component type if it contains content
      // Sometimes drag data includes content, extract just the type
      if (componentData.type && componentData.type.length > 50) {
        // Type is too long, likely contains content - try to extract actual type
        const typeMatch = componentData.type.toLowerCase().match(/^(hero|biography|topics|contact|testimonials|guest-intro|topics-questions|photo-gallery|logo-grid|call-to-action|social|stats|questions|video-intro|podcast-player|booking-calendar|authority-hook)/);
        if (typeMatch) {
          console.log('[Store] Extracted component type from content:', typeMatch[1]);
          componentData.type = typeMatch[1];
        }
      }
      
      // ROOT FIX: Validate component type to prevent unknown_type
      // Get valid types from the registry if available
      let validTypes = [
        'hero', 'biography', 'topics', 'contact', 'testimonials',
        'guest-intro', 'topics-questions', 'photo-gallery', 'logo-grid',
        'call-to-action', 'social', 'stats', 'questions',
        'video-intro', 'podcast-player', 'booking-calendar',
        'authority-hook'
      ];
      
      // ROOT FIX: Use the actual registry singleton (window.gmkbComponentRegistry)
      if (window.gmkbComponentRegistry) {
        const registryComponents = window.gmkbComponentRegistry.getAll();
        if (registryComponents && registryComponents.length > 0) {
          validTypes = registryComponents.map(comp => comp.type);
        }
      }
      
      // Prevent invalid component types
      if (!componentData.type || componentData.type === 'unknown_type' || !validTypes.includes(componentData.type)) {
        console.warn(`[Store] Invalid component type prevented: "${componentData.type}". Valid types:`, validTypes);
        
        // Log stack trace to find where this is coming from
        if (console.trace) {
          console.trace('Invalid component add attempt');
        }
        
        return null;
      }
      
      const componentId = componentData.id || `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Ensure we have at least one section
      if (this.sections.length === 0) {
        this.addSection('full_width');
      }
      
      // Get default props from unified component registry
      let defaultProps = {};
      let componentSchema = null;
      
      // Use the unified registry directly - no adapters needed
      const registryComponent = UnifiedComponentRegistry.get(componentData.type);
      if (registryComponent) {
        defaultProps = UnifiedComponentRegistry.getDefaultProps(componentData.type);
        componentSchema = registryComponent.schema || null;
      }
      
      // Create component with proper structure
      const component = {
        id: componentId,
        type: componentData.type,
        data: { ...defaultProps, ...(componentData.data || {}) },
        props: { ...defaultProps, ...(componentData.props || {}) },
        settings: componentData.settings || {},
        schema: componentSchema
      };
      
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
      if (this.components[componentId]) {
        this.components[componentId] = {
          ...this.components[componentId],
          ...updates
        };
        this.isDirty = true;
        this.hasUnsavedChanges = true;
        this._trackChange();
        
        // Dispatch update event
        document.dispatchEvent(new CustomEvent('gmkb:component-updated', {
          detail: { componentId, updates }
        }));
      }
    },



    // Apply state data to store
    applyState(savedState) {
      // CRITICAL FIX: Normalize section component references before applying
      if (savedState.sections) {
        this.sections = savedState.sections.map(section => {
          const normalized = { ...section };
          
          // Fix full-width sections
          if (section.components && Array.isArray(section.components)) {
            normalized.components = section.components.map(comp => {
              // If it's an object with component_id, extract the ID
              if (comp && typeof comp === 'object' && comp.component_id) {
                console.log('🔧 Normalizing object reference to string:', comp.component_id);
                return comp.component_id;
              }
              // If it's already a string, keep it
              return comp;
            }).filter(id => id && typeof id === 'string');
          }
          
          // Fix multi-column sections
          if (section.columns) {
            normalized.columns = {};
            Object.entries(section.columns).forEach(([col, components]) => {
              if (Array.isArray(components)) {
                normalized.columns[col] = components.map(comp => {
                  // If it's an object with component_id, extract the ID
                  if (comp && typeof comp === 'object' && comp.component_id) {
                    console.log('🔧 Normalizing column object reference to string:', comp.component_id);
                    return comp.component_id;
                  }
                  // If it's already a string, keep it
                  return comp;
                }).filter(id => id && typeof id === 'string');
              } else {
                normalized.columns[col] = [];
              }
            });
          }
          
          return normalized;
        });
      }
      
      if (savedState.components) {
        // Ensure components is an object, not array
        if (Array.isArray(savedState.components)) {
          this.components = {};
        } else {
          this.components = savedState.components;
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
      
      if (savedState.themeCustomizations) this.themeCustomizations = savedState.themeCustomizations;
      if (savedState.podsData) this.podsData = savedState.podsData;
      if (savedState.globalSettings) this.globalSettings = savedState.globalSettings;
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
      const sectionId = `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      
      // Generate new unique IDs
      const newSectionId = `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
            const newId = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
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
      
      // Emit duplication event
      eventBus.emit('section:duplicated', { 
        original: sectionId, 
        duplicate: newSectionId,
        componentCount: componentIdMap.size 
      });
      
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
        
        // Delete all collected components
        componentIdsToDelete.forEach(componentId => {
          delete this.components[componentId];
          console.log(`🗑️ Deleted component ${componentId} from section ${sectionId}`);
        });
        
        // Remove the section itself
        this.sections.splice(index, 1);
        
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

    // Offline handling with local storage backup
    backupToLocalStorage() {
      try {
        const backup = {
          components: this.components,
          sections: this.sections,
          theme: this.theme,
          timestamp: Date.now(),
          postId: this.postId
        };
        
        localStorage.setItem(`gmkb_backup_${this.postId}`, JSON.stringify(backup));
        console.log('📦 Local backup created');
      } catch (error) {
        console.warn('Local backup failed:', error);
      }
    },

    // Restore from local storage
    restoreFromLocalStorage() {
      try {
        const backup = localStorage.getItem(`gmkb_backup_${this.postId}`);
        if (backup) {
          const data = JSON.parse(backup);
          const age = Date.now() - data.timestamp;
          
          // Only restore if backup is less than 1 hour old
          if (age < 3600000) {
            this.initialize(data);
            console.log('♻️ Restored from local backup');
            return true;
          }
        }
        return false;
      } catch (error) {
        console.warn('Local restore failed:', error);
        return false;
      }
    },

    // Clear local backup after successful save
    clearLocalBackup() {
      try {
        localStorage.removeItem(`gmkb_backup_${this.postId}`);
      } catch (error) {
        console.warn('Clear backup failed:', error);
      }
    },

    // PHASE 3: Enhanced history management with size limits
    _saveToHistory() {
      if (!this.history) this.history = [];
      if (this.historyIndex === undefined) this.historyIndex = -1;
      
      // ROOT FIX: Don't save if state hasn't actually changed
      const currentState = {
        components: this.components,
        sections: this.sections
      };
      
      // Compare with last history entry
      if (this.history.length > 0) {
        const lastEntry = this.history[this.historyIndex];
        const hasChanged = JSON.stringify(currentState) !== JSON.stringify(lastEntry);
        if (!hasChanged) {
          return; // Skip duplicate history entries
        }
      }
      
      // Remove any forward history when adding new state
      this.history = this.history.slice(0, this.historyIndex + 1);
      
      // ROOT FIX: Compress history entry to save memory
      // Only store the differences for old entries
      const historyEntry = {
        components: JSON.parse(JSON.stringify(this.components)),
        sections: JSON.parse(JSON.stringify(this.sections)),
        timestamp: Date.now()
      };
      
      // Add current state to history
      this.history.push(historyEntry);
      
      // ROOT FIX: Enforce history size limit properly
      while (this.history.length > this.maxHistorySize) {
        // Remove oldest entry
        this.history.shift();
        // Adjust index
        if (this.historyIndex > 0) {
          this.historyIndex--;
        }
      }
      
      // Update index if we haven't hit the limit
      if (this.history.length <= this.maxHistorySize) {
        this.historyIndex = this.history.length - 1;
      }
      
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
        
        // Apply state without triggering history save
        this.$patch({
          components: JSON.parse(JSON.stringify(state.components)),
          sections: JSON.parse(JSON.stringify(state.sections))
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
        
        // Apply state without triggering history save
        this.$patch({
          components: JSON.parse(JSON.stringify(state.components)),
          sections: JSON.parse(JSON.stringify(state.sections))
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
      
      const newId = `${original.type}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // ROOT FIX: Deep clone component to prevent shared references
      this.components[newId] = {
        ...original,
        id: newId,
        data: JSON.parse(JSON.stringify(original.data || {})),
        props: JSON.parse(JSON.stringify(original.props || {})),
        settings: JSON.parse(JSON.stringify(original.settings || {}))
      };
      
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

    // Alias for backwards compatibility - now just calls save()
    async saveToWordPress() {
      return await this.save();
    },

    // NEW: Section settings management
    updateSection(sectionId, updates) {
      const section = this.sections.find(s => s.section_id === sectionId);
      if (section) {
        Object.assign(section, updates);
        this.isDirty = true;
        this._trackChange();
        
        // Dispatch update event
        document.dispatchEvent(new CustomEvent('gmkb:section-updated', {
          detail: { sectionId, updates }
        }));
      }
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
     */
    checkForOrphanedComponents() {
      const componentIds = Object.keys(this.components);
      
      if (componentIds.length === 0) {
        return { total: 0, orphaned: 0, inSections: 0, orphanedIds: [] };
      }
      
      // Collect all component IDs referenced in sections
      const componentsInSections = new Set();
      
      this.sections.forEach(section => {
        // Check full-width sections
        if (section.components && Array.isArray(section.components)) {
          section.components.forEach(comp => {
            const compId = typeof comp === 'string' ? comp : (comp.component_id || comp.id);
            if (compId) {
              componentsInSections.add(compId);
            }
          });
        }
        
        // Check multi-column sections
        if (section.columns) {
          Object.values(section.columns).forEach(column => {
            if (Array.isArray(column)) {
              column.forEach(compId => {
                if (compId) {
                  componentsInSections.add(compId);
                }
              });
            }
          });
        }
      });
      
      // Find orphaned components
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
      
      // Ensure at least one section exists
      if (this.sections.length === 0) {
        const sectionId = this.addSection('full_width');
        console.log('Created default section for orphaned components:', sectionId);
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
    }
  }
});
