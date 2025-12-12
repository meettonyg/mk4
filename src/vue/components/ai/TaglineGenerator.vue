<template>
  <AiWidgetFrame
    title="Tagline Generator"
    description="Create memorable taglines that capture your unique value proposition."
    :mode="mode"
    :is-loading="isGenerating || isSaving"
    :has-results="hasTaglines"
    :error="error || saveError"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Tagline"
    :show-cta="!hasTaglines"
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
        placeholder="Select a profile to save tagline to..."
        :show-current-profile="true"
        @select="handleProfileSelect"
      />
    </div>

    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Name Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Your Name (Optional)</label>
        <input
          v-model="name"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Jane Smith"
        />
      </div>

      <!-- Authority Hook -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">What You Do</label>
        <textarea
          v-model="authorityHookText"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., I help entrepreneurs build sustainable businesses through strategic planning and mindset coaching..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          Describe your work and the transformation you provide.
        </span>
      </div>

      <!-- Tone Selector -->
      <AiToneSelector v-model="tone" />

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate 5 Taglines"
        loading-text="Generating taglines..."
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasTaglines" class="gmkb-ai-taglines">
        <p class="gmkb-ai-taglines__instruction">
          Click a tagline to select it:
        </p>
        <AiResultsDisplay
          :content="taglines"
          format="cards"
          :selected-index="selectedIndex"
          @select="handleSelectTagline"
        />

        <!-- Selected Preview -->
        <div v-if="selectedTagline" class="gmkb-ai-taglines__preview">
          <span class="gmkb-ai-taglines__preview-label">Selected:</span>
          <span class="gmkb-ai-taglines__preview-text">"{{ selectedTagline }}"</span>
        </div>

        <!-- Save to Profile Button (standalone mode) -->
        <div v-if="hasTaglines && showSaveToProfile" class="gmkb-ai-save-actions">
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

    <!-- Results Actions -->
    <template #results-actions>
      <div v-if="hasTaglines" class="gmkb-ai-taglines__nav">
        <button
          type="button"
          class="gmkb-ai-button gmkb-ai-button--ghost"
          :disabled="selectedIndex <= 0"
          @click="selectPrevious"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <span class="gmkb-ai-taglines__nav-count">
          {{ selectedIndex + 1 }} / {{ taglines.length }}
        </span>
        <button
          type="button"
          class="gmkb-ai-button gmkb-ai-button--ghost"
          :disabled="selectedIndex >= taglines.length - 1"
          @click="selectNext"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="9 18 15 12 9 6"/>
          </svg>
        </button>
      </div>
    </template>
  </AiWidgetFrame>
</template>

<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useAITagline } from '../../../composables/useAITagline';
import { useAuthorityHook } from '../../../composables/useAuthorityHook';
import { useProfileContext } from '../../../composables/useProfileContext';
import AiWidgetFrame from './AiWidgetFrame.vue';
import AiToneSelector from './AiToneSelector.vue';
import AiGenerateButton from './AiGenerateButton.vue';
import AiResultsDisplay from './AiResultsDisplay.vue';
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
  taglines,
  hasTaglines,
  selectedTagline,
  selectedIndex,
  selectTagline,
  selectNext,
  selectPrevious,
  generate,
  copyToClipboard,
  tone
} = useAITagline();

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
const name = ref('');
const authorityHookText = ref('');
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
  return selectedProfileId.value && hasTaglines.value && selectedTagline.value && !isSaving.value;
});

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return authorityHookText.value.trim().length > 0;
});

/**
 * Handle tagline selection
 */
const handleSelectTagline = (index) => {
  selectTagline(index);
};

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      name: name.value,
      authorityHook: authorityHookText.value
    }, context);

    emit('generated', {
      taglines: taglines.value
    });
  } catch (err) {
    console.error('[TaglineGenerator] Generation failed:', err);
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
      saveToComponent(props.componentId, 'tagline', selectedTagline.value);
      emit('applied', {
        componentId: props.componentId,
        tagline: selectedTagline.value,
        allTaglines: taglines.value
      });
    } catch (err) {
      console.error('[TaglineGenerator] Failed to save to component:', err);
    }
  } else {
    emit('applied', {
      componentId: props.componentId,
      tagline: selectedTagline.value,
      allTaglines: taglines.value
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
  if (!selectedProfileId.value || !selectedTagline.value) return;

  saveSuccess.value = false;

  try {
    const result = await saveToProfile('tagline', selectedTagline.value, {
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
        tagline: selectedTagline.value,
        fields: result.saved
      });
    }
  } catch (err) {
    console.error('[TaglineGenerator] Failed to save to profile:', err);
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
.gmkb-ai-taglines__instruction {
  margin: 0 0 12px 0;
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}

.gmkb-ai-taglines__preview {
  margin-top: 16px;
  padding: 16px;
  background: linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%);
  border: 1px solid #7dd3fc;
  border-radius: 8px;
}

.gmkb-ai-taglines__preview-label {
  display: block;
  font-size: 12px;
  font-weight: 600;
  color: #0369a1;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 4px;
}

.gmkb-ai-taglines__preview-text {
  font-size: 18px;
  font-weight: 500;
  color: #0c4a6e;
  font-style: italic;
}

.gmkb-ai-taglines__nav {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gmkb-ai-taglines__nav-count {
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
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
