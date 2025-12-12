<template>
  <AiWidgetFrame
    :title="config.title"
    :description="config.description"
    :mode="mode"
    :is-loading="isGenerating || isSaving"
    :has-results="hasContent"
    :error="error || saveError"
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
    <!-- Profile Selector (standalone mode only) -->
    <div v-if="showProfileSelector" class="gmkb-ai-profile-selector">
      <ProfileSelector
        v-model="selectedProfileId"
        mode="dropdown"
        label="Save to Profile"
        :placeholder="`Select a profile to save ${type} to...`"
        :show-current-profile="true"
        @select="handleProfileSelect"
      />
    </div>

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

        <!-- Save to Profile Button (standalone mode) -->
        <div v-if="hasContent && showSaveToProfile" class="gmkb-ai-save-actions">
          <button
            type="button"
            class="gmkb-ai-btn gmkb-ai-btn--primary"
            :disabled="!canSaveToProfile || isSaving"
            @click="handleSaveToProfile"
          >
            <span v-if="isSaving" class="gmkb-ai-btn__spinner"></span>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {{ isSaving ? 'Saving...' : 'Save to Profile' }}
          </button>
          <span v-if="!selectedProfileId" class="gmkb-ai-save-hint">
            Select a profile above to enable saving
          </span>
          <span v-if="saveSuccess" class="gmkb-ai-save-success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Saved successfully!
          </span>
        </div>
      </div>
    </template>
  </AiWidgetFrame>
</template>

<script setup>
import { ref, computed, reactive, onMounted, watch } from 'vue';
import { useAIGenerator } from '../../../composables/useAIGenerator';
import { useProfileContext } from '../../../composables/useProfileContext';
import AiWidgetFrame from './AiWidgetFrame.vue';
import AiToneSelector from './AiToneSelector.vue';
import AiGenerateButton from './AiGenerateButton.vue';
import AiResultsDisplay from './AiResultsDisplay.vue';
import ProfileSelector from '../shared/ProfileSelector.vue';

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
  },

  /**
   * Pre-selected profile ID (optional)
   */
  profileId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated', 'saved']);

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

// Profile context integration
const {
  profileId: contextProfileId,
  isInBuilder,
  isSaving,
  saveError,
  saveToProfile,
  saveToComponent
} = useProfileContext();

// Selection state for list/cards results
const selectedIndex = ref(0);
const selectedProfileId = ref(props.profileId || null);
const saveSuccess = ref(false);

/**
 * Show profile selector in standalone mode when not in builder
 */
const showProfileSelector = computed(() => {
  return props.mode === 'standalone' && !isInBuilder.value;
});

/**
 * Show save to profile button
 */
const showSaveToProfile = computed(() => {
  return props.mode === 'standalone' && !isInBuilder.value;
});

/**
 * Can save to profile check
 */
const canSaveToProfile = computed(() => {
  return selectedProfileId.value && hasContent.value && !isSaving.value;
});

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
 * Handle apply (integrated mode - save to component)
 */
const handleApply = () => {
  const content = Array.isArray(displayContent.value)
    ? displayContent.value[selectedIndex.value]
    : displayContent.value;

  if (props.mode === 'integrated' && props.componentId) {
    try {
      saveToComponent(props.componentId, props.type, content);
      emit('applied', {
        componentId: props.componentId,
        content,
        fullContent: generatedContent.value
      });
    } catch (err) {
      console.error(`[SimpleGenerator:${props.type}] Failed to save to component:`, err);
    }
  } else {
    emit('applied', {
      componentId: props.componentId,
      content,
      fullContent: generatedContent.value
    });
  }
};

/**
 * Handle profile selection
 */
const handleProfileSelect = (profileId) => {
  selectedProfileId.value = profileId;
  saveSuccess.value = false;
};

/**
 * Handle save to profile (standalone mode)
 */
const handleSaveToProfile = async () => {
  if (!selectedProfileId.value || !hasContent.value) return;

  saveSuccess.value = false;

  // Get the content to save (selected item for arrays, full content for text)
  const contentToSave = Array.isArray(displayContent.value)
    ? displayContent.value[selectedIndex.value]
    : generatedContent.value;

  try {
    const result = await saveToProfile(props.type, contentToSave, {
      profileId: selectedProfileId.value
    });

    if (result.success) {
      saveSuccess.value = true;

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        saveSuccess.value = false;
      }, 3000);

      emit('saved', {
        profileId: selectedProfileId.value,
        content: contentToSave,
        fields: result.saved
      });
    }
  } catch (err) {
    console.error(`[SimpleGenerator:${props.type}] Failed to save to profile:`, err);
  }
};

/**
 * Initialize context profile on mount
 */
onMounted(() => {
  // Use context profile ID if available and no prop provided
  if (!selectedProfileId.value && contextProfileId.value) {
    selectedProfileId.value = contextProfileId.value;
  }
});

/**
 * Watch for context profile changes
 */
watch(contextProfileId, (newVal) => {
  if (newVal && !selectedProfileId.value) {
    selectedProfileId.value = newVal;
  }
});
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

/* Profile Selector Section */
.gmkb-ai-profile-selector {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

/* Save Actions */
.gmkb-ai-save-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.gmkb-ai-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.gmkb-ai-btn--primary {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
}

.gmkb-ai-btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.gmkb-ai-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gmkb-ai-btn__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.gmkb-ai-save-hint {
  font-size: 13px;
  color: #64748b;
}

.gmkb-ai-save-success {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #059669;
  font-weight: 500;
}
</style>
