<template>
  <div class="gfy-questions-generator">
    <!-- Form Section (always show in embedded mode, otherwise hide when has results) -->
    <div v-if="isEmbedded || !hasQuestions" class="gfy-questions-form">
      <!-- STEP 1: Choose or Tweak Your Topic -->
      <div class="gfy-input-group">
        <label class="gfy-label">{{ hasProfileTopics ? 'Step 1: Choose or Tweak Your Topic' : 'Topics You Discuss' }} {{ !hasProfileTopics ? '*' : '' }}</label>

        <!-- Topic Selection Grid (only show if profile has topics) -->
        <div v-if="hasProfileTopics" class="topic-selection-grid">
          <div
            v-for="(topic, index) in profileTopics"
            :key="index"
            class="topic-card"
            :class="{ 'topic-card--active': selectedTopicIndex === index, 'topic-card--empty': !topic.title }"
            @click="selectTopic(index)"
          >
            <span class="topic-card__number">{{ index + 1 }}</span>
            <span class="topic-card__text">{{ topic.title || '(Empty topic slot)' }}</span>
          </div>
        </div>

        <!-- Refine Selected Topic Textarea -->
        <div class="gfy-textarea-container">
          <span v-if="hasProfileTopics" class="gfy-textarea-hint">Refine Selected Topic</span>
          <textarea
            v-model="refinedTopic"
            class="gfy-textarea"
            :rows="hasProfileTopics ? 2 : 4"
            :placeholder="hasProfileTopics ? 'Select a topic above or enter a custom topic...' : 'e.g., Leadership development, Building high-performance teams, Navigating career transitions...'"
          ></textarea>
          <p v-if="!hasProfileTopics" class="gfy-hint">
            List 3-5 topics you typically discuss in interviews. Be specific about the areas you want to explore.
          </p>
        </div>
      </div>

      <!-- STEP 2: Authority Hook -->
      <div class="gfy-input-group">
        <label class="gfy-label">{{ hasProfileTopics ? 'Step 2: Confirm Your Authority Hook' : 'Your Background (Optional)' }}</label>
        <div class="gfy-authority-hook">
          <div class="gfy-authority-hook__header">
            <span class="gfy-authority-hook__icon">&#9733;</span>
            <h3 class="gfy-authority-hook__title">Personalize Your Questions</h3>
          </div>
          <div class="gfy-builder">
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">WHO do you help?</label>
              <input
                v-model="hookWho"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g., SaaS Founders"
              />
            </div>
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">WHAT is the result?</label>
              <input
                v-model="hookWhat"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g., Increase revenue by 40%"
              />
            </div>
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">WHEN do they need it?</label>
              <input
                v-model="hookWhen"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g., When scaling rapidly"
              />
            </div>
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">HOW do you do it?</label>
              <input
                v-model="hookHow"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g., My proven 90-day system"
              />
            </div>
          </div>
          <div class="gfy-live-preview">
            "{{ hookPreview }}"
          </div>
        </div>
      </div>
    </div>

    <!-- Results Section (only in default mode, embedded mode uses wrapper's preview) -->
    <div v-if="!isEmbedded && hasQuestions" class="gfy-results">
      <div class="gfy-results-layout">
        <!-- LEFT SIDEBAR: Current 5 Questions for the selected topic -->
        <aside v-if="selectedProfileId" class="gfy-layout-sidebar">
          <div class="gfy-current-topics">
            <div class="gfy-current-topics__header">
              <h3 class="gfy-current-topics__title">Your Interview Set</h3>
              <span class="gfy-current-topics__hint">Click lock to keep existing questions</span>
            </div>

            <div class="gfy-current-topics__list">
              <div
                v-for="(question, index) in currentQuestions"
                :key="index"
                class="gfy-current-topic"
                :class="{ 'gfy-current-topic--locked': question.locked, 'gfy-current-topic--empty': !question.text }"
              >
                <span class="gfy-current-topic__position">{{ index + 1 }}</span>
                <span class="gfy-current-topic__text">{{ question.text || 'Empty Slot' }}</span>
                <button
                  v-if="question.text"
                  type="button"
                  class="gfy-current-topic__lock"
                  :title="question.locked ? 'Unlock to replace' : 'Lock to keep'"
                  @click="toggleQuestionLock(index)"
                >
                  <i :class="question.locked ? 'fas fa-lock' : 'fas fa-lock-open'"></i>
                </button>
              </div>
            </div>

            <div class="gfy-current-topics__summary">
              <span class="gfy-current-topics__locked-count">
                {{ lockedQuestionsCount }} locked
              </span>
              <span class="gfy-current-topics__available">
                {{ availableSlots }} slot{{ availableSlots !== 1 ? 's' : '' }} available
              </span>
            </div>
          </div>
        </aside>

        <!-- RIGHT MAIN: 10 AI Generated Questions -->
        <main class="gfy-layout-main">
          <div class="gfy-results__header">
            <div class="gfy-results__title-row">
              <h3 class="gfy-results__title">AI Generated Questions</h3>
              <span class="gfy-results__count">{{ questions.length }} Ideas</span>
            </div>
            <div class="gfy-results__actions">
              <button type="button" class="gfy-btn gfy-btn--outline" @click="handleRegenerate">
                <i class="fas fa-sync"></i> Regenerate
              </button>
              <button type="button" class="gfy-btn gfy-btn--outline" @click="handleCopyAll">
                <i class="fas fa-copy"></i> {{ selectedQuestionsCount > 0 ? 'Copy Selected' : 'Copy All' }}
              </button>
            </div>
          </div>

          <div class="gfy-selection-banner">
            <span>Topic: <strong>"{{ refinedTopic }}"</strong></span>
            <span class="gfy-selection-banner__count">{{ selectedQuestionsCount }} of {{ availableSlots }} selected</span>
          </div>

          <div class="gfy-topics-list">
            <div
              v-for="(question, index) in questions"
              :key="index"
              class="gfy-topic-row"
              :class="{ 'gfy-topic-row--selected': isQuestionSelected(index) }"
              @click="toggleQuestionSelection(index)"
            >
              <div class="gfy-topic-row__checkbox" :class="{ 'gfy-topic-row__checkbox--checked': isQuestionSelected(index) }">
                <i v-if="isQuestionSelected(index)" class="fas fa-check"></i>
              </div>
              <div class="gfy-topic-row__number">{{ index + 1 }}.</div>
              <p class="gfy-topic-row__title">{{ typeof question === 'string' ? question : question.question || question }}</p>
            </div>
          </div>

          <div class="gfy-results__footer">
            <button
              type="button"
              class="gfy-btn gfy-btn--primary gfy-btn--large"
              :disabled="selectedQuestionsCount === 0 || isSaving"
              @click="handleSaveToMediaKit"
            >
              <i v-if="!isSaving" class="fas fa-save"></i>
              <span v-if="isSaving" class="gfy-spinner"></span>
              {{ isSaving ? 'Saving...' : 'Save to Media Kit' }}
            </button>
            <button type="button" class="gfy-btn gfy-btn--text" @click="handleStartOver">
              Start Over
            </button>
            <!-- Save Success Message -->
            <span v-if="saveSuccess" class="gfy-save-success">
              Saved successfully!
            </span>
            <!-- Save Error Message -->
            <span v-if="saveError" class="gfy-save-error">
              {{ saveError }}
            </span>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted } from 'vue';
import { useAIQuestions } from '../../src/composables/useAIQuestions';
import { useProfileContext } from '../../src/composables/useProfileContext';
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared/constants';

// Constants
const MAX_QUESTIONS_PER_TOPIC = 5;
const QUESTIONS_TO_GENERATE = 10;

const props = defineProps({
  /**
   * Mode: 'embedded' or 'default'
   * - embedded: Form only, results shown in wrapper's preview panel
   * - default: Full form + results display
   */
  mode: {
    type: String,
    default: 'default'
  },
  profileData: {
    type: Object,
    default: null
  },
  intent: {
    type: Object,
    default: null
  }
});

// Computed: Check if in embedded mode
const isEmbedded = computed(() => props.mode === 'embedded');

const emit = defineEmits(['update:can-generate', 'authority-hook-update', 'generated', 'saved']);

// Use composables
const {
  isGenerating,
  error,
  questions,
  hasQuestions,
  generate,
  copyToClipboard,
  reset
} = useAIQuestions();

const {
  profileId: contextProfileId,
  isSaving,
  saveError,
  saveToProfile
} = useProfileContext();

// Inject profile data from parent (EmbeddedToolWrapper provides this)
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Local state
const selectedTopicIndex = ref(null);
const refinedTopic = ref('');
const selectedQuestions = ref([]); // Array of indices from generated questions
const saveSuccess = ref(false);
const selectedProfileId = ref(null);

// Profile topics (loaded from profile data)
const profileTopics = ref([
  { title: '', questions: [] },
  { title: '', questions: [] },
  { title: '', questions: [] },
  { title: '', questions: [] },
  { title: '', questions: [] }
]);

// Current questions for selected topic (with lock status)
const currentQuestions = ref([
  { position: 0, text: '', locked: false },
  { position: 1, text: '', locked: false },
  { position: 2, text: '', locked: false },
  { position: 3, text: '', locked: false },
  { position: 4, text: '', locked: false }
]);

// Authority Hook Builder fields
const hookWho = ref('');
const hookWhat = ref('');
const hookWhen = ref('');
const hookHow = ref('');

/**
 * Computed: resolved profile ID from all available sources
 */
const resolvedProfileId = computed(() => {
  return props.profileData?.id
    || injectedProfileData.value?.id
    || contextProfileId.value
    || null;
});

// Keep selectedProfileId in sync with resolved ID
watch(resolvedProfileId, (newId) => {
  selectedProfileId.value = newId;
}, { immediate: true });

/**
 * Computed: Live preview of authority hook
 */
const hookPreview = computed(() => {
  const who = hookWho.value || '[WHO]';
  const what = hookWhat.value || '[WHAT]';
  const when = hookWhen.value || '[WHEN]';
  const how = hookHow.value || '[HOW]';
  return `I help ${who} ${what} ${when} through ${how}.`;
});

/**
 * Computed: Generated authority hook summary
 */
const generatedHookSummary = computed(() => {
  if (!hookWho.value && !hookWhat.value) return '';
  let summary = `I help ${hookWho.value || ''} ${hookWhat.value || ''}`;
  if (hookWhen.value) summary += ` ${hookWhen.value}`;
  if (hookHow.value) summary += ` through ${hookHow.value}`;
  return summary.trim() + '.';
});

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return refinedTopic.value.trim().length > 0;
});

/**
 * Check if any profile topics exist
 */
const hasProfileTopics = computed(() => {
  return profileTopics.value.some(t => t.title);
});

/**
 * Get count of locked questions
 */
const lockedQuestionsCount = computed(() => {
  return currentQuestions.value.filter(q => q.locked && q.text).length;
});

/**
 * Get number of available slots (unlocked positions)
 */
const availableSlots = computed(() => {
  return MAX_QUESTIONS_PER_TOPIC - lockedQuestionsCount.value;
});

/**
 * Get count of selected questions
 */
const selectedQuestionsCount = computed(() => {
  return selectedQuestions.value.length;
});

/**
 * Check if a question is selected
 */
const isQuestionSelected = (index) => selectedQuestions.value.includes(index);

/**
 * Select a topic from the profile topics
 */
const selectTopic = (index) => {
  const topic = profileTopics.value[index];
  if (!topic.title) return; // Don't select empty topics

  selectedTopicIndex.value = index;
  refinedTopic.value = topic.title;

  // Load current questions for this topic
  loadCurrentQuestionsForTopic(index);
};

/**
 * Load current questions for a specific topic
 */
const loadCurrentQuestionsForTopic = (topicIndex) => {
  const topic = profileTopics.value[topicIndex];
  if (!topic) return;

  currentQuestions.value = topic.questions.map((text, idx) => ({
    position: idx,
    text: text || '',
    locked: !!text // Lock if has content
  }));
};

/**
 * Toggle lock status for a current question
 */
const toggleQuestionLock = (index) => {
  const question = currentQuestions.value[index];
  if (question) {
    question.locked = !question.locked;
    // If we're locking and have too many selected, deselect until within limit
    if (question.locked) {
      while (selectedQuestions.value.length > availableSlots.value) {
        selectedQuestions.value.pop();
      }
    }
  }
};

/**
 * Toggle question selection (respects locked slots)
 */
const toggleQuestionSelection = (index) => {
  const idx = selectedQuestions.value.indexOf(index);
  if (idx > -1) {
    selectedQuestions.value.splice(idx, 1);
  } else if (selectedQuestions.value.length < availableSlots.value) {
    selectedQuestions.value.push(index);
  }
};

/**
 * Populate from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Load authority hook fields
  if (profileData.hook_who) hookWho.value = profileData.hook_who;
  if (profileData.hook_what) hookWhat.value = profileData.hook_what;
  if (profileData.hook_when) hookWhen.value = profileData.hook_when;
  if (profileData.hook_how) hookHow.value = profileData.hook_how;

  // Load topics with their questions
  const loadedTopics = [];
  for (let i = 1; i <= 5; i++) {
    const topicTitle = profileData[`topic_${i}`] || '';
    const questions = [];

    // Each topic has 5 questions: topic 1 = q1-5, topic 2 = q6-10, etc.
    const startQ = (i - 1) * 5 + 1;
    for (let q = startQ; q < startQ + 5; q++) {
      questions.push(profileData[`question_${q}`] || '');
    }

    loadedTopics.push({
      title: topicTitle,
      questions: questions
    });
  }
  profileTopics.value = loadedTopics;

  // Auto-select first topic that has content
  const firstWithContent = loadedTopics.findIndex(t => t.title);
  if (firstWithContent > -1) {
    selectTopic(firstWithContent);
  }
}

/**
 * Handle generate - exposed for parent to call
 */
const handleGenerate = async () => {
  selectedQuestions.value = [];

  await generate({
    topics: refinedTopic.value,
    authorityHook: generatedHookSummary.value,
    count: QUESTIONS_TO_GENERATE
  }, 'public');

  // Emit generated event for parent to handle
  emit('generated', { questions: questions.value });

  return { questions: questions.value };
};

/**
 * Handle regenerate
 */
const handleRegenerate = async () => {
  selectedQuestions.value = [];
  await handleGenerate();
};

/**
 * Handle copy - copies selected questions (or all if none selected) as a user-friendly numbered list
 */
const handleCopyAll = async () => {
  const questionsToUse = selectedQuestions.value.length > 0
    ? selectedQuestions.value.map(idx => questions.value[idx])
    : questions.value;

  const formattedText = questionsToUse
    .map((question, index) => {
      const text = typeof question === 'string' ? question : question.question || question;
      return `${index + 1}. ${text}`;
    })
    .join('\n');

  try {
    await navigator.clipboard.writeText(formattedText);
  } catch (err) {
    console.error('[Questions Generator] Failed to copy:', err);
  }
};

/**
 * Handle save to media kit
 * Merges locked questions with newly selected questions
 */
const handleSaveToMediaKit = async () => {
  if (selectedTopicIndex.value === null) return;

  // Build final questions array: locked questions in their positions + new selections in unlocked slots
  const finalQuestions = [];

  // Get locked questions by position
  const lockedByPosition = {};
  currentQuestions.value.forEach(q => {
    if (q.locked && q.text) {
      lockedByPosition[q.position] = q.text;
    }
  });

  // Get new selections
  const newSelections = selectedQuestions.value.map(idx => {
    const question = questions.value[idx];
    return typeof question === 'string' ? question : question.question || question;
  });

  // Build final array: locked questions stay in position, new ones fill gaps
  let newSelectionIndex = 0;
  for (let i = 0; i < MAX_QUESTIONS_PER_TOPIC; i++) {
    if (lockedByPosition[i]) {
      finalQuestions.push(lockedByPosition[i]);
    } else if (newSelectionIndex < newSelections.length) {
      finalQuestions.push(newSelections[newSelectionIndex]);
      newSelectionIndex++;
    } else {
      finalQuestions.push(''); // Empty slot
    }
  }

  try {
    // Calculate question field indices based on selected topic
    // topic_1 = questions 1-5, topic_2 = questions 6-10, etc.
    const startQ = selectedTopicIndex.value * 5 + 1;
    const questionsData = {};
    finalQuestions.forEach((text, idx) => {
      questionsData[`question_${startQ + idx}`] = text;
    });

    const result = await saveToProfile('questions', questionsData, {
      profileId: selectedProfileId.value
    });

    if (result.success) {
      saveSuccess.value = true;
      setTimeout(() => { saveSuccess.value = false; }, 3000);

      // Update currentQuestions to reflect saved state (all now locked)
      currentQuestions.value = finalQuestions.map((text, idx) => ({
        position: idx,
        text: text,
        locked: !!text
      }));

      // Update profileTopics with new questions
      profileTopics.value[selectedTopicIndex.value].questions = finalQuestions;

      // Clear selections since they're now saved
      selectedQuestions.value = [];

      emit('saved', {
        profileId: selectedProfileId.value,
        topicIndex: selectedTopicIndex.value,
        questions: finalQuestions
      });
    }
  } catch (err) {
    console.error('[Questions Generator] Save failed:', err);
  }
};

/**
 * Handle start over - reset and show form
 */
const handleStartOver = () => {
  selectedQuestions.value = [];
  if (reset) {
    reset();
  }
};

// Watch for canGenerate changes
watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
}, { immediate: true });

// Watch authority hook changes
watch(
  [hookWho, hookWhat, hookWhen, hookHow],
  () => {
    emit('authority-hook-update', {
      who: hookWho.value,
      what: hookWhat.value,
      when: hookWhen.value,
      how: hookHow.value,
      summary: generatedHookSummary.value
    });
  }
);

// Watch profile data from both props and inject
watch(
  [() => props.profileData, injectedProfileData],
  ([propsData, injectedData]) => {
    const data = propsData || injectedData;
    if (data) populateFromProfile(data);
  },
  { immediate: true }
);

// Expose for parent
defineExpose({
  handleGenerate,
  questions,
  hasQuestions,
  isGenerating,
  error,
  copyToClipboard
});
</script>

<style scoped>
.gfy-questions-generator {
  --gfy-primary-color: #2563eb;
  --gfy-primary-light: #eff6ff;
  --gfy-primary-dark: #1d4ed8;
  --gfy-text-primary: #0f172a;
  --gfy-text-secondary: #64748b;
  --gfy-text-muted: #94a3b8;
  --gfy-bg-color: #f8fafc;
  --gfy-white: #ffffff;
  --gfy-border-color: #e2e8f0;
  --gfy-warning-color: #f59e0b;
  --gfy-success-color: #10b981;
  --gfy-radius-md: 8px;
  --gfy-radius-lg: 12px;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* INPUT STYLES */
.gfy-input-group {
  margin-bottom: 2rem;
}

.gfy-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--gfy-text-primary);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* TOPIC SELECTION GRID */
.topic-selection-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: 12px;
  margin-bottom: 1.5rem;
}

.topic-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: 10px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.topic-card:hover:not(.topic-card--empty) {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-bg-color);
}

.topic-card--active {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
  box-shadow: 0 0 0 2px var(--gfy-primary-color);
}

.topic-card--empty {
  opacity: 0.5;
  cursor: not-allowed;
}

.topic-card__number {
  width: 24px;
  height: 24px;
  background: var(--gfy-bg-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 11px;
  font-weight: 700;
  color: var(--gfy-text-secondary);
  flex-shrink: 0;
}

.topic-card--active .topic-card__number {
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.topic-card__text {
  font-size: 13px;
  font-weight: 600;
  color: var(--gfy-text-primary);
  flex: 1;
  line-height: 1.4;
}

.topic-card--empty .topic-card__text {
  font-style: italic;
  color: var(--gfy-text-muted);
}

/* REFINE TEXTAREA */
.gfy-textarea-container {
  position: relative;
  margin-top: 1rem;
}

.gfy-textarea {
  width: 100%;
  padding: 16px;
  border: 1px solid var(--gfy-border-color);
  border-radius: 10px;
  font-family: inherit;
  font-size: 1rem;
  background: var(--gfy-white);
  box-sizing: border-box;
  transition: all 0.2s;
  resize: none;
  color: var(--gfy-text-primary);
}

.gfy-textarea:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-textarea::placeholder {
  color: var(--gfy-text-muted);
}

.gfy-hint {
  margin: 0.5rem 0 0;
  font-size: 0.8rem;
  color: var(--gfy-text-muted);
}

.gfy-textarea-hint {
  position: absolute;
  top: -10px;
  right: 15px;
  background: var(--gfy-primary-color);
  color: white;
  font-size: 10px;
  font-weight: 800;
  padding: 2px 8px;
  border-radius: 4px;
  text-transform: uppercase;
}

/* AUTHORITY HOOK BLOCK */
.gfy-authority-hook {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-left: 4px solid var(--gfy-primary-color);
  padding: 1.5rem;
  border-radius: var(--gfy-radius-md);
}

.gfy-authority-hook__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.gfy-authority-hook__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-authority-hook__icon {
  color: var(--gfy-warning-color);
  font-size: 1.2rem;
}

/* BUILDER GRID */
.gfy-builder {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1.25rem;
}

.gfy-builder__field {
  margin-bottom: 0.5rem;
}

.gfy-builder__label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--gfy-text-secondary);
  margin-bottom: 6px;
}

.gfy-builder__input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--gfy-border-color);
  border-radius: 6px;
  font-size: 14px;
  background: var(--gfy-white);
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-builder__input:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-builder__input::placeholder {
  color: var(--gfy-text-muted);
}

/* LIVE PREVIEW */
.gfy-live-preview {
  margin-top: 1.5rem;
  padding: 1.25rem;
  background: var(--gfy-primary-light);
  border-radius: var(--gfy-radius-md);
  border: 1px solid #bfdbfe;
  color: var(--gfy-primary-dark);
  font-size: 0.95rem;
  font-style: italic;
  text-align: center;
  line-height: 1.5;
}

/* RESULTS SECTION */
.gfy-results {
  width: 100%;
}

/* SIDE-BY-SIDE LAYOUT */
.gfy-results-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .gfy-results-layout {
    flex-direction: row;
    align-items: flex-start;
  }

  .gfy-layout-sidebar {
    position: sticky;
    top: 1rem;
    flex: 0 0 300px;
  }

  .gfy-layout-main {
    flex: 1;
    min-width: 0;
  }
}

/* CURRENT QUESTIONS SIDEBAR */
.gfy-current-topics {
  background: var(--gfy-bg-color);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 1.25rem;
}

.gfy-current-topics__header {
  margin-bottom: 1rem;
}

.gfy-current-topics__title {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-weight: 700;
  color: var(--gfy-text-secondary);
  margin: 0 0 4px;
}

.gfy-current-topics__hint {
  font-size: 0.75rem;
  color: var(--gfy-text-muted);
  display: block;
}

.gfy-current-topics__list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gfy-current-topic {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  transition: all 0.15s ease;
}

.gfy-current-topic--locked {
  background: var(--gfy-primary-light);
  border-color: var(--gfy-primary-color);
}

.gfy-current-topic--empty .gfy-current-topic__text {
  font-style: italic;
  color: var(--gfy-text-muted);
}

.gfy-current-topic__position {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.8rem;
  font-weight: 600;
  color: var(--gfy-text-secondary);
}

.gfy-current-topic--locked .gfy-current-topic__position {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-current-topic__text {
  flex: 1;
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--gfy-text-primary);
}

.gfy-current-topic__lock {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: 1px solid var(--gfy-border-color);
  border-radius: 6px;
  background: transparent;
  cursor: pointer;
  color: var(--gfy-text-muted);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s ease;
}

.gfy-current-topic__lock:hover {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
}

.gfy-current-topic--locked .gfy-current-topic__lock {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-current-topics__summary {
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--gfy-border-color);
  font-size: 0.8rem;
  display: flex;
  justify-content: space-between;
}

.gfy-current-topics__locked-count {
  color: var(--gfy-primary-color);
  font-weight: 600;
}

.gfy-current-topics__available {
  color: var(--gfy-text-secondary);
}

/* RESULTS HEADER */
.gfy-results__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gfy-border-color);
  flex-wrap: wrap;
  gap: 1rem;
}

.gfy-results__title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.gfy-results__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

.gfy-results__count {
  background: var(--gfy-primary-light);
  color: var(--gfy-primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.gfy-results__actions {
  display: flex;
  gap: 0.75rem;
}

/* SELECTION BANNER */
.gfy-selection-banner {
  background: var(--gfy-primary-light);
  border: 1px solid #bfdbfe;
  border-radius: var(--gfy-radius-md);
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
  display: flex;
  justify-content: space-between;
  font-size: 0.9rem;
}

.gfy-selection-banner__count {
  font-weight: 600;
  color: var(--gfy-primary-color);
}

/* TOPICS LIST */
.gfy-topics-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.gfy-topic-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gfy-topic-row:hover {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-bg-color);
}

.gfy-topic-row--selected {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-topic-row__checkbox {
  width: 20px;
  height: 20px;
  border: 2px solid var(--gfy-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.gfy-topic-row__checkbox--checked {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: white;
}

.gfy-topic-row__number {
  font-weight: 700;
  color: var(--gfy-text-muted);
  min-width: 24px;
}

.gfy-topic-row__title {
  flex: 1;
  margin: 0;
  font-size: 0.95rem;
  color: var(--gfy-text-primary);
  line-height: 1.4;
}

/* BUTTONS */
.gfy-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.625rem 1rem;
  font-size: 0.875rem;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid var(--gfy-border-color);
  transition: all 0.15s;
  font-family: inherit;
}

.gfy-btn--primary {
  background: var(--gfy-primary-color);
  color: white;
  border: none;
}

.gfy-btn--primary:hover:not(:disabled) {
  background: var(--gfy-primary-dark);
}

.gfy-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gfy-btn--outline {
  background: white;
  color: var(--gfy-text-secondary);
}

.gfy-btn--outline:hover {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
}

.gfy-btn--text {
  background: transparent;
  border: none;
  color: var(--gfy-text-secondary);
}

.gfy-btn--text:hover {
  color: var(--gfy-text-primary);
}

.gfy-btn--large {
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
}

/* RESULTS FOOTER */
.gfy-results__footer {
  margin-top: 1rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gfy-border-color);
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.gfy-save-success {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--gfy-success-color);
}

.gfy-save-error {
  font-size: 0.9rem;
  font-weight: 500;
  color: #dc2626;
}

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

/* RESPONSIVE */
@media (max-width: 768px) {
  .gfy-builder {
    grid-template-columns: 1fr;
  }

  .topic-selection-grid {
    grid-template-columns: 1fr;
  }

  .gfy-results__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .gfy-selection-banner {
    flex-direction: column;
    gap: 0.5rem;
  }
}
</style>
