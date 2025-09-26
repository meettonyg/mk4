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
  padding: var(--gmkb-spacing-2xl, 3rem) var(--gmkb-spacing-xl, 2rem);
  background: var(--gmkb-color-primary, #007cba);
  color: white;
}

.cta-container {
  max-width: 800px;
  margin: 0 auto;
  text-align: center;
  position: relative;
  padding: var(--gmkb-spacing-xl, 2rem);
}

.cta-title {
  font-family: var(--gmkb-font-heading, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-3xl, 2.5rem);
  font-weight: var(--gmkb-font-weight-bold, 700);
  line-height: var(--gmkb-line-height-heading, 1.2);
  margin-bottom: var(--gmkb-spacing-md, 1rem);
  color: white;
}

.cta-description {
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  line-height: var(--gmkb-line-height-base, 1.6);
  margin-bottom: var(--gmkb-spacing-xl, 2rem);
  opacity: 0.95;
  color: white;
}

.cta-buttons {
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: var(--gmkb-spacing-md, 1rem);
}

.cta-button {
  display: inline-block;
  padding: var(--gmkb-spacing-md, 1rem) var(--gmkb-spacing-xl, 2rem);
  font-family: var(--gmkb-font-primary, 'Inter', system-ui, sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.1rem);
  font-weight: var(--gmkb-font-weight-bold, 600);
  text-decoration: none;
  border-radius: var(--gmkb-border-radius, 4px);
  transition: var(--gmkb-transition, all 0.3s ease);
  cursor: pointer;
}

.cta-button.primary {
  background: white;
  color: var(--gmkb-color-primary, #007cba);
}

.cta-button.primary:hover {
  background: var(--gmkb-color-surface, #f0f0f0);
  transform: translateY(-2px);
  box-shadow: var(--gmkb-shadow-md, 0 4px 6px rgba(0,0,0,0.1));
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
    font-size: var(--gmkb-font-size-2xl, 2rem);
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
