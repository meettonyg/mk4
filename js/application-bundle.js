/**
 * @file application-bundle.js
 * @description Final Application Bundle that initializes and performs an initial render.
 * @version 2.2.0
 * * This version triggers an initial state change to confirm the rendering pipeline is working.
 */
(function() {
    'use strict';

    let isInitializationComplete = false;

    /**
     * Main function to initialize the entire application.
     */
    async function initializeApplication() {
        if (isInitializationComplete) {
            return;
        }
        console.log('🚀 Initializing Application Systems...');

        if (!window.stateManager || !window.componentManager || !window.renderer) {
            console.error('❌ CRITICAL: Core systems are not available.');
            return;
        }
        console.log('✅ Core systems validated.');

        try {
            // Initialize all systems
            initializeUISystems();
            initializeMKCGFunctionality();
            exposeGlobalCommands();

            isInitializationComplete = true;
            console.log('🎉🎉 Application Bundle successfully initialized!');

            // ROOT FIX: Remove initialization loading message
            const initializingElements = document.querySelectorAll('.gmkb-initializing');
            initializingElements.forEach(el => {
                el.classList.remove('gmkb-initializing');
                el.classList.add('gmkb-ready');
            });
            
            // ROOT FIX: Show empty state or render saved components
            const emptyState = document.getElementById('empty-state');
            const mediaKitPreview = document.getElementById('media-kit-preview');
            
            if (emptyState && mediaKitPreview) {
                // Check if there are saved components to restore
                const savedState = window.stateManager.loadStateFromStorage();
                if (savedState && savedState.components && Object.keys(savedState.components).length > 0) {
                    console.log('🔄 Restoring saved components...');
                    emptyState.style.display = 'none';
                    window.stateManager.setState(savedState);
                } else {
                    console.log('📄 Showing empty state - ready for first component');
                    // Ensure empty state is visible
                    emptyState.style.display = 'block';
                    emptyState.style.visibility = 'visible';
                    emptyState.style.opacity = '1';
                    
                    // Make sure it's not hidden by other styles
                    const computedStyle = window.getComputedStyle(emptyState);
                    console.log('Empty state computed display:', computedStyle.display);
                    console.log('Empty state computed visibility:', computedStyle.visibility);
                }
            } else {
                console.warn('⚠️ Empty state or preview container not found!');
                console.log('Empty state element:', emptyState);
                console.log('Preview container element:', mediaKitPreview);
            }

            // --- FINAL FIX ---
            // Trigger the first render by setting an initial state.
            // This confirms the entire system is working end-to-end.
            console.log('🎨 Triggering initial render...');
            const savedState = window.stateManager.loadStateFromStorage();
            if (!savedState || !savedState.components || Object.keys(savedState.components).length === 0) {
                window.stateManager.setState({
                    status: 'Ready',
                    message: 'Welcome to your Media Kit!',
                    components: {}
                });
            }

        } catch (error) {
            console.error('❌ A fatal error occurred during application initialization:', error);
        }
    }

    function initializeUISystems() {
        // ROOT FIX: Enhanced UI system initialization with error handling
        try {
            // Initialize component selection and design panel
            initializeComponentSelection();
            
            // Initialize component controls
            initializeComponentControls();
            
            // Initialize save functionality
            initializeSaveSystem();
            
            // Initialize undo/redo system
            initializeUndoRedo();
            
            // Save button functionality
            const saveBtn = document.getElementById('save-btn');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    console.log('💾 Save button clicked');
                    const success = window.stateManager.saveStateToStorage();
                    if (success) {
                        // Show save success feedback
                        const originalText = saveBtn.innerHTML;
                        saveBtn.innerHTML = `
                            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                                <path d="M20 6L9 17l-5-5"></path>
                            </svg>
                            <span>Saved!</span>
                        `;
                        saveBtn.style.background = '#10b981';
                        
                        setTimeout(() => {
                            saveBtn.innerHTML = originalText;
                            saveBtn.style.background = '';
                            saveBtn.classList.remove('unsaved');
                        }, 2000);
                    }
                });
            }
            
            // Add component button functionality
            const addComponentBtn = document.getElementById('add-first-component');
            if (addComponentBtn) {
                addComponentBtn.addEventListener('click', () => {
                    console.log('➕ Add component button clicked');
                    // Show component library or add basic component
                    const emptyState = document.getElementById('empty-state');
                    if (emptyState) {
                        emptyState.style.display = 'none';
                    }
                    
                    // Add a basic hero component for demonstration
                    if (window.enhancedComponentManager && window.enhancedComponentManager.addComponent) {
                        window.enhancedComponentManager.addComponent('hero-' + Date.now(), {
                            type: 'hero',
                            data: { name: 'Your Name', title: 'Professional Title', bio: 'Add your bio here' }
                        });
                    }
                });
            }
            
            // Auto-generate button functionality
            const autoGenerateBtn = document.getElementById('auto-generate-btn');
            if (autoGenerateBtn) {
                autoGenerateBtn.addEventListener('click', () => {
                    console.log('⚡ Auto-generate button clicked');
                    // Hide empty state and show generated components
                    const emptyState = document.getElementById('empty-state');
                    if (emptyState) {
                        emptyState.style.display = 'none';
                    }
                    
                    // Add multiple components for demonstration
                    if (window.enhancedComponentManager && window.enhancedComponentManager.addComponent) {
                        const components = [
                            { type: 'hero', data: { name: 'Generated Hero', title: 'Auto-Generated', bio: 'This is an auto-generated hero section.' } },
                            { type: 'biography', data: { name: 'Biography', title: 'About Me', bio: 'This is an auto-generated biography section.' } },
                            { type: 'topics', data: { name: 'Topics', title: 'Speaking Topics', bio: 'Topic 1, Topic 2, Topic 3' } }
                        ];
                        
                        components.forEach((comp, index) => {
                            setTimeout(() => {
                                window.enhancedComponentManager.addComponent(comp.type + '-' + Date.now(), comp);
                            }, index * 200); // Stagger the additions
                        });
                    }
                });
            }
            
            // ROOT FIX: Initialize drag and drop functionality
            initializeDragAndDrop();
            
            // ROOT FIX: Initialize sidebar component interactions
            initializeSidebarComponents();
            
            // ROOT FIX: Initialize tabs functionality
            initializeTabsFunctionality();
            
            console.log('✅ UI Systems Initialized');
        } catch (error) {
            console.error('❌ Error initializing UI systems:', error);
        }
    }

    function initializeMKCGFunctionality() {
        // ROOT FIX: Preview mode functionality
        const previewContainer = document.getElementById('preview-container');
        console.log('🔍 Preview container found:', !!previewContainer);
        
        if (previewContainer) {
            const previewButtons = document.querySelectorAll('.toolbar__preview-btn');
            console.log('🔍 Preview buttons found:', previewButtons.length);
            
            previewButtons.forEach(button => {
                button.addEventListener('click', function(e) {
                    e.preventDefault();
                    const previewMode = this.dataset.preview;
                    console.log(`📱 Preview button clicked: ${previewMode}`);
                    
                    // Remove active class from all preview buttons
                    previewButtons.forEach(btn => {
                        btn.classList.remove('toolbar__preview-btn--active');
                    });
                    
                    // Add active class to clicked button
                    this.classList.add('toolbar__preview-btn--active');
                    
                    // Find the actual preview container with the media kit
                    const mediaKitContainer = document.querySelector('.preview__container');
                    const fallbackContainer = document.querySelector('.preview');
                    const targetContainer = mediaKitContainer || fallbackContainer || previewContainer;
                    
                    if (targetContainer) {
                        // Remove existing preview classes
                        targetContainer.classList.remove('preview--tablet', 'preview--mobile', 'preview--desktop');
                        
                        // Add new preview class (except for desktop which is default)
                        if (previewMode !== 'desktop') {
                            targetContainer.classList.add(`preview--${previewMode}`);
                        }
                        
                        console.log(`✅ Preview mode applied: ${previewMode}`);
                        console.log('🎯 Target container classes:', targetContainer.className);
                    } else {
                        console.warn('⚠️ No suitable container found for preview mode');
                    }
                });
            });
        } else {
            console.warn('⚠️ Preview container not found!');
        }
        
        console.log('✅ MKCG Functionality Initialized');
    }

    function exposeGlobalCommands() {
        window.triggerSave = () => window.stateManager.saveStateToStorage();
        console.log('✅ Global Commands Exposed');
    }
    
    // ROOT FIX: Drag and Drop Implementation
    function initializeDragAndDrop() {
        console.log('👯 Initializing drag and drop...');
        
        const previewContainer = document.getElementById('media-kit-preview');
        const componentItems = document.querySelectorAll('.component-item[draggable="true"]');
        
        if (!previewContainer) {
            console.warn('⚠️ Preview container not found for drag and drop');
            return;
        }
        
        // Make preview container a drop zone
        previewContainer.addEventListener('dragover', (e) => {
            e.preventDefault();
            previewContainer.style.backgroundColor = '#f0f9ff';
            previewContainer.style.border = '2px dashed #3b82f6';
        });
        
        previewContainer.addEventListener('dragleave', (e) => {
            previewContainer.style.backgroundColor = '';
            previewContainer.style.border = '';
        });
        
        previewContainer.addEventListener('drop', (e) => {
            e.preventDefault();
            previewContainer.style.backgroundColor = '';
            previewContainer.style.border = '';
            
            const componentType = e.dataTransfer.getData('component-type');
            if (componentType && window.enhancedComponentManager) {
                console.log(`🎨 Dropped component: ${componentType}`);
                
                // Hide empty state
                const emptyState = document.getElementById('empty-state');
                if (emptyState) {
                    emptyState.style.display = 'none';
                }
                
                // Add the component
                window.enhancedComponentManager.addComponent(componentType + '-' + Date.now(), {
                    type: componentType,
                    data: { 
                        name: `New ${componentType}`, 
                        title: 'Professional Title', 
                        bio: 'Add your description here'
                    }
                });
            }
        });
        
        // Set up drag start for component items
        componentItems.forEach(item => {
            item.addEventListener('dragstart', (e) => {
                const componentType = item.getAttribute('data-component');
                e.dataTransfer.setData('component-type', componentType);
                item.style.opacity = '0.5';
                console.log(`📄 Started dragging: ${componentType}`);
            });
            
            item.addEventListener('dragend', (e) => {
                item.style.opacity = '1';
            });
        });
        
        console.log(`✅ Drag and drop initialized for ${componentItems.length} components`);
    }
    
    // ROOT FIX: Sidebar Component Interactions
    function initializeSidebarComponents() {
        console.log('🗂️ Initializing sidebar components...');
        
        // Add click handlers for component items
        const componentItems = document.querySelectorAll('.component-item');
        componentItems.forEach(item => {
            item.addEventListener('click', () => {
                const componentType = item.getAttribute('data-component');
                if (componentType && window.enhancedComponentManager) {
                    console.log(`👆 Clicked component: ${componentType}`);
                    
                    // Hide empty state
                    const emptyState = document.getElementById('empty-state');
                    if (emptyState) {
                        emptyState.style.display = 'none';
                    }
                    
                    // Add the component
                    window.enhancedComponentManager.addComponent(componentType + '-' + Date.now(), {
                        type: componentType,
                        data: { 
                            name: `New ${componentType}`, 
                            title: 'Professional Title', 
                            bio: 'Add your description here'
                        }
                    });
                }
            });
        });
        
        console.log(`✅ Sidebar interactions initialized for ${componentItems.length} components`);
    }
    
    // ROOT FIX: Tabs Functionality
    function initializeTabsFunctionality() {
        console.log('🗂️ Initializing tabs functionality...');
        
        const tabButtons = document.querySelectorAll('.sidebar__tab');
        const tabContents = document.querySelectorAll('.tab-content');
        
        tabButtons.forEach(button => {
            button.addEventListener('click', () => {
                const targetTab = button.getAttribute('data-tab');
                console.log(`🗂️ Switching to tab: ${targetTab}`);
                
                // Remove active classes
                tabButtons.forEach(btn => btn.classList.remove('sidebar__tab--active'));
                tabContents.forEach(content => content.classList.remove('tab-content--active'));
                
                // Add active class to clicked button
                button.classList.add('sidebar__tab--active');
                
                // Show corresponding content
                const targetContent = document.getElementById(`${targetTab}-tab`);
                if (targetContent) {
                    targetContent.classList.add('tab-content--active');
                }
            });
        });
        
        console.log(`✅ Tabs functionality initialized for ${tabButtons.length} tabs`);
    }
    
    // ROOT FIX: Component Selection and Design Panel Integration
    function initializeComponentSelection() {
        console.log('🎯 Initializing component selection...');
        
        const previewContainer = document.getElementById('media-kit-preview');
        let selectedComponent = null;
        
        if (!previewContainer) {
            console.warn('⚠️ Preview container not found for component selection');
            return;
        }
        
        // Handle component selection clicks
        previewContainer.addEventListener('click', (e) => {
            // Don't interfere with control button clicks
            if (e.target.closest('.control-btn')) {
                return;
            }
            
            // Find the clicked component
            const componentElement = e.target.closest('[data-component-id]');
            
            if (componentElement) {
                e.stopPropagation();
                selectComponent(componentElement);
            } else {
                // Clicked on empty area, deselect
                selectComponent(null);
            }
        });
        
        function selectComponent(element) {
            // Remove previous selection
            if (selectedComponent) {
                selectedComponent.classList.remove('component-selected');
                const oldControls = selectedComponent.querySelector('.element-controls');
                if (oldControls) {
                    oldControls.style.display = 'none';
                }
            }
            
            selectedComponent = element;
            
            if (selectedComponent) {
                selectedComponent.classList.add('component-selected');
                
                // Show controls for the selected component
                let controls = selectedComponent.querySelector('.element-controls');
                if (!controls) {
                    controls = createControlButtons();
                    selectedComponent.appendChild(controls);
                }
                controls.style.display = 'flex';
                
                // Load design panel
                const componentId = selectedComponent.getAttribute('data-component-id');
                if (componentId) {
                    loadDesignPanel(componentId);
                    console.log(`🎯 Component selected: ${componentId}`);
                }
            } else {
                // Hide design panel
                hideDesignPanel();
            }
        }
        
        function createControlButtons() {
            const controls = document.createElement('div');
            controls.className = 'element-controls';
            controls.style.cssText = `
                position: absolute;
                top: 8px;
                right: 8px;
                display: none;
                gap: 4px;
                background: rgba(0, 0, 0, 0.8);
                padding: 4px;
                border-radius: 6px;
                z-index: 10;
            `;
            
            controls.innerHTML = `
                <button class="control-btn" title="Move Up" data-action="move-up">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="18 15 12 9 6 15"></polyline>
                    </svg>
                </button>
                <button class="control-btn" title="Move Down" data-action="move-down">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="6 9 12 15 18 9"></polyline>
                    </svg>
                </button>
                <button class="control-btn" title="Duplicate" data-action="duplicate">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
                    </svg>
                </button>
                <button class="control-btn" title="Delete" data-action="delete">
                    <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                    </svg>
                </button>
            `;
            
            return controls;
        }
        
        console.log('✅ Component selection initialized');
    }
    
    // ROOT FIX: Component Controls Functionality
    function initializeComponentControls() {
        console.log('🎮 Initializing component controls...');
        
        const previewContainer = document.getElementById('media-kit-preview');
        
        if (!previewContainer) {
            console.warn('⚠️ Preview container not found for component controls');
            return;
        }
        
        // Use event delegation for control buttons
        previewContainer.addEventListener('click', (e) => {
            const controlBtn = e.target.closest('.control-btn');
            if (!controlBtn) return;
            
            e.stopPropagation();
            e.preventDefault();
            
            const componentElement = controlBtn.closest('[data-component-id]');
            const componentId = componentElement?.getAttribute('data-component-id');
            
            if (!componentId) {
                console.warn('Control button clicked but no component ID found');
                return;
            }
            
            const action = controlBtn.getAttribute('data-action') || controlBtn.getAttribute('title');
            console.log(`🎮 Control action: ${action} on component: ${componentId}`);
            
            handleComponentAction(componentId, action, componentElement);
        });
        
        function handleComponentAction(componentId, action, element) {
            switch (action) {
                case 'move-up':
                case 'Move Up':
                    moveComponent(componentId, 'up');
                    break;
                case 'move-down':
                case 'Move Down':
                    moveComponent(componentId, 'down');
                    break;
                case 'duplicate':
                case 'Duplicate':
                    duplicateComponent(componentId);
                    break;
                case 'delete':
                case 'Delete':
                    deleteComponent(componentId);
                    break;
                default:
                    console.warn('Unknown action:', action);
            }
        }
        
        function moveComponent(componentId, direction) {
            console.log(`🔄 Moving component ${componentId} ${direction}`);
            
            const previewContainer = document.getElementById('media-kit-preview');
            const componentElement = document.getElementById(componentId);
            
            if (!componentElement || !previewContainer) return;
            
            const allComponents = Array.from(previewContainer.querySelectorAll('[data-component-id]'));
            const currentIndex = allComponents.indexOf(componentElement);
            
            if (direction === 'up' && currentIndex > 0) {
                const previousElement = allComponents[currentIndex - 1];
                previewContainer.insertBefore(componentElement, previousElement);
            } else if (direction === 'down' && currentIndex < allComponents.length - 1) {
                const nextElement = allComponents[currentIndex + 1];
                previewContainer.insertBefore(nextElement, componentElement);
            }
            
            // Save state after move
            markUnsaved();
        }
        
        function duplicateComponent(componentId) {
            console.log(`🔄 Duplicating component ${componentId}`);
            
            if (!window.enhancedComponentManager) {
                console.warn('Enhanced component manager not available');
                return;
            }
            
            // Get the current component data
            const currentState = window.stateManager._state;
            const componentData = currentState.components[componentId];
            
            if (componentData) {
                const newId = componentData.type + '-copy-' + Date.now();
                window.enhancedComponentManager.addComponent(newId, {
                    ...componentData,
                    data: {
                        ...componentData.data,
                        name: (componentData.data?.name || componentData.type) + ' (Copy)'
                    }
                });
            }
        }
        
        function deleteComponent(componentId) {
            console.log(`🗑️ Deleting component ${componentId}`);
            
            if (window.enhancedComponentManager && window.enhancedComponentManager.removeComponent) {
                window.enhancedComponentManager.removeComponent(componentId);
            } else if (window.componentManager && window.componentManager.removeComponent) {
                window.componentManager.removeComponent(componentId);
            }
        }
        
        console.log('✅ Component controls initialized');
    }
    
    // ROOT FIX: Save System
    function initializeSaveSystem() {
        console.log('💾 Initializing save system...');
        
        // Global save function
        window.triggerSave = () => {
            const success = window.stateManager.saveStateToStorage();
            if (success) {
                showSaveSuccess();
            }
            return success;
        };
        
        function showSaveSuccess() {
            const saveBtn = document.getElementById('save-btn');
            if (saveBtn) {
                const originalText = saveBtn.innerHTML;
                saveBtn.innerHTML = `
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M20 6L9 17l-5-5"></path>
                    </svg>
                    <span>Saved!</span>
                `;
                saveBtn.style.background = '#10b981';
                
                setTimeout(() => {
                    saveBtn.innerHTML = originalText;
                    saveBtn.style.background = '';
                }, 2000);
            }
        }
        
        // Mark as unsaved function
        window.markUnsaved = markUnsaved;
        
        console.log('✅ Save system initialized');
    }
    
    // ROOT FIX: Undo/Redo System
    function initializeUndoRedo() {
        console.log('↩️ Initializing undo/redo system...');
        
        let stateHistory = [];
        let currentHistoryIndex = -1;
        const maxHistorySteps = 50;
        
        // Save initial state
        saveStateToHistory();
        
        function saveStateToHistory() {
            const currentState = JSON.parse(JSON.stringify(window.stateManager._state));
            
            // Remove any steps after current index (when user made changes after undo)
            stateHistory = stateHistory.slice(0, currentHistoryIndex + 1);
            
            // Add new state
            stateHistory.push(currentState);
            currentHistoryIndex = stateHistory.length - 1;
            
            // Limit history size
            if (stateHistory.length > maxHistorySteps) {
                stateHistory = stateHistory.slice(-maxHistorySteps);
                currentHistoryIndex = stateHistory.length - 1;
            }
            
            updateUndoRedoButtons();
        }
        
        function undo() {
            if (currentHistoryIndex > 0) {
                currentHistoryIndex--;
                const previousState = stateHistory[currentHistoryIndex];
                window.stateManager.setState(previousState);
                updateUndoRedoButtons();
                console.log('↩️ Undo performed');
            }
        }
        
        function redo() {
            if (currentHistoryIndex < stateHistory.length - 1) {
                currentHistoryIndex++;
                const nextState = stateHistory[currentHistoryIndex];
                window.stateManager.setState(nextState);
                updateUndoRedoButtons();
                console.log('↪️ Redo performed');
            }
        }
        
        function updateUndoRedoButtons() {
            const undoBtn = document.getElementById('undo-btn');
            const redoBtn = document.getElementById('redo-btn');
            
            if (undoBtn) {
                undoBtn.disabled = currentHistoryIndex <= 0;
            }
            
            if (redoBtn) {
                redoBtn.disabled = currentHistoryIndex >= stateHistory.length - 1;
            }
        }
        
        // Listen for state changes to save to history
        document.addEventListener('stateChanged', () => {
            // Debounce to avoid saving too frequently
            clearTimeout(window.undoRedoTimeout);
            window.undoRedoTimeout = setTimeout(saveStateToHistory, 1000);
        });
        
        // Add event listeners to undo/redo buttons
        const undoBtn = document.getElementById('undo-btn');
        const redoBtn = document.getElementById('redo-btn');
        
        if (undoBtn) {
            undoBtn.addEventListener('click', undo);
        }
        
        if (redoBtn) {
            redoBtn.addEventListener('click', redo);
        }
        
        // Keyboard shortcuts
        document.addEventListener('keydown', (e) => {
            if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
                e.preventDefault();
                if (e.shiftKey) {
                    redo();
                } else {
                    undo();
                }
            }
        });
        
        // Global functions
        window.undo = undo;
        window.redo = redo;
        
        updateUndoRedoButtons();
        console.log('✅ Undo/redo system initialized');
    }
    
    // ROOT FIX: Design Panel Integration with AJAX loading
    function loadDesignPanel(componentId) {
        console.log(`📋 Loading design panel for ${componentId}`);
        
        // Switch to design tab
        const designTab = document.querySelector('[data-tab="design"]');
        const designTabContent = document.getElementById('design-tab');
        
        if (designTab && designTabContent) {
            // Remove active from all tabs
            document.querySelectorAll('.sidebar__tab').forEach(tab => {
                tab.classList.remove('sidebar__tab--active');
            });
            document.querySelectorAll('.tab-content').forEach(content => {
                content.classList.remove('tab-content--active');
            });
            
            // Activate design tab
            designTab.classList.add('sidebar__tab--active');
            designTabContent.classList.add('tab-content--active');
        }
        
        // Load component settings via AJAX
        const elementEditor = document.getElementById('element-editor');
        if (elementEditor) {
            // Get component data
            const currentState = window.stateManager._state;
            const componentData = currentState.components[componentId];
            
            if (componentData) {
                // Show loading state
                elementEditor.innerHTML = `
                    <div class="element-editor__title">Loading ${componentData.type} Settings...</div>
                    <div class="element-editor__subtitle">Please wait while we load the design panel</div>
                    <div class="loading-spinner" style="text-align: center; padding: 20px;">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" style="animation: spin 1s linear infinite;">
                            <path d="M21 12a9 9 0 11-6.219-8.56"/>
                        </svg>
                        <p style="margin-top: 10px; color: #64748b;">Loading design panel...</p>
                    </div>
                    <style>
                        @keyframes spin {
                            from { transform: rotate(0deg); }
                            to { transform: rotate(360deg); }
                        }
                    </style>
                `;
                
                // ROOT FIX: Use AJAX to load component-specific design panel
                const formData = new FormData();
                formData.append('action', 'guestify_render_design_panel');
                formData.append('component', componentData.type);
                formData.append('component_id', componentId);
                formData.append('nonce', window.guestifyData?.nonce || window.guestifyData?.restNonce || '');
                
                fetch(window.guestifyData?.ajaxUrl || window.ajaxurl || '/wp-admin/admin-ajax.php', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success && data.data.html) {
                        // Load the component-specific design panel
                        elementEditor.innerHTML = data.data.html;
                        
                        console.log(`✅ Loaded design panel for ${componentData.type}`);
                        
                        // ROOT FIX: Initialize component-specific panel scripts
                        initializeComponentPanelScripts(componentData.type, componentId);
                        
                        // Bind basic property changes for fallback
                        bindBasicPropertyChanges(elementEditor, componentId, componentData);
                        
                    } else {
                        // Fallback to generic panel
                        console.warn(`⚠️ Failed to load design panel for ${componentData.type}, using fallback`);
                        loadGenericDesignPanel(elementEditor, componentId, componentData);
                    }
                })
                .catch(error => {
                    console.error(`❌ Error loading design panel for ${componentData.type}:`, error);
                    // Fallback to generic panel
                    loadGenericDesignPanel(elementEditor, componentId, componentData);
                });
            }
        }
    }
    
    // ROOT FIX: Generic design panel fallback
    function loadGenericDesignPanel(elementEditor, componentId, componentData) {
        elementEditor.innerHTML = `
            <div class="element-editor__title">${componentData.type} Settings</div>
            <div class="element-editor__subtitle">Component ID: ${componentId}</div>
            
            <div class="form-section">
                <h4 class="form-section__title">Basic Properties</h4>
                <div class="form-field">
                    <label>Name</label>
                    <input type="text" value="${componentData.data?.name || ''}" data-property="name">
                </div>
                <div class="form-field">
                    <label>Title</label>
                    <input type="text" value="${componentData.data?.title || ''}" data-property="title">
                </div>
                <div class="form-field">
                    <label>Description</label>
                    <textarea data-property="bio">${componentData.data?.bio || ''}</textarea>
                </div>
            </div>
            
            <div class="form-section">
                <h4 class="form-section__title">Actions</h4>
                <button class="btn btn--outline" onclick="window.undo()">Undo</button>
                <button class="btn btn--outline" onclick="window.redo()">Redo</button>
                <button class="btn btn--danger" onclick="window.enhancedComponentManager?.removeComponent('${componentId}')">Delete Component</button>
            </div>
        `;
        
        bindBasicPropertyChanges(elementEditor, componentId, componentData);
    }
    
    // ROOT FIX: Bind basic property changes for any design panel
    function bindBasicPropertyChanges(elementEditor, componentId, componentData) {
        elementEditor.querySelectorAll('[data-property]').forEach(input => {
            input.addEventListener('input', () => {
                const property = input.getAttribute('data-property');
                const value = input.value;
                
                // Update component data
                const currentState = window.stateManager._state;
                const newData = { ...componentData.data };
                newData[property] = value;
                
                // Update state
                const newComponents = { ...currentState.components };
                newComponents[componentId] = {
                    ...componentData,
                    data: newData
                };
                
                window.stateManager.setState({
                    ...currentState,
                    components: newComponents
                });
                
                markUnsaved();
            });
        });
    }
    
    // ROOT FIX: Initialize component-specific panel scripts
    function initializeComponentPanelScripts(componentType, componentId) {
        console.log(`🎯 Initializing panel scripts for ${componentType}`);
        
        try {
            // ROOT FIX: Handle topics component specifically
            if (componentType === 'topics') {
                // Initialize topics panel if the script is available
                if (window.topicsPanel && window.topicsPanel.initialize) {
                    const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
                    if (componentElement) {
                        window.topicsPanel.initialize(componentElement);
                        console.log(`✅ Topics panel initialized for ${componentId}`);
                    }
                } else {
                    console.log(`📝 Topics panel script not yet loaded, will initialize when available`);
                    
                    // ROOT FIX: Load topics panel script if not already loaded
                    loadComponentPanelScript(componentType, componentId);
                }
            }
            
            // ROOT FIX: Handle other component types
            else {
                // Check if component has its own panel script
                const panelFunction = window[`${componentType}Panel`];
                if (panelFunction && panelFunction.initialize) {
                    const componentElement = document.querySelector(`[data-component-id="${componentId}"]`);
                    if (componentElement) {
                        panelFunction.initialize(componentElement);
                        console.log(`✅ ${componentType} panel initialized`);
                    }
                } else {
                    // Load panel script if not available
                    loadComponentPanelScript(componentType, componentId);
                }
            }
            
        } catch (error) {
            console.error(`❌ Error initializing panel scripts for ${componentType}:`, error);
        }
    }
    
    // ROOT FIX: Load component panel script dynamically
    function loadComponentPanelScript(componentType, componentId) {
        const scriptUrl = `${window.guestifyData?.pluginUrl || ''}components/${componentType}/panel-script.js`;
        
        // Check if script is already loaded
        if (document.querySelector(`script[src*="${componentType}/panel-script.js"]`)) {
            console.log(`📝 Panel script for ${componentType} already loaded`);
            return;
        }
        
        console.log(`📦 Loading panel script for ${componentType}...`);
        
        const script = document.createElement('script');
        script.src = scriptUrl;
        script.onload = () => {
            console.log(`✅ Panel script loaded for ${componentType}`);
            
            // Initialize after script loads
            setTimeout(() => {
                initializeComponentPanelScripts(componentType, componentId);
            }, 100);
        };
        script.onerror = () => {
            console.warn(`⚠️ Failed to load panel script for ${componentType}`);
        };
        
        document.head.appendChild(script);
    }
    
    function hideDesignPanel() {
        const elementEditor = document.getElementById('element-editor');
        if (elementEditor) {
            elementEditor.innerHTML = `
                <div class="element-editor__title">No Element Selected</div>
                <div class="element-editor__subtitle">Click on any element in the preview to edit its properties</div>
                
                <div class="form-section">
                    <h4 class="form-section__title">Getting Started</h4>
                    <ul class="tips-list">
                        <li>Select an element by clicking on it in the preview</li>
                        <li>Use the design panel to customize properties</li>
                        <li>Some components allow direct inline editing</li>
                        <li>Changes are saved automatically</li>
                    </ul>
                </div>
            `;
        }
    }
    
    function markUnsaved() {
        const saveBtn = document.getElementById('save-btn');
        if (saveBtn && !saveBtn.classList.contains('unsaved')) {
            saveBtn.classList.add('unsaved');
            const span = saveBtn.querySelector('span');
            if (span) {
                span.textContent = 'Save*';
            }
        }
    }

    /**
     * Waits for the 'coreSystemsReady' event OR checks if it already fired.
     */
    function listenForCoreSystems() {
        if (window.gmkbCoreSystemsReadyFired) {
            console.log('✅ Core event flag was already set. Initializing application immediately.');
            initializeApplication();
            return;
        }

        console.log('🎧 Waiting for core systems to be ready...');
        document.addEventListener('coreSystemsReady', function onCoreSystemsReady() {
            console.log('✅ Event "coreSystemsReady" received! Starting application.');
            initializeApplication();
        }, { once: true });
    }

    // Start the process
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', listenForCoreSystems);
    } else {
        listenForCoreSystems();
    }

})();