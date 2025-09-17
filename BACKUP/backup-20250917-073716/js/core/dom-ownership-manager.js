/**
 * DOM Ownership Manager
 * PHASE 4: Component Communication Redesign - Clear DOM Ownership
 * 
 * Enforces strict boundaries between preview and editor DOM elements
 * Prevents conflicts and ensures single ownership of each element
 * 
 * @version 1.0.0
 * @package GMKB/Core
 * 
 * ARCHITECTURAL PRINCIPLES:
 * - Each DOM element has exactly one owner
 * - Preview is read-only by default
 * - Editor owns all input elements
 * - Edit mode must be explicitly toggled
 * - No inline contenteditable by default
 */

(function(window) {
    'use strict';
    
    const logger = window.structuredLogger || console;
    
    /**
     * DOM Ownership Manager - Enforces ownership boundaries
     */
    class DOMOwnershipManager {
        constructor() {
            // Registry of element ownership
            this.ownership = new Map();
            
            // Ownership types
            this.OWNERSHIP_TYPES = {
                PREVIEW: 'preview',
                EDITOR: 'editor',
                SYSTEM: 'system',
                SHARED: 'shared' // For elements that need special handling
            };
            
            // Edit mode state
            this.editMode = {
                enabled: false,
                allowedComponents: new Set(),
                restrictions: {
                    preventInlineStyles: true,
                    preventContentEditable: true,
                    enforceDataAttributes: true
                }
            };
            
            // Violation tracking
            this.violations = [];
            this.violationHandlers = new Map();
            
            // Statistics
            this.stats = {
                elementsRegistered: 0,
                ownershipConflicts: 0,
                violationsDetected: 0,
                violationsCorrected: 0
            };
            
            // Initialize
            this.init();
        }
        
        /**
         * Initialize the DOM Ownership Manager
         */
        init() {
            // Set up mutation observer to detect ownership violations
            this.setupMutationObserver();
            
            // Listen for component lifecycle events
            this.attachLifecycleListeners();
            
            // Set up edit mode controls
            this.setupEditModeControls();
            
            // Perform initial scan
            this.scanAndEnforceOwnership();
            
            logger.info('DOM_OWNERSHIP', 'DOM Ownership Manager initialized');
        }
        
        /**
         * Register an element with ownership
         */
        registerElement(element, owner, type, metadata = {}) {
            if (!element || !owner) {
                logger.error('DOM_OWNERSHIP', 'Invalid registration parameters');
                return false;
            }
            
            // Check for existing ownership
            const existing = this.ownership.get(element);
            if (existing && existing.owner !== owner) {
                this.handleOwnershipConflict(element, existing, { owner, type });
                return false;
            }
            
            // Register ownership
            this.ownership.set(element, {
                owner,
                type,
                metadata,
                registeredAt: Date.now(),
                attributes: this.captureElementState(element)
            });
            
            // Mark element with ownership data
            element.dataset.domOwner = owner;
            element.dataset.domOwnershipType = type;
            
            // Apply ownership rules
            this.applyOwnershipRules(element, type);
            
            this.stats.elementsRegistered++;
            
            logger.debug('DOM_OWNERSHIP', `Registered ${element.tagName} to ${owner} as ${type}`);
            
            return true;
        }
        
        /**
         * Apply ownership rules to an element
         */
        applyOwnershipRules(element, type) {
            switch (type) {
                case this.OWNERSHIP_TYPES.PREVIEW:
                    this.applyPreviewRules(element);
                    break;
                    
                case this.OWNERSHIP_TYPES.EDITOR:
                    this.applyEditorRules(element);
                    break;
                    
                case this.OWNERSHIP_TYPES.SYSTEM:
                    this.applySystemRules(element);
                    break;
                    
                case this.OWNERSHIP_TYPES.SHARED:
                    this.applySharedRules(element);
                    break;
            }
        }
        
        /**
         * Apply preview ownership rules
         */
        applyPreviewRules(element) {
            // ROOT FIX: Don't apply user-select: none to component elements
            // This was causing the style to be set and then immediately flagged as a violation
            // Components should maintain their natural selection behavior
            
            // Preview elements are read-only by default
            if (this.editMode.restrictions.preventContentEditable && !this.isEditModeEnabled(element)) {
                // Remove contenteditable if present (unless it's an allowed element)
                const allowedEditableSelectors = [
                    '.topic-title',
                    '.section-title', 
                    '.biography-content p',
                    '.hero-title'
                ];
                
                const isAllowedEditable = allowedEditableSelectors.some(selector => 
                    element.matches(selector)
                );
                
                if (element.hasAttribute('contenteditable') && !isAllowedEditable) {
                    element.removeAttribute('contenteditable');
                    this.recordViolation('contenteditable-in-preview', element);
                }
                
                // ROOT FIX: Don't set user-select styles here - let CSS handle it
                // This prevents the circular problem of setting a style then flagging it
            }
            
            // Remove inline event handlers
            this.removeInlineEventHandlers(element);
            
            // Add preview class for styling
            element.classList.add('gmkb-ownership-preview');
        }
        
        /**
         * Apply editor ownership rules
         */
        applyEditorRules(element) {
            // Editor elements can be modified
            element.classList.add('gmkb-ownership-editor');
            
            // Ensure inputs are not disabled
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA' || element.tagName === 'SELECT') {
                if (element.disabled) {
                    logger.warn('DOM_OWNERSHIP', 'Editor input was disabled, enabling', element);
                    element.disabled = false;
                }
                
                // Ensure proper tabindex
                if (!element.hasAttribute('tabindex')) {
                    element.tabIndex = 0;
                }
            }
            
            // Prevent preview system from modifying
            element.dataset.protectedEditor = 'true';
        }
        
        /**
         * Apply system ownership rules
         */
        applySystemRules(element) {
            // System elements should not be modified by components
            element.classList.add('gmkb-ownership-system');
            element.dataset.systemProtected = 'true';
            
            // Make read-only
            if (element.tagName === 'INPUT' || element.tagName === 'TEXTAREA') {
                element.readOnly = true;
            }
        }
        
        /**
         * Apply shared ownership rules
         */
        applySharedRules(element) {
            // Shared elements need special handling
            element.classList.add('gmkb-ownership-shared');
            element.dataset.sharedOwnership = 'true';
            
            // These can be modified but with restrictions
            logger.info('DOM_OWNERSHIP', 'Shared ownership element registered', element);
        }
        
        /**
         * Setup mutation observer to detect violations
         */
        setupMutationObserver() {
            const observer = new MutationObserver((mutations) => {
                mutations.forEach(mutation => {
                    this.handleMutation(mutation);
                });
            });
            
            // Start observing
            observer.observe(document.body, {
                attributes: true,
                attributeFilter: ['contenteditable', 'style', 'onclick', 'onchange'],
                childList: true,
                subtree: true
            });
            
            this.mutationObserver = observer;
        }
        
        /**
         * Handle DOM mutations
         */
        handleMutation(mutation) {
            if (mutation.type === 'attributes') {
                const element = mutation.target;
                const ownership = this.ownership.get(element);
                
                if (ownership) {
                    // Check for violations
                    this.checkForViolations(element, ownership);
                }
            } else if (mutation.type === 'childList') {
                // Check new nodes for ownership violations
                mutation.addedNodes.forEach(node => {
                    if (node.nodeType === Node.ELEMENT_NODE) {
                        this.scanElementForViolations(node);
                    }
                });
            }
        }
        
        /**
         * Check element for ownership violations
         */
        checkForViolations(element, ownership) {
            const violations = [];
            
            // ROOT FIX: Allow contenteditable for specific component elements that need inline editing
            const allowedEditableSelectors = [
                '.topic-title',           // Topics component titles
                '.section-title',         // Section headers
                '.biography-content p',   // Biography text
                '.hero-title',           // Hero titles
                '[contenteditable="true"]' // Any explicitly marked editable
            ];
            
            // Check if element is allowed to have contenteditable
            const isAllowedEditable = allowedEditableSelectors.some(selector => 
                element.matches(selector)
            );
            
            // Check contenteditable violation - only if NOT allowed
            if (ownership.type === this.OWNERSHIP_TYPES.PREVIEW && 
                element.hasAttribute('contenteditable') && 
                !this.isEditModeEnabled(element) &&
                !isAllowedEditable) {
                violations.push({
                    type: 'contenteditable-violation',
                    element,
                    ownership
                });
            }
            
            // Check inline style violations (skip component controls)
            if (this.editMode.restrictions.preventInlineStyles && 
                element.hasAttribute('style') && 
                !element.classList.contains('component-controls') &&
                !element.classList.contains('component-controls--dynamic')) {
                const style = element.getAttribute('style');
                if (this.isProblematicStyle(style)) {
                    violations.push({
                        type: 'inline-style-violation',
                        element,
                        ownership,
                        style
                    });
                }
            }
            
            // Check inline event handler violations
            const inlineHandlers = this.detectInlineEventHandlers(element);
            if (inlineHandlers.length > 0) {
                violations.push({
                    type: 'inline-handler-violation',
                    element,
                    ownership,
                    handlers: inlineHandlers
                });
            }
            
            // Process violations
            violations.forEach(violation => {
                this.handleViolation(violation);
            });
        }
        
        /**
         * Handle ownership violation
         */
        handleViolation(violation) {
            this.stats.violationsDetected++;
            this.violations.push(violation);
            
            logger.warn('DOM_OWNERSHIP', `Violation detected: ${violation.type}`, violation);
            
            // Attempt to correct violation
            if (this.correctViolation(violation)) {
                this.stats.violationsCorrected++;
                logger.info('DOM_OWNERSHIP', `Violation corrected: ${violation.type}`);
            }
            
            // Call custom handlers if registered
            const handler = this.violationHandlers.get(violation.type);
            if (handler) {
                handler(violation);
            }
            
            // Dispatch violation event
            document.dispatchEvent(new CustomEvent('dom-ownership:violation', {
                detail: violation
            }));
        }
        
        /**
         * Correct a violation
         */
        correctViolation(violation) {
            switch (violation.type) {
                case 'contenteditable-violation':
                    violation.element.removeAttribute('contenteditable');
                    return true;
                    
                case 'inline-style-violation':
                    // Remove problematic styles
                    const cleanedStyle = this.cleanInlineStyles(violation.style);
                    if (cleanedStyle) {
                        violation.element.setAttribute('style', cleanedStyle);
                    } else {
                        violation.element.removeAttribute('style');
                    }
                    return true;
                    
                case 'inline-handler-violation':
                    // Remove inline event handlers
                    violation.handlers.forEach(handler => {
                        violation.element.removeAttribute(handler);
                    });
                    return true;
                    
                default:
                    return false;
            }
        }
        
        /**
         * Handle ownership conflict
         */
        handleOwnershipConflict(element, existing, attempted) {
            this.stats.ownershipConflicts++;
            
            logger.error('DOM_OWNERSHIP', 'Ownership conflict detected', {
                element,
                existing: existing.owner,
                attempted: attempted.owner
            });
            
            // Dispatch conflict event
            document.dispatchEvent(new CustomEvent('dom-ownership:conflict', {
                detail: {
                    element,
                    existingOwner: existing.owner,
                    attemptedOwner: attempted.owner
                }
            }));
        }
        
        /**
         * Enable edit mode for specific components
         */
        enableEditMode(componentIds = [], options = {}) {
            this.editMode.enabled = true;
            
            if (Array.isArray(componentIds)) {
                componentIds.forEach(id => this.editMode.allowedComponents.add(id));
            }
            
            // Update restrictions if provided
            if (options.restrictions) {
                Object.assign(this.editMode.restrictions, options.restrictions);
            }
            
            // Apply edit mode to allowed components
            this.applyEditMode();
            
            logger.info('DOM_OWNERSHIP', 'Edit mode enabled', {
                components: componentIds,
                restrictions: this.editMode.restrictions
            });
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('dom-ownership:edit-mode-changed', {
                detail: { enabled: true, componentIds }
            }));
        }
        
        /**
         * Disable edit mode
         */
        disableEditMode() {
            this.editMode.enabled = false;
            this.editMode.allowedComponents.clear();
            
            // Remove edit mode from all elements
            this.removeEditMode();
            
            logger.info('DOM_OWNERSHIP', 'Edit mode disabled');
            
            // Dispatch event
            document.dispatchEvent(new CustomEvent('dom-ownership:edit-mode-changed', {
                detail: { enabled: false }
            }));
        }
        
        /**
         * Apply edit mode to allowed elements
         */
        applyEditMode() {
            this.ownership.forEach((ownership, element) => {
                if (ownership.type === this.OWNERSHIP_TYPES.PREVIEW && 
                    this.isEditModeEnabled(element)) {
                    // Allow editing
                    element.style.userSelect = 'text';
                    element.style.webkitUserSelect = 'text';
                    element.classList.add('gmkb-edit-mode-enabled');
                    
                    // Allow contenteditable if restrictions permit
                    if (!this.editMode.restrictions.preventContentEditable) {
                        element.setAttribute('contenteditable', 'true');
                    }
                }
            });
        }
        
        /**
         * Remove edit mode from all elements
         */
        removeEditMode() {
            document.querySelectorAll('.gmkb-edit-mode-enabled').forEach(element => {
                element.style.userSelect = 'none';
                element.style.webkitUserSelect = 'none';
                element.classList.remove('gmkb-edit-mode-enabled');
                element.removeAttribute('contenteditable');
            });
        }
        
        /**
         * Check if edit mode is enabled for an element
         */
        isEditModeEnabled(element) {
            if (!this.editMode.enabled) return false;
            
            // Check if element belongs to an allowed component
            const componentId = element.closest('[data-component-id]')?.dataset.componentId;
            
            return !componentId || this.editMode.allowedComponents.size === 0 || 
                   this.editMode.allowedComponents.has(componentId);
        }
        
        /**
         * Scan and enforce ownership on existing DOM
         */
        scanAndEnforceOwnership() {
            logger.info('DOM_OWNERSHIP', 'Scanning DOM for ownership enforcement');
            
            // Scan preview elements
            document.querySelectorAll('[data-component-id]').forEach(element => {
                if (!this.ownership.has(element)) {
                    this.registerElement(element, 'preview-system', this.OWNERSHIP_TYPES.PREVIEW);
                }
                
                // Scan children
                element.querySelectorAll('*').forEach(child => {
                    if (!this.ownership.has(child)) {
                        this.registerElement(child, `preview-${element.dataset.componentId}`, 
                                           this.OWNERSHIP_TYPES.PREVIEW);
                    }
                });
            });
            
            // Scan editor elements
            document.querySelectorAll('#custom-content-editor, .component-options, .design-panel').forEach(container => {
                container.querySelectorAll('input, textarea, select, button').forEach(input => {
                    if (!this.ownership.has(input)) {
                        this.registerElement(input, 'editor-system', this.OWNERSHIP_TYPES.EDITOR);
                    }
                });
            });
            
            // Scan system elements
            document.querySelectorAll('.gmkb-toolbar, .gmkb-tabs, .gmkb-modal').forEach(element => {
                if (!this.ownership.has(element)) {
                    this.registerElement(element, 'system', this.OWNERSHIP_TYPES.SYSTEM);
                }
            });
        }
        
        /**
         * Scan element for violations
         */
        scanElementForViolations(element) {
            // Check if element violates ownership rules
            const ownership = this.getInferredOwnership(element);
            
            if (ownership) {
                this.checkForViolations(element, ownership);
            }
            
            // Scan children
            if (element.children) {
                Array.from(element.children).forEach(child => {
                    this.scanElementForViolations(child);
                });
            }
        }
        
        /**
         * Get inferred ownership for an element
         */
        getInferredOwnership(element) {
            // Check if already registered
            if (this.ownership.has(element)) {
                return this.ownership.get(element);
            }
            
            // Infer from parent or context
            const componentElement = element.closest('[data-component-id]');
            if (componentElement) {
                return {
                    type: this.OWNERSHIP_TYPES.PREVIEW,
                    owner: `component-${componentElement.dataset.componentId}`
                };
            }
            
            const editorElement = element.closest('#custom-content-editor, .component-options, .design-panel');
            if (editorElement) {
                return {
                    type: this.OWNERSHIP_TYPES.EDITOR,
                    owner: 'editor-system'
                };
            }
            
            return null;
        }
        
        /**
         * Capture element state
         */
        captureElementState(element) {
            return {
                tagName: element.tagName,
                id: element.id,
                className: element.className,
                contentEditable: element.contentEditable,
                hasInlineHandlers: this.detectInlineEventHandlers(element).length > 0,
                hasInlineStyles: element.hasAttribute('style')
            };
        }
        
        /**
         * Detect inline event handlers
         */
        detectInlineEventHandlers(element) {
            const handlers = [];
            
            // Check for common inline handlers
            const handlerAttributes = ['onclick', 'onchange', 'oninput', 'onblur', 'onfocus', 
                                      'onkeydown', 'onkeyup', 'onmouseenter', 'onmouseleave'];
            
            handlerAttributes.forEach(attr => {
                if (element.hasAttribute(attr)) {
                    handlers.push(attr);
                }
            });
            
            return handlers;
        }
        
        /**
         * Remove inline event handlers
         */
        removeInlineEventHandlers(element) {
            const handlers = this.detectInlineEventHandlers(element);
            handlers.forEach(handler => {
                element.removeAttribute(handler);
                logger.debug('DOM_OWNERSHIP', `Removed inline handler: ${handler}`);
            });
        }
        
        /**
         * Check if style is problematic
         */
        isProblematicStyle(style) {
            // ROOT FIX: Don't flag user-select styles that we set ourselves
            // The DOM Ownership Manager sets user-select: none on preview elements
            // and then incorrectly flags it as a violation. This is a false positive.
            
            // Only check for truly problematic styles
            const problematic = [
                'pointer-events: none',  // Only problematic if set to none by others
                'contenteditable'        // Should not be in styles
            ];
            
            // Ignore component control styles
            if (style.includes('component-controls')) {
                return false;
            }
            
            // ROOT FIX: Don't flag user-select styles as violations
            // These are intentionally set by the ownership manager
            if (style === 'user-select: none;' || style === 'user-select: none' ||
                style.match(/^user-select:\s*none;?$/)) {
                return false;
            }
            
            return problematic.some(prop => style.includes(prop));
        }
        
        /**
         * Clean inline styles
         */
        cleanInlineStyles(style) {
            // Remove problematic style properties
            const cleaned = style.replace(/pointer-events\s*:\s*[^;]+;?/gi, '')
                                .replace(/user-select\s*:\s*[^;]+;?/gi, '')
                                .replace(/-webkit-user-select\s*:\s*[^;]+;?/gi, '');
            
            return cleaned.trim();
        }
        
        /**
         * Attach lifecycle listeners
         */
        attachLifecycleListeners() {
            // Listen for component lifecycle events
            document.addEventListener('component:dom-ready', (event) => {
                const { container } = event.detail;
                if (container) {
                    this.registerElement(container, `component-${event.detail.componentId}`, 
                                       this.OWNERSHIP_TYPES.PREVIEW);
                }
            });
            
            document.addEventListener('component:editor-ready', (event) => {
                const { container } = event.detail;
                if (container) {
                    container.querySelectorAll('input, textarea, select').forEach(input => {
                        this.registerElement(input, `editor-${event.detail.componentId}`, 
                                           this.OWNERSHIP_TYPES.EDITOR);
                    });
                }
            });
            
            document.addEventListener('component:destroyed', (event) => {
                // Clean up ownership records
                this.cleanupComponentOwnership(event.detail.componentId);
            });
        }
        
        /**
         * Clean up component ownership
         */
        cleanupComponentOwnership(componentId) {
            const toRemove = [];
            
            this.ownership.forEach((ownership, element) => {
                if (ownership.owner.includes(componentId)) {
                    toRemove.push(element);
                }
            });
            
            toRemove.forEach(element => {
                this.ownership.delete(element);
                delete element.dataset.domOwner;
                delete element.dataset.domOwnershipType;
                element.classList.remove('gmkb-ownership-preview', 'gmkb-ownership-editor', 
                                        'gmkb-ownership-system', 'gmkb-ownership-shared');
            });
            
            logger.debug('DOM_OWNERSHIP', `Cleaned up ownership for component ${componentId}`);
        }
        
        /**
         * Setup edit mode controls
         */
        setupEditModeControls() {
            // Listen for edit mode requests
            document.addEventListener('gmkb:request-edit-mode', (event) => {
                const { componentIds, enabled } = event.detail;
                
                if (enabled) {
                    this.enableEditMode(componentIds);
                } else {
                    this.disableEditMode();
                }
            });
        }
        
        /**
         * Record a violation
         */
        recordViolation(type, element) {
            this.violations.push({
                type,
                element,
                timestamp: Date.now()
            });
            
            // Keep only last 100 violations
            if (this.violations.length > 100) {
                this.violations = this.violations.slice(-100);
            }
        }
        
        /**
         * Register a violation handler
         */
        registerViolationHandler(type, handler) {
            this.violationHandlers.set(type, handler);
        }
        
        /**
         * Get ownership statistics
         */
        getStats() {
            const stats = { ...this.stats };
            
            // Count by ownership type
            stats.byType = {};
            this.ownership.forEach(ownership => {
                stats.byType[ownership.type] = (stats.byType[ownership.type] || 0) + 1;
            });
            
            // Recent violations
            stats.recentViolations = this.violations.slice(-10);
            
            return stats;
        }
        
        /**
         * Debug ownership status
         */
        debug() {
            const stats = this.getStats();
            
            console.group('%c🔒 DOM Ownership Status', 'font-size: 14px; font-weight: bold; color: #9C27B0');
            console.log('Elements Registered:', stats.elementsRegistered);
            console.log('Ownership by Type:', stats.byType);
            console.log('Edit Mode:', this.editMode.enabled);
            console.log('Allowed Components:', Array.from(this.editMode.allowedComponents));
            console.log('Violations Detected:', stats.violationsDetected);
            console.log('Violations Corrected:', stats.violationsCorrected);
            console.log('Conflicts:', stats.ownershipConflicts);
            
            if (stats.recentViolations.length > 0) {
                console.group('Recent Violations:');
                stats.recentViolations.forEach(v => {
                    console.log(`${v.type} at ${new Date(v.timestamp).toLocaleTimeString()}`);
                });
                console.groupEnd();
            }
            
            console.groupEnd();
        }
    }
    
    // Create global instance
    window.domOwnershipManager = new DOMOwnershipManager();
    
    // Export class for testing
    window.DOMOwnershipManager = DOMOwnershipManager;
    
    // Console commands
    window.enforceOwnership = () => window.domOwnershipManager.scanAndEnforceOwnership();
    window.domOwnershipStatus = () => window.domOwnershipManager.debug();
    window.enableDOMEditMode = (componentIds) => window.domOwnershipManager.enableEditMode(componentIds);
    window.disableDOMEditMode = () => window.domOwnershipManager.disableEditMode();
    
    logger.info('DOM_OWNERSHIP', 'DOM Ownership Manager loaded');
    logger.info('DOM_OWNERSHIP', 'Commands: enforceOwnership(), domOwnershipStatus(), enableDOMEditMode([ids]), disableDOMEditMode()');
    
})(window);
