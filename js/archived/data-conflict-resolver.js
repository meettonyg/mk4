/**
 * @file data-conflict-resolver.js
 * @description Data Conflict Resolution System for MKCG Data Refresh
 * 
 * Phase 2.3 - Task 5: Data Refresh and Synchronization Controls
 * 
 * Core responsibilities:
 * - Analyze conflicts between fresh MKCG data and local changes
 * - Provide merge strategies (keep local, use fresh, smart merge)
 * - Show conflict resolution UI with visual diff
 * - Batch conflict resolution for multiple components
 */

import { structuredLogger } from '../utils/structured-logger.js';
import { eventBus } from './event-bus.js';
import { showToast } from '../utils/toast-polyfill.js';

/**
 * Data Conflict Resolver
 * Handles conflict detection, analysis, and resolution with user interaction
 */
class DataConflictResolver {
    constructor() {
        this.logger = structuredLogger;
        this.eventBus = eventBus;
        
        // Resolution strategies
        this.strategies = {
            'keep-local': 'Keep Local Changes',
            'use-fresh': 'Use Fresh Data',
            'smart-merge': 'Smart Merge',
            'manual-merge': 'Manual Merge'
        };
        
        // Conflict types and their handling
        this.conflictTypes = {
            'field-conflict': 'Field Value Conflict',
            'structure-conflict': 'Data Structure Conflict',
            'quality-conflict': 'Data Quality Conflict',
            'timestamp-conflict': 'Timestamp Conflict'
        };
        
        // UI state
        this.modalOpen = false;
        this.currentConflicts = [];
        this.resolutionCallbacks = [];
        
        this.logger.info('CONFLICT', 'Data Conflict Resolver initialized');
    }

    /**
     * Resolve conflicts with user interaction
     * @param {Array} conflicts - Array of conflict objects
     * @param {Object} options - Resolution options
     * @returns {Promise<Object>} Resolution result
     */
    async resolveConflicts(conflicts, options = {}) {
        const {
            autoResolveSimple = true,
            showDiffView = true,
            allowBatchResolution = true
        } = options;

        this.logger.info('CONFLICT', 'Starting conflict resolution', {
            conflictCount: conflicts.length,
            options
        });

        if (conflicts.length === 0) {
            return { success: true, resolutions: [] };
        }

        try {
            // Analyze conflicts
            const analysis = this.analyzeConflicts(conflicts);
            
            // Auto-resolve simple conflicts if enabled
            if (autoResolveSimple) {
                const { autoResolved, remainingConflicts } = this.autoResolveSimpleConflicts(conflicts);
                
                if (autoResolved.length > 0) {
                    this.logger.info('CONFLICT', `Auto-resolved ${autoResolved.length} simple conflicts`);
                }
                
                // If all conflicts were auto-resolved, return success
                if (remainingConflicts.length === 0) {
                    return {
                        success: true,
                        resolutions: autoResolved,
                        analysis,
                        autoResolved: autoResolved.length
                    };
                }
                
                conflicts = remainingConflicts;
            }

            // Show conflict resolution UI for remaining conflicts
            const userResolutions = await this.showConflictResolutionModal(conflicts, {
                showDiffView,
                allowBatchResolution,
                analysis
            });

            // Combine auto-resolved and user-resolved conflicts
            const allResolutions = [
                ...(autoResolveSimple ? this.getAutoResolvedConflicts() : []),
                ...userResolutions
            ];

            this.logger.info('CONFLICT', 'Conflict resolution completed', {
                totalResolutions: allResolutions.length,
                autoResolved: autoResolveSimple ? this.getAutoResolvedConflicts().length : 0,
                userResolved: userResolutions.length
            });

            return {
                success: true,
                resolutions: allResolutions,
                analysis
            };

        } catch (error) {
            this.logger.error('CONFLICT', 'Error during conflict resolution', error);
            return {
                success: false,
                error: error.message,
                conflicts
            };
        }
    }

    /**
     * Analyze conflicts to provide insights and recommendations
     * @param {Array} conflicts - Array of conflicts
     * @returns {Object} Conflict analysis
     */
    analyzeConflicts(conflicts) {
        const analysis = {
            totalConflicts: conflicts.length,
            conflictsByType: {},
            conflictsBySeverity: {},
            conflictsByComponent: {},
            recommendations: [],
            autoResolvableCount: 0,
            requiresUserInput: 0
        };

        // Analyze by type, severity, and component
        conflicts.forEach(conflict => {
            // By type
            const type = conflict.type || 'unknown';
            analysis.conflictsByType[type] = (analysis.conflictsByType[type] || 0) + 1;

            // By severity
            const severity = conflict.severity || 'medium';
            analysis.conflictsBySeverity[severity] = (analysis.conflictsBySeverity[severity] || 0) + 1;

            // By component
            const componentId = conflict.componentId || 'unknown';
            if (!analysis.conflictsByComponent[componentId]) {
                analysis.conflictsByComponent[componentId] = {
                    count: 0,
                    types: new Set(),
                    severities: new Set()
                };
            }
            analysis.conflictsByComponent[componentId].count++;
            analysis.conflictsByComponent[componentId].types.add(type);
            analysis.conflictsByComponent[componentId].severities.add(severity);

            // Determine if auto-resolvable
            if (this.isAutoResolvable(conflict)) {
                analysis.autoResolvableCount++;
            } else {
                analysis.requiresUserInput++;
            }
        });

        // Generate recommendations
        analysis.recommendations = this.generateRecommendations(analysis);

        this.logger.info('CONFLICT', 'Conflict analysis completed', analysis);
        return analysis;
    }

    /**
     * Auto-resolve simple conflicts that don't require user input
     * @param {Array} conflicts - Array of conflicts
     * @returns {Object} Auto-resolution result
     */
    autoResolveSimpleConflicts(conflicts) {
        const autoResolved = [];
        const remainingConflicts = [];

        conflicts.forEach(conflict => {
            if (this.isAutoResolvable(conflict)) {
                const resolution = this.autoResolveConflict(conflict);
                if (resolution) {
                    autoResolved.push(resolution);
                } else {
                    remainingConflicts.push(conflict);
                }
            } else {
                remainingConflicts.push(conflict);
            }
        });

        return { autoResolved, remainingConflicts };
    }

    /**
     * Check if conflict can be auto-resolved
     * @param {Object} conflict - Conflict object
     * @returns {boolean} True if auto-resolvable
     */
    isAutoResolvable(conflict) {
        // Auto-resolve low severity conflicts
        if (conflict.severity === 'low') {
            return true;
        }

        // Auto-resolve empty vs non-empty values (prefer non-empty)
        if (this.isEmptyValue(conflict.currentValue) && !this.isEmptyValue(conflict.freshValue)) {
            return true;
        }

        if (!this.isEmptyValue(conflict.currentValue) && this.isEmptyValue(conflict.freshValue)) {
            return true;
        }

        // Auto-resolve timestamp conflicts (prefer newer)
        if (conflict.type === 'timestamp-conflict') {
            return true;
        }

        return false;
    }

    /**
     * Auto-resolve a single conflict
     * @param {Object} conflict - Conflict object
     * @returns {Object|null} Resolution or null if failed
     */
    autoResolveConflict(conflict) {
        let resolvedValue;
        let strategy;

        if (conflict.severity === 'low') {
            // For low severity, prefer fresh data
            resolvedValue = conflict.freshValue;
            strategy = 'use-fresh';
        } else if (this.isEmptyValue(conflict.currentValue) && !this.isEmptyValue(conflict.freshValue)) {
            // Prefer non-empty value
            resolvedValue = conflict.freshValue;
            strategy = 'use-fresh';
        } else if (!this.isEmptyValue(conflict.currentValue) && this.isEmptyValue(conflict.freshValue)) {
            // Prefer non-empty value
            resolvedValue = conflict.currentValue;
            strategy = 'keep-local';
        } else if (conflict.type === 'timestamp-conflict') {
            // For timestamps, prefer newer
            resolvedValue = conflict.freshValue;
            strategy = 'use-fresh';
        } else {
            return null; // Cannot auto-resolve
        }

        return {
            ...conflict,
            resolution: strategy,
            resolvedValue,
            autoResolved: true,
            timestamp: Date.now()
        };
    }

    /**
     * Show conflict resolution modal
     * @param {Array} conflicts - Array of conflicts
     * @param {Object} options - Modal options
     * @returns {Promise<Array>} User resolutions
     */
    async showConflictResolutionModal(conflicts, options = {}) {
        return new Promise((resolve, reject) => {
            if (this.modalOpen) {
                reject(new Error('Conflict resolution modal already open'));
                return;
            }

            this.modalOpen = true;
            this.currentConflicts = conflicts;

            try {
                const modal = this.createConflictModal(conflicts, options);
                this.attachModalEventListeners(modal, resolve, reject);
                document.body.appendChild(modal);

                // Focus first resolution option
                setTimeout(() => {
                    const firstOption = modal.querySelector('.conflict-resolution-option');
                    if (firstOption) {
                        firstOption.focus();
                    }
                }, 100);

            } catch (error) {
                this.modalOpen = false;
                reject(error);
            }
        });
    }

    /**
     * Create conflict resolution modal
     * @param {Array} conflicts - Array of conflicts
     * @param {Object} options - Modal options
     * @returns {HTMLElement} Modal element
     */
    createConflictModal(conflicts, options = {}) {
        const { showDiffView = true, allowBatchResolution = true, analysis } = options;

        const modal = document.createElement('div');
        modal.className = 'conflict-resolution-modal';
        modal.innerHTML = `
            <div class="conflict-modal-overlay"></div>
            <div class="conflict-modal-content">
                <div class="conflict-modal-header">
                    <div class="conflict-header-info">
                        <h2>Data Conflicts Detected</h2>
                        <p>Fresh data conflicts with your local changes. Choose how to resolve each conflict.</p>
                    </div>
                    <button class="conflict-modal-close" title="Cancel Resolution">✕</button>
                </div>
                
                ${analysis ? this.createAnalysisSummary(analysis) : ''}
                
                <div class="conflict-modal-body">
                    ${allowBatchResolution ? this.createBatchResolutionControls() : ''}
                    
                    <div class="conflicts-list">
                        ${conflicts.map((conflict, index) => this.createConflictItem(conflict, index, showDiffView)).join('')}
                    </div>
                </div>
                
                <div class="conflict-modal-footer">
                    <div class="conflict-footer-info">
                        <span class="conflicts-count">${conflicts.length} conflicts to resolve</span>
                        <span class="resolution-progress">0 resolved</span>
                    </div>
                    <div class="conflict-footer-actions">
                        <button class="btn btn--secondary cancel-resolution">Cancel</button>
                        <button class="btn btn--primary apply-resolutions" disabled>Apply Resolutions</button>
                    </div>
                </div>
            </div>
        `;

        return modal;
    }

    /**
     * Create analysis summary section
     * @param {Object} analysis - Conflict analysis
     * @returns {string} HTML for analysis summary
     */
    createAnalysisSummary(analysis) {
        const highSeverity = analysis.conflictsBySeverity.high || 0;
        const mediumSeverity = analysis.conflictsBySeverity.medium || 0;
        const lowSeverity = analysis.conflictsBySeverity.low || 0;

        return `
            <div class="conflict-analysis-summary">
                <div class="analysis-header">
                    <h3>Conflict Analysis</h3>
                </div>
                <div class="analysis-metrics">
                    <div class="analysis-metric">
                        <div class="metric-value">${analysis.totalConflicts}</div>
                        <div class="metric-label">Total Conflicts</div>
                    </div>
                    <div class="analysis-metric severity-high">
                        <div class="metric-value">${highSeverity}</div>
                        <div class="metric-label">High Priority</div>
                    </div>
                    <div class="analysis-metric severity-medium">
                        <div class="metric-value">${mediumSeverity}</div>
                        <div class="metric-label">Medium Priority</div>
                    </div>
                    <div class="analysis-metric severity-low">
                        <div class="metric-value">${lowSeverity}</div>
                        <div class="metric-label">Low Priority</div>
                    </div>
                </div>
                ${analysis.recommendations.length > 0 ? `
                    <div class="analysis-recommendations">
                        <h4>Recommendations</h4>
                        <ul>
                            ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                        </ul>
                    </div>
                ` : ''}
            </div>
        `;
    }

    /**
     * Create batch resolution controls
     * @returns {string} HTML for batch controls
     */
    createBatchResolutionControls() {
        return `
            <div class="batch-resolution-controls">
                <div class="batch-controls-header">
                    <h3>Batch Resolution</h3>
                    <p>Apply the same resolution to multiple conflicts</p>
                </div>
                <div class="batch-controls-options">
                    <button class="batch-option" data-strategy="keep-local">
                        <span class="batch-icon">📝</span>
                        <span class="batch-label">Keep All Local Changes</span>
                    </button>
                    <button class="batch-option" data-strategy="use-fresh">
                        <span class="batch-icon">🔄</span>
                        <span class="batch-label">Use All Fresh Data</span>
                    </button>
                    <button class="batch-option" data-strategy="smart-merge">
                        <span class="batch-icon">🔀</span>
                        <span class="batch-label">Smart Merge All</span>
                    </button>
                </div>
            </div>
        `;
    }

    /**
     * Create individual conflict item
     * @param {Object} conflict - Conflict object
     * @param {number} index - Conflict index
     * @param {boolean} showDiffView - Whether to show diff view
     * @returns {string} HTML for conflict item
     */
    createConflictItem(conflict, index, showDiffView = true) {
        const severityClass = `severity-${conflict.severity || 'medium'}`;
        const componentType = conflict.componentType || 'Unknown';
        const fieldName = conflict.fieldName || 'Unknown Field';

        return `
            <div class="conflict-item ${severityClass}" data-conflict-index="${index}">
                <div class="conflict-item-header">
                    <div class="conflict-info">
                        <div class="conflict-title">
                            <span class="component-type">${componentType}</span>
                            <span class="field-name">${fieldName}</span>
                        </div>
                        <div class="conflict-meta">
                            <span class="severity-badge severity-${conflict.severity || 'medium'}">${(conflict.severity || 'medium').toUpperCase()}</span>
                            <span class="conflict-type">${this.conflictTypes[conflict.type] || conflict.type}</span>
                        </div>
                    </div>
                    <div class="conflict-status">
                        <span class="resolution-status">Not Resolved</span>
                    </div>
                </div>
                
                ${showDiffView ? this.createDiffView(conflict) : ''}
                
                <div class="conflict-resolution-options">
                    <div class="resolution-option-group">
                        <label class="conflict-resolution-option" data-strategy="keep-local">
                            <input type="radio" name="conflict-${index}" value="keep-local">
                            <span class="option-content">
                                <span class="option-title">Keep Local Changes</span>
                                <span class="option-description">Preserve your modifications</span>
                            </span>
                        </label>
                        
                        <label class="conflict-resolution-option" data-strategy="use-fresh">
                            <input type="radio" name="conflict-${index}" value="use-fresh">
                            <span class="option-content">
                                <span class="option-title">Use Fresh Data</span>
                                <span class="option-description">Apply new data from server</span>
                            </span>
                        </label>
                        
                        <label class="conflict-resolution-option" data-strategy="smart-merge">
                            <input type="radio" name="conflict-${index}" value="smart-merge">
                            <span class="option-content">
                                <span class="option-title">Smart Merge</span>
                                <span class="option-description">Intelligently combine both values</span>
                            </span>
                        </label>
                        
                        <label class="conflict-resolution-option manual-merge" data-strategy="manual-merge">
                            <input type="radio" name="conflict-${index}" value="manual-merge">
                            <span class="option-content">
                                <span class="option-title">Manual Merge</span>
                                <span class="option-description">Create custom combination</span>
                            </span>
                        </label>
                    </div>
                    
                    <div class="manual-merge-editor" style="display: none;">
                        <label for="manual-value-${index}">Custom Value:</label>
                        <textarea id="manual-value-${index}" class="manual-merge-input" placeholder="Enter your custom merged value..."></textarea>
                    </div>
                </div>
            </div>
        `;
    }

    /**
     * Create diff view for conflict
     * @param {Object} conflict - Conflict object
     * @returns {string} HTML for diff view
     */
    createDiffView(conflict) {
        const localValue = this.formatValueForDisplay(conflict.currentValue);
        const freshValue = this.formatValueForDisplay(conflict.freshValue);
        const originalValue = this.formatValueForDisplay(conflict.originalValue);

        return `
            <div class="conflict-diff-view">
                <div class="diff-header">
                    <h4>Value Comparison</h4>
                </div>
                <div class="diff-content">
                    <div class="diff-column local-changes">
                        <div class="diff-column-header">
                            <span class="diff-label">Your Changes</span>
                            <span class="diff-indicator local">📝</span>
                        </div>
                        <div class="diff-value">
                            <pre>${localValue}</pre>
                        </div>
                    </div>
                    
                    <div class="diff-column fresh-data">
                        <div class="diff-column-header">
                            <span class="diff-label">Fresh Data</span>
                            <span class="diff-indicator fresh">🔄</span>
                        </div>
                        <div class="diff-value">
                            <pre>${freshValue}</pre>
                        </div>
                    </div>
                    
                    ${originalValue !== localValue ? `
                        <div class="diff-column original-data">
                            <div class="diff-column-header">
                                <span class="diff-label">Original</span>
                                <span class="diff-indicator original">📄</span>
                            </div>
                            <div class="diff-value">
                                <pre>${originalValue}</pre>
                            </div>
                        </div>
                    ` : ''}
                </div>
            </div>
        `;
    }

    /**
     * Attach event listeners to modal
     * @param {HTMLElement} modal - Modal element
     * @param {Function} resolve - Promise resolve function
     * @param {Function} reject - Promise reject function
     */
    attachModalEventListeners(modal, resolve, reject) {
        // Close modal handlers
        const closeModal = () => {
            this.closeConflictModal(modal);
            reject(new Error('User cancelled conflict resolution'));
        };

        modal.querySelector('.conflict-modal-close').addEventListener('click', closeModal);
        modal.querySelector('.cancel-resolution').addEventListener('click', closeModal);
        modal.querySelector('.conflict-modal-overlay').addEventListener('click', closeModal);

        // Batch resolution handlers
        const batchOptions = modal.querySelectorAll('.batch-option');
        batchOptions.forEach(option => {
            option.addEventListener('click', (e) => {
                const strategy = e.currentTarget.dataset.strategy;
                this.applyBatchResolution(modal, strategy);
            });
        });

        // Individual resolution handlers
        const resolutionOptions = modal.querySelectorAll('.conflict-resolution-option input');
        resolutionOptions.forEach(input => {
            input.addEventListener('change', (e) => {
                this.handleResolutionChange(modal, e.target);
            });
        });

        // Manual merge handlers
        const manualMergeOptions = modal.querySelectorAll('.manual-merge input');
        manualMergeOptions.forEach(input => {
            input.addEventListener('change', (e) => {
                const conflictItem = e.target.closest('.conflict-item');
                const editor = conflictItem.querySelector('.manual-merge-editor');
                if (e.target.checked) {
                    editor.style.display = 'block';
                    editor.querySelector('textarea').focus();
                } else {
                    editor.style.display = 'none';
                }
            });
        });

        // Apply resolutions handler
        modal.querySelector('.apply-resolutions').addEventListener('click', () => {
            try {
                const resolutions = this.collectResolutions(modal);
                this.closeConflictModal(modal);
                resolve(resolutions);
            } catch (error) {
                showToast('Error collecting resolutions: ' + error.message, 'error');
            }
        });

        // Keyboard navigation
        modal.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                closeModal();
            }
        });
    }

    /**
     * Apply batch resolution to all conflicts
     * @param {HTMLElement} modal - Modal element
     * @param {string} strategy - Resolution strategy
     */
    applyBatchResolution(modal, strategy) {
        const conflictItems = modal.querySelectorAll('.conflict-item');
        
        conflictItems.forEach(item => {
            const radioInputs = item.querySelectorAll('input[type="radio"]');
            radioInputs.forEach(input => {
                input.checked = input.value === strategy;
                if (input.checked) {
                    this.handleResolutionChange(modal, input);
                }
            });
        });

        showToast(`Applied ${this.strategies[strategy]} to all conflicts`, 'info');
    }

    /**
     * Handle resolution option change
     * @param {HTMLElement} modal - Modal element
     * @param {HTMLElement} input - Changed input element
     */
    handleResolutionChange(modal, input) {
        const conflictItem = input.closest('.conflict-item');
        const statusElement = conflictItem.querySelector('.resolution-status');
        const strategy = input.value;
        
        // Update status
        statusElement.textContent = this.strategies[strategy] || strategy;
        statusElement.className = `resolution-status resolved strategy-${strategy}`;
        
        // Update progress
        this.updateResolutionProgress(modal);
        
        // Show/hide manual merge editor
        const manualEditor = conflictItem.querySelector('.manual-merge-editor');
        if (strategy === 'manual-merge') {
            manualEditor.style.display = 'block';
            manualEditor.querySelector('textarea').focus();
        } else {
            manualEditor.style.display = 'none';
        }
    }

    /**
     * Update resolution progress
     * @param {HTMLElement} modal - Modal element
     */
    updateResolutionProgress(modal) {
        const conflictItems = modal.querySelectorAll('.conflict-item');
        const resolvedItems = modal.querySelectorAll('.conflict-item .resolution-status.resolved');
        
        const progressElement = modal.querySelector('.resolution-progress');
        const applyButton = modal.querySelector('.apply-resolutions');
        
        const total = conflictItems.length;
        const resolved = resolvedItems.length;
        
        progressElement.textContent = `${resolved} resolved`;
        
        // Enable apply button when all conflicts are resolved
        applyButton.disabled = resolved !== total;
        
        if (resolved === total) {
            applyButton.textContent = 'Apply All Resolutions';
            applyButton.classList.add('ready');
        } else {
            applyButton.textContent = `Apply Resolutions (${total - resolved} remaining)`;
            applyButton.classList.remove('ready');
        }
    }

    /**
     * Collect resolutions from modal
     * @param {HTMLElement} modal - Modal element
     * @returns {Array} Array of resolutions
     */
    collectResolutions(modal) {
        const resolutions = [];
        const conflictItems = modal.querySelectorAll('.conflict-item');
        
        conflictItems.forEach((item, index) => {
            const selectedInput = item.querySelector('input[type="radio"]:checked');
            if (!selectedInput) {
                throw new Error(`No resolution selected for conflict ${index + 1}`);
            }
            
            const strategy = selectedInput.value;
            const conflict = this.currentConflicts[index];
            let resolvedValue;
            
            switch (strategy) {
                case 'keep-local':
                    resolvedValue = conflict.currentValue;
                    break;
                case 'use-fresh':
                    resolvedValue = conflict.freshValue;
                    break;
                case 'smart-merge':
                    resolvedValue = this.performSmartMerge(conflict.currentValue, conflict.freshValue);
                    break;
                case 'manual-merge':
                    const manualInput = item.querySelector('.manual-merge-input');
                    resolvedValue = manualInput.value;
                    if (!resolvedValue.trim()) {
                        throw new Error(`Manual merge value required for conflict ${index + 1}`);
                    }
                    break;
                default:
                    throw new Error(`Unknown resolution strategy: ${strategy}`);
            }
            
            resolutions.push({
                ...conflict,
                resolution: strategy,
                resolvedValue,
                timestamp: Date.now(),
                userResolved: true
            });
        });
        
        return resolutions;
    }

    /**
     * Close conflict modal
     * @param {HTMLElement} modal - Modal element
     */
    closeConflictModal(modal) {
        modal.remove();
        this.modalOpen = false;
        this.currentConflicts = [];
    }

    /**
     * Perform smart merge of two values
     * @param {*} localValue - Local value
     * @param {*} freshValue - Fresh value
     * @returns {*} Merged value
     */
    performSmartMerge(localValue, freshValue) {
        // If one is empty, use the other
        if (this.isEmptyValue(localValue)) return freshValue;
        if (this.isEmptyValue(freshValue)) return localValue;
        
        // For strings, try to merge intelligently
        if (typeof localValue === 'string' && typeof freshValue === 'string') {
            // If values are similar, use the longer one
            const similarity = this.calculateStringSimilarity(localValue, freshValue);
            if (similarity > 0.8) {
                return localValue.length > freshValue.length ? localValue : freshValue;
            }
            
            // If very different, combine them
            return `${localValue}\n\n${freshValue}`;
        }
        
        // For other types, prefer fresh value
        return freshValue;
    }

    /**
     * Calculate string similarity
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} Similarity ratio (0-1)
     */
    calculateStringSimilarity(str1, str2) {
        const longer = str1.length > str2.length ? str1 : str2;
        const shorter = str1.length > str2.length ? str2 : str1;
        
        if (longer.length === 0) return 1.0;
        
        const editDistance = this.calculateEditDistance(longer, shorter);
        return (longer.length - editDistance) / longer.length;
    }

    /**
     * Calculate edit distance between strings
     * @param {string} str1 - First string
     * @param {string} str2 - Second string
     * @returns {number} Edit distance
     */
    calculateEditDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * Generate recommendations based on conflict analysis
     * @param {Object} analysis - Conflict analysis
     * @returns {Array} Array of recommendations
     */
    generateRecommendations(analysis) {
        const recommendations = [];
        
        // High severity conflicts
        if (analysis.conflictsBySeverity.high > 0) {
            recommendations.push('Review high-priority conflicts carefully - they may affect content quality');
        }
        
        // Many conflicts in one component
        const componentsWithManyConflicts = Object.entries(analysis.conflictsByComponent)
            .filter(([_, data]) => data.count >= 3);
        
        if (componentsWithManyConflicts.length > 0) {
            recommendations.push('Consider refreshing components with many conflicts instead of resolving individually');
        }
        
        // Auto-resolvable conflicts
        if (analysis.autoResolvableCount > analysis.requiresUserInput) {
            recommendations.push('Most conflicts can be auto-resolved - consider using batch resolution');
        }
        
        // Field-specific recommendations
        if (analysis.conflictsByType['field-conflict'] > 0) {
            recommendations.push('Field conflicts often indicate recent content updates - review changes carefully');
        }
        
        return recommendations;
    }

    // Utility Methods

    /**
     * Check if value is empty
     * @param {*} value - Value to check
     * @returns {boolean} True if empty
     */
    isEmptyValue(value) {
        return value === null || 
               value === undefined || 
               value === '' || 
               (typeof value === 'string' && value.trim() === '') ||
               (Array.isArray(value) && value.length === 0) ||
               (typeof value === 'object' && Object.keys(value).length === 0);
    }

    /**
     * Format value for display in UI
     * @param {*} value - Value to format
     * @returns {string} Formatted value
     */
    formatValueForDisplay(value) {
        if (this.isEmptyValue(value)) {
            return '(empty)';
        }
        
        if (typeof value === 'object') {
            return JSON.stringify(value, null, 2);
        }
        
        return String(value);
    }

    /**
     * Get auto-resolved conflicts (for tracking)
     * @returns {Array} Auto-resolved conflicts
     */
    getAutoResolvedConflicts() {
        // This would store auto-resolved conflicts during processing
        return this._autoResolvedConflicts || [];
    }

    /**
     * Resolve component conflicts (simplified interface)
     * @param {string} componentId - Component ID
     * @param {Array} conflicts - Component conflicts
     * @returns {Promise<Object>} Resolution result
     */
    async resolveComponentConflicts(componentId, conflicts) {
        return this.resolveConflicts(conflicts, {
            autoResolveSimple: true,
            showDiffView: true,
            allowBatchResolution: false // Single component, no batch needed
        });
    }

    /**
     * Get conflict resolver statistics
     * @returns {Object} Statistics
     */
    getStats() {
        return {
            modalOpen: this.modalOpen,
            currentConflicts: this.currentConflicts.length,
            strategies: Object.keys(this.strategies),
            conflictTypes: Object.keys(this.conflictTypes)
        };
    }
}

// Export class and create global instance
export { DataConflictResolver };

// Make available globally for refresh manager
window.DataConflictResolver = DataConflictResolver;
