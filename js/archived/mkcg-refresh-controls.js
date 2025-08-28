/**
 * @file mkcg-refresh-controls.js
 * @description MKCG Refresh Controls - Connect UI buttons to refresh functionality
 * 
 * Phase 2.3 - Task 5: Data Refresh and Synchronization Controls
 * 
 * Connects the refresh buttons in the template to the actual refresh functionality
 */

import { structuredLogger } from '../utils/structured-logger.js';
import { showToast } from '../utils/toast-polyfill.js';

/**
 * MKCG Refresh Controls
 * Handles UI interactions for data refresh operations
 */
class MKCGRefreshControls {
    constructor() {
        this.logger = structuredLogger;
        this.initialized = false;
        this.refreshManager = null;
        
        this.logger.info('REFRESH_CONTROLS', 'MKCG Refresh Controls initialized');
        
        // Initialize when DOM is ready
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.initialize());
        } else {
            this.initialize();
        }
    }

    /**
     * Initialize refresh controls
     */
    async initialize() {
        if (this.initialized) {
            return;
        }

        try {
            // Wait for refresh manager to be available
            await this.waitForRefreshManager();
            
            // Set up button event listeners
            this.setupRefreshButtonHandlers();
            this.setupAutoGenerateHandlers();
            this.setupDashboardHandlers();
            this.setupComponentRefreshHandlers();
            
            this.initialized = true;
            this.logger.info('REFRESH_CONTROLS', 'Refresh controls initialized successfully');
            
        } catch (error) {
            this.logger.error('REFRESH_CONTROLS', 'Failed to initialize refresh controls', error);
        }
    }

    /**
     * Wait for refresh manager to be available
     */
    async waitForRefreshManager() {
        return new Promise((resolve) => {
            const checkForManager = () => {
                if (window.mkcgDataRefreshManager) {
                    this.refreshManager = window.mkcgDataRefreshManager;
                    resolve(this.refreshManager);
                } else {
                    setTimeout(checkForManager, 100);
                }
            };
            checkForManager();
        });
    }

    /**
     * Set up refresh button handlers
     */
    setupRefreshButtonHandlers() {
        // Main refresh button in dashboard
        const refreshButton = document.getElementById('mkcg-refresh-data');
        if (refreshButton) {
            refreshButton.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleRefreshAllData();
            });
            this.logger.info('REFRESH_CONTROLS', 'Main refresh button handler attached');
        }

        // Dashboard refresh button (alternative)
        const dashboardRefreshBtn = document.querySelector('.mkcg-refresh-btn');
        if (dashboardRefreshBtn && dashboardRefreshBtn !== refreshButton) {
            dashboardRefreshBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleRefreshAllData();
            });
            this.logger.info('REFRESH_CONTROLS', 'Dashboard refresh button handler attached');
        }
    }

    /**
     * Set up auto-generate button handlers
     */
    setupAutoGenerateHandlers() {
        // Auto-generate all button
        const autoGenerateBtn = document.getElementById('mkcg-auto-generate-all');
        if (autoGenerateBtn) {
            autoGenerateBtn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleAutoGenerateAll();
            });
        }

        // Empty state auto-generate buttons
        const emptyStateButtons = [
            'auto-generate-all-empty',
            'auto-generate-available',
            'generate-anyway'
        ];

        emptyStateButtons.forEach(buttonId => {
            const button = document.getElementById(buttonId);
            if (button) {
                button.addEventListener('click', (e) => {
                    e.preventDefault();
                    this.handleAutoGenerateFromEmptyState(buttonId);
                });
            }
        });

        this.logger.info('REFRESH_CONTROLS', 'Auto-generate button handlers attached');
    }

    /**
     * Set up dashboard handlers
     */
    setupDashboardHandlers() {
        // Dashboard toggle
        const dashboardToggle = document.querySelector('.mkcg-dashboard-toggle');
        if (dashboardToggle) {
            dashboardToggle.addEventListener('click', (e) => {
                e.preventDefault();
                this.toggleDashboard();
            });
        }

        // Dashboard trigger (click to expand)
        const dashboardTrigger = document.getElementById('dashboard-trigger');
        if (dashboardTrigger) {
            dashboardTrigger.addEventListener('click', (e) => {
                if (!e.target.closest('.mkcg-dashboard-toggle')) {
                    e.preventDefault();
                    this.toggleDashboard();
                }
            });
        }

        this.logger.info('REFRESH_CONTROLS', 'Dashboard interaction handlers attached');
    }

    /**
     * Set up component-level refresh handlers
     */
    setupComponentRefreshHandlers() {
        // Listen for component refresh requests from sync indicators
        document.addEventListener('refresh:component-request', (e) => {
            const { componentId, componentType } = e.detail;
            this.handleRefreshComponent(componentId, componentType);
        });

        // Set up individual refresh buttons if they exist
        document.querySelectorAll('[data-refresh-component]').forEach(button => {
            button.addEventListener('click', (e) => {
                e.preventDefault();
                const componentId = button.getAttribute('data-refresh-component');
                const componentType = button.getAttribute('data-component-type');
                this.handleRefreshComponent(componentId, componentType);
            });
        });

        this.logger.info('REFRESH_CONTROLS', 'Component refresh handlers attached');
    }

    /**
     * Handle refresh all data
     */
    async handleRefreshAllData() {
        if (!this.refreshManager) {
            showToast('Refresh manager not available', 'error');
            return;
        }

        try {
            this.logger.info('REFRESH_CONTROLS', 'Initiating full data refresh');
            
            // Show user feedback
            this.setRefreshButtonState('loading', 'Refreshing...');
            
            const result = await this.refreshManager.refreshAllData({
                showProgress: true,
                conflictResolution: 'prompt',
                validateQuality: true
            });

            if (result.success) {
                this.setRefreshButtonState('success', 'Refreshed!');
                showToast(`Data refreshed successfully! Updated ${result.refreshedComponents?.length || 0} components.`, 'success');
                
                // Update dashboard if successful
                this.updateDashboardAfterRefresh(result);
                
                // Reset button after delay
                setTimeout(() => {
                    this.setRefreshButtonState('default', 'Refresh Data');
                }, 2000);
                
            } else {
                this.setRefreshButtonState('error', 'Failed');
                showToast('Refresh failed: ' + (result.error || result.reason), 'error');
                
                // Reset button after delay
                setTimeout(() => {
                    this.setRefreshButtonState('default', 'Refresh Data');
                }, 3000);
            }

        } catch (error) {
            this.logger.error('REFRESH_CONTROLS', 'Error during refresh all data', error);
            this.setRefreshButtonState('error', 'Error');
            showToast('Refresh error: ' + error.message, 'error');
            
            setTimeout(() => {
                this.setRefreshButtonState('default', 'Refresh Data');
            }, 3000);
        }
    }

    /**
     * Handle auto-generate all components
     */
    async handleAutoGenerateAll() {
        if (!window.enhancedStateManager) {
            showToast('State manager not available', 'error');
            return;
        }

        try {
            this.logger.info('REFRESH_CONTROLS', 'Initiating auto-generate all components');

            // Check if MKCG data is available
            const mkcgData = window.guestifyData?.mkcgData;
            if (!mkcgData) {
                showToast('No MKCG data available for auto-generation', 'warning');
                return;
            }

            // Use enhanced state manager to generate components
            if (window.enhancedStateManager.generateComponentsFromMKCGData) {
                const result = await window.enhancedStateManager.generateComponentsFromMKCGData(mkcgData);
                
                if (result.success) {
                    showToast(`Generated ${result.componentsCreated} components successfully!`, 'success');
                    
                    // Hide empty state
                    this.hideEmptyState();
                    
                    // Update dashboard counter
                    this.updateAutoGeneratedCount(result.componentsCreated);
                    
                } else {
                    showToast('Auto-generation failed: ' + result.error, 'error');
                }
                
            } else {
                // Fallback: Add components manually based on available data
                await this.fallbackAutoGenerate(mkcgData);
            }

        } catch (error) {
            this.logger.error('REFRESH_CONTROLS', 'Error during auto-generate all', error);
            showToast('Auto-generation error: ' + error.message, 'error');
        }
    }

    /**
     * Handle auto-generate from empty state
     */
    async handleAutoGenerateFromEmptyState(buttonId) {
        switch (buttonId) {
            case 'auto-generate-all-empty':
                await this.handleAutoGenerateAll();
                break;
            case 'auto-generate-available':
                await this.handleAutoGenerateAvailable();
                break;
            case 'generate-anyway':
                await this.handleGenerateAnyway();
                break;
        }
    }

    /**
     * Handle auto-generate available components only
     */
    async handleAutoGenerateAvailable() {
        const mkcgData = window.guestifyData?.mkcgData;
        if (!mkcgData) {
            showToast('No MKCG data available', 'warning');
            return;
        }

        try {
            // Only generate components with good quality data
            const validation = mkcgData.validation || {};
            const goodComponents = [];

            if (validation.has_topics) goodComponents.push('topics');
            if (validation.has_biography) goodComponents.push('biography');
            if (validation.has_authority_hook) goodComponents.push('authority-hook');
            
            if (goodComponents.length === 0) {
                showToast('No components with sufficient data quality found', 'warning');
                return;
            }

            await this.generateSpecificComponents(goodComponents, mkcgData);
            
        } catch (error) {
            this.logger.error('REFRESH_CONTROLS', 'Error during auto-generate available', error);
            showToast('Error generating available components: ' + error.message, 'error');
        }
    }

    /**
     * Handle generate anyway (low quality data)
     */
    async handleGenerateAnyway() {
        const mkcgData = window.guestifyData?.mkcgData;
        if (!mkcgData) {
            showToast('No MKCG data available', 'warning');
            return;
        }

        try {
            // Generate whatever components are available, regardless of quality
            const validation = mkcgData.validation || {};
            const availableComponents = Object.keys(validation).filter(key => 
                key.startsWith('has_') && validation[key]
            ).map(key => key.replace('has_', '').replace('_', '-'));

            if (availableComponents.length === 0) {
                showToast('No component data found', 'error');
                return;
            }

            await this.generateSpecificComponents(availableComponents, mkcgData);
            
        } catch (error) {
            this.logger.error('REFRESH_CONTROLS', 'Error during generate anyway', error);
            showToast('Error generating components: ' + error.message, 'error');
        }
    }

    /**
     * Handle refresh individual component
     */
    async handleRefreshComponent(componentId, componentType) {
        if (!this.refreshManager) {
            showToast('Refresh manager not available', 'error');
            return;
        }

        try {
            this.logger.info('REFRESH_CONTROLS', 'Refreshing individual component', { componentId, componentType });

            const result = await this.refreshManager.refreshComponent.call(this.refreshManager, componentId, {
                showProgress: true,
                conflictResolution: 'prompt'
            });

            if (result.success) {
                showToast(`${componentType} component refreshed successfully!`, 'success');
            } else {
                showToast(`Failed to refresh ${componentType}: ` + result.error, 'error');
            }

        } catch (error) {
            this.logger.error('REFRESH_CONTROLS', 'Error refreshing component', error, { componentId, componentType });
            showToast(`Error refreshing ${componentType}: ` + error.message, 'error');
        }
    }

    /**
     * Set refresh button state
     */
    setRefreshButtonState(state, text) {
        const buttons = [
            document.getElementById('mkcg-refresh-data'),
            document.querySelector('.mkcg-refresh-btn')
        ].filter(Boolean);

        buttons.forEach(button => {
            // Update text
            const textSpan = button.querySelector('span') || button;
            if (textSpan.tagName === 'SPAN') {
                textSpan.textContent = text;
            } else {
                // If no span, update the text after the SVG
                const svg = button.querySelector('svg');
                if (svg) {
                    button.innerHTML = svg.outerHTML + ' ' + text;
                } else {
                    button.textContent = text;
                }
            }

            // Update button state
            button.className = button.className.replace(/\s*(loading|success|error)\s*/g, ' ');
            if (state !== 'default') {
                button.classList.add(state);
            }

            // Update disabled state
            button.disabled = (state === 'loading');
        });
    }

    /**
     * Toggle dashboard visibility
     */
    toggleDashboard() {
        const dashboardPanel = document.getElementById('dashboard-panel');
        const dashboardToggle = document.querySelector('.mkcg-dashboard-toggle');
        
        if (dashboardPanel && dashboardToggle) {
            const isVisible = dashboardPanel.style.display !== 'none';
            
            if (isVisible) {
                dashboardPanel.style.display = 'none';
                dashboardToggle.setAttribute('aria-expanded', 'false');
                this.rotateDashboardToggle(false);
            } else {
                dashboardPanel.style.display = 'block';
                dashboardToggle.setAttribute('aria-expanded', 'true');
                this.rotateDashboardToggle(true);
            }
        }
    }

    /**
     * Rotate dashboard toggle icon
     */
    rotateDashboardToggle(expanded) {
        const dashboardToggle = document.querySelector('.mkcg-dashboard-toggle svg');
        if (dashboardToggle) {
            dashboardToggle.style.transform = expanded ? 'rotate(180deg)' : 'rotate(0deg)';
        }
    }

    /**
     * Update dashboard after refresh
     */
    updateDashboardAfterRefresh(result) {
        // Update last update time
        const lastUpdateElements = document.querySelectorAll('.mkcg-metric-value:last-child');
        lastUpdateElements.forEach(element => {
            element.textContent = 'Just now';
        });

        // Update component counter if available
        if (result.refreshedComponents && result.refreshedComponents.length > 0) {
            const autoGenCountElement = document.getElementById('auto-generated-count');
            if (autoGenCountElement) {
                const currentCount = parseInt(autoGenCountElement.textContent) || 0;
                autoGenCountElement.textContent = currentCount + result.refreshedComponents.length;
            }
        }
    }

    /**
     * Update auto-generated count
     */
    updateAutoGeneratedCount(count) {
        const autoGenCountElement = document.getElementById('auto-generated-count');
        if (autoGenCountElement) {
            const currentCount = parseInt(autoGenCountElement.textContent) || 0;
            autoGenCountElement.textContent = currentCount + count;
        }
    }

    /**
     * Hide empty state
     */
    hideEmptyState() {
        const emptyState = document.getElementById('enhanced-empty-state');
        if (emptyState) {
            emptyState.style.display = 'none';
        }

        // Show first drop zone if no components exist yet
        const dropZone = document.querySelector('.drop-zone--primary');
        if (dropZone) {
            dropZone.style.display = 'flex';
        }
    }

    /**
     * Generate specific components
     */
    async generateSpecificComponents(componentTypes, mkcgData) {
        if (!window.enhancedComponentManager || !window.mkcgDataMapper) {
            showToast('Component systems not available', 'error');
            return;
        }

        let generatedCount = 0;
        const errors = [];

        for (const componentType of componentTypes) {
            try {
                // Map MKCG data to component props
                const mappedProps = window.mkcgDataMapper.mapDataToComponent(componentType, mkcgData);
                
                if (Object.keys(mappedProps).length > 0) {
                    // Add component with mapped data
                    const result = window.enhancedComponentManager.addComponent(componentType, null, mappedProps);
                    
                    if (result) {
                        generatedCount++;
                        this.logger.info('REFRESH_CONTROLS', `Generated ${componentType} component`, { mappedProps });
                    }
                } else {
                    this.logger.warn('REFRESH_CONTROLS', `No mappable data for ${componentType} component`);
                }
                
            } catch (error) {
                this.logger.error('REFRESH_CONTROLS', `Error generating ${componentType} component`, error);
                errors.push(`${componentType}: ${error.message}`);
            }
        }

        // Show results
        if (generatedCount > 0) {
            showToast(`Generated ${generatedCount} components successfully!`, 'success');
            this.hideEmptyState();
            this.updateAutoGeneratedCount(generatedCount);
        }

        if (errors.length > 0) {
            showToast(`Some components failed: ${errors.join(', ')}`, 'warning');
        }

        if (generatedCount === 0 && errors.length === 0) {
            showToast('No components could be generated from available data', 'warning');
        }
    }

    /**
     * Fallback auto-generate method
     */
    async fallbackAutoGenerate(mkcgData) {
        const validation = mkcgData.validation || {};
        const availableComponents = [];

        // Determine which components can be generated
        if (validation.has_topics) availableComponents.push('topics');
        if (validation.has_biography) availableComponents.push('hero'); // Generate hero with bio data
        if (validation.has_authority_hook) availableComponents.push('authority-hook');
        if (validation.has_questions) availableComponents.push('questions');

        if (availableComponents.length === 0) {
            showToast('No components can be generated from available data', 'warning');
            return;
        }

        await this.generateSpecificComponents(availableComponents, mkcgData);
    }

    /**
     * Get refresh controls status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            refreshManagerAvailable: !!this.refreshManager,
            buttonsAttached: {
                mainRefresh: !!document.getElementById('mkcg-refresh-data'),
                autoGenerate: !!document.getElementById('mkcg-auto-generate-all'),
                dashboard: !!document.querySelector('.mkcg-dashboard-toggle')
            }
        };
    }
}

// Create and export instance
const mkcgRefreshControls = new MKCGRefreshControls();

// Expose globally for debugging
window.mkcgRefreshControls = mkcgRefreshControls;

export { mkcgRefreshControls as default, MKCGRefreshControls };
