// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'persona',
  slug: 'persona',
  name: 'Persona Generator',
  title: 'Persona Generator',
  description: 'Create detailed customer personas to better understand your audience.',
  category: 'value-builder',
  icon: 'users'
};
