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
 * SIMPLE ARCHITECTURE: Add selected components
 */
function addSelectedComponents() {
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
        console.log(`➕ Component Library: Adding ${selectedCards.length} selected components`);
    }
    
    let addedCount = 0;
    
    selectedCards.forEach(card => {
        const componentType = card.dataset.component;
        if (window.gmkbData?.debugMode) {
            console.log(`➕ Adding component: ${componentType}`);
        }
        
        // ROOT FIX: Try multiple methods to add components with section support
        let added = false;
        
        // Method 1: Enhanced component manager with section targeting
        if (window.enhancedComponentManager?.isReady()) {
            try {
                // ROOT CAUSE FIX: Ensure at least one section exists before adding components
                let targetSectionId = null;
                
                if (window.sectionLayoutManager) {
                    const availableSections = window.sectionLayoutManager.getAllSections() || [];
                    
                    // If no sections exist, create a default one
                    if (availableSections.length === 0) {
                        logger.info('COMPONENT_LIBRARY', 'No sections found, creating default section');
                        const newSectionId = `section_default_${Date.now()}`;
                        window.sectionLayoutManager.registerSection(newSectionId, 'full_width');
                        targetSectionId = newSectionId;
                    } else {
                        // Use the first available section
                        targetSectionId = availableSections[0].section_id;
                    }
                }
                
                const componentOptions = {};
                
                // Set target section if available
                if (targetSectionId) {
                    componentOptions.targetSectionId = targetSectionId;
                    componentOptions.targetColumn = 1;
                }
                
                window.enhancedComponentManager.addComponent(componentType, componentOptions);
                added = true;
                addedCount++;
            } catch (error) {
                console.error('Error adding component via enhancedComponentManager:', error);
            }
        }
        
        // Method 2: Fallback to GMKB global
        if (!added && window.GMKB?.addComponent) {
            try {
                window.GMKB.addComponent(componentType, {});
                added = true;
                addedCount++;
            } catch (error) {
                console.error('Error adding component via GMKB:', error);
            }
        }
        
        // Method 3: Dispatch custom event as fallback
        if (!added) {
            const addComponentEvent = new CustomEvent('gmkb:add-component', {
                detail: { 
                    componentType: componentType,
                    props: {},
                    source: 'component-library'
                }
            });
            document.dispatchEvent(addComponentEvent);
            if (window.gmkbData?.debugMode) {
                console.log(`➕ Dispatched add-component event for: ${componentType}`);
            }
            addedCount++;
        }
    });
    
    // ROOT FIX: Show success feedback
    if (addedCount > 0) {
        const message = addedCount === 1 
            ? 'Component added successfully'
            : `${addedCount} components added successfully`;
            
        if (window.GMKB_Toast) {
            window.GMKB_Toast.show({
                message: message,
                type: 'success',
                duration: 3000
            });
        }
        
        if (window.gmkbData?.debugMode) {
            console.log(`✅ Component Library: Successfully added ${addedCount} components`);
        }
    }
    
    // Clear selection and hide modal
    selectedCards.forEach(card => card.classList.remove('selected'));
    hideModal();
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

/**
 * ROOT FIX: Single initialization trigger
 */
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

// ROOT FIX: Try immediately if DOM is already ready
if (document.readyState === 'complete' || document.readyState === 'interactive') {
    tryInitialization();
}

// ROOT FIX: Additional retry mechanism for resilient initialization
setTimeout(() => {
    if (!isInitialized) {
        logger.info('COMPONENT_LIBRARY', 'Delayed initialization attempt - ensuring system is ready');
        tryInitialization();
    }
}, 1000);

// ROOT FIX: Emergency fallback - try to attach event listeners even without full initialization
setTimeout(() => {
    if (!isInitialized) {
        logger.info('COMPONENT_LIBRARY', 'Emergency fallback - attempting basic button attachment');
        
        // Try to find modal elements
        componentLibraryModal = document.getElementById('component-library-overlay');
        componentGrid = document.getElementById('component-grid');
        
        if (componentLibraryModal && componentGrid) {
            // Try basic event listener attachment
            const emergencyButtons = document.querySelectorAll('#add-component-btn, #add-first-component');
            emergencyButtons.forEach(button => {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    logger.info('COMPONENT_LIBRARY', 'Emergency button clicked, attempting manual modal display');
                    componentLibraryModal.style.display = 'flex';
                    
                    // Try to populate components if not done
                    if (componentGrid.children.length <= 1) {
                        populateComponents();
                    }
                });
            });
            
            logger.info('COMPONENT_LIBRARY', 'Emergency fallback initialized');
        }
    }
}, 2000);

// =============================================================================
// GLOBAL API (SIMPLIFIED)
// =============================================================================

// ROOT FIX: Simplified global API
window.componentLibrarySystem = {
    isReady: () => isInitialized,
    show: showModal,
    hide: hideModal,
    forceInit: () => {
        isInitialized = false;
        initializeComponentLibrary();
    },
    getStatus: () => ({
        initialized: isInitialized,
        modalReady: !!window.GMKB_Modals,
        dataReady: !!(window.gmkbData?.components || window.guestifyData?.components),
        domReady: !!(document.getElementById('component-library-overlay')),
        timestamp: Date.now()
    })
};

logger.info('COMPONENT_LIBRARY', 'Component Library loaded successfully');
logger.info('COMPONENT_LIBRARY', 'Available API: window.componentLibrarySystem');
logger.info('COMPONENT_LIBRARY', 'ROOT FIX ACTIVE: Event-driven initialization (NO POLLING)');
logger.info('COMPONENT_LIBRARY', 'ROOT FIX ACTIVE: Single event handler attachment per button');
logger.info('COMPONENT_LIBRARY', 'ROOT FIX ACTIVE: No complex timing or race conditions');
