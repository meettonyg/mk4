// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'signature-story',
  slug: 'signature-story',
  name: 'Signature Story Generator',
  title: 'Signature Story Generator',
  description: 'Craft a signature client success story that demonstrates your impact.',
  category: 'strategy',
  icon: 'bookmark'
};
