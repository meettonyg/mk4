<template>
  <div class="gmkb-tool-embed">
    <!-- Profile Context Banner (logged-in users) -->
    <ProfileContextBanner
      v-if="isLoggedIn"
      @profile-loaded="handleProfileLoaded"
      @profile-cleared="handleProfileCleared"
    />

    <!-- Intent Tabs -->
    <div v-if="intents && intents.length > 0" class="gmkb-intent-tabs" role="tablist">
      <button
        v-for="intent in intents"
        :key="intent.id"
        class="gmkb-intent-tab"
        :class="{ active: currentIntentId === intent.id }"
        role="tab"
        :aria-selected="currentIntentId === intent.id"
        @click="selectIntent(intent.id)"
      >
        {{ intent.label }}
      </button>
    </div>

    <!-- Tool Stage (2-column layout) -->
    <div class="gmkb-tool-stage" :class="{ 'has-generated': hasGenerated }">
      <!-- Left: Context & Form -->
      <div class="tool-context">
        <!-- Dynamic Context Header -->
        <h3 class="tool-context__heading">{{ currentIntent?.contextHeading || defaultHeading }}</h3>
        <p class="tool-context__description">{{ currentIntent?.contextDescription || defaultDescription }}</p>

        <!-- Generator Form Slot -->
        <div class="tool-context__form">
          <slot
            name="form"
            :intent="currentIntent"
            :placeholders="currentIntent?.formPlaceholders || {}"
            :labels="currentIntent?.formLabels || {}"
            :profileData="profileData"
            :hasSelectedProfile="hasSelectedProfile"
          ></slot>
        </div>

        <!-- Generate Action -->
        <div class="tool-context__actions">
          <button
            class="gmkb-btn-generate"
            type="button"
            :disabled="isGenerating || !canGenerate"
            @click="handleGenerate"
          >
            <span v-if="!isGenerating" class="gmkb-btn-icon">✨</span>
            <span v-if="isGenerating" class="gmkb-btn-spinner"></span>
            {{ isGenerating ? generatingText : generateButtonText }}
          </button>
        </div>

        <!-- Rate Limit / Progressive Friction (guests only) -->
        <p v-if="!isLoggedIn" class="tool-context__limit-text">
          <span v-if="generationCount < 3">
            {{ remainingGenerations }} free generation{{ remainingGenerations !== 1 ? 's' : '' }} remaining today.
          </span>
          <span v-else class="limit-reached">
            ⚡ Daily limit reached.
          </span>
          <br />
          <strong>{{ upgradeText }}</strong>
        </p>
        <!-- Logged-in users get unlimited -->
        <p v-else class="tool-context__limit-text tool-context__limit-text--unlimited">
          <span>✓ Unlimited generations with your account</span>
        </p>
      </div>

      <!-- Right: Preview Area -->
      <div class="tool-preview-area">
        <!-- Default Preview Card (before generation) -->
        <div v-if="!hasGenerated" class="preview-card">
          <div class="preview-label">{{ previewLabel }}</div>
          <div class="preview-content">
            <slot name="preview">
              <p class="preview-hook">
                {{ previewContent || defaultPreviewContent }}
              </p>
            </slot>
          </div>
          <p v-if="showSaveCta" class="preview-subtext">
            {{ saveCtaPrefix }}
            <a href="#" @click.prevent="handleSaveClick">{{ saveCtaLink }}</a>
            {{ saveCtaSuffix }}
          </p>
        </div>

        <!-- POST-GENERATION SUCCESS PANEL -->
        <div v-else class="success-panel">
          <!-- Generated Content -->
          <div class="success-panel__result">
            <div class="success-label">
              <span class="success-icon">✓</span>
              Your Authority Hook
            </div>
            <div class="success-content">
              <slot name="preview">
                <p class="preview-hook" v-html="previewContent || defaultPreviewContent"></p>
              </slot>
            </div>

            <!-- Quick Actions -->
            <div class="success-actions">
              <button class="btn-copy" @click="copyToClipboard" :class="{ copied: justCopied }">
                {{ justCopied ? '✓ Copied!' : '📋 Copy' }}
              </button>
              <button class="btn-regenerate" @click="handleRegenerate">
                🔄 Regenerate
              </button>
            </div>
          </div>

          <!-- EXPANSION PANEL: What's Next -->
          <div class="expansion-panel">
            <div class="expansion-header">
              <span class="expansion-icon">🚀</span>
              <span class="expansion-title">Make It Work Harder</span>
            </div>

            <!-- Related Tools -->
            <div class="related-tools">
              <a
                v-for="tool in relatedTools"
                :key="tool.slug"
                :href="tool.requiresAccount ? '#' : tool.url"
                class="related-tool-card"
                :class="{ locked: tool.requiresAccount }"
                @click="onToolClick($event, tool)"
              >
                <div class="tool-card-icon">{{ tool.icon }}</div>
                <div class="tool-card-content">
                  <div class="tool-card-name">
                    {{ tool.name }}
                    <span v-if="tool.requiresAccount" class="lock-badge">🔓 Free</span>
                  </div>
                  <div class="tool-card-desc">{{ tool.description }}</div>
                </div>
                <div class="tool-card-arrow">→</div>
              </a>
            </div>

            <!-- Save CTA -->
            <div v-if="isLoggedIn && hasSelectedProfile" class="save-cta-box save-cta-box--profile">
              <div class="save-cta-text">
                <strong>Save to {{ selectedProfile?.title || 'your profile' }}</strong>
                <span>Updates your profile with this hook</span>
              </div>
              <button
                class="btn-save-account"
                :class="{ 'btn-save-account--saving': isSavingToProfile, 'btn-save-account--saved': savedToProfile }"
                @click="handleSaveToProfile"
                :disabled="isSavingToProfile"
              >
                {{ savedToProfile ? '✓ Saved!' : (isSavingToProfile ? 'Saving...' : 'Save to Profile') }}
              </button>
            </div>
            <div v-else-if="isLoggedIn && !hasSelectedProfile" class="save-cta-box save-cta-box--select">
              <div class="save-cta-text">
                <strong>Select a profile above</strong>
                <span>to save this hook to your account</span>
              </div>
            </div>
            <div v-else class="save-cta-box">
              <div class="save-cta-text">
                <strong>Keep this hook forever</strong>
                <span>+ unlock your full messaging suite</span>
              </div>
              <button class="btn-save-account" @click="handleSaveClick">
                Save with Free Account
              </button>
            </div>
          </div>

          <!-- Social Proof (shown after generation) -->
          <div v-if="testimonial" class="post-gen-proof">
            <div class="proof-stars">★★★★★</div>
            <p class="proof-quote">"{{ testimonial.quote }}"</p>
            <p class="proof-author">— {{ testimonial.author }}, {{ testimonial.role }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- SOFT GATE MODAL (Exit Intent or Engagement Trigger) -->
    <div v-if="showSoftGate" class="soft-gate-overlay" @click.self="handleOverlayClick">
      <div class="soft-gate-modal">
        <!-- Close button appears after delay -->
        <button
          v-if="canCloseGate"
          class="soft-gate-close"
          @click="closeSoftGate"
        >×</button>

        <!-- Email Capture Mode -->
        <template v-if="!emailSubmitted">
          <div class="soft-gate-icon">{{ gateReason === 'exit_intent' ? '👋' : '🎉' }}</div>
          <h3 class="soft-gate-title">
            {{ gateReason === 'exit_intent' ? "Don't lose your hook!" : "You're on a roll!" }}
          </h3>
          <p class="soft-gate-text">
            {{ gateReason === 'exit_intent'
              ? "Enter your email and we'll send you your hook + 3 bonus tools:"
              : "Enter your email to save your hook and unlock:"
            }}
          </p>

          <div class="email-capture-form">
            <input
              v-model="captureEmail"
              type="email"
              class="email-input"
              placeholder="you@example.com"
              @keyup.enter="handleEmailSubmit"
            />
            <button class="btn-gate-primary" @click="handleEmailSubmit" :disabled="!isValidEmail">
              {{ gateReason === 'exit_intent' ? 'Send My Hook' : 'Save & Unlock' }}
            </button>
          </div>

          <ul class="soft-gate-benefits">
            <li>✓ Your hook saved forever</li>
            <li>✓ Bio Generator (free)</li>
            <li>✓ Elevator Pitch (free)</li>
            <li>✓ Tagline Generator (free)</li>
          </ul>

          <button v-if="canCloseGate" class="btn-gate-secondary" @click="closeSoftGate">
            {{ gateReason === 'exit_intent' ? 'No thanks, let it disappear' : `Continue as Guest (${remainingGenerations} left)` }}
          </button>
        </template>

        <!-- Success State -->
        <template v-else>
          <div class="soft-gate-icon">✅</div>
          <h3 class="soft-gate-title">Check your inbox!</h3>
          <p class="soft-gate-text">
            We've sent your hook to {{ captureEmail }}
          </p>
          <button class="btn-gate-primary" @click="handleGateSignup">
            Create Account to Edit & Save More
          </button>
          <button class="btn-gate-secondary" @click="closeSoftGate">
            Continue browsing
          </button>
        </template>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import ProfileContextBanner from './ProfileContextBanner.vue';
import { useStandaloneProfile } from '../../src/composables/useStandaloneProfile';

// Profile management for logged-in users
const {
  isLoggedIn: profileIsLoggedIn,
  profileData,
  hasSelectedProfile,
  selectedProfile,
  getAuthorityHookData,
  saveMultipleToProfile
} = useStandaloneProfile();

const props = defineProps({
  intents: {
    type: Array,
    default: () => []
  },
  defaultHeading: {
    type: String,
    default: 'Create your hook'
  },
  defaultDescription: {
    type: String,
    default: 'Fill in the fields below to generate your hook.'
  },
  isGenerating: {
    type: Boolean,
    default: false
  },
  canGenerate: {
    type: Boolean,
    default: true
  },
  generateButtonText: {
    type: String,
    default: 'Generate Authority Hook'
  },
  generatingText: {
    type: String,
    default: 'Generating...'
  },
  rateLimitText: {
    type: String,
    default: 'Generate up to 3 hooks per day, no signup required.'
  },
  upgradeText: {
    type: String,
    default: 'Create a free account for unlimited generations.'
  },
  previewLabel: {
    type: String,
    default: 'Sample Authority Hook'
  },
  previewContent: {
    type: String,
    default: ''
  },
  defaultPreviewContent: {
    type: String,
    default: '"I help [WHO] achieve [WHAT] in [TIMEFRAME] without [PAIN POINT]."'
  },
  showSaveCta: {
    type: Boolean,
    default: true
  },
  saveCtaPrefix: {
    type: String,
    default: 'Happy with this hook?'
  },
  saveCtaLink: {
    type: String,
    default: 'Save it to your profile'
  },
  saveCtaSuffix: {
    type: String,
    default: 'with a free Guestify account.'
  },
  /**
   * Testimonial object for social proof
   */
  testimonial: {
    type: Object,
    default: null
  },
  /**
   * Related tools for expansion panel
   * Array of { slug, name, description, icon, url, requiresAccount }
   */
  relatedTools: {
    type: Array,
    default: () => [
      {
        slug: 'biography',
        name: 'Biography Generator',
        description: 'Turn your hook into a full professional bio',
        icon: '📝',
        url: '/tools/biography/',
        requiresAccount: false
      },
      {
        slug: 'elevator-pitch',
        name: 'Elevator Pitch',
        description: 'Expand your hook into a 30-second pitch',
        icon: '🎯',
        url: '/tools/elevator-pitch/',
        requiresAccount: false
      },
      {
        slug: 'podcast-pitch',
        name: 'Podcast Pitch Template',
        description: 'Use your hook to pitch podcast hosts',
        icon: '🎙️',
        url: '/tools/podcast-pitch/',
        requiresAccount: true
      }
    ]
  },
  /**
   * Tool slug for storage keys
   */
  toolSlug: {
    type: String,
    default: 'authority-hook'
  },
  /**
   * Whether user is logged in
   */
  isLoggedIn: {
    type: Boolean,
    default: false
  },
  /**
   * Registration URL
   */
  registerUrl: {
    type: String,
    default: '/register/'
  }
});

const emit = defineEmits(['generate', 'save-click', 'intent-change', 'gate-shown', 'gate-signup', 'profile-loaded', 'profile-cleared', 'profile-saved']);

// State
const currentIntentId = ref(props.intents?.[0]?.id || null);
const hasGenerated = ref(false);
const generationCount = ref(0);
const showSoftGate = ref(false);
const justCopied = ref(false);

// Gate state
const gateReason = ref(''); // 'exit_intent' | 'engagement_prompt' | 'limit_reached'
const canCloseGate = ref(false);
const captureEmail = ref('');
const emailSubmitted = ref(false);
const exitIntentShown = ref(false);

// Profile state (logged-in users)
const isSavingToProfile = ref(false);
const savedToProfile = ref(false);

// Storage key for generation tracking
const storageKey = computed(() => `gmkb_gen_count_${props.toolSlug}`);
const storageDateKey = computed(() => `gmkb_gen_date_${props.toolSlug}`);

// Computed
const currentIntent = computed(() => {
  if (!currentIntentId.value || !props.intents) return null;
  return props.intents.find(i => i.id === currentIntentId.value) || null;
});

const remainingGenerations = computed(() => {
  return Math.max(0, 3 - generationCount.value);
});

// Email validation
const isValidEmail = computed(() => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(captureEmail.value);
});

// Load generation count from localStorage
onMounted(() => {
  loadGenerationCount();
  setupExitIntent();
});

// Exit intent detection
function setupExitIntent() {
  // Only for non-logged-in users
  if (props.isLoggedIn) return;

  const handleMouseLeave = (e) => {
    // Check if mouse left through the top of the viewport (exit intent)
    if (e.clientY <= 0 && hasGenerated.value && !exitIntentShown.value && !showSoftGate.value) {
      exitIntentShown.value = true;
      showGateWithReason('exit_intent');
    }
  };

  document.addEventListener('mouseleave', handleMouseLeave);

  // Cleanup on unmount (Vue 3 composition API handles this automatically)
}

function showGateWithReason(reason) {
  gateReason.value = reason;
  showSoftGate.value = true;
  canCloseGate.value = false;
  emailSubmitted.value = false;
  captureEmail.value = '';
  emit('gate-shown', { reason });

  // Enable close button after 2 seconds
  setTimeout(() => {
    canCloseGate.value = true;
  }, 2000);
}

function loadGenerationCount() {
  try {
    const storedDate = localStorage.getItem(storageDateKey.value);
    const today = new Date().toDateString();

    if (storedDate === today) {
      generationCount.value = parseInt(localStorage.getItem(storageKey.value) || '0', 10);
    } else {
      // Reset for new day
      localStorage.setItem(storageDateKey.value, today);
      localStorage.setItem(storageKey.value, '0');
      generationCount.value = 0;
    }
  } catch (e) {
    // localStorage not available
    generationCount.value = 0;
  }
}

function incrementGenerationCount() {
  generationCount.value++;
  try {
    localStorage.setItem(storageKey.value, generationCount.value.toString());
    localStorage.setItem(storageDateKey.value, new Date().toDateString());
  } catch (e) {
    // localStorage not available
  }
}

function selectIntent(intentId) {
  currentIntentId.value = intentId;
  emit('intent-change', currentIntent.value);
}

function handleGenerate() {
  // Check if logged in user - no limits
  if (props.isLoggedIn) {
    emit('generate');
    return;
  }

  // Check generation limit
  if (generationCount.value >= 3) {
    showGateWithReason('limit_reached');
    return;
  }

  // Emit generate event - hasGenerated will be set by the watcher when complete
  emit('generate');
  incrementGenerationCount();

  // Show soft gate after 2nd generation (before they hit limit)
  // But NOT if exit intent already shown
  if (generationCount.value === 2 && !props.isLoggedIn && !exitIntentShown.value) {
    setTimeout(() => {
      if (!showSoftGate.value) {
        showGateWithReason('engagement_prompt');
      }
    }, 3000); // Show after generation completes
  }
}

function handleRegenerate() {
  hasGenerated.value = false;
}

function handleSaveClick() {
  if (props.isLoggedIn) {
    emit('save-click');
  } else {
    // Redirect to registration
    const redirectUrl = encodeURIComponent(window.location.href);
    window.location.href = `${props.registerUrl}?redirect=${redirectUrl}&source=tool_save&tool=${props.toolSlug}`;
  }
}

function onToolClick(event, tool) {
  // Only intercept if tool requires account
  if (tool.requiresAccount) {
    event.preventDefault();
    if (!props.isLoggedIn) {
      const redirectUrl = encodeURIComponent(tool.url);
      window.location.href = `${props.registerUrl}?redirect=${redirectUrl}&source=related_tool&tool=${tool.slug}`;
    }
  }
  // If doesn't require account, let the default link behavior work
}

function handleGateSignup() {
  const redirectUrl = encodeURIComponent(window.location.href);
  window.location.href = `${props.registerUrl}?redirect=${redirectUrl}&source=soft_gate&tool=${props.toolSlug}`;
  emit('gate-signup');
}

function closeSoftGate() {
  showSoftGate.value = false;
  // Reset state for next time
  setTimeout(() => {
    emailSubmitted.value = false;
    captureEmail.value = '';
  }, 300);
}

function handleOverlayClick() {
  // Only allow closing by overlay click if close button is visible
  if (canCloseGate.value) {
    closeSoftGate();
  }
}

async function handleEmailSubmit() {
  if (!isValidEmail.value) return;

  try {
    // Send email capture to backend
    const response = await fetch('/wp-json/gmkb/v1/capture-email', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        email: captureEmail.value,
        tool: props.toolSlug,
        source: gateReason.value,
        hook: props.previewContent || '',
      }),
    });

    // Show success regardless of response (graceful degradation)
    emailSubmitted.value = true;

    // Track the email capture
    emit('gate-shown', {
      reason: 'email_captured',
      email: captureEmail.value,
    });

  } catch (e) {
    // Still show success - we'll capture on the registration page
    emailSubmitted.value = true;
    console.warn('[GMKBSeoTools] Email capture failed, will capture on registration');
  }
}

async function copyToClipboard() {
  try {
    // Get text content from preview
    const text = props.previewContent || props.defaultPreviewContent;
    // Strip HTML tags for clipboard
    const plainText = text.replace(/<[^>]*>/g, '');
    await navigator.clipboard.writeText(plainText);
    justCopied.value = true;
    setTimeout(() => {
      justCopied.value = false;
    }, 2000);
  } catch (e) {
    console.error('Failed to copy:', e);
  }
}

// Profile handlers (logged-in users)
function handleProfileLoaded(data) {
  emit('profile-loaded', data);
  // Reset saved state when profile changes
  savedToProfile.value = false;
}

function handleProfileCleared() {
  emit('profile-cleared');
  savedToProfile.value = false;
}

async function handleSaveToProfile() {
  if (!hasSelectedProfile.value || isSavingToProfile.value) return;

  isSavingToProfile.value = true;
  savedToProfile.value = false;

  try {
    // Extract hook content from previewContent
    // The parent component should emit the structured data, but we can save the raw hook too
    const hookContent = props.previewContent || '';

    // Save authority hook fields to profile
    // For now we save the combined hook - parent can override with structured data
    const success = await saveMultipleToProfile({
      authority_hook: hookContent.replace(/<[^>]*>/g, ''), // Strip HTML
    });

    if (success) {
      savedToProfile.value = true;
      emit('profile-saved', { hook: hookContent });

      // Reset saved indicator after 3 seconds
      setTimeout(() => {
        savedToProfile.value = false;
      }, 3000);
    }
  } catch (e) {
    console.error('[GMKBSeoTools] Failed to save to profile:', e);
  } finally {
    isSavingToProfile.value = false;
  }
}

// Watch for intents prop changes
watch(() => props.intents, (newIntents) => {
  if (newIntents?.length && !currentIntentId.value) {
    currentIntentId.value = newIntents[0].id;
  }
}, { immediate: true });

// Watch for generation completion (when isGenerating goes from true to false)
watch(() => props.isGenerating, (newVal, oldVal) => {
  if (oldVal === true && newVal === false && props.previewContent) {
    hasGenerated.value = true;
  }
});
</script>

<style scoped>
/* Tool Embed Container */
.gmkb-tool-embed {
  background: white;
  border-radius: 16px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  overflow: hidden;
  text-align: left;
  max-width: 960px;
  margin: 0 auto;
  box-shadow: 0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1);
}

/* Intent Tabs */
.gmkb-intent-tabs {
  display: flex;
  background: var(--mkcg-bg-secondary, #f9fafb);
  border-bottom: 1px solid var(--mkcg-border, #e2e8f0);
}

.gmkb-intent-tab {
  flex: 1;
  padding: 20px;
  text-align: center;
  background: transparent;
  border: none;
  border-right: 1px solid var(--mkcg-border, #e2e8f0);
  cursor: pointer;
  font-weight: 700;
  color: var(--mkcg-text-secondary, #64748b);
  transition: all 0.2s;
  font-size: 15px;
  font-family: inherit;
}

.gmkb-intent-tab:last-child {
  border-right: none;
}

.gmkb-intent-tab:hover {
  background: #f1f5f9;
}

.gmkb-intent-tab.active {
  background: white;
  color: var(--mkcg-primary, #3b82f6);
  border-bottom: 3px solid var(--mkcg-primary, #3b82f6);
  position: relative;
}

/* Tool Stage (2-column) */
.gmkb-tool-stage {
  display: grid;
  grid-template-columns: 1.2fr 0.8fr;
  min-height: 450px;
}

.gmkb-tool-stage.has-generated {
  grid-template-columns: 0.8fr 1.2fr;
}

/* Left Column: Context & Form */
.tool-context {
  padding: 40px;
  border-right: 1px solid var(--mkcg-border, #e2e8f0);
}

.tool-context__heading {
  font-size: 26px;
  font-weight: 800;
  margin: 0 0 12px;
  color: var(--mkcg-text-primary, #0f172a);
  line-height: 1.2;
}

.tool-context__description {
  font-size: 16px;
  color: var(--mkcg-text-secondary, #64748b);
  margin: 0 0 32px;
  line-height: 1.5;
}

.tool-context__form {
  margin-bottom: 20px;
}

.tool-context__actions {
  margin-top: 10px;
}

/* Generate Button */
.gmkb-btn-generate {
  width: 100%;
  padding: 16px;
  background: var(--mkcg-primary, #3b82f6);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  transition: background 0.2s;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  font-family: inherit;
}

.gmkb-btn-generate:hover:not(:disabled) {
  background: var(--mkcg-primary-hover, #2563eb);
}

.gmkb-btn-generate:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.gmkb-btn-icon {
  font-size: 18px;
}

.gmkb-btn-spinner {
  width: 18px;
  height: 18px;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-top-color: white;
  border-radius: 50%;
  animation: spin 0.8s linear infinite;
}

@keyframes spin {
  to { transform: rotate(360deg); }
}

/* Rate Limit Text */
.tool-context__limit-text {
  font-size: 13px;
  color: var(--mkcg-text-secondary, #64748b);
  margin-top: 16px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  padding: 10px;
  border-radius: 6px;
  line-height: 1.5;
  text-align: center;
}

.limit-reached {
  color: #f59e0b;
  font-weight: 600;
}

/* Right Column: Preview */
.tool-preview-area {
  background: var(--mkcg-bg-secondary, #f9fafb);
  padding: 40px;
  display: flex;
  align-items: flex-start;
  justify-content: center;
  border-left: 1px solid white;
  overflow-y: auto;
}

.preview-card {
  background: white;
  padding: 32px;
  border-radius: 12px;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  width: 100%;
  box-sizing: border-box;
}

.preview-label {
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: var(--mkcg-text-light, #94a3b8);
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.preview-content {
  margin-bottom: 24px;
}

.preview-hook {
  font-size: 22px;
  line-height: 1.5;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0;
  font-weight: 500;
}

.preview-hook :deep(strong) {
  color: var(--mkcg-primary, #3b82f6);
}

.preview-subtext {
  border-top: 1px dashed var(--mkcg-border, #e2e8f0);
  padding-top: 16px;
  font-size: 14px;
  color: var(--mkcg-text-secondary, #64748b);
  margin: 0;
  text-align: center;
}

.preview-subtext a {
  color: var(--mkcg-primary, #3b82f6);
  font-weight: 600;
  text-decoration: none;
}

.preview-subtext a:hover {
  text-decoration: underline;
}

/* ========================================
   SUCCESS PANEL (Post-Generation)
   ======================================== */
.success-panel {
  width: 100%;
}

.success-panel__result {
  background: white;
  padding: 24px;
  border-radius: 12px;
  border: 2px solid #22c55e;
  margin-bottom: 20px;
}

.success-label {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 12px;
  font-weight: 700;
  text-transform: uppercase;
  color: #22c55e;
  margin-bottom: 12px;
  letter-spacing: 0.5px;
}

.success-icon {
  width: 20px;
  height: 20px;
  background: #22c55e;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
}

.success-content {
  margin-bottom: 16px;
}

.success-actions {
  display: flex;
  gap: 8px;
}

.btn-copy,
.btn-regenerate {
  flex: 1;
  padding: 10px 16px;
  border-radius: 6px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  font-family: inherit;
}

.btn-copy {
  background: var(--mkcg-bg-secondary, #f1f5f9);
  border: 1px solid var(--mkcg-border, #e2e8f0);
  color: var(--mkcg-text-primary, #0f172a);
}

.btn-copy:hover {
  background: #e2e8f0;
}

.btn-copy.copied {
  background: #dcfce7;
  border-color: #22c55e;
  color: #22c55e;
}

.btn-regenerate {
  background: white;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  color: var(--mkcg-text-secondary, #64748b);
}

.btn-regenerate:hover {
  background: var(--mkcg-bg-secondary, #f9fafb);
}

/* ========================================
   EXPANSION PANEL (Related Tools)
   ======================================== */
.expansion-panel {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  padding: 20px;
  margin-bottom: 20px;
}

.expansion-header {
  display: flex;
  align-items: center;
  gap: 8px;
  margin-bottom: 16px;
}

.expansion-icon {
  font-size: 20px;
}

.expansion-title {
  font-size: 16px;
  font-weight: 700;
  color: var(--mkcg-text-primary, #0f172a);
}

.related-tools {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 16px;
}

.related-tool-card {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  background: var(--mkcg-bg-secondary, #f9fafb);
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
  border: 1px solid transparent;
}

.related-tool-card:hover {
  background: #f1f5f9;
  border-color: var(--mkcg-primary, #3b82f6);
}

.related-tool-card.locked {
  cursor: pointer;
}

.related-tool-card.locked:hover {
  background: #eff6ff;
  border-color: var(--mkcg-primary, #3b82f6);
}

.tool-card-icon {
  width: 40px;
  height: 40px;
  background: white;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
}

.tool-card-content {
  flex: 1;
}

.tool-card-name {
  font-weight: 600;
  font-size: 14px;
  color: var(--mkcg-text-primary, #0f172a);
  display: flex;
  align-items: center;
  gap: 8px;
}

.lock-badge {
  font-size: 11px;
  background: #dbeafe;
  color: var(--mkcg-primary, #3b82f6);
  padding: 2px 6px;
  border-radius: 4px;
  font-weight: 600;
}

.tool-card-desc {
  font-size: 13px;
  color: var(--mkcg-text-secondary, #64748b);
  margin-top: 2px;
}

.tool-card-arrow {
  color: var(--mkcg-text-light, #94a3b8);
  font-size: 18px;
}

/* Save CTA Box */
.save-cta-box {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  border-radius: 8px;
  padding: 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
}

.save-cta-text {
  color: white;
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.save-cta-text strong {
  font-size: 15px;
}

.save-cta-text span {
  font-size: 13px;
  opacity: 0.9;
}

.btn-save-account {
  background: white;
  color: var(--mkcg-primary, #3b82f6);
  border: none;
  padding: 12px 20px;
  border-radius: 6px;
  font-weight: 700;
  font-size: 14px;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;
  font-family: inherit;
}

.btn-save-account:hover {
  transform: translateY(-1px);
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.2);
}

.btn-save-account:disabled {
  opacity: 0.7;
  cursor: not-allowed;
  transform: none;
}

.btn-save-account--saving {
  background: #f1f5f9;
  color: var(--mkcg-text-secondary, #64748b);
}

.btn-save-account--saved {
  background: #dcfce7;
  color: #16a34a;
}

/* Profile-specific save box */
.save-cta-box--profile {
  background: linear-gradient(135deg, #10b981 0%, #059669 100%);
}

.save-cta-box--select {
  background: var(--mkcg-bg-secondary, #f1f5f9);
  border: 2px dashed var(--mkcg-border, #e2e8f0);
}

.save-cta-box--select .save-cta-text {
  color: var(--mkcg-text-secondary, #64748b);
}

/* Unlimited generations text */
.tool-context__limit-text--unlimited {
  background: #dcfce7;
  color: #16a34a;
}

/* Post-Generation Social Proof */
.post-gen-proof {
  background: white;
  border-radius: 12px;
  border: 1px solid var(--mkcg-border, #e2e8f0);
  padding: 16px;
  text-align: center;
}

.proof-stars {
  color: #fbbf24;
  font-size: 16px;
  margin-bottom: 8px;
}

.proof-quote {
  font-size: 14px;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0 0 8px;
  font-style: italic;
}

.proof-author {
  font-size: 12px;
  color: var(--mkcg-text-secondary, #64748b);
  margin: 0;
}

/* ========================================
   SOFT GATE MODAL
   ======================================== */
.soft-gate-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 10000;
  padding: 20px;
}

.soft-gate-modal {
  background: white;
  border-radius: 16px;
  padding: 40px;
  max-width: 420px;
  width: 100%;
  text-align: center;
  position: relative;
  animation: slideUp 0.3s ease;
}

@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.soft-gate-close {
  position: absolute;
  top: 16px;
  right: 16px;
  width: 32px;
  height: 32px;
  border: none;
  background: var(--mkcg-bg-secondary, #f1f5f9);
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  color: var(--mkcg-text-secondary, #64748b);
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: inherit;
}

.soft-gate-close:hover {
  background: #e2e8f0;
}

.soft-gate-icon {
  font-size: 48px;
  margin-bottom: 16px;
}

.soft-gate-title {
  font-size: 24px;
  font-weight: 800;
  color: var(--mkcg-text-primary, #0f172a);
  margin: 0 0 12px;
}

.soft-gate-text {
  font-size: 16px;
  color: var(--mkcg-text-secondary, #64748b);
  margin: 0 0 20px;
}

.soft-gate-benefits {
  list-style: none;
  padding: 0;
  margin: 0 0 24px;
  text-align: left;
}

.soft-gate-benefits li {
  font-size: 15px;
  color: var(--mkcg-text-primary, #0f172a);
  padding: 8px 0;
  border-bottom: 1px solid var(--mkcg-border, #e2e8f0);
}

.soft-gate-benefits li:last-child {
  border-bottom: none;
}

.btn-gate-primary {
  width: 100%;
  padding: 16px;
  background: var(--mkcg-primary, #3b82f6);
  color: white;
  border: none;
  border-radius: 8px;
  font-weight: 700;
  font-size: 16px;
  cursor: pointer;
  margin-bottom: 12px;
  transition: background 0.2s;
  font-family: inherit;
}

.btn-gate-primary:hover {
  background: var(--mkcg-primary-hover, #2563eb);
}

.btn-gate-secondary {
  width: 100%;
  padding: 12px;
  background: transparent;
  color: var(--mkcg-text-secondary, #64748b);
  border: none;
  font-size: 14px;
  cursor: pointer;
  font-family: inherit;
}

.btn-gate-secondary:hover {
  color: var(--mkcg-text-primary, #0f172a);
}

.btn-gate-primary:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

/* Email Capture Form */
.email-capture-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
}

.email-input {
  width: 100%;
  padding: 14px 16px;
  border: 2px solid var(--mkcg-border, #e2e8f0);
  border-radius: 8px;
  font-size: 16px;
  transition: border-color 0.2s;
  box-sizing: border-box;
  font-family: inherit;
}

.email-input:focus {
  outline: none;
  border-color: var(--mkcg-primary, #3b82f6);
}

.email-input::placeholder {
  color: var(--mkcg-text-light, #94a3b8);
}

/* ========================================
   RESPONSIVE
   ======================================== */
@media (max-width: 768px) {
  .gmkb-tool-stage,
  .gmkb-tool-stage.has-generated {
    grid-template-columns: 1fr;
  }

  .tool-context {
    border-right: none;
    border-bottom: 1px solid var(--mkcg-border, #e2e8f0);
    padding: 24px;
  }

  .tool-preview-area {
    padding: 24px;
  }

  .gmkb-intent-tabs {
    flex-direction: column;
  }

  .gmkb-intent-tab {
    border-right: none;
    border-bottom: 1px solid var(--mkcg-border, #e2e8f0);
  }

  .gmkb-intent-tab:last-child {
    border-bottom: none;
  }

  .save-cta-box {
    flex-direction: column;
    text-align: center;
  }

  .soft-gate-modal {
    padding: 24px;
  }
}
</style>
