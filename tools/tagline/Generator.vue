<template>
  <!-- Integrated Mode: Compact widget for Media Kit Builder -->
  <AiWidgetFrame
    v-if="mode === 'integrated'"
    title="Tagline Generator"
    description="Create memorable taglines that capture your unique value proposition."
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasTaglines"
    :error="error"
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
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Your Name (Optional)</label>
        <input
          v-model="name"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Jane Smith"
        />
      </div>

      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">What You Do</label>
        <textarea
          v-model="authorityHookText"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="e.g., I help entrepreneurs build sustainable businesses through strategic planning and mindset coaching..."
          rows="3"
        ></textarea>
        <span class="gmkb-ai-hint">Describe your work and the transformation you provide.</span>
      </div>

      <AiToneSelector v-model="tone" />

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

        <!-- Navigation -->
        <div class="gmkb-ai-taglines__nav">
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
      </div>
    </template>
  </AiWidgetFrame>

  <!-- Default/Standalone Mode: Full Self-Contained Tool -->
  <div v-else class="gfy-tool gfy-tool--tagline">
    <!-- Phase 1: Input Form -->
    <div v-if="!showResults" class="gfy-tool__form-phase">
      <!-- Hero Section -->
      <div v-if="mode === 'default'" class="gfy-tool__hero">
        <h1 class="gfy-tool__title">Tagline Generator</h1>
        <p class="gfy-tool__subtitle">
          Create memorable taglines that capture your unique value proposition and stick in people's minds.
        </p>
      </div>

      <!-- Form Container -->
      <div class="gfy-tool__form-container" :class="{ 'gfy-tool__form-container--embedded': mode === 'embedded' }">
        <!-- Basic Information Section -->
        <div class="gfy-highlight-box gfy-highlight-box--blue">
          <div class="gfy-highlight-box__header">
            <span class="gfy-highlight-box__icon">
              <i class="fas fa-user"></i>
            </span>
            <div>
              <h3 class="gfy-highlight-box__title">Your Information</h3>
              <p class="gfy-highlight-box__subtitle">Tell us about yourself and your work.</p>
            </div>
          </div>

          <div class="gfy-form-group">
            <label class="gfy-form-label">
              Your Name or Brand
              <span class="gfy-form-label__optional">Optional</span>
            </label>
            <input
              v-model="name"
              type="text"
              class="gfy-form-input"
              placeholder="e.g., Jane Smith or Acme Coaching"
            />
            <span class="gfy-form-hint">Personalize your tagline with your name or brand.</span>
          </div>
        </div>

        <!-- Value Proposition Section -->
        <div class="gfy-highlight-box gfy-highlight-box--green">
          <div class="gfy-highlight-box__header">
            <span class="gfy-highlight-box__icon">
              <i class="fas fa-bullhorn"></i>
            </span>
            <div>
              <h3 class="gfy-highlight-box__title">Your Value Proposition</h3>
              <p class="gfy-highlight-box__subtitle">What transformation do you provide? Who do you help?</p>
            </div>
          </div>

          <div class="gfy-form-group">
            <label class="gfy-form-label gfy-form-label--required">What You Do</label>
            <textarea
              v-model="authorityHookText"
              class="gfy-form-textarea"
              placeholder="e.g., I help entrepreneurs build sustainable businesses through strategic planning and mindset coaching. I work with founders who are stuck at a growth plateau and help them break through to their next level of success."
              rows="4"
            ></textarea>
            <span class="gfy-form-hint">
              Describe your work, who you help, and the results you deliver. The more specific, the better your taglines will be.
            </span>
          </div>

          <!-- Live Preview -->
          <div v-if="authorityHookText.trim()" class="gfy-live-preview">
            <span class="gfy-live-preview__label">Preview:</span>
            {{ valuePropositionPreview }}
          </div>
        </div>

        <!-- Tone Selection Section -->
        <div class="gfy-highlight-box gfy-highlight-box--amber">
          <div class="gfy-highlight-box__header">
            <span class="gfy-highlight-box__icon">
              <i class="fas fa-palette"></i>
            </span>
            <div>
              <h3 class="gfy-highlight-box__title">Tagline Style</h3>
              <p class="gfy-highlight-box__subtitle">Choose the voice and feel of your taglines.</p>
            </div>
          </div>

          <div class="gfy-form-group">
            <label class="gfy-form-label">Tone</label>
            <select v-model="tone" class="gfy-form-select">
              <option value="professional">Professional</option>
              <option value="conversational">Conversational</option>
              <option value="authoritative">Authoritative</option>
              <option value="friendly">Friendly</option>
            </select>
            <span class="gfy-form-hint">This influences the mood and style of your taglines.</span>
          </div>
        </div>

        <!-- Generate Button -->
        <div v-if="mode === 'default'" class="gfy-tool__actions">
          <button
            type="button"
            class="gfy-btn gfy-btn--primary gfy-btn--large gfy-btn--generate"
            :disabled="!canGenerate || isGenerating"
            @click="handleStartGeneration"
          >
            <i v-if="!isGenerating" class="fas fa-magic"></i>
            <span v-if="isGenerating" class="gfy-spinner"></span>
            {{ isGenerating ? 'Generating...' : 'Generate 5 Taglines' }}
          </button>
          <p class="gfy-tool__actions-hint">
            We'll create 5 unique taglines based on your value proposition
          </p>
        </div>

        <!-- Error Display -->
        <div v-if="error" class="gfy-error-box">
          <i class="fas fa-exclamation-circle"></i>
          <p>{{ error }}</p>
          <button type="button" class="gfy-btn gfy-btn--outline" @click="handleStartGeneration">
            Try Again
          </button>
        </div>
      </div>
    </div>

    <!-- Phase 2: Results Dashboard -->
    <div v-else class="gfy-tool__results-phase">
      <!-- Results Hero -->
      <div class="gfy-tool__hero gfy-tool__hero--compact">
        <h1 class="gfy-tool__title">Your Taglines</h1>
        <p class="gfy-tool__subtitle">
          Select your favorite tagline. Click to choose, then lock it in.
        </p>
      </div>

      <div class="gfy-results-container">
        <div class="gfy-results-layout">
          <!-- SIDEBAR: Tagline Selection -->
          <aside class="gfy-results-layout__sidebar">
            <div class="gfy-sidebar-panel">
              <div class="gfy-sidebar-header">
                <h3 class="gfy-sidebar-title">Your Taglines</h3>
              </div>

              <!-- Tagline Slots -->
              <button
                v-for="(tagline, index) in taglines"
                :key="index"
                type="button"
                class="gfy-sidebar-slot"
                :class="{
                  'gfy-sidebar-slot--active': selectedIndex === index,
                  'gfy-sidebar-slot--locked': lockedIndex === index
                }"
                @click="handleSelectTagline(index)"
              >
                <div class="gfy-sidebar-slot__header">
                  <span class="gfy-sidebar-slot__label">Option {{ index + 1 }}</span>
                  <i v-if="lockedIndex === index" class="fas fa-lock gfy-sidebar-slot__icon--locked"></i>
                  <i v-else-if="selectedIndex === index" class="fas fa-check-circle gfy-sidebar-slot__icon--selected"></i>
                </div>
                <div class="gfy-sidebar-slot__text">"{{ tagline }}"</div>
              </button>

              <!-- Locked Summary -->
              <div v-if="lockedIndex !== null" class="gfy-sidebar-summary">
                <i class="fas fa-lock"></i>
                Tagline locked
              </div>
            </div>
          </aside>

          <!-- MAIN: Selected Tagline Display -->
          <main class="gfy-results-layout__main">
            <!-- Results Header -->
            <div class="gfy-results__header">
              <h3 class="gfy-results__title">
                <span class="gfy-results__title-highlight">Selected Tagline</span>
              </h3>
            </div>

            <!-- Loading State -->
            <div v-if="isGenerating" class="gfy-loading-state">
              <div class="gfy-loading-spinner"></div>
              <p>Generating your taglines...</p>
            </div>

            <!-- Locked State -->
            <template v-else-if="lockedIndex !== null">
              <div class="gfy-locked-content">
                <div class="gfy-locked-content__badge">
                  <i class="fas fa-lock"></i>
                  LOCKED TAGLINE
                </div>
                <div class="gfy-locked-content__text">
                  "{{ taglines[lockedIndex] }}"
                </div>
                <div class="gfy-locked-content__actions">
                  <button type="button" class="gfy-btn gfy-btn--outline" @click="handleCopy">
                    <i class="fas fa-copy"></i> Copy
                  </button>
                  <button type="button" class="gfy-btn gfy-btn--ghost" @click="unlockTagline">
                    <i class="fas fa-unlock"></i> Unlock & Edit
                  </button>
                </div>
              </div>
            </template>

            <!-- Selected Preview -->
            <template v-else-if="selectedTagline">
              <div class="gfy-result-card gfy-result-card--tagline">
                <div class="gfy-result-card__badge">Option {{ selectedIndex + 1 }}</div>
                <div class="gfy-result-card__content">
                  <p class="gfy-result-card__text gfy-result-card__text--tagline">
                    "{{ selectedTagline }}"
                  </p>
                  <div class="gfy-result-card__actions">
                    <button
                      type="button"
                      class="gfy-btn gfy-btn--primary"
                      @click="lockTagline(selectedIndex)"
                    >
                      <i class="fas fa-lock"></i>
                      Lock This Tagline
                    </button>
                    <button
                      type="button"
                      class="gfy-btn gfy-btn--outline"
                      @click="handleCopy"
                    >
                      <i class="fas fa-copy"></i> Copy
                    </button>
                  </div>
                </div>
              </div>

              <!-- Navigation -->
              <div class="gfy-nav">
                <button
                  type="button"
                  class="gfy-btn gfy-btn--outline"
                  :disabled="selectedIndex <= 0"
                  @click="selectPrevious"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="15 18 9 12 15 6"/>
                  </svg>
                  Previous
                </button>
                <span class="gfy-nav__count">
                  {{ selectedIndex + 1 }} / {{ taglines.length }}
                </span>
                <button
                  type="button"
                  class="gfy-btn gfy-btn--outline"
                  :disabled="selectedIndex >= taglines.length - 1"
                  @click="selectNext"
                >
                  Next
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <polyline points="9 18 15 12 9 6"/>
                  </svg>
                </button>
              </div>
            </template>

            <!-- Empty State -->
            <div v-else class="gfy-empty-state">
              <i class="fas fa-quote-left"></i>
              <p>Select a tagline from the sidebar to preview it.</p>
            </div>

            <!-- Footer Actions -->
            <div class="gfy-tool__footer">
              <button type="button" class="gfy-btn gfy-btn--outline" @click="handleGenerate">
                <i class="fas fa-sync-alt"></i>
                Regenerate All
              </button>
              <button type="button" class="gfy-btn gfy-btn--ghost" @click="handleStartOver">
                Start Over
              </button>
            </div>

            <!-- Copy Success -->
            <div v-if="copySuccess" class="gfy-copy-success">
              <i class="fas fa-check-circle"></i>
              Copied to clipboard!
            </div>
          </main>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup>
/**
 * Tagline Generator - Self-Contained Tool
 *
 * ARCHITECTURE:
 * - This component is FULLY SELF-CONTAINED
 * - It imports shared CSS for styling consistency
 * - NO component dependencies on other tools
 * - If this tool breaks, other tools are unaffected
 *
 * @package GMKB
 * @subpackage Tools/Tagline
 */

import { ref, computed, onMounted, watch, inject } from 'vue';
import { useAITagline } from '../../src/composables/useAITagline';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared/constants';

// Integrated mode components only
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../src/vue/components/ai/AiToneSelector.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';

const props = defineProps({
  /**
   * Mode: 'default', 'integrated', or 'embedded'
   * - default: Full two-phase layout (form -> results dashboard)
   * - integrated: Compact widget for embedding in Media Kit Builder
   * - embedded: Landing page embed with simplified form
   */
  mode: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'integrated', 'embedded'].includes(v)
  },
  /**
   * Component ID to apply results to (integrated mode)
   * Used when embedding in Media Kit Builder to identify target component
   */
  componentId: {
    type: String,
    default: null
  },
  /**
   * Intent object for embedded mode
   * Contains: { id, label, contextHeading, contextDescription, formPlaceholders, formLabels }
   */
  intent: {
    type: Object,
    default: null
  },
  /**
   * Profile data for pre-population (embedded mode)
   * Passed from EmbeddedToolWrapper via scoped slot
   */
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated', 'preview-update', 'update:can-generate']);

// Inject profile data from EmbeddedToolWrapper
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

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

const { authorityHookSummary, syncFromStore, loadFromProfileData } = useAuthorityHook();

// Local state
const name = ref('');
const authorityHookText = ref('');
const showResults = ref(false);
const lockedIndex = ref(null);
const copySuccess = ref(false);

// Can generate check
const canGenerate = computed(() => authorityHookText.value.trim().length > 0);

// Value proposition preview for live preview
const valuePropositionPreview = computed(() => {
  const text = authorityHookText.value.trim();
  if (!text) return '';
  if (text.length <= 100) return text;
  return text.substring(0, 100) + '...';
});

// Handle tagline selection
const handleSelectTagline = (index) => {
  selectTagline(index);
};

// Lock a tagline
const lockTagline = (index) => {
  lockedIndex.value = index;
};

// Unlock tagline
const unlockTagline = () => {
  lockedIndex.value = null;
};

// Handle starting generation - transitions to results view
const handleStartGeneration = async () => {
  showResults.value = true;
  await handleGenerate();
};

// Handle generate button click
const handleGenerate = async () => {
  lockedIndex.value = null;

  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    await generate({
      name: name.value,
      authorityHook: authorityHookText.value
    }, context);

    emit('generated', { taglines: taglines.value });
  } catch (err) {
    console.error('[TaglineGenerator] Generation failed:', err);
  }
};

/**
 * Show copy success feedback with auto-dismiss
 * Extracted to reduce duplication across copy handlers
 */
const showCopySuccess = () => {
  copySuccess.value = true;
  setTimeout(() => { copySuccess.value = false; }, 2000);
};

// Handle copy to clipboard
const handleCopy = async () => {
  await copyToClipboard();
  showCopySuccess();
};

// Handle apply (integrated mode)
const handleApply = () => {
  emit('applied', {
    componentId: props.componentId,
    tagline: selectedTagline.value,
    allTaglines: taglines.value
  });
};

// Handle start over
const handleStartOver = () => {
  lockedIndex.value = null;
  showResults.value = false;
};

// Populate form fields from profile data
function populateFromProfile(profileData) {
  if (!profileData) return;

  const firstName = profileData.first_name || '';
  const lastName = profileData.last_name || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  if (fullName && !name.value) name.value = fullName;

  if (profileData.authority_hook && !authorityHookText.value) {
    authorityHookText.value = profileData.authority_hook;
  }

  loadFromProfileData(profileData);
}

// Sync authority hook from store on mount
onMounted(() => {
  syncFromStore();
  if (authorityHookSummary.value) authorityHookText.value = authorityHookSummary.value;
});

// Watch for store changes
watch(authorityHookSummary, (newVal) => {
  if (newVal && !authorityHookText.value) authorityHookText.value = newVal;
});

// Watch for injected profile data from EmbeddedToolWrapper
watch(injectedProfileData, (newData) => {
  if (newData) populateFromProfile(newData);
}, { immediate: true });

// Watch for profileData prop changes
watch(() => props.profileData, (newData) => {
  if (newData && props.mode === 'embedded') populateFromProfile(newData);
}, { immediate: true });

// Current intent for embedded mode
const currentIntent = computed(() => props.intent || null);

// Generate preview text for embedded mode
const embeddedPreviewText = computed(() => {
  if (!name.value) return null;
  return `<strong>Professional tagline</strong> for <strong>${name.value}</strong>`;
});

// Watch for field changes in embedded mode
watch(() => name.value, () => {
  if (props.mode === 'embedded') {
    emit('preview-update', {
      previewHtml: embeddedPreviewText.value,
      fields: { name: name.value }
    });
  }
});

// Emit can-generate status changes
watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
}, { immediate: true });

// Expose for parent components
defineExpose({
  handleStartGeneration,
  handleGenerate,
  showResults,
  isGenerating,
  error,
  canGenerate
});
</script>

<style>
/**
 * SHARED CSS IMPORT
 * Import design tokens and base styles for consistency.
 * This tool remains self-contained - these are just CSS classes.
 */
@import '@/styles/gfy-design-tokens.css';
@import '@/styles/gfy-tool-base.css';
</style>

<style scoped>
/**
 * TOOL-SPECIFIC STYLES
 * Only styles unique to this tool go here.
 * All common styles come from gfy-tool-base.css
 */

/* Results title highlight */
.gfy-results__title-highlight {
  color: var(--gfy-primary-color);
}

/* Sidebar slot icon states */
.gfy-sidebar-slot__icon--locked {
  color: var(--gfy-primary-color);
}

.gfy-sidebar-slot__icon--selected {
  color: var(--gfy-success-color);
}

/* Tagline-specific result card styling */
.gfy-result-card--tagline {
  text-align: center;
  padding: 32px;
}

.gfy-result-card__badge {
  display: inline-block;
  background: var(--gfy-primary-light);
  color: var(--gfy-primary-dark);
  font-size: 12px;
  font-weight: 600;
  padding: 4px 12px;
  border-radius: var(--gfy-radius-full);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 16px;
}

.gfy-result-card__text--tagline {
  font-size: 24px;
  font-weight: 600;
  font-style: italic;
  color: var(--gfy-text-primary);
  line-height: 1.4;
  margin-bottom: 24px;
}

/* Locked content styling */
.gfy-locked-content {
  text-align: center;
  padding: 40px;
  background: linear-gradient(135deg, var(--gfy-primary-light) 0%, #dbeafe 100%);
  border: 2px solid var(--gfy-primary-color);
  border-radius: var(--gfy-radius-lg);
}

.gfy-locked-content__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  background: var(--gfy-primary-color);
  color: white;
  font-size: 12px;
  font-weight: 700;
  padding: 6px 16px;
  border-radius: var(--gfy-radius-full);
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 20px;
}

.gfy-locked-content__text {
  font-size: 28px;
  font-weight: 600;
  font-style: italic;
  color: var(--gfy-primary-darker);
  line-height: 1.4;
  margin-bottom: 24px;
}

.gfy-locked-content__actions {
  display: flex;
  gap: 12px;
  justify-content: center;
}

/* Sidebar slot text styling for taglines */
.gfy-sidebar-slot__text {
  font-size: 13px;
  color: var(--gfy-text-secondary);
  font-style: italic;
  line-height: 1.4;
  margin-top: 8px;
  overflow: hidden;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.gfy-sidebar-slot--active .gfy-sidebar-slot__text,
.gfy-sidebar-slot--locked .gfy-sidebar-slot__text {
  color: var(--gfy-text-primary);
}

/* Integrated Mode Styles */
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
  margin-top: 16px;
}

.gmkb-ai-taglines__nav-count {
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}
</style>
