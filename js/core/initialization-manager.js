/**
 * @file initialization-manager.js
 * @description Manages the initialization sequence for the Media Kit Builder to prevent race conditions.
 * This state machine ensures proper sequencing of initialization steps with validation and error handling.
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
    }

    /**
     * Main initialization method that runs through all required steps
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        console.log('🚀 InitializationManager: Starting Media Kit Builder initialization...');
        this.state = 'initializing';
        const perfEnd = performanceMonitor.start('initialization-sequence');

        try {
            // Step 1: Validate prerequisites
            await this.validatePrerequisites();
            this.recordStep('prerequisites', 'success');

            // Step 2: Load and validate systems
            await this.loadSystems();
            this.recordStep('systems', 'success');

            // Step 3: Setup UI components
            await this.setupUI();
            this.recordStep('ui', 'success');

            // Step 4: Restore state and finalize
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
     * Sets up UI components and validates they're working
     */
    async setupUI() {
        console.log('🎨 InitializationManager: Setting up UI...');
        
        // Call the main initializer
        if (typeof window.initializer === 'function') {
            await window.initializer();
        } else {
            throw new Error('window.initializer is not a function');
        }
        
        // Validate UI components are responsive
        await this.validateUIComponents();
        
        console.log('✅ InitializationManager: UI setup complete');
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
            duration: Date.now() - this.startTime
        };
    }
}

// Export singleton instance
export const initializationManager = new InitializationManager();

// Expose globally for debugging
window.initManager = initializationManager;
