/**
 * Flexible Validator - Phase 15
 * 
 * Provides lenient validation that auto-fixes issues rather than rejecting data
 * Ensures components work even with missing optional fields
 * 
 * @version 1.0.0
 */

export class FlexibleValidator {
  
  /**
   * Validate and auto-fix component data
   * @param {Object} component - Component to validate
   * @param {Object} options - Validation options
   * @returns {Object} Validation result with fixed component
   */
  static validateComponent(component, options = {}) {
    const { 
      strict = false,
      requireAllFields = false,
      allowExtraFields = true,
      autoFix = true
    } = options;
    
    const errors = [];
    const warnings = [];
    const fixes = [];
    
    // Ensure component is an object
    if (!component || typeof component !== 'object') {
      if (strict) {
        errors.push('Component must be an object');
        return { valid: false, errors, warnings, fixes, component: null };
      } else if (autoFix) {
        component = {};
        fixes.push('Created empty component object');
      }
    }
    
    // Required fields (minimal for functioning)
    const requiredFields = ['type', 'id'];
    
    // Optional but recommended fields
    const recommendedFields = ['data', 'props', 'settings'];
    
    // Check and fix required fields
    requiredFields.forEach(field => {
      if (!component[field]) {
        if (strict && requireAllFields) {
          errors.push(`Missing required field: ${field}`);
        } else if (autoFix) {
          // Auto-generate missing required fields
          switch (field) {
            case 'id':
              component.id = `comp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
              fixes.push(`Generated missing ID: ${component.id}`);
              break;
              
            case 'type':
              // Try to infer type from other fields
              if (component.component_type) {
                component.type = component.component_type;
                fixes.push(`Used component_type for missing type: ${component.type}`);
              } else if (component.name) {
                component.type = component.name.toLowerCase().replace(/\s+/g, '-');
                fixes.push(`Derived type from name: ${component.type}`);
              } else {
                component.type = 'unknown';
                warnings.push('Set type to "unknown" - component may not render properly');
              }
              break;
          }
        }
      }
    });
    
    // Initialize recommended fields if missing
    if (!strict || autoFix) {
      recommendedFields.forEach(field => {
        if (!component[field]) {
          switch (field) {
            case 'data':
              component.data = {};
              fixes.push('Initialized missing data field to empty object');
              break;
              
            case 'props':
              component.props = {};
              fixes.push('Initialized missing props field to empty object');
              break;
              
            case 'settings':
              component.settings = {};
              fixes.push('Initialized missing settings field to empty object');
              break;
          }
        }
      });
    }
    
    // Validate data types
    if (component.data && typeof component.data !== 'object') {
      if (strict) {
        errors.push('Data field must be an object');
      } else if (autoFix) {
        try {
          // Try to parse if it's a string
          if (typeof component.data === 'string') {
            component.data = JSON.parse(component.data);
            fixes.push('Parsed data field from string to object');
          } else {
            component.data = {};
            fixes.push('Reset invalid data field to empty object');
          }
        } catch {
          component.data = {};
          fixes.push('Reset unparseable data field to empty object');
        }
      }
    }
    
    // Validate props type
    if (component.props && typeof component.props !== 'object') {
      if (strict) {
        errors.push('Props field must be an object');
      } else if (autoFix) {
        component.props = {};
        fixes.push('Reset invalid props field to empty object');
      }
    }
    
    // Validate settings type
    if (component.settings && typeof component.settings !== 'object') {
      if (strict) {
        errors.push('Settings field must be an object');
      } else if (autoFix) {
        component.settings = {};
        fixes.push('Reset invalid settings field to empty object');
      }
    }
    
    // Clean up legacy or internal fields
    if (!allowExtraFields) {
      const internalFields = ['_uid', '_temp', '__vueComponent', '_dirty'];
      internalFields.forEach(field => {
        if (component[field]) {
          delete component[field];
          fixes.push(`Removed internal field: ${field}`);
        }
      });
    }
    
    // Type-specific validation
    const typeValidation = this.validateComponentType(component, { strict, autoFix });
    if (typeValidation.errors.length > 0) {
      errors.push(...typeValidation.errors);
    }
    if (typeValidation.warnings.length > 0) {
      warnings.push(...typeValidation.warnings);
    }
    if (typeValidation.fixes.length > 0) {
      fixes.push(...typeValidation.fixes);
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      fixes,
      component // Return potentially fixed component
    };
  }
  
  /**
   * Type-specific validation
   */
  static validateComponentType(component, options = {}) {
    const errors = [];
    const warnings = [];
    const fixes = [];
    
    const { autoFix = true } = options;
    
    switch (component.type) {
      case 'hero':
        // Hero should have title and subtitle
        if (!component.data.title && autoFix) {
          component.data.title = 'Your Title Here';
          fixes.push('Added default title to hero component');
        }
        if (!component.data.subtitle && autoFix) {
          component.data.subtitle = '';
          fixes.push('Added empty subtitle to hero component');
        }
        break;
        
      case 'biography':
      case 'bio':
        // Biography should have bio text
        if (!component.data.biography && !component.data.bio && autoFix) {
          component.data.biography = '';
          fixes.push('Added empty biography field');
        }
        break;
        
      case 'contact':
        // Contact should have email
        if (!component.data.email && autoFix) {
          component.data.email = '';
          fixes.push('Added empty email field to contact component');
        }
        break;
        
      case 'social':
      case 'social-links':
        // Social should have links array
        if (!component.data.links && autoFix) {
          component.data.links = [];
          fixes.push('Added empty links array to social component');
        }
        break;
        
      case 'topics':
      case 'topics-questions':
        // Topics should have topics array
        if (!component.data.topics && autoFix) {
          component.data.topics = [];
          fixes.push('Added empty topics array');
        }
        break;
    }
    
    return { errors, warnings, fixes };
  }
  
  /**
   * Sanitize component for safe usage
   */
  static sanitizeComponent(component) {
    const validation = this.validateComponent(component, { 
      strict: false, 
      autoFix: true,
      allowExtraFields: false
    });
    
    return validation.component;
  }
  
  /**
   * Validate section
   */
  static validateSection(section, options = {}) {
    const { 
      strict = false,
      autoFix = true
    } = options;
    
    const errors = [];
    const warnings = [];
    const fixes = [];
    
    // Ensure section is an object
    if (!section || typeof section !== 'object') {
      if (strict) {
        errors.push('Section must be an object');
        return { valid: false, errors, warnings, fixes, section: null };
      } else if (autoFix) {
        section = {};
        fixes.push('Created empty section object');
      }
    }
    
    // Required fields
    if (!section.section_id) {
      if (strict) {
        errors.push('Missing section_id');
      } else if (autoFix) {
        section.section_id = `section_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        fixes.push(`Generated section_id: ${section.section_id}`);
      }
    }
    
    // Layout/type field
    if (!section.type && !section.layout) {
      if (strict) {
        errors.push('Missing section type/layout');
      } else if (autoFix) {
        section.type = 'full_width';
        section.layout = 'full_width';
        fixes.push('Set default layout: full_width');
      }
    } else if (section.type && !section.layout) {
      section.layout = section.type;
      fixes.push('Copied type to layout field');
    } else if (section.layout && !section.type) {
      section.type = section.layout;
      fixes.push('Copied layout to type field');
    }
    
    // Components array
    if (!section.components) {
      section.components = [];
      fixes.push('Initialized empty components array');
    } else if (!Array.isArray(section.components)) {
      if (strict) {
        errors.push('Components must be an array');
      } else if (autoFix) {
        // Try to convert to array
        if (typeof section.components === 'string') {
          section.components = [section.components];
          fixes.push('Converted components string to array');
        } else {
          section.components = [];
          fixes.push('Reset invalid components to empty array');
        }
      }
    }
    
    // Columns for multi-column layouts
    if (['two_column', 'three_column'].includes(section.type)) {
      if (!section.columns) {
        section.columns = {
          1: [],
          2: [],
          3: []
        };
        fixes.push('Initialized column structure for multi-column layout');
      }
    }
    
    // Settings object
    if (!section.settings) {
      section.settings = {};
      fixes.push('Initialized empty settings object');
    } else if (typeof section.settings !== 'object') {
      if (strict) {
        errors.push('Settings must be an object');
      } else if (autoFix) {
        section.settings = {};
        fixes.push('Reset invalid settings to empty object');
      }
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      fixes,
      section
    };
  }
  
  /**
   * Validate entire state
   */
  static validateState(state, options = {}) {
    const errors = [];
    const warnings = [];
    const fixes = [];
    
    // Validate components
    if (state.components && typeof state.components === 'object') {
      Object.keys(state.components).forEach(id => {
        const validation = this.validateComponent(state.components[id], options);
        if (!validation.valid) {
          errors.push(...validation.errors.map(e => `Component ${id}: ${e}`));
        }
        warnings.push(...validation.warnings.map(w => `Component ${id}: ${w}`));
        fixes.push(...validation.fixes.map(f => `Component ${id}: ${f}`));
        
        // Update with fixed component
        state.components[id] = validation.component;
      });
    }
    
    // Validate sections
    if (state.sections && Array.isArray(state.sections)) {
      state.sections.forEach((section, index) => {
        const validation = this.validateSection(section, options);
        if (!validation.valid) {
          errors.push(...validation.errors.map(e => `Section ${index}: ${e}`));
        }
        warnings.push(...validation.warnings.map(w => `Section ${index}: ${w}`));
        fixes.push(...validation.fixes.map(f => `Section ${index}: ${f}`));
        
        // Update with fixed section
        state.sections[index] = validation.section;
      });
    }
    
    return {
      valid: errors.length === 0,
      errors,
      warnings,
      fixes,
      state
    };
  }
  
  /**
   * Check state size for database storage
   */
  static validateStateSize(state) {
    const json = JSON.stringify(state);
    const sizeInBytes = new Blob([json]).size;
    const sizeInKB = Math.round(sizeInBytes / 1024);
    const sizeInMB = Math.round(sizeInBytes / (1024 * 1024));
    
    // WordPress post meta has a limit around 1MB
    const maxSizeBytes = 1048576; // 1MB
    
    return {
      valid: sizeInBytes < maxSizeBytes,
      sizeInBytes,
      sizeInKB,
      sizeInMB,
      percentage: Math.round((sizeInBytes / maxSizeBytes) * 100),
      remaining: maxSizeBytes - sizeInBytes,
      remainingKB: Math.round((maxSizeBytes - sizeInBytes) / 1024)
    };
  }
}

// Convenience export
export function validateComponent(component, options) {
  return FlexibleValidator.validateComponent(component, options);
}

export function sanitizeComponent(component) {
  return FlexibleValidator.sanitizeComponent(component);
}

export function validateSection(section, options) {
  return FlexibleValidator.validateSection(section, options);
}

export function validateState(state, options) {
  return FlexibleValidator.validateState(state, options);
}

// Expose for debugging in development
if (typeof window !== 'undefined' && process.env.NODE_ENV === 'development') {
  window.FlexibleValidator = FlexibleValidator;
  console.log('[FlexibleValidator] Available at window.FlexibleValidator');
}
