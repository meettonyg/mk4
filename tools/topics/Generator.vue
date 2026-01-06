<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Speaking Topics Generator"
    subtitle="Generate compelling interview and speaking topics that showcase your expertise"
    intro-text="Generate 5 compelling speaking and interview topics based on your expertise and authority hook. Each topic will be designed to position you as a thought leader, showcase your unique perspective, and attract the right audiences for podcasts, interviews, and speaking engagements."
    generator-type="topics"
    :has-results="hasTopics"
    :is-loading="isGenerating"
  >
    <!-- Left Panel: Form -->
    <template #left>
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

      <!-- Expertise Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Your Expertise</h3>

        <div class="generator__field">
          <label class="generator__field-label generator__field-label--required">Your Expertise</label>
          <textarea
            v-model="expertise"
            class="generator__field-input generator__field-textarea"
            placeholder="e.g., Leadership development, executive coaching, organizational psychology..."
            rows="3"
          ></textarea>
          <p class="generator__field-helper">
            Describe your areas of expertise and unique methodologies.
          </p>
        </div>

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
          {{ isGenerating ? 'Generating...' : 'Generate 5 Topics with AI' }}
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
        title="Crafting Irresistible Speaking Topics"
        subtitle="Great speaking topics position you as a thought leader and attract the right opportunities for podcasts, interviews, and conferences."
        :formula="topicsFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Topic Ideas:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="topics-generator__results">
        <div class="topics-generator__results-header">
          <h3>Your Generated Topics</h3>
          <p>5 compelling topics ready for your next interview or speaking engagement</p>
        </div>

        <!-- Topics Cards -->
        <div class="topics-generator__cards">
          <div
            v-for="(topic, index) in topics"
            :key="index"
            class="topics-generator__card"
            :class="{ 'topics-generator__card--selected': selectedTopicIndex === index }"
            @click="handleSelectTopic(index)"
          >
            <div class="topics-generator__card-number">{{ index + 1 }}</div>
            <p class="topics-generator__card-text">{{ topic }}</p>
          </div>
        </div>

        <!-- Save Actions -->
        <div v-if="showSaveToProfile" class="topics-generator__actions">
          <button
            type="button"
            class="generator__button generator__button--primary"
            :disabled="!canSaveToProfile || isSaving"
            @click="handleSaveToProfile"
          >
            <span v-if="isSaving" class="generator__button-spinner"></span>
            <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            {{ isSaving ? 'Saving...' : 'Save to Profile' }}
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
            Copy All Topics
          </button>

          <span v-if="!selectedProfileId" class="generator__field-helper">
            Select a profile above to enable saving
          </span>
          <span v-if="saveSuccess" class="topics-generator__success">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polyline points="20 6 9 17 4 12"/>
            </svg>
            Saved successfully!
          </span>
          <span v-if="saveError" class="topics-generator__error-msg">
            {{ saveError }}
          </span>
        </div>
      </div>
    </template>
  </GeneratorLayout>

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
      <!-- Expertise Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Your Expertise</label>
        <textarea
          v-model="expertise"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., Leadership development, executive coaching, organizational psychology..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          Describe your areas of expertise and unique methodologies.
        </span>
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
      <AiGenerateButton
        text="Generate 5 Topics"
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
  <div v-else class="gmkb-embedded-form">
    <div class="gmkb-embedded-fields">
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">{{ currentIntent?.formLabels?.expertise || 'Your Area of Expertise' }} *</label>
        <textarea
          v-model="expertise"
          class="gmkb-embedded-input gmkb-embedded-textarea"
          :placeholder="currentIntent?.formPlaceholders?.expertise || 'e.g., Leadership development, team building, executive coaching...'"
          rows="3"
        ></textarea>
      </div>
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
    <div v-if="error" class="gmkb-embedded-error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useAITopics } from '../../src/composables/useAITopics';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';
import { useProfileContext } from '../../src/composables/useProfileContext';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';
import ProfileSelector from '../../src/vue/components/shared/ProfileSelector.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';
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

const emit = defineEmits(['applied', 'generated', 'saved', 'preview-update', 'update:can-generate']);

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
  who,
  what,
  when,
  how,
  authorityHook,
  authorityHookSummary,
  setAll,
  syncFromStore,
  loadFromPodsData
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
  loadFromPodsData(profileData);
}

/**
 * Topics formula for guidance panel
 */
const topicsFormula = '<span class="generator__highlight">[EXPERTISE]</span> + <span class="generator__highlight">[AUDIENCE NEEDS]</span> + <span class="generator__highlight">[UNIQUE ANGLE]</span> = Compelling Topic';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Topic Selection Matters',
    description: 'Your speaking topics serve as conversation starters that open doors to podcasts, interviews, and speaking engagements. The right topics position you as the go-to expert in your field, attract your ideal audience, and create opportunities to share your message on larger platforms.'
  },
  {
    title: 'What Makes Topics Irresistible',
    description: 'The best speaking topics are specific, outcome-focused, and timely. They address urgent problems your audience faces, promise clear solutions or insights, and showcase your unique perspective or methodology. They should spark curiosity while demonstrating your authority.'
  },
  {
    title: 'How to Use Your Generated Topics',
    description: 'Use these topics when pitching yourself for podcast interviews, applying for speaking opportunities, or creating content themes. Customize each topic based on the audience and platform, and be ready to expand on why you\'re uniquely qualified to speak on each subject.'
  }
];

/**
 * Example topics for guidance panel
 */
const examples = [
  {
    title: 'Leadership Topic Example:',
    description: '"The 3 Critical Mistakes New Executives Make (And How to Avoid Them)" - This topic is specific, addresses a pain point, promises actionable insights, and positions the speaker as an experienced guide.'
  },
  {
    title: 'Marketing Topic Example:',
    description: '"How to Generate 100 Qualified Leads in 30 Days Without Paid Ads" - This topic is results-focused, has a clear timeframe, addresses a common challenge, and hints at a unique methodology.'
  }
];

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
  return selectedProfileId.value && hasTopics.value && !isSaving.value;
});

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return expertise.value.trim().length > 0;
});

/**
 * Handle topic selection
 */
const handleSelectTopic = (index) => {
  selectedTopicIndex.value = selectedTopicIndex.value === index ? -1 : index;
};

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  selectedTopicIndex.value = -1;

  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      expertise: expertise.value,
      authorityHook: authorityHookSummary.value
    }, context);

    emit('generated', {
      topics: topics.value
    });
  } catch (err) {
    console.error('[TopicsGenerator] Generation failed:', err);
  }
};

/**
 * Handle copy to clipboard
 */
const handleCopy = async () => {
  await copyToClipboard();
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
    const result = await saveToProfile('topics', topics.value, {
      profileId: selectedProfileId.value
    });

    if (result.success) {
      saveSuccess.value = true;

      // Auto-hide success message after 3 seconds
      setTimeout(() => {
        saveSuccess.value = false;
      }, 3000);

      emit('saved', {
        profileId: selectedProfileId.value,
        topics: topics.value,
        fields: result.saved
      });
    }
  } catch (err) {
    console.error('[TopicsGenerator] Failed to save to profile:', err);
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
  if (!expertise.value) return null;
  return `<strong>Podcast topics</strong> about <strong>${expertise.value}</strong>`;
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
  () => expertise.value,
  () => {
    if (props.mode === 'embedded') {
      emit('preview-update', {
        previewHtml: embeddedPreviewText.value,
        fields: { expertise: expertise.value }
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

/* Topics Results */
.topics-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.topics-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.topics-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.topics-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.topics-generator__cards {
  display: flex;
  flex-direction: column;
  gap: var(--mkcg-space-sm, 12px);
  margin-bottom: var(--mkcg-space-md, 20px);
}

.topics-generator__card {
  display: flex;
  align-items: flex-start;
  gap: var(--mkcg-space-md, 20px);
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 2px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  cursor: pointer;
  transition: var(--mkcg-transition-fast, 0.15s ease);
}

.topics-generator__card:hover {
  border-color: var(--mkcg-primary, #1a9bdc);
  box-shadow: 0 2px 8px rgba(26, 155, 220, 0.1);
}

.topics-generator__card--selected {
  border-color: var(--mkcg-primary, #1a9bdc);
  background: rgba(26, 155, 220, 0.05);
}

.topics-generator__card-number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mkcg-primary, #1a9bdc);
  color: white;
  font-weight: var(--mkcg-font-weight-bold, 700);
  font-size: var(--mkcg-font-size-sm, 14px);
  border-radius: 50%;
}

.topics-generator__card-text {
  flex: 1;
  margin: 0;
  color: var(--mkcg-text-primary, #2c3e50);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.topics-generator__actions {
  display: flex;
  align-items: center;
  gap: var(--mkcg-space-sm, 12px);
  margin-top: var(--mkcg-space-md, 20px);
  padding-top: var(--mkcg-space-md, 20px);
  border-top: 1px solid var(--mkcg-border-light, #e9ecef);
  flex-wrap: wrap;
}

.topics-generator__success {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: #10b981;
}

.topics-generator__error-msg {
  font-size: 13px;
  color: #dc2626;
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
</style>
