// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'biography',
  slug: 'biography',
  name: 'Biography Generator',
  title: 'Professional Biography Generator',
  description: 'Generate professional biographies in three different lengths based on your authority hook and expertise.',
  category: 'message-builder',
  icon: 'user'
};
