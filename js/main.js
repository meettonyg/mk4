/**
 * @file main.js
 * @description ROOT FIX: WordPress-Native Dependency Management Entry Point
 * 
 * IMPLEMENTATION: Simplified main entry point that works with WordPress's
 * native dependency management instead of complex script manager approach.
 * 
 * ARCHITECTURE: Clean initialization that relies on WordPress dependency chain
 * to ensure proper loading order and eliminate all race conditions.
 */

console.log('🚀 ROOT FIX: WordPress-Native main.js initializing...');

// ROOT FIX: Simplified global system registry
window.gmkbSystems = {};
window.gmkbSystemsReady = false;
window.gmkbWordPressNative = true;

console.log('✅ ROOT FIX: WordPress-native system registry initialized');

/**
 * ROOT FIX: WordPress-Native System Initialization
 * This function is called after WordPress has loaded all dependencies in the correct order
 */
window.initializeWordPressNativeSystems = async function() {
    console.log('🔄 ROOT FIX: Starting WordPress-native system initialization...');
    
    try {
        // Validate WordPress data is available
        if (!window.guestifyData) {
            throw new Error('WordPress guestifyData not available - enqueue.php issue');
        }
        
        console.log('✅ WordPress data validated:', {
            ajaxUrl: !!window.guestifyData.ajaxUrl,
            nonce: !!window.guestifyData.nonce,
            architecture: window.guestifyData.architecture
        });
        
        // Initialize basic systems in WordPress-compatible way
        await initializeBasicSystems();
        
        // Initialize UI systems
        await initializeUIComponents();
        
        // Initialize enhanced features if available
        await initializeEnhancedFeatures();
        
        // Mark systems as ready
        window.gmkbSystemsReady = true;
        
        // Dispatch ready event
        document.dispatchEvent(new CustomEvent('mediaKitBuilderReady', {
            detail: {
                architecture: 'wordpress-native-dependencies',
                timestamp: Date.now(),
                systemsReady: true
            }
        }));
        
        console.log('🎉 ROOT FIX: WordPress-native initialization complete!');
        return true;
        
    } catch (error) {
        console.error('❌ ROOT FIX: WordPress-native initialization failed:', error);
        
        // Show user-friendly error
        showInitializationError(error);
        return false;
    }
};

/**
 * Initialize basic systems using WordPress-native approach
 */
async function initializeBasicSystems() {
    console.log('🏗️ ROOT FIX: Initializing basic systems...');
    
    // Initialize state manager if not already available
    if (!window.enhancedStateManager && !window.stateManager) {
        window.stateManager = {
            state: { components: {}, layout: [], globalSettings: {} },
            
            getState: function() {
                return this.state;
            },
            
            setState: function(newState) {
                this.state = { ...this.state, ...newState };
                this.notifyStateChange();
            },
            
            addComponent: function(component) {
                const id = component.id || 'component-' + Date.now();
                this.state.components[id] = component;
                if (!this.state.layout.includes(id)) {
                    this.state.layout.push(id);
                }
                this.notifyStateChange();
                return id;
            },
            
            removeComponent: function(id) {
                delete this.state.components[id];
                this.state.layout = this.state.layout.filter(cid => cid !== id);
                this.notifyStateChange();
            },
            
            notifyStateChange: function() {
                document.dispatchEvent(new CustomEvent('stateChanged', {
                    detail: { state: this.state }
                }));
            },
            
            saveToStorage: function() {
                try {
                    localStorage.setItem('guestifyMediaKitState', JSON.stringify(this.state));
                    return true;
                } catch (error) {
                    console.warn('Failed to save to storage:', error);
                    return false;
                }
            },
            
            loadFromStorage: function() {
                try {
                    const saved = localStorage.getItem('guestifyMediaKitState');
                    if (saved) {
                        const data = JSON.parse(saved);
                        this.setState(data);
                        return true;
                    }
                } catch (error) {
                    console.warn('Failed to load from storage:', error);
                }
                return false;
            }
        };
        
        // Also expose as enhanced state manager for compatibility
        window.enhancedStateManager = window.stateManager;
        console.log('✅ State manager initialized');
    }
    
    // Initialize component manager if not available
    if (!window.enhancedComponentManager && !window.componentManager) {
        window.componentManager = {
            components: new Map(),
            
            addComponent: function(id, componentData) {
                this.components.set(id, componentData);
                
                // Update state
                if (window.stateManager) {
                    const stateComponent = { id, ...componentData };
                    window.stateManager.addComponent(stateComponent);
                }
                
                // Render component
                this.renderComponent(id, componentData);
                
                console.log(`✅ Component added: ${id}`);
                return true;
            },
            
            removeComponent: function(id) {
                this.components.delete(id);
                
                // Update state
                if (window.stateManager) {
                    window.stateManager.removeComponent(id);
                }
                
                // Remove from DOM
                const element = document.getElementById(id);
                if (element) {
                    element.remove();
                }
                
                console.log(`✅ Component removed: ${id}`);
                return true;
            },
            
            updateComponent: function(id, componentData) {
                if (this.components.has(id)) {
                    this.components.set(id, componentData);
                    this.renderComponent(id, componentData);
                    return true;
                }
                return false;
            },
            
            renderComponent: function(id, componentData) {
                const previewContainer = document.getElementById('media-kit-preview');
                if (!previewContainer) {
                    console.warn('Preview container not found');
                    return false;
                }
                
                // Hide empty state
                const emptyState = document.getElementById('empty-state');
                if (emptyState) {
                    emptyState.style.display = 'none';
                }
                
                // Create or update component element
                let componentElement = document.getElementById(id);
                if (!componentElement) {
                    componentElement = document.createElement('div');
                    componentElement.id = id;
                    componentElement.className = 'media-kit-component mk-component';
                    componentElement.setAttribute('data-component-type', componentData.type || 'unknown');
                    previewContainer.appendChild(componentElement);
                }
                
                // Basic rendering for WordPress-native mode
                const componentType = componentData.type || 'unknown';
                componentElement.innerHTML = `
                    <div class="component-${componentType}" data-component-id="${id}">
                        <div class="component-header">
                            <h3>${componentType.charAt(0).toUpperCase() + componentType.slice(1)} Component</h3>
                            <div class="component-controls">
                                <button onclick="window.componentManager?.removeComponent('${id}')" class="remove-btn">×</button>
                            </div>
                        </div>
                        <div class="component-content">
                            <p>Component: ${id}</p>
                            <p>Type: ${componentType}</p>
                            <p><em>WordPress-native mode</em></p>
                        </div>
                    </div>
                `;
                
                console.log(`✅ Component rendered: ${id}`);
                return true;
            }
        };
        
        // Also expose as enhanced component manager for compatibility
        window.enhancedComponentManager = window.componentManager;
        console.log('✅ Component manager initialized');
    }
    
    // Initialize renderer if not available
    if (!window.renderer) {
        window.renderer = {
            render: function(componentId, componentData) {
                if (window.componentManager) {
                    return window.componentManager.renderComponent(componentId, componentData);
                }
                return false;
            }
        };
        console.log('✅ Renderer initialized');
    }
    
    console.log('✅ Basic systems initialized successfully');
}

/**
 * Initialize UI components
 */
async function initializeUIComponents() {
    console.log('🎨 ROOT FIX: Initializing UI components...');
    
    // Initialize save button functionality
    const saveBtn = document.getElementById('save-btn');
    if (saveBtn && !saveBtn.dataset.initialized) {
        saveBtn.addEventListener('click', function() {
            console.log('💾 Save button clicked');
            if (window.stateManager && window.stateManager.saveToStorage) {
                const success = window.stateManager.saveToStorage();
                console.log(success ? '✅ Save successful' : '❌ Save failed');
            }
        });
        saveBtn.dataset.initialized = 'true';
        console.log('✅ Save button initialized');
    }
    
    // Initialize undo/redo if buttons exist
    const undoBtn = document.getElementById('undo-btn');
    const redoBtn = document.getElementById('redo-btn');
    
    if (undoBtn && !undoBtn.dataset.initialized) {
        undoBtn.addEventListener('click', function() {
            console.log('↩️ Undo clicked (basic mode)');
        });
        undoBtn.dataset.initialized = 'true';
        console.log('✅ Undo button initialized');
    }
    
    if (redoBtn && !redoBtn.dataset.initialized) {
        redoBtn.addEventListener('click', function() {
            console.log('↪️ Redo clicked (basic mode)');
        });
        redoBtn.dataset.initialized = 'true';
        console.log('✅ Redo button initialized');
    }
    
    // Initialize component library if available
    const componentLibraryBtn = document.getElementById('add-component-btn');
    if (componentLibraryBtn && !componentLibraryBtn.dataset.initialized) {
        componentLibraryBtn.addEventListener('click', function() {
            console.log('🧩 Component library button clicked');
            
            // Try to show component library modal
            const modal = document.getElementById('component-library-overlay');
            if (modal) {
                modal.style.display = 'flex';
            } else {
                console.log('Component library modal not found');
            }
        });
        componentLibraryBtn.dataset.initialized = 'true';
        console.log('✅ Component library button initialized');
    }
    
    console.log('✅ UI components initialized');
}

/**
 * Initialize enhanced features if they're available from other scripts
 */
async function initializeEnhancedFeatures() {
    console.log('⚡ ROOT FIX: Checking for enhanced features...');
    
    // Try to load saved state
    if (window.stateManager && window.stateManager.loadFromStorage) {
        const loaded = window.stateManager.loadFromStorage();
        if (loaded) {
            console.log('✅ Saved state loaded');
            
            // Render loaded components
            const state = window.stateManager.getState();
            if (state.components && Object.keys(state.components).length > 0) {
                Object.entries(state.components).forEach(([id, component]) => {
                    if (window.componentManager && window.componentManager.renderComponent) {
                        window.componentManager.renderComponent(id, component);
                    }
                });
                console.log(`✅ Rendered ${Object.keys(state.components).length} saved components`);
            }
        }
    }
    
    // Check if enhanced systems are available and initialize them
    if (window.enhancedSystemRegistrar) {
        console.log('✅ Enhanced system registrar available');
    }
    
    if (window.initializationManager) {
        console.log('✅ Initialization manager available');
    }
    
    console.log('✅ Enhanced features check complete');
}

/**
 * Show user-friendly initialization error
 */
function showInitializationError(error) {
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
                font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
            ">
                <h2>⚠️ WordPress-Native Initialization Error</h2>
                <p><strong>The Media Kit Builder failed to start properly.</strong></p>
                <p>Error: ${error.message}</p>
                <div style="margin: 20px 0; padding: 15px; background: #f9f9f9; border-radius: 4px; text-align: left;">
                    <strong>🔧 Diagnostics:</strong><br>
                    WordPress Data: ${!!window.guestifyData ? '✅' : '❌'}<br>
                    AJAX URL: ${!!window.guestifyData?.ajaxUrl ? '✅' : '❌'}<br>
                    Nonce: ${!!window.guestifyData?.nonce ? '✅' : '❌'}<br>
                    Architecture: ${window.guestifyData?.architecture || 'Unknown'}
                </div>
                <button onclick="location.reload()" style="
                    background: #d44;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                    margin-right: 10px;
                ">Reload Builder</button>
                <button onclick="window.quickRootFixCheck?.()" style="
                    background: #0073aa;
                    color: white;
                    border: none;
                    padding: 10px 20px;
                    border-radius: 4px;
                    cursor: pointer;
                    font-size: 14px;
                ">Run Diagnostics</button>
            </div>
        `;
    }
}

// ROOT FIX: WordPress-native initialization approach
function startWordPressNativeInitialization() {
    console.log('🚀 ROOT FIX: Starting WordPress-native initialization sequence...');
    
    // Wait for DOM if needed
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeAfterDOM);
    } else {
        initializeAfterDOM();
    }
}

function initializeAfterDOM() {
    console.log('📄 DOM ready, starting WordPress-native initialization...');
    
    // WordPress dependency management ensures scripts load in correct order
    // We can safely initialize now
    window.initializeWordPressNativeSystems();
}

// Expose testing and utility functions
window.addTestComponent = function() {
    if (window.componentManager) {
        const id = 'test-' + Date.now();
        window.componentManager.addComponent(id, {
            type: 'test',
            data: { title: 'Test Component' }
        });
        console.log(`✅ Test component added: ${id}`);
        return id;
    } else {
        console.warn('⚠️ Component manager not available');
        return null;
    }
};

window.saveState = function() {
    if (window.stateManager && window.stateManager.saveToStorage) {
        return window.stateManager.saveToStorage();
    }
    return false;
};

window.loadState = function() {
    if (window.stateManager && window.stateManager.loadFromStorage) {
        return window.stateManager.loadFromStorage();
    }
    return false;
};

window.getSystemStatus = function() {
    return {
        architecture: 'wordpress-native-dependencies',
        systemsReady: window.gmkbSystemsReady,
        wordPressData: !!window.guestifyData,
        stateManager: !!window.stateManager,
        componentManager: !!window.componentManager,
        renderer: !!window.renderer,
        timestamp: Date.now()
    };
};

// Start initialization
startWordPressNativeInitialization();

console.log('🏆 ROOT FIX: WordPress-Native main.js loaded successfully');
console.log('📝 Available commands:');
console.log('  addTestComponent() - Add test component');
console.log('  saveState() - Save current state');
console.log('  loadState() - Load saved state');
console.log('  getSystemStatus() - Get system status');
console.log('  validateRootFix() - Run validation (if test script loaded)');
