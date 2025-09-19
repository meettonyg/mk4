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
    postId: window.gmkbData?.postId || null
  }),

  getters: {
    // Get all components in render order
    orderedComponents: (state) => {
      const ordered = [];
      state.sections.forEach(section => {
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
      });
      return ordered;
    },

    // Get components for a specific section
    getSectionComponents: (state) => (sectionId) => {
      const section = state.sections.find(s => s.section_id === sectionId);
      if (!section || !section.components) return [];
      
      return section.components.map(compRef => {
        const componentId = typeof compRef === 'string' ? compRef : compRef.component_id;
        return state.components[componentId];
      }).filter(Boolean);
    },

    // Check if component is first in its section
    isComponentFirst: (state) => (componentId) => {
      for (const section of state.sections) {
        if (!section.components) continue;
        const index = section.components.findIndex(comp => 
          (typeof comp === 'string' ? comp : comp.component_id) === componentId
        );
        if (index > -1) {
          return index === 0;
        }
      }
      return false;
    },

    // Check if component is last in its section
    isComponentLast: (state) => (componentId) => {
      for (const section of state.sections) {
        if (!section.components) continue;
        const index = section.components.findIndex(comp => 
          (typeof comp === 'string' ? comp : comp.component_id) === componentId
        );
        if (index > -1) {
          return index === section.components.length - 1;
        }
      }
      return false;
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
        components: [],
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
      const section = this.sections.find(s => s.section_id === targetSectionId);
      
      if (section) {
        if (!section.components) section.components = [];
        section.components.push(componentId);
      }
      
      this.hasUnsavedChanges = true;
      return componentId;
    },

    // Remove a component
    removeComponent(componentId) {
      // Remove from components map
      delete this.components[componentId];
      
      // Remove from all sections
      this.sections.forEach(section => {
        if (section.components) {
          section.components = section.components.filter(comp => 
            (typeof comp === 'string' ? comp : comp.component_id) !== componentId
          );
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
        if (!section.components) continue;
        
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
          break;
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
        if (!section.components) continue;
        
        const index = section.components.findIndex(comp => 
          (typeof comp === 'string' ? comp : comp.component_id) === componentId
        );
        
        if (index > -1) {
          section.components.splice(index + 1, 0, newId);
          break;
        }
      }
      
      this.hasUnsavedChanges = true;
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
        const state = {
          components: this.components,
          sections: this.sections,
          theme: this.theme,
          themeCustomizations: this.themeCustomizations
        };
        
        // Call WordPress AJAX endpoint
        const formData = new FormData();
        formData.append('action', 'gmkb_save_state');
        formData.append('nonce', window.gmkbData?.nonce || '');
        formData.append('post_id', this.postId || '');
        formData.append('state', JSON.stringify(state));
        
        const response = await fetch(window.gmkbData?.ajaxUrl || '/wp-admin/admin-ajax.php', {
          method: 'POST',
          body: formData
        });
        
        const result = await response.json();
        
        if (result.success) {
          this.hasUnsavedChanges = false;
          this.lastSaved = Date.now();
          console.log('✅ State saved to WordPress');
        } else {
          throw new Error(result.data?.message || 'Save failed');
        }
      } catch (error) {
        console.error('Failed to save to WordPress:', error);
        throw error;
      }
    }
  }
});
