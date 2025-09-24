<template>
  <div class="gmkb-hero-component" :data-component-id="componentId">
    <div class="hero-container">
      <div class="hero-content">
        <h1 v-if="title" class="hero-title">{{ title }}</h1>
        <h2 v-if="subtitle" class="hero-subtitle">{{ subtitle }}</h2>
        <p v-if="description" class="hero-description">{{ description }}</p>
        
        <div v-if="hasButtons" class="hero-buttons">
          <button 
            v-for="(button, index) in buttons" 
            :key="index"
            :class="['hero-button', button.style || 'primary']"
            @click="handleButtonClick(button)"
          >
            {{ button.text }}
          </button>
        </div>
      </div>
      
      <div v-if="imageUrl" class="hero-image">
        <img :src="imageUrl" :alt="title || 'Hero Image'" />
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'HeroRenderer',
  props: {
    componentId: {
      type: String,
      required: true
    },
    data: {
      type: Object,
      default: () => ({})
    }
  },
  computed: {
    title() {
      return this.data.title || this.data.headline || 'Welcome to Our Media Kit'
    },
    subtitle() {
      return this.data.subtitle || this.data.subheadline || ''
    },
    description() {
      return this.data.description || this.data.content || ''
    },
    imageUrl() {
      return this.data.imageUrl || this.data.backgroundImage || ''
    },
    buttons() {
      if (Array.isArray(this.data.buttons)) {
        return this.data.buttons
      }
      
      const buttonList = []
      if (this.data.primaryButtonText) {
        buttonList.push({
          text: this.data.primaryButtonText,
          url: this.data.primaryButtonUrl || '#',
          style: 'primary'
        })
      }
      if (this.data.secondaryButtonText) {
        buttonList.push({
          text: this.data.secondaryButtonText,
          url: this.data.secondaryButtonUrl || '#',
          style: 'secondary'
        })
      }
      return buttonList
    },
    hasButtons() {
      return this.buttons.length > 0
    },
    containerStyle() {
      // ROOT FIX: Remove inline styles, rely on CSS variables from theme
      return {}
    }
  },
  methods: {
    handleButtonClick(button) {
      if (button.url && button.url !== '#') {
        if (button.target === '_blank') {
          window.open(button.url, '_blank')
        } else {
          window.location.href = button.url
        }
      }
      this.$emit('button-click', button)
    }
  }
}
</script>

<style scoped>
.gmkb-hero-component {
  padding: var(--gmkb-spacing-3xl, 4rem) var(--gmkb-spacing-xl, 2rem);
  background: var(--gmkb-color-surface, #ffffff);
  min-height: 400px;
  display: flex;
  align-items: center;
  color: var(--gmkb-color-text, #1e293b);
}

.hero-container {
  max-width: var(--gmkb-container-max-width, 1200px);
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: var(--gmkb-spacing-2xl, 3rem);
  width: 100%;
}

.hero-content {
  flex: 1;
}

.hero-title {
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-3xl, 3rem);
  color: var(--gmkb-color-text, #1e293b);
  margin-bottom: var(--gmkb-spacing-md, 1rem);
  font-weight: var(--gmkb-font-weight-bold, 700);
  line-height: var(--gmkb-line-height-heading, 1.2);
}

.hero-subtitle {
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-xl, 1.5rem);
  color: var(--gmkb-color-text-light, #64748b);
  margin-bottom: var(--gmkb-spacing-md, 1rem);
  font-weight: var(--gmkb-font-weight-medium, 500);
  line-height: var(--gmkb-line-height-heading, 1.2);
}

.hero-description {
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.125rem);
  color: var(--gmkb-color-text-light, #64748b);
  margin-bottom: var(--gmkb-spacing-xl, 2rem);
  line-height: var(--gmkb-line-height-base, 1.6);
}

.hero-buttons {
  display: flex;
  gap: var(--gmkb-spacing-md, 1rem);
  flex-wrap: wrap;
}

.hero-button {
  padding: var(--gmkb-spacing-sm, 0.75rem) var(--gmkb-spacing-xl, 2rem);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-base, 1rem);
  font-weight: var(--gmkb-font-weight-medium, 600);
  border: none;
  border-radius: var(--gmkb-border-radius, 0.375rem);
  cursor: pointer;
  transition: var(--gmkb-transition, all 0.3s ease);
}

.hero-button.primary {
  background: var(--gmkb-color-primary, #3b82f6);
  color: white;
}

.hero-button.primary:hover {
  background: var(--gmkb-color-primary-hover, #2563eb);
  transform: translateY(-2px);
  box-shadow: var(--gmkb-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
}

.hero-button.secondary {
  background: transparent;
  color: var(--gmkb-color-primary, #3b82f6);
  border: 2px solid var(--gmkb-color-primary, #3b82f6);
}

.hero-button.secondary:hover {
  background: var(--gmkb-color-primary, #3b82f6);
  color: white;
}

.hero-image {
  flex: 0 0 40%;
  max-width: 500px;
}

.hero-image img {
  width: 100%;
  height: auto;
  border-radius: var(--gmkb-border-radius, 0.5rem);
  box-shadow: var(--gmkb-shadow-lg, 0 10px 25px rgba(0, 0, 0, 0.1));
}

@media (max-width: 768px) {
  .hero-container {
    flex-direction: column;
    text-align: center;
  }
  
  .hero-title {
    font-size: 2rem;
  }
  
  .hero-buttons {
    justify-content: center;
  }
  
  .hero-image {
    max-width: 100%;
  }
}
</style>
