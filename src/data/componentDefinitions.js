/**
 * Component Definitions Bridge
 *
 * ARCHITECTURE COMPLIANCE: This module no longer hard-codes the component
 * catalog. Instead it delegates to the UnifiedComponentRegistry which reads
 * component metadata from the self-contained component directories and
 * WordPress data when available.
 */

import UnifiedComponentRegistry from '../services/UnifiedComponentRegistry';

/**
 * Normalize registry definitions so existing consumers (like the sidebar)
 * continue to receive the fields they expect.
 */
function normalizeDefinition(definition) {
  if (!definition) return null;

  return {
    ...definition,
    // Maintain backwards compatible property used by older components
    defaultData: definition.defaultProps || definition.defaultData || {},
    icon: definition.icon || 'fa-solid fa-cube',
    isPremium: Boolean(definition.isPremium),
  };
}

// Snapshot the current registry state. The registry auto-initializes and will
// rebuild whenever Vite recompiles, so this stays in sync with the filesystem.
const registryDefinitions = UnifiedComponentRegistry.getAll().map(normalizeDefinition).filter(Boolean);

export const componentDefinitions = registryDefinitions;

// Build category labels from the registry so filtering UI stays dynamic.
export const componentCategories = UnifiedComponentRegistry.getCategories().reduce((acc, category) => {
  acc[category.slug] = category.name;
  return acc;
}, {});

// Helper functions ---------------------------------------------------------

export function getComponentByType(type) {
  return normalizeDefinition(UnifiedComponentRegistry.get(type));
}

export function getComponentsByCategory(category) {
  if (category === 'all') return componentDefinitions;
  return componentDefinitions.filter(c => c.category === category);
}

export function getPremiumComponents() {
  return componentDefinitions.filter(c => c.isPremium);
}

export function getFreeComponents() {
  return componentDefinitions.filter(c => !c.isPremium);
}

export default componentDefinitions;
