<template>
  <div class="testimonials-component">
    <h2 v-if="showTitle">{{ title }}</h2>
    <div class="testimonials-container">
      <div v-for="(testimonial, index) in testimonials" :key="index" class="testimonial">
        <div class="testimonial-content">
          <p>"{{ testimonial.text || testimonial }}"</p>
        </div>
        <div v-if="testimonial.author" class="testimonial-author">
          — {{ testimonial.author }}
        </div>
      </div>
      <div v-if="testimonials.length === 0" class="no-testimonials">
        No testimonials added yet
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

const props = defineProps({
  id: String,
  data: { type: Object, default: () => ({}) },
  props: { type: Object, default: () => ({}) },
  settings: { type: Object, default: () => ({}) }
});

const title = computed(() => props.data.title || 'Testimonials');
const showTitle = computed(() => props.settings.showTitle ?? true);
const testimonials = computed(() => props.data.testimonials || props.props.testimonials || []);
</script>

<style scoped>
.testimonials-component {
  padding: 30px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.testimonials-component h2 {
  color: var(--gmkb-color-heading, #e2e8f0);
  margin-bottom: 25px;
  text-align: center;
}

.testimonials-container {
  display: grid;
  gap: 20px;
}

.testimonial {
  background: rgba(255, 255, 255, 0.03);
  padding: 25px;
  border-radius: 8px;
  border-left: 4px solid var(--gmkb-color-primary, #3b82f6);
}

.testimonial-content p {
  color: var(--gmkb-color-text, #cbd5e1);
  font-style: italic;
  font-size: 1.1rem;
  line-height: 1.6;
  margin: 0;
}

.testimonial-author {
  color: var(--gmkb-color-text-light, #94a3b8);
  margin-top: 15px;
  font-weight: 500;
}

.no-testimonials {
  text-align: center;
  padding: 40px;
  color: #64748b;
  border: 2px dashed rgba(255, 255, 255, 0.1);
  border-radius: 8px;
}
</style>
