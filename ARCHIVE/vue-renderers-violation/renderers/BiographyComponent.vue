<template>
  <div class="biography-component">
    <h2 v-if="showTitle" class="biography-title">{{ title }}</h2>
    <div class="biography-content">
      <div v-if="image" class="biography-image">
        <img :src="image" :alt="title" />
      </div>
      <div class="biography-text">
        <div v-html="formattedContent"></div>
        <div v-if="showContact" class="biography-contact">
          <p v-if="email">Email: <a :href="`mailto:${email}`">{{ email }}</a></p>
          <p v-if="phone">Phone: <a :href="`tel:${phone}`">{{ phone }}</a></p>
        </div>
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

// Computed properties for data access
const title = computed(() => props.data.title || props.props.title || 'Biography');
const content = computed(() => props.data.content || props.props.content || props.data.biography || '');
const image = computed(() => props.data.image || props.props.image || props.data.profile_image);
const email = computed(() => props.data.email || props.props.email);
const phone = computed(() => props.data.phone || props.props.phone);

// Settings
const showTitle = computed(() => props.settings.showTitle ?? true);
const showContact = computed(() => props.settings.showContact ?? true);

// Format content (handles HTML)
const formattedContent = computed(() => {
  if (!content.value) return '';
  
  // If it's already HTML, return as-is
  if (content.value.includes('<p>') || content.value.includes('<br')) {
    return content.value;
  }
  
  // Convert line breaks to paragraphs
  return content.value
    .split('\n\n')
    .map(para => `<p>${para}</p>`)
    .join('');
});
</script>

<style scoped>
.biography-component {
  padding: 30px;
  background: rgba(255, 255, 255, 0.02);
  border-radius: 8px;
}

.biography-title {
  color: var(--gmkb-color-heading, #e2e8f0);
  font-size: 2rem;
  margin-bottom: 20px;
  font-weight: 600;
}

.biography-content {
  display: flex;
  gap: 30px;
  align-items: flex-start;
}

.biography-image {
  flex-shrink: 0;
  width: 200px;
  height: 200px;
  border-radius: 12px;
  overflow: hidden;
}

.biography-image img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.biography-text {
  flex: 1;
  color: var(--gmkb-color-text, #cbd5e1);
  line-height: 1.6;
}

.biography-text :deep(p) {
  margin-bottom: 1em;
}

.biography-text :deep(p:last-child) {
  margin-bottom: 0;
}

.biography-contact {
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.biography-contact p {
  margin: 5px 0;
}

.biography-contact a {
  color: var(--gmkb-color-primary, #3b82f6);
  text-decoration: none;
}

.biography-contact a:hover {
  text-decoration: underline;
}

/* Responsive */
@media (max-width: 768px) {
  .biography-content {
    flex-direction: column;
  }
  
  .biography-image {
    width: 150px;
    height: 150px;
    margin: 0 auto;
  }
}
</style>
