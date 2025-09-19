<template>
  <div class="hero-component" :style="heroStyle">
    <div class="hero-overlay" v-if="useOverlay"></div>
    <div class="hero-content">
      <h1 v-if="title" class="hero-title">{{ title }}</h1>
      <p v-if="subtitle" class="hero-subtitle">{{ subtitle }}</p>
      <div v-if="showButton && buttonText" class="hero-cta">
        <button 
          @click="handleButtonClick"
          class="hero-button"
          :style="buttonStyle"
        >
          {{ buttonText }}
        </button>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: String,
  data: {
    type: Object,
    default: () => ({})
  },
  props: {
    type: Object,
    default: () => ({})
  },
  settings: {
    type: Object,
    default: () => ({})
  }
});

// Data properties
const title = computed(() => props.data.title || props.props.title || 'Welcome');
const subtitle = computed(() => props.data.subtitle || props.props.subtitle || '');
const backgroundImage = computed(() => props.data.backgroundImage || props.props.backgroundImage || props.data.image);
const backgroundColor = computed(() => props.data.backgroundColor || props.settings.backgroundColor || 'transparent');
const buttonText = computed(() => props.data.buttonText || props.props.buttonText || 'Get Started');
const buttonUrl = computed(() => props.data.buttonUrl || props.props.buttonUrl || '#');

// Settings
const showButton = computed(() => props.settings.showButton ?? true);
const useOverlay = computed(() => props.settings.useOverlay ?? true);
const minHeight = computed(() => props.settings.minHeight || '400px');
const textAlign = computed(() => props.settings.textAlign || 'center');

// Styles
const heroStyle = computed(() => {
  const style = {
    minHeight: minHeight.value,
    backgroundColor: backgroundColor.value,
  };
  
  if (backgroundImage.value) {
    style.backgroundImage = `url(${backgroundImage.value})`;
    style.backgroundSize = 'cover';
    style.backgroundPosition = 'center';
  }
  
  return style;
});

const buttonStyle = computed(() => {
  return {
    backgroundColor: props.settings.buttonColor || 'var(--gmkb-color-primary, #3b82f6)',
    color: props.settings.buttonTextColor || 'white'
  };
});

// Methods
const handleButtonClick = () => {
  if (buttonUrl.value && buttonUrl.value !== '#') {
    if (buttonUrl.value.startsWith('http')) {
      window.open(buttonUrl.value, '_blank');
    } else {
      window.location.href = buttonUrl.value;
    }
  }
};
</script>

<style scoped>
.hero-component {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 30px;
  border-radius: 8px;
  overflow: hidden;
}

.hero-overlay {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: linear-gradient(135deg, rgba(0,0,0,0.4) 0%, rgba(0,0,0,0.6) 100%);
  z-index: 1;
}

.hero-content {
  position: relative;
  z-index: 2;
  max-width: 800px;
  width: 100%;
  text-align: v-bind(textAlign);
}

.hero-title {
  color: var(--gmkb-color-hero-title, #ffffff);
  font-size: clamp(2rem, 5vw, 3.5rem);
  font-weight: 700;
  margin-bottom: 20px;
  line-height: 1.2;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero-subtitle {
  color: var(--gmkb-color-hero-subtitle, rgba(255,255,255,0.9));
  font-size: clamp(1rem, 3vw, 1.5rem);
  margin-bottom: 30px;
  line-height: 1.5;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

.hero-cta {
  margin-top: 30px;
}

.hero-button {
  padding: 14px 32px;
  font-size: 1.1rem;
  font-weight: 600;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 4px 6px rgba(0,0,0,0.1);
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

.hero-button:hover {
  transform: translateY(-2px);
  box-shadow: 0 6px 12px rgba(0,0,0,0.2);
  filter: brightness(1.1);
}

.hero-button:active {
  transform: translateY(0);
}

/* Responsive */
@media (max-width: 768px) {
  .hero-component {
    padding: 40px 20px;
  }
}
</style>
