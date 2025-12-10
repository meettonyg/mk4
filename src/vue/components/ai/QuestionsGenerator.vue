<template>
  <AiWidgetFrame
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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAIQuestions, QUESTION_CATEGORIES } from '../../../composables/useAIQuestions';
import { useAuthorityHook } from '../../../composables/useAuthorityHook';
import AiWidgetFrame from './AiWidgetFrame.vue';
import AiGenerateButton from './AiGenerateButton.vue';

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

const emit = defineEmits(['applied', 'generated']);

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
</script>

<style scoped>
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
</style>
