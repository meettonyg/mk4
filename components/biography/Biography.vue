<template>
  <div 
    class="biography-component gmkb-component"
    :data-component-id="componentId"
    @click="handleClick"
  >
    <!-- Controls removed - now handled by unified Vue ControlsOverlay -->

    <!-- Biography Content -->
    <div class="biography__content">
      <h2 class="biography__title" v-if="showTitle">{{ title }}</h2>
      
      <!-- Edit Mode -->
      <div v-if="isEditing" class="biography__edit-mode">
        <textarea
          v-model="localBiography"
          class="biography__textarea"
          :placeholder="placeholder"
          @blur="saveBiography"
          @keydown.esc="cancelEdit"
          ref="bioTextarea"
        ></textarea>
        <div class="biography__edit-actions">
          <button @click="saveBiography" class="btn btn--primary btn--sm">Save</button>
          <button @click="cancelEdit" class="btn btn--secondary btn--sm">Cancel</button>
        </div>
      </div>
      
      <!-- Display Mode -->
      <div v-else class="biography__text" v-html="formattedBiography"></div>
      
      <!-- Empty State -->
      <div v-if="!biography && !isEditing" class="biography__empty">
        <p>No biography available.</p>
        <button @click="startEdit" class="btn btn--primary btn--sm">Add Biography</button>
      </div>
    </div>

    <!-- Design Panel (Sidebar) -->
    <Teleport to="body" v-if="showDesignPanel">
      <div class="design-panel" @click.self="closeDesignPanel">
        <div class="design-panel__content">
          <div class="design-panel__header">
            <h3>Edit Biography</h3>
            <button @click="closeDesignPanel" class="design-panel__close">×</button>
          </div>
          
          <div class="design-panel__body">
            <!-- Title Settings -->
            <div class="design-panel__section">
              <label class="design-panel__label">
                <input type="checkbox" v-model="showTitle" @change="updateComponent">
                Show Title
              </label>
            </div>
            
            <div class="design-panel__section" v-if="showTitle">
              <label class="design-panel__label">Title Text</label>
              <input 
                type="text" 
                v-model="title" 
                @input="updateComponent"
                class="design-panel__input"
                placeholder="Biography"
              >
            </div>

            <!-- Biography Text -->
            <div class="design-panel__section">
              <label class="design-panel__label">Biography Text</label>
              <textarea 
                v-model="localBiography"
                @input="updateComponent"
                class="design-panel__textarea"
                rows="10"
                :placeholder="placeholder"
              ></textarea>
              
              <!-- Load from Pods Data -->
              <button 
                v-if="podsData?.biography" 
                @click="loadFromPods"
                class="btn btn--secondary btn--sm mt-2"
              >
                Load from Guest Post Data
              </button>
            </div>

            <!-- Display Options -->
            <div class="design-panel__section">
              <h4 class="design-panel__subtitle">Display Options</h4>
              
              <label class="design-panel__label">Text Alignment</label>
              <select v-model="alignment" @change="updateComponent" class="design-panel__select">
                <option value="left">Left</option>
                <option value="center">Center</option>
                <option value="right">Right</option>
                <option value="justify">Justify</option>
              </select>
              
              <label class="design-panel__label">Font Size</label>
              <select v-model="fontSize" @change="updateComponent" class="design-panel__select">
                <option value="small">Small</option>
                <option value="medium">Medium</option>
                <option value="large">Large</option>
              </select>
              
              <label class="design-panel__label">
                <input type="checkbox" v-model="preserveLineBreaks" @change="updateComponent">
                Preserve Line Breaks
              </label>
            </div>
          </div>
          
          <div class="design-panel__footer">
            <button @click="saveAndClose" class="btn btn--primary">Save & Close</button>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted, nextTick, watch } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'BiographyComponent',
  
  props: {
    biography: {
      type: String,
      default: ''
    },
    title: {
      type: String,
      default: 'Biography'
    },
    showTitle: {
      type: Boolean,
      default: true
    },
    alignment: {
      type: String,
      default: 'left',
      validator: (value) => ['left', 'center', 'right', 'justify'].includes(value)
    },
    fontSize: {
      type: String,
      default: 'medium',
      validator: (value) => ['small', 'medium', 'large'].includes(value)
    },
    preserveLineBreaks: {
      type: Boolean,
      default: true
    },
    componentId: {
      type: String,
      required: true
    },
    placeholder: {
      type: String,
      default: 'Enter biography text here...'
    }
  },
  
  setup(props) {
    // Store and composables
    const store = useMediaKitStore();
    const { biography: podsBiography, hasPodsData } = usePodsData();
    
    // Local state
    const isSelected = ref(false);
    const isEditing = ref(false);
    const showDesignPanel = ref(false);
    // ROOT FIX: Always prefer Pods data over saved component data
    const localBiography = ref(podsBiography.value || props.biography);
    const bioTextarea = ref(null);
    
    // Local copies of props for editing
    const title = ref(props.title);
    const showTitle = ref(props.showTitle);
    const alignment = ref(props.alignment);
    const fontSize = ref(props.fontSize);
    const preserveLineBreaks = ref(props.preserveLineBreaks);
    
    // ROOT FIX: Use computed ref from composable, not direct window access
    const podsData = computed(() => ({
      biography: podsBiography.value
    }));
    
    // ROOT FIX: Watch for Pods data changes (real-time sync)
    watch(() => podsBiography.value, (newVal) => {
      if (newVal) {
        localBiography.value = newVal;
      }
    });
    
    // Watch for prop changes (only if no Pods data)
    watch(() => props.biography, (newVal) => {
      if (!podsBiography.value) {
        localBiography.value = newVal;
      }
    });
    
    // Format biography text
    const formattedBiography = computed(() => {
      if (!localBiography.value) return '';
      
      let formatted = localBiography.value;
      
      // Preserve line breaks if enabled
      if (preserveLineBreaks.value) {
        formatted = formatted.replace(/\n\n/g, '</p><p>');
        formatted = formatted.replace(/\n/g, '<br>');
        formatted = `<p>${formatted}</p>`;
      }
      
      return formatted;
    });
    
    // Component methods
    const handleClick = (e) => {
      // Don't select if clicking on controls or edit mode
      if (e.target.closest('.component-controls') || e.target.closest('.biography__edit-mode')) {
        return;
      }
      
      isSelected.value = true;
      
      // Deselect others
      document.querySelectorAll('.gmkb-component').forEach(comp => {
        if (comp !== e.currentTarget) {
          comp.classList.remove('is-selected');
        }
      });
      
      e.currentTarget.classList.add('is-selected');
    };
    
    const startEdit = () => {
      isEditing.value = true;
      nextTick(() => {
        if (bioTextarea.value) {
          bioTextarea.value.focus();
          bioTextarea.value.select();
        }
      });
    };
    
    const saveBiography = () => {
      isEditing.value = false;
      updateComponent();
    };
    
    const cancelEdit = () => {
      localBiography.value = props.biography;
      isEditing.value = false;
    };
    
    const openEditPanel = () => {
      showDesignPanel.value = true;
      document.body.classList.add('design-panel-open');
    };
    
    const closeDesignPanel = () => {
      showDesignPanel.value = false;
      document.body.classList.remove('design-panel-open');
    };
    
    const saveAndClose = () => {
      updateComponent();
      closeDesignPanel();
    };
    
    const loadFromPods = () => {
      if (podsBiography.value) {
        localBiography.value = podsBiography.value;
        updateComponent();
      }
    };
    
    const updateComponent = () => {
      // ROOT FIX: Use Pinia store directly, no global object checking
      const updates = {
        biography: localBiography.value,
        title: title.value,
        showTitle: showTitle.value,
        alignment: alignment.value,
        fontSize: fontSize.value,
        preserveLineBreaks: preserveLineBreaks.value
      };
      
      // Update via Pinia store
      store.updateComponent(props.componentId, {
        data: updates,
        props: updates
      });
      
      // Also emit event for other systems
      document.dispatchEvent(new CustomEvent('gmkb:component-updated', {
        detail: {
          componentId: props.componentId,
          updates
        }
      }));
    };
    
    // Component action methods removed - handled by ControlsOverlay
    // moveUp, moveDown, duplicate, deleteComponent methods removed
    
    // Handle global click to deselect
    const handleGlobalClick = (e) => {
      if (!e.target.closest(`[data-component-id="${props.componentId}"]`)) {
        isSelected.value = false;
      }
    };
    
    // Handle ESC key to close design panel
    const handleEscKey = (e) => {
      if (e.key === 'Escape' && showDesignPanel.value) {
        closeDesignPanel();
      }
    };
    
    onMounted(() => {
      document.addEventListener('click', handleGlobalClick);
      document.addEventListener('keydown', handleEscKey);
      
      // Listen for external edit panel open events
      // Use document-level event for reliability
      document.addEventListener('gmkb:open-vue-panel', (e) => {
        if (e.detail?.componentId === props.componentId) {
          openEditPanel();
        }
      });
      
      // ROOT FIX: Always use Pods data when available (real-time sync)
      if (podsBiography.value) {
        localBiography.value = podsBiography.value;
        // Also update the display without needing to call updateComponent
      }
    });
    
    onUnmounted(() => {
      document.removeEventListener('click', handleGlobalClick);
      document.removeEventListener('keydown', handleEscKey);
      document.body.classList.remove('design-panel-open');
    });
    
    return {
      isSelected,
      isEditing,
      showDesignPanel,
      localBiography,
      bioTextarea,
      title,
      showTitle,
      alignment,
      fontSize,
      preserveLineBreaks,
      formattedBiography,
      podsData,
      handleClick,
      startEdit,
      saveBiography,
      cancelEdit,
      openEditPanel,
      closeDesignPanel,
      saveAndClose,
      loadFromPods,
      updateComponent
    };
  }
};
</script>

<style scoped>
.biography-component {
  position: relative;
  padding: var(--gmkb-spacing-lg, 2rem);
  background: var(--gmkb-color-surface, #ffffff);
  border-radius: var(--gmkb-border-radius, 8px);
  transition: all 0.3s ease;
}

.biography-component.is-selected {
  box-shadow: 0 0 0 2px var(--gmkb-color-primary, #3b82f6);
}

.biography-component:hover .component-controls {
  opacity: 1;
}

/* Component Controls styles removed - handled by ControlsOverlay */

/* Biography Content */
.biography__content {
  position: relative;
}

.biography__title {
  font-size: 1.75rem;
  font-weight: 700;
  margin: 0 0 1rem;
  color: var(--gmkb-color-text, #1a1a1a);
}

.biography__text {
  font-size: 1rem;
  line-height: 1.6;
  color: var(--gmkb-color-text, #1a1a1a);
}

.biography__text p {
  margin: 0 0 1rem;
}

.biography__text p:last-child {
  margin-bottom: 0;
}

/* Text Alignment */
.biography__content[data-align="center"] {
  text-align: center;
}

.biography__content[data-align="right"] {
  text-align: right;
}

.biography__content[data-align="justify"] {
  text-align: justify;
}

/* Font Sizes */
.biography__text[data-size="small"] {
  font-size: 0.875rem;
}

.biography__text[data-size="large"] {
  font-size: 1.125rem;
}

/* Edit Mode */
.biography__edit-mode {
  width: 100%;
}

.biography__textarea {
  width: 100%;
  min-height: 200px;
  padding: 12px;
  border: 1px solid var(--gmkb-color-border, #e2e8f0);
  border-radius: 4px;
  font-family: inherit;
  font-size: 1rem;
  line-height: 1.6;
  resize: vertical;
}

.biography__edit-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

/* Empty State */
.biography__empty {
  text-align: center;
  padding: 2rem;
  color: var(--gmkb-color-text-light, #64748b);
}

/* Design Panel */
.design-panel {
  position: fixed;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  z-index: 9999;
  display: flex;
  justify-content: flex-end;
}

.design-panel__content {
  width: 400px;
  height: 100%;
  background: white;
  box-shadow: -2px 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  animation: slideIn 0.3s ease;
}

@keyframes slideIn {
  from {
    transform: translateX(100%);
  }
  to {
    transform: translateX(0);
  }
}

.design-panel__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.5rem;
  border-bottom: 1px solid #e2e8f0;
}

.design-panel__header h3 {
  margin: 0;
  font-size: 1.25rem;
}

.design-panel__close {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: #64748b;
}

.design-panel__close:hover {
  color: #1a1a1a;
}

.design-panel__body {
  flex: 1;
  overflow-y: auto;
  padding: 1.5rem;
}

.design-panel__section {
  margin-bottom: 1.5rem;
}

.design-panel__subtitle {
  font-size: 0.875rem;
  font-weight: 600;
  text-transform: uppercase;
  color: #64748b;
  margin: 0 0 1rem;
}

.design-panel__label {
  display: block;
  margin-bottom: 0.5rem;
  font-size: 0.875rem;
  font-weight: 500;
  color: #475569;
}

.design-panel__input,
.design-panel__select,
.design-panel__textarea {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  font-size: 0.875rem;
}

.design-panel__textarea {
  resize: vertical;
  font-family: inherit;
}

.design-panel__footer {
  padding: 1.5rem;
  border-top: 1px solid #e2e8f0;
}

/* Buttons */
.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 4px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
}

.btn--primary {
  background: var(--gmkb-color-primary, #3b82f6);
  color: white;
}

.btn--primary:hover {
  background: var(--gmkb-color-primary-hover, #2563eb);
}

.btn--secondary {
  background: #f1f5f9;
  color: #475569;
}

.btn--secondary:hover {
  background: #e2e8f0;
}

.btn--sm {
  padding: 6px 12px;
  font-size: 0.875rem;
}

.mt-2 {
  margin-top: 0.5rem;
}

/* Responsive */
@media (max-width: 768px) {
  .design-panel__content {
    width: 100%;
  }
}
</style>
