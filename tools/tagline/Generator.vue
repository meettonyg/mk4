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

      <!-- STEP 3: Settings -->
      <div class="gfy-input-group">
        <label class="gfy-label">Step 3: Tagline Settings</label>
        <div class="gfy-builder">
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Style Focus</label>
            <select v-model="styleFocus" class="gfy-select">
              <option value="problem">Problem-Focused</option>
              <option value="solution">Solution-Focused</option>
              <option value="outcome">Outcome-Focused</option>
              <option value="authority">Authority-Focused</option>
            </select>
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Tone</label>
            <select v-model="tone" class="gfy-select">
              <option value="bold">Bold & Direct</option>
              <option value="professional">Professional & Polished</option>
              <option value="clever">Conversational & Clever</option>
              <option value="inspirational">Inspirational</option>
            </select>
          </div>
        </div>
      </div>
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
const generator = useAIGenerator('tagline');
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
 * Check if user has entered any authority hook data
 */
const hasAuthorityHookData = computed(() => {
  return !!(hookWho.value || hookWhat.value || hookWhen.value || hookHow.value);
});

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
 * Handle regenerate - merged with refine functionality
 * If feedback is provided, sends it with previous taglines for refinement
 * If no feedback, generates fresh results (cache bust)
 */
const handleRegenerate = async () => {
  const hasFeedback = refinementFeedback.value.trim().length > 0;

  if (hasFeedback && taglines.value.length > 0) {
    // REFINE: Include previous taglines and feedback
    const params = {
      who: hookWho.value,
      what: hookWhat.value,
      when: hookWhen.value,
      how: hookHow.value,
      where: impactWhere.value,
      why: impactWhy.value,
      industry: industry.value,
      uniqueFactor: uniqueFactor.value,
      existingTaglines: existingTaglines.value,
      styleFocus: styleFocus.value,
      tone: tone.value,
      authorityHook: generatedHookSummary.value,
      count: 10,
      previousTaglines: taglines.value.map(t => t.text),
      refinementFeedback: refinementFeedback.value,
      // Add timestamp to force unique cache key for refinement
      _refineTimestamp: Date.now()
    };

    previousTaglines.value = params.previousTaglines;

    // Generate with new params (unique cache key due to timestamp)
    await generator.generate(params);

    // Keep locked tagline if still in new list
    if (lockedTaglineIndex.value >= taglines.value.length) {
      lockedTaglineIndex.value = -1;
      lockedTagline.value = null;
    }
  } else {
    // FRESH REGENERATE: Use current form values with cache bust
    lockedTagline.value = null;
    lockedTaglineIndex.value = -1;
    previousTaglines.value = [];

    const params = {
      who: hookWho.value,
      what: hookWhat.value,
      when: hookWhen.value,
      how: hookHow.value,
      where: impactWhere.value,
      why: impactWhy.value,
      industry: industry.value,
      uniqueFactor: uniqueFactor.value,
      existingTaglines: existingTaglines.value,
      styleFocus: styleFocus.value,
      tone: tone.value,
      authorityHook: generatedHookSummary.value,
      count: 10,
      _regenerateTimestamp: Date.now() // Force cache bust
    };

    await generator.generate(params);
  }

  // Clear feedback after successful regeneration
  refinementFeedback.value = '';

  emit('generated', { taglines: taglines.value, refined: hasFeedback });
};

/**
 * Toggle lock on a tagline (single-click pattern)
 * - Click unlocked tagline → locks it (and unlocks previous)
 * - Click locked tagline → unlocks it
 */
const toggleTaglineLock = (index) => {
  if (index < 0 || index >= taglines.value.length) return;

  if (lockedTaglineIndex.value === index) {
    // Clicking the already-locked tagline unlocks it
    lockedTagline.value = null;
    lockedTaglineIndex.value = -1;
  } else {
    // Clicking a different tagline locks it (auto-unlocks previous)
    lockedTagline.value = taglines.value[index].text;
    lockedTaglineIndex.value = index;
  }
};

/**
 * Handle copy to clipboard
 */
const handleCopy = async () => {
  if (!lockedTagline.value) return;

  try {
    await navigator.clipboard.writeText(lockedTagline.value);
  } catch (err) {
    console.error('[TaglineGenerator] Failed to copy:', err);
  }
};

/**
 * Handle save to profile
 */
const handleSaveToProfile = async () => {
  localSaveError.value = null;

  if (!lockedTagline.value) {
    localSaveError.value = 'Please lock a tagline first.';
    return;
  }

  if (!resolvedProfileId.value) {
    localSaveError.value = 'No profile selected. Please select a profile first.';
    return;
  }

  saveSuccess.value = false;

  try {
    // Save tagline
    const taglineResult = await saveToProfile('tagline', lockedTagline.value, {
      profileId: resolvedProfileId.value
    });

    // Optionally save authority hook as generated string
    if (saveAuthorityHook.value && hasAuthorityHookData.value && generatedHookSummary.value) {
      await saveToProfile('authority_hook', generatedHookSummary.value, {
        profileId: resolvedProfileId.value
      });
    }

    // Optionally save impact intro as generated string
    if (saveImpactIntro.value && hasImpactIntroData.value && generatedImpactSummary.value) {
      await saveToProfile('impact_intro', generatedImpactSummary.value, {
        profileId: resolvedProfileId.value
      });
    }

    if (taglineResult?.success !== false) {
      saveSuccess.value = true;
      // Update profile tagline to match what was saved
      profileTagline.value = lockedTagline.value;
      emit('saved', { tagline: lockedTagline.value });

      setTimeout(() => {
        saveSuccess.value = false;
      }, 3000);
    }
  } catch (err) {
    console.error('[TaglineGenerator] Save failed:', err);
    localSaveError.value = err.message || 'Failed to save';
  }
};

/**
 * Handle startover - simple page refresh
 */
const handleStartOver = () => {
  window.location.reload();
};

// Watch for injected profile data
watch(
  injectedProfileData,
  (newData) => {
    if (newData) {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

// Watch for props profile data
watch(
  () => props.profileData,
  (newData) => {
    if (newData) {
      populateFromProfile(newData);
    }
  },
  { immediate: true }
);

// Emit canGenerate updates
watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
}, { immediate: true });

// Expose for parent to call
defineExpose({
  handleGenerate,
  canGenerate,
  isGenerating,
  hasTaglines,
  error
});
</script>

<style scoped>
/* ============================================================================
   TAGLINE GENERATOR - Simplified 2-mode architecture
   Following gfy- prefix pattern from topics generator
   ============================================================================ */

.gfy-tagline-generator {
  width: 100%;
}

/* Form Section */
.gfy-tagline-form {
  display: flex;
  flex-direction: column;
  gap: 0;
}

/* Input Groups */
.gfy-input-group {
  margin-bottom: 1.5rem;
}

.gfy-label {
  display: block;
  font-size: 0.95rem;
  font-weight: 700;
  margin-bottom: 1rem;
  color: var(--mkcg-text-primary, #0f172a);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Highlight Boxes */
.gfy-highlight-box {
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-left: 4px solid var(--mkcg-primary, #3b82f6);
  padding: 1.5rem;
  border-radius: 8px;
  margin-bottom: 1rem;
}

.gfy-highlight-box--blue {
  border-left-color: var(--mkcg-primary, #3b82f6);
}

.gfy-highlight-box--green {
  border-left-color: #10b981;
}

.gfy-highlight-box__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.gfy-highlight-box__icon {
  font-size: 1.25rem;
}

.gfy-highlight-box__icon--gold {
  color: #f59e0b;
}

.gfy-highlight-box__icon--green {
  color: #10b981;
}

.gfy-highlight-box__title {
  font-size: 1rem;
  font-weight: 700;
  margin: 0;
  color: var(--mkcg-text-primary, #0f172a);
}

/* Builder Grid */
.gfy-builder {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.gfy-builder__field {
  display: flex;
  flex-direction: column;
}

.gfy-builder__field--full {
  grid-column: span 2;
}

.gfy-builder__label {
  display: block;
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--mkcg-text-secondary, #64748b);
  margin-bottom: 6px;
}

.gfy-builder__input,
.gfy-select,
.gfy-textarea {
  width: 100%;
  padding: 12px;
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 6px;
  font-size: 14px;
  background: var(--mkcg-bg-primary, #ffffff);
  font-family: inherit;
  box-sizing: border-box;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-builder__input:focus,
.gfy-select:focus,
.gfy-textarea:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.gfy-textarea {
  resize: vertical;
  min-height: 80px;
}

/* Live Preview */
.gfy-live-preview {
  margin-top: 1rem;
  padding: 1rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border-radius: 8px;
  font-style: italic;
  color: var(--mkcg-primary, #3b82f6);
  font-weight: 500;
  text-align: center;
}

.gfy-live-preview--green {
  background: linear-gradient(135deg, #ecfdf5 0%, #d1fae5 100%);
  color: #059669;
}

/* Section Divider */
.gfy-section-divider {
  height: 1px;
  background: var(--mkcg-border-light, #e2e8f0);
  margin: 2rem 0;
  position: relative;
}

.gfy-section-divider span {
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background: var(--mkcg-bg-primary, #ffffff);
  padding: 0 15px;
  font-size: 11px;
  font-weight: 800;
  color: var(--mkcg-text-secondary, #64748b);
  text-transform: uppercase;
}

/* ============================================================================
   RESULTS LAYOUT
   ============================================================================ */

.gfy-results {
  width: 100%;
}

.gfy-results-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

@media (min-width: 900px) {
  .gfy-results-layout {
    flex-direction: row;
    align-items: flex-start;
  }

  .gfy-layout-sidebar {
    position: sticky;
    top: 1rem;
    flex: 0 0 280px;
  }

  .gfy-layout-main {
    flex: 1;
    min-width: 0;
  }
}

/* Sidebar */
.gfy-current-topics {
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 12px;
  padding: 1.25rem;
}

.gfy-current-topics__header {
  margin-bottom: 1rem;
}

.gfy-current-topics__title {
  font-size: 0.875rem;
  text-transform: uppercase;
  font-weight: 700;
  color: var(--mkcg-text-secondary, #64748b);
  margin: 0;
}

.gfy-bio-slot {
  padding: 1rem;
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 8px;
  transition: all 0.2s;
}

.gfy-bio-slot--locked {
  background: rgba(59, 130, 246, 0.05);
  border-color: var(--mkcg-primary, #3b82f6);
}

.gfy-bio-slot__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.gfy-bio-slot__label {
  font-size: 11px;
  font-weight: 800;
  text-transform: uppercase;
  color: var(--mkcg-text-secondary, #64748b);
}

.gfy-bio-slot--locked .gfy-bio-slot__label {
  color: var(--mkcg-primary, #3b82f6);
}

.gfy-bio-slot__lock {
  color: var(--mkcg-primary, #3b82f6);
}

.gfy-bio-slot__preview {
  font-size: 14px;
  font-weight: 600;
  line-height: 1.4;
  color: var(--mkcg-text-primary, #0f172a);
}

.gfy-sidebar-hint {
  font-size: 11px;
  color: var(--mkcg-text-tertiary, #94a3b8);
  margin-top: 12px;
  font-style: italic;
  text-align: center;
}

.gfy-sidebar-actions {
  display: flex;
  gap: 8px;
  margin-top: 12px;
}

/* Results Header */
.gfy-results__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid var(--mkcg-border-light, #e2e8f0);
  flex-wrap: wrap;
  gap: 12px;
}

.gfy-results__title-row {
  display: flex;
  align-items: center;
  gap: 12px;
}

.gfy-results__title {
  font-size: 1.125rem;
  font-weight: 700;
  margin: 0;
  color: var(--mkcg-text-primary, #0f172a);
}

.gfy-results__count {
  font-size: 0.875rem;
  color: var(--mkcg-text-secondary, #64748b);
  background: var(--mkcg-bg-secondary, #f1f5f9);
  padding: 4px 10px;
  border-radius: 12px;
}

/* Regenerate Row (merged with feedback input) */
.gfy-regenerate-row {
  display: flex;
  flex-direction: column;
  gap: 8px;
  padding: 14px 16px;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid var(--mkcg-primary, #3b82f6);
  border-radius: 10px;
  margin-bottom: 1rem;
}

.gfy-regenerate-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: var(--mkcg-text-primary, #0f172a);
}

.gfy-regenerate-label i {
  color: #f59e0b;
}

.gfy-regenerate-input-group {
  display: flex;
  gap: 10px;
  align-items: stretch;
}

.gfy-regenerate-input {
  flex: 1;
  padding: 10px 14px;
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 6px;
  font-family: inherit;
  font-size: 13px;
  background: var(--mkcg-bg-primary, #ffffff);
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-regenerate-input:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.15);
}

.gfy-regenerate-input::placeholder {
  color: var(--mkcg-text-tertiary, #94a3b8);
}

@media (max-width: 640px) {
  .gfy-regenerate-input-group {
    flex-direction: column;
  }
}

/* Selection Banner */
.gfy-selection-banner {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 10px 14px;
  background: var(--mkcg-bg-secondary, #f1f5f9);
  border-radius: 8px;
  margin-bottom: 1rem;
}

.gfy-selection-banner__text {
  font-size: 13px;
  color: var(--mkcg-text-secondary, #64748b);
}

.gfy-selection-banner__count {
  font-size: 13px;
  font-weight: 600;
  color: var(--mkcg-primary, #3b82f6);
}

/* Tagline List */
.gfy-tagline-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.gfy-tagline-row {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 16px;
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.15s;
}

.gfy-tagline-row:hover {
  border-color: var(--mkcg-primary, #3b82f6);
  background: var(--mkcg-bg-secondary, #f8fafc);
}

.gfy-tagline-row--locked {
  border-color: var(--mkcg-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.08);
  border-width: 2px;
}

.gfy-tagline-row__text {
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0;
  line-height: 1.4;
}

/* Lock button in each row */
.gfy-tagline-row__lock-btn {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.15s;
  color: var(--mkcg-text-tertiary, #94a3b8);
  font-size: 14px;
}

.gfy-tagline-row__lock-btn:hover {
  background: var(--mkcg-bg-secondary, #f1f5f9);
  color: var(--mkcg-primary, #3b82f6);
}

.gfy-tagline-row__lock-btn--locked {
  color: var(--mkcg-primary, #3b82f6);
}

/* Show open lock icon only on hover for unlocked rows */
.gfy-tagline-row__lock-btn .fa-lock-open {
  opacity: 0;
  transition: opacity 0.15s;
}

.gfy-tagline-row:hover .gfy-tagline-row__lock-btn .fa-lock-open {
  opacity: 1;
}

/* Buttons */
.gfy-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 600;
  border-radius: 6px;
  cursor: pointer;
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  font-family: inherit;
  transition: all 0.15s;
  background: var(--mkcg-bg-primary, #ffffff);
  color: var(--mkcg-text-secondary, #64748b);
}

.gfy-btn:hover {
  background: var(--mkcg-bg-secondary, #f8fafc);
  border-color: var(--mkcg-primary, #3b82f6);
  color: var(--mkcg-primary, #3b82f6);
}

.gfy-btn--primary {
  background: var(--mkcg-primary, #3b82f6);
  color: white;
  border: none;
}

.gfy-btn--primary:hover:not(:disabled) {
  background: var(--mkcg-primary-dark, #2563eb);
}

.gfy-btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gfy-btn--outline {
  background: var(--mkcg-bg-primary, #ffffff);
  color: var(--mkcg-text-secondary, #64748b);
}

.gfy-btn--text {
  background: transparent;
  border: none;
  color: var(--mkcg-text-secondary, #64748b);
}

.gfy-btn--text:hover {
  color: var(--mkcg-text-primary, #0f172a);
  background: transparent;
  border: none;
}

.gfy-btn--small {
  padding: 6px 10px;
  font-size: 12px;
}

.gfy-btn--large {
  padding: 12px 20px;
  font-size: 15px;
}

/* Footer */
.gfy-results__footer {
  margin-top: 1.5rem;
  border-top: 1px solid var(--mkcg-border-light, #e2e8f0);
  padding-top: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.gfy-save-section {
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* Checkbox Option */
.gfy-checkbox-option {
  display: flex;
  align-items: center;
  gap: 10px;
  cursor: pointer;
  font-size: 14px;
  color: var(--mkcg-text-secondary, #64748b);
}

.gfy-checkbox-option__input {
  display: none;
}

.gfy-checkbox-option__box {
  width: 18px;
  height: 18px;
  border: 2px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
  background: var(--mkcg-bg-primary, #ffffff);
}

.gfy-checkbox-option__input:checked + .gfy-checkbox-option__box {
  background: var(--mkcg-primary, #3b82f6);
  border-color: var(--mkcg-primary, #3b82f6);
  color: white;
}

.gfy-checkbox-option__label {
  user-select: none;
}

/* Success/Error Messages */
.gfy-save-success {
  color: #16a34a;
  font-size: 14px;
  font-weight: 600;
}

.gfy-save-error {
  color: #dc2626;
  font-size: 14px;
}

/* Spinner */
.gfy-spinner {
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top-color: currentColor;
  border-radius: 50%;
  animation: gfy-spin 1s linear infinite;
}

@keyframes gfy-spin {
  to { transform: rotate(360deg); }
}

/* Responsive */
@media (max-width: 768px) {
  .gfy-builder {
    grid-template-columns: 1fr;
  }

  .gfy-builder__field--full {
    grid-column: span 1;
  }

  .gfy-results__header {
    flex-direction: column;
    align-items: flex-start;
  }

  .gfy-save-section {
    flex-direction: column;
    align-items: stretch;
  }
}
</style>
