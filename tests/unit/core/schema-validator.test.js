/**
 * Schema Validator Unit Tests
 * 
 * Tests the schema validation system for component schemas
 */

import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { schemaValidator } from '../../../js/core/schema-validator.js';

describe('Schema Validator', () => {
  // Capture console output
  beforeEach(() => {
    vi.spyOn(console, 'log').mockImplementation(() => {});
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    vi.spyOn(console, 'groupCollapsed').mockImplementation(() => {});
    vi.spyOn(console, 'groupEnd').mockImplementation(() => {});
    
    // Mock performance.now
    vi.stubGlobal('performance', {
      now: vi.fn().mockReturnValue(0)
    });
    
    // Reset validation cache
    schemaValidator.clearCache();
  });
  
  afterEach(() => {
    vi.restoreAllMocks();
  });
  
  describe('Basic Validation', () => {
    it('should validate a minimal valid schema', () => {
      const schema = {
        name: 'Test Component',
        category: 'content',
        version: '1.0.0',
        description: 'A test component',
        icon: 'test-icon',
        settings: {}
      };
      
      const result = schemaValidator.validateSchema('test-component', schema);
      
      expect(result.valid).toBe(true);
      expect(result.counts.errors).toBe(0);
      expect(result.componentType).toBe('test-component');
    });
    
    it('should detect missing required fields', () => {
      const schema = {
        // Missing name and category
        settings: {}
      };
      
      const result = schemaValidator.validateSchema('test-component', schema);
      
      expect(result.valid).toBe(false);
      expect(result.counts.errors).toBeGreaterThan(0);
      
      // Verify specific error messages
      const nameError = result.issues.find(issue => 
        issue.field === 'name' && issue.level === 'ERROR'
      );
      const categoryError = result.issues.find(issue => 
        issue.field === 'category' && issue.level === 'ERROR'
      );
      
      expect(nameError).toBeDefined();
      expect(categoryError).toBeDefined();
    });
    
    it('should detect invalid category', () => {
      const schema = {
        name: 'Test Component',
        category: 'invalid-category', // Invalid
        version: '1.0.0',
        settings: {}
      };
      
      const result = schemaValidator.validateSchema('test-component', schema);
      
      const categoryWarning = result.issues.find(issue => 
        issue.field === 'category' && issue.level === 'WARNING'
      );
      
      expect(categoryWarning).toBeDefined();
      expect(categoryWarning.message).toContain('Unknown category');
    });
    
    it('should detect invalid version format', () => {
      const schema = {
        name: 'Test Component',
        category: 'content',
        version: 'invalid-version',
        settings: {}
      };
      
      const result = schemaValidator.validateSchema('test-component', schema);
      
      const versionWarning = result.issues.find(issue => 
        issue.field === 'version' && issue.level === 'WARNING'
      );
      
      expect(versionWarning).toBeDefined();
      expect(versionWarning.message).toContain('Version should follow semantic versioning');
    });
  });
  
  describe('Settings Validation', () => {
    it('should validate setting types', () => {
      const schema = {
        name: 'Test Component',
        category: 'content',
        version: '1.0.0',
        settings: {
          validSetting: {
            type: 'text',
            label: 'Valid Setting'
          },
          invalidSetting: {
            type: 'invalid-type', // Invalid
            label: 'Invalid Setting'
          },
          missingSetting: {
            // Missing type
            label: 'Missing Type'
          }
        }
      };
      
      const result = schemaValidator.validateSchema('test-component', schema);
      
      // Should have error for missing type
      const missingTypeError = result.issues.find(issue => 
        issue.field === 'settings.missingSetting.type' && issue.level === 'ERROR'
      );
      expect(missingTypeError).toBeDefined();
      
      // Should have warning for invalid type
      const invalidTypeWarning = result.issues.find(issue => 
        issue.field === 'settings.invalidSetting.type' && issue.level === 'WARNING'
      );
      expect(invalidTypeWarning).toBeDefined();
    });
    
    it('should validate select field options', () => {
      const schema = {
        name: 'Test Component',
        category: 'content',
        version: '1.0.0',
        settings: {
          noOptions: {
            type: 'select',
            label: 'No Options'
            // Missing options
          },
          invalidOptions: {
            type: 'select',
            label: 'Invalid Options',
            options: 'not-an-array' // Should be array
          },
          incompleteOptions: {
            type: 'select',
            label: 'Incomplete Options',
            options: [
              { value: 'option1' }, // Missing label
              { label: 'Option 2' } // Missing value
            ]
          }
        }
      };
      
      const result = schemaValidator.validateSchema('test-component', schema);
      
      // Error for missing options
      const noOptionsError = result.issues.find(issue => 
        issue.field === 'settings.noOptions.options' && issue.level === 'ERROR'
      );
      expect(noOptionsError).toBeDefined();
      
      // Error for invalid options
      const invalidOptionsError = result.issues.find(issue => 
        issue.field === 'settings.invalidOptions.options' && issue.level === 'ERROR'
      );
      expect(invalidOptionsError).toBeDefined();
      
      // Warnings for incomplete options
      const incompleteOptionWarnings = result.issues.filter(issue => 
        issue.field.startsWith('settings.incompleteOptions.options[') && 
        issue.level === 'WARNING'
      );
      expect(incompleteOptionWarnings.length).toBe(2);
    });
    
    it('should validate numeric field min/max', () => {
      const schema = {
        name: 'Test Component',
        category: 'content',
        version: '1.0.0',
        settings: {
          invalidRange: {
            type: 'number',
            label: 'Invalid Range',
            min: 100,
            max: 10 // Min > max
          }
        }
      };
      
      const result = schemaValidator.validateSchema('test-component', schema);
      
      // Error for min > max
      const rangeError = result.issues.find(issue => 
        issue.field === 'settings.invalidRange' && 
        issue.level === 'ERROR' &&
        issue.message.includes('Min value cannot be greater than max value')
      );
      expect(rangeError).toBeDefined();
    });
    
    it('should validate update methods', () => {
      const schema = {
        name: 'Test Component',
        category: 'content',
        version: '1.0.0',
        settings: {
          validUpdate: {
            type: 'text',
            label: 'Valid Update',
            updateMethod: 'textContent',
            previewSelector: '.test-element'
          },
          invalidUpdate: {
            type: 'text',
            label: 'Invalid Update',
            updateMethod: 'invalid-method', // Invalid
            previewSelector: '.test-element'
          },
          missingSelectorUpdate: {
            type: 'text',
            label: 'Missing Selector',
            updateMethod: 'textContent'
            // Missing previewSelector
          }
        }
      };
      
      const result = schemaValidator.validateSchema('test-component', schema);
      
      // Warning for invalid update method
      const invalidMethodWarning = result.issues.find(issue => 
        issue.field === 'settings.invalidUpdate.updateMethod' && 
        issue.level === 'WARNING'
      );
      expect(invalidMethodWarning).toBeDefined();
      
      // Warning for missing preview selector
      const missingSelectorWarning = result.issues.find(issue => 
        issue.field === 'settings.missingSelectorUpdate.previewSelector' && 
        issue.level === 'WARNING'
      );
      expect(missingSelectorWarning).toBeDefined();
    });
  });
  
  describe('Sections Validation', () => {
    it('should validate sections with settings', () => {
      const schema = {
        name: 'Test Component',
        category: 'content',
        version: '1.0.0',
        sections: {
          content: {
            title: 'Content',
            order: 1
          },
          style: {
            title: 'Style',
            order: 2
          },
          unused: {
            title: 'Unused',
            order: 3
          }
        },
        settings: {
          title: {
            type: 'text',
            label: 'Title',
            section: 'content'
          },
          color: {
            type: 'color',
            label: 'Color',
            section: 'style'
          },
          invalidSection: {
            type: 'text',
            label: 'Invalid Section',
            section: 'non-existent' // Reference to non-existent section
          }
        }
      };
      
      const result = schemaValidator.validateSchema('test-component', schema);
      
      // Warning for reference to non-existent section
      const invalidSectionWarning = result.issues.find(issue => 
        issue.field === 'settings.invalidSection.section' && 
        issue.level === 'WARNING'
      );
      expect(invalidSectionWarning).toBeDefined();
      
      // Info for unused section
      const unusedSectionInfo = result.issues.find(issue => 
        issue.field === 'sections.unused' && 
        issue.level === 'INFO'
      );
      expect(unusedSectionInfo).toBeDefined();
    });
    
    it('should warn about sections without settings', () => {
      const schema = {
        name: 'Test Component',
        category: 'content',
        version: '1.0.0',
        sections: {
          content: {
            title: 'Content',
            order: 1
          }
        }
        // No settings defined
      };
      
      const result = schemaValidator.validateSchema('test-component', schema);
      
      // Warning for sections without settings
      const sectionsWarning = result.issues.find(issue => 
        issue.field === 'sections' && 
        issue.level === 'WARNING' &&
        issue.message.includes('Sections defined but no settings found')
      );
      expect(sectionsWarning).toBeDefined();
    });
  });
  
  describe('Best Practices', () => {
    it('should suggest best practices', () => {
      const schema = {
        name: 'Test Component',
        category: 'content',
        version: '1.0.0',
        // Missing recommended fields: description, icon
        settings: {
          title: {
            type: 'text',
            // Missing label, default
          }
        }
      };
      
      const result = schemaValidator.validateSchema('test-component', schema);
      
      // Info suggestions for description and icon
      const descriptionInfo = result.issues.find(issue => 
        issue.field === 'description' && 
        issue.level === 'INFO'
      );
      expect(descriptionInfo).toBeDefined();
      
      const iconInfo = result.issues.find(issue => 
        issue.field === 'icon' && 
        issue.level === 'INFO'
      );
      expect(iconInfo).toBeDefined();
      
      // Warning for missing label
      const labelWarning = result.issues.find(issue => 
        issue.field === 'settings.title.label' && 
        issue.level === 'WARNING'
      );
      expect(labelWarning).toBeDefined();
      
      // Warning for missing default
      const defaultWarning = result.issues.find(issue => 
        issue.field === 'settings.title.default' && 
        issue.level === 'WARNING'
      );
      expect(defaultWarning).toBeDefined();
    });
    
    it('should validate specific field type recommendations', () => {
      const schema = {
        name: 'Test Component',
        category: 'content',
        version: '1.0.0',
        settings: {
          textarea: {
            type: 'textarea',
            label: 'Text Area'
            // Missing rows
          },
          image: {
            type: 'image',
            label: 'Image'
            // Missing helpText
          }
        }
      };
      
      const result = schemaValidator.validateSchema('test-component', schema);
      
      // Info for textarea rows
      const textareaInfo = result.issues.find(issue => 
        issue.field === 'settings.textarea.rows' && 
        issue.level === 'INFO'
      );
      expect(textareaInfo).toBeDefined();
      
      // Info for image helpText
      const imageInfo = result.issues.find(issue => 
        issue.field === 'settings.image.helpText' && 
        issue.level === 'INFO'
      );
      expect(imageInfo).toBeDefined();
    });
  });
  
  describe('Validation Result', () => {
    it('should create correct summary and counts', () => {
      const schema = {
        name: 'Test Component',
        // Missing category (ERROR)
        version: 'invalid', // (WARNING)
        settings: {
          title: {
            // Missing type (ERROR)
          }
        }
      };
      
      const result = schemaValidator.validateSchema('test-component', schema);
      
      expect(result.counts.errors).toBe(2);
      expect(result.counts.warnings).toBeGreaterThan(0);
      expect(result.counts.total).toBeGreaterThan(2);
      expect(result.valid).toBe(false);
      
      // Summary should mention errors
      expect(result.summary).toContain('2 errors');
    });
    
    it('should mark schema as valid with only warnings/info', () => {
      const schema = {
        name: 'Test Component',
        category: 'content',
        version: 'invalid', // Just a warning
        settings: {}
      };
      
      const result = schemaValidator.validateSchema('test-component', schema);
      
      expect(result.counts.errors).toBe(0);
      expect(result.counts.warnings).toBeGreaterThan(0);
      expect(result.valid).toBe(true); // Valid despite warnings
    });
    
    it('should cache validation results', () => {
      const schema = {
        name: 'Test Component',
        category: 'content',
        version: '1.0.0'
      };
      
      // First validation
      schemaValidator.validateSchema('test-component', schema);
      
      // Spy on createValidationResult
      const createSpy = vi.spyOn(schemaValidator, 'createValidationResult');
      
      // Second validation should use cache
      schemaValidator.validateSchema('test-component', schema);
      
      expect(createSpy).not.toHaveBeenCalled();
    });
  });
  
  describe('Validation Summary', () => {
    it('should generate validation summary for multiple components', () => {
      // Validate multiple schemas
      schemaValidator.validateSchema('component1', {
        name: 'Component 1',
        category: 'content',
        version: '1.0.0'
      });
      
      schemaValidator.validateSchema('component2', {
        name: 'Component 2',
        // Missing category (ERROR)
        version: '1.0.0'
      });
      
      schemaValidator.validateSchema('component3', {
        name: 'Component 3',
        category: 'content',
        version: 'invalid' // (WARNING)
      });
      
      const summary = schemaValidator.getValidationSummary();
      
      expect(summary.totalComponents).toBe(3);
      expect(summary.validComponents).toBe(2); // component1 and component3
      expect(summary.componentsWithErrors).toBe(1); // component2
      expect(summary.componentsWithWarnings).toBeGreaterThanOrEqual(1); // At least component3
      expect(summary.components.length).toBe(3);
    });
  });
  
  describe('Utility Methods', () => {
    it('should validate semantic version format', () => {
      const validVersions = ['1.0.0', '0.1.0', '1.2.3', '1.0.0-alpha', '2.0.0-beta'];
      const invalidVersions = ['1.0', 'v1.0.0', '1', 'version 1', '1.0.0.0', '2.0.0-beta.1'];
      
      validVersions.forEach(version => {
        expect(schemaValidator.isValidVersion(version)).toBe(true);
      });
      
      invalidVersions.forEach(version => {
        expect(schemaValidator.isValidVersion(version)).toBe(false);
      });
    });
    
    it('should clear validation cache', () => {
      // Add to cache
      schemaValidator.validateSchema('test', { name: 'Test', category: 'content' });
      
      // Cache should have one entry
      expect(schemaValidator.validationCache.size).toBe(1);
      
      // Clear cache
      schemaValidator.clearCache();
      
      // Cache should be empty
      expect(schemaValidator.validationCache.size).toBe(0);
    });
  });
});
