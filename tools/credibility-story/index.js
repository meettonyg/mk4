// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'credibility-story',
  slug: 'credibility-story',
  name: 'Credibility Story Generator',
  title: 'Credibility Story Generator',
  description: 'Build trust with stories that showcase your expertise and experience.',
  category: 'strategy',
  icon: 'award'
};
