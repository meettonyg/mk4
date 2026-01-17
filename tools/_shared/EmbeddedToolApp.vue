<template>
  <div class="gmkb-standalone-scope">
    <EmbeddedToolWrapper
      :intents="intents"
      :default-heading="defaultHeading"
      :default-description="defaultDescription"
      :is-generating="isGenerating"
      :can-generate="canGenerate"
      :generate-button-text="buttonText"
      :preview-content="previewContent"
      :result-label="resultLabel"
      :content-noun="contentNoun"
      :preview-label="previewLabel"
      :tool-slug="toolSlug"
      :is-logged-in="isLoggedIn"
      :supports-profile-save="supportsProfileSave"
      :related-tools="relatedTools"
      :testimonial="testimonial"
      :authority-hook-data="authorityHookData"
      :single-column="singleColumn"
      :tabs-in-hero="tabsInHero"
      register-url="/register/"
      :social-login-html="socialLoginHtml"
      @intent-change="handleIntentChange"
      @save-click="handleSaveClick"
      @gate-shown="handleGateShown"
      @gate-signup="handleGateSignup"
      @profile-saved="handleProfileSaved"
    >
      <template #form="{ profileData }">
        <component
          :is="generatorComponent"
          ref="generator"
          mode="default"
          :intent="currentIntent"
          :profile-data="profileData"
          @generated="handleGenerated"
          @authority-hook-update="handleAuthorityHookUpdate"
        />
      </template>
      <template #preview>
        <p v-if="previewContent" class="preview-hook" v-html="previewContent"></p>
      </template>
    </EmbeddedToolWrapper>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import EmbeddedToolWrapper from './EmbeddedToolWrapper.vue';
import { buildRelatedTools } from '../index.js';

const props = defineProps({
  toolSlug: { type: String, required: true },
  intents: { type: Array, default: () => [] },
  meta: { type: Object, default: () => ({}) },
  generatorComponent: { type: Object, required: true },
  isLoggedIn: { type: Boolean, default: false },
  socialLoginHtml: { type: String, default: '' },
  tabsInHero: { type: Boolean, default: false }
});

const emit = defineEmits(['generated', 'save-click', 'gate-shown', 'gate-signup']);

// State
const currentIntent = ref(props.intents[0] || null);

// Listen for hero intent tab changes (when tabs are in hero section)
function handleHeroIntentChange(e) {
  const intentId = e.detail?.intentId;
  if (intentId) {
    const intent = props.intents.find(i => i.id === intentId);
    if (intent) {
      currentIntent.value = intent;
    }
  }
}

onMounted(() => {
  if (props.tabsInHero) {
    document.addEventListener('gmkb:hero-intent-change', handleHeroIntentChange);
  }
});

onUnmounted(() => {
  if (props.tabsInHero) {
    document.removeEventListener('gmkb:hero-intent-change', handleHeroIntentChange);
  }
});
const previewContent = ref('');
const hasGenerated = ref(false);
const generator = ref(null);
const authorityHookData = ref(null);

// These are passed to wrapper but not actively managed since Generator handles its own state in default mode
const isGenerating = ref(false);
const canGenerate = ref(true); // Default to true since Generator validates internally

// Computed from meta
const supportsProfileSave = computed(() => props.meta.supportsProfileSave ?? true);
const buttonText = computed(() => props.meta.buttonText || `Generate ${props.meta.name || 'Content'}`);
const testimonial = computed(() => props.meta.socialProof?.testimonial || null);
const relatedTools = computed(() => buildRelatedTools(props.meta.relatedToolSlugs || [], props.toolSlug));
// Default to single column for landing pages - Generator handles its own results display
const singleColumn = computed(() => props.meta.singleColumn ?? true);

// Tool display name derivatives
const toolDisplayName = computed(() => props.meta.name || 'Content');
const contentNoun = computed(() =>
  toolDisplayName.value.toLowerCase()
    .replace(' generator', '')
    .replace(' builder', '')
    .replace(' writer', '')
);
const resultLabel = computed(() => `Your ${toolDisplayName.value}`);
const previewLabel = computed(() => `Sample ${toolDisplayName.value}`);
const defaultHeading = computed(() => props.meta.hero?.contextHeading || `Create your ${contentNoun.value}`);
const defaultDescription = computed(() => props.meta.hero?.contextDescription || '');

// Event handlers
function handleIntentChange(intent) {
  currentIntent.value = intent;
}

function handleGenerated(data) {
  hasGenerated.value = true;
  emit('generated', data);
}

function handleSaveClick() {
  emit('save-click', { tool: props.toolSlug });
}

function handleGateShown(data) {
  emit('gate-shown', { tool: props.toolSlug, ...data });
}

function handleGateSignup() {
  emit('gate-signup', { tool: props.toolSlug });
}

function handleAuthorityHookUpdate(data) {
  authorityHookData.value = data;
}

function handleProfileSaved(data) {
  // Profile save handled by EmbeddedToolWrapper
  // Could emit an event or log if needed
  console.log('[EmbeddedToolApp] Profile saved:', data);
}
</script>
