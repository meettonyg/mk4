<template>
  <div class="gmkb-logo-grid">
    <h3 v-if="title" class="logo-grid-title">{{ title }}</h3>
    <p v-if="subtitle" class="logo-grid-subtitle">{{ subtitle }}</p>
    
    <div :class="['logo-container', `columns-${columns}`, `style-${displayStyle}`]">
      <div 
        v-for="(logo, index) in displayLogos" 
        :key="`logo-${index}`"
        class="logo-item"
        :class="{ 'has-link': logo.link }"
      >
        <a 
          v-if="logo.link" 
          :href="logo.link" 
          :target="openInNewTab ? '_blank' : '_self'"
          rel="noopener noreferrer"
        >
          <img 
            :src="logo.url" 
            :alt="logo.alt || logo.name || `Logo ${index + 1}`"
            :class="{ 'grayscale': grayscaleEffect }"
          />
        </a>
        <img 
          v-else
          :src="logo.url" 
          :alt="logo.alt || logo.name || `Logo ${index + 1}`"
          :class="{ 'grayscale': grayscaleEffect }"
        />
        <div v-if="showNames && logo.name" class="logo-name">
          {{ logo.name }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'LogoGrid',
  props: {
    // Pods fields
    guest_logo: {
      type: [String, Object],
      default: ''
    },
    logo_image: {
      type: [String, Object],
      default: ''
    },
    // Manual logos array
    logos: {
      type: Array,
      default: () => []
    },
    // Display options
    title: {
      type: String,
      default: ''
    },
    subtitle: {
      type: String,
      default: ''
    },
    columns: {
      type: Number,
      default: 4,
      validator: value => [2, 3, 4, 5, 6, 8].includes(value)
    },
    displayStyle: {
      type: String,
      default: 'boxed',
      validator: value => ['boxed', 'minimal', 'circular'].includes(value)
    },
    grayscaleEffect: {
      type: Boolean,
      default: true
    },
    showNames: {
      type: Boolean,
      default: false
    },
    openInNewTab: {
      type: Boolean,
      default: true
    }
  },
  computed: {
    displayLogos() {
      const logos = [];
      
      // Use manual logos if provided
      if (this.logos && this.logos.length > 0) {
        logos.push(...this.normalizeLogos(this.logos));
      } else {
        // Use Pods logos
        if (this.guest_logo) {
          logos.push(this.normalizeLogo(this.guest_logo, 'Guest Logo'));
        }
        if (this.logo_image) {
          logos.push(this.normalizeLogo(this.logo_image, 'Company Logo'));
        }
      }
      
      return logos.filter(logo => logo && logo.url);
    }
  },
  mounted() {
    // Auto-load from Pods data if available
    if (window.gmkbData?.pods_data && this.displayLogos.length === 0) {
      this.loadFromPodsData();
    }
  },
  methods: {
    normalizeLogo(logo, defaultName = '') {
      if (!logo) return null;
      
      if (typeof logo === 'string') {
        return {
          url: logo,
          name: defaultName,
          alt: defaultName,
          link: ''
        };
      }
      
      return {
        url: logo.url || logo.src || logo,
        name: logo.name || logo.title || defaultName,
        alt: logo.alt || logo.name || defaultName,
        link: logo.link || logo.href || ''
      };
    },
    normalizeLogos(logos) {
      if (!logos) return [];
      const logoArray = Array.isArray(logos) ? logos : [logos];
      return logoArray.map((logo, index) => this.normalizeLogo(logo, `Logo ${index + 1}`));
    },
    loadFromPodsData() {
      const pods = window.gmkbData.pods_data;
      if (!pods) return;
      
      const updates = {};
      
      if (pods.guest_logo) updates.guest_logo = pods.guest_logo;
      if (pods.logo_image) updates.logo_image = pods.logo_image;
      
      if (Object.keys(updates).length > 0) {
        this.$emit('update:modelValue', updates);
      }
    }
  }
};
</script>

<style scoped>
.gmkb-logo-grid {
  padding: var(--gmkb-spacing-lg, 1.5rem) 0;
}

.logo-grid-title {
  font-family: var(--gmkb-font-heading, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif);
  font-size: var(--gmkb-font-size-lg, 1.25rem);
  font-weight: 600;
  color: var(--gmkb-color-text, #333);
  margin-bottom: var(--gmkb-spacing-sm, 0.5rem);
  text-align: center;
}

.logo-grid-subtitle {
  font-size: var(--gmkb-font-size-base, 1rem);
  color: var(--gmkb-color-text-light, #666);
  text-align: center;
  margin-bottom: var(--gmkb-spacing-lg, 1.5rem);
}

/* Logo Container */
.logo-container {
  display: grid;
  gap: var(--gmkb-spacing-md, 1rem);
  align-items: center;
}

.logo-container.columns-2 { grid-template-columns: repeat(2, 1fr); }
.logo-container.columns-3 { grid-template-columns: repeat(3, 1fr); }
.logo-container.columns-4 { grid-template-columns: repeat(4, 1fr); }
.logo-container.columns-5 { grid-template-columns: repeat(5, 1fr); }
.logo-container.columns-6 { grid-template-columns: repeat(6, 1fr); }
.logo-container.columns-8 { grid-template-columns: repeat(8, 1fr); }

/* Logo Items */
.logo-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  transition: transform var(--gmkb-transition-speed, 0.3s);
}

.logo-item.has-link {
  cursor: pointer;
}

.logo-item:hover {
  transform: translateY(-5px);
}

.logo-item a {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
}

.logo-item img {
  max-width: 100%;
  height: auto;
  object-fit: contain;
  transition: all var(--gmkb-transition-speed, 0.3s);
}

/* Display Styles */
.logo-container.style-boxed .logo-item {
  padding: var(--gmkb-spacing-md, 1rem);
  background: var(--gmkb-color-surface, #ffffff);
  border: 1px solid var(--gmkb-color-border, #e0e0e0);
  border-radius: var(--gmkb-border-radius, 8px);
  min-height: 120px;
}

.logo-container.style-boxed .logo-item:hover {
  box-shadow: var(--gmkb-shadow-md, 0 4px 6px rgba(0, 0, 0, 0.1));
  border-color: var(--gmkb-color-primary, #007bff);
}

.logo-container.style-boxed .logo-item img {
  max-height: 60px;
}

.logo-container.style-minimal .logo-item {
  padding: var(--gmkb-spacing-sm, 0.5rem);
}

.logo-container.style-minimal .logo-item img {
  max-height: 50px;
}

.logo-container.style-circular .logo-item {
  padding: var(--gmkb-spacing-md, 1rem);
}

.logo-container.style-circular .logo-item img {
  width: 80px;
  height: 80px;
  border-radius: 50%;
  padding: var(--gmkb-spacing-sm, 0.5rem);
  background: var(--gmkb-color-surface, #ffffff);
  border: 2px solid var(--gmkb-color-border, #e0e0e0);
}

/* Grayscale Effect */
.logo-item img.grayscale {
  filter: grayscale(100%);
  opacity: 0.7;
}

.logo-item:hover img.grayscale {
  filter: grayscale(0%);
  opacity: 1;
}

/* Logo Names */
.logo-name {
  margin-top: var(--gmkb-spacing-sm, 0.5rem);
  font-size: var(--gmkb-font-size-sm, 0.875rem);
  color: var(--gmkb-color-text-light, #666);
  text-align: center;
}

/* Responsive */
@media (max-max-width: var(--gmkb-max-width-content, 768px)) {
  .logo-container.columns-5,
  .logo-container.columns-6,
  .logo-container.columns-8 {
    grid-template-columns: repeat(3, 1fr);
  }
  
  .logo-container.columns-4 {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 480px) {
  .logo-container {
    grid-template-columns: repeat(2, 1fr) !important;
  }
  
  .logo-container.style-boxed .logo-item {
    min-height: 100px;
  }
  
  .logo-container.style-boxed .logo-item img {
    max-height: 40px;
  }
}
</style>
