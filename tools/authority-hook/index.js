// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'authority-hook',
  slug: 'authority-hook',
  name: 'Authority Hook Builder',
  title: 'Authority Hook Builder',
  description: 'Build a powerful positioning statement using the 6W framework that clearly communicates who you serve and what transformation you provide.',
  category: 'message-builder',
  icon: 'zap'
};
