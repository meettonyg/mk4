<template>
  <!-- Standalone Mode: Full two-panel layout -->
  <GeneratorLayout
    v-if="mode === 'standalone'"
    title="Conversion Offer Generator"
    subtitle="Build your complete offer funnel with AI-powered variations for each tier"
    intro-text="Create a strategic offer suite that guides prospects from free lead magnets to premium high-ticket services. Each tier is designed to convert and ascend customers through your funnel."
    generator-type="conversion-offers"
    :has-results="hasOffers"
    :is-loading="!!generatingTier"
  >
    <!-- Left Panel: Form -->
    <template #left>
      <!-- Authority Hook Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Your Authority Hook</h3>

        <div class="generator__field">
          <label class="generator__field-label">WHO do you help? *</label>
          <input
            v-model="hookWho"
            type="text"
            class="generator__field-input"
            placeholder="e.g., SaaS Founders"
          />
        </div>

        <div class="generator__field">
          <label class="generator__field-label">WHAT is the result? *</label>
          <input
            v-model="hookWhat"
            type="text"
            class="generator__field-input"
            placeholder="e.g., Increase revenue by 40%"
          />
        </div>

        <div class="generator__field">
          <label class="generator__field-label">WHEN do they need it?</label>
          <input
            v-model="hookWhen"
            type="text"
            class="generator__field-input"
            placeholder="e.g., When scaling rapidly"
          />
        </div>

        <div class="generator__field">
          <label class="generator__field-label">HOW do you do it?</label>
          <input
            v-model="hookHow"
            type="text"
            class="generator__field-input"
            placeholder="e.g., My proven 90-day system"
          />
        </div>

        <!-- Live Preview -->
        <div class="generator__preview">
          "{{ hookPreview }}"
        </div>
      </div>

      <!-- Business Context Section -->
      <div class="generator__section">
        <h3 class="generator__section-title">Business Context</h3>

        <div class="generator__field-row">
          <div class="generator__field">
            <label class="generator__field-label">Business Type</label>
            <select v-model="businessType" class="generator__field-input">
              <option value="consulting">Consulting</option>
              <option value="coaching">Coaching</option>
              <option value="training">Training</option>
              <option value="service">Service Provider</option>
              <option value="product">Product Business</option>
            </select>
          </div>
          <div class="generator__field">
            <label class="generator__field-label">Price Range</label>
            <select v-model="priceRange" class="generator__field-input">
              <option value="budget">Budget ($100-$500)</option>
              <option value="midrange">Mid-range ($500-$2,000)</option>
              <option value="premium">Premium ($2,000-$10,000)</option>
              <option value="high-ticket">High-Ticket ($10,000+)</option>
            </select>
          </div>
        </div>

        <div class="generator__field-row">
          <div class="generator__field">
            <label class="generator__field-label">Delivery Method</label>
            <select v-model="deliveryMethod" class="generator__field-input">
              <option value="online">Online/Virtual</option>
              <option value="in-person">In-Person</option>
              <option value="hybrid">Hybrid</option>
              <option value="self-paced">Self-Paced Course</option>
            </select>
          </div>
          <div class="generator__field">
            <label class="generator__field-label">Variations per Tier</label>
            <input
              v-model.number="variationCount"
              type="number"
              class="generator__field-input"
              min="1"
              max="5"
            />
          </div>
        </div>

        <div class="generator__field">
          <label class="generator__field-label">Target Audience Challenges</label>
          <textarea
            v-model="audienceChallenges"
            class="generator__field-input generator__field-textarea"
            rows="3"
            placeholder="Describe what your target audience is struggling with right now..."
          ></textarea>
          <p class="generator__field-helper">
            Pain points help generate more compelling offer copy.
          </p>
        </div>
      </div>

      <!-- Generate Button -->
      <div class="generator__actions">
        <button
          type="button"
          class="generator__button generator__button--call-to-action"
          :class="{ 'generator__button--loading': !!generatingTier }"
          :disabled="!canGenerate || !!generatingTier"
          @click="handleGenerate"
        >
          <svg v-if="!generatingTier" width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z"/>
          </svg>
          {{ generatingTier ? 'Generating offers...' : 'Generate Offer Suite with AI' }}
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
        title="Building Your Offer Funnel"
        subtitle="A strategic offer suite guides prospects from awareness to high-ticket commitment, maximizing lifetime value at every step."
        :formula="offerFormula"
        :process-steps="processSteps"
        :examples="examples"
        examples-title="Example Offer Suites:"
      />
    </template>

    <!-- Results -->
    <template #results>
      <div class="conversion-generator__results">
        <!-- Results Header with Tier Tabs -->
        <div class="conversion-generator__header">
          <h3>Your Generated Offer Suite</h3>
          <p>Select a tier to view and refine your offers</p>
        </div>

        <!-- Tier Tabs -->
        <div class="conversion-generator__tabs">
          <button
            v-for="tier in tiers"
            :key="tier.id"
            type="button"
            class="conversion-generator__tab"
            :class="{
              'conversion-generator__tab--active': activeTier === tier.id,
              'conversion-generator__tab--locked': lockedOffers[tier.id],
              'conversion-generator__tab--generating': generatingTier === tier.id
            }"
            @click="selectTier(tier.id)"
          >
            <span class="conversion-generator__tab-label">{{ tier.label }}</span>
            <span class="conversion-generator__tab-status">
              <svg v-if="lockedOffers[tier.id]" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
              </svg>
              <svg v-else-if="generatingTier === tier.id" class="conversion-generator__spinner" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21 12a9 9 0 11-6.219-8.56"/>
              </svg>
              <svg v-else-if="tierOffers[tier.id]?.length" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
              <span v-else class="conversion-generator__tab-count">{{ tierOffers[tier.id]?.length || 0 }}</span>
            </span>
          </button>
        </div>

        <!-- Locked Count -->
        <div class="conversion-generator__progress">
          <span>{{ lockedCount }} of 3 offers locked</span>
        </div>

        <!-- Refinement Box -->
        <div v-if="currentTierOffers.length && !lockedOffers[activeTier]" class="conversion-generator__refinement">
          <div class="conversion-generator__refinement-header">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M12 20h9M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/>
            </svg>
            <span>Refine these offers</span>
          </div>
          <div class="conversion-generator__refinement-input">
            <textarea
              v-model="refinementPrompt"
              rows="1"
              placeholder="e.g., Make Option 1 sound more exclusive or focus on the revenue result..."
            ></textarea>
            <button
              type="button"
              :disabled="!refinementPrompt || !!generatingTier"
              @click="handleRefine"
            >
              Refine
            </button>
          </div>
        </div>

        <!-- Offer Cards -->
        <div v-if="currentTierOffers.length" class="conversion-generator__offers">
          <div class="conversion-generator__selection-hint">
            Select your preferred {{ tierLabels[activeTier] }} variation
          </div>

          <div
            v-for="(offer, index) in currentTierOffers"
            :key="index"
            class="conversion-generator__offer"
            :class="{ 'conversion-generator__offer--selected': selectedOfferIndex === index }"
            @click="selectOffer(index)"
          >
            <div class="conversion-generator__offer-header">
              <span class="conversion-generator__offer-number">{{ index + 1 }}</span>
              <div class="conversion-generator__offer-check">
                <svg v-if="selectedOfferIndex === index" width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
                </svg>
              </div>
            </div>
            <h4 class="conversion-generator__offer-title">{{ offer.title }}</h4>
            <p class="conversion-generator__offer-desc">{{ offer.description }}</p>
            <div class="conversion-generator__offer-meta">
              <div class="conversion-generator__offer-meta-item">
                <span>Investment</span>
                <strong>{{ offer.investment || tierPriceHints[activeTier] }}</strong>
              </div>
              <div class="conversion-generator__offer-meta-item">
                <span>Duration</span>
                <strong>{{ offer.duration || 'Varies' }}</strong>
              </div>
              <div class="conversion-generator__offer-meta-item">
                <span>Delivery</span>
                <strong>{{ offer.delivery || deliveryLabels[deliveryMethod] }}</strong>
              </div>
            </div>
          </div>
        </div>

        <!-- Empty State -->
        <div v-else-if="!generatingTier && !lockedOffers[activeTier]" class="conversion-generator__empty">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/>
            <polyline points="3.27 6.96 12 12.01 20.73 6.96"/>
            <line x1="12" y1="22.08" x2="12" y2="12"/>
          </svg>
          <p>Click below to generate {{ tierLabels[activeTier] }} variations.</p>
          <button
            type="button"
            class="generator__button generator__button--primary"
            @click="generateForTier(activeTier)"
          >
            Generate {{ tierLabels[activeTier] }} Ideas
          </button>
        </div>

        <!-- Locked State -->
        <div v-else-if="lockedOffers[activeTier]" class="conversion-generator__locked">
          <div class="conversion-generator__locked-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
            </svg>
            Locked
          </div>
          <h4>{{ lockedOffers[activeTier].title }}</h4>
          <p>{{ lockedOffers[activeTier].description }}</p>
          <button type="button" class="generator__button generator__button--outline" @click="unlockTier(activeTier)">
            Unlock to Edit
          </button>
        </div>

        <!-- Generating State -->
        <div v-else-if="generatingTier" class="conversion-generator__generating">
          <div class="conversion-generator__spinner-large"></div>
          <p>Generating {{ tierLabels[activeTier] }} variations...</p>
        </div>

        <!-- Actions -->
        <div class="conversion-generator__actions">
          <div class="conversion-generator__actions-row">
            <button
              type="button"
              class="generator__button generator__button--outline"
              :disabled="!!generatingTier || lockedOffers[activeTier]"
              @click="handleRegenerate"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M21.5 2v6h-6M2.5 22v-6h6M2 11.5a10 10 0 0118.8-4.3M22 12.5a10 10 0 01-18.8 4.2"/>
              </svg>
              Regenerate
            </button>
            <button
              type="button"
              class="generator__button generator__button--outline"
              @click="handleCopy"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"/>
                <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/>
              </svg>
              {{ selectedOfferIndex !== null ? 'Copy Selected' : 'Copy All' }}
            </button>
          </div>

          <div v-if="!lockedOffers[activeTier] && currentTierOffers.length" class="conversion-generator__lock-action">
            <button
              type="button"
              class="generator__button generator__button--primary"
              :disabled="selectedOfferIndex === null"
              @click="lockSelectedOffer"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zM9 6c0-1.66 1.34-3 3-3s3 1.34 3 3v2H9V6zm9 14H6V10h12v10zm-6-3c1.1 0 2-.9 2-2s-.9-2-2-2-2 .9-2 2 .9 2 2 2z"/>
              </svg>
              Lock as {{ tierLabels[activeTier] }}
            </button>
          </div>

          <!-- Save Authority Hook Checkbox -->
          <label v-if="hasHookData" class="conversion-generator__checkbox">
            <input
              v-model="saveAuthorityHook"
              type="checkbox"
            />
            <span class="conversion-generator__checkbox-box">
              <svg v-if="saveAuthorityHook" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
                <path d="M9 16.17L4.83 12l-1.42 1.41L9 19 21 7l-1.41-1.41L9 16.17z"/>
              </svg>
            </span>
            <span>Also save Authority Hook to profile</span>
          </label>

          <div class="conversion-generator__save-row">
            <button
              type="button"
              class="generator__button generator__button--call-to-action"
              :disabled="lockedCount === 0 || localIsSaving || !selectedProfileId"
              @click="handleSaveToProfile"
            >
              <span v-if="localIsSaving" class="conversion-generator__spinner"></span>
              <svg v-else width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <path d="M19 21H5a2 2 0 01-2-2V5a2 2 0 012-2h11l5 5v11a2 2 0 01-2 2z"/>
                <polyline points="17 21 17 13 7 13 7 21"/>
                <polyline points="7 3 7 8 15 8"/>
              </svg>
              {{ localIsSaving ? 'Saving...' : 'Save Funnel to Profile' }}
            </button>
            <button type="button" class="generator__button generator__button--text" @click="handleStartOver">
              Start Over
            </button>
          </div>

          <span v-if="saveSuccess" class="conversion-generator__success">
            Saved successfully!
          </span>
          <span v-if="localSaveError" class="conversion-generator__error-msg">
            {{ localSaveError }}
          </span>
        </div>
      </div>
    </template>
  </GeneratorLayout>

  <!-- Integrated Mode: Compact widget -->
  <AiWidgetFrame
    v-else-if="mode === 'integrated'"
    title="Conversion Offer Generator"
    description="Build your complete offer funnel with AI-powered variations for each tier."
    :mode="mode"
    :is-loading="!!generatingTier"
    :has-results="hasOffers"
    :error="error"
    :usage-remaining="usageRemaining"
    :reset-time="resetTime"
    target-component="Conversion Offers"
    :show-cta="!hasOffers"
    :cta-variant="usageRemaining === 0 ? 'exhausted' : 'default'"
    @apply="handleApply"
    @regenerate="handleGenerate"
    @copy="handleCopy"
    @retry="handleGenerate"
  >
    <!-- Input Form -->
    <div class="gmkb-ai-form">
      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">WHO do you help?</label>
        <input
          v-model="hookWho"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., SaaS Founders"
        />
      </div>

      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label gmkb-ai-label--required">WHAT is the result?</label>
        <input
          v-model="hookWhat"
          type="text"
          class="gmkb-ai-input"
          placeholder="e.g., Increase revenue by 40%"
        />
      </div>

      <div class="gmkb-ai-form-group">
        <label class="gmkb-ai-label">Target Audience Challenges</label>
        <textarea
          v-model="audienceChallenges"
          class="gmkb-ai-input gmkb-ai-textarea"
          placeholder="Describe what your target audience is struggling with..."
          rows="2"
        ></textarea>
      </div>

      <AiGenerateButton
        text="Generate Offer Suite"
        loading-text="Generating offers..."
        :loading="!!generatingTier"
        :disabled="!canGenerate"
        full-width
        @click="handleGenerate"
      />
    </div>

    <!-- Results -->
    <template #results>
      <div v-if="hasOffers" class="gmkb-ai-offers">
        <!-- Tier selector -->
        <div class="gmkb-ai-offers__tabs">
          <button
            v-for="tier in tiers"
            :key="tier.id"
            type="button"
            class="gmkb-ai-offers__tab"
            :class="{ 'gmkb-ai-offers__tab--active': activeTier === tier.id }"
            @click="selectTier(tier.id)"
          >
            {{ tier.label }}
            <svg v-if="lockedOffers[tier.id]" width="12" height="12" viewBox="0 0 24 24" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2z"/>
            </svg>
          </button>
        </div>

        <!-- Current tier offers -->
        <div class="gmkb-ai-offers__content">
          <AiResultsDisplay
            v-if="currentTierOffers.length"
            :content="currentTierOffersText"
            format="text"
            show-count
          />
          <div v-else-if="lockedOffers[activeTier]" class="gmkb-ai-offers__locked">
            <strong>{{ lockedOffers[activeTier].title }}</strong>
            <p>{{ lockedOffers[activeTier].description }}</p>
          </div>
        </div>
      </div>
    </template>
  </AiWidgetFrame>

  <!-- Embedded Mode: Landing page form -->
  <div v-else class="gmkb-embedded-form">
    <div class="gmkb-embedded-fields">
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">WHO do you help? *</label>
        <input
          v-model="hookWho"
          type="text"
          class="gmkb-embedded-input"
          placeholder="e.g., SaaS Founders"
        />
      </div>
      <div class="gmkb-embedded-field">
        <label class="gmkb-embedded-label">WHAT result do you deliver? *</label>
        <textarea
          v-model="hookWhat"
          class="gmkb-embedded-input gmkb-embedded-textarea"
          placeholder="e.g., Increase revenue by 40% in 90 days"
          rows="2"
        ></textarea>
      </div>
    </div>
    <div v-if="error" class="gmkb-embedded-error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, computed, watch, inject } from 'vue';
import { useAIConversionOffers } from '../../src/composables/useAIConversionOffers';
import { useProfileContext } from '../../src/composables/useProfileContext';

// Compact widget components (integrated mode)
import AiWidgetFrame from '../../src/vue/components/ai/AiWidgetFrame.vue';
import AiGenerateButton from '../../src/vue/components/ai/AiGenerateButton.vue';
import AiResultsDisplay from '../../src/vue/components/ai/AiResultsDisplay.vue';

// Full layout components (standalone mode)
import { GeneratorLayout, GuidancePanel, EMBEDDED_PROFILE_DATA_KEY } from '../_shared';

// Tier configurations
const tiers = [
  { id: 'lead-magnet', label: 'Lead Magnet' },
  { id: 'core-offer', label: 'Core Offer' },
  { id: 'high-ticket', label: 'High-Ticket' }
];

const tierLabels = {
  'lead-magnet': 'Lead Magnet',
  'core-offer': 'Core Offer',
  'high-ticket': 'High-Ticket'
};

const tierPriceHints = {
  'lead-magnet': 'Free',
  'core-offer': '$500-$2,500',
  'high-ticket': '$5,000+'
};

const deliveryLabels = {
  'online': 'Online/Virtual',
  'in-person': 'In-Person',
  'hybrid': 'Hybrid',
  'self-paced': 'Self-Paced'
};

const props = defineProps({
  mode: {
    type: String,
    default: 'standalone',
    validator: (v) => ['standalone', 'integrated', 'embedded'].includes(v)
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

const emit = defineEmits(['applied', 'generated', 'saved', 'preview-update', 'update:can-generate']);

// Use composables
const {
  isGenerating,
  error,
  usageRemaining,
  resetTime,
  generateForTier: generateTierApi,
  reset
} = useAIConversionOffers();

// Profile context for saving
const { saveToProfile } = useProfileContext();

// Inject profile data from parent
const injectedProfileData = inject(EMBEDDED_PROFILE_DATA_KEY, ref(null));

// Form state
const hookWho = ref('');
const hookWhat = ref('');
const hookWhen = ref('');
const hookHow = ref('');
const businessType = ref('consulting');
const priceRange = ref('midrange');
const deliveryMethod = ref('online');
const variationCount = ref(3);
const audienceChallenges = ref('');

// Results state
const activeTier = ref('core-offer');
const tierOffers = ref({
  'lead-magnet': [],
  'core-offer': [],
  'high-ticket': []
});
const lockedOffers = ref({});
const selectedOfferIndex = ref(null);
const generatingTier = ref(null);
const refinementPrompt = ref('');

// Save state
const selectedProfileId = ref(null);
const localIsSaving = ref(false);
const localSaveError = ref(null);
const saveSuccess = ref(false);
const saveAuthorityHook = ref(true);

/**
 * Guidance panel content
 */
const offerFormula = '<span class="generator__highlight">[Lead Magnet]</span> → <span class="generator__highlight">[Core Offer]</span> → <span class="generator__highlight">[High-Ticket]</span> = Complete Funnel';

const processSteps = [
  {
    title: 'Lead Magnet (Free)',
    description: 'A valuable free resource that attracts your ideal prospects. This could be a guide, checklist, template, or mini-course that solves a specific problem and demonstrates your expertise.'
  },
  {
    title: 'Core Offer ($500-$2,500)',
    description: 'Your main service or product that delivers significant transformation. This is where most of your revenue comes from - a course, group program, or done-with-you service.'
  },
  {
    title: 'High-Ticket Upgrade ($5,000+)',
    description: 'Premium, high-touch offering for clients who want the best results. VIP days, private coaching, done-for-you services, or exclusive mastermind access.'
  }
];

const examples = [
  {
    title: 'Business Coach Funnel:',
    description: 'Lead Magnet: "5-Day Revenue Accelerator Challenge" → Core: "Scale to 7 Figures Group Coaching" ($2,497) → High-Ticket: "Private Strategy Intensives" ($15,000)'
  },
  {
    title: 'Marketing Consultant Funnel:',
    description: 'Lead Magnet: "LinkedIn Content Calendar Template" → Core: "Content Marketing Mastery Course" ($997) → High-Ticket: "Done-For-You Content Strategy" ($8,500)'
  }
];

// Computed
const resolvedProfileId = computed(() => {
  return props.profileData?.id
    || injectedProfileData.value?.id
    || null;
});

const hookPreview = computed(() => {
  const who = hookWho.value || '[WHO]';
  const what = hookWhat.value || '[WHAT]';
  const when = hookWhen.value || '[WHEN]';
  const how = hookHow.value || '[HOW]';
  return `I help ${who} ${what} ${when} through ${how}.`;
});

const generatedHookSummary = computed(() => {
  if (!hookWho.value && !hookWhat.value) return '';
  let summary = `I help ${hookWho.value || ''} ${hookWhat.value || ''}`;
  if (hookWhen.value) summary += ` ${hookWhen.value}`;
  if (hookHow.value) summary += ` through ${hookHow.value}`;
  return summary.trim() + '.';
});

const canGenerate = computed(() => {
  return (hookWho.value && hookWhat.value) || audienceChallenges.value.trim().length > 10;
});

const hasHookData = computed(() => {
  return !!(hookWho.value || hookWhat.value || hookWhen.value || hookHow.value);
});

const hasOffers = computed(() => {
  return Object.values(tierOffers.value).some(offers => offers.length > 0) ||
         Object.keys(lockedOffers.value).length > 0;
});

const currentTierOffers = computed(() => {
  return tierOffers.value[activeTier.value] || [];
});

const currentTierOffersText = computed(() => {
  return currentTierOffers.value.map((offer, i) =>
    `${i + 1}. ${offer.title}\n${offer.description}`
  ).join('\n\n');
});

const lockedCount = computed(() => {
  return Object.keys(lockedOffers.value).length;
});

// Methods
function populateFromProfile(profileData) {
  if (!profileData) return;
  selectedProfileId.value = profileData.id;
  if (profileData.hook_who) hookWho.value = profileData.hook_who;
  if (profileData.hook_what) hookWhat.value = profileData.hook_what;
  if (profileData.hook_when) hookWhen.value = profileData.hook_when;
  if (profileData.hook_how) hookHow.value = profileData.hook_how;
}

function selectTier(tier) {
  activeTier.value = tier;
  selectedOfferIndex.value = null;

  // Auto-generate if empty and not locked
  if (!tierOffers.value[tier]?.length && !lockedOffers.value[tier]) {
    generateForTier(tier);
  }
}

function selectOffer(index) {
  if (selectedOfferIndex.value === index) {
    selectedOfferIndex.value = null;
  } else {
    selectedOfferIndex.value = index;
  }
}

const handleGenerate = async () => {
  await generateForTier('core-offer');
  emit('generated', { offers: tierOffers.value });
  return { offers: tierOffers.value };
};

async function generateForTier(tier) {
  if (generatingTier.value || lockedOffers.value[tier]) return;

  generatingTier.value = tier;
  activeTier.value = tier;
  selectedOfferIndex.value = null;

  try {
    const result = await generateTierApi({
      tier,
      tierConfig: { label: tierLabels[tier], priceHint: tierPriceHints[tier] },
      authorityHook: generatedHookSummary.value,
      businessType: businessType.value,
      priceRange: priceRange.value,
      deliveryMethod: deliveryMethod.value,
      audienceChallenges: audienceChallenges.value,
      count: variationCount.value
    });

    if (result && Array.isArray(result)) {
      tierOffers.value[tier] = result;
    }
  } catch (err) {
    console.error('[Conversion Generator] Generation failed:', err);
  } finally {
    generatingTier.value = null;
  }
}

async function handleRefine() {
  if (!refinementPrompt.value || generatingTier.value) return;

  generatingTier.value = activeTier.value;

  try {
    const result = await generateTierApi({
      tier: activeTier.value,
      tierConfig: { label: tierLabels[activeTier.value], priceHint: tierPriceHints[activeTier.value] },
      authorityHook: generatedHookSummary.value,
      businessType: businessType.value,
      priceRange: priceRange.value,
      deliveryMethod: deliveryMethod.value,
      audienceChallenges: audienceChallenges.value,
      count: variationCount.value,
      refinement: refinementPrompt.value,
      previousOffers: currentTierOffers.value
    });

    if (result && Array.isArray(result)) {
      tierOffers.value[activeTier.value] = result;
    }
    refinementPrompt.value = '';
    selectedOfferIndex.value = null;
  } catch (err) {
    console.error('[Conversion Generator] Refinement failed:', err);
  } finally {
    generatingTier.value = null;
  }
}

function handleRegenerate() {
  if (generatingTier.value || lockedOffers.value[activeTier.value]) return;
  generateForTier(activeTier.value);
}

function lockSelectedOffer() {
  if (selectedOfferIndex.value === null) return;
  const offer = currentTierOffers.value[selectedOfferIndex.value];
  lockedOffers.value[activeTier.value] = { ...offer };
  tierOffers.value[activeTier.value] = [];
  selectedOfferIndex.value = null;

  // Auto-advance to next unlocked tier
  const tierIds = ['lead-magnet', 'core-offer', 'high-ticket'];
  const nextTier = tierIds.find(t => !lockedOffers.value[t] && t !== activeTier.value);
  if (nextTier) {
    selectTier(nextTier);
  }
}

function unlockTier(tier) {
  delete lockedOffers.value[tier];
  generateForTier(tier);
}

function handleCopy() {
  let textToCopy;
  if (selectedOfferIndex.value !== null) {
    const offer = currentTierOffers.value[selectedOfferIndex.value];
    textToCopy = `${offer.title}\n\n${offer.description}\n\nInvestment: ${offer.investment || tierPriceHints[activeTier.value]}\nDuration: ${offer.duration || 'Varies'}\nDelivery: ${offer.delivery || deliveryLabels[deliveryMethod.value]}`;
  } else {
    textToCopy = currentTierOffers.value.map((offer, i) =>
      `${i + 1}. ${offer.title}\n${offer.description}`
    ).join('\n\n');
  }

  navigator.clipboard.writeText(textToCopy).catch(err => {
    console.error('[Conversion Generator] Failed to copy:', err);
  });
}

function handleApply() {
  emit('applied', {
    componentId: props.componentId,
    offers: lockedOffers.value
  });
}

async function handleSaveToProfile() {
  if (lockedCount.value === 0) return;
  if (!selectedProfileId.value) {
    localSaveError.value = 'Please select a profile first';
    return;
  }

  localIsSaving.value = true;
  localSaveError.value = null;

  try {
    const saveData = {
      offer_free: lockedOffers.value['lead-magnet']?.title || '',
      offer_free_description: lockedOffers.value['lead-magnet']?.description || '',
      offer_1: lockedOffers.value['core-offer']?.title || '',
      offer_1_description: lockedOffers.value['core-offer']?.description || '',
      offer_2: lockedOffers.value['high-ticket']?.title || '',
      offer_2_description: lockedOffers.value['high-ticket']?.description || ''
    };

    // Include authority hook if checkbox is checked
    if (saveAuthorityHook.value && hasHookData.value) {
      saveData.hook_who = hookWho.value;
      saveData.hook_what = hookWhat.value;
      saveData.hook_when = hookWhen.value;
      saveData.hook_how = hookHow.value;
    }

    const result = await saveToProfile('conversion_offers', saveData, {
      profileId: selectedProfileId.value
    });

    if (result.success) {
      saveSuccess.value = true;
      setTimeout(() => { saveSuccess.value = false; }, 3000);
      emit('saved', {
        profileId: selectedProfileId.value,
        offers: lockedOffers.value,
        hookSaved: saveAuthorityHook.value && hasHookData.value
      });
    } else {
      localSaveError.value = result.errors?.join(', ') || 'Failed to save';
    }
  } catch (err) {
    console.error('[Conversion Generator] Save failed:', err);
    localSaveError.value = err.message || 'Failed to save to profile';
  } finally {
    localIsSaving.value = false;
  }
}

function handleStartOver() {
  reset();
  tierOffers.value = {
    'lead-magnet': [],
    'core-offer': [],
    'high-ticket': []
  };
  lockedOffers.value = {};
  activeTier.value = 'core-offer';
  selectedOfferIndex.value = null;
  refinementPrompt.value = '';
}

// Watch for profile data changes
watch(
  [() => props.profileData, injectedProfileData],
  ([propsData, injected]) => {
    const data = propsData || injected;
    if (data) populateFromProfile(data);
  },
  { immediate: true }
);

// Watch for canGenerate changes
watch(canGenerate, (newValue) => {
  emit('update:can-generate', !!newValue);
}, { immediate: true });

// Expose for parent component
defineExpose({
  handleGenerate,
  tierOffers,
  lockedOffers,
  hasOffers,
  isGenerating,
  error
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

.generator__field-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: var(--mkcg-space-md, 20px);
}

@media (max-width: 600px) {
  .generator__field-row {
    grid-template-columns: 1fr;
  }
}

.generator__preview {
  margin-top: var(--mkcg-space-md, 20px);
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-primary-light, #e8f4fd);
  border-radius: var(--mkcg-radius, 8px);
  border: 1px solid var(--mkcg-primary-border, #b8daef);
  font-size: var(--mkcg-font-size-base, 16px);
  line-height: 1.5;
  color: var(--mkcg-primary-dark, #1a6fa8);
  font-style: italic;
  text-align: center;
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

/* Conversion Generator Results */
.conversion-generator__results {
  padding: var(--mkcg-space-md, 20px);
}

.conversion-generator__header {
  margin-bottom: var(--mkcg-space-md, 20px);
}

.conversion-generator__header h3 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.conversion-generator__header p {
  margin: 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
  font-size: var(--mkcg-font-size-sm, 14px);
}

/* Tier Tabs */
.conversion-generator__tabs {
  display: flex;
  gap: var(--mkcg-space-xs, 8px);
  margin-bottom: var(--mkcg-space-md, 20px);
  border-bottom: 1px solid var(--mkcg-border-light, #e9ecef);
  padding-bottom: var(--mkcg-space-sm, 12px);
}

.conversion-generator__tab {
  display: flex;
  align-items: center;
  gap: var(--mkcg-space-xs, 8px);
  padding: var(--mkcg-space-sm, 12px) var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-secondary, #f8f9fa);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  cursor: pointer;
  font-family: inherit;
  font-size: var(--mkcg-font-size-sm, 14px);
  font-weight: var(--mkcg-font-weight-medium, 500);
  color: var(--mkcg-text-secondary, #5a6d7e);
  transition: all 0.15s ease;
}

.conversion-generator__tab:hover {
  border-color: var(--mkcg-primary, #1a9bdc);
}

.conversion-generator__tab--active {
  background: var(--mkcg-primary-light, #e8f4fd);
  border-color: var(--mkcg-primary, #1a9bdc);
  color: var(--mkcg-primary, #1a9bdc);
}

.conversion-generator__tab--locked {
  background: var(--mkcg-primary-light, #e8f4fd);
  border-color: var(--mkcg-primary, #1a9bdc);
}

.conversion-generator__tab--locked .conversion-generator__tab-status {
  color: var(--mkcg-primary, #1a9bdc);
}

.conversion-generator__tab-label {
  white-space: nowrap;
}

.conversion-generator__tab-status {
  display: flex;
  align-items: center;
  color: var(--mkcg-text-muted, #94a3b8);
}

.conversion-generator__tab-count {
  font-size: 12px;
}

.conversion-generator__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Progress */
.conversion-generator__progress {
  margin-bottom: var(--mkcg-space-md, 20px);
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-primary, #1a9bdc);
  font-weight: var(--mkcg-font-weight-medium, 500);
}

/* Refinement */
.conversion-generator__refinement {
  background: var(--mkcg-bg-secondary, #f8f9fa);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  padding: var(--mkcg-space-md, 20px);
  margin-bottom: var(--mkcg-space-md, 20px);
}

.conversion-generator__refinement-header {
  display: flex;
  align-items: center;
  gap: var(--mkcg-space-xs, 8px);
  margin-bottom: var(--mkcg-space-sm, 12px);
  font-size: var(--mkcg-font-size-sm, 14px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-primary, #1a9bdc);
}

.conversion-generator__refinement-input {
  display: flex;
  gap: var(--mkcg-space-xs, 8px);
}

.conversion-generator__refinement-input textarea {
  flex: 1;
  padding: var(--mkcg-space-sm, 12px);
  border: 1px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius, 8px);
  font-family: inherit;
  font-size: var(--mkcg-font-size-sm, 14px);
  resize: none;
}

.conversion-generator__refinement-input textarea:focus {
  outline: none;
  border-color: var(--mkcg-primary, #1a9bdc);
}

.conversion-generator__refinement-input button {
  padding: var(--mkcg-space-sm, 12px) var(--mkcg-space-md, 20px);
  background: var(--mkcg-primary, #1a9bdc);
  color: white;
  border: none;
  border-radius: var(--mkcg-radius, 8px);
  font-family: inherit;
  font-weight: var(--mkcg-font-weight-semibold, 600);
  cursor: pointer;
}

.conversion-generator__refinement-input button:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Selection Hint */
.conversion-generator__selection-hint {
  margin-bottom: var(--mkcg-space-sm, 12px);
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-secondary, #5a6d7e);
}

/* Offer Cards */
.conversion-generator__offers {
  display: flex;
  flex-direction: column;
  gap: var(--mkcg-space-md, 20px);
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.conversion-generator__offer {
  padding: var(--mkcg-space-md, 20px);
  background: var(--mkcg-bg-primary, #ffffff);
  border: 2px solid var(--mkcg-border-light, #e9ecef);
  border-radius: var(--mkcg-radius-lg, 12px);
  cursor: pointer;
  transition: all 0.15s ease;
}

.conversion-generator__offer:hover {
  border-color: var(--mkcg-primary, #1a9bdc);
}

.conversion-generator__offer--selected {
  border-color: var(--mkcg-primary, #1a9bdc);
  background: var(--mkcg-primary-light, #e8f4fd);
}

.conversion-generator__offer-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: var(--mkcg-space-sm, 12px);
}

.conversion-generator__offer-number {
  width: 28px;
  height: 28px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: var(--mkcg-bg-secondary, #f8f9fa);
  border-radius: 50%;
  font-size: var(--mkcg-font-size-sm, 14px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.conversion-generator__offer--selected .conversion-generator__offer-number {
  background: var(--mkcg-primary, #1a9bdc);
  color: white;
}

.conversion-generator__offer-check {
  width: 22px;
  height: 22px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid var(--mkcg-border-light, #e9ecef);
  border-radius: 4px;
  background: white;
}

.conversion-generator__offer--selected .conversion-generator__offer-check {
  background: var(--mkcg-primary, #1a9bdc);
  border-color: var(--mkcg-primary, #1a9bdc);
  color: white;
}

.conversion-generator__offer-title {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-base, 16px);
  font-weight: var(--mkcg-font-weight-semibold, 600);
  color: var(--mkcg-text-primary, #2c3e50);
}

.conversion-generator__offer-desc {
  margin: 0 0 var(--mkcg-space-md, 20px) 0;
  font-size: var(--mkcg-font-size-sm, 14px);
  line-height: 1.5;
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.conversion-generator__offer-meta {
  display: flex;
  gap: var(--mkcg-space-lg, 30px);
  padding: var(--mkcg-space-sm, 12px);
  background: var(--mkcg-bg-secondary, #f8f9fa);
  border-radius: var(--mkcg-radius, 8px);
}

.conversion-generator__offer-meta-item {
  font-size: 12px;
  color: var(--mkcg-text-muted, #94a3b8);
  text-transform: uppercase;
}

.conversion-generator__offer-meta-item strong {
  display: block;
  font-size: var(--mkcg-font-size-sm, 14px);
  color: var(--mkcg-text-primary, #2c3e50);
  text-transform: none;
  margin-top: 2px;
}

/* Empty, Locked, Generating States */
.conversion-generator__empty,
.conversion-generator__locked,
.conversion-generator__generating {
  text-align: center;
  padding: var(--mkcg-space-xl, 40px);
  background: var(--mkcg-bg-secondary, #f8f9fa);
  border-radius: var(--mkcg-radius-lg, 12px);
  margin-bottom: var(--mkcg-space-lg, 30px);
}

.conversion-generator__empty svg,
.conversion-generator__locked svg {
  color: var(--mkcg-text-muted, #94a3b8);
  margin-bottom: var(--mkcg-space-md, 20px);
}

.conversion-generator__empty p,
.conversion-generator__generating p {
  color: var(--mkcg-text-secondary, #5a6d7e);
  margin: 0 0 var(--mkcg-space-md, 20px) 0;
}

.conversion-generator__locked-badge {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 12px;
  background: var(--mkcg-primary-light, #e8f4fd);
  color: var(--mkcg-primary, #1a9bdc);
  font-size: 12px;
  font-weight: 600;
  text-transform: uppercase;
  border-radius: 20px;
  margin-bottom: var(--mkcg-space-md, 20px);
}

.conversion-generator__locked h4 {
  margin: 0 0 var(--mkcg-space-xs, 8px) 0;
  font-size: var(--mkcg-font-size-lg, 18px);
  color: var(--mkcg-text-primary, #2c3e50);
}

.conversion-generator__locked p {
  margin: 0 0 var(--mkcg-space-md, 20px) 0;
  color: var(--mkcg-text-secondary, #5a6d7e);
}

.conversion-generator__spinner-large {
  width: 40px;
  height: 40px;
  border: 3px solid var(--mkcg-border-light, #e9ecef);
  border-top-color: var(--mkcg-primary, #1a9bdc);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
  margin: 0 auto var(--mkcg-space-md, 20px);
}

/* Actions */
.conversion-generator__actions {
  display: flex;
  flex-direction: column;
  gap: var(--mkcg-space-md, 20px);
  padding-top: var(--mkcg-space-md, 20px);
  border-top: 1px solid var(--mkcg-border-light, #e9ecef);
}

.conversion-generator__actions-row {
  display: flex;
  gap: var(--mkcg-space-sm, 12px);
}

.conversion-generator__lock-action {
  text-align: center;
}

.conversion-generator__checkbox {
  display: flex;
  align-items: center;
  gap: var(--mkcg-space-xs, 8px);
  cursor: pointer;
  user-select: none;
}

.conversion-generator__checkbox input {
  position: absolute;
  opacity: 0;
  width: 0;
  height: 0;
}

.conversion-generator__checkbox-box {
  flex-shrink: 0;
  width: 18px;
  height: 18px;
  border: 2px solid var(--mkcg-border-light, #e9ecef);
  border-radius: 4px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  transition: all 0.15s ease;
}

.conversion-generator__checkbox input:checked + .conversion-generator__checkbox-box {
  background: var(--mkcg-primary, #1a9bdc);
  border-color: var(--mkcg-primary, #1a9bdc);
  color: white;
}

.conversion-generator__save-row {
  display: flex;
  align-items: center;
  gap: var(--mkcg-space-sm, 12px);
  flex-wrap: wrap;
}

.conversion-generator__success {
  color: #10b981;
  font-size: var(--mkcg-font-size-sm, 14px);
  font-weight: 500;
}

.conversion-generator__error-msg {
  color: #ef4444;
  font-size: var(--mkcg-font-size-sm, 14px);
}

/* Integrated Mode Styles */
.gmkb-ai-offers__tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 16px;
  flex-wrap: wrap;
}

.gmkb-ai-offers__tab {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  background: var(--gmkb-ai-bg-secondary, #f8fafc);
  border: 1px solid var(--gmkb-ai-border, #e2e8f0);
  border-radius: 6px;
  font-size: 13px;
  font-family: inherit;
  cursor: pointer;
  transition: all 0.15s;
}

.gmkb-ai-offers__tab:hover {
  border-color: var(--gmkb-ai-primary, #3b82f6);
}

.gmkb-ai-offers__tab--active {
  background: var(--gmkb-ai-primary-light, #eff6ff);
  border-color: var(--gmkb-ai-primary, #3b82f6);
  color: var(--gmkb-ai-primary, #3b82f6);
}

.gmkb-ai-offers__content {
  margin-top: 12px;
}

.gmkb-ai-offers__locked {
  padding: 16px;
  background: var(--gmkb-ai-bg-tertiary, #f3f4f6);
  border-radius: 8px;
}

.gmkb-ai-offers__locked strong {
  display: block;
  margin-bottom: 8px;
}

.gmkb-ai-offers__locked p {
  margin: 0;
  color: var(--gmkb-ai-text-secondary, #64748b);
  font-size: 14px;
}

/* Embedded Mode Styles */
.gmkb-embedded-form {
  width: 100%;
}

.gmkb-embedded-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.gmkb-embedded-field {
  display: flex;
  flex-direction: column;
}

.gmkb-embedded-label {
  display: block;
  font-weight: 600;
  font-size: 13px;
  margin-bottom: 8px;
  color: var(--mkcg-text-primary, #0f172a);
}

.gmkb-embedded-input {
  width: 100%;
  padding: 14px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  box-sizing: border-box;
  font-size: 15px;
  font-family: inherit;
  transition: border-color 0.2s, box-shadow 0.2s;
}

.gmkb-embedded-input:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

.gmkb-embedded-input::placeholder {
  color: var(--mkcg-text-light, #94a3b8);
}

.gmkb-embedded-textarea {
  resize: vertical;
  min-height: 60px;
}

.gmkb-embedded-error {
  margin-top: 16px;
  padding: 12px 16px;
  background: #fef2f2;
  border: 1px solid #fecaca;
  border-radius: 8px;
  color: #991b1b;
  font-size: 14px;
}
</style>
