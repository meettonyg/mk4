<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Authority Hook Builder"
    subtitle="Create a powerful positioning statement using the 6W framework with AI"
    intro-text="Build your authority hook by defining who you help, what transformation you provide, when they need you, how you deliver results, where you've proven success, and why you do what you do. Get AI assistance to polish your hook into a compelling positioning statement."
    generator-type="authority-hook"
    :has-results="hasGeneratedHook"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Progress Indicator -->
      <div class="generator__progress">
        <div class="generator__progress-bar-container">
          <div
            class="generator__progress-bar"
            :style="{ width: `${completionPercentage}%` }"
          ></div>
        </div>
        <span class="generator__progress-text">
          {{ filledFields }}/{{ totalFields }} fields completed
        </span>
      </div>

      <!-- Hook Fields -->
      <div class="generator__section">
        <h3 class="generator__section-title">6W Framework</h3>

        <div class="generator__hook-fields">
          <div
            v-for="field in AUTHORITY_HOOK_FIELDS"
            :key="field.key"
            class="generator__hook-field"
          >
            <div class="generator__hook-field-header">
              <label class="generator__field-label">{{ field.label }}</label>
              <span class="generator__hook-field-prefix">{{ field.prefix }}</span>
            </div>
            <input
              v-model="hookFields[field.key]"
              type="text"
              class="generator__field-input"
              :placeholder="field.placeholder"
              @input="handleFieldChange(field.key, $event.target.value)"
            />
            <p class="generator__field-helper">{{ field.description }}</p>
          </div>
        </div>
      </div>

      <!-- Live Preview -->
      <div v-if="authorityHookSummary" class="generator__preview">
        <h4 class="generator__preview-title">Live Preview</h4>
        <p class="generator__preview-text">{{ authorityHookSummary }}</p>
      </div>

      <!-- AI Polish Button -->
      <div class="generator__actions">
        <button
          type="button"
          class="generator__button generator__button--call-to-action"
          :class="{ 'generator__button--loading': isGenerating }"
          :disabled="!isValid || isGenerating"
          @click="handleGenerate"
        >
          <svg v-if="!isGenerating" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {{ isGenerating ? 'Polishing...' : 'Polish with AI' }}
        </button>
        <button
          type="button"
          class="generator__button generator__button--outline"
          @click="handleReset"
        >
          Reset
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="generator__error">
        <p>{{ error }}</p>
        <button type="button" class="generator__button generator__button--outline" @click="handleGenerate">
          Try Again
        </button>
      </div>
    </template>

    <!-- Right Panel: Guidance -->
    <template #right>
      <GuidancePanel
        title="Building Your Authority Hook"
        subtitle="Your Authority Hook is a powerful positioning statement that clearly communicates who you serve, what transformation you provide, and why you're uniquely qualified to help."
        :formula="authorityHookFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Authority Hooks:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="authority-hook__results">
        <div class="authority-hook__results-header">
          <h3>Your AI-Polished Authority Hook</h3>
          <p>A refined version of your positioning statement</p>
        </div>

        <!-- Generated Hook Content -->
        <div class="authority-hook__content">
          <p>{{ generatedHook }}</p>
        </div>

        <!-- Actions -->
        <div class="authority-hook__actions">
          <button
            type="button"
            class="generator__button generator__button--primary"
            @click="useGeneratedHook"
          >
            Use This Version
          </button>
          <button
            type="button"
            class="generator__button generator__button--outline"
            @click="handleCopy"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy to Clipboard
          </button>
        </div>
      </div>
    </template>
  </GeneratorLayout>

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else
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
import { useAuthorityHook, AUTHORITY_HOOK_FIELDS } from '../../composables/useAuthorityHook';
import { useAIGenerator } from '../../composables/useAIGenerator';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../vue/components/ai/AiWidgetFrame.vue';
import AiGenerateButton from '../../vue/components/ai/AiGenerateButton.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel } from '../_shared';

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
 * Authority Hook formula for guidance panel
 */
const authorityHookFormula = 'I help <span class="generator__highlight">[WHO]</span> achieve <span class="generator__highlight">[WHAT]</span> when <span class="generator__highlight">[WHEN]</span> through <span class="generator__highlight">[HOW]</span>.';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Authority Hooks Matter',
    description: 'Your Authority Hook is your professional positioning statement that instantly communicates your value. It helps potential clients understand exactly who you help, what transformation you provide, and why they should choose you. A compelling Authority Hook is the foundation of all your marketing and messaging.'
  },
  {
    title: 'What Makes a Great Authority Hook',
    description: 'The best Authority Hooks are specific, benefit-focused, and memorable. They clearly identify your target audience, articulate the exact transformation or result you deliver, specify when someone needs your help, and explain your unique methodology or approach.'
  },
  {
    title: 'Where to Use Your Authority Hook',
    description: 'Use your Authority Hook in website headlines, social media profiles, email signatures, speaker introductions, networking conversations, and any place where you need to quickly establish your expertise and attract your ideal clients.'
  }
];

/**
 * Example authority hooks for guidance panel
 */
const examples = [
  {
    title: 'Business Coach Example:',
    description: 'I help ambitious entrepreneurs scale to 7-figures when they\'re stuck at the 6-figure plateau through proven systems that create sustainable growth without burnout.'
  },
  {
    title: 'Marketing Consultant Example:',
    description: 'I help B2B service providers generate qualified leads when traditional marketing isn\'t working through strategic content that positions them as the obvious choice in their market.'
  }
];

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
/* Standalone Mode Styles */
.generator__progress {
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.generator__progress-bar-container {
  width: 100%;
  height: 8px;
  background-color: var(--mkcg-bg-secondary, #f3f4f6);
  border-radius: 4px;
  overflow: hidden;
}

.generator__progress-bar {
  height: 100%;
  background: linear-gradient(90deg, var(--mkcg-primary, #1a9bdc), var(--mkcg-primary-light, #4eb8e8));
  transition: width 0.3s ease;
}

.generator__progress-text {
  display: block;
  margin-top: var(--mkcg-space-xs, 8px);
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
  text-align: right;
}

.generator__section {
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.generator__section-title {
  font-size: var(--mkcg-font-size-lg, 18px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
  margin: 0 0 var(--mkcg-space-md, 20px) 0;
}

.generator__hook-fields {
  display: flex;
  flex-direction: column;
  gap: var(--mkcg-space-md, 20px);
}

.generator__hook-field-header {
  display: flex;
  align-items: baseline;
  gap: var(--mkcg-space-xs, 8px);
  margin-bottom: var(--mkcg-space-xs, 8px);
}

.generator__hook-field-prefix {
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-style: italic;
}

.generator__preview {
  margin-top: var(--mkcg-space-md, 20px);
  padding: var(--mkcg-space-md, 20px);
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #7dd3fc;
  border-radius: var(--mkcg-radius, 8px);
}

.generator__preview-title {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-sm, 14px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: #0369a1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.generator__preview-text {
  margin: 0;
  font-size: var(--mkcg-font-size-base, 15px);
  line-height: var(--mkcg-line-height-relaxed, 1.7);
  color: #0c4a6e;
  font-style: italic;
}

.generator__actions {
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
  margin-top: var(--mkcg-space-lg, 30px);
}

.generator__error {
  margin-top: var(--mkcg-space-md, 20px);
  padding: var(--mkcg-space-md, 20px);
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--mkcg-radius, 8px);
  text-align: center;
}

.generator__error p {
  color: #991b1b;
  margin: 0 0 var(--mkcg-space-sm, 12px) 0;
}

/* Authority Hook Results */
.authority-hook__results {
  padding: var(--mkcg-space-md, 20px);
}

.authority-hook__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.authority-hook__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.authority-hook__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.authority-hook__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.authority-hook__content p {
  margin: 0;
  color: var(--mkcg-text-primary, #2c3e50);
  font-size: var(--mkcg-font-size-base, 15px);
  font-style: italic;
}

.authority-hook__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

/* Integrated Mode Styles (kept from original) */
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
