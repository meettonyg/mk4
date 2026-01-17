<template>
  <div class="gfy-authority-hook-generator">
    <!-- Profile Selector (for logged-in users in standalone mode) -->
    <ProfileSelector
      v-if="mode === 'default'"
      @profile-selected="handleProfileSelected"
      @profile-cleared="handleProfileCleared"
    />

    <!-- Restore Link (subtle text link) -->
    <button
      v-if="showDraftPrompt && mode === 'default'"
      type="button"
      class="gfy-restore-link"
      @click="handleRestoreDraft"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <path d="M1 4v6h6"/>
        <path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"/>
      </svg>
      Unsaved changes found. <strong>Restore?</strong>
    </button>

    <!-- Form Section (shown when no results) -->
    <div v-if="!hasHooks" class="gfy-authority-hook-form">
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
              placeholder="e.g. SaaS Founders"
            />
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">WHAT is the result?</label>
            <input
              v-model="hookWhat"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g. Increase revenue by 40%"
            />
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">WHEN do they need it?</label>
            <input
              v-model="hookWhen"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g. When scaling rapidly"
            />
          </div>
          <div class="gfy-builder__field">
            <label class="gfy-builder__label">HOW do you do it?</label>
            <input
              v-model="hookHow"
              type="text"
              class="gfy-builder__input"
              placeholder="e.g. My proven 90-day system"
            />
          </div>
        </div>

        <!-- Live Preview -->
        <div class="gfy-live-preview">
          "{{ hookPreview }}"
        </div>
      </div>
    </div>

    <!-- Results Section - 2 Column Layout -->
    <div v-if="hasHooks" class="gfy-results">
      <!-- Layout wrapper for side-by-side on desktop -->
      <div class="gfy-results-layout">
        <!-- LEFT SIDEBAR: Authority Hook Inputs + Preview -->
        <aside class="gfy-layout-sidebar">
          <!-- Authority Hook Builder (Compact) -->
          <div class="gfy-sidebar-hook">
            <div class="gfy-sidebar-hook__header">
              <span class="gfy-sidebar-hook__icon">&#9733;</span>
              <h3 class="gfy-sidebar-hook__title">Your Inputs</h3>
            </div>

            <!-- Compact Builder -->
            <div class="gfy-sidebar-builder">
              <div class="gfy-sidebar-builder__field">
                <label class="gfy-sidebar-builder__label">WHO</label>
                <input
                  v-model="hookWho"
                  type="text"
                  class="gfy-sidebar-builder__input"
                  placeholder="e.g. SaaS Founders"
                />
              </div>
              <div class="gfy-sidebar-builder__field">
                <label class="gfy-sidebar-builder__label">WHAT</label>
                <input
                  v-model="hookWhat"
                  type="text"
                  class="gfy-sidebar-builder__input"
                  placeholder="e.g. Increase revenue by 40%"
                />
              </div>
              <div class="gfy-sidebar-builder__field">
                <label class="gfy-sidebar-builder__label">WHEN</label>
                <input
                  v-model="hookWhen"
                  type="text"
                  class="gfy-sidebar-builder__input"
                  placeholder="e.g. When scaling rapidly"
                />
              </div>
              <div class="gfy-sidebar-builder__field">
                <label class="gfy-sidebar-builder__label">HOW</label>
                <input
                  v-model="hookHow"
                  type="text"
                  class="gfy-sidebar-builder__input"
                  placeholder="e.g. My proven 90-day system"
                />
              </div>
            </div>

            <!-- Base Hook Preview -->
            <div class="gfy-sidebar-preview">
              <div class="gfy-sidebar-preview__label">Base Hook</div>
              <div class="gfy-sidebar-preview__text">"{{ hookPreview }}"</div>
            </div>
          </div>

          <!-- Current Hook from Profile (if logged in) -->
          <div v-if="hasCurrentHook && selectedProfileId" class="gfy-current-hook">
            <div class="gfy-current-hook__header">
              <h4 class="gfy-current-hook__title">Current Saved Hook</h4>
            </div>
            <div class="gfy-current-hook__content">
              <p class="gfy-current-hook__text">{{ currentHookText }}</p>
            </div>
          </div>
        </aside>

        <!-- RIGHT MAIN: Generated Hooks and Actions -->
        <main class="gfy-layout-main">
          <!-- Results Header -->
          <div class="gfy-results__header">
            <div class="gfy-results__title-row">
              <h3 class="gfy-results__title">Generated Hooks</h3>
              <span class="gfy-results__count">{{ hooks.length }} Variations</span>
            </div>
            <div class="gfy-results__actions">
              <!-- View Toggle -->
              <div class="gfy-view-toggle">
                <button
                  type="button"
                  class="gfy-view-toggle__btn"
                  :class="{ 'gfy-view-toggle__btn--active': viewMode === 'card' }"
                  @click="viewMode = 'card'"
                  title="Card View"
                >
                  <i class="fas fa-th-large"></i>
                </button>
                <button
                  type="button"
                  class="gfy-view-toggle__btn"
                  :class="{ 'gfy-view-toggle__btn--active': viewMode === 'list' }"
                  @click="viewMode = 'list'"
                  title="List View"
                >
                  <i class="fas fa-list"></i>
                </button>
              </div>
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
                {{ selectedHookIndex !== null ? 'Copy Selected' : 'Copy All' }}
              </button>
            </div>
          </div>

          <!-- Selection Banner -->
          <div class="gfy-selection-banner">
            <span class="gfy-selection-banner__text">
              Select your preferred authority hook variation
            </span>
            <span class="gfy-selection-banner__count">
              {{ selectedHookIndex !== null ? '1 selected' : 'None selected' }}
            </span>
          </div>

          <!-- Hooks Grid (Card View) -->
          <div v-if="viewMode === 'card'" class="gfy-hooks-grid">
            <div
              v-for="(hook, index) in hooks"
              :key="index"
              class="gfy-hook-card"
              :class="{ 'gfy-hook-card--selected': selectedHookIndex === index }"
              @click="selectHook(index)"
            >
              <div class="gfy-hook-card__header">
                <div class="gfy-hook-card__number">{{ index + 1 }}</div>
                <div class="gfy-hook-card__checkbox">
                  <svg v-if="selectedHookIndex === index" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                  </svg>
                </div>
              </div>
              <div class="gfy-hook-card__content">
                <span v-if="hook.angle" class="gfy-hook-card__angle">{{ hook.angle }}</span>
                <p class="gfy-hook-card__text">{{ hook.text }}</p>
              </div>
            </div>
          </div>

          <!-- Hooks List (List View) -->
          <div v-else class="gfy-hooks-list">
            <div
              v-for="(hook, index) in hooks"
              :key="index"
              class="gfy-hook-row"
              :class="{ 'gfy-hook-row--selected': selectedHookIndex === index }"
              @click="selectHook(index)"
            >
              <div class="gfy-hook-row__checkbox">
                <svg v-if="selectedHookIndex === index" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
              <div class="gfy-hook-row__number">{{ index + 1 }}.</div>
              <div class="gfy-hook-row__content">
                <p class="gfy-hook-row__text">{{ hook.text }}</p>
                <span v-if="hook.angle" class="gfy-hook-row__angle">{{ hook.angle }}</span>
              </div>
            </div>
          </div>

          <!-- Save Actions -->
          <div class="gfy-results__footer">
            <!-- Save Authority Hook Fields Option -->
            <label v-if="hasAuthorityHookData" class="gfy-checkbox-option">
              <input
                v-model="saveHookFields"
                type="checkbox"
                class="gfy-checkbox-option__input"
              />
              <span class="gfy-checkbox-option__box">
                <svg v-if="saveHookFields" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </span>
              <span class="gfy-checkbox-option__label">Also save WHO/WHAT/WHEN/HOW fields to profile</span>
            </label>

            <div class="gfy-save-section">
              <button
                type="button"
                class="gfy-btn gfy-btn--primary gfy-btn--large"
                :disabled="selectedHookIndex === null || localIsSaving || !selectedProfileId"
                @click="handleSaveToProfile"
              >
                <svg v-if="!localIsSaving" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <span v-if="localIsSaving" class="gfy-spinner"></span>
                {{ localIsSaving ? 'Saving...' : 'Save to Media Kit' }}
              </button>
              <button type="button" class="gfy-btn gfy-btn--text" @click="handleStartOver">
                Start Over
              </button>
            </div>
            <!-- Save Success Message -->
            <span v-if="saveSuccess" class="gfy-save-success">
              Saved successfully!
            </span>
            <!-- Save Error Message -->
            <span v-if="localSaveError" class="gfy-save-error">
              {{ localSaveError }}
            </span>
          </div>
        </main>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject, onMounted, onUnmounted } from 'vue';
import { useGeneratorHistory } from '../../src/composables/useGeneratorHistory';
import { useAIAuthorityHooks } from '../../src/composables/useAIAuthorityHooks';
import { useProfileContext } from '../../src/composables/useProfileContext';
import { useAuthorityHook } from '../../src/composables/useAuthorityHook';
import { useDraftState } from '../../src/composables/useDraftState';
import { useStandaloneProfile } from '../../src/composables/useStandaloneProfile';
import { EMBEDDED_PROFILE_DATA_KEY } from '../_shared/constants';
import { ProfileSelector } from '../_shared';

const props = defineProps({
  /**
   * Mode: 'default' or 'integrated'
   */
  mode: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'integrated'].includes(v)
  },
  /**
   * Profile data for pre-population
   */
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:can-generate', 'generated', 'saved']);

// Use composables - useAIAuthorityHooks parses string API response into array of hook objects
const {
  isGenerating,
  error,
  hooks,
  hasHooks,
  generate,
  copyToClipboard,
  reset
} = useAIAuthorityHooks();

const {
  profileId: contextProfileId,
  saveToProfile
} = useProfileContext();

// Use Authority Hook composable for state persistence
const {
  who: hookWho,
  what: hookWhat,
  when: hookWhen,
  how: hookHow,
  loadFromProfileData,
  reset: resetAuthorityHook
} = useAuthorityHook();

// Generator history for UX enhancements
const {
  history,
  hasHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
  formatTimestamp
} = useGeneratorHistory('authority-hook');

const showHistory = ref(false);

// Profile functionality (standalone mode)
const {
  selectedProfileId,
  profileData: standaloneProfileData,
  hasSelectedProfile,
  saveMultipleToProfile
} = useStandaloneProfile();

// Draft state for auto-save
const {
  hasDraft,
  lastSaved,
  isAutoSaving,
  saveDraft,
  loadDraft,
  clearDraft,
  startAutoSave,
  getLastSavedText
} = useDraftState('authority-hook');

const showDraftPrompt = ref(false);

// Inject profile data from parent (EmbeddedToolWrapper provides this)
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Local state
const selectedHookIndex = ref(null);
const saveSuccess = ref(false);
const viewMode = ref('list'); // 'card' or 'list' - default to list
const localIsSaving = ref(false);
const localSaveError = ref(null);
const saveHookFields = ref(true); // Whether to also save WHO/WHAT/WHEN/HOW fields

// Current hook from profile
const currentHookText = ref('');

// Computed: resolved profile ID from all available sources
const resolvedProfileId = computed(() => {
  // Priority: props > injected > context service
  return props.profileData?.id
    || injectedProfileData.value?.id
    || contextProfileId.value
    || null;
});

// Keep selectedProfileId in sync with resolved ID
watch(resolvedProfileId, (newId) => {
  selectedProfileId.value = newId;
}, { immediate: true });

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
 * Can generate check - matches meta.json anyOf validation (who OR what)
 */
const canGenerate = computed(() => {
  return (hookWho.value && hookWho.value.trim().length > 0) ||
         (hookWhat.value && hookWhat.value.trim().length > 0);
});

// hasHooks is now provided by useAIAuthorityHooks composable
// which properly parses string API responses into an array of hook objects

/**
 * Check if user has entered any authority hook data
 */
const hasAuthorityHookData = computed(() => {
  return !!(hookWho.value || hookWhat.value || hookWhen.value || hookHow.value);
});

/**
 * Check if profile has a current hook
 */
const hasCurrentHook = computed(() => {
  return !!currentHookText.value;
});

/**
 * Form completion tracking for UX
 */
const formCompletion = computed(() => {
  const fields = [
    { name: 'who', filled: !!(hookWho.value && hookWho.value.trim()), required: true },
    { name: 'what', filled: !!(hookWhat.value && hookWhat.value.trim()), required: true },
    { name: 'when', filled: !!(hookWhen.value && hookWhen.value.trim()), required: false },
    { name: 'how', filled: !!(hookHow.value && hookHow.value.trim()), required: false }
  ];
  const filledCount = fields.filter(f => f.filled).length;
  const totalCount = fields.length;
  return {
    fields,
    filledCount,
    totalCount,
    percentage: Math.round((filledCount / totalCount) * 100)
  };
});

/**
 * Keyboard shortcut handler
 */
const handleKeyboardShortcut = (event) => {
  if ((event.ctrlKey || event.metaKey) && event.key === 'Enter') {
    if (canGenerate.value && !isGenerating.value) {
      event.preventDefault();
      handleGenerate();
    }
  }
};

/**
 * Populate from profile data - uses composable for state persistence
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Use composable's loadFromProfileData for state persistence
  loadFromProfileData(profileData);

  // Load current authority statement if exists
  if (profileData.authority_statement) {
    currentHookText.value = profileData.authority_statement;
  }
}

/**
 * Handle profile selected from ProfileSelector (standalone mode)
 * Sets selectedProfileId so save functionality can work correctly
 */
function handleProfileSelected({ id, data }) {
  if (props.mode === 'default') {
    // Set the profile ID in our composable instance so saves work correctly
    if (id) {
      selectedProfileId.value = id;
    }
    if (data) {
      populateFromProfile(data);
    }
  }
}

/**
 * Handle profile cleared from ProfileSelector (standalone mode)
 */
function handleProfileCleared() {
  // Clear the profile ID so saves are disabled
  selectedProfileId.value = null;
}

/**
 * Handle restore draft button click
 */
function handleRestoreDraft() {
  const draft = loadDraft();
  if (draft) {
    if (draft.hookWho) hookWho.value = draft.hookWho;
    if (draft.hookWhat) hookWhat.value = draft.hookWhat;
    if (draft.hookWhen) hookWhen.value = draft.hookWhen;
    if (draft.hookHow) hookHow.value = draft.hookHow;
  }
  showDraftPrompt.value = false;
}

/**
 * Handle discard draft button click
 */
function handleDiscardDraft() {
  showDraftPrompt.value = false;
  clearDraft();
}

/**
 * Select a hook
 */
const selectHook = (index) => {
  if (selectedHookIndex.value === index) {
    selectedHookIndex.value = null;
  } else {
    selectedHookIndex.value = index;
  }
};

/**
 * Handle generate - exposed for parent to call
 */
const handleGenerate = async () => {
  selectedHookIndex.value = null;

  try {
    await generate({
      who: hookWho.value,
      what: hookWhat.value,
      when: hookWhen.value,
      how: hookHow.value,
      count: 5
    });

    // Emit generated event for parent (EmbeddedToolApp) to handle
    // Include 'hook' (singular) for previewContent compatibility
    const firstHook = hooks.value?.[0]?.text || '';
    emit('generated', {
      hooks: hooks.value,
      hook: firstHook,
      content: firstHook
    });

    // Save to history on success
    if (hooks.value && hooks.value.length > 0) {
      addToHistory({
        input: {
          who: hookWho.value,
          what: hookWhat.value,
          when: hookWhen.value,
          how: hookHow.value
        },
        output: firstHook,
        metadata: {
          variationCount: hooks.value.length
        }
      });
    }

    return { hooks: hooks.value };
  } catch (err) {
    console.error('[Authority Hook Generator] Generation failed:', err);
    throw err;
  }
};

/**
 * Handle regenerate
 */
const handleRegenerate = async () => {
  selectedHookIndex.value = null;
  await handleGenerate();
};

/**
 * Handle copy - copies selected hook or all hooks
 */
const handleCopy = async () => {
  let textToCopy;

  if (selectedHookIndex.value !== null) {
    // Copy selected hook
    const hook = hooks.value[selectedHookIndex.value];
    textToCopy = hook.text;
  } else {
    // Copy all hooks as numbered list
    textToCopy = hooks.value
      .map((hook, index) => `${index + 1}. ${hook.text}`)
      .join('\n');
  }

  try {
    await navigator.clipboard.writeText(textToCopy);
  } catch (err) {
    console.error('[Authority Hook Generator] Failed to copy:', err);
  }
};

/**
 * Handle save to media kit - saves selected hook and optionally hook fields
 */
const handleSaveToProfile = async () => {
  if (selectedHookIndex.value === null) return;
  if (!selectedProfileId.value) {
    localSaveError.value = 'Please select a profile first';
    return;
  }

  const selectedHook = hooks.value[selectedHookIndex.value];
  localIsSaving.value = true;
  localSaveError.value = null;

  try {
    // Build save data - always include statement, conditionally include fields
    const saveData = {
      statement: selectedHook.text
    };

    // Only include WHO/WHAT/WHEN/HOW fields if checkbox is checked
    if (saveHookFields.value && hasAuthorityHookData.value) {
      saveData.who = hookWho.value;
      saveData.what = hookWhat.value;
      saveData.when = hookWhen.value;
      saveData.how = hookHow.value;
    }

    const result = await saveToProfile('authority_hook', saveData, {
      profileId: selectedProfileId.value
    });

    if (result.success) {
      saveSuccess.value = true;
      currentHookText.value = selectedHook.text;
      setTimeout(() => { saveSuccess.value = false; }, 3000);

      emit('saved', {
        profileId: selectedProfileId.value,
        hook: selectedHook.text,
        fieldsSaved: saveHookFields.value && hasAuthorityHookData.value,
        fields: saveHookFields.value ? {
          who: hookWho.value,
          what: hookWhat.value,
          when: hookWhen.value,
          how: hookHow.value
        } : null
      });
    } else {
      localSaveError.value = result.errors?.join(', ') || 'Failed to save';
    }
  } catch (err) {
    console.error('[Authority Hook Generator] Save failed:', err);
    localSaveError.value = err.message || 'Failed to save to profile';
  } finally {
    localIsSaving.value = false;
  }
};

/**
 * Handle start over - reset generated hooks and clear form
 */
const handleStartOver = () => {
  selectedHookIndex.value = null;
  // Reset generated hooks from useAIGenerator
  if (reset) {
    reset();
  }
  // Clear form fields using composable (also clears store for persistence)
  resetAuthorityHook();
};

// Watch for canGenerate changes
watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
}, { immediate: true });

// Watch profile data from both props and inject
watch(
  [() => props.profileData, injectedProfileData],
  ([propsData, injectedData]) => {
    const data = propsData || injectedData;
    if (data) populateFromProfile(data);
  },
  { immediate: true }
);

// Initialize on mount
onMounted(() => {
  // Add keyboard shortcut listener
  document.addEventListener('keydown', handleKeyboardShortcut);

  // Check for saved draft (only in standalone mode)
  if (props.mode === 'default' && hasDraft.value) {
    showDraftPrompt.value = true;
  }

  // Start auto-save for draft state
  if (props.mode === 'default') {
    startAutoSave(() => ({
      hookWho: hookWho.value,
      hookWhat: hookWhat.value,
      hookWhen: hookWhen.value,
      hookHow: hookHow.value
    }));
  }
});

// Cleanup on unmount
onUnmounted(() => {
  document.removeEventListener('keydown', handleKeyboardShortcut);
});

// Expose for parent
defineExpose({
  handleGenerate,
  hooks,
  hasHooks,
  isGenerating,
  error,
  copyToClipboard
});
</script>

<style scoped>
.gfy-authority-hook-generator {
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

/* CURRENT HOOK SIDEBAR */
.gfy-current-hook {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 1.25rem;
  margin-bottom: 1.5rem;
}

.gfy-current-hook__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  gap: 0.5rem;
}

.gfy-current-hook__title {
  font-size: 1rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-current-hook__hint {
  font-size: 0.8rem;
  color: var(--gfy-text-muted);
}

.gfy-current-hook__content {
  padding: 1rem;
  background: var(--gfy-primary-light);
  border: 1px solid #bfdbfe;
  border-radius: var(--gfy-radius-md);
}

.gfy-current-hook__text {
  margin: 0;
  font-size: 0.9rem;
  line-height: 1.5;
  color: var(--gfy-primary-dark);
  font-style: italic;
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

/* SIDE-BY-SIDE LAYOUT */
.gfy-results-layout {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

/* Desktop: side-by-side */
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

  /* Stack header vertically when sidebar is present */
  .gfy-layout-main .gfy-results__header {
    flex-direction: column;
    align-items: flex-start;
  }
}

/* SIDEBAR HOOK BUILDER */
.gfy-sidebar-hook {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-left: 4px solid var(--gfy-primary-color);
  border-radius: var(--gfy-radius-md);
  padding: 1rem;
  margin-bottom: 1rem;
}

.gfy-sidebar-hook__header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.75rem;
}

.gfy-sidebar-hook__title {
  font-size: 0.875rem;
  font-weight: 700;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-sidebar-hook__icon {
  color: var(--gfy-warning-color);
  font-size: 1rem;
}

/* SIDEBAR BUILDER - Compact stacked layout */
.gfy-sidebar-builder {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.gfy-sidebar-builder__field {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.gfy-sidebar-builder__label {
  font-size: 0.7rem;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gfy-primary-color);
}

.gfy-sidebar-builder__input {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-size: 0.85rem;
  background: var(--gfy-white);
  box-sizing: border-box;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gfy-sidebar-builder__input:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 2px var(--gfy-primary-light);
}

.gfy-sidebar-builder__input::placeholder {
  color: var(--gfy-text-muted);
  font-size: 0.8rem;
}

/* SIDEBAR PREVIEW */
.gfy-sidebar-preview {
  margin-top: 1rem;
  padding: 0.75rem;
  background: var(--gfy-primary-light);
  border-radius: var(--gfy-radius-md);
  border: 1px solid #bfdbfe;
}

.gfy-sidebar-preview__label {
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gfy-text-secondary);
  margin-bottom: 0.5rem;
}

.gfy-sidebar-preview__text {
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--gfy-primary-dark);
  font-style: italic;
}

/* Sidebar panel styling */
.gfy-layout-sidebar .gfy-current-hook {
  background: var(--gfy-bg-color);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  padding: 1rem;
  margin-bottom: 0;
}

.gfy-layout-sidebar .gfy-current-hook__header {
  margin-bottom: 0.5rem;
}

.gfy-layout-sidebar .gfy-current-hook__title {
  font-size: 0.75rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gfy-text-secondary);
  margin: 0;
}

.gfy-layout-sidebar .gfy-current-hook__content {
  padding: 0.75rem;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
}

.gfy-layout-sidebar .gfy-current-hook__text {
  font-size: 0.85rem;
  line-height: 1.4;
  color: var(--gfy-text-primary);
  font-style: italic;
  margin: 0;
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

/* VIEW TOGGLE */
.gfy-view-toggle {
  display: flex;
  background: var(--gfy-bg-color, #f8fafc);
  border: 1px solid var(--gfy-border-color, #e2e8f0);
  border-radius: var(--gfy-radius-md, 6px);
  padding: 3px;
}

.gfy-view-toggle__btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 34px;
  height: 34px;
  background: transparent;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  color: var(--gfy-text-muted, #94a3b8);
  transition: all 0.15s ease;
}

.gfy-view-toggle__btn i {
  font-size: 14px;
}

.gfy-view-toggle__btn:hover:not(.gfy-view-toggle__btn--active) {
  color: var(--gfy-text-secondary, #64748b);
  background: rgba(0, 0, 0, 0.04);
}

.gfy-view-toggle__btn--active {
  background: var(--gfy-white, #ffffff);
  color: var(--gfy-primary-color, #2563eb);
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);
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

/* HOOKS GRID - Card View */
.gfy-hooks-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 1rem;
  margin-bottom: 1.5rem;
}

/* Single column on mobile */
@media (max-width: 768px) {
  .gfy-hooks-grid {
    grid-template-columns: 1fr;
  }
}

.gfy-hook-card {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  padding: 1.25rem;
  background: var(--gfy-white);
  border: 2px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  cursor: pointer;
  transition: all 0.15s ease;
  min-height: 120px;
}

.gfy-hook-card:hover {
  border-color: var(--gfy-primary-color);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
}

.gfy-hook-card--selected {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-hook-card__header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.gfy-hook-card__number {
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  background: var(--gfy-bg-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.9rem;
  font-weight: 700;
  color: var(--gfy-text-secondary);
}

.gfy-hook-card--selected .gfy-hook-card__number {
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-hook-card__content {
  flex: 1;
}

.gfy-hook-card__angle {
  display: inline-block;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
  padding: 0.2rem 0.5rem;
  border-radius: 4px;
  margin-bottom: 0.4rem;
}

.gfy-hook-card__text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-hook-card__checkbox {
  flex-shrink: 0;
  width: 24px;
  height: 24px;
  border: 2px solid var(--gfy-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gfy-white);
}

.gfy-hook-card--selected .gfy-hook-card__checkbox {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-white);
}

/* HOOKS LIST VIEW */
.gfy-hooks-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1.5rem;
}

.gfy-hook-row {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 0.875rem 1rem;
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gfy-hook-row:hover {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-bg-color);
}

.gfy-hook-row--selected {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-hook-row__checkbox {
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  border: 2px solid var(--gfy-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gfy-white);
  margin-top: 2px;
}

.gfy-hook-row--selected .gfy-hook-row__checkbox {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-hook-row__number {
  flex-shrink: 0;
  font-size: 0.9rem;
  font-weight: 600;
  color: var(--gfy-text-secondary);
  min-width: 24px;
  margin-top: 2px;
}

.gfy-hook-row__content {
  flex: 1;
}

.gfy-hook-row__text {
  font-size: 0.95rem;
  line-height: 1.5;
  color: var(--gfy-text-primary);
  margin: 0 0 0.25rem 0;
}

.gfy-hook-row__angle {
  display: inline-block;
  font-size: 0.75rem;
  color: var(--gfy-text-muted);
  font-style: italic;
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

/* CHECKBOX OPTION */
.gfy-checkbox-option {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  user-select: none;
}

.gfy-checkbox-option__input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.gfy-checkbox-option__box {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border: 2px solid var(--gfy-border-color);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--gfy-white);
  transition: all 0.15s ease;
}

.gfy-checkbox-option__input:checked + .gfy-checkbox-option__box {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-checkbox-option__input:focus + .gfy-checkbox-option__box {
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-checkbox-option__label {
  font-size: 0.9rem;
  color: var(--gfy-text-secondary);
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

/* RESPONSIVE */
@media (max-width: 768px) {
  .gfy-builder {
    grid-template-columns: 1fr;
  }

  .gfy-hooks-grid {
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
