/**
 * Section Layout Manager
 * Phase 3: Section Layer System
 * 
 * Creates a layout container system that manages component positioning, 
 * spacing, and responsive behavior at the section level
 * 
 * @version 3.0.0-phase3
 * @package GMKB/System
 */

class SectionLayoutManager {
    constructor() {
        this.sections = new Map();
        this.sectionOrder = [];
        this.logger = window.StructuredLogger || console;
        this.stateManager = null;
        
        this.logger.info('🏗️ PHASE 3: SectionLayoutManager initializing');
        this.initializeManager();
    }
    
    /**
     * Initialize the section layout manager
     * Following checklist: Event-Driven Initialization, Dependency-Awareness
     */
    initializeManager() {
        // Wait for core systems to be ready
        document.addEventListener('gmkb:core-systems-ready', () => {
            this.onCoreSystemsReady();
        });
        
        // ROOT FIX: Also try immediate initialization if systems are already ready
        if (window.enhancedStateManager && typeof window.enhancedStateManager.dispatch === 'function') {
            this.onCoreSystemsReady();
        }
        
        // Listen for component events
        document.addEventListener('gmkb:component-added', (event) => {
            this.onComponentAdded(event.detail);
        });
        
        document.addEventListener('gmkb:component-moved', (event) => {
            this.onComponentMoved(event.detail);
        });
        
        document.addEventListener('gmkb:component-removed', (event) => {
            this.onComponentRemoved(event.detail);
        });
        
        // Listen for section configuration updates
        document.addEventListener('gmkb:section-configuration-updated', (event) => {
            this.onSectionConfigurationUpdated(event.detail);
        });
        
        this.logger.info('✅ PHASE 3: SectionLayoutManager initialized');
    }
    
    /**
     * Handle core systems ready event
     * Following checklist: Centralized State, Dependency-Awareness
     */
    onCoreSystemsReady() {
        // ROOT FIX: Ensure state manager is available before proceeding
        this.stateManager = window.enhancedStateManager;
        
        if (this.stateManager && typeof this.stateManager.dispatch === 'function') {
            this.loadSectionsFromState();
            this.logger.info('🎯 PHASE 3: Core systems ready - sections loaded with state manager');
        } else {
            this.logger.error('❌ PHASE 3: State manager not available or missing dispatch method');
            // Try to initialize without state manager for now
            this.logger.info('🎯 PHASE 3: Core systems ready - sections initialized without state manager');
        }
    }
    
    /**
     * Load sections from state
     * Following checklist: Centralized State, Schema Compliance
     * ROOT FIX: Auto-create default section for orphaned components
     */
    loadSectionsFromState() {
        if (!this.stateManager) return;
        
        const state = this.stateManager.getState();
        const sections = state.sections || [];
        const components = state.components || {};
        
        // Load existing sections
        sections.forEach(sectionData => {
            this.registerSection(
                sectionData.section_id,
                sectionData.section_type,
                sectionData
            );
        });
        
        this.logger.info(`📊 PHASE 3: Loaded ${sections.length} sections from state`);
        
        // ROOT FIX: Check for orphaned components and auto-create section
        const orphanedComponents = [];
        for (const [componentId, component] of Object.entries(components)) {
            if (!component.sectionId) {
                orphanedComponents.push(componentId);
            }
        }
        
        if (orphanedComponents.length > 0) {
            this.logger.info(`🔧 PHASE 3: Found ${orphanedComponents.length} orphaned components - creating default section`);
            
            // Create a default section for orphaned components
            const defaultSectionId = `section_default_${Date.now()}`;
            const defaultSection = this.registerSection(defaultSectionId, 'full_width', {
                section_id: defaultSectionId,
                section_type: 'full_width',
                auto_created: true,
                created_for_orphans: true
            });
            
            // Assign all orphaned components to this section
            orphanedComponents.forEach(componentId => {
                this.assignComponentToSection(componentId, defaultSectionId);
                
                // Update component in state to have sectionId
                if (this.stateManager && typeof this.stateManager.dispatch === 'function') {
                    this.stateManager.dispatch({
                        type: 'UPDATE_COMPONENT',
                        payload: {
                            id: componentId,
                            updates: { sectionId: defaultSectionId }
                        }
                    });
                }
            });
            
            this.logger.info(`✅ PHASE 3: Assigned ${orphanedComponents.length} orphaned components to default section ${defaultSectionId}`);
        } else if (sections.length === 0 && Object.keys(components).length === 0) {
            // No sections and no components - create empty default section for clean start
            this.logger.info(`📦 PHASE 3: No sections or components - creating default empty section`);
            const defaultSectionId = `section_default_${Date.now()}`;
            this.registerSection(defaultSectionId, 'full_width', {
                section_id: defaultSectionId,
                section_type: 'full_width',
                auto_created: true,
                manual_creation: true // Mark as manual so it won't be auto-cleaned
            });
        }
    }
    
    /**
     * Create a new section - PUBLIC API METHOD
     * @param {string} sectionType - Type of section to create
     * @param {object} configuration - Optional configuration
     * @returns {object} The created section configuration
     */
    createSection(sectionType = 'full_width', configuration = {}) {
        const sectionId = configuration.section_id || `section_${Date.now()}`;
        // Mark as manually created so it won't be auto-cleaned
        const enhancedConfig = {
            ...configuration,
            manual_creation: true
        };
        return this.registerSection(sectionId, sectionType, enhancedConfig);
    }
    
    /**
     * Delete a section - PUBLIC API METHOD ALIAS
     * @param {string} sectionId - ID of section to delete
     * @returns {boolean} Success status
     */
    deleteSection(sectionId) {
        return this.removeSection(sectionId);
    }
    
    /**
     * Update a section - PUBLIC API METHOD ALIAS
     * @param {string} sectionId - ID of section to update
     * @param {object} updates - Updates to apply
     * @returns {object|null} Updated section or null
     */
    updateSection(sectionId, updates) {
        return this.updateSectionConfiguration(sectionId, updates);
    }
    
    /**
     * Register a new section
     * Following checklist: Schema Compliance, Event-Driven, Root Cause Fix
     */
    registerSection(sectionId, sectionType, configuration = {}) {
        // ROOT CAUSE FIX: Validate inputs and provide defaults
        if (!sectionId) {
            sectionId = `section_${Date.now()}`;
            this.logger.warn(`⚠️ PHASE 3: No section ID provided, generated: ${sectionId}`);
        }
        
        if (!sectionType) {
            sectionType = 'full_width';
            this.logger.warn(`⚠️ PHASE 3: No section type provided, using default: ${sectionType}`);
        }
        
        const defaultConfig = this.getDefaultSectionConfiguration(sectionType);
        
        // ROOT CAUSE FIX: Deep merge configuration with defaults to ensure all properties exist
        const sectionConfig = {
            section_id: sectionId,
            section_type: sectionType,
            layout: {
                ...defaultConfig.layout,
                ...(configuration.layout || {})
            },
            section_options: {
                ...defaultConfig.section_options,
                ...(configuration.section_options || {})
            },
            responsive: {
                ...defaultConfig.responsive,
                ...(configuration.responsive || {})
            },
            components: configuration.components || [],
            created_at: configuration.created_at || Date.now(),
            updated_at: Date.now()
        };
        
        // ROOT CAUSE FIX: Final validation to ensure required properties
        if (!sectionConfig.layout.columns) {
            sectionConfig.layout.columns = 1;
            this.logger.warn(`⚠️ PHASE 3: Section ${sectionId} missing columns, defaulted to 1`);
        }
        
        this.sections.set(sectionId, sectionConfig);
        
        // Add to order if not already present
        if (!this.sectionOrder.includes(sectionId)) {
            this.sectionOrder.push(sectionId);
        }
        
        // Update state
        this.updateSectionsInState();
        
        // Dispatch section registered event
        this.dispatchSectionEvent('gmkb:section-registered', {
            sectionId,
            sectionType,
            configuration: sectionConfig
        });
        
        this.logger.info(`✅ PHASE 3: Registered section ${sectionType} (${sectionId})`);
        return sectionConfig;
    }
    
    /**
     * Get default section configuration
     * Following checklist: Simplicity First, No Redundant Logic
     */
    getDefaultSectionConfiguration(sectionType) {
        const defaults = {
            full_width: {
                layout: {
                    width: 'full_width',
                    max_width: '100%',
                    padding: '40px 20px',
                    columns: 1,
                    column_gap: '0px'
                },
                section_options: {
                    background_type: 'none',
                    background_color: 'transparent',
                    spacing_top: 'medium',
                    spacing_bottom: 'medium'
                },
                responsive: {
                    mobile: { padding: '20px 15px' },
                    tablet: { padding: '30px 20px' }
                }
            },
            two_column: {
                layout: {
                    width: 'constrained',
                    max_width: '1200px',
                    padding: '60px 20px',
                    columns: 2,
                    column_gap: '40px'
                },
                section_options: {
                    background_type: 'none',
                    background_color: 'transparent',
                    spacing_top: 'large',
                    spacing_bottom: 'large'
                },
                responsive: {
                    mobile: { columns: 1, column_gap: '0px' },
                    tablet: { columns: 2, column_gap: '30px' }
                }
            },
            main_sidebar: {
                layout: {
                    width: 'constrained',
                    max_width: '1200px',
                    padding: '60px 20px',
                    columns: 2,
                    column_gap: '40px',
                    column_ratio: '2fr-1fr' // Main content 2/3, sidebar 1/3
                },
                section_options: {
                    background_type: 'none',
                    background_color: 'transparent',
                    spacing_top: 'large',
                    spacing_bottom: 'large'
                },
                responsive: {
                    mobile: { columns: 1, column_gap: '0px' },
                    tablet: { columns: 2, column_gap: '30px', column_ratio: '2fr-1fr' }
                }
            },
            three_column: {
                layout: {
                    width: 'constrained',
                    max_width: '1200px',
                    padding: '60px 20px',
                    columns: 3,
                    column_gap: '30px'
                },
                section_options: {
                    background_type: 'none',
                    background_color: 'transparent',
                    spacing_top: 'large',
                    spacing_bottom: 'large'
                },
                responsive: {
                    mobile: { columns: 1, column_gap: '0px' },
                    tablet: { columns: 2, column_gap: '20px' }
                }
            },
            grid: {
                layout: {
                    width: 'constrained',
                    max_width: '1200px',
                    padding: '60px 20px',
                    display: 'grid',
                    grid_template_columns: 'repeat(auto-fit, minmax(300px, 1fr))',
                    column_gap: '30px',
                    row_gap: '30px'
                },
                section_options: {
                    background_type: 'none',
                    background_color: 'transparent',
                    spacing_top: 'large',
                    spacing_bottom: 'large'
                },
                responsive: {
                    mobile: { grid_template_columns: '1fr', column_gap: '0px' },
                    tablet: { grid_template_columns: 'repeat(2, 1fr)' }
                }
            },
            hero: {
                layout: {
                    width: 'full_width',
                    max_width: '100%',
                    min_height: '70vh',
                    padding: '80px 20px',
                    columns: 1,
                    display: 'flex',
                    align_items: 'center',
                    justify_content: 'center'
                },
                section_options: {
                    background_type: 'gradient',
                    background_color: '#295cff',
                    spacing_top: 'none',
                    spacing_bottom: 'large'
                },
                responsive: {
                    mobile: { min_height: '50vh', padding: '60px 15px' },
                    tablet: { min_height: '60vh', padding: '70px 20px' }
                }
            }
        };
        
        return defaults[sectionType] || defaults.full_width;
    }
    
    /**
     * Assign component to section
     * Following checklist: Centralized State, Event-Driven
     */
    assignComponentToSection(componentId, sectionId, column = 1) {
        let section = this.sections.get(sectionId);
        if (!section) {
            // ROOT FIX: Enhanced error logging to help debug section ID mismatches
            const availableSections = Array.from(this.sections.keys());
            this.logger.warn(`⚠️ PHASE 3: Cannot assign component - section "${sectionId}" not found`, {
                requestedId: sectionId,
                availableSections: availableSections,
                totalSections: this.sections.size,
                sectionIdType: typeof sectionId,
                componentId: componentId
            });
            
            // Check for similar section IDs (might help identify format mismatches)
            const similarIds = availableSections.filter(id => 
                id.toLowerCase().includes(sectionId?.toLowerCase?.() || '') || 
                sectionId?.toLowerCase?.().includes(id.toLowerCase())
            );
            
            if (similarIds.length > 0) {
                this.logger.info('💡 PHASE 3: Found similar section IDs:', similarIds);
            }
            
            // ROOT CAUSE FIX: Try to recover by looking for section in DOM and auto-registering
            this.logger.info(`🔧 PHASE 3: Attempting to auto-register section ${sectionId} from DOM`);
            const sectionElement = document.querySelector(`[data-section-id="${sectionId}"]`);
            
            if (sectionElement) {
                const sectionType = sectionElement.dataset.sectionType || 'full_width';
                this.logger.info(`🔧 PHASE 3: Found section ${sectionId} in DOM with type ${sectionType}, registering...`);
                
                try {
                    section = this.registerSection(sectionId, sectionType, {
                        section_id: sectionId,
                        section_type: sectionType,
                        created_at: Date.now(),
                        recovered_from_dom: true
                    });
                    
                    this.logger.info(`✅ PHASE 3: Successfully recovered and registered section ${sectionId}`);
                } catch (error) {
                    this.logger.error(`❌ PHASE 3: Failed to recover section ${sectionId}:`, error);
                    return false;
                }
            } else {
                this.logger.error(`❌ PHASE 3: Section ${sectionId} not found in DOM either - cannot recover`);
                return false;
            }
        }
        
        // Remove component from other sections first
        this.removeComponentFromAllSections(componentId);
        
        // Add to target section
        const componentAssignment = {
            component_id: componentId,
            column: Math.min(column, section.layout.columns || 1),
            order: section.components.length,
            assigned_at: Date.now()
        };
        
        section.components.push(componentAssignment);
        section.updated_at = Date.now();
        
        // Update state
        this.updateSectionsInState();
        
        // Dispatch event
        this.dispatchSectionEvent('gmkb:component-assigned-to-section', {
            componentId,
            sectionId,
            column: componentAssignment.column
        });
        
        this.logger.info(`✅ PHASE 3: Assigned component ${componentId} to section ${sectionId}, column ${column}`);
        return true;
    }
    
    /**
     * Remove component from all sections
     * Following checklist: Code Reduction, No Redundant Logic
     */
    removeComponentFromAllSections(componentId) {
        let removedFrom = [];
        
        this.sections.forEach((section, sectionId) => {
            const initialLength = section.components.length;
            section.components = section.components.filter(comp => comp.component_id !== componentId);
            
            if (section.components.length < initialLength) {
                removedFrom.push(sectionId);
                section.updated_at = Date.now();
            }
        });
        
        if (removedFrom.length > 0) {
            this.updateSectionsInState();
            this.logger.info(`🗑️ PHASE 3: Removed component ${componentId} from sections: ${removedFrom.join(', ')}`);
        }
        
        return removedFrom;
    }
    
    /**
     * Update section configuration
     * Following checklist: Schema Compliance, Centralized State
     */
    updateSectionConfiguration(sectionId, updates) {
        const section = this.sections.get(sectionId);
        if (!section) {
            this.logger.warn(`⚠️ PHASE 3: Cannot update - section ${sectionId} not found`);
            return null;
        }
        
        const updatedSection = {
            ...section,
            ...updates,
            layout: {
                ...section.layout,
                ...(updates.layout || {})
            },
            section_options: {
                ...section.section_options,
                ...(updates.section_options || {})
            },
            responsive: {
                ...section.responsive,
                ...(updates.responsive || {})
            },
            updated_at: Date.now()
        };
        
        this.sections.set(sectionId, updatedSection);
        
        // Update state
        this.updateSectionsInState();
        
        // Dispatch event
        this.dispatchSectionEvent('gmkb:section-updated', {
            sectionId,
            section: updatedSection
        });
        
        this.logger.info(`🔄 PHASE 3: Updated section ${sectionId}`);
        return updatedSection;
    }
    
    /**
     * Reorder sections
     * Following checklist: Centralized State, Event-Driven
     */
    reorderSections(newOrder) {
        // Validate new order
        const validOrder = newOrder.filter(sectionId => this.sections.has(sectionId));
        
        if (validOrder.length !== this.sections.size) {
            this.logger.warn('⚠️ PHASE 3: Section order validation failed - some sections missing');
            return false;
        }
        
        this.sectionOrder = validOrder;
        
        // Update state
        this.updateSectionsInState();
        
        // Dispatch event
        this.dispatchSectionEvent('gmkb:sections-reordered', {
            newOrder: validOrder
        });
        
        this.logger.info(`🔄 PHASE 3: Sections reordered: ${validOrder.join(', ')}`);
        return true;
    }
    
    /**
     * Get section layout CSS
     * Following checklist: No Redundant Logic, Simplicity First
     */
    generateSectionCSS(sectionId, breakpoint = 'desktop') {
        const section = this.sections.get(sectionId);
        if (!section) return '';
        
        const layout = section.layout;
        const options = section.section_options;
        const responsive = section.responsive[breakpoint] || {};
        
        // Merge layout with responsive overrides
        const finalLayout = { ...layout, ...responsive };
        
        const css = [];
        
        // Container styles
        css.push(`max-width: ${finalLayout.max_width || layout.max_width};`);
        css.push(`padding: ${finalLayout.padding || layout.padding};`);
        
        if (finalLayout.min_height) {
            css.push(`min-height: ${finalLayout.min_height};`);
        }
        
        // Display and alignment
        if (finalLayout.display) {
            css.push(`display: ${finalLayout.display};`);
            
            if (finalLayout.display === 'flex') {
                if (finalLayout.align_items) css.push(`align-items: ${finalLayout.align_items};`);
                if (finalLayout.justify_content) css.push(`justify-content: ${finalLayout.justify_content};`);
            }
            
            if (finalLayout.display === 'grid') {
                if (finalLayout.grid_template_columns) css.push(`grid-template-columns: ${finalLayout.grid_template_columns};`);
                if (finalLayout.column_gap) css.push(`column-gap: ${finalLayout.column_gap};`);
                if (finalLayout.row_gap) css.push(`row-gap: ${finalLayout.row_gap};`);
            }
        }
        
        // Column layout
        if (finalLayout.columns > 1 && finalLayout.display !== 'grid') {
            css.push(`display: grid;`);
            css.push(`grid-template-columns: repeat(${finalLayout.columns}, 1fr);`);
            if (finalLayout.column_gap) css.push(`column-gap: ${finalLayout.column_gap};`);
        }
        
        // Background
        if (options.background_type === 'color' && options.background_color) {
            css.push(`background-color: ${options.background_color};`);
        } else if (options.background_type === 'gradient' && options.background_color) {
            // Check if background_color is already a gradient string
            if (options.background_color.includes('linear-gradient')) {
                css.push(`background: ${options.background_color};`);
            } else {
                // Fallback: create a gradient from single color
                const gradientColor = options.background_color;
                css.push(`background: linear-gradient(135deg, ${gradientColor}, ${this.lightenColor(gradientColor, 0.2)});`);
            }
        } else if (options.background_type === 'image' && options.background_color) {
            css.push(`background: ${options.background_color};`);
            css.push(`background-size: cover;`);
            css.push(`background-position: center;`);
        }
        
        return css.join(' ');
    }
    
    /**
     * Utility: Lighten color for gradients
     * Following checklist: Simplicity First, No Redundant Logic
     */
    lightenColor(color, amount) {
        // Simple color lightening for gradients
        const hex = color.replace('#', '');
        const num = parseInt(hex, 16);
        
        let r = (num >> 16) + Math.round(amount * 255);
        let g = (num >> 8 & 0x00FF) + Math.round(amount * 255);
        let b = (num & 0x0000FF) + Math.round(amount * 255);
        
        r = Math.min(255, Math.max(0, r));
        g = Math.min(255, Math.max(0, g));
        b = Math.min(255, Math.max(0, b));
        
        return '#' + ((r << 16) | (g << 8) | b).toString(16).padStart(6, '0');
    }
    
    /**
     * Update sections in state
     * Following checklist: Centralized State, No Direct Manipulation
     */
    updateSectionsInState() {
        if (!this.stateManager || typeof this.stateManager.dispatch !== 'function') {
            this.logger.warn('⚠️ PHASE 3: Cannot update sections in state - state manager not available');
            return;
        }
        
        const sectionsArray = this.sectionOrder.map(sectionId => this.sections.get(sectionId));
        
        try {
            this.stateManager.dispatch({
                type: 'UPDATE_SECTIONS',
                payload: sectionsArray
            });
            
            this.logger.debug('💾 PHASE 3: Updated sections in state', {
                sectionCount: sectionsArray.length
            });
        } catch (error) {
            this.logger.error('❌ PHASE 3: Error updating sections in state', error);
        }
    }
    
    /**
     * Event handlers for component lifecycle
     * Following checklist: Event-Driven, Root Cause Fix
     */
    onComponentAdded(detail) {
        const { componentId, targetSectionId } = detail;
        
        if (targetSectionId) {
            this.assignComponentToSection(componentId, targetSectionId);
        } else {
            // Auto-assign to appropriate section or create new one
            this.autoAssignComponent(componentId);
        }
    }
    
    onComponentMoved(detail) {
        const { componentId, targetSectionId, column } = detail;
        
        if (targetSectionId) {
            this.assignComponentToSection(componentId, targetSectionId, column);
        }
    }
    
    onComponentRemoved(detail) {
        const { componentId } = detail;
        const removedFrom = this.removeComponentFromAllSections(componentId);
        
        // ROOT FIX: Clean up empty sections after component removal
        // Only auto-cleanup if this was the last component in the system
        const state = this.stateManager?.getState();
        const hasComponents = state && state.components && Object.keys(state.components).length > 0;
        
        if (!hasComponents) {
            // No components left - clean up empty sections
            this.cleanupEmptySections();
        } else {
            // Still have components - keep empty sections for manual management
            this.logger.info('🎯 PHASE 3: Keeping empty sections (components still exist)');
        }
    }
    
    onSectionConfigurationUpdated(detail) {
        const { sectionId, configuration } = detail;
        this.updateSectionConfiguration(sectionId, configuration);
    }
    
    /**
     * Auto-assign component to appropriate section
     * Following checklist: Simplicity First, Maintainability
     */
    autoAssignComponent(componentId) {
        // Try to find existing section with available space
        for (const [sectionId, section] of this.sections) {
            if (section.components.length < (section.layout.columns || 1)) {
                this.assignComponentToSection(componentId, sectionId);
                return;
            }
        }
        
        // Create new section if none available
        const newSectionId = `section_${Date.now()}`;
        this.registerSection(newSectionId, 'full_width');
        this.assignComponentToSection(componentId, newSectionId);
    }
    
    /**
     * Dispatch section-related events
     * Following checklist: Event-Driven, Documentation, Root Cause Fix
     * CRITICAL: Include self-reference to prevent circular dependencies
     */
    dispatchSectionEvent(eventType, detail) {
        // ROOT CAUSE FIX: Include self-reference in event detail for dependency injection
        // This prevents circular dependencies and global object sniffing
        const enhancedDetail = {
            ...detail,
            sectionLayoutManager: this,  // Pass reference to avoid global access
            timestamp: Date.now(),
            source: 'SectionLayoutManager'
        };
        
        const event = new CustomEvent(eventType, {
            detail: enhancedDetail
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Get section information
     * Following checklist: No Redundant Logic, Root Cause Fix
     */
    getSection(sectionId) {
        const section = this.sections.get(sectionId);
        
        // ROOT CAUSE FIX: Log if section is not found for debugging
        if (!section) {
            this.logger.debug(`📊 PHASE 3: Section ${sectionId} not found in map. Available sections: ${Array.from(this.sections.keys()).join(', ')}`);
            return null;
        }
        
        // ROOT CAUSE FIX: Ensure section has all required properties
        if (!section.layout) {
            this.logger.warn(`⚠️ PHASE 3: Section ${sectionId} missing layout, applying defaults`);
            const defaults = this.getDefaultSectionConfiguration(section.section_type || 'full_width');
            section.layout = defaults.layout;
            section.section_options = section.section_options || defaults.section_options;
            section.responsive = section.responsive || defaults.responsive;
            
            // Update the stored section
            this.sections.set(sectionId, section);
        }
        
        return section;
    }
    
    getAllSections() {
        return Array.from(this.sections.values());
    }
    
    getSectionsInOrder() {
        return this.sectionOrder.map(sectionId => this.sections.get(sectionId));
    }
    
    getSectionComponents(sectionId) {
        const section = this.sections.get(sectionId);
        return section ? section.components : [];
    }
    
    /**
     * Remove section
     * Following checklist: Graceful Failure, Centralized State
     * ROOT FIX: Properly delete all components within the section
     */
    removeSection(sectionId) {
        const section = this.sections.get(sectionId);
        if (!section) {
            this.logger.warn(`⚠️ PHASE 3: Cannot remove - section ${sectionId} not found`);
            return false;
        }
        
        // ROOT FIX: Actually delete components from the section
        // Collect component IDs first to avoid mutation during iteration
        const componentIdsToDelete = section.components.map(comp => comp.component_id);
        
        this.logger.info(`🗑️ PHASE 3: Removing section ${sectionId} with ${componentIdsToDelete.length} components`);
        
        // Delete each component through the component manager
        componentIdsToDelete.forEach(componentId => {
            // First dispatch removal from section event
            this.dispatchSectionEvent('gmkb:component-removed-from-section', {
                componentId: componentId,
                sectionId
            });
            
            // ROOT FIX: Actually request component deletion
            // This will trigger the component manager to remove the component
            document.dispatchEvent(new CustomEvent('gmkb:component-delete-requested', {
                detail: { 
                    componentId: componentId,
                    reason: 'section_deleted',
                    sectionId: sectionId,
                    skipConfirmation: true // Don't ask for confirmation when deleting section
                }
            }));
            
            this.logger.info(`🗑️ PHASE 3: Requested deletion of component ${componentId} from section ${sectionId}`);
        });
        
        // Remove section
        this.sections.delete(sectionId);
        this.sectionOrder = this.sectionOrder.filter(id => id !== sectionId);
        
        // Update state
        this.updateSectionsInState();
        
        // Dispatch event
        this.dispatchSectionEvent('gmkb:section-removed', { sectionId });
        
        this.logger.info(`🗑️ PHASE 3: Removed section ${sectionId} and its ${componentIdsToDelete.length} components`);
        return true;
    }
    
    /**
     * ROOT FIX: Clean up empty sections when no components remain
     * Following checklist: Graceful Failure, Centralized State
     * 
     * IMPORTANT: This only runs when ALL components are removed,
     * preserving intentionally created empty sections for manual use
     */
    cleanupEmptySections() {
        const emptySections = [];
        
        // Find all empty sections
        this.sections.forEach((section, sectionId) => {
            if (!section.components || section.components.length === 0) {
                // Check if this section was manually created (has a flag or recent creation)
                const isRecentlyCreated = section.created_at && (Date.now() - section.created_at < 60000); // Created within last minute
                const isManuallyCreated = section.manual_creation === true;
                
                if (!isRecentlyCreated && !isManuallyCreated) {
                    emptySections.push(sectionId);
                }
            }
        });
        
        // Remove only auto-created empty sections
        if (emptySections.length > 0) {
            this.logger.info(`🧹 PHASE 3: Cleaning up ${emptySections.length} empty auto-created sections`);
            emptySections.forEach(sectionId => {
                this.removeSection(sectionId);
            });
        }
        
        // Check if we have no sections left and handle accordingly
        if (this.sections.size === 0) {
            this.logger.info('📭 PHASE 3: No sections remaining after cleanup');
            
            // Dispatch event to notify renderer
            this.dispatchSectionEvent('gmkb:all-sections-removed', {
                timestamp: Date.now()
            });
        }
    }
    
    /**
     * Add section - PUBLIC API METHOD (alias for registerSection)
     * This is the method that tests expect to exist
     */
    addSection(sectionType = 'full_width', configuration = {}) {
        const sectionId = configuration.section_id || `section_${Date.now()}`;
        return this.registerSection(sectionId, sectionType, configuration);
    }
    
    /**
     * Get sections - PUBLIC API METHOD (alias for getAllSections)
     * This is the method that tests expect to exist  
     */
    getSections() {
        return this.getAllSections();
    }
    
    /**
     * Debug method - get current state
     * Following checklist: Diagnostic Logging
     */
    getDebugInfo() {
        return {
            sectionsCount: this.sections.size,
            sectionOrder: this.sectionOrder,
            sections: Array.from(this.sections.entries()),
            stateManagerAvailable: !!this.stateManager
        };
    }
}

// Global instance
window.SectionLayoutManager = SectionLayoutManager;

// Auto-initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        window.sectionLayoutManager = new SectionLayoutManager();
    });
} else {
    window.sectionLayoutManager = new SectionLayoutManager();
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionLayoutManager;
}
