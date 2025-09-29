/**
 * Component Imports - Pre-import all Vue components for the registry
 * ROOT FIX: Explicit imports that will be bundled properly
 */

// Import all component renderers explicitly
import HeroRenderer from '../../components/hero/HeroRenderer.vue';
import BiographyRenderer from '../../components/biography/BiographyRenderer.vue';
import TopicsRenderer from '../../components/topics/TopicsRenderer.vue';
import QuestionsRenderer from '../../components/questions/QuestionsRenderer.vue';
import GuestIntroRenderer from '../../components/guest-intro/GuestIntroRenderer.vue';
import ContactRenderer from '../../components/contact/ContactRenderer.vue';
import SocialRenderer from '../../components/social/SocialRenderer.vue';
import TestimonialsRenderer from '../../components/testimonials/TestimonialsRenderer.vue';
import StatsRenderer from '../../components/stats/StatsRenderer.vue';
import AuthorityHookRenderer from '../../components/authority-hook/AuthorityHookRenderer.vue';
import LogoGridRenderer from '../../components/logo-grid/LogoGridRenderer.vue';
import CallToActionRenderer from '../../components/call-to-action/CallToActionRenderer.vue';
import BookingCalendarRenderer from '../../components/booking-calendar/BookingCalendarRenderer.vue';
import VideoIntroRenderer from '../../components/video-intro/VideoIntroRenderer.vue';
import PhotoGalleryRenderer from '../../components/photo-gallery/PhotoGalleryRenderer.vue';
import PodcastPlayerRenderer from '../../components/podcast-player/PodcastPlayerRenderer.vue';

// Export component map
export const componentRenderers = {
  'hero': HeroRenderer,
  'biography': BiographyRenderer,
  'topics': TopicsRenderer,
  'questions': QuestionsRenderer,
  'guest-intro': GuestIntroRenderer,
  'contact': ContactRenderer,
  'social': SocialRenderer,
  'testimonials': TestimonialsRenderer,
  'stats': StatsRenderer,
  'authority-hook': AuthorityHookRenderer,
  'logo-grid': LogoGridRenderer,
  'call-to-action': CallToActionRenderer,
  'booking-calendar': BookingCalendarRenderer,
  'video-intro': VideoIntroRenderer,
  'photo-gallery': PhotoGalleryRenderer,
  'podcast-player': PodcastPlayerRenderer
};

// Also export as individual components for flexibility
export {
  HeroRenderer,
  BiographyRenderer,
  TopicsRenderer,
  QuestionsRenderer,
  GuestIntroRenderer,
  ContactRenderer,
  SocialRenderer,
  TestimonialsRenderer,
  StatsRenderer,
  AuthorityHookRenderer,
  LogoGridRenderer,
  CallToActionRenderer,
  BookingCalendarRenderer,
  VideoIntroRenderer,
  PhotoGalleryRenderer,
  PodcastPlayerRenderer
};
