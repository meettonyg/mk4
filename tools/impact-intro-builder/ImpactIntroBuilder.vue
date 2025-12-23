<template>
  <AiWidgetFrame
    title="Impact Intro Builder"
    description="Build your credentials and achievements for powerful guest introductions."
    :mode="mode"
    :is-loading="false"
    :has-results="hasMinimumData"
    :error="null"
    target-component="Impact Intro"
    :show-cta="false"
    @apply="handleApply"
    @copy="handleCopy"
  >
    <!-- Credentials Section -->
    <div class="gmkb-ai-form">
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Credentials & Qualifications</label>
        <span class="gmkb-ai-hint gmkb-ai-hint--above">
          Add degrees, certifications, titles, and professional qualifications.
        </span>

        <!-- Existing Credentials Tags -->
        <div v-if="credentials.length > 0" class="gmkb-ai-tags">
          <div
            v-for="(credential, index) in credentials"
            :key="`cred-${index}`"
            class="gmkb-ai-tag"
          >
            <span>{{ credential }}</span>
            <button
              type="button"
              class="gmkb-ai-tag__remove"
              @click="removeCredential(index)"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Add Credential Input -->
        <div class="gmkb-ai-tag-input">
          <input
            v-model="newCredential"
            type="text"
            class="gmkb-ai-input"
            placeholder="e.g., PhD, MBA, ICF Certified Coach..."
            @keydown.enter.prevent="handleAddCredential"
          />
          <button
            type="button"
            class="gmkb-ai-button gmkb-ai-button--secondary"
            :disabled="!newCredential.trim()"
            @click="handleAddCredential"
          >
            Add
          </button>
        </div>

        <!-- Credential Suggestions -->
        <div class="gmkb-ai-suggestions">
          <span class="gmkb-ai-suggestions__label">Quick add:</span>
          <button
            v-for="type in CREDENTIAL_TYPES"
            :key="type.value"
            type="button"
            class="gmkb-ai-suggestion"
            @click="showCredentialExamples(type)"
          >
            {{ type.label }}
          </button>
        </div>
      </div>

      <!-- Achievements Section -->
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Achievements & Recognition</label>
        <span class="gmkb-ai-hint gmkb-ai-hint--above">
          Add awards, publications, speaking engagements, and notable achievements.
        </span>

        <!-- Existing Achievements Tags -->
        <div v-if="achievements.length > 0" class="gmkb-ai-tags">
          <div
            v-for="(achievement, index) in achievements"
            :key="`ach-${index}`"
            class="gmkb-ai-tag"
          >
            <span>{{ achievement }}</span>
            <button
              type="button"
              class="gmkb-ai-tag__remove"
              @click="removeAchievement(index)"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Add Achievement Input -->
        <div class="gmkb-ai-tag-input">
          <input
            v-model="newAchievement"
            type="text"
            class="gmkb-ai-input"
            placeholder="e.g., TEDx Speaker, Forbes 30 Under 30..."
            @keydown.enter.prevent="handleAddAchievement"
          />
          <button
            type="button"
            class="gmkb-ai-button gmkb-ai-button--secondary"
            :disabled="!newAchievement.trim()"
            @click="handleAddAchievement"
          >
            Add
          </button>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="gmkb-ai-impact-stats">
        <div class="gmkb-ai-impact-stat">
          <span class="gmkb-ai-impact-stat__value">{{ credentials.length }}</span>
          <span class="gmkb-ai-impact-stat__label">Credentials</span>
        </div>
        <div class="gmkb-ai-impact-stat">
          <span class="gmkb-ai-impact-stat__value">{{ achievements.length }}</span>
          <span class="gmkb-ai-impact-stat__label">Achievements</span>
        </div>
        <div class="gmkb-ai-impact-stat">
          <span class="gmkb-ai-impact-stat__value">{{ totalItems }}</span>
          <span class="gmkb-ai-impact-stat__label">Total Items</span>
        </div>
      </div>
    </div>

    <!-- Results (Preview) -->
    <template #results>
      <div v-if="hasMinimumData" class="gmkb-ai-impact-preview">
        <h4 class="gmkb-ai-impact-preview__title">Impact Summary</h4>
        <p class="gmkb-ai-impact-preview__text">{{ impactSummary }}</p>
        <span class="gmkb-ai-hint">
          This summary can be used in your guest introduction.
        </span>
      </div>
    </template>

    <!-- Footer Actions -->
    <template #footer>
      <button
        v-if="totalItems > 0"
        type="button"
        class="gmkb-ai-button gmkb-ai-button--ghost"
        @click="handleReset"
      >
        Clear All
      </button>
      <button
        type="button"
        class="gmkb-ai-button gmkb-ai-button--secondary"
        :disabled="!hasMinimumData"
        @click="handleCopy"
      >
        Copy Summary
      </button>
      <button
        v-if="mode === 'integrated'"
        type="button"
        class="gmkb-ai-button gmkb-ai-button--primary"
        :disabled="!hasMinimumData"
        @click="handleApply"
      >
        Apply to Media Kit
      </button>
    </template>
  </AiWidgetFrame>

  <!-- Examples Modal -->
  <div
    v-if="showExamplesModal"
    class="gmkb-ai-modal gmkb-ai-modal--open"
    @click.self="showExamplesModal = false"
  >
    <div class="gmkb-ai-modal__container">
      <div class="gmkb-ai-modal__header">
        <h3 class="gmkb-ai-modal__title">{{ selectedType?.label }} Examples</h3>
        <button
          type="button"
          class="gmkb-ai-modal__close"
          @click="showExamplesModal = false"
        >
          &times;
        </button>
      </div>
      <div class="gmkb-ai-modal__body">
        <p class="gmkb-ai-hint">Click to add to your credentials:</p>
        <div class="gmkb-ai-examples">
          <button
            v-for="example in selectedType?.examples"
            :key="example"
            type="button"
            class="gmkb-ai-example"
            @click="addExampleCredential(example)"
          >
            {{ example }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useImpactIntro, CREDENTIAL_TYPES } from '@composables/useImpactIntro';
import AiWidgetFrame from '@ai/AiWidgetFrame.vue';

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
  }
});

const emit = defineEmits(['applied', 'change']);

// Use composable
const {
  credentials,
  achievements,
  newCredential,
  newAchievement,
  impactSummary,
  hasMinimumData,
  totalItems,
  addCredential,
  removeCredential,
  addAchievement,
  removeAchievement,
  reset,
  copySummaryToClipboard,
  syncFromStore
} = useImpactIntro();

// Modal state
const showExamplesModal = ref(false);
const selectedType = ref(null);

/**
 * Show examples modal for a credential type
 */
const showCredentialExamples = (type) => {
  selectedType.value = type;
  showExamplesModal.value = true;
};

/**
 * Add example credential from modal
 */
const addExampleCredential = (example) => {
  addCredential(example);
  showExamplesModal.value = false;
  emitChange();
};

/**
 * Handle adding a credential
 */
const handleAddCredential = () => {
  if (addCredential()) {
    emitChange();
  }
};

/**
 * Handle adding an achievement
 */
const handleAddAchievement = () => {
  if (addAchievement()) {
    emitChange();
  }
};

/**
 * Handle reset
 */
const handleReset = () => {
  reset();
  emitChange();
};

/**
 * Handle copy
 */
const handleCopy = async () => {
  await copySummaryToClipboard();
};

/**
 * Handle apply (integrated mode)
 */
const handleApply = () => {
  emit('applied', {
    componentId: props.componentId,
    credentials: credentials.value,
    achievements: achievements.value,
    summary: impactSummary.value
  });
};

/**
 * Emit change event
 */
const emitChange = () => {
  emit('change', {
    credentials: credentials.value,
    achievements: achievements.value
  });
};

/**
 * Sync from store on mount
 */
onMounted(() => {
  syncFromStore();
});
</script>

<style scoped>
.gmkb-ai-hint--above {
  margin-bottom: 8px;
  display: block;
}

.gmkb-ai-suggestions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 8px;
  margin-top: 12px;
}

.gmkb-ai-suggestions__label {
  font-size: 12px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}

.gmkb-ai-suggestion {
  padding: 4px 10px;
  font-size: 12px;
  font-family: inherit;
  color: var(--gmkb-ai-primary, #6366f1);
  background: rgba(99, 102, 241, 0.1);
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gmkb-ai-suggestion:hover {
  background: rgba(99, 102, 241, 0.2);
}

.gmkb-ai-impact-stats {
  display: flex;
  gap: 24px;
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid var(--gmkb-ai-border, #e5e7eb);
}

.gmkb-ai-impact-stat {
  text-align: center;
}

.gmkb-ai-impact-stat__value {
  display: block;
  font-size: 24px;
  font-weight: 700;
  color: var(--gmkb-ai-primary, #6366f1);
}

.gmkb-ai-impact-stat__label {
  font-size: 12px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}

.gmkb-ai-impact-preview {
  padding: 16px;
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid #34d399;
  border-radius: var(--gmkb-ai-radius-md, 8px);
}

.gmkb-ai-impact-preview__title {
  margin: 0 0 8px 0;
  font-size: 12px;
  font-weight: 600;
  color: #047857;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.gmkb-ai-impact-preview__text {
  margin: 0 0 8px 0;
  font-size: 15px;
  line-height: 1.6;
  color: #065f46;
}

.gmkb-ai-examples {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.gmkb-ai-example {
  padding: 8px 16px;
  font-size: 14px;
  font-family: inherit;
  color: var(--gmkb-ai-text, #1f2937);
  background: var(--gmkb-ai-bg-tertiary, #f3f4f6);
  border: 1px solid var(--gmkb-ai-border, #e5e7eb);
  border-radius: 20px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.gmkb-ai-example:hover {
  border-color: var(--gmkb-ai-primary, #6366f1);
  background: rgba(99, 102, 241, 0.1);
}
</style>
