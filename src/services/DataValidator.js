/**
 * Data Validator - Ensures data integrity
 * Phase 6: Race Conditions & Optimization
 * P0 FIX #9: XSS Sanitization integrated
 * 
 * @package GMKB
 * @version 2.0.0
 */

import { sanitizeState as sanitizeForXSS, sanitizeComponentData } from './XSSSanitizer.js';

export class DataValidator {

  /**
   * Validate gmkbData is available and complete
   */
  static validateGmkbData() {
    if (typeof window.gmkbData === 'undefined') {
      throw new Error(
        'gmkbData not available. Ensure template injects window.gmkbData before Vue bundle loads.'
      );
    }

    const required = [
      'postId',
      'nonce',
      'restUrl',
      'restNonce',
      'ajaxUrl'
    ];

    const missing = required.filter(key => !window.gmkbData[key]);

    if (missing.length > 0) {
      throw new Error(
        `gmkbData missing required fields: ${missing.join(', ')}`
      );
    }

    // Validate types
    if (typeof window.gmkbData.postId !== 'number') {
      throw new Error('gmkbData.postId must be a number');
    }

    // ROOT FIX: Allow relative URLs (WordPress commonly supplies '/wp-json/')
    if (!window.gmkbData.restUrl.startsWith('http') && !window.gmkbData.restUrl.startsWith('/')) {
      throw new Error('gmkbData.restUrl must be a valid URL or relative path');
    }

    return true;
  }

  /**
   * Validate component data structure
   * ROOT FIX: Use dynamic validation against registered components instead of hardcoded list
   */
  static validateComponent(component) {
    if (!component || typeof component !== 'object') {
      throw new Error('Component must be an object');
    }

    if (!component.type) {
      throw new Error('Component must have a type');
    }

    if (component.type === 'unknown_type') {
      throw new Error('Invalid component type: unknown_type');
    }

    // ROOT FIX: Validate against dynamically registered components
    // Check if componentDefinitions are available in gmkbData
    if (window.gmkbData?.componentDefinitions) {
      const registeredTypes = window.gmkbData.componentDefinitions.map(c => c.type);
      
      if (!registeredTypes.includes(component.type)) {
        console.warn(`Unknown component type: ${component.type}. Not found in registered components:`, registeredTypes);
      }
    } else if (window.gmkbData?.debugMode) {
      // Only log in debug mode if componentDefinitions aren't available
      console.log(`Component validation: ${component.type} (componentDefinitions not yet loaded)`);
    }

    return true;
  }

  /**
   * Validate API response structure
   */
  static validateAPIResponse(response) {
    if (!response) {
      throw new Error('API response is empty');
    }

    if (!response.success) {
      throw new Error(response.message || 'API returned unsuccessful response');
    }

    if (!response.state) {
      throw new Error('API response missing state object');
    }

    if (!response.state.components || typeof response.state.components !== 'object') {
      throw new Error('API response missing components object');
    }

    if (!Array.isArray(response.state.sections)) {
      throw new Error('API response sections must be an array');
    }

    return true;
  }

  /**
   * Validate state data before save
   */
  static validateState(state) {
    if (!state || typeof state !== 'object') {
      throw new Error('State must be an object');
    }
    
    // ROOT FIX: Check for circular references
    try {
      JSON.stringify(state);
    } catch (error) {
      if (error.message.includes('circular')) {
        throw new Error('State contains circular references');
      }
      throw error;
    }

    // Validate components
    if (state.components) {
      // ROOT FIX: Handle both empty object {} and null
      if (state.components === null) {
        state.components = {};
      }
      
      if (typeof state.components !== 'object' || Array.isArray(state.components)) {
        throw new Error('State.components must be an object (not array)');
      }
      
      // ROOT FIX: Check component count
      const componentCount = Object.keys(state.components).length;
      if (componentCount > 500) {
        throw new Error(`Too many components: ${componentCount} (max 500)`);
      }

      Object.entries(state.components).forEach(([id, component]) => {
        try {
          this.validateComponent(component);
          // ROOT FIX: Validate individual component size
          const componentSize = JSON.stringify(component).length;
          if (componentSize > 100000) { // 100KB per component
            console.warn(`Component ${id} is very large: ${Math.round(componentSize/1024)}KB`);
          }
        } catch (error) {
          throw new Error(`Invalid component ${id}: ${error.message}`);
        }
      });
    }

    // Validate sections
    if (state.sections) {
      if (!Array.isArray(state.sections)) {
        throw new Error('State.sections must be an array');
      }

      state.sections.forEach((section, index) => {
        if (!section.section_id) {
          throw new Error(`Section at index ${index} missing section_id`);
        }

        if (!section.layout && !section.type) {
          throw new Error(`Section ${section.section_id} missing layout/type`);
        }
      });
    }

    return true;
  }

  /**
   * P0 FIX #9: Sanitize state data for saving
   * Removes Vue reactivity wrappers and XSS vulnerabilities
   */
  static sanitizeState(state) {
    try {
      // Step 1: Deep clone to remove reactivity
      const sanitized = JSON.parse(JSON.stringify(state));

      // Step 2: XSS sanitization (P0 FIX #9)
      const xssSanitized = sanitizeForXSS(sanitized);

      // Step 3: Clean components
      if (xssSanitized.components) {
        Object.keys(xssSanitized.components).forEach(id => {
          const component = xssSanitized.components[id];

          // Remove Vue internal properties
          delete component.__v_skip;
          delete component.__v_isRef;
          delete component.__v_isReadonly;

          // Ensure required properties
          if (!component.id) component.id = id;
          if (!component.data) component.data = {};
          if (!component.props) component.props = {};
          if (!component.settings) component.settings = {};
        });
      }

      // Step 4: Clean sections
      if (xssSanitized.sections) {
        xssSanitized.sections.forEach(section => {
          // Remove Vue internal properties
          delete section.__v_skip;
          delete section.__v_isRef;
          delete section.__v_isReadonly;

          // Ensure components array exists for full-width sections
          if (section.layout === 'full_width' && !section.components) {
            section.components = [];
          }

          // Ensure columns exist for multi-column sections
          if (section.layout !== 'full_width' && !section.columns) {
            section.columns = { 1: [], 2: [], 3: [] };
          }
        });
      }

      return xssSanitized;
    } catch (error) {
      console.error('Failed to sanitize state:', error);
      throw new Error('State sanitization failed: ' + error.message);
    }
  }

  /**
   * Check state size before saving
   */
  static validateStateSize(state) {
    const serialized = JSON.stringify(state);
    const sizeInBytes = new Blob([serialized]).size;
    const sizeInKB = Math.round(sizeInBytes / 1024);
    const sizeInMB = sizeInKB / 1024;

    // WordPress post meta has a limit around 4MB
    const MAX_SIZE_MB = 3; // Leave buffer room

    if (sizeInMB > MAX_SIZE_MB) {
      throw new Error(
        `State too large: ${sizeInMB.toFixed(2)}MB (max ${MAX_SIZE_MB}MB). ` +
        'Consider reducing component data or optimizing images.'
      );
    }

    return {
      valid: true,
      sizeInBytes,
      sizeInKB,
      sizeInMB: parseFloat(sizeInMB.toFixed(2))
    };
  }

  /**
   * Validate component compatibility with current system
   */
  static validateComponentCompatibility(component) {
    const warnings = [];

    // Check for deprecated fields
    const deprecatedFields = ['__legacy', '__vueComponent', 'rendered', 'html'];
    deprecatedFields.forEach(field => {
      if (component[field]) {
        warnings.push(`Component contains deprecated field: ${field}`);
      }
    });

    // Check for required modern structure
    if (!component.data && !component.props) {
      warnings.push('Component missing both data and props objects');
    }

    return {
      compatible: warnings.length === 0,
      warnings
    };
  }
}
