// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'podcast-notes',
  slug: 'podcast-notes',
  name: 'Podcast Show Notes Generator',
  title: 'Podcast Show Notes Generator',
  description: 'Generate comprehensive show notes for your podcast episodes.',
  category: 'social-email',
  icon: 'headphones'
};
