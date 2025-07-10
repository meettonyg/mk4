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
import { startupCoordinationManager } from './startup-coordination-manager.js';

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
        
        // CRITICAL FIX: Integration tracking flags
        this.trackerIntegrated = false;
        this.trackerReady = false;
        this.integrationValidated = false;
        
        // CRITICAL FIX: Emergency circuit breaker to prevent cascade failures
        this.circuitBreaker = {
            state: 'CLOSED', // CLOSED, OPEN, HALF_OPEN
            failureCount: 0,
            maxFailures: 3, // Trip after 3 system failures
            resetTimeout: 10000, // Reset after 10 seconds
            lastFailureTime: 0,
            consecutiveSuccesses: 0,
            requiredSuccesses: 2, // Successes needed to close from HALF_OPEN
            isTripped: false
        };
        
        // CRITICAL FIX: Initialize tracker integration
        this.initializeTrackerIntegration();
        
        // Register initialization steps with tracker
        this.registerInitSteps();
    }

    /**
     * CRITICAL FIX: Initialize tracker integration with comprehensive validation
     */
    initializeTrackerIntegration() {
        try {
            // Validate tracker is available and has required methods
            if (!this.tracker) {
                throw new Error('Initialization tracker not available');
            }
            
            const requiredMethods = ['registerStep', 'startStep', 'completeStep', 'failStep', 'reset', 'getSummary'];
            const missingMethods = requiredMethods.filter(method => typeof this.tracker[method] !== 'function');
            
            if (missingMethods.length > 0) {
                throw new Error(`Tracker missing required methods: ${missingMethods.join(', ')}`);
            }
            
            // Initialize tracker state
            this.tracker.reset();
            
            // Expose tracker globally for testing and debugging
            window.initTracker = this.tracker;
            
            // Set integration flags
            this.trackerReady = true;
            this.trackerIntegrated = true;
            
            this.logger.info('INIT', 'Initialization tracker integration successful', {
                availableMethods: Object.keys(this.tracker).filter(key => typeof this.tracker[key] === 'function'),
                trackerIntegrated: this.trackerIntegrated,
                trackerReady: this.trackerReady
            });
            
        } catch (error) {
            this.trackerIntegrated = false;
            this.trackerReady = false;
            this.logger.error('INIT', 'Tracker integration failed', error);
            
            // Create fallback tracker to prevent crashes
            this.tracker = this.createFallbackTracker();
            this.logger.warn('INIT', 'Using fallback tracker - some functionality may be limited');
        }
    }
    
    /**
     * CRITICAL FIX: Create fallback tracker for graceful degradation
     */
    createFallbackTracker() {
        return {
            registerStep: () => {},
            startStep: (name) => ({ skipped: false }),
            completeStep: () => {},
            failStep: (name, error) => ({ retry: false }),
            reset: () => {},
            getSummary: () => ({ steps: [], errors: [] }),
            generateDependencyGraph: () => {},
            generateTimeline: () => {}
        };
    }
    
    /**
     * CRITICAL FIX: Check if circuit breaker allows operation
     */
    checkCircuitBreaker() {
        const now = Date.now();
        
        // If circuit is OPEN, check if enough time has passed to try HALF_OPEN
        if (this.circuitBreaker.state === 'OPEN') {
            if (now - this.circuitBreaker.lastFailureTime > this.circuitBreaker.resetTimeout) {
                this.circuitBreaker.state = 'HALF_OPEN';
                this.circuitBreaker.consecutiveSuccesses = 0;
                this.logger.info('CIRCUIT', 'Circuit breaker moved to HALF_OPEN state - testing recovery');
            } else {
                return false; // Still open, reject operation
            }
        }
        
        return true; // CLOSED or HALF_OPEN allows operation
    }
    
    /**
     * CRITICAL FIX: Record successful operation for circuit breaker
     */
    recordCircuitSuccess(operation) {
        if (this.circuitBreaker.state === 'HALF_OPEN') {
            this.circuitBreaker.consecutiveSuccesses++;
            
            if (this.circuitBreaker.consecutiveSuccesses >= this.circuitBreaker.requiredSuccesses) {
                this.circuitBreaker.state = 'CLOSED';
                this.circuitBreaker.failureCount = 0;
                this.circuitBreaker.isTripped = false;
                this.logger.info('CIRCUIT', 'Circuit breaker CLOSED - system recovered', {
                    operation,
                    consecutiveSuccesses: this.circuitBreaker.consecutiveSuccesses
                });
            }
        }
    }
    
    /**
     * CRITICAL FIX: Record failure and update circuit breaker state
     */
    recordCircuitFailure(operation, error) {
        this.circuitBreaker.failureCount++;
        this.circuitBreaker.lastFailureTime = Date.now();
        this.circuitBreaker.consecutiveSuccesses = 0;
        
        if (this.circuitBreaker.failureCount >= this.circuitBreaker.maxFailures) {
            this.circuitBreaker.state = 'OPEN';
            this.circuitBreaker.isTripped = true;
            
            this.logger.error('CIRCUIT', 'Circuit breaker OPENED - too many failures', error, {
                operation,
                failureCount: this.circuitBreaker.failureCount,
                maxFailures: this.circuitBreaker.maxFailures,
                resetTimeout: this.circuitBreaker.resetTimeout
            });
            
            // Show user-friendly error message
            this.showCircuitBreakerError(operation, error);
        }
    }
    
    /**
     * CRITICAL FIX: Show user-friendly circuit breaker error
     */
    showCircuitBreakerError(operation, error) {
        const errorDiv = document.createElement('div');
        errorDiv.id = 'circuit-breaker-error';
        errorDiv.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: #dc3545;
            color: white;
            padding: 15px 20px;
            border-radius: 8px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            max-width: 400px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        `;
        
        errorDiv.innerHTML = `
            <div style="font-weight: bold; margin-bottom: 8px;">⚠️ System Protection Active</div>
            <div style="margin-bottom: 12px;">Too many initialization failures detected. System temporarily suspended to prevent cascade failures.</div>
            <div style="margin-bottom: 12px;">Operation: ${operation}</div>
            <button id="circuit-breaker-retry" style="
                background: white;
                color: #dc3545;
                border: none;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
                margin-right: 8px;
            ">Retry Now</button>
            <button id="circuit-breaker-dismiss" style="
                background: rgba(255,255,255,0.2);
                color: white;
                border: 1px solid white;
                padding: 6px 12px;
                border-radius: 4px;
                cursor: pointer;
                font-size: 12px;
            ">Dismiss</button>
        `;
        
        // Remove existing error if present
        const existing = document.getElementById('circuit-breaker-error');
        if (existing) {
            existing.remove();
        }
        
        document.body.appendChild(errorDiv);
        
        // Add event listeners
        document.getElementById('circuit-breaker-retry')?.addEventListener('click', () => {
            this.circuitBreaker.state = 'HALF_OPEN';
            this.circuitBreaker.consecutiveSuccesses = 0;
            errorDiv.remove();
            this.logger.info('CIRCUIT', 'Manual circuit breaker reset by user');
            
            // Attempt to restart initialization
            this.initialize().catch(err => {
                this.logger.error('CIRCUIT', 'Manual retry failed', err);
            });
        });
        
        document.getElementById('circuit-breaker-dismiss')?.addEventListener('click', () => {
            errorDiv.remove();
        });
        
        // Auto-remove after 30 seconds
        setTimeout(() => {
            if (document.contains(errorDiv)) {
                errorDiv.remove();
            }
        }, 30000);
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
            timeout: 1000
        });
        
        this.tracker.registerStep('modal-html', {
            description: 'Wait for modal HTML elements to load',
            dependencies: ['core-ui'],
            critical: false,
            timeout: 1000
        });
        
        this.tracker.registerStep('modals', {
            description: 'Setup modal event listeners and handlers',
            dependencies: ['modal-html'],
            critical: false,
            timeout: 1000,
            retryCount: 1
        });
        
        this.tracker.registerStep('modal-validation', {
            description: 'Validate modal setup',
            dependencies: ['modals'],
            critical: false,
            timeout: 1000
        });
        
        this.tracker.registerStep('coordinated-state', {
            description: 'Coordinated state restoration with race condition prevention',
            dependencies: ['modal-validation'],
            critical: true,
            timeout: 15000 // Longer timeout for coordination
        });
    }

    /**
     * Execute a step with proper timeout handling and circuit breaker protection
     */
    async executeStep(stepName, stepFunction) {
        // CRITICAL FIX: Check circuit breaker before executing
        if (!this.checkCircuitBreaker()) {
            const error = new Error(`Circuit breaker OPEN - operation '${stepName}' blocked to prevent cascade failure`);
            this.logger.warn('CIRCUIT', `Step '${stepName}' blocked by circuit breaker`, error);
            throw error;
        }
        
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
            
            // CRITICAL FIX: Record success for circuit breaker
            this.recordCircuitSuccess(stepName);
            
        } catch (error) {
            // Mark step as failed
            const failResult = this.tracker.failStep(stepName, error);
            this.recordStep(stepName, 'failed');
            
            // CRITICAL FIX: Record failure for circuit breaker
            this.recordCircuitFailure(stepName, error);
            
            // Only throw if it's a critical error and no retry is possible
            if (failResult.retry) {
                // Check circuit breaker again before retry
                if (this.checkCircuitBreaker()) {
                    // Retry the step
                    return this.executeStep(stepName, stepFunction);
                } else {
                    this.logger.warn('CIRCUIT', `Retry of '${stepName}' blocked by circuit breaker`);
                    throw new Error(`Retry blocked by circuit breaker for step: ${stepName}`);
                }
            }
            
            throw error;
        }
    }

    /**
     * Main initialization method that runs through all required steps
     * ROOT FIX: Now uses startup coordination manager to prevent race conditions
     * @returns {Promise<boolean>} Success status
     */
    async initialize() {
        this.logger.info('INIT', `InitializationManager v${this.version}: Starting coordinated Media Kit Builder initialization`);
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
            
            // ROOT FIX: Use coordinated state restoration to prevent race conditions
            await this.executeStep('coordinated-state', () => this.coordinatedStateRestoration());

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
     * CRITICAL FIX: Enhanced prerequisites validation
     * Now ensures complete DOM readiness including all PHP includes
     */
    async validatePrerequisites() {
        this.logger.info('INIT', 'Validating prerequisites with enhanced DOM readiness check');
        
        // CRITICAL FIX: Wait for DOM to be fully ready including all included PHP files
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
        
        // CRITICAL FIX: Additional wait for all PHP includes to be processed
        // This ensures modal HTML from PHP includes is fully loaded
        await new Promise(resolve => setTimeout(resolve, 100));
        
        // CRITICAL FIX: guestifyData should now be immediately available due to proper WordPress script loading
        if (!window.guestifyData?.pluginUrl) {
            throw new Error('guestifyData not available - WordPress script loading failed. Check dequeuing function.');
        }
        
        this.logger.debug('INIT', 'guestifyData validated via proper WordPress loading', {
            pluginUrl: window.guestifyData.pluginUrl,
            timestamp: window.guestifyInitTimestamp,
            loadMethod: 'wordpress-standard'
        });

        // CRITICAL FIX: Enhanced DOM validation for core elements
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

        // Set global plugin URL for other modules
        window.GUESTIFY_PLUGIN_URL = window.guestifyData.pluginUrl;
        
        this.logger.info('INIT', 'Prerequisites validated successfully', {
            guestifyData: !!window.guestifyData,
            pluginUrl: window.guestifyData?.pluginUrl,
            domElements: requiredElements.length
        });
    }

    /**
     * Validates that core systems are already loaded and available
     * In the new architecture, systems are loaded in main.js before calling this
     */
    async loadSystems() {
        this.logger.info('INIT', 'Validating core systems (already loaded by main.js)');
        
        // In the new architecture, systems are already loaded by main.js
        // We just need to validate they're available
        
        // Validate that all required globals are set
        const requiredGlobals = ['stateManager', 'componentManager', 'renderer', 'initializer'];
        const missingGlobals = [];
        
        for (const global of requiredGlobals) {
            if (!window[global]) {
                missingGlobals.push(global);
            }
        }
        
        if (missingGlobals.length > 0) {
            throw new Error(`Required globals not available: ${missingGlobals.join(', ')}. Systems must be loaded before calling initialization manager.`);
        }
        
        // CRITICAL FIX: Initialize enhanced component manager if it was selected
        if (window.enhancedComponentManager && typeof window.enhancedComponentManager.init === 'function') {
            // Don't try to initialize here - the builder template may not be loaded yet
            // This will be handled later in the modal setup phase when DOM is complete
            this.logger.info('INIT', 'Enhanced component manager initialization deferred to modal setup phase');
        }
        
        // CRITICAL FIX: Initialize enhanced component renderer
        if (window.renderer && typeof window.renderer.init === 'function') {
            this.logger.info('INIT', 'Enhanced component renderer initialization deferred to modal setup phase');
        }
        
        // Log system availability
        const systemInfo = {
            globals: requiredGlobals.reduce((acc, name) => {
                acc[name] = !!window[name];
                return acc;
            }, {}),
            enhanced: {
                enhancedStateManager: !!window.enhancedStateManager,
                enhancedComponentManager: !!window.enhancedComponentManager
            },
            systemTypes: {
                stateManager: window.stateManager?.constructor?.name || 'Unknown',
                componentManager: window.componentManager?.constructor?.name || 'Unknown',
                renderer: window.renderer?.constructor?.name || 'Unknown'
            }
        };
        
        this.logger.info('INIT', 'Core systems validated', systemInfo);
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
     * FIXED: Now properly initializes left sidebar design panel integration
     */
    async setupCoreUI() {
        this.logger.info('INIT', 'Setting up core UI');
        
        try {
            // Direct imports to avoid issues
            const { setupTabs } = await import('../ui/tabs.js');
            const { initializeLayout, updateEmptyState } = await import('../ui/layout.js');
            
            // FIXED: Import and initialize element editor and design panel for left sidebar
            const { elementEditor } = await import('../ui/element-editor.js');
            const { designPanel } = await import('../ui/design-panel.js');
            
            this.logger.debug('UI', 'Setting up tabs');
            setupTabs();
            
            this.logger.debug('UI', 'Initializing layout');
            initializeLayout();
            
            this.logger.debug('UI', 'Updating empty state');
            updateEmptyState();
            
            // FIXED: Initialize element editor and design panel for left sidebar
            this.logger.debug('UI', 'Initializing element editor for left sidebar');
            // Element editor initializes automatically via constructor
            
            this.logger.debug('UI', 'Initializing design panel for left sidebar');
            // Design panel now targets existing element-editor in left sidebar
            
            // FIXED: Expose globally for testing and debugging
            window.elementEditor = elementEditor;
            window.designPanel = designPanel;
            window.selectElement = (await import('../ui/element-editor.js')).selectElement;
            
            this.logger.info('UI', 'Element editor and design panel initialized for left sidebar integration');
            
            // Validate core UI components are responsive
            await this.validateUIComponents();
            
            this.logger.info('UI', 'Core UI setup complete');
        } catch (error) {
            this.logger.error('UI', 'Failed to setup core UI', error);
            throw error;
        }
    }

    /**
     * PHASE 2.3: ENHANCED MODAL HTML LOADING WITH PROGRESSIVE DISCOVERY
     * Implements progressive modal discovery instead of batch waiting
     * Reduces timeout from 3000ms to 1500ms with exponential backoff retries
     */
    async waitForModalHTML() {
        this.logger.info('MODAL', 'Phase 2.3: Enhanced modal validation with progressive discovery');
        
        const modalIds = [
            'component-library-overlay',
            'template-library-modal',
            'global-settings-modal',
            'export-modal'
        ];
        
        // PHASE 2.3: Reduced timeout with retry strategy
        const baseWaitTime = 1500; // Reduced from 3000ms
        const maxRetries = 3;
        const checkInterval = 50; // Faster polling
        const startTime = Date.now();
        
        // PHASE 2.3: Check for Phase 2.3 enhancements
        const hasPhase23Enhancements = window.gmkbPhase23Enhanced && window.gmkbModalValidation;
        if (hasPhase23Enhancements) {
            this.logger.info('MODAL', 'Phase 2.3 enhancements detected - using enhanced validation strategy');
        }
        
        // PHASE 2.3: Progressive modal discovery with exponential backoff
        for (let retry = 0; retry <= maxRetries; retry++) {
            const currentWaitTime = baseWaitTime * Math.pow(1.5, retry); // Exponential backoff
            const retryStartTime = Date.now();
            
            this.logger.debug('MODAL', `Progressive discovery attempt ${retry + 1}/${maxRetries + 1} (timeout: ${currentWaitTime}ms)`);
            
            while (Date.now() - retryStartTime < currentWaitTime) {
                const foundModals = [];
                const missingModals = [];
                const bridgeModals = [];
                
                for (const modalId of modalIds) {
                    const element = document.getElementById(modalId);
                    if (element) {
                        // PHASE 2.3: Enhanced validation with bridge element detection
                        const hasContent = element.children.length > 0 || 
                                         element.querySelector('.library') || 
                                         element.querySelector('.modal-content') ||
                                         element.textContent.trim().length > 0;
                        
                        const isBridgeElement = element.getAttribute('data-fallback-modal') === 'true' ||
                                              element.getAttribute('data-phase23-generated') === 'true';
                        
                        if (hasContent) {
                            if (isBridgeElement) {
                                bridgeModals.push(modalId);
                            } else {
                                foundModals.push(modalId);
                            }
                        } else {
                            missingModals.push(`${modalId} (empty)`);
                        }
                    } else {
                        missingModals.push(modalId);
                    }
                }
                
                const totalFound = foundModals.length + bridgeModals.length;
                
                this.logger.debug('MODAL', `Progressive validation: ${totalFound}/${modalIds.length} ready`, {
                    found: foundModals,
                    bridge: bridgeModals,
                    missing: missingModals,
                    retry: retry + 1
                });
                
                // PHASE 2.3: Accept success with either real modals or bridge elements
                if (totalFound >= Math.ceil(modalIds.length * 0.6)) { // Reduced threshold from 75% to 60%
                    this.logger.info('MODAL', `Modal discovery successful (${totalFound}/${modalIds.length}) - attempt ${retry + 1}`);
                    
                    // Enhanced validation for modal structure
                    await this.validateModalStructure([...foundModals, ...bridgeModals]);
                    
                    // PHASE 2.3: Log bridge element usage
                    if (bridgeModals.length > 0) {
                        this.logger.info('MODAL', `Using ${bridgeModals.length} bridge elements for initialization compatibility`);
                    }
                    
                    return;
                }
                
                await new Promise(resolve => setTimeout(resolve, checkInterval));
            }
            
            // PHASE 2.3: Between retries, trigger additional bridge element generation
            if (retry < maxRetries && hasPhase23Enhancements) {
                this.logger.info('MODAL', `Retry ${retry + 1} - triggering additional bridge element generation`);
                
                // Trigger additional bridge element generation
                const generateEvent = new CustomEvent('gmkbGenerateAdditionalBridges', {
                    detail: { retry: retry + 1, missingModals: modalIds }
                });
                document.dispatchEvent(generateEvent);
                
                // Brief wait for bridge generation
                await new Promise(resolve => setTimeout(resolve, 200));
            }
        }
        
        // PHASE 2.3: Final validation with enhanced error reporting
        const finalCheck = modalIds.filter(id => {
            const element = document.getElementById(id);
            if (!element) return true;
            
            const hasContent = element.children.length > 0 || element.textContent.trim().length > 0;
            const isBridge = element.getAttribute('data-fallback-modal') === 'true' ||
                           element.getAttribute('data-phase23-generated') === 'true';
            
            return !hasContent && !isBridge;
        });
        
        const totalElapsed = Date.now() - startTime;
        
        if (finalCheck.length > 0) {
            this.logger.warn('MODAL', `Phase 2.3: Modal validation completed with warnings after ${totalElapsed}ms`, {
                missing: finalCheck,
                totalTimeout: baseWaitTime * Math.pow(1.5, maxRetries),
                actualTime: totalElapsed,
                domState: document.readyState,
                foundCount: modalIds.length - finalCheck.length,
                hasPhase23: hasPhase23Enhancements,
                retries: maxRetries + 1
            });
            
            // PHASE 2.3: Enhanced graceful degradation message
            this.logger.info('MODAL', 'Phase 2.3: Continuing with available modals and bridge elements - enhanced system remains functional');
            
            // PHASE 2.3: Trigger emergency bridge generation for completely missing modals
            if (finalCheck.length > 2) {
                this.logger.warn('MODAL', 'Phase 2.3: Triggering emergency bridge generation for missing modals');
                const emergencyEvent = new CustomEvent('gmkbEmergencyBridgeGeneration', {
                    detail: { missingModals: finalCheck, totalElapsed }
                });
                document.dispatchEvent(emergencyEvent);
            }
        } else {
            this.logger.info('MODAL', `Phase 2.3: All modals validated successfully in ${totalElapsed}ms`);
        }
    }
    
    /**
     * PHASE 2.3: ENHANCED MODAL STRUCTURE VALIDATION
     * Validates both real modals and bridge elements with detailed reporting
     */
    async validateModalStructure(modalIds) {
        this.logger.debug('MODAL', 'Phase 2.3: Enhanced modal structure validation');
        
        const validationResults = {
            real_modals: [],
            bridge_modals: [],
            invalid_modals: [],
            total_validated: 0
        };
        
        for (const modalId of modalIds) {
            const modal = document.getElementById(modalId);
            if (modal) {
                const modalInfo = {
                    id: modalId,
                    children: modal.children.length,
                    hasContent: false,
                    hasCloseButton: false,
                    isBridge: false,
                    isPhase23Generated: false,
                    structureValid: false
                };
                
                // Check for common modal elements
                modalInfo.hasContent = !!(modal.querySelector('.modal-content') || 
                                        modal.querySelector('.modal-body') || 
                                        modal.querySelector('.library'));
                modalInfo.hasCloseButton = !!(modal.querySelector('[data-action="close"]') || 
                                            modal.querySelector('.close') || 
                                            modal.querySelector('.modal-close'));
                
                // Check if it's a bridge or generated element
                modalInfo.isBridge = modal.getAttribute('data-fallback-modal') === 'true';
                modalInfo.isPhase23Generated = modal.getAttribute('data-phase23-generated') === 'true';
                
                // Determine if structure is valid
                modalInfo.structureValid = modalInfo.hasContent || modalInfo.isBridge || modalInfo.isPhase23Generated;
                
                // Categorize the modal
                if (modalInfo.isBridge || modalInfo.isPhase23Generated) {
                    validationResults.bridge_modals.push(modalInfo);
                } else if (modalInfo.structureValid) {
                    validationResults.real_modals.push(modalInfo);
                } else {
                    validationResults.invalid_modals.push(modalInfo);
                }
                
                validationResults.total_validated++;
                
                this.logger.debug('MODAL', `Modal structure validated: ${modalId}`, modalInfo);
            }
        }
        
        // Log comprehensive validation summary
        this.logger.info('MODAL', 'Phase 2.3: Modal structure validation complete', {
            realModals: validationResults.real_modals.length,
            bridgeModals: validationResults.bridge_modals.length,
            invalidModals: validationResults.invalid_modals.length,
            totalValidated: validationResults.total_validated,
            validationSuccess: validationResults.invalid_modals.length === 0
        });
        
        // Store validation results globally for debugging
        window.gmkbModalStructureValidation = validationResults;
        
        return validationResults;
    }

    /**
     * Enhanced modal element readiness validation
     * Ensures all critical modal elements exist before proceeding
     */
    async ensureModalElementsReady() {
        this.logger.info('MODAL', 'Ensuring modal elements are ready for event listener setup');
        
        const requiredElements = [
            'component-library-overlay',
            'component-grid', 
            'add-component-button',
            'cancel-component-button',
            'close-library',
            'add-component-btn', // Sidebar button
            'add-first-component' // Empty state button
        ];
        
        const maxWaitTime = 5000; // Longer timeout for critical elements
        const checkInterval = 100;
        
        for (const elementId of requiredElements) {
            try {
                await this.waitForElement(elementId, maxWaitTime, checkInterval);
                this.logger.debug('MODAL', `Element ready: ${elementId}`);
            } catch (error) {
                this.logger.warn('MODAL', `Element not found but continuing: ${elementId}`, error);
                // Don't throw - some elements may be optional
            }
        }
        
        this.logger.info('MODAL', 'Modal element readiness check complete');
    }

    /**
     * Waits for a specific element to exist in the DOM
     * @param {string} elementId - The ID of the element to wait for
     * @param {number} maxWaitTime - Maximum time to wait in milliseconds
     * @param {number} checkInterval - How often to check in milliseconds
     */
    async waitForElement(elementId, maxWaitTime = 3000, checkInterval = 100) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < maxWaitTime) {
            const element = document.getElementById(elementId);
            if (element) {
                // Additional check to ensure element is properly attached
                if (element.offsetParent !== null || element.style.display !== 'none') {
                    return element;
                }
            }
            await new Promise(resolve => setTimeout(resolve, checkInterval));
        }
        
        throw new Error(`Element ${elementId} not found within ${maxWaitTime}ms`);
    }

    /**
     * Sets up all modal systems with proper event listeners
     * Enhanced with promise-based sequencing and element validation
     */
    async setupModals() {
        this.logger.info('MODAL', 'Setting up modal systems with promise-based sequencing');
        
        try {
            // Step 1: Ensure all modal HTML elements are ready
            await this.ensureModalElementsReady();
            
            // Step 1.5: NOW initialize enhanced component manager when all DOM is ready
            if (window.enhancedComponentManager && typeof window.enhancedComponentManager.init === 'function') {
                if (!window.enhancedComponentManager.isInitialized) {
                    this.logger.info('MODAL', 'Initializing enhanced component manager now that DOM is complete');
                    const initResult = window.enhancedComponentManager.init();
                    if (initResult) {
                        this.logger.info('MODAL', 'Enhanced component manager initialized successfully');
                    } else {
                        this.logger.error('MODAL', 'Enhanced component manager initialization failed - media-kit-preview element still not found');
                        // This is a critical issue that needs investigation
                        const previewExists = !!document.getElementById('media-kit-preview');
                        this.logger.error('MODAL', `media-kit-preview element exists: ${previewExists}`);
                    }
                } else {
                    this.logger.info('MODAL', 'Enhanced component manager already initialized');
                }
            }
            
            // Step 1.6: CRITICAL - Initialize enhanced component renderer
            if (window.renderer && typeof window.renderer.init === 'function') {
                if (!window.renderer.initialized) {
                    this.logger.info('MODAL', 'Initializing enhanced component renderer now that DOM is complete');
                    window.renderer.init();
                    this.logger.info('MODAL', 'Enhanced component renderer initialized - now listening for state changes');
                } else {
                    this.logger.info('MODAL', 'Enhanced component renderer already initialized');
                }
            }
            
            // Step 2: Setup each modal system sequentially
            await this.setupComponentLibraryModal();
            await this.setupTemplateLibraryModal();
            await this.setupGlobalSettingsModal();
            
            // Step 3: Validate all event listeners attached
            await this.validateModalEventListeners();
            
            this.logger.info('MODAL', 'All modal systems setup complete');
        } catch (error) {
            this.logger.error('MODAL', 'Modal setup failed', error);
            throw error;
        }
    }

    /**
     * Sets up the Component Library modal specifically
     */
    async setupComponentLibraryModal() {
        this.logger.debug('MODAL', 'Setting up Component Library modal');
        const setupStart = performance.now();
        
        try {
            // Import with cache busting
            const timestamp = Date.now();
            const componentLibraryModule = await import(`../modals/component-library.js?t=${timestamp}`);
            
            if (componentLibraryModule.setupComponentLibrary) {
                await componentLibraryModule.setupComponentLibrary();
                this.logger.info('MODAL', 'Component Library setup complete', {
                    duration: performance.now() - setupStart
                });
            } else {
                throw new Error('setupComponentLibrary function not found');
            }
        } catch (error) {
            this.logger.error('MODAL', 'Failed to setup Component Library', error);
            throw error;
        }
    }

    /**
     * Sets up the Template Library modal
     */
    async setupTemplateLibraryModal() {
        this.logger.debug('MODAL', 'Setting up Template Library modal');
        
        try {
            const timestamp = Date.now();
            const templateLoaderModule = await import(`../services/template-loader.js?t=${timestamp}`);
            
            if (templateLoaderModule.templateLoader?.init) {
                await templateLoaderModule.templateLoader.init();
                this.logger.debug('MODAL', 'Template Library setup complete');
            } else {
                this.logger.warn('MODAL', 'templateLoader.init not found');
            }
        } catch (error) {
            this.logger.error('MODAL', 'Failed to setup Template Library', error);
            // Non-critical, continue
        }
    }

    /**
     * Sets up the Global Settings modal
     */
    async setupGlobalSettingsModal() {
        this.logger.debug('MODAL', 'Setting up Global Settings modal');
        
        try {
            const timestamp = Date.now();
            const globalSettingsModule = await import(`../modals/global-settings.js?t=${timestamp}`);
            
            if (globalSettingsModule.globalSettings?.init) {
                await globalSettingsModule.globalSettings.init();
                this.logger.debug('MODAL', 'Global Settings setup complete');
            } else {
                this.logger.warn('MODAL', 'globalSettings.init not found');
            }
        } catch (error) {
            this.logger.error('MODAL', 'Failed to setup Global Settings', error);
            // Non-critical, continue
        }
    }

    /**
     * Enhanced validation that modal event listeners are properly attached
     */
    async validateModalEventListeners() {
        this.logger.info('MODAL', 'Validating modal event listeners');
        
        const validations = [
            {
                buttonId: 'add-component-btn',
                modalId: 'component-library-overlay',
                name: 'Component Library (Sidebar)'
            },
            {
                buttonId: 'add-first-component',
                modalId: 'component-library-overlay',
                name: 'Component Library (Empty State)'
            },
            {
                buttonId: 'add-component-button',
                modalId: 'component-library-overlay',
                name: 'Component Library (Add Button)'
            },
            {
                buttonId: 'cancel-component-button',
                modalId: 'component-library-overlay',
                name: 'Component Library (Cancel)'
            },
            {
                buttonId: 'close-library',
                modalId: 'component-library-overlay',
                name: 'Component Library (Close)'
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
        
        const results = {
            passed: [],
            warnings: [],
            errors: []
        };
        
        for (const validation of validations) {
            const button = document.getElementById(validation.buttonId);
            const modal = document.getElementById(validation.modalId);
            
            if (!button) {
                this.logger.warn('MODAL', `${validation.name} button not found`, {
                    buttonId: validation.buttonId
                });
                results.warnings.push(`${validation.name} button missing`);
            } else if (button.hasAttribute('data-listener-attached')) {
                this.logger.debug('MODAL', `${validation.name} button has listener`);
                results.passed.push(validation.name);
            } else {
                this.logger.warn('MODAL', `${validation.name} button may not have listener`, {
                    buttonId: validation.buttonId
                });
                results.warnings.push(`${validation.name} listener missing`);
            }
            
            if (!modal) {
                this.logger.warn('MODAL', `${validation.name} modal not found`, {
                    modalId: validation.modalId
                });
                results.errors.push(`${validation.name} modal missing`);
            }
        }
        
        // Log summary
        this.logger.info('MODAL', 'Modal event listener validation complete', {
            passed: results.passed.length,
            warnings: results.warnings.length,
            errors: results.errors.length,
            details: results
        });
        
        // Only throw if we have critical errors (missing modals)
        if (results.errors.length > 0) {
            this.logger.error('MODAL', 'Critical modal validation errors detected', null, results);
            // Don't throw - allow system to continue with warnings
        }
    }

    /**
     * Validates that modal event listeners are properly attached (legacy method)
     */
    async validateModalSetup() {
        // Delegate to the enhanced validation method
        await this.validateModalEventListeners();
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
        
        // GEMINI FIX: Call the registered initializer to complete enhanced initialization
        if (window.initializer) {
            this.logger.info('STATE', 'Calling registered initializer for enhanced initialization');
            try {
                // Check if it's the new object-based initializer
                if (typeof window.initializer.initialize === 'function') {
                    await window.initializer.initialize();
                    this.logger.info('STATE', 'Object-based initializer completed successfully');
                } else if (typeof window.initializer === 'function') {
                    // Legacy function-based initializer
                    await window.initializer();
                    this.logger.info('STATE', 'Function-based initializer completed successfully');
                } else {
                    this.logger.warn('STATE', 'Initializer found but no initialize method or function available');
                }
            } catch (error) {
                this.logger.error('STATE', 'Registered initializer failed', error);
                // Continue anyway - this shouldn't break the whole initialization
            }
        } else {
            this.logger.warn('STATE', 'No registered initializer found - enhanced features may not work');
        }
        
        // Validate that state manager is responsive
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
     * ROOT FIX: Coordinated state restoration using startup coordination manager
     * This prevents race conditions between MKCG data hydration and component rendering
     * ENHANCED: Now includes enhanced state manager initialization
     */
    async coordinatedStateRestoration() {
        this.logger.info('INIT', 'Starting coordinated state restoration to prevent race conditions');
        
        try {
            // ROOT FIX: First ensure enhanced state manager is initialized
            await this.initializeEnhancedStateManager();
            
            // Use startup coordination manager to handle the sequence
            const coordinationSuccess = await startupCoordinationManager.coordinateStartup({
                enableMKCGHydration: true,
                preloadTemplates: true,
                maxWaitTime: 10000,
                emergencyFallback: true
            });
            
            if (!coordinationSuccess) {
                this.logger.warn('INIT', 'Startup coordination failed, falling back to direct state restoration');
                await this.restoreState();
            } else {
                this.logger.info('INIT', 'Coordinated state restoration completed successfully');
                
                // After coordination, still call restoreState for final steps
                await this.restoreState();
            }
            
        } catch (error) {
            this.logger.error('INIT', 'Coordinated state restoration failed', error);
            
            // Fallback to traditional state restoration
            this.logger.info('INIT', 'Falling back to traditional state restoration');
            await this.restoreState();
        }
    }
    
    /**
     * ROOT FIX: Initialize enhanced state manager with saved state loading
     */
    async initializeEnhancedStateManager() {
        this.logger.info('STATE', 'Initializing enhanced state manager with saved state loading');
        
        try {
            // Check if enhanced state manager is available
            if (!window.enhancedStateManager) {
                this.logger.warn('STATE', 'Enhanced state manager not available - using fallback');
                return false;
            }
            
            // Check if initializeAfterSystems method exists
            if (typeof window.enhancedStateManager.initializeAfterSystems === 'function') {
                this.logger.info('STATE', 'Calling enhanced state manager initializeAfterSystems');
                await window.enhancedStateManager.initializeAfterSystems();
                this.logger.info('STATE', 'Enhanced state manager initialization completed successfully');
                return true;
            } else {
                // Fallback to basic auto-load
                this.logger.warn('STATE', 'initializeAfterSystems not available, using autoLoadSavedState fallback');
                if (typeof window.enhancedStateManager.autoLoadSavedState === 'function') {
                    window.enhancedStateManager.autoLoadSavedState();
                    this.logger.info('STATE', 'Fallback auto-load saved state completed');
                    return true;
                }
            }
            
            this.logger.warn('STATE', 'No enhanced state manager initialization methods available');
            return false;
            
        } catch (error) {
            this.logger.error('STATE', 'Enhanced state manager initialization failed', error);
            
            // Try basic fallback
            try {
                if (window.enhancedStateManager && typeof window.enhancedStateManager.autoLoadSavedState === 'function') {
                    window.enhancedStateManager.autoLoadSavedState();
                    this.logger.info('STATE', 'Emergency fallback auto-load completed');
                    return true;
                }
            } catch (fallbackError) {
                this.logger.error('STATE', 'Emergency fallback also failed', fallbackError);
            }
            
            return false;
        }
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
            version: this.version,
            
            // CRITICAL FIX: Tracker integration status for testing
            trackerIntegrated: this.trackerIntegrated,
            trackerReady: this.trackerReady,
            integrationValidated: this.integrationValidated,
            
            // Additional tracker information
            trackerSummary: this.tracker ? this.tracker.getSummary() : null,
            trackerAvailable: !!this.tracker,
            
            // Enhanced debugging information
            enhancedStatus: {
                managerInitialized: true,
                trackerMethods: this.tracker ? Object.keys(this.tracker).filter(key => typeof this.tracker[key] === 'function') : [],
                globalExposure: {
                    initManager: !!window.initManager,
                    initTracker: !!window.initTracker
                }
            },
            
            // CRITICAL FIX: Circuit breaker status for testing and monitoring
            circuitBreaker: {
                state: this.circuitBreaker.state,
                failureCount: this.circuitBreaker.failureCount,
                maxFailures: this.circuitBreaker.maxFailures,
                isTripped: this.circuitBreaker.isTripped,
                consecutiveSuccesses: this.circuitBreaker.consecutiveSuccesses,
                lastFailureTime: this.circuitBreaker.lastFailureTime,
                resetTimeout: this.circuitBreaker.resetTimeout,
                operational: this.circuitBreaker.state !== 'OPEN'
            }
        };
    }
}

// Export singleton instance
export const initializationManager = new InitializationManager();

// Expose globally for debugging
window.initManager = initializationManager;
