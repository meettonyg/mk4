<template>
  <div class="persona-selector">
    <!-- Step indicator -->
    <div class="step-indicator">
      <span class="step-badge">STEP 1 OF 2</span>
    </div>

    <!-- Hero -->
    <div class="persona-hero">
      <h1>I'm a...</h1>
      <p>Choose the type of media kit that best fits your needs</p>
    </div>

    <!-- Persona Grid -->
    <div class="persona-grid">
      <button
        v-for="persona in personas"
        :key="persona.type"
        class="persona-card"
        @click="$emit('select', persona)"
      >
        <div class="persona-icon">
          <i :class="persona.icon"></i>
        </div>
        <h3 class="persona-name">{{ persona.label }}</h3>
        <p class="persona-description">{{ persona.description }}</p>
        <span class="persona-count">{{ persona.templateCount }} templates</span>
      </button>
    </div>

    <!-- View All link -->
    <div class="view-all-section">
      <button class="view-all-btn" @click="$emit('view-all')">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="3" y="3" width="7" height="7" />
          <rect x="14" y="3" width="7" height="7" />
          <rect x="14" y="14" width="7" height="7" />
          <rect x="3" y="14" width="7" height="7" />
        </svg>
        View All Templates
      </button>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  templates: {
    type: Array,
    required: true
  }
});

defineEmits(['select', 'view-all']);

// Persona definitions with descriptions
const personaDefinitions = {
  author: {
    type: 'author',
    label: 'Authors & Writers',
    icon: 'fa-solid fa-book',
    description: 'Media kits for book authors, writers, and literary professionals'
  },
  speaker: {
    type: 'speaker',
    label: 'Speakers & Trainers',
    icon: 'fa-solid fa-microphone',
    description: 'Professional press kits for keynote speakers and workshop facilitators'
  },
  'podcast-guest': {
    type: 'podcast-guest',
    label: 'Podcast Guests',
    icon: 'fa-solid fa-podcast',
    description: 'One-sheets optimized for podcast booking and audio interviews'
  },
  consultant: {
    type: 'consultant',
    label: 'Consultants & Advisors',
    icon: 'fa-solid fa-briefcase',
    description: 'Credibility kits for business consultants and professional advisors'
  },
  influencer: {
    type: 'influencer',
    label: 'Creators & Influencers',
    icon: 'fa-solid fa-hashtag',
    description: 'Media kits showcasing social stats and brand collaboration info'
  }
};

// Compute personas with template counts from actual data
const personas = computed(() => {
  // Count templates per persona type using reduce
  const counts = props.templates.reduce((acc, template) => {
    const type = template.persona?.type;
    if (type) {
      acc[type] = (acc[type] || 0) + 1;
    }
    return acc;
  }, {});

  // Build persona list with counts, filtering to only show personas with templates
  return Object.entries(personaDefinitions)
    .map(([type, definition]) => ({
      ...definition,
      templateCount: counts[type] || 0
    }))
    .filter(p => p.templateCount > 0);
});
</script>

<style scoped>
.persona-selector {
  padding: 2rem;
  max-width: 1200px;
  margin: 0 auto;
}

/* Step Indicator */
.step-indicator {
  text-align: center;
  margin-bottom: 1.5rem;
}

/* Step badge - shared visual pattern with TemplateDirectory.vue for consistency */
.step-badge {
  display: inline-block;
  padding: 0.375rem 1rem;
  background: rgba(59, 130, 246, 0.15);
  color: #3b82f6;
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.05em;
}

/* Hero */
.persona-hero {
  text-align: center;
  margin-bottom: 2.5rem;
}

.persona-hero h1 {
  color: white;
  font-size: 2.5rem;
  font-weight: 700;
  margin: 0 0 0.5rem;
  letter-spacing: -0.03em;
}

.persona-hero p {
  color: rgba(255, 255, 255, 0.7);
  font-size: 1.125rem;
  margin: 0;
}

/* Persona Grid */
.persona-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
  gap: 1.25rem;
  margin-bottom: 2rem;
}

.persona-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 2rem 1.5rem;
  background: rgba(255, 255, 255, 0.08);
  border: 2px solid rgba(255, 255, 255, 0.12);
  border-radius: 16px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.persona-card:hover {
  background: rgba(255, 255, 255, 0.12);
  border-color: rgba(59, 130, 246, 0.5);
  transform: translateY(-4px);
}

.persona-card:focus {
  outline: none;
  border-color: #3b82f6;
  box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.3);
}

.persona-icon {
  width: 64px;
  height: 64px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: linear-gradient(135deg, #3b82f6, #8b5cf6);
  border-radius: 16px;
  margin-bottom: 1rem;
}

.persona-icon i {
  font-size: 1.75rem;
  color: white;
}

.persona-name {
  color: white;
  font-size: 1.125rem;
  font-weight: 600;
  margin: 0 0 0.5rem;
}

.persona-description {
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.875rem;
  line-height: 1.4;
  margin: 0 0 0.75rem;
}

.persona-count {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  background: rgba(255, 255, 255, 0.1);
  color: rgba(255, 255, 255, 0.8);
  border-radius: 9999px;
  font-size: 0.75rem;
  font-weight: 500;
}

/* View All Section */
.view-all-section {
  text-align: center;
  padding-top: 1rem;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.view-all-btn {
  display: inline-flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.75rem 1.5rem;
  background: transparent;
  border: 1px solid rgba(255, 255, 255, 0.25);
  border-radius: 8px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9375rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.15s ease;
}

.view-all-btn:hover {
  background: rgba(255, 255, 255, 0.1);
  border-color: rgba(255, 255, 255, 0.4);
  color: white;
}

.view-all-btn svg {
  opacity: 0.7;
}

/* Responsive */
@media (max-width: 768px) {
  .persona-selector {
    padding: 1.5rem 1rem;
  }

  .persona-hero h1 {
    font-size: 1.75rem;
  }

  .persona-hero p {
    font-size: 1rem;
  }

  .persona-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 1rem;
  }

  .persona-card {
    padding: 1.5rem 1rem;
  }

  .persona-icon {
    width: 56px;
    height: 56px;
  }

  .persona-icon i {
    font-size: 1.5rem;
  }

  .persona-name {
    font-size: 1rem;
  }

  .persona-description {
    font-size: 0.8125rem;
  }
}

@media (max-width: 480px) {
  .persona-grid {
    grid-template-columns: 1fr;
  }

  .persona-card {
    flex-direction: row;
    text-align: left;
    gap: 1rem;
    padding: 1.25rem;
  }

  .persona-icon {
    flex-shrink: 0;
    width: 48px;
    height: 48px;
    margin-bottom: 0;
  }

  .persona-icon i {
    font-size: 1.25rem;
  }

  /* Hide description and count on mobile to save space */
  .persona-card .persona-description,
  .persona-card .persona-count {
    display: none;
  }
}
</style>
