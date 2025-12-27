<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Interview Questions Generator"
    subtitle="Generate 25 thoughtful interview questions organized by category using AI"
    intro-text="Generate 25 professional interview questions organized into four strategic categories: Introductory Questions, Expertise Deep-Dives, Story-Based Questions, and Actionable Takeaways. Each question is designed to help you have engaging, insightful conversations with your guests."
    generator-type="questions"
    :has-results="hasQuestions"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Topics Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Interview Topics</h3>

        <div class="generator__field">
          <label class="generator__field-label">Topics You Discuss *</label>
          <textarea
            v-model="topicsText"
            class="generator__field-input generator__field-textarea"
            placeholder="e.g., Leadership development, Building high-performance teams, Navigating career transitions..."
            rows="4"
          ></textarea>
          <p class="generator__field-helper">
            List 3-5 topics you typically discuss in interviews. Be specific about the areas you want to explore with your guests.
          </p>
        </div>
      </div>

      <!-- Context Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Additional Context (Optional)</h3>

        <div class="generator__field">
          <label class="generator__field-label">Your Background</label>
          <textarea
            v-model="authorityHookText"
            class="generator__field-input generator__field-textarea"
            placeholder="e.g., Former Fortune 500 executive turned leadership coach..."
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Add context about your background or expertise to generate more relevant and tailored questions.
          </p>
        </div>
      </div>

      <!-- Generate Button -->
      <div class="generator__actions">
        <button
          type="button"
          class="generator__button generator__button--call-to-action"
          :class="{ 'generator__button--loading': isGenerating }"
          :disabled="!canGenerate || isGenerating"
          @click="handleGenerate"
        >
          <svg v-if="!isGenerating" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {{ isGenerating ? 'Generating Questions...' : 'Generate 25 Questions with AI' }}
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
        title="Creating Memorable Interview Questions"
        subtitle="Great interview questions go beyond surface-level conversation to uncover deep insights, memorable stories, and actionable advice that resonates with your audience."
        :formula="questionsFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Interview Questions:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="questions-generator__results">
        <div class="questions-generator__results-header">
          <h3>Your Generated Questions</h3>
          <p>{{ questions.length }} questions across {{ categories.length }} categories</p>
        </div>

        <!-- Category Accordion -->
        <div class="questions-generator__accordion">
          <div
            v-for="category in categories"
            :key="category.key"
            class="questions-generator__accordion-item"
            :class="{ 'questions-generator__accordion-item--open': openCategory === category.key }"
          >
            <button
              type="button"
              class="questions-generator__accordion-header"
              @click="toggleCategory(category.key)"
            >
              <span class="questions-generator__accordion-title">
                {{ category.label }}
                <span class="questions-generator__badge">
                  {{ getCategoryQuestions(category.key).length }}
                </span>
              </span>
              <svg class="questions-generator__accordion-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div v-if="openCategory === category.key" class="questions-generator__accordion-content">
              <ol class="questions-generator__questions-list">
                <li
                  v-for="(question, index) in getCategoryQuestions(category.key)"
                  :key="index"
                  class="questions-generator__question-item"
                >
                  {{ question }}
                </li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Actions -->
        <div class="questions-generator__actions">
          <button
            type="button"
            class="generator__button generator__button--outline"
            @click="handleCopy"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy All Questions
          </button>
        </div>
      </div>
    </template>
  </GeneratorLayout>

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else-if="mode === 'integrated'"
    title="Interview Questions Generator"
    description="Generate 25 thoughtful interview questions organized by category."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasQuestions"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Questions"
    :show-cta="!hasQuestions"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Topics Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Topics You Discuss</label>
        <textarea
          v-model="topicsText"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., Leadership development, Building high-performance teams, Navigating career transitions..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          List 3-5 topics you typically discuss in interviews.
        </span>
      </div>

      <!-- Authority Hook (optional) -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Your Background (Optional)</label>
        <textarea
          v-model="authorityHookText"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., Former Fortune 500 executive turned leadership coach..."
          rows="2"
        ></textarea>
        <span class="gmkb-ai-hint">
          Add context about your background for more relevant questions.
        </span>
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate 25 Questions"
        loading-text="Generating questions..."
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasQuestions" class="gmkb-ai-questions">
        <!-- Category Accordion -->
        <div class="gmkb-ai-accordion">
          <div
            v-for="category in categories"
            :key="category.key"
            class="gmkb-ai-accordion__item"
            :class="{ 'gmkb-ai-accordion__item--open': openCategory === category.key }"
          >
            <button
              type="button"
              class="gmkb-ai-accordion__header"
              @click="toggleCategory(category.key)"
            >
              <span>
                {{ category.label }}
                <span class="gmkb-ai-badge gmkb-ai-badge--primary">
                  {{ getCategoryQuestions(category.key).length }}
                </span>
              </span>
              <svg class="gmkb-ai-accordion__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div v-if="openCategory === category.key" class="gmkb-ai-accordion__content">
              <ol class="gmkb-ai-questions__list">
                <li
                  v-for="(question, index) in getCategoryQuestions(category.key)"
                  :key="index"
                  class="gmkb-ai-questions__item"
                >
                  {{ question }}
                </li>
              </ol>
            </div>
          </div>
        </div>

        <!-- Total Count -->
        <div class="gmkb-ai-questions__summary">
          {{ questions.length }} questions generated across {{ categories.length }} categories
        </div>
      </div>
    </template>
  </AiWidgetFrame>

  <!-- Embedded Mode: Landing page form (simplified, used with EmbeddedToolWrapper) -->
  <div v-else class="gmkb-embedded-form">
    <!-- Simplified form for landing page -->
    <div class="gmkb-embedded-fields">
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">{{ currentIntent?.formLabels?.topics || 'Topics You Discuss' }} *</label>
        <textarea
          v-model="topicsText"
          class="gmkb-embedded-input gmkb-embedded-textarea"
          :placeholder="currentIntent?.formPlaceholders?.topics || 'e.g., Leadership development, Building high-performance teams...'"
          rows="3"
        ></textarea>
      </div>

      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">{{ currentIntent?.formLabels?.background || 'Your Background (Optional)' }}</label>
        <textarea
          v-model="authorityHookText"
          class="gmkb-embedded-input gmkb-embedded-textarea"
          :placeholder="currentIntent?.formPlaceholders?.background || 'e.g., Former Fortune 500 executive turned leadership coach...'"
          rows="2"
        ></textarea>
      </div>
    </div>

    <!-- Error display -->
    <div v-if="error" class="gmkb-embedded-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useAIQuestions, QUESTION_CATEGORIES } from '../../src/composables/useAIQuestions';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';

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

const emit = defineEmits(['applied', 'generated', 'preview-update', 'update:can-generate']);

// Use composables
const {
  isGenerating,
  error,
  usageRemaining,
  resetTime,
  questions,
  hasQuestions,
  introductoryQuestions,
  expertiseQuestions,
  storyQuestions,
  actionableQuestions,
  generate,
  copyToClipboard
} = useAIQuestions();

const { authorityHookSummary, syncFromStore } = useAuthorityHook();

// Local state
const topicsText = ref('');
const authorityHookText = ref('');
const openCategory = ref('introductory');

// Categories config
const categories = QUESTION_CATEGORIES;

// Inject profile data from EmbeddedToolWrapper (for embedded mode)
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Populate topics from hook_what or topics field
  if (profileData.hook_what && !topicsText.value) {
    topicsText.value = profileData.hook_what;
  }

  // Populate authority hook text
  if (profileData.authority_hook && !authorityHookText.value) {
    authorityHookText.value = profileData.authority_hook;
  }
}

/**
 * Questions formula for guidance panel
 */
const questionsFormula = '<span class="generator__highlight">[CONTEXT]</span> + <span class="generator__highlight">[EXPERTISE]</span> + <span class="generator__highlight">[GOAL]</span> = Interview Questions';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Great Questions Matter',
    description: 'The quality of your interview is directly tied to the quality of your questions. Great questions go beyond surface-level conversation to uncover deep insights, compelling stories, and actionable advice that your audience will remember and apply.'
  },
  {
    title: 'What Makes Questions Memorable',
    description: 'The best interview questions are specific, open-ended, and designed to elicit stories and examples. They focus on experiences, transformations, and practical wisdom rather than yes/no answers or generic industry talk.'
  },
  {
    title: 'How to Prepare with Your Questions',
    description: 'Use your generated questions as a strategic framework, not a rigid script. Select 8-10 questions that best align with your guest\'s expertise, and be ready to ask spontaneous follow-up questions based on their responses.'
  }
];

/**
 * Example interview questions for guidance panel
 */
const examples = [
  {
    title: 'Deep-Dive Question:',
    description: 'Can you walk me through a specific moment when you realized your approach to leadership needed to fundamentally change? What happened, and what did you do differently?'
  },
  {
    title: 'Actionable Question:',
    description: 'If someone listening is struggling to build trust with their team, what\'s one practical exercise or habit they could implement this week to start making progress?'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return topicsText.value.trim().length > 0;
});

/**
 * Get questions for a specific category
 */
const getCategoryQuestions = (key) => {
  switch (key) {
    case 'introductory':
      return introductoryQuestions.value;
    case 'expertise':
      return expertiseQuestions.value;
    case 'stories':
      return storyQuestions.value;
    case 'actionable':
      return actionableQuestions.value;
    default:
      return [];
  }
};

/**
 * Toggle accordion category
 */
const toggleCategory = (key) => {
  openCategory.value = openCategory.value === key ? null : key;
};

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  openCategory.value = 'introductory';

  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      topics: topicsText.value,
      authorityHook: authorityHookText.value
    }, context);

    emit('generated', {
      questions: questions.value
    });
  } catch (err) {
    console.error('[QuestionsGenerator] Generation failed:', err);
  }
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
    questions: questions.value
  });
};

/**
 * Sync authority hook from store on mount
 */
onMounted(() => {
  syncFromStore();
  if (authorityHookSummary.value) {
    authorityHookText.value = authorityHookSummary.value;
  }
});

/**
 * Watch for store changes
 */
watch(authorityHookSummary, (newVal) => {
  if (newVal && !authorityHookText.value) {
    authorityHookText.value = newVal;
  }
});

/**
 * Watch for injected profile data changes (embedded mode)
 */
watch(
  injectedProfileData,
  (newData) => {
    if (newData && props.mode === 'embedded') {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

/**
 * Watch for profileData prop changes (embedded mode with EmbeddedToolWrapper)
 * Pre-populates form fields when profile data is provided
 */
watch(
  () => props.profileData,
  (newData) => {
    if (newData && props.mode === 'embedded') {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

/**
 * Current intent for embedded mode
 * Uses props.intent or falls back to default
 */
const currentIntent = computed(() => props.intent || null);

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  const topicsVal = topicsText.value || '[YOUR TOPICS]';

  if (!topicsText.value) {
    return null; // Show default preview
  }

  return `<strong>25 interview questions</strong> covering: <strong>${topicsVal}</strong>`;
});

/**
 * Watch for field changes in embedded mode and emit preview updates
 */
watch(
  () => topicsText.value,
  () => {
    if (props.mode === 'embedded') {
      emit('preview-update', {
        previewHtml: embeddedPreviewText.value,
        fields: {
          topics: topicsText.value
        }
      });
    }
  },
  { deep: true }
);

/**
 * Emit can-generate status changes to parent (for embedded mode)
 */
watch(canGenerate, (newValue) => {
  if (props.mode === 'embedded') {
    emit('update:can-generate', !!newValue);
  }
}, { immediate: true });
</script>

<style scoped>
/* Standalone Mode Styles */
.generator__section {
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.generator__section-title {
  font-size: var(--mkcg-font-size-lg, 18px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
  margin: 0 0 var(--mkcg-space-md, 20px) 0;
}

.generator__actions {
  margin-top: var(--mkcg-space-lg, 30px);
  text-align: center;
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

/* Questions Results */
.questions-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.questions-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.questions-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.questions-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.questions-generator__accordion {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.questions-generator__accordion-item {
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  margin-bottom: var(--mkcg-space-sm, 12px);
  overflow: hidden;
  transition: var(--mkcg-transition-fast, 0.15s ease);
}

.questions-generator__accordion-item:hover {
  border-color: var(--mkcg-primary, #1a9bdc);
}

.questions-generator__accordion-header {
  width: 100%;
  padding: var(--mkcg-space-md, 20px);
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--mkcg-bg-primary, #ffffff);
  border: none;
  cursor: pointer;
  text-align: left;
  font-size: var(--mkcg-font-size-base, 16px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
  transition: var(--mkcg-transition-fast, 0.15s ease);
}

.questions-generator__accordion-header:hover {
  background: var(--mkcg-bg-secondary, #f8f9fa);
}

.questions-generator__accordion-title {
  display: flex;
  align-items: center;
  gap: var(--mkcg-space-xs, 8px);
}

.questions-generator__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 var(--mkcg-space-xs, 8px);
  font-size: var(--mkcg-font-size-sm, 14px);
  font-weight: var(--mkcg-font-weight-medium, 500);
  color: var(--mkcg-primary, #1a9bdc);
  background: rgba(26, 155, 220, 0.1);
  border-radius: var(--mkcg-radius-sm, 4px);
}

.questions-generator__accordion-icon {
  transition: transform var(--mkcg-transition-fast, 0.15s ease);
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.questions-generator__accordion-item--open .questions-generator__accordion-icon {
  transform: rotate(180deg);
}

.questions-generator__accordion-content {
  padding: 0 var(--mkcg-space-md, 20px) var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
}

.questions-generator__questions-list {
  margin: 0;
  padding: 0 0 0 24px;
  list-style: decimal;
}

.questions-generator__question-item {
  padding: var(--mkcg-space-sm, 12px) 0;
  font-size: var(--mkcg-font-size-base, 16px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
  color: var(--mkcg-text-primary, #2c3e50);
  border-bottom: 1px solid var(--mkcg-border-light, #e9ecef);
}

.questions-generator__question-item:last-child {
  border-bottom: none;
}

.questions-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

/* Integrated Mode Styles (preserved from original) */
.gmkb-ai-questions__list {
  margin: 0;
  padding: 0 0 0 20px;
  list-style: decimal;
}

.gmkb-ai-questions__item {
  padding: 8px 0;
  font-size: 15px;
  line-height: 1.5;
  color: var(--gmkb-ai-text, #1f2937);
  border-bottom: 1px solid var(--gmkb-ai-border, #e5e7eb);
}

.gmkb-ai-questions__item:last-child {
  border-bottom: none;
}

.gmkb-ai-questions__summary {
  margin-top: 16px;
  padding-top: 16px;
  border-top: 1px solid var(--gmkb-ai-border, #e5e7eb);
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
  text-align: center;
}

.gmkb-ai-accordion__header .gmkb-ai-badge {
  margin-left: 8px;
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

.gmkb-embedded-textarea {
  resize: vertical;
  min-height: 80px;
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
