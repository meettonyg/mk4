// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'impact-intro',
  slug: 'impact-intro',
  name: 'Impact Intro Builder',
  title: 'Impact Intro Builder',
  description: 'Build a powerful introduction that highlights your credentials and achievements.',
  category: 'value-builder',
  icon: 'star'
};
