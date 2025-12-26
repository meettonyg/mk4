// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'content-repurpose',
  slug: 'content-repurpose',
  name: 'Content Repurposer',
  title: 'Content Repurposer',
  description: 'Transform your content into multiple formats for different platforms.',
  category: 'content',
  icon: 'refresh'
};
