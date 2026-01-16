<template>
  <div class="gfy-topics-generator">
    <!-- Form Section -->
    <div v-if="!hasTopics" class="gfy-topics-form">
      <!-- Draft Restore Prompt -->
      <div v-if="showDraftPrompt" class="gfy-draft-prompt">
        <div class="gfy-draft-prompt__content">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="16" y1="13" x2="8" y2="13"/>
            <line x1="16" y1="17" x2="8" y2="17"/>
          </svg>
          <div>
            <strong>Restore previous work?</strong>
            <p>You have a saved draft from {{ getLastSavedText() }}.</p>
          </div>
        </div>
        <div class="gfy-draft-prompt__actions">
          <button type="button" class="gfy-btn gfy-btn--primary gfy-btn--small" @click="handleRestoreDraft">
            Restore Draft
          </button>
          <button type="button" class="gfy-btn gfy-btn--text gfy-btn--small" @click="handleDiscardDraft">
            Start Fresh
          </button>
        </div>
      </div>

      <!-- Auto-save Indicator -->
      <div v-if="isAutoSaving" class="gfy-auto-save-indicator">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        Saving draft...
      </div>

      <!-- Form Completion Indicator -->
      <div class="gfy-form-progress" :class="{ 'gfy-form-progress--complete': formCompletion.isComplete }">
        <div class="gfy-form-progress__header">
          <span class="gfy-form-progress__label">
            <svg v-if="formCompletion.isComplete" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
            </svg>
            {{ formCompletion.isComplete ? 'Ready to generate!' : `${formCompletion.filledCount}/${formCompletion.totalCount} fields completed` }}
          </span>
        </div>
        <div class="gfy-form-progress__bar">
          <div class="gfy-form-progress__fill" :style="{ width: `${formCompletion.percentage}%` }"></div>
        </div>
      </div>

      <!-- Expertise Field -->
      <div class="gfy-input-group">
        <label class="gfy-label">
          Your Area of Expertise *
          <span v-if="isFieldPrefilled('expertise')" class="gfy-prefilled-badge">from profile</span>
        </label>
        <textarea
          v-model="expertise"
          class="gfy-textarea"
          :class="{ 'gfy-textarea--prefilled': isFieldPrefilled('expertise') }"
          rows="2"
          placeholder="e.g. Digital Marketing Strategies"
          @input="markFieldEdited('expertise')"
        ></textarea>
        <div v-if="expertise" class="gfy-char-count">{{ expertise.length }} characters</div>
      </div>

      <!-- Authority Hook Builder -->
      <AuthorityHookBuilder
        :model-value="authorityHook"
        @update:model-value="Object.assign(authorityHook, $event)"
        title="Your Authority Hook"
        :placeholders="{
          who: 'e.g. SaaS Founders',
          what: 'e.g. Increase revenue by 40%',
          when: 'e.g. When scaling rapidly',
          how: 'e.g. My proven 90-day system'
        }"
      />
    </div>

    <!-- Loading Skeleton -->
    <div v-if="isGenerating && !hasTopics" class="gfy-skeleton-results">
      <div class="gfy-skeleton-header">
        <div class="gfy-skeleton gfy-skeleton--text gfy-skeleton--title"></div>
        <div class="gfy-skeleton gfy-skeleton--text gfy-skeleton--badge"></div>
      </div>
      <div class="gfy-skeleton-grid">
        <div v-for="i in 6" :key="i" class="gfy-skeleton-card">
          <div class="gfy-skeleton gfy-skeleton--text gfy-skeleton--line"></div>
          <div class="gfy-skeleton gfy-skeleton--text gfy-skeleton--line gfy-skeleton--short"></div>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="hasTopics" class="gfy-results">
      <!-- Layout wrapper for side-by-side on desktop -->
      <div class="gfy-results-layout">
        <!-- LEFT SIDEBAR: Current Topics (Lock/Pin Feature) - Only for logged-in users with a profile -->
        <aside v-if="hasCurrentTopics && selectedProfileId" class="gfy-layout-sidebar">
          <div class="gfy-current-topics">
            <div class="gfy-current-topics__header">
              <h3 class="gfy-current-topics__title">Your Current Topics</h3>
              <span class="gfy-current-topics__hint">Click lock to keep, unlock to replace</span>
            </div>
            <div class="gfy-current-topics__list">
              <div
                v-for="topic in currentTopics"
                :key="topic.position"
                class="gfy-current-topic"
                :class="{ 'gfy-current-topic--locked': topic.locked, 'gfy-current-topic--empty': !topic.text }"
              >
                <span class="gfy-current-topic__position">{{ topic.position + 1 }}</span>
                <span class="gfy-current-topic__text">{{ topic.text || '(empty)' }}</span>
                <button
                  v-if="topic.text"
                  type="button"
                  class="gfy-current-topic__lock"
                  :title="topic.locked ? 'Unlock to replace' : 'Lock to keep'"
                  @click="toggleLock(topic.position)"
                >
                  <i :class="topic.locked ? 'fas fa-lock' : 'fas fa-lock-open'"></i>
                </button>
              </div>
            </div>
            <div class="gfy-current-topics__summary">
              <span class="gfy-current-topics__locked-count">
                🔒 {{ lockedTopics.length }} locked
              </span>
              <span class="gfy-current-topics__available">
                {{ availableSlots }} slot{{ availableSlots !== 1 ? 's' : '' }} available for new topics
              </span>
            </div>
          </div>
        </aside>

        <!-- RIGHT MAIN: Generated Topics and Actions -->
        <main class="gfy-layout-main">
          <!-- Results Header -->
          <div class="gfy-results__header">
            <div class="gfy-results__title-row">
              <h3 class="gfy-results__title">Generated Topics</h3>
              <span class="gfy-results__count">{{ topics.length }} Ideas</span>
            </div>
            <div class="gfy-results__actions">
              <!-- View Toggle -->
              <div class="gfy-view-toggle">
                <button
                  type="button"
                  class="gfy-view-toggle__btn"
                  :class="{ 'gfy-view-toggle__btn--active': viewMode === 'card' }"
                  @click="viewMode = 'card'"
                  title="Card View"
                >
                  <i class="fas fa-th-large"></i>
                </button>
                <button
                  type="button"
                  class="gfy-view-toggle__btn"
                  :class="{ 'gfy-view-toggle__btn--active': viewMode === 'list' }"
                  @click="viewMode = 'list'"
                  title="List View"
                >
                  <i class="fas fa-list"></i>
                </button>
              </div>
              <button type="button" class="gfy-btn gfy-btn--outline" @click="handleRegenerate">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                </svg>
                Regenerate
              </button>
              <button type="button" class="gfy-btn gfy-btn--outline" @click="handleCopyAll">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
                {{ selectedTopics.length > 0 ? 'Copy Selected' : 'Copy All' }}
              </button>
            </div>
          </div>

          <!-- Selection Banner -->
          <div class="gfy-selection-banner">
            <span class="gfy-selection-banner__text">
              <template v-if="lockedTopics.length > 0">
                Select up to {{ availableSlots }} new topic{{ availableSlots !== 1 ? 's' : '' }} ({{ lockedTopics.length }} locked)
              </template>
              <template v-else>
                Select up to {{ MAX_SELECTED_TOPICS }} topics (click order = save order)
              </template>
            </span>
            <span class="gfy-selection-banner__count">
              {{ selectedTopics.length }} of {{ availableSlots }} selected
            </span>
          </div>

          <!-- Topics Grid (Card View) -->
          <div v-if="viewMode === 'card'" class="gfy-topics-grid">
            <div
              v-for="(topic, index) in topics"
              :key="index"
              class="gfy-topic-card"
              :class="{ 'gfy-topic-card--selected': isSelected(index) }"
              @click="toggleSelection(index)"
            >
              <div class="gfy-topic-card__number">{{ index + 1 }}</div>
              <div class="gfy-topic-card__content">
                <span v-if="topic.category" class="gfy-topic-card__category">{{ topic.category }}</span>
                <p class="gfy-topic-card__title">{{ typeof topic === 'string' ? topic : topic.title || topic }}</p>
              </div>
              <div class="gfy-topic-card__actions">
                <button
                  type="button"
                  class="gfy-copy-btn"
                  :class="{ 'gfy-copy-btn--copied': copiedIndex === index }"
                  :title="copiedIndex === index ? 'Copied!' : 'Copy topic'"
                  @click="handleCopySingleTopic(index, $event)"
                >
                  <svg v-if="copiedIndex === index" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  <svg v-else width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                  </svg>
                </button>
                <div class="gfy-topic-card__checkbox">
                  <span v-if="isSelected(index)" class="gfy-position-badge">{{ getSelectionPosition(index) }}</span>
                </div>
              </div>
            </div>
          </div>

          <!-- Topics List (List View) -->
          <div v-else class="gfy-topics-list">
            <div
              v-for="(topic, index) in topics"
              :key="index"
              class="gfy-topic-row"
              :class="{ 'gfy-topic-row--selected': isSelected(index) }"
              @click="toggleSelection(index)"
            >
              <div class="gfy-topic-row__checkbox">
                <span v-if="isSelected(index)" class="gfy-position-badge gfy-position-badge--small">{{ getSelectionPosition(index) }}</span>
              </div>
              <div class="gfy-topic-row__number">{{ index + 1 }}.</div>
              <p class="gfy-topic-row__title">{{ typeof topic === 'string' ? topic : topic.title || topic }}</p>
              <button
                type="button"
                class="gfy-copy-btn gfy-copy-btn--small"
                :class="{ 'gfy-copy-btn--copied': copiedIndex === index }"
                :title="copiedIndex === index ? 'Copied!' : 'Copy topic'"
                @click="handleCopySingleTopic(index, $event)"
              >
                <svg v-if="copiedIndex === index" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
                <svg v-else width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
                </svg>
              </button>
            </div>
          </div>

          <!-- Save Actions -->
          <div class="gfy-results__footer">
            <!-- Authority Hook Save Option -->
            <label v-if="hasAuthorityHookData" class="gfy-checkbox-option">
              <input
                v-model="saveAuthorityHook"
                type="checkbox"
                class="gfy-checkbox-option__input"
              />
              <span class="gfy-checkbox-option__box">
                <svg v-if="saveAuthorityHook" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </span>
              <span class="gfy-checkbox-option__label">Also save Authority Hook to profile</span>
            </label>

            <div class="gfy-save-section">
              <button
                type="button"
                class="gfy-btn gfy-btn--primary gfy-btn--large"
                :disabled="selectedTopics.length === 0 || isSaving"
                @click="handleSaveToMediaKit"
              >
                <svg v-if="!isSaving" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <span v-if="isSaving" class="gfy-spinner"></span>
                {{ isSaving ? 'Saving...' : 'Save to Media Kit' }}
              </button>
              <button type="button" class="gfy-btn gfy-btn--text" @click="handleStartOver">
                Start Over
              </button>
            </div>
            <!-- Save Success Message -->
            <span v-if="saveSuccess" class="gfy-save-success">
              ✓ Saved successfully!
            </span>
            <!-- Save Error Message -->
            <span v-if="saveError" class="gfy-save-error">
              {{ saveError }}
            </span>

            <!-- Cross-tool Navigation -->
            <div v-if="selectedTopics.length > 0" class="gfy-cross-tool-nav">
              <span class="gfy-cross-tool-nav__label">Next Steps:</span>
              <a
                :href="`/tools/questions/?topic=${encodeURIComponent(getFirstSelectedTopicText())}`"
                class="gfy-cross-tool-nav__link"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"/>
                  <line x1="12" y1="17" x2="12.01" y2="17"/>
                </svg>
                Generate Questions for this Topic
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="9 18 15 12 9 6"/>
                </svg>
              </a>
            </div>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, watch, inject, onMounted, onUnmounted } from 'vue';
import { useAITopics } from '../../src/composables/useAITopics';
import { useProfileContext } from '../../src/composables/useProfileContext';
import { useDraftState } from '../../src/composables/useDraftState';
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared/constants';
import { AuthorityHookBuilder } from '../_shared';

// Constants
const MAX_SELECTED_TOPICS = 5;

const props = defineProps({
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:can-generate', 'authority-hook-update', 'generated', 'saved']);

// Use composables
const {
  isGenerating,
  error,
  topics,
  hasTopics,
  generate,
  copyToClipboard,
  reset
} = useAITopics();

const {
  profileId: contextProfileId,
  isSaving,
  saveError,
  saveToProfile
} = useProfileContext();

// Inject profile data from parent (EmbeddedToolWrapper provides this)
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Local state
const expertise = ref('');
const selectedTopics = ref([]);
const saveSuccess = ref(false);
const selectedProfileId = ref(null);
const viewMode = ref('list'); // 'card' or 'list' - default to list for single-column display
const saveAuthorityHook = ref(true); // Whether to also save authority hook fields
const copiedIndex = ref(null); // Track which topic was just copied for visual feedback

// Locked topics from profile (Lock/Pin feature)
// Each item: { position: 0-4, text: string, locked: boolean }
const currentTopics = ref([]);

// Draft state for auto-save
const {
  hasDraft,
  lastSaved,
  isAutoSaving,
  saveDraft,
  loadDraft,
  clearDraft,
  startAutoSave,
  getLastSavedText
} = useDraftState('topics');

// Prefilled fields tracking
const prefilledFields = ref(new Set());
const showDraftPrompt = ref(false);

// Computed: resolved profile ID from all available sources
const resolvedProfileId = computed(() => {
  // Priority: props > injected > context service
  return props.profileData?.id
    || injectedProfileData.value?.id
    || contextProfileId.value
    || null;
});

// Keep selectedProfileId in sync with resolved ID
watch(resolvedProfileId, (newId) => {
  selectedProfileId.value = newId;
}, { immediate: true });

// Authority Hook Builder fields (reactive object for shared component)
const authorityHook = reactive({
  who: '',
  what: '',
  when: '',
  how: ''
});

/**
 * Computed: Live preview of authority hook
 */
const hookPreview = computed(() => {
  const who = authorityHook.who || '[WHO]';
  const what = authorityHook.what || '[WHAT]';
  const when = authorityHook.when || '[WHEN]';
  const how = authorityHook.how || '[HOW]';
  return `I help ${who} ${what} ${when} through ${how}.`;
});

/**
 * Computed: Generated authority hook summary
 */
const generatedHookSummary = computed(() => {
  if (!authorityHook.who && !authorityHook.what) return '';
  let summary = `I help ${authorityHook.who || ''} ${authorityHook.what || ''}`;
  if (authorityHook.when) summary += ` ${authorityHook.when}`;
  if (authorityHook.how) summary += ` through ${authorityHook.how}`;
  return summary.trim() + '.';
});

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return (expertise.value && expertise.value.trim().length > 0) ||
         (authorityHook.who && authorityHook.what);
});

/**
 * Form completion status for progress indicator
 */
const formCompletion = computed(() => {
  const fields = [
    { name: 'Expertise', filled: !!(expertise.value && expertise.value.trim()) },
    { name: 'Who you help', filled: !!authorityHook.who },
    { name: 'What you do', filled: !!authorityHook.what }
  ];
  const filledCount = fields.filter(f => f.filled).length;
  return {
    fields,
    filledCount,
    totalCount: fields.length,
    percentage: Math.round((filledCount / fields.length) * 100),
    isComplete: canGenerate.value
  };
});

/**
 * Check if user has entered any authority hook data
 */
const hasAuthorityHookData = computed(() => {
  return !!(authorityHook.who || authorityHook.what || authorityHook.when || authorityHook.how);
});

/**
 * Check if profile has any existing topics
 */
const hasCurrentTopics = computed(() => {
  return currentTopics.value.some(t => t.text);
});

/**
 * Get locked topics (topics user wants to keep)
 */
const lockedTopics = computed(() => {
  return currentTopics.value.filter(t => t.locked && t.text);
});

/**
 * Get number of available slots (unlocked positions)
 */
const availableSlots = computed(() => {
  return MAX_SELECTED_TOPICS - lockedTopics.value.length;
});

/**
 * Check if topic is selected
 */
const isSelected = (index) => selectedTopics.value.includes(index);

/**
 * Get the selection position (1-based) for a topic, or null if not selected
 */
const getSelectionPosition = (index) => {
  const position = selectedTopics.value.indexOf(index);
  return position > -1 ? position + 1 : null;
};

/**
 * Toggle topic selection (respects locked slots)
 */
const toggleSelection = (index) => {
  const idx = selectedTopics.value.indexOf(index);
  if (idx > -1) {
    selectedTopics.value.splice(idx, 1);
  } else if (selectedTopics.value.length < availableSlots.value) {
    selectedTopics.value.push(index);
  }
};

/**
 * Toggle lock status for a current topic
 */
const toggleLock = (position) => {
  const topic = currentTopics.value.find(t => t.position === position);
  if (topic) {
    topic.locked = !topic.locked;
    // If we're locking and have too many selected, deselect until within limit
    if (topic.locked) {
      while (selectedTopics.value.length > availableSlots.value) {
        selectedTopics.value.pop();
      }
    }
  }
};

/**
 * Populate from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;
  if (profileData.hook_who) authorityHook.who = profileData.hook_who;
  if (profileData.hook_what) authorityHook.what = profileData.hook_what;
  if (profileData.hook_when) authorityHook.when = profileData.hook_when;
  if (profileData.hook_how) authorityHook.how = profileData.hook_how;
  if (profileData.expertise) expertise.value = profileData.expertise;

  // Load existing topics with locked status (all locked by default)
  const loadedTopics = [];
  for (let i = 1; i <= MAX_SELECTED_TOPICS; i++) {
    const topicText = profileData[`topic_${i}`] || '';
    loadedTopics.push({
      position: i - 1,
      text: topicText,
      locked: !!topicText // Lock if has content
    });
  }
  currentTopics.value = loadedTopics;
}

/**
 * Check if a field was prefilled from profile
 */
function isFieldPrefilled(fieldName) {
  return prefilledFields.value.has(fieldName);
}

/**
 * Mark a field as edited (removes prefilled status)
 */
function markFieldEdited(fieldName) {
  prefilledFields.value.delete(fieldName);
}

/**
 * Get current form state for draft saving
 */
function getDraftState() {
  return {
    expertise: expertise.value,
    authorityHook: { ...authorityHook }
  };
}

/**
 * Restore form state from draft
 */
function restoreDraftState(draft) {
  if (draft.expertise) expertise.value = draft.expertise;
  if (draft.authorityHook) Object.assign(authorityHook, draft.authorityHook);
}

/**
 * Handle restore draft button click
 */
function handleRestoreDraft() {
  const draft = loadDraft();
  if (draft) {
    restoreDraftState(draft);
  }
  showDraftPrompt.value = false;
}

/**
 * Handle discard draft button click
 */
function handleDiscardDraft() {
  clearDraft();
  showDraftPrompt.value = false;
}

/**
 * Handle profile loaded with prefilled tracking
 */
function handleProfileLoadedWithTracking(profileData) {
  if (!profileData) return;

  // Track which fields are being prefilled
  const newPrefilledFields = new Set();

  if (profileData.expertise && !expertise.value) newPrefilledFields.add('expertise');
  if (profileData.hook_who && !authorityHook.who) newPrefilledFields.add('hook_who');
  if (profileData.hook_what && !authorityHook.what) newPrefilledFields.add('hook_what');
  if (profileData.hook_when && !authorityHook.when) newPrefilledFields.add('hook_when');
  if (profileData.hook_how && !authorityHook.how) newPrefilledFields.add('hook_how');

  prefilledFields.value = newPrefilledFields;
  populateFromProfile(profileData);
}

/**
 * Handle generate - exposed for parent to call
 */
const handleGenerate = async () => {
  selectedTopics.value = [];
  const contextText = expertise.value || generatedHookSummary.value;

  await generate({
    expertise: contextText,
    authorityHook: generatedHookSummary.value,
    count: 10
  });

  // Emit generated event for parent (EmbeddedToolApp) to handle
  emit('generated', { topics: topics.value });

  return { topics: topics.value };
};

/**
 * Handle regenerate
 */
const handleRegenerate = async () => {
  selectedTopics.value = [];
  await handleGenerate();
};

/**
 * Handle copy - copies selected topics (or all if none selected) as a user-friendly numbered list
 */
const handleCopyAll = async () => {
  // Determine which topics to copy: selected ones if any, otherwise all
  const topicsToUse = selectedTopics.value.length > 0
    ? selectedTopics.value.map(idx => topics.value[idx])
    : topics.value;

  // Format as numbered list (user-friendly, not JSON)
  const formattedText = topicsToUse
    .map((topic, index) => {
      const text = typeof topic === 'string' ? topic : topic.title || topic;
      return `${index + 1}. ${text}`;
    })
    .join('\n');

  try {
    await navigator.clipboard.writeText(formattedText);
  } catch (err) {
    console.error('[Topics Generator] Failed to copy:', err);
  }
};

/**
 * Copy a single topic to clipboard
 */
const handleCopySingleTopic = async (index, event) => {
  // Prevent triggering the card/row selection
  event.stopPropagation();

  const topic = topics.value[index];
  const text = typeof topic === 'string' ? topic : topic.title || topic;

  try {
    await navigator.clipboard.writeText(text);
    // Show visual feedback
    copiedIndex.value = index;
    setTimeout(() => {
      copiedIndex.value = null;
    }, 1500);
  } catch (err) {
    console.error('[Topics Generator] Failed to copy topic:', err);
  }
};

/**
 * Handle save to media kit - saves topics and optionally authority hook
 * Merges locked topics with newly selected topics
 */
const handleSaveToMediaKit = async () => {
  // Build final topics array: locked topics in their positions + new selections in unlocked slots
  const finalTopics = [];

  // First, place locked topics in their positions
  const lockedByPosition = {};
  lockedTopics.value.forEach(t => {
    lockedByPosition[t.position] = t.text;
  });

  // Get new selections
  const newSelections = selectedTopics.value.map(idx => {
    const topic = topics.value[idx];
    return typeof topic === 'string' ? topic : topic.title || topic;
  });

  // Build final array: locked topics stay in position, new ones fill gaps
  let newSelectionIndex = 0;
  for (let i = 0; i < MAX_SELECTED_TOPICS; i++) {
    if (lockedByPosition[i]) {
      finalTopics.push(lockedByPosition[i]);
    } else if (newSelectionIndex < newSelections.length) {
      finalTopics.push(newSelections[newSelectionIndex]);
      newSelectionIndex++;
    } else {
      finalTopics.push(''); // Empty slot
    }
  }

  try {
    // Save topics - saveToProfile will throw if no profile ID
    const topicsResult = await saveToProfile('topics', finalTopics, {
      profileId: selectedProfileId.value
    });

    // Save authority hook only if checkbox is checked and we have data
    let hookResult = { success: true };
    if (saveAuthorityHook.value && hasAuthorityHookData.value) {
      hookResult = await saveToProfile('authority_hook', {
        who: authorityHook.who,
        what: authorityHook.what,
        when: authorityHook.when,
        how: authorityHook.how,
        summary: generatedHookSummary.value
      }, {
        profileId: selectedProfileId.value
      });
    }

    // Only show success if both operations succeeded
    if (topicsResult.success && hookResult.success) {
      saveSuccess.value = true;
      setTimeout(() => { saveSuccess.value = false; }, 3000);

      // Update currentTopics to reflect saved state (all now locked)
      currentTopics.value = finalTopics.map((text, idx) => ({
        position: idx,
        text: text,
        locked: !!text
      }));

      // Clear selections since they're now saved
      selectedTopics.value = [];

      emit('saved', {
        profileId: selectedProfileId.value,
        topics: finalTopics,
        authorityHookSaved: saveAuthorityHook.value && hasAuthorityHookData.value && hookResult.success
      });
    }
  } catch (err) {
    console.error('[Topics Generator] Save failed:', err);
    // saveError is automatically set by useProfileContext
  }
};

/**
 * Handle start over - reset and show form
 */
const handleStartOver = () => {
  selectedTopics.value = [];
  if (reset) {
    reset();
  }
};

/**
 * Get the text of the first selected topic (for cross-tool navigation)
 */
const getFirstSelectedTopicText = () => {
  if (selectedTopics.value.length === 0) return '';
  const firstIndex = selectedTopics.value[0];
  const topic = topics.value[firstIndex];
  return typeof topic === 'string' ? topic : topic.title || topic;
};

// Watch for canGenerate changes
watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
}, { immediate: true });

// Watch authority hook changes
watch(
  authorityHook,
  () => {
    emit('authority-hook-update', {
      who: authorityHook.who,
      what: authorityHook.what,
      when: authorityHook.when,
      how: authorityHook.how,
      summary: generatedHookSummary.value
    });
  },
  { deep: true }
);

// Watch profile data from both props and inject
watch(
  [() => props.profileData, injectedProfileData],
  ([propsData, injectedData]) => {
    const data = propsData || injectedData;
    if (data) handleProfileLoadedWithTracking(data);
  },
  { immediate: true }
);

/**
 * Keyboard shortcut handler (Ctrl/Cmd + Enter to generate)
 */
const handleKeyboardShortcut = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    if (canGenerate.value && !isGenerating.value && !hasTopics.value) {
      event.preventDefault();
      handleGenerate();
    }
  }
};

/**
 * Initialize on mount
 */
onMounted(() => {
  // Check for saved draft on mount
  if (hasDraft.value) {
    showDraftPrompt.value = true;
  }

  // Start auto-save
  startAutoSave(getDraftState);

  // Add keyboard shortcut listener
  window.addEventListener('keydown', handleKeyboardShortcut);
});

/**
 * Cleanup on unmount
 */
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardShortcut);
});

// Expose for parent
defineExpose({
  handleGenerate,
  topics,
  hasTopics,
  isGenerating,
  error,
  copyToClipboard
});
</script>

<style scoped>
.gfy-topics-generator {
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
  --gfy-radius-md: 6px;
  --gfy-radius-lg: 12px;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* CURRENT TOPICS (Lock/Pin Feature) */
.gfy-current-topics {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.gfy-current-topics__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.gfy-current-topics__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-current-topics__hint {
  font-size: 0.8rem;
  color: var(--gfy-text-muted);
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
  background: var(--gfy-bg-color);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  transition: all 0.15s ease;
}

.gfy-current-topic--locked {
  background: var(--gfy-primary-light);
  border-color: var(--gfy-primary-color);
}

.gfy-current-topic--empty {
  opacity: 0.5;
}

.gfy-current-topic__position {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  background: var(--gfy-white);
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
  color: var(--gfy-white);
}

.gfy-current-topic__text {
  flex: 1;
  font-size: 0.9rem;
  color: var(--gfy-text-primary);
}

.gfy-current-topic--empty .gfy-current-topic__text {
  font-style: italic;
  color: var(--gfy-text-muted);
}

.gfy-current-topic__lock {
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: transparent;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  cursor: pointer;
  color: var(--gfy-text-muted);
  transition: all 0.15s ease;
}

.gfy-current-topic__lock:hover {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-current-topic--locked .gfy-current-topic__lock {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-current-topic--locked .gfy-current-topic__lock:hover {
  background: var(--gfy-primary-dark);
}

.gfy-current-topic__lock i {
  font-size: 14px;
}

.gfy-current-topics__summary {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 1rem;
  padding-top: 0.75rem;
  border-top: 1px solid var(--gfy-border-color);
  font-size: 0.85rem;
}

.gfy-current-topics__locked-count {
  color: var(--gfy-primary-color);
  font-weight: 600;
}

.gfy-current-topics__available {
  color: var(--gfy-text-secondary);
}

/* INPUT STYLES */
.gfy-input-group {
  margin-bottom: 1.5rem;
}

.gfy-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--gfy-text-primary);
}

.gfy-textarea {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-family: inherit;
  font-size: 0.95rem;
  background: var(--gfy-white);
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.gfy-textarea:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-textarea::placeholder {
  color: var(--gfy-text-muted);
}

.gfy-char-count {
  font-size: 0.75rem;
  color: var(--gfy-text-muted, #94a3b8);
  text-align: right;
  margin-top: 4px;
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
  gap: 1rem;
}

.gfy-builder__field {
  margin-bottom: 0.5rem;
}

.gfy-builder__label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--gfy-text-secondary);
  margin-bottom: 0.4rem;
}

.gfy-builder__input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: var(--gfy-radius-md);
  font-size: 0.9rem;
  background: #ffffff;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-builder__input:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  background: #ffffff;
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-builder__input::placeholder {
  color: var(--gfy-text-muted);
}

/* LIVE PREVIEW */
.gfy-live-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--gfy-primary-light);
  border-radius: var(--gfy-radius-md);
  border: 1px solid #bfdbfe;
  color: var(--gfy-primary-dark);
  font-size: 0.95rem;
  font-style: italic;
  text-align: center;
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

/* Desktop: side-by-side */
@media (min-width: 900px) {
  .gfy-results-layout {
    flex-direction: row;
    align-items: flex-start;
  }

  .gfy-layout-sidebar {
    position: sticky;
    top: 1rem;
    flex: 0 0 280px;
  }

  .gfy-layout-main {
    flex: 1;
    min-width: 0;
  }

  /* Adjust grid columns for narrower main area */
  .gfy-layout-main .gfy-topics-grid {
    grid-template-columns: repeat(auto-fill, minmax(220px, 1fr));
  }

  /* Stack header vertically when sidebar is present */
  .gfy-layout-main .gfy-results__header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* Sidebar panel styling */
.gfy-layout-sidebar .gfy-current-topics {
  background: var(--gfy-bg-secondary, #f8fafc);
  border: 1px solid var(--gfy-border-color, #e2e8f0);
  border-radius: var(--gfy-radius-lg, 12px);
  padding: 1rem;
  margin-bottom: 0;
}

.gfy-layout-sidebar .gfy-current-topic {
  background: white;
  font-size: 0.875rem;
  padding: 0.5rem 0.75rem;
  margin-bottom: 0.5rem;
  border-radius: var(--gfy-radius-md, 8px);
}

.gfy-layout-sidebar .gfy-current-topics__header {
  margin-bottom: 0.75rem;
}

.gfy-layout-sidebar .gfy-current-topics__title {
  font-size: 0.875rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gfy-text-secondary, #64748b);
}

.gfy-layout-sidebar .gfy-current-topics__hint {
  font-size: 0.75rem;
}

.gfy-layout-sidebar .gfy-current-topics__summary {
  margin-top: 0.75rem;
  padding-top: 0.75rem;
  font-size: 0.8rem;
}

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
  color: var(--gfy-text-primary);
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
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* VIEW TOGGLE */
.gfy-view-toggle {
  display: flex;
  background: var(--gfy-bg-color, #f8fafc);
  border: 1px solid var(--gfy-border-color, #e2e8f0);
  border-radius: var(--gfy-radius-md, 6px);
  padding: 3px;
}

.gfy-view-toggle__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: transparent;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: var(--gfy-text-muted, #94a3b8);
  transition: all 0.15s ease;
}

.gfy-view-toggle__btn i {
  font-size: 14px;
}

.gfy-view-toggle__btn:hover:not(.gfy-view-toggle__btn--active) {
  color: var(--gfy-text-secondary, #64748b);
  background: rgba(0, 0, 0, 0.04);
}

.gfy-view-toggle__btn--active {
  background: var(--gfy-white, #ffffff);
  color: var(--gfy-primary-color, #2563eb);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
}

/* SELECTION BANNER */
.gfy-selection-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--gfy-primary-light);
  border: 1px solid #bfdbfe;
  border-radius: var(--gfy-radius-md);
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.gfy-selection-banner__text {
  font-size: 0.9rem;
  color: var(--gfy-text-secondary);
}

.gfy-selection-banner__count {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gfy-primary-color);
}

/* TOPICS GRID - exactly 2 columns on desktop */
.gfy-topics-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.gfy-topic-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--gfy-white);
  border: 2px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gfy-topic-card:hover {
  border-color: var(--gfy-primary-color);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
}

.gfy-topic-card--selected {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-topic-card__number {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  background: var(--gfy-bg-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gfy-text-secondary);
}

.gfy-topic-card--selected .gfy-topic-card__number {
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-topic-card__content {
  flex: 1;
  min-width: 0;
}

.gfy-topic-card__category {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.4rem;
}

.gfy-topic-card__title {
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-topic-card__checkbox {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: 2px solid var(--gfy-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gfy-white);
}

.gfy-topic-card--selected .gfy-topic-card__checkbox {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-white);
}

/* TOPICS LIST VIEW */
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
  padding: 0.875rem 1rem;
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
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 2px solid var(--gfy-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gfy-white);
}

.gfy-topic-row--selected .gfy-topic-row__checkbox {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-topic-row__number {
  flex-shrink: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gfy-text-secondary);
  min-width: 24px;
}

.gfy-topic-row__title {
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.4;
  color: var(--gfy-text-primary);
  margin: 0;
}

/* POSITION BADGE */
.gfy-position-badge {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  font-size: 0.85rem;
  font-weight: 700;
  color: var(--gfy-white);
}

.gfy-position-badge--small {
  font-size: 0.75rem;
}

/* BUTTONS */
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
  border: none;
  white-space: nowrap;
}

.gfy-btn svg {
  flex-shrink: 0;
  display: inline-block;
  vertical-align: middle;
  width: 16px;
  height: 16px;
  stroke: currentColor;
  stroke-width: 2;
}

.gfy-btn--outline {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  color: var(--gfy-text-secondary);
}

.gfy-btn--outline:hover {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
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

.gfy-btn--large {
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
}

.gfy-btn--text {
  background: transparent;
  color: var(--gfy-text-secondary);
  padding: 0.6rem 1rem;
}

.gfy-btn--text:hover {
  color: var(--gfy-text-primary);
}

/* RESULTS FOOTER */
.gfy-results__footer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gfy-border-color);
}

/* CHECKBOX OPTION */
.gfy-checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.gfy-checkbox-option__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.gfy-checkbox-option__box {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border: 2px solid var(--gfy-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gfy-white);
  transition: all 0.15s ease;
}

.gfy-checkbox-option__input:checked + .gfy-checkbox-option__box {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-checkbox-option__input:focus + .gfy-checkbox-option__box {
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-checkbox-option__label {
  font-size: 0.9rem;
  color: var(--gfy-text-secondary);
}

.gfy-save-section {
  display: flex;
  align-items: center;
  gap: 1rem;
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

/* Cross-tool Navigation */
.gfy-cross-tool-nav {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--gfy-border-color);
}

.gfy-cross-tool-nav__label {
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gfy-text-secondary);
}

.gfy-cross-tool-nav__link {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: var(--gfy-primary-light);
  border: 1px solid var(--gfy-primary-color);
  border-radius: var(--gfy-radius-md);
  color: var(--gfy-primary-color);
  font-size: 0.9rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.15s ease;
}

.gfy-cross-tool-nav__link:hover {
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-cross-tool-nav__link svg {
  flex-shrink: 0;
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

  .gfy-topics-grid {
    grid-template-columns: 1fr;
  }

  .gfy-results__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .gfy-selection-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}

/* ===========================================
   ENHANCED UX FEATURES
   =========================================== */

/* Draft Restore Prompt */
.gfy-draft-prompt {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #93c5fd;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.gfy-draft-prompt__content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.gfy-draft-prompt__content svg {
  flex-shrink: 0;
  color: var(--gfy-primary-color);
  margin-top: 2px;
}

.gfy-draft-prompt__content strong {
  display: block;
  font-size: 0.9375rem;
  color: var(--gfy-text-primary);
  margin-bottom: 0.25rem;
}

.gfy-draft-prompt__content p {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--gfy-text-secondary);
}

.gfy-draft-prompt__actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 2rem;
}

/* Auto-save Indicator */
.gfy-auto-save-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--gfy-bg-color);
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--gfy-text-secondary);
  margin-bottom: 1rem;
}

.gfy-auto-save-indicator svg {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Form Progress Indicator */
.gfy-form-progress {
  padding: 12px 16px;
  background: var(--gfy-bg-secondary, #f8fafc);
  border: 1px solid var(--gfy-border-color, #e2e8f0);
  border-radius: 8px;
  margin-bottom: 1.5rem;
}

.gfy-form-progress--complete {
  background: #ecfdf5;
  border-color: #a7f3d0;
}

.gfy-form-progress__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.gfy-form-progress__label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--gfy-text-secondary, #64748b);
}

.gfy-form-progress--complete .gfy-form-progress__label {
  color: #059669;
}

.gfy-form-progress__bar {
  height: 6px;
  background: var(--gfy-border-color, #e2e8f0);
  border-radius: 3px;
  overflow: hidden;
}

.gfy-form-progress__fill {
  height: 100%;
  background: var(--gfy-primary-color, #2563eb);
  border-radius: 3px;
  transition: width 0.3s ease;
}

.gfy-form-progress--complete .gfy-form-progress__fill {
  background: #10b981;
}

/* Prefilled Badge */
.gfy-prefilled-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: rgba(37, 99, 235, 0.1);
  color: var(--gfy-primary-color);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-radius: 4px;
  margin-left: 8px;
}

/* Prefilled Textarea State */
.gfy-textarea--prefilled {
  border-color: rgba(37, 99, 235, 0.3);
  background: rgba(37, 99, 235, 0.02);
}

/* Small button variant */
.gfy-btn--small {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
}

/* Copy Button for Individual Items */
.gfy-copy-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: var(--gfy-white, #ffffff);
  border: 1px solid var(--gfy-border-color, #e2e8f0);
  border-radius: 6px;
  color: var(--gfy-text-muted, #94a3b8);
  cursor: pointer;
  transition: all 0.15s ease;
  flex-shrink: 0;
}

.gfy-copy-btn:hover {
  border-color: var(--gfy-primary-color, #2563eb);
  color: var(--gfy-primary-color, #2563eb);
  background: var(--gfy-primary-light, #eff6ff);
}

.gfy-copy-btn--copied {
  border-color: #10b981;
  color: #10b981;
  background: #ecfdf5;
}

.gfy-copy-btn--small {
  width: 28px;
  height: 28px;
}

/* Topic Card Actions Container */
.gfy-topic-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
  flex-shrink: 0;
}

/* Loading Skeleton Styles */
.gfy-skeleton-results {
  padding: 1.5rem;
  background: var(--gfy-white, #ffffff);
  border: 1px solid var(--gfy-border-color, #e2e8f0);
  border-radius: var(--gfy-radius-lg, 12px);
}

.gfy-skeleton-header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.5rem;
}

.gfy-skeleton-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: 1rem;
}

.gfy-skeleton-card {
  padding: 1rem;
  background: var(--gfy-bg-secondary, #f8fafc);
  border-radius: 8px;
}

.gfy-skeleton {
  background: linear-gradient(90deg, #e2e8f0 25%, #f1f5f9 50%, #e2e8f0 75%);
  background-size: 200% 100%;
  animation: skeleton-shimmer 1.5s infinite;
  border-radius: 4px;
}

.gfy-skeleton--text {
  height: 16px;
}

.gfy-skeleton--title {
  width: 150px;
  height: 24px;
}

.gfy-skeleton--badge {
  width: 80px;
  height: 20px;
}

.gfy-skeleton--line {
  width: 100%;
  margin-bottom: 8px;
}

.gfy-skeleton--short {
  width: 60%;
}

@keyframes skeleton-shimmer {
  0% { background-position: 200% 0; }
  100% { background-position: -200% 0; }
}
</style>
