/**
 * DOM Ownership Debugger
 * PHASE 4: Visual debugging tool for DOM ownership boundaries
 * 
 * Provides visual overlays and interactive debugging for ownership issues
 * 
 * @version 1.0.0
 * @package GMKB/Debug
 */

(function(window) {
    'use strict';
    
    const logger = window.structuredLogger || console;
    
    /**
     * DOM Ownership Debugger
     */
    class DOMOwnershipDebugger {
        constructor() {
            this.manager = window.domOwnershipManager;
            this.enabled = false;
            this.overlayElements = new Map();
            this.highlightedElement = null;
            
            // Color scheme for ownership types
            this.colors = {
                preview: '#9333ea',
                editor: '#22c55e',
                system: '#ef4444',
                shared: '#fb923c',
                violation: '#dc2626',
                conflict: '#f59e0b'
            };
            
            this.init();
        }
        
        /**
         * Initialize debugger
         */
        init() {
            // Create debug panel
            this.createDebugPanel();
            
            // Set up keyboard shortcuts
            this.setupKeyboardShortcuts();
            
            // Listen for ownership events
            this.attachEventListeners();
            
            logger.info('DOM_DEBUG', 'DOM Ownership Debugger initialized');
        }
        
        /**
         * Create debug panel UI
         */
        createDebugPanel() {
            const panel = document.createElement('div');
            panel.id = 'gmkb-ownership-debug-panel';
            panel.innerHTML = `
                <div class="debug-panel-header">
                    <h3>🔍 DOM Ownership Debug</h3>
                    <button class="debug-panel-close">×</button>
                </div>
                <div class="debug-panel-content">
                    <div class="debug-controls">
                        <button id="debug-toggle-overlay">Toggle Overlay</button>
                        <button id="debug-scan-violations">Scan Violations</button>
                        <button id="debug-show-stats">Show Stats</button>
                        <button id="debug-clear-violations">Clear Violations</button>
                    </div>
                    <div class="debug-stats">
                        <div class="stat-item">
                            <span class="stat-label">Elements:</span>
                            <span class="stat-value" id="stat-elements">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Violations:</span>
                            <span class="stat-value" id="stat-violations">0</span>
                        </div>
                        <div class="stat-item">
                            <span class="stat-label">Conflicts:</span>
                            <span class="stat-value" id="stat-conflicts">0</span>
                        </div>
                    </div>
                    <div class="debug-log" id="debug-ownership-log"></div>
                </div>
            `;
            
            // Add styles
            const styles = `
                <style>
                #gmkb-ownership-debug-panel {
                    position: fixed;
                    right: 20px;
                    top: 20px;
                    width: 320px;
                    background: white;
                    border-radius: 8px;
                    box-shadow: 0 4px 24px rgba(0, 0, 0, 0.15);
                    z-index: 100000;
                    display: none;
                    font-family: system-ui, -apple-system, sans-serif;
                }
                
                #gmkb-ownership-debug-panel.active {
                    display: block;
                }
                
                .debug-panel-header {
                    display: flex;
                    justify-content: space-between;
                    align-items: center;
                    padding: 12px 16px;
                    border-bottom: 1px solid #e5e7eb;
                    background: #f9fafb;
                    border-radius: 8px 8px 0 0;
                }
                
                .debug-panel-header h3 {
                    margin: 0;
                    font-size: 14px;
                    font-weight: 600;
                    color: #1f2937;
                }
                
                .debug-panel-close {
                    background: none;
                    border: none;
                    font-size: 20px;
                    cursor: pointer;
                    color: #6b7280;
                    padding: 0;
                    width: 24px;
                    height: 24px;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                }
                
                .debug-panel-close:hover {
                    color: #1f2937;
                }
                
                .debug-panel-content {
                    padding: 16px;
                }
                
                .debug-controls {
                    display: grid;
                    grid-template-columns: 1fr 1fr;
                    gap: 8px;
                    margin-bottom: 16px;
                }
                
                .debug-controls button {
                    padding: 6px 12px;
                    background: #3b82f6;
                    color: white;
                    border: none;
                    border-radius: 4px;
                    font-size: 12px;
                    cursor: pointer;
                    transition: background 0.2s;
                }
                
                .debug-controls button:hover {
                    background: #2563eb;
                }
                
                .debug-stats {
                    display: grid;
                    grid-template-columns: repeat(3, 1fr);
                    gap: 8px;
                    margin-bottom: 16px;
                    padding: 12px;
                    background: #f9fafb;
                    border-radius: 6px;
                }
                
                .stat-item {
                    text-align: center;
                }
                
                .stat-label {
                    display: block;
                    font-size: 11px;
                    color: #6b7280;
                    margin-bottom: 4px;
                }
                
                .stat-value {
                    display: block;
                    font-size: 18px;
                    font-weight: 600;
                    color: #1f2937;
                }
                
                .debug-log {
                    max-height: 200px;
                    overflow-y: auto;
                    border: 1px solid #e5e7eb;
                    border-radius: 4px;
                    padding: 8px;
                    font-size: 11px;
                    font-family: 'Courier New', monospace;
                }
                
                .debug-log-entry {
                    margin-bottom: 4px;
                    padding: 4px;
                    border-radius: 2px;
                }
                
                .debug-log-entry.violation {
                    background: #fef2f2;
                    color: #dc2626;
                }
                
                .debug-log-entry.conflict {
                    background: #fffbeb;
                    color: #d97706;
                }
                
                .debug-log-entry.info {
                    background: #eff6ff;
                    color: #1e40af;
                }
                
                /* Overlay styles */
                .ownership-debug-overlay {
                    position: absolute;
                    pointer-events: none;
                    border: 2px solid;
                    border-radius: 4px;
                    opacity: 0.3;
                    z-index: 99999;
                }
                
                .ownership-debug-label {
                    position: absolute;
                    top: -20px;
                    left: 0;
                    background: #1f2937;
                    color: white;
                    padding: 2px 6px;
                    border-radius: 3px;
                    font-size: 10px;
                    font-family: system-ui, -apple-system, sans-serif;
                    white-space: nowrap;
                    pointer-events: none;
                    z-index: 100000;
                }
                </style>
            `;
            
            // Add to document
            document.head.insertAdjacentHTML('beforeend', styles);
            document.body.appendChild(panel);
            
            // Attach panel event listeners
            this.attachPanelListeners();
        }
        
        /**
         * Attach panel event listeners
         */
        attachPanelListeners() {
            const panel = document.getElementById('gmkb-ownership-debug-panel');
            
            // Close button
            panel.querySelector('.debug-panel-close').addEventListener('click', () => {
                this.hidePanel();
            });
            
            // Toggle overlay
            document.getElementById('debug-toggle-overlay').addEventListener('click', () => {
                this.toggleOverlay();
            });
            
            // Scan violations
            document.getElementById('debug-scan-violations').addEventListener('click', () => {
                this.scanForViolations();
            });
            
            // Show stats
            document.getElementById('debug-show-stats').addEventListener('click', () => {
                this.showStats();
            });
            
            // Clear violations
            document.getElementById('debug-clear-violations').addEventListener('click', () => {
                this.clearViolations();
            });
        }
        
        /**
         * Setup keyboard shortcuts
         */
        setupKeyboardShortcuts() {
            document.addEventListener('keydown', (e) => {
                // Ctrl/Cmd + Shift + O - Toggle debug panel
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'O') {
                    e.preventDefault();
                    this.togglePanel();
                }
                
                // Ctrl/Cmd + Shift + V - Scan violations
                if ((e.ctrlKey || e.metaKey) && e.shiftKey && e.key === 'V') {
                    e.preventDefault();
                    this.scanForViolations();
                }
                
                // When panel is open, ESC closes it
                if (e.key === 'Escape' && this.isPanelVisible()) {
                    this.hidePanel();
                }
            });
            
            // Click on element with Alt to inspect ownership
            document.addEventListener('click', (e) => {
                if (e.altKey) {
                    e.preventDefault();
                    this.inspectElement(e.target);
                }
            });
        }
        
        /**
         * Attach event listeners
         */
        attachEventListeners() {
            // Listen for violations
            document.addEventListener('dom-ownership:violation', (e) => {
                this.logViolation(e.detail);
                this.updateStats();
            });
            
            // Listen for conflicts
            document.addEventListener('dom-ownership:conflict', (e) => {
                this.logConflict(e.detail);
                this.updateStats();
            });
            
            // Listen for edit mode changes
            document.addEventListener('dom-ownership:edit-mode-changed', (e) => {
                this.logEditModeChange(e.detail);
            });
        }
        
        /**
         * Toggle debug panel
         */
        togglePanel() {
            const panel = document.getElementById('gmkb-ownership-debug-panel');
            if (panel.classList.contains('active')) {
                this.hidePanel();
            } else {
                this.showPanel();
            }
        }
        
        /**
         * Show debug panel
         */
        showPanel() {
            const panel = document.getElementById('gmkb-ownership-debug-panel');
            panel.classList.add('active');
            this.updateStats();
            
            // Enable debug mode
            document.body.classList.add('gmkb-debug-mode');
            
            logger.info('DOM_DEBUG', 'Debug panel opened');
        }
        
        /**
         * Hide debug panel
         */
        hidePanel() {
            const panel = document.getElementById('gmkb-ownership-debug-panel');
            panel.classList.remove('active');
            
            // Disable overlay if active
            if (this.enabled) {
                this.toggleOverlay();
            }
            
            // Disable debug mode
            document.body.classList.remove('gmkb-debug-mode');
            
            logger.info('DOM_DEBUG', 'Debug panel closed');
        }
        
        /**
         * Check if panel is visible
         */
        isPanelVisible() {
            const panel = document.getElementById('gmkb-ownership-debug-panel');
            return panel && panel.classList.contains('active');
        }
        
        /**
         * Toggle overlay
         */
        toggleOverlay() {
            if (this.enabled) {
                this.disableOverlay();
            } else {
                this.enableOverlay();
            }
        }
        
        /**
         * Enable overlay
         */
        enableOverlay() {
            this.enabled = true;
            
            // Create overlays for all registered elements
            if (this.manager) {
                this.manager.ownership.forEach((ownership, element) => {
                    this.createOverlayForElement(element, ownership);
                });
            }
            
            this.log('Overlay enabled', 'info');
            logger.info('DOM_DEBUG', 'Overlay enabled');
        }
        
        /**
         * Disable overlay
         */
        disableOverlay() {
            this.enabled = false;
            
            // Remove all overlays
            this.overlayElements.forEach(overlay => {
                overlay.remove();
            });
            this.overlayElements.clear();
            
            this.log('Overlay disabled', 'info');
            logger.info('DOM_DEBUG', 'Overlay disabled');
        }
        
        /**
         * Create overlay for element
         */
        createOverlayForElement(element, ownership) {
            if (!element.offsetParent) return; // Skip hidden elements
            
            const rect = element.getBoundingClientRect();
            const overlay = document.createElement('div');
            overlay.className = 'ownership-debug-overlay';
            overlay.style.position = 'fixed';
            overlay.style.left = `${rect.left}px`;
            overlay.style.top = `${rect.top}px`;
            overlay.style.width = `${rect.width}px`;
            overlay.style.height = `${rect.height}px`;
            overlay.style.borderColor = this.colors[ownership.type] || '#999';
            
            // Add label
            const label = document.createElement('div');
            label.className = 'ownership-debug-label';
            label.textContent = `${ownership.type} - ${ownership.owner}`;
            label.style.backgroundColor = this.colors[ownership.type] || '#999';
            overlay.appendChild(label);
            
            document.body.appendChild(overlay);
            this.overlayElements.set(element, overlay);
        }
        
        /**
         * Scan for violations
         */
        scanForViolations() {
            this.log('Scanning for violations...', 'info');
            
            if (!this.manager) {
                this.log('DOM Ownership Manager not found', 'error');
                return;
            }
            
            // Trigger scan
            this.manager.scanAndEnforceOwnership();
            
            // Check for violations
            const stats = this.manager.getStats();
            
            if (stats.violationsDetected > 0) {
                this.log(`Found ${stats.violationsDetected} violations`, 'violation');
                
                // Highlight violations
                stats.recentViolations.forEach(violation => {
                    if (violation.element && violation.element.offsetParent) {
                        violation.element.classList.add('gmkb-ownership-violation');
                        setTimeout(() => {
                            violation.element.classList.remove('gmkb-ownership-violation');
                        }, 3000);
                    }
                });
            } else {
                this.log('No violations found', 'info');
            }
            
            this.updateStats();
        }
        
        /**
         * Show statistics
         */
        showStats() {
            const stats = this.manager?.getStats();
            if (!stats) return;
            
            console.group('%c📊 DOM Ownership Statistics', 'font-size: 14px; font-weight: bold; color: #3b82f6');
            console.log('Total Elements:', stats.elementsRegistered);
            console.log('By Type:', stats.byType);
            console.log('Violations:', stats.violationsDetected);
            console.log('Corrected:', stats.violationsCorrected);
            console.log('Conflicts:', stats.ownershipConflicts);
            console.groupEnd();
            
            this.log('Statistics logged to console', 'info');
        }
        
        /**
         * Clear violations
         */
        clearViolations() {
            // Clear violation log
            const log = document.getElementById('debug-ownership-log');
            log.innerHTML = '';
            
            // Reset stats
            if (this.manager) {
                this.manager.violations = [];
                this.manager.stats.violationsDetected = 0;
                this.manager.stats.violationsCorrected = 0;
            }
            
            this.updateStats();
            this.log('Violations cleared', 'info');
        }
        
        /**
         * Inspect element ownership
         */
        inspectElement(element) {
            if (!this.manager) return;
            
            const ownership = this.manager.ownership.get(element);
            
            if (ownership) {
                console.group('%c🔍 Element Ownership', 'font-size: 14px; font-weight: bold; color: #9333ea');
                console.log('Element:', element);
                console.log('Owner:', ownership.owner);
                console.log('Type:', ownership.type);
                console.log('Metadata:', ownership.metadata);
                console.log('Registered:', new Date(ownership.registeredAt).toLocaleString());
                console.groupEnd();
                
                // Highlight element
                this.highlightElement(element, ownership);
            } else {
                console.log('No ownership information for element:', element);
            }
        }
        
        /**
         * Highlight element
         */
        highlightElement(element, ownership) {
            // Remove previous highlight
            if (this.highlightedElement) {
                this.highlightedElement.style.outline = '';
            }
            
            // Apply highlight
            element.style.outline = `3px solid ${this.colors[ownership.type] || '#999'}`;
            this.highlightedElement = element;
            
            // Remove after 3 seconds
            setTimeout(() => {
                if (this.highlightedElement === element) {
                    element.style.outline = '';
                    this.highlightedElement = null;
                }
            }, 3000);
        }
        
        /**
         * Update statistics display
         */
        updateStats() {
            const stats = this.manager?.getStats();
            if (!stats) return;
            
            document.getElementById('stat-elements').textContent = stats.elementsRegistered;
            document.getElementById('stat-violations').textContent = stats.violationsDetected;
            document.getElementById('stat-conflicts').textContent = stats.ownershipConflicts;
        }
        
        /**
         * Log message to debug panel
         */
        log(message, type = 'info') {
            const log = document.getElementById('debug-ownership-log');
            if (!log) return;
            
            const entry = document.createElement('div');
            entry.className = `debug-log-entry ${type}`;
            entry.textContent = `[${new Date().toLocaleTimeString()}] ${message}`;
            
            log.insertBefore(entry, log.firstChild);
            
            // Keep only last 50 entries
            while (log.children.length > 50) {
                log.removeChild(log.lastChild);
            }
        }
        
        /**
         * Log violation
         */
        logViolation(violation) {
            this.log(`Violation: ${violation.type}`, 'violation');
        }
        
        /**
         * Log conflict
         */
        logConflict(conflict) {
            this.log(`Conflict: ${conflict.existingOwner} vs ${conflict.attemptedOwner}`, 'conflict');
        }
        
        /**
         * Log edit mode change
         */
        logEditModeChange(detail) {
            this.log(`Edit mode ${detail.enabled ? 'enabled' : 'disabled'}`, 'info');
        }
    }
    
    // Create global instance
    window.domOwnershipDebugger = new DOMOwnershipDebugger();
    
    // Console commands
    window.openOwnershipDebug = () => window.domOwnershipDebugger.showPanel();
    window.inspectOwnership = (element) => window.domOwnershipDebugger.inspectElement(element);
    
    logger.info('DOM_DEBUG', 'DOM Ownership Debugger loaded');
    logger.info('DOM_DEBUG', 'Press Ctrl+Shift+O to toggle debug panel');
    logger.info('DOM_DEBUG', 'Alt+Click on any element to inspect ownership');
    
})(window);
