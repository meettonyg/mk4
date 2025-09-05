/**
 * Design Panel Protection
 * ROOT FIX: Prevents the design panel from closing when clicking on form fields
 * 
 * This addresses the issue where clicking on any input field within the design
 * panel causes it to immediately close, preventing users from editing settings.
 * 
 * @version 1.0.0
 * @package GMKB/Core
 */

(function() {
    'use strict';
    
    const logger = window.StructuredLogger || console;
    
    /**
     * ROOT FIX: Comprehensive protection system for design panel
     */
    class DesignPanelProtection {
        constructor() {
            this.isProtected = false;
            this.protectedElements = new WeakSet();
            
            logger.info('🛡️ Design Panel Protection initializing...');
            this.initialize();
        }
        
        initialize() {
            // Wait for DOM and design panel to be ready
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => this.setupProtection());
            } else {
                this.setupProtection();
            }
            
            // Listen for design panel loads
            document.addEventListener('designPanelLoaded', () => {
                logger.info('🛡️ Design panel loaded, reinforcing protection...');
                setTimeout(() => this.reinforceProtection(), 100);
            });
            
            // Listen for tab changes
            document.addEventListener('gmkb:tab-changed', (e) => {
                if (e.detail.tabName === 'design') {
                    logger.info('🛡️ Design tab activated, ensuring protection...');
                    setTimeout(() => this.reinforceProtection(), 50);
                }
            });
        }
        
        setupProtection() {
            // Protect the entire design tab area
            const designTab = document.getElementById('design-tab');
            const elementEditor = document.getElementById('element-editor');
            
            if (designTab) {
                this.protectContainer(designTab);
            }
            
            if (elementEditor) {
                this.protectContainer(elementEditor);
            }
            
            // Global document-level protection
            this.setupGlobalProtection();
            
            this.isProtected = true;
            logger.info('✅ Design Panel Protection established');
        }
        
        /**
         * Protect a container from unwanted event propagation
         */
        protectContainer(container) {
            if (this.protectedElements.has(container)) {
                return; // Already protected
            }
            
            // Capture phase listeners to intercept events early
            
            // Prevent click propagation that might close the panel
            container.addEventListener('click', (e) => {
                // Allow legitimate close buttons
                if (e.target.matches('.close, .panel-close, [data-action="close"], .sidebar__tab')) {
                    return;
                }
                
                // Stop propagation for everything else within the panel
                e.stopPropagation();
            }, true);
            
            // Prevent mousedown propagation (some systems use mousedown)
            container.addEventListener('mousedown', (e) => {
                // Allow tab buttons
                if (e.target.closest('.sidebar__tab')) {
                    return;
                }
                
                // Protect form elements
                const formElements = 'input, textarea, select, button, [contenteditable], .form-control, .topics-sidebar__topic-input';
                if (e.target.matches(formElements) || e.target.closest(formElements)) {
                    e.stopPropagation();
                    
                    // Ensure the element gets focus
                    const focusTarget = e.target.matches(formElements) ? e.target : e.target.closest(formElements);
                    if (focusTarget && focusTarget.focus) {
                        setTimeout(() => focusTarget.focus(), 0);
                    }
                }
            }, true);
            
            // Protect focus events
            container.addEventListener('focusin', (e) => {
                e.stopPropagation();
            }, true);
            
            container.addEventListener('focus', (e) => {
                e.stopPropagation();
            }, true);
            
            this.protectedElements.add(container);
            logger.info(`🛡️ Protected container:`, container.id || container.className);
        }
        
        /**
         * Setup global document-level protection
         */
        setupGlobalProtection() {
            // Intercept any document-level click handlers that might close panels
            document.addEventListener('click', (e) => {
                // Check if click is within a protected area
                const designTab = document.getElementById('design-tab');
                const elementEditor = document.getElementById('element-editor');
                
                if ((designTab && designTab.contains(e.target)) || 
                    (elementEditor && elementEditor.contains(e.target))) {
                    
                    // Don't let this bubble to any handlers that might close the panel
                    const formElements = 'input, textarea, select, button, [contenteditable], .form-control';
                    if (e.target.matches(formElements)) {
                        e.stopImmediatePropagation();
                    }
                }
            }, true); // Capture phase
        }
        
        /**
         * Reinforce protection after dynamic content loads
         */
        reinforceProtection() {
            const designTab = document.getElementById('design-tab');
            const elementEditor = document.getElementById('element-editor');
            
            // Find all form elements in the design panel
            const selector = 'input, textarea, select, button:not(.close):not(.panel-close), [contenteditable], .form-control, .topics-sidebar__topic-input';
            
            const elements = [];
            if (designTab) {
                elements.push(...designTab.querySelectorAll(selector));
            }
            if (elementEditor) {
                elements.push(...elementEditor.querySelectorAll(selector));
            }
            
            elements.forEach(element => {
                // Remove any existing listeners to prevent duplicates
                element.removeEventListener('mousedown', this.protectElement);
                element.removeEventListener('click', this.protectElement);
                element.removeEventListener('focus', this.protectElement);
                
                // Add protection
                element.addEventListener('mousedown', this.protectElement, true);
                element.addEventListener('click', this.protectElement, true);
                element.addEventListener('focus', this.protectElement, true);
            });
            
            logger.info(`🛡️ Reinforced protection for ${elements.length} form elements`);
        }
        
        /**
         * Event handler to protect individual elements
         */
        protectElement(e) {
            e.stopPropagation();
            e.stopImmediatePropagation();
            
            // For mousedown, ensure focus
            if (e.type === 'mousedown' && e.target.focus) {
                setTimeout(() => e.target.focus(), 0);
            }
        }
        
        /**
         * Debug function to test protection
         */
        debug() {
            const info = {
                isProtected: this.isProtected,
                designTab: !!document.getElementById('design-tab'),
                elementEditor: !!document.getElementById('element-editor'),
                formElements: {
                    inputs: document.querySelectorAll('#design-tab input, #element-editor input').length,
                    textareas: document.querySelectorAll('#design-tab textarea, #element-editor textarea').length,
                    selects: document.querySelectorAll('#design-tab select, #element-editor select').length,
                    buttons: document.querySelectorAll('#design-tab button, #element-editor button').length
                }
            };
            
            console.table(info);
            console.log('🛡️ Design Panel Protection Status:', info);
            
            return info;
        }
    }
    
    // Initialize the protection system
    const protection = new DesignPanelProtection();
    
    // Expose for debugging
    window.designPanelProtection = protection;
    
    // Add debug commands
    window.debugDesignProtection = () => protection.debug();
    window.reinforceDesignProtection = () => protection.reinforceProtection();
    
    logger.info('🛡️ Design Panel Protection: System ready');
    logger.info('Debug commands: debugDesignProtection(), reinforceDesignProtection()');
    
})();
