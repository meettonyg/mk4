<template>
  <div class="contact-component">
    <h2 v-if="showTitle">{{ title }}</h2>
    <div class="contact-info">
      <div v-if="email" class="contact-item">
        <span class="contact-icon">📧</span>
        <a :href="`mailto:${email}`">{{ email }}</a>
      </div>
      <div v-if="phone" class="contact-item">
        <span class="contact-icon">📱</span>
        <a :href="`tel:${phone}`">{{ phone }}</a>
      </div>
      <div v-if="website" class="contact-item">
        <span class="contact-icon">🌐</span>
        <a :href="website" target="_blank">{{ website }}</a>
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

const title = computed(() => props.data.title || 'Contact Information');
const email = computed(() => props.data.email || props.props.email);
const phone = computed(() => props.data.phone || props.props.phone);
const website = computed(() => props.data.website || props.props.website);
const showTitle = computed(() => props.settings.showTitle ?? true);
</script>

<style scoped>
.contact-component {
  padding: 30px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.contact-component h2 {
  color: var(--gmkb-color-heading, #e2e8f0);
  margin-bottom: 20px;
}

.contact-info {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 10px;
  color: var(--gmkb-color-text, #cbd5e1);
}

.contact-icon {
  font-size: 1.5rem;
}

.contact-item a {
  color: var(--gmkb-color-primary, #3b82f6);
  text-decoration: none;
}

.contact-item a:hover {
  text-decoration: underline;
}
</style>
