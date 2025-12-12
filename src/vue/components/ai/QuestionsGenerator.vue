<template>
  <AiWidgetFrame
    title="Interview Questions Generator"
    description="Generate 25 thoughtful interview questions organized by category."
    :mode="mode"
    :is-loading="isGenerating || isSaving"
    :has-results="hasQuestions"
    :error="error || saveError"
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
    <!-- Profile Selector (standalone mode only) -->
    <div v-if="showProfileSelector" class="gmkb-ai-profile-selector">
      <ProfileSelector
        v-model="selectedProfileId"
        mode="dropdown"
        label="Save to Profile"
        placeholder="Select a profile to save questions to..."
        :show-current-profile="true"
        @select="handleProfileSelect"
      />
    </div>

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

        <!-- Save to Profile Button (standalone mode) -->
        <div v-if="hasQuestions && showSaveToProfile" class="gmkb-ai-save-actions">
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
      </div>
    </template>
  </AiWidgetFrame>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAIQuestions, QUESTION_CATEGORIES } from '../../../composables/useAIQuestions';
import { useAuthorityHook } from '../../../composables/useAuthorityHook';
import { useProfileContext } from '../../../composables/useProfileContext';
import AiWidgetFrame from './AiWidgetFrame.vue';
import AiGenerateButton from './AiGenerateButton.vue';
import ProfileSelector from '../shared/ProfileSelector.vue';

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
  },

  /**
   * Pre-selected profile ID (optional)
   */
  profileId: {
    type: Number,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated', 'saved']);

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
const topicsText = ref('');
const authorityHookText = ref('');
const openCategory = ref('introductory');
const selectedProfileId = ref(props.profileId || null);
const saveSuccess = ref(false);

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
  return selectedProfileId.value && hasQuestions.value && !isSaving.value;
});

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
 * Handle apply (integrated mode - save to component)
 */
const handleApply = () => {
  if (props.mode === 'integrated' && props.componentId) {
    try {
      saveToComponent(props.componentId, 'questions', questions.value);
      emit('applied', {
        componentId: props.componentId,
        questions: questions.value
      });
    } catch (err) {
      console.error('[QuestionsGenerator] Failed to save to component:', err);
    }
  } else {
    emit('applied', {
      componentId: props.componentId,
      questions: questions.value
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
  if (!selectedProfileId.value || !hasQuestions.value) return;

  saveSuccess.value = false;

  try {
    const result = await saveToProfile('questions', questions.value, {
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
        questions: questions.value,
        fields: result.saved
      });
    }
  } catch (err) {
    console.error('[QuestionsGenerator] Failed to save to profile:', err);
  }
};

/**
 * Sync authority hook from store on mount
 */
onMounted(() => {
  syncFromStore();
  if (authorityHookSummary.value) {
    authorityHookText.value = authorityHookSummary.value;
  }

  // Use context profile ID if available and no prop provided
  if (!selectedProfileId.value && contextProfileId.value) {
    selectedProfileId.value = contextProfileId.value;
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
 * Watch for context profile changes
 */
watch(contextProfileId, (newVal) => {
  if (newVal && !selectedProfileId.value) {
    selectedProfileId.value = newVal;
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

/* Profile Selector Section */
.gmkb-ai-profile-selector {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

/* Save Actions */
.gmkb-ai-save-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid #e2e8f0;
}

.gmkb-ai-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 500;
  border-radius: 8px;
  border: none;
  cursor: pointer;
  transition: all 0.2s;
}

.gmkb-ai-btn--primary {
  background: linear-gradient(135deg, #6366f1 0%, #4f46e5 100%);
  color: white;
}

.gmkb-ai-btn--primary:hover:not(:disabled) {
  transform: translateY(-1px);
  box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3);
}

.gmkb-ai-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gmkb-ai-btn__spinner {
  width: 16px;
  height: 16px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

.gmkb-ai-save-hint {
  font-size: 13px;
  color: #64748b;
}

.gmkb-ai-save-success {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: #059669;
  font-weight: 500;
}
</style>
