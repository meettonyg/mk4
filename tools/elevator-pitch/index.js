// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'elevator-pitch',
  slug: 'elevator-pitch',
  name: 'Elevator Pitch Generator',
  title: 'Elevator Pitch Generator',
  description: 'Create a compelling 30-60 second pitch that captures attention.',
  category: 'value-builder',
  icon: 'mic'
};
