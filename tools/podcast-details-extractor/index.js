// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

// Import meta from the single source of truth
import metaJson from './meta.json';

// Export meta derived from meta.json to ensure consistency
export const meta = {
  id: metaJson.slug,
  slug: metaJson.slug,
  name: metaJson.name,
  title: metaJson.name,
  description: metaJson.shortDescription,
  category: metaJson.category,
  icon: metaJson.icon
};
