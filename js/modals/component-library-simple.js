/**
 * @file component-library-simple.js  
 * @description SIMPLIFIED Component Library Modal System
 * 
 * ARCHITECTURAL PRINCIPLES:
 * ✅ Single initialization function
 * ✅ Simple guard system (one variable)
 * ✅ Event-driven but minimal
 * ✅ No complex timing/race condition handling
 * ✅ WordPress-native patterns only
 * 
 * ELIMINATES:
 * ❌ Multiple initialization paths
 * ❌ Complex guard systems  
 * ❌ setTimeout/polling patterns
 * ❌ Recursive initialization calls
 * ❌ Over-engineered error handling
 */

// SIMPLE ARCHITECTURE: Single initialization guard
let isInitialized = false;

// SIMPLE ARCHITECTURE: Global DOM elements
let componentGrid, componentLibraryModal;

// SIMPLE ARCHITECTURE: Basic logger fallback
const logger = window.structuredLogger || {
    info: (cat, msg, data) => console.log(`[${cat}] ${msg}`, data || ''),
    error: (cat, msg, err) => console.error(`[${cat}] ${msg}`, err || '')
};

/**
 * SIMPLE ARCHITECTURE: Single initialization function
 * Called once when modal system is ready and components are available
 */
function initializeComponentLibrary() {
    // SIMPLE GUARD: Only run once, ever
    if (isInitialized) {
        console.log('📚 Component Library: Already initialized, skipping');
        return;
    }
    
    console.log('🚀 Component Library: Starting simple initialization');
    
    try {
        // Find DOM elements
        componentLibraryModal = document.getElementById('component-library-overlay');
        componentGrid = document.getElementById('component-grid');
        
        if (!componentLibraryModal || !componentGrid) {
            console.log('⏳ Component Library: DOM elements not ready yet');
            return; // Try again later when DOM is ready
        }
        
        // Setup event listeners
        setupEventListeners();
        
        // Populate components immediately
        populateComponents();
        
        // Mark as initialized
        isInitialized = true;
        
        console.log('✅ Component Library: Initialization complete');
        
    } catch (error) {
        console.error('❌ Component Library: Initialization failed:', error);
    }
}

/**
 * SIMPLE ARCHITECTURE: Basic event listener setup
 */
function setupEventListeners() {
    // Show modal button
    const showButtons = document.querySelectorAll('#add-component-btn, #add-first-component, .show-component-library');
    showButtons.forEach(button => {
        button.addEventListener('click', showModal);
    });
    
    // Modal close buttons
    const closeButtons = componentLibraryModal.querySelectorAll('.library__close, .modal__close');
    closeButtons.forEach(button => {
        button.addEventListener('click', hideModal);
    });
    
    // Add components button
    const addButton = document.getElementById('add-component-button');
    if (addButton) {
        addButton.addEventListener('click', addSelectedComponents);
    }
    
    console.log('✅ Component Library: Event listeners setup');
}

/**
 * SIMPLE ARCHITECTURE: Direct component population using WordPress data
 */
function populateComponents() {
    console.log('🔍 Component Library: Populating components');
    
    // Get components from WordPress data (already available)
    const components = getComponents();
    
    if (!components || components.length === 0) {
        console.log('⚠️ Component Library: No components found, using fallbacks');
        populateGrid(getFallbackComponents());
        return;
    }
    
    console.log(`✅ Component Library: Found ${components.length} components`);
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
 * SIMPLE ARCHITECTURE: Populate component grid
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
    
    console.log(`✅ Component Library: ${components.length} components added to grid`);
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
function showModal() {
    if (window.GMKB_Modals && componentLibraryModal) {
        window.GMKB_Modals.show('component-library-overlay');
        
        // Ensure components are populated
        if (!isInitialized) {
            initializeComponentLibrary();
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
        console.log('⚠️ Component Library: No components selected');
        return;
    }
    
    selectedCards.forEach(card => {
        const componentType = card.dataset.component;
        console.log(`➕ Adding component: ${componentType}`);
        
        // Add via enhanced component manager
        if (window.enhancedComponentManager?.isReady()) {
            window.enhancedComponentManager.addComponent(componentType, {});
        }
    });
    
    // Clear selection and hide modal
    selectedCards.forEach(card => card.classList.remove('selected'));
    hideModal();
}

// =============================================================================
// SIMPLE INITIALIZATION SYSTEM
// =============================================================================

/**
 * SIMPLE ARCHITECTURE: Initialization trigger
 * Waits for both modal system and WordPress data to be ready
 */
function tryInitialization() {
    // Check if all dependencies are ready
    const modalReady = !!window.GMKB_Modals;
    const dataReady = !!(window.gmkbData?.components || window.guestifyData?.components || window.MKCG?.components);
    const domReady = !!(document.getElementById('component-library-overlay') && document.getElementById('component-grid'));
    
    if (modalReady && dataReady && domReady) {
        console.log('✅ Component Library: All dependencies ready, initializing');
        initializeComponentLibrary();
    } else {
        console.log('⏳ Component Library: Waiting for dependencies', {
            modalReady,
            dataReady, 
            domReady
        });
    }
}

// SIMPLE ARCHITECTURE: Multiple initialization triggers (no race conditions)

// 1. Try immediate initialization
tryInitialization();

// 2. Try after DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', tryInitialization);
} else {
    // DOM already ready
    setTimeout(tryInitialization, 100);
}

// 3. Try when modal system is ready  
document.addEventListener('gmkb:modal-base-ready', tryInitialization);

// 4. Try when WordPress data is ready
document.addEventListener('wordpressDataReady', tryInitialization);
document.addEventListener('gmkb:wordpress-data-ready', tryInitialization);

// =============================================================================
// GLOBAL API (SIMPLIFIED)
// =============================================================================

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

console.log('📚 Component Library (Simple): Loaded successfully');
console.log('🔧 Available API: window.componentLibrarySystem');
console.log('🚀 Multiple initialization triggers set up');
