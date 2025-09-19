/**
 * Biography Component Vue Renderer
 * ES6 Module version for Vite build
 */

import { createApp, ref, computed, reactive, onMounted, onUnmounted, h, watch, toRefs } from 'vue';

// Full-featured Biography Vue Component
const BiographyVue = {
  name: 'BiographyComponent',
  
  props: {
    biography: { type: String, default: '' },
    title: { type: String, default: 'Biography' },
    showTitle: { type: Boolean, default: true },
    alignment: { type: String, default: 'left' },
    fontSize: { type: String, default: 'medium' },
    preserveLineBreaks: { type: Boolean, default: true },
    componentId: { type: String, required: true }
  },
  
  setup(props) {
    // ROOT FIX: Use props.biography which already contains the Pods data
    // ROOT FIX: Get pods data from the correct location
    const podsData = window.gmkbData?.pods_data || window.gmkbData?.podsData || window.gmkbVueData?.pods_data || window.gmkbVueData?.podsData || {};
    
    // Reactive state - use the biography from props
    const state = reactive({
      isSelected: false,
      isEditing: false,
      showDesignPanel: false,
      localBiography: props.biography || '', // Use the prop value
      localTitle: props.title || 'Biography',
      localShowTitle: props.showTitle !== undefined ? props.showTitle : true,
      localAlignment: props.alignment || 'left',
      localFontSize: props.fontSize || 'medium',
      localPreserveLineBreaks: props.preserveLineBreaks !== undefined ? props.preserveLineBreaks : true
    });
    
    // Initial state setup - logging removed for cleaner console
    
    // Watch for prop changes and update local state
    watch(() => props.biography, (newBiography) => {
      if (!state.isEditing) {
        state.localBiography = newBiography || '';
      }
    }, { immediate: true }); // Run immediately on mount
    
    // Format biography for display
    const formattedBiography = computed(() => {
      // Use localBiography if available, fallback to prop
      const content = state.localBiography || props.biography || '';
      if (!content) return '';
      
      let formatted = content;
      if (state.localPreserveLineBreaks) {
        formatted = formatted.replace(/\n\n/g, '</p><p>');
        formatted = formatted.replace(/\n/g, '<br>');
        formatted = `<p>${formatted}</p>`;
      }
      return formatted;
    });
    
    // Component methods
    const handleClick = (e) => {
      if (e.target.closest('.component-controls') || e.target.closest('.biography__edit-mode')) {
        return;
      }
      state.isSelected = true;
    };
    
    const startEdit = () => {
      state.isEditing = true;
    };
    
    const saveBiography = () => {
      state.isEditing = false;
      updateComponent();
    };
    
    const cancelEdit = () => {
      state.localBiography = props.biography || '';
      state.isEditing = false;
    };
    
    const openEditPanel = () => {
      console.log('Biography: openEditPanel called - rendering in sidebar');
      
      // ROOT FIX: Render in the existing sidebar, not as a separate overlay
      const componentTab = document.getElementById('components-tab');
      if (!componentTab) {
        console.error('Biography: components-tab not found!');
        return;
      }
      
      // Store original content to restore later
      const originalContent = componentTab.innerHTML;
      
      // Set state
      state.showDesignPanel = true;
      
      // Render the edit panel in the sidebar
      componentTab.innerHTML = `
        <div class="component-edit-panel">
          <div class="edit-panel-header">
            <button class="back-btn" id="bio-back-btn">← Back to Components</button>
            <h3>Edit Biography</h3>
          </div>
          <div class="edit-panel-content">
            <div class="form-group">
              <label>
                <input type="checkbox" id="bio-show-title" ${state.localShowTitle ? 'checked' : ''}>
                Show Title
              </label>
            </div>
            
            ${state.localShowTitle ? `
              <div class="form-group">
                <label>Title Text</label>
                <input type="text" id="bio-title" value="${state.localTitle}" placeholder="Biography">
              </div>
            ` : ''}
            
            <div class="form-group">
              <label>Biography Text</label>
              <textarea id="bio-content" rows="10" placeholder="Enter biography text here...">${state.localBiography}</textarea>
            </div>
            
            ${podsData.biography ? `
              <button class="btn btn--secondary btn--sm" id="bio-load-pods">Load from Guest Post Data</button>
            ` : ''}
            
            <div class="form-group">
              <h4 style="margin-top: 20px; margin-bottom: 10px;">Display Options</h4>
              
              <label>Text Alignment</label>
              <select id="bio-alignment" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;">
                <option value="left" ${state.localAlignment === 'left' ? 'selected' : ''}>Left</option>
                <option value="center" ${state.localAlignment === 'center' ? 'selected' : ''}>Center</option>
                <option value="right" ${state.localAlignment === 'right' ? 'selected' : ''}>Right</option>
                <option value="justify" ${state.localAlignment === 'justify' ? 'selected' : ''}>Justify</option>
              </select>
              
              <label>Font Size</label>
              <select id="bio-font-size" style="width: 100%; padding: 8px; border: 1px solid #ddd; border-radius: 4px; margin-bottom: 10px;">
                <option value="small" ${state.localFontSize === 'small' ? 'selected' : ''}>Small</option>
                <option value="medium" ${state.localFontSize === 'medium' ? 'selected' : ''}>Medium</option>
                <option value="large" ${state.localFontSize === 'large' ? 'selected' : ''}>Large</option>
              </select>
              
              <label>
                <input type="checkbox" id="bio-preserve-breaks" ${state.localPreserveLineBreaks ? 'checked' : ''}>
                Preserve Line Breaks
              </label>
            </div>
            
            <div class="edit-actions" style="margin-top: 20px; display: flex; gap: 10px;">
              <button class="save-btn" id="bio-save-btn" style="padding: 10px 20px; background: #4CAF50; color: white; border: none; border-radius: 4px; cursor: pointer;">Save Changes</button>
              <button class="cancel-btn" id="bio-cancel-btn" style="padding: 10px 20px; background: #f0f0f0; color: #333; border: none; border-radius: 4px; cursor: pointer;">Cancel</button>
            </div>
          </div>
        </div>
      `;
      
      // Attach event handlers
      setTimeout(() => {
        // Back button
        const backBtn = document.getElementById('bio-back-btn');
        if (backBtn) {
          backBtn.onclick = () => {
            componentTab.innerHTML = originalContent;
            state.showDesignPanel = false;
          };
        }
        
        // Cancel button
        const cancelBtn = document.getElementById('bio-cancel-btn');
        if (cancelBtn) {
          cancelBtn.onclick = () => {
            componentTab.innerHTML = originalContent;
            state.showDesignPanel = false;
          };
        }
        
        // Save button
        const saveBtn = document.getElementById('bio-save-btn');
        if (saveBtn) {
          saveBtn.onclick = () => {
            // Get values from form
            state.localShowTitle = document.getElementById('bio-show-title')?.checked;
            state.localTitle = document.getElementById('bio-title')?.value || 'Biography';
            state.localBiography = document.getElementById('bio-content')?.value || '';
            state.localAlignment = document.getElementById('bio-alignment')?.value || 'left';
            state.localFontSize = document.getElementById('bio-font-size')?.value || 'medium';
            state.localPreserveLineBreaks = document.getElementById('bio-preserve-breaks')?.checked;
            
            // Update component
            updateComponent();
            
            // Restore sidebar
            componentTab.innerHTML = originalContent;
            state.showDesignPanel = false;
          };
        }
        
        // Load from Pods button
        const loadPodsBtn = document.getElementById('bio-load-pods');
        if (loadPodsBtn) {
          loadPodsBtn.onclick = () => {
            const textarea = document.getElementById('bio-content');
            if (textarea && podsData.biography) {
              textarea.value = podsData.biography;
            }
          };
        }
        
        // Handle show/hide title
        const showTitleCheckbox = document.getElementById('bio-show-title');
        if (showTitleCheckbox) {
          showTitleCheckbox.onchange = () => {
            // Re-render to show/hide title field
            openEditPanel();
          };
        }
        
        // Handle live updates
        const contentTextarea = document.getElementById('bio-content');
        if (contentTextarea) {
          contentTextarea.oninput = () => {
            state.localBiography = contentTextarea.value;
          };
        }
      }, 0);
      
      console.log('Biography: Edit panel rendered in sidebar');
    };
    
    const closeDesignPanel = () => {
      console.log('Biography: closeDesignPanel called');
      state.showDesignPanel = false;
      
      // The sidebar content is restored by the edit panel handlers
      // No need to clean up separate panels since we're using the sidebar
    };
    
    const updateComponent = () => {
      // ROOT FIX: Only save configuration, not content
      const config = {
        title: state.localTitle,
        showTitle: state.localShowTitle,
        alignment: state.localAlignment,
        fontSize: state.localFontSize,
        preserveLineBreaks: state.localPreserveLineBreaks
      };
      
      // If biography was edited, it should update Pods, not component state
      // This would require an API call to update the custom post field
      
      // Update state manager with configuration only
      if (window.GMKB?.stateManager) {
        window.GMKB.stateManager.updateComponent(props.componentId, {
          config: config,
          // Don't store content in data or props
          data: { dataSource: 'pods', field: 'guest_biography' },
          props: {}
        });
      }
      
      // Emit update event
      document.dispatchEvent(new CustomEvent('gmkb:component-updated', {
        detail: { componentId: props.componentId, updates: config }
      }));
    };
    
    const moveUp = () => {
      document.dispatchEvent(new CustomEvent('gmkb:component-action', {
        detail: { action: 'move-up', componentId: props.componentId }
      }));
    };
    
    const moveDown = () => {
      document.dispatchEvent(new CustomEvent('gmkb:component-action', {
        detail: { action: 'move-down', componentId: props.componentId }
      }));
    };
    
    const duplicate = () => {
      document.dispatchEvent(new CustomEvent('gmkb:component-action', {
        detail: { action: 'duplicate', componentId: props.componentId }
      }));
    };
    
    const deleteComponent = () => {
      if (confirm('Delete this biography component?')) {
        document.dispatchEvent(new CustomEvent('gmkb:component-action', {
          detail: { action: 'delete', componentId: props.componentId }
        }));
      }
    };
    
    // Global click handler
    const handleGlobalClick = (e) => {
      if (!e.target.closest(`[data-component-id="${props.componentId}"]`)) {
        state.isSelected = false;
      }
    };
    
    // ESC key handler
    const handleEscKey = (e) => {
      if (e.key === 'Escape') {
        if (state.showDesignPanel) {
          closeDesignPanel();
        } else if (state.isEditing) {
          cancelEdit();
        }
      }
    };
    
    // ROOT FIX: Listen for edit panel open event
    const handleOpenEditPanel = (e) => {
      console.log('Biography: Document received gmkb:open-vue-panel event', e.detail);
      if (e.detail?.componentId === props.componentId) {
        console.log('Biography: Opening edit panel for', props.componentId);
        openEditPanel();
      }
    };
    
    // ROOT FIX: Create a stable reference for the element listener
    const handleElementEditPanel = (e) => {
      console.log('Biography: Element received open-edit-panel event', e.detail);
      if (!e.detail?.componentId || e.detail.componentId === props.componentId) {
        console.log('Biography: Opening edit panel from element event');
        openEditPanel();
      }
    };
    
    // Lifecycle
    onMounted(() => {
      document.addEventListener('click', handleGlobalClick);
      document.addEventListener('keydown', handleEscKey);
      
      // ROOT FIX: Add the MISSING event listener that was accidentally removed!
      document.addEventListener('gmkb:open-vue-panel', handleOpenEditPanel);
      
      // Also listen for direct element events from UnifiedEditManager
      const componentEl = document.querySelector(`[data-component-id="${props.componentId}"]`);
      if (componentEl) {
        // ROOT FIX: Use the stable reference for proper cleanup
        componentEl.addEventListener('open-edit-panel', handleElementEditPanel);
        
        // Register this instance for direct access
        componentEl._biographyInstance = {
          openEditPanel
        };
      }
      
      // Auto-load from props if the local state is empty
      if (!state.localBiography && props.biography) {
        state.localBiography = props.biography;
      }
    });
    
    onUnmounted(() => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('keydown', handleEscKey);
      // ROOT FIX: Remove edit panel event listener
      document.removeEventListener('gmkb:open-vue-panel', handleOpenEditPanel);
      
      // ROOT FIX: Properly remove element listener using the stable reference
      const componentEl = document.querySelector(`[data-component-id="${props.componentId}"]`);
      if (componentEl) {
        componentEl.removeEventListener('open-edit-panel', handleElementEditPanel);
      }
      
      closeDesignPanel();
    });
    
    // Return everything needed by the render function
    return {
      state,
      formattedBiography,
      handleClick,
      startEdit,
      saveBiography,
      cancelEdit,
      openEditPanel,
      moveUp,
      moveDown,
      duplicate,
      deleteComponent,
      // Also expose these for debugging
      biography: props.biography,
      localBiography: state.localBiography
    };
  },
  
  // Render function instead of template
  render() {
    const {
      state,
      formattedBiography,
      handleClick,
      startEdit,
      saveBiography,
      cancelEdit,
      openEditPanel,
      moveUp,
      moveDown,
      duplicate,
      deleteComponent
    } = this;
    
    // Component rendering - logging removed
    
    return h('div', {
      class: ['biography-component', 'gmkb-component', state.isSelected && 'is-selected'],
      'data-component-id': this.componentId,
      onClick: handleClick
    }, [
      // Controls removed - handled by unified ControlsOverlay system
      
      // Biography Content
      h('div', { 
        class: 'biography__content',
        style: { textAlign: state.localAlignment }
      }, [
        state.localShowTitle && h('h2', { class: 'biography__title' }, state.localTitle),
        
        // Edit Mode
        state.isEditing ? h('div', { class: 'biography__edit-mode' }, [
          h('textarea', {
            class: 'biography__textarea',
            value: state.localBiography,
            onInput: (e) => { state.localBiography = e.target.value; },
            onBlur: saveBiography,
            onKeydown: (e) => { if (e.key === 'Escape') cancelEdit(); },
            placeholder: 'Enter biography text here...'
          }),
          h('div', { class: 'biography__edit-actions' }, [
            h('button', { class: 'btn btn--primary btn--sm', onClick: saveBiography }, 'Save'),
            h('button', { class: 'btn btn--secondary btn--sm', onClick: cancelEdit }, 'Cancel')
          ])
        ]) : 
        
        // Display Mode - Always show the biography div
        h('div', { 
          class: ['biography__text', `biography__text--${state.localFontSize}`],
          innerHTML: state.localBiography ? 
            (state.localPreserveLineBreaks ? 
              `<p>${state.localBiography.replace(/\n\n/g, '</p><p>').replace(/\n/g, '<br>')}</p>` : 
              `<p>${state.localBiography}</p>`) : 
            '<p style="color: var(--gmkb-color-text-light, #94a3b8); font-style: italic;">No biography content available. Double-click to add.</p>',
          onDblclick: startEdit,
          'data-editable': 'biography',
          style: { 
            display: 'block', 
            minHeight: '50px',
            padding: '15px',
            backgroundColor: state.localBiography ? 'transparent' : 'rgba(255,255,255,0.05)',
            border: state.localBiography ? 'none' : '1px dashed rgba(255,255,255,0.1)',
            cursor: 'text'
          }
        })
      ])
    ]);
  }
};

export default {
  name: 'biography',
  
  render(data = {}, container) {
    if (!container) {
      console.error('Biography Vue renderer: No container provided');
      return null;
    }
    
    // ROOT FIX: Get Pods data from all possible sources
    const podsData = window.gmkbData?.pods_data || 
                     window.gmkbData?.podsData || 
                     window.gmkbVueData?.pods_data || 
                     window.gmkbVueData?.podsData || 
                     {};
    
    // ROOT FIX: Always fetch content from Pods, configuration from component
    // Process received data
    
    // Check all possible field names for biography
    const biographyContent = podsData.guest_biography || 
                           podsData.biography || 
                           podsData.Biography || 
                           podsData.bio || 
                           '';

    
    const props = {
      // Content ALWAYS comes from Pods data
      biography: biographyContent,
      // Configuration from component (handle both old and new structure)
      title: data.config?.title || data.title || 'Biography',
      showTitle: data.config?.showTitle !== undefined ? data.config.showTitle : (data.showTitle !== undefined ? data.showTitle : true),
      alignment: data.config?.alignment || data.alignment || 'left',
      fontSize: data.config?.fontSize || data.fontSize || 'medium',
      preserveLineBreaks: data.config?.preserveLineBreaks !== undefined ? data.config.preserveLineBreaks : (data.preserveLineBreaks !== undefined ? data.preserveLineBreaks : true),
      componentId: data.id || data.componentId || `biography_${Date.now()}`
    };

    
    // ROOT FIX: Force a re-render after mount to ensure content displays
    // Create and mount Vue app
    const app = createApp(BiographyVue, props);
    const instance = app.mount(container);

    
    // Force update to ensure content displays
    setTimeout(() => {
      if (instance.$forceUpdate) {
        instance.$forceUpdate();
      }
    }, 0);
    
    // Store app reference for cleanup
    container._vueApp = app;
    
    return instance;
  },
  
  update(data, container) {
    this.destroy(container);
    this.render(data, container);
  },
  
  destroy(container) {
    if (container && container._vueApp) {
      container._vueApp.unmount();
      delete container._vueApp;
    }
  },
  
  isVueRenderer: true,
  framework: 'vue'
};
