// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'interview-prep',
  slug: 'interview-prep',
  name: 'Interview Prep Generator',
  title: 'Interview Prep Generator',
  description: 'Prepare talking points and key messages for media interviews.',
  category: 'strategy',
  icon: 'clipboard'
};
