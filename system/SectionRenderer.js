/**
 * Section Renderer
 * Phase 3: Section Layer System - Visual Rendering
 * 
 * ROOT FIX: Missing renderer component that actually creates DOM elements for sections
 * This was the root cause of sections not appearing visually
 * 
 * @version 3.0.0-phase3-renderer
 * @package GMKB/System
 */

// ROOT FIX: Immediate diagnostic to confirm script loads
console.log('🔍 SectionRenderer.js SCRIPT LOADED');

// ROOT FIX: Create the class and instance immediately
// The dependencies are ensured by WordPress enqueue system
class SectionRenderer {
    constructor() {
        this.logger = window.StructuredLogger || console;
        this.sectionLayoutManager = null;
        this.componentRenderer = null;
        this.renderedSections = new Set();
        this.containerElement = null;
        // ROOT FIX: Track sections being rendered to prevent duplicates
        this.renderingInProgress = new Set();
        this.renderedComponents = new Set();
        
        this.logger.info('🎨 PHASE 3: SectionRenderer initializing');
        this.initializeRenderer();
    }
    
    /**
     * Initialize the section renderer
     * Following checklist: Event-Driven Initialization, Dependency-Awareness
     */
    initializeRenderer() {
        // Add required CSS styles for section controls
        this.injectSectionStyles();
        
        // Wait for core systems to be ready
        document.addEventListener('gmkb:core-systems-ready', () => {
            this.onCoreSystemsReady();
        });
        
        // Listen for section events
        document.addEventListener('gmkb:section-registered', (event) => {
            this.onSectionRegistered(event);
        });
        
        document.addEventListener('gmkb:section-updated', (event) => {
            this.onSectionUpdated(event.detail);
        });
        
        document.addEventListener('gmkb:section-removed', (event) => {
            this.onSectionRemoved(event.detail);
        });
        
        document.addEventListener('gmkb:sections-reordered', (event) => {
            this.onSectionsReordered(event.detail);
        });
        
        // ROOT FIX: Listen for all sections removed
        document.addEventListener('gmkb:all-sections-removed', (event) => {
            this.onAllSectionsRemoved(event.detail);
        });
        
        // ROOT FIX: Try initialization with progressive checks
        this.attemptInitialization();
        
        this.logger.info('✅ PHASE 3: SectionRenderer initialized');
    }
    
    /**
     * ROOT FIX: Progressive initialization attempts
     * Tries to initialize immediately if possible, otherwise waits
     */
    attemptInitialization() {
        // Check if systems are ready now
        if (window.sectionLayoutManager && window.enhancedComponentRenderer) {
            this.onCoreSystemsReady();
            return;
        }
        
        // Try again after DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => {
                if (window.sectionLayoutManager && window.enhancedComponentRenderer) {
                    this.onCoreSystemsReady();
                } else {
                    // Final attempt after a delay
                    setTimeout(() => {
                        if (window.sectionLayoutManager) {
                            this.onCoreSystemsReady();
                        }
                    }, 1000);
                }
            });
        } else {
            // DOM already loaded, try after a short delay
            setTimeout(() => {
                if (window.sectionLayoutManager) {
                    this.onCoreSystemsReady();
                }
            }, 500);
        }
    }
    
    /**
     * ROOT FIX: Inject critical CSS styles for section controls
     * Ensures controls are visible even without theme styles
     */
    injectSectionStyles() {
        // Check if styles already added
        if (document.getElementById('gmkb-section-controls-styles')) {
            return;
        }
        
        const styles = document.createElement('style');
        styles.id = 'gmkb-section-controls-styles';
        styles.innerHTML = `
            /* Section Controls Positioning */
            .gmkb-section {
                position: relative;
                margin-bottom: 20px;
                min-height: 100px;
            }
            
            .gmkb-section__controls {
                position: absolute;
                top: 10px;
                right: 10px;
                z-index: 100;
                display: flex;
                gap: 8px;
                background: rgba(255, 255, 255, 0.95);
                border-radius: 4px;
                padding: 4px;
                box-shadow: 0 2px 4px rgba(0,0,0,0.1);
            }
            
            .gmkb-section__control {
                width: 32px;
                height: 32px;
                border: 1px solid #ddd;
                background: white;
                border-radius: 3px;
                display: flex;
                align-items: center;
                justify-content: center;
                cursor: pointer;
                transition: all 0.2s;
                font-size: 16px;
                color: #666;
            }
            
            .gmkb-section__control:hover {
                background: #f0f0f0;
                border-color: #999;
                color: #333;
            }
            
            .gmkb-section__control--add {
                background: #4CAF50;
                color: white;
                border-color: #45a049;
            }
            
            .gmkb-section__control--add:hover {
                background: #45a049;
            }
            
            .gmkb-section__control--remove:hover {
                background: #ffebee;
                border-color: #ef5350;
                color: #ef5350;
            }
            
            /* Ensure Dashicons show properly */
            .gmkb-section__control .dashicons,
            .gmkb-section__control i.dashicons {
                font-family: dashicons !important;
                font-size: 20px;
                width: 20px;
                height: 20px;
                line-height: 1;
            }
            
            /* Section empty state */
            .gmkb-section__empty {
                padding: 40px;
                text-align: center;
                border: 2px dashed #ddd;
                border-radius: 4px;
                background: #fafafa;
                cursor: pointer;
                transition: all 0.2s;
            }
            
            .gmkb-section__empty:hover {
                border-color: #999;
                background: #f5f5f5;
            }
            
            .gmkb-section__empty-icon {
                font-size: 32px;
                color: #999;
                margin-bottom: 10px;
            }
            
            .gmkb-section__empty-text {
                color: #666;
                font-size: 14px;
            }
            
            /* Section inner layout */
            .gmkb-section__inner {
                min-height: 60px;
                padding: 10px;
                display: flex;
                gap: 20px;
            }
            
            .gmkb-section__content,
            .gmkb-section__column {
                min-height: 100px;
                flex: 1;
                position: relative;
                border: 1px dashed transparent;
                transition: all 0.3s ease;
                padding: 10px;
            }
            
            /* Multi-column layout styles */
            .gmkb-section--two_column .gmkb-section__inner,
            .gmkb-section--main_sidebar .gmkb-section__inner,
            .gmkb-section--three_column .gmkb-section__inner {
                display: grid;
                gap: 20px;
            }
            
            .gmkb-section--two_column .gmkb-section__inner {
                grid-template-columns: repeat(2, 1fr);
            }
            
            .gmkb-section--main_sidebar .gmkb-section__inner {
                grid-template-columns: 2fr 1fr !important; /* Main content 2/3, sidebar 1/3 */
                display: grid !important;
            }
            
            .gmkb-section--three_column .gmkb-section__inner {
                grid-template-columns: repeat(3, 1fr);
            }
            
            /* Drop zone visual feedback */
            .gmkb-section__column[data-drop-zone="true"]:hover,
            .gmkb-section__content[data-drop-zone="true"]:hover {
                background: rgba(41, 92, 255, 0.05);
                border-color: #295cff;
            }
            
            /* Drag over state for columns */
            .gmkb-section__column.gmkb-drop-zone-active,
            .gmkb-section__content.gmkb-drop-zone-active {
                background: rgba(41, 92, 255, 0.1);
                border: 2px dashed #295cff;
            }
            
            /* Main + Sidebar specific styles */
            .gmkb-section--main_sidebar .gmkb-section__column--main {
                background: rgba(255, 255, 255, 0.5);
                border: 1px dashed #e0e0e0;
            }
            
            .gmkb-section--main_sidebar .gmkb-section__column--sidebar {
                background: rgba(245, 245, 245, 0.8);
                border: 1px dashed #d0d0d0;
            }
            
            .gmkb-section--main_sidebar .gmkb-section__column--main:hover {
                background: rgba(41, 92, 255, 0.03);
                border-color: #295cff;
            }
            
            .gmkb-section--main_sidebar .gmkb-section__column--sidebar:hover {
                background: rgba(41, 92, 255, 0.05);
                border-color: #295cff;
            }
        `;
        
        document.head.appendChild(styles);
        this.logger.debug('💄 PHASE 3: Injected section control styles');
    }
    
    /**
     * Handle core systems ready event
     * Following checklist: Dependency-Awareness, No Global Object Sniffing
     * ROOT FIX: Create container if it doesn't exist instead of repeatedly retrying
     */
    onCoreSystemsReady() {
        this.sectionLayoutManager = window.sectionLayoutManager;
        this.componentRenderer = window.enhancedComponentRenderer;
        
        // ROOT FIX: Find or create container immediately
        this.containerElement = this.findOrCreateContainerElement();
        
        if (!this.containerElement) {
            this.logger.error('❌ PHASE 3: Failed to create sections container');
            // ROOT FIX: Try again after a short delay
            setTimeout(() => {
                this.containerElement = this.findOrCreateContainerElement();
                if (this.containerElement) {
                    this.logger.info('✅ PHASE 3: Sections container created on retry');
                    this.renderExistingSections();
                }
            }, 500);
            return;
        }
        
        this.logger.info('🎯 PHASE 3: Section renderer ready - container found:', {
            containerId: this.containerElement.id,
            containerClass: this.containerElement.className,
            parent: this.containerElement.parentElement?.id
        });
        
        // Render any existing sections
        this.renderExistingSections();
    }
    
    /**
     * Find or create the container element for sections
     * ROOT FIX: Always ensure container exists
     */
    findOrCreateContainerElement() {
        // First try to find existing container
        let container = document.getElementById('gmkb-sections-container');
        
        if (container) {
            this.logger.info('✅ PHASE 3: Found existing sections container');
            return container;
        }
        
        // Try alternate selector
        container = document.querySelector('.gmkb-sections-container');
        if (container) {
            // Add ID if missing
            if (!container.id) {
                container.id = 'gmkb-sections-container';
            }
            this.logger.info('✅ PHASE 3: Found sections container by class');
            return container;
        }
        
        // ROOT FIX: Create container in the correct parent
        const savedComponentsContainer = document.getElementById('saved-components-container');
        if (savedComponentsContainer) {
            // Create sections container as first child of saved-components-container
            container = document.createElement('div');
            container.id = 'gmkb-sections-container';
            container.className = 'gmkb-sections-container';
            
            // Insert at beginning so sections come before direct components
            savedComponentsContainer.insertBefore(container, savedComponentsContainer.firstChild);
            
            this.logger.info('📦 PHASE 3: Created sections container in saved-components-container');
            return container;
        }
        
        // Fallback: create in media kit preview
        const mediaKitPreview = document.getElementById('media-kit-preview');
        if (mediaKitPreview) {
            container = document.createElement('div');
            container.id = 'gmkb-sections-container';
            container.className = 'gmkb-sections-container';
            mediaKitPreview.appendChild(container);
            
            this.logger.info('📦 PHASE 3: Created sections container in media-kit-preview');
            return container;
        }
        
        // Last resort: create in body (should never reach here)
        this.logger.error('❌ PHASE 3: No suitable parent for sections container');
        return null;
    }
    
    /**
     * Render existing sections from state
     * Following checklist: Centralized State, Schema Compliance
     */
    renderExistingSections() {
        if (!this.sectionLayoutManager) return;
        
        const sections = this.sectionLayoutManager.getSectionsInOrder();
        
        if (sections.length > 0) {
            this.logger.info(`📐 PHASE 3: Rendering ${sections.length} existing sections`);
            sections.forEach(section => {
                this.renderSection(section);
            });
        } else {
            this.logger.info('📐 PHASE 3: No existing sections to render');
        }
    }
    
    /**
     * Handle section registered event
     * Following checklist: Event-Driven, Real-time Updates, Root Cause Fix
     * CRITICAL: Use manager from event detail to avoid circular dependency
     */
    onSectionRegistered(event) {
        const { sectionId, sectionLayoutManager } = event.detail;
        
        this.logger.info(`📐 PHASE 3: Rendering newly registered section ${sectionId}`);
        
        // ROOT FIX: Ensure container exists before rendering
        if (!this.containerElement) {
            this.containerElement = this.findOrCreateContainerElement();
            if (!this.containerElement) {
                this.logger.error(`❌ PHASE 3: Cannot render section ${sectionId} - no container`);
                // Try again after a delay
                setTimeout(() => {
                    this.onSectionRegistered(event);
                }, 500);
                return;
            }
        }
        
        // ROOT FIX: Ensure containers are visible
        this.ensureContainersVisible();
        
        // ROOT CAUSE FIX: Use passed manager reference to avoid global access
        this.renderSection(sectionId, sectionLayoutManager || this.sectionLayoutManager);
        
        // ROOT FIX: Notify component renderer to update container display
        // This ensures empty state is hidden when sections are added
        document.dispatchEvent(new CustomEvent('gmkb:section-rendered-display-update', {
            detail: { 
                sectionId,
                hasSections: true,
                timestamp: Date.now() 
            }
        }));
        
        // ROOT CAUSE FIX: Ensure section is properly registered with drag-drop system
        // Small delay to ensure DOM is ready for drag-drop integration
        setTimeout(() => {
            if (window.sectionComponentIntegration) {
                this.logger.debug(`🔗 PHASE 3: Section ${sectionId} ready for drag-drop integration`);
            }
            
            // ROOT FIX: Verify section was actually rendered
            const sectionElement = document.getElementById(`section-${sectionId}`);
            if (!sectionElement) {
                this.logger.warn(`⚠️ PHASE 3: Section ${sectionId} not found in DOM after render attempt`);
                // Try to render again
                this.renderSection(sectionId, sectionLayoutManager || this.sectionLayoutManager);
            }
        }, 100);
    }
    
    /**
     * Render a section to DOM
     * Following checklist: DOM Manipulation, Visual Consistency, Root Cause Fix
     * @param {string|object} sectionOrId - Section object or ID
     * @param {object} sectionLayoutManager - Manager instance (required when passing ID)
     */
    renderSection(sectionOrId, sectionLayoutManager = null) {
        // ROOT FIX: Get section ID for tracking
        let sectionId = typeof sectionOrId === 'string' ? sectionOrId : sectionOrId?.section_id;
        
        if (!sectionId) {
            this.logger.error('❌ PHASE 3: Cannot render section - no section ID');
            return;
        }
        
        // ROOT FIX: Prevent duplicate rendering - check if already rendering
        if (this.renderingInProgress.has(sectionId)) {
            this.logger.debug(`⏳ PHASE 3: Section ${sectionId} rendering already in progress, skipping`);
            return;
        }
        
        // Mark as rendering
        this.renderingInProgress.add(sectionId);
        
        if (!this.containerElement) {
            // ROOT FIX: Try to create container if missing
            this.containerElement = this.findOrCreateContainerElement();
            if (!this.containerElement) {
                this.logger.error('❌ PHASE 3: Cannot render section - unable to create container');
                this.renderingInProgress.delete(sectionId);
                return;
            }
        }
        
        // ROOT CAUSE FIX: Handle both section object and section ID
        let section = sectionOrId;
        
        // If a string ID was passed, fetch the actual section object
        if (typeof sectionOrId === 'string') {
            // ROOT CAUSE FIX: Use passed manager or fallback to instance manager
            const manager = sectionLayoutManager || this.sectionLayoutManager;
            
            if (!manager) {
                this.logger.error(`❌ PHASE 3: Cannot fetch section ${sectionOrId} - no manager available`);
                this.logger.error('This is a critical error - section manager should be passed via event');
                this.renderingInProgress.delete(sectionId);
                return;
            }
            
            section = manager.getSection(sectionOrId);
            if (!section) {
                this.logger.error(`❌ PHASE 3: Section not found: ${sectionOrId}`);
                this.renderingInProgress.delete(sectionId);
                return;
            }
        }
        
        // Validate section object
        if (!section || typeof section !== 'object') {
            this.logger.error('❌ PHASE 3: Invalid section parameter', sectionOrId);
            this.renderingInProgress.delete(sectionId);
            return;
        }
        
        // ROOT FIX: Ensure containers are visible when rendering sections
        this.ensureContainersVisible();
        
        // ROOT FIX: Check if section already exists in DOM (from PHP render)
        // Since PHP no longer renders sections, this check is now redundant but kept for safety
        const existingSectionElement = document.querySelector(`[data-section-id="${section.section_id}"]`);
        if (existingSectionElement) {
            this.logger.debug(`✅ PHASE 3: Section ${section.section_id} already exists in DOM, updating`);
            this.updateSectionElement(section);
            this.renderedSections.add(section.section_id);
            // Clear rendering flag
            this.renderingInProgress.delete(section.section_id);
            return;
        }
        
        // Check if section already rendered by JS
        if (this.renderedSections.has(section.section_id)) {
            this.logger.debug(`🔄 PHASE 3: Section ${section.section_id} already rendered by JS, updating`);
            this.updateSectionElement(section);
            // ROOT FIX: Clear rendering flag
            this.renderingInProgress.delete(section.section_id);
            return;
        }
        
        // Create section element
        const sectionElement = this.createSectionElement(section);
        
        if (!sectionElement) {
            this.logger.error(`❌ PHASE 3: Failed to create section element for ${section.section_id}`);
            // ROOT FIX: Clear rendering flag
            this.renderingInProgress.delete(section.section_id);
            return;
        }
        
        // Add to container
        this.containerElement.appendChild(sectionElement);
        
        // Track rendered section
        this.renderedSections.add(section.section_id);
        
        // Apply CSS styles
        this.applySectionStyles(sectionElement, section);
        
        // Render components in this section
        this.renderSectionComponents(sectionElement, section);
        
        // ROOT FIX: Clear rendering flag after successful render
        this.renderingInProgress.delete(section.section_id);
        
        this.logger.info(`✅ PHASE 3: Section ${section.section_id} rendered successfully`);
        
        // Dispatch rendered event
        this.dispatchSectionEvent('gmkb:section-rendered', {
            sectionId: section.section_id,
            element: sectionElement
        });
    }
    
    /**
     * Create section DOM element
     * Following checklist: DOM Creation, Semantic HTML, Graceful Failure
     */
    createSectionElement(section) {
        // ROOT CAUSE FIX: Validate section structure before processing
        if (!section || !section.section_id) {
            this.logger.error('❌ PHASE 3: Invalid section object - missing required properties', section);
            return null;
        }
        
        // ROOT CAUSE FIX: Ensure section has proper structure with defaults
        if (!section.layout) {
            this.logger.warn(`⚠️ PHASE 3: Section ${section.section_id} missing layout - applying defaults`);
            
            // Get defaults from SectionLayoutManager if available
            const sectionType = section.section_type || 'full_width';
            if (this.sectionLayoutManager) {
                const defaults = this.sectionLayoutManager.getDefaultSectionConfiguration(sectionType);
                section.layout = defaults.layout || { columns: 1 };
                section.section_options = section.section_options || defaults.section_options || {};
                section.responsive = section.responsive || defaults.responsive || {};
            } else {
                // Fallback minimal defaults
                section.layout = { columns: 1 };
                section.section_options = section.section_options || {};
                section.responsive = section.responsive || {};
            }
        }
        
        const sectionElement = document.createElement('section');
        
        // Set identifiers
        sectionElement.id = `section-${section.section_id}`;
        sectionElement.dataset.sectionId = section.section_id;
        sectionElement.dataset.sectionType = section.section_type || 'full_width';
        
        // Add classes
        sectionElement.className = [
            'gmkb-section',
            `gmkb-section--${section.section_type || 'full_width'}`,
            section.section_options?.custom_class || ''
        ].filter(Boolean).join(' ');
        
        // Create inner container for layout
        const innerContainer = document.createElement('div');
        innerContainer.className = 'gmkb-section__inner';
        
        // Handle column layouts - with defensive check
        const columnCount = section.layout?.columns || 1;
        if (columnCount > 1) {
            // ROOT FIX: Handle main_sidebar special case with column labels
            const isMainSidebar = section.section_type === 'main_sidebar';
            
            for (let i = 1; i <= columnCount; i++) {
                const column = document.createElement('div');
                column.className = `gmkb-section__column gmkb-section__column--${i}`;
                
                // Add special class for main/sidebar columns
                if (isMainSidebar) {
                    column.classList.add(i === 1 ? 'gmkb-section__column--main' : 'gmkb-section__column--sidebar');
                }
                
                column.dataset.column = i;
                // ROOT FIX: Add drop zone attributes to each column for drag-drop targeting
                column.setAttribute('data-drop-zone', 'true');
                column.setAttribute('data-section-id', section.section_id);
                column.setAttribute('data-column-index', i);
                column.setAttribute('data-column-label', isMainSidebar ? (i === 1 ? 'Main Content' : 'Sidebar') : `Column ${i}`);
                column.style.minHeight = '100px'; // Ensure columns have minimum height for dropping
                innerContainer.appendChild(column);
            }
        } else {
            // Single column or custom layout
            innerContainer.classList.add('gmkb-section__content');
            // ROOT FIX: Add drop zone attributes for single column sections
            innerContainer.setAttribute('data-drop-zone', 'true');
            innerContainer.setAttribute('data-section-id', section.section_id);
            innerContainer.setAttribute('data-column-index', '1');
            innerContainer.style.minHeight = '100px'; // Ensure container has minimum height
        }
        
        sectionElement.appendChild(innerContainer);
        
        // Add section controls (edit, remove, etc.)
        this.addSectionControls(sectionElement, section);
        
        return sectionElement;
    }
    
    /**
     * Add interactive controls to section
     * Following checklist: User Experience, Interactivity
     */
    addSectionControls(sectionElement, section) {
        const controls = document.createElement('div');
        controls.className = 'gmkb-section__controls';
        
        // ROOT FIX: Add component button - ALWAYS present, not just for empty sections
        const addBtn = document.createElement('button');
        addBtn.className = 'gmkb-section__control gmkb-section__control--add';
        addBtn.innerHTML = '<i class="dashicons dashicons-plus-alt"></i>';
        addBtn.title = 'Add Component to Section';
        addBtn.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            this.handleAddComponentToSection(section.section_id);
        });
        
        // Edit button
        const editBtn = document.createElement('button');
        editBtn.className = 'gmkb-section__control gmkb-section__control--edit';
        editBtn.innerHTML = '<i class="dashicons dashicons-edit"></i>';
        editBtn.title = 'Edit Section';
        editBtn.addEventListener('click', () => {
            this.handleSectionEdit(section.section_id);
        });
        
        // Remove button
        const removeBtn = document.createElement('button');
        removeBtn.className = 'gmkb-section__control gmkb-section__control--remove';
        removeBtn.innerHTML = '<i class="dashicons dashicons-trash"></i>';
        removeBtn.title = 'Remove Section';
        removeBtn.addEventListener('click', () => {
            this.handleSectionRemove(section.section_id);
        });
        
        // Move handle
        const moveHandle = document.createElement('div');
        moveHandle.className = 'gmkb-section__control gmkb-section__control--move';
        moveHandle.innerHTML = '<i class="dashicons dashicons-move"></i>';
        moveHandle.title = 'Drag to Reorder';
        
        controls.appendChild(addBtn);
        controls.appendChild(editBtn);
        controls.appendChild(removeBtn);
        controls.appendChild(moveHandle);
        
        sectionElement.appendChild(controls);
        
        // ROOT FIX: Add CSS to ensure Dashicons are loaded and visible
        this.ensureDashiconsLoaded();
    }
    
    /**
     * ROOT FIX: Ensure Dashicons font is loaded
     * WordPress doesn't always load Dashicons on the frontend
     */
    ensureDashiconsLoaded() {
        // Check if dashicons are already loaded
        if (document.querySelector('link[href*="dashicons"]')) {
            return;
        }
        
        // Check if we're in WordPress admin (dashicons should be loaded)
        if (document.body.classList.contains('wp-admin')) {
            return;
        }
        
        // Add dashicons CSS if not present
        const dashiconsLink = document.createElement('link');
        dashiconsLink.rel = 'stylesheet';
        dashiconsLink.href = '/wp-includes/css/dashicons.min.css';
        document.head.appendChild(dashiconsLink);
        
        this.logger.debug('📦 PHASE 3: Added Dashicons CSS for section controls');
    }
    
    /**
     * Apply CSS styles to section
     * Following checklist: Visual Consistency, Responsive Design
     */
    applySectionStyles(sectionElement, section) {
        if (!this.sectionLayoutManager) return;
        
        // Generate and apply CSS
        const css = this.sectionLayoutManager.generateSectionCSS(section.section_id);
        
        if (css) {
            const innerElement = sectionElement.querySelector('.gmkb-section__inner');
            if (innerElement) {
                innerElement.style.cssText = css;
            }
        }
        
        // Add responsive classes
        this.addResponsiveClasses(sectionElement, section);
    }
    
    /**
     * Add responsive classes for breakpoints
     * Following checklist: Responsive Design, Mobile-First
     */
    addResponsiveClasses(sectionElement, section) {
        const responsive = section.responsive || {};
        
        // Add data attributes for responsive behavior
        if (responsive.mobile) {
            sectionElement.dataset.mobileColumns = responsive.mobile.columns || '';
        }
        
        if (responsive.tablet) {
            sectionElement.dataset.tabletColumns = responsive.tablet.columns || '';
        }
    }
    
    /**
     * Render components within a section
     * Following checklist: Component Integration, Layout Management
     */
    renderSectionComponents(sectionElement, section) {
        if (!section.components || section.components.length === 0) {
            // Add placeholder for empty sections
            this.addEmptySectionPlaceholder(sectionElement);
            return;
        }
        
        section.components.forEach(componentAssignment => {
            const { component_id, column } = componentAssignment;
            
            // Find target container based on layout
            let targetContainer;
            
            if (section.layout.columns > 1) {
                targetContainer = sectionElement.querySelector(`.gmkb-section__column[data-column="${column}"]`);
            } else {
                targetContainer = sectionElement.querySelector('.gmkb-section__content');
            }
            
            if (targetContainer) {
                // Move or render component in this section
                this.moveComponentToSection(component_id, targetContainer);
            }
        });
    }
    
    /**
     * Move component to section container
     * Following checklist: DOM Manipulation, Component Management
     * ✅ ROOT FIX: Direct rendering without events or timeouts
     */
    async moveComponentToSection(componentId, targetContainer) {
        // ROOT FIX: Prevent duplicate rendering - check if already in target
        const existingInTarget = targetContainer.querySelector(`[data-component-id="${componentId}"]`);
        if (existingInTarget) {
            this.logger.debug(`✅ PHASE 3: Component ${componentId} already in target container`);
            return;
        }
        
        // Find existing component element anywhere in the DOM
        let componentElement = document.querySelector(`[data-component-id="${componentId}"]`) || 
                               document.getElementById(componentId);
        
        if (componentElement) {
            // ROOT FIX: Check if it's already in correct container to prevent unnecessary moves
            if (componentElement.parentElement === targetContainer) {
                this.logger.debug(`✅ PHASE 3: Component ${componentId} already in correct container`);
                return;
            }
            // Move existing component
            targetContainer.appendChild(componentElement);
            this.logger.debug(`🔄 PHASE 3: Moved component ${componentId} to section`);
            return;
        }
        
        // ROOT FIX: Prevent duplicate component rendering
        if (this.renderedComponents.has(componentId)) {
            this.logger.debug(`✅ PHASE 3: Component ${componentId} already rendered, skipping`);
            return;
        }
        
        // ✅ ROOT FIX: Component doesn't exist - render it directly here
        // This is the proper place to render section components
        const state = window.enhancedStateManager?.getState();
        const componentData = state?.components?.[componentId];
        
        if (!componentData) {
            this.logger.warn(`⚠️ PHASE 3: Component ${componentId} not found in state`);
            return;
        }
        
        // Mark component as rendered
        this.renderedComponents.add(componentId);
        
        // ✅ CHECKLIST COMPLIANT: Wait for renderer if not available yet
        // The section renderer needs the component renderer to create components
        if (!window.enhancedComponentRenderer) {
            // ROOT FIX: Component renderer not ready yet - defer rendering
            this.logger.debug(`⏳ PHASE 3: Component renderer not ready yet for ${componentId}, deferring...`);
            
            // Store deferred component info for later rendering
            if (!this.deferredComponents) {
                this.deferredComponents = [];
            }
            this.deferredComponents.push({ componentId, targetContainer, componentData });
            
            // Listen for renderer ready event if not already listening
            if (!this.listeningForRenderer) {
                this.listeningForRenderer = true;
                document.addEventListener('gmkb:enhanced-component-renderer-ready', () => {
                    // ROOT FIX: Add small delay to ensure global variable is set
                    // The event fires during init but before window.enhancedComponentRenderer is assigned
                    setTimeout(() => {
                        if (window.enhancedComponentRenderer) {
                            this.processDeferredComponents();
                        } else {
                            this.logger.warn('⚠️ PHASE 3: Renderer ready event fired but global not set yet, waiting...');
                            // Try again after another short delay
                            setTimeout(() => {
                                if (window.enhancedComponentRenderer) {
                                    this.processDeferredComponents();
                                }
                            }, 50);
                        }
                    }, 10);
                }, { once: true });
                
                // Also listen for core systems ready as a backup
                document.addEventListener('gmkb:core-systems-ready', () => {
                    setTimeout(() => {
                        if (window.enhancedComponentRenderer && this.deferredComponents && this.deferredComponents.length > 0) {
                            this.processDeferredComponents();
                        }
                    }, 100);
                }, { once: true });
            }
            return;
        }
        
        // Renderer is available - use it to create the component element
        const result = await window.enhancedComponentRenderer.renderSingleComponent({
            id: componentId,
            type: componentData.type,
            props: componentData.props || componentData.data || {}
        });
        
        if (result.success && result.element) {
            // Add the rendered component directly to the section
            targetContainer.appendChild(result.element);
            this.logger.info(`✅ PHASE 3: Component ${componentId} rendered directly in section`);
        } else {
            this.logger.error(`❌ PHASE 3: Failed to render component ${componentId}`);
        }
    }
    
    /**
     * Process components that were deferred because renderer wasn't ready
     * Following checklist: Event-Driven, Root Cause Fix
     */
    async processDeferredComponents() {
        if (!this.deferredComponents || this.deferredComponents.length === 0) {
            return;
        }
        
        if (!window.enhancedComponentRenderer) {
            this.logger.error('❌ PHASE 3: Cannot process deferred components - renderer still not available');
            return;
        }
        
        this.logger.info(`🔄 PHASE 3: Processing ${this.deferredComponents.length} deferred components`);
        
        // Process all deferred components
        const deferred = [...this.deferredComponents];
        this.deferredComponents = [];
        
        for (const { componentId, targetContainer, componentData } of deferred) {
            // Check if container still exists in DOM
            if (!targetContainer.isConnected) {
                this.logger.warn(`⚠️ PHASE 3: Target container for ${componentId} no longer in DOM`);
                continue;
            }
            
            // ROOT FIX: Check if component was already rendered
            if (this.renderedComponents.has(componentId)) {
                this.logger.debug(`✅ PHASE 3: Deferred component ${componentId} already rendered, skipping`);
                continue;
            }
            
            // Check if component wasn't already rendered elsewhere
            const existingElement = document.querySelector(`[data-component-id="${componentId}"]`);
            if (existingElement) {
                targetContainer.appendChild(existingElement);
                this.logger.debug(`🔄 PHASE 3: Moved existing component ${componentId} to section`);
                this.renderedComponents.add(componentId);
                continue;
            }
            
            // Mark as rendered before attempting render
            this.renderedComponents.add(componentId);
            
            // Render the component
            const result = await window.enhancedComponentRenderer.renderSingleComponent({
                id: componentId,
                type: componentData.type,
                props: componentData.props || componentData.data || {}
            });
            
            if (result.success && result.element) {
                targetContainer.appendChild(result.element);
                this.logger.info(`✅ PHASE 3: Deferred component ${componentId} rendered in section`);
            } else {
                this.logger.error(`❌ PHASE 3: Failed to render deferred component ${componentId}`);
            }
        }
        
        this.logger.info(`✅ PHASE 3: Finished processing deferred components`);
    }
    
    /**
     * Add placeholder for empty sections
     * Following checklist: User Experience, Visual Feedback, ROOT FIX: Click functionality
     */
    addEmptySectionPlaceholder(sectionElement) {
        const section = this.sectionLayoutManager?.getSection(sectionElement.dataset.sectionId);
        const columnCount = section?.layout?.columns || 1;
        
        // ROOT FIX: Add placeholders to ALL columns in multi-column sections
        if (columnCount > 1) {
            // Multi-column section - add placeholder to each column
            const columns = sectionElement.querySelectorAll('.gmkb-section__column');
            columns.forEach((column, index) => {
                if (!column.querySelector('.gmkb-section__empty')) {
                    // Get column label from data attribute or default
                    const columnLabel = column.getAttribute('data-column-label') || `Column ${index + 1}`;
                    
                    const placeholder = document.createElement('div');
                    placeholder.className = 'gmkb-section__empty';
                    placeholder.innerHTML = `
                        <div class="gmkb-section__empty-icon">
                            <span class="dashicons dashicons-plus-alt2"></span>
                        </div>
                        <div class="gmkb-section__empty-text">
                            Drop to ${columnLabel}
                        </div>
                    `;
                    
                    // ROOT FIX: Make clickable to add components to specific column
                    placeholder.addEventListener('click', (e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        // Store which column was clicked
                        window.targetColumnForComponent = index + 1;
                        this.handleAddComponentToSection(sectionElement.dataset.sectionId);
                    });
                    
                    placeholder.style.cursor = 'pointer';
                    placeholder.setAttribute('data-drop-zone', 'true');
                    placeholder.setAttribute('data-section-id', sectionElement.dataset.sectionId);
                    placeholder.setAttribute('data-column-index', index + 1);
                    
                    column.appendChild(placeholder);
                }
            });
            this.logger.debug(`PHASE 3: Added placeholders to ${columns.length} columns in section`);
        } else {
            // Single column section - add one placeholder
            const innerElement = sectionElement.querySelector('.gmkb-section__inner, .gmkb-section__content');
            
            if (innerElement && !innerElement.querySelector('.gmkb-section__empty')) {
                const placeholder = document.createElement('div');
                placeholder.className = 'gmkb-section__empty';
                placeholder.innerHTML = `
                    <div class="gmkb-section__empty-icon">
                        <span class="dashicons dashicons-plus-alt2"></span>
                    </div>
                    <div class="gmkb-section__empty-text">
                        Drop components here or click to add
                    </div>
                `;
                
                // ROOT FIX: Make clickable to add components via modal
                placeholder.addEventListener('click', (e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    this.handleAddComponentToSection(sectionElement.dataset.sectionId);
                });
                
                placeholder.style.cursor = 'pointer';
                placeholder.setAttribute('data-drop-zone', 'true');
                placeholder.setAttribute('data-section-id', sectionElement.dataset.sectionId);
                placeholder.setAttribute('data-column-index', '1');
                
                innerElement.appendChild(placeholder);
                
                this.logger.debug('PHASE 3: Added clickable placeholder to single-column section');
            }
        }
    }
    
    /**
     * Update existing section element
     * Following checklist: DOM Updates, Performance
     */
    updateSectionElement(section) {
        const sectionElement = document.getElementById(`section-${section.section_id}`);
        
        if (!sectionElement) {
            // Section not rendered yet, render it
            this.renderSection(section);
            return;
        }
        
        // Update styles
        this.applySectionStyles(sectionElement, section);
        
        // Update components
        const innerElement = sectionElement.querySelector('.gmkb-section__inner');
        if (innerElement) {
            // Clear and re-render components
            innerElement.querySelectorAll('.gmkb-section__column, .gmkb-section__content').forEach(col => {
                col.innerHTML = '';
            });
            
            this.renderSectionComponents(sectionElement, section);
        }
        
        this.logger.debug(`🔄 PHASE 3: Updated section ${section.section_id}`);
    }
    
    /**
     * Handle section updated event
     * Following checklist: Event-Driven Updates, Real-time Sync
     */
    onSectionUpdated(detail) {
        const { sectionId, section } = detail;
        this.updateSectionElement(section);
    }
    
    /**
     * Handle section removed event
     * Following checklist: DOM Cleanup, Memory Management
     */
    onSectionRemoved(detail) {
        const { sectionId } = detail;
        
        const sectionElement = document.getElementById(`section-${sectionId}`);
        if (sectionElement) {
            // Move components back to unassigned area
            const components = sectionElement.querySelectorAll('[data-component-id]');
            components.forEach(comp => {
                // Move to temporary holding area or delete
                const holdingArea = document.getElementById('unassigned-components');
                if (holdingArea) {
                    holdingArea.appendChild(comp);
                }
            });
            
            // Remove section element
            sectionElement.remove();
            
            // Update tracking
            this.renderedSections.delete(sectionId);
            
            this.logger.info(`🗑️ PHASE 3: Removed section ${sectionId} from DOM`);
            
            // ROOT FIX: Check if we have no more sections and handle empty state
            this.checkForEmptyState();
        }
    }
    
    /**
     * Handle sections reordered event
     * Following checklist: DOM Reordering, Visual Consistency
     */
    onSectionsReordered(detail) {
        const { newOrder } = detail;
        
        if (!this.containerElement) return;
        
        // Reorder DOM elements to match new order
        newOrder.forEach((sectionId, index) => {
            const sectionElement = document.getElementById(`section-${sectionId}`);
            if (sectionElement) {
                this.containerElement.appendChild(sectionElement);
            }
        });
        
        this.logger.info(`🔄 PHASE 3: Reordered ${newOrder.length} sections in DOM`);
    }
    
    /**
     * Handle section edit
     * Following checklist: User Interaction, Modal Management
     */
    handleSectionEdit(sectionId) {
        this.logger.info(`✏️ PHASE 3: Editing section ${sectionId}`);
        
        // Dispatch event for section editor
        this.dispatchSectionEvent('gmkb:section-edit-requested', {
            sectionId
        });
    }
    
    /**
     * Handle section remove
     * Following checklist: User Confirmation, Safe Deletion
     */
    handleSectionRemove(sectionId) {
        if (confirm('Are you sure you want to remove this section?')) {
            if (this.sectionLayoutManager) {
                this.sectionLayoutManager.removeSection(sectionId);
            }
        }
    }
    
    /**
     * Handle add component to section
     * Following checklist: Component Management, User Experience, ROOT FIX: Use modal system
     */
    handleAddComponentToSection(sectionId) {
        this.logger.info(`➕ PHASE 3: Adding component to section ${sectionId}`);
        
        // ROOT FIX: Open component library modal with section targeting
        if (window.modalBase && window.modalBase.openModal) {
            // Store the target section ID for the modal
            window.targetSectionForComponent = sectionId;
            window.modalBase.openModal('component-library');
            this.logger.info(`🎨 PHASE 3: Opened component library for section ${sectionId}`);
        } else if (window.enhancedComponentManager) {
            // Fallback: Add a default component directly
            const availableTypes = ['hero', 'biography', 'topics', 'contact'];
            const randomType = availableTypes[Math.floor(Math.random() * availableTypes.length)];
            
            window.enhancedComponentManager.addComponent(randomType, {
                targetSectionId: sectionId,
                targetColumn: 1,
                clickToAdd: true
            });
            
            this.logger.info(`🎲 PHASE 3: Added random ${randomType} component to section ${sectionId}`);
        } else {
            // Last resort: dispatch event
            this.dispatchSectionEvent('gmkb:add-component-to-section', {
                sectionId
            });
        }
    }
    
    /**
     * Dispatch section-related events
     * Following checklist: Event-Driven, Documentation
     */
    dispatchSectionEvent(eventType, detail) {
        const event = new CustomEvent(eventType, {
            detail: {
                ...detail,
                timestamp: Date.now(),
                source: 'SectionRenderer'
            }
        });
        
        document.dispatchEvent(event);
    }
    
    /**
     * Render sections - PUBLIC API METHOD
     * @param {Array} sections - Optional array of sections to render
     */
    renderSections(sections = null) {
        if (sections && Array.isArray(sections)) {
            // Render specific sections
            sections.forEach(section => {
                this.renderSection(section);
            });
        } else {
            // Render all sections
            this.renderAllSections();
        }
    }
    
    /**
     * Render all sections (utility method)
     * Following checklist: Batch Operations, Performance
     */
    renderAllSections() {
        this.logger.info('🎨 PHASE 3: Rendering all sections');
        
        // Clear container
        if (this.containerElement) {
            this.containerElement.innerHTML = '';
            this.renderedSections.clear();
        }
        
        // Render all sections
        this.renderExistingSections();
    }
    
    /**
     * Auto-create sections for existing components
     * Following checklist: Migration, Backward Compatibility
     */
    autoCreateSectionsForExistingComponents() {
        if (!window.enhancedStateManager || !this.sectionLayoutManager) {
            this.logger.warn('⚠️ PHASE 3: Cannot auto-create sections - dependencies not ready');
            return;
        }
        
        const state = window.enhancedStateManager.getState();
        const components = Object.values(state.components || {});
        
        if (components.length > 0 && (!state.sections || state.sections.length === 0)) {
            this.logger.info(`🔧 PHASE 3: Auto-creating sections for ${components.length} existing components`);
            
            // Create a default section
            const defaultSectionId = `section_default_${Date.now()}`;
            const defaultSection = this.sectionLayoutManager.registerSection(
                defaultSectionId, 
                'full_width'
            );
            
            // Assign all components to this section
            components.forEach(component => {
                this.sectionLayoutManager.assignComponentToSection(
                    component.id, 
                    defaultSectionId
                );
            });
            
            this.logger.info(`✅ PHASE 3: Created default section with ${components.length} components`);
        }
    }
    
    /**
     * ROOT FIX: Refresh section to properly display components
     * This ensures components added via the component library modal are visible
     * @param {string} sectionId - Section ID to refresh
     */
    refreshSection(sectionId) {
        if (!sectionId) {
            this.logger.warn('⚠️ PHASE 3: Cannot refresh section - no sectionId provided');
            return;
        }
        
        this.logger.info(`🔄 PHASE 3: Refreshing section ${sectionId}`);
        
        // Get the section data
        if (!this.sectionLayoutManager) {
            this.logger.error('❌ PHASE 3: Cannot refresh - SectionLayoutManager not available');
            return;
        }
        
        const section = this.sectionLayoutManager.getSection(sectionId);
        if (!section) {
            this.logger.error(`❌ PHASE 3: Section ${sectionId} not found for refresh`);
            return;
        }
        
        // Find the section element in DOM
        const sectionElement = document.getElementById(`section-${sectionId}`) || 
                              document.querySelector(`[data-section-id="${sectionId}"]`);
        
        if (!sectionElement) {
            this.logger.warn(`⚠️ PHASE 3: Section element not found in DOM, re-rendering section ${sectionId}`);
            // Section not in DOM, render it fresh
            this.renderSection(section);
            return;
        }
        
        // ROOT FIX: Clear and re-render components in the section
        const innerElement = sectionElement.querySelector('.gmkb-section__inner');
        if (!innerElement) {
            this.logger.warn(`⚠️ PHASE 3: No inner element in section ${sectionId}`);
            return;
        }
        
        // Get all columns or content area
        const columns = innerElement.querySelectorAll('.gmkb-section__column');
        const contentArea = innerElement.querySelector('.gmkb-section__content');
        
        // ROOT FIX: Remove empty placeholders if components exist
        if (section.components && section.components.length > 0) {
            const emptyPlaceholders = innerElement.querySelectorAll('.gmkb-section__empty');
            emptyPlaceholders.forEach(placeholder => placeholder.remove());
        }
        
        // ROOT FIX: Move any orphaned components to their correct positions
        if (section.components && section.components.length > 0) {
            section.components.forEach(componentAssignment => {
                const { component_id, column } = componentAssignment;
                
                // Find the component element
                const componentElement = document.querySelector(`[data-component-id="${component_id}"]`);
                
                if (componentElement) {
                    // Determine target container based on layout
                    let targetContainer;
                    
                    if (columns.length > 0) {
                        // Multi-column layout
                        const targetColumn = Math.min(column || 1, columns.length) - 1;
                        targetContainer = columns[targetColumn];
                    } else if (contentArea) {
                        // Single column layout
                        targetContainer = contentArea;
                    } else {
                        // Fallback to inner element
                        targetContainer = innerElement;
                    }
                    
                    // Move component if it's not already in the correct container
                    if (componentElement.parentElement !== targetContainer) {
                        targetContainer.appendChild(componentElement);
                        this.logger.debug(`🔄 PHASE 3: Moved component ${component_id} to correct position in section ${sectionId}`);
                    }
                }
            });
        } else {
            // No components, ensure placeholder is shown
            this.addEmptySectionPlaceholder(sectionElement);
        }
        
        // Update styles
        this.applySectionStyles(sectionElement, section);
        
        this.logger.info(`✅ PHASE 3: Section ${sectionId} refreshed successfully`);
        
        // Dispatch refresh event
        this.dispatchSectionEvent('gmkb:section-refreshed', {
            sectionId,
            componentCount: section.components?.length || 0
        });
    }
    
    /**
     * ROOT FIX: Ensure all necessary containers are visible for sections
     */
    ensureContainersVisible() {
        // Show the main saved components container
        const savedComponentsContainer = document.getElementById('saved-components-container');
        if (savedComponentsContainer) {
            // Always ensure it's visible when we have sections
            if (savedComponentsContainer.style.display === 'none' || savedComponentsContainer.style.display === '') {
                savedComponentsContainer.style.display = 'block';
                this.logger.info('📦 PHASE 3: Made saved-components-container visible for sections');
            }
        }
        
        // Show the sections container (this.containerElement)
        if (this.containerElement) {
            if (this.containerElement.style.display === 'none' || this.containerElement.style.display === '') {
                this.containerElement.style.display = 'block';
                this.logger.info('📦 PHASE 3: Made sections container visible');
            }
        }
        
        // Show the main preview container
        const previewContainer = document.getElementById('media-kit-preview');
        if (previewContainer) {
            if (previewContainer.style.display === 'none' || previewContainer.style.display === '') {
                previewContainer.style.display = 'block';
                this.logger.info('📦 PHASE 3: Made media-kit-preview visible');
            }
        }
        
        // Hide empty state if we have sections
        const emptyState = document.getElementById('empty-state');
        if (emptyState && this.renderedSections.size > 0) {
            if (emptyState.style.display !== 'none') {
                emptyState.style.display = 'none';
                this.logger.info('🚫 PHASE 3: Hidden empty state for sections');
            }
        }
    }
    
    /**
     * ROOT FIX: Check if we should show empty state
     * IMPORTANT: Empty sections are valid content - we show them with placeholders
     */
    checkForEmptyState() {
        // Check if we have any components or sections
        const state = window.enhancedStateManager?.getState();
        const hasComponents = state && state.components && Object.keys(state.components).length > 0;
        const hasSections = state && state.sections && state.sections.length > 0;
        
        const savedComponentsContainer = document.getElementById('saved-components-container');
        const sectionsContainer = document.getElementById('gmkb-sections-container');
        const emptyState = document.getElementById('empty-state');
        
        if (!hasComponents && !hasSections) {
            // No components AND no sections - show empty state
            if (savedComponentsContainer) {
                savedComponentsContainer.style.display = 'none';
            }
            if (sectionsContainer) {
                sectionsContainer.style.display = 'none';
            }
            if (emptyState) {
                emptyState.style.display = 'block';
            }
            this.logger.info('📭 PHASE 3: No components or sections - showing empty state');
        } else {
            // We have sections (even if empty) or components - show containers
            this.ensureContainersVisible();
            
            // If we only have empty sections, make sure they're visible with placeholders
            if (hasSections && !hasComponents) {
                this.logger.info('🎯 PHASE 3: Showing empty sections with placeholders');
                // Re-render sections to ensure placeholders are shown
                this.renderExistingSections();
            }
        }
    }
    
    /**
     * Handle all sections removed event
     * Following checklist: Event-Driven, State Management
     */
    onAllSectionsRemoved(detail) {
        this.logger.info('📭 PHASE 3: All sections removed - checking empty state');
        
        // Clear rendered sections tracking
        this.renderedSections.clear();
        
        // Clear sections container
        if (this.containerElement) {
            this.containerElement.innerHTML = '';
        }
        
        // Check for empty state
        this.checkForEmptyState();
    }
    
    /**
     * Debug method - get current state
     * Following checklist: Diagnostic Logging
     */
    getDebugInfo() {
        return {
            containerElement: this.containerElement?.id || 'none',
            renderedSections: Array.from(this.renderedSections),
            renderedSectionCount: this.renderedSections.size,
            domSectionCount: document.querySelectorAll('.gmkb-section').length,
            sectionLayoutManagerAvailable: !!this.sectionLayoutManager,
            componentRendererAvailable: !!this.componentRenderer,
            containerVisible: this.containerElement ? this.containerElement.style.display !== 'none' : false,
            savedComponentsContainerVisible: document.getElementById('saved-components-container')?.style.display !== 'none'
        };
    }
}

// Global class exposure
window.SectionRenderer = SectionRenderer;
console.log('✅ SectionRenderer class exposed globally');

// ROOT FIX: Create instance immediately
// The WordPress enqueue system ensures dependencies are loaded in order
// SectionLayoutManager is already created when this script runs
if (!window.sectionRenderer) {
    window.sectionRenderer = new SectionRenderer();
    console.log('✅ PHASE 3: SectionRenderer instance created');
    
    // Dispatch ready event for other systems
    document.dispatchEvent(new CustomEvent('gmkb:section-renderer-ready', {
        detail: { sectionRenderer: window.sectionRenderer }
    }));
}

// Export for use in modules
if (typeof module !== 'undefined' && module.exports) {
    module.exports = SectionRenderer;
}
