/**
 * @file modal-base.js - Simplified, Event-Driven Modal System
 * @description Provides a clean, centralized system for managing all modals.
 * It dispatches an event when ready, allowing other scripts to
 * initialize reliably without race conditions.
 * @version 2.0.0
 */

(function() {
    'use strict';

    // Self-initializing state
    const state = {
        initialized: false,
        activeModals: new Set(),
        registeredModals: new Map(),
    };

    /**
     * Initializes the entire modal system.
     * This function should be called once, preferably on DOMContentLoaded.
     */
    function init() {
        if (state.initialized) {
            console.warn('Modal system already initialized.');
            return;
        }

        console.log('🔄 Initializing Modal System...');

        // Discover and register all modals present in the DOM
        document.querySelectorAll('.modal-overlay, .library-modal').forEach(modalElement => {
            registerModal(modalElement);
        });

        // Global ESC key listener
        document.addEventListener('keydown', handleEscKey);

        state.initialized = true;
        console.log(`✅ Modal System Initialized: ${state.registeredModals.size} modals registered.`);

        // --- ROOT FIX: Announce readiness via a custom event ---
        // This is the key change that allows other scripts to hook into the modal
        // system reliably without polling or setTimeout hacks.
        document.dispatchEvent(new CustomEvent('gmkb:modal-base-ready', {
            detail: {
                registeredModalIds: Array.from(state.registeredModals.keys()),
                timestamp: Date.now(),
            }
        }));
    }

    /**
     * Registers a modal, making it known to the system and setting up its listeners.
     * @param {HTMLElement} modalElement The modal's top-level element.
     */
    function registerModal(modalElement) {
        const modalId = modalElement.id;
        if (!modalId) {
            console.warn('Modal found without an ID, skipping registration.', modalElement);
            return;
        }

        if (state.registeredModals.has(modalId)) {
            return; // Already registered
        }

        // Set up close triggers within this specific modal
        const closeButtons = modalElement.querySelectorAll('.modal__close, .library__close, .close-modal, [data-modal-close]');
        closeButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                hideModal(modalId);
            });
        });

        // Backdrop click listener
        modalElement.addEventListener('click', (e) => {
            if (e.target === modalElement) {
                hideModal(modalId);
            }
        });
        
        state.registeredModals.set(modalId, modalElement);
        console.log(`🔹 Modal Registered: ${modalId}`);
    }

    /**
     * Shows a modal by its ID.
     * @param {string} modalId The ID of the modal to show.
     */
    function showModal(modalId) {
        if (!state.initialized) {
            console.error('Modal system not initialized. Cannot show modal.');
            return;
        }

        const modal = state.registeredModals.get(modalId);
        if (!modal) {
            console.error(`Modal with ID '${modalId}' not found.`);
            return;
        }

        modal.style.display = 'flex'; // Or use a class like 'is-visible'
        document.body.classList.add('modal-open');
        state.activeModals.add(modalId);
        
        console.log(`🔵 Modal Shown: ${modalId}`);
        dispatchModalEvent('gmkb:modal-shown', modalId);
    }

    /**
     * Hides a modal by its ID.
     * @param {string} modalId The ID of the modal to hide.
     */
    function hideModal(modalId) {
        if (!state.initialized) {
            return;
        }
        
        const modal = state.registeredModals.get(modalId);
        if (!modal) {
            console.error(`Modal with ID '${modalId}' not found.`);
            return;
        }

        modal.style.display = 'none';
        state.activeModals.delete(modalId);

        // Only remove the body class if no other modals are active
        if (state.activeModals.size === 0) {
            document.body.classList.remove('modal-open');
        }
        
        console.log(`⚪️ Modal Hidden: ${modalId}`);
        dispatchModalEvent('gmkb:modal-hidden', modalId);
    }
    
    /**
     * Global handler for the Escape key to close the top-most active modal.
     * @param {KeyboardEvent} e The keyboard event.
     */
    function handleEscKey(e) {
        if (e.key === 'Escape' && state.activeModals.size > 0) {
            // Get the last modal that was opened
            const lastActiveModalId = Array.from(state.activeModals).pop();
            hideModal(lastActiveModalId);
        }
    }
    
    /**
     * Helper to dispatch custom events related to modal state changes.
     * @param {string} eventName The name of the event.
     * @param {string} modalId The ID of the modal involved.
     */
    function dispatchModalEvent(eventName, modalId) {
        document.dispatchEvent(new CustomEvent(eventName, {
            detail: { modalId, timestamp: Date.now() }
        }));
    }

    // --- Public API ---
    // Expose a clean, simple API on a global namespace.
    window.GMKB_Modals = {
        show: showModal,
        hide: hideModal,
        getStatus: () => ({
            initialized: state.initialized,
            registeredCount: state.registeredModals.size,
            activeCount: state.activeModals.size,
            activeIds: Array.from(state.activeModals),
        })
    };
    
    // --- Auto-Initialization ---
    // Automatically initialize the system when the DOM is ready.
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', init);
    } else {
        // DOM is already ready
        init();
    }

})();