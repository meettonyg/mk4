/**
 * Enhanced Error Handler Integration - Phase 2.3 Task 4
 * 
 * JavaScript integration to initialize and configure enhanced error handling
 * with user guidance in the Media Kit Builder interface.
 * 
 * @version 2.3.0-task4
 */

document.addEventListener('DOMContentLoaded', function() {
    initializeEnhancedErrorHandling();
});

/**
 * TASK 4: Initialize Enhanced Error Handling System
 */
function initializeEnhancedErrorHandling() {
    console.log('🛡️ Task 4: Initializing Enhanced Error Handling with User Guidance...');
    
    // Wait for enhanced error handler to be available
    const waitForErrorHandler = () => {
        if (window.enhancedErrorHandler && typeof window.enhancedErrorHandler.handleErrorWithUserGuidance === 'function') {
            console.log('✅ Enhanced Error Handler is ready and integrated');
            
            // Test the error handler integration (only in debug mode)
            if (window.guestifyData?.systemConfig?.enableDebugMode) {
                console.log('📊 Debug mode: Enhanced Error Handler test commands available');
                console.log('  • errorDebug.testDataConnection() - Test data connection error');
                console.log('  • errorDebug.testComponentGeneration() - Test component error');
                console.log('  • errorDebug.testDataQuality() - Test data quality error');
                console.log('  • errorDebug.help() - Show all commands');
            }
            
            // Set up global error handling integration
            setupGlobalErrorIntegration();
            
            // Set up component error monitoring
            setupComponentErrorMonitoring();
            
            // Set up MKCG data error monitoring
            setupMKCGDataErrorMonitoring();
            
            // Set up state management error monitoring
            setupStateManagerErrorMonitoring();
            
            console.log('✅ Task 4: Enhanced Error Handling initialization complete');
        } else {
            console.log('⏳ Waiting for Enhanced Error Handler...');
            setTimeout(waitForErrorHandler, 100);
        }
    };
    
    waitForErrorHandler();
}

/**
 * TASK 4: Set up global error handling integration
 */
function setupGlobalErrorIntegration() {
    // Integrate with existing window error handlers
    const originalOnError = window.onerror;
    window.onerror = function(message, source, lineno, colno, error) {
        // Let original handler run first
        if (originalOnError) {
            originalOnError.apply(this, arguments);
        }
        
        // Then provide user guidance for significant errors
        if (error && window.enhancedErrorHandler) {
            const shouldShowGuidance = [
                'component', 'mkcg', 'generation', 'mapping', 'state'
            ].some(keyword => message.toLowerCase().includes(keyword));
            
            if (shouldShowGuidance) {
                window.enhancedErrorHandler.handleErrorWithUserGuidance(
                    'GLOBAL', 
                    error, 
                    { 
                        message, 
                        source, 
                        lineno, 
                        colno,
                        errorType: 'component-generation'
                    }
                );
            }
        }
    };
    
    // Enhanced promise rejection handler
    const originalUnhandledRejection = window.onunhandledrejection;
    window.onunhandledrejection = function(event) {
        // Let original handler run first
        if (originalUnhandledRejection) {
            originalUnhandledRejection.apply(this, [event]);
        }
        
        // Provide user guidance for MKCG-related promise rejections
        if (event.reason && window.enhancedErrorHandler) {
            const reasonMessage = event.reason.message || String(event.reason);
            const shouldShowGuidance = [
                'mkcg', 'component', 'mapping', 'data'
            ].some(keyword => reasonMessage.toLowerCase().includes(keyword));
            
            if (shouldShowGuidance) {
                const error = event.reason instanceof Error ? event.reason : new Error(reasonMessage);
                window.enhancedErrorHandler.handleErrorWithUserGuidance(
                    'PROMISE', 
                    error, 
                    { 
                        errorType: 'data-connection',
                        promise: event.promise
                    }
                );
            }
        }
    };
    
    console.log('✅ Global error integration active');
}

/**
 * TASK 4: Set up component error monitoring
 */
function setupComponentErrorMonitoring() {
    // Monitor component operations for errors
    if (window.enhancedComponentManager) {
        const originalAddComponent = window.enhancedComponentManager.addComponent;
        
        window.enhancedComponentManager.addComponent = function(...args) {
            try {
                return originalAddComponent.apply(this, args);
            } catch (error) {
                console.error('🛡️ Component generation error caught:', error);
                
                if (window.enhancedErrorHandler) {
                    window.enhancedErrorHandler.handleErrorWithUserGuidance(
                        'COMPONENT_MANAGER',
                        error,
                        {
                            errorType: 'component-generation',
                            componentType: args[0],
                            operation: 'addComponent'
                        }
                    );
                }
                
                throw error; // Re-throw for other handlers
            }
        };
        
        // Monitor auto-generation functions
        if (window.enhancedComponentManager.autoGenerateFromMKCGEnhanced) {
            const originalAutoGenerate = window.enhancedComponentManager.autoGenerateFromMKCGEnhanced;
            
            window.enhancedComponentManager.autoGenerateFromMKCGEnhanced = function(...args) {
                try {
                    return originalAutoGenerate.apply(this, args);
                } catch (error) {
                    console.error('🛡️ Auto-generation error caught:', error);
                    
                    if (window.enhancedErrorHandler) {
                        window.enhancedErrorHandler.handleErrorWithUserGuidance(
                            'COMPONENT_MANAGER',
                            error,
                            {
                                errorType: 'component-generation',
                                operation: 'autoGenerateFromMKCGEnhanced'
                            }
                        );
                    }
                    
                    throw error;
                }
            };
        }
    }
    
    console.log('✅ Component error monitoring active');
}

/**
 * TASK 4: Set up MKCG data error monitoring
 */
function setupMKCGDataErrorMonitoring() {
    // Monitor MKCG data operations for errors
    if (window.mkcgDataMapper) {
        const originalMapDataToComponent = window.mkcgDataMapper.mapDataToComponent;
        
        window.mkcgDataMapper.mapDataToComponent = function(...args) {
            try {
                return originalMapDataToComponent.apply(this, args);
            } catch (error) {
                console.error('🛡️ MKCG data mapping error caught:', error);
                
                if (window.enhancedErrorHandler) {
                    window.enhancedErrorHandler.handleErrorWithUserGuidance(
                        'MKCG_MAPPER',
                        error,
                        {
                            errorType: 'data-connection',
                            componentType: args[0],
                            operation: 'mapDataToComponent'
                        }
                    );
                }
                
                throw error; // Re-throw for other handlers
            }
        };
        
        // Monitor batch mapping operations
        if (window.mkcgDataMapper.batchMapComponents) {
            const originalBatchMap = window.mkcgDataMapper.batchMapComponents;
            
            window.mkcgDataMapper.batchMapComponents = function(...args) {
                try {
                    return originalBatchMap.apply(this, args);
                } catch (error) {
                    console.error('🛡️ MKCG batch mapping error caught:', error);
                    
                    if (window.enhancedErrorHandler) {
                        window.enhancedErrorHandler.handleErrorWithUserGuidance(
                            'MKCG_MAPPER',
                            error,
                            {
                                errorType: 'data-connection',
                                operation: 'batchMapComponents'
                            }
                        );
                    }
                    
                    throw error;
                }
            };
        }
        
        // Monitor data quality validation
        if (window.mkcgDataMapper.validateAllMappingsEnhanced) {
            const originalValidate = window.mkcgDataMapper.validateAllMappingsEnhanced;
            
            window.mkcgDataMapper.validateAllMappingsEnhanced = function(...args) {
                try {
                    const result = originalValidate.apply(this, args);
                    
                    // Check for quality issues
                    if (result.averageQuality < 30) {
                        if (window.enhancedErrorHandler) {
                            window.enhancedErrorHandler.handleErrorWithUserGuidance(
                                'MKCG_MAPPER',
                                new Error(`Data quality is very low: ${result.averageQuality}%`),
                                {
                                    errorType: 'data-quality',
                                    qualityScore: result.averageQuality,
                                    operation: 'validateAllMappingsEnhanced'
                                }
                            );
                        }
                    }
                    
                    return result;
                } catch (error) {
                    console.error('🛡️ MKCG validation error caught:', error);
                    
                    if (window.enhancedErrorHandler) {
                        window.enhancedErrorHandler.handleErrorWithUserGuidance(
                            'MKCG_MAPPER',
                            error,
                            {
                                errorType: 'validation-error',
                                operation: 'validateAllMappingsEnhanced'
                            }
                        );
                    }
                    
                    throw error;
                }
            };
        }
    }
    
    console.log('✅ MKCG data error monitoring active');
}

/**
 * TASK 4: Set up state manager error monitoring
 */
function setupStateManagerErrorMonitoring() {
    // Monitor state manager operations for errors
    if (window.enhancedStateManager) {
        const originalApplyTransaction = window.enhancedStateManager.applyTransaction;
        
        window.enhancedStateManager.applyTransaction = function(...args) {
            try {
                return originalApplyTransaction.apply(this, args);
            } catch (error) {
                console.error('🛡️ State manager transaction error caught:', error);
                
                if (window.enhancedErrorHandler) {
                    window.enhancedErrorHandler.handleErrorWithUserGuidance(
                        'STATE_MANAGER',
                        error,
                        {
                            errorType: 'sync-error',
                            operation: 'applyTransaction',
                            transaction: args[0]
                        }
                    );
                }
                
                throw error;
            }
        };
        
        // Monitor batch operations
        if (window.enhancedStateManager.performEnhancedBatchOperations) {
            const originalBatchOps = window.enhancedStateManager.performEnhancedBatchOperations;
            
            window.enhancedStateManager.performEnhancedBatchOperations = async function(...args) {
                try {
                    return await originalBatchOps.apply(this, args);
                } catch (error) {
                    console.error('🛡️ State manager batch operations error caught:', error);
                    
                    if (window.enhancedErrorHandler) {
                        window.enhancedErrorHandler.handleErrorWithUserGuidance(
                            'STATE_MANAGER',
                            error,
                            {
                                errorType: 'sync-error',
                                operation: 'performEnhancedBatchOperations'
                            }
                        );
                    }
                    
                    throw error;
                }
            };
        }
        
        // Monitor auto-generation from MKCG
        if (window.enhancedStateManager.autoGenerateComponentsFromMKCG) {
            const originalAutoGen = window.enhancedStateManager.autoGenerateComponentsFromMKCG;
            
            window.enhancedStateManager.autoGenerateComponentsFromMKCG = async function(...args) {
                try {
                    return await originalAutoGen.apply(this, args);
                } catch (error) {
                    console.error('🛡️ State manager auto-generation error caught:', error);
                    
                    if (window.enhancedErrorHandler) {
                        window.enhancedErrorHandler.handleErrorWithUserGuidance(
                            'STATE_MANAGER',
                            error,
                            {
                                errorType: 'component-generation',
                                operation: 'autoGenerateComponentsFromMKCG'
                            }
                        );
                    }
                    
                    throw error;
                }
            };
        }
    }
    
    console.log('✅ State manager error monitoring active');
}

/**
 * TASK 4: Show enhanced notification wrapper
 */
function showEnhancedNotification(message, type = 'info', duration = 5000) {
    // Use existing notification system if available
    if (window.mkToast) {
        window.mkToast[type](message, { duration });
    } else if (window.enhancedErrorHandler) {
        // Fallback to console with enhanced formatting
        console.log(`🔔 ${type.toUpperCase()}: ${message}`);
    } else {
        // Basic console fallback
        console.log(`🔔 ${type.toUpperCase()}: ${message}`);
    }
}

/**
 * TASK 4: Component preview and feature interaction handlers
 */
function showComponentPreview(componentType) {
    console.log(`🔍 Showing preview for component: ${componentType}`);
    
    // Try to add the component with error handling
    if (window.enhancedComponentManager?.addComponent) {
        try {
            const result = window.enhancedComponentManager.addComponent(componentType, {}, true);
            if (result) {
                showEnhancedNotification(`${componentType} component added successfully!`, 'success');
                
                // Hide empty state
                const emptyState = document.getElementById('enhanced-empty-state');
                if (emptyState) {
                    emptyState.style.display = 'none';
                }
            }
        } catch (error) {
            console.error('Error adding component from preview:', error);
            // Error will be caught by component error monitoring and show user guidance panel
        }
    } else {
        if (window.enhancedErrorHandler) {
            window.enhancedErrorHandler.handleErrorWithUserGuidance(
                'UI',
                new Error('Component manager not ready'),
                {
                    errorType: 'component-generation',
                    componentType: componentType,
                    operation: 'showComponentPreview'
                }
            );
        } else {
            showEnhancedNotification('Component manager not ready. Please wait a moment and try again.', 'warning');
        }
    }
}

function showFeatureDetails(featureType) {
    console.log(`🎆 Showing feature details for: ${featureType}`);
    
    const featureMessages = {
        'auto-generation': 'Auto-generation creates components instantly using your MKCG data with intelligent field mapping.',
        'quality-scoring': 'Quality scoring analyzes your data and provides recommendations for improving component generation.',
        'smart-mapping': 'Smart mapping intelligently matches your MKCG data fields to component properties for optimal results.'
    };
    
    const message = featureMessages[featureType] || 'This feature enhances your media kit building experience.';
    showEnhancedNotification(message, 'info', 8000);
}

/**
 * TASK 4: Network error detection and handling
 */
function setupNetworkErrorDetection() {
    // Monitor fetch requests for network errors
    const originalFetch = window.fetch;
    window.fetch = async function(...args) {
        try {
            const response = await originalFetch.apply(this, args);
            
            if (!response.ok) {
                throw new Error(`Network error: ${response.status} ${response.statusText}`);
            }
            
            return response;
        } catch (error) {
            console.error('🛡️ Network error caught:', error);
            
            if (window.enhancedErrorHandler && error.message.includes('Network')) {
                window.enhancedErrorHandler.handleErrorWithUserGuidance(
                    'NETWORK',
                    error,
                    {
                        errorType: 'network-error',
                        url: args[0],
                        operation: 'fetch'
                    }
                );
            }
            
            throw error;
        }
    };
}

/**
 * TASK 4: Set up error recovery event listeners
 */
function setupErrorRecoveryEventListeners() {
    // Listen for error recovery events
    window.addEventListener('enhancedErrorRecovery:connection-restored', (event) => {
        console.log('🎉 Connection restored:', event.detail);
        showEnhancedNotification('Data connection restored successfully!', 'success');
    });
    
    window.addEventListener('enhancedErrorRecovery:component-generated', (event) => {
        console.log('🎉 Component generated after error recovery:', event.detail);
        showEnhancedNotification(`${event.detail.componentType} component generated successfully!`, 'success');
    });
    
    window.addEventListener('enhancedErrorRecovery:sync-restored', (event) => {
        console.log('🎉 Sync restored:', event.detail);
        showEnhancedNotification('Component synchronization restored!', 'success');
    });
    
    window.addEventListener('enhancedErrorRecovery:network-restored', (event) => {
        console.log('🎉 Network restored:', event.detail);
        showEnhancedNotification('Network connection verified!', 'success');
    });
}

/**
 * TASK 4: Enhanced error handling for button interactions
 */
function enhanceButtonErrorHandling() {
    // Enhanced Auto-Generation Buttons with error handling
    const autoGenerateButtons = [
        'mkcg-auto-generate-all',
        'auto-generate-all-empty', 
        'auto-generate-available',
        'generate-anyway'
    ];
    
    autoGenerateButtons.forEach(buttonId => {
        const button = document.getElementById(buttonId);
        if (button) {
            // Remove any existing listeners and add enhanced error handling
            const newButton = button.cloneNode(true);
            button.parentNode.replaceChild(newButton, button);
            
            newButton.addEventListener('click', async function(event) {
                event.preventDefault();
                console.log('🔗 Phase 2.3: Enhanced auto-generating components with error handling...');
                
                // Show enhanced loading state
                const originalText = this.innerHTML;
                this.innerHTML = `
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="animate-spin">
                        <path d="M21 12a9 9 0 11-6.219-8.56"/>
                    </svg>
                    <span>Generating...</span>
                `;
                this.disabled = true;
                
                try {
                    // Wait for enhanced component manager
                    if (!window.enhancedComponentManager?.autoGenerateFromMKCGEnhanced) {
                        throw new Error('Enhanced component manager auto-generation not available');
                    }
                    
                    // Use Phase 2.1 enhanced auto-generation
                    const result = window.enhancedComponentManager.autoGenerateFromMKCGEnhanced(true, {
                        maxComponents: 5,
                        minQualityScore: buttonId === 'generate-anyway' ? 0 : 30,
                        priorityThreshold: 40
                    });
                    
                    if (result.addedComponents && result.addedComponents.length > 0) {
                        console.log(`🎉 Successfully auto-generated ${result.addedComponents.length} enhanced components:`, result.addedComponents);
                        
                        // Update dashboard count
                        const autoGeneratedCount = document.getElementById('auto-generated-count');
                        if (autoGeneratedCount) {
                            autoGeneratedCount.textContent = result.addedComponents.length;
                        }
                        
                        // Hide empty state
                        const emptyState = document.getElementById('enhanced-empty-state');
                        if (emptyState) {
                            emptyState.style.display = 'none';
                        }
                        
                        // Show success notification
                        showEnhancedNotification(
                            `🎉 ${result.addedComponents.length} components generated successfully!`,
                            'success'
                        );
                    } else {
                        throw new Error('No components could be auto-generated from MKCG data');
                    }
                    
                } catch (error) {
                    console.error('Error during enhanced auto-generation:', error);
                    // Error will be handled by component error monitoring
                    
                } finally {
                    // Restore button
                    this.innerHTML = originalText;
                    this.disabled = false;
                }
            });
        }
    });
}

// Initialize enhanced error handling integration
console.log('🔗 Phase 2.3: Enhanced Error Handling JavaScript integration ready');

// Set up additional error handling features when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    setupNetworkErrorDetection();
    setupErrorRecoveryEventListeners();
    enhanceButtonErrorHandling();
});
