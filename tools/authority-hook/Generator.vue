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
    <!-- Profile Context Banner (for logged-in users) -->
    <template #profile-context>
      <ProfileContextBanner
        @profile-loaded="handleProfileLoaded"
        @profile-cleared="handleProfileCleared"
      />
    </template>

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
            v-if="hasSelectedProfile"
            type="button"
            class="generator__button generator__button--primary"
            :disabled="isSaving"
            @click="handleSaveToProfile"
          >
            <svg v-if="!isSaving" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {{ isSaving ? 'Saving...' : 'Save to Profile' }}
          </button>
          <button
            type="button"
            class="generator__button"
            :class="hasSelectedProfile ? 'generator__button--outline' : 'generator__button--primary'"
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

        <!-- Save Success Notice -->
        <div v-if="showSaveSuccess" class="authority-hook__save-notice">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
          <span>Saved to your profile!</span>
        </div>
      </div>
    </template>
  </GeneratorLayout>

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else-if="mode === 'integrated'"
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

  <!-- Embedded Mode: Landing page form (simplified, used with EmbeddedToolWrapper) -->
  <div v-else class="gmkb-embedded-form">
    <!-- Simplified 2-field form for landing page -->
    <div class="gmkb-embedded-fields">
      <div
        v-for="field in embeddedFields"
        :key="field.key"
        class="gmkb-embedded-field"
      >
        <label class="gmkb-embedded-label">{{ field.label }}</label>
        <input
          v-model="hookFields[field.key]"
          type="text"
          class="gmkb-embedded-input"
          :placeholder="field.placeholder"
          @input="handleFieldChange(field.key, $event.target.value)"
        />
      </div>
    </div>

    <!-- Results display for embedded mode -->
    <div v-if="hasGeneratedHook" class="gmkb-embedded-result">
      <div class="gmkb-embedded-result__content">
        {{ generatedHook }}
      </div>
    </div>

    <!-- Error display -->
    <div v-if="error" class="gmkb-embedded-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAuthorityHook, AUTHORITY_HOOK_FIELDS } from '../../src/composables/useAuthorityHook';
import { useAIGenerator } from '../../src/composables/useAIGenerator';
import { useStandaloneProfile } from '../../src/composables/useStandaloneProfile';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, ProfileContextBanner } from '../_shared';

// Profile context for standalone mode
const {
  isLoggedIn,
  hasSelectedProfile,
  selectedProfileId,
  saveMultipleToProfile
} = useStandaloneProfile();

const props = defineProps({
  /**
   * Mode: 'integrated', 'standalone', or 'embedded'
   * - standalone: Full two-panel layout with guidance
   * - integrated: Compact widget for embedding in other components
   * - embedded: Landing page embed with simplified form
   */
  mode: {
    type: String,
    default: 'standalone',
    validator: (v) => ['standalone', 'integrated', 'embedded'].includes(v)
  },

  /**
   * Component ID to apply results to (integrated mode)
   */
  componentId: {
    type: String,
    default: null
  },

  /**
   * Intent object for embedded mode
   * Contains: { id, label, contextHeading, contextDescription, formPlaceholders, formLabels }
   */
  intent: {
    type: Object,
    default: null
  },

  /**
   * Profile data for pre-population (embedded mode)
   * Passed from EmbeddedToolWrapper via scoped slot
   */
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated', 'change', 'preview-update', 'update:can-generate']);

/**
 * Embedded mode field configuration
 * In embedded mode, we show a simplified 2-field form (who, what)
 */
const embeddedFields = computed(() => {
  const defaultLabels = {
    who: 'Who do you help? (Target Audience)',
    what: 'What result do they get?'
  };
  const defaultPlaceholders = {
    who: 'e.g. SaaS Founders',
    what: 'e.g. Scale to $1M ARR'
  };

  return [
    {
      key: 'who',
      label: props.intent?.formLabels?.who || defaultLabels.who,
      placeholder: props.intent?.formPlaceholders?.who || defaultPlaceholders.who
    },
    {
      key: 'what',
      label: props.intent?.formLabels?.what || defaultLabels.what,
      placeholder: props.intent?.formPlaceholders?.what || defaultPlaceholders.what
    }
  ];
});

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  const whoVal = hookFields.value.who || '[WHO]';
  const whatVal = hookFields.value.what || '[WHAT]';

  if (!hookFields.value.who && !hookFields.value.what) {
    return null; // Show default preview
  }

  return `"I help <strong>${whoVal}</strong> achieve <strong>${whatVal}</strong> in <strong>90 days</strong> without <strong>the usual pain points</strong>."`;
});

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

// Save state for profile saving
const isSaving = ref(false);
const showSaveSuccess = ref(false);

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
    // Use 'builder' context for logged-in users (higher rate limits)
    // Use 'public' context for non-logged-in users
    const context = props.mode === 'integrated' || isLoggedIn.value ? 'builder' : 'public';
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
 * Handle profile data loaded (standalone mode with logged-in user)
 * Pre-populates fields from the selected profile
 * @param {object} profileData Full profile data object
 */
const handleProfileLoaded = (profileData) => {
  if (!profileData) return;

  // Pre-populate authority hook fields from profile
  hookFields.value = {
    who: profileData.hook_who || '',
    what: profileData.hook_what || '',
    when: profileData.hook_when || '',
    how: profileData.hook_how || '',
    where: profileData.hook_where || '',
    why: profileData.hook_why || ''
  };

  // Sync to composable
  who.value = hookFields.value.who;
  what.value = hookFields.value.what;
  when.value = hookFields.value.when;
  how.value = hookFields.value.how;
  where.value = hookFields.value.where;
  why.value = hookFields.value.why;
};

/**
 * Handle profile cleared (standalone mode)
 * Resets fields to empty
 */
const handleProfileCleared = () => {
  handleReset();
};

/**
 * Save authority hook fields to the selected profile
 * @returns {Promise<boolean>}
 */
const saveHookToProfile = async () => {
  if (!hasSelectedProfile.value || !isLoggedIn.value) {
    return false;
  }

  const fieldsToSave = {
    hook_who: hookFields.value.who,
    hook_what: hookFields.value.what,
    hook_when: hookFields.value.when,
    hook_how: hookFields.value.how,
    hook_where: hookFields.value.where,
    hook_why: hookFields.value.why
  };

  const success = await saveMultipleToProfile(fieldsToSave);
  return success;
};

/**
 * Handle save to profile button click
 */
const handleSaveToProfile = async () => {
  isSaving.value = true;
  showSaveSuccess.value = false;

  try {
    const success = await saveHookToProfile();
    if (success) {
      showSaveSuccess.value = true;
      // Auto-hide after 3 seconds
      setTimeout(() => {
        showSaveSuccess.value = false;
      }, 3000);
    }
  } finally {
    isSaving.value = false;
  }
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

/**
 * Watch for field changes in embedded mode and emit preview updates
 */
watch(
  () => [hookFields.value.who, hookFields.value.what],
  () => {
    if (props.mode === 'embedded') {
      emit('preview-update', {
        previewHtml: embeddedPreviewText.value,
        fields: {
          who: hookFields.value.who,
          what: hookFields.value.what
        }
      });
    }
  },
  { deep: true }
);

/**
 * Watch for profileData prop changes (embedded mode with EmbeddedToolWrapper)
 * Pre-populates form fields when profile data is provided
 */
watch(
  () => props.profileData,
  (newData) => {
    if (newData && props.mode === 'embedded') {
      // Pre-populate fields from profile data
      hookFields.value = {
        who: newData.hook_who || hookFields.value.who || '',
        what: newData.hook_what || hookFields.value.what || '',
        when: newData.hook_when || hookFields.value.when || '',
        how: newData.hook_how || hookFields.value.how || '',
        where: newData.hook_where || hookFields.value.where || '',
        why: newData.hook_why || hookFields.value.why || ''
      };

      // Sync to composable
      who.value = hookFields.value.who;
      what.value = hookFields.value.what;
      when.value = hookFields.value.when;
      how.value = hookFields.value.how;
      where.value = hookFields.value.where;
      why.value = hookFields.value.why;
    }
  },
  { immediate: true }
);

/**
 * Check if embedded form has minimum required fields
 */
const canGenerateEmbedded = computed(() => {
  return hookFields.value.who?.trim() && hookFields.value.what?.trim();
});

/**
 * Emit can-generate status changes to parent (for embedded mode)
 */
watch(canGenerateEmbedded, (newValue) => {
  if (props.mode === 'embedded') {
    emit('update:can-generate', !!newValue);
  }
}, { immediate: true });
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
  flex-wrap: wrap;
  gap: var(--mkcg-space-sm, 12px);
}

.authority-hook__save-notice {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-top: var(--mkcg-space-md, 16px);
  padding: 12px 16px;
  background: rgba(16, 185, 129, 0.1);
  border: 1px solid rgba(16, 185, 129, 0.3);
  border-radius: var(--mkcg-radius, 8px);
  color: #065f46;
  font-size: 14px;
  font-weight: 500;
  animation: fadeIn 0.3s ease;
}

.authority-hook__save-notice svg {
  color: #10b981;
  flex-shrink: 0;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
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

/* Embedded Mode Styles (for landing page) */
.gmkb-embedded-form {
  width: 100%;
}

.gmkb-embedded-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gmkb-embedded-field {
  display: flex;
  flex-direction: column;
}

.gmkb-embedded-label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--mkcg-text-primary, #0f172a);
}

.gmkb-embedded-input {
  width: 100%;
  padding: 14px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  box-sizing: border-box;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gmkb-embedded-input:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.gmkb-embedded-input::placeholder {
  color: var(--mkcg-text-light, #94a3b8);
}

.gmkb-embedded-result {
  margin-top: 20px;
  padding: 16px;
  background: linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%);
  border: 1px solid #86efac;
  border-radius: 8px;
}

.gmkb-embedded-result__content {
  font-size: 15px;
  line-height: 1.6;
  color: #166534;
  font-style: italic;
}

.gmkb-embedded-error {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
}
</style>
