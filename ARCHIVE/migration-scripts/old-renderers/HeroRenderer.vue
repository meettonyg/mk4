<template>
  <div class="hero-component">
    <div class="hero-background" :style="backgroundStyle">
      <div class="hero-content">
        <h1 class="hero-title" contenteditable="true" @blur="updateTitle">
          {{ title }}
        </h1>
        <p class="hero-subtitle" contenteditable="true" @blur="updateSubtitle">
          {{ subtitle }}
        </p>
        <div class="hero-buttons" v-if="buttons.length > 0">
          <button 
            v-for="(button, index) in buttons" 
            :key="index"
            class="hero-button"
            :class="`hero-button--${button.style || 'primary'}`"
          >
            {{ button.text }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed } from 'vue';

export default {
  name: 'HeroRenderer',
  
  props: {
    id: String,
    data: {
      type: Object,
      default: () => ({})
    },
    settings: {
      type: Object,
      default: () => ({})
    }
  },
  
  emits: ['update'],
  
  setup(props, { emit }) {
    // Reactive data
    const title = ref(props.data.title || 'Welcome to My Media Kit');
    const subtitle = ref(props.data.subtitle || 'Discover what I can offer');
    const backgroundImage = ref(props.data.backgroundImage || '');
    const buttons = ref(props.data.buttons || []);
    
    // Computed
    const backgroundStyle = computed(() => {
      if (backgroundImage.value) {
        return {
          backgroundImage: `url(${backgroundImage.value})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center'
        };
      }
      return {
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
      };
    });
    
    // Methods
    const updateTitle = (e) => {
      title.value = e.target.innerText;
      emit('update', { data: { ...props.data, title: title.value } });
    };
    
    const updateSubtitle = (e) => {
      subtitle.value = e.target.innerText;
      emit('update', { data: { ...props.data, subtitle: subtitle.value } });
    };
    
    return {
      title,
      subtitle,
      buttons,
      backgroundStyle,
      updateTitle,
      updateSubtitle
    };
  }
};
</script>

<style scoped>
.hero-component {
  width: 100%;
  margin: 0;
}

.hero-background {
  min-height: 400px;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 60px 20px;
  position: relative;
}

.hero-content {
  text-align: center;
  color: white;
  max-width: 800px;
  z-index: 1;
}

.hero-title {
  font-size: 48px;
  font-weight: bold;
  margin-bottom: 20px;
  text-shadow: 2px 2px 4px rgba(0,0,0,0.3);
}

.hero-subtitle {
  font-size: 20px;
  margin-bottom: 30px;
  opacity: 0.95;
  text-shadow: 1px 1px 2px rgba(0,0,0,0.3);
}

.hero-buttons {
  display: flex;
  gap: 15px;
  justify-content: center;
}

.hero-button {
  padding: 12px 30px;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.3s;
}

.hero-button--primary {
  background: white;
  color: #667eea;
}

.hero-button--primary:hover {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0,0,0,0.2);
}

.hero-button--secondary {
  background: transparent;
  color: white;
  border: 2px solid white;
}

.hero-button--secondary:hover {
  background: white;
  color: #667eea;
}

[contenteditable="true"]:hover {
  outline: 2px dashed rgba(255,255,255,0.5);
  outline-offset: 4px;
}

[contenteditable="true"]:focus {
  outline: 2px solid rgba(255,255,255,0.8);
  outline-offset: 4px;
}
</style>
