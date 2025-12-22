<template>
  <AiWidgetFrame
    title="Authority Hook Builder"
    description="Create a powerful positioning statement using the 6W framework."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasGeneratedHook"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Authority Hook"
    :show-cta="false"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- 6W Framework Fields -->
    <div class="gmkb-ai-form">
      <!-- Progress Indicator -->
      <div class="gmkb-ai-hook-progress">
        <div class="gmkb-ai-progress">
          <div
            class="gmkb-ai-progress__bar"
            :style="{ width: `${completionPercentage}%` }"
          ></div>
        </div>
        <span class="gmkb-ai-hook-progress__text">
          {{ filledFields }}/{{ totalFields }} fields completed
        </span>
      </div>

      <!-- Hook Fields -->
      <div class="gmkb-ai-hook-fields">
        <div
          v-for="field in AUTHORITY_HOOK_FIELDS"
          :key="field.key"
          class="gmkb-ai-hook-field"
        >
          <div class="gmkb-ai-hook-field__header">
            <label class="gmkb-ai-hook-field__label">{{ field.label }}</label>
            <span class="gmkb-ai-hook-field__prefix">{{ field.prefix }}</span>
          </div>
          <input
            v-model="hookFields[field.key]"
            type="text"
            class="gmkb-ai-input"
            :placeholder="field.placeholder"
            @input="handleFieldChange(field.key, $event.target.value)"
          />
          <span class="gmkb-ai-hint">{{ field.description }}</span>
        </div>
      </div>

      <!-- Live Preview -->
      <div v-if="authorityHookSummary" class="gmkb-ai-hook-preview">
        <h4 class="gmkb-ai-hook-preview__title">Live Preview</h4>
        <p class="gmkb-ai-hook-preview__text">{{ authorityHookSummary }}</p>
      </div>

      <!-- AI Polish Button (optional) -->
      <div class="gmkb-ai-hook-actions">
        <AiGenerateButton
          text="Polish with AI"
          loading-text="Polishing..."
          :loading="isGenerating"
          :disabled="!isValid"
          @click="handleGenerate"
        />
        <button
          type="button"
          class="gmkb-ai-button gmkb-ai-button--secondary"
          @click="handleReset"
        >
          Reset
        </button>
      </div>
    </div>

    <!-- AI Generated Result -->
    <template #results>
      <div v-if="hasGeneratedHook" class="gmkb-ai-hook-result">
        <p class="gmkb-ai-hook-result__label">AI-Polished Version:</p>
        <div class="gmkb-ai-results__content">
          {{ generatedHook }}
        </div>
        <div class="gmkb-ai-hook-result__actions">
          <button
            type="button"
            class="gmkb-ai-button gmkb-ai-button--ghost"
            @click="useGeneratedHook"
          >
            Use This Version
          </button>
        </div>
      </div>
    </template>
  </AiWidgetFrame>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthorityHook, AUTHORITY_HOOK_FIELDS } from '@composables/useAuthorityHook';
import { useAIGenerator } from '@composables/useAIGenerator';
import AiWidgetFrame from '@ai/AiWidgetFrame.vue';
import AiGenerateButton from '@ai/AiGenerateButton.vue';

const props = defineProps({
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

const emit = defineEmits(['applied', 'generated', 'change']);

// Use composables
const {
  who,
  what,
  when,
  how,
  where,
  why,
  authorityHookSummary,
  isValid,
  completionPercentage,
  updateField,
  reset,
  syncFromStore
} = useAuthorityHook();

// AI Generator for polishing
const {
  isGenerating,
  generatedContent: generatedHook,
  error,
  usageRemaining,
  resetTime,
  generate: generateAI,
  copyToClipboard
} = useAIGenerator('authority_hook');

// Local reactive state that mirrors the composable
const hookFields = ref({
  who: '',
  what: '',
  when: '',
  how: '',
  where: '',
  why: ''
});

// Constants
const totalFields = AUTHORITY_HOOK_FIELDS.length;

/**
 * Number of filled fields
 */
const filledFields = computed(() => {
  return Object.values(hookFields.value).filter(v => v && v.trim()).length;
});

/**
 * Check if AI generated hook exists
 */
const hasGeneratedHook = computed(() => {
  return !!generatedHook.value;
});

/**
 * Handle field change
 */
const handleFieldChange = (key, value) => {
  updateField(key, value);
  emit('change', { field: key, value, hook: hookFields.value });
};

/**
 * Handle AI polish generation
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generateAI(hookFields.value, context);

    emit('generated', {
      original: hookFields.value,
      polished: generatedHook.value
    });
  } catch (err) {
    console.error('[AuthorityHookBuilder] Generation failed:', err);
  }
};

/**
 * Use the AI-generated hook
 */
const useGeneratedHook = () => {
  // The generated hook is a single statement, update the summary
  emit('applied', {
    componentId: props.componentId,
    hook: hookFields.value,
    polished: generatedHook.value
  });
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
  emit('applied', {
    componentId: props.componentId,
    hook: hookFields.value,
    summary: authorityHookSummary.value
  });
};

/**
 * Handle reset
 */
const handleReset = () => {
  reset();
  hookFields.value = {
    who: '',
    what: '',
    when: '',
    how: '',
    where: '',
    why: ''
  };
};

/**
 * Sync from store on mount
 */
onMounted(() => {
  syncFromStore();
  hookFields.value = {
    who: who.value,
    what: what.value,
    when: when.value,
    how: how.value,
    where: where.value,
    why: why.value
  };
});

/**
 * Watch for composable changes and sync to local state
 */
watch([who, what, when, how, where, why], () => {
  hookFields.value = {
    who: who.value,
    what: what.value,
    when: when.value,
    how: how.value,
    where: where.value,
    why: why.value
  };
});
</script>

<style scoped>
.gmkb-ai-hook-progress {
  margin-bottom: 20px;
}

.gmkb-ai-hook-progress__text {
  display: block;
  margin-top: 8px;
  font-size: 12px;
  color: var(--gmkb-ai-text-secondary, #64748b);
  text-align: right;
}

.gmkb-ai-hook-fields {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.gmkb-ai-hook-field__header {
  display: flex;
  align-items: baseline;
  gap: 8px;
  margin-bottom: 6px;
}

.gmkb-ai-hook-field__label {
  font-size: 14px;
  font-weight: 600;
  color: var(--gmkb-ai-primary, #6366f1);
}

.gmkb-ai-hook-field__prefix {
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
  font-style: italic;
}

.gmkb-ai-hook-preview {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #7dd3fc;
  border-radius: var(--gmkb-ai-radius-md, 8px);
}

.gmkb-ai-hook-preview__title {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: #0369a1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gmkb-ai-hook-preview__text {
  margin: 0;
  font-size: 15px;
  line-height: 1.7;
  color: #0c4a6e;
  font-style: italic;
}

.gmkb-ai-hook-actions {
  display: flex;
  gap: 12px;
  margin-top: 20px;
}

.gmkb-ai-hook-result {
  padding: 16px;
  background: var(--gmkb-ai-bg-tertiary, #f3f4f6);
  border-radius: var(--gmkb-ai-radius-md, 8px);
}

.gmkb-ai-hook-result__label {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: var(--gmkb-ai-text-secondary, #64748b);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gmkb-ai-hook-result__actions {
  margin-top: 12px;
  text-align: right;
}
</style>
