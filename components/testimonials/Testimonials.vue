<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <div 
    class="component-root testimonials-component"
    :data-component-id="componentId"
  >
    <h2 v-if="title" class="testimonials-title">{{ title }}</h2>
    <p v-if="description" class="testimonials-description">{{ description }}</p>
    
    <div class="testimonials-carousel">
      <button 
        v-if="displayTestimonials.length > 1"
        @click="previousSlide" 
        class="carousel-control prev"
        aria-label="Previous testimonial"
      >‹</button>
      
      <div class="testimonial-slide">
        <div class="testimonial-content">
          <div class="quote-mark">"</div>
          <p class="testimonial-text">{{ currentTestimonial.text }}</p>
          <div class="testimonial-author">
            <img 
              v-if="currentTestimonial.image" 
              :src="currentTestimonial.image" 
              :alt="currentTestimonial.author"
              class="author-image"
            />
            <div>
              <h4 class="author-name">{{ currentTestimonial.author }}</h4>
              <p v-if="currentTestimonial.title" class="author-title">{{ currentTestimonial.title }}</p>
            </div>
          </div>
        </div>
      </div>
      
      <button 
        v-if="displayTestimonials.length > 1"
        @click="nextSlide" 
        class="carousel-control next"
        aria-label="Next testimonial"
      >›</button>
    </div>
    
    <!-- Dots indicator -->
    <div v-if="displayTestimonials.length > 1" class="carousel-indicators">
      <button
        v-for="(testimonial, index) in displayTestimonials"
        :key="index"
        @click="currentIndex = index"
        :class="['indicator', { active: currentIndex === index }]"
        :aria-label="`Go to testimonial ${index + 1}`"
      ></button>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';
import { useMediaKitStore } from '../../src/stores/mediaKit';
import { usePodsData } from '../../src/composables/usePodsData';

const props = defineProps({
  componentId: {
    type: String,
    required: true
  },
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
  },
  isEditing: {
    type: Boolean,
    default: false
  },
  isSelected: {
    type: Boolean,
    default: false
  }
});

// Store and composables
const store = useMediaKitStore();
const { rawPodsData } = usePodsData();

// Local state
const currentIndex = ref(0);
let interval = null;

// Extract data from both data and props for compatibility
const title = computed(() => props.data?.title || props.props?.title || 'What People Say');
const description = computed(() => props.data?.description || props.props?.description || '');

const displayTestimonials = computed(() => {
  // Handle array format
  if (Array.isArray(props.data?.testimonials) && props.data.testimonials.length > 0) {
    return props.data.testimonials;
  }
  
  // Check for Pods testimonials
  const podsTestimonials = [];
  for (let i = 1; i <= 5; i++) {
    const testimonialText = rawPodsData.value?.[`testimonial_${i}_text`];
    const testimonialAuthor = rawPodsData.value?.[`testimonial_${i}_author`];
    
    if (testimonialText) {
      podsTestimonials.push({
        text: testimonialText,
        author: testimonialAuthor || `Client ${i}`,
        title: rawPodsData.value?.[`testimonial_${i}_title`] || '',
        image: rawPodsData.value?.[`testimonial_${i}_image`] || ''
      });
    }
  }
  
  return podsTestimonials.length > 0 ? podsTestimonials : [];
});

const currentTestimonial = computed(() => {
  if (!displayTestimonials.value || displayTestimonials.value.length === 0) {
    return {
      text: 'Add your testimonials to showcase what people say about you.',
      author: 'Client Name',
      title: 'Position',
      image: ''
    };
  }
  
  const safeIndex = Math.max(0, Math.min(currentIndex.value, displayTestimonials.value.length - 1));
  const testimonial = displayTestimonials.value[safeIndex];
  
  return {
    text: testimonial?.text || '',
    author: testimonial?.author || 'Client',
    title: testimonial?.title || testimonial?.role || '',
    image: testimonial?.image || ''
  };
});

const nextSlide = () => {
  if (displayTestimonials.value.length > 1) {
    currentIndex.value = (currentIndex.value + 1) % displayTestimonials.value.length;
  }
};

const previousSlide = () => {
  if (displayTestimonials.value.length > 1) {
    currentIndex.value = currentIndex.value === 0 
      ? displayTestimonials.value.length - 1 
      : currentIndex.value - 1;
  }
};

// Lifecycle
onMounted(() => {
  if (store.components[props.componentId]) {
    document.dispatchEvent(new CustomEvent('gmkb:vue-component-mounted', {
      detail: {
        type: 'testimonials',
        id: props.componentId,
        podsDataUsed: displayTestimonials.value.some(testimonial => 
          rawPodsData.value && Object.values(rawPodsData.value).includes(testimonial.text)
        )
      }
    }));
  }
  
  // Auto-advance carousel if enabled
  const autoplay = props.data?.autoplay ?? props.props?.autoplay;
  if (autoplay !== false && displayTestimonials.value.length > 1) {
    const autoplayInterval = props.data?.autoplayInterval || props.props?.autoplayInterval || 5000;
    interval = setInterval(() => {
      nextSlide();
    }, autoplayInterval);
  }
});

onUnmounted(() => {
  if (interval) {
    clearInterval(interval);
  }
});
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.testimonials-component {
  /* Styles applied via inline styles from ComponentStyleService */
}

.testimonials-title {
  text-align: center;
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  color: inherit;
}

.testimonials-description {
  text-align: center;
  color: #64748b;
  margin: 0 0 2rem 0;
  line-height: 1.6;
}

.testimonials-carousel {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
  max-width: 900px;
  margin: 0 auto;
}

.carousel-control {
  background: white;
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: 0 2px 8px rgba(0,0,0,0.1);
  transition: all 0.3s ease;
  color: #1e293b;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.carousel-control:hover {
  background: #3b82f6;
  color: white;
  transform: scale(1.1);
}

.testimonial-slide {
  flex: 1;
  background: #f8fafc;
  padding: 2rem;
  border-radius: 12px;
  min-height: 250px;
  display: flex;
  align-items: center;
}

.testimonial-content {
  width: 100%;
}

.quote-mark {
  font-size: 3rem;
  color: #3b82f6;
  line-height: 1;
  margin-bottom: -0.5rem;
  font-family: Georgia, serif;
}

.testimonial-text {
  color: #1e293b;
  font-size: 1.125rem;
  line-height: 1.7;
  margin: 0 0 1.5rem 0;
  font-style: italic;
  min-height: 80px;
}

.testimonial-author {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.author-image {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  object-fit: cover;
  border: 2px solid #e2e8f0;
}

.author-name {
  font-size: 1rem;
  font-weight: 600;
  margin: 0 0 0.25rem 0;
  color: inherit;
}

.author-title {
  color: #64748b;
  font-size: 0.9rem;
  margin: 0;
}

.carousel-indicators {
  display: flex;
  justify-content: center;
  gap: 0.5rem;
  margin-top: 1.5rem;
}

.indicator {
  width: 10px;
  height: 10px;
  border-radius: 50%;
  border: none;
  background: #cbd5e1;
  cursor: pointer;
  transition: all 0.15s ease;
  padding: 0;
}

.indicator:hover {
  background: #94a3b8;
}

.indicator.active {
  background: #3b82f6;
  transform: scale(1.2);
}

/* Responsive */
@media (max-width: 768px) {
  .testimonials-carousel {
    flex-direction: column;
  }
  
  .carousel-control {
    display: none;
  }
  
  .testimonial-slide {
    padding: 1.5rem;
    min-height: 200px;
  }
  
  .testimonials-title {
    font-size: 1.5rem;
  }
  
  .testimonial-text {
    font-size: 1rem;
  }
}
</style>
