/**
 * Schema Validator for Media Kit Builder Components
 * Non-breaking validation with warnings and suggestions
 */

export class SchemaValidator {
    constructor() {
        this.validationCache = new Map();
        this.validationRules = this.initializeRules();
        this.performanceThreshold = 10; // ms
    }

    /**
     * Initialize validation rules
     */
    initializeRules() {
        return {
            // Required root fields
            required: {
                name: { level: 'ERROR', message: 'Component name is required' },
                category: { level: 'ERROR', message: 'Component category is required' },
                version: { level: 'WARNING', message: 'Version field is recommended for tracking' }
            },
            
            // Field type validations
            fieldTypes: ['text', 'textarea', 'number', 'checkbox', 'select', 'image', 'color', 'radio', 'range'],
            
            // Update method validations
            updateMethods: ['textContent', 'innerHTML', 'src', 'href', 'class', 'visibility', 'style', 'attribute'],
            
            // Category validations
            validCategories: ['essential', 'content', 'media', 'social', 'premium', 'advanced'],
            
            // Best practices
            bestPractices: {
                settings: {
                    label: { level: 'WARNING', message: 'Setting should have a label for UI display' },
                    default: { level: 'WARNING', message: 'Setting should have a default value' },
                    type: { level: 'ERROR', message: 'Setting must have a valid type' }
                },
                general: {
                    description: { level: 'INFO', message: 'Description helps users understand the component' },
                    icon: { level: 'INFO', message: 'Icon improves component library UX' },
                    order: { level: 'INFO', message: 'Order field helps with component sorting' }
                }
            }
        };
    }

    /**
     * Validate a component schema
     * @param {string} componentType - The component type/name
     * @param {object} schema - The schema object to validate
     * @returns {object} Validation result with issues and summary
     */
    validateSchema(componentType, schema) {
        // Check cache first
        const cacheKey = `${componentType}-${JSON.stringify(schema)}`;
        if (this.validationCache.has(cacheKey)) {
            return this.validationCache.get(cacheKey);
        }

        const startTime = performance.now();
        const issues = [];

        // Validate required root fields
        this.validateRequiredFields(schema, issues, componentType);

        // Validate schema structure
        this.validateSchemaStructure(schema, issues, componentType);

        // Validate settings if present
        if (schema.settings) {
            this.validateSettings(schema.settings, issues, componentType);
        }

        // Validate sections if present
        if (schema.sections) {
            this.validateSections(schema.sections, schema.settings, issues, componentType);
        }

        // Check best practices
        this.checkBestPractices(schema, issues, componentType);

        // Create validation result
        const result = this.createValidationResult(componentType, issues, startTime);

        // Cache result
        this.validationCache.set(cacheKey, result);

        // Log result based on environment
        this.logValidationResult(result);

        return result;
    }

    /**
     * Validate required fields
     */
    validateRequiredFields(schema, issues, componentType) {
        Object.entries(this.validationRules.required).forEach(([field, rule]) => {
            if (!schema[field]) {
                issues.push({
                    level: rule.level,
                    field: field,
                    message: rule.message,
                    suggestion: `Add "${field}" field to component.json`
                });
            }
        });
    }

    /**
     * Validate schema structure
     */
    validateSchemaStructure(schema, issues, componentType) {
        // Validate category
        if (schema.category && !this.validationRules.validCategories.includes(schema.category)) {
            issues.push({
                level: 'WARNING',
                field: 'category',
                message: `Unknown category: ${schema.category}`,
                suggestion: `Use one of: ${this.validationRules.validCategories.join(', ')}`
            });
        }

        // Validate version format
        if (schema.version && !this.isValidVersion(schema.version)) {
            issues.push({
                level: 'WARNING',
                field: 'version',
                message: 'Version should follow semantic versioning (e.g., 1.0.0)',
                suggestion: 'Use format: major.minor.patch'
            });
        }

        // Validate dependencies
        if (schema.dependencies && !Array.isArray(schema.dependencies)) {
            issues.push({
                level: 'ERROR',
                field: 'dependencies',
                message: 'Dependencies must be an array',
                suggestion: 'Change dependencies to array format: []'
            });
        }
    }

    /**
     * Validate settings structure
     */
    validateSettings(settings, issues, componentType) {
        Object.entries(settings).forEach(([settingKey, setting]) => {
            // Check required setting fields
            if (!setting.type) {
                issues.push({
                    level: 'ERROR',
                    field: `settings.${settingKey}.type`,
                    message: `Setting "${settingKey}" must have a type`,
                    suggestion: `Add type field: ${this.validationRules.fieldTypes.join(', ')}`
                });
            } else if (!this.validationRules.fieldTypes.includes(setting.type)) {
                issues.push({
                    level: 'WARNING',
                    field: `settings.${settingKey}.type`,
                    message: `Unknown setting type: ${setting.type}`,
                    suggestion: `Use one of: ${this.validationRules.fieldTypes.join(', ')}`
                });
            }

            // Check best practices for settings
            Object.entries(this.validationRules.bestPractices.settings).forEach(([field, rule]) => {
                if (!setting[field] && field !== 'type') { // type already checked above
                    issues.push({
                        level: rule.level,
                        field: `settings.${settingKey}.${field}`,
                        message: rule.message,
                        suggestion: `Add ${field} to setting "${settingKey}"`
                    });
                }
            });

            // Validate specific field types
            this.validateFieldTypeSpecifics(settingKey, setting, issues);

            // Validate update method if present
            if (setting.updateMethod && !this.validationRules.updateMethods.includes(setting.updateMethod)) {
                issues.push({
                    level: 'WARNING',
                    field: `settings.${settingKey}.updateMethod`,
                    message: `Unknown update method: ${setting.updateMethod}`,
                    suggestion: `Use one of: ${this.validationRules.updateMethods.join(', ')}`
                });
            }

            // Check preview selector if update method is present
            if (setting.updateMethod && !setting.previewSelector) {
                issues.push({
                    level: 'WARNING',
                    field: `settings.${settingKey}.previewSelector`,
                    message: 'Update method requires preview selector',
                    suggestion: 'Add previewSelector to target the element to update'
                });
            }
        });
    }

    /**
     * Validate field type specific requirements
     */
    validateFieldTypeSpecifics(settingKey, setting, issues) {
        switch (setting.type) {
            case 'select':
            case 'radio':
                if (!setting.options || !Array.isArray(setting.options)) {
                    issues.push({
                        level: 'ERROR',
                        field: `settings.${settingKey}.options`,
                        message: `${setting.type} field requires options array`,
                        suggestion: 'Add options: [{value: "", label: ""}]'
                    });
                } else {
                    // Validate option structure
                    setting.options.forEach((option, index) => {
                        if (!option.value || !option.label) {
                            issues.push({
                                level: 'WARNING',
                                field: `settings.${settingKey}.options[${index}]`,
                                message: 'Option should have both value and label',
                                suggestion: 'Use format: {value: "", label: ""}'
                            });
                        }
                    });
                }
                break;

            case 'number':
            case 'range':
                if (setting.min !== undefined && setting.max !== undefined && setting.min > setting.max) {
                    issues.push({
                        level: 'ERROR',
                        field: `settings.${settingKey}`,
                        message: 'Min value cannot be greater than max value',
                        suggestion: 'Ensure min < max'
                    });
                }
                break;

            case 'textarea':
                if (!setting.rows) {
                    issues.push({
                        level: 'INFO',
                        field: `settings.${settingKey}.rows`,
                        message: 'Textarea should specify rows for better UX',
                        suggestion: 'Add rows: 3 (or desired number)'
                    });
                }
                break;

            case 'image':
                if (!setting.helpText) {
                    issues.push({
                        level: 'INFO',
                        field: `settings.${settingKey}.helpText`,
                        message: 'Image fields benefit from size/format guidance',
                        suggestion: 'Add helpText with recommended dimensions'
                    });
                }
                break;
        }
    }

    /**
     * Validate sections reference existing settings
     */
    validateSections(sections, settings, issues, componentType) {
        if (!settings) {
            issues.push({
                level: 'WARNING',
                field: 'sections',
                message: 'Sections defined but no settings found',
                suggestion: 'Add settings that reference these sections'
            });
            return;
        }

        // Check if all settings reference valid sections
        const sectionKeys = Object.keys(sections);
        const settingsWithSections = Object.entries(settings)
            .filter(([key, setting]) => setting.section)
            .map(([key, setting]) => ({ key, section: setting.section }));

        settingsWithSections.forEach(({ key, section }) => {
            if (!sectionKeys.includes(section)) {
                issues.push({
                    level: 'WARNING',
                    field: `settings.${key}.section`,
                    message: `Setting references non-existent section: ${section}`,
                    suggestion: `Use one of: ${sectionKeys.join(', ')}`
                });
            }
        });

        // Check for empty sections
        const usedSections = new Set(settingsWithSections.map(s => s.section));
        sectionKeys.forEach(sectionKey => {
            if (!usedSections.has(sectionKey)) {
                issues.push({
                    level: 'INFO',
                    field: `sections.${sectionKey}`,
                    message: 'Section defined but no settings reference it',
                    suggestion: 'Add settings with section: "' + sectionKey + '"'
                });
            }
        });
    }

    /**
     * Check best practices
     */
    checkBestPractices(schema, issues, componentType) {
        Object.entries(this.validationRules.bestPractices.general).forEach(([field, rule]) => {
            if (!schema[field]) {
                issues.push({
                    level: rule.level,
                    field: field,
                    message: rule.message,
                    suggestion: `Add ${field} field to improve component documentation`
                });
            }
        });
    }

    /**
     * Check if version follows semantic versioning
     */
    isValidVersion(version) {
        const versionRegex = /^\d+\.\d+\.\d+(-[a-zA-Z0-9-]+)?$/;
        return versionRegex.test(version);
    }

    /**
     * Create validation result object
     */
    createValidationResult(componentType, issues, startTime) {
        const endTime = performance.now();
        const duration = endTime - startTime;

        // Count issues by level
        const errorCount = issues.filter(i => i.level === 'ERROR').length;
        const warningCount = issues.filter(i => i.level === 'WARNING').length;
        const infoCount = issues.filter(i => i.level === 'INFO').length;

        // Create summary
        const summaryParts = [];
        if (errorCount > 0) summaryParts.push(`${errorCount} error${errorCount > 1 ? 's' : ''}`);
        if (warningCount > 0) summaryParts.push(`${warningCount} warning${warningCount > 1 ? 's' : ''}`);
        if (infoCount > 0) summaryParts.push(`${infoCount} suggestion${infoCount > 1 ? 's' : ''}`);

        const summary = summaryParts.length > 0
            ? `${summaryParts.join(', ')} in ${componentType} component schema`
            : `${componentType} component schema is valid`;

        // Check performance
        if (duration > this.performanceThreshold) {
            console.warn(`Schema validation for ${componentType} took ${duration.toFixed(2)}ms (threshold: ${this.performanceThreshold}ms)`);
        }

        return {
            componentType,
            issues,
            summary,
            counts: {
                errors: errorCount,
                warnings: warningCount,
                info: infoCount,
                total: issues.length
            },
            duration: duration.toFixed(2),
            timestamp: new Date().toISOString(),
            valid: errorCount === 0 // Consider valid if no errors (warnings are OK)
        };
    }

    /**
     * Log validation result based on environment
     */
    logValidationResult(result) {
        // Skip if no issues
        if (result.counts.total === 0) return;

        // In production, only log errors
        const isProduction = window.location.hostname !== 'localhost' && !window.location.hostname.includes('dev');
        if (isProduction && result.counts.errors === 0) return;

        // Group console output
        console.groupCollapsed(`📋 Schema Validation: ${result.componentType} - ${result.summary}`);
        
        // Log issues by level
        const levels = ['ERROR', 'WARNING', 'INFO'];
        const levelIcons = { ERROR: '❌', WARNING: '⚠️', INFO: 'ℹ️' };
        const levelColors = { ERROR: '#ff0000', WARNING: '#ff9800', INFO: '#2196f3' };

        levels.forEach(level => {
            const levelIssues = result.issues.filter(i => i.level === level);
            if (levelIssues.length > 0) {
                console.groupCollapsed(`${levelIcons[level]} ${level}S (${levelIssues.length})`);
                levelIssues.forEach(issue => {
                    console.log(
                        `%c${issue.field}%c: ${issue.message}\n💡 ${issue.suggestion}`,
                        `color: ${levelColors[level]}; font-weight: bold`,
                        'color: inherit'
                    );
                });
                console.groupEnd();
            }
        });

        // Log performance
        console.log(`⚡ Validation completed in ${result.duration}ms`);
        
        console.groupEnd();
    }

    /**
     * Get validation summary for all components
     */
    getValidationSummary() {
        const summary = {
            totalComponents: this.validationCache.size,
            validComponents: 0,
            componentsWithErrors: 0,
            componentsWithWarnings: 0,
            totalIssues: 0,
            components: []
        };

        this.validationCache.forEach((result, key) => {
            if (result.valid) summary.validComponents++;
            if (result.counts.errors > 0) summary.componentsWithErrors++;
            if (result.counts.warnings > 0) summary.componentsWithWarnings++;
            summary.totalIssues += result.counts.total;
            
            summary.components.push({
                type: result.componentType,
                errors: result.counts.errors,
                warnings: result.counts.warnings,
                info: result.counts.info
            });
        });

        return summary;
    }

    /**
     * Clear validation cache
     */
    clearCache() {
        this.validationCache.clear();
        console.log('Schema validation cache cleared');
    }

    /**
     * General validation method for any object against a schema
     * This method provides compatibility with the state validator
     * @param {object} data - The data to validate
     * @param {object} schema - The schema to validate against (can be ignored for now)
     * @returns {object} Validation result
     */
    validate(data, schema) {
        try {
            // For now, implement a simple validation that accepts most data
            // This ensures compatibility while we focus on the main architectural issues
            
            if (!data || typeof data !== 'object') {
                return {
                    valid: false,
                    errors: [{ message: 'Data must be an object' }]
                };
            }
            
            // Check for basic state structure if it looks like a state object
            if (data.hasOwnProperty('components') || data.hasOwnProperty('layout')) {
                // This looks like a state object
                if (!data.components || typeof data.components !== 'object') {
                    return {
                        valid: false,
                        errors: [{ message: 'State must have components object' }]
                    };
                }
                
                if (!Array.isArray(data.layout)) {
                    return {
                        valid: false,
                        errors: [{ message: 'State must have layout array' }]
                    };
                }
            }
            
            // Check for basic transaction structure if it looks like a transaction
            if (data.hasOwnProperty('type') && data.hasOwnProperty('payload')) {
                // This looks like a transaction
                if (!data.type || typeof data.type !== 'string') {
                    return {
                        valid: false,
                        errors: [{ message: 'Transaction must have a type string' }]
                    };
                }
            }
            
            // If we get here, the data passes basic validation
            return {
                valid: true,
                errors: []
            };
            
        } catch (error) {
            return {
                valid: false,
                errors: [{ message: error.message }]
            };
        }
    }
}

// Export singleton instance
export const schemaValidator = new SchemaValidator();