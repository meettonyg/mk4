<template>
  <div class="gmkb-hero-component" :data-component-id="componentId">
    <div class="hero-container" :style="containerStyle">
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
      const styles = {}
      if (this.data.backgroundColor) {
        styles.backgroundColor = this.data.backgroundColor
      }
      if (this.data.textColor) {
        styles.color = this.data.textColor
      }
      return styles
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
  padding: 4rem 2rem;
  background: var(--gmkb-color-background, #f8f9fa);
  min-height: 400px;
  display: flex;
  align-items: center;
}

.hero-container {
  max-width: 1200px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  gap: 3rem;
  width: 100%;
}

.hero-content {
  flex: 1;
}

.hero-title {
  font-size: var(--gmkb-font-size-2xl, 3rem);
  color: var(--gmkb-color-text, #1e293b);
  margin-bottom: 1rem;
  font-weight: 700;
  line-height: 1.2;
}

.hero-subtitle {
  font-size: var(--gmkb-font-size-xl, 1.5rem);
  color: var(--gmkb-color-text-light, #64748b);
  margin-bottom: 1rem;
}

.hero-description {
  font-size: var(--gmkb-font-size-lg, 1.125rem);
  color: var(--gmkb-color-text-light, #64748b);
  margin-bottom: 2rem;
  line-height: 1.6;
}

.hero-buttons {
  display: flex;
  gap: 1rem;
  flex-wrap: wrap;
}

.hero-button {
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border: none;
  border-radius: var(--gmkb-border-radius, 0.375rem);
  cursor: pointer;
  transition: all 0.3s ease;
}

.hero-button.primary {
  background: var(--gmkb-color-primary, #3b82f6);
  color: white;
}

.hero-button.primary:hover {
  background: var(--gmkb-color-primary-hover, #2563eb);
  transform: translateY(-2px);
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
