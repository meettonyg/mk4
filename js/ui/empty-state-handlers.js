/**
 * Empty State Handlers
 * 
 * ROOT FIX: Complete interactive system for empty state buttons and workflows
 * This handles all empty state interactions including:
 * - Auto-generation buttons from MKCG data
 * - Manual component addition
 * - Quality-based state transitions
 * - MKCG dashboard interactions
 * - Selective generation workflows
 */

// ROOT FIX: Use global objects instead of ES6 imports
// structuredLogger and autoGenerationService will be available globally

// ROOT FIX: Use global logger that's already created by structured-logger.js
// NO LOCAL DECLARATIONS - use window.structuredLogger directly to prevent all conflicts

// Safety wrapper to handle cases where structuredLogger might not be loaded yet
function safeLog(level, category, message, data) {
    if (window.structuredLogger && typeof window.structuredLogger[level] === 'function') {
        window.structuredLogger[level](category, message, data);
    } else {
        console[level === 'error' ? 'error' : level === 'warn' ? 'warn' : 'log'](`[${category}] ${message}`, data || '');
    }
}

class EmptyStateHandlers {
    constructor() {
        this.isInitialized = false;
        this.activeButtons = new Set();
        this.stateTransitions = {
            empty: 'empty-state',
            loading: 'loading-state',
            populated: 'populated-state',
            error: 'error-state'
        };
        
        // Track interaction events for analytics
        this.interactions = [];
        
        safeLog('info', 'EMPTY_STATE', 'Empty state handlers initialized');
    }
    
    /**
     * ROOT FIX: Initialize all empty state event handlers
     */
    init() {
        if (this.isInitialized) {
            safeLog('warn', 'EMPTY_STATE', 'Already initialized, skipping');
            return;
        }
        
        try {
            safeLog('info', 'EMPTY_STATE', 'Setting up empty state button handlers');
            
            // Auto-generation buttons
            this.setupAutoGenerationButtons();
            
            // Manual component addition buttons
            this.setupManualAdditionButtons();
            
            // MKCG dashboard buttons
            this.setupDashboardButtons();
            
            // Component library triggers
            this.setupComponentLibraryTriggers();
            
            // Quality-based workflow buttons
            this.setupQualityWorkflowButtons();
            
            // State transition handlers
            this.setupStateTransitionHandlers();
            
            this.isInitialized = true;
            safeLog('info', 'EMPTY_STATE', 'Empty state handlers setup complete');
            
        } catch (error) {
            safeLog('error', 'EMPTY_STATE', 'Failed to initialize empty state handlers', error);
        }
    }
    
    /**
     * ROOT FIX: Setup auto-generation button handlers
     */
    setupAutoGenerationButtons() {
        // Main auto-generate button from empty state
        const autoGenerateBtn = document.getElementById('auto-generate-btn');
        if (autoGenerateBtn) {
            autoGenerateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAutoGeneration(e.target);
            });
            this.activeButtons.add('auto-generate-btn');
            structuredLogger.info('EMPTY_STATE', 'Auto-generate button handler attached');
        }
        
        // Auto-generate all button (alternative ID)
        const autoGenerateAllBtn = document.getElementById('auto-generate-all-btn');
        if (autoGenerateAllBtn) {
            autoGenerateAllBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAutoGeneration(e.target, { maxComponents: 10, forceGeneration: false });
            });
            this.activeButtons.add('auto-generate-all-btn');
        }
        
        // Selective generation button
        const selectiveGenerateBtn = document.getElementById('selective-generate-btn');
        if (selectiveGenerateBtn) {
            selectiveGenerateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSelectiveGeneration(e.target);
            });
            this.activeButtons.add('selective-generate-btn');
        }
        
        // Force generation button (for low-quality data)
        const forceGenerateBtn = document.getElementById('force-generate-btn');
        if (forceGenerateBtn) {
            forceGenerateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAutoGeneration(e.target, { forceGeneration: true, minQualityScore: 0 });
            });
            this.activeButtons.add('force-generate-btn');
        }
        
        structuredLogger.info('EMPTY_STATE', 'Auto-generation buttons setup complete', {
            buttonsFound: this.activeButtons.size
        });
    }
    
    /**
     * ROOT FIX: Setup manual component addition button handlers
     */
    setupManualAdditionButtons() {
        // Add first component button
        const addFirstComponentBtn = document.getElementById('add-first-component');
        if (addFirstComponentBtn) {
            addFirstComponentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleManualComponentAddition(e.target);
            });
            this.activeButtons.add('add-first-component');
        }
        
        // Add component button (generic)
        const addComponentBtn = document.getElementById('add-component-btn');
        if (addComponentBtn) {
            addComponentBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleManualComponentAddition(e.target);
            });
            this.activeButtons.add('add-component-btn');
        }
        
        // Connect data button
        const connectDataBtn = document.getElementById('connect-data-btn');
        if (connectDataBtn) {
            connectDataBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleConnectData(e.target);
            });
            this.activeButtons.add('connect-data-btn');
        }
        
        structuredLogger.info('EMPTY_STATE', 'Manual addition buttons setup complete');
    }
    
    /**
     * ROOT FIX: Setup MKCG dashboard button handlers
     */
    setupDashboardButtons() {
        // Dashboard toggle
        const dashboardTrigger = document.getElementById('dashboard-trigger');
        if (dashboardTrigger) {
            dashboardTrigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleDashboardToggle(e.target);
            });
        }
        
        // Dashboard auto-generate button
        const dashboardAutoGenBtn = document.getElementById('mkcg-auto-generate-dashboard');
        if (dashboardAutoGenBtn) {
            dashboardAutoGenBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleDashboardAutoGeneration(e.target);
            });
            this.activeButtons.add('mkcg-auto-generate-dashboard');
        }
        
        // Dashboard refresh button
        const dashboardRefreshBtn = document.getElementById('mkcg-refresh-dashboard');
        if (dashboardRefreshBtn) {
            dashboardRefreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleDashboardRefresh(e.target);
            });
            this.activeButtons.add('mkcg-refresh-dashboard');
        }
        
        // Dashboard component selection buttons
        const componentBadges = document.querySelectorAll('.mkcg-component-badge');
        componentBadges.forEach((badge, index) => {
            badge.addEventListener('click', (e) => {
                this.handleComponentBadgeClick(e.target.closest('.mkcg-component-badge'), index);
            });
        });
        
        structuredLogger.info('EMPTY_STATE', 'Dashboard buttons setup complete', {
            componentBadges: componentBadges.length
        });
    }
    
    /**
     * ROOT FIX: Setup component library trigger handlers
     */
    setupComponentLibraryTriggers() {
        // Component library modal trigger
        const libraryTriggers = document.querySelectorAll('[data-action="open-component-library"]');
        libraryTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleOpenComponentLibrary(e.target);
            });
        });
        
        // Template library trigger
        const templateTriggers = document.querySelectorAll('[data-action="open-template-library"]');
        templateTriggers.forEach(trigger => {
            trigger.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleOpenTemplateLibrary(e.target);
            });
        });
        
        structuredLogger.info('EMPTY_STATE', 'Component library triggers setup complete');
    }
    
    /**
     * ROOT FIX: Setup quality-based workflow button handlers
     */
    setupQualityWorkflowButtons() {
        // Improve data quality button
        const improveQualityBtn = document.getElementById('improve-quality-btn');
        if (improveQualityBtn) {
            improveQualityBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleImproveDataQuality(e.target);
            });
        }
        
        // Skip quality check button
        const skipQualityBtn = document.getElementById('skip-quality-btn');
        if (skipQualityBtn) {
            skipQualityBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleSkipQualityCheck(e.target);
            });
        }
        
        // Review generated components button
        const reviewComponentsBtn = document.getElementById('review-components-btn');
        if (reviewComponentsBtn) {
            reviewComponentsBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleReviewGeneratedComponents(e.target);
            });
        }
        
        structuredLogger.info('EMPTY_STATE', 'Quality workflow buttons setup complete');
    }
    
    /**
     * ROOT FIX: Setup state transition handlers for dynamic empty state changes
     */
    setupStateTransitionHandlers() {
        // Listen for state manager changes
        if (window.enhancedStateManager) {
            window.enhancedStateManager.subscribe((state) => {
                this.handleStateChange(state);
            });
        }
        
        // Listen for component additions
        document.addEventListener('componentAdded', (e) => {
            this.handleComponentAdded(e.detail);
        });
        
        // Listen for component removals
        document.addEventListener('componentRemoved', (e) => {
            this.handleComponentRemoved(e.detail);
        });
        
        structuredLogger.info('EMPTY_STATE', 'State transition handlers setup complete');
    }
    
    /**
     * ROOT FIX: Handle auto-generation button clicks
     * 
     * @param {HTMLElement} button - Clicked button element
     * @param {Object} options - Generation options
     */
    async handleAutoGeneration(button, options = {}) {
        try {
            this.trackInteraction('auto_generation_started', { options });
            
            // Show loading state
            this.setButtonLoadingState(button, true);
            this.transitionToState('loading', 'Generating components from your MKCG data...');
            
            // Get post ID from button or dashboard
            const postId = button.dataset.postId || this.getPostIdFromDashboard() || this.getPostIdFromUrl();
            
            if (!postId) {
                throw new Error('No post ID available for MKCG data generation');
            }
            
            structuredLogger.info('EMPTY_STATE', 'Starting auto-generation', { postId, options });
            
            // Perform auto-generation
            const autoGenService = window.autoGenerationService;
            if (!autoGenService) {
                throw new Error('Auto-generation service not available');
            }
            
            const result = await autoGenService.autoGenerateFromMKCG(options.forceGeneration || false, {
                maxComponents: options.maxComponents || 5,
                minQualityScore: options.minQualityScore || 30
            });
            
            if (result.success) {
                // Show success state
                this.showGenerationSuccess(result);
                this.trackInteraction('auto_generation_success', result);
                
                // Transition to populated state after delay
                setTimeout(() => {
                    this.transitionToState('populated');
                }, 2000);
                
            } else {
                this.showGenerationError(result.error || 'Auto-generation failed');
                this.trackInteraction('auto_generation_failed', { error: result.error });
            }
            
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'Auto-generation failed', error);
            this.showGenerationError(error.message);
            this.trackInteraction('auto_generation_error', { error: error.message });
        } finally {
            this.setButtonLoadingState(button, false);
        }
    }
    
    /**
     * ROOT FIX: Handle selective generation (choose specific components)
     * 
     * @param {HTMLElement} button - Clicked button element
     */
    async handleSelectiveGeneration(button) {
        try {
            this.trackInteraction('selective_generation_started');
            
            // Show component selection modal
            this.showComponentSelectionModal();
            
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'Selective generation failed', error);
            this.showError('Failed to open component selection');
        }
    }
    
    /**
     * ROOT FIX: Handle manual component addition button clicks
     * 
     * @param {HTMLElement} button - Clicked button element
     */
    handleManualComponentAddition(button) {
        try {
            this.trackInteraction('manual_addition_started');
            
            // Check if component library modal exists
            const componentLibrary = document.getElementById('component-library-overlay');
            if (componentLibrary) {
                // Show component library
                componentLibrary.style.display = 'block';
                componentLibrary.classList.add('show');
                
                // Focus on search input if available
                const searchInput = componentLibrary.querySelector('#component-search');
                if (searchInput) {
                    setTimeout(() => searchInput.focus(), 100);
                }
                
                structuredLogger.info('EMPTY_STATE', 'Component library opened for manual addition');
            } else {
                // Fallback: try to add a default component
                this.addDefaultComponent();
            }
            
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'Manual component addition failed', error);
            this.showError('Failed to open component library');
        }
    }
    
    /**
     * ROOT FIX: Handle connect data button clicks
     * 
     * @param {HTMLElement} button - Clicked button element
     */
    handleConnectData(button) {
        try {
            this.trackInteraction('connect_data_started');
            
            // Show data connection modal or workflow
            this.showDataConnectionWorkflow();
            
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'Connect data failed', error);
            this.showError('Failed to start data connection workflow');
        }
    }
    
    /**
     * ROOT FIX: Handle dashboard toggle clicks
     * 
     * @param {HTMLElement} trigger - Clicked trigger element
     */
    handleDashboardToggle(trigger) {
        try {
            const dashboardPanel = document.getElementById('dashboard-panel');
            if (!dashboardPanel) return;
            
            const isVisible = dashboardPanel.style.display !== 'none';
            dashboardPanel.style.display = isVisible ? 'none' : 'block';
            
            // Update toggle icon
            const toggleIcon = trigger.querySelector('.mkcg-dashboard-toggle svg');
            if (toggleIcon) {
                toggleIcon.style.transform = isVisible ? 'rotate(0deg)' : 'rotate(180deg)';
            }
            
            this.trackInteraction('dashboard_toggle', { visible: !isVisible });
            structuredLogger.info('EMPTY_STATE', 'Dashboard toggled', { visible: !isVisible });
            
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'Dashboard toggle failed', error);
        }
    }
    
    /**
     * ROOT FIX: Handle dashboard auto-generation
     * 
     * @param {HTMLElement} button - Clicked button element
     */
    async handleDashboardAutoGeneration(button) {
        const dashboard = button.closest('.mkcg-dashboard-optimized');
        const postId = dashboard?.dataset.postId;
        
        if (postId) {
            await this.handleAutoGeneration(button, { 
                maxComponents: 6,
                minQualityScore: 20
            });
        } else {
            this.showError('No post ID found for dashboard generation');
        }
    }
    
    /**
     * ROOT FIX: Handle dashboard refresh
     * 
     * @param {HTMLElement} button - Clicked button element
     */
    async handleDashboardRefresh(button) {
        try {
            this.setButtonLoadingState(button, true, 'Refreshing...');
            
            // Refresh MKCG data
            const dashboard = button.closest('.mkcg-dashboard-optimized');
            const postId = dashboard?.dataset.postId;
            
            if (postId) {
                // Reload MKCG data
                const response = await fetch(`${window.guestifyData.ajaxUrl}?action=gmkb_get_mkcg_data&post_id=${postId}&nonce=${window.guestifyData.nonce}&fresh=1`);
                const data = await response.json();
                
                if (data.success) {
                    // Update global data
                    if (window.guestifyData) {
                        window.guestifyData.mkcgData = data.data.data || data.data;
                    }
                    
                    this.showSuccess('MKCG data refreshed successfully');
                    this.trackInteraction('dashboard_refresh_success');
                } else {
                    throw new Error(data.message || 'Failed to refresh data');
                }
            } else {
                throw new Error('No post ID available for refresh');
            }
            
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'Dashboard refresh failed', error);
            this.showError('Failed to refresh MKCG data');
            this.trackInteraction('dashboard_refresh_failed', { error: error.message });
        } finally {
            this.setButtonLoadingState(button, false, 'Refresh');
        }
    }
    
    /**
     * ROOT FIX: Handle component badge clicks for selective generation
     * 
     * @param {HTMLElement} badge - Clicked badge element
     * @param {number} index - Badge index
     */
    handleComponentBadgeClick(badge, index) {
        try {
            // Toggle badge selection
            badge.classList.toggle('selected');
            
            // Track selected components
            const selected = badge.classList.contains('selected');
            const componentType = badge.dataset.componentType || badge.textContent.toLowerCase();
            
            this.trackInteraction('component_badge_toggle', { 
                componentType, 
                selected, 
                index 
            });
            
            // Update selection UI
            this.updateComponentBadgeSelection();
            
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'Component badge click failed', error);
        }
    }
    
    /**
     * ROOT FIX: Handle component library opening
     * 
     * @param {HTMLElement} trigger - Trigger element
     */
    handleOpenComponentLibrary(trigger) {
        try {
            const componentLibrary = document.getElementById('component-library-overlay');
            if (componentLibrary) {
                componentLibrary.style.display = 'block';
                componentLibrary.classList.add('show');
                
                // Focus search if available
                const searchInput = componentLibrary.querySelector('#component-search');
                if (searchInput) {
                    setTimeout(() => searchInput.focus(), 100);
                }
                
                this.trackInteraction('component_library_opened');
                structuredLogger.info('EMPTY_STATE', 'Component library opened');
            }
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'Failed to open component library', error);
        }
    }
    
    /**
     * ROOT FIX: Handle template library opening
     * 
     * @param {HTMLElement} trigger - Trigger element  
     */
    handleOpenTemplateLibrary(trigger) {
        try {
            const templateLibrary = document.getElementById('template-library-modal');
            if (templateLibrary) {
                templateLibrary.style.display = 'block';
                templateLibrary.classList.add('show');
                
                this.trackInteraction('template_library_opened');
                structuredLogger.info('EMPTY_STATE', 'Template library opened');
            }
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'Failed to open template library', error);
        }
    }
    
    /**
     * ROOT FIX: Handle state changes from state manager
     * 
     * @param {Object} state - New state object
     */
    handleStateChange(state) {
        try {
            const componentCount = Object.keys(state.components || {}).length;
            
            // Transition empty state based on component count
            if (componentCount > 0) {
                this.transitionToState('populated');
            } else {
                this.transitionToState('empty');
            }
            
            structuredLogger.info('EMPTY_STATE', 'State change handled', { componentCount });
            
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'State change handling failed', error);
        }
    }
    
    /**
     * ROOT FIX: Handle component addition events
     * 
     * @param {Object} detail - Event detail with component info
     */
    handleComponentAdded(detail) {
        try {
            // Hide empty state when first component is added
            this.transitionToState('populated');
            
            // Show success feedback
            this.showSuccess(`${detail.componentType || 'Component'} added successfully`);
            
            this.trackInteraction('component_added_via_empty_state', detail);
            structuredLogger.info('EMPTY_STATE', 'Component added', detail);
            
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'Component addition handling failed', error);
        }
    }
    
    /**
     * ROOT FIX: Handle component removal events
     * 
     * @param {Object} detail - Event detail with component info
     */
    handleComponentRemoved(detail) {
        try {
            // Check if we should show empty state again
            if (window.enhancedStateManager) {
                const state = window.enhancedStateManager.getState();
                const componentCount = Object.keys(state.components || {}).length;
                
                if (componentCount === 0) {
                    this.transitionToState('empty');
                }
            }
            
            this.trackInteraction('component_removed_to_empty_state', detail);
            structuredLogger.info('EMPTY_STATE', 'Component removed', detail);
            
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'Component removal handling failed', error);
        }
    }
    
    /**
     * ROOT FIX: Transition between different empty states
     * 
     * @param {string} targetState - Target state name
     * @param {string} message - Optional message to display
     */
    transitionToState(targetState, message = null) {
        try {
            const emptyState = document.getElementById('empty-state');
            const loadingState = document.getElementById('state-loading-enhanced');
            
            switch (targetState) {
                case 'empty':
                    if (emptyState) emptyState.style.display = 'block';
                    if (loadingState) loadingState.style.display = 'none';
                    break;
                    
                case 'loading':
                    if (emptyState) emptyState.style.display = 'none';
                    if (loadingState) {
                        loadingState.style.display = 'block';
                        if (message) {
                            const desc = loadingState.querySelector('.loading-state-description');
                            if (desc) desc.textContent = message;
                        }
                    }
                    break;
                    
                case 'populated':
                    if (emptyState) emptyState.style.display = 'none';
                    if (loadingState) loadingState.style.display = 'none';
                    break;
            }
            
            structuredLogger.info('EMPTY_STATE', 'State transition', { targetState, message });
            
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'State transition failed', error);
        }
    }
    
    /**
     * ROOT FIX: Set button loading state
     * 
     * @param {HTMLElement} button - Button element
     * @param {boolean} loading - Loading state
     * @param {string} loadingText - Text to show while loading
     */
    setButtonLoadingState(button, loading, loadingText = 'Loading...') {
        if (!button) return;
        
        try {
            if (loading) {
                button.disabled = true;
                button.dataset.originalText = button.textContent;
                button.textContent = loadingText;
                button.classList.add('loading');
            } else {
                button.disabled = false;
                button.textContent = button.dataset.originalText || button.textContent;
                button.classList.remove('loading');
                delete button.dataset.originalText;
            }
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'Button loading state failed', error);
        }
    }
    
    /**
     * ROOT FIX: Show generation success feedback
     * 
     * @param {Object} result - Generation result
     */
    showGenerationSuccess(result) {
        try {
            const message = `✅ Successfully generated ${result.generated} components! (Quality: ${result.qualityScore}%)`;
            this.showSuccess(message);
            
            // Update empty state with success info
            const emptyState = document.getElementById('empty-state');
            if (emptyState) {
                const successDiv = document.createElement('div');
                successDiv.className = 'generation-success';
                successDiv.innerHTML = `
                    <div class="success-icon">🎉</div>
                    <h3>Components Generated Successfully!</h3>
                    <p>Generated ${result.generated} components from your MKCG data</p>
                    <div class="success-details">
                        <span>Quality Score: ${result.qualityScore}%</span>
                        <span>Components: ${result.generated}/${result.total}</span>
                    </div>
                `;
                
                emptyState.appendChild(successDiv);
                
                // Remove success message after delay
                setTimeout(() => {
                    if (successDiv.parentNode) {
                        successDiv.remove();
                    }
                }, 5000);
            }
            
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'Show generation success failed', error);
        }
    }
    
    /**
     * ROOT FIX: Show generation error feedback
     * 
     * @param {string} error - Error message
     */
    showGenerationError(error) {
        try {
            this.showError(`Auto-generation failed: ${error}`);
            this.transitionToState('empty');
        } catch (e) {
            structuredLogger.error('EMPTY_STATE', 'Show generation error failed', e);
        }
    }
    
    /**
     * ROOT FIX: Show success toast notification
     * 
     * @param {string} message - Success message
     */
    showSuccess(message) {
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'success');
        } else {
            console.log('✅', message);
        }
    }
    
    /**
     * ROOT FIX: Show error toast notification
     * 
     * @param {string} message - Error message
     */
    showError(message) {
        if (typeof window.showToast === 'function') {
            window.showToast(message, 'error');
        } else {
            console.error('❌', message);
        }
    }
    
    /**
     * ROOT FIX: Get post ID from dashboard element
     * 
     * @returns {string|null} Post ID or null
     */
    getPostIdFromDashboard() {
        const dashboard = document.getElementById('mkcg-dashboard');
        return dashboard?.dataset.postId || null;
    }
    
    /**
     * ROOT FIX: Get post ID from URL parameters
     * 
     * @returns {string|null} Post ID or null
     */
    getPostIdFromUrl() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('post_id') || urlParams.get('p') || null;
    }
    
    /**
     * ROOT FIX: Add default component as fallback
     */
    async addDefaultComponent() {
        try {
            if (window.enhancedComponentManager && typeof window.enhancedComponentManager.addComponent === 'function') {
                const componentId = await window.enhancedComponentManager.addComponent('hero', {
                    title: 'Welcome',
                    subtitle: 'Start building your media kit',
                    style: 'minimal'
                });
                
                if (componentId) {
                    this.showSuccess('Default hero component added');
                    this.transitionToState('populated');
                } else {
                    throw new Error('Component manager returned null ID');
                }
            } else {
                throw new Error('Enhanced component manager not available');
            }
        } catch (error) {
            structuredLogger.error('EMPTY_STATE', 'Add default component failed', error);
            this.showError('Failed to add default component');
        }
    }
    
    /**
     * ROOT FIX: Track user interactions for analytics
     * 
     * @param {string} action - Interaction action
     * @param {Object} data - Additional data
     */
    trackInteraction(action, data = {}) {
        const interaction = {
            action,
            timestamp: Date.now(),
            data,
            sessionId: this.getSessionId()
        };
        
        this.interactions.push(interaction);
        
        // Keep only last 100 interactions
        if (this.interactions.length > 100) {
            this.interactions.shift();
        }
        
        structuredLogger.info('EMPTY_STATE', 'Interaction tracked', interaction);
    }
    
    /**
     * ROOT FIX: Get session ID for interaction tracking
     * 
     * @returns {string} Session ID
     */
    getSessionId() {
        if (!this.sessionId) {
            this.sessionId = 'session_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
        }
        return this.sessionId;
    }
    
    /**
     * ROOT FIX: Get interaction analytics
     * 
     * @returns {Object} Analytics data
     */
    getAnalytics() {
        return {
            totalInteractions: this.interactions.length,
            sessionId: this.sessionId,
            activeButtons: Array.from(this.activeButtons),
            recentInteractions: this.interactions.slice(-10),
            topActions: this.getTopActions()
        };
    }
    
    /**
     * ROOT FIX: Get top interaction actions
     * 
     * @returns {Array} Top actions with counts
     */
    getTopActions() {
        const actionCounts = {};
        
        this.interactions.forEach(interaction => {
            actionCounts[interaction.action] = (actionCounts[interaction.action] || 0) + 1;
        });
        
        return Object.entries(actionCounts)
            .sort(([,a], [,b]) => b - a)
            .slice(0, 5)
            .map(([action, count]) => ({ action, count }));
    }
    
    /**
     * ROOT FIX: Reset handlers (for debugging)
     */
    reset() {
        this.isInitialized = false;
        this.activeButtons.clear();
        this.interactions = [];
        structuredLogger.info('EMPTY_STATE', 'Empty state handlers reset');
    }
    
    /**
     * ROOT FIX: Get status information
     * 
     * @returns {Object} Status information
     */
    getStatus() {
        return {
            isInitialized: this.isInitialized,
            activeButtons: Array.from(this.activeButtons),
            interactionCount: this.interactions.length,
            autoGenerationStatus: window.autoGenerationService ? window.autoGenerationService.getStatus() : 'not_available'
        };
    }
}

// Create and export singleton instance
// ROOT FIX: Create singleton instance and expose globally
const emptyStateHandlers = new EmptyStateHandlers();

// Global exposure for debugging and access
window.emptyStateHandlers = emptyStateHandlers;

// Initialize on DOM ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        emptyStateHandlers.init();
    });
} else {
    // DOM is already ready
    emptyStateHandlers.init();
}

structuredLogger.info('EMPTY_STATE', 'Empty state handlers module loaded');
