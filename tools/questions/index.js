// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'questions',
  slug: 'questions',
  name: 'Questions Generator',
  title: 'Questions Generator',
  description: 'Generate thought-provoking questions for interviews and discussions.',
  category: 'message-builder',
  icon: 'help-circle'
};
