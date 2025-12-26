// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'offers',
  slug: 'offers',
  name: 'Offers Generator',
  title: 'Offers Generator',
  description: 'Generate compelling service packages and pricing tiers.',
  category: 'message-builder',
  icon: 'package'
};
