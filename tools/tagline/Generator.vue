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

  <!-- Default Mode: Simple inline form/results (for landing pages) -->
  <div v-else class="gfy-tagline-generator">
    <!-- Form Section -->
    <div v-if="!hasTaglines" class="gfy-tagline-form">
      <!-- Name Field -->
      <div class="gfy-input-group">
        <label class="gfy-label">Your Name (Optional)</label>
        <input
          v-model="name"
          type="text"
          class="gfy-input"
          placeholder="e.g., Jane Smith"
        />
      </div>

      <!-- Authority Hook Builder -->
      <div class="gfy-authority-hook">
        <div class="gfy-authority-hook__header">
          <span class="gfy-authority-hook__icon">&#9733;</span>
          <h3 class="gfy-authority-hook__title">Your Authority Hook</h3>
        </div>

        <!-- Builder Grid -->
        <div class="gfy-builder">
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">WHO do you help?</label>
            <input
              v-model="hookWho"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g., SaaS Founders"
            />
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">WHAT is the result?</label>
            <input
              v-model="hookWhat"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g., Increase revenue by 40%"
            />
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">WHEN do they need it?</label>
            <input
              v-model="hookWhen"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g., When scaling rapidly"
            />
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">HOW do you do it?</label>
            <input
              v-model="hookHow"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g., My proven 90-day system"
            />
          </div>
        </div>

        <!-- Live Preview -->
        <div class="gfy-live-preview">
          "{{ hookPreview }}"
        </div>
      </div>
    </div>

    <!-- Results Section -->
    <div v-if="hasTaglines" class="gfy-results">
      <!-- Results Header -->
      <div class="gfy-results__header">
        <div class="gfy-results__title-row">
          <h3 class="gfy-results__title">Generated Taglines</h3>
          <span class="gfy-results__count">{{ taglines.length }} Options</span>
        </div>
        <div class="gfy-results__actions">
          <button type="button" class="gfy-btn gfy-btn--outline" @click="handleRegenerate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Regenerate
          </button>
          <button type="button" class="gfy-btn gfy-btn--outline" @click="handleCopy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copy Selected
          </button>
        </div>
      </div>

      <!-- Selection Banner -->
      <div class="gfy-selection-banner">
        <span class="gfy-selection-banner__text">Click to select your tagline</span>
        <span class="gfy-selection-banner__count">
          {{ selectedIndex !== null ? '1 selected' : 'None selected' }}
        </span>
      </div>

      <!-- Tagline Cards -->
      <div class="gfy-tagline-list">
        <div
          v-for="(tagline, index) in taglines"
          :key="index"
          class="gfy-tagline-card"
          :class="{ 'gfy-tagline-card--selected': selectedIndex === index }"
          @click="handleSelectTagline(index)"
        >
          <div class="gfy-tagline-card__checkbox">
            <span v-if="selectedIndex === index" class="gfy-check-icon">✓</span>
          </div>
          <div class="gfy-tagline-card__number">{{ index + 1 }}.</div>
          <p class="gfy-tagline-card__text">{{ tagline }}</p>
        </div>
      </div>

      <!-- Save Actions -->
      <div class="gfy-results__footer">
        <div class="gfy-save-section">
          <button
            type="button"
            class="gfy-btn gfy-btn--primary gfy-btn--large"
            :disabled="selectedIndex === null || isSaving"
            @click="handleSaveToProfile"
          >
            <svg v-if="!isSaving" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
              <polyline points="17 21 17 13 7 13 7 21"/>
              <polyline points="7 3 7 8 15 8"/>
            </svg>
            <span v-if="isSaving" class="gfy-spinner"></span>
            {{ isSaving ? 'Saving...' : 'Save to Media Kit' }}
          </button>
          <button type="button" class="gfy-btn gfy-btn--text" @click="handleStartOver">
            Start Over
          </button>
        </div>
        <!-- Save Success Message -->
        <span v-if="saveSuccess" class="gfy-save-success">
          ✓ Saved successfully!
        </span>
        <!-- Save Error Message -->
        <span v-if="saveError" class="gfy-save-error">
          {{ saveError }}
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import { useAITagline } from '../../src/composables/useAITagline';
import { useProfileContext } from '../../src/composables/useProfileContext';
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared/constants';

// Compact widget components (integrated mode only)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../src/vue/components/ai/AiToneSelector.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';

const props = defineProps({
  mode: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'integrated'].includes(v)
  },
  componentId: {
    type: String,
    default: null
  },
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['applied', 'generated', 'update:can-generate', 'saved']);

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
  tone,
  reset
} = useAITagline();

const {
  profileId: contextProfileId,
  isSaving,
  saveError,
  saveToProfile
} = useProfileContext();

// Inject profile data from parent (EmbeddedToolWrapper provides this)
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Local state
const name = ref('');
const authorityHookText = ref('');
const saveSuccess = ref(false);
const selectedProfileId = ref(null);

// Authority Hook Builder fields
const hookWho = ref('');
const hookWhat = ref('');
const hookWhen = ref('');
const hookHow = ref('');

// Computed: resolved profile ID
const resolvedProfileId = computed(() => {
  return props.profileData?.id
    || injectedProfileData.value?.id
    || contextProfileId.value
    || null;
});

// Keep selectedProfileId in sync
watch(resolvedProfileId, (newId) => {
  selectedProfileId.value = newId;
}, { immediate: true });

/**
 * Live preview of authority hook
 */
const hookPreview = computed(() => {
  const who = hookWho.value || '[WHO]';
  const what = hookWhat.value || '[WHAT]';
  const when = hookWhen.value || '[WHEN]';
  const how = hookHow.value || '[HOW]';
  return `I help ${who} ${what} ${when} through ${how}.`;
});

/**
 * Generated authority hook summary
 */
const generatedHookSummary = computed(() => {
  if (!hookWho.value && !hookWhat.value) return authorityHookText.value;
  let summary = `I help ${hookWho.value || ''} ${hookWhat.value || ''}`;
  if (hookWhen.value) summary += ` ${hookWhen.value}`;
  if (hookHow.value) summary += ` through ${hookHow.value}`;
  return summary.trim() + '.';
});

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return authorityHookText.value.trim().length > 0 ||
         (hookWho.value && hookWhat.value);
});

/**
 * Handle tagline selection
 */
const handleSelectTagline = (index) => {
  selectTagline(index);
};

/**
 * Populate from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  const firstName = profileData.first_name || '';
  const lastName = profileData.last_name || '';
  const fullName = [firstName, lastName].filter(Boolean).join(' ');
  if (fullName) name.value = fullName;

  if (profileData.authority_hook) authorityHookText.value = profileData.authority_hook;
  if (profileData.hook_who) hookWho.value = profileData.hook_who;
  if (profileData.hook_what) hookWhat.value = profileData.hook_what;
  if (profileData.hook_when) hookWhen.value = profileData.hook_when;
  if (profileData.hook_how) hookHow.value = profileData.hook_how;
}

/**
 * Handle generate - exposed for parent to call
 */
const handleGenerate = async () => {
  const hookText = generatedHookSummary.value || authorityHookText.value;

  await generate({
    name: name.value,
    authorityHook: hookText
  }, props.mode === 'integrated' ? 'builder' : 'public');

  emit('generated', { taglines: taglines.value });
  return { taglines: taglines.value };
};

/**
 * Handle regenerate
 */
const handleRegenerate = async () => {
  await handleGenerate();
};

/**
 * Handle copy
 */
const handleCopy = async () => {
  if (selectedTagline.value) {
    try {
      await navigator.clipboard.writeText(selectedTagline.value);
    } catch (err) {
      console.error('[Tagline Generator] Failed to copy:', err);
    }
  } else {
    await copyToClipboard();
  }
};

/**
 * Handle save to profile
 */
const handleSaveToProfile = async () => {
  if (selectedIndex.value === null) return;

  try {
    const result = await saveToProfile('tagline', selectedTagline.value, {
      profileId: selectedProfileId.value
    });

    if (result.success) {
      saveSuccess.value = true;
      setTimeout(() => { saveSuccess.value = false; }, 3000);

      emit('saved', {
        profileId: selectedProfileId.value,
        tagline: selectedTagline.value
      });
    }
  } catch (err) {
    console.error('[Tagline Generator] Save failed:', err);
  }
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
  if (reset) reset();
};

// Watch for canGenerate changes
watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
}, { immediate: true });

// Watch profile data
watch(
  [() => props.profileData, injectedProfileData],
  ([propsData, injectedData]) => {
    const data = propsData || injectedData;
    if (data) populateFromProfile(data);
  },
  { immediate: true }
);

// Expose for parent
defineExpose({
  handleGenerate,
  taglines,
  hasTaglines,
  isGenerating,
  error,
  copyToClipboard
});
</script>

<style scoped>
.gfy-tagline-generator {
  --gfy-primary-color: #2563eb;
  --gfy-primary-light: #eff6ff;
  --gfy-primary-dark: #1d4ed8;
  --gfy-text-primary: #0f172a;
  --gfy-text-secondary: #64748b;
  --gfy-text-muted: #94a3b8;
  --gfy-bg-color: #f8fafc;
  --gfy-white: #ffffff;
  --gfy-border-color: #e2e8f0;
  --gfy-warning-color: #f59e0b;
  --gfy-success-color: #10b981;
  --gfy-radius-md: 6px;
  --gfy-radius-lg: 12px;

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
}

/* INPUT STYLES */
.gfy-input-group {
  margin-bottom: 1.5rem;
}

.gfy-label {
  display: block;
  font-size: 0.9rem;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: var(--gfy-text-primary);
}

.gfy-input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-family: inherit;
  font-size: 0.95rem;
  background: var(--gfy-white);
  box-sizing: border-box;
  transition: border-color 0.2s;
}

.gfy-input:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-input::placeholder {
  color: var(--gfy-text-muted);
}

/* AUTHORITY HOOK BLOCK */
.gfy-authority-hook {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-left: 4px solid var(--gfy-primary-color);
  padding: 1.5rem;
  border-radius: var(--gfy-radius-md);
}

.gfy-authority-hook__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.gfy-authority-hook__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-authority-hook__icon {
  color: var(--gfy-warning-color);
  font-size: 1.2rem;
}

/* BUILDER GRID */
.gfy-builder {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.gfy-builder__field {
  margin-bottom: 0.5rem;
}

.gfy-builder__label {
  display: block;
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: uppercase;
  color: var(--gfy-text-secondary);
  margin-bottom: 0.4rem;
}

.gfy-builder__input {
  width: 100%;
  padding: 0.75rem;
  border: 1px solid #cbd5e1;
  border-radius: var(--gfy-radius-md);
  font-size: 0.9rem;
  background: #ffffff;
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-builder__input:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  background: #ffffff;
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-builder__input::placeholder {
  color: var(--gfy-text-muted);
}

/* LIVE PREVIEW */
.gfy-live-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: var(--gfy-primary-light);
  border-radius: var(--gfy-radius-md);
  border: 1px solid #bfdbfe;
  color: var(--gfy-primary-dark);
  font-size: 0.95rem;
  font-style: italic;
  text-align: center;
}

/* RESULTS SECTION */
.gfy-results {
  width: 100%;
}

.gfy-results__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.25rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--gfy-border-color);
  flex-wrap: wrap;
  gap: 1rem;
}

.gfy-results__title-row {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.gfy-results__title {
  font-size: 1.25rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-results__count {
  background: var(--gfy-primary-light);
  color: var(--gfy-primary-color);
  padding: 0.25rem 0.75rem;
  border-radius: 999px;
  font-size: 0.85rem;
  font-weight: 600;
}

.gfy-results__actions {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  flex-shrink: 0;
}

/* SELECTION BANNER */
.gfy-selection-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  background: var(--gfy-primary-light);
  border: 1px solid #bfdbfe;
  border-radius: var(--gfy-radius-md);
  padding: 0.75rem 1rem;
  margin-bottom: 1rem;
}

.gfy-selection-banner__text {
  font-size: 0.9rem;
  color: var(--gfy-text-secondary);
}

.gfy-selection-banner__count {
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gfy-primary-color);
}

/* TAGLINE LIST */
.gfy-tagline-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.gfy-tagline-card {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--gfy-white);
  border: 2px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gfy-tagline-card:hover {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-bg-color);
}

.gfy-tagline-card--selected {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-tagline-card__checkbox {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 2px solid var(--gfy-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gfy-white);
}

.gfy-tagline-card--selected .gfy-tagline-card__checkbox {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-check-icon {
  font-size: 12px;
  font-weight: bold;
  color: white;
}

.gfy-tagline-card__number {
  flex-shrink: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gfy-text-secondary);
  min-width: 24px;
}

.gfy-tagline-card__text {
  flex: 1;
  font-size: 0.95rem;
  line-height: 1.4;
  color: var(--gfy-text-primary);
  margin: 0;
}

/* BUTTONS */
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
  border: none;
  white-space: nowrap;
}

.gfy-btn svg {
  flex-shrink: 0;
  display: inline-block;
  vertical-align: middle;
  width: 16px;
  height: 16px;
  stroke: currentColor;
  stroke-width: 2;
}

.gfy-btn--outline {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  color: var(--gfy-text-secondary);
}

.gfy-btn--outline:hover {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
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

.gfy-btn--large {
  padding: 0.875rem 1.5rem;
  font-size: 1rem;
}

.gfy-btn--text {
  background: transparent;
  color: var(--gfy-text-secondary);
  padding: 0.6rem 1rem;
}

.gfy-btn--text:hover {
  color: var(--gfy-text-primary);
}

/* RESULTS FOOTER */
.gfy-results__footer {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gfy-border-color);
}

.gfy-save-section {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.gfy-save-success {
  font-size: 0.9rem;
  font-weight: 500;
  color: var(--gfy-success-color);
}

.gfy-save-error {
  font-size: 0.9rem;
  font-weight: 500;
  color: #dc2626;
}

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
}

.gmkb-ai-taglines__nav-count {
  font-size: 13px;
  color: var(--gmkb-ai-text-secondary, #64748b);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .gfy-builder {
    grid-template-columns: 1fr;
  }

  .gfy-results__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .gfy-selection-banner {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>
