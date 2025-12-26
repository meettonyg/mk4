// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'email',
  slug: 'email',
  name: 'Email Writer',
  title: 'Email Writer',
  description: 'Craft professional emails for any purpose with AI assistance.',
  category: 'social-email',
  icon: 'mail'
};
