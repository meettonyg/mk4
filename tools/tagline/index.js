// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'tagline',
  slug: 'tagline',
  name: 'Tagline Generator',
  title: 'Tagline Generator',
  description: 'Generate catchy taglines that capture your unique value proposition.',
  category: 'message-builder',
  icon: 'type'
};
