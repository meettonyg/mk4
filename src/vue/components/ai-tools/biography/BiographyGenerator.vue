<template>
  <div class="bio-generator">
    <!-- Intro Text -->
    <p class="bio-generator__intro">
      Generate professional biographies in three different lengths (short, medium, and long)
      based on your authority hook, impact intro, and professional details. Each biography
      will be tailored to showcase your expertise and connect with your target audience.
    </p>

    <!-- Authority Hook Section -->
    <section class="bio-generator__section bio-generator__section--collapsible">
      <div class="bio-generator__section-header" @click="toggleAuthorityHook">
        <div class="bio-generator__section-icon">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
        </div>
        <div class="bio-generator__section-title-group">
          <h3 class="bio-generator__section-title">Your Authority Hook</h3>
          <span class="bio-generator__badge">AI GENERATED</span>
        </div>
        <button
          type="button"
          class="bio-generator__toggle-btn"
          :aria-expanded="authorityHookExpanded"
        >
          <svg
            class="bio-generator__toggle-icon"
            :class="{ 'bio-generator__toggle-icon--rotated': authorityHookExpanded }"
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>

      <!-- Authority Hook Preview -->
      <div class="bio-generator__preview" v-if="authorityHookSummary && !authorityHookExpanded">
        <p>{{ authorityHookSummary }}</p>
      </div>
      <div class="bio-generator__preview bio-generator__preview--empty" v-else-if="!authorityHookExpanded">
        <p>Click to expand and build your authority hook...</p>
      </div>

      <!-- Authority Hook Builder (Expanded) -->
      <div class="bio-generator__builder" v-show="authorityHookExpanded">
        <AuthorityHookBuilder
          mode="standalone"
          @change="handleAuthorityHookChange"
          @generated="handleAuthorityHookGenerated"
        />
      </div>
    </section>

    <!-- Impact Intro Section -->
    <section class="bio-generator__section bio-generator__section--collapsible">
      <div class="bio-generator__section-header" @click="toggleImpactIntro">
        <div class="bio-generator__section-icon bio-generator__section-icon--impact">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="10"></circle>
            <circle cx="12" cy="12" r="6"></circle>
            <circle cx="12" cy="12" r="2"></circle>
          </svg>
        </div>
        <div class="bio-generator__section-title-group">
          <h3 class="bio-generator__section-title">Your Impact Intro</h3>
          <span class="bio-generator__badge bio-generator__badge--secondary">CREDENTIALS & MISSION</span>
        </div>
        <button
          type="button"
          class="bio-generator__toggle-btn"
          :aria-expanded="impactIntroExpanded"
        >
          <svg
            class="bio-generator__toggle-icon"
            :class="{ 'bio-generator__toggle-icon--rotated': impactIntroExpanded }"
            width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
          >
            <polyline points="6 9 12 15 18 9"></polyline>
          </svg>
        </button>
      </div>

      <!-- Impact Intro Preview -->
      <div class="bio-generator__preview" v-if="impactIntroSummary && !impactIntroExpanded">
        <p>{{ impactIntroSummary }}</p>
      </div>
      <div class="bio-generator__preview bio-generator__preview--empty" v-else-if="!impactIntroExpanded">
        <p>Click to expand and add your credentials...</p>
      </div>

      <!-- Impact Intro Builder (Expanded) -->
      <div class="bio-generator__builder" v-show="impactIntroExpanded">
        <ImpactIntroBuilder
          mode="standalone"
          @change="handleImpactIntroChange"
        />
      </div>
    </section>

    <!-- Basic Information Section -->
    <section class="bio-generator__section">
      <h3 class="bio-generator__section-heading">Basic Information</h3>
      <p class="bio-generator__section-description">
        Provide your basic professional information to personalize your biography.
      </p>

      <div class="bio-generator__field">
        <label for="bio-name" class="bio-generator__label">Full Name</label>
        <input
          id="bio-name"
          v-model="formData.name"
          type="text"
          class="bio-generator__input"
          placeholder="Enter your full name"
        />
      </div>

      <div class="bio-generator__field">
        <label for="bio-title" class="bio-generator__label">Professional Title</label>
        <input
          id="bio-title"
          v-model="formData.title"
          type="text"
          class="bio-generator__input"
          placeholder="e.g., CEO, Marketing Consultant, Business Coach"
        />
      </div>

      <div class="bio-generator__field">
        <label for="bio-organization" class="bio-generator__label">Organization/Company (Optional)</label>
        <input
          id="bio-organization"
          v-model="formData.organization"
          type="text"
          class="bio-generator__input"
          placeholder="Your company or organization name"
        />
      </div>
    </section>

    <!-- Biography Settings Section -->
    <section class="bio-generator__section">
      <h3 class="bio-generator__section-heading">Biography Settings</h3>
      <p class="bio-generator__section-description">
        Customize how your biography will be written and presented.
      </p>

      <div class="bio-generator__settings-grid">
        <div class="bio-generator__field">
          <label for="bio-tone" class="bio-generator__label">Tone</label>
          <select id="bio-tone" v-model="formData.tone" class="bio-generator__select">
            <option value="professional">Professional</option>
            <option value="conversational">Conversational</option>
            <option value="authoritative">Authoritative</option>
            <option value="friendly">Friendly</option>
            <option value="inspirational">Inspirational</option>
          </select>
        </div>

        <div class="bio-generator__field">
          <label for="bio-pov" class="bio-generator__label">Point of View</label>
          <select id="bio-pov" v-model="formData.pov" class="bio-generator__select">
            <option value="third">Third Person (He/She/They)</option>
            <option value="first">First Person (I/My)</option>
          </select>
        </div>
      </div>
    </section>

    <!-- Additional Content Section -->
    <section class="bio-generator__section">
      <h3 class="bio-generator__section-heading">Additional Content</h3>
      <p class="bio-generator__section-description">
        Include existing content or additional details to enhance your biography.
      </p>

      <div class="bio-generator__field">
        <label for="bio-existing" class="bio-generator__label">Existing Biography (Optional)</label>
        <textarea
          id="bio-existing"
          v-model="formData.existingBio"
          class="bio-generator__textarea"
          rows="4"
          placeholder="Paste your current biography here to improve it, or leave blank to create a new one"
        ></textarea>
      </div>

      <div class="bio-generator__field">
        <label for="bio-notes" class="bio-generator__label">Additional Notes (Optional)</label>
        <textarea
          id="bio-notes"
          v-model="formData.notes"
          class="bio-generator__textarea"
          rows="3"
          placeholder="Any specific achievements, awards, or details you want included"
        ></textarea>
      </div>
    </section>

    <!-- Generation Controls -->
    <section class="bio-generator__section bio-generator__section--actions">
      <div class="bio-generator__actions">
        <button
          type="button"
          class="bio-generator__btn bio-generator__btn--secondary"
          @click="handlePreview"
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 4.5C7 4.5 2.73 7.61 1 12c1.73 4.39 6 7.5 11 7.5s9.27-3.11 11-7.5c-1.73-4.39-6-7.5-11-7.5zM12 17c-2.76 0-5-2.24-5-5s2.24-5 5-5 5 2.24 5 5-2.24 5-5 5zm0-8c-1.66 0-3 1.34-3 3s1.34 3 3 3 3-1.34 3-3-1.34-3-3-3z"/>
          </svg>
          Preview Information
        </button>
        <button
          type="button"
          class="bio-generator__btn bio-generator__btn--primary"
          :disabled="!canGenerate || isGenerating"
          @click="handleGenerate"
        >
          <svg v-if="!isGenerating" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          <span v-if="isGenerating" class="bio-generator__spinner"></span>
          {{ isGenerating ? 'Generating...' : 'Generate Biography with AI' }}
        </button>
      </div>
    </section>

    <!-- Error Message -->
    <div v-if="error" class="bio-generator__error">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <circle cx="12" cy="12" r="10"></circle>
        <line x1="12" y1="8" x2="12" y2="12"></line>
        <line x1="12" y1="16" x2="12.01" y2="16"></line>
      </svg>
      <p>{{ error }}</p>
      <button type="button" class="bio-generator__error-retry" @click="handleGenerate">
        Try Again
      </button>
    </div>

    <!-- Results Section -->
    <section v-if="hasResults" class="bio-generator__results">
      <div class="bio-generator__results-header">
        <h3>Your Generated Biographies</h3>
        <p>Three versions optimized for different use cases</p>
      </div>

      <!-- Length Tabs -->
      <div class="bio-generator__tabs">
        <button
          v-for="tab in lengthTabs"
          :key="tab.value"
          type="button"
          class="bio-generator__tab"
          :class="{ 'bio-generator__tab--active': selectedLength === tab.value }"
          @click="selectedLength = tab.value"
        >
          {{ tab.label }}
          <span class="bio-generator__tab-indicator">{{ tab.wordCount }}</span>
        </button>
      </div>

      <!-- Result Content -->
      <div class="bio-generator__result">
        <div class="bio-generator__result-header">
          <h4 class="bio-generator__result-title">{{ currentResult.title }}</h4>
          <span class="bio-generator__result-badge">{{ currentResult.useCase }}</span>
        </div>

        <!-- Stats -->
        <div class="bio-generator__stats">
          <div class="bio-generator__stat">
            <span class="bio-generator__stat-label">Words:</span>
            <span class="bio-generator__stat-value">{{ currentResult.wordCount }}</span>
          </div>
          <div class="bio-generator__stat">
            <span class="bio-generator__stat-label">Characters:</span>
            <span class="bio-generator__stat-value">{{ currentResult.charCount }}</span>
          </div>
          <div class="bio-generator__stat">
            <span class="bio-generator__stat-label">Reading time:</span>
            <span class="bio-generator__stat-value">{{ currentResult.readingTime }}</span>
          </div>
        </div>

        <!-- Biography Text -->
        <div class="bio-generator__result-content">
          {{ currentResult.text }}
        </div>

        <!-- Result Actions -->
        <div class="bio-generator__result-actions">
          <button type="button" class="bio-generator__action-btn" @click="handleEdit">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34c-.39-.39-1.02-.39-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/>
            </svg>
            Edit
          </button>
          <button type="button" class="bio-generator__action-btn" @click="handleCopy">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
              <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
            </svg>
            {{ copyButtonText }}
          </button>
          <button type="button" class="bio-generator__action-btn" @click="handlePrint">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19 8H5c-1.66 0-3 1.34-3 3v6h4v4h12v-4h4v-6c0-1.66-1.34-3-3-3zm-3 11H8v-5h8v5zm3-7c-.55 0-1-.45-1-1s.45-1 1-1 1 .45 1 1-.45 1-1 1zm-1-9H6v4h12V3z"/>
            </svg>
            Print
          </button>
        </div>
      </div>

      <!-- Global Actions -->
      <div class="bio-generator__global-actions">
        <button type="button" class="bio-generator__btn bio-generator__btn--secondary" @click="handleRegenerate">
          Regenerate All
        </button>
        <button type="button" class="bio-generator__btn bio-generator__btn--primary" @click="handleSaveAll">
          Save All Biographies
        </button>
      </div>
    </section>

    <!-- Copy Success Toast -->
    <div class="bio-generator__toast" :class="{ 'bio-generator__toast--visible': showCopyToast }">
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
        <polyline points="20 6 9 17 4 12"></polyline>
      </svg>
      Copied to clipboard!
    </div>
  </div>
</template>

<script setup>
import { ref, reactive, computed, onMounted } from 'vue';
import { useAIBiography } from '../../../../composables/useAIBiography';
import { useAuthorityHook } from '../../../../composables/useAuthorityHook';
import { useImpactIntro } from '../../../../composables/useImpactIntro';
import AuthorityHookBuilder from '../../ai/AuthorityHookBuilder.vue';
import ImpactIntroBuilder from '../../ai/ImpactIntroBuilder.vue';

const emit = defineEmits(['generated', 'saved']);

// Composables
const {
  isGenerating,
  error,
  biographies,
  shortBio,
  mediumBio,
  longBio,
  hasContent,
  generate,
  generateAll,
  copyToClipboard,
  tone,
  length,
  pov
} = useAIBiography();

const { authorityHookSummary, syncFromStore: syncAuthorityHook } = useAuthorityHook();
const { impactSummary: impactIntroSummary, syncFromStore: syncImpactIntro } = useImpactIntro();

// Local state
const authorityHookExpanded = ref(false);
const impactIntroExpanded = ref(false);
const selectedLength = ref('medium');
const showCopyToast = ref(false);
const copyButtonText = ref('Copy');

// Form data
const formData = reactive({
  name: '',
  title: '',
  organization: '',
  tone: 'professional',
  pov: 'third',
  existingBio: '',
  notes: ''
});

// Computed
const canGenerate = computed(() => {
  return formData.name.trim() && (authorityHookSummary.value || formData.existingBio.trim());
});

const hasResults = computed(() => {
  return hasContent.value && (shortBio.value || mediumBio.value || longBio.value);
});

const lengthTabs = computed(() => [
  { value: 'short', label: 'Short', wordCount: '(50-75 words)' },
  { value: 'medium', label: 'Medium', wordCount: '(100-150 words)' },
  { value: 'long', label: 'Long', wordCount: '(200-300 words)' }
]);

const currentResult = computed(() => {
  const bioText = {
    short: shortBio.value,
    medium: mediumBio.value,
    long: longBio.value
  }[selectedLength.value] || '';

  const wordCount = bioText ? bioText.split(/\s+/).length : 0;
  const charCount = bioText ? bioText.length : 0;
  const readingTime = Math.ceil(wordCount / 200) + 'm ' + Math.ceil((wordCount % 200) / 3.33) + 's';

  const titles = {
    short: 'Short Biography',
    medium: 'Medium Biography',
    long: 'Long Biography'
  };

  const useCases = {
    short: 'Social Media & Brief Intros',
    medium: 'Websites & Speaker Intros',
    long: 'Detailed Marketing Materials'
  };

  return {
    text: bioText,
    title: titles[selectedLength.value],
    useCase: useCases[selectedLength.value],
    wordCount,
    charCount,
    readingTime
  };
});

// Methods
const toggleAuthorityHook = () => {
  authorityHookExpanded.value = !authorityHookExpanded.value;
  if (authorityHookExpanded.value) {
    impactIntroExpanded.value = false;
  }
};

const toggleImpactIntro = () => {
  impactIntroExpanded.value = !impactIntroExpanded.value;
  if (impactIntroExpanded.value) {
    authorityHookExpanded.value = false;
  }
};

const handleAuthorityHookChange = (data) => {
  // Authority hook updated
  console.log('[BiographyGenerator] Authority hook changed:', data);
};

const handleAuthorityHookGenerated = (data) => {
  console.log('[BiographyGenerator] Authority hook generated:', data);
};

const handleImpactIntroChange = (data) => {
  console.log('[BiographyGenerator] Impact intro changed:', data);
};

const handlePreview = () => {
  console.log('[BiographyGenerator] Preview data:', {
    formData,
    authorityHook: authorityHookSummary.value,
    impactIntro: impactIntroSummary.value
  });
  // TODO: Show preview modal
};

const handleGenerate = async () => {
  try {
    // Sync settings
    tone.value = formData.tone;
    pov.value = formData.pov;

    await generateAll({
      name: formData.name,
      title: formData.title,
      organization: formData.organization,
      authorityHook: authorityHookSummary.value,
      impactIntro: impactIntroSummary.value,
      existingBio: formData.existingBio,
      notes: formData.notes,
      tone: formData.tone,
      pov: formData.pov
    });

    emit('generated', {
      short: shortBio.value,
      medium: mediumBio.value,
      long: longBio.value
    });
  } catch (err) {
    console.error('[BiographyGenerator] Generation failed:', err);
  }
};

const handleCopy = async () => {
  try {
    await navigator.clipboard.writeText(currentResult.value.text);
    copyButtonText.value = 'Copied!';
    showCopyToast.value = true;

    setTimeout(() => {
      copyButtonText.value = 'Copy';
      showCopyToast.value = false;
    }, 2000);
  } catch (err) {
    console.error('[BiographyGenerator] Copy failed:', err);
  }
};

const handleEdit = () => {
  // TODO: Enable inline editing
  console.log('[BiographyGenerator] Edit biography');
};

const handlePrint = () => {
  window.print();
};

const handleRegenerate = () => {
  handleGenerate();
};

const handleSaveAll = () => {
  emit('saved', {
    short: shortBio.value,
    medium: mediumBio.value,
    long: longBio.value
  });
  // TODO: Save to WordPress
};

// Lifecycle
onMounted(() => {
  syncAuthorityHook();
  syncImpactIntro();
});
</script>

<style scoped>
/* ========================================
   BIOGRAPHY GENERATOR - Tool Panel
   ======================================== */

.bio-generator {
  --bg-primary: #6366f1;
  --bg-primary-hover: #4f46e5;
  --bg-text: #1e293b;
  --bg-text-secondary: #64748b;
  --bg-border: #e2e8f0;
  --bg-bg-secondary: #f8fafc;
  --bg-radius: 8px;
}

/* Intro */
.bio-generator__intro {
  margin: 0 0 24px 0;
  font-size: 15px;
  color: var(--bg-text-secondary);
  line-height: 1.6;
}

/* Sections */
.bio-generator__section {
  margin-bottom: 24px;
  padding-bottom: 24px;
  border-bottom: 1px solid var(--bg-border);
}

.bio-generator__section:last-child {
  border-bottom: none;
  margin-bottom: 0;
  padding-bottom: 0;
}

.bio-generator__section--actions {
  border-bottom: none;
}

/* Collapsible Section Header */
.bio-generator__section-header {
  display: flex;
  align-items: center;
  gap: 12px;
  cursor: pointer;
  padding: 12px;
  margin: -12px;
  margin-bottom: 12px;
  border-radius: var(--bg-radius);
  transition: background-color 0.15s ease;
}

.bio-generator__section-header:hover {
  background-color: var(--bg-bg-secondary);
}

.bio-generator__section-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 8px;
  color: var(--bg-primary);
}

.bio-generator__section-icon--impact {
  background: rgba(16, 185, 129, 0.1);
  color: #10b981;
}

.bio-generator__section-title-group {
  flex: 1;
  display: flex;
  align-items: center;
  gap: 10px;
}

.bio-generator__section-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--bg-text);
}

.bio-generator__badge {
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: var(--bg-primary);
  background: rgba(99, 102, 241, 0.1);
  border-radius: 4px;
}

.bio-generator__badge--secondary {
  color: #10b981;
  background: rgba(16, 185, 129, 0.1);
}

.bio-generator__toggle-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  padding: 0;
  background: transparent;
  border: none;
  border-radius: 6px;
  color: var(--bg-text-secondary);
  cursor: pointer;
  transition: all 0.15s ease;
}

.bio-generator__toggle-btn:hover {
  background: var(--bg-bg-secondary);
  color: var(--bg-text);
}

.bio-generator__toggle-icon {
  transition: transform 0.2s ease;
}

.bio-generator__toggle-icon--rotated {
  transform: rotate(180deg);
}

/* Preview */
.bio-generator__preview {
  padding: 12px 16px;
  background: var(--bg-bg-secondary);
  border: 1px solid var(--bg-border);
  border-radius: var(--bg-radius);
  margin-bottom: 0;
}

.bio-generator__preview p {
  margin: 0;
  font-size: 14px;
  color: var(--bg-text);
  line-height: 1.6;
}

.bio-generator__preview--empty p {
  color: var(--bg-text-secondary);
  font-style: italic;
}

/* Builder */
.bio-generator__builder {
  margin-top: 16px;
  padding: 16px;
  background: var(--bg-bg-secondary);
  border: 1px solid var(--bg-border);
  border-radius: var(--bg-radius);
}

/* Section Headings */
.bio-generator__section-heading {
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
  color: var(--bg-text);
}

.bio-generator__section-description {
  margin: 0 0 16px 0;
  font-size: 14px;
  color: var(--bg-text-secondary);
}

/* Form Fields */
.bio-generator__field {
  margin-bottom: 16px;
}

.bio-generator__field:last-child {
  margin-bottom: 0;
}

.bio-generator__label {
  display: block;
  margin-bottom: 6px;
  font-size: 14px;
  font-weight: 500;
  color: var(--bg-text);
}

.bio-generator__input,
.bio-generator__select,
.bio-generator__textarea {
  width: 100%;
  padding: 10px 14px;
  font-size: 15px;
  font-family: inherit;
  color: var(--bg-text);
  background: #ffffff;
  border: 1px solid var(--bg-border);
  border-radius: var(--bg-radius);
  transition: border-color 0.15s ease, box-shadow 0.15s ease;
}

.bio-generator__input:focus,
.bio-generator__select:focus,
.bio-generator__textarea:focus {
  outline: none;
  border-color: var(--bg-primary);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.15);
}

.bio-generator__textarea {
  resize: vertical;
  min-height: 80px;
}

.bio-generator__select {
  appearance: none;
  background-image: url("data:image/svg+xml,%3csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 20 20'%3e%3cpath stroke='%236b7280' stroke-linecap='round' stroke-linejoin='round' stroke-width='1.5' d='M6 8l4 4 4-4'/%3e%3c/svg%3e");
  background-position: right 12px center;
  background-repeat: no-repeat;
  background-size: 16px 16px;
  padding-right: 40px;
}

/* Settings Grid */
.bio-generator__settings-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
}

@media (max-width: 480px) {
  .bio-generator__settings-grid {
    grid-template-columns: 1fr;
  }
}

/* Actions */
.bio-generator__actions {
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
}

.bio-generator__btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 12px 24px;
  font-size: 15px;
  font-weight: 600;
  font-family: inherit;
  border: none;
  border-radius: var(--bg-radius);
  cursor: pointer;
  transition: all 0.15s ease;
}

.bio-generator__btn--primary {
  color: #ffffff;
  background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
  box-shadow: 0 2px 4px rgba(99, 102, 241, 0.3);
}

.bio-generator__btn--primary:hover:not(:disabled) {
  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%);
  box-shadow: 0 4px 8px rgba(99, 102, 241, 0.4);
  transform: translateY(-1px);
}

.bio-generator__btn--primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.bio-generator__btn--secondary {
  color: var(--bg-text-secondary);
  background: #ffffff;
  border: 1px solid var(--bg-border);
}

.bio-generator__btn--secondary:hover {
  background: var(--bg-bg-secondary);
  border-color: #d1d5db;
}

/* Spinner */
.bio-generator__spinner {
  display: inline-block;
  width: 16px;
  height: 16px;
  border: 2px solid currentColor;
  border-right-color: transparent;
  border-radius: 50%;
  animation: spin 0.75s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Error */
.bio-generator__error {
  display: flex;
  align-items: flex-start;
  gap: 12px;
  padding: 16px;
  margin-top: 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--bg-radius);
  color: #991b1b;
}

.bio-generator__error p {
  flex: 1;
  margin: 0;
  font-size: 14px;
}

.bio-generator__error-retry {
  padding: 6px 12px;
  font-size: 13px;
  font-weight: 500;
  color: #991b1b;
  background: #ffffff;
  border: 1px solid #fecaca;
  border-radius: 4px;
  cursor: pointer;
}

/* Results */
.bio-generator__results {
  margin-top: 24px;
  padding-top: 24px;
  border-top: 2px solid var(--bg-primary);
}

.bio-generator__results-header {
  text-align: center;
  margin-bottom: 20px;
}

.bio-generator__results-header h3 {
  margin: 0 0 4px 0;
  font-size: 20px;
  font-weight: 700;
  color: var(--bg-text);
}

.bio-generator__results-header p {
  margin: 0;
  font-size: 14px;
  color: var(--bg-text-secondary);
}

/* Tabs */
.bio-generator__tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
}

.bio-generator__tab {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2px;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 600;
  font-family: inherit;
  color: var(--bg-text-secondary);
  background: var(--bg-bg-secondary);
  border: 1px solid var(--bg-border);
  border-radius: var(--bg-radius);
  cursor: pointer;
  transition: all 0.15s ease;
}

.bio-generator__tab:hover {
  border-color: var(--bg-primary);
}

.bio-generator__tab--active {
  color: var(--bg-primary);
  background: rgba(99, 102, 241, 0.1);
  border-color: var(--bg-primary);
}

.bio-generator__tab-indicator {
  font-size: 11px;
  font-weight: 400;
  opacity: 0.7;
}

/* Result Card */
.bio-generator__result {
  background: #ffffff;
  border: 1px solid var(--bg-border);
  border-radius: var(--bg-radius);
  overflow: hidden;
}

.bio-generator__result-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: var(--bg-bg-secondary);
  border-bottom: 1px solid var(--bg-border);
}

.bio-generator__result-title {
  margin: 0;
  font-size: 15px;
  font-weight: 600;
  color: var(--bg-text);
}

.bio-generator__result-badge {
  padding: 4px 10px;
  font-size: 11px;
  font-weight: 500;
  color: var(--bg-text-secondary);
  background: #ffffff;
  border: 1px solid var(--bg-border);
  border-radius: 20px;
}

/* Stats */
.bio-generator__stats {
  display: flex;
  gap: 24px;
  padding: 12px 16px;
  background: var(--bg-bg-secondary);
  border-bottom: 1px solid var(--bg-border);
}

.bio-generator__stat {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
}

.bio-generator__stat-label {
  color: var(--bg-text-secondary);
}

.bio-generator__stat-value {
  font-weight: 600;
  color: var(--bg-text);
}

/* Result Content */
.bio-generator__result-content {
  padding: 20px;
  font-size: 15px;
  line-height: 1.7;
  color: var(--bg-text);
  white-space: pre-wrap;
}

/* Result Actions */
.bio-generator__result-actions {
  display: flex;
  gap: 8px;
  padding: 12px 16px;
  border-top: 1px solid var(--bg-border);
  background: var(--bg-bg-secondary);
}

.bio-generator__action-btn {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 14px;
  font-size: 13px;
  font-weight: 500;
  font-family: inherit;
  color: var(--bg-text-secondary);
  background: #ffffff;
  border: 1px solid var(--bg-border);
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.15s ease;
}

.bio-generator__action-btn:hover {
  border-color: var(--bg-primary);
  color: var(--bg-primary);
}

/* Global Actions */
.bio-generator__global-actions {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 20px;
}

/* Toast */
.bio-generator__toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%) translateY(100px);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 20px;
  font-size: 14px;
  font-weight: 500;
  color: #ffffff;
  background: #10b981;
  border-radius: 8px;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  opacity: 0;
  transition: all 0.3s ease;
  z-index: 9999;
}

.bio-generator__toast--visible {
  opacity: 1;
  transform: translateX(-50%) translateY(0);
}
</style>
