// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

export const meta = {
  id: 'podcast-details-extractor',
  slug: 'podcast-details-extractor',
  name: 'Podcast Details Extractor',
  title: 'Podcast Details Extractor',
  description: 'Extract podcast information and contact details from Apple Podcasts or Google Podcasts URLs.',
  category: 'strategy',
  icon: 'podcast'
};
