// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'youtube-description',
  slug: 'youtube-description',
  name: 'YouTube Description Generator',
  title: 'YouTube Description Generator',
  description: 'Create optimized YouTube video descriptions.',
  category: 'social-email',
  icon: 'youtube'
};
