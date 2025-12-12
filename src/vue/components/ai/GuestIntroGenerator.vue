<template>
  <AiWidgetFrame
    title="Guest Introduction Generator"
    description="Create a host-ready introduction that builds anticipation and establishes credibility."
    :mode="mode"
    :is-loading="isGenerating || isSaving"
    :has-results="hasIntroduction"
    :error="error || saveError"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Guest Intro"
    :show-cta="!hasIntroduction"
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
        placeholder="Select a profile to save intro to..."
        :show-current-profile="true"
        @select="handleProfileSelect"
      />
    </div>

    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Name Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Guest Name</label>
        <input
          v-model="name"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Dr. Jane Smith"
        />
      </div>

      <!-- Biography Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">Short Biography</label>
        <textarea
          v-model="biography"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., Dr. Jane Smith is a leadership coach and author who has helped over 500 executives transform their careers..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">
          Provide a brief bio to pull key information from.
        </span>
      </div>

      <!-- Credentials Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Key Credentials</label>
        <input
          v-model="credentials"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., PhD, ICF Certified Coach, TEDx Speaker"
        />
        <span class="gmkb-ai-hint">
          Comma-separated list of credentials to highlight.
        </span>
      </div>

      <!-- Tagline Field -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Tagline (Optional)</label>
        <input
          v-model="tagline"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Helping leaders lead with purpose"
        />
      </div>

      <!-- Generate Button -->
      <AiGenerateButton
        text="Generate Introduction"
        loading-text="Crafting introduction..."
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasIntroduction" class="gmkb-ai-intro">
        <div class="gmkb-ai-intro__content">
          <AiResultsDisplay
            :content="introduction"
            format="text"
            show-count
          />
        </div>

        <!-- Read-aloud tip -->
        <div class="gmkb-ai-intro__tip">
          <svg class="gmkb-ai-intro__tip-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="16" x2="12" y2="12"/>
            <line x1="12" y1="8" x2="12.01" y2="8"/>
          </svg>
          <span>This introduction is designed to be read aloud by a podcast host or event MC.</span>
        </div>

        <!-- Save to Profile Button (standalone mode) -->
        <div v-if="hasIntroduction && showSaveToProfile" class="gmkb-ai-save-actions">
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
import { useAIGuestIntro } from '../../../composables/useAIGuestIntro';
import { useImpactIntro } from '../../../composables/useImpactIntro';
import { useProfileContext } from '../../../composables/useProfileContext';
import AiWidgetFrame from './AiWidgetFrame.vue';
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
   * Initial name
   */
  initialName: {
    type: String,
    default: ''
  },

  /**
   * Initial biography
   */
  initialBiography: {
    type: String,
    default: ''
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
  introduction,
  hasIntroduction,
  generate,
  copyToClipboard
} = useAIGuestIntro();

const { credentialsSummary, syncFromStore: syncImpactIntro } = useImpactIntro();

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
const name = ref(props.initialName);
const biography = ref(props.initialBiography);
const credentials = ref('');
const tagline = ref('');
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
  return selectedProfileId.value && hasIntroduction.value && !isSaving.value;
});

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return name.value.trim() && biography.value.trim();
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      name: name.value,
      biography: biography.value,
      credentials: credentials.value,
      tagline: tagline.value
    }, context);

    emit('generated', {
      introduction: introduction.value
    });
  } catch (err) {
    console.error('[GuestIntroGenerator] Generation failed:', err);
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
      saveToComponent(props.componentId, 'guest_intro', introduction.value);
      emit('applied', {
        componentId: props.componentId,
        introduction: introduction.value
      });
    } catch (err) {
      console.error('[GuestIntroGenerator] Failed to save to component:', err);
    }
  } else {
    emit('applied', {
      componentId: props.componentId,
      introduction: introduction.value
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
  if (!selectedProfileId.value || !hasIntroduction.value) return;

  saveSuccess.value = false;

  try {
    const result = await saveToProfile('guest_intro', introduction.value, {
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
        introduction: introduction.value,
        fields: result.saved
      });
    }
  } catch (err) {
    console.error('[GuestIntroGenerator] Failed to save to profile:', err);
  }
};

/**
 * Load credentials from store on mount
 */
onMounted(() => {
  syncImpactIntro();
  if (credentialsSummary.value) {
    credentials.value = credentialsSummary.value;
  }

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
</script>

<style scoped>
.gmkb-ai-intro__content {
  margin-bottom: 16px;
}

.gmkb-ai-intro__tip {
  display: flex;
  align-items: flex-start;
  gap: 8px;
  padding: 12px;
  background: var(--gmkb-ai-bg-tertiary, #f3f4f6);
  border-radius: var(--gmkb-ai-radius-md, 8px);
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}

.gmkb-ai-intro__tip-icon {
  flex-shrink: 0;
  margin-top: 1px;
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
