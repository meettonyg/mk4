/**
 * @file initialization-manager.js
 * @description Manages the initialization sequence for the Media Kit Builder to prevent race conditions.
 * This state machine ensures proper sequencing of initialization steps with validation and error handling.
 * 
 * Phase 2A Enhancement: Added modal validation and promise-based sequencing
 */

import { performanceMonitor } from '../utils/performance-monitor.js';

class InitializationManager {
    constructor() {
        this.state = 'pending';
        this.steps = [];
        this.errors = [];
        this.startTime = Date.now();
        this.retryCount = 0;
        this.maxRetries = 1; // Reduced from 3 for faster performance
        this.version = '2.0-phase2a'; // Version tracking for cache busting
    }

    /**
     * Main initialization method that runs through all required steps
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        console.log(`🚀 InitializationManager v${this.version}: Starting Media Kit Builder initialization...`);
        this.state = 'initializing';
        const perfEnd = performanceMonitor.start('initialization-sequence');

        try {
            // Step 1: Validate prerequisites (now async to wait for full DOM ready)
            await this.validatePrerequisites();
            this.recordStep('prerequisites', 'success');

            // Step 2: Load and validate systems
            await this.loadSystems();
            this.recordStep('systems', 'success');

            // Step 3: Setup core UI components
            await this.setupCoreUI();
            this.recordStep('core-ui', 'success');

            // Step 4: Wait for modal HTML to be fully loaded
            await this.waitForModalHTML();
            this.recordStep('modal-html', 'success');

            // Step 5: Setup all modals with proper event listeners
            await this.setupModals();
            this.recordStep('modals', 'success');

            // Step 6: Validate modal setup
            await this.validateModalSetup();
            this.recordStep('modal-validation', 'success');

            // Step 7: Restore state and finalize
            await this.restoreState();
            this.recordStep('state', 'success');

            this.state = 'complete';
            const duration = Date.now() - this.startTime;
            console.log(`✅ InitializationManager: Initialization complete in ${duration}ms`);
            
            perfEnd();
            return true;

        } catch (error) {
            this.state = 'failed';
            this.errors.push(error);
            
            console.error('❌ InitializationManager: Initialization failed:', error);
            this.logFailureDetails();
            
            // Attempt recovery if retries available
            if (this.retryCount < this.maxRetries) {
                console.log(`🔄 InitializationManager: Attempting retry ${this.retryCount + 1}/${this.maxRetries}`);
                this.retryCount++;
                this.state = 'pending';
                this.errors = [];
                
                // Wait before retry with exponential backoff
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, this.retryCount) * 200));
                return await this.initialize();
            }
            
            perfEnd();
            throw error;
        }
    }

    /**
     * Validates that all prerequisites are available before starting
     */
    async validatePrerequisites() {
        console.log('🔍 InitializationManager: Validating prerequisites...');
        
        // Wait for DOM to be fully ready including all included PHP files
        if (document.readyState !== 'complete') {
            console.log('⏳ InitializationManager: Waiting for document.readyState to be complete...');
            await new Promise(resolve => {
                const checkReady = () => {
                    if (document.readyState === 'complete') {
                        console.log('✅ InitializationManager: Document fully loaded');
                        resolve();
                    } else {
                        setTimeout(checkReady, 10);
                    }
                };
                checkReady();
            });
        }
        
        // Quick check - if guestifyData is already available, skip waiting
        if (window.guestifyData?.pluginUrl) {
            console.log('✅ InitializationManager: guestifyData already available');
        } else {
            // Wait for guestifyData with shorter timeout for better performance
            const guestifyData = await this.waitForGuestifyData(500); // Reduced from 2000ms
            if (!guestifyData) {
                throw new Error('guestifyData not available - PHP localization failed');
            }
        }

        // Validate required DOM elements (quick check)
        const requiredElements = ['media-kit-preview', 'preview-container'];
        for (const elementId of requiredElements) {
            if (!document.getElementById(elementId)) {
                throw new Error(`Required DOM element not found: ${elementId}`);
            }
        }

        // Validate plugin URL
        if (!window.guestifyData.pluginUrl) {
            throw new Error('Plugin URL not available in guestifyData');
        }

        // Set global plugin URL for other modules
        window.GUESTIFY_PLUGIN_URL = window.guestifyData.pluginUrl;
        
        console.log('✅ InitializationManager: Prerequisites validated');
    }

    /**
     * Waits for guestifyData to be available with timeout and retries
     * @param {number} timeout - Maximum wait time in ms (reduced for performance)
     * @returns {Promise<object|null>} guestifyData object or null
     */
    async waitForGuestifyData(timeout = 500) {
        const startTime = Date.now();
        const checkInterval = 25; // Reduced from 50ms for faster response
        
        while (Date.now() - startTime < timeout) {
            if (window.guestifyData?.pluginUrl) {
                return window.guestifyData;
            }
            
            // Check for inline backup data
            if (window.guestifyDataBackup?.pluginUrl) {
                console.log('📦 InitializationManager: Using backup guestifyData');
                window.guestifyData = window.guestifyDataBackup;
                return window.guestifyData;
            }
            
            await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
        
        return null;
    }

    /**
     * Loads and validates core systems
     */
    async loadSystems() {
        console.log('⚙️ InitializationManager: Loading systems...');
        
        // Import the conditional loader
        const { initializeSystems } = await import('./conditional-loader.js');
        const { featureFlags } = await import('./feature-flags.js');
        
        // Initialize systems synchronously
        initializeSystems(featureFlags);
        
        // Validate that all required globals are set
        const requiredGlobals = ['stateManager', 'componentManager', 'renderer', 'initializer'];
        for (const global of requiredGlobals) {
            if (!window[global]) {
                throw new Error(`Required global not set: window.${global}`);
            }
        }
        
        console.log('✅ InitializationManager: Systems loaded and validated');
    }

    /**
     * Sets up core UI components (excluding modals)
     */
    async setupCoreUI() {
        console.log('🎨 InitializationManager: Setting up core UI...');
        
        try {
            // Direct imports to avoid issues
            const { setupTabs } = await import('../ui/tabs.js');
            const { initializeLayout, updateEmptyState } = await import('../ui/layout.js');
            
            console.log('  - Setting up tabs...');
            setupTabs();
            
            console.log('  - Initializing layout...');
            initializeLayout();
            
            console.log('  - Updating empty state...');
            updateEmptyState();
            
            // Validate core UI components are responsive
            await this.validateUIComponents();
            
            console.log('✅ InitializationManager: Core UI setup complete');
        } catch (error) {
            console.error('❌ Failed to setup core UI:', error);
            throw error;
        }
    }

    /**
     * Waits for modal HTML elements to be fully loaded in the DOM
     */
    async waitForModalHTML() {
        console.log('⏳ InitializationManager: Waiting for modal HTML...');
        
        const modalIds = [
            'component-library-overlay',
            'template-library-modal',
            'global-settings-modal',
            'export-modal'
        ];
        
        const maxWaitTime = 3000; // Increased to 3 seconds
        const checkInterval = 100; // Increased interval
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            const foundModals = [];
            const missingModals = [];
            
            for (const modalId of modalIds) {
                if (document.getElementById(modalId)) {
                    foundModals.push(modalId);
                } else {
                    missingModals.push(modalId);
                }
            }
            
            console.log(`  Found: ${foundModals.length}/${modalIds.length} modals`);
            
            if (missingModals.length === 0) {
                console.log('✅ InitializationManager: All modal HTML elements found');
                // Additional delay to ensure any dynamic content is ready
                await new Promise(resolve => setTimeout(resolve, 200));
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
        
        // Log which modals are missing but continue
        const finalCheck = modalIds.filter(id => !document.getElementById(id));
        if (finalCheck.length > 0) {
            console.warn(`⚠️ InitializationManager: Some modals not found after ${maxWaitTime}ms:`, finalCheck);
            console.warn('Continuing with available modals...');
        }
    }

    /**
     * Sets up all modal systems with proper event listeners
     */
    async setupModals() {
        console.log('🔧 InitializationManager: Setting up modals...');
        
        try {
            // Use dynamic imports with cache busting
            const timestamp = Date.now();
            
            // Import modal setup functions
            const componentLibraryModule = await import(`../modals/component-library.js?t=${timestamp}`);
            const templateLoaderModule = await import(`../services/template-loader.js?t=${timestamp}`);
            const globalSettingsModule = await import(`../modals/global-settings.js?t=${timestamp}`);
            
            // Setup each modal system with error handling
            const modalSetups = [
                { 
                    name: 'Component Library', 
                    setup: async () => {
                        if (componentLibraryModule.setupComponentLibrary) {
                            await componentLibraryModule.setupComponentLibrary();
                        } else {
                            console.warn('setupComponentLibrary function not found');
                        }
                    }
                },
                { 
                    name: 'Template Loader', 
                    setup: async () => {
                        if (templateLoaderModule.templateLoader?.init) {
                            await templateLoaderModule.templateLoader.init();
                        } else {
                            console.warn('templateLoader.init not found');
                        }
                    }
                },
                { 
                    name: 'Global Settings', 
                    setup: async () => {
                        if (globalSettingsModule.globalSettings?.init) {
                            await globalSettingsModule.globalSettings.init();
                        } else {
                            console.warn('globalSettings.init not found');
                        }
                    }
                }
            ];
            
            for (const modal of modalSetups) {
                try {
                    console.log(`  Setting up ${modal.name}...`);
                    await modal.setup();
                    console.log(`  ✅ ${modal.name} setup complete`);
                } catch (error) {
                    console.error(`  ❌ Failed to setup ${modal.name}:`, error);
                    // Continue with other modals even if one fails
                }
            }
            
            console.log('✅ InitializationManager: Modal setup phase complete');
        } catch (error) {
            console.error('❌ Modal initialization error:', error);
            // Don't throw - allow initialization to continue
        }
    }

    /**
     * Validates that modal event listeners are properly attached
     */
    async validateModalSetup() {
        console.log('🔍 InitializationManager: Validating modal setup...');
        
        const validations = [
            {
                buttonId: 'add-component-btn',
                modalId: 'component-library-overlay',
                name: 'Component Library'
            },
            {
                buttonId: 'load-template',
                modalId: 'template-library-modal',
                name: 'Template Library'
            },
            {
                buttonId: 'global-theme-btn',
                modalId: 'global-settings-modal',
                name: 'Global Settings'
            }
        ];
        
        const issues = [];
        
        for (const validation of validations) {
            const button = document.getElementById(validation.buttonId);
            const modal = document.getElementById(validation.modalId);
            
            if (!button) {
                console.warn(`  ⚠️ ${validation.name} button not found (${validation.buttonId})`);
                issues.push(`${validation.name} button missing`);
            } else if (button.hasAttribute('data-listener-attached')) {
                console.log(`  ✅ ${validation.name} button has listener`);
            } else {
                console.warn(`  ⚠️ ${validation.name} button may not have listener`);
            }
            
            if (!modal) {
                console.warn(`  ⚠️ ${validation.name} modal not found (${validation.modalId})`);
                issues.push(`${validation.name} modal missing`);
            }
        }
        
        if (issues.length === 0) {
            console.log('✅ InitializationManager: Modal validation passed');
        } else {
            console.warn('⚠️ InitializationManager: Some modal elements missing, but continuing');
        }
    }

    /**
     * Validates that UI components are properly initialized
     */
    async validateUIComponents() {
        // Give UI components time to initialize
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // Check for critical UI elements
        const uiElements = [
            '.sidebar',
            '.preview',
            '.toolbar'
        ];
        
        for (const selector of uiElements) {
            if (!document.querySelector(selector)) {
                console.warn(`UI element not found: ${selector}`);
            }
        }
    }

    /**
     * Restores application state and finalizes initialization
     */
    async restoreState() {
        console.log('💾 InitializationManager: Restoring state...');
        
        // State restoration is handled by the enhanced initialization
        // Just validate that state manager is responsive
        if (window.stateManager && typeof window.stateManager.getState === 'function') {
            const state = window.stateManager.getState();
            console.log('📊 InitializationManager: State manager responsive, components:', 
                Object.keys(state.components || {}).length);
        }
        
        console.log('✅ InitializationManager: State restoration complete');
    }

    /**
     * Records a step completion for debugging
     */
    recordStep(stepName, status) {
        this.steps.push({
            name: stepName,
            status,
            timestamp: Date.now(),
            duration: Date.now() - this.startTime
        });
    }

    /**
     * Logs detailed failure information for debugging
     */
    logFailureDetails() {
        console.group('🚨 InitializationManager: Failure Details');
        console.log('State:', this.state);
        console.log('Retry count:', this.retryCount);
        console.log('Completed steps:', this.steps);
        console.log('Errors:', this.errors);
        console.log('Available globals:', {
            guestifyData: !!window.guestifyData,
            stateManager: !!window.stateManager,
            componentManager: !!window.componentManager,
            renderer: !!window.renderer,
            initializer: !!window.initializer
        });
        console.groupEnd();
    }

    /**
     * Gets the current initialization status
     * @returns {object} Status information
     */
    getStatus() {
        return {
            state: this.state,
            steps: this.steps,
            errors: this.errors,
            retryCount: this.retryCount,
            duration: Date.now() - this.startTime,
            version: this.version
        };
    }
}

// Export singleton instance
export const initializationManager = new InitializationManager();

// Expose globally for debugging
window.initManager = initializationManager;
