<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--hero" :data-component-id="componentId">
    <div class="component-root hero-content">
    <div v-if="imageUrl" class="hero__avatar">
      <img :src="imageUrl" :alt="name || 'Profile Avatar'" />
    </div>
    <h1 v-if="name" class="hero__name">{{ name }}</h1>
    <div v-if="title" class="hero__title">{{ title }}</div>
    <p v-if="bio" class="hero__bio">{{ bio }}</p>
    <div v-if="ctaText" class="hero__cta">
      <button class="btn" @click="handleCtaClick">{{ ctaText }}</button>
    </div>
    </div>
  </div>
</template>

<script>
import { computed } from 'vue';
import { usePodsData } from '../../src/composables/usePodsData';

export default {
  name: 'HeroRenderer',
  props: {
    // STANDARD INTERFACE: All components accept the same props structure
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
    // Optional editing state
    isEditing: {
      type: Boolean,
      default: false
    },
    isSelected: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    // COMPOSITION API: Access Pods data via composable
    const podsData = usePodsData();
    
    // NAME: Priority is component data > Pods fullName > empty
    const name = computed(() => {
      if (props.data?.name) return props.data.name;
      if (podsData.fullName?.value) return podsData.fullName.value;
      return '';
    });
    
    // TITLE: Priority is component data > Pods title > empty
    const title = computed(() => {
      if (props.data?.title) return props.data.title;
      // Could add Pods professional_title here if field exists
      return '';
    });
    
    // BIO: Priority is component data > Pods biography > empty
    const bio = computed(() => {
      if (props.data?.bio) return props.data.bio;
      if (podsData.biography?.value) return podsData.biography.value;
      return '';
    });
    
    // IMAGE: Priority is component data > Pods profile_image > empty
    const imageUrl = computed(() => {
      if (props.data?.imageUrl) return props.data.imageUrl;
      if (podsData.profilePhoto?.value) {
        const photo = podsData.profilePhoto.value;
        return typeof photo === 'object' 
          ? (photo.guid || photo.url || photo.ID)
          : photo;
      }
      return '';
    });
    
    // CTA TEXT: Component data only
    const ctaText = computed(() => props.data?.ctaText || '');
    
    // CTA URL: Component data only
    const ctaUrl = computed(() => props.data?.ctaUrl || '');
    
    // CTA Click handler
    const handleCtaClick = () => {
      if (ctaUrl.value && ctaUrl.value !== '#') {
        window.location.href = ctaUrl.value;
      }
      emit('cta-click');
    };
    
    return {
      name,
      title,
      bio,
      imageUrl,
      ctaText,
      ctaUrl,
      handleCtaClick
    };
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles
   All styling comes from design-system/components.css:
   - .gmkb-component (base component wrapper)
   - .gmkb-component--hero (hero-specific styles)
   - .hero__avatar, .hero__name, .hero__title, .hero__bio, .hero__cta
*/
</style>
