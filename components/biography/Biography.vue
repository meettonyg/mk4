<template>
  <!-- V2 ARCHITECTURE: Single root element with component-root class -->
  <!-- ROOT FIX: Removed data-component-id - it's on the wrapper, not here -->
  <div 
    class="component-root biography-component"
  >
    <!-- Biography Content - simplified structure -->
    <div v-if="imageUrl" class="biography-image">
      <img :src="imageUrl" :alt="name || 'Biography'" />
    </div>
    
    <div class="biography-content">
      <h2 v-if="name" class="biography-name">{{ name }}</h2>
      <p v-if="title" class="biography-title">{{ title }}</p>
      <p v-if="location" class="biography-location">📍 {{ location }}</p>
      <div v-if="biography" class="biography-text" v-html="formattedBiography"></div>
      
      <!-- Social Links -->
      <div v-if="socialLinks && socialLinks.length" class="biography-social">
        <a 
          v-for="link in socialLinks"
          :key="link.platform"
          :href="link.url"
          :title="link.platform"
          target="_blank"
          rel="noopener noreferrer"
          class="social-link"
        >
          <i :class="`fab fa-${link.platform.toLowerCase()}`"></i>
        </a>
      </div>
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
// ROOT FIX: Added safety checks for undefined props
const imageUrl = computed(() => {
  if (!props) return '';
  return props.data?.imageUrl || props.props?.imageUrl || '';
});

const name = computed(() => {
  if (!props) return '';
  return props.data?.name || props.props?.name || props.data?.fullName || props.props?.fullName || '';
});

const title = computed(() => {
  if (!props) return '';
  return props.data?.title || props.props?.title || props.data?.role || props.props?.role || '';
});

const location = computed(() => {
  if (!props) return '';
  return props.data?.location || props.props?.location || '';
});

const biography = computed(() => {
  if (!props) return '';
  return props.data?.biography || props.props?.biography || props.data?.bio || props.props?.bio || '';
});

// Social links
const socialLinks = computed(() => {
  const links = [];
  const data = props.data || props.props || {};
  
  if (data.linkedin) {
    links.push({ platform: 'linkedin', url: data.linkedin });
  }
  if (data.twitter) {
    links.push({ platform: 'twitter', url: data.twitter });
  }
  if (data.website) {
    links.push({ platform: 'globe', url: data.website });
  }
  
  return links;
});

// Format biography text
const formattedBiography = computed(() => {
  if (!biography.value) return '';
  
  let formatted = biography.value;
  
  // Preserve line breaks
  formatted = formatted.replace(/\n\n/g, '</p><p>');
  formatted = formatted.replace(/\n/g, '<br>');
  formatted = `<p>${formatted}</p>`;
  
  return formatted;
});
</script>

<style scoped>
/* V2 ARCHITECTURE: Minimal component styles */
/* All visual styles (background, padding, border, etc.) applied via ComponentStyleService */

.biography-component {
  /* Styles applied via inline styles from ComponentStyleService */
  display: block;
}

.biography-image {
  margin-bottom: 1.5rem;
}

.biography-image img {
  width: 100%;
  max-width: 200px;
  height: auto;
  /* border-radius inherited from theme/settings */
  border-radius: var(--component-border-radius, 8px);
  display: block;
}

.biography-content {
  /* No background/padding here - handled by parent .component-root */
}

.biography-name {
  /* font-size and font-weight inherited from component-root */
  margin: 0 0 0.5rem 0;
  color: inherit; /* Inherit from component-root */
}

.biography-title {
  /* font-size inherited, use opacity for subtle difference */
  opacity: 0.8;
  margin: 0 0 0.5rem 0;
}

.biography-location {
  /* font-size inherited, use opacity for hierarchy */
  opacity: 0.7;
  margin: 0 0 1rem 0;
}

.biography-text {
  /* line-height inherited from component-root via ComponentStyleService */
  color: inherit;
}

.biography-text p {
  margin: 0 0 1rem 0;
}

.biography-text p:last-child {
  margin-bottom: 0;
}

.biography-social {
  display: flex;
  gap: 1rem;
  margin-top: 1.5rem;
}

.social-link {
  font-size: 1.5rem; /* Keep for icons */
  color: var(--primary-color, #3b82f6);
  transition: color 0.2s;
  text-decoration: none;
}

.social-link:hover {
  color: var(--primary-hover, #2563eb);
}

/* Responsive */
@media (max-width: 768px) {
  .biography-name {
    font-size: 1.5rem;
  }
  
  .biography-image img {
    max-width: 150px;
  }
}
</style>
