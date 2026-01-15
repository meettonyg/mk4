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

        <!-- Total Count -->
        <div class="gmkb-ai-questions__summary">
          {{ questions.length }} questions generated across {{ categoriesArray.length }} categories
        </div>
      </div>
    </template>
  </AiWidgetFrame>

  <!-- Default/Standalone Mode: Full Questions Toolkit -->
  <div v-else class="gfy-questions-generator">
    <!-- Phase 1: Input Form -->
    <div v-if="!showResults" class="gfy-questions-form">
      <!-- Hero Section (only show in default mode, not embedded) -->
      <div v-if="mode === 'default'" class="gfy-questions-hero">
        <h1 class="gfy-questions-hero__title">Interview Questions Generator</h1>
        <p class="gfy-questions-hero__subtitle">
          Generate 25 professional interview questions organized into four strategic categories designed for engaging conversations.
        </p>
      </div>

      <!-- Form Container -->
      <div class="gfy-questions-form__container" :class="{ 'gfy-questions-form__container--embedded': mode === 'embedded' }">
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
              List 3-5 topics you typically discuss in interviews. Be specific about the areas you want to explore with your guests.
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

        <!-- Generate Button (only show in default mode) -->
        <div v-if="mode === 'default'" class="gfy-form-actions">
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
          <p class="gfy-form-actions__hint">
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
    <div v-else class="gfy-questions-results">
      <!-- Results Hero -->
      <div class="gfy-questions-hero gfy-questions-hero--compact">
        <h1 class="gfy-questions-hero__title">Your Interview Questions</h1>
        <p class="gfy-questions-hero__subtitle">
          {{ questions.length }} questions across {{ categoriesArray.length }} categories. Select a category to explore and customize.
        </p>
      </div>

      <div class="gmkb-tool-embed">
        <div class="gfy-results-layout">
          <!-- SIDEBAR: Category Selection -->
          <aside class="gfy-layout-sidebar">
            <div class="gfy-current-topics">
              <div class="gfy-sidebar-header">
                <h3 class="gfy-sidebar-title">Question Categories</h3>
              </div>

              <!-- Category Slots -->
              <button
                v-for="category in categoriesArray"
                :key="category.key"
                type="button"
                class="gfy-category-slot"
                :class="{
                  'gfy-category-slot--active': activeCategory === category.key,
                  'gfy-category-slot--has-content': getCategoryQuestions(category.key).length > 0
                }"
                @click="setActiveCategory(category.key)"
              >
                <div class="gfy-category-slot__header">
                  <span class="gfy-category-slot__label">{{ category.label }}</span>
                  <span class="gfy-category-slot__badge">{{ getCategoryQuestions(category.key).length }}</span>
                </div>
                <div class="gfy-category-slot__preview">
                  {{ getCategoryPreview(category.key) }}
                </div>
              </button>

              <!-- Summary -->
              <div class="gfy-questions-summary">
                <i class="fas fa-check-circle"></i>
                {{ questions.length }} total questions
              </div>
            </div>
          </aside>

          <!-- MAIN: Questions List -->
          <main class="gfy-layout-main">
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
              <div class="gfy-questions-list">
                <div
                  v-for="(question, index) in currentCategoryQuestions"
                  :key="index"
                  class="gfy-question-card"
                >
                  <div class="gfy-question-card__number">{{ getCategoryStartIndex(activeCategory) + index }}</div>
                  <div class="gfy-question-card__content">
                    <p class="gfy-question-card__text">{{ question }}</p>
                    <div class="gfy-question-card__actions">
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
              </div>
            </template>

            <!-- Empty State -->
            <div v-else class="gfy-empty-state">
              <i class="fas fa-question-circle"></i>
              <p>No questions in this category yet.</p>
            </div>

            <!-- Footer Actions -->
            <div class="gfy-results__footer">
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
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useAIQuestions, QUESTION_CATEGORIES } from '../../src/composables/useAIQuestions';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared/constants';

// Integrated mode components
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

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return topicsText.value.trim().length > 0;
});

/**
 * Topics preview for live preview
 */
const topicsPreview = computed(() => {
  const topics = topicsText.value.split(/[,\n]/).map(t => t.trim()).filter(t => t);
  if (topics.length === 0) return '';
  if (topics.length <= 3) return topics.join(', ');
  return topics.slice(0, 3).join(', ') + ` +${topics.length - 3} more`;
});

/**
 * Active category label
 */
const activeCategoryLabel = computed(() => {
  const cat = categoriesArray.value.find(c => c.key === activeCategory.value);
  return cat?.label || 'Questions';
});

/**
 * Current category questions
 */
const currentCategoryQuestions = computed(() => {
  return getCategoryQuestions(activeCategory.value);
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
 * Get category start index (1-based)
 */
const getCategoryStartIndex = (key) => {
  const cat = QUESTION_CATEGORIES[key];
  return cat?.start || 1;
};

/**
 * Get preview text for a category
 */
const getCategoryPreview = (key) => {
  const qs = getCategoryQuestions(key);
  if (qs.length === 0) return 'No questions yet';
  const first = qs[0];
  return first.length > 60 ? first.substring(0, 60) + '...' : first;
};

/**
 * Toggle accordion category
 */
const toggleCategory = (key) => {
  openCategory.value = openCategory.value === key ? null : key;
};

/**
 * Set active category
 */
const setActiveCategory = (key) => {
  activeCategory.value = key;
};

/**
 * Handle starting generation - transitions to results view
 */
const handleStartGeneration = async () => {
  showResults.value = true;
  await handleGenerate();
};

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  activeCategory.value = 'introductory';
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
 * Handle copy all to clipboard
 */
const handleCopy = async () => {
  await copyToClipboard();
  copySuccess.value = true;
  setTimeout(() => { copySuccess.value = false; }, 2000);
};

/**
 * Handle copy single question
 */
const handleCopyQuestion = async (question) => {
  try {
    await navigator.clipboard.writeText(question);
    copySuccess.value = true;
    setTimeout(() => { copySuccess.value = false; }, 2000);
  } catch (err) {
    console.error('Failed to copy:', err);
  }
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
 * Handle start over
 */
const handleStartOver = () => {
  reset();
  showResults.value = false;
};

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  if (profileData.hook_what && !topicsText.value) {
    topicsText.value = profileData.hook_what;
  }

  if (profileData.authority_hook && !authorityHookText.value) {
    authorityHookText.value = profileData.authority_hook;
  }

  loadFromProfileData(profileData);
}

// Sync authority hook from store on mount
onMounted(() => {
  syncFromStore();
  if (authorityHookSummary.value) {
    authorityHookText.value = authorityHookSummary.value;
  }
});

// Watch for store changes
watch(authorityHookSummary, (newVal) => {
  if (newVal && !authorityHookText.value) {
    authorityHookText.value = newVal;
  }
});

// Watch for injected profile data changes (embedded mode)
watch(
  injectedProfileData,
  (newData) => {
    if (newData && props.mode === 'embedded') {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

// Watch for profileData prop changes
watch(
  () => props.profileData,
  (newData) => {
    if (newData && props.mode === 'embedded') {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

// Current intent for embedded mode
const currentIntent = computed(() => props.intent || null);

// Generate preview text for embedded mode
const embeddedPreviewText = computed(() => {
  if (!topicsText.value) return null;
  return `<strong>25 interview questions</strong> covering: <strong>${topicsPreview.value}</strong>`;
});

// Watch for field changes in embedded mode
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

<style scoped>
/* ============================================
   DESIGN TOKENS (gfy- prefix for consistency)
   ============================================ */
.gfy-questions-generator {
  --gfy-primary-color: #2563eb;
  --gfy-primary-light: #eff6ff;
  --gfy-primary-dark: #1d4ed8;
  --gfy-success-color: #10b981;
  --gfy-success-light: #d1fae5;
  --gfy-text-primary: #0f172a;
  --gfy-text-secondary: #64748b;
  --gfy-text-muted: #94a3b8;
  --gfy-bg-color: #f8fafc;
  --gfy-white: #ffffff;
  --gfy-border-color: #e2e8f0;
  --gfy-radius-md: 8px;
  --gfy-radius-lg: 12px;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* ============================================
   HERO SECTION
   ============================================ */
.gfy-questions-hero {
  text-align: center;
  margin-bottom: 40px;
}

.gfy-questions-hero--compact {
  margin-bottom: 30px;
}

.gfy-questions-hero__title {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 10px;
  background: linear-gradient(to right, #0f172a, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gfy-questions-hero__subtitle {
  color: var(--gfy-text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

/* ============================================
   FORM CONTAINER
   ============================================ */
.gfy-questions-form__container {
  background: var(--gfy-white);
  border-radius: 16px;
  border: 1px solid var(--gfy-border-color);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.gfy-questions-form__container--embedded {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}

/* ============================================
   HIGHLIGHT BOXES
   ============================================ */
.gfy-highlight-box {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 24px;
  margin-bottom: 24px;
}

.gfy-highlight-box--blue {
  border-left: 4px solid var(--gfy-primary-color);
  background: linear-gradient(to right, var(--gfy-primary-light), var(--gfy-white));
}

.gfy-highlight-box--green {
  border-left: 4px solid var(--gfy-success-color);
  background: linear-gradient(to right, var(--gfy-success-light), var(--gfy-white));
}

.gfy-highlight-box__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.gfy-highlight-box__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
  border-radius: 8px;
  flex-shrink: 0;
}

.gfy-highlight-box--green .gfy-highlight-box__icon {
  background: var(--gfy-success-color);
}

.gfy-highlight-box__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0 0 4px 0;
}

.gfy-highlight-box__subtitle {
  font-size: 0.9rem;
  color: var(--gfy-text-secondary);
  margin: 0;
}

/* ============================================
   FORM ELEMENTS
   ============================================ */
.gfy-form-group {
  margin-bottom: 16px;
}

.gfy-form-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gfy-text-primary);
  margin-bottom: 8px;
}

.gfy-form-label--required::after {
  content: ' *';
  color: #dc2626;
}

.gfy-form-label__optional {
  font-size: 11px;
  font-weight: 500;
  color: var(--gfy-text-muted);
  background: var(--gfy-border-color);
  padding: 2px 8px;
  border-radius: 4px;
}

.gfy-form-textarea {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-family: inherit;
  font-size: 0.95rem;
  background: var(--gfy-white);
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
  resize: vertical;
  min-height: 80px;
}

.gfy-form-textarea:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-form-textarea::placeholder {
  color: var(--gfy-text-muted);
}

.gfy-form-hint {
  display: block;
  font-size: 0.8rem;
  color: var(--gfy-text-muted);
  margin-top: 6px;
  font-style: italic;
}

/* ============================================
   LIVE PREVIEW
   ============================================ */
.gfy-live-preview {
  margin-top: 16px;
  padding: 14px 18px;
  background: var(--gfy-primary-light);
  border: 1px solid #bfdbfe;
  border-radius: var(--gfy-radius-md);
  font-size: 0.95rem;
  font-style: italic;
  color: var(--gfy-primary-dark);
}

.gfy-live-preview__label {
  font-weight: 600;
  font-style: normal;
  margin-right: 4px;
}

/* ============================================
   FORM ACTIONS
   ============================================ */
.gfy-form-actions {
  text-align: center;
  padding-top: 16px;
}

.gfy-form-actions__hint {
  font-size: 0.85rem;
  color: var(--gfy-text-muted);
  margin-top: 12px;
}

/* ============================================
   BUTTONS
   ============================================ */
.gfy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  font-family: inherit;
  border-radius: var(--gfy-radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  border: 1px solid transparent;
  white-space: nowrap;
}

.gfy-btn--primary {
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-btn--primary:hover:not(:disabled) {
  background: var(--gfy-primary-dark);
}

.gfy-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gfy-btn--outline {
  background: var(--gfy-white);
  border-color: var(--gfy-border-color);
  color: var(--gfy-text-secondary);
}

.gfy-btn--outline:hover {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-btn--ghost {
  background: transparent;
  color: var(--gfy-text-secondary);
  border: none;
}

.gfy-btn--ghost:hover {
  color: var(--gfy-text-primary);
}

.gfy-btn--large {
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
}

.gfy-btn--sm {
  padding: 0.375rem 0.75rem;
  font-size: 0.75rem;
}

.gfy-btn--generate {
  padding: 16px 32px;
  font-size: 1.1rem;
  border-radius: 10px;
}

/* ============================================
   SPINNER
   ============================================ */
.gfy-spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 50%;
  border-top-color: #fff;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* ============================================
   ERROR BOX
   ============================================ */
.gfy-error-box {
  margin-top: 24px;
  padding: 20px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--gfy-radius-md);
  text-align: center;
  color: #991b1b;
}

.gfy-error-box i {
  font-size: 24px;
  margin-bottom: 8px;
}

.gfy-error-box p {
  margin: 0 0 12px 0;
}

/* ============================================
   RESULTS PHASE
   ============================================ */
.gmkb-tool-embed {
  background: var(--gfy-white);
  border-radius: 16px;
  border: 1px solid var(--gfy-border-color);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.gfy-results-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 40px;
}

@media (min-width: 900px) {
  .gfy-results-layout {
    flex-direction: row;
    align-items: flex-start;
  }

  .gfy-layout-sidebar {
    position: sticky;
    top: 1rem;
    flex: 0 0 320px;
  }

  .gfy-layout-main {
    flex: 1;
    min-width: 0;
  }
}

/* ============================================
   SIDEBAR
   ============================================ */
.gfy-current-topics {
  background: var(--gfy-bg-color);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 1.25rem;
}

.gfy-sidebar-header {
  margin-bottom: 1rem;
}

.gfy-sidebar-title {
  font-size: 0.875rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--gfy-text-secondary);
  margin: 0;
}

/* Category Slots */
.gfy-category-slot {
  display: block;
  width: 100%;
  padding: 1rem;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  margin-bottom: 0.75rem;
  transition: all 0.2s;
  cursor: pointer;
  text-align: left;
}

.gfy-category-slot:hover {
  border-color: var(--gfy-primary-color);
}

.gfy-category-slot--active {
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 2px var(--gfy-primary-color);
}

.gfy-category-slot__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.gfy-category-slot__label {
  font-size: 12px;
  font-weight: 700;
  color: var(--gfy-text-primary);
}

.gfy-category-slot__badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 8px;
  font-size: 11px;
  font-weight: 700;
  color: var(--gfy-white);
  background: var(--gfy-primary-color);
  border-radius: 12px;
}

.gfy-category-slot__preview {
  font-size: 11px;
  line-height: 1.4;
  color: var(--gfy-text-muted);
}

.gfy-questions-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--gfy-primary-light);
  border-radius: var(--gfy-radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gfy-primary-color);
  margin-top: 12px;
}

/* ============================================
   MAIN AREA
   ============================================ */
.gfy-results__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gfy-border-color);
}

.gfy-results__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.gfy-results__count {
  font-size: 0.875rem;
  color: var(--gfy-text-muted);
}

/* Loading State */
.gfy-loading-state {
  text-align: center;
  padding: 60px 40px;
  color: var(--gfy-text-secondary);
}

.gfy-loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--gfy-border-color);
  border-radius: 50%;
  border-top-color: var(--gfy-primary-color);
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

/* Empty State */
.gfy-empty-state {
  text-align: center;
  padding: 60px 40px;
  color: var(--gfy-text-secondary);
}

.gfy-empty-state i {
  font-size: 48px;
  color: var(--gfy-text-muted);
  margin-bottom: 16px;
}

/* ============================================
   QUESTIONS LIST
   ============================================ */
.gfy-questions-list {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.gfy-question-card {
  display: flex;
  gap: 16px;
  padding: 20px;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  transition: border-color 0.2s;
}

.gfy-question-card:hover {
  border-color: var(--gfy-primary-color);
}

.gfy-question-card__number {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  flex-shrink: 0;
  background: var(--gfy-primary-light);
  color: var(--gfy-primary-color);
  border-radius: 50%;
  font-size: 13px;
  font-weight: 700;
}

.gfy-question-card__content {
  flex: 1;
}

.gfy-question-card__text {
  font-size: 15px;
  line-height: 1.6;
  color: var(--gfy-text-primary);
  margin: 0 0 12px 0;
}

.gfy-question-card__actions {
  display: flex;
  gap: 8px;
}

/* ============================================
   FOOTER
   ============================================ */
.gfy-results__footer {
  margin-top: 2rem;
  border-top: 1px solid var(--gfy-border-color);
  padding-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.gfy-copy-success {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--gfy-success-light);
  color: #047857;
  border-radius: var(--gfy-radius-md);
  font-weight: 600;
  margin-top: 16px;
  width: 100%;
}

/* ============================================
   INTEGRATED MODE STYLES
   ============================================ */
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
