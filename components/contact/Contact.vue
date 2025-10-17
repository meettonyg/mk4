<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root contact-component"
  >
    <h2 v-if="title" class="contact-title">{{ title }}</h2>
    <p v-if="description" class="contact-description">{{ description }}</p>
    
    <div class="contact-grid">
      <!-- Email -->
      <a v-if="email" :href="`mailto:${email}`" class="contact-item">
        <i class="fas fa-envelope"></i>
        <span>{{ email }}</span>
      </a>
      
      <!-- Phone -->
      <a v-if="phone" :href="`tel:${phone}`" class="contact-item">
        <i class="fas fa-phone"></i>
        <span>{{ phone }}</span>
      </a>
      
      <!-- Website -->
      <a v-if="website" :href="website" target="_blank" rel="noopener noreferrer" class="contact-item">
        <i class="fas fa-globe"></i>
        <span>{{ website }}</span>
      </a>
      
      <!-- Address -->
      <div v-if="address" class="contact-item">
        <i class="fas fa-map-marker-alt"></i>
        <span>{{ address }}</span>
      </div>
    </div>
    
    <!-- Social Links -->
    <div v-if="hasSocialLinks" class="contact-social">
      <a v-if="linkedin" :href="linkedin" target="_blank" rel="noopener noreferrer" class="social-link" title="LinkedIn">
        <i class="fab fa-linkedin"></i>
      </a>
      <a v-if="twitter" :href="twitter" target="_blank" rel="noopener noreferrer" class="social-link" title="Twitter/X">
        <i class="fab fa-twitter"></i>
      </a>
      <a v-if="instagram" :href="instagram" target="_blank" rel="noopener noreferrer" class="social-link" title="Instagram">
        <i class="fab fa-instagram"></i>
      </a>
      <a v-if="facebook" :href="facebook" target="_blank" rel="noopener noreferrer" class="social-link" title="Facebook">
        <i class="fab fa-facebook"></i>
      </a>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue';

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

// Extract data from both data and props for compatibility
const title = computed(() => props.data?.title || props.props?.title || 'Get in Touch');
const description = computed(() => props.data?.description || props.props?.description || '');
const email = computed(() => props.data?.email || props.props?.email || '');
const phone = computed(() => props.data?.phone || props.props?.phone || '');
const website = computed(() => props.data?.website || props.props?.website || '');
const address = computed(() => props.data?.address || props.props?.address || '');
const linkedin = computed(() => props.data?.linkedin || props.props?.linkedin || '');
const twitter = computed(() => props.data?.twitter || props.props?.twitter || '');
const instagram = computed(() => props.data?.instagram || props.props?.instagram || '');
const facebook = computed(() => props.data?.facebook || props.props?.facebook || '');
const layout = computed(() => props.data?.layout || props.props?.layout || 'centered');

// Check if any social links exist
const hasSocialLinks = computed(() => {
  return linkedin.value || twitter.value || instagram.value || facebook.value;
});
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.contact-component {
  /* Styles applied via inline styles from ComponentStyleService */
}

.contact-title {
  font-size: 2rem;
  font-weight: 700;
  margin: 0 0 1rem 0;
  text-align: center;
  color: inherit;
}

.contact-description {
  text-align: center;
  color: #64748b;
  margin: 0 0 2rem 0;
}

.contact-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
  gap: 1rem;
  margin-bottom: 2rem;
}

.contact-item {
  display: flex;
  align-items: center;
  gap: 1rem;
  padding: 1rem;
  background: #f8fafc;
  border-radius: 8px;
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.contact-item:hover {
  background: #e2e8f0;
  transform: translateY(-2px);
}

.contact-item i {
  font-size: 1.5rem;
  color: #3b82f6;
  min-width: 1.5rem;
  text-align: center;
}

.contact-item span {
  word-break: break-word;
}

.contact-social {
  display: flex;
  justify-content: center;
  gap: 1rem;
  flex-wrap: wrap;
}

.social-link {
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background: #f8fafc;
  border-radius: 50%;
  color: #3b82f6;
  text-decoration: none;
  transition: all 0.2s;
}

.social-link:hover {
  background: #3b82f6;
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.social-link i {
  font-size: 1.25rem;
}

/* Responsive */
@media (max-width: 768px) {
  .contact-grid {
    grid-template-columns: 1fr;
  }
  
  .contact-title {
    font-size: 1.5rem;
  }
  
  .contact-item {
    padding: 0.75rem;
  }
}
</style>
