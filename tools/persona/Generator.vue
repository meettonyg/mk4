<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'default'"
    title="Ideal Client Persona Generator"
    subtitle="Define your ideal client avatar with detailed demographics and psychographics"
    intro-text="Generate a comprehensive ideal client persona based on your services, industry, and current best clients. This AI-powered tool creates detailed demographics, psychographics, pain points, and goals to help you better target and serve your ideal clients."
    generator-type="persona"
    :has-results="hasContent"
    :is-loading="isGenerating"
  >
    <!-- Profile Selector (for logged-in users) -->
    <template #profile-context>
      <ProfileSelector
        @profile-selected="handleProfileSelected"
        @profile-cleared="handleProfileCleared"
      />
    </template>

    <!-- Left Panel: Form -->
    <template #left>
      <!-- Auto-save Indicator -->
      <div v-if="isAutoSaving" class="gfy-auto-save-indicator">
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
          <polyline points="17 21 17 13 7 13 7 21"/>
          <polyline points="7 3 7 8 15 8"/>
        </svg>
        Saving draft...
      </div>

      <!-- Authority Hook Section -->
      <AuthorityHookBuilder
        :model-value="authorityHook"
        @update:model-value="Object.assign(authorityHook, $event)"
        title="Who Do You Help?"
        :placeholders="{
          who: 'e.g., SaaS Founders scaling to $10M ARR',
          what: 'e.g., Increase revenue by 40% in 90 days',
          when: 'e.g., When they\'re stuck at a growth plateau',
          how: 'e.g., My proven Revenue Acceleration System'
        }"
      />

      <!-- Services Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Your Business Information</h3>

        <div class="generator__field">
          <label class="generator__field-label">
            Your Services/Offers *
            <span v-if="isFieldPrefilled('services')" class="gfy-prefilled-badge">from profile</span>
          </label>
          <textarea
            v-model="formData.services"
            class="generator__field-input generator__field-textarea"
            :class="{ 'generator__field-input--prefilled': isFieldPrefilled('services') }"
            placeholder="What do you offer? What problems do you solve?"
            rows="3"
            @input="markFieldEdited('services')"
          ></textarea>
          <p class="generator__field-helper">
            Describe the services or products you provide and the main problems you solve.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">
            Industry/Niche
            <span v-if="isFieldPrefilled('industry')" class="gfy-prefilled-badge">from profile</span>
          </label>
          <input
            v-model="formData.industry"
            type="text"
            class="generator__field-input"
            :class="{ 'generator__field-input--prefilled': isFieldPrefilled('industry') }"
            placeholder="e.g., tech startups, healthcare, coaching"
            @input="markFieldEdited('industry')"
          />
          <p class="generator__field-helper">
            Specify your industry or niche to create a more targeted persona.
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Current Best Clients</label>
          <textarea
            v-model="formData.currentClients"
            class="generator__field-input generator__field-textarea"
            placeholder="Describe your best current clients (optional)"
            rows="2"
          ></textarea>
          <p class="generator__field-helper">
            This helps create a more accurate persona based on real client patterns.
          </p>
        </div>
      </div>

      <!-- Market Context -->
      <div class="generator__section">
        <h3 class="generator__section-title">Market Context</h3>

        <div class="generator__field">
          <label class="generator__field-label">Awareness Level</label>
          <select v-model="awarenessLevel" class="generator__field-input generator__field-select">
            <option v-for="opt in AWARENESS_OPTIONS" :key="opt.value" :value="opt.value">
              {{ opt.label }}
            </option>
          </select>
          <p class="generator__field-helper">
            Where is your ideal client in their buying journey? (Eugene Schwartz's 5 levels)
          </p>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Tone</label>
          <select v-model="formData.tone" class="generator__field-input generator__field-select">
            <option value="professional">Professional</option>
            <option value="conversational">Conversational</option>
            <option value="detailed">Detailed</option>
            <option value="concise">Concise</option>
          </select>
        </div>
      </div>

      <!-- Actions & Restore Link -->
      <div class="gfy-actions-wrapper">
        <!-- Restore Link (subtle text link) -->
        <button
          v-if="showDraftPrompt"
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

        <!-- Main Generate Button -->
        <button
          type="button"
          class="gfy-btn gfy-btn--generate"
          :class="{ 'gfy-btn--loading': isGenerating }"
          :disabled="!canGenerate || isGenerating"
          @click="handleGenerate"
        >
          <svg v-if="!isGenerating" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {{ isGenerating ? 'Building your ideal client profile...' : 'Generate Persona with AI' }}
        </button>
      </div>

      <!-- Error Display -->
      <div v-if="error" class="generator__error">
        <p>{{ error }}</p>
        <button type="button" class="generator__button generator__button--outline" @click="handleGenerate">
          Try Again
        </button>
      </div>
    </template>

    <!-- Right Panel: Guidance -->
    <template #right>
      <GuidancePanel
        title="Creating Your Ideal Client Persona"
        subtitle="Understanding your ideal client persona allows you to create more targeted marketing, better products, and stronger client relationships."
        :formula="personaFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Persona Descriptions:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="persona-results">
        <div class="persona-results__layout">

          <!-- SIDEBAR: Buying Committee -->
          <aside class="persona-results__sidebar">
            <div class="persona-committee">
              <span class="persona-committee__title">Buying Committee</span>

              <!-- Primary Buyer Slot -->
              <button
                type="button"
                class="persona-slot"
                :class="{
                  'persona-slot--active': activePersonaType === 'primary',
                  'persona-slot--locked': lockedPersonas.primary
                }"
                @click="setActivePersonaType('primary')"
              >
                <div class="persona-slot__header">
                  <span class="persona-slot__label">Primary Buyer</span>
                  <svg v-if="lockedPersonas.primary" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4zm0 10c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2z"/>
                  </svg>
                </div>
                <div class="persona-slot__preview">
                  {{ lockedPersonas.primary?.name || (hasContent ? 'Generated persona ready' : 'Click to generate') }}
                </div>
              </button>

              <!-- Secondary Buyer Slot (future) -->
              <button
                type="button"
                class="persona-slot persona-slot--disabled"
                disabled
              >
                <div class="persona-slot__header">
                  <span class="persona-slot__label">Secondary Buyer</span>
                </div>
                <div class="persona-slot__preview">Coming soon</div>
              </button>

              <!-- Locked Summary -->
              <div v-if="lockedPersonasCount > 0" class="persona-committee__summary">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4z"/>
                </svg>
                {{ lockedPersonasCount }}/1 persona locked
              </div>
            </div>
          </aside>

          <!-- MAIN: Persona Card -->
          <main class="persona-results__main">
            <div class="persona-results__header">
              <h3 class="persona-results__title">
                Primary Buyer Persona
                <span v-if="hasContent" class="persona-results__count">Generated</span>
              </h3>
              <div class="persona-results__actions">
                <button
                  type="button"
                  class="generator__button generator__button--outline"
                  @click="handleGenerate"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M23 4v6h-6M1 20v-6h6"/>
                    <path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/>
                  </svg>
                  Regenerate
                </button>
                <button
                  type="button"
                  class="generator__button generator__button--outline"
                  @click="handleCopyAll"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            <!-- Locked State -->
            <div v-if="lockedPersonas.primary" class="persona-locked-card">
              <div class="persona-locked-card__badge">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 1C8.676 1 6 3.676 6 7v2H4v14h16V9h-2V7c0-3.324-2.676-6-6-6zm0 2c2.276 0 4 1.724 4 4v2H8V7c0-2.276 1.724-4 4-4z"/>
                </svg>
                LOCKED PERSONA
              </div>
              <div class="persona-locked-card__content">
                {{ lockedPersonas.primary.content }}
              </div>
              <div class="persona-locked-card__actions">
                <button type="button" class="generator__button generator__button--outline" @click="handleCopy">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </button>
                <button type="button" class="generator__button generator__button--ghost" @click="unlockPersona('primary')">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 9.9-1"/>
                  </svg>
                  Unlock & Edit
                </button>
              </div>
            </div>

            <!-- Persona Card (when not locked) -->
            <div v-else-if="hasContent" class="persona-card">
              <!-- Avatar + Name -->
              <div class="persona-card__header">
                <div class="persona-card__avatar">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
                    <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z"/>
                  </svg>
                </div>
                <div class="persona-card__identity">
                  <span class="persona-card__archetype">IDEAL CLIENT PERSONA</span>
                  <h4 class="persona-card__name">The {{ formData.industry || 'Professional' }}</h4>
                </div>
              </div>

              <!-- Persona Content -->
              <div class="persona-card__content">
                {{ displayContent }}
              </div>

              <div class="persona-card__actions">
                <button
                  type="button"
                  class="generator__button generator__button--call-to-action"
                  @click="lockPersona('primary')"
                >
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  Lock Persona
                </button>
                <button type="button" class="generator__button generator__button--outline" @click="handleCopy">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                    <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>
                  </svg>
                  Copy
                </button>
              </div>
            </div>

            <!-- Empty State -->
            <div v-else class="persona-empty-state">
              <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3z"/>
              </svg>
              <p>Generate a persona to see your ideal client profile here.</p>
            </div>

            <!-- Footer Actions -->
            <div v-if="lockedPersonasCount > 0" class="persona-results__footer">
              <!-- Save Success Message -->
              <div v-if="saveSuccess" class="persona-save-success">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Persona saved to profile!
              </div>

              <!-- Save Error Message -->
              <div v-if="saveError" class="persona-save-error">
                {{ saveError }}
              </div>

              <button
                type="button"
                class="generator__button generator__button--call-to-action"
                :disabled="isSavingToProfile || !hasSelectedProfile"
                :title="!hasSelectedProfile ? 'Select a profile above to save' : ''"
                @click="handleSavePersona"
              >
                <svg v-if="!isSavingToProfile" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/>
                  <polyline points="17 21 17 13 7 13 7 21"/>
                  <polyline points="7 3 7 8 15 8"/>
                </svg>
                <svg v-else class="animate-spin" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10" stroke-opacity="0.25"/>
                  <path d="M12 2a10 10 0 0 1 10 10" stroke-linecap="round"/>
                </svg>
                {{ isSavingToProfile ? 'Saving...' : 'Save Persona' }}
              </button>
              <button type="button" class="generator__button generator__button--ghost" @click="handleStartOver">
                Start Over
              </button>
            </div>

            <!-- Cross-tool Navigation -->
            <div v-if="lockedPersonasCount > 0" class="gfy-cross-tool-nav">
              <span class="gfy-cross-tool-nav__label">Continue building your media kit:</span>
              <div class="gfy-cross-tool-nav__links">
                <a href="/tools/biography/" class="gfy-cross-tool-nav__link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                    <circle cx="12" cy="7" r="4"/>
                  </svg>
                  Generate Biography
                </a>
                <a href="/tools/offers/" class="gfy-cross-tool-nav__link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"/>
                    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/>
                  </svg>
                  Generate Offers
                </a>
                <a href="/tools/topics/" class="gfy-cross-tool-nav__link">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                    <line x1="8" y1="6" x2="21" y2="6"/>
                    <line x1="8" y1="12" x2="21" y2="12"/>
                    <line x1="8" y1="18" x2="21" y2="18"/>
                    <line x1="3" y1="6" x2="3.01" y2="6"/>
                    <line x1="3" y1="12" x2="3.01" y2="12"/>
                    <line x1="3" y1="18" x2="3.01" y2="18"/>
                  </svg>
                  Generate Topics
                </a>
              </div>
            </div>
          </main>
        </div>
      </div>
    </template>
  </GeneratorLayout>

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else-if="mode === 'integrated'"
    :title="config.title"
    :description="config.description"
    :mode="mode"
    :is-loading="isGenerating"
    :has-results="hasContent"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    :target-component="config.title"
    :show-cta="!hasContent"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <!-- Dynamic Fields Based on Config -->
      <div
        v-for="field in config.fields"
        :key="field.name"
        class="gmkb-ai-form-group"
      >
        <label :class="['gmkb-ai-label', field.required ? 'gmkb-ai-label--required' : '']">
          {{ field.label }}
        </label>

        <!-- Textarea for longer inputs -->
        <textarea
          v-if="field.type === 'textarea'"
          v-model="formData[field.name]"
          class="gmkb-ai-input gmkb-ai-textarea"
          :placeholder="field.placeholder"
          :rows="field.rows || 3"
        ></textarea>

        <!-- Select dropdown -->
        <select
          v-else-if="field.type === 'select'"
          v-model="formData[field.name]"
          class="gmkb-ai-input gmkb-ai-select"
        >
          <option v-for="opt in field.options" :key="opt.value" :value="opt.value">
            {{ opt.label }}
          </option>
        </select>

        <!-- Default text input -->
        <input
          v-else
          v-model="formData[field.name]"
          type="text"
          class="gmkb-ai-input"
          :placeholder="field.placeholder"
        />

        <span v-if="field.hint" class="gmkb-ai-hint">{{ field.hint }}</span>
      </div>

      <!-- Tone Selector (optional) -->
      <AiToneSelector v-if="config.showTone" v-model="formData.tone" />

      <!-- Generate Button -->
      <AiGenerateButton
        :text="config.buttonText || 'Generate'"
        :loading-text="config.loadingText || 'Generating...'"
        :loading="isGenerating"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasContent" class="gmkb-ai-results">
        <AiResultsDisplay
          :content="displayContent"
          :format="config.resultFormat || 'text'"
          :selected-index="selectedIndex"
          @select="handleSelect"
        />
      </div>
    </template>
  </AiWidgetFrame>

</template>

<script setup>
import { ref, computed, reactive, watch, inject, onMounted, onUnmounted } from 'vue';
import { useAIGenerator } from '../../src/composables/useAIGenerator';
import { useGeneratorHistory } from '../../src/composables/useGeneratorHistory';
import { useStandaloneProfile } from '../../src/composables/useStandaloneProfile';
import { useDraftState } from '../../src/composables/useDraftState';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiToneSelector from '../../src/vue/components/ai/AiToneSelector.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, AuthorityHookBuilder, ProfileSelector, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';

// Awareness level options (Eugene Schwartz's 5 levels)
const AWARENESS_OPTIONS = [
  { value: '', label: 'Select awareness level...' },
  { value: 'unaware', label: 'Unaware - Don\'t know they have a problem' },
  { value: 'problem-aware', label: 'Problem Aware - Know the problem, not the solution' },
  { value: 'solution-aware', label: 'Solution Aware - Know solutions exist, not yours' },
  { value: 'product-aware', label: 'Product Aware - Know your product, not convinced' },
  { value: 'most-aware', label: 'Most Aware - Ready to buy, need a deal' }
];

const props = defineProps({
  /**
   * Mode: 'integrated', 'standalone', or 'embedded'
   * - standalone: Full two-panel layout with guidance
   * - integrated: Compact widget for embedding in other components
   * - embedded: Landing page embed with simplified form
   */
  mode: {
    type: String,
    default: 'default',
    validator: (v) => ['default', 'integrated'].includes(v)
  },

  /**
   * Component ID to apply results to (integrated mode)
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

const emit = defineEmits(['applied', 'generated', 'change', 'preview-update', 'update:can-generate']);

// Config for integrated mode (SimpleGenerator compatibility)
const config = {
  title: 'Ideal Client Persona Generator',
  description: 'Define your ideal client avatar with detailed demographics and psychographics.',
  buttonText: 'Generate Persona',
  loadingText: 'Building your ideal client profile...',
  resultFormat: 'text',
  showTone: false,
  fields: [
    {
      name: 'services',
      label: 'Your Services/Offers',
      type: 'textarea',
      placeholder: 'What do you offer? What problems do you solve?',
      required: true,
      rows: 3
    },
    {
      name: 'industry',
      label: 'Industry/Niche',
      type: 'text',
      placeholder: 'e.g., tech startups, healthcare, coaching',
      required: false
    },
    {
      name: 'currentClients',
      label: 'Current Best Clients',
      type: 'textarea',
      placeholder: 'Describe your best current clients (optional)',
      hint: 'This helps create a more accurate persona.',
      required: false,
      rows: 2
    }
  ]
};

// Initialize form data based on config fields
const formData = reactive({});
config.fields.forEach(field => {
  formData[field.name] = field.default || '';
});
formData.tone = 'professional';

// Authority Hook (simplified: WHO + WHAT)
const authorityHook = reactive({
  who: '',
  what: '',
  when: '',
  how: ''
});

// Market context
const awarenessLevel = ref('');

// Results UI state
const activePersonaType = ref('primary');
const lockedPersonas = reactive({
  primary: null
});

// Profile save functionality (standalone mode)
const {
  selectedProfileId,
  hasSelectedProfile,
  saveToProfile
} = useStandaloneProfile();

// Save state
const isSavingToProfile = ref(false);
const saveSuccess = ref(false);
const saveError = ref(null);

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
} = useDraftState('persona');

// Prefilled fields tracking
const prefilledFields = ref(new Set());
const showDraftPrompt = ref(false);

/**
 * Computed: Count of locked personas
 */
const lockedPersonasCount = computed(() => {
  return Object.values(lockedPersonas).filter(Boolean).length;
});

/**
 * Set active persona type in sidebar
 */
const setActivePersonaType = (type) => {
  activePersonaType.value = type;
};

/**
 * Lock current persona
 */
const lockPersona = (type) => {
  if (generatedContent.value) {
    lockedPersonas[type] = {
      name: `The ${formData.industry || 'Professional'}`,
      content: generatedContent.value
    };
  }
};

/**
 * Unlock a persona
 */
const unlockPersona = (type) => {
  lockedPersonas[type] = null;
};

/**
 * Handle save persona action
 */
const handleSavePersona = async () => {
  if (!lockedPersonas.primary) return;

  // If we have a selected profile in standalone mode, save via API
  if (props.mode === 'default' && hasSelectedProfile.value) {
    isSavingToProfile.value = true;
    saveSuccess.value = false;
    saveError.value = null;

    try {
      const success = await saveToProfile('persona', lockedPersonas.primary.content);
      if (success) {
        saveSuccess.value = true;
        setTimeout(() => {
          saveSuccess.value = false;
        }, 3000);
      } else {
        saveError.value = 'Failed to save persona to profile';
      }
    } catch (err) {
      saveError.value = err.message || 'Failed to save persona';
    } finally {
      isSavingToProfile.value = false;
    }
  }

  // Also emit for parent components
  emit('generated', {
    content: lockedPersonas.primary.content,
    locked: true
  });
};

/**
 * Handle start over action
 */
const handleStartOver = () => {
  // Clear all locked personas
  Object.keys(lockedPersonas).forEach(key => {
    lockedPersonas[key] = null;
  });
  // Reset the active type
  activePersonaType.value = 'primary';
};

// Inject profile data from EmbeddedToolWrapper (for embedded mode)
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

/**
 * Populate form fields from profile data
 */
function populateFromProfile(profileData) {
  if (!profileData) return;

  // Populate services from hook_what or services field
  if (profileData.hook_what && !formData.services) {
    formData.services = profileData.hook_what;
  }

  // Populate industry from industry field
  if (profileData.industry && !formData.industry) {
    formData.industry = profileData.industry;
  }

  // Populate structured authority hook fields
  if (profileData.hook_who && !authorityHook.who) {
    authorityHook.who = profileData.hook_who;
  }
  if (profileData.hook_what && !authorityHook.what) {
    authorityHook.what = profileData.hook_what;
  }
  if (profileData.hook_when && !authorityHook.when) {
    authorityHook.when = profileData.hook_when;
  }
  if (profileData.hook_how && !authorityHook.how) {
    authorityHook.how = profileData.hook_how;
  }
}

/**
 * Check if a field was prefilled from profile
 */
function isFieldPrefilled(fieldName) {
  return prefilledFields.value.has(fieldName);
}

/**
 * Mark a field as edited (removes prefilled status)
 */
function markFieldEdited(fieldName) {
  prefilledFields.value.delete(fieldName);
}

/**
 * Get current form state for draft saving
 */
function getDraftState() {
  return {
    formData: { ...formData },
    authorityHook: { ...authorityHook },
    awarenessLevel: awarenessLevel.value
  };
}

/**
 * Restore form state from draft
 */
function restoreDraftState(draft) {
  if (draft.formData) Object.assign(formData, draft.formData);
  if (draft.authorityHook) Object.assign(authorityHook, draft.authorityHook);
  if (draft.awarenessLevel) awarenessLevel.value = draft.awarenessLevel;
}

/**
 * Handle restore draft button click
 */
function handleRestoreDraft() {
  const draft = loadDraft();
  if (draft) {
    restoreDraftState(draft);
  }
  showDraftPrompt.value = false;
}

/**
 * Handle discard draft button click
 */
function handleDiscardDraft() {
  clearDraft();
  showDraftPrompt.value = false;
}

/**
 * Handle profile selected from ProfileSelector (standalone mode)
 * Sets selectedProfileId so saveMultipleToProfile can work correctly
 */
function handleProfileSelected({ id, data }) {
  if (props.mode === 'default') {
    // Set the profile ID in our composable instance so saves work correctly
    if (id) {
      selectedProfileId.value = id;
    }
    if (data) {
      // Track which fields are being prefilled
      const newPrefilledFields = new Set();

      if (data.hook_what && !formData.services) newPrefilledFields.add('services');
      if (data.industry && !formData.industry) newPrefilledFields.add('industry');
      if (data.hook_who && !authorityHook.who) newPrefilledFields.add('hook_who');
      if (data.hook_what && !authorityHook.what) newPrefilledFields.add('hook_what');
      if (data.hook_when && !authorityHook.when) newPrefilledFields.add('hook_when');
      if (data.hook_how && !authorityHook.how) newPrefilledFields.add('hook_how');

      prefilledFields.value = newPrefilledFields;
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

// Use the generic AI generator
const {
  isGenerating,
  generatedContent,
  error,
  usageRemaining,
  resetTime,
  hasContent,
  generate,
  copyToClipboard
} = useAIGenerator('persona');

// History for recent generations
const {
  history,
  hasHistory,
  addToHistory,
  removeFromHistory,
  clearHistory,
  formatTimestamp
} = useGeneratorHistory('persona');

const showHistory = ref(false);

// Selection state for list/cards results
const selectedIndex = ref(0);

/**
 * Persona formula for guidance panel
 */
const personaFormula = '<span class="generator__highlight">[DEMOGRAPHICS]</span> + <span class="generator__highlight">[PSYCHOGRAPHICS]</span> + <span class="generator__highlight">[PAIN POINTS]</span> = Ideal Client Persona';

/**
 * Process steps for guidance panel
 */
const processSteps = [
  {
    title: 'Why Personas Matter',
    description: 'An ideal client persona transforms vague target audiences into specific, relatable people. Instead of marketing to "everyone," you create focused messaging that resonates with the exact people who need your services most.'
  },
  {
    title: 'What Makes a Persona Actionable',
    description: 'The best personas go beyond basic demographics to include psychographics (values, motivations, fears), pain points (specific problems they face), goals (what they want to achieve), and objections (what holds them back from taking action).'
  },
  {
    title: 'How to Use Your Persona',
    description: 'Reference your persona when creating marketing content, developing new offers, writing sales copy, or making business decisions. Ask yourself: "Would my ideal client resonate with this?" This keeps your business aligned with your best clients.'
  }
];

/**
 * Example personas for guidance panel
 */
const examples = [
  {
    title: 'Business Coach Ideal Client:',
    description: 'Meet Sarah, a 38-year-old entrepreneur running a 6-figure online business. She\'s overwhelmed trying to scale while maintaining quality. She values work-life balance but feels guilty taking time off. Her biggest fear is burnout, and she needs proven systems to grow sustainably.'
  },
  {
    title: 'Marketing Consultant Ideal Client:',
    description: 'Meet David, a 45-year-old VP of Marketing at a B2B SaaS company. He\'s under pressure to generate more qualified leads with a flat budget. He values data-driven strategies but lacks in-house expertise for complex campaigns. His biggest challenge is proving marketing ROI to the C-suite.'
  }
];

/**
 * Format content for display
 */
const displayContent = computed(() => {
  if (!generatedContent.value) return null;

  // If result is already an array, return as-is
  if (Array.isArray(generatedContent.value)) {
    return generatedContent.value;
  }

  // If it's a string and should be split into items
  if (config.resultFormat === 'cards' || config.resultFormat === 'list') {
    // Split by newlines and numbered items
    const lines = generatedContent.value.split('\n').filter(l => l.trim());
    return lines.map(line => line.replace(/^\d+[\.\)]\s*/, '').trim());
  }

  return generatedContent.value;
});

/**
 * Check if we can generate
 */
const canGenerate = computed(() => {
  // Check all required fields have values
  return config.fields
    .filter(f => f.required)
    .every(f => formData[f.name]?.trim?.()?.length > 0);
});

/**
 * Form completion status for progress indicator
 */
const formCompletion = computed(() => {
  const fields = [
    { name: 'Services/Offers', filled: !!formData.services?.trim() },
    { name: 'Industry/Niche', filled: !!formData.industry?.trim() },
    { name: 'Who you help', filled: !!authorityHook.who?.trim() },
    { name: 'What you do', filled: !!authorityHook.what?.trim() }
  ];
  const filledCount = fields.filter(f => f.filled).length;
  return {
    fields,
    filledCount,
    totalCount: fields.length,
    percentage: Math.round((filledCount / fields.length) * 100),
    isComplete: canGenerate.value
  };
});

/**
 * Embedded mode field configuration
 * In embedded mode, we show a simplified 2-field form (services, industry)
 */
const embeddedFields = computed(() => {
  const defaultLabels = {
    services: 'Your Services/Offers',
    industry: 'Industry/Niche'
  };
  const defaultPlaceholders = {
    services: 'What do you offer? What problems do you solve?',
    industry: 'e.g., tech startups, healthcare, coaching'
  };

  return [
    {
      key: 'services',
      label: props.intent?.formLabels?.services || defaultLabels.services,
      placeholder: props.intent?.formPlaceholders?.services || defaultPlaceholders.services
    },
    {
      key: 'industry',
      label: props.intent?.formLabels?.industry || defaultLabels.industry,
      placeholder: props.intent?.formPlaceholders?.industry || defaultPlaceholders.industry
    }
  ];
});

/**
 * Generate preview text for embedded mode
 */
const embeddedPreviewText = computed(() => {
  const servicesVal = formData.services || '[SERVICES]';
  const industryVal = formData.industry || '[INDUSTRY]';

  if (!formData.services && !formData.industry) {
    return null; // Show default preview
  }

  return `"Your ideal client needs <strong>${servicesVal}</strong> in the <strong>${industryVal}</strong> industry."`;
});

/**
 * Check if embedded form has minimum required fields
 */
const canGenerateEmbedded = computed(() => {
  return formData.services?.trim();
});

/**
 * Handle generate button click
 */
const handleGenerate = async () => {
  try {
    const context = props.mode === 'integrated' ? 'builder' : 'public';
    const params = {
      ...formData,
      authorityHookFields: { ...authorityHook },
      awarenessLevel: awarenessLevel.value
    };

    await generate(params, context);

    emit('generated', {
      content: generatedContent.value
    });

    // Save to history on successful generation
    if (generatedContent.value) {
      addToHistory({
        inputs: {
          services: formData.services,
          industry: formData.industry,
          currentClients: formData.currentClients,
          authorityHook: { ...authorityHook },
          awarenessLevel: awarenessLevel.value,
          tone: formData.tone
        },
        results: generatedContent.value,
        preview: generatedContent.value.substring(0, 50) || 'Generated persona'
      });
    }
  } catch (err) {
    console.error('[PersonaGenerator] Generation failed:', err);
  }
};

/**
 * Handle selection
 */
const handleSelect = (index) => {
  selectedIndex.value = index;
};

/**
 * Handle copy to clipboard
 */
const handleCopy = async () => {
  await copyToClipboard();
};

/**
 * Handle copy persona content to clipboard
 */
const handleCopyAll = async () => {
  // Get locked or generated persona content
  const content = lockedPersonas.value?.primary?.content || displayContent.value;
  if (!content) return;

  try {
    await navigator.clipboard.writeText(content);
  } catch (err) {
    console.error('[PersonaGenerator] Failed to copy:', err);
  }
};

/**
 * Handle apply (integrated mode)
 */
const handleApply = () => {
  const content = Array.isArray(displayContent.value)
    ? displayContent.value[selectedIndex.value]
    : displayContent.value;

  emit('applied', {
    componentId: props.componentId,
    content,
    fullContent: generatedContent.value
  });
};

/**
 * Keyboard shortcut handler (Ctrl/Cmd + Enter to generate)
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
 * Initialize on mount
 */
onMounted(() => {
  // Check for saved draft on mount (standalone mode only)
  if (props.mode === 'default' && hasDraft.value) {
    showDraftPrompt.value = true;
  }

  // Start auto-save in standalone mode
  if (props.mode === 'default') {
    startAutoSave(getDraftState);
  }

  // Add keyboard shortcut listener
  window.addEventListener('keydown', handleKeyboardShortcut);
});

/**
 * Cleanup on unmount
 */
onUnmounted(() => {
  window.removeEventListener('keydown', handleKeyboardShortcut);
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
  margin: 0 0 var(--mkcg-space-md, 20px) 0;
}

.generator__actions {
  margin-top: var(--mkcg-space-lg, 30px);
  text-align: center;
}

.generator__error {
  margin-top: var(--mkcg-space-md, 20px);
  padding: var(--mkcg-space-md, 20px);
  background-color: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: var(--mkcg-radius, 8px);
  text-align: center;
}

.generator__error p {
  color: #991b1b;
  margin: 0 0 var(--mkcg-space-sm, 12px) 0;
}

.generator__field-select {
  height: 48px;
  cursor: pointer;
}

/* Persona Results */
.persona-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.persona-generator__results-header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.persona-generator__results-header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.persona-generator__results-header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

.persona-generator__content {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  line-height: var(--mkcg-line-height-relaxed, 1.6);
}

.persona-generator__text {
  color: var(--mkcg-text-primary, #2c3e50);
  white-space: pre-wrap;
}

.persona-generator__actions {
  margin-top: var(--mkcg-space-md, 20px);
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

/* Integrated Mode Styles (kept from SimpleGenerator) */
.gmkb-ai-results {
  margin-top: 16px;
}

.gmkb-ai-select {
  width: 100%;
  padding: 10px 12px;
  font-size: 14px;
  border: 1px solid var(--gmkb-ai-border, #e5e7eb);
  border-radius: var(--gmkb-ai-radius-md, 8px);
  background: var(--gmkb-ai-bg, #fff);
  cursor: pointer;
}

.gmkb-ai-select:focus {
  outline: none;
  border-color: var(--gmkb-ai-primary, #6366f1);
  box-shadow: 0 0 0 3px rgba(99, 102, 241, 0.1);
}

/* ========================================
   Persona Results Layout with Sidebar
   ======================================== */
.persona-results {
  background: var(--mkcg-bg-secondary, #f8fafc);
  border-radius: 12px;
  padding: 0;
  overflow: hidden;
}

.persona-results__layout {
  display: flex;
  gap: 0;
  min-height: 500px;
}

/* Sidebar */
.persona-results__sidebar {
  width: 240px;
  min-width: 240px;
  background: var(--mkcg-bg-primary, #ffffff);
  border-right: 1px solid var(--mkcg-border, #e2e8f0);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.persona-committee {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.persona-committee__title {
  font-size: 11px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--mkcg-text-secondary, #64748b);
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
}

/* Persona Slots */
.persona-slot {
  display: flex;
  flex-direction: column;
  padding: 0.875rem;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  text-align: left;
  width: 100%;
}

.persona-slot:hover:not(.persona-slot--disabled) {
  border-color: var(--mkcg-primary, #3b82f6);
  background: var(--mkcg-bg-primary, #ffffff);
}

.persona-slot--active {
  border-color: var(--mkcg-primary, #3b82f6);
  background: var(--mkcg-bg-primary, #ffffff);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.persona-slot--locked {
  border-color: #10b981;
  background: #f0fdf4;
}

.persona-slot--locked .persona-slot__label {
  color: #047857;
}

.persona-slot--disabled {
  opacity: 0.5;
  cursor: not-allowed;
  background: var(--mkcg-bg-secondary, #f8fafc);
}

.persona-slot__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.375rem;
}

.persona-slot__label {
  font-size: 12px;
  font-weight: 600;
  color: var(--mkcg-text-primary, #0f172a);
}

.persona-slot__preview {
  font-size: 11px;
  color: var(--mkcg-text-secondary, #64748b);
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.persona-committee__summary {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-top: 1rem;
  padding-top: 1rem;
  border-top: 1px solid var(--mkcg-border, #e2e8f0);
  font-size: 12px;
  color: #047857;
  font-weight: 500;
}

/* Main Content Area */
.persona-results__main {
  flex: 1;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
}

.persona-results__header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 1.5rem;
}

.persona-results__title {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.persona-results__count {
  font-size: 11px;
  font-weight: 500;
  color: #10b981;
  background: #f0fdf4;
  padding: 0.25rem 0.5rem;
  border-radius: 4px;
}

.persona-results__actions {
  display: flex;
  gap: 0.5rem;
}

/* Persona Card */
.persona-card {
  background: var(--mkcg-bg-primary, #ffffff);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 12px;
  padding: 1.5rem;
  flex: 1;
}

.persona-card__header {
  display: flex;
  align-items: center;
  gap: 1rem;
  margin-bottom: 1.25rem;
  padding-bottom: 1.25rem;
  border-bottom: 1px solid var(--mkcg-border, #e2e8f0);
}

.persona-card__avatar {
  width: 48px;
  height: 48px;
  background: linear-gradient(135deg, #8b5cf6 0%, #6366f1 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
}

.persona-card__identity {
  flex: 1;
}

.persona-card__archetype {
  display: block;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #8b5cf6;
  margin-bottom: 0.25rem;
}

.persona-card__name {
  font-size: 1.125rem;
  font-weight: 700;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0;
}

.persona-card__content {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: var(--mkcg-text-primary, #0f172a);
  white-space: pre-wrap;
  margin-bottom: 1.5rem;
}

.persona-card__actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid var(--mkcg-border, #e2e8f0);
}

/* Locked Persona Card */
.persona-locked-card {
  background: #f0fdf4;
  border: 2px solid #10b981;
  border-radius: 12px;
  padding: 1.5rem;
  flex: 1;
}

.persona-locked-card__badge {
  display: inline-flex;
  align-items: center;
  gap: 0.375rem;
  font-size: 10px;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  color: #047857;
  background: #dcfce7;
  padding: 0.375rem 0.75rem;
  border-radius: 4px;
  margin-bottom: 1rem;
}

.persona-locked-card__content {
  font-size: 0.9375rem;
  line-height: 1.7;
  color: #166534;
  white-space: pre-wrap;
  margin-bottom: 1.5rem;
}

.persona-locked-card__actions {
  display: flex;
  gap: 0.75rem;
  padding-top: 1.25rem;
  border-top: 1px solid #a7f3d0;
}

/* Empty State */
.persona-empty-state {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 3rem;
  color: var(--mkcg-text-secondary, #64748b);
  text-align: center;
}

.persona-empty-state svg {
  margin-bottom: 1rem;
  opacity: 0.5;
}

.persona-empty-state p {
  margin: 0;
  font-size: 0.9375rem;
}

/* Footer */
.persona-results__footer {
  display: flex;
  justify-content: center;
  gap: 1rem;
  margin-top: 1.5rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--mkcg-border, #e2e8f0);
  flex-wrap: wrap;
}

/* Save Success/Error Messages */
.persona-save-success {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #f0fdf4;
  border: 1px solid #86efac;
  border-radius: 6px;
  color: #166534;
  font-size: 0.875rem;
  font-weight: 500;
  width: 100%;
  justify-content: center;
}

.persona-save-error {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 6px;
  color: #991b1b;
  font-size: 0.875rem;
  font-weight: 500;
  width: 100%;
  justify-content: center;
}

/* Spinner animation */
@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

.animate-spin {
  animation: spin 1s linear infinite;
}

/* Responsive */
@media (max-width: 768px) {
  .persona-results__layout {
    flex-direction: column;
  }

  .persona-results__sidebar {
    width: 100%;
    min-width: 100%;
    border-right: none;
    border-bottom: 1px solid var(--mkcg-border, #e2e8f0);
  }

  .persona-committee {
    flex-direction: row;
    flex-wrap: wrap;
  }

  .persona-committee__title {
    width: 100%;
  }

  .persona-slot {
    flex: 1;
    min-width: 150px;
  }
}

/* ===========================================
   ENHANCED UX FEATURES
   =========================================== */

/* Draft Restore Prompt */
.gfy-draft-prompt {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  padding: 1rem 1.25rem;
  background: linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%);
  border: 1px solid #93c5fd;
  border-radius: 10px;
  margin-bottom: 1.5rem;
}

.gfy-draft-prompt__content {
  display: flex;
  align-items: flex-start;
  gap: 0.75rem;
}

.gfy-draft-prompt__content svg {
  flex-shrink: 0;
  color: var(--mkcg-primary, #3b82f6);
  margin-top: 2px;
}

.gfy-draft-prompt__content strong {
  display: block;
  font-size: 0.9375rem;
  color: var(--mkcg-text-primary, #0f172a);
  margin-bottom: 0.25rem;
}

.gfy-draft-prompt__content p {
  margin: 0;
  font-size: 0.8125rem;
  color: var(--mkcg-text-secondary, #64748b);
}

.gfy-draft-prompt__actions {
  display: flex;
  gap: 0.5rem;
  margin-left: 2rem;
}

/* Auto-save Indicator */
.gfy-auto-save-indicator {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border-radius: 6px;
  font-size: 0.75rem;
  color: var(--mkcg-text-secondary, #64748b);
  margin-bottom: 1rem;
}

.gfy-auto-save-indicator svg {
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%, 100% { opacity: 0.5; }
  50% { opacity: 1; }
}

/* Prefilled Badge */
.gfy-prefilled-badge {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  background: rgba(59, 130, 246, 0.1);
  color: var(--mkcg-primary, #3b82f6);
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.3px;
  border-radius: 4px;
  margin-left: 8px;
}

/* Prefilled Input State */
.generator__field-input--prefilled {
  border-color: rgba(59, 130, 246, 0.3);
  background: rgba(59, 130, 246, 0.02);
}

/* Cross-tool Navigation */
.gfy-cross-tool-nav {
  margin-top: 2rem;
  padding-top: 1.5rem;
  border-top: 1px solid var(--mkcg-border, #e2e8f0);
}

.gfy-cross-tool-nav__label {
  display: block;
  font-size: 0.8125rem;
  font-weight: 600;
  color: var(--mkcg-text-secondary, #64748b);
  margin-bottom: 0.75rem;
}

.gfy-cross-tool-nav__links {
  display: flex;
  flex-wrap: wrap;
  gap: 0.75rem;
}

.gfy-cross-tool-nav__link {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 1rem;
  background: var(--mkcg-bg-secondary, #f8fafc);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 6px;
  font-size: 0.8125rem;
  font-weight: 500;
  color: var(--mkcg-text-primary, #0f172a);
  text-decoration: none;
  transition: all 0.2s ease;
}

.gfy-cross-tool-nav__link:hover {
  background: var(--mkcg-primary, #3b82f6);
  border-color: var(--mkcg-primary, #3b82f6);
  color: #fff;
}

.gfy-cross-tool-nav__link svg {
  flex-shrink: 0;
}

/* Small button variant */
.generator__button--small {
  padding: 0.5rem 1rem;
  font-size: 0.8125rem;
}
</style>
