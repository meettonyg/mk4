/**
 * @file media-kit-builder.js
 * @description State-Driven MediaKit Builder Core (Gemini's Approach)
 * 
 * ROOT FIX: Simplified, state-driven main application logic that eliminates
 * repetitive DOM manipulation through centralized state and single render function.
 * 
 * ARCHITECTURE: Central state object + single render function + event-driven initialization
 */

/**
 * The MediaKit Builder - Central state-driven application controller
 * This implements Gemini's simplified approach while maintaining WordPress compatibility
 */
export class MediaKitBuilder {
    constructor() {
        // Central state object - single source of truth
        this.state = {
            components: [],
            isLoading: false,
            post_id: null,
            globalSettings: {},
            history: [],
            currentHistoryIndex: -1
        };
        
        this.initialized = false;
        this.wordPressCompatible = true;
        
        console.log('🚀 MediaKit Builder: State-driven core initialized');
    }

    /**
     * Initialize the entire application - single entry point
     */
    async init() {
        console.log('🚀 MediaKit Builder: Starting state-driven initialization...');
        
        try {
            // Validate WordPress environment
            this.validateWordPressData();
            
            // Initialize post ID from DOM
            this.state.post_id = document.body.dataset.postId || null;
            
            // Set up event listeners
            this.bindEventListeners();
            
            // Initialize drag and drop
            this.initializeDragAndDrop();
            
            // Load initial components
            await this.loadInitialComponents();
            
            // Initial render
            this.render();
            
            this.initialized = true;
            
            // Dispatch ready event
            document.dispatchEvent(new CustomEvent('mediaKitBuilderReady', {
                detail: {
                    approach: 'state-driven-gemini',
                    timestamp: Date.now(),
                    wordPressCompatible: true
                }
            }));
            
            console.log('✅ MediaKit Builder: State-driven initialization complete!');
            
        } catch (error) {
            console.error('❌ MediaKit Builder initialization failed:', error);
            this.handleInitializationError(error);
            throw error;
        }
    }

    /**
     * CORE: Single render function - eliminates repetitive DOM manipulation
     * This is the heart of Gemini's simplification approach
     */
    render() {
        const dropZone = document.querySelector('.media-kit__components');
        const emptyState = document.querySelector('.empty-state-optimized');
        
        if (!dropZone) {
            console.warn('⚠️ Drop zone not found - template may not be loaded yet');
            return;
        }

        // Clear current view
        dropZone.innerHTML = '';

        if (this.state.components.length === 0) {
            // Show empty state
            if (emptyState) {
                emptyState.style.display = 'block';
            }
        } else {
            // Hide empty state
            if (emptyState) {
                emptyState.style.display = 'none';
            }
            
            // Render all components
            this.state.components.forEach(comp => {
                const compEl = this.createComponentElement(comp);
                dropZone.appendChild(compEl);
            });
        }
        
        // Update history buttons
        this.updateHistoryButtons();
        
        console.log(`🖌️ UI Rendered: ${this.state.components.length} components`);
    }

    /**
     * Create a component DOM element from component data
     */
    createComponentElement(comp) {
        const compEl = document.createElement('div');
        compEl.className = 'media-kit-component';
        compEl.dataset.componentId = comp.id;
        compEl.dataset.componentType = comp.type;
        
        // Basic component structure
        compEl.innerHTML = `
            <div class="component-wrapper">
                <div class="component-header">
                    <span class="component-type">${comp.type}</span>
                    <div class="component-controls">
                        <button class="component-control" data-action="move-up">↑</button>
                        <button class="component-control" data-action="move-down">↓</button>
                        <button class="component-control" data-action="duplicate">⧉</button>
                        <button class="component-control" data-action="delete">×</button>
                    </div>
                </div>
                <div class="component-content">
                    <h3>${comp.type} Component</h3>
                    <p>ID: ${comp.id}</p>
                    ${comp.content ? `<div class="component-data">${comp.content}</div>` : ''}
                </div>
            </div>
        `;
        
        return compEl;
    }

    /**
     * Add component to state and re-render
     */
    addComponent(type, data = {}) {
        const newComponent = {
            id: Date.now(),
            type: type,
            content: data.content || '',
            settings: data.settings || {},
            created: new Date().toISOString()
        };
        
        // Add to state
        this.state.components.push(newComponent);
        
        // Save to history
        this.saveStateToHistory();
        
        // Re-render UI
        this.render();
        
        console.log(`➕ Component added: ${type} (ID: ${newComponent.id})`);
        
        return newComponent;
    }

    /**
     * Remove component from state and re-render
     */
    removeComponent(componentId) {
        const index = this.state.components.findIndex(comp => comp.id == componentId);
        
        if (index !== -1) {
            const removedComponent = this.state.components.splice(index, 1)[0];
            
            // Save to history
            this.saveStateToHistory();
            
            // Re-render UI
            this.render();
            
            console.log(`➖ Component removed: ${removedComponent.type} (ID: ${componentId})`);
            return true;
        }
        
        console.warn(`⚠️ Component not found for removal: ${componentId}`);
        return false;
    }

    /**
     * Duplicate component
     */
    duplicateComponent(componentId) {
        const originalComponent = this.state.components.find(comp => comp.id == componentId);
        
        if (originalComponent) {
            const duplicatedComponent = {
                ...originalComponent,
                id: Date.now(),
                created: new Date().toISOString()
            };
            
            // Insert after original
            const originalIndex = this.state.components.findIndex(comp => comp.id == componentId);
            this.state.components.splice(originalIndex + 1, 0, duplicatedComponent);
            
            // Save to history
            this.saveStateToHistory();
            
            // Re-render UI
            this.render();
            
            console.log(`⧉ Component duplicated: ${originalComponent.type} (New ID: ${duplicatedComponent.id})`);
            return duplicatedComponent;
        }
        
        return null;
    }

    /**
     * Move component up/down in order
     */
    moveComponent(componentId, direction) {
        const index = this.state.components.findIndex(comp => comp.id == componentId);
        
        if (index === -1) return false;
        
        let newIndex;
        if (direction === 'up' && index > 0) {
            newIndex = index - 1;
        } else if (direction === 'down' && index < this.state.components.length - 1) {
            newIndex = index + 1;
        } else {
            return false; // Can't move
        }
        
        // Swap components
        const [movedComponent] = this.state.components.splice(index, 1);
        this.state.components.splice(newIndex, 0, movedComponent);
        
        // Save to history
        this.saveStateToHistory();
        
        // Re-render UI
        this.render();
        
        console.log(`🔄 Component moved ${direction}: ${movedComponent.type}`);
        return true;
    }

    /**
     * Set up event listeners using delegation
     */
    bindEventListeners() {
        console.log('🎧 Setting up event listeners...');
        
        // Modal triggers
        const modalTrigger = document.querySelector('[data-modal-target="component-library-modal"]');
        if (modalTrigger) {
            modalTrigger.addEventListener('click', () => this.openModal('component-library-modal'));
        }

        // Global click handler using event delegation
        document.body.addEventListener('click', (e) => {
            // Close modal
            if (e.target.classList.contains('modal-close-btn') || e.target.classList.contains('modal-overlay')) {
                const modal = e.target.closest('.modal');
                if (modal) this.closeModal(modal.id);
            }
            
            // Save button
            if (e.target.id === 'save-btn') {
                this.saveMediaKit();
            }
            
            // Undo/Redo buttons
            if (e.target.id === 'undo-btn') {
                this.undo();
            }
            
            if (e.target.id === 'redo-btn') {
                this.redo();
            }
            
            // Add component from library
            if (e.target.classList.contains('component-library-item')) {
                const type = e.target.dataset.componentType;
                this.addComponent(type);
                this.closeModal('component-library-modal');
            }
            
            // Component controls
            if (e.target.classList.contains('component-control')) {
                const action = e.target.dataset.action;
                const componentEl = e.target.closest('.media-kit-component');
                const componentId = componentEl?.dataset.componentId;
                
                if (componentId) {
                    this.handleComponentAction(action, componentId);
                }
            }
        });
        
        console.log('✅ Event listeners attached');
    }

    /**
     * Handle component control actions
     */
    handleComponentAction(action, componentId) {
        switch (action) {
            case 'move-up':
                this.moveComponent(componentId, 'up');
                break;
            case 'move-down':
                this.moveComponent(componentId, 'down');
                break;
            case 'duplicate':
                this.duplicateComponent(componentId);
                break;
            case 'delete':
                this.removeComponent(componentId);
                break;
            default:
                console.warn(`Unknown component action: ${action}`);
        }
    }

    /**
     * Initialize drag and drop functionality
     */
    initializeDragAndDrop() {
        const dropZone = document.querySelector('.media-kit__components');
        if (!dropZone || !window.Sortable) {
            console.warn('⚠️ Drag and drop not available - missing dropZone or Sortable');
            return;
        }

        new Sortable(dropZone, {
            animation: 150,
            ghostClass: 'sortable-ghost',
            onEnd: (evt) => {
                // Update state to match new DOM order
                const newOrder = Array.from(evt.to.children).map(el => {
                    const id = parseInt(el.dataset.componentId, 10);
                    return this.state.components.find(c => c.id === id);
                }).filter(Boolean);
                
                this.state.components = newOrder;
                
                // Save to history
                this.saveStateToHistory();
                
                console.log('🔄 Component order updated via drag and drop');
            }
        });
        
        console.log('✅ Drag and drop initialized');
    }

    /**
     * Load initial components from server/storage
     */
    async loadInitialComponents() {
        if (!this.state.post_id) {
            console.log('ℹ️ No post ID - starting with empty state');
            this.render();
            return;
        }
        
        this.state.isLoading = true;
        
        try {
            console.log('🔄 Loading initial components...');
            
            // Try to load from localStorage first
            const savedState = this.loadStateFromStorage();
            if (savedState && savedState.components && savedState.components.length > 0) {
                this.state = { ...this.state, ...savedState };
                console.log(`✅ Loaded ${this.state.components.length} components from storage`);
            } else {
                // Could load from server here if needed
                console.log('ℹ️ No saved components found');
            }
            
        } catch (error) {
            console.error('❌ Failed to load initial components:', error);
        } finally {
            this.state.isLoading = false;
            this.render();
        }
    }

    /**
     * Save current state to browser storage
     */
    saveStateToStorage() {
        try {
            const stateToSave = {
                components: this.state.components,
                globalSettings: this.state.globalSettings,
                post_id: this.state.post_id,
                saved: new Date().toISOString()
            };
            
            localStorage.setItem('guestifyMediaKitState', JSON.stringify(stateToSave));
            return true;
        } catch (error) {
            console.error('❌ Failed to save state to storage:', error);
            return false;
        }
    }

    /**
     * Load state from browser storage
     */
    loadStateFromStorage() {
        try {
            const saved = localStorage.getItem('guestifyMediaKitState');
            if (saved) {
                return JSON.parse(saved);
            }
        } catch (error) {
            console.warn('⚠️ Failed to load state from storage:', error);
        }
        return null;
    }

    /**
     * Save media kit (to server)
     */
    async saveMediaKit() {
        if (this.state.isLoading) {
            console.log('⏳ Save already in progress...');
            return false;
        }
        
        console.log('💾 Saving media kit...');
        this.state.isLoading = true;
        
        try {
            // Save to localStorage immediately
            const localSaveSuccess = this.saveStateToStorage();
            
            if (localSaveSuccess) {
                this.showToast('Media kit saved!', 'success');
                console.log('✅ Media kit saved successfully!');
                return true;
            } else {
                throw new Error('Local save failed');
            }
            
        } catch (error) {
            console.error('❌ Failed to save media kit:', error);
            this.showToast('Error saving media kit.', 'error');
            return false;
        } finally {
            this.state.isLoading = false;
        }
    }

    /**
     * History management for undo/redo
     */
    saveStateToHistory() {
        // Remove any states after current index (when undoing then making new changes)
        this.state.history = this.state.history.slice(0, this.state.currentHistoryIndex + 1);
        
        // Add current state
        const stateSnapshot = {
            components: JSON.parse(JSON.stringify(this.state.components)),
            timestamp: Date.now()
        };
        
        this.state.history.push(stateSnapshot);
        this.state.currentHistoryIndex++;
        
        // Limit history size
        const maxHistory = 50;
        if (this.state.history.length > maxHistory) {
            this.state.history.shift();
            this.state.currentHistoryIndex--;
        }
        
        this.updateHistoryButtons();
    }

    /**
     * Undo last action
     */
    undo() {
        if (this.state.currentHistoryIndex > 0) {
            this.state.currentHistoryIndex--;
            const previousState = this.state.history[this.state.currentHistoryIndex];
            this.state.components = JSON.parse(JSON.stringify(previousState.components));
            this.render();
            console.log('↩️ Undo successful');
            return true;
        }
        
        console.log('ℹ️ Nothing to undo');
        return false;
    }

    /**
     * Redo last undone action
     */
    redo() {
        if (this.state.currentHistoryIndex < this.state.history.length - 1) {
            this.state.currentHistoryIndex++;
            const nextState = this.state.history[this.state.currentHistoryIndex];
            this.state.components = JSON.parse(JSON.stringify(nextState.components));
            this.render();
            console.log('↪️ Redo successful');
            return true;
        }
        
        console.log('ℹ️ Nothing to redo');
        return false;
    }

    /**
     * Update undo/redo button states
     */
    updateHistoryButtons() {
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) {
            undoBtn.disabled = this.state.currentHistoryIndex <= 0;
        }
        
        if (redoBtn) {
            redoBtn.disabled = this.state.currentHistoryIndex >= this.state.history.length - 1;
        }
    }

    /**
     * Modal management
     */
    openModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.add('active');
        }
    }

    closeModal(modalId) {
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.classList.remove('active');
        }
    }

    /**
     * Show toast notification
     */
    showToast(message, type = 'info') {
        const toast = document.createElement('div');
        toast.className = `gmkb-toast gmkb-toast--${type} show`;
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 500);
        }, 3000);
    }

    /**
     * Validate WordPress environment
     */
    validateWordPressData() {
        if (!window.guestifyData) {
            throw new Error('WordPress guestifyData not available');
        }
        
        const required = ['pluginUrl', 'ajaxUrl', 'nonce'];
        const missing = required.filter(prop => !window.guestifyData[prop]);
        
        if (missing.length > 0) {
            throw new Error(`Missing WordPress data: ${missing.join(', ')}`);
        }
        
        console.log('✅ WordPress data validation passed');
    }

    /**
     * Handle initialization errors
     */
    handleInitializationError(error) {
        const previewContainer = document.getElementById('media-kit-preview');
        if (previewContainer) {
            previewContainer.innerHTML = `
                <div class="initialization-error" style="
                    padding: 40px;
                    text-align: center;
                    background: #fee;
                    border: 2px solid #f88;
                    border-radius: 8px;
                    margin: 20px;
                    color: #d44;
                ">
                    <h2>⚠️ Initialization Error</h2>
                    <p><strong>The Media Kit Builder failed to start properly.</strong></p>
                    <p>Error: ${error.message}</p>
                    <p style="margin-top: 20px;">
                        <button onclick="location.reload()" style="
                            background: #d44;
                            color: white;
                            border: none;
                            padding: 10px 20px;
                            border-radius: 4px;
                            cursor: pointer;
                            font-size: 14px;
                        ">Try Again</button>
                    </p>
                </div>
            `;
        }
    }

    /**
     * Get current state information for debugging
     */
    getState() {
        return {
            components: this.state.components,
            componentCount: this.state.components.length,
            isLoading: this.state.isLoading,
            post_id: this.state.post_id,
            historyLength: this.state.history.length,
            currentHistoryIndex: this.state.currentHistoryIndex,
            initialized: this.initialized
        };
    }
}

// Make available for manual instantiation
window.MediaKitBuilder = MediaKitBuilder;

console.log('📦 MediaKit Builder class loaded and ready for instantiation');
