// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'newsletter',
  slug: 'newsletter',
  name: 'Newsletter Writer',
  title: 'Newsletter Writer',
  description: 'Create engaging newsletter content that keeps your audience coming back.',
  category: 'social-email',
  icon: 'newspaper'
};
