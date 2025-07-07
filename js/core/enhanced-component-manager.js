/**
 * @file enhanced-component-manager.js
 * @description Manages component-related actions like adding, removing, and handling UI controls.
 * It acts as an intermediary between the UI and the state manager for component operations.
 */

import {
    enhancedStateManager
} from './enhanced-state-manager.js';
import {
    structuredLogger
} from '../utils/structured-logger.js';
import {
    performanceMonitor
} from '../utils/performance-monitor.js';
import {
    generateUniqueId
} from '../utils/helpers.js';
import {
    mkcgDataMapper
} from '../utils/mkcg-data-mapper.js';

class EnhancedComponentManager {
    constructor() {
        this.logger = structuredLogger;
        this.previewContainer = null;
        this.isInitialized = false;
        this.logger.info('INIT', 'Enhanced Component Manager created');
    }

    /**
     * Initialize the component manager - call this when DOM is ready
     * This method is safe to call multiple times
     */
    init() {
        if (this.isInitialized) {
            return true; // Already initialized
        }
        
        // Find the preview container - there is only one correct element
        this.previewContainer = document.getElementById('media-kit-preview');
        
        if (!this.previewContainer) {
            this.logger.warn('INIT', 'media-kit-preview element not found, initialization deferred');
            return false;
        }
        
        // Set up event listeners
        this.setupEventListeners();
        this.isInitialized = true;
        
        this.logger.info('INIT', 'Enhanced Component Manager initialized successfully');
        return true;
    }
    
    /**
     * Setup event listeners for component controls
     */
    setupEventListeners() {
        this.previewContainer.addEventListener('click', this.handleControls.bind(this));
    }
    
    /**
     * Ensures the component manager is initialized before use
     * @returns {boolean} True if ready, false if DOM not available
     */
    ensureInitialized() {
        if (this.isInitialized) {
            return true;
        }
        
        return this.init();
    }

    /**
     * Get component and action from event
     */
    getComponentAndAction(event) {
        const controlButton = event.target.closest('.control-btn');
        const componentElement = controlButton?.closest('[data-component-id]');
        const componentId = componentElement?.dataset.componentId;
        const action = controlButton?.title;
        return { componentId, action };
    }

    /**
     * Handles clicks on component control buttons (delete, duplicate, etc.).
     * @param {Event} event - The click event.
     */
    handleControls(event) {
        // Ensure we're initialized before handling events
        if (!this.ensureInitialized()) {
            this.logger.warn('CONTROL', 'Cannot handle controls, DOM not ready');
            return;
        }
        
        const { componentId, action } = this.getComponentAndAction(event);
        if (!componentId || !action) return;

        const perfEnd = performanceMonitor.start('control-action', {
            action,
            componentId
        });
        this.logger.info('CONTROL', `Action: ${action}`, { componentId });

        try {
            // GEMINI FIX: Enhanced control action handling with performance tracking
            const actionPerfEnd = performanceMonitor.start(`control-${action.toLowerCase().replace(' ', '-')}`, { componentId });
            
            switch (action) {
                case 'Delete':
                    this.removeComponent(componentId);
                    break;
                case 'Duplicate':
                    this.duplicateComponent(componentId);
                    break;
                case 'Move Up':
                    enhancedStateManager.moveComponent(componentId, 'up');
                    break;
                case 'Move Down':
                    enhancedStateManager.moveComponent(componentId, 'down');
                    break;
                case 'Edit':
                    this.editComponent(componentId);
                    break;
                default:
                    this.logger.warn('CONTROL', `Unknown control action: ${action}`, { componentId });
                    actionPerfEnd();
                    return; // Exit early for unknown actions
            }
            
            actionPerfEnd();
            this.logger.info('CONTROL', `Successfully executed ${action}`, { componentId });
        } catch (error) {
            this.logger.error('CONTROL', `Failed to execute control action: ${action}`, error, { componentId });
        } finally {
            perfEnd();
        }
    }

    /**
     * PHASE 2.1: Enhanced component addition with advanced MKCG data integration
     * @param {string} componentType - The type of the component to add.
     * @param {object} props - The initial properties for the new component.
     * @param {boolean} autoPopulate - Whether to auto-populate with MKCG data (default: true)
     */
    addComponent(componentType, props = {}, autoPopulate = true) {
        // Ensure component manager is initialized (but don't require DOM for state operations)
        this.ensureInitialized();
        
        const perfEnd = performanceMonitor.start('add-component', { componentType, autoPopulate });
        
        try {
            let finalProps = { ...props };
            let mkcgDataUsed = false;
            let mkcgMetadata = null;
            
            // PHASE 2.1: Enhanced MKCG Data Integration with quality analysis
            if (autoPopulate && mkcgDataMapper && typeof mkcgDataMapper.mapDataToComponent === 'function') {
                try {
                    // Get enhanced mapping result with metadata
                    const mappingResult = mkcgDataMapper.mapDataToComponent(componentType);
                    
                    if (mappingResult && mappingResult.props && Object.keys(mappingResult.props).length > 0) {
                        // Merge enhanced MKCG props with provided props (provided props take precedence)
                        finalProps = { ...mappingResult.props, ...props };
                        mkcgDataUsed = true;
                        mkcgMetadata = mappingResult.metadata;
                        
                        this.logger.info('MKCG', `Enhanced auto-populated ${componentType} with MKCG data`, {
                            mappedFields: mappingResult.metadata.mappedFields,
                            qualityScore: `${mappingResult.metadata.dataQuality.overallScore}%`,
                            priority: mappingResult.metadata.priority,
                            recommendation: mappingResult.metadata.dataQuality.recommendation,
                            overriddenFields: Object.keys(props),
                            finalFields: Object.keys(finalProps)
                        });
                        
                        // PHASE 2.1: Show enhanced notification with quality info
                        if (mappingResult.metadata.dataQuality.overallScore >= 70) {
                            this.showEnhancedMKCGNotification(componentType, mappingResult.metadata, 'excellent');
                        } else if (mappingResult.metadata.dataQuality.overallScore >= 40) {
                            this.showEnhancedMKCGNotification(componentType, mappingResult.metadata, 'good');
                        } else {
                            this.showEnhancedMKCGNotification(componentType, mappingResult.metadata, 'fair');
                        }
                    } else {
                        this.logger.info('MKCG', `No suitable MKCG data found for ${componentType}`, {
                            reason: mappingResult?.metadata?.reason || 'unknown',
                            details: mappingResult?.metadata?.details || 'no details'
                        });
                    }
                } catch (mkcgError) {
                    this.logger.warn('MKCG', `Failed to auto-populate ${componentType} with enhanced MKCG data`, mkcgError);
                    // Continue with original props on MKCG error
                }
            }
            
            this.logger.info('COMPONENT', `Adding enhanced component ${componentType}`, {
                props: finalProps,
                mkcgDataUsed,
                propsCount: Object.keys(finalProps).length,
                qualityScore: mkcgMetadata?.dataQuality?.overallScore || 0,
                priority: mkcgMetadata?.priority || 0
            });
            
            // PHASE 2.1: Enhanced component with metadata
            const newComponent = {
                id: generateUniqueId(componentType),
                type: componentType,
                props: finalProps,
                mkcgPopulated: mkcgDataUsed,
                mkcgMetadata: mkcgDataUsed ? mkcgMetadata : null,
                createdAt: Date.now(),
                version: '2.1.0-enhanced'
            };
            
            enhancedStateManager.addComponent(newComponent);
            
            this.logger.info('COMPONENT', `Successfully added enhanced component ${componentType}`, {
                id: newComponent.id,
                mkcgDataUsed,
                propsCount: Object.keys(finalProps).length,
                qualityScore: mkcgMetadata?.dataQuality?.overallScore || 0,
                priority: mkcgMetadata?.priority || 0
            });
            
            // Enhanced notification is shown during mapping process above
            
            return newComponent.id;
            
        } catch (error) {
            this.logger.error('COMPONENT', `Failed to add component ${componentType}`, error);
            throw error;
        } finally {
            perfEnd();
        }
    }

    /**
     * Removes a component from the state.
     * @param {string} componentId - The ID of the component to remove.
     */
    removeComponent(componentId) {
        try {
            enhancedStateManager.removeComponent(componentId);
            this.logger.info('COMPONENT', 'Component removed', { componentId });
        } catch (error) {
            this.logger.error('COMPONENT', 'Failed to remove component', error, { componentId });
        }
    }

    /**
     * Duplicates an existing component.
     * @param {string} componentId - The ID of the component to duplicate.
     */
    duplicateComponent(componentId) {
        try {
            const originalComponent = enhancedStateManager.getComponent(componentId);
            if (originalComponent) {
                const newComponent = {
                    ...originalComponent,
                    id: generateUniqueId(originalComponent.type),
                    props: { ...originalComponent.props }, // Deep copy props
                };
                enhancedStateManager.addComponent(newComponent);
                this.logger.info('COMPONENT', 'Component duplicated', { 
                    originalId: componentId, 
                    newId: newComponent.id 
                });
            } else {
                this.logger.warn('COMPONENT', 'Cannot duplicate - component not found', { componentId });
            }
        } catch (error) {
            this.logger.error('COMPONENT', 'Failed to duplicate component', error, { componentId });
        }
    }

    /**
     * Updates a component's properties in the state.
     * GEMINI FIX: Enhanced updateComponent method required by design panel.
     * @param {string} componentId - The ID of the component to update.
     * @param {object} newProps - The new properties to apply to the component.
     */
    updateComponent(componentId, newProps) {
        // Ensure component manager is initialized
        if (!this.ensureInitialized()) {
            this.logger.warn('COMPONENT', 'Cannot update component, DOM not ready', { componentId });
            throw new Error('Component manager not initialized');
        }
        
        try {
            this.logger.info('COMPONENT', `Updating component ${componentId}`, newProps);
            
            // Get the current component from state
            const currentComponent = enhancedStateManager.getComponent(componentId);
            
            if (!currentComponent) {
                this.logger.warn('COMPONENT', 'Cannot update - component not found', { componentId });
                throw new Error(`Component ${componentId} not found in state`);
            }
            
            // GEMINI FIX: Use the enhanced state manager's updateComponent method directly
            // This method expects componentId and newProps, not a full component object
            enhancedStateManager.updateComponent(componentId, newProps);
            
            this.logger.info('COMPONENT', `Successfully updated component ${componentId}`, {
                updatedProps: Object.keys(newProps)
            });
            
            return true;
            
        } catch (error) {
            this.logger.error('COMPONENT', `Failed to update component ${componentId}`, error, {
                newProps,
                hasComponent: !!enhancedStateManager.getComponent(componentId)
            });
            throw error;
        }
    }

    /**
     * Opens edit panel for component
     * @param {string} componentId - The ID of the component to edit
     */
    editComponent(componentId) {
        this.logger.info('CONTROL', 'Edit action triggered', { componentId });
        
        try {
            // GEMINI FIX: Emit event to open design panel
            if (window.eventBus && typeof window.eventBus.emit === 'function') {
                window.eventBus.emit('ui:open-design-panel', {
                    componentId,
                    component: enhancedStateManager.getComponent(componentId)
                });
            } else {
                // Fallback to direct method call if event bus not available
                if (window.designPanel && typeof window.designPanel.open === 'function') {
                    window.designPanel.open(componentId);
                } else {
                    this.logger.warn('CONTROL', 'Design panel system not available', { componentId });
                }
            }
        } catch (error) {
            this.logger.error('CONTROL', 'Failed to open edit panel', error, { componentId });
        }
    }
    
    /**
     * GEMINI FIX: Get component manager status for debugging
     * @returns {object} Status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            hasPreviewContainer: !!this.previewContainer,
            previewContainerId: this.previewContainer?.id || null,
            componentCount: Object.keys(enhancedStateManager.getState().components || {}).length,
            mkcgIntegration: {
                mapperAvailable: !!mkcgDataMapper,
                hasGuestifyData: !!(typeof window !== 'undefined' && window.guestifyData),
                hasMKCGData: !!(typeof window !== 'undefined' && window.guestifyData?.mkcgData),
                autoPopulatableComponents: this.getAutoPopulatableComponents().length
            },
            methods: {
                addComponent: typeof this.addComponent === 'function',
                updateComponent: typeof this.updateComponent === 'function',
                removeComponent: typeof this.removeComponent === 'function',
                duplicateComponent: typeof this.duplicateComponent === 'function',
                addComponentWithMKCGData: typeof this.addComponentWithMKCGData === 'function',
                canAutoPopulateComponent: typeof this.canAutoPopulateComponent === 'function',
                autoGenerateFromMKCG: typeof this.autoGenerateFromMKCG === 'function'
            }
        };
    }
    
    /**
     * GEMINI FIX: Manual initialization retry for debugging
     * @returns {boolean} True if successful
     */
    forceInitialization() {
        this.isInitialized = false;
        return this.init();
    }
    
    /**
     * PHASE 1: Add component with explicit MKCG data population
     * @param {string} componentType - Component type to add
     * @param {object} mkcgProps - Pre-mapped MKCG properties
     * @param {object} additionalProps - Additional props to merge
     * @returns {string} Component ID
     */
    addComponentWithMKCGData(componentType, mkcgProps = {}, additionalProps = {}) {
        const finalProps = { ...mkcgProps, ...additionalProps };
        return this.addComponent(componentType, finalProps, false); // Don't auto-populate since we're providing MKCG data
    }
    
    /**
     * PHASE 1: Check if component can be auto-populated with MKCG data
     * @param {string} componentType - Component type to check
     * @returns {boolean} True if can be auto-populated
     */
    canAutoPopulateComponent(componentType) {
        if (!mkcgDataMapper || typeof mkcgDataMapper.canAutoPopulate !== 'function') {
            return false;
        }
        
        try {
            return mkcgDataMapper.canAutoPopulate(componentType);
        } catch (error) {
            this.logger.warn('MKCG', `Error checking auto-populate for ${componentType}`, error);
            return false;
        }
    }
    
    /**
     * PHASE 1: Get list of components that can be auto-populated
     * @returns {Array} Array of component types that can be auto-populated
     */
    /**
     * PHASE 2.1: Enhanced auto-populatable components with quality analysis
     */
    getAutoPopulatableComponentsEnhanced() {
        if (!mkcgDataMapper || typeof mkcgDataMapper.getAutoPopulatableComponentsEnhanced !== 'function') {
            return [];
        }
        
        try {
            return mkcgDataMapper.getAutoPopulatableComponentsEnhanced();
        } catch (error) {
            this.logger.warn('MKCG', 'Error getting enhanced auto-populatable components', error);
            return [];
        }
    }
    
    /**
     * PHASE 2.1: Legacy method (backward compatibility)
     */
    getAutoPopulatableComponents() {
        return this.getAutoPopulatableComponentsEnhanced();
    }
    
    /**
     * PHASE 2.1: Enhanced auto-generation with intelligent prioritization and batch processing
     * @param {boolean} showNotifications - Whether to show notifications
     * @param {Object} options - Generation options
     * @returns {Object} Enhanced generation results with metadata
     */
    autoGenerateFromMKCGEnhanced(showNotifications = true, options = {}) {
        const {
            maxComponents = 5,
            minQualityScore = 30,
            priorityThreshold = 40,
            batchSize = 3
        } = options;
        
        const autoPopulatable = this.getAutoPopulatableComponentsEnhanced();
        const addedComponents = [];
        const skippedComponents = [];
        const generationMetadata = {
            totalCandidates: autoPopulatable.length,
            qualityFilter: minQualityScore,
            priorityFilter: priorityThreshold,
            maxComponents
        };
        
        if (autoPopulatable.length === 0) {
            this.logger.info('MKCG', 'No components can be auto-generated from MKCG data');
            return {
                addedComponents: [],
                skippedComponents: [],
                metadata: generationMetadata
            };
        }
        
        // Filter by quality and priority thresholds
        const qualifiedComponents = autoPopulatable.filter(comp => 
            comp.dataQuality.overallScore >= minQualityScore && 
            comp.priority >= priorityThreshold
        ).slice(0, maxComponents);
        
        this.logger.info('MKCG', `Enhanced auto-generating ${qualifiedComponents.length} prioritized components`, {
            totalCandidates: autoPopulatable.length,
            qualified: qualifiedComponents.length,
            filters: { minQualityScore, priorityThreshold },
            components: qualifiedComponents.map(c => ({
                type: c.type,
                quality: c.dataQuality.overallScore,
                priority: c.priority
            }))
        });
        
        try {
            // PHASE 2.1: Batch processing for performance
            const batches = [];
            for (let i = 0; i < qualifiedComponents.length; i += batchSize) {
                batches.push(qualifiedComponents.slice(i, i + batchSize));
            }
            
            // Use enhanced state manager batch updates
            enhancedStateManager.startBatchUpdate();
            
            try {
                for (const batch of batches) {
                    for (const componentInfo of batch) {
                        try {
                            const componentId = this.addComponent(componentInfo.type, {}, true);
                            addedComponents.push({
                                id: componentId,
                                type: componentInfo.type,
                                name: componentInfo.name,
                                qualityScore: componentInfo.dataQuality.overallScore,
                                priority: componentInfo.priority,
                                mappedFields: componentInfo.mappedFields,
                                recommendation: componentInfo.recommendation
                            });
                        } catch (componentError) {
                            this.logger.warn('MKCG', `Failed to generate ${componentInfo.type}`, componentError);
                            skippedComponents.push({
                                type: componentInfo.type,
                                reason: 'generation-error',
                                error: componentError.message
                            });
                        }
                    }
                }
            } finally {
                enhancedStateManager.endBatchUpdate();
            }
            
            // Track skipped components
            const allSkipped = autoPopulatable.filter(comp => 
                comp.dataQuality.overallScore < minQualityScore || 
                comp.priority < priorityThreshold
            ).slice(0, 10); // Limit for logging
            
            allSkipped.forEach(comp => {
                skippedComponents.push({
                    type: comp.type,
                    reason: comp.dataQuality.overallScore < minQualityScore ? 'low-quality' : 'low-priority',
                    qualityScore: comp.dataQuality.overallScore,
                    priority: comp.priority
                });
            });
            
            // Enhanced notifications
            if (showNotifications && addedComponents.length > 0) {
                this.showEnhancedAutoGenerateNotification(addedComponents, skippedComponents, generationMetadata);
            }
            
            const results = {
                addedComponents,
                skippedComponents,
                metadata: {
                    ...generationMetadata,
                    successfulGenerations: addedComponents.length,
                    skippedCount: skippedComponents.length,
                    averageQuality: addedComponents.length > 0 ? 
                        Math.round(addedComponents.reduce((sum, comp) => sum + comp.qualityScore, 0) / addedComponents.length) : 0,
                    averagePriority: addedComponents.length > 0 ? 
                        Math.round(addedComponents.reduce((sum, comp) => sum + comp.priority, 0) / addedComponents.length) : 0,
                    batchesProcessed: batches.length,
                    generationTime: performance.now()
                }
            };
            
            this.logger.info('MKCG', `Enhanced auto-generation completed`, results.metadata);
            
            return results;
            
        } catch (error) {
            enhancedStateManager.endBatchUpdate(); // Ensure batch is ended on error
            this.logger.error('MKCG', 'Error during enhanced auto-generation', error);
            return {
                addedComponents,
                skippedComponents,
                metadata: {
                    ...generationMetadata,
                    error: error.message
                }
            };
        }
    }
    
    /**
     * PHASE 2.1: Legacy auto-generation method (backward compatibility)
     */
    autoGenerateFromMKCG(showNotifications = true) {
        const result = this.autoGenerateFromMKCGEnhanced(showNotifications);
        return result.addedComponents;
    }
    
    /**
     * PHASE 2.1: Enhanced MKCG notification with quality indicators
     * @param {string} componentType - Component type that was populated
     * @param {Object} metadata - Enhanced mapping metadata
     * @param {string} qualityLevel - Quality level (excellent, good, fair)
     */
    showEnhancedMKCGNotification(componentType, metadata, qualityLevel) {
        try {
            // Quality-based styling
            const qualityConfig = {
                excellent: {
                    icon: '🎉',
                    color: '#10b981',
                    title: 'Excellent Data Quality!',
                    bgGradient: 'linear-gradient(135deg, #10b981 0%, #059669 100%)'
                },
                good: {
                    icon: '✅',
                    color: '#3b82f6',
                    title: 'Good Data Quality',
                    bgGradient: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)'
                },
                fair: {
                    icon: '⚠️',
                    color: '#f59e0b',
                    title: 'Fair Data Quality',
                    bgGradient: 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)'
                }
            };
            
            const config = qualityConfig[qualityLevel] || qualityConfig.good;
            
            // Create enhanced notification element
            const notification = document.createElement('div');
            notification.className = 'mkcg-enhanced-notification';
            notification.innerHTML = `
                <div class="mkcg-notification-content">
                    <div class="mkcg-notification-header">
                        <span class="mkcg-notification-icon">${config.icon}</span>
                        <div class="mkcg-notification-title">
                            <div class="mkcg-notification-main-title">${config.title}</div>
                            <div class="mkcg-notification-subtitle">${componentType} auto-populated</div>
                        </div>
                        <button class="mkcg-notification-close">×</button>
                    </div>
                    <div class="mkcg-notification-details">
                        <div class="mkcg-quality-score">
                            <span class="mkcg-score-label">Quality Score:</span>
                            <span class="mkcg-score-value">${metadata.dataQuality.overallScore}%</span>
                        </div>
                        <div class="mkcg-fields-info">
                            <span class="mkcg-fields-count">${metadata.mappedFields} fields</span>
                            <span class="mkcg-fields-separator">•</span>
                            <span class="mkcg-priority">Priority: ${metadata.priority}</span>
                        </div>
                        ${metadata.recommendations && metadata.recommendations.length > 0 ? 
                            `<div class="mkcg-recommendation">
                                💡 ${metadata.recommendations[0]}
                            </div>` : ''
                        }
                    </div>
                </div>
            `;
            
            // Enhanced styles with animations
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: ${config.bgGradient};
                color: white;
                padding: 0;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
                z-index: 10001;
                font-size: 14px;
                max-width: 380px;
                min-width: 320px;
                transform: translateX(100%);
                animation: slideInRightEnhanced 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            
            // Add enhanced CSS for internal elements
            const style = document.createElement('style');
            style.textContent = `
                @keyframes slideInRightEnhanced {
                    from {
                        transform: translateX(100%);
                        opacity: 0;
                    }
                    to {
                        transform: translateX(0);
                        opacity: 1;
                    }
                }
                
                .mkcg-notification-content {
                    padding: 16px;
                }
                
                .mkcg-notification-header {
                    display: flex;
                    align-items: flex-start;
                    gap: 12px;
                    margin-bottom: 12px;
                }
                
                .mkcg-notification-icon {
                    font-size: 24px;
                    flex-shrink: 0;
                }
                
                .mkcg-notification-title {
                    flex: 1;
                }
                
                .mkcg-notification-main-title {
                    font-weight: 600;
                    font-size: 16px;
                    margin-bottom: 2px;
                }
                
                .mkcg-notification-subtitle {
                    font-size: 13px;
                    opacity: 0.9;
                    text-transform: capitalize;
                }
                
                .mkcg-notification-close {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    color: white;
                    width: 24px;
                    height: 24px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 14px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s ease;
                }
                
                .mkcg-notification-close:hover {
                    background: rgba(255, 255, 255, 0.3);
                }
                
                .mkcg-notification-details {
                    font-size: 13px;
                    opacity: 0.95;
                }
                
                .mkcg-quality-score {
                    display: flex;
                    justify-content: space-between;
                    margin-bottom: 6px;
                    font-weight: 500;
                }
                
                .mkcg-score-value {
                    font-weight: 600;
                }
                
                .mkcg-fields-info {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    margin-bottom: 8px;
                }
                
                .mkcg-fields-separator {
                    opacity: 0.6;
                }
                
                .mkcg-recommendation {
                    background: rgba(255, 255, 255, 0.15);
                    border-radius: 6px;
                    padding: 8px;
                    font-size: 12px;
                    line-height: 1.4;
                }
            `;
            
            document.head.appendChild(style);
            
            // Add to page
            document.body.appendChild(notification);
            
            // Auto-remove after 6 seconds (longer for enhanced notification)
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideInRightEnhanced 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                            if (style.parentNode) {
                                style.remove();
                            }
                        }
                    }, 300);
                }
            }, 6000);
            
            // Close button handler
            const closeBtn = notification.querySelector('.mkcg-notification-close');
            closeBtn?.addEventListener('click', () => {
                notification.style.animation = 'slideInRightEnhanced 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                        if (style.parentNode) {
                            style.remove();
                        }
                    }
                }, 300);
            });
            
        } catch (error) {
            this.logger.warn('UI', 'Failed to show enhanced MKCG notification', error);
            // Fallback to simple notification
            this.showSimpleMKCGNotification(componentType, metadata.mappedFields);
        }
    }
    
    /**
     * PHASE 2.1: Simple fallback notification
     */
    showSimpleMKCGNotification(componentType, fieldsCount) {
        try {
            const notification = document.createElement('div');
            notification.innerHTML = `🔗 ${componentType} auto-populated with ${fieldsCount} fields from MKCG data`;
            notification.style.cssText = `
                position: fixed; top: 20px; right: 20px; background: #10b981; color: white;
                padding: 12px 16px; border-radius: 8px; z-index: 10000; font-size: 14px;
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 4000);
        } catch (error) {
            console.log(`MKCG: ${componentType} auto-populated with ${fieldsCount} fields`);
        }
    }
    
    /**
     * PHASE 2.1: Enhanced auto-generation notification with detailed metrics
     * @param {Array} addedComponents - Successfully generated components
     * @param {Array} skippedComponents - Skipped components with reasons
     * @param {Object} metadata - Generation metadata
     */
    showEnhancedAutoGenerateNotification(addedComponents, skippedComponents, metadata) {
        try {
            const notification = document.createElement('div');
            notification.className = 'mkcg-enhanced-auto-generate-notification';
            
            const componentNames = addedComponents.map(c => c.name).join(', ');
            const averageQuality = addedComponents.length > 0 ? 
                Math.round(addedComponents.reduce((sum, comp) => sum + comp.qualityScore, 0) / addedComponents.length) : 0;
            
            notification.innerHTML = `
                <div class="mkcg-notification-content">
                    <div class="mkcg-notification-header">
                        <span class="mkcg-notification-icon">🎉</span>
                        <div class="mkcg-notification-title">
                            <div class="mkcg-notification-main-title">
                                ${addedComponents.length} Components Auto-Generated!
                            </div>
                            <div class="mkcg-notification-subtitle">
                                From MKCG data with ${averageQuality}% average quality
                            </div>
                        </div>
                        <button class="mkcg-notification-close">×</button>
                    </div>
                    <div class="mkcg-notification-details">
                        <div class="mkcg-generated-components">
                            <div class="mkcg-components-title">Generated Components:</div>
                            <div class="mkcg-components-list">
                                ${addedComponents.map(comp => `
                                    <div class="mkcg-component-item">
                                        <span class="mkcg-component-name">${comp.name}</span>
                                        <span class="mkcg-component-quality">${comp.qualityScore}%</span>
                                    </div>
                                `).join('')}
                            </div>
                        </div>
                        ${skippedComponents.length > 0 ? `
                            <div class="mkcg-skipped-info">
                                <div class="mkcg-skipped-title">
                                    ${skippedComponents.length} components skipped (low quality/priority)
                                </div>
                            </div>
                        ` : ''}
                        <div class="mkcg-generation-stats">
                            <span class="mkcg-stat">📊 ${metadata.totalCandidates} candidates</span>
                            <span class="mkcg-stat-separator">•</span>
                            <span class="mkcg-stat">✅ ${addedComponents.length} generated</span>
                            ${skippedComponents.length > 0 ? `
                                <span class="mkcg-stat-separator">•</span>
                                <span class="mkcg-stat">⏭ ${skippedComponents.length} skipped</span>
                            ` : ''}
                        </div>
                    </div>
                </div>
            `;
            
            // Enhanced styles with animations
            notification.style.cssText = `
                position: fixed;
                top: 20px;
                right: 20px;
                background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);
                color: white;
                padding: 0;
                border-radius: 12px;
                box-shadow: 0 8px 32px rgba(0, 0, 0, 0.12), 0 2px 8px rgba(0, 0, 0, 0.08);
                z-index: 10001;
                font-size: 14px;
                max-width: 420px;
                min-width: 360px;
                transform: translateX(100%);
                animation: slideInRightEnhanced 0.4s cubic-bezier(0.16, 1, 0.3, 1) forwards;
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
            `;
            
            // Add enhanced CSS for internal elements
            const style = document.createElement('style');
            style.textContent = `
                .mkcg-generated-components {
                    margin-bottom: 12px;
                }
                
                .mkcg-components-title {
                    font-size: 12px;
                    font-weight: 500;
                    margin-bottom: 6px;
                    opacity: 0.9;
                }
                
                .mkcg-components-list {
                    display: flex;
                    flex-direction: column;
                    gap: 4px;
                }
                
                .mkcg-component-item {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    background: rgba(255, 255, 255, 0.1);
                    border-radius: 4px;
                    padding: 6px 8px;
                    font-size: 12px;
                }
                
                .mkcg-component-name {
                    flex: 1;
                }
                
                .mkcg-component-quality {
                    font-weight: 600;
                    opacity: 0.9;
                }
                
                .mkcg-skipped-info {
                    margin-bottom: 12px;
                }
                
                .mkcg-skipped-title {
                    font-size: 12px;
                    opacity: 0.8;
                    font-style: italic;
                }
                
                .mkcg-generation-stats {
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    font-size: 12px;
                    opacity: 0.9;
                    border-top: 1px solid rgba(255, 255, 255, 0.1);
                    padding-top: 8px;
                }
                
                .mkcg-stat-separator {
                    opacity: 0.6;
                }
            `;
            
            document.head.appendChild(style);
            
            // Add to page
            document.body.appendChild(notification);
            
            // Auto-remove after 8 seconds (longer for detailed notification)
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.style.animation = 'slideInRightEnhanced 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
                    setTimeout(() => {
                        if (notification.parentNode) {
                            notification.remove();
                            if (style.parentNode) {
                                style.remove();
                            }
                        }
                    }, 300);
                }
            }, 8000);
            
            // Close button handler
            const closeBtn = notification.querySelector('.mkcg-notification-close');
            closeBtn?.addEventListener('click', () => {
                notification.style.animation = 'slideInRightEnhanced 0.3s cubic-bezier(0.16, 1, 0.3, 1) reverse forwards';
                setTimeout(() => {
                    if (notification.parentNode) {
                        notification.remove();
                        if (style.parentNode) {
                            style.remove();
                        }
                    }
                }, 300);
            });
            
        } catch (error) {
            this.logger.warn('UI', 'Failed to show enhanced auto-generation notification', error);
            // Fallback to simple notification
            this.showSimpleAutoGenerateNotification(addedComponents.length, addedComponents);
        }
    }
    
    /**
     * PHASE 2.1: Simple fallback auto-generation notification
     */
    showSimpleAutoGenerateNotification(count, components) {
        try {
            const componentNames = components.map(c => c.name).join(', ');
            const notification = document.createElement('div');
            notification.innerHTML = `🎉 ${count} components auto-generated: ${componentNames}`;
            notification.style.cssText = `
                position: fixed; top: 20px; right: 20px; background: #3b82f6; color: white;
                padding: 16px 20px; border-radius: 8px; z-index: 10000; font-size: 14px; max-width: 400px;
            `;
            document.body.appendChild(notification);
            setTimeout(() => notification.remove(), 6000);
        } catch (error) {
            console.log(`MKCG: ${count} components auto-generated`);
        }
    }
    
    /**
     * PHASE 2.1: Legacy auto-generation notification (backward compatibility)
     */
    showAutoGenerateNotification(count, components) {
        return this.showSimpleAutoGenerateNotification(count, components);
    }
}

export const enhancedComponentManager = new EnhancedComponentManager();
