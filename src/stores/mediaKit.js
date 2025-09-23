/**
 * Pinia Store - Single Source of Truth for Media Kit Builder
 * This replaces the legacy StateManager completely
 */
import { defineStore } from 'pinia';

export const useMediaKitStore = defineStore('mediaKit', {
  state: () => ({
    // Core state
    sections: [],
    components: {},
    theme: 'default',
    themeCustomizations: {},
    
    // UI state
    selectedComponentId: null,
    hoveredComponentId: null,
    editingComponentId: null,
    isDragging: false,
    
    // Meta state
    lastSaved: null,
    hasUnsavedChanges: false,
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
    
    // Helper to get components in order
    getComponentsInOrder() {
      return this.orderedComponents;
    }
  },

  actions: {
    // Initialize store with saved data from WordPress
    initialize(savedState) {
      if (savedState) {
        // Safely merge saved state
        if (savedState.sections) this.sections = savedState.sections;
        if (savedState.components) {
          // Ensure components is an object, not array
          if (Array.isArray(savedState.components)) {
            this.components = {};
          } else {
            this.components = savedState.components;
          }
        }
        if (savedState.theme) this.theme = savedState.theme;
        if (savedState.themeCustomizations) this.themeCustomizations = savedState.themeCustomizations;
      }
      
      // Ensure at least one section exists
      if (this.sections.length === 0) {
        this.addSection('full_width');
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

      this.hasUnsavedChanges = true;
      return sectionId;
    },

    // Remove a section
    removeSection(sectionId) {
      const index = this.sections.findIndex(s => s.section_id === sectionId);
      if (index > -1) {
        // Remove components in this section
        const section = this.sections[index];
        if (section.components) {
          section.components.forEach(compRef => {
            const componentId = typeof compRef === 'string' ? compRef : compRef.component_id;
            delete this.components[componentId];
          });
        }
        
        this.sections.splice(index, 1);
        this.hasUnsavedChanges = true;
      }
    },

    // Add a component
    addComponent(componentData) {
      const componentId = componentData.id || `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      
      // Ensure we have at least one section
      if (this.sections.length === 0) {
        this.addSection('full_width');
      }
      
      // Create component with proper structure
      const component = {
        id: componentId,
        type: componentData.type,
        data: componentData.data || {},
        props: componentData.props || {},
        settings: componentData.settings || {}
      };
      
      // ROOT FIX: Enrich component with Pods data configuration
      // Import and use PodsDataIntegration to configure component
      if (window.podsDataIntegration || window.gmkbPodsIntegration) {
        const podsIntegration = window.podsDataIntegration || window.gmkbPodsIntegration;
        podsIntegration.enrichComponentData(component);
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
      
      this.hasUnsavedChanges = true;
      
      // ROOT FIX: Trigger legacy system to render the component
      // Dispatch event for legacy renderer to pick up
      if (window.enhancedComponentManager?.addComponent) {
        // Use legacy component manager if available
        window.enhancedComponentManager.addComponent(component.type, component.data, targetSectionId);
      } else if (window.GMKB?.addComponent) {
        // Use GMKB global method
        window.GMKB.addComponent(component.type, component.data);
      } else {
        // Dispatch event for any listening systems
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
      }
      
      return componentId;
    },

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
      
      this.hasUnsavedChanges = true;
    },

    // Update component data
    updateComponent(componentId, updates) {
      if (this.components[componentId]) {
        this.components[componentId] = {
          ...this.components[componentId],
          ...updates
        };
        this.hasUnsavedChanges = true;
      }
    },

    // Move component within section
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
              this.hasUnsavedChanges = true;
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
                this.hasUnsavedChanges = true;
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
      
      // Clone the component
      this.components[newId] = {
        ...original,
        id: newId,
        data: { ...original.data },
        props: { ...original.props },
        settings: { ...original.settings }
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
            this.hasUnsavedChanges = true;
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
              this.hasUnsavedChanges = true;
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

    // Set selected component
    setSelectedComponent(componentId) {
      this.selectedComponentId = componentId;
    },

    // Open edit panel for component
    openEditPanel(componentId) {
      this.editingComponentId = componentId;
    },

    // Close edit panel
    closeEditPanel() {
      this.editingComponentId = null;
    },

    // Save state to WordPress
    async saveToWordPress() {
      try {
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
          layout: this.sections.map(s => s.section_id) // Add layout for compatibility
        };
        
        // Call WordPress AJAX endpoint
        const formData = new FormData();
        formData.append('action', 'gmkb_save_media_kit'); // ROOT FIX: Correct action name
        formData.append('nonce', window.gmkbData?.nonce || window.mkcg_vars?.nonce || '');
        formData.append('post_id', this.postId || window.gmkbData?.postId || window.gmkbData?.post_id || '');
        formData.append('state', JSON.stringify(state));
        
        const response = await fetch(window.gmkbData?.ajaxUrl || window.ajaxurl || '/wp-admin/admin-ajax.php', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          const text = await response.text();
          console.error('Save response:', text);
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const result = await response.json();
        
        if (result.success) {
          this.hasUnsavedChanges = false;
          this.lastSaved = Date.now();
          console.log('✅ State saved to WordPress');
          return result;
        } else {
          console.error('Save failed:', result);
          throw new Error(result.data?.message || result.data || 'Save failed');
        }
      } catch (error) {
        console.error('Failed to save to WordPress:', error);
        // Don't throw for certain errors
        if (error.message?.includes('Invalid nonce')) {
          console.warn('Nonce expired, user needs to refresh');
        }
        throw error;
      }
    }
  }
});
