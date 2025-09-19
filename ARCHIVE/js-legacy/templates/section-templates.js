/**
 * Section Template System
 * Phase 3: Section Layer - Template Library
 * 
 * Loads and manages pre-designed section templates from JSON files
 * Allows users to quickly add professional layouts to their media kit
 * 
 * @version 3.1.0-phase3
 * @package GMKB/Templates
 */

class SectionTemplateManager {
    constructor() {
        this.logger = window.StructuredLogger || console;
        this.templates = new Map();
        this.categories = new Map();
        this.sectionLayoutManager = null;
        this.enhancedComponentManager = null;
        this.templateDirectory = window.gmkbData?.pluginUrl + 'templates/sections/';
        
        this.logger.info('📚 PHASE 3: SectionTemplateManager initializing');
        this.initializeManager();
    }
    
    /**
     * Initialize the template manager
     * Following checklist: Event-Driven Initialization, Dependency-Awareness
     */
    initializeManager() {
        // Wait for core systems to be ready
        document.addEventListener('gmkb:core-systems-ready', () => {
            this.onCoreSystemsReady();
        });
        
        // Also try immediate initialization if systems are already ready
        if (window.sectionLayoutManager) {
            this.onCoreSystemsReady();
        }
        
        // Listen for template selection events
        document.addEventListener('gmkb:section-template-selected', (event) => {
            this.onTemplateSelected(event.detail);
        });
        
        this.logger.info('✅ PHASE 3: SectionTemplateManager initialized');
    }
    
    /**
     * Handle core systems ready
     * Following checklist: Dependency-Awareness, No Global Object Sniffing
     */
    onCoreSystemsReady() {
        this.sectionLayoutManager = window.sectionLayoutManager;
        this.enhancedComponentManager = window.enhancedComponentManager;
        
        // Load all available templates
        this.loadTemplates();
        
        this.logger.info('🎯 PHASE 3: Section template manager ready');
    }
    
    /**
     * Load all section templates
     * Following checklist: Asynchronous Loading, Error Handling
     */
    async loadTemplates() {
        // Define available templates
        const templateFiles = [
            'hero-centered.json',
            'hero-split.json',
            'features-grid.json',
            'testimonials-carousel.json',
            'stats-counter.json',
            'cta-banner.json',
            'footer-links.json'
        ];
        
        // Load each template
        for (const file of templateFiles) {
            try {
                await this.loadTemplate(file);
            } catch (error) {
                this.logger.error(`❌ PHASE 3: Failed to load template ${file}:`, error);
            }
        }
        
        this.logger.info(`📚 PHASE 3: Loaded ${this.templates.size} section templates in ${this.categories.size} categories`);
        
        // Dispatch templates loaded event
        this.dispatchTemplateEvent('gmkb:section-templates-loaded', {
            templates: Array.from(this.templates.values()),
            categories: Array.from(this.categories.values())
        });
    }
    
    /**
     * Load a single template file
     * Following checklist: File Loading, JSON Parsing
     */
    async loadTemplate(filename) {
        const url = this.templateDirectory + filename;
        
        try {
            const response = await fetch(url);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const template = await response.json();
            
            // Validate template structure
            if (!this.validateTemplate(template)) {
                throw new Error('Invalid template structure');
            }
            
            // Store template
            this.templates.set(template.slug, template);
            
            // Add to category
            if (!this.categories.has(template.category)) {
                this.categories.set(template.category, {
                    name: template.category,
                    templates: []
                });
            }
            
            this.categories.get(template.category).templates.push(template.slug);
            
            this.logger.debug(`✅ PHASE 3: Loaded template: ${template.name}`);
            
        } catch (error) {
            this.logger.error(`❌ PHASE 3: Error loading template ${filename}:`, error);
            
            // Try to create from embedded data as fallback
            this.createFallbackTemplate(filename);
        }
    }
    
    /**
     * Create fallback template from embedded data
     * Following checklist: Graceful Fallback, Error Recovery
     */
    createFallbackTemplate(filename) {
        // Define fallback templates embedded in code
        const fallbackTemplates = {
            'hero-centered.json': {
                name: 'Hero Centered',
                slug: 'hero-centered',
                category: 'hero',
                description: 'A centered hero section',
                section_type: 'hero',
                default_components: [{
                    type: 'hero',
                    props: { layout: 'centered' },
                    position: 0
                }],
                styling: {
                    background: 'gradient',
                    padding: '120px 20px',
                    min_height: '70vh'
                }
            },
            'hero-split.json': {
                name: 'Hero Split',
                slug: 'hero-split',
                category: 'hero',
                description: 'A split hero section',
                section_type: 'two_column',
                default_components: [{
                    type: 'hero',
                    props: { layout: 'split' },
                    position: 0,
                    column: 1
                }],
                styling: {
                    background: 'solid',
                    padding: '100px 20px'
                }
            },
            'features-grid.json': {
                name: 'Features Grid',
                slug: 'features-grid',
                category: 'content',
                description: 'A grid for features',
                section_type: 'three_column',
                default_components: [{
                    type: 'topics',
                    props: { layout: 'grid' },
                    position: 0
                }],
                styling: {
                    padding: '80px 20px'
                }
            }
        };
        
        const template = fallbackTemplates[filename];
        if (template) {
            this.templates.set(template.slug, template);
            
            if (!this.categories.has(template.category)) {
                this.categories.set(template.category, {
                    name: template.category,
                    templates: []
                });
            }
            
            this.categories.get(template.category).templates.push(template.slug);
            
            this.logger.info(`📦 PHASE 3: Created fallback template: ${template.name}`);
        }
    }
    
    /**
     * Validate template structure
     * Following checklist: Data Validation, Schema Compliance
     */
    validateTemplate(template) {
        // Check required fields
        const requiredFields = ['name', 'slug', 'category', 'section_type'];
        
        for (const field of requiredFields) {
            if (!template[field]) {
                this.logger.warn(`⚠️ PHASE 3: Template missing required field: ${field}`);
                return false;
            }
        }
        
        return true;
    }
    
    /**
     * Handle template selection
     * Following checklist: User Interaction, State Management
     */
    onTemplateSelected(detail) {
        const { templateSlug, targetPosition } = detail;
        
        this.applyTemplate(templateSlug, targetPosition);
    }
    
    /**
     * Apply a template to create a new section
     * Following checklist: Section Creation, Component Addition
     */
    applyTemplate(templateSlug, position = null) {
        const template = this.templates.get(templateSlug);
        
        if (!template) {
            this.logger.error(`❌ PHASE 3: Template not found: ${templateSlug}`);
            return null;
        }
        
        if (!this.sectionLayoutManager) {
            this.logger.error('❌ PHASE 3: Section layout manager not available');
            return null;
        }
        
        this.logger.info(`🎨 PHASE 3: Applying template: ${template.name}`);
        
        // Create section with template configuration
        const sectionConfig = {
            section_type: template.section_type,
            layout: {
                ...this.getSectionTypeDefaults(template.section_type).layout,
                ...(template.styling || {})
            },
            section_options: {
                ...this.getSectionTypeDefaults(template.section_type).section_options,
                template_id: template.slug,
                template_name: template.name
            },
            responsive: template.responsive || {},
            components: []
        };
        
        // Apply styling overrides
        if (template.styling) {
            if (template.styling.background === 'gradient' && template.styling.backgroundColors) {
                sectionConfig.section_options.background_type = 'gradient';
                sectionConfig.section_options.background_color = `linear-gradient(135deg, ${template.styling.backgroundColors.join(', ')})`;
            } else if (template.styling.backgroundColor) {
                sectionConfig.section_options.background_type = 'color';
                sectionConfig.section_options.background_color = template.styling.backgroundColor;
            }
            
            if (template.styling.textColor) {
                sectionConfig.section_options.text_color = template.styling.textColor;
            }
            
            if (template.styling.padding) {
                sectionConfig.layout.padding = template.styling.padding;
            }
            
            if (template.styling.min_height) {
                sectionConfig.layout.min_height = template.styling.min_height;
            }
            
            if (template.styling.text_align) {
                sectionConfig.layout.text_align = template.styling.text_align;
            }
        }
        
        // Create the section
        const sectionId = `section_template_${Date.now()}`;
        const section = this.sectionLayoutManager.registerSection(
            sectionId,
            template.section_type,
            sectionConfig
        );
        
        // Add default components if specified
        if (template.default_components && template.default_components.length > 0) {
            this.addTemplateComponents(section, template.default_components);
        }
        
        this.logger.info(`✅ PHASE 3: Template applied successfully - section ${sectionId} created`);
        
        // Dispatch template applied event
        this.dispatchTemplateEvent('gmkb:section-template-applied', {
            templateSlug,
            sectionId,
            template
        });
        
        return section;
    }
    
    /**
     * Add components from template to section
     * Following checklist: Component Creation, Section Assignment
     */
    addTemplateComponents(section, componentConfigs) {
        if (!this.enhancedComponentManager) {
            this.logger.warn('⚠️ PHASE 3: Component manager not available, skipping component addition');
            return;
        }
        
        componentConfigs.forEach((config, index) => {
            // Create component
            const componentId = this.enhancedComponentManager.addComponent(
                config.type,
                {
                    props: config.props || {},
                    targetSectionId: section.section_id,
                    targetColumn: config.column || 1,
                    skipAnimation: true
                }
            );
            
            if (componentId) {
                // Assign to section
                this.sectionLayoutManager.assignComponentToSection(
                    componentId,
                    section.section_id,
                    config.column || 1
                );
                
                this.logger.debug(`✅ PHASE 3: Added ${config.type} component to section`);
            }
        });
    }
    
    /**
     * Get section type defaults
     * Following checklist: Configuration Management
     */
    getSectionTypeDefaults(sectionType) {
        // Reuse defaults from SectionLayoutManager if available
        if (this.sectionLayoutManager) {
            return this.sectionLayoutManager.getDefaultSectionConfiguration(sectionType);
        }
        
        // Fallback defaults
        return {
            layout: {
                width: 'full_width',
                max_width: '100%',
                padding: '40px 20px',
                columns: 1
            },
            section_options: {
                background_type: 'none',
                background_color: 'transparent'
            }
        };
    }
    
    /**
     * Get all templates
     * Following checklist: Data Access, Public API
     */
    getAllTemplates() {
        return Array.from(this.templates.values());
    }
    
    /**
     * Get templates by category
     * Following checklist: Data Filtering, Public API
     */
    getTemplatesByCategory(category) {
        const categoryData = this.categories.get(category);
        
        if (!categoryData) {
            return [];
        }
        
        return categoryData.templates.map(slug => this.templates.get(slug)).filter(Boolean);
    }
    
    /**
     * Get all categories
     * Following checklist: Data Access, Public API
     */
    getAllCategories() {
        return Array.from(this.categories.keys());
    }
    
    /**
     * Open template library modal
     * Following checklist: User Interface, Modal Management
     */
    openTemplateLibrary() {
        // Dispatch event to open template library modal
        this.dispatchTemplateEvent('gmkb:open-section-template-library', {
            templates: this.getAllTemplates(),
            categories: this.getAllCategories()
        });
        
        this.logger.info('📚 PHASE 3: Opened section template library');
    }
    
    /**
     * Dispatch template-related events
     * Following checklist: Event-Driven, Documentation
     */
    dispatchTemplateEvent(eventType, detail) {
        const event = new CustomEvent(eventType, {
            detail: {
                ...detail,
                timestamp: Date.now(),
                source: 'SectionTemplateManager'
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Debug method - get current state
     * Following checklist: Diagnostic Logging
     */
    getDebugInfo() {
        return {
            templatesLoaded: this.templates.size,
            categories: Array.from(this.categories.keys()),
            templateList: Array.from(this.templates.keys()),
            sectionLayoutManagerAvailable: !!this.sectionLayoutManager,
            componentManagerAvailable: !!this.enhancedComponentManager
        };
    }
}

// Global instance
window.SectionTemplateManager = SectionTemplateManager;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sectionTemplateManager = new SectionTemplateManager();
    });
} else {
    window.sectionTemplateManager = new SectionTemplateManager();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionTemplateManager;
}
