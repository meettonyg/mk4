// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'seo-optimizer',
  slug: 'seo-optimizer',
  name: 'SEO Content Optimizer',
  title: 'SEO Content Optimizer',
  description: 'Optimize your content for search engines with AI-powered suggestions.',
  category: 'content',
  icon: 'search'
};
