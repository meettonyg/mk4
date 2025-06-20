/**
 * @file initialization-manager.js
 * @description Manages the initialization sequence for the Media Kit Builder to prevent race conditions.
 * This state machine ensures proper sequencing of initialization steps with validation and error handling.
 * 
 * Phase 2A Enhancement: Added modal validation and promise-based sequencing
 * Phase 2B Enhancement: Integrated comprehensive logging system
 * Phase 2B Fix: Properly handle timeout promises to prevent unhandled rejections
 */

import { performanceMonitor } from '../utils/performance-monitor.js';
import { structuredLogger } from '../utils/structured-logger.js';
import { initializationTracker } from '../utils/initialization-tracker.js';
import { errorBoundary } from '../utils/error-boundary.js';

class InitializationManager {
    constructor() {
        this.state = 'pending';
        this.steps = [];
        this.errors = [];
        this.startTime = Date.now();
        this.retryCount = 0;
        this.maxRetries = 1; // Reduced from 3 for faster performance
        this.version = '2.0-phase2b-fixed'; // Version tracking for cache busting
        this.logger = structuredLogger;
        this.tracker = initializationTracker;
        this.errorBoundary = errorBoundary;
        
        // Register initialization steps with tracker
        this.registerInitSteps();
    }

    /**
     * Register all initialization steps with the tracker
     */
    registerInitSteps() {
        this.tracker.registerStep('prerequisites', {
            description: 'Validate DOM ready and guestifyData availability',
            critical: true,
            timeout: 5000
        });
        
        this.tracker.registerStep('systems', {
            description: 'Load and validate core systems',
            dependencies: ['prerequisites'],
            critical: true,
            timeout: 3000
        });
        
        this.tracker.registerStep('templates', {
            description: 'Preload all component templates',
            dependencies: ['systems'],
            critical: false,
            timeout: 5000,
            retryCount: 2
        });
        
        this.tracker.registerStep('core-ui', {
            description: 'Setup tabs, layout, and empty state',
            dependencies: ['templates'],
            critical: true,
            timeout: 2000
        });
        
        this.tracker.registerStep('modal-html', {
            description: 'Wait for modal HTML elements to load',
            dependencies: ['core-ui'],
            critical: false,
            timeout: 3000
        });
        
        this.tracker.registerStep('modals', {
            description: 'Setup modal event listeners and handlers',
            dependencies: ['modal-html'],
            critical: false,
            timeout: 3000,
            retryCount: 1
        });
        
        this.tracker.registerStep('modal-validation', {
            description: 'Validate modal setup',
            dependencies: ['modals'],
            critical: false,
            timeout: 1000
        });
        
        this.tracker.registerStep('state', {
            description: 'Restore application state',
            dependencies: ['modal-validation'],
            critical: true,
            timeout: 2000
        });
    }

    /**
     * Execute a step with proper timeout handling
     */
    async executeStep(stepName, stepFunction) {
        const stepInfo = await this.tracker.startStep(stepName);
        
        if (stepInfo.skipped) {
            return; // Step was skipped due to dependencies or already completed
        }
        
        try {
            // Execute the step function
            await stepFunction();
            
            // Mark step as complete
            this.tracker.completeStep(stepName);
            this.recordStep(stepName, 'success');
            
        } catch (error) {
            // Mark step as failed
            const failResult = this.tracker.failStep(stepName, error);
            this.recordStep(stepName, 'failed');
            
            // Only throw if it's a critical error and no retry is possible
            if (failResult.retry) {
                // Retry the step
                return this.executeStep(stepName, stepFunction);
            }
            
            throw error;
        }
    }

    /**
     * Main initialization method that runs through all required steps
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        this.logger.info('INIT', `InitializationManager v${this.version}: Starting Media Kit Builder initialization`);
        this.state = 'initializing';
        const perfEnd = performanceMonitor.start('initialization-sequence');
        const initStart = this.logger.logInitStart('initialization-sequence', []);

        try {
            // Execute each step with proper error handling
            await this.executeStep('prerequisites', () => this.validatePrerequisites());
            await this.executeStep('systems', () => this.loadSystems());
            await this.executeStep('templates', () => this.preloadTemplates());
            await this.executeStep('core-ui', () => this.setupCoreUI());
            await this.executeStep('modal-html', () => this.waitForModalHTML());
            await this.executeStep('modals', () => this.setupModals());
            await this.executeStep('modal-validation', () => this.validateModalSetup());
            await this.executeStep('state', () => this.restoreState());

            this.state = 'complete';
            const duration = Date.now() - this.startTime;
            this.logger.logInitComplete('initialization-sequence', initStart, {
                totalSteps: this.steps.length,
                duration
            });
            
            // Generate initialization report
            this.logger.generateInitReport();
            
            perfEnd();
            return true;

        } catch (error) {
            this.state = 'failed';
            this.errors.push(error);
            
            this.logger.logInitError('initialization-sequence', error, {
                retryCount: this.retryCount,
                steps: this.steps
            });
            
            // Log detailed failure info
            this.logFailureDetails();
            
            // Attempt recovery if retries available
            if (this.retryCount < this.maxRetries) {
                this.logger.info('INIT', `Attempting retry ${this.retryCount + 1}/${this.maxRetries}`);
                this.retryCount++;
                this.state = 'pending';
                this.errors = [];
                this.tracker.reset();
                
                // Wait before retry with exponential backoff
                const retryDelay = Math.pow(2, this.retryCount) * 200;
                this.logger.debug('INIT', `Waiting ${retryDelay}ms before retry`);
                await new Promise(resolve => setTimeout(resolve, retryDelay));
                return await this.initialize();
            }
            
            // Generate error report
            this.logger.generateErrorReport();
            
            perfEnd();
            throw error;
        }
    }

    /**
     * Validates that all prerequisites are available before starting
     */
    async validatePrerequisites() {
        this.logger.info('INIT', 'Validating prerequisites');
        
        // Wait for DOM to be fully ready including all included PHP files
        if (document.readyState !== 'complete') {
            this.logger.debug('INIT', 'Waiting for document.readyState to be complete');
            const domStart = performance.now();
            
            await new Promise(resolve => {
                const checkReady = () => {
                    if (document.readyState === 'complete') {
                        this.logger.info('INIT', 'Document fully loaded', {
                            duration: performance.now() - domStart
                        });
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
            this.logger.debug('INIT', 'guestifyData already available');
        } else {
            // Wait for guestifyData with shorter timeout for better performance
            const guestifyDataResult = await this.logger.checkRaceCondition(
                'INIT',
                () => window.guestifyData?.pluginUrl,
                { timeout: 500, expectedValue: true }
            );
            
            if (!guestifyDataResult.success) {
                // Try backup data
                if (window.guestifyDataBackup?.pluginUrl) {
                    this.logger.warn('INIT', 'Using backup guestifyData');
                    window.guestifyData = window.guestifyDataBackup;
                } else {
                    throw new Error('guestifyData not available - PHP localization failed');
                }
            }
        }

        // Validate required DOM elements (quick check)
        const requiredElements = ['media-kit-preview', 'preview-container'];
        const missingElements = [];
        
        for (const elementId of requiredElements) {
            if (!document.getElementById(elementId)) {
                missingElements.push(elementId);
            }
        }
        
        if (missingElements.length > 0) {
            this.logger.error('INIT', 'Required DOM elements not found', null, {
                missing: missingElements
            });
            throw new Error(`Required DOM elements not found: ${missingElements.join(', ')}`);
        }

        // Validate plugin URL
        if (!window.guestifyData.pluginUrl) {
            throw new Error('Plugin URL not available in guestifyData');
        }

        // Set global plugin URL for other modules
        window.GUESTIFY_PLUGIN_URL = window.guestifyData.pluginUrl;
        
        this.logger.info('INIT', 'Prerequisites validated', {
            guestifyData: !!window.guestifyData,
            pluginUrl: window.guestifyData?.pluginUrl
        });
    }

    /**
     * Loads and validates core systems
     */
    async loadSystems() {
        this.logger.info('INIT', 'Loading systems');
        
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
        
        this.logger.info('INIT', 'Systems loaded and validated', {
            globals: requiredGlobals.reduce((acc, name) => {
                acc[name] = !!window[name];
                return acc;
            }, {})
        });
    }

    /**
     * Preloads all component templates to eliminate race conditions
     */
    async preloadTemplates() {
        this.logger.info('TEMPLATES', 'Starting template preload');
        
        try {
            // Import template preloader
            const { templatePreloader } = await import('../services/template-preloader.js');
            
            // Initialize and preload templates
            const preloadStart = performance.now();
            const success = await templatePreloader.init();
            
            if (!success) {
                this.logger.warn('TEMPLATES', 'Template preload returned false, but continuing');
            }
            
            // Get preloader status for logging
            const status = templatePreloader.getStatus();
            
            this.logger.info('TEMPLATES', 'Template preload complete', {
                success,
                duration: performance.now() - preloadStart,
                templatesLoaded: status.cacheStats.size,
                cacheHitRate: status.cacheStats.hitRate
            });
            
        } catch (error) {
            // Template preloading is non-critical - log error but continue
            this.logger.error('TEMPLATES', 'Template preload failed', error);
            this.logger.warn('TEMPLATES', 'Continuing without preloaded templates - will fetch on demand');
        }
    }
    
    /**
     * Sets up core UI components (excluding modals)
     */
    async setupCoreUI() {
        this.logger.info('INIT', 'Setting up core UI');
        
        try {
            // Direct imports to avoid issues
            const { setupTabs } = await import('../ui/tabs.js');
            const { initializeLayout, updateEmptyState } = await import('../ui/layout.js');
            
            this.logger.debug('UI', 'Setting up tabs');
            setupTabs();
            
            this.logger.debug('UI', 'Initializing layout');
            initializeLayout();
            
            this.logger.debug('UI', 'Updating empty state');
            updateEmptyState();
            
            // Validate core UI components are responsive
            await this.validateUIComponents();
            
            this.logger.info('UI', 'Core UI setup complete');
        } catch (error) {
            this.logger.error('UI', 'Failed to setup core UI', error);
            throw error;
        }
    }

    /**
     * Waits for modal HTML elements to be fully loaded in the DOM
     */
    async waitForModalHTML() {
        this.logger.info('MODAL', 'Waiting for modal HTML elements');
        
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
            
            this.logger.debug('MODAL', `Found ${foundModals.length}/${modalIds.length} modals`, {
                found: foundModals,
                missing: missingModals
            });
            
            if (missingModals.length === 0) {
                this.logger.info('MODAL', 'All modal HTML elements found');
                // Additional delay to ensure any dynamic content is ready
                await new Promise(resolve => setTimeout(resolve, 200));
                return;
            }
            
            await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
        
        // Log which modals are missing but continue
        const finalCheck = modalIds.filter(id => !document.getElementById(id));
        if (finalCheck.length > 0) {
            this.logger.warn('MODAL', `Some modals not found after ${maxWaitTime}ms`, {
                missing: finalCheck,
                timeout: maxWaitTime
            });
            this.logger.warn('MODAL', 'Continuing with available modals');
        }
    }

    /**
     * Sets up all modal systems with proper event listeners
     */
    async setupModals() {
        this.logger.info('MODAL', 'Setting up modal systems');
        
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
                    this.logger.debug('MODAL', `Setting up ${modal.name}`);
                    const setupStart = performance.now();
                    await modal.setup();
                    this.logger.info('MODAL', `${modal.name} setup complete`, {
                        duration: performance.now() - setupStart
                    });
                } catch (error) {
                    this.logger.error('MODAL', `Failed to setup ${modal.name}`, error);
                    // Continue with other modals even if one fails
                }
            }
            
            this.logger.info('MODAL', 'Modal setup phase complete');
        } catch (error) {
            this.logger.error('MODAL', 'Modal initialization error', error);
            // Don't throw - allow initialization to continue
        }
    }

    /**
     * Validates that modal event listeners are properly attached
     */
    async validateModalSetup() {
        this.logger.info('MODAL', 'Validating modal setup');
        
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
                this.logger.warn('MODAL', `${validation.name} button not found`, {
                    buttonId: validation.buttonId
                });
                issues.push(`${validation.name} button missing`);
            } else if (button.hasAttribute('data-listener-attached')) {
                this.logger.debug('MODAL', `${validation.name} button has listener`);
            } else {
                this.logger.warn('MODAL', `${validation.name} button may not have listener`, {
                    buttonId: validation.buttonId
                });
            }
            
            if (!modal) {
                this.logger.warn('MODAL', `${validation.name} modal not found`, {
                    modalId: validation.modalId
                });
                issues.push(`${validation.name} modal missing`);
            }
        }
        
        if (issues.length === 0) {
            this.logger.info('MODAL', 'Modal validation passed');
        } else {
            this.logger.warn('MODAL', 'Some modal elements missing, but continuing', {
                issues
            });
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
                this.logger.warn('UI', `UI element not found: ${selector}`);
            }
        }
    }

    /**
     * Restores application state and finalizes initialization
     */
    async restoreState() {
        this.logger.info('STATE', 'Restoring application state');
        
        // State restoration is handled by the enhanced initialization
        // Just validate that state manager is responsive
        if (window.stateManager && typeof window.stateManager.getState === 'function') {
            const state = window.stateManager.getState();
            this.logger.info('STATE', 'State manager responsive', {
                componentCount: Object.keys(state.components || {}).length,
                hasGlobalSettings: !!state.globalSettings
            });
        }
        
        this.logger.info('STATE', 'State restoration complete');
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
        const details = {
            state: this.state,
            retryCount: this.retryCount,
            completedSteps: this.steps,
            errors: this.errors,
            availableGlobals: {
                guestifyData: !!window.guestifyData,
                stateManager: !!window.stateManager,
                componentManager: !!window.componentManager,
                renderer: !!window.renderer,
                initializer: !!window.initializer
            },
            trackerSummary: this.tracker.getSummary()
        };
        
        this.logger.error('INIT', 'Initialization failure details', null, details);
        
        // Generate reports
        this.tracker.generateDependencyGraph();
        this.tracker.generateTimeline();
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
