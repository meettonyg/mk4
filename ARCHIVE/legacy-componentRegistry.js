/**
 * Component Registry - Single source of truth for all Vue components
 * This is initialized at module level to ensure components are always available
 */
import { defineAsyncComponent, markRaw } from 'vue';
import FallbackRenderer from '../components/FallbackRenderer.vue';

// Define all available components
const componentMap = {
  // Content components
  'hero': () => import('../../../components/hero/HeroRenderer.vue'),
  'biography': () => import('../../../components/biography/BiographyRenderer.vue'),
  'topics': () => import('../../../components/topics/TopicsRenderer.vue'),
  'questions': () => import('../../../components/questions/QuestionsRenderer.vue'),
  'guest-intro': () => import('../../../components/guest-intro/GuestIntroRenderer.vue'),
  
  // Contact & Social
  'contact': () => import('../../../components/contact/ContactRenderer.vue'),
  'social': () => import('../../../components/social/SocialRenderer.vue'),
  
  // Social Proof
  'testimonials': () => import('../../../components/testimonials/TestimonialsRenderer.vue'),
  'stats': () => import('../../../components/stats/StatsRenderer.vue'),
  'authority-hook': () => import('../../../components/authority-hook/AuthorityHookRenderer.vue'),
  'logo-grid': () => import('../../../components/logo-grid/LogoGridRenderer.vue'),
  
  // Conversion
  'call-to-action': () => import('../../../components/call-to-action/CallToActionRenderer.vue'),
  'booking-calendar': () => import('../../../components/booking-calendar/BookingCalendarRenderer.vue'),
  
  // Media
  'video-intro': () => import('../../../components/video-intro/VideoIntroRenderer.vue'),
  'photo-gallery': () => import('../../../components/photo-gallery/PhotoGalleryRenderer.vue'),
  'podcast-player': () => import('../../../components/podcast-player/PodcastPlayerRenderer.vue')
};

// Create the registry with all components pre-registered
const registry = {};

// Register all components immediately
Object.entries(componentMap).forEach(([type, loader]) => {
  registry[type] = defineAsyncComponent({
    loader,
    errorComponent: markRaw(FallbackRenderer),
    delay: 0,
    timeout: 30000,
    onError(error, retry, fail) {
      console.error(`Failed to load component ${type}:`, error);
      fail();
    }
  });
});

// Export functions to interact with the registry
export function getComponent(type) {
  // First check exact match
  if (registry[type]) {
    return registry[type];
  }
  
  // Check for hyphenated version (e.g., 'GuestIntro' -> 'guest-intro')
  const hyphenatedType = type.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  if (registry[hyphenatedType]) {
    return registry[hyphenatedType];
  }
  
  // Return fallback
  console.warn(`Component type '${type}' not found in registry, using fallback`);
  return markRaw(FallbackRenderer);
}

export function hasComponent(type) {
  return !!registry[type] || !!registry[type.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '')];
}

export function getAllComponentTypes() {
  return Object.keys(registry);
}

// For debugging
export function getRegistry() {
  return { ...registry };
}
