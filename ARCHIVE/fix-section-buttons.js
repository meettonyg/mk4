/**
 * Quick Fix for Section Button Functionality
 * ROOT CAUSE: Sections created but not rendering visually
 * 
 * This script ensures layout buttons work properly
 */

(function() {
    'use strict';
    
    const logger = window.StructuredLogger || console;
    
    logger.info('🔧 Section Button Fix: Initializing...');
    
    // Function to ensure section renderer exists and is ready
    function ensureSectionRenderer() {
        if (!window.sectionRenderer && window.SectionRenderer) {
            window.sectionRenderer = new window.SectionRenderer();
            logger.info('✅ Created Section Renderer instance');
        }
        return window.sectionRenderer;
    }
    
    // Function to ensure section layout manager exists
    function ensureSectionLayoutManager() {
        if (!window.sectionLayoutManager && window.SectionLayoutManager) {
            window.sectionLayoutManager = new window.SectionLayoutManager();
            logger.info('✅ Created Section Layout Manager instance');
        }
        return window.sectionLayoutManager;
    }
    
    // Function to handle layout button clicks
    function handleLayoutButtonClick(event) {
        const layoutOption = event.target.closest('.layout-option');
        if (!layoutOption) return;
        
        // Remove active class from all options
        document.querySelectorAll('.layout-option').forEach(opt => {
            opt.classList.remove('layout-option--active');
        });
        
        // Add active class to clicked option
        layoutOption.classList.add('layout-option--active');
        
        const layoutType = layoutOption.dataset.layout;
        logger.info(`✅ Selected layout: ${layoutType}`);
        
        // Store selected layout
        window.selectedSectionLayout = mapLayoutNameToType(layoutType);
    }
    
    // Function to map layout names
    function mapLayoutNameToType(layoutName) {
        const mapping = {
            'full-width': 'full_width',
            'two-column': 'two_column',
            'sidebar': 'main_sidebar',
            'three-column': 'three_column'
        };
        return mapping[layoutName] || 'full_width';
    }
    
    // Function to handle Add Section button
    function handleAddSectionClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        logger.info('🛠️ Add Section button clicked');
        
        // Ensure systems are ready
        const sectionLayoutManager = ensureSectionLayoutManager();
        const sectionRenderer = ensureSectionRenderer();
        
        if (!sectionLayoutManager) {
            logger.error('❌ Section Layout Manager not available');
            return;
        }
        
        // Get selected layout or default
        const selectedLayout = window.selectedSectionLayout || 'full_width';
        const sectionId = `section_${Date.now()}`;
        
        logger.info(`📦 Creating section: ${sectionId} with layout: ${selectedLayout}`);
        
        // Create the section
        const section = sectionLayoutManager.registerSection(sectionId, selectedLayout);
        
        if (section) {
            logger.info(`✅ Section registered: ${sectionId}`);
            
            // Ensure containers are visible
            ensureContainersVisible();
            
            // Force render the section
            if (sectionRenderer) {
                // Ensure container exists
                if (!sectionRenderer.containerElement) {
                    sectionRenderer.containerElement = findOrCreateSectionsContainer();
                }
                
                // Render the section
                setTimeout(() => {
                    sectionRenderer.renderSection(section);
                    logger.info(`✅ Section rendered: ${sectionId}`);
                    
                    // Scroll to new section
                    const sectionElement = document.getElementById(`section-${sectionId}`);
                    if (sectionElement) {
                        sectionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
                    }
                }, 100);
            }
        } else {
            logger.error(`❌ Failed to create section`);
        }
    }
    
    // Function to handle Duplicate button
    function handleDuplicateClick(event) {
        event.preventDefault();
        event.stopPropagation();
        
        logger.info('📋 Duplicate button clicked');
        
        const sectionLayoutManager = ensureSectionLayoutManager();
        if (!sectionLayoutManager) return;
        
        const sections = sectionLayoutManager.getSectionsInOrder();
        if (sections.length === 0) {
            logger.warn('⚠️ No sections to duplicate');
            return;
        }
        
        const lastSection = sections[sections.length - 1];
        const newSectionId = `section_${Date.now()}`;
        
        const duplicatedSection = sectionLayoutManager.registerSection(
            newSectionId,
            lastSection.section_type,
            {
                layout: { ...lastSection.layout },
                section_options: { ...lastSection.section_options }
            }
        );
        
        if (duplicatedSection) {
            logger.info(`✅ Duplicated section: ${newSectionId}`);
            
            // Render the duplicated section
            const sectionRenderer = ensureSectionRenderer();
            if (sectionRenderer) {
                setTimeout(() => {
                    sectionRenderer.renderSection(duplicatedSection);
                }, 100);
            }
        }
    }
    
    // Function to find or create sections container
    function findOrCreateSectionsContainer() {
        let container = document.getElementById('gmkb-sections-container');
        
        if (!container) {
            const savedComponentsContainer = document.getElementById('saved-components-container');
            const mediaKitPreview = document.getElementById('media-kit-preview');
            const parent = savedComponentsContainer || mediaKitPreview;
            
            if (parent) {
                container = document.createElement('div');
                container.id = 'gmkb-sections-container';
                container.className = 'gmkb-sections-container';
                parent.insertBefore(container, parent.firstChild);
                logger.info('✅ Created sections container');
            }
        }
        
        return container;
    }
    
    // Function to ensure containers are visible
    function ensureContainersVisible() {
        const containers = [
            'saved-components-container',
            'gmkb-sections-container',
            'media-kit-preview'
        ];
        
        containers.forEach(id => {
            const element = document.getElementById(id);
            if (element && element.style.display === 'none') {
                element.style.display = 'block';
                logger.info(`✅ Made ${id} visible`);
            }
        });
        
        // Hide empty state
        const emptyState = document.getElementById('empty-state');
        if (emptyState && emptyState.style.display !== 'none') {
            emptyState.style.display = 'none';
            logger.info('✅ Hidden empty state');
        }
    }
    
    // Initialize event listeners
    function initializeEventListeners() {
        // Layout option clicks
        document.addEventListener('click', (e) => {
            if (e.target.closest('.layout-option')) {
                handleLayoutButtonClick(e);
            }
        });
        
        // Add Section button
        const addSectionBtn = document.getElementById('add-section-btn');
        if (addSectionBtn) {
            addSectionBtn.removeEventListener('click', handleAddSectionClick);
            addSectionBtn.addEventListener('click', handleAddSectionClick);
            logger.info('✅ Add Section button listener attached');
        }
        
        // Duplicate button
        const duplicateBtn = document.getElementById('duplicate-section-btn');
        if (duplicateBtn) {
            duplicateBtn.removeEventListener('click', handleDuplicateClick);
            duplicateBtn.addEventListener('click', handleDuplicateClick);
            logger.info('✅ Duplicate button listener attached');
        }
    }
    
    // Initialize when DOM is ready
    function initialize() {
        logger.info('🚀 Initializing section button fix...');
        
        // Ensure systems exist
        ensureSectionLayoutManager();
        ensureSectionRenderer();
        
        // Setup event listeners
        initializeEventListeners();
        
        // Set default layout selection
        const activeLayout = document.querySelector('.layout-option--active');
        if (activeLayout) {
            window.selectedSectionLayout = mapLayoutNameToType(activeLayout.dataset.layout);
        }
        
        logger.info('✅ Section button fix initialized');
    }
    
    // Start initialization
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initialize);
    } else {
        initialize();
    }
    
    // Also provide manual fix function
    window.fixSectionButtons = function() {
        logger.info('🔧 Manual section button fix triggered');
        initialize();
        
        // Force create instances if needed
        ensureSectionLayoutManager();
        ensureSectionRenderer();
        
        logger.info('✅ Section buttons should now work');
    };
    
    // Debug function
    window.debugSectionButtons = function() {
        console.log('=== SECTION BUTTON DEBUG ===');
        console.log('SectionLayoutManager:', !!window.sectionLayoutManager);
        console.log('SectionRenderer:', !!window.sectionRenderer);
        console.log('Add button:', !!document.getElementById('add-section-btn'));
        console.log('Duplicate button:', !!document.getElementById('duplicate-section-btn'));
        console.log('Selected layout:', window.selectedSectionLayout);
        console.log('Layout options:', document.querySelectorAll('.layout-option').length);
        
        if (window.sectionLayoutManager) {
            const sections = window.sectionLayoutManager.getSectionsInOrder();
            console.log('Sections in state:', sections.length);
        }
    };
    
})();
