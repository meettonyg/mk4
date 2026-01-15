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

  <!-- Default/Standalone Mode: Full Tagline Toolkit -->
  <div v-else class="gfy-tagline-generator">
    <!-- Phase 1: Input Form -->
    <div v-if="!showResults" class="gfy-tagline-form">
      <!-- Hero Section (only show in default mode, not embedded) -->
      <div v-if="mode === 'default'" class="gfy-tagline-hero">
        <h1 class="gfy-tagline-hero__title">Tagline Generator</h1>
        <p class="gfy-tagline-hero__subtitle">
          Create memorable taglines that capture your unique value proposition and stick in people's minds.
        </p>
      </div>

      <!-- Form Container -->
      <div class="gfy-tagline-form__container" :class="{ 'gfy-tagline-form__container--embedded': mode === 'embedded' }">
        <!-- Basic Information -->
        <div class="gfy-form-section">
          <h3 class="gfy-form-section__title">
            <span class="gfy-form-section__icon">
              <i class="fas fa-user"></i>
            </span>
            Basic Information
          </h3>

          <div class="gfy-form-grid">
            <div class="gfy-form-group">
              <label class="gfy-form-label">Your Name or Brand</label>
              <input
                v-model="name"
                type="text"
                class="gfy-form-input"
                placeholder="e.g., Jane Smith or Acme Coaching"
              />
              <span class="gfy-form-hint">Optional: Personalize your tagline with your name.</span>
            </div>
          </div>
        </div>

        <!-- Authority Hook Section -->
        <div class="gfy-highlight-box gfy-highlight-box--blue">
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
            {{ hookPreview }}
          </div>
        </div>

        <!-- Tone Selection -->
        <div class="gfy-highlight-box gfy-highlight-box--green">
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
          </div>
        </div>

        <!-- Generate Button (only show in default mode) -->
        <div v-if="mode === 'default'" class="gfy-form-actions">
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
          <p class="gfy-form-actions__hint">
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
    <div v-else class="gfy-tagline-results">
      <!-- Results Hero -->
      <div class="gfy-tagline-hero gfy-tagline-hero--compact">
        <h1 class="gfy-tagline-hero__title">Your Taglines</h1>
        <p class="gfy-tagline-hero__subtitle">
          Select your favorite tagline. Click to choose, then lock it in.
        </p>
      </div>

      <div class="gmkb-tool-embed">
        <div class="gfy-results-layout">
          <!-- SIDEBAR: Tagline Selection -->
          <aside class="gfy-layout-sidebar">
            <div class="gfy-current-topics">
              <div class="gfy-sidebar-header">
                <h3 class="gfy-sidebar-title">Your Taglines</h3>
              </div>

              <!-- Tagline Slots -->
              <button
                v-for="(tagline, index) in taglines"
                :key="index"
                type="button"
                class="gfy-tagline-slot"
                :class="{
                  'gfy-tagline-slot--active': selectedIndex === index,
                  'gfy-tagline-slot--locked': lockedIndex === index
                }"
                @click="handleSelectTagline(index)"
              >
                <div class="gfy-tagline-slot__header">
                  <span class="gfy-tagline-slot__label">Option {{ index + 1 }}</span>
                  <i v-if="lockedIndex === index" class="fas fa-lock" style="color: var(--gfy-primary-color);"></i>
                  <i v-else-if="selectedIndex === index" class="fas fa-check-circle" style="color: var(--gfy-success-color);"></i>
                </div>
                <div class="gfy-tagline-slot__text">"{{ tagline }}"</div>
              </button>

              <!-- Locked Summary -->
              <div v-if="lockedIndex !== null" class="gfy-locked-summary">
                <i class="fas fa-lock"></i>
                Tagline locked
              </div>
            </div>
          </aside>

          <!-- MAIN: Selected Tagline Display -->
          <main class="gfy-layout-main">
            <!-- Results Header -->
            <div class="gfy-results__header">
              <h3 class="gfy-results__title">
                Selected Tagline
              </h3>
            </div>

            <!-- Loading State -->
            <div v-if="isGenerating" class="gfy-loading-state">
              <div class="gfy-loading-spinner"></div>
              <p>Generating your taglines...</p>
            </div>

            <!-- Locked State -->
            <div v-else-if="lockedIndex !== null" class="gfy-locked-tagline">
              <div class="gfy-locked-tagline__badge">
                <i class="fas fa-lock"></i>
                LOCKED TAGLINE
              </div>
              <div class="gfy-locked-tagline__text">
                "{{ taglines[lockedIndex] }}"
              </div>
              <div class="gfy-locked-tagline__actions">
                <button type="button" class="gfy-btn gfy-btn--outline" @click="handleCopy">
                  <i class="fas fa-copy"></i> Copy
                </button>
                <button type="button" class="gfy-btn gfy-btn--ghost" @click="unlockTagline">
                  <i class="fas fa-unlock"></i> Unlock & Edit
                </button>
              </div>
            </div>

            <!-- Selected Preview -->
            <template v-else-if="selectedTagline">
              <div class="gfy-selected-tagline">
                <div class="gfy-selected-tagline__badge">
                  Option {{ selectedIndex + 1 }}
                </div>
                <div class="gfy-selected-tagline__text">
                  "{{ selectedTagline }}"
                </div>
                <div class="gfy-selected-tagline__actions">
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

              <!-- Navigation -->
              <div class="gfy-tagline-nav">
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
                <span class="gfy-tagline-nav__count">
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

            <!-- Footer Actions -->
            <div class="gfy-results__footer">
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
import { ref, computed, onMounted, watch, inject } from 'vue';
import { useAITagline } from '../../src/composables/useAITagline';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared/constants';

// Integrated mode components
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../src/vue/components/ai/AiToneSelector.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'integrated', 'embedded'].includes(v)
  },
  componentId: {
    type: String,
    default: null
  },
  intent: {
    type: Object,
    default: null
  },
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

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return authorityHookText.value.trim().length > 0;
});

/**
 * Hook preview for live preview
 */
const hookPreview = computed(() => {
  const text = authorityHookText.value.trim();
  if (text.length <= 80) return text;
  return text.substring(0, 80) + '...';
});

/**
 * Handle tagline selection
 */
const handleSelectTagline = (index) => {
  selectTagline(index);
};

/**
 * Lock a tagline
 */
const lockTagline = (index) => {
  lockedIndex.value = index;
};

/**
 * Unlock tagline
 */
const unlockTagline = () => {
  lockedIndex.value = null;
};

/**
 * Handle starting generation - transitions to results view
 */
const handleStartGeneration = async () => {
  showResults.value = true;
  await handleGenerate();
};

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  lockedIndex.value = null;

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
  copySuccess.value = true;
  setTimeout(() => { copySuccess.value = false; }, 2000);
};

/**
 * Handle apply (integrated mode)
 */
const handleApply = () => {
  emit('applied', {
    componentId: props.componentId,
    tagline: selectedTagline.value,
    allTaglines: taglines.value
  });
};

/**
 * Handle start over
 */
const handleStartOver = () => {
  lockedIndex.value = null;
  showResults.value = false;
};

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  const firstName = profileData.first_name || '';
  const lastName = profileData.last_name || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  if (fullName && !name.value) {
    name.value = fullName;
  }

  if (profileData.authority_hook && !authorityHookText.value) {
    authorityHookText.value = profileData.authority_hook;
  }

  loadFromProfileData(profileData);
}

// Sync authority hook from store on mount
onMounted(() => {
  syncFromStore();
  if (authorityHookSummary.value) {
    authorityHookText.value = authorityHookSummary.value;
  }
});

// Watch for store changes
watch(authorityHookSummary, (newVal) => {
  if (newVal && !authorityHookText.value) {
    authorityHookText.value = newVal;
  }
});

// Watch for injected profile data from EmbeddedToolWrapper
watch(
  injectedProfileData,
  (newData) => {
    if (newData) {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

// Watch for profileData prop changes
watch(
  () => props.profileData,
  (newData) => {
    if (newData && props.mode === 'embedded') {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

// Current intent for embedded mode
const currentIntent = computed(() => props.intent || null);

// Generate preview text for embedded mode
const embeddedPreviewText = computed(() => {
  if (!name.value) return null;
  return `<strong>Professional tagline</strong> for <strong>${name.value}</strong>`;
});

// Watch for field changes in embedded mode
watch(
  () => name.value,
  () => {
    if (props.mode === 'embedded') {
      emit('preview-update', {
        previewHtml: embeddedPreviewText.value,
        fields: { name: name.value }
      });
    }
  }
);

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

<style scoped>
/* ============================================
   DESIGN TOKENS (gfy- prefix for consistency)
   ============================================ */
.gfy-tagline-generator {
  --gfy-primary-color: #2563eb;
  --gfy-primary-light: #eff6ff;
  --gfy-primary-dark: #1d4ed8;
  --gfy-success-color: #10b981;
  --gfy-success-light: #d1fae5;
  --gfy-text-primary: #0f172a;
  --gfy-text-secondary: #64748b;
  --gfy-text-muted: #94a3b8;
  --gfy-bg-color: #f8fafc;
  --gfy-white: #ffffff;
  --gfy-border-color: #e2e8f0;
  --gfy-radius-md: 8px;
  --gfy-radius-lg: 12px;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  max-width: 1100px;
  margin: 0 auto;
  padding: 40px 20px;
}

/* ============================================
   HERO SECTION
   ============================================ */
.gfy-tagline-hero {
  text-align: center;
  margin-bottom: 40px;
}

.gfy-tagline-hero--compact {
  margin-bottom: 30px;
}

.gfy-tagline-hero__title {
  font-size: 36px;
  font-weight: 800;
  margin-bottom: 10px;
  background: linear-gradient(to right, #0f172a, #3b82f6);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

.gfy-tagline-hero__subtitle {
  color: var(--gfy-text-secondary);
  font-size: 1.1rem;
  max-width: 600px;
  margin: 0 auto;
}

/* ============================================
   FORM CONTAINER
   ============================================ */
.gfy-tagline-form__container {
  background: var(--gfy-white);
  border-radius: 16px;
  border: 1px solid var(--gfy-border-color);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  padding: 40px;
}

.gfy-tagline-form__container--embedded {
  background: transparent;
  border: none;
  border-radius: 0;
  box-shadow: none;
  padding: 0;
}

/* ============================================
   FORM SECTIONS
   ============================================ */
.gfy-form-section {
  margin-bottom: 32px;
}

.gfy-form-section__title {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0 0 20px 0;
}

.gfy-form-section__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  background: var(--gfy-primary-light);
  color: var(--gfy-primary-color);
  border-radius: 8px;
}

/* ============================================
   HIGHLIGHT BOXES
   ============================================ */
.gfy-highlight-box {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 24px;
  margin-bottom: 24px;
}

.gfy-highlight-box--blue {
  border-left: 4px solid var(--gfy-primary-color);
  background: linear-gradient(to right, var(--gfy-primary-light), var(--gfy-white));
}

.gfy-highlight-box--green {
  border-left: 4px solid var(--gfy-success-color);
  background: linear-gradient(to right, var(--gfy-success-light), var(--gfy-white));
}

.gfy-highlight-box__header {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  margin-bottom: 20px;
}

.gfy-highlight-box__icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
  border-radius: 8px;
  flex-shrink: 0;
}

.gfy-highlight-box--green .gfy-highlight-box__icon {
  background: var(--gfy-success-color);
}

.gfy-highlight-box__title {
  font-size: 1.1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0 0 4px 0;
}

.gfy-highlight-box__subtitle {
  font-size: 0.9rem;
  color: var(--gfy-text-secondary);
  margin: 0;
}

/* ============================================
   FORM ELEMENTS
   ============================================ */
.gfy-form-grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 20px;
}

.gfy-form-group {
  margin-bottom: 16px;
}

.gfy-form-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gfy-text-primary);
  margin-bottom: 8px;
}

.gfy-form-label--required::after {
  content: ' *';
  color: #dc2626;
}

.gfy-form-input,
.gfy-form-textarea,
.gfy-form-select {
  width: 100%;
  padding: 12px 14px;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-family: inherit;
  font-size: 0.95rem;
  background: var(--gfy-white);
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-form-textarea {
  resize: vertical;
  min-height: 80px;
}

.gfy-form-input:focus,
.gfy-form-textarea:focus,
.gfy-form-select:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-form-input::placeholder,
.gfy-form-textarea::placeholder {
  color: var(--gfy-text-muted);
}

.gfy-form-hint {
  display: block;
  font-size: 0.8rem;
  color: var(--gfy-text-muted);
  margin-top: 6px;
  font-style: italic;
}

/* ============================================
   LIVE PREVIEW
   ============================================ */
.gfy-live-preview {
  margin-top: 16px;
  padding: 14px 18px;
  background: var(--gfy-primary-light);
  border: 1px solid #bfdbfe;
  border-radius: var(--gfy-radius-md);
  font-size: 0.95rem;
  font-style: italic;
  color: var(--gfy-primary-dark);
}

.gfy-live-preview__label {
  font-weight: 600;
  font-style: normal;
  margin-right: 4px;
}

/* ============================================
   FORM ACTIONS
   ============================================ */
.gfy-form-actions {
  text-align: center;
  padding-top: 16px;
}

.gfy-form-actions__hint {
  font-size: 0.85rem;
  color: var(--gfy-text-muted);
  margin-top: 12px;
}

/* ============================================
   BUTTONS
   ============================================ */
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
  border: 1px solid transparent;
  white-space: nowrap;
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

.gfy-btn--outline {
  background: var(--gfy-white);
  border-color: var(--gfy-border-color);
  color: var(--gfy-text-secondary);
}

.gfy-btn--outline:hover {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-btn--ghost {
  background: transparent;
  color: var(--gfy-text-secondary);
  border: none;
}

.gfy-btn--ghost:hover {
  color: var(--gfy-text-primary);
}

.gfy-btn--large {
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
}

.gfy-btn--generate {
  padding: 16px 32px;
  font-size: 1.1rem;
  border-radius: 10px;
}

/* ============================================
   SPINNER
   ============================================ */
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

/* ============================================
   ERROR BOX
   ============================================ */
.gfy-error-box {
  margin-top: 24px;
  padding: 20px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--gfy-radius-md);
  text-align: center;
  color: #991b1b;
}

.gfy-error-box i {
  font-size: 24px;
  margin-bottom: 8px;
}

.gfy-error-box p {
  margin: 0 0 12px 0;
}

/* ============================================
   RESULTS PHASE
   ============================================ */
.gmkb-tool-embed {
  background: var(--gfy-white);
  border-radius: 16px;
  border: 1px solid var(--gfy-border-color);
  box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  overflow: hidden;
}

.gfy-results-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  padding: 40px;
}

@media (min-width: 900px) {
  .gfy-results-layout {
    flex-direction: row;
    align-items: flex-start;
  }

  .gfy-layout-sidebar {
    position: sticky;
    top: 1rem;
    flex: 0 0 320px;
  }

  .gfy-layout-main {
    flex: 1;
    min-width: 0;
  }
}

/* ============================================
   SIDEBAR
   ============================================ */
.gfy-current-topics {
  background: var(--gfy-bg-color);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 1.25rem;
}

.gfy-sidebar-header {
  margin-bottom: 1rem;
}

.gfy-sidebar-title {
  font-size: 0.875rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--gfy-text-secondary);
  margin: 0;
}

/* Tagline Slots */
.gfy-tagline-slot {
  display: block;
  width: 100%;
  padding: 1rem;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  margin-bottom: 0.75rem;
  transition: all 0.2s;
  cursor: pointer;
  text-align: left;
}

.gfy-tagline-slot:hover {
  border-color: var(--gfy-primary-color);
}

.gfy-tagline-slot--active {
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 2px var(--gfy-primary-color);
}

.gfy-tagline-slot--locked {
  background: var(--gfy-primary-light);
  border-color: var(--gfy-primary-color);
}

.gfy-tagline-slot__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.gfy-tagline-slot__label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--gfy-text-secondary);
}

.gfy-tagline-slot--locked .gfy-tagline-slot__label {
  color: var(--gfy-primary-color);
}

.gfy-tagline-slot__text {
  font-size: 13px;
  line-height: 1.4;
  color: var(--gfy-text-primary);
  font-style: italic;
}

.gfy-locked-summary {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px;
  background: var(--gfy-primary-light);
  border-radius: var(--gfy-radius-md);
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gfy-primary-color);
  margin-top: 12px;
}

/* ============================================
   MAIN AREA
   ============================================ */
.gfy-results__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gfy-border-color);
}

.gfy-results__title {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
}

/* Loading State */
.gfy-loading-state {
  text-align: center;
  padding: 60px 40px;
  color: var(--gfy-text-secondary);
}

.gfy-loading-spinner {
  width: 48px;
  height: 48px;
  border: 3px solid var(--gfy-border-color);
  border-radius: 50%;
  border-top-color: var(--gfy-primary-color);
  animation: spin 1s linear infinite;
  margin: 0 auto 16px;
}

/* ============================================
   LOCKED STATE
   ============================================ */
.gfy-locked-tagline {
  background: var(--gfy-primary-light);
  border: 2px solid var(--gfy-primary-color);
  border-radius: var(--gfy-radius-lg);
  padding: 32px;
  text-align: center;
}

.gfy-locked-tagline__badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--gfy-primary-color);
  background: var(--gfy-white);
  padding: 4px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.gfy-locked-tagline__text {
  font-size: 1.5rem;
  font-weight: 600;
  font-style: italic;
  color: var(--gfy-text-primary);
  margin-bottom: 24px;
  line-height: 1.4;
}

.gfy-locked-tagline__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* ============================================
   SELECTED STATE
   ============================================ */
.gfy-selected-tagline {
  background: var(--gfy-white);
  border: 2px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 32px;
  text-align: center;
  margin-bottom: 24px;
}

.gfy-selected-tagline__badge {
  display: inline-block;
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
  padding: 4px 12px;
  border-radius: 4px;
  margin-bottom: 16px;
}

.gfy-selected-tagline__text {
  font-size: 1.5rem;
  font-weight: 600;
  font-style: italic;
  color: var(--gfy-text-primary);
  margin-bottom: 24px;
  line-height: 1.4;
}

.gfy-selected-tagline__actions {
  display: flex;
  justify-content: center;
  gap: 12px;
}

/* Navigation */
.gfy-tagline-nav {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 20px;
  padding: 16px 0;
  border-top: 1px solid var(--gfy-border-color);
}

.gfy-tagline-nav__count {
  font-size: 0.875rem;
  color: var(--gfy-text-muted);
  font-weight: 500;
}

/* ============================================
   FOOTER
   ============================================ */
.gfy-results__footer {
  margin-top: 2rem;
  border-top: 1px solid var(--gfy-border-color);
  padding-top: 1.5rem;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
}

.gfy-copy-success {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 16px;
  background: var(--gfy-success-light);
  color: #047857;
  border-radius: var(--gfy-radius-md);
  font-weight: 600;
  margin-top: 16px;
  width: 100%;
}

/* ============================================
   INTEGRATED MODE STYLES
   ============================================ */
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
</style>
