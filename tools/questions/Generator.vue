<template>
  <!-- Integrated Mode: Compact widget for Media Kit Builder -->
  <AiWidgetFrame
    v-if="mode === 'integrated'"
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
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Topics You Discuss</label>
        <textarea
          v-model="topicsText"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., Leadership development, Building high-performance teams..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">List 3-5 topics you typically discuss.</span>
      </div>

      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Your Background (Optional)</label>
        <textarea
          v-model="authorityHookText"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., Former Fortune 500 executive turned leadership coach..."
          rows="2"
        ></textarea>
      </div>

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
        <div class="gmkb-ai-accordion">
          <div
            v-for="category in categoriesArray"
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
        <div class="gmkb-ai-questions__summary">
          {{ questions.length }} questions generated across {{ categoriesArray.length }} categories
        </div>
      </div>
    </template>
  </AiWidgetFrame>

  <!-- Default/Standalone Mode: Full Self-Contained Tool -->
  <div v-else class="gfy-tool gfy-tool--questions">
    <!-- Phase 1: Input Form -->
    <div v-if="!showResults" class="gfy-tool__form-phase">
      <!-- Hero Section -->
      <div v-if="mode === 'default'" class="gfy-tool__hero">
        <h1 class="gfy-tool__title">Interview Questions Generator</h1>
        <p class="gfy-tool__subtitle">
          Generate 25 professional interview questions organized into four strategic categories designed for engaging conversations.
        </p>
      </div>

      <!-- Form Container -->
      <div class="gfy-tool__form-container" :class="{ 'gfy-tool__form-container--embedded': mode === 'embedded' }">
        <!-- Topics Section -->
        <div class="gfy-highlight-box gfy-highlight-box--blue">
          <div class="gfy-highlight-box__header">
            <span class="gfy-highlight-box__icon">
              <i class="fas fa-comments"></i>
            </span>
            <div>
              <h3 class="gfy-highlight-box__title">Interview Topics</h3>
              <p class="gfy-highlight-box__subtitle">What subjects do you typically discuss in your interviews?</p>
            </div>
          </div>

          <div class="gfy-form-group">
            <label class="gfy-form-label gfy-form-label--required">Topics You Discuss</label>
            <textarea
              v-model="topicsText"
              class="gfy-form-textarea"
              placeholder="e.g., Leadership development, Building high-performance teams, Navigating career transitions, Entrepreneurship, Work-life balance..."
              rows="4"
            ></textarea>
            <span class="gfy-form-hint">
              List 3-5 topics you typically discuss in interviews. Be specific about the areas you want to explore.
            </span>
          </div>

          <!-- Live Preview -->
          <div v-if="topicsText.trim()" class="gfy-live-preview">
            <span class="gfy-live-preview__label">Topics Preview:</span>
            {{ topicsPreview }}
          </div>
        </div>

        <!-- Context Section -->
        <div class="gfy-highlight-box gfy-highlight-box--green">
          <div class="gfy-highlight-box__header">
            <span class="gfy-highlight-box__icon">
              <i class="fas fa-user-tie"></i>
            </span>
            <div>
              <h3 class="gfy-highlight-box__title">Your Background</h3>
              <p class="gfy-highlight-box__subtitle">Add context for more tailored questions.</p>
            </div>
          </div>

          <div class="gfy-form-group">
            <label class="gfy-form-label">
              Authority Hook
              <span class="gfy-form-label__optional">Optional</span>
            </label>
            <textarea
              v-model="authorityHookText"
              class="gfy-form-textarea"
              placeholder="e.g., Former Fortune 500 executive turned leadership coach helping founders scale their impact..."
              rows="3"
            ></textarea>
            <span class="gfy-form-hint">
              Providing your background helps generate questions that leverage your unique perspective and expertise.
            </span>
          </div>
        </div>

        <!-- Generate Button -->
        <div v-if="mode === 'default'" class="gfy-tool__actions">
          <button
            type="button"
            class="gfy-btn gfy-btn--primary gfy-btn--large gfy-btn--generate"
            :disabled="!canGenerate || isGenerating"
            @click="handleStartGeneration"
          >
            <i v-if="!isGenerating" class="fas fa-magic"></i>
            <span v-if="isGenerating" class="gfy-spinner"></span>
            {{ isGenerating ? 'Generating...' : 'Generate 25 Interview Questions' }}
          </button>
          <p class="gfy-tool__actions-hint">
            We'll create questions across 4 categories: Introductory, Expertise, Story-Based, and Actionable
          </p>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="gfy-error-box">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ error }}</p>
          <button type="button" class="gfy-btn gfy-btn--outline" @click="handleStartGeneration">
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Phase 2: Results Dashboard -->
    <div v-else class="gfy-tool__results-phase">
      <!-- Results Hero -->
      <div class="gfy-tool__hero gfy-tool__hero--compact">
        <h1 class="gfy-tool__title">Your Interview Questions</h1>
        <p class="gfy-tool__subtitle">
          {{ questions.length }} questions across {{ categoriesArray.length }} categories. Select a category to explore.
        </p>
      </div>

      <div class="gfy-results-container">
        <div class="gfy-results-layout">
          <!-- SIDEBAR: Category Selection -->
          <aside class="gfy-results-layout__sidebar">
            <div class="gfy-sidebar-panel">
              <div class="gfy-sidebar-header">
                <h3 class="gfy-sidebar-title">Question Categories</h3>
              </div>

              <!-- Category Slots -->
              <button
                v-for="category in categoriesArray"
                :key="category.key"
                type="button"
                class="gfy-sidebar-slot"
                :class="{
                  'gfy-sidebar-slot--active': activeCategory === category.key
                }"
                @click="setActiveCategory(category.key)"
              >
                <div class="gfy-sidebar-slot__header">
                  <span class="gfy-sidebar-slot__label">{{ category.label }}</span>
                  <span class="gfy-sidebar-slot__badge">{{ getCategoryQuestions(category.key).length }}</span>
                </div>
                <div class="gfy-sidebar-slot__preview">
                  {{ getCategoryPreview(category.key) }}
                </div>
              </button>

              <!-- Summary -->
              <div class="gfy-sidebar-summary">
                <i class="fas fa-check-circle"></i>
                {{ questions.length }} total questions
              </div>
            </div>
          </aside>

          <!-- MAIN: Questions List -->
          <main class="gfy-results-layout__main">
            <!-- Results Header -->
            <div class="gfy-results__header">
              <h3 class="gfy-results__title">
                <span style="color: var(--gfy-primary-color)">{{ activeCategoryLabel }}</span>
              </h3>
              <span class="gfy-results__count">{{ currentCategoryQuestions.length }} questions</span>
            </div>

            <!-- Loading State -->
            <div v-if="isGenerating" class="gfy-loading-state">
              <div class="gfy-loading-spinner"></div>
              <p>Generating your interview questions...</p>
            </div>

            <!-- Questions List -->
            <template v-else-if="currentCategoryQuestions.length > 0">
              <div
                v-for="(question, index) in currentCategoryQuestions"
                :key="index"
                class="gfy-result-card"
              >
                <div class="gfy-result-card__number">{{ getCategoryStartIndex(activeCategory) + index }}</div>
                <div class="gfy-result-card__content">
                  <p class="gfy-result-card__text">{{ question }}</p>
                  <div class="gfy-result-card__actions">
                    <button
                      type="button"
                      class="gfy-btn gfy-btn--ghost gfy-btn--sm"
                      @click="handleCopyQuestion(question)"
                    >
                      <i class="fas fa-copy"></i> Copy
                    </button>
                  </div>
                </div>
              </div>
            </template>

            <!-- Empty State -->
            <div v-else class="gfy-empty-state">
              <i class="fas fa-question-circle"></i>
              <p>No questions in this category yet.</p>
            </div>

            <!-- Footer Actions -->
            <div class="gfy-tool__footer">
              <button
                type="button"
                class="gfy-btn gfy-btn--primary gfy-btn--large"
                @click="handleCopy"
              >
                <i class="fas fa-copy"></i>
                Copy All Questions
              </button>
              <button type="button" class="gfy-btn gfy-btn--outline" @click="handleGenerate">
                <i class="fas fa-sync-alt"></i>
                Regenerate
              </button>
              <button type="button" class="gfy-btn gfy-btn--ghost" @click="handleStartOver">
                Start Over
              </button>
            </div>

            <!-- Copy Success -->
            <div v-if="copySuccess" class="gfy-copy-success">
              <i class="fas fa-check-circle"></i>
              Copied to clipboard!
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Questions Generator - Self-Contained Tool
 *
 * ARCHITECTURE:
 * - This component is FULLY SELF-CONTAINED
 * - It imports shared CSS for styling consistency
 * - NO component dependencies on other tools
 * - If this tool breaks, other tools are unaffected
 *
 * @package GMKB
 * @subpackage Tools/Questions
 */

import { ref, computed, onMounted, watch, inject } from 'vue';
import { useAIQuestions, QUESTION_CATEGORIES } from '../../src/composables/useAIQuestions';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared/constants';

// Integrated mode components only
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'integrated', 'embedded'].includes(v)
  },
  componentId: {
    type: String,
    default: null
  },
  intent: {
    type: Object,
    default: null
  },
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
  copyToClipboard,
  reset
} = useAIQuestions();

const { authorityHookSummary, syncFromStore, loadFromProfileData } = useAuthorityHook();

// Inject profile data from EmbeddedToolWrapper
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Local state
const topicsText = ref('');
const authorityHookText = ref('');
const showResults = ref(false);
const activeCategory = ref('introductory');
const openCategory = ref('introductory');
const copySuccess = ref(false);

// Categories as array for iteration
const categoriesArray = computed(() => [
  { key: 'introductory', label: 'Introductory Questions', ...QUESTION_CATEGORIES.introductory },
  { key: 'expertise', label: 'Expertise Deep-Dives', ...QUESTION_CATEGORIES.expertise },
  { key: 'stories', label: 'Story-Based Questions', ...QUESTION_CATEGORIES.stories },
  { key: 'actionable', label: 'Actionable Takeaways', ...QUESTION_CATEGORIES.actionable }
]);

// Can generate check
const canGenerate = computed(() => topicsText.value.trim().length > 0);

// Topics preview for live preview
const topicsPreview = computed(() => {
  const topics = topicsText.value.split(/[,\n]/).map(t => t.trim()).filter(t => t);
  if (topics.length === 0) return '';
  if (topics.length <= 3) return topics.join(', ');
  return topics.slice(0, 3).join(', ') + ` +${topics.length - 3} more`;
});

// Active category label
const activeCategoryLabel = computed(() => {
  const cat = categoriesArray.value.find(c => c.key === activeCategory.value);
  return cat?.label || 'Questions';
});

// Current category questions
const currentCategoryQuestions = computed(() => getCategoryQuestions(activeCategory.value));

// Get questions for a specific category
const getCategoryQuestions = (key) => {
  switch (key) {
    case 'introductory': return introductoryQuestions.value;
    case 'expertise': return expertiseQuestions.value;
    case 'stories': return storyQuestions.value;
    case 'actionable': return actionableQuestions.value;
    default: return [];
  }
};

// Get category start index (1-based)
const getCategoryStartIndex = (key) => QUESTION_CATEGORIES[key]?.start || 1;

// Get preview text for a category
const getCategoryPreview = (key) => {
  const qs = getCategoryQuestions(key);
  if (qs.length === 0) return 'No questions yet';
  const first = qs[0];
  return first.length > 60 ? first.substring(0, 60) + '...' : first;
};

// Toggle accordion category
const toggleCategory = (key) => {
  openCategory.value = openCategory.value === key ? null : key;
};

// Set active category
const setActiveCategory = (key) => {
  activeCategory.value = key;
};

// Handle starting generation - transitions to results view
const handleStartGeneration = async () => {
  showResults.value = true;
  await handleGenerate();
};

// Handle generate button click
const handleGenerate = async () => {
  activeCategory.value = 'introductory';
  openCategory.value = 'introductory';

  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      topics: topicsText.value,
      authorityHook: authorityHookText.value
    }, context);

    emit('generated', { questions: questions.value });
  } catch (err) {
    console.error('[QuestionsGenerator] Generation failed:', err);
  }
};

// Handle copy all to clipboard
const handleCopy = async () => {
  await copyToClipboard();
  copySuccess.value = true;
  setTimeout(() => { copySuccess.value = false; }, 2000);
};

// Handle copy single question
const handleCopyQuestion = async (question) => {
  try {
    await navigator.clipboard.writeText(question);
    copySuccess.value = true;
    setTimeout(() => { copySuccess.value = false; }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
};

// Handle apply (integrated mode)
const handleApply = () => {
  emit('applied', {
    componentId: props.componentId,
    questions: questions.value
  });
};

// Handle start over
const handleStartOver = () => {
  reset();
  showResults.value = false;
};

// Populate form fields from profile data
function populateFromProfile(profileData) {
  if (!profileData) return;
  if (profileData.hook_what && !topicsText.value) topicsText.value = profileData.hook_what;
  if (profileData.authority_hook && !authorityHookText.value) authorityHookText.value = profileData.authority_hook;
  loadFromProfileData(profileData);
}

// Sync authority hook from store on mount
onMounted(() => {
  syncFromStore();
  if (authorityHookSummary.value) authorityHookText.value = authorityHookSummary.value;
});

// Watch for store changes
watch(authorityHookSummary, (newVal) => {
  if (newVal && !authorityHookText.value) authorityHookText.value = newVal;
});

// Watch for injected profile data changes (embedded mode)
watch(injectedProfileData, (newData) => {
  if (newData && props.mode === 'embedded') populateFromProfile(newData);
}, { immediate: true });

// Watch for profileData prop changes
watch(() => props.profileData, (newData) => {
  if (newData && props.mode === 'embedded') populateFromProfile(newData);
}, { immediate: true });

// Current intent for embedded mode
const currentIntent = computed(() => props.intent || null);

// Generate preview text for embedded mode
const embeddedPreviewText = computed(() => {
  if (!topicsText.value) return null;
  return `<strong>25 interview questions</strong> covering: <strong>${topicsPreview.value}</strong>`;
});

// Watch for field changes in embedded mode
watch(() => topicsText.value, () => {
  if (props.mode === 'embedded') {
    emit('preview-update', {
      previewHtml: embeddedPreviewText.value,
      fields: { topics: topicsText.value }
    });
  }
}, { deep: true });

// Emit can-generate status changes
watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
}, { immediate: true });

// Expose for parent components
defineExpose({
  handleStartGeneration,
  handleGenerate,
  showResults,
  isGenerating,
  error,
  canGenerate
});
</script>

<style>
/**
 * SHARED CSS IMPORT
 * Import design tokens and base styles for consistency.
 * This tool remains self-contained - these are just CSS classes.
 */
@import '@/styles/gfy-design-tokens.css';
@import '@/styles/gfy-tool-base.css';
</style>

<style scoped>
/**
 * TOOL-SPECIFIC STYLES
 * Only styles unique to this tool go here.
 * All common styles come from gfy-tool-base.css
 */

/* Integrated Mode Styles */
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
