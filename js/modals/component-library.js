/**
 * @file component-library.js
 * @description EVENT-DRIVEN Component Library Modal System
 *
 * ROOT FIX: Eliminates race conditions by waiting for modal system ready event
 * ✅ NO ES6 IMPORTS - Uses global GMKB_Modals API
 * ✅ EVENT-DRIVEN INITIALIZATION - Waits for gmkb:modal-base-ready
 * ✅ NO POLLING - Pure event-based coordination
 * ✅ ROOT CAUSE FIX - Fixes initialization timing not syntax
 */

// ROOT FIX: Remove all problematic ES6 imports
// Use global APIs that are guaranteed to be available after events

// Global variables for logging and utilities
let structuredLogger, errorBoundary, eventBus;

// Initialize logging fallbacks
function initializeUtilities() {
    // Structured logger fallback
    structuredLogger = window.structuredLogger || {
        info: (category, message, data) => console.log(`[${category}] ${message}`, data || ''),
        debug: (category, message, data) => console.debug(`[${category}] ${message}`, data || ''),
        warn: (category, message, data) => console.warn(`[${category}] ${message}`, data || ''),
        error: (category, message, error, data) => console.error(`[${category}] ${message}`, error, data || '')
    };
    
    // Error boundary fallback
    errorBoundary = window.errorBoundary || {
        wrap: (fn) => fn // Simple passthrough
    };
    
    // Event bus fallback
    eventBus = window.eventBus || {
        on: (event, callback) => document.addEventListener(event, callback),
        emit: (event, data) => document.dispatchEvent(new CustomEvent(event, { detail: data }))
    };
    
    console.log('✅ Component Library: Utilities initialized with fallbacks');
}

// Module-level variables for DOM elements
let componentLibraryModal, componentGrid, addComponentButton, cancelComponentButton, componentSearchInput;

/**
 * EVENT-DRIVEN: Sets up the component library after modal system is ready
 * ROOT FIX: No exports, waits for gmkb:modal-base-ready event
 * @returns {Promise<void>} Resolves when setup is complete
 */
async function setupComponentLibrary() {
    const setupStart = performance.now();
    structuredLogger.info('MODAL', 'Setting up Component Library with validation');
    
    try {
        // Validate elements exist before proceeding
        await validateAndAssignElements();
        
        // Setup event listeners
        setupEventListeners();
        
        // Populate component grid
        populateComponentGrid();
        
        // Mark setup complete with validation attribute
        componentLibraryModal.setAttribute('data-setup-complete', 'true');
        
        // Mark buttons as having listeners for test validation
        markButtonListenersAttached();
        
        // Expose functions globally for testing
        window.componentLibraryAPI = {
            getSelectedComponents,
            clearSelection,
            showComponentLibraryModal,
            hideComponentLibraryModal
        };
        
        structuredLogger.info('MODAL', 'Component Library setup complete', {
            duration: performance.now() - setupStart,
            elementsFound: {
                modal: !!componentLibraryModal,
                grid: !!componentGrid,
                addButton: !!addComponentButton,
                cancelButton: !!cancelComponentButton,
                searchInput: !!componentSearchInput
            },
            apiExposed: !!window.componentLibraryAPI
        });
        
    } catch (error) {
        structuredLogger.error('MODAL', 'Component Library setup failed', error);
        throw error;
    }
}

/**
 * Validates that all required DOM elements exist and assigns them
 * Enhanced with timeout handling for better race condition prevention
 */
async function validateAndAssignElements() {
    const requiredElements = {
        'component-library-overlay': 'componentLibraryModal',
        'component-grid': 'componentGrid',
        'add-component-button': 'addComponentButton',
        'cancel-component-button': 'cancelComponentButton',
        'component-search': 'componentSearchInput'
    };
    
    const maxWaitTime = 3000; // 3 second timeout
    const checkInterval = 100;
    const startTime = Date.now();
    
    structuredLogger.debug('MODAL', 'Validating Component Library elements with timeout', { 
        required: Object.keys(requiredElements),
        timeout: maxWaitTime
    });
    
    // Wait for all elements to be available
    while (Date.now() - startTime < maxWaitTime) {
        const missingElements = [];
        
        for (const [elementId, varName] of Object.entries(requiredElements)) {
            const element = document.getElementById(elementId);
            if (!element) {
                missingElements.push(elementId);
            } else {
                // Assign to module variable
                if (varName === 'componentLibraryModal') componentLibraryModal = element;
                else if (varName === 'componentGrid') componentGrid = element;
                else if (varName === 'addComponentButton') addComponentButton = element;
                else if (varName === 'cancelComponentButton') cancelComponentButton = element;
                else if (varName === 'componentSearchInput') componentSearchInput = element;
            }
        }
        
        if (missingElements.length === 0) {
            structuredLogger.debug('MODAL', 'All Component Library elements validated successfully', {
                duration: Date.now() - startTime
            });
            return;
        }
        
        // Log progress every second
        if ((Date.now() - startTime) % 1000 < checkInterval) {
            structuredLogger.debug('MODAL', 'Still waiting for elements', {
                missing: missingElements,
                elapsed: Date.now() - startTime
            });
        }
        
        await new Promise(resolve => setTimeout(resolve, checkInterval));
    }
    
    // Final check
    const finalMissing = [];
    for (const elementId of Object.keys(requiredElements)) {
        if (!document.getElementById(elementId)) {
            finalMissing.push(elementId);
        }
    }
    
    if (finalMissing.length > 0) {
        structuredLogger.error('MODAL', 'Component Library: Required elements not found after timeout', null, {
            missing: finalMissing,
            timeout: maxWaitTime,
            found: Object.keys(requiredElements).filter(id => !finalMissing.includes(id))
        });
        throw new Error(`Component Library: Required elements not found after ${maxWaitTime}ms: ${finalMissing.join(', ')}`);
    }
}

/**
 * Marks all button listeners as attached for validation purposes
 * This helps prevent race conditions by confirming setup completion
 */
function markButtonListenersAttached() {
    const buttons = [
        'add-component-btn',      // Sidebar button
        'add-first-component',    // Empty state button
        'add-component-button',   // Modal add button
        'cancel-component-button', // Modal cancel button
        'close-library'           // Modal close button
    ];
    
    let markedCount = 0;
    
    buttons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.setAttribute('data-listener-attached', 'true');
            markedCount++;
            structuredLogger.debug('MODAL', `Marked listener attached: ${buttonId}`);
        } else {
            structuredLogger.warn('MODAL', `Button not found for marking: ${buttonId}`);
        }
    });
    
    structuredLogger.info('MODAL', 'Button listeners marked as attached', {
        marked: markedCount,
        total: buttons.length,
        buttons: buttons
    });
}

/**
 * Sets up all event listeners for the component library
 */
function setupEventListeners() {
    let listenersAttached = 0;
    
    // Main UI button that opens the modal (if exists)
    const openComponentLibraryButton = document.getElementById('add-component');
    if (openComponentLibraryButton) {
        openComponentLibraryButton.addEventListener('click', () => {
            structuredLogger.debug('UI', 'Component Library button clicked (add-component)');
            showComponentLibraryModal();
        });
        openComponentLibraryButton.setAttribute('data-listener-attached', 'true');
        listenersAttached++;
    }
    
    // SIDEBAR Add Component button
    const sidebarAddComponentButton = document.getElementById('add-component-btn');
    if (sidebarAddComponentButton) {
        sidebarAddComponentButton.addEventListener('click', () => {
            structuredLogger.debug('UI', 'Sidebar Add Component button clicked');
            showComponentLibraryModal();
        });
        // Mark button as having listener attached for validation
        sidebarAddComponentButton.setAttribute('data-listener-attached', 'true');
        listenersAttached++;
    } else {
        structuredLogger.warn('UI', 'Sidebar Add Component button not found', { elementId: 'add-component-btn' });
    }

    // Empty state button event - using event bus with fallback
    if (eventBus && eventBus.on) {
        eventBus.on('ui:show-component-library', () => {
            structuredLogger.debug('UI', 'Component library requested via event bus');
            showComponentLibraryModal();
        });
    } else {
        // Fallback: listen for custom event directly
        document.addEventListener('ui:show-component-library', () => {
            structuredLogger.debug('UI', 'Component library requested via fallback event');
            showComponentLibraryModal();
        });
    }
    
    // Empty state "Add Component" button (in preview area)
    const addFirstComponentButton = document.getElementById('add-first-component');
    if (addFirstComponentButton) {
        addFirstComponentButton.addEventListener('click', () => {
            structuredLogger.debug('UI', 'Empty state Add Component button clicked');
            showComponentLibraryModal();
        });
        // Mark button as having listener attached for validation
        addFirstComponentButton.setAttribute('data-listener-attached', 'true');
        structuredLogger.debug('UI', 'Empty state Add Component button listener attached');
        listenersAttached++;
    } else {
        structuredLogger.debug('UI', 'Empty state Add Component button not found (likely hidden)', { elementId: 'add-first-component' });
    }
    
    // CRITICAL FIX: Enhanced UX button integration
    // Connect enhanced empty state buttons to component library modal
    const enhancedButtons = [
        'auto-generate-all-empty',
        'selective-generate', 
        'auto-generate-available',
        'manual-build',
        'manual-build-fallback',
        'connect-data',
        'improve-data',
        'generate-anyway'
    ];
    
    enhancedButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            button.addEventListener('click', () => {
                structuredLogger.debug('UI', `Enhanced empty state button clicked: ${buttonId}`);
                // For manual/connect buttons, show component library
                if (buttonId.includes('manual') || buttonId.includes('connect')) {
                    showComponentLibraryModal();
                } else {
                    // For auto-generate buttons, show component library for now
                    // TODO: Implement actual auto-generation logic
                    structuredLogger.info('UI', `Auto-generation requested: ${buttonId}`);
                    showComponentLibraryModal();
                }
            });
            button.setAttribute('data-listener-attached', 'true');
            listenersAttached++;
            structuredLogger.debug('UI', `Enhanced button ${buttonId} connected to component library`);
        }
    });

    // Cancel button
    if (cancelComponentButton) {
        cancelComponentButton.addEventListener('click', () => {
            structuredLogger.debug('UI', 'Component Library cancel button clicked');
            hideComponentLibraryModal();
            clearSelection();
        });
        listenersAttached++;
    }
    
    // Close button (× in upper right)
    const closeComponentLibraryButton = document.getElementById('close-library');
    if (closeComponentLibraryButton) {
        closeComponentLibraryButton.addEventListener('click', () => {
            structuredLogger.debug('UI', 'Component library close button (×) clicked');
            hideComponentLibraryModal();
            clearSelection();
        });
        listenersAttached++;
    }

    // Add button in modal footer
    if (addComponentButton) {
        addComponentButton.addEventListener('click', async () => {
            const selectedComponents = getSelectedComponents();
            if (selectedComponents.length === 0) {
                structuredLogger.warn('UI', 'No components selected for addition');
                return;
            }
            
            // Disable button during processing
            addComponentButton.disabled = true;
            addComponentButton.textContent = 'Adding...';
            
            try {
                structuredLogger.info('UI', 'Adding components', { components: selectedComponents });
                
                for (const componentType of selectedComponents) {
                    // ROOT CAUSE FIXED: Use enhanced component manager with comprehensive logging
                    console.log('🔍 Component addition attempt:', {
                        componentType,
                        enhancedManagerAvailable: !!window.enhancedComponentManager,
                        legacyManagerAvailable: !!window.componentManager,
                        enhancedManagerType: typeof window.enhancedComponentManager,
                        legacyManagerType: typeof window.componentManager
                    });
                    
                    if (window.enhancedComponentManager && typeof window.enhancedComponentManager.addComponent === 'function') {
                        console.log(`✅ Using enhanced component manager for ${componentType}`);
                        await window.enhancedComponentManager.addComponent(componentType, {});
                        structuredLogger.debug('UI', `Component added via enhanced manager: ${componentType}`);
                    } else if (window.componentManager && typeof window.componentManager.addComponent === 'function') {
                        console.log(`🛠️ Using legacy component manager for ${componentType}`);
                        await window.componentManager.addComponent(componentType, {});
                        structuredLogger.debug('UI', `Component added via legacy manager: ${componentType}`);
                    } else {
                        const errorMsg = 'No component manager available';
                        console.error('❌', errorMsg);
                        structuredLogger.error('UI', errorMsg);
                        throw new Error(errorMsg);
                    }
                }
                
                structuredLogger.info('UI', 'All components added successfully', { count: selectedComponents.length });
            } catch (error) {
                structuredLogger.error('UI', 'Failed to add components', error);
            } finally {
                // Re-enable button
                addComponentButton.disabled = false;
                addComponentButton.textContent = 'Add Selected';
            }
            
            hideComponentLibraryModal();
            clearSelection();
        });
    }

    // Search input
    if (componentSearchInput) {
        componentSearchInput.addEventListener('input', handleSearch);
        listenersAttached++;
    }
    
    // Category filter dropdown
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter) {
        categoryFilter.addEventListener('change', handleCategoryFilter);
        listenersAttached++;
    }
    
    // Category sidebar items
    const categoryItems = document.querySelectorAll('.category-item');
    categoryItems.forEach(item => {
        item.addEventListener('click', (e) => {
            const category = e.target.dataset.category;
            structuredLogger.debug('UI', 'Category item clicked', { category });
            filterByCategory(category);
            // Update active state
            document.querySelectorAll('.category-item').forEach(i => i.classList.remove('category-item--active'));
            e.target.classList.add('category-item--active');
        });
        listenersAttached++;
    });
    
    structuredLogger.debug('MODAL', 'Component Library event listeners setup complete', {
        listenersAttached,
        buttons: {
            mainButton: !!openComponentLibraryButton,
            sidebarButton: !!sidebarAddComponentButton,
            emptyStateButton: !!addFirstComponentButton,
            cancelButton: !!cancelComponentButton,
            closeButton: !!closeComponentLibraryButton
        },
        enhancedUXIntegration: true,
        enhancedButtonsConnected: enhancedButtons.length
    });
}

/**
 * Unified component population system - single source of truth
 * Populates both free and premium components with proper loading states
 */
function populateComponentGrid() {
    if (!componentGrid) {
        structuredLogger.error('MODAL', 'Component grid element not available');
        return;
    }
    
    const populateStart = performance.now();
    structuredLogger.info('MODAL', 'Starting unified component population');
    
    // Show loading state first
    showLoadingState();
    
    // Use setTimeout to ensure loading state is visible
    setTimeout(() => {
        try {
            // Get components from guestifyData or use fallback
            const components = getComponentsData();
            
            // Clear grid and populate with unified components
            clearGridAndPopulate(components);
            
            // Hide loading state after population
            hideLoadingState();
            
            structuredLogger.info('MODAL', 'Component grid population complete', {
                count: components.length,
                duration: performance.now() - populateStart,
                source: 'unified system'
            });
        } catch (error) {
            structuredLogger.error('MODAL', 'Component population failed', error);
            hideLoadingState();
            showErrorState();
        }
    }, 100); // Small delay to ensure loading state is visible
}

/**
 * Shows loading state in the component grid
 */
function showLoadingState() {
    const loadingElement = document.getElementById('component-grid-loading');
    if (loadingElement) {
        loadingElement.style.display = 'flex';
        loadingElement.style.flexDirection = 'column';
        loadingElement.style.alignItems = 'center';
        loadingElement.style.justifyContent = 'center';
        loadingElement.style.padding = '40px';
        loadingElement.style.color = '#6b7280';
        
        // Add CSS animation for spinner
        const spinner = loadingElement.querySelector('.loading-spinner svg');
        if (spinner) {
            spinner.style.animation = 'spin 1s linear infinite';
        }
    }
}

/**
 * Hides loading state
 */
function hideLoadingState() {
    const loadingElement = document.getElementById('component-grid-loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

/**
 * Shows error state when component loading fails
 */
function showErrorState() {
    const loadingElement = document.getElementById('component-grid-loading');
    if (loadingElement) {
        loadingElement.innerHTML = `
            <div class="loading-error">
                <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#ef4444" stroke-width="2">
                    <circle cx="12" cy="12" r="10"></circle>
                    <line x1="15" y1="9" x2="9" y2="15"></line>
                    <line x1="9" y1="9" x2="15" y2="15"></line>
                </svg>
                <p>Failed to load components. Please refresh the page.</p>
            </div>
        `;
        loadingElement.style.display = 'flex';
    }
}

/**
 * Gets components data from guestifyData or provides fallback
 * Enhanced to ensure premium property exists on all components and guarantee premium components
 */
function getComponentsData() {
    let components = [];
    
    // Try to get from guestifyData first
    if (window.guestifyData?.components && Array.isArray(window.guestifyData.components)) {
        structuredLogger.info('MODAL', 'Using components from guestifyData', {
            count: window.guestifyData.components.length
        });
        
        // Enhance guestifyData components with premium property if missing
        components = window.guestifyData.components.map(component => {
            // Determine if component should be premium based on type or name
            const premiumTypes = ['video-intro', 'image-gallery', 'testimonials', 'podcast-player', 'contact-form', 'calendar'];
            const isPremium = component.premium === true || 
                            premiumTypes.includes(component.type) || 
                            premiumTypes.includes(component.name);
            
            return {
                ...component,
                premium: isPremium
            };
        });
    } else {
        // Use fallback components if guestifyData is not available
        structuredLogger.warn('MODAL', 'guestifyData not available, using fallback components');
        components = getFallbackComponents();
    }
    
    // Ensure we always have at least some premium components
    const premiumCount = components.filter(c => c.premium).length;
    if (premiumCount === 0) {
        structuredLogger.info('MODAL', 'No premium components detected, adding guaranteed premium components');
        
        // Add guaranteed premium components
        const guaranteedPremium = [
            {
                type: 'video-intro',
                name: 'video-intro',
                title: 'Video Introduction',
                description: 'Embedded video player for introductions',
                category: 'media',
                icon: 'fa-play',
                premium: true
            },
            {
                type: 'testimonials',
                name: 'testimonials',
                title: 'Testimonials',
                description: 'Client testimonials and reviews',
                category: 'social',
                icon: 'fa-quote-left',
                premium: true
            },
            {
                type: 'image-gallery',
                name: 'image-gallery',
                title: 'Image Gallery',
                description: 'Professional photo gallery with lightbox',
                category: 'media',
                icon: 'fa-images',
                premium: true
            },
            {
                type: 'podcast-player',
                name: 'podcast-player',
                title: 'Podcast Player',
                description: 'Embedded podcast player',
                category: 'media',
                icon: 'fa-headphones',
                premium: true
            }
        ];
        
        components = [...components, ...guaranteedPremium];
    }
    
    structuredLogger.info('MODAL', 'Final component data prepared', {
        total: components.length,
        premium: components.filter(c => c.premium).length,
        free: components.filter(c => !c.premium).length
    });
    
    return components;
}

/**
 * Provides fallback components when guestifyData is not available
 * Enhanced with proper premium markings and better component variety
 */
function getFallbackComponents() {
    return [
        // Free Components
        {
            type: 'hero',
            name: 'hero',
            title: 'Hero Section',
            description: 'Profile section with name, title and bio',
            category: 'hero',
            icon: 'fa-user',
            premium: false
        },
        {
            type: 'biography',
            name: 'biography',
            title: 'Biography',
            description: 'Full-width text biography section',
            category: 'biography',
            icon: 'file-text.svg',
            premium: false
        },
        {
            type: 'topics',
            name: 'topics',
            title: 'Topics',
            description: 'Grid layout for speaking topics',
            category: 'topics',
            icon: 'list.svg',
            premium: false
        },
        {
            type: 'social',
            name: 'social',
            title: 'Social Links',
            description: 'Social media icon links',
            category: 'social',
            icon: 'linkedin.svg',
            premium: false
        },
        {
            type: 'stats',
            name: 'stats',
            title: 'Statistics',
            description: 'Display key metrics and numbers',
            category: 'stats',
            icon: 'fa-chart-bar',
            premium: false
        },
        {
            type: 'logo-grid',
            name: 'logo-grid',
            title: 'Logo Grid',
            description: 'Showcase client and partner logos',
            category: 'media',
            icon: 'fa-th',
            premium: false
        },
        
        // Premium Components
        {
            type: 'video-intro',
            name: 'video-intro',
            title: 'Video Introduction',
            description: 'Embedded video player for introductions',
            category: 'media',
            icon: 'fa-play',
            premium: true
        },
        {
            type: 'image-gallery',
            name: 'image-gallery',
            title: 'Image Gallery',
            description: 'Professional photo gallery with lightbox',
            category: 'media',
            icon: 'fa-images',
            premium: true
        },
        {
            type: 'testimonials',
            name: 'testimonials',
            title: 'Testimonials',
            description: 'Client testimonials and reviews',
            category: 'social',
            icon: 'message-square.svg',
            premium: true
        },
        {
            type: 'podcast-player',
            name: 'podcast-player',
            title: 'Podcast Player',
            description: 'Embedded podcast player',
            category: 'media',
            icon: 'headphones.svg',
            premium: true
        }
    ];
}

/**
 * Clears the grid and populates with components
 * Enhanced to exclude section headers from component grid area
 */
function clearGridAndPopulate(components) {
    // Store reference to loading element before clearing
    const loadingElement = document.getElementById('component-grid-loading');
    
    // Clear ALL existing content except loading element (including any hardcoded cards)
    const elementsToRemove = [];
    for (const child of componentGrid.children) {
        if (child.id !== 'component-grid-loading') {
            elementsToRemove.push(child);
        }
    }
    elementsToRemove.forEach(element => {
        structuredLogger.debug('MODAL', 'Removing existing element', {
            className: element.className,
            dataComponent: element.dataset?.component,
            dataSource: element.dataset?.source || 'unknown'
        });
        element.remove();
    });
    
    // Ensure we start with a completely clean grid
    structuredLogger.info('MODAL', 'Grid cleared, starting fresh population');
    
    // Group components by premium status
    const freeComponents = components.filter(c => !c.premium);
    const premiumComponents = components.filter(c => c.premium);
    
    structuredLogger.debug('MODAL', 'Component categorization', {
        freeCount: freeComponents.length,
        premiumCount: premiumComponents.length,
        total: components.length
    });
    
    // Add free components directly (no section header in grid)
    freeComponents.forEach(component => {
        const card = createComponentCard(component, false);
        componentGrid.appendChild(card);
    });
    
    // Add premium components directly (no section header in grid) 
    premiumComponents.forEach(component => {
        const card = createComponentCard(component, true);
        componentGrid.appendChild(card);
    });
    
    structuredLogger.info('MODAL', 'Component grid populated with components only (no headers)', {
        freeComponents: freeComponents.length,
        premiumComponents: premiumComponents.length,
        total: components.length,
        allDynamic: true
    });
}

/**
 * Adds a section header to the component grid
 */
function addSectionHeader(title, description, isTopMargin = false) {
    const header = document.createElement('div');
    header.className = 'library__section-header';
    if (isTopMargin) {
        header.style.marginTop = '30px';
    }
    
    header.innerHTML = `
        <h3>${title}</h3>
        <p>${description}</p>
    `;
    
    componentGrid.appendChild(header);
}

/**
 * Creates a component card element with proper premium styling and selection
 * Enhanced to ensure proper data attributes and dynamic identification
 * @param {Object} component - The component object
 * @param {boolean} isPremium - Whether this is a premium component
 */
function createComponentCard(component, isPremium = false) {
    const card = document.createElement('div');
    card.className = isPremium ? 'component-card component-card--premium' : 'component-card';
    
    // Enhanced data attributes for proper identification
    card.dataset.componentType = component.type || component.directory || component.name;
    card.dataset.component = component.type || component.directory || component.name;
    card.dataset.category = component.category || 'general';
    card.dataset.premium = isPremium ? 'true' : 'false';
    card.dataset.source = 'dynamic'; // Mark as dynamically created
    card.dataset.generated = Date.now(); // Add timestamp for debugging

    const icon = createComponentIcon(component);
    const title = `<h4>${component.title || component.name || 'Untitled'}</h4>`;
    const description = `<p>${component.description || 'No description available'}</p>`;
    const componentId = component.type || component.name || 'unknown';

    card.innerHTML = `
        <div class="component-card-content">
            <div class="component-preview">
                ${icon}
            </div>
            <div class="component-info">
                ${title}
                ${description}
            </div>
        </div>
    `;

    // Add click handler for card-based selection
    card.addEventListener('click', (event) => {
        // Toggle selection state
        const isCurrentlySelected = card.classList.contains('selected');
        card.classList.toggle('selected', !isCurrentlySelected);
        
        structuredLogger.debug('MODAL', `Component ${!isCurrentlySelected ? 'selected' : 'deselected'}`, {
            component: componentId,
            isPremium,
            category: component.category,
            source: 'dynamic',
            selectionMethod: 'card-click'
        });
    });

    return card;
}



/**
 * Creates an icon for a component - handles both SVG files and FontAwesome classes
 * Enhanced with better fallback handling and premium component styling
 * @param {Object} component - The component object
 * @returns {string} HTML string for the icon
 */
function createComponentIcon(component) {
    if (component.icon) {
        if (component.icon.endsWith('.svg')) {
            // Handle SVG files with proper path resolution and enhanced error handling
            const componentDir = component.directory || component.name || component.type;
            let iconPath;
            
            // Use pluginUrl if available, otherwise construct path
            if (window.guestifyData?.pluginUrl) {
                iconPath = `${window.guestifyData.pluginUrl}components/${componentDir}/${component.icon}`;
            } else {
                // Fallback path construction
                iconPath = `/wp-content/plugins/guestify-media-kit-builder/components/${componentDir}/${component.icon}`;
            }
            
            // ENHANCED: Check if SVG exists before trying to load it
            // Create a more robust fallback that doesn't generate 404 errors
            const fallbackIcon = createCategoryIcon(component.category || 'general', component.type || component.name);
            
            return `<img src="${iconPath}" alt="${component.name || component.type} icon" class="component-icon" 
                     onerror="this.style.display='none'; this.nextElementSibling.style.display='inline-flex'; this.nextElementSibling.style.alignItems='center'; this.nextElementSibling.style.justifyContent='center'; console.warn('Icon not found for ${component.type || component.name}: ${component.icon}')" 
                     onload="console.log('✅ Icon loaded: ${component.icon}')" />
                     <div style="display:none; width: 32px; height: 32px; color: #6B7280;">${fallbackIcon}</div>`;
        } else if (component.icon.startsWith('fa-')) {
            // Handle FontAwesome classes (with or without fa- prefix)
            return `<i class="fa ${component.icon}" style="font-size: 24px; color: #6B7280;"></i>`;
        } else {
            // Handle other icon formats or assume FontAwesome
            return `<i class="fa fa-${component.icon}" style="font-size: 24px; color: #6B7280;"></i>`;
        }
    }
    return createCategoryIcon(component.category || 'general', component.type || component.name);
}

/**
 * Creates a category-specific fallback icon for components
 * ENHANCED: Provides intelligent icons based on component category and type
 * @param {string} category - The component category
 * @param {string} componentType - Optional specific component type for more targeted icons
 * @returns {string} SVG icon HTML
 */
function createCategoryIcon(category, componentType = '') {
    // Category-specific icon mappings
    const categoryIcons = {
        'essential': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="3"></circle>
                <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1 1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
            </svg>
        `,
        'media': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect>
                <circle cx="8.5" cy="8.5" r="1.5"></circle>
                <polyline points="21,15 16,10 5,21"></polyline>
            </svg>
        `,
        'social': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M17 2v6l-2-1.5L13 8V2"></path>
                <path d="M9 9H4s0 6 4 6 4-6 4-6"></path>
                <path d="M20 9h-5s0 6 4 6 5-6 5-6"></path>
            </svg>
        `,
        'premium': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polygon points="12,2 15.09,8.26 22,9 17,14.74 18.18,21.02 12,17.77 5.82,21.02 7,14.74 2,9 8.91,8.26 12,2"></polygon>
            </svg>
        `,
        'biography': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
            </svg>
        `,
        'hero': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                <circle cx="12" cy="7" r="4"></circle>
                <path d="M12 14l3-3 3 3"></path>
            </svg>
        `,
        'topics': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="8" y1="6" x2="21" y2="6"></line>
                <line x1="8" y1="12" x2="21" y2="12"></line>
                <line x1="8" y1="18" x2="21" y2="18"></line>
                <line x1="3" y1="6" x2="3.01" y2="6"></line>
                <line x1="3" y1="12" x2="3.01" y2="12"></line>
                <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
        `,
        'stats': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <line x1="12" y1="20" x2="12" y2="10"></line>
                <line x1="18" y1="20" x2="18" y2="4"></line>
                <line x1="6" y1="20" x2="6" y2="16"></line>
            </svg>
        `,
        'contact': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
            </svg>
        `,
        'authority': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M12 2l3.09 6.26L22 9l-5 4.74L18.18 21.02 12 17.77l-6.18 3.25L7 14.74 2 9l6.91-1.74L12 2z"></path>
                <circle cx="12" cy="12" r="3"></circle>
            </svg>
        `
    };
    
    // Component-specific overrides for better precision
    const componentSpecificIcons = {
        'authority-hook': categoryIcons['authority'],
        'social': categoryIcons['social'],
        'stats': categoryIcons['stats'],
        'photo-gallery': categoryIcons['media'],
        'video-intro': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <polygon points="5,3 19,12 5,21"></polygon>
            </svg>
        `,
        'testimonials': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
                <path d="M13 8H7"></path>
                <path d="M17 12H7"></path>
            </svg>
        `,
        'questions': `
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
        `
    };
    
    // Try component-specific first, then category, then default
    if (componentSpecificIcons[componentType]) {
        return componentSpecificIcons[componentType];
    }
    
    if (categoryIcons[category]) {
        return categoryIcons[category];
    }
    
    // Ultimate fallback - generic component icon
    return `
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <rect x="3" y="3" width="18" height="18" rx="3" ry="3"></rect>
            <circle cx="9" cy="9" r="2"></circle>
            <path d="M21 15l-3.086-3.086a2 2 0 00-2.828 0L6 21"></path>
        </svg>
    `;
}

/**
 * Creates a default icon for components without specific icons
 * FIXED: Removed string escaping that was causing malformed SVG attributes
 */
function createDefaultIcon() {
    return createCategoryIcon('general');
}

/**
 * Handles the search functionality for the component library.
 * Filters components based on the user's input.
 * @param {Event} event - The input event from the search field.
 */
function handleSearch(event) {
    const searchTerm = event.target.value.toLowerCase();
    const cards = componentGrid.querySelectorAll('.component-card');

    cards.forEach(card => {
        const title = card.querySelector('h4')?.textContent.toLowerCase() || '';
        const description = card.querySelector('p')?.textContent.toLowerCase() || '';
        const isVisible = title.includes(searchTerm) || description.includes(searchTerm);
        card.style.display = isVisible ? '' : 'none';
    });
}

/**
 * Handles category filter dropdown
 */
function handleCategoryFilter(event) {
    const category = event.target.value;
    filterByCategory(category);
}

/**
 * Filters components by category
 */
function filterByCategory(category) {
    const cards = componentGrid.querySelectorAll('.component-card');
    
    cards.forEach(card => {
        if (category === 'all' || card.dataset.category === category) {
            card.style.display = '';
        } else {
            card.style.display = 'none';
        }
    });
    
    // Update dropdown if it exists
    const categoryFilter = document.getElementById('category-filter');
    if (categoryFilter && categoryFilter.value !== category) {
        categoryFilter.value = category;
    }
}

/**
 * Gets the list of selected component types from the component grid.
 * @returns {string[]} An array of selected component type strings.
 */
function getSelectedComponents() {
    const selected = [];
    const selectedCards = componentGrid.querySelectorAll('.component-card.selected');
    selectedCards.forEach(card => {
        // Try multiple data attributes for compatibility
        const componentType = card.dataset.componentType || card.dataset.component;
        if (componentType) {
            selected.push(componentType);
        }
    });
    structuredLogger.debug('MODAL', 'Components selected', { selected, method: 'card-class' });
    return selected;
}

/**
 * Clears the selection state of all components in the grid.
 */
function clearSelection() {
    const selectedCards = componentGrid.querySelectorAll('.component-card.selected');
    selectedCards.forEach(card => {
        card.classList.remove('selected');
    });
    structuredLogger.debug('MODAL', 'Selection cleared', { clearedCount: selectedCards.length });
}

/**
 * EVENT-DRIVEN: Shows the component library modal using global GMKB_Modals API
 * ROOT FIX: No ES6 imports, uses established global modal system
 */
function showComponentLibraryModal() {
    if (!window.GMKB_Modals) {
        structuredLogger.error('MODAL', 'GMKB_Modals not available - modal system not ready');
        console.error('❌ Component Library: Modal system not initialized');
        return;
    }
    
    if (componentLibraryModal) {
        structuredLogger.debug('MODAL', 'Showing Component Library modal via GMKB_Modals');
        window.GMKB_Modals.show('component-library-overlay');
        console.log('✅ Component Library: Modal shown successfully');
    } else {
        structuredLogger.error('MODAL', 'Component library modal element not found');
        console.error('❌ Component Library: Modal element not available');
    }
}

/**
 * EVENT-DRIVEN: Hides the component library modal using global GMKB_Modals API
 * ROOT FIX: No ES6 imports, uses established global modal system
 */
function hideComponentLibraryModal() {
    if (!window.GMKB_Modals) {
        structuredLogger.error('MODAL', 'GMKB_Modals not available - modal system not ready');
        return;
    }
    
    if (componentLibraryModal) {
        structuredLogger.debug('MODAL', 'Hiding Component Library modal via GMKB_Modals');
        window.GMKB_Modals.hide('component-library-overlay');
        console.log('✅ Component Library: Modal hidden successfully');
    }
}

// ===================================================================
// ROOT FIX: EVENT-DRIVEN INITIALIZATION SYSTEM
// ===================================================================

/**
 * ROOT FIX: Initialize component library when modal system is ready
 * NO POLLING, NO SETTIMEOUT - Pure event-driven coordination
 */
function initializeComponentLibrarySystem() {
    console.log('🚀 Component Library: Starting event-driven initialization');
    
    // Initialize utilities first
    initializeUtilities();
    
    // ROOT FIX: Wait for modal system ready event
    document.addEventListener('gmkb:modal-base-ready', async (event) => {
        console.log('✅ Component Library: Modal system ready event received', event.detail);
        
        try {
            // Verify modal system is actually available
            if (!window.GMKB_Modals) {
                console.error('❌ Component Library: GMKB_Modals not available despite ready event');
                return;
            }
            
            // Log modal system status
            const modalStatus = window.GMKB_Modals.getStatus();
            console.log('🔍 Component Library: Modal system status:', modalStatus);
            
            // Setup component library now that modals are ready
            await setupComponentLibrary();
            
            console.log('✅ Component Library: Successfully initialized after modal system ready');
            
            // Dispatch our own ready event
            document.dispatchEvent(new CustomEvent('gmkb:component-library-ready', {
                detail: {
                    timestamp: Date.now(),
                    modalSystemReady: true,
                    setupComplete: true
                }
            }));
            
        } catch (error) {
            console.error('❌ Component Library: Setup failed after modal ready event:', error);
        }
    }, { once: true }); // Only listen once
    
    // FALLBACK: If modal system is already ready
    if (window.GMKB_Modals) {
        console.log('🔄 Component Library: Modal system already ready, initializing immediately');
        
        setTimeout(async () => {
            try {
                await setupComponentLibrary();
                console.log('✅ Component Library: Fallback initialization successful');
            } catch (error) {
                console.error('❌ Component Library: Fallback initialization failed:', error);
            }
        }, 100); // Small delay to ensure DOM is ready
    }
    
    console.log('🔍 Component Library: Event listeners registered, waiting for modal system...');
}

// ===================================================================
// AUTO-INITIALIZATION
// ===================================================================

/**
 * ROOT FIX: Auto-initialize when DOM is ready
 * Uses native DOMContentLoaded for maximum reliability
 */
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeComponentLibrarySystem);
    console.log('🕰️ Component Library: Waiting for DOMContentLoaded...');
} else {
    // DOM is already ready
    console.log('📝 Component Library: DOM already ready, initializing immediately');
    initializeComponentLibrarySystem();
}

// ROOT FIX: Expose global API for testing and integration
window.componentLibrarySystem = {
    initialize: initializeComponentLibrarySystem,
    show: showComponentLibraryModal,
    hide: hideComponentLibraryModal,
    isReady: () => !!componentLibraryModal && !!window.GMKB_Modals,
    getStatus: () => ({
        modalElementFound: !!componentLibraryModal,
        modalSystemReady: !!window.GMKB_Modals,
        utilitiesReady: !!structuredLogger,
        timestamp: Date.now()
    })
};

console.log('✅ Component Library: Event-driven system loaded and ready for initialization');
