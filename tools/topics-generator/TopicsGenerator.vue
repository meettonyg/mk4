<template>
  <AiWidgetFrame
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

      <!-- Authority Hook (optional) -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Authority Hook (Optional)</label>
        <textarea
          v-model="authorityHookText"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., I help busy executives achieve work-life balance..."
          rows="2"
        ></textarea>
        <span class="gmkb-ai-hint">
          Add your positioning statement for more targeted topics.
        </span>
      </div>

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
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAITopics } from '@composables/useAITopics';
import { useAuthorityHook } from '@composables/useAuthorityHook';
import { useProfileContext } from '@composables/useProfileContext';
import AiWidgetFrame from '@ai/AiWidgetFrame.vue';
import AiGenerateButton from '@ai/AiGenerateButton.vue';
import AiResultsDisplay from '@ai/AiResultsDisplay.vue';
import ProfileSelector from '@/vue/components/shared/ProfileSelector.vue';

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
  topics,
  hasTopics,
  generate,
  copyToClipboard
} = useAITopics();

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
const expertise = ref('');
const authorityHookText = ref('');
const selectedTopicIndex = ref(-1);
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
      authorityHook: authorityHookText.value
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
/* Profile Selector Section */
.gmkb-ai-profile-selector {
  margin-bottom: 20px;
  padding-bottom: 20px;
  border-bottom: 1px solid #e2e8f0;
}

/* Save Actions */
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
</style>
