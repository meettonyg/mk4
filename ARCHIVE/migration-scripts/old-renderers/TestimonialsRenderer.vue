<template>
  <div class="gmkb-testimonials-component" :data-component-id="componentId">
    <div class="testimonials-container">
      <h2 v-if="title" class="testimonials-title">{{ title }}</h2>
      <p v-if="description" class="testimonials-description">{{ description }}</p>
      
      <div class="testimonials-carousel">
        <button @click="previousSlide" class="carousel-control prev">‹</button>
        
        <div class="testimonial-slide">
          <div class="testimonial-content">
            <div class="quote-mark">"</div>
            <p class="testimonial-text">{{ currentTestimonial.text }}</p>
            <div class="testimonial-author">
              <img v-if="currentTestimonial.image" 
                   :src="currentTestimonial.image" 
                   :alt="currentTestimonial.author"
                   class="author-image"
              />
              <div>
                <h4 class="author-name">{{ currentTestimonial.author }}</h4>
                <p class="author-title">{{ currentTestimonial.title }}</p>
              </div>
            </div>
          </div>
        </div>
        
        <button @click="nextSlide" class="carousel-control next">›</button>
      </div>
      
      <!-- Dots indicator -->
      <div class="carousel-indicators">
        <button
          v-for="(testimonial, index) in testimonials"
          :key="index"
          @click="currentIndex = index"
          :class="['indicator', { active: currentIndex === index }]"
        ></button>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'TestimonialsRenderer',
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
  data() {
    return {
      currentIndex: 0
    }
  },
  computed: {
    title() {
      return this.data.title || 'What People Say'
    },
    description() {
      return this.data.description || ''
    },
    testimonials() {
      if (Array.isArray(this.data.testimonials)) {
        return this.data.testimonials
      }
      
      return this.getDefaultTestimonials()
    },
    currentTestimonial() {
      return this.testimonials[this.currentIndex]
    }
  },
  methods: {
    nextSlide() {
      this.currentIndex = (this.currentIndex + 1) % this.testimonials.length
    },
    previousSlide() {
      this.currentIndex = this.currentIndex === 0 
        ? this.testimonials.length - 1 
        : this.currentIndex - 1
    },
    getDefaultTestimonials() {
      return [
        {
          text: "An exceptional speaker who truly connects with the audience.",
          author: "Jane Doe",
          title: "Event Organizer",
          image: ""
        },
        {
          text: "Insightful, engaging, and transformational content.",
          author: "John Smith",
          title: "Conference Director",
          image: ""
        }
      ]
    }
  },
  mounted() {
    // Auto-advance carousel
    this.interval = setInterval(() => {
      this.nextSlide()
    }, 5000)
  },
  beforeUnmount() {
    clearInterval(this.interval)
  }
}
</script>

<style scoped>
.gmkb-testimonials-component {
  padding: 2rem;
  background: var(--gmkb-color-background, #f8f9fa);
}

.testimonials-container {
  max-width: 900px;
  margin: 0 auto;
}

.testimonials-title {
  text-align: center;
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-xl, 2rem);
  margin-bottom: 1rem;
}

.testimonials-description {
  text-align: center;
  color: var(--gmkb-color-text-light, #666);
  margin-bottom: 2rem;
}

.testimonials-carousel {
  position: relative;
  display: flex;
  align-items: center;
  gap: 1rem;
}

.carousel-control {
  background: var(--gmkb-color-surface, #fff);
  border: none;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  font-size: 1.5rem;
  cursor: pointer;
  box-shadow: var(--gmkb-shadow-sm, 0 2px 4px rgba(0,0,0,0.1));
  transition: all 0.3s ease;
}

.carousel-control:hover {
  background: var(--gmkb-color-primary, #007cba);
  color: white;
}

.testimonial-slide {
  flex: 1;
  background: var(--gmkb-color-surface, #fff);
  padding: 2rem;
  border-radius: var(--gmkb-border-radius, 8px);
  box-shadow: var(--gmkb-shadow-sm, 0 2px 4px rgba(0,0,0,0.1));
}

.quote-mark {
  font-size: 3rem;
  color: var(--gmkb-color-primary, #007cba);
  line-height: 1;
  margin-bottom: -0.5rem;
}

.testimonial-text {
  color: var(--gmkb-color-text, #333);
  font-size: var(--gmkb-font-size-lg, 1.125rem);
  line-height: var(--gmkb-line-height-base, 1.6);
  margin-bottom: 1.5rem;
  font-style: italic;
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
}

.author-name {
  color: var(--gmkb-color-text, #333);
  margin-bottom: 0.25rem;
}

.author-title {
  color: var(--gmkb-color-text-light, #666);
  font-size: 0.9rem;
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
  background: var(--gmkb-color-border, #ddd);
  cursor: pointer;
  transition: background 0.3s ease;
}

.indicator.active {
  background: var(--gmkb-color-primary, #007cba);
}
</style>
