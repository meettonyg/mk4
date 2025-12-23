<template>
  <div class="tool-landing gmkb-generator-root">
    <!-- Hero Section -->
    <section class="tool-landing__hero">
      <div class="tool-landing__container">
        <div class="tool-landing__badge">Free AI Tool</div>
        <h1 class="tool-landing__title">{{ toolConfig?.title || 'AI Tool' }}</h1>
        <p class="tool-landing__subtitle">{{ toolConfig?.description || '' }}</p>

        <div class="tool-landing__cta">
          <a :href="useToolUrl" class="tool-landing__button tool-landing__button--primary">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
            </svg>
            Use This Tool Free
          </a>
          <a :href="directoryUrl" class="tool-landing__button tool-landing__button--secondary">
            Browse All Tools
          </a>
        </div>
      </div>
    </section>

    <!-- Benefits Section -->
    <section class="tool-landing__benefits">
      <div class="tool-landing__container">
        <h2 class="tool-landing__section-title">What You'll Get</h2>
        <div class="tool-landing__benefits-grid">
          <div v-for="benefit in benefits" :key="benefit.title" class="tool-landing__benefit">
            <div class="tool-landing__benefit-icon">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <h3 class="tool-landing__benefit-title">{{ benefit.title }}</h3>
            <p class="tool-landing__benefit-text">{{ benefit.text }}</p>
          </div>
        </div>
      </div>
    </section>

    <!-- How It Works Section -->
    <section class="tool-landing__how-it-works">
      <div class="tool-landing__container">
        <h2 class="tool-landing__section-title">How It Works</h2>
        <div class="tool-landing__steps">
          <div class="tool-landing__step">
            <div class="tool-landing__step-number">1</div>
            <h3 class="tool-landing__step-title">Enter Your Details</h3>
            <p class="tool-landing__step-text">Fill in the form with your information and preferences.</p>
          </div>
          <div class="tool-landing__step">
            <div class="tool-landing__step-number">2</div>
            <h3 class="tool-landing__step-title">Generate with AI</h3>
            <p class="tool-landing__step-text">Our AI creates professional content tailored to you.</p>
          </div>
          <div class="tool-landing__step">
            <div class="tool-landing__step-number">3</div>
            <h3 class="tool-landing__step-title">Copy & Use</h3>
            <p class="tool-landing__step-text">Copy your generated content and use it anywhere.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- Final CTA Section -->
    <section class="tool-landing__final-cta">
      <div class="tool-landing__container">
        <h2 class="tool-landing__cta-title">Ready to Get Started?</h2>
        <p class="tool-landing__cta-text">Generate professional {{ toolConfig?.name?.toLowerCase() || 'content' }} in seconds.</p>
        <a :href="useToolUrl" class="tool-landing__button tool-landing__button--primary tool-landing__button--large">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
          </svg>
          Start Using This Tool
        </a>
      </div>
    </section>
  </div>
</template>

<script setup>
import { computed } from 'vue';
import { getToolBySlug } from '.';

const props = defineProps({
  toolSlug: {
    type: String,
    required: true
  },
  directoryUrl: {
    type: String,
    default: '/tools/'
  }
});

const toolConfig = computed(() => getToolBySlug(props.toolSlug));

const useToolUrl = computed(() => `/tools/${props.toolSlug}/?use=1`);

const benefits = computed(() => {
  // Default benefits - can be customized per tool in the future
  return [
    {
      title: 'AI-Powered',
      text: 'Advanced AI generates professional, tailored content in seconds.'
    },
    {
      title: 'Free to Use',
      text: 'No sign-up required. Start generating content immediately.'
    },
    {
      title: 'Professional Quality',
      text: 'Get polished, ready-to-use content for your needs.'
    },
    {
      title: 'Easy to Customize',
      text: 'Adjust tone, length, and style to match your brand.'
    }
  ];
});
</script>

<style scoped>
.tool-landing {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  color: #1a1a2e;
  line-height: 1.6;
}

.tool-landing__container {
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
}

/* Hero Section */
.tool-landing__hero {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  padding: 4rem 0;
  text-align: center;
}

.tool-landing__badge {
  display: inline-block;
  background: rgba(255, 255, 255, 0.2);
  padding: 0.5rem 1rem;
  border-radius: 2rem;
  font-size: 0.875rem;
  font-weight: 600;
  margin-bottom: 1.5rem;
}

.tool-landing__title {
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 1rem;
  line-height: 1.2;
}

@media (min-width: 768px) {
  .tool-landing__title {
    font-size: 3.5rem;
  }
}

.tool-landing__subtitle {
  font-size: 1.25rem;
  opacity: 0.9;
  max-width: 600px;
  margin: 0 auto 2rem;
}

.tool-landing__cta {
  display: flex;
  flex-direction: column;
  gap: 1rem;
  align-items: center;
}

@media (min-width: 480px) {
  .tool-landing__cta {
    flex-direction: row;
    justify-content: center;
  }
}

.tool-landing__button {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 1rem 2rem;
  border-radius: 0.5rem;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  transition: all 0.2s ease;
  cursor: pointer;
}

.tool-landing__button--primary {
  background: white;
  color: #667eea;
}

.tool-landing__button--primary:hover {
  background: #f8f8ff;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
}

.tool-landing__button--secondary {
  background: transparent;
  color: white;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.tool-landing__button--secondary:hover {
  border-color: white;
  background: rgba(255, 255, 255, 0.1);
}

.tool-landing__button--large {
  padding: 1.25rem 2.5rem;
  font-size: 1.125rem;
}

/* Benefits Section */
.tool-landing__benefits {
  padding: 4rem 0;
  background: #f8fafc;
}

.tool-landing__section-title {
  font-size: 2rem;
  font-weight: 700;
  text-align: center;
  margin: 0 0 3rem;
  color: #1a1a2e;
}

.tool-landing__benefits-grid {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;
}

@media (min-width: 640px) {
  .tool-landing__benefits-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (min-width: 1024px) {
  .tool-landing__benefits-grid {
    grid-template-columns: repeat(4, 1fr);
  }
}

.tool-landing__benefit {
  background: white;
  padding: 2rem;
  border-radius: 1rem;
  text-align: center;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.05);
}

.tool-landing__benefit-icon {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
  color: white;
}

.tool-landing__benefit-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #1a1a2e;
}

.tool-landing__benefit-text {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

/* How It Works Section */
.tool-landing__how-it-works {
  padding: 4rem 0;
}

.tool-landing__steps {
  display: grid;
  grid-template-columns: repeat(1, 1fr);
  gap: 2rem;
  max-width: 900px;
  margin: 0 auto;
}

@media (min-width: 768px) {
  .tool-landing__steps {
    grid-template-columns: repeat(3, 1fr);
  }
}

.tool-landing__step {
  text-align: center;
  padding: 1.5rem;
}

.tool-landing__step-number {
  width: 3rem;
  height: 3rem;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  font-size: 1.5rem;
  font-weight: 700;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0 auto 1rem;
}

.tool-landing__step-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
  color: #1a1a2e;
}

.tool-landing__step-text {
  font-size: 0.875rem;
  color: #64748b;
  margin: 0;
}

/* Final CTA Section */
.tool-landing__final-cta {
  padding: 4rem 0;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  text-align: center;
}

.tool-landing__cta-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem;
}

.tool-landing__cta-text {
  font-size: 1.125rem;
  opacity: 0.9;
  margin: 0 0 2rem;
}
</style>
