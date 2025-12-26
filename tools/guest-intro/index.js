// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'guest-intro',
  slug: 'guest-intro',
  name: 'Guest Intro Generator',
  title: 'Guest Intro Generator',
  description: 'Create compelling guest introductions for podcasts and media appearances.',
  category: 'message-builder',
  icon: 'mic'
};
