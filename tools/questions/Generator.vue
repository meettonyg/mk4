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
    <!-- Profile Context Banner (for logged-in users) -->
    <template #profile-context>
      <ProfileContextBanner
        @profile-loaded="handleProfileLoaded"
        @profile-cleared="handleProfileCleared"
      />
    </template>

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

        <AuthorityHookBuilder
          :model-value="authorityHook"
          @update:model-value="Object.assign(authorityHook, $event)"
          title="Personalize Your Questions"
          :placeholders="{
            who: 'e.g. SaaS Founders',
            what: 'e.g. Increase revenue by 40%',
            when: 'e.g. When scaling rapidly',
            how: 'e.g. My proven 90-day system'
          }"
        />
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

          <!-- SIDEBAR: Interview Set (5 Lockable Slots) -->
          <aside class="questions-results__sidebar">
            <div class="questions-interview-set">
              <div class="questions-interview-set__header">
                <h3 class="questions-interview-set__title">Your Interview Set</h3>
                <span class="questions-interview-set__hint">Click lock to keep existing questions</span>
              </div>

              <div class="questions-interview-set__list">
                <div
                  v-for="(slot, slotIndex) in interviewSet"
                  :key="slotIndex"
                  class="questions-interview-slot"
                  :class="{ 'questions-interview-slot--locked': slot.locked, 'questions-interview-slot--filled': slot.question }"
                >
                  <span class="questions-interview-slot__position">{{ slotIndex + 1 }}</span>
                  <span class="questions-interview-slot__text" :class="{ 'questions-interview-slot__text--empty': !slot.question }">
                    {{ slot.question || 'Empty Slot' }}
                  </span>
                  <button
                    type="button"
                    class="questions-interview-slot__lock"
                    :title="slot.locked ? 'Unlock question' : 'Lock question'"
                    @click="toggleSlotLock(slotIndex)"
                    :disabled="!slot.question"
                  >
                    <svg v-if="slot.locked" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                      <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                    </svg>
                    <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                      <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                      <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                    </svg>
                  </button>
                </div>
              </div>

              <div class="questions-interview-set__summary">
                <span class="questions-interview-set__locked-count">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                  </svg>
                  {{ lockedSlotsCount }} locked
                </span>
                <span class="questions-interview-set__available">{{ availableSlotsCount }} slots available</span>
              </div>
            </div>
          </aside>

          <!-- MAIN: AI Generated Questions -->
          <main class="questions-results__main">
            <div class="questions-results__header">
              <div class="questions-results__title-row">
                <h3 class="questions-results__title">AI Generated Questions</h3>
                <span class="questions-results__count">{{ questions.length }} Ideas</span>
              </div>
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
                <button
                  type="button"
                  class="generator__button generator__button--outline"
                  @click="handleCopy"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy All
                </button>
              </div>
            </div>

            <!-- Selection Banner -->
            <div class="questions-selection-banner">
              <span>Topic: <strong>"{{ refinedTopic }}"</strong></span>
              <span class="questions-selection-banner__count">{{ selectedQuestionsCount }} of {{ availableSlotsCount }} selected</span>
            </div>

            <!-- Questions List with Checkboxes -->
            <div class="questions-list">
              <button
                v-for="(question, index) in questions"
                :key="index"
                type="button"
                class="questions-row"
                :class="{ 'questions-row--selected': isQuestionSelected(index) }"
                @click="toggleQuestionSelection(index)"
                :disabled="!canSelectMore && !isQuestionSelected(index)"
              >
                <div class="questions-row__checkbox" :class="{ 'questions-row__checkbox--checked': isQuestionSelected(index) }">
                  <svg v-if="isQuestionSelected(index)" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                    <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="3" fill="none"/>
                  </svg>
                </div>
                <span class="questions-row__number">{{ index + 1 }}.</span>
                <p class="questions-row__text">{{ question }}</p>
              </button>
            </div>

            <!-- Footer Actions -->
            <div class="questions-results__footer">
              <button
                type="button"
                class="generator__button generator__button--call-to-action generator__button--large"
                :disabled="selectedQuestionsCount === 0"
                @click="handleSaveToMediaKit"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                Save to Media Kit
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
import { GeneratorLayout, GuidancePanel, AuthorityHookBuilder, ProfileContextBanner, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';

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

// ===========================================
// INTERVIEW SET STATE (5 Lockable Slots)
// ===========================================
const MAX_INTERVIEW_SLOTS = 5;

// Interview set: 5 slots that can be locked
const interviewSet = ref([
  { question: null, locked: false },
  { question: null, locked: false },
  { question: null, locked: false },
  { question: null, locked: false },
  { question: null, locked: false }
]);

// Selected question indices from the generated list
const selectedQuestionIndices = ref([]);

// Count of locked slots
const lockedSlotsCount = computed(() => {
  return interviewSet.value.filter(slot => slot.locked).length;
});

// Count of available (unlocked empty) slots
const availableSlotsCount = computed(() => {
  return MAX_INTERVIEW_SLOTS - lockedSlotsCount.value;
});

// Count of selected questions
const selectedQuestionsCount = computed(() => {
  return selectedQuestionIndices.value.length;
});

// Can select more questions?
const canSelectMore = computed(() => {
  return selectedQuestionsCount.value < availableSlotsCount.value;
});

/**
 * Check if a question is selected
 */
const isQuestionSelected = (index) => {
  return selectedQuestionIndices.value.includes(index);
};

/**
 * Toggle question selection
 */
const toggleQuestionSelection = (index) => {
  const idx = selectedQuestionIndices.value.indexOf(index);
  if (idx > -1) {
    // Deselect
    selectedQuestionIndices.value.splice(idx, 1);
    // Also remove from interview set if it was there
    const slotIdx = interviewSet.value.findIndex(
      slot => !slot.locked && slot.question === questions.value[index]
    );
    if (slotIdx > -1) {
      interviewSet.value[slotIdx].question = null;
    }
  } else if (canSelectMore.value) {
    // Select
    selectedQuestionIndices.value.push(index);
    // Add to first available unlocked slot
    const emptySlotIdx = interviewSet.value.findIndex(
      slot => !slot.locked && !slot.question
    );
    if (emptySlotIdx > -1) {
      interviewSet.value[emptySlotIdx].question = questions.value[index];
    }
  }
};

/**
 * Toggle lock on a slot
 */
const toggleSlotLock = (slotIndex) => {
  const slot = interviewSet.value[slotIndex];
  if (slot.question) {
    slot.locked = !slot.locked;
  }
};

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

  // Populate authority hook fields (check multiple field name patterns)
  const hookWho = profileData.hook_who || profileData.authority_hook_who || '';
  const hookWhat = profileData.hook_what || profileData.authority_hook_what || '';
  const hookWhen = profileData.hook_when || profileData.authority_hook_when || '';
  const hookHow = profileData.hook_how || profileData.authority_hook_how || '';

  if (hookWho && !authorityHook.who) authorityHook.who = hookWho;
  if (hookWhat && !authorityHook.what) authorityHook.what = hookWhat;
  if (hookWhen && !authorityHook.when) authorityHook.when = hookWhen;
  if (hookHow && !authorityHook.how) authorityHook.how = hookHow;

  // Populate authority hook fields from profile data (for cross-tool sync)
  loadFromProfileData(profileData);
}

/**
 * Handle profile loaded from ProfileContextBanner (standalone mode)
 */
function handleProfileLoaded(data) {
  if (data && props.mode === 'default') {
    populateFromProfile(data);
  }
}

/**
 * Handle profile cleared from ProfileContextBanner (standalone mode)
 */
function handleProfileCleared() {
  // Optionally clear form fields when profile is deselected
  // For now, we keep the existing data to avoid losing user input
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

    // Clear selections (but keep locked items)
    selectedQuestionIndices.value = [];
    // Clear unlocked slots
    interviewSet.value.forEach(slot => {
      if (!slot.locked) {
        slot.question = null;
      }
    });

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
 * Handle save to media kit - save selected questions
 */
const handleSaveToMediaKit = () => {
  // Get all questions from the interview set (both locked and selected)
  const savedQuestions = interviewSet.value
    .filter(slot => slot.question)
    .map(slot => slot.question);

  emit('applied', {
    componentId: props.componentId,
    questions: savedQuestions,
    interviewSet: interviewSet.value,
    action: 'save'
  });
};

/**
 * Handle start over - reset all state
 */
const handleStartOver = () => {
  reset();
  selectedTopicIndex.value = -1;
  refinedTopic.value = '';
  // Reset interview set
  selectedQuestionIndices.value = [];
  interviewSet.value = [
    { question: null, locked: false },
    { question: null, locked: false },
    { question: null, locked: false },
    { question: null, locked: false },
    { question: null, locked: false }
  ];
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

/* ===========================================
   INTERVIEW SET SIDEBAR (5 Lockable Slots)
   =========================================== */
.questions-interview-set {
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 12px;
  padding: 1.25rem;
}

.questions-interview-set__header {
  margin-bottom: 1rem;
}

.questions-interview-set__title {
  font-size: 14px;
  font-weight: 700;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0 0 4px 0;
}

.questions-interview-set__hint {
  font-size: 11px;
  color: var(--mkcg-text-muted, #94a3b8);
  font-style: italic;
}

.questions-interview-set__list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

/* Individual Interview Slot */
.questions-interview-slot {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  transition: all 0.15s;
}

.questions-interview-slot--filled {
  border-color: var(--mkcg-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.05);
}

.questions-interview-slot--locked {
  border-color: #22c55e;
  background: rgba(34, 197, 94, 0.08);
}

.questions-interview-slot__position {
  width: 22px;
  height: 22px;
  background: var(--mkcg-bg-secondary, #f1f5f9);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--mkcg-text-secondary, #64748b);
  flex-shrink: 0;
}

.questions-interview-slot--filled .questions-interview-slot__position {
  background: var(--mkcg-primary, #3b82f6);
  color: #fff;
}

.questions-interview-slot--locked .questions-interview-slot__position {
  background: #22c55e;
  color: #fff;
}

.questions-interview-slot__text {
  flex: 1;
  font-size: 12px;
  font-weight: 500;
  color: var(--mkcg-text-primary, #0f172a);
  line-height: 1.3;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.questions-interview-slot__text--empty {
  color: var(--mkcg-text-muted, #94a3b8);
  font-style: italic;
}

.questions-interview-slot__lock {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  padding: 0;
  background: transparent;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 6px;
  cursor: pointer;
  color: var(--mkcg-text-secondary, #64748b);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.questions-interview-slot__lock:hover:not(:disabled) {
  background: var(--mkcg-bg-secondary, #f1f5f9);
  border-color: var(--mkcg-text-secondary, #64748b);
}

.questions-interview-slot__lock:disabled {
  opacity: 0.3;
  cursor: not-allowed;
}

.questions-interview-slot--locked .questions-interview-slot__lock {
  background: #22c55e;
  border-color: #22c55e;
  color: #fff;
}

.questions-interview-slot--locked .questions-interview-slot__lock:hover {
  background: #16a34a;
  border-color: #16a34a;
}

/* Interview Set Summary */
.questions-interview-set__summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px solid var(--mkcg-border, #e2e8f0);
  font-size: 11px;
}

.questions-interview-set__locked-count {
  display: flex;
  align-items: center;
  gap: 4px;
  color: #22c55e;
  font-weight: 600;
}

.questions-interview-set__available {
  color: var(--mkcg-text-muted, #94a3b8);
}

/* ===========================================
   MAIN AREA HEADER
   =========================================== */
.questions-results__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 12px;
}

.questions-results__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.questions-results__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--mkcg-text-primary, #0f172a);
}

.questions-results__count {
  background: var(--mkcg-primary, #3b82f6);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  padding: 4px 10px;
  border-radius: 12px;
}

.questions-results__actions {
  display: flex;
  gap: 8px;
}

/* ===========================================
   SELECTION BANNER
   =========================================== */
.questions-selection-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  margin-bottom: 1rem;
  font-size: 13px;
  color: var(--mkcg-text-secondary, #64748b);
}

.questions-selection-banner strong {
  color: var(--mkcg-text-primary, #0f172a);
}

.questions-selection-banner__count {
  font-weight: 600;
  color: var(--mkcg-primary, #3b82f6);
}

/* ===========================================
   QUESTIONS LIST - Checkbox Style Rows
   =========================================== */
.questions-list {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.questions-row {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 14px 16px;
  background: #fff;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
  text-align: left;
  width: 100%;
}

.questions-row:hover:not(:disabled) {
  border-color: var(--mkcg-primary, #3b82f6);
  background: var(--mkcg-bg-secondary, #f8fafc);
}

.questions-row--selected {
  border-color: var(--mkcg-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.08);
  box-shadow: 0 0 0 2px rgba(59, 130, 246, 0.15);
}

.questions-row:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.questions-row__checkbox {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 2px solid var(--mkcg-border, #d1d5db);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2px;
  transition: all 0.15s;
  background: #fff;
}

.questions-row__checkbox--checked {
  background: var(--mkcg-primary, #3b82f6);
  border-color: var(--mkcg-primary, #3b82f6);
}

.questions-row__checkbox--checked svg {
  color: #fff;
}

.questions-row__number {
  flex-shrink: 0;
  font-size: 13px;
  font-weight: 600;
  color: var(--mkcg-text-secondary, #64748b);
  min-width: 24px;
  margin-top: 2px;
}

.questions-row__text {
  flex: 1;
  font-size: 14px;
  font-weight: 500;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0;
  line-height: 1.5;
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
