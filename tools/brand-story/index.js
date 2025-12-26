// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'brand-story',
  slug: 'brand-story',
  name: 'Brand Story Generator',
  title: 'Brand Story Generator',
  description: 'Craft a compelling brand story that connects with your audience.',
  category: 'strategy',
  icon: 'book'
};
