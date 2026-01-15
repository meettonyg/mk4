<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'default'"
    title="Interview Questions Generator"
    subtitle="Select a topic to generate questions, or tweak the wording to match your specific guesting strategy."
    intro-text="Generate 10 professional interview questions tailored to your selected topic and authority hook."
    generator-type="questions"
    :has-results="hasQuestions"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>

      <!-- STEP 1: Topic Selection -->
      <div class="generator__section">
        <h3 class="generator__section-title">Step 1: Choose or Tweak Your Topic</h3>

        <!-- Topic Selection Grid -->
        <div v-if="availableTopics.length > 0" class="questions-topic-grid">
          <button
            v-for="(topic, index) in availableTopics"
            :key="index"
            type="button"
            class="questions-topic-card"
            :class="{ 'questions-topic-card--active': selectedTopicIndex === index }"
            @click="selectTopic(index)"
          >
            <span class="questions-topic-card__number">{{ index + 1 }}</span>
            <span class="questions-topic-card__text">{{ topic }}</span>
          </button>
        </div>

        <!-- No Topics Message -->
        <div v-else class="questions-topic-empty">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 16v-4M12 8h.01"/>
          </svg>
          <p>No topics available. Generate topics first using the Topics Generator, or enter a custom topic below.</p>
        </div>

        <!-- Refine Selected Topic Textarea -->
        <div class="questions-refine-container">
          <span class="questions-refine-hint">Refine Selected Topic</span>
          <textarea
            v-model="refinedTopic"
            class="questions-refine-textarea"
            rows="2"
            placeholder="Enter or customize your interview topic..."
          ></textarea>
        </div>
      </div>

      <!-- STEP 2: Authority Hook -->
      <div class="generator__section">
        <h3 class="generator__section-title">Step 2: Confirm Your Authority Hook</h3>

        <div class="questions-authority-hook">
          <div class="questions-authority-hook__header">
            <span class="questions-authority-hook__icon">★</span>
            <h4 class="questions-authority-hook__title">Personalize Your Questions</h4>
          </div>

          <div class="questions-authority-hook__grid">
            <div class="questions-authority-hook__field">
              <label class="questions-authority-hook__label">WHO do you help?</label>
              <input
                v-model="authorityHook.who"
                type="text"
                class="questions-authority-hook__input"
                placeholder="e.g. SaaS Founders"
              />
            </div>
            <div class="questions-authority-hook__field">
              <label class="questions-authority-hook__label">WHAT is the result?</label>
              <input
                v-model="authorityHook.what"
                type="text"
                class="questions-authority-hook__input"
                placeholder="e.g. Increase revenue by 40%"
              />
            </div>
            <div class="questions-authority-hook__field">
              <label class="questions-authority-hook__label">WHEN do they need it?</label>
              <input
                v-model="authorityHook.when"
                type="text"
                class="questions-authority-hook__input"
                placeholder="e.g. When scaling rapidly"
              />
            </div>
            <div class="questions-authority-hook__field">
              <label class="questions-authority-hook__label">HOW do you do it?</label>
              <input
                v-model="authorityHook.how"
                type="text"
                class="questions-authority-hook__input"
                placeholder="e.g. My proven 90-day system"
              />
            </div>
          </div>

          <!-- Live Preview -->
          <div v-if="authorityHookPreview" class="questions-authority-hook__preview">
            "{{ authorityHookPreview }}"
          </div>
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
          {{ isGenerating ? 'Generating Questions...' : 'Generate 10 Questions' }}
        </button>
      </div>

      <p class="generator__hint-text">
        Generate questions for your specific audience in seconds.
      </p>

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
      <div class="questions-results">
        <div class="questions-results__layout">

          <!-- SIDEBAR: Selected Topic -->
          <aside class="questions-results__sidebar">
            <div class="questions-results__topic-card">
              <div class="questions-results__topic-header">
                <h3 class="questions-results__topic-title">Interview Topic</h3>
              </div>
              <div class="questions-results__topic-preview">
                {{ refinedTopic || 'No topic selected' }}
              </div>
              <p class="questions-results__topic-hint">
                Questions are tailored to this specific topic.
              </p>
            </div>
          </aside>

          <!-- MAIN: Questions List -->
          <main class="questions-results__main">
            <div class="questions-results__header">
              <h3 class="questions-results__title">{{ questions.length }} Generated Questions</h3>
              <div class="questions-results__actions">
                <button
                  type="button"
                  class="generator__button generator__button--outline"
                  @click="handleGenerate"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                  </svg>
                  Regenerate
                </button>
              </div>
            </div>

            <!-- Questions List -->
            <div class="questions-list">
              <div
                v-for="(question, index) in questions"
                :key="index"
                class="questions-list__item"
              >
                <span class="questions-list__number">{{ index + 1 }}</span>
                <p class="questions-list__text">{{ question }}</p>
                <button
                  type="button"
                  class="questions-list__copy-btn"
                  title="Copy question"
                  @click="copyQuestion(index)"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                </button>
              </div>
            </div>

            <!-- Footer Actions -->
            <div class="questions-results__footer">
              <button
                type="button"
                class="generator__button generator__button--call-to-action"
                @click="handleCopy"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy All Questions
              </button>
              <button
                type="button"
                class="generator__button generator__button--ghost"
                @click="handleStartOver"
              >
                Start Over
              </button>
            </div>
          </main>
        </div>
      </div>
    </template>
  </GeneratorLayout>

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else-if="mode === 'integrated'"
    title="Interview Questions Generator"
    description="Generate thoughtful interview questions for your selected topic."
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
      <!-- Topic Selection (Compact) -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Interview Topic</label>
        <textarea
          v-model="refinedTopic"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., The 3 Hidden Revenue Leaks Killing Your Growth"
          rows="2"
        ></textarea>
        <span class="gmkb-ai-hint">
          Enter the topic you want to generate questions for.
        </span>
      </div>

      <!-- Authority Hook (Compact) -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Who do you help? (Optional)</label>
        <input
          v-model="authorityHook.who"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., SaaS Founders"
        />
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate 10 Questions"
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
        <ol class="gmkb-ai-questions__list">
          <li
            v-for="(question, index) in questions"
            :key="index"
            class="gmkb-ai-questions__item"
          >
            {{ question }}
          </li>
        </ol>

        <!-- Total Count -->
        <div class="gmkb-ai-questions__summary">
          {{ questions.length }} questions generated
        </div>
      </div>
    </template>
  </AiWidgetFrame>

  <!-- Embedded Mode: Landing page form (simplified, used with EmbeddedToolWrapper) -->
  <div v-else class="gmkb-embedded-form">
    <!-- Simplified form for landing page -->
    <div class="gmkb-embedded-fields">
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">{{ currentIntent?.formLabels?.topics || 'Interview Topic' }} *</label>
        <textarea
          v-model="refinedTopic"
          class="gmkb-embedded-input gmkb-embedded-textarea"
          :placeholder="currentIntent?.formPlaceholders?.topics || 'e.g., The 3 Hidden Revenue Leaks Killing Your Growth'"
          rows="2"
        ></textarea>
      </div>

      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">{{ currentIntent?.formLabels?.who || 'Who do you help? (Optional)' }}</label>
        <input
          v-model="authorityHook.who"
          type="text"
          class="gmkb-embedded-input"
          :placeholder="currentIntent?.formPlaceholders?.who || 'e.g., SaaS Founders'"
        />
      </div>
    </div>

    <!-- Error display -->
    <div v-if="error" class="gmkb-embedded-error">
      {{ error }}
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted, watch, inject } from 'vue';
import { useAIQuestions, QUESTION_CATEGORIES } from '../../src/composables/useAIQuestions';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';

const props = defineProps({
  /**
   * Mode: 'default', 'integrated', or 'embedded'
   */
  mode: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'integrated', 'embedded'].includes(v)
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
   */
  intent: {
    type: Object,
    default: null
  },

  /**
   * Profile data for pre-population (embedded mode)
   */
  profileData: {
    type: Object,
    default: null
  },

  /**
   * Available topics from Topics Generator (passed as prop)
   */
  topics: {
    type: Array,
    default: () => []
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
  generate,
  copyToClipboard,
  reset
} = useAIQuestions();

const { syncFromStore, loadFromProfileData } = useAuthorityHook();

// Inject profile data from EmbeddedToolWrapper (for embedded mode)
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Local state
const selectedTopicIndex = ref(-1);
const refinedTopic = ref('');

// Authority Hook state (reactive object for 4 W's)
const authorityHook = reactive({
  who: '',
  what: '',
  when: '',
  how: ''
});

// Available topics (from props or default examples)
const availableTopics = computed(() => {
  if (props.topics && props.topics.length > 0) {
    return props.topics;
  }
  // Default example topics if none provided
  return [
    'The 3 Hidden Revenue Leaks Killing Your Growth',
    'Why Most Scaling Strategies Fail',
    'From Overwhelmed Owner to Strategic CEO',
    'Building Systems That Scale',
    'The 7-Figure Timeline'
  ];
});

// Authority Hook live preview
const authorityHookPreview = computed(() => {
  const { who, what, when, how } = authorityHook;
  if (!who && !what) return '';

  let preview = 'I help';
  if (who) preview += ` ${who}`;
  if (what) preview += ` ${what}`;
  if (when) preview += ` ${when}`;
  if (how) preview += ` through ${how}`;

  return preview + '.';
});

/**
 * Select a topic from the grid
 */
const selectTopic = (index) => {
  selectedTopicIndex.value = index;
  refinedTopic.value = availableTopics.value[index] || '';
};

/**
 * Copy single question to clipboard
 */
const copyQuestion = async (index) => {
  const question = questions.value[index];
  if (question) {
    try {
      await navigator.clipboard.writeText(question);
    } catch (err) {
      console.error('[QuestionsGenerator] Failed to copy question:', err);
    }
  }
};

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Populate authority hook fields
  if (profileData.authority_hook_who) authorityHook.who = profileData.authority_hook_who;
  if (profileData.authority_hook_what) authorityHook.what = profileData.authority_hook_what;
  if (profileData.authority_hook_when) authorityHook.when = profileData.authority_hook_when;
  if (profileData.authority_hook_how) authorityHook.how = profileData.authority_hook_how;

  // Legacy support
  if (profileData.hook_who && !authorityHook.who) authorityHook.who = profileData.hook_who;
  if (profileData.hook_what && !authorityHook.what) authorityHook.what = profileData.hook_what;

  // Populate authority hook fields from profile data (for cross-tool sync)
  loadFromProfileData(profileData);
}

/**
 * Questions formula for guidance panel
 */
const questionsFormula = '<span class="generator__highlight">[TOPIC]</span> + <span class="generator__highlight">[AUTHORITY]</span> + <span class="generator__highlight">[CONTEXT]</span> = Interview Questions';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Great Questions Matter',
    description: 'The quality of your interview is directly tied to the quality of your questions. Great questions go beyond surface-level conversation to uncover deep insights, compelling stories, and actionable advice.'
  },
  {
    title: 'What Makes Questions Memorable',
    description: 'The best interview questions are specific, open-ended, and designed to elicit stories and examples. They focus on experiences, transformations, and practical wisdom.'
  },
  {
    title: 'How to Use Your Questions',
    description: 'Use your generated questions as a strategic framework, not a rigid script. Select questions that best align with your guest\'s expertise, and be ready to ask follow-up questions.'
  }
];

/**
 * Example interview questions for guidance panel
 */
const examples = [
  {
    title: 'Deep-Dive Question:',
    description: 'Can you walk me through a specific moment when you realized your approach needed to fundamentally change?'
  },
  {
    title: 'Actionable Question:',
    description: 'If someone listening is struggling with this, what\'s one practical step they could implement this week?'
  }
];

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return refinedTopic.value.trim().length > 0;
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';

    // Build authority hook string from components
    let authorityHookStr = '';
    if (authorityHook.who || authorityHook.what) {
      authorityHookStr = authorityHookPreview.value;
    }

    await generate({
      topics: refinedTopic.value,
      authorityHook: authorityHookStr
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
 * Handle start over - reset all state
 */
const handleStartOver = () => {
  reset();
  selectedTopicIndex.value = -1;
  refinedTopic.value = '';
};

/**
 * Sync authority hook from store on mount
 */
onMounted(() => {
  syncFromStore();

  // Load from injected or prop profile data
  if (props.profileData) {
    populateFromProfile(props.profileData);
  }
  if (injectedProfileData.value) {
    populateFromProfile(injectedProfileData.value);
  }

  // Auto-select first topic if available
  if (availableTopics.value.length > 0 && selectedTopicIndex.value === -1) {
    selectTopic(0);
  }
});

/**
 * Watch for injected profile data changes (embedded mode)
 */
watch(
  injectedProfileData,
  (newData) => {
    if (newData) {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

/**
 * Watch for profileData prop changes (embedded mode with EmbeddedToolWrapper)
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
 * Watch for topics prop changes
 */
watch(
  () => props.topics,
  (newTopics) => {
    if (newTopics && newTopics.length > 0 && selectedTopicIndex.value === -1) {
      selectTopic(0);
    }
  },
  { immediate: true }
);

/**
 * Current intent for embedded mode
 */
const currentIntent = computed(() => props.intent || null);

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  if (!refinedTopic.value) return null;
  return `<strong>10 interview questions</strong> for: <strong>${refinedTopic.value}</strong>`;
});

/**
 * Watch for field changes in embedded mode and emit preview updates
 */
watch(
  () => refinedTopic.value,
  () => {
    if (props.mode === 'embedded') {
      emit('preview-update', {
        previewHtml: embeddedPreviewText.value,
        fields: { topic: refinedTopic.value }
      });
    }
  }
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
  font-size: 14px;
  font-weight: 700;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0 0 16px 0;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.generator__actions {
  margin-top: var(--mkcg-space-lg, 30px);
}

.generator__hint-text {
  text-align: center;
  font-size: 13px;
  color: var(--mkcg-text-secondary, #64748b);
  margin-top: 20px;
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

/* ===========================================
   TOPIC SELECTION GRID
   =========================================== */
.questions-topic-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
  margin-bottom: 1.5rem;
}

@media (max-width: 768px) {
  .questions-topic-grid {
    grid-template-columns: 1fr;
  }
}

.questions-topic-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.questions-topic-card:hover {
  border-color: var(--mkcg-primary, #3b82f6);
  background: var(--mkcg-bg-secondary, #f9fafb);
}

.questions-topic-card--active {
  border-color: var(--mkcg-primary, #3b82f6);
  background: var(--mkcg-primary-light, rgba(59, 130, 246, 0.1));
  box-shadow: 0 0 0 2px var(--mkcg-primary, #3b82f6);
}

.questions-topic-card__number {
  width: 24px;
  height: 24px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--mkcg-text-secondary, #64748b);
  flex-shrink: 0;
}

.questions-topic-card--active .questions-topic-card__number {
  background: var(--mkcg-primary, #3b82f6);
  color: #fff;
}

.questions-topic-card__text {
  font-size: 13px;
  font-weight: 600;
  color: var(--mkcg-text-primary, #0f172a);
  flex: 1;
  line-height: 1.4;
}

.questions-topic-empty {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 20px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  border: 1px dashed var(--mkcg-border, #e2e8f0);
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.questions-topic-empty svg {
  flex-shrink: 0;
  color: var(--mkcg-text-secondary, #64748b);
}

.questions-topic-empty p {
  margin: 0;
  font-size: 14px;
  color: var(--mkcg-text-secondary, #64748b);
  line-height: 1.5;
}

/* Refine Topic Textarea */
.questions-refine-container {
  position: relative;
  margin-top: 1rem;
}

.questions-refine-hint {
  position: absolute;
  top: -10px;
  right: 15px;
  background: var(--mkcg-primary, #3b82f6);
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
  z-index: 1;
}

.questions-refine-textarea {
  width: 100%;
  padding: 16px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 10px;
  font-family: inherit;
  font-size: 1rem;
  background: #fff;
  box-sizing: border-box;
  transition: all 0.2s;
  resize: none;
  color: var(--mkcg-text-primary, #0f172a);
}

.questions-refine-textarea:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* ===========================================
   AUTHORITY HOOK BUILDER
   =========================================== */
.questions-authority-hook {
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-left: 4px solid var(--mkcg-primary, #3b82f6);
  padding: 1.5rem;
  border-radius: 8px;
}

.questions-authority-hook__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.questions-authority-hook__icon {
  color: #f59e0b;
  font-size: 16px;
}

.questions-authority-hook__title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--mkcg-text-primary, #0f172a);
}

.questions-authority-hook__grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

@media (max-width: 768px) {
  .questions-authority-hook__grid {
    grid-template-columns: 1fr;
  }
}

.questions-authority-hook__field {
  display: flex;
  flex-direction: column;
}

.questions-authority-hook__label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--mkcg-text-secondary, #64748b);
  margin-bottom: 6px;
}

.questions-authority-hook__input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 6px;
  font-size: 14px;
  background: #fff;
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.questions-authority-hook__input:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.questions-authority-hook__preview {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: rgba(59, 130, 246, 0.1);
  border-radius: 8px;
  border: 1px solid #bfdbfe;
  color: var(--mkcg-primary-hover, #2563eb);
  font-size: 0.95rem;
  font-style: italic;
  text-align: center;
  line-height: 1.5;
}

/* ===========================================
   QUESTIONS RESULTS - Sidebar + Main Layout
   =========================================== */
.questions-results {
  padding: 0;
}

.questions-results__layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 32px;
}

@media (min-width: 900px) {
  .questions-results__layout {
    flex-direction: row;
    align-items: flex-start;
  }
  .questions-results__sidebar {
    position: sticky;
    top: 1rem;
    flex: 0 0 280px;
  }
  .questions-results__main {
    flex: 1;
    min-width: 0;
  }
}

/* Sidebar: Topic Card */
.questions-results__topic-card {
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 12px;
  padding: 1.25rem;
}

.questions-results__topic-header {
  margin-bottom: 1rem;
}

.questions-results__topic-title {
  font-size: 12px;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--mkcg-text-secondary, #64748b);
  margin: 0;
  letter-spacing: 0.5px;
}

.questions-results__topic-preview {
  padding: 1rem;
  background: #fff;
  border: 1px solid var(--mkcg-primary, #3b82f6);
  border-radius: 8px;
  font-size: 14px;
  font-weight: 700;
  line-height: 1.4;
  color: var(--mkcg-text-primary, #0f172a);
}

.questions-results__topic-hint {
  font-size: 11px;
  color: var(--mkcg-text-muted, #94a3b8);
  margin-top: 15px;
  font-style: italic;
  text-align: center;
  margin-bottom: 0;
}

/* Main Area Header */
.questions-results__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--mkcg-border, #e2e8f0);
}

.questions-results__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--mkcg-text-primary, #0f172a);
}

.questions-results__actions {
  display: flex;
  gap: 8px;
}

/* Questions List */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.questions-list__item {
  display: flex;
  align-items: flex-start;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  transition: all 0.15s;
}

.questions-list__item:hover {
  border-color: var(--mkcg-primary, #3b82f6);
  background: var(--mkcg-bg-secondary, #f8fafc);
}

.questions-list__number {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: var(--mkcg-primary, #3b82f6);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: white;
  margin-top: 2px;
}

.questions-list__text {
  flex: 1;
  font-size: 1rem;
  font-weight: 500;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0;
  line-height: 1.5;
}

.questions-list__copy-btn {
  flex-shrink: 0;
  padding: 6px;
  background: transparent;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 6px;
  cursor: pointer;
  color: var(--mkcg-text-secondary, #64748b);
  transition: all 0.15s;
  display: flex;
  align-items: center;
  opacity: 0;
}

.questions-list__item:hover .questions-list__copy-btn {
  opacity: 1;
}

.questions-list__copy-btn:hover {
  background: var(--mkcg-primary, #3b82f6);
  border-color: var(--mkcg-primary, #3b82f6);
  color: white;
}

/* Results Footer */
.questions-results__footer {
  margin-top: 2rem;
  border-top: 1px solid var(--mkcg-border, #e2e8f0);
  padding-top: 1.5rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
}

/* Ghost button variant */
.generator__button--ghost {
  background: transparent;
  border: none;
  color: var(--mkcg-text-secondary, #64748b);
  padding: 10px 16px;
  font-weight: 600;
  cursor: pointer;
  transition: color 0.2s;
}

.generator__button--ghost:hover {
  color: var(--mkcg-text-primary, #0f172a);
}

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
