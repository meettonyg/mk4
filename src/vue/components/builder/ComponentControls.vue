<template>
  <div class="component-controls" data-builder-only>
    <div class="component-controls__bar">
      <span class="component-controls__label">{{ componentLabel }}</span>
      
      <div class="component-controls__actions">
        <button 
          class="control-btn"
          title="Move Up"
          @click="moveUp"
          :disabled="isFirst"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="18 15 12 9 6 15"></polyline>
          </svg>
        </button>
        
        <button 
          class="control-btn"
          title="Move Down"
          @click="moveDown"
          :disabled="isLast"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
        
        <div class="control-separator"></div>
        
        <button 
          class="control-btn"
          title="Edit"
          @click="edit"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
          </svg>
        </button>
        
        <button 
          class="control-btn"
          title="Duplicate"
          @click="duplicate"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
        
        <button 
          class="control-btn control-btn--danger"
          title="Delete"
          @click="deleteComponent"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="3 6 5 6 21 6"></polyline>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
          </svg>
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed, onMounted } from 'vue';
import { useMediaKitStore } from '../../../stores/mediaKit';
import { useUIStore } from '../../../stores/ui';

// Props
const props = defineProps({
  componentId: {
    type: String,
    required: true
  },
  componentType: {
    type: String,
    required: true
  },
  index: {
    type: Number,
    required: true
  },
  totalComponents: {
    type: Number,
    required: true
  }
});

const store = useMediaKitStore();
const uiStore = useUIStore();

// Computed
const isFirst = computed(() => props.index === 0);
const isLast = computed(() => props.index === props.totalComponents - 1);

const componentLabel = computed(() => {
  const labels = {
    'hero': 'Hero Section',
    'biography': 'Biography',
    'topics': 'Topics',
    'contact': 'Contact',
    'testimonials': 'Testimonials',
    'call-to-action': 'Call to Action',
    'social': 'Social Links',
    'questions': 'Q&A',
    'stats': 'Statistics',
    'photo-gallery': 'Photo Gallery',
    'video-intro': 'Video Intro',
    'podcast-player': 'Podcast',
    'booking-calendar': 'Booking',
    'authority-hook': 'Authority Hook',
    'guest-intro': 'Guest Intro',
    'logo-grid': 'Logo Grid'
  };
  return labels[props.componentType] || props.componentType;
});

// DEBUG: Log when ComponentControls mounts
onMounted(() => {
  console.log('🎮 COMPONENT CONTROLS MOUNTED!');
  console.log('   Component ID:', props.componentId);
  console.log('   Component Type:', props.componentType);
  console.log('   Index:', props.index);
  console.log('   Total:', props.totalComponents);
  console.log('   Label:', componentLabel.value);
});

// Methods
const moveUp = () => {
  if (!isFirst.value) {
    console.log('Moving component up:', props.componentId);
    store.moveComponent(props.componentId, 'up');
  }
};

const moveDown = () => {
  if (!isLast.value) {
    console.log('Moving component down:', props.componentId);
    store.moveComponent(props.componentId, 'down');
  }
};

// ROOT FIX: Open component editor in sidebar (Elementor-style)
const edit = () => {
  console.log('🟢🟢🟢 COMPONENT EDIT CLICKED! 🟢🟢🟢');
  console.log('   Component ID:', props.componentId);
  console.log('   UI Store:', uiStore);
  console.log('   UI Store method exists?', typeof uiStore.openComponentEditor);
  
  uiStore.openComponentEditor(props.componentId);
  console.log('✅ ComponentControls: Opening component editor for:', props.componentId);
};

const duplicate = () => {
  store.duplicateComponent(props.componentId);
};

const deleteComponent = () => {
  if (confirm('Are you sure you want to delete this component?')) {
    store.removeComponent(props.componentId);
  }
};
</script>

<style>
/* ROOT FIX: Removed 'scoped' because it was preventing position: absolute from applying */
/* Use specific selectors to maintain encapsulation */
.component-wrapper .component-controls {
  position: absolute;
  top: -35px;
  left: 0;
  right: 0;
  z-index: 10000; /* ROOT FIX: Must be above EditorPanel overlay (z-index: 9999) */
  pointer-events: none;
  opacity: 1 !important; /* ROOT FIX: Force opacity */
  visibility: visible !important; /* ROOT FIX: Force visibility */
}

.component-wrapper .component-controls__bar {
  background: white;
  border: 1px solid var(--gmkb-color-primary, #4a90e2);
  border-radius: 6px;
  padding: 4px 8px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  pointer-events: all;
  /* ROOT FIX: Force visibility with important overrides */
  opacity: 1 !important;
  visibility: visible !important;
  transform: none !important;
}

.component-wrapper .component-controls__label {
  font-size: 12px;
  font-weight: 500;
  color: var(--gmkb-color-primary, #4a90e2);
  padding: 0 8px;
}

.component-wrapper .component-controls__actions {
  display: flex !important; /* DEBUG: Force display */
  gap: 2px;
  align-items: center;
  background: rgba(0,255,0,0.1); /* DEBUG: Green tint to see if rendering */
  padding: 2px; /* DEBUG: Make visible */
}

.component-wrapper .component-controls .control-btn {
  width: 28px;
  height: 28px;
  border: 1px solid #ccc;
  background: #f8f8f8;
  border-radius: 4px;
  display: flex !important;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s;
  color: #333;
}

/* Fix SVG icons */
.component-wrapper .component-controls .control-btn svg {
  width: 16px !important;
  height: 16px !important;
  display: block !important;
  stroke: #333 !important;
  stroke-width: 2px !important;
  fill: none !important;
}

.component-wrapper .component-controls .control-btn:hover:not(:disabled) {
  background: var(--gmkb-color-surface, #f5f5f5);
}

.component-wrapper .component-controls .control-btn:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.component-wrapper .component-controls .control-btn--danger:hover:not(:disabled) {
  background: #fee;
  color: #dc3545;
}

.component-wrapper .component-controls .control-separator {
  width: 1px;
  height: 20px;
  background: var(--gmkb-color-border, #e0e0e0);
  margin: 0 4px;
}
</style>
