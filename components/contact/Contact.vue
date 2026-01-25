<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root contact-component"
  >
    <h2 v-if="title" class="contact-title">{{ title }}</h2>
    <p v-if="description" class="contact-description">{{ description }}</p>
    
    <div class="contact-grid">
      <!-- Placeholder items when editing with no data configured -->
      <template v-if="showPlaceholders">
        <div class="contact-item contact-item--placeholder" title="Click to configure email">
          <i class="fas fa-envelope"></i>
          <span>your@email.com</span>
        </div>
        <div class="contact-item contact-item--placeholder" title="Click to configure phone">
          <i class="fas fa-phone"></i>
          <span>+1 (555) 123-4567</span>
        </div>
        <div class="contact-item contact-item--placeholder" title="Click to configure website">
          <i class="fas fa-globe"></i>
          <span>yourwebsite.com</span>
        </div>
      </template>

      <!-- Actual contact items when data exists -->
      <template v-else>
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
      </template>
    </div>

    <!-- Social Links -->
    <div v-if="hasSocialLinks || showPlaceholders" class="contact-social">
      <!-- Placeholder social icons -->
      <template v-if="showPlaceholders">
        <span class="social-link social-link--placeholder" title="LinkedIn (click to configure)">
          <i class="fab fa-linkedin"></i>
        </span>
        <span class="social-link social-link--placeholder" title="Twitter/X (click to configure)">
          <i class="fab fa-twitter"></i>
        </span>
      </template>
      <!-- Actual social links -->
      <template v-else>
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
      </template>
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
  },
  isBuilderMode: {
    type: Boolean,
    default: false
  }
});

// Data from component JSON state (single source of truth)
const title = computed(() => props.data?.title || props.props?.title || 'Get in Touch');
const description = computed(() => props.data?.description || props.props?.description || '');

// Contact fields - read from component data only
const email = computed(() => props.data?.email || props.props?.email || '');
const phone = computed(() => props.data?.phone || props.props?.phone || '');
const website = computed(() => props.data?.website || props.props?.website || '');
const address = computed(() => props.data?.address || props.props?.address || '');

// Social media fields - read from component data only
const linkedin = computed(() => props.data?.linkedin || props.props?.linkedin || '');
const twitter = computed(() => props.data?.twitter || props.props?.twitter || '');
const instagram = computed(() => props.data?.instagram || props.props?.instagram || '');
const facebook = computed(() => props.data?.facebook || props.props?.facebook || '');

const layout = computed(() => props.data?.layout || props.props?.layout || 'centered');

// Check if any social links exist
const hasSocialLinks = computed(() => {
  return linkedin.value || twitter.value || instagram.value || facebook.value;
});

// Check if any contact data exists
const hasContactData = computed(() => {
  return email.value || phone.value || website.value || address.value || hasSocialLinks.value;
});

// Show placeholders when editing with no data configured
// Show placeholders when in builder mode with no data configured
// Use isBuilderMode for reliable detection (doesn't depend on selection timing)
const showPlaceholders = computed(() => {
  return !hasContactData.value && (props.isBuilderMode || props.isEditing || props.isSelected);
});
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.contact-component {
  /* Styles applied via inline styles from ComponentStyleService */
}

.contact-title {
  /* font-size and font-weight inherited from component-root */
  margin: 0 0 1rem 0;
  text-align: center;
  color: inherit;
}

.contact-description {
  text-align: center;
  opacity: 0.8; /* Use opacity instead of fixed color */
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
  background: var(--card-bg, rgba(248, 250, 252, 0.8));
  border-radius: var(--component-border-radius, 8px);
  text-decoration: none;
  color: inherit;
  transition: all 0.2s;
}

.contact-item:hover {
  background: var(--hover-bg, rgba(0, 0, 0, 0.05));
  transform: translateY(-2px);
}

.contact-item i {
  font-size: 1.5rem;
  color: var(--primary-color, #3b82f6);
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
  background: var(--card-bg, rgba(248, 250, 252, 0.8));
  border-radius: 50%;
  color: var(--primary-color, #3b82f6);
  text-decoration: none;
  transition: all 0.2s;
}

.social-link:hover {
  background: var(--primary-color, #3b82f6);
  color: white;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
}

.social-link i {
  font-size: 1.25rem;
}

/* Placeholder styles for editing mode when no data configured */
.contact-item--placeholder {
  cursor: default;
  opacity: 0.6;
  border: 2px dashed var(--border-color, #cbd5e1);
  background: var(--card-bg, rgba(248, 250, 252, 0.5));
}

.contact-item--placeholder:hover {
  transform: none;
  background: var(--card-bg, rgba(248, 250, 252, 0.5));
}

.contact-item--placeholder span {
  color: var(--text-muted, #94a3b8);
  font-style: italic;
}

.social-link--placeholder {
  cursor: default;
  opacity: 0.6;
  border: 2px dashed var(--border-color, #cbd5e1);
  background: var(--card-bg, rgba(248, 250, 252, 0.5));
}

.social-link--placeholder:hover {
  transform: none;
  background: var(--card-bg, rgba(248, 250, 252, 0.5));
  color: var(--primary-color, #3b82f6);
  box-shadow: none;
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
