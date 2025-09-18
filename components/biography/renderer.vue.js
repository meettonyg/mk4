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
      // Component Controls with Professional SVG Icons
      state.isSelected && h('div', { class: 'component-controls' }, [
        h('button', { 
          class: 'control-btn control-btn--move-up', 
          title: 'Move Up', 
          onClick: (e) => { e.stopPropagation(); moveUp(); }
        }, [
          h('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
            h('line', { x1: '12', y1: '19', x2: '12', y2: '5' }),
            h('polyline', { points: '5 12 12 5 19 12' })
          ])
        ]),
        h('button', { 
          class: 'control-btn control-btn--move-down', 
          title: 'Move Down', 
          onClick: (e) => { e.stopPropagation(); moveDown(); }
        }, [
          h('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
            h('line', { x1: '12', y1: '5', x2: '12', y2: '19' }),
            h('polyline', { points: '19 12 12 19 5 12' })
          ])
        ]),
        h('button', { 
          class: 'control-btn control-btn--edit', 
          title: 'Edit', 
          onClick: (e) => { 
            e.stopPropagation(); 
            // Dispatch event for sidebar edit panel
            document.dispatchEvent(new CustomEvent('gmkb:component-action', {
              detail: { action: 'edit', componentId: props.componentId }
            }));
          }
        }, [
          h('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
            h('path', { d: 'M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7' }),
            h('path', { d: 'M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z' })
          ])
        ]),
        h('button', { 
          class: 'control-btn control-btn--duplicate', 
          title: 'Duplicate', 
          onClick: (e) => { e.stopPropagation(); duplicate(); }
        }, [
          h('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
            h('rect', { x: '9', y: '9', width: '13', height: '13', rx: '2', ry: '2' }),
            h('path', { d: 'M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1' })
          ])
        ]),
        h('button', { 
          class: 'control-btn control-btn--delete', 
          title: 'Delete', 
          onClick: (e) => { e.stopPropagation(); deleteComponent(); }
        }, [
          h('svg', { width: '16', height: '16', viewBox: '0 0 24 24', fill: 'none', stroke: 'currentColor', 'stroke-width': '2' }, [
            h('polyline', { points: '3 6 5 6 21 6' }),
            h('path', { d: 'M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2' })
          ])
        ])
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
