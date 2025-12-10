<template>
  <AiWidgetFrame
    :title="config.title"
    :description="config.description"
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    :target-component="config.title"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Dynamic Fields Based on Config -->
      <div
        v-for="field in config.fields"
        :key="field.name"
        class="gmkb-ai-form-group"
      >
        <label :class="['gmkb-ai-label', field.required ? 'gmkb-ai-label--required' : '']">
          {{ field.label }}
        </label>

        <!-- Textarea for longer inputs -->
        <textarea
          v-if="field.type === 'textarea'"
          v-model="formData[field.name]"
          class="gmkb-ai-input gmkb-ai-textarea"
          :placeholder="field.placeholder"
          :rows="field.rows || 3"
        ></textarea>

        <!-- Select dropdown -->
        <select
          v-else-if="field.type === 'select'"
          v-model="formData[field.name]"
          class="gmkb-ai-input gmkb-ai-select"
        >
          <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <!-- Default text input -->
        <input
          v-else
          v-model="formData[field.name]"
          type="text"
          class="gmkb-ai-input"
          :placeholder="field.placeholder"
        />

        <span v-if="field.hint" class="gmkb-ai-hint">{{ field.hint }}</span>
      </div>

      <!-- Tone Selector (optional) -->
      <AiToneSelector v-if="config.showTone" v-model="formData.tone" />

      <!-- Generate Button -->
      <AiGenerateButton
        :text="config.buttonText || 'Generate'"
        :loading-text="config.loadingText || 'Generating...'"
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasContent" class="gmkb-ai-results">
        <AiResultsDisplay
          :content="displayContent"
          :format="config.resultFormat || 'text'"
          :selected-index="selectedIndex"
          @select="handleSelect"
        />
      </div>
    </template>
  </AiWidgetFrame>
</template>

<script setup>
import { ref, computed, reactive, onMounted } from 'vue';
import { useAIGenerator } from '../../../composables/useAIGenerator';
import AiWidgetFrame from './AiWidgetFrame.vue';
import AiToneSelector from './AiToneSelector.vue';
import AiGenerateButton from './AiGenerateButton.vue';
import AiResultsDisplay from './AiResultsDisplay.vue';

const props = defineProps({
  /**
   * Tool type (used for API calls)
   */
  type: {
    type: String,
    required: true
  },

  /**
   * Configuration object for the generator
   */
  config: {
    type: Object,
    required: true
  },

  /**
   * Mode: 'integrated' or 'standalone'
   */
  mode: {
    type: String,
    default: 'standalone'
  },

  /**
   * Component ID to apply results to (integrated mode)
   */
  componentId: {
    type: String,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated']);

// Initialize form data based on config fields
const formData = reactive({});
props.config.fields.forEach(field => {
  formData[field.name] = field.default || '';
});
if (props.config.showTone) {
  formData.tone = 'professional';
}

// Use the generic AI generator
const {
  isGenerating,
  generatedContent,
  error,
  usageRemaining,
  resetTime,
  hasContent,
  generate,
  copyToClipboard
} = useAIGenerator(props.type);

// Selection state for list/cards results
const selectedIndex = ref(0);

/**
 * Format content for display
 */
const displayContent = computed(() => {
  if (!generatedContent.value) return null;

  // If result is already an array, return as-is
  if (Array.isArray(generatedContent.value)) {
    return generatedContent.value;
  }

  // If it's a string and should be split into items
  if (props.config.resultFormat === 'cards' || props.config.resultFormat === 'list') {
    // Split by newlines and numbered items
    const lines = generatedContent.value.split('\n').filter(l => l.trim());
    return lines.map(line => line.replace(/^\d+[\.\)]\s*/, '').trim());
  }

  return generatedContent.value;
});

/**
 * Check if we can generate
 */
const canGenerate = computed(() => {
  // Check all required fields have values
  return props.config.fields
    .filter(f => f.required)
    .every(f => formData[f.name]?.trim?.()?.length > 0);
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    const params = { ...formData };

    await generate(params, context);

    emit('generated', {
      content: generatedContent.value
    });
  } catch (err) {
    console.error(`[SimpleGenerator:${props.type}] Generation failed:`, err);
  }
};

/**
 * Handle selection
 */
const handleSelect = (index) => {
  selectedIndex.value = index;
};

/**
 * Handle copy to clipboard
 */
const handleCopy = async () => {
  await copyToClipboard();
};

/**
 * Handle apply (integrated mode)
 */
const handleApply = () => {
  const content = Array.isArray(displayContent.value)
    ? displayContent.value[selectedIndex.value]
    : displayContent.value;

  emit('applied', {
    componentId: props.componentId,
    content,
    fullContent: generatedContent.value
  });
};
</script>

<style scoped>
.gmkb-ai-results {
  margin-top: 16px;
}

.gmkb-ai-select {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid var(--gmkb-ai-border, #e5e7eb);
  border-radius: var(--gmkb-ai-radius-md, 8px);
  background: var(--gmkb-ai-bg, #fff);
  cursor: pointer;
}

.gmkb-ai-select:focus {
  outline: none;
  border-color: var(--gmkb-ai-primary, #6366f1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}
</style>
