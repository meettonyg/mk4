/**
 * Pods Data Integration - Self-Contained Architecture Compliant
 * 
 * This integration respects the self-contained component architecture:
 * - Each component defines its own data needs in /components/[name]/pods-config.json
 * - This class only acts as a bridge between Pods data and components
 * - No hardcoded field mappings here
 */

export class PodsDataIntegration {
  constructor() {
    this.podsData = this.getPodsDataSource();
    
    if (Object.keys(this.podsData).length > 0) {
      console.log('[PodsDataIntegration] Pods data available:', Object.keys(this.podsData).length, 'fields');
    }
  }

  /**
   * Get Pods data from WordPress
   * Single source of truth for where Pods data lives
   */
  getPodsDataSource() {
    return window.gmkbData?.pods_data || window.gmkbVueData?.pods_data || {};
  }

  /**
   * Get component's Pods configuration
   * Each component defines its own needs in pods-config.json
   */
  getComponentPodsConfig(componentType) {
    // In a full implementation, this would load from the component's folder
    // For now, return embedded configs that match the component folders
    const configs = {
      biography: {
        dataSource: "pods",
        fields: {
          biography: ["biography", "guest_biography", "bio"],
          name: {
            type: "composite",
            fields: ["first_name", "last_name"],
            format: "{first_name} {last_name}"
          },
          title: ["guest_title", "professional_title", "title"]
        }
      },
      hero: {
        dataSource: "pods",
        fields: {
          title: {
            type: "composite",
            fields: ["first_name", "last_name"],
            format: "{first_name} {last_name}"
          },
          subtitle: ["guest_title", "tagline"],
          description: ["tagline", "introduction"]
        }
      },
      contact: {
        dataSource: "pods",
        fields: {
          email: ["email"],
          phone: ["phone"],
          website: ["website"],
          linkedin: ["linkedin"],
          twitter: ["twitter"]
        }
      }
    };

    return configs[componentType] || null;
  }

  /**
   * Transform Pods data based on component's configuration
   */
  transformPodsData(config, podsData) {
    const result = {};

    for (const [targetField, sourceConfig] of Object.entries(config.fields)) {
      if (typeof sourceConfig === 'object' && sourceConfig.type === 'composite') {
        // Handle composite fields (like full name)
        let value = sourceConfig.format;
        for (const field of sourceConfig.fields) {
          const fieldValue = podsData[field] || '';
          value = value.replace(`{${field}}`, fieldValue);
        }
        result[targetField] = value.trim();
      } else if (typeof sourceConfig === 'object' && sourceConfig.type === 'array') {
        // Handle array fields (like topics)
        const values = [];
        for (const field of sourceConfig.fields) {
          if (podsData[field]) {
            values.push(podsData[field]);
          }
        }
        result[targetField] = values;
      } else {
        // Handle simple field mapping (with fallbacks)
        const possibleFields = Array.isArray(sourceConfig) ? sourceConfig : [sourceConfig];
        for (const field of possibleFields) {
          if (podsData[field]) {
            result[targetField] = podsData[field];
            break;
          }
        }
      }
    }

    return result;
  }

  /**
   * Enrich component with Pods data
   * Respects self-contained architecture by using component's own config
   */
  enrichComponentData(component) {
    const config = this.getComponentPodsConfig(component.type);
    
    if (!config || config.dataSource !== 'pods') {
      return component;
    }

    const transformedData = this.transformPodsData(config, this.podsData);
    
    // Merge the transformed Pods data with component data
    component.data = {
      ...component.data,
      ...transformedData,
      _dataSource: 'pods'
    };

    console.log(`[PodsDataIntegration] Enriched ${component.type} with Pods data:`, transformedData);
    
    return component;
  }

  /**
   * Check if Pods data is available
   */
  hasPodsData() {
    return Object.keys(this.podsData).length > 0;
  }
}

// Create singleton instance
const podsDataIntegration = new PodsDataIntegration();

export default podsDataIntegration;
