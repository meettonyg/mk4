// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'topics',
  slug: 'topics',
  name: 'Topics Generator',
  title: 'Topics Generator',
  description: 'Generate relevant topics and themes for your content and speaking.',
  category: 'message-builder',
  icon: 'list'
};
