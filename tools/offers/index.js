// Full-page standalone generator
export { default as Generator } from './Generator.vue';

// Conversion Offer Generator (tiered funnel approach)
export { default as ConversionGenerator } from './ConversionGenerator.vue';

// Embeddable widget component
export { default as Widget } from './Widget.vue';

// Default export is the widget (for shortcode/embedding use)
export { default } from './Widget.vue';

// Export meta from the single source of truth
export { default as meta } from './meta.json';
