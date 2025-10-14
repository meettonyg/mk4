/**
 * Component Deprecation System
 * 
 * Handles deprecated components gracefully without breaking existing media kits.
 * Follows the checklist: event-driven, root cause fix, simple, graceful failure.
 * 
 * @package Guestify
 * @version 1.0.0
 */

export class ComponentDeprecationManager {
  constructor() {
    // Registry of deprecated components with migration paths
    this.deprecatedComponents = new Map();
    
    // Load deprecation config
    this.loadDeprecationConfig();
    
    console.log('[DeprecationManager] Initialized with', this.deprecatedComponents.size, 'deprecated components');
  }

  /**
   * Load deprecation configuration from registry
   */
  loadDeprecationConfig() {
    // This can be loaded from a JSON file or API endpoint
    const config = window.gmkbData?.deprecationConfig || this.getDefaultConfig();
    
    Object.entries(config).forEach(([componentType, deprecationInfo]) => {
      this.deprecatedComponents.set(componentType, deprecationInfo);
    });
  }

  /**
   * Default deprecation configuration
   * Can be overridden by server-side config
   */
  getDefaultConfig() {
    return {
      'authority-hook': {
        status: 'removed',
        version: '4.0.0',
        reason: 'Replaced by hero and biography components',
        replacement: null, // No direct replacement
        migration: 'manual', // or 'auto'
        fallback: {
          type: 'hero',
          dataMapping: {
            'authority_statement': 'subtitle',
            'unique_value': 'description'
          }
        },
        notice: 'The Authority Hook component has been removed. Please use Hero or Biography components instead.'
      }
      // Add more deprecated components here as needed
    };
  }

  /**
   * Check if a component is deprecated
   * @param {string} componentType - Component type to check
   * @returns {boolean}
   */
  isDeprecated(componentType) {
    return this.deprecatedComponents.has(componentType);
  }

  /**
   * Get deprecation info for a component
   * @param {string} componentType - Component type
   * @returns {object|null} Deprecation info or null
   */
  getDeprecationInfo(componentType) {
    return this.deprecatedComponents.get(componentType) || null;
  }

  /**
   * Handle a deprecated component gracefully
   * @param {object} component - The deprecated component
   * @returns {object} - Handled component (migrated, fallback, or placeholder)
   */
  handleDeprecatedComponent(component) {
    if (!component || !component.type) {
      console.warn('[DeprecationManager] Invalid component:', component);
      return this.createPlaceholder('invalid-component', 'Invalid component data');
    }

    const deprecationInfo = this.getDeprecationInfo(component.type);
    
    if (!deprecationInfo) {
      // Not a deprecated component, return as-is
      return component;
    }

    console.warn(`[DeprecationManager] Deprecated component found: ${component.type}`);

    // Handle based on deprecation status
    switch (deprecationInfo.status) {
      case 'removed':
        return this.handleRemovedComponent(component, deprecationInfo);
      
      case 'deprecated':
        return this.handleDeprecatedWithWarning(component, deprecationInfo);
      
      case 'legacy':
        return this.handleLegacyComponent(component, deprecationInfo);
      
      default:
        return component;
    }
  }

  /**
   * Handle a removed component (no longer supported)
   */
  handleRemovedComponent(component, deprecationInfo) {
    // Try automatic migration if available
    if (deprecationInfo.migration === 'auto' && deprecationInfo.fallback) {
      console.log(`[DeprecationManager] Auto-migrating ${component.type} to ${deprecationInfo.fallback.type}`);
      return this.migrateComponent(component, deprecationInfo.fallback);
    }

    // Create a placeholder with migration instructions
    return this.createPlaceholder(
      component.type,
      deprecationInfo.notice || `This component (${component.type}) is no longer supported.`,
      deprecationInfo
    );
  }

  /**
   * Handle a deprecated component (still works but shows warning)
   */
  handleDeprecatedWithWarning(component, deprecationInfo) {
    // Component still works but show warning in console
    console.warn(`⚠️ [DeprecationManager] Component "${component.type}" is deprecated and will be removed in version ${deprecationInfo.version || 'future'}`);
    
    if (deprecationInfo.replacement) {
      console.log(`   Suggested replacement: ${deprecationInfo.replacement}`);
    }

    // Add deprecation flag to component
    return {
      ...component,
      _deprecated: true,
      _deprecationInfo: deprecationInfo
    };
  }

  /**
   * Handle a legacy component (old version still supported)
   */
  handleLegacyComponent(component, deprecationInfo) {
    console.log(`[DeprecationManager] Legacy component: ${component.type}`);
    
    // Add legacy flag
    return {
      ...component,
      _legacy: true,
      _deprecationInfo: deprecationInfo
    };
  }

  /**
   * Migrate a component to its replacement
   */
  migrateComponent(component, fallbackConfig) {
    const migratedComponent = {
      id: component.id,
      type: fallbackConfig.type,
      data: {},
      props: {},
      settings: component.settings || {},
      _migrated: true,
      _originalType: component.type
    };

    // Map old data to new structure
    if (fallbackConfig.dataMapping && component.data) {
      Object.entries(fallbackConfig.dataMapping).forEach(([oldKey, newKey]) => {
        if (component.data[oldKey]) {
          migratedComponent.data[newKey] = component.data[oldKey];
        }
      });
    }

    // Copy unmapped data
    if (component.data) {
      Object.entries(component.data).forEach(([key, value]) => {
        if (!migratedComponent.data[key]) {
          migratedComponent.data[key] = value;
        }
      });
    }

    console.log(`✅ [DeprecationManager] Migrated ${component.type} to ${fallbackConfig.type}`);

    return migratedComponent;
  }

  /**
   * Create a placeholder component for removed/invalid components
   */
  createPlaceholder(originalType, message, deprecationInfo = null) {
    return {
      id: `placeholder_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      type: 'deprecated-placeholder',
      data: {
        originalType,
        message,
        deprecationInfo
      },
      props: {
        originalType,
        message
      },
      settings: {},
      _isPlaceholder: true
    };
  }

  /**
   * Batch process all components in a media kit
   * @param {object} components - Components object from store
   * @returns {object} - Processed components
   */
  processAllComponents(components) {
    if (!components || typeof components !== 'object') {
      console.warn('[DeprecationManager] Invalid components object');
      return components;
    }

    const processed = {};
    let deprecatedCount = 0;
    let migratedCount = 0;
    let placeholderCount = 0;

    Object.entries(components).forEach(([id, component]) => {
      const result = this.handleDeprecatedComponent(component);
      
      if (result._deprecated) deprecatedCount++;
      if (result._migrated) migratedCount++;
      if (result._isPlaceholder) placeholderCount++;
      
      processed[id] = result;
    });

    if (deprecatedCount > 0 || migratedCount > 0 || placeholderCount > 0) {
      console.log('[DeprecationManager] Processing complete:', {
        total: Object.keys(components).length,
        deprecated: deprecatedCount,
        migrated: migratedCount,
        placeholders: placeholderCount
      });

      // Dispatch event for UI notification
      document.dispatchEvent(new CustomEvent('gmkb:deprecated-components-found', {
        detail: {
          deprecatedCount,
          migratedCount,
          placeholderCount
        }
      }));
    }

    return processed;
  }

  /**
   * Get user-friendly deprecation notices
   * @returns {array} Array of notice objects
   */
  getDeprecationNotices(components) {
    const notices = [];

    Object.values(components).forEach(component => {
      if (component._deprecated || component._isPlaceholder) {
        const info = component._deprecationInfo;
        notices.push({
          type: component._isPlaceholder ? 'error' : 'warning',
          componentId: component.id,
          componentType: component._originalType || component.type,
          message: info?.notice || `Component "${component.type}" is deprecated`,
          replacement: info?.replacement,
          action: info?.replacement ? 'replace' : 'remove'
        });
      }
    });

    return notices;
  }

  /**
   * Cleanup utility: Remove all deprecated components from a media kit
   * @param {object} components - Components object
   * @param {object} sections - Sections array
   * @returns {object} - Cleaned data
   */
  removeDeprecatedComponents(components, sections) {
    const idsToRemove = new Set();

    // Find all deprecated/placeholder components
    Object.entries(components).forEach(([id, component]) => {
      if (this.isDeprecated(component.type) || component._isPlaceholder) {
        idsToRemove.add(id);
      }
    });

    // Remove from components
    const cleanedComponents = {};
    Object.entries(components).forEach(([id, component]) => {
      if (!idsToRemove.has(id)) {
        cleanedComponents[id] = component;
      }
    });

    // Remove from sections
    const cleanedSections = sections.map(section => {
      const cleaned = { ...section };

      // Full-width sections
      if (cleaned.components) {
        cleaned.components = cleaned.components.filter(compRef => {
          const compId = typeof compRef === 'string' ? compRef : compRef.component_id;
          return !idsToRemove.has(compId);
        });
      }

      // Multi-column sections
      if (cleaned.columns) {
        Object.keys(cleaned.columns).forEach(col => {
          cleaned.columns[col] = cleaned.columns[col].filter(compId => !idsToRemove.has(compId));
        });
      }

      return cleaned;
    });

    console.log(`✅ [DeprecationManager] Removed ${idsToRemove.size} deprecated components`);

    return {
      components: cleanedComponents,
      sections: cleanedSections,
      removedCount: idsToRemove.size
    };
  }
}

// Create singleton instance
const deprecationManager = new ComponentDeprecationManager();

export default deprecationManager;
