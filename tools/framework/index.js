// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'framework',
  slug: 'framework',
  name: 'Framework Builder',
  title: 'Framework Builder',
  description: 'Design a memorable framework that showcases your unique methodology.',
  category: 'strategy',
  icon: 'layers'
};
