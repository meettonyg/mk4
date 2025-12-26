// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'blog',
  slug: 'blog',
  name: 'Blog Post Generator',
  title: 'Blog Post Generator',
  description: 'Create engaging blog posts on any topic with AI assistance.',
  category: 'content',
  icon: 'document'
};
