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
            // Save button functionality
            const saveBtn = document.getElementById('save-btn');
            if (saveBtn) {
                saveBtn.addEventListener('click', () => {
                    console.log('💾 Save button clicked');
                    window.stateManager.saveStateToStorage();
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
                            data: { title: 'Your Name', subtitle: 'Professional Title' }
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
                            { type: 'hero', data: { title: 'Generated Hero', subtitle: 'Auto-Generated' } },
                            { type: 'biography', data: { content: 'This is an auto-generated biography section.' } },
                            { type: 'topics', data: { topics: ['Topic 1', 'Topic 2', 'Topic 3'] } }
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
        const previewContainer = document.getElementById('preview-container');
        if (previewContainer) {
            document.querySelectorAll('.toolbar__preview-btn').forEach(button => {
                button.addEventListener('click', function() {
                    const previewMode = this.dataset.preview;
                    previewContainer.className = 'preview-container'; // Reset classes
                    previewContainer.classList.add(`preview--${previewMode}`);
                    console.log(`📱 Preview mode changed to: ${previewMode}`);
                });
            });
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
                    data: { title: `New ${componentType}`, subtitle: 'Drag and dropped component' }
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
                        data: { title: `New ${componentType}`, subtitle: 'Added via click' }
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