/**
 * DOM Ownership Debug Tool
 * Provides debugging utilities for the Phase 4 DOM Ownership Manager
 */
(function() {
    'use strict';

    class OwnershipDebugger {
        constructor() {
            this.ownershipMap = new Map();
            this.conflicts = [];
            this.init();
        }

        init() {
            // Wait for DOM Ownership Manager to be ready
            document.addEventListener('DOMContentLoaded', () => {
                this.setupDebugTools();
            });

            document.addEventListener('dom-ownership:ready', () => {
                console.log('✅ DOM Ownership Manager is ready');
                this.connectToManager();
            });

            // Track ownership changes
            document.addEventListener('dom-ownership:assigned', (event) => {
                this.trackOwnership(event.detail);
            });

            document.addEventListener('dom-ownership:conflict', (event) => {
                this.trackConflict(event.detail);
            });
        }

        connectToManager() {
            if (window.DOMOwnershipManager) {
                this.manager = window.DOMOwnershipManager;
                console.log('✅ Connected to DOM Ownership Manager');
                this.exposeDebugFunctions();
            } else {
                console.warn('⚠️ DOM Ownership Manager not found');
            }
        }

        setupDebugTools() {
            // Add visual ownership indicators
            this.addOwnershipStyles();
            
            // Add debug panel button
            this.addDebugButton();
        }

        addOwnershipStyles() {
            const style = document.createElement('style');
            style.textContent = `
                /* DOM Ownership Debug Styles */
                [data-ownership-debug] {
                    position: relative;
                }
                
                [data-ownership-debug]::before {
                    content: attr(data-owner);
                    position: absolute;
                    top: -20px;
                    left: 0;
                    background: #333;
                    color: #fff;
                    padding: 2px 6px;
                    font-size: 11px;
                    border-radius: 3px;
                    z-index: 9999;
                    pointer-events: none;
                    display: none;
                }
                
                [data-ownership-debug]:hover::before {
                    display: block;
                }
                
                .ownership-conflict {
                    outline: 2px solid red !important;
                    outline-offset: 2px;
                }
                
                .ownership-preview {
                    outline: 2px solid blue !important;
                    outline-offset: 2px;
                }
                
                .ownership-editor {
                    outline: 2px solid green !important;
                    outline-offset: 2px;
                }
                
                .ownership-sync {
                    outline: 2px solid orange !important;
                    outline-offset: 2px;
                }
            `;
            document.head.appendChild(style);
        }

        addDebugButton() {
            const button = document.createElement('button');
            button.textContent = '🔍 Ownership Debug';
            button.style.cssText = `
                position: fixed;
                bottom: 20px;
                right: 20px;
                background: #333;
                color: #fff;
                padding: 10px 15px;
                border: none;
                border-radius: 5px;
                cursor: pointer;
                z-index: 10000;
                font-size: 14px;
            `;
            
            button.addEventListener('click', () => {
                this.toggleDebugMode();
            });
            
            document.body.appendChild(button);
            this.debugButton = button;
        }

        toggleDebugMode() {
            const isActive = document.body.classList.contains('ownership-debug-mode');
            
            if (isActive) {
                this.disableDebugMode();
            } else {
                this.enableDebugMode();
            }
        }

        enableDebugMode() {
            document.body.classList.add('ownership-debug-mode');
            
            // Mark all owned elements
            document.querySelectorAll('[data-component-id]').forEach(element => {
                const owner = this.getOwner(element);
                if (owner) {
                    element.setAttribute('data-ownership-debug', '');
                    element.setAttribute('data-owner', owner);
                    
                    // Add visual class based on owner type
                    element.classList.add(`ownership-${owner}`);
                }
            });
            
            console.log('🔍 Ownership debug mode enabled');
            this.debugButton.textContent = '✓ Debug Active';
            this.showOwnershipReport();
        }

        disableDebugMode() {
            document.body.classList.remove('ownership-debug-mode');
            
            // Remove debug attributes
            document.querySelectorAll('[data-ownership-debug]').forEach(element => {
                element.removeAttribute('data-ownership-debug');
                element.removeAttribute('data-owner');
                element.classList.remove('ownership-preview', 'ownership-editor', 'ownership-sync', 'ownership-conflict');
            });
            
            console.log('🔍 Ownership debug mode disabled');
            this.debugButton.textContent = '🔍 Ownership Debug';
        }

        getOwner(element) {
            // Check various ownership indicators
            if (element.hasAttribute('contenteditable')) {
                return 'editor';
            }
            
            if (element.closest('.component-preview')) {
                return 'preview';
            }
            
            if (element.closest('.component-editor')) {
                return 'editor';
            }
            
            if (element.dataset.syncOwner) {
                return element.dataset.syncOwner;
            }
            
            return null;
        }

        trackOwnership(detail) {
            const { elementId, owner, timestamp } = detail;
            
            this.ownershipMap.set(elementId, {
                owner,
                timestamp,
                element: document.getElementById(elementId)
            });
            
            console.log(`📝 Ownership assigned: ${elementId} → ${owner}`);
        }

        trackConflict(detail) {
            const { elementId, attemptedOwner, currentOwner, timestamp } = detail;
            
            this.conflicts.push({
                elementId,
                attemptedOwner,
                currentOwner,
                timestamp
            });
            
            console.warn(`⚠️ Ownership conflict: ${attemptedOwner} tried to claim ${elementId} owned by ${currentOwner}`);
            
            // Visual indication of conflict
            const element = document.getElementById(elementId);
            if (element) {
                element.classList.add('ownership-conflict');
                setTimeout(() => {
                    element.classList.remove('ownership-conflict');
                }, 3000);
            }
        }

        showOwnershipReport() {
            console.group('📊 DOM Ownership Report');
            
            // Count by owner type
            const ownerCounts = {};
            this.ownershipMap.forEach(({ owner }) => {
                ownerCounts[owner] = (ownerCounts[owner] || 0) + 1;
            });
            
            console.table(ownerCounts);
            
            // Show recent conflicts
            if (this.conflicts.length > 0) {
                console.group('⚠️ Recent Conflicts');
                this.conflicts.slice(-5).forEach(conflict => {
                    console.log(`${conflict.attemptedOwner} vs ${conflict.currentOwner} for ${conflict.elementId}`);
                });
                console.groupEnd();
            }
            
            console.groupEnd();
        }

        exposeDebugFunctions() {
            // Expose debugging functions globally
            window.openOwnershipDebug = () => {
                this.enableDebugMode();
                return 'Ownership debug mode activated';
            };

            window.closeOwnershipDebug = () => {
                this.disableDebugMode();
                return 'Ownership debug mode deactivated';
            };

            window.getOwnershipReport = () => {
                return {
                    totalOwned: this.ownershipMap.size,
                    conflicts: this.conflicts.length,
                    owners: Array.from(this.ownershipMap.values()).map(v => ({
                        owner: v.owner,
                        timestamp: new Date(v.timestamp).toLocaleTimeString()
                    })),
                    recentConflicts: this.conflicts.slice(-5)
                };
            };

            window.checkOwnership = (elementOrId) => {
                const element = typeof elementOrId === 'string' 
                    ? document.getElementById(elementOrId)
                    : elementOrId;
                    
                if (!element) return 'Element not found';
                
                const owner = this.getOwner(element);
                const managed = this.ownershipMap.has(element.id);
                
                return {
                    elementId: element.id,
                    owner: owner || 'none',
                    managed: managed,
                    conflicts: this.conflicts.filter(c => c.elementId === element.id)
                };
            };

            console.log('📋 Ownership debug functions available:');
            console.log('  - openOwnershipDebug()');
            console.log('  - closeOwnershipDebug()');
            console.log('  - getOwnershipReport()');
            console.log('  - checkOwnership(elementOrId)');
        }
    }

    // Initialize ownership debugger
    const ownershipDebuggerInstance = new OwnershipDebugger();
    
    // Expose the debugger instance
    window.ownershipDebugger = ownershipDebuggerInstance;

})();
