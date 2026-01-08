<template>
  <div class="gfy-app-container topics-generator">
    <!-- PROFILE CONTEXT BANNER -->
    <div class="gfy-profile-banner">
      <div class="gfy-profile-banner__content">
        <div class="gfy-profile-banner__info">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
            <circle cx="12" cy="7" r="4"></circle>
          </svg>
          <span>Working on:</span>
        </div>
        <div class="gfy-profile-banner__selector">
          <ProfileSelector
            v-model="selectedProfileId"
            mode="dropdown"
            label=""
            placeholder="-- Select a Profile to Pre-fill --"
            :show-current-profile="true"
            @select="handleProfileSelect"
          />
        </div>
      </div>
      <div class="gfy-profile-banner__actions">
        <a v-if="selectedProfileId" href="#" class="gfy-profile-banner__link" @click.prevent="viewProfile">
          View Profile &rarr;
        </a>
      </div>
    </div>

    <!-- HERO SECTION -->
    <div class="gfy-tool-hero">
      <h1 class="gfy-hero-title">Topic <span class="gfy-highlight">Generator</span></h1>
      <p class="gfy-hero-subtitle">Generate podcast-ready interview topics based on your unique expertise.</p>

      <!-- CONFIGURATION PANEL -->
      <div class="gfy-tool-context">
        <div class="gfy-tool-context__header">
          <h3 class="gfy-tool-context__heading">Configuration</h3>
          <p class="gfy-tool-context__description">Define your expertise and hook below to generate tailored results.</p>
        </div>

        <div class="gfy-tool-context__form">
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

        <!-- Generate Button -->
        <div class="gfy-tool-context__actions">
          <button
            class="gfy-btn-generate"
            :class="{ 'is-loading': isGenerating }"
            :disabled="!canGenerate || isGenerating"
            @click="handleGenerate"
          >
            <svg v-if="!isGenerating" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"></path>
            </svg>
            <span v-else class="gfy-btn-spinner"></span>
            {{ isGenerating ? 'Generating...' : 'Generate Topics' }}
          </button>
        </div>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="gfy-error">
        <p>{{ error }}</p>
        <button type="button" class="gfy-btn gfy-btn-secondary" @click="handleGenerate">
          Try Again
        </button>
      </div>
    </div>

    <!-- RESULTS SECTION -->
    <div v-if="hasTopics" class="gfy-results-section is-visible">
      <div class="gfy-results-header">
        <h2 class="gfy-results-title">Generated Topics</h2>
        <button class="gfy-action-btn" title="Copy All" @click="handleCopy">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
            <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
          </svg>
        </button>
      </div>

      <div class="gfy-topics-grid">
        <div
          v-for="(topic, index) in topics"
          :key="index"
          class="gfy-topic-card"
          :class="{ 'is-selected': selectedTopics.has(index) }"
          @click="toggleTopicSelect(index)"
        >
          <div class="gfy-topic-card__content">
            <p class="gfy-topic-card__text">{{ getTopicTitle(topic) }}</p>
          </div>
          <div class="gfy-topic-card__actions">
            <button class="gfy-action-btn" title="Copy" @click.stop="copyTopic(index)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            </button>
            <button class="gfy-action-btn" title="Save" @click.stop="saveTopic(index)">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <line x1="12" y1="5" x2="12" y2="19"></line>
                <line x1="5" y1="12" x2="19" y2="12"></line>
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Save to Profile Section -->
      <div class="gfy-save-section">
        <button
          class="gfy-btn gfy-btn-primary"
          :disabled="!canSaveToProfile || isSaving"
          @click="handleSaveToProfile"
        >
          <span v-if="isSaving" class="gfy-btn-spinner"></span>
          <svg v-else width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
            <polyline points="17 21 17 13 7 13 7 21"/>
            <polyline points="7 3 7 8 15 8"/>
          </svg>
          {{ isSaving ? 'Saving...' : 'Save Selected to Profile' }}
        </button>
        <span v-if="!selectedProfileId" class="gfy-save-hint">
          Select a profile above to enable saving
        </span>
        <span v-if="saveSuccess" class="gfy-save-success">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          Saved successfully!
        </span>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted } from 'vue';
import { useAITopics } from '../../src/composables/useAITopics';
import { useProfileContext } from '../../src/composables/useProfileContext';
import ProfileSelector from '../../src/vue/components/shared/ProfileSelector.vue';

const emit = defineEmits(['generated', 'saved']);

// Use composables
const {
  isGenerating,
  error,
  topics,
  hasTopics,
  generate,
  copyToClipboard
} = useAITopics();

const {
  profileId: contextProfileId,
  isSaving,
  saveToProfile
} = useProfileContext();

// Local state
const expertise = ref('');
const selectedProfileId = ref(null);
const saveSuccess = ref(false);
const selectedTopics = ref(new Set());

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
 * Can save to profile check
 */
const canSaveToProfile = computed(() => {
  return selectedProfileId.value && hasTopics.value && !isSaving.value && selectedTopics.value.size > 0;
});

/**
 * Can generate check
 */
const canGenerate = computed(() => {
  return (expertise.value && expertise.value.trim().length > 0) ||
         (hookWho.value && hookWhat.value);
});

/**
 * Toggle topic selection
 */
const toggleTopicSelect = (index) => {
  if (selectedTopics.value.has(index)) {
    selectedTopics.value.delete(index);
  } else {
    if (selectedTopics.value.size < 5) {
      selectedTopics.value.add(index);
    }
  }
};

/**
 * Get topic title
 */
const getTopicTitle = (topic) => {
  if (!topic) return '';
  if (typeof topic === 'string') return topic;
  return topic.title || topic.text || '';
};

/**
 * Copy single topic to clipboard
 */
const copyTopic = async (index) => {
  const topic = topics.value[index];
  const text = getTopicTitle(topic);
  try {
    await navigator.clipboard.writeText(text);
  } catch (err) {
    console.error('[TopicsGenerator] Failed to copy topic:', err);
  }
};

/**
 * Save single topic (add to selection)
 */
const saveTopic = (index) => {
  if (!selectedTopics.value.has(index) && selectedTopics.value.size < 5) {
    selectedTopics.value.add(index);
  }
};

/**
 * View profile link handler
 */
const viewProfile = () => {
  if (selectedProfileId.value) {
    window.location.href = `/profile/${selectedProfileId.value}`;
  }
};

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  selectedTopics.value = new Set();

  try {
    const contextText = expertise.value || generatedHookSummary.value;

    await generate({
      expertise: contextText,
      authorityHook: generatedHookSummary.value,
      count: 10
    });

    emit('generated', { topics: topics.value });
  } catch (err) {
    console.error('[TopicsGenerator] Generation failed:', err);
  }
};

/**
 * Handle copy to clipboard (all topics)
 */
const handleCopy = async () => {
  await copyToClipboard();
};

/**
 * Handle profile selection
 */
const handleProfileSelect = (profileId) => {
  selectedProfileId.value = profileId;
  saveSuccess.value = false;
};

/**
 * Handle save to profile
 */
const handleSaveToProfile = async () => {
  if (!selectedProfileId.value || !hasTopics.value) return;

  saveSuccess.value = false;

  try {
    const selectedTopicsList = Array.from(selectedTopics.value)
      .sort((a, b) => a - b)
      .map(index => topics.value[index]);

    const topicsResult = await saveToProfile('topics', selectedTopicsList, {
      profileId: selectedProfileId.value
    });

    // Save authority hook if we have data
    if (generatedHookSummary.value) {
      await saveToProfile('authority_hook', {
        who: hookWho.value,
        what: hookWhat.value,
        when: hookWhen.value,
        how: hookHow.value,
        summary: generatedHookSummary.value
      }, {
        profileId: selectedProfileId.value
      });
    }

    if (topicsResult.success) {
      saveSuccess.value = true;
      setTimeout(() => { saveSuccess.value = false; }, 3000);
      emit('saved', { profileId: selectedProfileId.value, topics: selectedTopicsList });
    }
  } catch (err) {
    console.error('[TopicsGenerator] Failed to save to profile:', err);
  }
};

/**
 * On mount
 */
onMounted(() => {
  if (contextProfileId.value) {
    selectedProfileId.value = contextProfileId.value;
  }
});
</script>

<style scoped>
/* ============================================
   GFY DESIGN SYSTEM V5
   ============================================ */

.gfy-app-container {
  --gfy-primary-color: #2563eb;
  --gfy-primary-light: #eff6ff;
  --gfy-primary-dark: #1d4ed8;
  --gfy-text-primary: #0f172a;
  --gfy-text-secondary: #64748b;
  --gfy-text-muted: #94a3b8;
  --gfy-bg-color: #f8fafc;
  --gfy-white: #ffffff;
  --gfy-border-color: #e2e8f0;
  --gfy-success-color: #22c55e;
  --gfy-warning-color: #f59e0b;
  --gfy-radius-md: 6px;
  --gfy-radius-lg: 12px;
  --gfy-radius-xl: 16px;
  --gfy-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --gfy-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03);

  font-family: 'Inter', -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
  background-color: var(--gfy-bg-color);
  color: var(--gfy-text-primary);
  width: 100%;
  max-width: 1000px;
  margin: 0 auto;
  padding: 2rem 1rem;
}

/* PROFILE BANNER */
.gfy-profile-banner {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  padding: 0.75rem 1rem;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: var(--gfy-shadow-sm);
  flex-wrap: wrap;
  gap: 1rem;
}

.gfy-profile-banner__content {
  display: flex;
  align-items: center;
  gap: 1rem;
  flex-grow: 1;
}

.gfy-profile-banner__info {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  color: var(--gfy-text-secondary);
  font-weight: 500;
  font-size: 0.9rem;
  white-space: nowrap;
}

.gfy-profile-banner__selector {
  flex-grow: 1;
  max-width: 300px;
}

.gfy-profile-banner__selector :deep(select),
.gfy-profile-banner__selector :deep(.profile-selector__select) {
  width: 100%;
  padding: 0.4rem;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-size: 0.9rem;
  color: var(--gfy-text-primary);
}

.gfy-profile-banner__link {
  color: var(--gfy-primary-color);
  text-decoration: none;
  font-size: 0.9rem;
  font-weight: 500;
}

.gfy-profile-banner__link:hover {
  text-decoration: underline;
}

/* HERO SECTION */
.gfy-tool-hero {
  background: var(--gfy-white);
  border-radius: var(--gfy-radius-xl);
  border: 1px solid var(--gfy-border-color);
  padding: 3rem 1.5rem;
  text-align: center;
  margin-bottom: 2rem;
}

.gfy-hero-title {
  font-size: 2.5rem;
  font-weight: 800;
  letter-spacing: -0.03em;
  margin: 0 0 0.5rem 0;
  color: var(--gfy-text-primary);
}

.gfy-highlight {
  color: var(--gfy-primary-color);
}

.gfy-hero-subtitle {
  font-size: 1.1rem;
  color: var(--gfy-text-secondary);
  margin: 0 0 2.5rem 0;
  max-width: 600px;
  margin-left: auto;
  margin-right: auto;
}

/* CONFIGURATION PANEL */
.gfy-tool-context {
  background: var(--gfy-bg-color);
  border-radius: var(--gfy-radius-lg);
  border: 1px solid var(--gfy-border-color);
  text-align: left;
  margin-top: 2rem;
  max-width: 800px;
  margin-left: auto;
  margin-right: auto;
  overflow: hidden;
}

.gfy-tool-context__header {
  padding: 1.5rem;
  border-bottom: 1px solid var(--gfy-border-color);
  background: var(--gfy-white);
}

.gfy-tool-context__heading {
  font-size: 1.25rem;
  font-weight: 700;
  margin: 0;
  color: var(--gfy-text-primary);
}

.gfy-tool-context__description {
  font-size: 0.95rem;
  color: var(--gfy-text-secondary);
  margin: 0.5rem 0 0 0;
}

.gfy-tool-context__form {
  padding: 1.5rem;
}

/* INPUT STYLES */
.gfy-input-group {
  margin-bottom: 2rem;
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
  padding: 0.6rem;
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-md);
  font-size: 0.9rem;
  background: var(--gfy-bg-color);
  box-sizing: border-box;
  font-family: inherit;
}

.gfy-builder__input:focus {
  outline: none;
  border-color: var(--gfy-primary-color);
  background: var(--gfy-white);
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

/* ACTIONS */
.gfy-tool-context__actions {
  background: var(--gfy-white);
  padding: 1.5rem;
  text-align: center;
  border-top: 1px solid var(--gfy-border-color);
}

.gfy-btn-generate {
  background: var(--gfy-primary-color);
  color: white;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: 700;
  border-radius: var(--gfy-radius-md);
  cursor: pointer;
  transition: all 0.2s;
  box-shadow: var(--gfy-shadow-md);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  font-family: inherit;
}

.gfy-btn-generate:hover:not(:disabled) {
  background: var(--gfy-primary-dark);
  transform: translateY(-2px);
}

.gfy-btn-generate:disabled {
  opacity: 0.5;
  cursor: not-allowed;
  transform: none;
}

.gfy-btn-spinner {
  width: 20px;
  height: 20px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: gfy-spin 0.75s linear infinite;
}

@keyframes gfy-spin {
  to { transform: rotate(360deg); }
}

/* ERROR */
.gfy-error {
  margin-top: 20px;
  padding: 20px;
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--gfy-radius-md);
  text-align: center;
}

.gfy-error p {
  color: #991b1b;
  margin: 0 0 12px 0;
}

/* RESULTS SECTION */
.gfy-results-section {
  margin-top: 3rem;
  opacity: 0;
  transform: translateY(20px);
  transition: all 0.5s ease-out;
  display: none;
}

.gfy-results-section.is-visible {
  display: block;
  opacity: 1;
  transform: translateY(0);
}

.gfy-results-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 2rem;
  border-bottom: 1px solid var(--gfy-border-color);
  padding-bottom: 1rem;
}

.gfy-results-title {
  font-size: 1.5rem;
  font-weight: 700;
  margin: 0;
  color: var(--gfy-text-primary);
}

/* TOPICS GRID */
.gfy-topics-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
  gap: 1.5rem;
}

/* TOPIC CARD */
.gfy-topic-card {
  background: var(--gfy-white);
  border: 1px solid var(--gfy-border-color);
  border-radius: var(--gfy-radius-lg);
  padding: 1.5rem;
  cursor: pointer;
  transition: all 0.2s ease;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  min-height: 140px;
}

.gfy-topic-card:hover {
  transform: translateY(-4px);
  box-shadow: var(--gfy-shadow-md);
  border-color: #cbd5e1;
}

.gfy-topic-card.is-selected {
  border-color: var(--gfy-primary-color);
  background: var(--gfy-primary-light);
}

.gfy-topic-card__text {
  font-size: 1.1rem;
  font-weight: 600;
  line-height: 1.4;
  color: var(--gfy-text-primary);
  margin: 0;
}

.gfy-topic-card__actions {
  margin-top: 1rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  opacity: 0;
  transform: translateY(5px);
  transition: all 0.2s ease;
}

.gfy-topic-card:hover .gfy-topic-card__actions {
  opacity: 1;
  transform: translateY(0);
}

/* ACTION BUTTON */
.gfy-action-btn {
  background: var(--gfy-bg-color);
  border: 1px solid var(--gfy-border-color);
  border-radius: 6px;
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--gfy-text-secondary);
  cursor: pointer;
  transition: all 0.2s ease;
}

.gfy-action-btn:hover {
  background: var(--gfy-white);
  color: var(--gfy-primary-color);
  border-color: var(--gfy-primary-color);
}

/* SAVE SECTION */
.gfy-save-section {
  margin-top: 2rem;
  padding-top: 2rem;
  border-top: 1px solid var(--gfy-border-color);
  display: flex;
  align-items: center;
  gap: 12px;
  flex-wrap: wrap;
}

/* BUTTONS */
.gfy-btn {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 14px;
  font-weight: 600;
  border: none;
  border-radius: var(--gfy-radius-md);
  cursor: pointer;
  transition: all 0.15s ease;
  font-family: inherit;
}

.gfy-btn-primary {
  color: white;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
}

.gfy-btn-primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  transform: translateY(-1px);
}

.gfy-btn-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.gfy-btn-secondary {
  background: var(--gfy-bg-color);
  color: var(--gfy-text-primary);
  border: 1px solid var(--gfy-border-color);
}

.gfy-btn-secondary:hover {
  background: var(--gfy-white);
}

.gfy-save-hint {
  font-size: 13px;
  color: var(--gfy-text-secondary);
  font-style: italic;
}

.gfy-save-success {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--gfy-success-color);
}

/* RESPONSIVE */
@media (max-width: 768px) {
  .gfy-builder {
    grid-template-columns: 1fr;
  }

  .gfy-profile-banner {
    flex-direction: column;
    align-items: flex-start;
  }

  .gfy-profile-banner__content {
    flex-direction: column;
    align-items: flex-start;
    width: 100%;
  }

  .gfy-profile-banner__selector {
    max-width: 100%;
    width: 100%;
  }

  .gfy-topics-grid {
    grid-template-columns: 1fr;
  }

  .gfy-topic-card__actions {
    opacity: 1;
    transform: translateY(0);
  }

  .gfy-hero-title {
    font-size: 2rem;
  }
}
</style>
