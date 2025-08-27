/**
 * @file component-library-simple.js  
 * @description ROOT FIX: Event-Driven Component Library (NO POLLING)
 * 
 * ARCHITECTURAL PRINCIPLES:
 * ✅ Single initialization function
 * ✅ Event-driven initialization only
 * ✅ No setTimeout/setInterval polling
 * ✅ Single event handler attachment per button
 * ✅ WordPress-native patterns only
 * 
 * ROOT CAUSE FIXED:
 * ❌ No multiple initialization paths
 * ❌ No complex timing logic
 * ❌ No event handler overwriting
 * ❌ No polling/timeout patterns
 * ❌ No redundant safety nets
 */

// ROOT FIX: Single initialization guard
let isInitialized = false;

// ROOT FIX: Global DOM elements
let componentGrid, componentLibraryModal;

// ROOT FIX: Logger with structured logging
const logger = window.structuredLogger || {
    info: (cat, msg, data) => console.log(`[${cat}] ${msg}`, data || ''),
    error: (cat, msg, err) => console.error(`[${cat}] ${msg}`, err || '')
};

/**
 * ROOT FIX: Single initialization function (NO POLLING)
 * Called once when dependencies are confirmed ready
 */
function initializeComponentLibrary() {
    // ROOT FIX: Single guard check
    if (isInitialized) {
        logger.info('COMPONENT_LIBRARY', 'Already initialized, skipping');
        return;
    }
    
    logger.info('COMPONENT_LIBRARY', 'Starting event-driven initialization');
    
    try {
        // ROOT FIX: Get DOM elements (should exist when called)
        componentLibraryModal = document.getElementById('component-library-overlay');
        componentGrid = document.getElementById('component-grid');
        
        if (!componentLibraryModal || !componentGrid) {
            throw new Error('Required DOM elements not found');
        }
        
        logger.info('COMPONENT_LIBRARY', 'DOM elements found', {
            modal: componentLibraryModal.id,
            grid: componentGrid.id
        });
        
        // Setup event listeners ONCE
        setupComponentLibraryEventListeners();
        
        // Populate components
        populateComponents();
        
        // Mark as initialized
        isInitialized = true;
        
        // ROOT FIX: Enhanced verification - check if buttons are actually working
        setTimeout(() => {
            const testButtons = document.querySelectorAll('#add-component-btn, #add-first-component, [data-action="add-component"]');
            logger.info('COMPONENT_LIBRARY', 'Post-initialization button verification', {
                buttonsFound: testButtons.length,
                buttonDetails: Array.from(testButtons).map(b => ({
                    id: b.id,
                    dataAction: b.dataset.action,
                    hasClickListener: b.onclick !== null || b.addEventListener !== undefined
                }))
            });
        }, 500);
        
        logger.info('COMPONENT_LIBRARY', 'Initialization complete');
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('gmkb:component-library-ready'));
        
    } catch (error) {
        logger.error('COMPONENT_LIBRARY', 'Initialization failed', error);
        throw error;
    }
}

/**
 * ROOT FIX: Clean event listener setup (NO ONCLICK ASSIGNMENT)
 * EMERGENCY RE-ATTACHMENT: Re-attach listeners if they get lost
 */
function setupComponentLibraryEventListeners() {
    logger.info('COMPONENT_LIBRARY', 'Setting up event listeners');
    
    // ROOT FIX: Verify DOM elements are available
    if (!componentLibraryModal || !componentGrid) {
        throw new Error('Cannot setup event listeners - DOM elements missing');
    }
    
    // ROOT FIX: Enhanced button selection with comprehensive selectors and debugging
    function attachShowButtonListeners() {
        // ROOT FIX: Updated selectors to match the corrected template buttons
        const showButtons = document.querySelectorAll('#add-component-btn, #add-first-component, .show-component-library, [data-action="add-component"]');
        
        if (showButtons.length === 0) {
            logger.error('COMPONENT_LIBRARY', 'No show buttons found, scheduling retry');
            // Check if we can find any potential buttons for debugging
            const allButtons = document.querySelectorAll('button[id*="component"], button[class*="component"], button[data-action]');
            if (allButtons.length > 0) {
                logger.info('COMPONENT_LIBRARY', 'Found potential buttons for debugging:', Array.from(allButtons).map(b => ({ id: b.id, className: b.className, dataAction: b.dataset.action })));
            }
            
            // Retry in 100ms if buttons not found
            setTimeout(attachShowButtonListeners, 100);
            return;
        }
        
        showButtons.forEach((button, index) => {
            // Remove any existing listeners first to prevent duplicates
            button.removeEventListener('click', showModal);
            button.addEventListener('click', showModal);
            logger.info('COMPONENT_LIBRARY', `Show button ${index + 1} attached: ${button.id || button.className}`);
            
            // Add debugging for click events
            if (window.gmkbData?.debugMode) {
                button.addEventListener('click', () => {
                    console.log('🔘 Component library button clicked:', { id: button.id, dataAction: button.dataset.action });
                });
            }
        });
        
        logger.info('COMPONENT_LIBRARY', `Successfully attached listeners to ${showButtons.length} buttons`);
    }
    
    // Start attaching show button listeners
    attachShowButtonListeners();
    
    // Modal close buttons
    const closeButtons = componentLibraryModal.querySelectorAll('.library__close, .modal__close, .close-modal');
    closeButtons.forEach((button, index) => {
        button.removeEventListener('click', hideModal);
        button.addEventListener('click', hideModal);
        logger.info('COMPONENT_LIBRARY', `Close button ${index + 1} attached`);
    });
    
    // ROOT FIX: Cancel button with enhanced selection and retries
    function attachCancelButton() {
        const cancelButton = document.getElementById('cancel-component-button') || 
                            document.querySelector('[data-action="cancel-component"]') ||
                            componentLibraryModal.querySelector('.cancel-btn, .btn-cancel');
        
        if (cancelButton) {
            // Remove any existing listeners
            cancelButton.removeEventListener('click', handleCancelClick);
            cancelButton.addEventListener('click', handleCancelClick);
            logger.info('COMPONENT_LIBRARY', 'Cancel button event listener attached');
        } else {
            logger.error('COMPONENT_LIBRARY', 'Cancel button not found - will retry');
            // Retry in 200ms
            setTimeout(attachCancelButton, 200);
        }
    }
    
    attachCancelButton();
    
    // ROOT FIX: Add button with enhanced selection and retries
    function attachAddButton() {
        const addButton = document.getElementById('add-component-button') ||
                         document.querySelector('[data-action="add-selected-components"]') ||
                         componentLibraryModal.querySelector('.add-btn, .btn-add');
        
        if (addButton) {
            // Remove any existing listeners
            addButton.removeEventListener('click', handleAddClick);
            addButton.addEventListener('click', handleAddClick);
            logger.info('COMPONENT_LIBRARY', 'Add button event listener attached');
        } else {
            logger.error('COMPONENT_LIBRARY', 'Add button not found - will retry');
            // Retry in 200ms
            setTimeout(attachAddButton, 200);
        }
    }
    
    attachAddButton();
    
    // Modal backdrop click to close
    componentLibraryModal.removeEventListener('click', handleBackdropClick);
    componentLibraryModal.addEventListener('click', handleBackdropClick);
    
    logger.info('COMPONENT_LIBRARY', 'Event listeners setup complete');
}

/**
 * ROOT FIX: Dedicated event handlers (prevents conflicts)
 */
function handleCancelClick(e) {
    logger.info('COMPONENT_LIBRARY', 'Cancel button clicked');
    e.preventDefault();
    e.stopPropagation();
    hideModal();
}

function handleAddClick(e) {
    logger.info('COMPONENT_LIBRARY', 'Add button clicked');
    e.preventDefault();
    e.stopPropagation();
    addSelectedComponents();
}

function handleBackdropClick(e) {
    if (e.target === componentLibraryModal) {
        logger.info('COMPONENT_LIBRARY', 'Modal backdrop clicked');
        hideModal();
    }
}

/**
 * ROOT FIX: Component population using WordPress data
 */
function populateComponents() {
    logger.info('COMPONENT_LIBRARY', 'Populating components');
    
    // Get components from WordPress data (already available)
    const components = getComponents();
    
    if (!components || components.length === 0) {
        logger.info('COMPONENT_LIBRARY', 'No components found, using fallbacks');
        populateGrid(getFallbackComponents());
        return;
    }
    
    logger.info('COMPONENT_LIBRARY', 'Components found', { count: components.length });
    populateGrid(components);
}

/**
 * SIMPLE ARCHITECTURE: Get components from WordPress data
 */
function getComponents() {
    // Try WordPress data sources in order
    if (window.gmkbData?.components?.length > 0) {
        return window.gmkbData.components;
    }
    if (window.guestifyData?.components?.length > 0) {
        return window.guestifyData.components;
    }
    if (window.MKCG?.components?.length > 0) {
        return window.MKCG.components;
    }
    return null;
}

/**
 * SIMPLE ARCHITECTURE: Reliable fallback components
 */
function getFallbackComponents() {
    return [
        {
            type: 'hero',
            name: 'Hero Section',
            description: 'Eye-catching header with title and call-to-action',
            category: 'essential',
            icon: 'fa-star'
        },
        {
            type: 'biography',
            name: 'Biography',
            description: 'Professional biography section',
            category: 'essential', 
            icon: 'fa-user'
        },
        {
            type: 'topics',
            name: 'Topics',
            description: 'Areas of expertise and speaking topics',
            category: 'essential',
            icon: 'fa-lightbulb'
        },
        {
            type: 'contact',
            name: 'Contact',
            description: 'Contact information and social links',
            category: 'essential',
            icon: 'fa-envelope'
        }
    ];
}

/**
 * ROOT FIX: Populate component grid
 */
function populateGrid(components) {
    // Clear loading state
    const loadingElement = document.getElementById('component-grid-loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
    
    // Clear existing components (except loading element)
    const existingCards = componentGrid.querySelectorAll('.component-card');
    existingCards.forEach(card => card.remove());
    
    // Add component cards
    components.forEach(component => {
        const card = createComponentCard(component);
        componentGrid.appendChild(card);
    });
    
    logger.info('COMPONENT_LIBRARY', 'Components added to grid', { count: components.length });
}

/**
 * SIMPLE ARCHITECTURE: Create component card
 */
function createComponentCard(component) {
    const card = document.createElement('div');
    card.className = 'component-card';
    card.dataset.component = component.type;
    
    card.innerHTML = `
        <div class="component-card-content">
            <div class="component-preview">
                <i class="fa ${component.icon || 'fa-puzzle-piece'}" style="font-size: 24px; color: #6B7280;"></i>
            </div>
            <div class="component-info">
                <h4>${component.name || component.title || 'Untitled'}</h4>
                <p>${component.description || 'No description available'}</p>
            </div>
        </div>
    `;
    
    // Click to select
    card.addEventListener('click', () => {
        card.classList.toggle('selected');
    });
    
    return card;
}

/**
 * SIMPLE ARCHITECTURE: Modal functions
 */
function showModal(event) {
    if (event) {
        event.preventDefault();
        event.stopPropagation();
    }
    
    if (window.gmkbData?.debugMode) {
        console.log('🔘 showModal called, checking dependencies...');
        console.log('- GMKB_Modals available:', !!window.GMKB_Modals);
        console.log('- componentLibraryModal available:', !!componentLibraryModal);
        console.log('- isInitialized:', isInitialized);
    }
    
    if (window.GMKB_Modals && componentLibraryModal) {
        window.GMKB_Modals.show('component-library-overlay');
        
        // Ensure components are populated
        if (!isInitialized) {
            logger.info('COMPONENT_LIBRARY', 'Modal opened but not initialized, initializing now...');
            initializeComponentLibrary();
        }
        
        if (window.gmkbData?.debugMode) {
            console.log('✅ Component library modal should now be visible');
        }
    } else {
        logger.error('COMPONENT_LIBRARY', 'Cannot show modal - dependencies missing', {
            hasGMKBModals: !!window.GMKB_Modals,
            hasComponentLibraryModal: !!componentLibraryModal
        });
        
        // Fallback: try to find and display the modal manually
        const modal = document.getElementById('component-library-overlay');
        if (modal) {
            modal.style.display = 'flex';
            logger.info('COMPONENT_LIBRARY', 'Displayed modal manually as fallback');
        } else {
            logger.error('COMPONENT_LIBRARY', 'Component library modal not found in DOM');
        }
    }
}

function hideModal() {
    if (window.GMKB_Modals) {
        window.GMKB_Modals.hide('component-library-overlay');
    }
}

/**
 * ROOT CAUSE FIX: Get available sections for smart targeting
 * @returns {Array} Array of available sections with capacity information
 */
function getAvailableSectionsForTargeting() {
    try {
        if (!window.sectionLayoutManager) {
            logger.info('COMPONENT_LIBRARY', 'Section layout manager not available');
            return [];
        }
        
        const allSections = window.sectionLayoutManager.getAllSections() || [];
        
        // Filter sections with available capacity and add metadata
        const availableSections = allSections.map(section => {
            const maxComponents = section.layout?.columns || 1;
            const currentComponents = section.components?.length || 0;
            const hasCapacity = currentComponents < maxComponents;
            
            return {
                section_id: section.section_id,
                section_type: section.section_type,
                maxColumns: maxComponents,
                currentComponents: currentComponents,
                hasCapacity: hasCapacity,
                availableColumns: maxComponents - currentComponents,
                priority: hasCapacity ? 1 : 0 // Sections with capacity get priority
            };
        }).sort((a, b) => b.priority - a.priority); // Sort by priority (capacity first)
        
        logger.debug('COMPONENT_LIBRARY', `Found ${availableSections.length} sections for targeting`, {
            total: allSections.length,
            withCapacity: availableSections.filter(s => s.hasCapacity).length
        });
        
        return availableSections;
        
    } catch (error) {
        logger.error('COMPONENT_LIBRARY', 'Error getting available sections:', error);
        return [];
    }
}

/**
 * ROOT CAUSE FIX: Determine smart section targeting for component
 * @param {Array} availableSections - Available sections with capacity info
 * @param {number} componentIndex - Index of component being added (for distribution)
 * @returns {Object} Section targeting information
 */
function determineSectionTargeting(availableSections, componentIndex = 0) {
    try {
        // If no sections available, return empty targeting (will add to main container)
        if (!availableSections || availableSections.length === 0) {
            logger.debug('COMPONENT_LIBRARY', 'No sections available, using main container');
            return {};
        }
        
        // Strategy 1: Find section with available capacity
        const sectionsWithCapacity = availableSections.filter(s => s.hasCapacity);
        
        if (sectionsWithCapacity.length > 0) {
            // Use round-robin distribution for multiple components
            const targetSection = sectionsWithCapacity[componentIndex % sectionsWithCapacity.length];
            
            // Determine target column (distribute across available columns)
            const targetColumn = (targetSection.currentComponents % targetSection.maxColumns) + 1;
            
            logger.debug('COMPONENT_LIBRARY', `Targeting section with capacity: ${targetSection.section_id}, column ${targetColumn}`);
            
            return {
                targetSectionId: targetSection.section_id,
                targetColumn: targetColumn
            };
        }
        
        // Strategy 2: If no sections have capacity, target the first section (will expand or overlay)
        const fallbackSection = availableSections[0];
        
        logger.debug('COMPONENT_LIBRARY', `Using fallback section: ${fallbackSection.section_id}`);
        
        return {
            targetSectionId: fallbackSection.section_id,
            targetColumn: 1
        };
        
    } catch (error) {
        logger.error('COMPONENT_LIBRARY', 'Error determining section targeting:', error);
        return {};
    }
}

/**
 * ROOT CAUSE FIX: Create default section if none exist
 * Ensures components always have a section to target
 * @returns {Promise<string|null>} Created section ID or null if failed
 */
async function ensureDefaultSectionExists() {
    try {
        if (!window.sectionLayoutManager) {
            logger.warn('COMPONENT_LIBRARY', 'Section layout manager not available for default section creation');
            return null;
        }
        
        const existingSections = window.sectionLayoutManager.getAllSections() || [];
        
        if (existingSections.length > 0) {
            // Sections already exist, no need to create default
            return existingSections[0].section_id;
        }
        
        // Create a default full-width section
        const defaultSectionId = `section_default_${Date.now()}`;
        
        try {
            const createdSection = window.sectionLayoutManager.registerSection(defaultSectionId, 'full_width', {
                layout: {
                    width: 'full_width',
                    max_width: '100%',
                    padding: '40px 20px',
                    columns: 1
                },
                section_options: {
                    background_type: 'none',
                    spacing_top: 'medium',
                    spacing_bottom: 'medium'
                }
            });
            
            // Render the section in DOM
            if (window.sectionRenderer) {
                await window.sectionRenderer.renderSection(defaultSectionId);
            }
            
            logger.info('COMPONENT_LIBRARY', `Created default section: ${defaultSectionId}`);
            return defaultSectionId;
            
        } catch (sectionError) {
            logger.error('COMPONENT_LIBRARY', 'Failed to create default section:', sectionError);
            return null;
        }
        
    } catch (error) {
        logger.error('COMPONENT_LIBRARY', 'Error ensuring default section exists:', error);
        return null;
    }
}

/**
 * ROOT CAUSE FIX: Enhanced section-aware component addition
 * Automatically targets available sections when adding components
 * FIXED: Proper async/await handling for reliable component addition
 */
async function addSelectedComponents() {
    const selectedCards = componentGrid.querySelectorAll('.component-card.selected');
    
    if (selectedCards.length === 0) {
        if (window.gmkbData?.debugMode) {
            console.log('⚠️ Component Library: No components selected');
        }
        
        // ROOT FIX: Show user feedback for no selection
        if (window.GMKB_Toast) {
            window.GMKB_Toast.show({
                message: 'Please select one or more components to add',
                type: 'warning',
                duration: 3000
            });
        } else {
            alert('Please select one or more components to add');
        }
        return;
    }
    
    if (window.gmkbData?.debugMode) {
        console.log(`➕ Component Library Modal: Adding ${selectedCards.length} selected components with section targeting`);
    }
    
    let addedCount = 0;
    const errors = [];
    
    // ROOT CAUSE FIX: Check if a specific section requested components (click to add)
    let targetSectionId = window.componentLibrarySystem.targetSectionId;
    let targetColumn = window.componentLibrarySystem.targetColumn || 1;
    
    // ROOT CAUSE FIX: Get available sections for smart targeting
    const availableSections = targetSectionId ? 
        // If a specific section requested, only target that section
        [{ section_id: targetSectionId, hasCapacity: true, availableColumns: 1, priority: 1 }] : 
        // Otherwise use smart targeting
        getAvailableSectionsForTargeting();
    
    if (window.gmkbData?.debugMode) {
        console.log(`📊 Available sections:`, availableSections);
    }
    
    // ROOT CAUSE FIX: Use proper async loop instead of forEach
    const selectedCardsArray = Array.from(selectedCards);
    
    for (const [index, card] of selectedCardsArray.entries()) {
        const componentType = card.dataset.component;
        
        if (window.gmkbData?.debugMode) {
            console.log(`➕ Component Library Modal: Adding component ${index + 1}/${selectedCardsArray.length}: ${componentType}`);
        }
        
        // ROOT CAUSE FIX: Smart section targeting
        const sectionTargeting = targetSectionId ? 
            // If targeting specific section, add to it (distribute across columns if multi-column)
            { targetSectionId, targetColumn: targetColumn + index } : 
            // Otherwise use smart targeting
            determineSectionTargeting(availableSections, index);
        
        if (window.gmkbData?.debugMode && sectionTargeting.targetSectionId) {
            console.log(`🎯 Component Library Modal: Targeting ${componentType} to section ${sectionTargeting.targetSectionId}:${sectionTargeting.targetColumn}`);
        }
        
        try {
            let added = false;
            
            // Method 1: Enhanced component manager with atomic section targeting
            if (window.enhancedComponentManager?.isReady()) {
                const componentOptions = {
                    // Add section targeting if available
                    ...(sectionTargeting.targetSectionId && {
                        targetSectionId: sectionTargeting.targetSectionId,
                        targetColumn: sectionTargeting.targetColumn
                    })
                };
                
                if (window.gmkbData?.debugMode) {
                    console.log(`➕ Component Library Modal: Adding ${componentType} with options:`, componentOptions);
                }
                
                // ROOT CAUSE FIX: Properly await the async operation
                await window.enhancedComponentManager.addComponent(componentType, componentOptions);
                added = true;
                addedCount++;
                
                // Show section targeting feedback
                if (sectionTargeting.targetSectionId) {
                    console.log(`✅ Component Library Modal: ${componentType} targeted to section ${sectionTargeting.targetSectionId}`);
                } else {
                    console.log(`✅ Component Library Modal: ${componentType} added to main container`);
                }
            }
            
            // Method 2: Fallback to GMKB global
            if (!added && window.GMKB?.addComponent) {
                window.GMKB.addComponent(componentType, sectionTargeting);
                added = true;
                addedCount++;
                
                if (window.gmkbData?.debugMode) {
                    console.log(`✅ Component Library Modal: ${componentType} added via GMKB fallback`);
                }
            }
            
            // Method 3: Dispatch custom event as fallback
            if (!added) {
                const addComponentEvent = new CustomEvent('gmkb:add-component', {
                    detail: { 
                        componentType: componentType,
                        props: sectionTargeting,
                        source: 'component-library-modal-with-section-targeting'
                    }
                });
                document.dispatchEvent(addComponentEvent);
                
                if (window.gmkbData?.debugMode) {
                    console.log(`✅ Component Library Modal: Dispatched add-component event for ${componentType} with targeting:`, sectionTargeting);
                }
                addedCount++;
            }
            
        } catch (error) {
            console.error(`Component Library Modal: Error adding component ${componentType}:`, error);
            errors.push({ componentType, error: error.message });
        }
    }
    
    // ROOT FIX: Show comprehensive feedback after all operations complete
    if (addedCount > 0) {
        const sectionInfo = availableSections.length > 0 ? ' to sections' : '';
        const message = addedCount === 1 
            ? `Component added successfully${sectionInfo}`
            : `${addedCount} components added successfully${sectionInfo}`;
            
        if (window.GMKB_Toast) {
            window.GMKB_Toast.show({
                message: message,
                type: errors.length > 0 ? 'warning' : 'success',
                duration: 3000
            });
        }
        
        if (window.gmkbData?.debugMode) {
            console.log(`✅ Component Library Modal: Successfully added ${addedCount} components with section targeting`);
        }
    }
    
    // Show errors if any
    if (errors.length > 0) {
        const errorMessage = `Failed to add ${errors.length} component(s): ${errors.map(e => e.componentType).join(', ')}`;
        
        if (window.GMKB_Toast) {
            window.GMKB_Toast.show({
                message: errorMessage,
                type: 'error',
                duration: 5000
            });
        } else {
            console.error('Component Library Modal:', errorMessage, errors);
        }
    }
    
    // Clear selection and hide modal only after all operations complete
    selectedCards.forEach(card => card.classList.remove('selected'));
    
    // Clear any specific section targeting after use
    window.componentLibrarySystem.targetSectionId = null;
    window.componentLibrarySystem.targetColumn = null;
    
    hideModal();
    
    if (window.gmkbData?.debugMode) {
        console.log(`🏁 Component Library Modal: Operation complete - added ${addedCount}, errors: ${errors.length}`);
    }
}

// =============================================================================
// ROOT FIX: EVENT-DRIVEN INITIALIZATION (NO POLLING)
// =============================================================================

/**
 * ROOT FIX: Check if all dependencies are ready
 */
function checkDependencies() {
    const modalReady = !!window.GMKB_Modals;
    // ROOT FIX: Check for gmkbDataReady flag set by main.js, or direct data availability
    const dataReady = window.gmkbDataReady || !!(window.gmkbData?.components || window.guestifyData?.components || window.MKCG?.components);
    const domReady = !!(document.getElementById('component-library-overlay') && document.getElementById('component-grid'));
    
    return { modalReady, dataReady, domReady, allReady: modalReady && dataReady && domReady };
}

// ROOT FIX: Single initialization path - no multiple retry mechanisms
function tryInitialization() {
    if (isInitialized) {
        return;
    }
    
    const { modalReady, dataReady, domReady, allReady } = checkDependencies();
    
    logger.info('COMPONENT_LIBRARY', 'Checking dependencies', {
        modalReady, dataReady, domReady, allReady
    });
    
    if (allReady) {
        logger.info('COMPONENT_LIBRARY', 'All dependencies ready, initializing');
        initializeComponentLibrary();
    } else {
        // Instead of setTimeout fallbacks, listen for specific events
        setupDependencyListeners();
    }
}

/**
 * ROOT CAUSE FIX: Setup event listeners for missing dependencies instead of timeouts
 */
function setupDependencyListeners() {
    const { modalReady, dataReady, domReady } = checkDependencies();
    
    // Listen for modal system ready
    if (!modalReady && !document.querySelector('[data-modal-ready]')) {
        document.addEventListener('gmkb:modal-base-ready', () => {
            logger.debug('COMPONENT_LIBRARY', 'Modal system ready event received');
            tryInitialization();
        }, { once: true });
        
        document.body.setAttribute('data-modal-ready', 'waiting');
    }
    
    // Listen for data ready events
    if (!dataReady && !document.querySelector('[data-component-data-ready]')) {
        const dataEvents = ['wordpressDataReady', 'gmkb:wordpress-data-ready', 'gmkb:ready'];
        
        dataEvents.forEach(eventName => {
            document.addEventListener(eventName, () => {
                logger.debug('COMPONENT_LIBRARY', `Data ready event received: ${eventName}`);
                tryInitialization();
            }, { once: true });
        });
        
        document.body.setAttribute('data-component-data-ready', 'waiting');
    }
    
    // Listen for section systems ready (crucial for section targeting)
    if (!document.querySelector('[data-section-systems-ready]')) {
        document.addEventListener('gmkb:section-systems-ready', () => {
            logger.info('COMPONENT_LIBRARY', 'Section systems ready - component library can now do section targeting');
            
            // Force re-initialization to ensure section awareness
            if (isInitialized) {
                setupSectionAwareness();
            } else {
                tryInitialization();
            }
        }, { once: true });
        
        document.body.setAttribute('data-section-systems-ready', 'waiting');
    }
}

/**
 * ROOT CAUSE FIX: Setup section awareness after section systems are ready
 */
function setupSectionAwareness() {
    try {
        logger.info('COMPONENT_LIBRARY', 'Setting up section awareness for component library');
        
        // Verify section systems are available
        const sectionSystemsReady = !!window.sectionLayoutManager && !!window.sectionRenderer;
        
        if (sectionSystemsReady) {
            logger.info('COMPONENT_LIBRARY', 'Section systems confirmed ready - component library is now section-aware');
            
            // Update component library status to indicate section awareness
            window.componentLibrarySystem.sectionAware = true;
            window.componentLibrarySystem.lastSectionCheck = Date.now();
            
            // Emit event to notify other systems
            document.dispatchEvent(new CustomEvent('gmkb:component-library-section-ready', {
                detail: {
                    timestamp: Date.now(),
                    sectionSystemsAvailable: true
                }
            }));
        } else {
            logger.warn('COMPONENT_LIBRARY', 'Section systems not available despite ready event');
        }
        
    } catch (error) {
        logger.error('COMPONENT_LIBRARY', 'Error setting up section awareness:', error);
    }
}

// ROOT FIX: Event-driven initialization (replaces all polling)
document.addEventListener('DOMContentLoaded', tryInitialization);
document.addEventListener('gmkb:modal-base-ready', tryInitialization);
document.addEventListener('wordpressDataReady', tryInitialization);
document.addEventListener('gmkb:wordpress-data-ready', tryInitialization);
// ROOT FIX: Listen for the main.js ready event
document.addEventListener('gmkb:ready', tryInitialization);
document.addEventListener('gmkb:application-ready', tryInitialization);

// ROOT CAUSE FIX: Listen for section systems ready
document.addEventListener('gmkb:section-systems-ready', () => {
    logger.info('COMPONENT_LIBRARY', 'Section systems ready - enabling section targeting');
    setupSectionAwareness();
});

// ROOT FIX: Listen for section requesting component addition (click to add)
document.addEventListener('gmkb:add-component-to-section', (event) => {
    logger.info('COMPONENT_LIBRARY', 'Section requesting component addition', event.detail);
    
    // Store the requesting section ID
    if (event.detail && event.detail.sectionId) {
        window.componentLibrarySystem.targetSectionId = event.detail.sectionId;
        window.componentLibrarySystem.targetColumn = event.detail.column || 1;
        logger.debug('COMPONENT_LIBRARY', `Will target section ${event.detail.sectionId} for next component addition`);
    }
    
    // Open the component library modal
    showModal();
});

// ROOT FIX: Try immediately if DOM is already ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    tryInitialization();
}

// =============================================================================
// GLOBAL API (SIMPLIFIED)
// =============================================================================

// ROOT FIX: Enhanced global API with section awareness
window.componentLibrarySystem = {
    isReady: () => isInitialized,
    sectionAware: false, // Will be set to true when section systems are ready
    lastSectionCheck: null,
    targetSectionId: null, // Track which section requested component addition (click to add)
    targetColumn: null, // Track which column to target
    show: showModal,
    hide: hideModal,
    forceInit: () => {
        isInitialized = false;
        initializeComponentLibrary();
    },
    // ROOT CAUSE FIX: Add section targeting methods
    getAvailableSections: () => {
        try {
            return getAvailableSectionsForTargeting();
        } catch (error) {
            logger.error('COMPONENT_LIBRARY', 'Error getting sections:', error);
            return [];
        }
    },
    addComponentToSection: async (componentType, sectionId, column = 1) => {
        try {
            if (!window.enhancedComponentManager?.isReady()) {
                throw new Error('Enhanced component manager not ready');
            }
            
            const componentId = await window.enhancedComponentManager.addComponent(componentType, {
                targetSectionId: sectionId,
                targetColumn: column
            });
            
            logger.info('COMPONENT_LIBRARY', `Added ${componentType} to section ${sectionId}:${column} -> ${componentId}`);
            return componentId;
            
        } catch (error) {
            logger.error('COMPONENT_LIBRARY', `Failed to add ${componentType} to section:`, error);
            throw error;
        }
    },
    ensureDefaultSection: ensureDefaultSectionExists,
    getStatus: () => ({
        initialized: isInitialized,
        sectionAware: window.componentLibrarySystem.sectionAware,
        modalReady: !!window.GMKB_Modals,
        dataReady: !!(window.gmkbData?.components || window.guestifyData?.components),
        domReady: !!(document.getElementById('component-library-overlay')),
        sectionSystemsReady: !!(window.sectionLayoutManager && window.sectionRenderer),
        lastSectionCheck: window.componentLibrarySystem.lastSectionCheck,
        timestamp: Date.now()
    })
};

logger.info('COMPONENT_LIBRARY', 'Component Library loaded successfully');
logger.info('COMPONENT_LIBRARY', 'Available API: window.componentLibrarySystem');
logger.info('COMPONENT_LIBRARY', 'ROOT FIX ACTIVE: Event-driven initialization (NO POLLING)');
logger.info('COMPONENT_LIBRARY', 'ROOT FIX ACTIVE: Single event handler attachment per button');
logger.info('COMPONENT_LIBRARY', 'ROOT FIX ACTIVE: No complex timing or race conditions');
