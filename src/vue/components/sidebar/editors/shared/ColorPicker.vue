<template>
  <div class="color-picker">
    <div class="color-input-group">
      <input
        type="color"
        :value="color"
        @input="updateColor($event.target.value)"
        class="color-swatch"
        :title="color"
      />
      <input
        type="text"
        :value="color"
        @input="updateColor($event.target.value)"
        @blur="validateColor"
        placeholder="#000000"
        class="color-text"
        pattern="^#[0-9A-Fa-f]{6}$"
      />
      <button
        v-if="showClear"
        @click="clearColor"
        class="clear-btn"
        title="Clear color"
      >
        ×
      </button>
    </div>
    
    <!-- Common color presets -->
    <div v-if="showPresets" class="color-presets">
      <button
        v-for="preset in presetColors"
        :key="preset"
        class="preset-color"
        :style="{ backgroundColor: preset }"
        @click="updateColor(preset)"
        :title="preset"
      />
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const props = defineProps({
  color: {
    type: String,
    default: '#000000'
  },
  showPresets: {
    type: Boolean,
    default: true
  },
  showClear: {
    type: Boolean,
    default: false
  }
});

const emit = defineEmits(['update:color']);

const presetColors = [
  '#000000', '#ffffff', '#f8fafc', '#1e293b',
  '#ef4444', '#f97316', '#f59e0b', '#eab308',
  '#84cc16', '#22c55e', '#10b981', '#14b8a6',
  '#06b6d4', '#0ea5e9', '#3b82f6', '#6366f1',
  '#8b5cf6', '#a855f7', '#d946ef', '#ec4899'
];

const updateColor = (value) => {
  // Ensure color has # prefix
  let normalizedColor = value;
  if (value && !value.startsWith('#')) {
    normalizedColor = '#' + value;
  }
  emit('update:color', normalizedColor);
};

const validateColor = (event) => {
  const value = event.target.value;
  // Validate hex color format
  const hexColorRegex = /^#[0-9A-Fa-f]{6}$/;
  if (!hexColorRegex.test(value)) {
    // If invalid, revert to current valid color
    event.target.value = props.color;
  }
};

const clearColor = () => {
  emit('update:color', '');
};
</script>

<style scoped>
.color-picker {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.color-input-group {
  display: flex;
  gap: 8px;
  align-items: center;
}

.color-swatch {
  width: 40px;
  height: 36px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  cursor: pointer;
  padding: 2px;
}

.color-swatch::-webkit-color-swatch-wrapper {
  padding: 0;
}

.color-swatch::-webkit-color-swatch {
  border: none;
  border-radius: 4px;
}

.color-text {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid #e5e7eb;
  border-radius: 6px;
  font-size: 13px;
  font-family: 'Courier New', monospace;
  background: white;
}

.color-text:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.clear-btn {
  width: 32px;
  height: 36px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  font-size: 20px;
  cursor: pointer;
  color: #64748b;
  transition: all 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
}

.clear-btn:hover {
  background: #fee2e2;
  border-color: #fecaca;
  color: #dc2626;
}

.color-presets {
  display: grid;
  grid-template-columns: repeat(10, 1fr);
  gap: 4px;
}

.preset-color {
  width: 100%;
  aspect-ratio: 1;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s;
  padding: 0;
}

.preset-color:hover {
  transform: scale(1.1);
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  z-index: 1;
}

.preset-color:active {
  transform: scale(0.95);
}
</style>
