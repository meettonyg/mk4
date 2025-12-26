// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'sound-bite',
  slug: 'sound-bite',
  name: 'Sound Bite Generator',
  title: 'Sound Bite Generator',
  description: 'Create memorable sound bites for media appearances.',
  category: 'value-builder',
  icon: 'quote'
};
