<template>
  <div class="spacing-control">
    <!-- Presets -->
    <div class="presets">
      <button
        v-for="preset in presets"
        :key="preset.name"
        class="preset-btn"
        @click="applyPreset(preset.name)"
        :title="`Apply ${preset.label} spacing`"
      >
        {{ preset.label }}
      </button>
    </div>

    <!-- Margin Controls -->
    <div class="spacing-group">
      <label class="spacing-label">Margin</label>
      <div class="spacing-inputs">
        <div class="spacing-input">
          <input
            type="number"
            min="0"
            :value="margin.top"
            @input="updateMargin('top', parseInt($event.target.value) || 0)"
            placeholder="Top"
          />
          <span class="unit-label">{{ margin.unit }}</span>
        </div>
        <div class="spacing-input">
          <input
            type="number"
            min="0"
            :value="margin.right"
            @input="updateMargin('right', parseInt($event.target.value) || 0)"
            placeholder="Right"
          />
          <span class="unit-label">{{ margin.unit }}</span>
        </div>
        <div class="spacing-input">
          <input
            type="number"
            min="0"
            :value="margin.bottom"
            @input="updateMargin('bottom', parseInt($event.target.value) || 0)"
            placeholder="Bottom"
          />
          <span class="unit-label">{{ margin.unit }}</span>
        </div>
        <div class="spacing-input">
          <input
            type="number"
            min="0"
            :value="margin.left"
            @input="updateMargin('left', parseInt($event.target.value) || 0)"
            placeholder="Left"
          />
          <span class="unit-label">{{ margin.unit }}</span>
        </div>
      </div>
    </div>

    <!-- Padding Controls -->
    <div class="spacing-group">
      <label class="spacing-label">Padding</label>
      <div class="spacing-inputs">
        <div class="spacing-input">
          <input
            type="number"
            min="0"
            :value="padding.top"
            @input="updatePadding('top', parseInt($event.target.value) || 0)"
            placeholder="Top"
          />
          <span class="unit-label">{{ padding.unit }}</span>
        </div>
        <div class="spacing-input">
          <input
            type="number"
            min="0"
            :value="padding.right"
            @input="updatePadding('right', parseInt($event.target.value) || 0)"
            placeholder="Right"
          />
          <span class="unit-label">{{ padding.unit }}</span>
        </div>
        <div class="spacing-input">
          <input
            type="number"
            min="0"
            :value="padding.bottom"
            @input="updatePadding('bottom', parseInt($event.target.value) || 0)"
            placeholder="Bottom"
          />
          <span class="unit-label">{{ padding.unit }}</span>
        </div>
        <div class="spacing-input">
          <input
            type="number"
            min="0"
            :value="padding.left"
            @input="updatePadding('left', parseInt($event.target.value) || 0)"
            placeholder="Left"
          />
          <span class="unit-label">{{ padding.unit }}</span>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
const props = defineProps({
  margin: {
    type: Object,
    required: true
  },
  padding: {
    type: Object,
    required: true
  }
});

const emit = defineEmits(['update:margin', 'update:padding']);

const presets = [
  { name: 'none', label: 'None' },
  { name: 'small', label: 'Small' },
  { name: 'medium', label: 'Medium' },
  { name: 'large', label: 'Large' }
];

const presetValues = {
  none: { top: 0, right: 0, bottom: 0, left: 0, unit: 'px' },
  small: { top: 8, right: 8, bottom: 8, left: 8, unit: 'px' },
  medium: { top: 16, right: 16, bottom: 16, left: 16, unit: 'px' },
  large: { top: 24, right: 24, bottom: 24, left: 24, unit: 'px' }
};

const applyPreset = (presetName) => {
  const preset = presetValues[presetName];
  emit('update:margin', preset);
  emit('update:padding', preset);
};

const updateMargin = (side, value) => {
  emit('update:margin', {
    ...props.margin,
    [side]: value
  });
};

const updatePadding = (side, value) => {
  emit('update:padding', {
    ...props.padding,
    [side]: value
  });
};
</script>

<style scoped>
.spacing-control {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.presets {
  display: flex;
  gap: 4px;
}

.preset-btn {
  flex: 1;
  padding: 6px 12px;
  border: 1px solid #e5e7eb;
  background: white;
  border-radius: 6px;
  font-size: 12px;
  cursor: pointer;
  transition: all 0.2s;
}

.preset-btn:hover {
  background: #f8fafc;
  border-color: #cbd5e1;
}

.spacing-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.spacing-label {
  font-size: 12px;
  font-weight: 500;
  color: #64748b;
}

.spacing-inputs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 8px;
}

.spacing-input {
  position: relative;
}

.spacing-input input {
  width: 100%;
  padding: 6px;
  padding-right: 28px;
  border: 1px solid #e5e7eb;
  border-radius: 4px;
  font-size: 12px;
  text-align: center;
}

.spacing-input input:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.unit-label {
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  font-size: 10px;
  color: #94a3b8;
  pointer-events: none;
}
</style>
