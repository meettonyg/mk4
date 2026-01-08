<template>
  <div class="gfy-topics-generator">
    <!-- Form Section -->
    <div v-if="!hasTopics" class="gfy-topics-form">
      <!-- Expertise Field -->
      <div class="gfy-input-group">
        <label class="gfy-label">Your Area of Expertise *</label>
        <textarea
          v-model="expertise"
          class="gfy-textarea"
          rows="2"
          placeholder="e.g. Digital Marketing Strategies"
        ></textarea>
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

    <!-- Results Section -->
    <div v-if="hasTopics" class="gfy-results">
      <!-- Results Header -->
      <div class="gfy-results__header">
        <div class="gfy-results__title-row">
          <h3 class="gfy-results__title">Generated Topics</h3>
          <span class="gfy-results__count">{{ topics.length }} Ideas</span>
        </div>
        <div class="gfy-results__actions">
          <button type="button" class="gfy-btn gfy-btn--outline" @click="handleRegenerate">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M23 4v6h-6M1 20v-6h6"/>
              <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
            </svg>
            Regenerate
          </button>
          <button type="button" class="gfy-btn gfy-btn--outline" @click="handleCopyAll">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
            </svg>
            Copy All
          </button>
        </div>
      </div>

      <!-- Selection Banner -->
      <div class="gfy-selection-banner">
        <span class="gfy-selection-banner__text">
          Select up to 5 topics to save to your Media Kit
        </span>
        <span class="gfy-selection-banner__count">
          {{ selectedTopics.length }} of 5 selected
        </span>
      </div>

      <!-- Topics Grid -->
      <div class="gfy-topics-grid">
        <div
          v-for="(topic, index) in topics"
          :key="index"
          class="gfy-topic-card"
          :class="{ 'gfy-topic-card--selected': isSelected(index) }"
          @click="toggleSelection(index)"
        >
          <div class="gfy-topic-card__number">{{ index + 1 }}</div>
          <div class="gfy-topic-card__content">
            <span v-if="topic.category" class="gfy-topic-card__category">{{ topic.category }}</span>
            <p class="gfy-topic-card__title">{{ typeof topic === 'string' ? topic : topic.title || topic }}</p>
          </div>
          <div class="gfy-topic-card__checkbox">
            <svg v-if="isSelected(index)" width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
            </svg>
          </div>
        </div>
      </div>

      <!-- Save Actions -->
      <div class="gfy-results__footer">
        <button
          type="button"
          class="gfy-btn gfy-btn--primary gfy-btn--large"
          :disabled="selectedTopics.length === 0"
          @click="handleSaveToMediaKit"
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          Save to Media Kit
        </button>
        <button type="button" class="gfy-btn gfy-btn--text" @click="handleStartOver">
          Start Over
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch } from 'vue';
import { useAITopics } from '../../src/composables/useAITopics';

const props = defineProps({
  profileData: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['update:can-generate', 'authority-hook-update', 'generated', 'save']);

// Use composables
const {
  isGenerating,
  error,
  topics,
  hasTopics,
  generate,
  copyToClipboard,
  reset
} = useAITopics();

// Local state
const expertise = ref('');
const selectedTopics = ref([]);

// Authority Hook Builder fields
const hookWho = ref('');
const hookWhat = ref('');
const hookWhen = ref('');
const hookHow = ref('');

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
 * Can generate check
 */
const canGenerate = computed(() => {
  return (expertise.value && expertise.value.trim().length > 0) ||
         (hookWho.value && hookWhat.value);
});

/**
 * Check if topic is selected
 */
const isSelected = (index) => selectedTopics.value.includes(index);

/**
 * Toggle topic selection (max 5)
 */
const toggleSelection = (index) => {
  const idx = selectedTopics.value.indexOf(index);
  if (idx > -1) {
    selectedTopics.value.splice(idx, 1);
  } else if (selectedTopics.value.length < 5) {
    selectedTopics.value.push(index);
  }
};

/**
 * Populate from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;
  if (profileData.hook_who) hookWho.value = profileData.hook_who;
  if (profileData.hook_what) hookWhat.value = profileData.hook_what;
  if (profileData.hook_when) hookWhen.value = profileData.hook_when;
  if (profileData.hook_how) hookHow.value = profileData.hook_how;
  if (profileData.expertise) expertise.value = profileData.expertise;
}

/**
 * Handle generate - exposed for parent to call
 */
const handleGenerate = async () => {
  selectedTopics.value = [];
  const contextText = expertise.value || generatedHookSummary.value;

  await generate({
    expertise: contextText,
    authorityHook: generatedHookSummary.value,
    count: 10
  });

  // Emit generated event for parent (EmbeddedToolApp) to handle
  emit('generated', { topics: topics.value });

  return { topics: topics.value };
};

/**
 * Handle regenerate
 */
const handleRegenerate = async () => {
  selectedTopics.value = [];
  await handleGenerate();
};

/**
 * Handle copy all topics
 */
const handleCopyAll = async () => {
  await copyToClipboard();
};

/**
 * Handle save to media kit
 */
const handleSaveToMediaKit = () => {
  const selected = selectedTopics.value.map(idx => topics.value[idx]);
  emit('save', { topics: selected });
};

/**
 * Handle start over - reset and show form
 */
const handleStartOver = () => {
  selectedTopics.value = [];
  if (reset) {
    reset();
  }
};

// Watch for canGenerate changes
watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
}, { immediate: true });

// Watch authority hook changes
watch(
  [hookWho, hookWhat, hookWhen, hookHow],
  () => {
    emit('authority-hook-update', {
      who: hookWho.value,
      what: hookWhat.value,
      when: hookWhen.value,
      how: hookHow.value,
      summary: generatedHookSummary.value
    });
  }
);

// Watch profile data prop
watch(
  () => props.profileData,
  (newData) => {
    if (newData) populateFromProfile(newData);
  },
  { immediate: true }
);

// Expose for parent
defineExpose({
  handleGenerate,
  topics,
  hasTopics,
  isGenerating,
  error,
  copyToClipboard
});
</script>

<style scoped>
.gfy-topics-generator {
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

.gfy-textarea {
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

.gfy-textarea:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  box-shadow: 0 0 0 3px var(--gfy-primary-light);
}

.gfy-textarea::placeholder {
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
  margin-bottom: 1rem;
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
  gap: 0.5rem;
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

/* TOPICS GRID */
.gfy-topics-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.5rem;
}

.gfy-topic-card {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
  padding: 1rem;
  background: var(--gfy-white);
  border: 2px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
}

.gfy-topic-card:hover {
  border-color: var(--gfy-primary-color);
  box-shadow: 0 2px 8px rgba(37, 99, 235, 0.1);
}

.gfy-topic-card--selected {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-topic-card__number {
  flex-shrink: 0;
  width: 28px;
  height: 28px;
  background: var(--gfy-bg-color);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.85rem;
  font-weight: 600;
  color: var(--gfy-text-secondary);
}

.gfy-topic-card--selected .gfy-topic-card__number {
  background: var(--gfy-primary-color);
  color: var(--gfy-white);
}

.gfy-topic-card__content {
  flex: 1;
  min-width: 0;
}

.gfy-topic-card__category {
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

.gfy-topic-card__title {
  font-size: 0.9rem;
  line-height: 1.4;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-topic-card__checkbox {
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

.gfy-topic-card--selected .gfy-topic-card__checkbox {
  background: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
  color: var(--gfy-white);
}

/* BUTTONS */
.gfy-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  padding: 0.6rem 1rem;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: inherit;
  border-radius: var(--gfy-radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  border: none;
}

.gfy-btn--outline {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  color: var(--gfy-text-secondary);
}

.gfy-btn--outline:hover {
  border-color: var(--gfy-primary-color);
  color: var(--gfy-primary-color);
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
  align-items: center;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--gfy-border-color);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .gfy-builder {
    grid-template-columns: 1fr;
  }

  .gfy-topics-grid {
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
