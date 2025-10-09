/**
 * Component Validator
 * Validates component structure and settings
 */

import { validateSettings } from './componentSchema.js';

/**
 * Validate complete component structure
 * @param {Object} component - Component to validate
 * @returns {Object} { valid: boolean, errors: string[] }
 */
export function validateComponent(component) {
  const errors = [];
  
  // Check required fields
  if (!component.id) {
    errors.push('Component must have an id');
  }
  
  if (!component.type) {
    errors.push('Component must have a type');
  }
  
  // Validate data object exists
  if (!component.data || typeof component.data !== 'object') {
    errors.push('Component must have a data object');
  }
  
  // Validate settings if present
  if (component.settings) {
    const settingsValidation = validateSettings(component.settings);
    if (!settingsValidation.valid) {
      errors.push(...settingsValidation.errors);
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Sanitize component to ensure clean structure
 * Removes invalid fields and normalizes data
 */
export function sanitizeComponent(component) {
  if (!component || typeof component !== 'object') {
    throw new Error('Invalid component: must be an object');
  }
  
  const sanitized = {
    id: String(component.id || ''),
    type: String(component.type || ''),
    data: component.data && typeof component.data === 'object' ? { ...component.data } : {},
    settings: component.settings && typeof component.settings === 'object' ? { ...component.settings } : {}
  };
  
  // Add optional fields if present
  if (component.sectionId) {
    sanitized.sectionId = String(component.sectionId);
  }
  
  if (component.column !== undefined) {
    sanitized.column = Number(component.column);
  }
  
  if (component.order !== undefined) {
    sanitized.order = Number(component.order);
  }
  
  return sanitized;
}

/**
 * Validate section structure
 */
export function validateSection(section) {
  const errors = [];
  
  if (!section.section_id) {
    errors.push('Section must have a section_id');
  }
  
  if (!section.type && !section.layout) {
    errors.push('Section must have a type or layout');
  }
  
  // Validate full-width sections
  if ((section.type === 'full_width' || section.layout === 'full_width')) {
    if (section.components && !Array.isArray(section.components)) {
      errors.push('Full-width section components must be an array');
    }
  } else {
    // Validate multi-column sections
    if (section.columns && typeof section.columns !== 'object') {
      errors.push('Multi-column section columns must be an object');
    }
  }
  
  return {
    valid: errors.length === 0,
    errors
  };
}

/**
 * Batch validate multiple components
 */
export function validateComponents(components) {
  const results = {
    valid: [],
    invalid: [],
    errors: []
  };
  
  Object.entries(components).forEach(([id, component]) => {
    const validation = validateComponent(component);
    
    if (validation.valid) {
      results.valid.push(id);
    } else {
      results.invalid.push(id);
      results.errors.push({
        componentId: id,
        errors: validation.errors
      });
    }
  });
  
  return results;
}

/**
 * Fix common component issues automatically
 */
export function autoFixComponent(component) {
  const fixed = { ...component };
  
  // Ensure ID is a string
  if (fixed.id) {
    fixed.id = String(fixed.id);
  }
  
  // Ensure type is a string
  if (fixed.type) {
    fixed.type = String(fixed.type);
  }
  
  // Ensure data exists
  if (!fixed.data || typeof fixed.data !== 'object') {
    fixed.data = {};
  }
  
  // Ensure settings exists
  if (!fixed.settings || typeof fixed.settings !== 'object') {
    fixed.settings = {
      style: {},
      advanced: {}
    };
  }
  
  return fixed;
}
