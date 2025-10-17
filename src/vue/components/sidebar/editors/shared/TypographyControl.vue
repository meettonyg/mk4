<template>
  <div class="typography-control">
    <!-- Font Family -->
    <div class="field-group">
      <label>Font Family</label>
      <select
        :value="typography.fontFamily"
        @change="updateTypography('fontFamily', $event.target.value)"
      >
        <option value="inherit">Inherit</option>
        <option value="'Inter', sans-serif">Inter</option>
        <option value="'Roboto', sans-serif">Roboto</option>
        <option value="'Open Sans', sans-serif">Open Sans</option>
        <option value="'Lato', sans-serif">Lato</option>
        <option value="'Montserrat', sans-serif">Montserrat</option>
        <option value="'Poppins', sans-serif">Poppins</option>
        <option value="Georgia, serif">Georgia</option>
        <option value="'Times New Roman', serif">Times New Roman</option>
        <option value="'Courier New', monospace">Courier New</option>
      </select>
    </div>

    <!-- Font Size -->
    <div class="field-group">
      <label>Font Size</label>
      <div class="size-control">
        <input
          type="number"
          min="1"
          v-model="localFontSizeValue"
          @input="debouncedUpdateFontSize"
        />
        <select
          :value="typography.fontSize.unit"
          @change="updateFontSize('unit', $event.target.value)"
        >
          <option value="px">px</option>
          <option value="rem">rem</option>
          <option value="em">em</option>
        </select>
      </div>
    </div>

    <!-- Font Weight -->
    <div class="field-group">
      <label>Font Weight</label>
      <select
        :value="typography.fontWeight"
        @change="updateTypography('fontWeight', parseInt($event.target.value))"
      >
        <option value="100">Thin (100)</option>
        <option value="200">Extra Light (200)</option>
        <option value="300">Light (300)</option>
        <option value="400">Normal (400)</option>
        <option value="500">Medium (500)</option>
        <option value="600">Semi Bold (600)</option>
        <option value="700">Bold (700)</option>
        <option value="800">Extra Bold (800)</option>
        <option value="900">Black (900)</option>
      </select>
    </div>

    <!-- Line Height -->
    <div class="field-group">
      <label>Line Height</label>
      <input
        type="number"
        min="0.5"
        step="0.1"
        v-model="localLineHeight"
        @input="debouncedUpdateLineHeight"
      />
    </div>

    <!-- Color -->
    <div class="field-group">
      <label>Text Color</label>
      <ColorPicker
        :color="typography.color"
        @update:color="updateTypography('color', $event)"
      />
    </div>

    <!-- Text Align -->
    <div class="field-group">
      <label>Text Alignment</label>
      <div class="alignment-buttons">
        <button
          :class="['align-btn', { active: typography.textAlign === 'left' }]"
          @click="updateTypography('textAlign', 'left')"
          title="Align Left"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18M3 12h12M3 18h18" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <button
          :class="['align-btn', { active: typography.textAlign === 'center' }]"
          @click="updateTypography('textAlign', 'center')"
          title="Align Center"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M7 12h10M3 18h18" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <button
          :class="['align-btn', { active: typography.textAlign === 'right' }]"
          @click="updateTypography('textAlign', 'right')"
          title="Align Right"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18M9 12h12M3 18h18" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
        <button
          :class="['align-btn', { active: typography.textAlign === 'justify' }]"
          @click="updateTypography('textAlign', 'justify')"
          title="Justify"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path d="M3 6h18M3 12h18M3 18h18" stroke-width="2" stroke-linecap="round"/>
          </svg>
        </button>
      </div>
    </div>

    <!-- Typography Presets -->
    <div class="field-group">
      <label>Quick Presets</label>
      <div class="preset-buttons">
        <button
          v-for="preset in presets"
          :key="preset.name"
          class="preset-btn"
          @click="applyPreset(preset.name)"
        >
          {{ preset.label }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue';
import ColorPicker from './ColorPicker.vue';

const props = defineProps({
  typography: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update']);

// ROOT FIX: Local state for inputs to prevent focus loss
// Handle both object and number formats for lineHeight
const localFontSizeValue = ref(props.typography.fontSize?.value || 16);
const getLineHeightValue = (lineHeight) => {
  if (typeof lineHeight === 'object' && lineHeight !== null) {
    return lineHeight.value || 1.5;
  }
  return lineHeight || 1.5;
};
const localLineHeight = ref(getLineHeightValue(props.typography.lineHeight));

// Watch for external changes (like when switching components)
watch(() => props.typography.fontSize?.value, (newVal) => {
  if (newVal !== undefined && newVal !== localFontSizeValue.value) {
    localFontSizeValue.value = newVal;
  }
});

watch(() => props.typography.lineHeight, (newVal) => {
  if (newVal !== undefined) {
    const newLineHeightValue = getLineHeightValue(newVal);
    if (newLineHeightValue !== localLineHeight.value) {
      localLineHeight.value = newLineHeightValue;
    }
  }
});

const presets = [
  { name: 'body', label: 'Body' },
  { name: 'heading1', label: 'H1' },
  { name: 'heading2', label: 'H2' },
  { name: 'heading3', label: 'H3' },
  { name: 'small', label: 'Small' }
];

// ROOT CAUSE FIX: All presets must use lineHeight as {value, unit} object
const presetValues = {
  body: {
    fontFamily: 'inherit',
    fontSize: { value: 16, unit: 'px' },
    fontWeight: 400,
    lineHeight: { value: 1.5, unit: 'unitless' },
    color: props.typography.color,
    textAlign: props.typography.textAlign
  },
  heading1: {
    fontFamily: 'inherit',
    fontSize: { value: 32, unit: 'px' },
    fontWeight: 700,
    lineHeight: { value: 1.2, unit: 'unitless' },
    color: props.typography.color,
    textAlign: props.typography.textAlign
  },
  heading2: {
    fontFamily: 'inherit',
    fontSize: { value: 24, unit: 'px' },
    fontWeight: 600,
    lineHeight: { value: 1.3, unit: 'unitless' },
    color: props.typography.color,
    textAlign: props.typography.textAlign
  },
  heading3: {
    fontFamily: 'inherit',
    fontSize: { value: 20, unit: 'px' },
    fontWeight: 600,
    lineHeight: { value: 1.4, unit: 'unitless' },
    color: props.typography.color,
    textAlign: props.typography.textAlign
  },
  small: {
    fontFamily: 'inherit',
    fontSize: { value: 14, unit: 'px' },
    fontWeight: 400,
    lineHeight: { value: 1.5, unit: 'unitless' },
    color: props.typography.color,
    textAlign: props.typography.textAlign
  }
};

const updateTypography = (property, value) => {
  emit('update', {
    ...props.typography,
    [property]: value
  });
};

const updateFontSize = (property, value) => {
  emit('update', {
    ...props.typography,
    fontSize: {
      ...props.typography.fontSize,
      [property]: value
    }
  });
};

// ROOT FIX: Debounced updates to prevent focus loss
let fontSizeTimeout = null;
const debouncedUpdateFontSize = () => {
  if (fontSizeTimeout) clearTimeout(fontSizeTimeout);
  
  fontSizeTimeout = setTimeout(() => {
    const value = parseInt(localFontSizeValue.value) || 16;
    emit('update', {
      ...props.typography,
      fontSize: {
        ...props.typography.fontSize,
        value: value
      }
    });
  }, 300);
};

// ROOT CAUSE FIX: lineHeight must be emitted as {value, unit} object, not a plain number
let lineHeightTimeout = null;
const debouncedUpdateLineHeight = () => {
  if (lineHeightTimeout) clearTimeout(lineHeightTimeout);
  
  lineHeightTimeout = setTimeout(() => {
    const value = parseFloat(localLineHeight.value) || 1.5;
    // CRITICAL: Emit lineHeight as object to match ComponentStyleService expectations
    emit('update', {
      ...props.typography,
      lineHeight: {
        value: value,
        unit: 'unitless' // Line height is typically unitless (1.5 = 150% of font size)
      }
    });
  }, 300);
};

const applyPreset = (presetName) => {
  const preset = presetValues[presetName];
  // Update local state - extract value from lineHeight object
  localFontSizeValue.value = preset.fontSize.value;
  localLineHeight.value = preset.lineHeight.value;
  // Emit immediately for presets
  emit('update', preset);
};
</script>

<style scoped>
.typography-control {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.field-group {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.field-group label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
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

.field-group select:focus,
.field-group input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.size-control {
  display: flex;
  gap: 8px;
}

.size-control input {
  flex: 1;
}

.size-control select {
  width: 80px;
}

.alignment-buttons,
.preset-buttons {
  display: flex;
  gap: 4px;
}

.align-btn,
.preset-btn {
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
  font-size: 12px;
}

.align-btn:hover,
.preset-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.align-btn.active {
  background: #3b82f6;
  border-color: #3b82f6;
  color: white;
}

.align-btn svg {
  display: block;
}
</style>
