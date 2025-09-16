/**
 * Biography Component Vue Renderer
 * ES6 Module version for Vite build
 */

import { createApp, ref, computed, reactive, onMounted, onUnmounted, h } from 'vue';

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
    const podsData = window.gmkbData?.pods_data || {};
    
    // Reactive state - use the biography from props
    const state = reactive({
      isSelected: false,
      isEditing: false,
      showDesignPanel: false,
      localBiography: props.biography || '', // Use the prop value
      localTitle: props.title,
      localShowTitle: props.showTitle,
      localAlignment: props.alignment,
      localFontSize: props.fontSize,
      localPreserveLineBreaks: props.preserveLineBreaks
    });
    
    // Format biography for display
    const formattedBiography = computed(() => {
      if (!state.localBiography) return '';
      
      let formatted = state.localBiography;
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
      state.showDesignPanel = true;
      document.body.classList.add('design-panel-open');
      
      // Create and append design panel to body
      const panelContainer = document.createElement('div');
      panelContainer.id = `design-panel-${props.componentId}`;
      document.body.appendChild(panelContainer);
      
      // Create design panel app
      const DesignPanel = {
        setup() {
          return () => h('div', { 
            class: 'design-panel',
            onClick: (e) => {
              if (e.target.classList.contains('design-panel')) {
                closeDesignPanel();
              }
            }
          }, [
            h('div', { class: 'design-panel__content' }, [
              h('div', { class: 'design-panel__header' }, [
                h('h3', 'Edit Biography'),
                h('button', { 
                  class: 'design-panel__close',
                  onClick: closeDesignPanel
                }, '×')
              ]),
              h('div', { class: 'design-panel__body' }, [
                // Title Settings
                h('div', { class: 'design-panel__section' }, [
                  h('label', { class: 'design-panel__label' }, [
                    h('input', {
                      type: 'checkbox',
                      checked: state.localShowTitle,
                      onChange: (e) => {
                        state.localShowTitle = e.target.checked;
                        updateComponent();
                      }
                    }),
                    ' Show Title'
                  ])
                ]),
                
                state.localShowTitle && h('div', { class: 'design-panel__section' }, [
                  h('label', { class: 'design-panel__label' }, 'Title Text'),
                  h('input', {
                    type: 'text',
                    class: 'design-panel__input',
                    value: state.localTitle,
                    onInput: (e) => {
                      state.localTitle = e.target.value;
                      updateComponent();
                    },
                    placeholder: 'Biography'
                  })
                ]),
                
                // Biography Text
                h('div', { class: 'design-panel__section' }, [
                  h('label', { class: 'design-panel__label' }, 'Biography Text'),
                  h('textarea', {
                    class: 'design-panel__textarea',
                    value: state.localBiography,
                    onInput: (e) => {
                      state.localBiography = e.target.value;
                      updateComponent();
                    },
                    rows: 10,
                    placeholder: 'Enter biography text here...'
                  }),
                  
                  podsData.biography && h('button', {
                    class: 'btn btn--secondary btn--sm mt-2',
                    onClick: () => {
                      state.localBiography = podsData.biography;
                      updateComponent();
                    }
                  }, 'Load from Guest Post Data')
                ]),
                
                // Display Options
                h('div', { class: 'design-panel__section' }, [
                  h('h4', { class: 'design-panel__subtitle' }, 'Display Options'),
                  
                  h('label', { class: 'design-panel__label' }, 'Text Alignment'),
                  h('select', {
                    class: 'design-panel__select',
                    value: state.localAlignment,
                    onChange: (e) => {
                      state.localAlignment = e.target.value;
                      updateComponent();
                    }
                  }, [
                    h('option', { value: 'left' }, 'Left'),
                    h('option', { value: 'center' }, 'Center'),
                    h('option', { value: 'right' }, 'Right'),
                    h('option', { value: 'justify' }, 'Justify')
                  ]),
                  
                  h('label', { class: 'design-panel__label' }, 'Font Size'),
                  h('select', {
                    class: 'design-panel__select',
                    value: state.localFontSize,
                    onChange: (e) => {
                      state.localFontSize = e.target.value;
                      updateComponent();
                    }
                  }, [
                    h('option', { value: 'small' }, 'Small'),
                    h('option', { value: 'medium' }, 'Medium'),
                    h('option', { value: 'large' }, 'Large')
                  ]),
                  
                  h('label', { class: 'design-panel__label' }, [
                    h('input', {
                      type: 'checkbox',
                      checked: state.localPreserveLineBreaks,
                      onChange: (e) => {
                        state.localPreserveLineBreaks = e.target.checked;
                        updateComponent();
                      }
                    }),
                    ' Preserve Line Breaks'
                  ])
                ])
              ]),
              h('div', { class: 'design-panel__footer' }, [
                h('button', {
                  class: 'btn btn--primary',
                  onClick: () => {
                    updateComponent();
                    closeDesignPanel();
                  }
                }, 'Save & Close')
              ])
            ])
          ]);
        }
      };
      
      const panelApp = createApp(DesignPanel);
      panelApp.mount(panelContainer);
      
      // Store panel app reference
      window[`designPanel_${props.componentId}`] = panelApp;
    };
    
    const closeDesignPanel = () => {
      state.showDesignPanel = false;
      document.body.classList.remove('design-panel-open');
      
      // Clean up design panel
      const panelContainer = document.getElementById(`design-panel-${props.componentId}`);
      if (panelContainer) {
        const panelApp = window[`designPanel_${props.componentId}`];
        if (panelApp) {
          panelApp.unmount();
          delete window[`designPanel_${props.componentId}`];
        }
        panelContainer.remove();
      }
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
    
    // Lifecycle
    onMounted(() => {
      document.addEventListener('click', handleGlobalClick);
      document.addEventListener('keydown', handleEscKey);
      
      // Auto-load from props if the local state is empty
      if (!state.localBiography && props.biography) {
        state.localBiography = props.biography;
      }
    });
    
    onUnmounted(() => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('keydown', handleEscKey);
      closeDesignPanel();
    });
    
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
      deleteComponent
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
    
    return h('div', {
      class: ['biography-component', 'gmkb-component', state.isSelected && 'is-selected'],
      'data-component-id': this.componentId,
      onClick: handleClick
    }, [
      // Component Controls
      state.isSelected && h('div', { class: 'component-controls' }, [
        h('button', { class: 'control-btn', title: 'Move Up', onClick: (e) => { e.stopPropagation(); moveUp(); } }, '↑'),
        h('button', { class: 'control-btn', title: 'Move Down', onClick: (e) => { e.stopPropagation(); moveDown(); } }, '↓'),
        h('button', { class: 'control-btn', title: 'Edit', onClick: (e) => { e.stopPropagation(); openEditPanel(); } }, '✏️'),
        h('button', { class: 'control-btn', title: 'Duplicate', onClick: (e) => { e.stopPropagation(); duplicate(); } }, '📋'),
        h('button', { class: 'control-btn control-btn--danger', title: 'Delete', onClick: (e) => { e.stopPropagation(); deleteComponent(); } }, '🗑️')
      ]),
      
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
        
        // Display Mode
        state.localBiography ? 
          h('div', { 
            class: ['biography__text', `biography__text--${state.localFontSize}`],
            innerHTML: formattedBiography.value,
            onDblclick: startEdit,
            'data-editable': 'biography'
          }) :
          
        // Empty State
        h('div', { class: 'biography__empty' }, [
          h('p', 'No biography available.'),
          h('button', { class: 'btn btn--primary btn--sm', onClick: startEdit }, 'Add Biography')
        ])
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
    
    const podsData = window.gmkbData?.pods_data || {};
    
    // ROOT FIX: Always fetch content from Pods, configuration from component
    // Debug what we're receiving
    console.log('Biography renderer received data:', data);
    console.log('Available Pods data:', podsData);
    
    const props = {
      // Content ALWAYS comes from Pods data - check both possible field names
      biography: podsData.guest_biography || podsData.biography || podsData.Biography || '',
      // Configuration from component (handle both old and new structure)
      title: data.config?.title || data.title || 'Biography',
      showTitle: data.config?.showTitle !== undefined ? data.config.showTitle : (data.showTitle !== undefined ? data.showTitle : true),
      alignment: data.config?.alignment || data.alignment || 'left',
      fontSize: data.config?.fontSize || data.fontSize || 'medium',
      preserveLineBreaks: data.config?.preserveLineBreaks !== undefined ? data.config.preserveLineBreaks : (data.preserveLineBreaks !== undefined ? data.preserveLineBreaks : true),
      componentId: data.id || data.componentId || `biography_${Date.now()}`
    };
    
    console.log('Biography props being passed to Vue component:', props);
    
    // Create and mount Vue app
    const app = createApp(BiographyVue, props);
    const instance = app.mount(container);
    
    console.log('✅ Biography Vue component mounted with full features');
    
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
