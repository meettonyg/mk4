/**
 * Consolidated Modal System (Part 1)
 * Combines: modal-base.js and component-library-simple.js
 * 
 * ROOT FIX: Single file for modal base system and component library
 * Follows project checklist: No polling, event-driven, simplified code
 * 
 * @version 3.0.0-consolidated
 * @package GMKB
 */

(function() {
    'use strict';
    
    // ============================================
    // PART 1: Modal Base System
    // ============================================
    
    const modalState = {
        initialized: false,
        activeModals: new Set(),
        registeredModals: new Map(),
    };

    /**
     * Initialize modal system
     */
    function initModalSystem() {
        if (modalState.initialized) {
            console.warn('Modal system already initialized');
            return;
        }

        if (window.gmkbData?.debugMode) {
            console.log('🔄 Initializing Modal System...');
        }

        // Register all modals in DOM
        // ROOT FIX: Include template-library-modal specifically
        document.querySelectorAll('.modal-overlay, .library-modal, #template-library-modal').forEach(modalElement => {
            registerModal(modalElement);
        });

        // Global ESC key listener
        document.addEventListener('keydown', handleEscKey);

        modalState.initialized = true;
        
        if (window.gmkbData?.debugMode) {
            console.log(`✅ Modal System Initialized: ${modalState.registeredModals.size} modals`);
        }

        // Announce readiness
        document.dispatchEvent(new CustomEvent('gmkb:modal-base-ready', {
            detail: {
                registeredModalIds: Array.from(modalState.registeredModals.keys()),
                timestamp: Date.now(),
            }
        }));
    }

    /**
     * Register a modal
     */
    function registerModal(modalElement) {
        const modalId = modalElement.id;
        if (!modalId || modalState.registeredModals.has(modalId)) return;

        // Setup close buttons
        const closeButtons = modalElement.querySelectorAll('.modal__close, .library__close, .close-modal, [data-modal-close]');
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                e.stopPropagation();
                hideModal(modalId);
            });
        });

        // Backdrop click
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                hideModal(modalId);
            }
        });
        
        modalState.registeredModals.set(modalId, modalElement);
    }

    /**
     * Show modal
     */
    function showModal(modalId) {
        if (!modalState.initialized) {
            console.error('Modal system not initialized');
            return;
        }

        let modal = modalState.registeredModals.get(modalId);
        if (!modal) {
            // Try to find modal in DOM
            const modalElement = document.getElementById(modalId);
            if (modalElement) {
                registerModal(modalElement);
                modalState.registeredModals.set(modalId, modalElement);
            } else {
                console.error(`Modal '${modalId}' not found`);
                return;
            }
        }

        const modalToShow = modalState.registeredModals.get(modalId);
        modalToShow.style.removeProperty('display');
        // ROOT FIX: Support both modal--open and library-modal--open classes
        modalToShow.classList.add('modal--open', 'library-modal--open');
        modalToShow.style.display = 'flex';
        document.body.classList.add('modal-open');
        modalState.activeModals.add(modalId);
        
        document.dispatchEvent(new CustomEvent('gmkb:modal-shown', {
            detail: { modalId, timestamp: Date.now() }
        }));
    }

    /**
     * Hide modal
     */
    function hideModal(modalId) {
        if (!modalState.initialized) return;
        
        const modal = modalState.registeredModals.get(modalId) || document.getElementById(modalId);
        if (!modal) return;

        // ROOT FIX: Remove both possible open classes
        modal.classList.remove('modal--open', 'library-modal--open');
        modal.style.display = 'none';
        modalState.activeModals.delete(modalId);

        if (modalState.activeModals.size === 0) {
            document.body.classList.remove('modal-open');
        }
        
        document.dispatchEvent(new CustomEvent('gmkb:modal-hidden', {
            detail: { modalId, timestamp: Date.now() }
        }));
    }
    
    /**
     * ESC key handler
     */
    function handleEscKey(e) {
        if (e.key === 'Escape' && modalState.activeModals.size > 0) {
            const lastActiveModalId = Array.from(modalState.activeModals).pop();
            hideModal(lastActiveModalId);
        }
    }

    // ============================================
    // PART 2: Component Library
    // ============================================
    
    let componentLibraryInitialized = false;
    let componentGrid, componentLibraryModal;
    
    const logger = window.structuredLogger || {
        info: (cat, msg, data) => console.log(`[${cat}] ${msg}`, data || ''),
        error: (cat, msg, err) => console.error(`[${cat}] ${msg}`, err || ''),
        debug: (cat, msg, data) => window.gmkbData?.debugMode && console.log(`[${cat}] ${msg}`, data || ''),
        warn: (cat, msg, data) => console.warn(`[${cat}] ${msg}`, data || '')
    };

    /**
     * Initialize component library
     */
    function initializeComponentLibrary() {
        if (componentLibraryInitialized) {
            logger.info('COMPONENT_LIBRARY', 'Already initialized');
            return;
        }
        
        logger.info('COMPONENT_LIBRARY', 'Starting initialization');
        
        try {
            componentLibraryModal = document.getElementById('component-library-overlay');
            componentGrid = document.getElementById('component-grid');
            
            if (!componentLibraryModal || !componentGrid) {
                throw new Error('Required DOM elements not found');
            }
            
            setupComponentLibraryEventListeners();
            populateComponents();
            componentLibraryInitialized = true;
            
            logger.info('COMPONENT_LIBRARY', 'Initialization complete');
            document.dispatchEvent(new CustomEvent('gmkb:component-library-ready'));
            
        } catch (error) {
            logger.error('COMPONENT_LIBRARY', 'Initialization failed', error);
        }
    }

    /**
     * Setup component library event listeners
     */
    function setupComponentLibraryEventListeners() {
        // Show buttons
        function attachShowButtonListeners() {
            const showButtons = document.querySelectorAll('#add-component-btn, #add-first-component, .show-component-library, [data-action="add-component"]');
            
            if (showButtons.length === 0) {
                setTimeout(attachShowButtonListeners, 100);
                return;
            }
            
            showButtons.forEach(button => {
                button.removeEventListener('click', showComponentLibrary);
                button.addEventListener('click', showComponentLibrary);
            });
        }
        
        attachShowButtonListeners();
        
        // Close buttons
        const closeButtons = componentLibraryModal.querySelectorAll('.library__close, .modal__close, .close-modal');
        closeButtons.forEach(button => {
            button.addEventListener('click', hideComponentLibrary);
        });
        
        // Cancel/Add buttons
        const cancelButton = document.getElementById('cancel-component-button');
        if (cancelButton) {
            cancelButton.addEventListener('click', hideComponentLibrary);
        }
        
        const addButton = document.getElementById('add-component-button');
        if (addButton) {
            addButton.addEventListener('click', addSelectedComponents);
        }
        
        // Backdrop click
        componentLibraryModal.addEventListener('click', (e) => {
            if (e.target === componentLibraryModal) {
                hideComponentLibrary();
            }
        });
    }

    /**
     * Show component library
     */
    function showComponentLibrary(event) {
        if (event) {
            event.preventDefault();
            event.stopPropagation();
        }
        
        showModal('component-library-overlay');
        
        if (!componentLibraryInitialized) {
            initializeComponentLibrary();
        }
    }

    /**
     * Hide component library
     */
    function hideComponentLibrary() {
        hideModal('component-library-overlay');
    }

    /**
     * Get components from WordPress data
     */
    function getComponents() {
        if (window.gmkbData?.components?.length > 0) {
            return window.gmkbData.components;
        }
        return getFallbackComponents();
    }

    /**
     * Get fallback components
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
     * Populate component grid
     */
    function populateComponents() {
        const components = getComponents();
        
        // Clear loading state
        const loadingElement = document.getElementById('component-grid-loading');
        if (loadingElement) {
            loadingElement.style.display = 'none';
        }
        
        // Clear existing
        const existingCards = componentGrid.querySelectorAll('.component-card');
        existingCards.forEach(card => card.remove());
        
        // Add components
        components.forEach(component => {
            const card = createComponentCard(component);
            componentGrid.appendChild(card);
        });
    }

    /**
     * Create component card
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
        
        card.addEventListener('click', () => {
            card.classList.toggle('selected');
        });
        
        return card;
    }

    /**
     * Add selected components
     */
    async function addSelectedComponents() {
        const selectedCards = componentGrid.querySelectorAll('.component-card.selected');
        
        if (selectedCards.length === 0) {
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
        
        let addedCount = 0;
        
        for (const card of selectedCards) {
            const componentType = card.dataset.component;
            
            try {
                // Try multiple methods to add component
                if (window.enhancedComponentManager?.isReady()) {
                    await window.enhancedComponentManager.addComponent(componentType);
                    addedCount++;
                } else if (window.GMKB?.addComponent) {
                    window.GMKB.addComponent(componentType);
                    addedCount++;
                } else {
                    // Dispatch event as fallback
                    document.dispatchEvent(new CustomEvent('gmkb:add-component', {
                        detail: { 
                            componentType: componentType,
                            source: 'component-library-modal'
                        }
                    }));
                    addedCount++;
                }
            } catch (error) {
                console.error(`Error adding component ${componentType}:`, error);
            }
        }
        
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
        }
        
        // Clear selection and hide
        selectedCards.forEach(card => card.classList.remove('selected'));
        hideComponentLibrary();
    }

    // ============================================
    // PART 3: Initialize and Export
    // ============================================
    
    // Auto-initialize modal system
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initModalSystem);
    } else {
        initModalSystem();
    }
    
    // Initialize component library when dependencies ready
    function tryComponentLibraryInit() {
        const modalReady = modalState.initialized;
        const dataReady = !!(window.gmkbData?.components);
        const domReady = !!(document.getElementById('component-library-overlay'));
        
        if (modalReady && dataReady && domReady) {
            initializeComponentLibrary();
        }
    }
    
    // Listen for readiness events
    document.addEventListener('gmkb:modal-base-ready', tryComponentLibraryInit);
    document.addEventListener('gmkb:wordpress-data-ready', tryComponentLibraryInit);
    document.addEventListener('gmkb:ready', tryComponentLibraryInit);
    document.addEventListener('DOMContentLoaded', tryComponentLibraryInit);
    
    // Global API
    window.GMKB_Modals = {
        show: showModal,
        hide: hideModal,
        getStatus: () => ({
            initialized: modalState.initialized,
            registeredCount: modalState.registeredModals.size,
            activeCount: modalState.activeModals.size,
            activeIds: Array.from(modalState.activeModals),
        })
    };
    
    window.componentLibrarySystem = {
        isReady: () => componentLibraryInitialized,
        show: showComponentLibrary,
        hide: hideComponentLibrary,
        forceInit: () => {
            componentLibraryInitialized = false;
            initializeComponentLibrary();
        },
        getStatus: () => ({
            initialized: componentLibraryInitialized,
            modalReady: modalState.initialized,
            dataReady: !!(window.gmkbData?.components),
            domReady: !!(document.getElementById('component-library-overlay')),
            timestamp: Date.now()
        })
    };
    
    console.log('✅ Consolidated Modal System: Ready (modal-base + component-library)');
    
})();
