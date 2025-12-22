<template>
  <div class="gmkb-ai-panel">
    <!-- Panel Header -->
    <div class="gmkb-ai-panel__header">
      <div class="gmkb-ai-panel__title">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
        </svg>
        <span>AI Assistant</span>
      </div>
      <span class="gmkb-ai-panel__badge">Beta</span>
    </div>

    <!-- Context-Aware Content -->
    <div class="gmkb-ai-panel__content">
      <!-- When a specific component is selected -->
      <template v-if="selectedComponent">
        <div class="gmkb-ai-panel__context">
          <span class="gmkb-ai-panel__context-label">Generating for:</span>
          <span class="gmkb-ai-panel__context-value">{{ selectedComponent.type }}</span>
        </div>

        <!-- Biography -->
        <BiographyGenerator
          v-if="selectedComponent.type === 'biography'"
          mode="integrated"
          :component-id="selectedComponent.id"
          @applied="handleApplied"
        />

        <!-- Topics -->
        <TopicsGenerator
          v-else-if="selectedComponent.type === 'topics'"
          mode="integrated"
          :component-id="selectedComponent.id"
          @applied="handleApplied"
        />

        <!-- Questions -->
        <QuestionsGenerator
          v-else-if="selectedComponent.type === 'questions'"
          mode="integrated"
          :component-id="selectedComponent.id"
          @applied="handleApplied"
        />

        <!-- Guest Intro -->
        <GuestIntroGenerator
          v-else-if="selectedComponent.type === 'guest_intro' || selectedComponent.type === 'guest-intro'"
          mode="integrated"
          :component-id="selectedComponent.id"
          @applied="handleApplied"
        />

        <!-- Tagline -->
        <TaglineGenerator
          v-else-if="selectedComponent.type === 'tagline'"
          mode="integrated"
          :component-id="selectedComponent.id"
          @applied="handleApplied"
        />

        <!-- Default: Show available generators -->
        <div v-else class="gmkb-ai-panel__no-generator">
          <p>No AI generator available for this component type.</p>
          <p class="gmkb-ai-panel__hint">Select a Biography, Topics, Questions, or Guest Intro component to use AI generation.</p>
        </div>
      </template>

      <!-- When no component is selected: Show all generators in accordion -->
      <template v-else>
        <div class="gmkb-ai-panel__intro">
          <p>Generate professional content with AI. Select a component in the preview to see context-specific options, or use the generators below:</p>
        </div>

        <!-- Generators Accordion -->
        <div class="gmkb-ai-accordion">
          <!-- Authority Hook Builder -->
          <div
            class="gmkb-ai-accordion__item"
            :class="{ 'gmkb-ai-accordion__item--open': openSection === 'authority-hook' }"
          >
            <button
              type="button"
              class="gmkb-ai-accordion__header"
              @click="toggleSection('authority-hook')"
            >
              <span class="gmkb-ai-accordion__header-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <circle cx="12" cy="12" r="10"/>
                  <path d="M12 16v-4M12 8h.01"/>
                </svg>
                Authority Hook
              </span>
              <svg class="gmkb-ai-accordion__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div v-if="openSection === 'authority-hook'" class="gmkb-ai-accordion__content">
              <AuthorityHookBuilder
                mode="integrated"
                @applied="handleApplied"
              />
            </div>
          </div>

          <!-- Impact Intro Builder -->
          <div
            class="gmkb-ai-accordion__item"
            :class="{ 'gmkb-ai-accordion__item--open': openSection === 'impact-intro' }"
          >
            <button
              type="button"
              class="gmkb-ai-accordion__header"
              @click="toggleSection('impact-intro')"
            >
              <span class="gmkb-ai-accordion__header-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M12 2L3 7v6c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-9-5z"/>
                </svg>
                Credentials & Achievements
              </span>
              <svg class="gmkb-ai-accordion__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div v-if="openSection === 'impact-intro'" class="gmkb-ai-accordion__content">
              <ImpactIntroBuilder
                mode="integrated"
                @applied="handleApplied"
              />
            </div>
          </div>

          <!-- Biography Generator -->
          <div
            class="gmkb-ai-accordion__item"
            :class="{ 'gmkb-ai-accordion__item--open': openSection === 'biography' }"
          >
            <button
              type="button"
              class="gmkb-ai-accordion__header"
              @click="toggleSection('biography')"
            >
              <span class="gmkb-ai-accordion__header-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
                Biography
              </span>
              <svg class="gmkb-ai-accordion__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div v-if="openSection === 'biography'" class="gmkb-ai-accordion__content">
              <BiographyGenerator
                mode="integrated"
                @applied="handleApplied"
              />
            </div>
          </div>

          <!-- Topics Generator -->
          <div
            class="gmkb-ai-accordion__item"
            :class="{ 'gmkb-ai-accordion__item--open': openSection === 'topics' }"
          >
            <button
              type="button"
              class="gmkb-ai-accordion__header"
              @click="toggleSection('topics')"
            >
              <span class="gmkb-ai-accordion__header-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <line x1="8" y1="6" x2="21" y2="6"/>
                  <line x1="8" y1="12" x2="21" y2="12"/>
                  <line x1="8" y1="18" x2="21" y2="18"/>
                  <line x1="3" y1="6" x2="3.01" y2="6"/>
                  <line x1="3" y1="12" x2="3.01" y2="12"/>
                  <line x1="3" y1="18" x2="3.01" y2="18"/>
                </svg>
                Speaking Topics
              </span>
              <svg class="gmkb-ai-accordion__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div v-if="openSection === 'topics'" class="gmkb-ai-accordion__content">
              <TopicsGenerator
                mode="integrated"
                @applied="handleApplied"
              />
            </div>
          </div>

          <!-- Tagline Generator -->
          <div
            class="gmkb-ai-accordion__item"
            :class="{ 'gmkb-ai-accordion__item--open': openSection === 'tagline' }"
          >
            <button
              type="button"
              class="gmkb-ai-accordion__header"
              @click="toggleSection('tagline')"
            >
              <span class="gmkb-ai-accordion__header-content">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                  <polyline points="4 7 4 4 20 4 20 7"/>
                  <line x1="9" y1="20" x2="15" y2="20"/>
                  <line x1="12" y1="4" x2="12" y2="20"/>
                </svg>
                Tagline
              </span>
              <svg class="gmkb-ai-accordion__icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="6 9 12 15 18 9"/>
              </svg>
            </button>
            <div v-if="openSection === 'tagline'" class="gmkb-ai-accordion__content">
              <TaglineGenerator
                mode="integrated"
                @applied="handleApplied"
              />
            </div>
          </div>
        </div>
      </template>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue';
import { useMediaKitStore } from '../../../stores/mediaKit';
import BiographyGenerator from '@tools/biography-generator/BiographyGenerator.vue';
import TopicsGenerator from '@tools/topics-generator/TopicsGenerator.vue';
import QuestionsGenerator from '@tools/questions-generator/QuestionsGenerator.vue';
import GuestIntroGenerator from '@tools/guest-intro-generator/GuestIntroGenerator.vue';
import TaglineGenerator from '@tools/tagline-generator/TaglineGenerator.vue';
import AuthorityHookBuilder from '@tools/authority-hook-builder/AuthorityHookBuilder.vue';
import ImpactIntroBuilder from '@tools/impact-intro-builder/ImpactIntroBuilder.vue';

const props = defineProps({
  /**
   * Currently selected component from the builder
   */
  selectedComponent: {
    type: Object,
    default: null
  }
});

const emit = defineEmits(['applied']);

// Store access
const store = useMediaKitStore();

// Accordion state
const openSection = ref('authority-hook');

/**
 * Toggle accordion section
 */
const toggleSection = (section) => {
  openSection.value = openSection.value === section ? null : section;
};

/**
 * Handle content applied to component
 */
const handleApplied = (data) => {
  console.log('[AiAssistantPanel] Content applied:', data);

  // If we have a component ID, update the store
  if (data.componentId) {
    // Find the component and update its content
    const component = store.findComponent(data.componentId);
    if (component) {
      // Update based on content type
      if (data.content) {
        component.content = data.content;
      }
      if (data.topics) {
        component.topics = data.topics;
      }
      if (data.questions) {
        component.questions = data.questions;
      }
      if (data.introduction) {
        component.introduction = data.introduction;
      }
      if (data.tagline) {
        component.tagline = data.tagline;
      }

      store._trackChange();
    }
  }

  emit('applied', data);
};
</script>

<style scoped>
.gmkb-ai-panel {
  display: flex;
  flex-direction: column;
  height: 100%;
  overflow: hidden;
}

.gmkb-ai-panel__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e5e7eb;
  background: linear-gradient(135deg, #f8fafc 0%, #f1f5f9 100%);
}

body.dark-mode .gmkb-ai-panel__header {
  border-bottom-color: #334155;
  background: linear-gradient(135deg, #1e293b 0%, #0f172a 100%);
}

.gmkb-ai-panel__title {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 16px;
  font-weight: 600;
  color: #1e293b;
}

body.dark-mode .gmkb-ai-panel__title {
  color: #f1f5f9;
}

.gmkb-ai-panel__title svg {
  color: #6366f1;
}

.gmkb-ai-panel__badge {
  padding: 2px 8px;
  font-size: 10px;
  font-weight: 600;
  text-transform: uppercase;
  color: #6366f1;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 4px;
}

.gmkb-ai-panel__content {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
}

.gmkb-ai-panel__context {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  margin-bottom: 16px;
  background: rgba(99, 102, 241, 0.1);
  border-radius: 6px;
}

.gmkb-ai-panel__context-label {
  font-size: 12px;
  color: #64748b;
}

body.dark-mode .gmkb-ai-panel__context-label {
  color: #94a3b8;
}

.gmkb-ai-panel__context-value {
  font-size: 12px;
  font-weight: 600;
  color: #6366f1;
  text-transform: capitalize;
}

.gmkb-ai-panel__no-generator {
  padding: 24px;
  text-align: center;
}

.gmkb-ai-panel__no-generator p {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: #64748b;
}

body.dark-mode .gmkb-ai-panel__no-generator p {
  color: #94a3b8;
}

.gmkb-ai-panel__hint {
  font-size: 12px !important;
  color: #9ca3af !important;
}

.gmkb-ai-panel__intro {
  margin-bottom: 16px;
}

.gmkb-ai-panel__intro p {
  margin: 0;
  font-size: 13px;
  color: #64748b;
  line-height: 1.5;
}

body.dark-mode .gmkb-ai-panel__intro p {
  color: #94a3b8;
}

/* Accordion Styles */
.gmkb-ai-accordion {
  border: 1px solid #e5e7eb;
  border-radius: 8px;
  overflow: hidden;
}

body.dark-mode .gmkb-ai-accordion {
  border-color: #334155;
}

.gmkb-ai-accordion__item {
  border-bottom: 1px solid #e5e7eb;
}

body.dark-mode .gmkb-ai-accordion__item {
  border-bottom-color: #334155;
}

.gmkb-ai-accordion__item:last-child {
  border-bottom: none;
}

.gmkb-ai-accordion__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 12px 16px;
  font-size: 14px;
  font-weight: 500;
  font-family: inherit;
  color: #374151;
  background: #f9fafb;
  border: none;
  cursor: pointer;
  transition: background 0.15s ease;
}

body.dark-mode .gmkb-ai-accordion__header {
  color: #e5e7eb;
  background: #1e293b;
}

.gmkb-ai-accordion__header:hover {
  background: #f3f4f6;
}

body.dark-mode .gmkb-ai-accordion__header:hover {
  background: #334155;
}

.gmkb-ai-accordion__header-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.gmkb-ai-accordion__header-content svg {
  color: #6366f1;
}

.gmkb-ai-accordion__icon {
  color: #9ca3af;
  transition: transform 0.2s ease;
}

.gmkb-ai-accordion__item--open .gmkb-ai-accordion__icon {
  transform: rotate(180deg);
}

.gmkb-ai-accordion__content {
  padding: 16px;
  background: #ffffff;
}

body.dark-mode .gmkb-ai-accordion__content {
  background: #0f172a;
}
</style>
