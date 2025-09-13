<template>
  <div class="gmkb-hero" :class="themeClass">
    <div class="hero-content">
      <div class="hero-text">
        <h1 class="hero-title" v-if="title">{{ title }}</h1>
        <p class="hero-subtitle" v-if="subtitle">{{ subtitle }}</p>
        <p class="hero-description" v-if="description">{{ description }}</p>
        
        <div class="hero-buttons" v-if="primaryButton || secondaryButton">
          <button 
            v-if="primaryButton"
            class="btn btn-primary"
            @click="handleButtonClick('primary')"
          >
            {{ primaryButton }}
          </button>
          <button 
            v-if="secondaryButton"
            class="btn btn-secondary"
            @click="handleButtonClick('secondary')"
          >
            {{ secondaryButton }}
          </button>
        </div>
      </div>
      
      <div class="hero-image" v-if="imageUrl">
        <img :src="imageUrl" :alt="imageAlt || title" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeroComponent',
  props: {
    title: {
      type: String,
      default: 'Welcome to Your Media Kit'
    },
    subtitle: {
      type: String,
      default: ''
    },
    description: {
      type: String,
      default: ''
    },
    imageUrl: {
      type: String,
      default: ''
    },
    imageAlt: {
      type: String,
      default: ''
    },
    primaryButton: {
      type: String,
      default: ''
    },
    secondaryButton: {
      type: String,
      default: ''
    },
    theme: {
      type: String,
      default: 'default'
    }
  },
  computed: {
    themeClass() {
      return `hero-theme-${this.theme}`;
    }
  },
  methods: {
    handleButtonClick(buttonType) {
      this.$emit('button-click', {
        type: buttonType,
        component: 'hero'
      });
      
      // Log for debugging
      console.log(`Hero button clicked: ${buttonType}`);
    }
  },
  mounted() {
    console.log('Hero Vue component mounted with props:', this.$props);
  }
};
</script>

<style scoped>
/* Import existing hero styles but use CSS variables for theming */
.gmkb-hero {
  padding: var(--gmkb-spacing-xl, 3rem);
  background-color: var(--gmkb-color-surface, #f9fafb);
  border-radius: var(--gmkb-border-radius, 8px);
  margin-bottom: var(--gmkb-spacing-lg, 2rem);
}

.hero-content {
  display: flex;
  align-items: center;
  gap: var(--gmkb-spacing-xl, 3rem);
  max-width: 1200px;
  margin: 0 auto;
}

.hero-text {
  flex: 1;
}

.hero-title {
  font-size: var(--gmkb-font-size-3xl, 2.5rem);
  font-weight: 700;
  color: var(--gmkb-color-text, #1f2937);
  margin-bottom: var(--gmkb-spacing-sm, 1rem);
  font-family: var(--gmkb-font-heading, inherit);
}

.hero-subtitle {
  font-size: var(--gmkb-font-size-xl, 1.5rem);
  color: var(--gmkb-color-text-secondary, #6b7280);
  margin-bottom: var(--gmkb-spacing-sm, 1rem);
}

.hero-description {
  font-size: var(--gmkb-font-size-lg, 1.125rem);
  color: var(--gmkb-color-text-light, #9ca3af);
  margin-bottom: var(--gmkb-spacing-lg, 2rem);
  line-height: var(--gmkb-line-height-relaxed, 1.625);
}

.hero-buttons {
  display: flex;
  gap: var(--gmkb-spacing-md, 1rem);
  flex-wrap: wrap;
}

.hero-buttons .btn {
  padding: var(--gmkb-spacing-sm, 0.75rem) var(--gmkb-spacing-lg, 1.5rem);
  border-radius: var(--gmkb-border-radius, 6px);
  font-weight: 600;
  font-size: var(--gmkb-font-size-base, 1rem);
  transition: all var(--gmkb-transition-speed, 0.2s);
  cursor: pointer;
  border: none;
}

.hero-buttons .btn-primary {
  background-color: var(--gmkb-color-primary, #3b82f6);
  color: white;
}

.hero-buttons .btn-primary:hover {
  background-color: var(--gmkb-color-primary-hover, #2563eb);
  transform: translateY(-1px);
}

.hero-buttons .btn-secondary {
  background-color: transparent;
  color: var(--gmkb-color-primary, #3b82f6);
  border: 2px solid var(--gmkb-color-primary, #3b82f6);
}

.hero-buttons .btn-secondary:hover {
  background-color: var(--gmkb-color-primary, #3b82f6);
  color: white;
}

.hero-image {
  flex: 0 0 40%;
  min-width: 300px;
}

.hero-image img {
  width: 100%;
  height: auto;
  border-radius: var(--gmkb-border-radius, 8px);
  box-shadow: var(--gmkb-shadow-lg, 0 10px 25px rgba(0,0,0,0.1));
}

/* Responsive design */
@media (max-width: 768px) {
  .hero-content {
    flex-direction: column;
  }
  
  .hero-image {
    flex: 1;
    width: 100%;
    min-width: unset;
  }
  
  .hero-title {
    font-size: var(--gmkb-font-size-2xl, 2rem);
  }
  
  .hero-subtitle {
    font-size: var(--gmkb-font-size-lg, 1.25rem);
  }
}
</style>
