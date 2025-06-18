/**
 * Schema Validation Console Utilities
 * Provides easy access to schema validation results from browser console
 */

import { schemaValidator } from '../core/schema-validator.js';
import { enhancedComponentManager } from '../core/enhanced-component-manager.js';

// Create global schema validation utilities
window.mkSchema = {
    /**
     * Get validation summary for all loaded schemas
     */
    summary() {
        const summary = schemaValidator.getValidationSummary();
        
        console.log('📊 Schema Validation Summary');
        console.log('============================');
        console.log(`Total Components: ${summary.totalComponents}`);
        console.log(`✅ Valid: ${summary.validComponents}`);
        console.log(`❌ With Errors: ${summary.componentsWithErrors}`);
        console.log(`⚠️  With Warnings: ${summary.componentsWithWarnings}`);
        console.log(`📝 Total Issues: ${summary.totalIssues}`);
        
        if (summary.components.length > 0) {
            console.table(summary.components);
        }
        
        return summary;
    },
    
    /**
     * Validate a specific component schema
     */
    async validate(componentType) {
        console.log(`Validating schema for: ${componentType}`);
        
        try {
            // Load the schema
            const schema = await enhancedComponentManager.loadComponentSchema(componentType);
            
            if (!schema) {
                console.error(`No schema found for component: ${componentType}`);
                return null;
            }
            
            // Validate it
            const result = schemaValidator.validateSchema(componentType, schema);
            
            // Return result for programmatic use
            return result;
        } catch (error) {
            console.error(`Error validating ${componentType}:`, error);
            return null;
        }
    },
    
    /**
     * Validate all registered components
     */
    async validateAll() {
        console.log('🔍 Validating all component schemas...');
        
        const components = window.guestifyData?.components || [];
        const results = [];
        
        for (const component of components) {
            const componentType = component.directory || component.name;
            await this.validate(componentType);
            results.push(componentType);
        }
        
        console.log(`\n✅ Validated ${results.length} components`);
        this.summary();
        
        return results;
    },
    
    /**
     * Clear validation cache
     */
    clearCache() {
        schemaValidator.clearCache();
        console.log('✅ Schema validation cache cleared');
    },
    
    /**
     * Show detailed issues for a component
     */
    issues(componentType) {
        const cache = schemaValidator.validationCache;
        let result = null;
        
        // Find the result in cache
        cache.forEach((value, key) => {
            if (value.componentType === componentType) {
                result = value;
            }
        });
        
        if (!result) {
            console.log(`No validation results found for: ${componentType}`);
            console.log('Try running: mkSchema.validate("' + componentType + '")');
            return null;
        }
        
        console.log(`\n📋 Issues for ${componentType}:`);
        console.log('=' + '='.repeat(20 + componentType.length));
        
        if (result.issues.length === 0) {
            console.log('✅ No issues found!');
        } else {
            result.issues.forEach((issue, index) => {
                const icon = issue.level === 'ERROR' ? '❌' : issue.level === 'WARNING' ? '⚠️' : 'ℹ️';
                const color = issue.level === 'ERROR' ? 'color: red' : issue.level === 'WARNING' ? 'color: orange' : 'color: blue';
                
                console.log(`\n${index + 1}. ${icon} ${issue.level}`);
                console.log(`%c   Field: ${issue.field}`, color);
                console.log(`   Issue: ${issue.message}`);
                console.log(`   💡 Fix: ${issue.suggestion}`);
            });
        }
        
        return result;
    },
    
    /**
     * Fix common schema issues (generates fixed schema)
     */
    suggest(componentType) {
        console.log(`🔧 Generating schema suggestions for: ${componentType}`);
        
        // This would analyze the current schema and suggest fixes
        console.log('Feature coming soon: Auto-generate improved schema based on validation results');
        console.log('For now, use mkSchema.issues("' + componentType + '") to see what needs fixing');
    },
    
    /**
     * Enable strict mode (for testing - not yet implemented)
     */
    strictMode(enable = true) {
        if (enable) {
            console.warn('⚠️ Strict mode would block component loading on schema errors.');
            console.warn('This feature is not yet implemented. Currently running in warning-only mode.');
        }
        // Future: window.guestifyData.features.strictSchemaValidation = enable;
    },
    
    /**
     * Show help
     */
    help() {
        console.log('🔧 Media Kit Schema Validation Utilities');
        console.log('=======================================\n');
        console.log('Available commands:\n');
        console.log('  mkSchema.summary()          - Show validation summary for all schemas');
        console.log('  mkSchema.validate("hero")   - Validate a specific component schema');
        console.log('  mkSchema.validateAll()      - Validate all registered components');
        console.log('  mkSchema.issues("hero")     - Show detailed issues for a component');
        console.log('  mkSchema.clearCache()       - Clear validation cache');
        console.log('  mkSchema.strictMode()       - Enable strict validation (future feature)');
        console.log('  mkSchema.help()             - Show this help message');
        console.log('\nExamples:');
        console.log('  mkSchema.validate("hero").then(() => mkSchema.issues("hero"))');
        console.log('  mkSchema.validateAll().then(() => mkSchema.summary())');
    }
};

// Log availability
console.log('📋 Schema validation utilities loaded. Type mkSchema.help() for usage.');

// Export for module usage
export const schemaUtils = window.mkSchema;