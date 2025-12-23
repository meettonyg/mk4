<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Impact Intro Builder"
    subtitle="Build your credentials and achievements for powerful guest introductions"
    intro-text="Create a compelling impact introduction by collecting your credentials, qualifications, achievements, and recognition. Your impact intro establishes immediate credibility and showcases your authority when being introduced as a podcast guest or speaker."
    generator-type="impact-intro"
    :has-results="hasMinimumData"
    :is-loading="false"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Credentials Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Credentials & Qualifications</h3>
        <p class="generator__field-helper">
          Add degrees, certifications, titles, and professional qualifications.
        </p>

        <!-- Existing Credentials Tags -->
        <div v-if="credentials.length > 0" class="generator__tags">
          <div
            v-for="(credential, index) in credentials"
            :key="`cred-${index}`"
            class="generator__tag"
          >
            <span>{{ credential }}</span>
            <button
              type="button"
              class="generator__tag-remove"
              @click="removeCredential(index)"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Add Credential Input -->
        <div class="generator__tag-input">
          <input
            v-model="newCredential"
            type="text"
            class="generator__field-input"
            placeholder="e.g., PhD, MBA, ICF Certified Coach..."
            @keydown.enter.prevent="handleAddCredential"
          />
          <button
            type="button"
            class="generator__button generator__button--outline"
            :disabled="!newCredential.trim()"
            @click="handleAddCredential"
          >
            Add
          </button>
        </div>

        <!-- Credential Suggestions -->
        <div class="generator__suggestions">
          <span class="generator__suggestions-label">Quick add:</span>
          <button
            v-for="type in CREDENTIAL_TYPES"
            :key="type.value"
            type="button"
            class="generator__suggestion"
            @click="showCredentialExamples(type)"
          >
            {{ type.label }}
          </button>
        </div>
      </div>

      <!-- Achievements Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Achievements & Recognition</h3>
        <p class="generator__field-helper">
          Add awards, publications, speaking engagements, and notable achievements.
        </p>

        <!-- Existing Achievements Tags -->
        <div v-if="achievements.length > 0" class="generator__tags">
          <div
            v-for="(achievement, index) in achievements"
            :key="`ach-${index}`"
            class="generator__tag"
          >
            <span>{{ achievement }}</span>
            <button
              type="button"
              class="generator__tag-remove"
              @click="removeAchievement(index)"
            >
              &times;
            </button>
          </div>
        </div>

        <!-- Add Achievement Input -->
        <div class="generator__tag-input">
          <input
            v-model="newAchievement"
            type="text"
            class="generator__field-input"
            placeholder="e.g., TEDx Speaker, Forbes 30 Under 30..."
            @keydown.enter.prevent="handleAddAchievement"
          />
          <button
            type="button"
            class="generator__button generator__button--outline"
            :disabled="!newAchievement.trim()"
            @click="handleAddAchievement"
          >
            Add
          </button>
        </div>
      </div>

      <!-- Summary Stats -->
      <div class="generator__impact-stats">
        <div class="generator__impact-stat">
          <span class="generator__impact-stat-value">{{ credentials.length }}</span>
          <span class="generator__impact-stat-label">Credentials</span>
        </div>
        <div class="generator__impact-stat">
          <span class="generator__impact-stat-value">{{ achievements.length }}</span>
          <span class="generator__impact-stat-label">Achievements</span>
        </div>
        <div class="generator__impact-stat">
          <span class="generator__impact-stat-value">{{ totalItems }}</span>
          <span class="generator__impact-stat-label">Total Items</span>
        </div>
      </div>

      <!-- Actions -->
      <div class="generator__actions">
        <button
          v-if="totalItems > 0"
          type="button"
          class="generator__button generator__button--outline"
          @click="handleReset"
        >
          Clear All
        </button>
        <button
          type="button"
          class="generator__button generator__button--call-to-action"
          :disabled="!hasMinimumData"
          @click="handleCopy"
        >
          Copy Summary
        </button>
      </div>
    </template>

    <!-- Right Panel: Guidance -->
    <template #right>
      <GuidancePanel
        title="Building Your Impact Introduction"
        subtitle="Your Impact Intro establishes immediate credibility by showcasing your credentials, achievements, and professional recognition."
        :formula="impactIntroFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Impact Introductions:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div v-if="hasMinimumData" class="generator__impact-preview">
        <div class="generator__impact-preview-header">
          <h3>Your Impact Summary</h3>
          <p>Use this in your guest introduction</p>
        </div>
        <div class="generator__impact-preview-content">
          <p>{{ impactSummary }}</p>
        </div>
        <div class="generator__impact-preview-footer">
          <button
            type="button"
            class="generator__button generator__button--outline"
            @click="handleCopy"
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            Copy to Clipboard
          </button>
        </div>
      </div>
    </template>
  </GeneratorLayout>

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else
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
import { useImpactIntro, CREDENTIAL_TYPES } from '../../../composables/useImpactIntro';
import AiWidgetFrame from './AiWidgetFrame.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel } from '../ai-tools/_shared';

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
 * Impact intro formula for guidance panel
 */
const impactIntroFormula = 'I\'ve helped <span class="generator__highlight">[NUMBER]</span> <span class="generator__highlight">[WHO]</span> achieve <span class="generator__highlight">[SPECIFIC RESULT]</span> in <span class="generator__highlight">[TIMEFRAME]</span>';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Impact Intros Matter',
    description: 'Your impact introduction is the first thing a podcast host reads when introducing you as a guest. It establishes your credibility immediately by highlighting your most impressive credentials, achievements, and recognition. A strong impact intro sets the tone for the entire conversation and signals to the audience that you\'re an authority worth listening to.'
  },
  {
    title: 'What Makes Them Compelling',
    description: 'The most compelling impact intros combine three elements: specific credentials (degrees, certifications, titles), notable achievements (awards, publications, speaking), and quantifiable results (number of clients helped, years of experience, size of audience). Focus on quality over quantity - choose the credentials and achievements that are most relevant to your authority and most impressive to your target audience.'
  },
  {
    title: 'Where to Use Impact Intros',
    description: 'Use your impact intro in podcast guest applications, speaker bio submissions, media kit introductions, conference proposals, and any situation where someone else will be introducing you. Keep multiple versions with different combinations of credentials and achievements so you can customize based on the audience and context.'
  }
];

/**
 * Example impact intros for guidance panel
 */
const examples = [
  {
    title: 'Business Coach Impact Intro:',
    description: 'Dr. Sarah Johnson holds a PhD in Organizational Psychology and is an ICF Master Certified Coach. She\'s a TEDx speaker, author of the bestselling book "Leading with Purpose," and has been featured in Forbes, Entrepreneur, and Inc. Magazine for her innovative approach to leadership development.'
  },
  {
    title: 'Marketing Expert Impact Intro:',
    description: 'Michael Chen is a certified Google Analytics expert and Facebook Blueprint certified professional. He\'s spoken at Social Media Marketing World, Content Marketing World, and has helped over 500 businesses increase their digital presence. His work has been featured in Marketing Week and The Drum.'
  }
];

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
/* Standalone Mode Styles */
.generator__section {
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.generator__section-title {
  font-size: var(--mkcg-font-size-lg, 18px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
  margin: 0 0 var(--mkcg-space-sm, 12px) 0;
}

.generator__tags {
  display: flex;
  flex-wrap: wrap;
  gap: var(--mkcg-space-xs, 8px);
  margin-bottom: var(--mkcg-space-sm, 12px);
}

.generator__tag {
  display: inline-flex;
  align-items: center;
  gap: var(--mkcg-space-xs, 8px);
  padding: var(--mkcg-space-xs, 8px) var(--mkcg-space-sm, 12px);
  background: var(--mkcg-bg-secondary, #f8f9fa);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius-sm, 4px);
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.generator__tag-remove {
  background: none;
  border: none;
  padding: 0;
  margin: 0;
  font-size: 18px;
  line-height: 1;
  color: var(--mkcg-text-secondary, #5a6d7e);
  cursor: pointer;
  transition: color var(--mkcg-transition-fast, 0.15s ease);
}

.generator__tag-remove:hover {
  color: var(--mkcg-danger, #dc3545);
}

.generator__tag-input {
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
  margin-bottom: var(--mkcg-space-sm, 12px);
}

.generator__tag-input input {
  flex: 1;
}

.generator__suggestions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: var(--mkcg-space-xs, 8px);
}

.generator__suggestions-label {
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.generator__suggestion {
  padding: var(--mkcg-space-xs, 8px) var(--mkcg-space-sm, 12px);
  font-size: var(--mkcg-font-size-sm, 14px);
  font-family: inherit;
  color: var(--mkcg-primary, #1a9bdc);
  background: rgba(26, 155, 220, 0.1);
  border: none;
  border-radius: var(--mkcg-radius-sm, 4px);
  cursor: pointer;
  transition: all var(--mkcg-transition-fast, 0.15s ease);
}

.generator__suggestion:hover {
  background: rgba(26, 155, 220, 0.2);
}

.generator__impact-stats {
  display: flex;
  gap: var(--mkcg-space-lg, 30px);
  margin-top: var(--mkcg-space-md, 20px);
  padding-top: var(--mkcg-space-md, 20px);
  border-top: 1px solid var(--mkcg-border-light, #e9ecef);
}

.generator__impact-stat {
  text-align: center;
}

.generator__impact-stat-value {
  display: block;
  font-size: var(--mkcg-font-size-2xl, 24px);
  font-weight: var(--mkcg-font-weight-bold, 700);
  color: var(--mkcg-primary, #1a9bdc);
}

.generator__impact-stat-label {
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.generator__actions {
  margin-top: var(--mkcg-space-lg, 30px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
  justify-content: flex-end;
}

.generator__impact-preview {
  padding: var(--mkcg-space-md, 20px);
}

.generator__impact-preview-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.generator__impact-preview-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.generator__impact-preview-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.generator__impact-preview-content {
  padding: var(--mkcg-space-md, 20px);
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  border: 1px solid #34d399;
  border-radius: var(--mkcg-radius, 8px);
  margin-bottom: var(--mkcg-space-md, 20px);
}

.generator__impact-preview-content p {
  margin: 0;
  font-size: var(--mkcg-font-size-base, 15px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
  color: #065f46;
}

.generator__impact-preview-footer {
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

/* Integrated Mode Styles (preserved from original) */
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
