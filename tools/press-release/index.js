// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'press-release',
  slug: 'press-release',
  name: 'Press Release Generator',
  title: 'Press Release Generator',
  description: 'Create professional press releases for announcements and news.',
  category: 'content',
  icon: 'megaphone'
};
