<template>
  <div 
    class="hero-component gmkb-component" 
    :class="[`hero--${alignment}`, { 'hero--has-bg': backgroundImage }]"
    :style="heroStyle"
    :data-component-id="componentId"
  >
    <div class="hero__overlay"></div>
    <div class="hero__content">
      <h1 class="hero__title" v-if="displayTitle">{{ displayTitle }}</h1>
      <p class="hero__subtitle" v-if="displaySubtitle">{{ displaySubtitle }}</p>
      <div class="hero__actions" v-if="ctaText">
        <a 
          :href="ctaUrl" 
          class="hero__cta btn btn--primary"
          @click="handleCtaClick"
        >
          {{ ctaText }}
        </a>
      </div>
    </div>
    
    <!-- Component controls (integrated with existing system) -->
    <div class="component-controls" v-if="isSelected">
      <button @click="$emit('edit')" class="control-btn" title="Edit">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
        </svg>
      </button>
      <button @click="$emit('duplicate')" class="control-btn" title="Duplicate">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
          <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
        </svg>
      </button>
      <button @click="$emit('delete')" class="control-btn control-btn--danger" title="Delete">
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <polyline points="3 6 5 6 21 6"></polyline>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
        </svg>
      </button>
    </div>
  </div>
</template>

<script>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

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
    backgroundImage: {
      type: String,
      default: ''
    },
    ctaText: {
      type: String,
      default: ''
    },
    ctaUrl: {
      type: String,
      default: '#'
    },
    alignment: {
      type: String,
      default: 'center',
      validator: (value) => ['left', 'center', 'right'].includes(value)
    },
    componentId: {
      type: String,
      required: true
    }
  },
  
  emits: ['edit', 'duplicate', 'delete', 'cta-click'],
  
  setup(props, { emit }) {
    const isSelected = ref(false);
    const store = useMediaKitStore();
    const { fullName, tagline, headshotUrl } = usePodsData();
    
    // Use Pods data as fallbacks if component props are empty
    const displayTitle = computed(() => {
      return props.title || fullName.value || 'Welcome to Your Media Kit';
    });
    
    const displaySubtitle = computed(() => {
      return props.subtitle || tagline.value || '';
    });
    
    const displayBackgroundImage = computed(() => {
      return props.backgroundImage || headshotUrl.value || '';
    });
    
    const heroStyle = computed(() => {
      const style = {};
      if (displayBackgroundImage.value) {
        style.backgroundImage = `url(${displayBackgroundImage.value})`;
      }
      return style;
    });
    
    const handleCtaClick = (e) => {
      emit('cta-click', e);
      // Track analytics if needed
      console.log('Hero CTA clicked:', props.ctaUrl);
    };
    
    const handleSelection = (e) => {
      const target = e.target.closest('[data-component-id]');
      if (target && target.dataset.componentId === props.componentId) {
        isSelected.value = true;
      } else {
        isSelected.value = false;
      }
    };
    
    onMounted(() => {
      // Listen for selection events
      document.addEventListener('click', handleSelection);
      
      // ROOT FIX: No polling or global checking - use event-driven approach
      // Notify store that component has mounted
      if (store.components[props.componentId]) {
        console.log('Hero Vue component mounted:', props.componentId);
        
        // Dispatch custom event for integration
        document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
          detail: {
            type: 'hero',
            id: props.componentId,
            props: props,
            podsDataUsed: !props.title && fullName.value
          }
        }));
      }
    });
    
    onUnmounted(() => {
      document.removeEventListener('click', handleSelection);
    });
    
    return {
      isSelected,
      heroStyle,
      handleCtaClick,
      displayTitle,
      displaySubtitle,
      displayBackgroundImage
    };
  }
};
</script>

<style scoped>
.hero-component {
  position: relative;
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  background-color: var(--gmkb-color-surface, #f8f9fa);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  overflow: hidden;
  transition: all 0.3s ease;
}

.hero--has-bg {
  color: white;
}

.hero__overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, 
    rgba(0, 0, 0, 0.4) 0%, 
    rgba(0, 0, 0, 0.2) 100%);
  opacity: 0;
  transition: opacity 0.3s ease;
  pointer-events: none;
}

.hero--has-bg .hero__overlay {
  opacity: 1;
}

.hero__content {
  position: relative;
  z-index: 1;
  max-width: 800px;
  width: 100%;
  text-align: center;
}

.hero--left .hero__content {
  text-align: left;
}

.hero--right .hero__content {
  text-align: right;
}

.hero__title {
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  margin: 0 0 1rem;
  color: var(--gmkb-color-text, #1a1a1a);
  line-height: 1.2;
}

.hero--has-bg .hero__title {
  color: white;
  text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
}

.hero__subtitle {
  font-size: clamp(1rem, 2vw, 1.25rem);
  margin: 0 0 2rem;
  color: var(--gmkb-color-text-light, #666);
  line-height: 1.6;
}

.hero--has-bg .hero__subtitle {
  color: rgba(255, 255, 255, 0.95);
  text-shadow: 0 1px 2px rgba(0, 0, 0, 0.3);
}

.hero__actions {
  margin-top: 2rem;
}

.hero__cta {
  display: inline-block;
  padding: 12px 32px;
  font-size: 1rem;
  font-weight: 600;
  text-decoration: none;
  border-radius: var(--gmkb-border-radius, 6px);
  transition: all 0.3s ease;
  background-color: var(--gmkb-color-primary, #3b82f6);
  color: white;
  border: none;
  cursor: pointer;
}

.hero__cta:hover {
  background-color: var(--gmkb-color-primary-hover, #2563eb);
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.hero--has-bg .hero__cta {
  background-color: white;
  color: var(--gmkb-color-primary, #3b82f6);
}

.hero--has-bg .hero__cta:hover {
  background-color: #f8f9fa;
}

/* Component controls */
.component-controls {
  position: absolute;
  top: 10px;
  right: 10px;
  display: flex;
  gap: 8px;
  opacity: 0;
  transition: opacity 0.3s ease;
  z-index: 10;
}

.hero-component:hover .component-controls {
  opacity: 1;
}

.control-btn {
  width: 32px;
  height: 32px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: white;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.control-btn:hover {
  background: #f8f9fa;
  border-color: #cbd5e1;
}

.control-btn--danger:hover {
  background: #fee2e2;
  border-color: #ef4444;
  color: #ef4444;
}

/* Responsive */
@media (max-width: 768px) {
  .hero-component {
    padding: 40px 20px;
    min-height: 300px;
  }
  
  .hero__title {
    font-size: 2rem;
  }
  
  .hero__subtitle {
    font-size: 1rem;
  }
}
</style>
