<template>
  <!-- ROOT FIX: Use design system classes -->
  <div class="gmkb-component gmkb-component--logogrid" :data-component-id="componentId">
    <div class="component-root logo-grid-content">
    <h2 v-if="title" class="section-title">{{ title }}</h2>
    
    <!-- Placeholder logos when editing with no data -->
    <div
      v-if="showPlaceholders"
      class="logo-grid logo-grid--grid logo-grid--columns-4"
    >
      <div
        v-for="(logo, index) in placeholderLogos"
        :key="index"
        class="logo-item logo-item--placeholder"
      >
        <div class="logo-placeholder-icon">
          <i class="fas fa-image"></i>
        </div>
        <div class="logo-name">{{ logo.name }}</div>
      </div>
    </div>

    <!-- ✅ CAROUSEL LAYOUT: Use CarouselGrid component -->
    <CarouselGrid
      v-else-if="layoutStyle === 'carousel' && carouselSettings"
      :items="logos"
      :settings="carouselSettings"
      :space-between="32"
    >
      <template #item="{ item: logo, index }">
        <component 
          :is="logo.link ? 'a' : 'div'"
          class="logo-item"
          :href="logo.link || undefined"
          :target="logo.link && logo.linkNewTab ? '_blank' : undefined"
          :rel="logo.link && logo.linkNewTab ? 'noopener noreferrer' : undefined"
          @click="logo.link ? null : openLightbox(index)"
          :role="logo.link ? undefined : 'button'"
          :tabindex="logo.link ? undefined : 0"
          @keydown.enter="logo.link ? null : openLightbox(index)"
          @keydown.space.prevent="logo.link ? null : openLightbox(index)"
        >
          <img 
            :src="logo.url" 
            :alt="logo.alt || logo.name || `Logo ${index + 1}`" 
            :title="logo.name || undefined"
          />
          <!-- Logo Name -->
          <div v-if="logo.name" class="logo-name">{{ logo.name }}</div>
          <!-- Lightbox indicator overlay (only show if no link) -->
          <div v-if="!logo.link" class="logo-overlay">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <polyline points="15 3 21 3 21 9"></polyline>
              <polyline points="9 21 3 21 3 15"></polyline>
              <line x1="21" y1="3" x2="14" y2="10"></line>
              <line x1="3" y1="21" x2="10" y2="14"></line>
            </svg>
          </div>
          <!-- ✅ NEW: External link indicator -->
          <div v-if="logo.link && logo.linkNewTab" class="external-link-indicator" title="Opens in new tab">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15 3 21 3 21 9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </div>
        </component>
      </template>
    </CarouselGrid>
    
    <!-- ✅ GRID/MASONRY LAYOUTS: Use CSS grid -->
    <div
      v-else-if="!showPlaceholders"
      class="logo-grid"
      :class="[
        `logo-grid--${layoutStyle}`,
        layoutStyle !== 'carousel' ? `logo-grid--columns-${columns}` : ''
      ]"
      :data-logo-name-style="logoNameStyle"
      :data-layout-style="layoutStyle"
    >
      <!-- ✅ NEW: Wrap in link if logo.link exists -->
      <component 
        :is="logo.link ? 'a' : 'div'"
        v-for="(logo, index) in logos" 
        :key="index" 
        class="logo-item"
        :href="logo.link || undefined"
        :target="logo.link && logo.linkNewTab ? '_blank' : undefined"
        :rel="logo.link && logo.linkNewTab ? 'noopener noreferrer' : undefined"
        @click="logo.link ? null : openLightbox(index)"
        :role="logo.link ? undefined : 'button'"
        :tabindex="logo.link ? undefined : 0"
        @keydown.enter="logo.link ? null : openLightbox(index)"
        @keydown.space.prevent="logo.link ? null : openLightbox(index)"
      >
        <img 
          :src="logo.url" 
          :alt="logo.alt || logo.name || `Logo ${index + 1}`" 
          :title="logo.name || undefined"
        />
        <!-- Logo Name -->
        <div v-if="logo.name" class="logo-name">{{ logo.name }}</div>
        <!-- Lightbox indicator overlay (only show if no link) -->
        <div v-if="!logo.link" class="logo-overlay">
          <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <polyline points="15 3 21 3 21 9"></polyline>
            <polyline points="9 21 3 21 3 15"></polyline>
            <line x1="21" y1="3" x2="14" y2="10"></line>
            <line x1="3" y1="21" x2="10" y2="14"></line>
          </svg>
        </div>
        <!-- ✅ NEW: External link indicator -->
        <div v-if="logo.link && logo.linkNewTab" class="external-link-indicator" title="Opens in new tab">
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
            <polyline points="15 3 21 3 21 9"></polyline>
            <line x1="10" y1="14" x2="21" y2="3"></line>
          </svg>
        </div>
      </component>
    </div>
    </div>
    
    <!-- Lightbox Component -->
    <Lightbox 
      ref="lightboxRef"
      :items="logos"
      :initial-index="currentLogoIndex"
    />
  </div>
</template>

<script>
import { ref, computed } from 'vue';
import Lightbox from '@/vue/components/shared/Lightbox.vue';
import CarouselGrid from '@/vue/components/shared/CarouselGrid.vue';

export default {
  name: 'LogoGridRenderer',
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
    },
    isBuilderMode: {
      type: Boolean,
      default: false
    }
  },
  components: {
    Lightbox,
    CarouselGrid
  },
  setup(props) {
    // Lightbox state
    const lightboxRef = ref(null);
    const currentLogoIndex = ref(0);
    
    // TITLE: Component data > default
    const title = computed(() => {
      return props.data?.title || 'As Featured On';
    });
    
    // LOGO NAME STYLE: Component data > default
    const logoNameStyle = computed(() => {
      return props.data?.logoNameStyle || 'below';
    });
    
    // ✅ PHASE 1B: LAYOUT STYLE: Component data > default
    const layoutStyle = computed(() => {
      return props.data?.layoutStyle || 'grid';
    });
    
    // ✅ PHASE 1B: COLUMNS: Component data > default
    const columns = computed(() => {
      return props.data?.columns || 'auto';
    });
    
    // ✅ PHASE 1B: CAROUSEL SETTINGS: Component data > defaults
    const carouselSettings = computed(() => {
      if (layoutStyle.value !== 'carousel') return null;
      
      return props.data?.carouselSettings || {
        autoplay: true,
        autoplaySpeed: 3000,
        slidesToShow: 4,
        slidesToShowTablet: 3,
        slidesToShowMobile: 2,
        infinite: true,
        arrows: true,
        dots: true
      };
    });
    
    // LOGOS: Read directly from component data
    const logos = computed(() => {
      // Return logos array from component data or empty array
      if (props.data?.logos && Array.isArray(props.data.logos)) {
        return props.data.logos;
      }

      return [];
    });

    // Show placeholders when in builder mode with no logos
    const showPlaceholders = computed(() => {
      return logos.value.length === 0 && (props.isBuilderMode || props.isEditing || props.isSelected);
    });

    // Placeholder logos
    const placeholderLogos = [
      { name: 'Logo 1' },
      { name: 'Logo 2' },
      { name: 'Logo 3' },
      { name: 'Logo 4' }
    ];
    
    // Open lightbox at specific index
    const openLightbox = (index) => {
      currentLogoIndex.value = index;
      lightboxRef.value?.open(index);
    };
    
    return {
      title,
      logos,
      logoNameStyle,
      layoutStyle,
      columns,
      carouselSettings,
      lightboxRef,
      currentLogoIndex,
      openLightbox,
      showPlaceholders,
      placeholderLogos
    };
  }
}
</script>

<style>
/* ROOT FIX: NO scoped styles */
</style>
