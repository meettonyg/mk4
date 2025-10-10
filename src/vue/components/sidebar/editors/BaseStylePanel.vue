<template>
  <div class="base-style-panel">
    <!-- Size-Based Layout Selector (Elementor Style) -->
    <section class="size-selector-section">
      <h4 class="size-selector-title">
        Layout Spacing
        <Tooltip text="Choose how much padding and spacing your component has. Changes apply instantly." />
      </h4>
      
      <div class="size-options">
        <label 
          v-for="preset in presets" 
          :key="preset.id"
          class="size-option"
          :class="{ active: currentPresetId === preset.id }"
        >
          <input 
            type="radio" 
            :value="preset.id"
            :checked="currentPresetId === preset.id"
            @change="applyPreset(preset.id)"
            class="size-radio"
          />
          <span class="size-content">
            <span class="size-name">{{ preset.name }}</span>
            <span class="size-value">{{ preset.value }}</span>
          </span>
        </label>
      </div>
      
      <div v-if="isThemePreset" class="preset-note">
        <i class="fa-solid fa-info-circle"></i>
        <span>{{ currentPresetName }} spacing set by your theme</span>
      </div>
    </section>

    <!-- Spacing Section -->
    <section class="style-section">
      <h4 class="style-section-title">
        Spacing
        <Tooltip text="Control the external margin (space around the component) and internal padding (space inside the component). Measured in pixels." />
      </h4>
      <SpacingControl
        :margin="componentSettings.style.spacing.margin"
        :padding="componentSettings.style.spacing.padding"
        @update:margin="updateSpacing('margin', $event)"
        @update:padding="updateSpacing('padding', $event)"
      />
    </section>

    <!-- Background Section -->
    <section class="style-section">
      <h4 class="style-section-title">
        Background
        <Tooltip text="Set the background color and opacity for this component. Use opacity to create semi-transparent overlays." />
      </h4>
      <div class="field-group">
        <label>
          Background Color
          <Tooltip text="Choose a background color using the color picker or enter a hex code." position="right" />
        </label>
        <ColorPicker
          :color="componentSettings.style.background.color"
          @update:color="updateBackground('color', $event)"
        />
      </div>
      <div class="field-group">
        <label>
          Opacity
          <Tooltip text="Control transparency: 100% = fully opaque, 0% = fully transparent. Useful for overlay effects." position="right" />
        </label>
        <input
          type="range"
          min="0"
          max="100"
          :value="componentSettings.style.background.opacity"
          @input="updateBackground('opacity', parseInt($event.target.value))"
        />
        <span class="range-value">{{ componentSettings.style.background.opacity }}%</span>
      </div>
    </section>

    <!-- Typography Section (conditional) -->
    <section v-if="showTypography" class="style-section">
      <h4 class="style-section-title">
        Typography
        <Tooltip text="Control text appearance: font family, size, weight, color, and alignment. These settings apply to all text within this component." />
      </h4>
      <TypographyControl
        :typography="componentSettings.style.typography"
        @update="updateTypography"
      />
    </section>

    <!-- Border Section -->
    <section class="style-section">
      <h4 class="style-section-title">
        Border
        <Tooltip text="Add borders around the component. Control width, color, style, and corner radius. Set width to 0 for no border." />
      </h4>
      <div class="field-group">
        <label>
          Border Width
          <Tooltip text="Set border width for each side independently. Enter 0 for no border on that side. Measured in pixels." position="right" />
        </label>
        <div class="border-control">
          <input
            type="number"
            min="0"
            :value="componentSettings.style.border.width.top"
            @input="updateBorderWidth('top', parseInt($event.target.value) || 0)"
            placeholder="Top"
          />
          <input
            type="number"
            min="0"
            :value="componentSettings.style.border.width.right"
            @input="updateBorderWidth('right', parseInt($event.target.value) || 0)"
            placeholder="Right"
          />
          <input
            type="number"
            min="0"
            :value="componentSettings.style.border.width.bottom"
            @input="updateBorderWidth('bottom', parseInt($event.target.value) || 0)"
            placeholder="Bottom"
          />
          <input
            type="number"
            min="0"
            :value="componentSettings.style.border.width.left"
            @input="updateBorderWidth('left', parseInt($event.target.value) || 0)"
            placeholder="Left"
          />
        </div>
      </div>
      
      <div class="field-group">
        <label>
          Border Color
          <Tooltip text="Choose the color for all borders. Only visible when border width is greater than 0." position="right" />
        </label>
        <ColorPicker
          :color="componentSettings.style.border.color"
          @update:color="updateBorder('color', $event)"
        />
      </div>
      
      <div class="field-group">
        <label>
          Border Style
          <Tooltip text="Choose how the border line appears: solid (continuous), dashed (segmented), or dotted (dots)." position="right" />
        </label>
        <select
          :value="componentSettings.style.border.style"
          @change="updateBorder('style', $event.target.value)"
        >
          <option value="solid">Solid</option>
          <option value="dashed">Dashed</option>
          <option value="dotted">Dotted</option>
          <option value="double">Double</option>
          <option value="none">None</option>
        </select>
      </div>
      
      <div class="field-group">
        <label>
          Border Radius
          <Tooltip text="Round the corners of the component. Higher values = more rounded. 0 = sharp corners. Measured in pixels." position="right" />
        </label>
        <input
          type="number"
          min="0"
          :value="componentSettings.style.border.radius.topLeft"
          @input="updateBorderRadius(parseInt($event.target.value) || 0)"
        />
        <span class="unit-label">px</span>
      </div>
    </section>

    <!-- Effects Section -->
    <section class="style-section">
      <h4 class="style-section-title">
        Effects
        <Tooltip text="Add visual effects like shadows to make the component stand out and add depth to your design." />
      </h4>
      <div class="field-group">
        <label>
          Box Shadow
          <Tooltip text="Add a drop shadow behind the component. Larger sizes create more dramatic depth effects." position="right" />
        </label>
        <select
          :value="componentSettings.style.effects.boxShadow"
          @change="updateEffect('boxShadow', $event.target.value)"
        >
          <option value="none">None</option>
          <option value="0 2px 4px rgba(0,0,0,0.1)">Small</option>
          <option value="0 4px 6px rgba(0,0,0,0.1)">Medium</option>
          <option value="0 10px 15px rgba(0,0,0,0.1)">Large</option>
          <option value="0 20px 25px rgba(0,0,0,0.15)">X-Large</option>
        </select>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed, ref } from 'vue';
import { useMediaKitStore } from '../../../../stores/mediaKit';
import componentStyleService from '../../../../services/ComponentStyleService';
import { getAllPresets, applyPresetToSettings } from '../../../../utils/stylePresets';
import { useToast } from '../../../../composables/useToast';
import SpacingControl from './shared/SpacingControl.vue';
import ColorPicker from './shared/ColorPicker.vue';
import TypographyControl from './shared/TypographyControl.vue';
import Tooltip from '../../shared/Tooltip.vue';

const props = defineProps({
  componentId: {
    type: String,
    default: null
  },
  sectionId: {
    type: String,
    default: null
  },
  componentType: {
    type: String,
    default: 'generic'
  },
  showTypography: {
    type: Boolean,
    default: true
  },
  mode: {
    type: String,
    default: 'component',
    validator: (value) => ['component', 'section'].includes(value)
  }
});

const store = useMediaKitStore();
const { showSuccess } = useToast();

// Get all available presets
const presets = computed(() => getAllPresets());

const currentPresetId = ref(null);
const appliedPreset = ref(null);

// Computed properties for UI
const currentPresetName = computed(() => {
  if (!currentPresetId.value) {
    // Try to detect from settings
    const settings = componentSettings.value;
    const padding = settings?.style?.spacing?.padding?.top || 40;
    
    // Simple heuristic to guess preset based on padding
    if (padding === 0) return 'None';
    if (padding <= 20) return 'Small';
    if (padding <= 40) return 'Medium';
    if (padding <= 64) return 'Large';
    if (padding >= 80) return 'X-Large';
    return 'Custom';
  }
  
  const preset = presets.value.find(p => p.id === currentPresetId.value);
  return preset ? preset.name : 'Custom';
});

const isThemePreset = computed(() => {
  // Check if current preset matches theme's default
  const themeStore = window.$pinia?.state?.value?.theme;
  const activeTheme = themeStore?.activeTheme;
  const themeDefaultPreset = activeTheme?.defaultPreset;
  
  if (!themeDefaultPreset || !currentPresetId.value) return false;
  return currentPresetId.value === themeDefaultPreset;
});

// Get entity (component or section)
const entity = computed(() => {
  if (props.mode === 'section') {
    return store.sections.find(s => s.section_id === props.sectionId);
  } else {
    return store.components[props.componentId];
  }
});

// Get component/section settings from store with proper defaults
const componentSettings = computed(() => {
  const settings = entity.value?.settings;
  
  // CRITICAL FIX: Handle empty array or invalid settings
  if (!settings || Array.isArray(settings) || typeof settings !== 'object') {
    console.warn('⚠️ BaseStylePanel: Invalid or missing settings, using defaults');
    return getDefaultSettings();
  }
  
  // Ensure nested structure exists
  return {
    style: {
      spacing: settings.style?.spacing || getDefaultSettings().style.spacing,
      background: settings.style?.background || getDefaultSettings().style.background,
      border: settings.style?.border || getDefaultSettings().style.border,
      effects: settings.style?.effects || getDefaultSettings().style.effects,
      typography: settings.style?.typography || getDefaultSettings().style.typography
    },
    advanced: settings.advanced || getDefaultSettings().advanced
  };
});

// Default settings structure
function getDefaultSettings() {
  return {
    style: {
      spacing: {
        margin: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
        padding: { top: 20, right: 20, bottom: 20, left: 20, unit: 'px' }
      },
      background: {
        color: '#ffffff',
        opacity: 100
      },
      border: {
        width: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
        style: 'solid',
        color: '#e5e7eb',
        radius: { topLeft: 0, topRight: 0, bottomRight: 0, bottomLeft: 0, unit: 'px' }
      },
      effects: {
        boxShadow: 'none'
      },
      typography: {
        fontFamily: 'inherit',
        fontSize: 16,
        fontWeight: 400,
        lineHeight: 1.5,
        color: '#000000',
        textAlign: 'left'
      }
    },
    advanced: {
      layout: {
        width: { type: 'auto', value: 100, unit: '%' },
        alignment: 'left'
      },
      responsive: {
        desktop: true,
        tablet: true,
        mobile: true
      },
      custom: {
        cssClasses: '',
        cssId: ''
      }
    }
  };
}

// Helper to apply styles to sections
function applySectionStyles(sectionId, settings) {
  const section = document.querySelector(`[data-section-id="${sectionId}"]`);
  if (!section) return;
  
  // Apply CSS styles directly
  if (settings.style?.spacing?.padding) {
    const p = settings.style.spacing.padding;
    section.style.padding = `${p.top}${p.unit || 'px'} ${p.right}${p.unit || 'px'} ${p.bottom}${p.unit || 'px'} ${p.left}${p.unit || 'px'}`;
  }
  
  if (settings.style?.spacing?.margin) {
    const m = settings.style.spacing.margin;
    section.style.margin = `${m.top}${m.unit || 'px'} ${m.right}${m.unit || 'px'} ${m.bottom}${m.unit || 'px'} ${m.left}${m.unit || 'px'}`;
  }
  
  if (settings.style?.background) {
    section.style.backgroundColor = settings.style.background.color;
    section.style.opacity = (settings.style.background.opacity || 100) / 100;
  }
  
  if (settings.style?.border) {
    const b = settings.style.border;
    if (b.width) {
      section.style.borderWidth = `${b.width.top}${b.width.unit || 'px'} ${b.width.right}${b.width.unit || 'px'} ${b.width.bottom}${b.width.unit || 'px'} ${b.width.left}${b.width.unit || 'px'}`;
    }
    if (b.style) section.style.borderStyle = b.style;
    if (b.color) section.style.borderColor = b.color;
    if (b.radius) {
      section.style.borderRadius = `${b.radius.topLeft}${b.radius.unit || 'px'} ${b.radius.topRight}${b.radius.unit || 'px'} ${b.radius.bottomRight}${b.radius.unit || 'px'} ${b.radius.bottomLeft}${b.radius.unit || 'px'}`;
    }
  }
  
  if (settings.style?.effects?.boxShadow) {
    section.style.boxShadow = settings.style.effects.boxShadow;
  }
}

// Update methods with real-time CSS application
const updateSpacing = (type, value) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.style) section.settings.style = {};
    if (!section.settings.style.spacing) section.settings.style.spacing = {};
    
    section.settings.style.spacing[type] = value;
    store.updateSectionSettings(props.sectionId, { style: section.settings.style });
    
    // Apply styles immediately to live preview
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (component) {
      component.settings.style.spacing[type] = value;
      store.updateComponent(props.componentId, { settings: component.settings });
      
      // Apply styles immediately to live preview
      componentStyleService.applyStyling(props.componentId, component.settings);
    }
  }
};

const updateBackground = (property, value) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.style) section.settings.style = {};
    if (!section.settings.style.background) section.settings.style.background = {};
    
    section.settings.style.background[property] = value;
    store.updateSectionSettings(props.sectionId, { style: section.settings.style });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (component) {
      component.settings.style.background[property] = value;
      store.updateComponent(props.componentId, { settings: component.settings });
      
      componentStyleService.applyStyling(props.componentId, component.settings);
    }
  }
};

const updateTypography = (updates) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.style) section.settings.style = {};
    if (!section.settings.style.typography) section.settings.style.typography = {};
    
    section.settings.style.typography = {
      ...section.settings.style.typography,
      ...updates
    };
    store.updateSectionSettings(props.sectionId, { style: section.settings.style });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (component) {
      component.settings.style.typography = {
        ...component.settings.style.typography,
        ...updates
      };
      store.updateComponent(props.componentId, { settings: component.settings });
      
      componentStyleService.applyStyling(props.componentId, component.settings);
    }
  }
};

const updateBorderWidth = (side, value) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.style) section.settings.style = {};
    if (!section.settings.style.border) section.settings.style.border = {};
    if (!section.settings.style.border.width) section.settings.style.border.width = {};
    
    section.settings.style.border.width[side] = value;
    store.updateSectionSettings(props.sectionId, { style: section.settings.style });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (component) {
      component.settings.style.border.width[side] = value;
      store.updateComponent(props.componentId, { settings: component.settings });
      
      componentStyleService.applyStyling(props.componentId, component.settings);
    }
  }
};

const updateBorder = (property, value) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.style) section.settings.style = {};
    if (!section.settings.style.border) section.settings.style.border = {};
    
    section.settings.style.border[property] = value;
    store.updateSectionSettings(props.sectionId, { style: section.settings.style });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (component) {
      component.settings.style.border[property] = value;
      store.updateComponent(props.componentId, { settings: component.settings });
      
      componentStyleService.applyStyling(props.componentId, component.settings);
    }
  }
};

const updateBorderRadius = (value) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.style) section.settings.style = {};
    if (!section.settings.style.border) section.settings.style.border = {};
    
    section.settings.style.border.radius = {
      topLeft: value,
      topRight: value,
      bottomRight: value,
      bottomLeft: value,
      unit: 'px'
    };
    store.updateSectionSettings(props.sectionId, { style: section.settings.style });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (component) {
      component.settings.style.border.radius = {
        topLeft: value,
        topRight: value,
        bottomRight: value,
        bottomLeft: value,
        unit: 'px'
      };
      store.updateComponent(props.componentId, { settings: component.settings });
      
      componentStyleService.applyStyling(props.componentId, component.settings);
    }
  }
};

const updateEffect = (property, value) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    if (!section.settings) section.settings = {};
    if (!section.settings.style) section.settings.style = {};
    if (!section.settings.style.effects) section.settings.style.effects = {};
    
    section.settings.style.effects[property] = value;
    store.updateSectionSettings(props.sectionId, { style: section.settings.style });
    
    applySectionStyles(props.sectionId, section.settings);
  } else {
    const component = store.components[props.componentId];
    if (component) {
      component.settings.style.effects[property] = value;
      store.updateComponent(props.componentId, { settings: component.settings });
      
      componentStyleService.applyStyling(props.componentId, component.settings);
    }
  }
};

// Apply preset
const applyPreset = (presetId) => {
  if (props.mode === 'section') {
    const section = entity.value;
    if (!section) return;
    
    const preset = presets.value.find(p => p.id === presetId);
    if (!preset) return;
    
    // Apply preset to settings
    const updatedSettings = applyPresetToSettings(section.settings, presetId);
    
    // Update store
    store.updateSectionSettings(props.sectionId, updatedSettings);
    
    // Apply styles immediately to live preview
    applySectionStyles(props.sectionId, updatedSettings);
    
    // Update UI state
    currentPresetId.value = presetId;
    appliedPreset.value = preset.name;
    showPresetSelector.value = false; // Close dropdown
    
    // Show toast notification
    showSuccess(`Layout changed to ${preset.name}`);
    
    // Mark as dirty
    store.isDirty = true;
    return;
  }
  
  const component = store.components[props.componentId];
  if (!component) return;
  
  const preset = presets.value.find(p => p.id === presetId);
  if (!preset) return;
  
  // Apply preset to settings
  const updatedSettings = applyPresetToSettings(component.settings, presetId);
  
  // Update store
  store.updateComponent(props.componentId, { settings: updatedSettings });
  
  // Apply styles immediately to live preview
  componentStyleService.applyStyling(props.componentId, updatedSettings);
  
  // Update UI state
  currentPresetId.value = presetId;
  appliedPreset.value = preset.name;
  showPresetSelector.value = false; // Close dropdown
  
  // Show toast notification
  showSuccess(`Layout changed to ${preset.name}`);
  
  // Mark as dirty
  store.isDirty = true;
};

// Get tooltip text
const getPresetTooltip = () => {
  if (isThemePreset.value) {
    return 'Layout automatically set by your theme. Click to change.';
  }
  return 'Click to change layout preset';
};
</script>

<style scoped>
.base-style-panel {
  padding: 16px;
}

.style-section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid #e5e7eb;
}

.style-section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.style-section-title {
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

.field-group input[type="range"] {
  width: calc(100% - 50px);
  vertical-align: middle;
}

.field-group select,
.field-group input[type="number"] {
  width: 100%;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 14px;
  background: white;
}

.range-value {
  display: inline-block;
  min-width: 45px;
  text-align: right;
  font-size: 13px;
  color: #64748b;
  margin-left: 8px;
}

.border-control {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.border-control input {
  width: 100%;
  padding: 6px;
  text-align: center;
  font-size: 12px;
}

.unit-label {
  margin-left: 4px;
  font-size: 12px;
  color: #64748b;
}

/* Size-Based Layout Selector (Elementor Style) */
.size-selector-section {
  margin-bottom: 24px;
  padding-bottom: 20px;
  border-bottom: 2px solid #e5e7eb;
}

.size-selector-title {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 0 0 12px 0;
  font-size: 11px;
  font-weight: 600;
  color: #475569;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.size-options {
  display: flex;
  gap: 0;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  overflow: hidden;
}

.size-option {
  flex: 1;
  position: relative;
  cursor: pointer;
  margin: 0;
}

.size-radio {
  position: absolute;
  opacity: 0;
  pointer-events: none;
}

.size-content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 10px 8px;
  background: #ffffff;
  border-right: 1px solid #d1d5db;
  transition: all 0.2s;
  min-height: 54px;
}

.size-option:last-child .size-content {
  border-right: none;
}

.size-option:hover .size-content {
  background: #f9fafb;
}

.size-option.active .size-content {
  background: #3b82f6;
}

.size-name {
  font-size: 12px;
  font-weight: 600;
  color: #1f2937;
  line-height: 1.2;
  transition: color 0.2s;
}

.size-option.active .size-name {
  color: #ffffff;
}

.size-value {
  font-size: 10px;
  color: #6b7280;
  margin-top: 2px;
  transition: color 0.2s;
}

.size-option.active .size-value {
  color: #dbeafe;
}

.preset-note {
  display: flex;
  align-items: center;
  gap: 6px;
  margin-top: 10px;
  padding: 8px 10px;
  background: #eff6ff;
  border-left: 3px solid #3b82f6;
  border-radius: 4px;
  font-size: 11px;
  color: #1e40af;
}

.preset-note i {
  font-size: 12px;
  color: #3b82f6;
}
</style>
