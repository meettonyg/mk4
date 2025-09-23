<template>
  <div class="gmkb-cta-component" :data-component-id="componentId">
    <div class="cta-container" :style="containerStyle">
      <h2 v-if="title" class="cta-title">{{ title }}</h2>
      <p v-if="description" class="cta-description">{{ description }}</p>
      
      <div class="cta-buttons">
        <a
          v-for="(button, index) in buttons"
          :key="index"
          :href="button.url"
          :class="['cta-button', button.style || 'primary']"
          :target="button.target || '_self'"
        >
          {{ button.text }}
        </a>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'CallToActionRenderer',
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
      return this.data.title || 'Ready to Take Action?'
    },
    description() {
      return this.data.description || ''
    },
    buttons() {
      if (Array.isArray(this.data.buttons)) {
        return this.data.buttons
      }
      
      // Build from individual button fields
      const buttonsList = []
      
      if (this.data.button_text && this.data.button_url) {
        buttonsList.push({
          text: this.data.button_text,
          url: this.data.button_url,
          style: 'primary'
        })
      }
      
      if (this.data.secondary_button_text && this.data.secondary_button_url) {
        buttonsList.push({
          text: this.data.secondary_button_text,
          url: this.data.secondary_button_url,
          style: 'secondary'
        })
      }
      
      return buttonsList.length ? buttonsList : this.getDefaultButtons()
    },
    containerStyle() {
      const styles = {}
      
      if (this.data.background_color) {
        styles.background = this.data.background_color
      }
      
      if (this.data.background_image) {
        styles.backgroundImage = `url(${this.data.background_image})`
        styles.backgroundSize = 'cover'
        styles.backgroundPosition = 'center'
      }
      
      return styles
    }
  },
  methods: {
    getDefaultButtons() {
      return [
        {
          text: 'Book Now',
          url: '#',
          style: 'primary'
        },
        {
          text: 'Learn More',
          url: '#',
          style: 'secondary'
        }
      ]
    }
  }
}
</script>

<style scoped>
.gmkb-cta-component {
  padding: 3rem 2rem;
  background: var(--gmkb-color-primary, #007cba);
  color: white;
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  padding: 2rem;
}

.cta-title {
  font-size: var(--gmkb-font-size-xl, 2.5rem);
  margin-bottom: 1rem;
}

.cta-description {
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  margin-bottom: 2rem;
  opacity: 0.95;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 1rem;
}

.cta-button {
  display: inline-block;
  padding: 1rem 2rem;
  font-size: 1.1rem;
  text-decoration: none;
  border-radius: var(--gmkb-border-radius, 4px);
  transition: all 0.3s ease;
  font-weight: 600;
}

.cta-button.primary {
  background: white;
  color: var(--gmkb-color-primary, #007cba);
}

.cta-button.primary:hover {
  background: #f0f0f0;
  transform: translateY(-2px);
}

.cta-button.secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.cta-button.secondary:hover {
  background: white;
  color: var(--gmkb-color-primary, #007cba);
}

@media (max-width: 768px) {
  .cta-title {
    font-size: 2rem;
  }
  
  .cta-buttons {
    flex-direction: column;
    align-items: center;
  }
  
  .cta-button {
    width: 100%;
    max-width: 300px;
  }
}
</style>
