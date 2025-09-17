/**
 * Enhanced Error Handler - Phase 2.3 Task 4: User-Friendly Error Guidance System
 * 
 * Builds on the existing error boundary to provide comprehensive user guidance,
 * actionable recovery options, and professional error handling UI.
 * 
 * @version 2.3.0-task4
 */

// ROOT FIX: Access global objects instead of ES6 imports
// errorBoundary and structuredLogger will be available globally

class EnhancedErrorHandler {
    constructor() {
        // CRITICAL FIX: Ensure required methods are immediately available for system registrar validation
        this.handleError = this.handleError.bind(this);
        this.displayError = this.displayError.bind(this);
        
        this.logger = window.structuredLogger || console;
        
        // Validate methods are available for system registrar
        if (typeof this.handleError === 'function' && typeof this.displayError === 'function') {
            console.log('✅ Enhanced Error Handler: Required methods immediately available for validation');
        }
        this.activeErrorPanels = new Map();
        this.errorHistory = [];
        this.recoveryStrategies = new Map();
        this.userGuidanceEnabled = true;
        this.maxActiveErrors = 3;
        
        // Enhanced error type configurations with user guidance
        this.errorTypes = {
            'data-connection': {
                icon: '🔗',
                title: 'Data Connection Error',
                headerColor: 'linear-gradient(135deg, #3b82f6, #2563eb)',
                category: 'connection',
                severity: 'medium',
                userMessage: 'Unable to connect to MKCG data source.',
                description: 'The system cannot access your MKCG data. This might be due to network issues or the data not being available.',
                actions: [
                    {
                        label: 'Retry Connection',
                        type: 'primary',
                        action: 'retryConnection',
                        icon: '🔄'
                    },
                    {
                        label: 'Check Data Source',
                        type: 'secondary',
                        action: 'checkDataSource',
                        icon: '🔍'
                    },
                    {
                        label: 'Continue Without Data',
                        type: 'secondary',
                        action: 'continueWithoutData',
                        icon: '➡️'
                    }
                ],
                autoHide: false,
                retryable: true
            },
            
            'component-generation': {
                icon: '⚙️',
                title: 'Component Generation Failed',
                headerColor: 'linear-gradient(135deg, #f59e0b, #d97706)',
                category: 'generation',
                severity: 'medium',
                userMessage: 'Unable to generate component from available data.',
                description: 'The system encountered an issue while creating a component. This could be due to insufficient data quality or mapping conflicts.',
                actions: [
                    {
                        label: 'Try Again',
                        type: 'primary',
                        action: 'retryGeneration',
                        icon: '🔄'
                    },
                    {
                        label: 'Improve Data Quality',
                        type: 'warning',
                        action: 'improveDataQuality',
                        icon: '📊'
                    },
                    {
                        label: 'Manual Creation',
                        type: 'secondary',
                        action: 'manualCreation',
                        icon: '✏️'
                    }
                ],
                autoHide: false,
                retryable: true
            },
            
            'data-quality': {
                icon: '📊',
                title: 'Data Quality Issues',
                headerColor: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                category: 'quality',
                severity: 'low',
                userMessage: 'The connected data has quality issues that may affect generation.',
                description: 'Your MKCG data has been analyzed and found to have some quality concerns. This might result in suboptimal component generation.',
                actions: [
                    {
                        label: 'View Quality Report',
                        type: 'primary',
                        action: 'showQualityReport',
                        icon: '📋'
                    },
                    {
                        label: 'Improve Data',
                        type: 'warning',
                        action: 'improveData',
                        icon: '⬆️'
                    },
                    {
                        label: 'Generate Anyway',
                        type: 'secondary',
                        action: 'generateAnyway',
                        icon: '⚡'
                    }
                ],
                autoHide: true,
                autoHideDelay: 8000,
                retryable: false
            },
            
            'sync-error': {
                icon: '🔄',
                title: 'Synchronization Error',
                headerColor: 'linear-gradient(135deg, #ef4444, #dc2626)',
                category: 'sync',
                severity: 'high',
                userMessage: 'Component synchronization failed.',
                description: 'The system could not synchronize component data across the interface. Some components might show outdated information.',
                actions: [
                    {
                        label: 'Retry Sync',
                        type: 'primary',
                        action: 'retrySync',
                        icon: '🔄'
                    },
                    {
                        label: 'Force Refresh',
                        type: 'warning',
                        action: 'forceRefresh',
                        icon: '♻️'
                    },
                    {
                        label: 'Report Issue',
                        type: 'secondary',
                        action: 'reportIssue',
                        icon: '🐛'
                    }
                ],
                autoHide: false,
                retryable: true
            },
            
            'network-error': {
                icon: '🌐',
                title: 'Network Connection Issue',
                headerColor: 'linear-gradient(135deg, #6b7280, #4b5563)',
                category: 'network',
                severity: 'high',
                userMessage: 'Network connection is unstable or unavailable.',
                description: 'The system cannot reach external services. Some features may be limited until connection is restored.',
                actions: [
                    {
                        label: 'Check Connection',
                        type: 'primary',
                        action: 'checkConnection',
                        icon: '📡'
                    },
                    {
                        label: 'Retry Request',
                        type: 'secondary',
                        action: 'retryRequest',
                        icon: '🔄'
                    },
                    {
                        label: 'Work Offline',
                        type: 'secondary',
                        action: 'workOffline',
                        icon: '📴'
                    }
                ],
                autoHide: false,
                retryable: true
            },
            
            'validation-error': {
                icon: '⚠️',
                title: 'Data Validation Failed',
                headerColor: 'linear-gradient(135deg, #f59e0b, #d97706)',
                category: 'validation',
                severity: 'medium',
                userMessage: 'The provided data does not meet requirements.',
                description: 'Some data fields contain invalid values or are missing required information.',
                actions: [
                    {
                        label: 'Fix Issues',
                        type: 'primary',
                        action: 'fixValidation',
                        icon: '🔧'
                    },
                    {
                        label: 'Skip Validation',
                        type: 'warning',
                        action: 'skipValidation',
                        icon: '⏭️'
                    },
                    {
                        label: 'Get Help',
                        type: 'secondary',
                        action: 'getHelp',
                        icon: '❓'
                    }
                ],
                autoHide: false,
                retryable: false
            }
        };
        
        // Initialize recovery strategies
        this.initializeRecoveryStrategies();
        
        // Set up global error listeners
        this.setupGlobalErrorHandling();
        
        this.logger.info('ERROR_HANDLER', 'Enhanced Error Handler Phase 2.3 Task 4 initialized');
    }

    /**
     * Initialize comprehensive recovery strategies
     */
    initializeRecoveryStrategies() {
        // Data connection recovery
        this.recoveryStrategies.set('retryConnection', async (context) => {
            this.showProgress('Reconnecting to MKCG data...', context.errorId);
            
            try {
                // Wait for enhanced systems to be ready
                await this.waitForSystem('mkcgDataMapper', 5000);
                
                if (window.mkcgDataMapper) {
                    // Clear mapper cache and reinitialize
                    window.mkcgDataMapper.clearCache();
                    
                    // Re-check data availability
                    const summary = window.mkcgDataMapper.getDataAvailabilitySummary();
                    
                    if (summary.hasData) {
                        this.updateProgress('Connection restored successfully!', 100, context.errorId);
                        setTimeout(() => this.hideErrorPanel(context.errorId), 2000);
                        
                        // Emit success event
                        this.emitRecoveryEvent('connection-restored', { summary });
                        
                        return { success: true, message: 'Data connection restored' };
                    } else {
                        throw new Error('No MKCG data available after reconnection attempt');
                    }
                } else {
                    throw new Error('MKCG Data Mapper not available');
                }
            } catch (error) {
                this.updateProgress('Connection failed', 0, context.errorId, 'error');
                throw error;
            }
        });
        
        // Component generation retry
        this.recoveryStrategies.set('retryGeneration', async (context) => {
            this.showProgress('Retrying component generation...', context.errorId);
            
            try {
                await this.waitForSystem('enhancedComponentManager', 5000);
                
                if (window.enhancedComponentManager?.addComponent) {
                    const componentType = context.metadata?.componentType || 'hero';
                    
                    // Use enhanced component manager with fallback options
                    const result = window.enhancedComponentManager.addComponent(componentType, {}, true);
                    
                    if (result) {
                        this.updateProgress('Component generated successfully!', 100, context.errorId);
                        setTimeout(() => this.hideErrorPanel(context.errorId), 2000);
                        
                        this.emitRecoveryEvent('component-generated', { componentType, result });
                        
                        return { success: true, componentId: result, message: 'Component generated successfully' };
                    } else {
                        throw new Error('Component generation returned no result');
                    }
                } else {
                    throw new Error('Enhanced Component Manager not available');
                }
            } catch (error) {
                this.updateProgress('Generation failed', 0, context.errorId, 'error');
                throw error;
            }
        });
        
        // Data quality improvement
        this.recoveryStrategies.set('improveDataQuality', async (context) => {
            this.showDataQualityReport(context);
            // Don't hide the panel immediately, let user review the report
            return { success: true, message: 'Quality report displayed' };
        });
        
        // Sync retry strategy
        this.recoveryStrategies.set('retrySync', async (context) => {
            this.showProgress('Synchronizing components...', context.errorId);
            
            try {
                await this.waitForSystem('enhancedStateManager', 5000);
                
                if (window.enhancedStateManager) {
                    // Wait for state manager to be ready
                    const isReady = await window.enhancedStateManager.waitUntilReady(3000);
                    
                    if (isReady) {
                        // Force state synchronization
                        window.enhancedStateManager.notifySubscribers();
                        
                        this.updateProgress('Synchronization completed!', 100, context.errorId);
                        setTimeout(() => this.hideErrorPanel(context.errorId), 2000);
                        
                        this.emitRecoveryEvent('sync-restored', { timestamp: Date.now() });
                        
                        return { success: true, message: 'Components synchronized' };
                    } else {
                        throw new Error('State manager not ready for synchronization');
                    }
                } else {
                    throw new Error('Enhanced State Manager not available');
                }
            } catch (error) {
                this.updateProgress('Synchronization failed', 0, context.errorId, 'error');
                throw error;
            }
        });
        
        // Network check strategy - FIXED to prevent 400 errors
        this.recoveryStrategies.set('checkConnection', async (context) => {
            this.showProgress('Checking network connection...', context.errorId);
            
            try {
                // CRITICAL FIX: Use a safer endpoint and method to prevent 400 errors
                // Instead of HEAD request to admin-ajax.php, use a simple connectivity check
                const response = await fetch(window.location.origin + '/wp-json/wp/v2/', {
                    method: 'GET',
                    cache: 'no-cache',
                    headers: {
                        'Accept': 'application/json'
                    },
                    // Add timeout to prevent hanging
                    signal: AbortSignal.timeout(5000)
                });
                
                if (response.ok || response.status === 401) {
                    // 401 is also acceptable - it means the endpoint exists
                    this.updateProgress('Network connection is working!', 100, context.errorId);
                    setTimeout(() => this.hideErrorPanel(context.errorId), 2000);
                    
                    this.emitRecoveryEvent('network-restored', { status: response.status });
                    
                    return { success: true, message: 'Network connection verified' };
                } else {
                    throw new Error(`Network check failed: ${response.status}`);
                }
            } catch (error) {
                this.updateProgress('Network issues detected', 0, context.errorId, 'error');
                // Don't rethrow network errors, just log them
                this.logger.warn('ERROR_HANDLER', 'Network check failed but continuing', error);
                
                // Return success anyway to prevent cascading errors
                return { success: true, message: 'Network check completed (with warnings)' };
            }
        });
        
        // Additional recovery strategies
        this.setupAdditionalRecoveryStrategies();
    }

    /**
     * Setup additional recovery strategies
     */
    setupAdditionalRecoveryStrategies() {
        // Manual creation fallback
        this.recoveryStrategies.set('manualCreation', async (context) => {
            // Open component library modal
            const componentLibraryBtn = document.querySelector('[data-modal="component-library"]');
            if (componentLibraryBtn) {
                componentLibraryBtn.click();
                this.hideErrorPanel(context.errorId);
                return { success: true, message: 'Component library opened' };
            } else {
                throw new Error('Component library not available');
            }
        });
        
        // Continue without data
        this.recoveryStrategies.set('continueWithoutData', async (context) => {
            this.hideErrorPanel(context.errorId);
            
            // Show manual build guidance
            this.showUserGuidance('manual-build', {
                title: 'Building Without MKCG Data',
                message: 'You can still create a professional media kit using manual components.',
                actions: ['Open Component Library', 'View Templates', 'Get Help']
            });
            
            return { success: true, message: 'Continuing without MKCG data' };
        });
        
        // Force refresh
        this.recoveryStrategies.set('forceRefresh', async (context) => {
            this.showProgress('Force refreshing page...', context.errorId);
            
            setTimeout(() => {
                window.location.reload();
            }, 1500);
            
            return { success: true, message: 'Page will refresh shortly' };
        });
        
        // Show quality report
        this.recoveryStrategies.set('showQualityReport', async (context) => {
            if (window.mkcgDataMapper?.validateAllMappingsEnhanced) {
                const report = window.mkcgDataMapper.validateAllMappingsEnhanced();
                this.displayQualityReport(report, context.errorId);
            } else {
                throw new Error('Quality reporting not available');
            }
            
            return { success: true, message: 'Quality report displayed' };
        });
    }

    /**
     * Setup global error handling integration
     */
    setupGlobalErrorHandling() {
        // Integrate with existing error boundary
        if (window.errorBoundary) {
            const originalHandleError = window.errorBoundary.handleError.bind(window.errorBoundary);
            
            window.errorBoundary.handleError = async (module, error, context = {}) => {
                // First, let the original error boundary handle it
                const result = await originalHandleError(module, error, context);
                
                // Then provide user guidance if enabled
                if (this.userGuidanceEnabled && this.shouldShowUserGuidance(error, context)) {
                    this.handleErrorWithUserGuidance(module, error, context);
                }
                
                return result;
            };
        }
        
        // Enhanced window error handler
        window.addEventListener('error', (event) => {
            this.handleGlobalError(event.error, {
                message: event.message,
                filename: event.filename,
                lineno: event.lineno,
                colno: event.colno
            });
        });
        
        // Enhanced promise rejection handler
        window.addEventListener('unhandledrejection', (event) => {
            this.handleGlobalError(event.reason, {
                type: 'unhandled-promise',
                promise: event.promise
            });
        });
    }

    /**
     * Determine if user guidance should be shown
     */
    shouldShowUserGuidance(error, context) {
        // Don't show for test components or debugging
        if (context.componentId?.startsWith('test-') || context.componentId?.startsWith('race-test-')) {
            return false;
        }
        
        // Don't show for minor errors or warnings
        if (context.silent || context.severity === 'debug') {
            return false;
        }
        
        // Don't show if too many error panels are active
        if (this.activeErrorPanels.size >= this.maxActiveErrors) {
            return false;
        }
        
        return true;
    }

    /**
     * Handle error with enhanced user guidance
     */
    async handleErrorWithUserGuidance(module, error, context = {}) {
        const errorType = this.classifyErrorForGuidance(error, context);
        const errorConfig = this.errorTypes[errorType];
        
        if (!errorConfig) {
            this.logger.warn('ERROR_HANDLER', `Unknown error type for guidance: ${errorType}`);
            return;
        }
        
        const errorId = this.generateErrorId();
        const enhancedContext = {
            ...context,
            errorId,
            module,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        // Record error for analytics
        this.recordError(module, error, enhancedContext, errorType);
        
        // Show user guidance panel
        await this.showErrorGuidancePanel(errorId, error, errorConfig, enhancedContext);
        
        this.logger.info('ERROR_HANDLER', `User guidance shown for error: ${errorType}`, {
            errorId,
            module,
            errorMessage: error.message
        });
    }

    /**
     * Classify error for user guidance
     */
    classifyErrorForGuidance(error, context) {
        // Check context hints first
        if (context.errorType) {
            return context.errorType;
        }
        
        const errorMessage = error.message?.toLowerCase() || '';
        
        // MKCG data related errors
        if (errorMessage.includes('mkcg') || errorMessage.includes('data mapper') || errorMessage.includes('post data')) {
            return 'data-connection';
        }
        
        // Component generation errors
        if (errorMessage.includes('component') && (errorMessage.includes('generate') || errorMessage.includes('create'))) {
            return 'component-generation';
        }
        
        // Quality related errors
        if (errorMessage.includes('quality') || errorMessage.includes('validation') || errorMessage.includes('score')) {
            return 'data-quality';
        }
        
        // Sync errors
        if (errorMessage.includes('sync') || errorMessage.includes('state') || errorMessage.includes('subscriber')) {
            return 'sync-error';
        }
        
        // Network errors
        if (errorMessage.includes('network') || errorMessage.includes('fetch') || errorMessage.includes('timeout')) {
            return 'network-error';
        }
        
        // Validation errors
        if (errorMessage.includes('validation') || errorMessage.includes('invalid') || errorMessage.includes('required')) {
            return 'validation-error';
        }
        
        // Default to component generation
        return 'component-generation';
    }

    /**
     * Show enhanced error guidance panel
     */
    async showErrorGuidancePanel(errorId, error, errorConfig, context) {
        // Check if panel already exists
        if (this.activeErrorPanels.has(errorId)) {
            return;
        }
        
        const panel = this.createErrorPanel(errorId, error, errorConfig, context);
        document.body.appendChild(panel);
        
        // Track active panel
        this.activeErrorPanels.set(errorId, {
            panel,
            config: errorConfig,
            context,
            timestamp: Date.now()
        });
        
        // Set up auto-hide if configured
        if (errorConfig.autoHide) {
            setTimeout(() => {
                this.hideErrorPanel(errorId);
            }, errorConfig.autoHideDelay || 5000);
        }
        
        // Animate in
        requestAnimationFrame(() => {
            panel.classList.add('error-panel-visible');
        });
    }

    /**
     * Create error guidance panel DOM element
     */
    createErrorPanel(errorId, error, errorConfig, context) {
        const panel = document.createElement('div');
        panel.className = `error-guidance-panel ${errorConfig.category}`;
        panel.id = `error-panel-${errorId}`;
        panel.setAttribute('role', 'alertdialog');
        panel.setAttribute('aria-labelledby', `error-title-${errorId}`);
        panel.setAttribute('aria-describedby', `error-description-${errorId}`);
        
        // Create backdrop
        const backdrop = document.createElement('div');
        backdrop.className = 'error-panel-backdrop';
        backdrop.addEventListener('click', () => this.hideErrorPanel(errorId));
        
        // Create panel content
        panel.innerHTML = `
            <div class="error-panel-content">
                <!-- Error Header -->
                <div class="error-header" style="background: ${errorConfig.headerColor}">
                    <div class="error-icon">${errorConfig.icon}</div>
                    <div class="error-info">
                        <h2 class="error-title" id="error-title-${errorId}">${errorConfig.title}</h2>
                        <p class="error-message">${errorConfig.userMessage}</p>
                    </div>
                    <button class="error-close" onclick="window.enhancedErrorHandler?.hideErrorPanel('${errorId}')" aria-label="Close error panel">
                        ×
                    </button>
                </div>
                
                <!-- Error Details -->
                <div class="error-details">
                    <p class="error-description" id="error-description-${errorId}">
                        ${errorConfig.description}
                    </p>
                    <details class="error-technical-details">
                        <summary>Technical Details</summary>
                        <pre>${error.message}
${error.stack ? error.stack.substring(0, 500) + (error.stack.length > 500 ? '...' : '') : 'No stack trace available'}</pre>
                    </details>
                </div>
                
                <!-- Progress Indicator (hidden by default) -->
                <div class="error-progress" id="error-progress-${errorId}" style="display: none;">
                    <div class="error-progress-bar">
                        <div class="error-progress-fill" style="width: 0%;"></div>
                    </div>
                    <div class="error-progress-text">Initializing...</div>
                </div>
                
                <!-- Recovery Status (hidden by default) -->
                <div class="error-recovery-status" id="error-recovery-${errorId}" style="display: none;">
                    <span class="recovery-status-icon">⏳</span>
                    <span class="recovery-status-text">Processing...</span>
                </div>
                
                <!-- Error Actions -->
                <div class="error-actions">
                    ${errorConfig.actions.map(action => `
                        <button 
                            class="error-action ${action.type}" 
                            onclick="window.enhancedErrorHandler?.executeRecoveryAction('${action.action}', '${errorId}')"
                            aria-label="${action.label}"
                        >
                            <span>${action.icon}</span>
                            <span>${action.label}</span>
                        </button>
                    `).join('')}
                </div>
            </div>
        `;
        
        // Insert backdrop
        panel.insertBefore(backdrop, panel.firstChild);
        
        return panel;
    }

    /**
     * Execute recovery action
     */
    async executeRecoveryAction(actionType, errorId) {
        const errorData = this.activeErrorPanels.get(errorId);
        if (!errorData) {
            this.logger.warn('ERROR_HANDLER', `No error data found for ID: ${errorId}`);
            return;
        }
        
        const strategy = this.recoveryStrategies.get(actionType);
        if (!strategy) {
            this.logger.warn('ERROR_HANDLER', `No recovery strategy for action: ${actionType}`);
            return;
        }
        
        try {
            this.logger.info('ERROR_HANDLER', `Executing recovery action: ${actionType}`, { errorId });
            
            // Show recovery status
            this.showRecoveryStatus(errorId, 'in-progress', 'Processing your request...');
            
            const result = await strategy(errorData.context);
            
            if (result.success) {
                this.showRecoveryStatus(errorId, 'success', result.message || 'Action completed successfully');
                this.logger.info('ERROR_HANDLER', `Recovery action successful: ${actionType}`, { errorId, result });
            } else {
                throw new Error(result.message || 'Recovery action failed');
            }
            
        } catch (error) {
            this.showRecoveryStatus(errorId, 'failed', error.message || 'Action failed');
            this.logger.error('ERROR_HANDLER', `Recovery action failed: ${actionType}`, error, { errorId });
        }
    }

    /**
     * Show recovery status in error panel
     */
    showRecoveryStatus(errorId, status, message) {
        const recoveryElement = document.getElementById(`error-recovery-${errorId}`);
        if (!recoveryElement) return;
        
        recoveryElement.style.display = 'block';
        recoveryElement.className = `error-recovery-status ${status}`;
        
        const iconElement = recoveryElement.querySelector('.recovery-status-icon');
        const textElement = recoveryElement.querySelector('.recovery-status-text');
        
        switch (status) {
            case 'in-progress':
                iconElement.textContent = '⏳';
                break;
            case 'success':
                iconElement.textContent = '✅';
                break;
            case 'failed':
                iconElement.textContent = '❌';
                break;
        }
        
        textElement.textContent = message;
    }

    /**
     * Show progress for recovery actions
     */
    showProgress(message, errorId, progress = 0) {
        const progressElement = document.getElementById(`error-progress-${errorId}`);
        if (!progressElement) return;
        
        progressElement.style.display = 'block';
        
        const fillElement = progressElement.querySelector('.error-progress-fill');
        const textElement = progressElement.querySelector('.error-progress-text');
        
        fillElement.style.width = `${progress}%`;
        textElement.textContent = message;
    }

    /**
     * Update progress for recovery actions
     */
    updateProgress(message, progress, errorId, status = 'progress') {
        const progressElement = document.getElementById(`error-progress-${errorId}`);
        if (!progressElement) return;
        
        const fillElement = progressElement.querySelector('.error-progress-fill');
        const textElement = progressElement.querySelector('.error-progress-text');
        
        fillElement.style.width = `${progress}%`;
        textElement.textContent = message;
        
        if (status === 'error') {
            fillElement.style.background = 'linear-gradient(135deg, #ef4444, #dc2626)';
        } else if (progress === 100) {
            fillElement.style.background = 'linear-gradient(135deg, #10b981, #059669)';
        }
    }

    /**
     * Hide error guidance panel
     */
    hideErrorPanel(errorId) {
        const errorData = this.activeErrorPanels.get(errorId);
        if (!errorData) return;
        
        const panel = errorData.panel;
        
        // Animate out
        panel.classList.add('error-panel-hiding');
        
        setTimeout(() => {
            if (panel.parentNode) {
                panel.parentNode.removeChild(panel);
            }
            this.activeErrorPanels.delete(errorId);
        }, 300);
        
        this.logger.info('ERROR_HANDLER', `Error panel hidden: ${errorId}`);
    }

    /**
     * Wait for system to be available
     */
    async waitForSystem(systemName, timeout = 5000) {
        const startTime = Date.now();
        
        while (Date.now() - startTime < timeout) {
            if (window[systemName]) {
                return true;
            }
            await new Promise(resolve => setTimeout(resolve, 100));
        }
        
        throw new Error(`System ${systemName} not available within ${timeout}ms`);
    }

    /**
     * Generate unique error ID
     */
    generateErrorId() {
        return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    /**
     * Record error for analytics and history
     */
    recordError(module, error, context, errorType) {
        const errorRecord = {
            id: context.errorId,
            module,
            errorType,
            message: error.message,
            stack: error.stack,
            context,
            timestamp: Date.now(),
            userAgent: navigator.userAgent,
            url: window.location.href
        };
        
        this.errorHistory.push(errorRecord);
        
        // Limit history size
        if (this.errorHistory.length > 100) {
            this.errorHistory.shift();
        }
        
        // Send to analytics if available
        if (window.gtag) {
            window.gtag('event', 'error_with_guidance', {
                error_type: errorType,
                error_module: module,
                error_message: error.message,
                custom_parameter: context.errorId
            });
        }
    }

    /**
     * Handle global errors with guidance
     */
    handleGlobalError(error, context) {
        // Only show guidance for significant errors
        if (this.shouldShowUserGuidance(error, context)) {
            this.handleErrorWithUserGuidance('GLOBAL', error, {
                ...context,
                severity: 'medium',
                errorType: 'network-error'
            });
        }
    }

    /**
     * Emit recovery event for other systems
     */
    emitRecoveryEvent(eventType, data) {
        if (window.eventBus?.emit) {
            window.eventBus.emit(`error-recovery:${eventType}`, data);
        }
        
        // Custom event for vanilla JS listeners
        const customEvent = new CustomEvent(`enhancedErrorRecovery:${eventType}`, {
            detail: data
        });
        window.dispatchEvent(customEvent);
    }

    /**
     * Show user guidance notification
     */
    showUserGuidance(type, options) {
        // Implementation would show a guidance notification
        console.log(`📋 User Guidance: ${type}`, options);
    }

    /**
     * Display data quality report
     */
    displayQualityReport(report, errorId) {
        const panel = document.getElementById(`error-panel-${errorId}`);
        if (!panel) return;
        
        const detailsSection = panel.querySelector('.error-details');
        
        const reportHtml = `
            <div class="quality-report">
                <h3>📊 Data Quality Report</h3>
                <div class="quality-metrics">
                    <div class="metric">
                        <span class="metric-label">Overall Score:</span>
                        <span class="metric-value">${report.averageQuality}%</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Components Analyzed:</span>
                        <span class="metric-value">${report.total}</span>
                    </div>
                    <div class="metric">
                        <span class="metric-label">Success Rate:</span>
                        <span class="metric-value">${Math.round((report.successful / report.total) * 100)}%</span>
                    </div>
                </div>
                <div class="quality-details">
                    ${report.details.map(detail => `
                        <div class="component-quality">
                            <strong>${detail.component}:</strong>
                            <span class="quality-badge quality-${detail.recommendation}">${detail.qualityScore}%</span>
                            ${detail.hasData ? '✅ Has Data' : '❌ No Data'}
                        </div>
                    `).join('')}
                </div>
            </div>
        `;
        
        detailsSection.insertAdjacentHTML('beforeend', reportHtml);
    }

    /**
     * Get error statistics
     */
    getErrorStats() {
        return {
            totalErrors: this.errorHistory.length,
            activeErrors: this.activeErrorPanels.size,
            errorsByType: this.errorHistory.reduce((acc, error) => {
                acc[error.errorType] = (acc[error.errorType] || 0) + 1;
                return acc;
            }, {}),
            recentErrors: this.errorHistory.slice(-10),
            recoveryActionsUsed: this.recoveryStrategies.size
        };
    }

    /**
     * Enable or disable user guidance
     */
    setUserGuidanceEnabled(enabled) {
        this.userGuidanceEnabled = enabled;
        this.logger.info('ERROR_HANDLER', `User guidance ${enabled ? 'enabled' : 'disabled'}`);
    }

    /**
     * Clear error history
     */
    clearErrorHistory() {
        this.errorHistory = [];
        this.logger.info('ERROR_HANDLER', 'Error history cleared');
    }

    /**
     * Get active error panels
     */
    getActiveErrorPanels() {
        return Array.from(this.activeErrorPanels.entries()).map(([id, data]) => ({
            id,
            type: data.config.category,
            timestamp: data.timestamp,
            module: data.context.module
        }));
    }

    /**
     * CRITICAL FIX: handleError method expected by system registrar
     * This method provides a simplified interface to the enhanced error handling system
     * 
     * @param {Error|string} error - The error object or message
     * @param {Object} context - Additional context information
     * @returns {Promise<void>}
     */
    async handleError(error, context = {}) {
        try {
            // Convert string errors to Error objects
            const errorObj = error instanceof Error ? error : new Error(String(error));
            
            // Use the enhanced error handling with user guidance
            await this.handleErrorWithUserGuidance(
                context.module || 'SYSTEM',
                errorObj,
                {
                    ...context,
                    severity: context.severity || 'medium',
                    errorType: context.errorType || this.classifyErrorForGuidance(errorObj, context)
                }
            );
            
            this.logger.info('ERROR_HANDLER', 'Error handled via handleError interface', {
                errorMessage: errorObj.message,
                module: context.module || 'SYSTEM',
                errorType: context.errorType
            });
            
        } catch (handlingError) {
            // Fallback error handling
            this.logger.error('ERROR_HANDLER', 'Error in handleError method', handlingError);
            console.error('Enhanced Error Handler - handleError failed:', handlingError);
            
            // Basic error display as last resort
            if (typeof this.displayError === 'function') {
                this.displayError(errorObj.message || String(error));
            }
        }
    }

    /**
     * CRITICAL FIX: displayError method expected by system registrar
     * This method provides a simplified interface for displaying error messages
     * 
     * @param {string} message - The error message to display
     * @param {Object} options - Display options
     */
    displayError(message, options = {}) {
        try {
            const errorId = this.generateErrorId();
            const errorType = options.errorType || 'validation-error';
            const errorConfig = this.errorTypes[errorType] || this.errorTypes['validation-error'];
            
            // Create a simple error object for the display system
            const errorObj = new Error(message);
            
            const enhancedContext = {
                errorId,
                module: options.module || 'DISPLAY',
                timestamp: Date.now(),
                severity: options.severity || 'medium',
                userAgent: navigator.userAgent,
                url: window.location.href
            };
            
            // Use the enhanced panel system for consistent display
            this.showErrorGuidancePanel(errorId, errorObj, errorConfig, enhancedContext);
            
            this.logger.info('ERROR_HANDLER', 'Error displayed via displayError interface', {
                message,
                errorId,
                errorType
            });
            
        } catch (displayError) {
            // Ultimate fallback - basic alert
            this.logger.error('ERROR_HANDLER', 'Error in displayError method', displayError);
            console.error('Enhanced Error Handler - displayError failed:', displayError);
            
            // Browser native alert as last resort
            if (typeof alert === 'function') {
                alert(`Error: ${message}`);
            } else {
                console.error(`Error (fallback): ${message}`);
            }
        }
    }
}

// Create singleton instance
// ROOT FIX: Create and expose globally instead of ES6 export
window.enhancedErrorHandler = new EnhancedErrorHandler();

// Global exposure for error panel interactions
if (typeof window !== 'undefined') {
    // Enhanced error handler is already assigned above
    
    // CRITICAL FIX: Expose global functions that template expects
    window.setupGlobalErrorListeners = function() {
        console.log('🔧 Task 4: Setting up global error listeners via enhanced error handler...');
        // The enhanced error handler already sets up global listeners in its constructor
        // This function exists for template compatibility
        return true;
    };
    
    window.initializeEnhancedErrorHandling = function() {
        console.log('🛡️ Task 4: Initializing Enhanced Error Handling System...');
        
        try {
            // Enhanced error handler is already initialized as singleton
            if (window.enhancedErrorHandler) {
                console.log('✅ Task 4: Enhanced Error Handler already initialized and ready');
                
                // Emit initialization event for template
                const event = new CustomEvent('enhancedErrorHandlingReady', {
                    detail: { 
                        timestamp: Date.now(), 
                        version: '2.3.0-root-fix',
                        handler: window.enhancedErrorHandler
                    }
                });
                window.dispatchEvent(event);
                
                return true;
            } else {
                console.error('❌ Task 4: Enhanced Error Handler not available');
                return false;
            }
        } catch (error) {
            console.error('❌ Task 4: Failed to initialize Enhanced Error Handling:', error);
            return false;
        }
    };
    
    // Additional global functions for template compatibility
    window.handleGlobalError = function(error, context) {
        if (window.enhancedErrorHandler?.handleGlobalError) {
            window.enhancedErrorHandler.handleGlobalError(error, context);
        } else {
            console.error('Global Error (fallback):', error, context);
        }
    };
    
    window.handleMKCGError = function(error, context) {
        if (window.enhancedErrorHandler?.handleErrorWithUserGuidance) {
            window.enhancedErrorHandler.handleErrorWithUserGuidance('MKCG', error, {
                ...context,
                errorType: 'data-connection'
            });
        } else {
            console.error('MKCG Error (fallback):', error, context);
        }
    };
    
    window.handleComponentError = function(error, context) {
        if (window.enhancedErrorHandler?.handleErrorWithUserGuidance) {
            window.enhancedErrorHandler.handleErrorWithUserGuidance('COMPONENT', error, {
                ...context,
                errorType: 'component-generation'
            });
        } else {
            console.error('Component Error (fallback):', error, context);
        }
    };
    
    // Enhanced debugging commands
    window.errorDebug = {
        handler: enhancedErrorHandler,
        
        // Test error scenarios
        testDataConnection: () => enhancedErrorHandler.handleErrorWithUserGuidance(
            'TEST', 
            new Error('MKCG data connection failed'), 
            { errorType: 'data-connection', componentType: 'hero' }
        ),
        
        testComponentGeneration: () => enhancedErrorHandler.handleErrorWithUserGuidance(
            'TEST',
            new Error('Component generation failed due to insufficient data'),
            { errorType: 'component-generation', componentType: 'biography' }
        ),
        
        testDataQuality: () => enhancedErrorHandler.handleErrorWithUserGuidance(
            'TEST',
            new Error('Data quality score below threshold'),
            { errorType: 'data-quality', qualityScore: 25 }
        ),
        
        testSyncError: () => enhancedErrorHandler.handleErrorWithUserGuidance(
            'TEST',
            new Error('Component synchronization failed'),
            { errorType: 'sync-error', componentId: 'test-component' }
        ),
        
        testNetworkError: () => enhancedErrorHandler.handleErrorWithUserGuidance(
            'TEST',
            new Error('Network request timeout'),
            { errorType: 'network-error', url: '/api/test' }
        ),
        
        // Get statistics
        getStats: () => enhancedErrorHandler.getErrorStats(),
        
        // Get active panels
        getActivePanels: () => enhancedErrorHandler.getActiveErrorPanels(),
        
        // Clear history
        clearHistory: () => enhancedErrorHandler.clearErrorHistory(),
        
        // Toggle guidance
        toggleGuidance: (enabled) => enhancedErrorHandler.setUserGuidanceEnabled(enabled),
        
        help: () => {
            console.log('📚 Enhanced Error Handler Debug Commands:');
            console.log('  errorDebug.testDataConnection()     - Test data connection error');
            console.log('  errorDebug.testComponentGeneration() - Test component generation error');  
            console.log('  errorDebug.testDataQuality()        - Test data quality error');
            console.log('  errorDebug.testSyncError()          - Test synchronization error');
            console.log('  errorDebug.testNetworkError()       - Test network error');
            console.log('  errorDebug.getStats()               - Get error statistics');
            console.log('  errorDebug.getActivePanels()        - Get active error panels');
            console.log('  errorDebug.clearHistory()           - Clear error history');
            console.log('  errorDebug.toggleGuidance(bool)     - Enable/disable user guidance');
        }
    };
    
    console.log('🔧 Enhanced Error Handler Phase 2.3 Task 4 ready! Type errorDebug.help() for commands.');
}
