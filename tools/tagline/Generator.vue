<template>
  <div class="gfy-tagline-generator">
    <!-- Form Section -->
    <div v-if="!hasTaglines" class="gfy-tagline-form">
      <!-- STEP 1: Authority Framework -->
      <div class="gfy-input-group">
        <label class="gfy-label">Step 1: Your Authority Framework</label>

        <!-- Authority Hook (Who, What, When, How) -->
        <div class="gfy-highlight-box gfy-highlight-box--blue">
          <div class="gfy-highlight-box__header">
            <span class="gfy-highlight-box__icon gfy-highlight-box__icon--gold">&#9733;</span>
            <h3 class="gfy-highlight-box__title">Your Authority Hook</h3>
          </div>
          <div class="gfy-builder">
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">WHO do you help?</label>
              <input
                v-model="hookWho"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g. SaaS Founders"
              />
            </div>
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">WHAT is the result?</label>
              <input
                v-model="hookWhat"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g. Scale to 7-figures"
              />
            </div>
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">WHEN do they need it?</label>
              <input
                v-model="hookWhen"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g. Feeling plateaued"
              />
            </div>
            <div class="gfy-builder__field">
              <label class="gfy-builder__label">HOW do you do it?</label>
              <input
                v-model="hookHow"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g. 90-day framework"
              />
            </div>
          </div>

          <!-- Live Preview -->
          <div class="gfy-live-preview">
            "{{ hookPreview }}"
          </div>
        </div>

        <!-- Impact Intro (Where, Why) -->
        <div class="gfy-highlight-box gfy-highlight-box--green">
          <div class="gfy-highlight-box__header">
            <span class="gfy-highlight-box__icon gfy-highlight-box__icon--green">&#127919;</span>
            <h3 class="gfy-highlight-box__title">Your Impact Intro</h3>
          </div>
          <div class="gfy-builder">
            <div class="gfy-builder__field gfy-builder__field--full">
              <label class="gfy-builder__label">WHERE is your authority?</label>
              <input
                v-model="impactWhere"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g. Helped 200+ startups achieve milestones"
              />
            </div>
            <div class="gfy-builder__field gfy-builder__field--full">
              <label class="gfy-builder__label">WHY is this your mission?</label>
              <input
                v-model="impactWhy"
                type="text"
                class="gfy-builder__input"
                placeholder="e.g. Democratize elite growth strategies"
              />
            </div>
          </div>
        </div>
      </div>

      <!-- Section Divider -->
      <div class="gfy-section-divider">
        <span>Context & Style</span>
      </div>

      <!-- STEP 2: Brand Context -->
      <div class="gfy-input-group">
        <label class="gfy-label">Step 2: Brand Context</label>
        <div class="gfy-builder">
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Industry</label>
            <input
              v-model="industry"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g. SaaS, Consulting"
            />
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">Unique Factor</label>
            <input
              v-model="uniqueFactor"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g. No-BS approach, Zero-to-One focus"
            />
          </div>
          <div class="gfy-builder__field gfy-builder__field--full">
            <label class="gfy-builder__label">Existing Taglines (Optional)</label>
            <textarea
              v-model="existingTaglines"
              class="gfy-textarea"
              rows="2"
              placeholder="List any slogans you currently use..."
            ></textarea>
          </div>
        </div>
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

    <!-- Results Section -->
    <div v-if="hasTaglines" class="gfy-results">
      <div class="gfy-results-layout">
        <!-- LEFT SIDEBAR: Master Tagline Slot -->
        <aside class="gfy-layout-sidebar">
          <div class="gfy-current-topics">
            <div class="gfy-current-topics__header">
              <h3 class="gfy-current-topics__title">Your Master Tagline</h3>
            </div>

            <div
              class="gfy-bio-slot"
              :class="{ 'gfy-bio-slot--locked': lockedTagline }"
            >
              <div class="gfy-bio-slot__header">
                <span class="gfy-bio-slot__label">{{ lockedTagline ? 'Active Tagline' : 'Not Selected' }}</span>
                <svg v-if="lockedTagline" class="gfy-bio-slot__lock" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
                </svg>
              </div>
              <div class="gfy-bio-slot__preview">
                {{ lockedTagline || 'Select a tagline to lock it here' }}
              </div>
            </div>

            <p class="gfy-sidebar-hint">
              This tagline will be used across your Media Kit and bio variations.
            </p>

            <!-- Actions for locked tagline -->
            <div v-if="lockedTagline" class="gfy-sidebar-actions">
              <button
                type="button"
                class="gfy-btn gfy-btn--outline gfy-btn--small"
                @click="handleCopy"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                  <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                </svg>
                Copy
              </button>
              <button
                type="button"
                class="gfy-btn gfy-btn--text gfy-btn--small"
                @click="unlockTagline"
              >
                Unlock
              </button>
            </div>
          </div>
        </aside>

        <!-- RIGHT MAIN: Tagline Variations -->
        <main class="gfy-layout-main">
          <!-- Results Header -->
          <div class="gfy-results__header">
            <div class="gfy-results__title-row">
              <h3 class="gfy-results__title">Generated Taglines</h3>
              <span class="gfy-results__count">{{ taglines.length }} Ideas</span>
            </div>
            <div class="gfy-results__actions">
              <button
                type="button"
                class="gfy-btn gfy-btn--outline"
                :disabled="isGenerating"
                @click="handleRegenerate"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Regenerate
              </button>
            </div>
          </div>

          <!-- Refinement Box -->
          <div class="gfy-refinement-box">
            <div class="gfy-refinement-header">
              <svg class="gfy-refinement-icon" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M7.5 5.6L10 7 8.6 4.5 10 2 7.5 3.4 5 2l1.4 2.5L5 7zm12 9.8L17 14l1.4 2.5L17 19l2.5-1.4L22 19l-1.4-2.5L22 14zM22 2l-2.5 1.4L17 2l1.4 2.5L17 7l2.5-1.4L22 7l-1.4-2.5zm-7.63 5.29a.996.996 0 0 0-1.41 0L1.29 18.96a.996.996 0 0 0 0 1.41l2.34 2.34c.39.39 1.02.39 1.41 0L16.7 11.05a.996.996 0 0 0 0-1.41l-2.33-2.35z"/>
              </svg>
              <span class="gfy-refinement-title">Refine Taglines</span>
            </div>
            <div class="gfy-refinement-input-wrapper">
              <textarea
                v-model="refinementFeedback"
                class="gfy-refinement-textarea"
                rows="1"
                placeholder="e.g. Make them shorter or more focused on the 90-day timeline..."
                @keydown.enter.prevent="handleRefine"
              ></textarea>
              <button
                type="button"
                class="gfy-btn-refine"
                :disabled="!refinementFeedback.trim() || isGenerating"
                @click="handleRefine"
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M23 4v6h-6M1 20v-6h6"/>
                  <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"/>
                </svg>
                Refine
              </button>
            </div>
          </div>

          <!-- Selection Banner -->
          <div class="gfy-selection-banner">
            <span class="gfy-selection-banner__text">
              Click a tagline to select it, then lock your favorite
            </span>
            <span v-if="selectedIndex >= 0" class="gfy-selection-banner__count">
              1 selected
            </span>
          </div>

          <!-- Tagline List -->
          <div class="gfy-tagline-list">
            <div
              v-for="(tagline, index) in taglines"
              :key="index"
              class="gfy-tagline-row"
              :class="{
                'gfy-tagline-row--selected': selectedIndex === index,
                'gfy-tagline-row--locked': lockedTaglineIndex === index
              }"
              @click="selectTagline(index)"
            >
              <div
                class="gfy-tagline-row__checkbox"
                :class="{ 'gfy-tagline-row__checkbox--checked': selectedIndex === index || lockedTaglineIndex === index }"
              >
                <svg v-if="selectedIndex === index || lockedTaglineIndex === index" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <p class="gfy-tagline-row__text">{{ tagline.text || tagline }}</p>
              <button
                v-if="selectedIndex === index && lockedTaglineIndex !== index"
                type="button"
                class="gfy-btn gfy-btn--primary gfy-btn--small"
                @click.stop="lockTagline(index)"
              >
                Lock
              </button>
              <svg v-if="lockedTaglineIndex === index" class="gfy-tagline-row__lock-icon" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
          </div>

          <!-- Save Actions -->
          <div class="gfy-results__footer">
            <!-- Authority Hook Save Option -->
            <label v-if="hasAuthorityHookData" class="gfy-checkbox-option">
              <input
                v-model="saveAuthorityHook"
                type="checkbox"
                class="gfy-checkbox-option__input"
              />
              <span class="gfy-checkbox-option__box">
                <svg v-if="saveAuthorityHook" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </span>
              <span class="gfy-checkbox-option__label">Also save Authority Hook to profile</span>
            </label>

            <div class="gfy-save-section">
              <button
                type="button"
                class="gfy-btn gfy-btn--primary gfy-btn--large"
                :disabled="!lockedTagline || isSaving"
                @click="handleSaveToProfile"
              >
                <svg v-if="!isSaving" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <span v-if="isSaving" class="gfy-spinner"></span>
                {{ isSaving ? 'Saving...' : 'Save Tagline to Profile' }}
              </button>
              <button type="button" class="gfy-btn gfy-btn--text" @click="handleStartOver">
                Start Over
              </button>
            </div>

            <!-- Save Success Message -->
            <span v-if="saveSuccess" class="gfy-save-success">
              &#10003; Saved successfully!
            </span>
            <!-- Save Error Message -->
            <span v-if="saveError" class="gfy-save-error">
              {{ saveError }}
            </span>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import { useAIGenerator } from '../../src/composables/useAIGenerator';
import { useProfileContext } from '../../src/composables/useProfileContext';
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared/constants';

const props = defineProps({
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:can-generate', 'authority-hook-update', 'generated', 'saved']);

// Use composables
const generator = useAIGenerator('tagline');
const {
  profileId: contextProfileId,
  isSaving,
  saveError: composableSaveError,
  saveToProfile
} = useProfileContext();

// Local save error (fallback for when composable error doesn't apply)
const localSaveError = ref(null);
const saveError = computed(() => localSaveError.value || composableSaveError.value);

// Inject profile data from parent (EmbeddedToolWrapper provides this)
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Local state
const saveSuccess = ref(false);
const selectedProfileId = ref(null);
const saveAuthorityHook = ref(true);
const refinementFeedback = ref('');

// Selection and locking state
const selectedIndex = ref(-1);
const lockedTagline = ref(null);
const lockedTaglineIndex = ref(-1);
const profileTagline = ref(null); // Track tagline from profile separately

// Refinement history
const previousTaglines = ref([]);

// Computed: resolved profile ID from all available sources
const resolvedProfileId = computed(() => {
  return props.profileData?.id
    || injectedProfileData.value?.id
    || contextProfileId.value
    || null;
});

// Keep selectedProfileId in sync with resolved ID
watch(resolvedProfileId, (newId) => {
  selectedProfileId.value = newId;
}, { immediate: true });

// Authority Hook Builder fields (4 W's)
const hookWho = ref('');
const hookWhat = ref('');
const hookWhen = ref('');
const hookHow = ref('');

// Impact Intro fields (2 W's)
const impactWhere = ref('');
const impactWhy = ref('');

// Brand Context fields
const industry = ref('');
const uniqueFactor = ref('');
const existingTaglines = ref('');

// Settings
const styleFocus = ref('outcome');
const tone = ref('bold');

/**
 * Computed: Live preview of authority hook
 */
const hookPreview = computed(() => {
  const who = hookWho.value || '[WHO]';
  const what = hookWhat.value || '[WHAT]';
  const when = hookWhen.value || '[WHEN]';
  const how = hookHow.value || '[HOW]';
  return `I help ${who} ${what} ${when} through ${how}.`;
});

/**
 * Computed: Generated authority hook summary
 */
const generatedHookSummary = computed(() => {
  if (!hookWho.value && !hookWhat.value) return '';
  let summary = `I help ${hookWho.value || ''} ${hookWhat.value || ''}`;
  if (hookWhen.value) summary += ` ${hookWhen.value}`;
  if (hookHow.value) summary += ` through ${hookHow.value}`;
  return summary.trim() + '.';
});

/**
 * Computed: Taglines array from generator
 */
const taglines = computed(() => {
  const content = generator.generatedContent.value;
  if (!content) return [];
  if (Array.isArray(content)) {
    return content.map((item) => {
      if (typeof item === 'string') return { text: item };
      return { text: item.text || item };
    });
  }
  return [];
});

/**
 * Has taglines check
 */
const hasTaglines = computed(() => taglines.value.length > 0);

/**
 * Is generating check
 */
const isGenerating = computed(() => generator.isGenerating.value);

/**
 * Error from generator
 */
const error = computed(() => generator.error.value);

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return (hookWho.value && hookWho.value.trim().length > 0) ||
         (hookWhat.value && hookWhat.value.trim().length > 0);
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

  // Authority Hook fields
  if (profileData.hook_who) hookWho.value = profileData.hook_who;
  if (profileData.hook_what) hookWhat.value = profileData.hook_what;
  if (profileData.hook_when) hookWhen.value = profileData.hook_when;
  if (profileData.hook_how) hookHow.value = profileData.hook_how;

  // Impact Intro fields
  if (profileData.impact_where) impactWhere.value = profileData.impact_where;
  if (profileData.impact_why) impactWhy.value = profileData.impact_why;

  // Existing tagline from profile (only set if not already unlocked by user)
  if (profileData.tagline) {
    profileTagline.value = profileData.tagline;
    // Only auto-lock profile tagline if user hasn't manually unlocked
    if (lockedTagline.value === null || lockedTagline.value === profileTagline.value) {
      lockedTagline.value = profileData.tagline;
      lockedTaglineIndex.value = -1; // -1 means from profile, not generated list
    }
  }
}

/**
 * Handle generate - exposed for parent to call
 */
const handleGenerate = async () => {
  selectedIndex.value = -1;
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
    count: 10
  };

  await generator.generate(params);

  emit('generated', { taglines: taglines.value });

  return { taglines: taglines.value };
};

/**
 * Handle regenerate
 */
const handleRegenerate = async () => {
  selectedIndex.value = -1;
  lockedTagline.value = null;
  lockedTaglineIndex.value = -1;
  await handleGenerate();
};

/**
 * Handle refine - send previous taglines with feedback
 */
const handleRefine = async () => {
  if (!refinementFeedback.value.trim() || taglines.value.length === 0) return;

  // Store current taglines for context
  previousTaglines.value = taglines.value.map(t => t.text);

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
    previousTaglines: previousTaglines.value,
    refinementFeedback: refinementFeedback.value
  };

  await generator.generate(params);

  // Keep locked tagline if still valid
  if (lockedTaglineIndex.value >= taglines.value.length) {
    lockedTaglineIndex.value = -1;
  }

  refinementFeedback.value = '';
  emit('generated', { taglines: taglines.value, refined: true });
};

/**
 * Select a tagline
 */
const selectTagline = (index) => {
  selectedIndex.value = index;
};

/**
 * Lock a tagline as the master tagline
 */
const lockTagline = (index) => {
  if (index >= 0 && index < taglines.value.length) {
    lockedTagline.value = taglines.value[index].text;
    lockedTaglineIndex.value = index;
    selectedIndex.value = index;
  }
};

/**
 * Unlock the master tagline
 */
const unlockTagline = () => {
  lockedTagline.value = null;
  lockedTaglineIndex.value = -1;
};

/**
 * Handle copy to clipboard
 */
const handleCopy = async () => {
  const textToCopy = lockedTagline.value || (selectedIndex.value >= 0 ? taglines.value[selectedIndex.value].text : '');
  if (!textToCopy) return;

  try {
    await navigator.clipboard.writeText(textToCopy);
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

    // Optionally save authority hook fields too
    if (saveAuthorityHook.value && hasAuthorityHookData.value) {
      await saveToProfile('authority_hook', {
        who: hookWho.value,
        what: hookWhat.value,
        when: hookWhen.value,
        how: hookHow.value
      }, {
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
 * Handle start over
 */
const handleStartOver = () => {
  generator.reset();
  selectedIndex.value = -1;
  lockedTagline.value = null;
  lockedTaglineIndex.value = -1;
  refinementFeedback.value = '';
  previousTaglines.value = [];
  saveSuccess.value = false;
  localSaveError.value = null;
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

.gfy-results__actions {
  display: flex;
  gap: 8px;
}

/* Refinement Box */
.gfy-refinement-box {
  background: linear-gradient(to bottom right, var(--mkcg-bg-primary, #ffffff), var(--mkcg-bg-secondary, #f8fafc));
  border: 1px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 12px;
  padding: 16px;
  margin-bottom: 1.5rem;
}

.gfy-refinement-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 10px;
}

.gfy-refinement-icon {
  color: var(--mkcg-primary, #3b82f6);
}

.gfy-refinement-title {
  font-size: 12px;
  font-weight: 800;
  color: var(--mkcg-primary, #3b82f6);
  text-transform: uppercase;
}

.gfy-refinement-input-wrapper {
  position: relative;
}

.gfy-refinement-textarea {
  width: 100%;
  padding: 12px 100px 12px 14px;
  border: 2px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 8px;
  font-family: inherit;
  font-size: 14px;
  background: var(--mkcg-bg-primary, #ffffff);
  box-sizing: border-box;
  resize: none;
  transition: border-color 0.2s;
}

.gfy-refinement-textarea:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
}

.gfy-btn-refine {
  position: absolute;
  right: 6px;
  top: 6px;
  bottom: 6px;
  padding: 0 14px;
  background: var(--mkcg-primary, #3b82f6);
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 700;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 6px;
  font-family: inherit;
  transition: background 0.2s;
}

.gfy-btn-refine:hover:not(:disabled) {
  background: var(--mkcg-primary-dark, #2563eb);
}

.gfy-btn-refine:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.gfy-tagline-row--selected {
  border-color: var(--mkcg-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.05);
}

.gfy-tagline-row--locked {
  border-color: var(--mkcg-primary, #3b82f6);
  background: rgba(59, 130, 246, 0.1);
}

.gfy-tagline-row__checkbox {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 2px solid var(--mkcg-border-light, #e2e8f0);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: all 0.15s;
}

.gfy-tagline-row__checkbox--checked {
  background: var(--mkcg-primary, #3b82f6);
  border-color: var(--mkcg-primary, #3b82f6);
  color: white;
}

.gfy-tagline-row__text {
  flex: 1;
  font-size: 0.9375rem;
  font-weight: 500;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0;
  line-height: 1.4;
}

.gfy-tagline-row__lock-icon {
  color: var(--mkcg-primary, #3b82f6);
  flex-shrink: 0;
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
