<template>
  <div class="base-advanced-panel">
    <!-- Layout Section -->
    <section class="advanced-section">
      <h4 class="advanced-section-title">
        Layout
        <Tooltip text="Control component width and horizontal alignment on the page. Use 'Auto' for content-based width, 'Full' for 100% width, or 'Custom' for specific sizes." />
      </h4>
      
      <div class="field-group">
        <label>
          Width Type
          <Tooltip text="Auto = width adjusts to content, Full = spans entire container width, Custom = set specific width value." position="right" />
        </label>
        <select
          :value="componentSettings.advanced.layout.width.type"
          @change="updateLayoutWidth('type', $event.target.value)"
        >
          <option value="auto">Auto</option>
          <option value="full">Full Width (100%)</option>
          <option value="custom">Custom</option>
        </select>
      </div>
      
      <div
        v-if="componentSettings.advanced.layout.width.type === 'custom'"
        class="field-group"
      >
        <label>
          Custom Width
          <Tooltip text="Set a specific width value for this component. Choose between pixels (px), percentage (%), rem, or em units." position="right" />
        </label>
        <div class="width-control">
          <input
            type="number"
            min="1"
            :value="componentSettings.advanced.layout.width.value"
            @input="updateLayoutWidth('value', parseInt($event.target.value) || 100)"
          />
          <select
            :value="componentSettings.advanced.layout.width.unit"
            @change="updateLayoutWidth('unit', $event.target.value)"
          >
            <option value="px">px</option>
            <option value="%">%</option>
            <option value="rem">rem</option>
            <option value="em">em</option>
          </select>
        </div>
      </div>
      
      <!-- TEXT ALIGNMENT: Only for text components -->
      <div v-if="isTextComponent" class="field-group">
        <label>
          Text Alignment
          <Tooltip text="Align text content within the component: Left, Center, Right, or Justify." position="right" />
        </label>
        <div class="alignment-buttons">
          <button
            :class="['alignment-btn', { active: componentSettings.advanced.layout.textAlign === 'left' }]"
            @click="updateLayout('textAlign', 'left')"
            title="Align Text Left"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="6" x2="20" y2="6" stroke-linecap="round"/>
              <line x1="4" y1="10" x2="16" y2="10" stroke-linecap="round"/>
              <line x1="4" y1="14" x2="20" y2="14" stroke-linecap="round"/>
              <line x1="4" y1="18" x2="14" y2="18" stroke-linecap="round"/>
            </svg>
          </button>
          <button
            :class="['alignment-btn', { active: componentSettings.advanced.layout.textAlign === 'center' }]"
            @click="updateLayout('textAlign', 'center')"
            title="Center Text"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="6" y1="6" x2="18" y2="6" stroke-linecap="round"/>
              <line x1="8" y1="10" x2="16" y2="10" stroke-linecap="round"/>
              <line x1="6" y1="14" x2="18" y2="14" stroke-linecap="round"/>
              <line x1="9" y1="18" x2="15" y2="18" stroke-linecap="round"/>
            </svg>
          </button>
          <button
            :class="['alignment-btn', { active: componentSettings.advanced.layout.textAlign === 'right' }]"
            @click="updateLayout('textAlign', 'right')"
            title="Align Text Right"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="6" x2="20" y2="6" stroke-linecap="round"/>
              <line x1="8" y1="10" x2="20" y2="10" stroke-linecap="round"/>
              <line x1="4" y1="14" x2="20" y2="14" stroke-linecap="round"/>
              <line x1="10" y1="18" x2="20" y2="18" stroke-linecap="round"/>
            </svg>
          </button>
          <button
            :class="['alignment-btn', { active: componentSettings.advanced.layout.textAlign === 'justify' }]"
            @click="updateLayout('textAlign', 'justify')"
            title="Justify Text"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <line x1="4" y1="6" x2="20" y2="6" stroke-linecap="round"/>
              <line x1="4" y1="10" x2="20" y2="10" stroke-linecap="round"/>
              <line x1="4" y1="14" x2="20" y2="14" stroke-linecap="round"/>
              <line x1="4" y1="18" x2="20" y2="18" stroke-linecap="round"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- OBJECT POSITIONING: For visual/image components -->
      <div v-if="isVisualComponent" class="field-group">
        <label>
          Object Position
          <Tooltip text="Position the image/object horizontally: Left, Center, or Right within its container." position="right" />
        </label>
        <div class="alignment-buttons">
          <button
            :class="['alignment-btn', { active: componentSettings.advanced.layout.alignment === 'left' }]"
            @click="updateLayout('alignment', 'left')"
            title="Position Left"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <!-- Left border line -->
              <line x1="3" y1="4" x2="3" y2="20" stroke-linecap="round"/>
              <!-- Box positioned left -->
              <rect x="6" y="8" width="10" height="8" rx="1" fill="currentColor" opacity="0.3"/>
              <rect x="6" y="8" width="10" height="8" rx="1" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button
            :class="['alignment-btn', { active: componentSettings.advanced.layout.alignment === 'center' }]"
            @click="updateLayout('alignment', 'center')"
            title="Position Center"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <!-- Center line -->
              <line x1="12" y1="4" x2="12" y2="20" stroke-linecap="round" stroke-dasharray="2,2" opacity="0.5"/>
              <!-- Box positioned center -->
              <rect x="7" y="8" width="10" height="8" rx="1" fill="currentColor" opacity="0.3"/>
              <rect x="7" y="8" width="10" height="8" rx="1" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
          <button
            :class="['alignment-btn', { active: componentSettings.advanced.layout.alignment === 'right' }]"
            @click="updateLayout('alignment', 'right')"
            title="Position Right"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <!-- Right border line -->
              <line x1="21" y1="4" x2="21" y2="20" stroke-linecap="round"/>
              <!-- Box positioned right -->
              <rect x="8" y="8" width="10" height="8" rx="1" fill="currentColor" opacity="0.3"/>
              <rect x="8" y="8" width="10" height="8" rx="1" stroke-linecap="round" stroke-linejoin="round"/>
            </svg>
          </button>
        </div>
      </div>
    </section>

    <!-- Responsive Section -->
    <section class="advanced-section">
      <h4 class="advanced-section-title">
        Responsive Visibility
        <Tooltip text="Control which devices display this component. Hide it on specific screen sizes (desktop, tablet, or mobile) for better responsive design." />
      </h4>
      <ResponsiveToggle
        :responsive="componentSettings.advanced.responsive"
        @update="updateResponsive"
      />
    </section>

    <!-- Custom CSS Section -->
    <section class="advanced-section">
      <h4 class="advanced-section-title">
        Custom CSS & Attributes
        <Tooltip text="Add custom CSS classes and IDs for advanced styling or JavaScript targeting. Use these for custom CSS rules or third-party integrations." />
      </h4>
      
      <div class="field-group">
        <label>
          CSS Classes
          <Tooltip text="Add one or more CSS class names (space-separated) to target this component with custom styles. Example: 'highlight featured-box'" position="right" />
        </label>
        <input
          type="text"
          :value="componentSettings.advanced.custom.cssClasses"
          @input="updateCustom('cssClasses', $event.target.value)"
          placeholder="custom-class another-class"
        />
      </div>
      
      <div class="field-group">
        <label>
          CSS ID
          <Tooltip text="Assign a unique identifier to this component for CSS or JavaScript targeting. IDs must be unique across the entire page." position="right" />
        </label>
        <input
          type="text"
          :value="componentSettings.advanced.custom.cssId"
          @input="updateCustom('cssId', $event.target.value)"
          placeholder="unique-id"
        />
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { useMediaKitStore } from '../../../../stores/mediaKit';
import componentStyleService from '../../../../services/ComponentStyleService';
import ResponsiveToggle from './shared/ResponsiveToggle.vue';
import Tooltip from '../../shared/Tooltip.vue';
import { getDefaultSettings } from '../../../../utils/componentSchema.js';

const props = defineProps({
  componentId: {
    type: String,
    default: null
  },
  sectionId: {
    type: String,
    default: null
  },
  mode: {
    type: String,
    default: 'component',
    validator: (value) => ['component', 'section'].includes(value)
  }
});

const store = useMediaKitStore();

// Get entity (component or section)
const entity = computed(() => {
  if (props.mode === 'section') {
    return store.sections.find(s => s.section_id === props.sectionId);
  } else {
    return store.components[props.componentId];
  }
});

// ROOT FIX: Determine if component has text content (not just visual/image)
const isTextComponent = computed(() => {
  if (props.mode === 'section') return false;
  
  const component = entity.value;
  if (!component) return false;
  
  const textComponents = [
    'biography',
    'topics',
    'contact',
    'speaking-topics',
    'testimonials',
    'cta',
    'custom-text',
    'heading'
  ];
  
  return textComponents.includes(component.type?.toLowerCase());
});

// ROOT FIX: Determine if component is visual/image-based
const isVisualComponent = computed(() => {
  if (props.mode === 'section') return false;
  
  const component = entity.value;
  if (!component) return false;
  
  const visualComponents = [
    'profile-photo',
    'hero',
    'logo',
    'gallery',
    'image',
    'video'
  ];
  
  return visualComponents.includes(component.type?.toLowerCase());
});

// Get component/section settings from store with proper defaults
const componentSettings = computed(() => {
  const settings = entity.value?.settings;
  
  // CRITICAL FIX: Handle empty array or invalid settings
  if (!settings || Array.isArray(settings) || typeof settings !== 'object') {
    console.warn('⚠️ BaseAdvancedPanel: Invalid or missing settings, using defaults');
    return getDefaultSettings();
  }
  
  // Get centralized defaults
  const defaults = getDefaultSettings();
  
  // Ensure nested structure exists with proper defaults
  return {
    style: settings.style || defaults.style,
    advanced: {
      layout: {
        ...defaults.advanced.layout,
        ...(settings.advanced?.layout || {}),
        textAlign: settings.advanced?.layout?.textAlign || 'left' // ROOT FIX: Add text alignment
      },
      responsive: settings.advanced?.responsive || defaults.advanced.responsive,
      custom: settings.advanced?.custom || defaults.advanced.custom
    }
  };
});

// Helper to apply styles to sections
function applySectionStyles(sectionId, settings) {
  const section = document.querySelector(`[data-section-id="${sectionId}"]`);
  if (!section) return;
  
  // Apply advanced layout styles
  if (settings.advanced?.layout?.width) {
    const w = settings.advanced.layout.width;
    if (w.type === 'full') {
      section.style.width = '100%';
    } else if (w.type === 'custom') {
      section.style.width = `${w.value}${w.unit || 'px'}`;
    } else {
      section.style.width = 'auto';
    }
  }
  
  if (settings.advanced?.layout?.alignment) {
    const align = settings.advanced.layout.alignment;
    if (align === 'center') {
      section.style.marginLeft = 'auto';
      section.style.marginRight = 'auto';
    } else if (align === 'right') {
      section.style.marginLeft = 'auto';
      section.style.marginRight = '0';
    } else {
      section.style.marginLeft = '0';
      section.style.marginRight = 'auto';
    }
  }
  
  // Apply custom CSS classes and IDs
  if (settings.advanced?.custom?.cssClasses) {
    section.className = settings.advanced.custom.cssClasses;
  }
  if (settings.advanced?.custom?.cssId) {
    section.id = settings.advanced.custom.cssId;
  }
  
  // Apply responsive visibility
  if (settings.advanced?.responsive) {
    const r = settings.advanced.responsive;
    if (!r.desktop) section.classList.add('hide-desktop');
    if (!r.tablet) section.classList.add('hide-tablet');
    if (!r.mobile) section.classList.add('hide-mobile');
  }
}

// Update methods with real-time CSS application
const updateLayoutWidth = (property, value) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.advanced) section.settings.advanced = {};
    if (!section.settings.advanced.layout) section.settings.advanced.layout = {};
    if (!section.settings.advanced.layout.width) section.settings.advanced.layout.width = {};
    
    section.settings.advanced.layout.width[property] = value;
    store.updateSectionSettings(props.sectionId, { advanced: section.settings.advanced });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (!component || !component.settings) return;
    
    // CRITICAL FIX: Mutate in place instead of creating new object
    if (!component.settings.advanced) component.settings.advanced = {};
    if (!component.settings.advanced.layout) component.settings.advanced.layout = {};
    if (!component.settings.advanced.layout.width) component.settings.advanced.layout.width = {};
    
    component.settings.advanced.layout.width[property] = value;
    
    componentStyleService.applyStyling(props.componentId, component.settings);
    
    // Mark store as dirty without triggering full component replacement
    store.isDirty = true;
  }
};

const updateLayout = (property, value) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.advanced) section.settings.advanced = {};
    if (!section.settings.advanced.layout) section.settings.advanced.layout = {};
    
    section.settings.advanced.layout[property] = value;
    store.updateSectionSettings(props.sectionId, { advanced: section.settings.advanced });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (!component || !component.settings) return;
    
    // CRITICAL FIX: Mutate in place
    if (!component.settings.advanced) component.settings.advanced = {};
    if (!component.settings.advanced.layout) component.settings.advanced.layout = {};
    
    component.settings.advanced.layout[property] = value;
    
    componentStyleService.applyStyling(props.componentId, component.settings);
    
    // Mark store as dirty without triggering full component replacement
    store.isDirty = true;
  }
};

const updateResponsive = (updates) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.advanced) section.settings.advanced = {};
    if (!section.settings.advanced.responsive) section.settings.advanced.responsive = {};
    
    section.settings.advanced.responsive = {
      ...section.settings.advanced.responsive,
      ...updates
    };
    store.updateSectionSettings(props.sectionId, { advanced: section.settings.advanced });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (!component || !component.settings) return;
    
    // CRITICAL FIX: Mutate in place with Object.assign
    if (!component.settings.advanced) component.settings.advanced = {};
    if (!component.settings.advanced.responsive) component.settings.advanced.responsive = {};
    
    Object.assign(component.settings.advanced.responsive, updates);
    
    componentStyleService.applyStyling(props.componentId, component.settings);
    
    // Mark store as dirty without triggering full component replacement
    store.isDirty = true;
  }
};

const updateCustom = (property, value) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.advanced) section.settings.advanced = {};
    if (!section.settings.advanced.custom) section.settings.advanced.custom = {};
    
    section.settings.advanced.custom[property] = value;
    store.updateSectionSettings(props.sectionId, { advanced: section.settings.advanced });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (!component || !component.settings) return;
    
    // CRITICAL FIX: Mutate in place
    if (!component.settings.advanced) component.settings.advanced = {};
    if (!component.settings.advanced.custom) component.settings.advanced.custom = {};
    
    component.settings.advanced.custom[property] = value;
    
    componentStyleService.applyStyling(props.componentId, component.settings);
    
    // Mark store as dirty without triggering full component replacement
    store.isDirty = true;
  }
};
</script>

<style scoped>
.base-advanced-panel {
  padding: 16px;
}

.advanced-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.advanced-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.advanced-section-title {
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.field-group {
  margin-bottom: 16px;
}

.field-group:last-child {
  margin-bottom: 0;
}

.field-group label {
  display: block;
  margin-bottom: 6px;
  font-size: 13px;
  font-weight: 500;
  color: #64748b;
}

.field-group input[type="text"],
.field-group input[type="number"],
.field-group select {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
  transition: all 0.2s;
}

.field-group input:focus,
.field-group select:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.width-control {
  display: flex;
  gap: 8px;
}

.width-control input {
  flex: 1;
}

.width-control select {
  width: 80px;
}

.alignment-buttons {
  display: flex;
  gap: 4px;
}

.alignment-btn {
  flex: 1;
  padding: 8px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #64748b;
}

.alignment-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.alignment-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.alignment-btn svg {
  display: block;
}
</style>
