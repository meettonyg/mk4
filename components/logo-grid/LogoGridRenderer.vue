<template>
  <div class="gmkb-logo-grid-component" :data-component-id="componentId">
    <div class="logo-container">
      <h2 v-if="title" class="logo-title">{{ title }}</h2>
      <p v-if="description" class="logo-description">{{ description }}</p>
      
      <div class="logo-grid" :class="gridStyle">
        <div v-for="(logo, index) in logos" :key="index" class="logo-item">
          <a v-if="logo.link" :href="logo.link" target="_blank" rel="noopener">
            <img :src="logo.url" :alt="logo.name || `Logo ${index + 1}`" />
          </a>
          <img v-else :src="logo.url" :alt="logo.name || `Logo ${index + 1}`" />
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LogoGridRenderer',
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
      return this.data.title || 'Featured In'
    },
    description() {
      return this.data.description || ''
    },
    gridStyle() {
      return this.data.grid_style || 'grid-auto'
    },
    logos() {
      if (Array.isArray(this.data.logos)) {
        return this.data.logos
      }
      
      const logosList = []
      for (let i = 1; i <= 12; i++) {
        if (this.data[`logo_${i}_url`]) {
          logosList.push({
            url: this.data[`logo_${i}_url`],
            name: this.data[`logo_${i}_name`] || '',
            link: this.data[`logo_${i}_link`] || ''
          })
        }
      }
      
      return logosList.length ? logosList : this.getDefaultLogos()
    }
  },
  methods: {
    getDefaultLogos() {
      return [
        { url: 'https://via.placeholder.com/150x75/f0f0f0/666?text=Forbes', name: 'Forbes' },
        { url: 'https://via.placeholder.com/150x75/f0f0f0/666?text=Inc', name: 'Inc Magazine' },
        { url: 'https://via.placeholder.com/150x75/f0f0f0/666?text=WSJ', name: 'Wall Street Journal' },
        { url: 'https://via.placeholder.com/150x75/f0f0f0/666?text=CNN', name: 'CNN' },
        { url: 'https://via.placeholder.com/150x75/f0f0f0/666?text=BBC', name: 'BBC' },
        { url: 'https://via.placeholder.com/150x75/f0f0f0/666?text=TEDx', name: 'TEDx' }
      ]
    }
  }
}
</script>

<style scoped>
.gmkb-logo-grid-component {
  padding: 3rem 2rem;
  background: var(--gmkb-color-background, #f8f9fa);
}

.logo-container {
  max-width: 1200px;
  margin: 0 auto;
}

.logo-title {
  text-align: center;
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-xl, 2rem);
  margin-bottom: 1rem;
}

.logo-description {
  text-align: center;
  color: var(--gmkb-color-text-light, #666);
  margin-bottom: 3rem;
}

.logo-grid {
  display: grid;
  gap: 2rem;
  align-items: center;
  justify-items: center;
}

.logo-grid.grid-auto {
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
}

.logo-grid.grid-3 {
  grid-template-columns: repeat(3, 1fr);
}

.logo-grid.grid-4 {
  grid-template-columns: repeat(4, 1fr);
}

.logo-grid.grid-6 {
  grid-template-columns: repeat(6, 1fr);
}

.logo-item {
  width: 100%;
  max-width: 200px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem;
  background: var(--gmkb-color-surface, #fff);
  border-radius: var(--gmkb-border-radius, 8px);
  transition: all 0.3s ease;
}

.logo-item:hover {
  transform: translateY(-4px);
  box-shadow: var(--gmkb-shadow-md, 0 4px 6px rgba(0,0,0,0.1));
}

.logo-item img {
  width: 100%;
  height: auto;
  max-height: 60px;
  object-fit: contain;
  filter: grayscale(100%);
  opacity: 0.7;
  transition: all 0.3s ease;
}

.logo-item:hover img {
  filter: grayscale(0%);
  opacity: 1;
}

.logo-item a {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

@media (max-width: 768px) {
  .logo-grid.grid-auto {
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  }
  
  .logo-grid.grid-3,
  .logo-grid.grid-4 {
    grid-template-columns: repeat(2, 1fr);
  }
  
  .logo-grid.grid-6 {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .logo-item {
    padding: 0.75rem;
  }
}

@media (max-width: 480px) {
  .logo-grid.grid-6 {
    grid-template-columns: repeat(2, 1fr);
  }
}
</style>
