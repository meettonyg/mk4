<template>
  <!-- Standalone Mode: Single column layout -->
  <div
    v-if="mode === 'standalone'"
    class="generator__container gmkb-generator-root topics-generator"
  >
    <!-- Header -->
    <div class="generator__header">
      <h1 class="generator__title">Speaking Topics Generator</h1>
      <p class="generator__subtitle">Generate compelling interview and speaking topics that showcase your expertise</p>
    </div>

    <!-- Main Content Area - Single Column -->
    <div class="generator__content generator__content--single">
      <!-- Form Panel -->
      <div class="generator__panel generator__panel--full">
        <!-- Intro Text -->
        <p class="generator__intro">
          Generate 10 compelling speaking and interview topics based on your expertise and authority hook.
          Each topic will be designed to position you as a thought leader, showcase your unique perspective,
          and attract the right audiences for podcasts, interviews, and speaking engagements.
        </p>

        <!-- Profile Selector (standalone mode only) -->
        <div v-if="showProfileSelector" class="generator__section">
          <ProfileSelector
            v-model="selectedProfileId"
            mode="dropdown"
            label="Save to Profile"
            placeholder="Select a profile to save topics to..."
            :show-current-profile="true"
            @select="handleProfileSelect"
          />
        </div>

        <!-- Authority Hook Section (collapsible) -->
        <AuthorityHookSection
          :hook-text="authorityHookSummary"
          :components="authorityHook"
          :show-badge="false"
          :initially-open="isBuilderOpen"
          @update:components="handleAuthorityHookUpdate"
          @toggle="(open) => isBuilderOpen = open"
        />

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
            {{ isGenerating ? 'Generating...' : 'Generate 10 Topics with AI' }}
          </button>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="generator__error">
          <p>{{ error }}</p>
          <button type="button" class="generator__button generator__button--outline" @click="handleGenerate">
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="hasTopics" class="gfy-results is-visible" id="resultsSection">
      <div class="gfy-results__header">
        <div class="gfy-results__header-left">
          <h2 class="gfy-results__title">Generated Topics</h2>
          <span class="gfy-results__badge">{{ topics.length }} Ideas</span>
        </div>
        <div class="gfy-results__header-right">
          <div class="gfy-view-toggle">
            <button
              class="gfy-view-toggle__btn"
              :class="{ 'is-active': viewMode === 'grid' }"
              @click="setViewMode('grid')"
              title="Grid View"
            >
              <i class="fa-solid fa-grid-2"></i>
            </button>
            <button
              class="gfy-view-toggle__btn"
              :class="{ 'is-active': viewMode === 'list' }"
              @click="setViewMode('list')"
              title="List View"
            >
              <i class="fa-solid fa-list"></i>
            </button>
          </div>
          <button class="gfy-btn gfy-btn-secondary" @click="copySelectedTopics">
            <i class="fa-regular fa-copy"></i>
            Copy Selected
          </button>
        </div>
      </div>

      <!-- Selection Banner -->
      <div class="gfy-selection-banner">
        <div class="gfy-selection-banner__text">
          <div class="gfy-selection-banner__icon">
            <i class="fa-solid fa-hand-pointer"></i>
          </div>
          <div>
            <div class="gfy-selection-banner__label">
              Select <span class="gfy-selection-banner__count">5 topics</span> to save to your Media Kit
            </div>
            <div class="gfy-selection-banner__label" style="margin-top: 4px;">
              <span id="selectionCount">{{ selectedTopics.size }}</span> of 5 selected
            </div>
          </div>
        </div>
        <button
          class="gfy-btn gfy-btn-success"
          @click="handleSaveToProfile"
          :disabled="selectedTopics.size === 0 || isSaving || !selectedProfileId"
        >
          <i class="fa-solid fa-bookmark"></i>
          Save to Media Kit
        </button>
      </div>

      <!-- Save Authority Hook Checkbox -->
      <label v-if="authorityHookSummary && showSaveToProfile" class="gfy-authority-hook-checkbox">
        <input
          type="checkbox"
          v-model="saveAuthorityHookToProfile"
        />
        <span>Also save Authority Hook to profile</span>
      </label>

      <!-- Topics Container -->
      <div
        class="gfy-topics"
        :class="viewMode === 'grid' ? 'gfy-topics--grid' : 'gfy-topics--list'"
        id="topicsContainer"
      >
        <div
          v-for="(topic, index) in topics"
          :key="index"
          class="gfy-topic-card"
          :class="{ 'is-selected': selectedTopics.has(index) }"
          @click="toggleTopicSelect(index)"
          :data-topic="index + 1"
        >
          <div class="gfy-topic-card__header">
            <div class="gfy-topic-card__number">{{ index + 1 }}</div>
            <div class="gfy-topic-card__checkbox">
              <i class="fa-solid fa-check"></i>
            </div>
          </div>
          <div class="gfy-topic-card__body">
            <span class="gfy-topic-card__category">{{ getTopicCategory(topic) }}</span>
            <h3 class="gfy-topic-card__title">{{ getTopicTitle(topic) }}</h3>
          </div>
        </div>
      </div>

      <!-- Status Messages -->
      <div v-if="!selectedProfileId && showSaveToProfile" class="gfy-status-message gfy-status-message--info">
        <i class="fa-solid fa-info-circle"></i>
        Select a profile above to enable saving
      </div>
      <div v-if="saveSuccess" class="gfy-status-message gfy-status-message--success">
        <i class="fa-solid fa-check-circle"></i>
        Saved successfully!
      </div>
      <div v-if="saveError" class="gfy-status-message gfy-status-message--error">
        <i class="fa-solid fa-exclamation-circle"></i>
        {{ saveError }}
      </div>

      <!-- Testimonial -->
      <div class="gfy-testimonial">
        <div class="gfy-testimonial__stars">
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
          <i class="fa-solid fa-star"></i>
        </div>
        <p class="gfy-testimonial__quote">
          "Generated 10 topic ideas in 30 seconds. Three of them got me booked on podcasts within the week."
        </p>
        <p class="gfy-testimonial__author">David K., Leadership Speaker</p>
      </div>
    </div>
  </div>

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else-if="mode === 'integrated'"
    title="Speaking Topics Generator"
    description="Generate compelling interview and speaking topics that showcase your expertise."
    :mode="mode"
    :is-loading="isGenerating || isSaving"
    :has-results="hasTopics"
    :error="error || saveError"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Topics"
    :show-cta="!hasTopics"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Profile Selector (standalone mode only) -->
    <div v-if="showProfileSelector" class="gmkb-ai-profile-selector">
      <ProfileSelector
        v-model="selectedProfileId"
        mode="dropdown"
        label="Save to Profile"
        placeholder="Select a profile to save topics to..."
        :show-current-profile="true"
        @select="handleProfileSelect"
      />
    </div>

    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Authority Hook Section (collapsible) -->
      <AuthorityHookSection
        :hook-text="authorityHookSummary"
        :components="authorityHook"
        :show-badge="false"
        :initially-open="isBuilderOpen"
        @update:components="handleAuthorityHookUpdate"
        @toggle="(open) => isBuilderOpen = open"
      />

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate 10 Topics"
        loading-text="Generating topics..."
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <AiResultsDisplay
        v-if="topics.length > 0"
        :content="topics"
        format="cards"
        :selected-index="selectedTopicIndex"
        @select="handleSelectTopic"
      />

      <!-- Save to Profile Button (standalone mode) -->
      <div v-if="hasTopics && showSaveToProfile" class="gmkb-ai-save-actions">
        <button
          type="button"
          class="gmkb-ai-btn gmkb-ai-btn--primary"
          :disabled="!canSaveToProfile || isSaving"
          @click="handleSaveToProfile"
        >
          <span v-if="isSaving" class="gmkb-ai-btn__spinner"></span>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          {{ isSaving ? 'Saving...' : 'Save to Profile' }}
        </button>
        <span v-if="!selectedProfileId" class="gmkb-ai-save-hint">
          Select a profile above to enable saving
        </span>
        <span v-if="saveSuccess" class="gmkb-ai-save-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Saved successfully!
        </span>
      </div>
    </template>
  </AiWidgetFrame>

  <!-- Embedded Mode: Landing page form (simplified, used with EmbeddedToolWrapper) -->
  <div v-else class="gmkb-embedded-form" :class="{ 'has-results': showResults }">
    <!-- Form Section (hidden after generation) -->
    <div v-if="showForm || !hasTopics" class="gmkb-embedded-fields">
      <!-- Authority Hook Section (collapsible) -->
      <AuthorityHookSection
        :hook-text="authorityHookSummary"
        :components="authorityHook"
        :show-badge="false"
        :initially-open="false"
        @update:components="handleAuthorityHookUpdate"
        @toggle="(open) => isBuilderOpen = open"
      />
    </div>

    <!-- Compact Controls (shown after generation) -->
    <div v-if="showResults" class="gfy-compact-controls">
      <div class="gfy-compact-input-wrapper">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <circle cx="11" cy="11" r="8"></circle>
          <path d="M21 21l-4.35-4.35"></path>
        </svg>
        <input
          type="text"
          class="gfy-compact-input"
          :value="authorityHookSummary?.substring(0, 50) + '...'"
          readonly
        />
      </div>
      <button
        class="gfy-btn gfy-btn-primary"
        :disabled="isGenerating"
        @click="handleGenerate"
      >
        <svg v-if="!isGenerating" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M23 4v6h-6M1 20v-6h6M20.49 9A9 9 0 0 0 5.64 5.64L1 10m22 4l-4.64 4.36A9 9 0 0 1 3.51 15"></path>
        </svg>
        {{ isGenerating ? 'Generating...' : 'Regenerate' }}
      </button>
      <button class="gfy-btn gfy-btn-secondary" @click="resetToForm">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
        Edit
      </button>
    </div>

    <div v-if="error" class="gmkb-embedded-error">{{ error }}</div>
  </div>

  <!-- Results Section (embedded mode - renders outside form for full width) -->
  <div v-if="mode === 'embedded' && showResults" class="gfy-results gfy-results--embedded is-visible">
    <div class="gfy-results__header">
      <div class="gfy-results__header-left">
        <h2 class="gfy-results__title">Generated Topics</h2>
        <span class="gfy-results__badge">{{ topics.length }} Ideas</span>
      </div>
      <div class="gfy-results__header-right">
        <div class="gfy-view-toggle">
          <button
            class="gfy-view-toggle__btn"
            :class="{ 'is-active': viewMode === 'grid' }"
            @click.stop="viewMode = 'grid'"
            title="Grid View"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
            </svg>
          </button>
          <button
            class="gfy-view-toggle__btn"
            :class="{ 'is-active': viewMode === 'list' }"
            @click.stop="viewMode = 'list'"
            title="List View"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <rect x="3" y="4" width="18" height="4" rx="1"></rect>
              <rect x="3" y="10" width="18" height="4" rx="1"></rect>
              <rect x="3" y="16" width="18" height="4" rx="1"></rect>
            </svg>
          </button>
        </div>
        <button class="gfy-btn gfy-btn-secondary" @click="copySelectedTopics">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
          Copy Selected
        </button>
      </div>
    </div>

    <!-- Selection Banner -->
    <div class="gfy-selection-banner">
      <div class="gfy-selection-banner__text">
        <div class="gfy-selection-banner__icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M7 2v11h3v9l7-12h-4l4-8z"></path>
          </svg>
        </div>
        <div>
          <div class="gfy-selection-banner__label">
            Select <span class="gfy-selection-banner__count">5 topics</span> to save to your Media Kit
          </div>
          <div class="gfy-selection-banner__label" style="margin-top: 4px;">
            {{ selectedTopics.size }} of 5 selected
          </div>
        </div>
      </div>
      <button
        class="gfy-btn gfy-btn-success"
        @click="handleEmbeddedSave"
        :disabled="selectedTopics.size === 0 || isSaving"
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
          <path d="M19 21l-7-5-7 5V5a2 2 0 0 1 2-2h10a2 2 0 0 1 2 2z"></path>
        </svg>
        Save to Media Kit
      </button>
    </div>

    <!-- Save Authority Hook Checkbox -->
    <label v-if="authorityHookSummary" class="gfy-authority-hook-checkbox">
      <input
        type="checkbox"
        v-model="saveAuthorityHookToProfile"
      />
      <span>Also save Authority Hook to profile</span>
    </label>

    <!-- Topics Container -->
    <div
      class="gfy-topics"
      :class="viewMode === 'grid' ? 'gfy-topics--grid' : 'gfy-topics--list'"
    >
      <div
        v-for="(topic, index) in topics"
        :key="index"
        class="gfy-topic-card"
        :class="{
          'is-selected': selectedTopics.has(index),
          'is-disabled': selectedTopics.size >= 5 && !selectedTopics.has(index),
          'is-editing': editingTopicIndex === index
        }"
        @click="handleTopicCardClick(index, $event)"
      >
        <div class="gfy-topic-card__header">
          <div class="gfy-topic-card__number">{{ index + 1 }}</div>
          <div class="gfy-topic-card__actions">
            <button
              v-if="editingTopicIndex !== index"
              class="gfy-topic-card__edit-btn"
              @click.stop="startEditingTopic(index)"
              title="Edit topic"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
              </svg>
            </button>
            <div class="gfy-topic-card__checkbox">
              <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <polyline points="20 6 9 17 4 12" stroke="currentColor" stroke-width="3" fill="none"></polyline>
              </svg>
            </div>
          </div>
        </div>
        <div class="gfy-topic-card__body">
          <span class="gfy-topic-card__category">{{ getTopicCategory(topic) }}</span>
          <!-- Editing mode -->
          <div v-if="editingTopicIndex === index" class="gfy-topic-card__edit-form" @click.stop>
            <textarea
              ref="editTextarea"
              v-model="editingTopicText"
              class="gfy-topic-card__edit-input"
              rows="3"
              @keydown.enter.prevent="saveTopicEdit(index)"
              @keydown.escape="cancelTopicEdit"
            ></textarea>
            <div class="gfy-topic-card__edit-actions">
              <button class="gfy-btn gfy-btn-sm gfy-btn-primary" @click.stop="saveTopicEdit(index)">
                Save
              </button>
              <button class="gfy-btn gfy-btn-sm gfy-btn-secondary" @click.stop="cancelTopicEdit">
                Cancel
              </button>
            </div>
          </div>
          <!-- Display mode -->
          <h3 v-else class="gfy-topic-card__title">{{ getEditedTopicTitle(index, topic) }}</h3>
        </div>
      </div>
    </div>

    <!-- Status Messages -->
    <div v-if="saveSuccess" class="gfy-status-message gfy-status-message--success">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
        <polyline points="22 4 12 14.01 9 11.01" stroke="currentColor" stroke-width="2" fill="none"></polyline>
      </svg>
      Saved successfully!
    </div>
    <div v-if="saveError" class="gfy-status-message gfy-status-message--error">
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12" stroke="white" stroke-width="2"></line>
        <line x1="12" y1="16" x2="12.01" y2="16" stroke="white" stroke-width="2"></line>
      </svg>
      {{ saveError }}
    </div>

    <!-- Testimonial -->
    <div class="gfy-testimonial">
      <div class="gfy-testimonial__stars">★★★★★</div>
      <p class="gfy-testimonial__quote">
        "Generated 10 topic ideas in 30 seconds. Three of them got me booked on podcasts within the week."
      </p>
      <p class="gfy-testimonial__author">David K., Leadership Speaker</p>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject, nextTick } from 'vue';
import { useAITopics } from '../../src/composables/useAITopics';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';
import { useProfileContext } from '../../src/composables/useProfileContext';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';
import ProfileSelector from '../../src/vue/components/shared/ProfileSelector.vue';

// Full layout components (standalone mode)
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared';
import AuthorityHookSection from '../_shared/AuthorityHookSection.vue';

const props = defineProps({
  /**
   * Mode: 'integrated' or 'standalone'
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
   * Intent configuration (embedded mode)
   */
  intent: {
    type: Object,
    default: null
  },

  /**
   * Profile data (embedded mode)
   */
  profileData: {
    type: Object,
    default: null
  },

  /**
   * Pre-selected profile ID (optional)
   */
  profileId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated', 'saved', 'preview-update', 'update:can-generate', 'authority-hook-update']);

// Use composables
const {
  isGenerating,
  error,
  usageRemaining,
  resetTime,
  topics,
  hasTopics,
  generate,
  copyToClipboard
} = useAITopics();

const {
  authorityHook,
  authorityHookSummary,
  setAll,
  syncFromStore,
  loadFromProfileData
} = useAuthorityHook();

// Profile context integration
const {
  profileId: contextProfileId,
  isInBuilder,
  isSaving,
  saveError,
  saveToProfile,
  saveToComponent
} = useProfileContext();

// Local state
const expertise = ref('');
const selectedTopicIndex = ref(-1);
const selectedProfileId = ref(props.profileId || null);
const saveSuccess = ref(false);
const isBuilderOpen = ref(false);
const saveAuthorityHookToProfile = ref(true); // Default to saving authority hook
const viewMode = ref('grid'); // 'grid' or 'list'
const selectedTopics = ref(new Set()); // Set of selected topic indices
const showForm = ref(true); // Controls form vs results view in embedded mode
const editingTopicIndex = ref(-1); // Which topic is being edited (-1 = none)
const editingTopicText = ref(''); // Current text in edit textarea
const editedTopics = ref(new Map()); // Map of index -> edited title
const editTextarea = ref(null); // Ref for textarea element

/**
 * Computed: show results in embedded mode
 */
const showResults = computed(() => !showForm.value && hasTopics.value);

/**
 * Reset to form view (Edit button handler)
 */
const resetToForm = () => {
  showForm.value = true;
  selectedTopics.value = new Set();
};

/**
 * Handle authority hook component updates from AuthorityHookSection
 */
const handleAuthorityHookUpdate = (components) => {
  setAll(components);
};

// Inject profile data from EmbeddedToolWrapper (for embedded mode)
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Populate expertise from hook_what or expertise field
  if (profileData.hook_what && !expertise.value) {
    expertise.value = profileData.hook_what;
  }

  // Populate authority hook fields from profile data
  loadFromProfileData(profileData);
}

/**
 * Show profile selector in standalone mode when not in builder
 */
const showProfileSelector = computed(() => {
  return props.mode === 'standalone' && !isInBuilder.value;
});

/**
 * Show save to profile button
 */
const showSaveToProfile = computed(() => {
  return props.mode === 'standalone' && !isInBuilder.value;
});

/**
 * Can save to profile check
 */
const canSaveToProfile = computed(() => {
  return selectedProfileId.value && hasTopics.value && !isSaving.value && selectedTopics.value.size > 0;
});

/**
 * Can generate check - authority hook must have content
 */
const canGenerate = computed(() => {
  return authorityHookSummary.value && authorityHookSummary.value.trim().length > 0;
});

/**
 * Set view mode
 */
const setViewMode = (mode) => {
  viewMode.value = mode;
};

/**
 * Toggle topic selection
 */
const toggleTopicSelect = (index) => {
  if (selectedTopics.value.has(index)) {
    selectedTopics.value.delete(index);
  } else {
    // Only allow 5 selections max
    if (selectedTopics.value.size < 5) {
      selectedTopics.value.add(index);
    }
  }
};

/**
 * Get topic title (handles both string and object formats)
 * Local helper to keep this tool self-contained
 */
const getTopicTitle = (topic) => {
  if (!topic) return '';
  if (typeof topic === 'string') return topic;
  return topic.title || topic.text || '';
};

/**
 * Get topic category
 * Local helper to keep this tool self-contained
 */
const getTopicCategory = (topic) => {
  if (!topic || typeof topic === 'string') return 'Topic';
  return topic.category || 'Topic';
};

/**
 * Get edited topic title (returns edited version if exists, otherwise original)
 */
const getEditedTopicTitle = (index, topic) => {
  if (editedTopics.value.has(index)) {
    return editedTopics.value.get(index);
  }
  return getTopicTitle(topic);
};

/**
 * Start editing a topic
 */
const startEditingTopic = (index) => {
  const topic = topics.value[index];
  editingTopicIndex.value = index;
  editingTopicText.value = getEditedTopicTitle(index, topic);
  // Focus textarea after Vue updates the DOM
  nextTick(() => {
    if (editTextarea.value) {
      editTextarea.value.focus();
      editTextarea.value.select();
    }
  });
};

/**
 * Save topic edit
 */
const saveTopicEdit = (index) => {
  if (editingTopicText.value.trim()) {
    editedTopics.value.set(index, editingTopicText.value.trim());
  }
  editingTopicIndex.value = -1;
  editingTopicText.value = '';
};

/**
 * Cancel topic edit
 */
const cancelTopicEdit = () => {
  editingTopicIndex.value = -1;
  editingTopicText.value = '';
};

/**
 * Handle topic card click - select/deselect unless editing
 */
const handleTopicCardClick = (index, event) => {
  // Don't toggle selection if we're editing
  if (editingTopicIndex.value === index) return;
  toggleTopicSelect(index);
};

/**
 * Handle topic selection (for integrated mode)
 */
const handleSelectTopic = (index) => {
  selectedTopicIndex.value = selectedTopicIndex.value === index ? -1 : index;
};

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  selectedTopicIndex.value = -1;
  selectedTopics.value = new Set(); // Clear selections
  editedTopics.value = new Map(); // Clear edited topics
  editingTopicIndex.value = -1; // Cancel any active editing

  try {
    // Generate with count: 10
    await generate({
      expertise: authorityHookSummary.value,
      authorityHook: authorityHookSummary.value,
      count: 10
    });

    // Switch to results view in embedded mode
    if (props.mode === 'embedded') {
      showForm.value = false;
    }

    emit('generated', {
      topics: topics.value
    });
  } catch (err) {
    console.error('[TopicsGenerator] Generation failed:', err);
    throw err; // Re-throw to allow parent component to handle it
  }
};

/**
 * Handle copy to clipboard (all topics)
 */
const handleCopy = async () => {
  await copyToClipboard();
};

/**
 * Copy selected topics to clipboard
 */
const copySelectedTopics = async () => {
  const selected = Array.from(selectedTopics.value)
    .sort((a, b) => a - b)
    .map(index => getTopicTitle(topics.value[index]))
    .filter(Boolean);

  if (selected.length === 0) {
    // Copy all if none selected
    await copyToClipboard();
    return;
  }

  try {
    await navigator.clipboard.writeText(selected.join('\n\n'));
    console.log('[TopicsGenerator] Copied selected topics to clipboard');
  } catch (err) {
    console.error('[TopicsGenerator] Failed to copy:', err);
  }
};

/**
 * Handle apply (integrated mode - save to component)
 */
const handleApply = () => {
  // In integrated mode, save to component via AISaveBridge
  if (props.mode === 'integrated' && props.componentId) {
    try {
      saveToComponent(props.componentId, 'topics', topics.value);
      emit('applied', {
        componentId: props.componentId,
        topics: topics.value
      });
    } catch (err) {
      console.error('[TopicsGenerator] Failed to save to component:', err);
    }
  } else {
    emit('applied', {
      componentId: props.componentId,
      topics: topics.value
    });
  }
};

/**
 * Handle profile selection
 */
const handleProfileSelect = (profileId) => {
  selectedProfileId.value = profileId;
  saveSuccess.value = false;
};

/**
 * Handle save to profile (standalone mode)
 */
const handleSaveToProfile = async () => {
  if (!selectedProfileId.value || !hasTopics.value) return;

  saveSuccess.value = false;

  try {
    // Get selected topics with edited titles applied
    const selectedTopicsList = Array.from(selectedTopics.value)
      .sort((a, b) => a - b)
      .map(index => {
        const topic = topics.value[index];
        const editedTitle = editedTopics.value.get(index);
        if (editedTitle) {
          // Return topic object with edited title
          if (typeof topic === 'string') {
            return editedTitle;
          }
          return { ...topic, title: editedTitle };
        }
        return topic;
      });

    // Save selected topics
    const topicsResult = await saveToProfile('topics', selectedTopicsList, {
      profileId: selectedProfileId.value
    });

    // Save authority hook if checkbox is checked and we have data
    let authorityHookResult = { success: true, saved: {} };
    if (saveAuthorityHookToProfile.value && authorityHookSummary.value) {
      authorityHookResult = await saveToProfile('authority_hook', {
        who: authorityHook.value.who,
        what: authorityHook.value.what,
        when: authorityHook.value.when,
        how: authorityHook.value.how,
        summary: authorityHookSummary.value
      }, {
        profileId: selectedProfileId.value
      });
    }

    if (topicsResult.success) {
      saveSuccess.value = true;

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        saveSuccess.value = false;
      }, 3000);

      emit('saved', {
        profileId: selectedProfileId.value,
        topics: selectedTopicsList,
        fields: {
          ...topicsResult.saved,
          ...(authorityHookResult.saved || {})
        },
        authorityHookSaved: saveAuthorityHookToProfile.value && authorityHookResult.success
      });
    }
  } catch (err) {
    console.error('[TopicsGenerator] Failed to save to profile:', err);
  }
};

/**
 * Handle save to profile (embedded mode)
 * Uses injected profile data from EmbeddedToolWrapper
 */
const handleEmbeddedSave = async () => {
  const profileId = injectedProfileData.value?.id;
  if (!profileId || !hasTopics.value || selectedTopics.value.size === 0) return;

  saveSuccess.value = false;

  try {
    // Get selected topics with edited titles applied
    const selectedTopicsList = Array.from(selectedTopics.value)
      .sort((a, b) => a - b)
      .map(index => {
        const topic = topics.value[index];
        const editedTitle = editedTopics.value.get(index);
        if (editedTitle) {
          // Return topic object with edited title
          if (typeof topic === 'string') {
            return editedTitle;
          }
          return { ...topic, title: editedTitle };
        }
        return topic;
      });

    // Save selected topics
    const topicsResult = await saveToProfile('topics', selectedTopicsList, {
      profileId
    });

    // Save authority hook if checkbox is checked and we have data
    let authorityHookResult = { success: true, saved: {} };
    if (saveAuthorityHookToProfile.value && authorityHookSummary.value) {
      authorityHookResult = await saveToProfile('authority_hook', {
        who: authorityHook.value.who,
        what: authorityHook.value.what,
        when: authorityHook.value.when,
        how: authorityHook.value.how,
        summary: authorityHookSummary.value
      }, {
        profileId
      });
    }

    if (topicsResult.success) {
      saveSuccess.value = true;

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        saveSuccess.value = false;
      }, 3000);

      emit('saved', {
        profileId,
        topics: selectedTopicsList,
        fields: {
          ...topicsResult.saved,
          ...(authorityHookResult.saved || {})
        },
        authorityHookSaved: saveAuthorityHookToProfile.value && authorityHookResult.success
      });
    }
  } catch (err) {
    console.error('[TopicsGenerator] Failed to save to profile (embedded):', err);
  }
};

/**
 * Sync authority hook from store on mount
 */
onMounted(() => {
  syncFromStore();

  // Use context profile ID if available and no prop provided
  if (!selectedProfileId.value && contextProfileId.value) {
    selectedProfileId.value = contextProfileId.value;
  }
});

/**
 * Watch for context profile changes
 */
watch(contextProfileId, (newVal) => {
  if (newVal && !selectedProfileId.value) {
    selectedProfileId.value = newVal;
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
 * Current intent (embedded mode)
 */
const currentIntent = computed(() => props.intent || null);

/**
 * Embedded preview text
 */
const embeddedPreviewText = computed(() => {
  if (!authorityHookSummary.value) return null;
  return `<strong>Podcast topics</strong> based on <strong>${authorityHookSummary.value.substring(0, 50)}...</strong>`;
});

/**
 * Watch for profileData prop changes (embedded mode)
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
 * Watch expertise changes for preview updates (embedded mode)
 */
watch(
  () => authorityHookSummary.value,
  () => {
    if (props.mode === 'embedded') {
      emit('preview-update', {
        previewHtml: embeddedPreviewText.value,
        fields: { authorityHook: authorityHookSummary.value }
      });
    }
  }
);

/**
 * Watch canGenerate for validation updates (embedded mode)
 */
watch(canGenerate, (newValue) => {
  if (props.mode === 'embedded') {
    emit('update:can-generate', !!newValue);
  }
}, { immediate: true });

/**
 * Watch authority hook changes and emit to parent (embedded mode)
 */
watch(
  () => authorityHook.value,
  (hookData) => {
    if (props.mode === 'embedded' && hookData) {
      emit('authority-hook-update', {
        who: hookData.who || '',
        what: hookData.what || '',
        when: hookData.when || '',
        how: hookData.how || '',
        summary: authorityHookSummary.value || ''
      });
    }
  },
  { deep: true, immediate: true }
);

/**
 * Expose methods for parent component access (embedded mode)
 */
defineExpose({
  handleGenerate
});
</script>

<style scoped>
/* Single Column Layout Override - use :deep to override global styles */
.topics-generator :deep(.generator__content--single) {
  display: block;
  flex-direction: unset;
  flex-wrap: unset;
}

.topics-generator :deep(.generator__panel--full) {
  flex: unset;
  min-width: unset;
  max-width: 800px;
  margin: 0 auto;
}

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

/* ============================================
   GFY Results Section Styles
   ============================================ */

.gfy-results {
  margin-top: var(--mkcg-space-xl, 40px);
  padding: var(--mkcg-space-lg, 30px);
  background: var(--mkcg-bg-primary, #ffffff);
  border-radius: var(--mkcg-radius-lg, 12px);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
}

.gfy-results__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--mkcg-space-md, 20px);
  flex-wrap: wrap;
  gap: var(--mkcg-space-sm, 12px);
}

.gfy-results__header-left {
  display: flex;
  align-items: center;
  gap: var(--mkcg-space-sm, 12px);
}

.gfy-results__title {
  margin: 0;
  font-size: var(--mkcg-font-size-xl, 24px);
  font-weight: var(--mkcg-font-weight-bold, 700);
  color: var(--mkcg-text-primary, #2c3e50);
}

.gfy-results__badge {
  background: linear-gradient(135deg, var(--mkcg-primary, #1a9bdc), var(--mkcg-primary-dark, #0d8ecf));
  color: white;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: var(--mkcg-font-size-sm, 14px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
}

.gfy-results__header-right {
  display: flex;
  align-items: center;
  gap: var(--mkcg-space-sm, 12px);
}

/* View Toggle */
.gfy-view-toggle {
  display: flex;
  background: var(--mkcg-bg-tertiary, #f5f7fa);
  border-radius: var(--mkcg-radius-sm, 4px);
  padding: 4px;
}

.gfy-view-toggle__btn {
  padding: 8px 12px;
  border: none;
  background: transparent;
  color: var(--mkcg-text-secondary, #5a6d7e);
  cursor: pointer;
  border-radius: var(--mkcg-radius-sm, 4px);
  transition: var(--mkcg-transition-fast, 0.15s ease);
}

.gfy-view-toggle__btn:hover {
  color: var(--mkcg-text-primary, #2c3e50);
}

.gfy-view-toggle__btn.is-active {
  background: var(--mkcg-bg-primary, #ffffff);
  color: var(--mkcg-primary, #1a9bdc);
  box-shadow: var(--mkcg-shadow-sm, 0 2px 4px rgba(0,0,0,0.05));
}

/* Buttons */
.gfy-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border: none;
  border-radius: var(--mkcg-radius, 8px);
  font-size: var(--mkcg-font-size-sm, 14px);
  font-weight: var(--mkcg-font-weight-medium, 500);
  cursor: pointer;
  transition: var(--mkcg-transition-fast, 0.15s ease);
  font-family: inherit;
}

.gfy-btn-secondary {
  background: var(--mkcg-bg-tertiary, #f5f7fa);
  color: var(--mkcg-text-primary, #2c3e50);
  border: 1px solid var(--mkcg-border-medium, #dce1e5);
}

.gfy-btn-secondary:hover {
  background: var(--mkcg-bg-quaternary, #edf2f7);
}

.gfy-btn-success {
  background: linear-gradient(135deg, #10b981, #059669);
  color: white;
}

.gfy-btn-success:hover:not(:disabled) {
  background: linear-gradient(135deg, #059669, #047857);
  transform: translateY(-1px);
}

.gfy-btn-success:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

/* Selection Banner */
.gfy-selection-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: var(--mkcg-space-md, 20px);
  background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
  border: 1px solid #bae6fd;
  border-radius: var(--mkcg-radius, 8px);
  margin-bottom: var(--mkcg-space-md, 20px);
  flex-wrap: wrap;
  gap: var(--mkcg-space-sm, 12px);
}

.gfy-selection-banner__text {
  display: flex;
  align-items: center;
  gap: var(--mkcg-space-sm, 12px);
}

.gfy-selection-banner__icon {
  width: 40px;
  height: 40px;
  background: var(--mkcg-primary, #1a9bdc);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  font-size: 18px;
}

.gfy-selection-banner__label {
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.gfy-selection-banner__count {
  font-weight: var(--mkcg-font-weight-bold, 700);
  color: var(--mkcg-primary, #1a9bdc);
}

/* Authority Hook Checkbox */
.gfy-authority-hook-checkbox {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: var(--mkcg-space-md, 20px);
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
  cursor: pointer;
}

.gfy-authority-hook-checkbox:hover {
  color: var(--mkcg-text-primary, #2c3e50);
}

.gfy-authority-hook-checkbox input {
  width: 18px;
  height: 18px;
  accent-color: var(--mkcg-primary, #1a9bdc);
  cursor: pointer;
}

/* Topics Container */
.gfy-topics {
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.gfy-topics--grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(280px, 1fr));
  gap: var(--mkcg-space-md, 20px);
}

.gfy-topics--list {
  display: flex;
  flex-direction: column;
  gap: var(--mkcg-space-sm, 12px);
}

/* Topic Card */
.gfy-topic-card {
  background: var(--mkcg-bg-primary, #ffffff);
  border: 2px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  padding: var(--mkcg-space-md, 20px);
  cursor: pointer;
  transition: var(--mkcg-transition-fast, 0.15s ease);
  position: relative;
}

.gfy-topic-card:hover {
  border-color: var(--mkcg-primary, #1a9bdc);
  box-shadow: 0 4px 12px rgba(26, 155, 220, 0.15);
  transform: translateY(-2px);
}

.gfy-topic-card.is-selected {
  border-color: var(--mkcg-primary, #1a9bdc);
  background: rgba(26, 155, 220, 0.05);
}

.gfy-topic-card.is-selected .gfy-topic-card__checkbox {
  opacity: 1;
  background: var(--mkcg-primary, #1a9bdc);
  color: white;
}

.gfy-topic-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: var(--mkcg-space-sm, 12px);
}

.gfy-topic-card__number {
  width: 28px;
  height: 28px;
  background: var(--mkcg-bg-tertiary, #f5f7fa);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: var(--mkcg-font-size-sm, 14px);
  font-weight: var(--mkcg-font-weight-bold, 700);
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.gfy-topic-card__checkbox {
  width: 24px;
  height: 24px;
  border: 2px solid var(--mkcg-border-medium, #dce1e5);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  opacity: 0.5;
  transition: var(--mkcg-transition-fast, 0.15s ease);
}

.gfy-topic-card:hover .gfy-topic-card__checkbox {
  opacity: 1;
  border-color: var(--mkcg-primary, #1a9bdc);
}

/* Topic Card Actions (edit button + checkbox) */
.gfy-topic-card__actions {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gfy-topic-card__edit-btn {
  width: 28px;
  height: 28px;
  border: none;
  background: var(--mkcg-bg-tertiary, #f5f7fa);
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  transition: var(--mkcg-transition-fast, 0.15s ease);
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.gfy-topic-card:hover .gfy-topic-card__edit-btn {
  opacity: 1;
}

.gfy-topic-card__edit-btn:hover {
  background: var(--mkcg-primary, #1a9bdc);
  color: white;
}

/* Topic Card Editing State */
.gfy-topic-card.is-editing {
  cursor: default;
  border-color: var(--mkcg-primary, #1a9bdc);
  box-shadow: 0 4px 12px rgba(26, 155, 220, 0.2);
}

.gfy-topic-card.is-editing:hover {
  transform: none;
}

.gfy-topic-card__edit-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gfy-topic-card__edit-input {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 6px;
  font-size: var(--mkcg-font-size-md, 16px);
  font-family: inherit;
  line-height: var(--mkcg-line-height-relaxed, 1.6);
  resize: vertical;
  min-height: 60px;
}

.gfy-topic-card__edit-input:focus {
  outline: none;
  border-color: var(--mkcg-primary, #1a9bdc);
  box-shadow: 0 0 0 3px rgba(26, 155, 220, 0.1);
}

.gfy-topic-card__edit-actions {
  display: flex;
  gap: 8px;
  justify-content: flex-end;
}

/* Small button variant */
.gfy-btn-sm {
  padding: 6px 12px;
  font-size: 13px;
}

.gfy-topic-card__body {
  /* Body styling */
}

.gfy-topic-card__category {
  display: inline-block;
  background: var(--mkcg-bg-tertiary, #f5f7fa);
  color: var(--mkcg-text-secondary, #5a6d7e);
  padding: 4px 10px;
  border-radius: 20px;
  font-size: var(--mkcg-font-size-xs, 12px);
  font-weight: var(--mkcg-font-weight-medium, 500);
  margin-bottom: var(--mkcg-space-xs, 8px);
  text-transform: capitalize;
}

.gfy-topic-card__title {
  margin: 0;
  font-size: var(--mkcg-font-size-md, 16px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

/* Status Messages */
.gfy-status-message {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: var(--mkcg-space-sm, 12px) var(--mkcg-space-md, 20px);
  border-radius: var(--mkcg-radius, 8px);
  font-size: var(--mkcg-font-size-sm, 14px);
  margin-bottom: var(--mkcg-space-md, 20px);
}

.gfy-status-message--info {
  background: #f0f9ff;
  color: #0369a1;
  border: 1px solid #bae6fd;
}

.gfy-status-message--success {
  background: #f0fdf4;
  color: #15803d;
  border: 1px solid #bbf7d0;
}

.gfy-status-message--error {
  background: #fef2f2;
  color: #b91c1c;
  border: 1px solid #fecaca;
}

/* Testimonial */
.gfy-testimonial {
  background: var(--mkcg-bg-secondary, #f9fafb);
  border-radius: var(--mkcg-radius, 8px);
  padding: var(--mkcg-space-lg, 30px);
  text-align: center;
  margin-top: var(--mkcg-space-lg, 30px);
}

.gfy-testimonial__stars {
  color: #fbbf24;
  font-size: 20px;
  margin-bottom: var(--mkcg-space-sm, 12px);
}

.gfy-testimonial__stars i {
  margin: 0 2px;
}

.gfy-testimonial__quote {
  font-size: var(--mkcg-font-size-lg, 18px);
  font-style: italic;
  color: var(--mkcg-text-primary, #2c3e50);
  margin: 0 0 var(--mkcg-space-sm, 12px) 0;
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.gfy-testimonial__author {
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-weight: var(--mkcg-font-weight-medium, 500);
  margin: 0;
}

/* Integrated Mode Styles (kept from original) */
.gmkb-ai-profile-selector {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

.gmkb-ai-save-actions {
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.gmkb-ai-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gmkb-ai-btn--primary {
  color: white;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
}

.gmkb-ai-btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  transform: translateY(-1px);
}

.gmkb-ai-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gmkb-ai-btn__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.gmkb-ai-save-hint {
  font-size: 13px;
  color: #64748b;
  font-style: italic;
}

.gmkb-ai-save-success {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #10b981;
}

/* Embedded Mode Styles (for landing page) */
.gmkb-embedded-form { width: 100%; }
.gmkb-embedded-fields { display: flex; flex-direction: column; gap: 20px; }
.gmkb-embedded-field { display: flex; flex-direction: column; }
.gmkb-embedded-label { display: block; font-weight: 600; font-size: 13px; margin-bottom: 8px; color: var(--mkcg-text-primary, #0f172a); }
.gmkb-embedded-input { width: 100%; padding: 14px; border: 1px solid var(--mkcg-border, #e2e8f0); border-radius: 8px; background: var(--mkcg-bg-secondary, #f9fafb); box-sizing: border-box; font-size: 15px; font-family: inherit; transition: border-color 0.2s, box-shadow 0.2s; }
.gmkb-embedded-input:focus { outline: none; border-color: var(--mkcg-primary, #3b82f6); box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1); }
.gmkb-embedded-input::placeholder { color: var(--mkcg-text-light, #94a3b8); }
.gmkb-embedded-textarea { resize: vertical; min-height: 80px; }
.gmkb-embedded-error { margin-top: 16px; padding: 12px 16px; background: #fef2f2; border: 1px solid #fecaca; border-radius: 8px; color: #991b1b; font-size: 14px; }

/* Compact Controls (shown after generation) */
.gfy-compact-controls {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 16px 0;
  flex-wrap: wrap;
}

.gfy-compact-input-wrapper {
  flex: 1;
  min-width: 200px;
  position: relative;
  display: flex;
  align-items: center;
}

.gfy-compact-input-wrapper svg {
  position: absolute;
  left: 14px;
  color: var(--mkcg-text-light, #94a3b8);
  pointer-events: none;
}

.gfy-compact-input {
  width: 100%;
  padding: 12px 14px 12px 40px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  font-size: 14px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  color: var(--mkcg-text-primary, #2c3e50);
  font-family: inherit;
}

.gfy-compact-input:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
}

/* Topic Card Disabled State */
.gfy-topic-card.is-disabled {
  opacity: 0.5;
  cursor: not-allowed;
  pointer-events: none;
}

.gfy-topic-card.is-disabled:hover {
  transform: none;
  border-color: var(--mkcg-border-light, #e9ecef);
  box-shadow: none;
}

/* Embedded Results Section - full width outside form container */
.gfy-results--embedded {
  margin-top: 30px;
  padding: 30px 40px 40px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  border-top: 1px solid var(--mkcg-border, #e2e8f0);
}

/* Embedded form with results state */
.gmkb-embedded-form.has-results {
  margin-bottom: 0;
}

/* Responsive */
@media (max-width: 768px) {
  .gfy-results__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .gfy-selection-banner {
    flex-direction: column;
    text-align: center;
  }

  .gfy-selection-banner__text {
    flex-direction: column;
  }

  .gfy-topics--grid {
    grid-template-columns: 1fr;
  }
}
</style>
