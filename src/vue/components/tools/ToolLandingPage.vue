<template>
  <div class="gmkb-landing" v-if="tool">
    <!-- Hero Section with Tool Preview -->
    <section class="gmkb-landing__hero">
      <div class="gmkb-landing__hero-content">
        <div class="gmkb-landing__hero-badge">
          <IconRenderer :name="tool.icon" size="sm" variant="outline" />
          <span>Free AI Tool</span>
        </div>
        <h1 class="gmkb-landing__hero-title">{{ tool.landingContent.heroTagline }}</h1>
        <p class="gmkb-landing__hero-subtitle">{{ tool.landingContent.heroSubtitle }}</p>

        <!-- Key Benefits -->
        <ul class="gmkb-landing__benefits">
          <li v-for="benefit in tool.keyBenefits" :key="benefit">
            <IconRenderer name="CheckCircleIcon" size="sm" variant="solid" />
            <span>{{ benefit }}</span>
          </li>
        </ul>
      </div>

      <!-- Tool Preview -->
      <div class="gmkb-landing__hero-preview">
        <ToolPreview :tool="tool" :interactive="true" />
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="gmkb-landing__section gmkb-landing__how-it-works">
      <div class="gmkb-landing__section-header">
        <h2>How It Works</h2>
        <p>Get professional results in three simple steps</p>
      </div>

      <div class="gmkb-landing__steps">
        <div
          v-for="step in tool.landingContent.howItWorks"
          :key="step.step"
          class="gmkb-landing__step"
        >
          <div class="gmkb-landing__step-number">{{ step.step }}</div>
          <h3 class="gmkb-landing__step-title">{{ step.title }}</h3>
          <p class="gmkb-landing__step-desc">{{ step.description }}</p>
        </div>
      </div>
    </section>

    <!-- Features Section -->
    <section class="gmkb-landing__section gmkb-landing__features">
      <div class="gmkb-landing__section-header">
        <h2>Features</h2>
        <p>Everything you need to create compelling content</p>
      </div>

      <div class="gmkb-landing__features-grid">
        <div
          v-for="feature in tool.landingContent.features"
          :key="feature.title"
          class="gmkb-landing__feature"
        >
          <div class="gmkb-landing__feature-icon">
            <IconRenderer :name="feature.icon" size="lg" variant="outline" />
          </div>
          <h3 class="gmkb-landing__feature-title">{{ feature.title }}</h3>
          <p class="gmkb-landing__feature-desc">{{ feature.description }}</p>
        </div>
      </div>
    </section>

    <!-- Use Cases Section -->
    <section class="gmkb-landing__section gmkb-landing__use-cases">
      <div class="gmkb-landing__section-header">
        <h2>Use Cases</h2>
        <p>Perfect for professionals and creators</p>
      </div>

      <div class="gmkb-landing__use-cases-grid">
        <div
          v-for="useCase in tool.useCases"
          :key="useCase"
          class="gmkb-landing__use-case"
        >
          <IconRenderer name="SparklesIcon" size="md" variant="outline" />
          <span>{{ useCase }}</span>
        </div>
      </div>
    </section>

    <!-- FAQ Section -->
    <section class="gmkb-landing__section gmkb-landing__faq">
      <div class="gmkb-landing__section-header">
        <h2>Frequently Asked Questions</h2>
      </div>

      <div class="gmkb-landing__faq-list">
        <details
          v-for="(faq, index) in tool.landingContent.faq"
          :key="index"
          class="gmkb-landing__faq-item"
        >
          <summary class="gmkb-landing__faq-question">
            {{ faq.question }}
            <IconRenderer name="ChevronDownIcon" size="sm" variant="outline" class="gmkb-landing__faq-chevron" />
          </summary>
          <p class="gmkb-landing__faq-answer">{{ faq.answer }}</p>
        </details>
      </div>
    </section>

    <!-- Related Tools Section -->
    <section v-if="relatedTools.length > 0" class="gmkb-landing__section gmkb-landing__related">
      <div class="gmkb-landing__section-header">
        <h2>Related Tools</h2>
        <p>Explore more AI-powered generators</p>
      </div>

      <div class="gmkb-landing__related-grid">
        <ToolCard
          v-for="relatedTool in relatedTools"
          :key="relatedTool.slug"
          :tool="relatedTool"
          :base-url="baseUrl"
        />
      </div>
    </section>

    <!-- CTA Section -->
    <section class="gmkb-landing__cta">
      <h2>Ready to Get Started?</h2>
      <p>Create professional {{ tool.name.toLowerCase().replace(' generator', '').replace(' builder', '') }} content in seconds - completely free.</p>
      <a href="#top" class="gmkb-landing__cta-button">
        <IconRenderer name="ArrowUpIcon" size="sm" variant="outline" />
        <span>Try {{ tool.name }} Now</span>
      </a>
    </section>
  </div>

  <!-- Loading state -->
  <div v-else class="gmkb-landing__loading">
    <IconRenderer name="ArrowPathIcon" size="xl" variant="outline" class="gmkb-landing__spinner" />
    <p>Loading tool...</p>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import IconRenderer from '../common/IconRenderer.vue';
import ToolPreview from './ToolPreview.vue';
import ToolCard from './ToolCard.vue';
import ToolRegistry from '../../services/ToolRegistry.js';

const props = defineProps({
  /**
   * Tool slug to display landing page for
   */
  slug: {
    type: String,
    required: true,
  },

  /**
   * Base URL for tool links
   */
  baseUrl: {
    type: String,
    default: '/tools/',
  },
});

/**
 * Get tool metadata from registry
 */
const tool = computed(() => {
  return ToolRegistry.getToolBySlug(props.slug);
});

/**
 * Get related tools
 */
const relatedTools = computed(() => {
  if (!tool.value) return [];
  return ToolRegistry.getRelatedTools(props.slug);
});
</script>

<style scoped>
.gmkb-landing {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 24px;
}

/* Hero Section */
.gmkb-landing__hero {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 48px;
  align-items: center;
  padding: 64px 0;
}

@media (max-width: 1024px) {
  .gmkb-landing__hero {
    grid-template-columns: 1fr;
    text-align: center;
  }
}

.gmkb-landing__hero-badge {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 16px;
  font-size: 14px;
  font-weight: 500;
  color: var(--gmkb-primary, #6366f1);
  background: var(--gmkb-primary-light, #eef2ff);
  border-radius: 100px;
  margin-bottom: 20px;
}

.gmkb-landing__hero-title {
  margin: 0 0 16px 0;
  font-size: 42px;
  font-weight: 800;
  line-height: 1.2;
  color: var(--gmkb-text-primary, #1f2937);
}

@media (max-width: 768px) {
  .gmkb-landing__hero-title {
    font-size: 32px;
  }
}

.gmkb-landing__hero-subtitle {
  margin: 0 0 32px 0;
  font-size: 18px;
  line-height: 1.6;
  color: var(--gmkb-text-secondary, #64748b);
}

.gmkb-landing__benefits {
  list-style: none;
  margin: 0;
  padding: 0;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

@media (max-width: 1024px) {
  .gmkb-landing__benefits {
    align-items: center;
  }
}

.gmkb-landing__benefits li {
  display: flex;
  align-items: center;
  gap: 10px;
  font-size: 15px;
  color: var(--gmkb-text-primary, #1f2937);
}

.gmkb-landing__benefits li .gmkb-icon {
  color: var(--gmkb-success, #10b981);
}

.gmkb-landing__hero-preview {
  border-radius: 20px;
  overflow: hidden;
  box-shadow: 0 20px 60px rgba(0, 0, 0, 0.12);
}

/* Section Base Styles */
.gmkb-landing__section {
  padding: 80px 0;
  border-top: 1px solid var(--gmkb-border, #e5e7eb);
}

.gmkb-landing__section-header {
  text-align: center;
  margin-bottom: 48px;
}

.gmkb-landing__section-header h2 {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
  color: var(--gmkb-text-primary, #1f2937);
}

.gmkb-landing__section-header p {
  margin: 0;
  font-size: 18px;
  color: var(--gmkb-text-secondary, #64748b);
}

/* How It Works */
.gmkb-landing__steps {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 32px;
}

@media (max-width: 768px) {
  .gmkb-landing__steps {
    grid-template-columns: 1fr;
  }
}

.gmkb-landing__step {
  text-align: center;
  padding: 32px;
}

.gmkb-landing__step-number {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 20px;
  font-size: 24px;
  font-weight: 700;
  color: #ffffff;
  background: var(--gmkb-primary, #6366f1);
  border-radius: 50%;
}

.gmkb-landing__step-title {
  margin: 0 0 12px 0;
  font-size: 20px;
  font-weight: 600;
  color: var(--gmkb-text-primary, #1f2937);
}

.gmkb-landing__step-desc {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--gmkb-text-secondary, #64748b);
}

/* Features */
.gmkb-landing__features-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 32px;
}

@media (max-width: 768px) {
  .gmkb-landing__features-grid {
    grid-template-columns: 1fr;
  }
}

.gmkb-landing__feature {
  padding: 32px;
  background: var(--gmkb-bg-secondary, #f8fafc);
  border-radius: 16px;
}

.gmkb-landing__feature-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 56px;
  height: 56px;
  margin-bottom: 20px;
  color: var(--gmkb-primary, #6366f1);
  background: var(--gmkb-primary-light, #eef2ff);
  border-radius: 12px;
}

.gmkb-landing__feature-title {
  margin: 0 0 12px 0;
  font-size: 18px;
  font-weight: 600;
  color: var(--gmkb-text-primary, #1f2937);
}

.gmkb-landing__feature-desc {
  margin: 0;
  font-size: 15px;
  line-height: 1.6;
  color: var(--gmkb-text-secondary, #64748b);
}

/* Use Cases */
.gmkb-landing__use-cases-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
  gap: 16px;
}

.gmkb-landing__use-case {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 20px 24px;
  font-size: 15px;
  color: var(--gmkb-text-primary, #1f2937);
  background: var(--gmkb-bg, #ffffff);
  border: 1px solid var(--gmkb-border, #e5e7eb);
  border-radius: 12px;
}

.gmkb-landing__use-case .gmkb-icon {
  color: var(--gmkb-primary, #6366f1);
  flex-shrink: 0;
}

/* FAQ */
.gmkb-landing__faq-list {
  max-width: 800px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.gmkb-landing__faq-item {
  background: var(--gmkb-bg, #ffffff);
  border: 1px solid var(--gmkb-border, #e5e7eb);
  border-radius: 12px;
  overflow: hidden;
}

.gmkb-landing__faq-question {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20px 24px;
  font-size: 16px;
  font-weight: 600;
  color: var(--gmkb-text-primary, #1f2937);
  cursor: pointer;
  list-style: none;
}

.gmkb-landing__faq-question::-webkit-details-marker {
  display: none;
}

.gmkb-landing__faq-chevron {
  transition: transform 0.2s ease;
}

.gmkb-landing__faq-item[open] .gmkb-landing__faq-chevron {
  transform: rotate(180deg);
}

.gmkb-landing__faq-answer {
  margin: 0;
  padding: 0 24px 20px;
  font-size: 15px;
  line-height: 1.6;
  color: var(--gmkb-text-secondary, #64748b);
}

/* Related Tools */
.gmkb-landing__related-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
  gap: 20px;
}

/* CTA Section */
.gmkb-landing__cta {
  text-align: center;
  padding: 80px 24px;
  margin: 80px -24px 0;
  background: linear-gradient(135deg, var(--gmkb-primary, #6366f1) 0%, #8b5cf6 100%);
  border-radius: 24px 24px 0 0;
}

.gmkb-landing__cta h2 {
  margin: 0 0 12px 0;
  font-size: 32px;
  font-weight: 700;
  color: #ffffff;
}

.gmkb-landing__cta p {
  margin: 0 0 32px 0;
  font-size: 18px;
  color: rgba(255, 255, 255, 0.9);
}

.gmkb-landing__cta-button {
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 16px 32px;
  font-size: 16px;
  font-weight: 600;
  color: var(--gmkb-primary, #6366f1);
  background: #ffffff;
  text-decoration: none;
  border-radius: 10px;
  transition: all 0.2s ease;
  box-shadow: 0 4px 14px rgba(0, 0, 0, 0.15);
}

.gmkb-landing__cta-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
}

/* Loading State */
.gmkb-landing__loading {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 16px;
  min-height: 400px;
  color: var(--gmkb-text-secondary, #64748b);
}

.gmkb-landing__spinner {
  animation: spin 1s linear infinite;
}

@keyframes spin {
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
}

/* Dark Mode */
:root.dark .gmkb-landing,
body.dark-mode .gmkb-landing {
  --gmkb-bg: #1e293b;
  --gmkb-bg-secondary: #0f172a;
  --gmkb-border: #334155;
  --gmkb-text-primary: #f1f5f9;
  --gmkb-text-secondary: #94a3b8;
  --gmkb-primary-light: rgba(99, 102, 241, 0.15);
}
</style>
