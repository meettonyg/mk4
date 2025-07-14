/**
 * @file wordpress-coordinator.js
 * @description WordPress Compatibility and Script Loading Coordination
 * 
 * ROOT FIX: All WordPress-specific coordination, script loading validation,
 * and compatibility layers extracted from main.js to keep it simple.
 */

/**
 * WordPress Coordinator - Handles all WordPress integration and compatibility
 */
export class WordPressCoordinator {
    constructor() {
        this.initialized = false;
        this.wordPressData = null;
        this.scriptsValidated = false;
        this.isolationActive = false;
        
        console.log('🔌 WordPress Coordinator: Initialized');
    }

    /**
     * Initialize WordPress coordination
     */
    async init() {
        console.log('🚀 WordPress Coordinator: Starting WordPress integration...');
        
        try {
            await this.validateWordPressEnvironment();
            await this.validateScriptLoading();
            await this.setupIsolation();
            await this.coordinated);
            
            this.initialized = true;
            console.log('✅ WordPress Coordinator: Integration complete');
            
        } catch (error) {
            console.error('❌ WordPress Coordinator initialization failed:', error);
            throw error;
        }
    }

    /**
     * Validate WordPress environment and data
     */
    async validateWordPressEnvironment() {
        console.log('🔍 Validating WordPress environment...');
        
        // Wait for guestifyData to be available
        const maxWait = 3000;
        const startTime = Date.now();
        
        while (!window.guestifyData && (Date.now() - startTime) < maxWait) {
            await new Promise(resolve => setTimeout(resolve, 50));
        }
        
        if (!window.guestifyData) {
            throw new Error('WordPress guestifyData not available - check script enqueuing');
        }
        
        // Validate required properties
        const required = ['pluginUrl', 'ajaxUrl', 'nonce'];
        const missing = required.filter(prop => !window.guestifyData[prop]);
        
        if (missing.length > 0) {
            throw new Error(`Missing required WordPress data: ${missing.join(', ')}`);
        }
        
        this.wordPressData = window.guestifyData;
        
        // Set global plugin URL for compatibility
        window.GUESTIFY_PLUGIN_URL = this.wordPressData.pluginUrl;
        
        console.log('✅ WordPress environment validated');
        console.log('📊 WordPress data:', {
            pluginUrl: !!this.wordPressData.pluginUrl,
            ajaxUrl: !!this.wordPressData.ajaxUrl,
            nonce: !!this.wordPressData.nonce,
            additionalProps: Object.keys(this.wordPressData).length
        });
    }

    /**
     * Validate WordPress script loading
     */
    async validateScriptLoading() {
        console.log('🔍 Validating WordPress script loading...');
        
        const validation = {
            guestifyData: {
                available: !!window.guestifyData,
                hasRequiredProps: !!(window.guestifyData?.pluginUrl && 
                                   window.guestifyData?.ajaxUrl && 
                                   window.guestifyData?.nonce)
            },
            sortableJS: {
                available: !!(window.Sortable || (typeof Sortable !== 'undefined'))
            },
            dependencies: {
                jQuery: !!window.jQuery,
                jQueryConflict: false // Will check for conflicts
            }
        };
        
        // Check for jQuery conflicts
        if (window.jQuery && window.$) {
            try {
                const jQueryVersion = window.jQuery.fn.jquery;
                validation.dependencies.jQueryVersion = jQueryVersion;
            } catch (error) {
                validation.dependencies.jQueryConflict = true;
            }
        }
        
        console.log('📊 Script loading validation:', validation);
        
        if (!validation.guestifyData.available) {
            throw new Error('guestifyData validation failed');
        }
        
        if (!validation.sortableJS.available) {
            console.warn('⚠️ SortableJS not available - drag and drop will be disabled');
        }
        
        this.scriptsValidated = true;
        console.log('✅ WordPress script loading validated');
    }

    /**
     * Set up plugin isolation to prevent conflicts
     */
    async setupIsolation() {
        console.log('🛡️ Setting up plugin isolation...');
        
        try {
            // Isolate from common problematic plugins
            this.isolateFromProblematicPlugins();
            
            // Set up CSS isolation
            this.setupCSSIsolation();
            
            // Set up JavaScript isolation
            this.setupJavaScriptIsolation();
            
            this.isolationActive = true;
            console.log('✅ Plugin isolation active');
            
        } catch (error) {
            console.warn('⚠️ Plugin isolation setup failed:', error);
            // Non-fatal - continue without isolation
        }
    }

    /**
     * Isolate from known problematic plugins
     */
    isolateFromProblematicPlugins() {
        const problematicSelectors = [
            // LearnPress plugin interference
            '.learnpress-script',
            '[src*="learnpress"]',
            // Formidable Forms interference
            '.frm-script',
            '[src*="formidable"]',
            // Elementor interference
            '.elementor-script',
            '[src*="elementor"]',
            // WordPress emoji scripts
            '[src*="emoji"]'
        ];
        
        let blockedCount = 0;
        
        problematicSelectors.forEach(selector => {
            const elements = document.querySelectorAll(selector);
            elements.forEach(element => {
                // Don't completely remove, just disable on Media Kit pages
                if (this.isMediaKitPage()) {
                    element.style.display = 'none';
                    blockedCount++;
                }
            });
        });
        
        if (blockedCount > 0) {
            console.log(`🛡️ Isolated from ${blockedCount} problematic elements`);
        }
    }

    /**
     * Set up CSS isolation
     */
    setupCSSIsolation() {
        // Add CSS isolation class to body
        if (this.isMediaKitPage()) {
            document.body.classList.add('gmkb-isolated-page');
            
            // Add isolation styles
            const isolationCSS = `
                .gmkb-isolated-page .learnpress-widget,
                .gmkb-isolated-page .frm-form-widget,
                .gmkb-isolated-page .elementor-widget {
                    display: none !important;
                }
                
                .gmkb-isolated-page .media-kit-builder {
                    position: relative;
                    z-index: 1000;
                }
            `;
            
            const style = document.createElement('style');
            style.textContent = isolationCSS;
            document.head.appendChild(style);
        }
    }

    /**
     * Set up JavaScript isolation
     */
    setupJavaScriptIsolation() {
        // Create isolated namespace
        if (!window.GMKB_ISOLATED) {
            window.GMKB_ISOLATED = {
                version: this.wordPressData?.pluginVersion || '1.0.0',
                initialized: Date.now(),
                coordinator: this
            };
        }
        
        // Prevent global namespace pollution
        this.setupNamespaceProtection();
    }

    /**
     * Set up namespace protection
     */
    setupNamespaceProtection() {
        const protectedFunctions = [
            'MediaKitBuilder',
            'RaceConditionManager',
            'systemRegistrar',
            'enhancedComponentManager',
            'enhancedStateManager'
        ];
        
        protectedFunctions.forEach(funcName => {
            if (window[funcName]) {
                // Mark as protected
                if (typeof window[funcName] === 'object') {
                    window[funcName]._gmkbProtected = true;
                }
            }
        });
    }

    /**
     * Set up WordPress event coordination
     */
    async setupWordPressEventCoordination() {
        console.log('🎧 Setting up WordPress event coordination...');
        
        // Listen for WordPress events
        document.addEventListener('DOMContentLoaded', () => {
            this.handleWordPressDOMReady();
        });
        
        // Listen for WordPress admin events
        if (window.wp && window.wp.hooks) {
            window.wp.hooks.addAction('wp.loaded', 'guestify-media-kit', () => {
                this.handleWordPressLoaded();
            });
        }
        
        // Custom WordPress coordination events
        document.addEventListener('wordPressSystemsReady', (event) => {
            console.log('📢 WordPress systems ready:', event.detail);
            this.handleWordPressSystemsReady(event.detail);
        });
        
        console.log('✅ WordPress event coordination ready');
    }

    /**
     * Handle WordPress DOM ready
     */
    handleWordPressDOMReady() {
        console.log('📢 WordPress DOM ready');
        
        // Dispatch custom event for Media Kit systems
        document.dispatchEvent(new CustomEvent('wordPressDOMReady', {
            detail: {
                coordinator: this,
                timestamp: Date.now(),
                wordPressData: this.wordPressData
            }
        }));
    }

    /**
     * Handle WordPress loaded
     */
    handleWordPressLoaded() {
        console.log('📢 WordPress fully loaded');
        
        // Final WordPress validation
        this.validateWordPressIntegration();
        
        // Dispatch WordPress systems ready event
        document.dispatchEvent(new CustomEvent('wordPressSystemsReady', {
            detail: {
                coordinator: this,
                timestamp: Date.now(),
                validated: true
            }
        }));
    }

    /**
     * Handle WordPress systems ready
     */
    handleWordPressSystemsReady(detail) {
        console.log('📢 Handling WordPress systems ready:', detail);
        
        // Trigger Media Kit initialization if not already started
        if (!this.mediaKitInitialized) {
            this.triggerMediaKitInitialization();
        }
    }

    /**
     * Trigger Media Kit initialization
     */
    triggerMediaKitInitialization() {
        console.log('🚀 Triggering Media Kit initialization...');
        
        // Dispatch event for main application
        document.dispatchEvent(new CustomEvent('triggerMediaKitInit', {
            detail: {
                wordPressReady: true,
                coordinator: this,
                timestamp: Date.now()
            }
        }));
        
        this.mediaKitInitialized = true;
    }

    /**
     * Validate WordPress integration
     */
    validateWordPressIntegration() {
        console.log('🔍 Final WordPress integration validation...');
        
        const validation = {
            environment: !!this.wordPressData,
            scripts: this.scriptsValidated,
            isolation: this.isolationActive,
            coordinator: this.initialized,
            mediaKitPage: this.isMediaKitPage()
        };
        
        console.log('📊 WordPress integration validation:', validation);
        
        const allValid = Object.values(validation).every(Boolean);
        
        if (allValid) {
            console.log('✅ WordPress integration fully validated');
        } else {
            console.warn('⚠️ Some WordPress integration issues detected:', validation);
        }
        
        return validation;
    }

    /**
     * Check if current page is a Media Kit page
     */
    isMediaKitPage() {
        // Check body classes
        const bodyClasses = document.body.className;
        if (bodyClasses.includes('media-kit-builder') || 
            bodyClasses.includes('gmkb-page')) {
            return true;
        }
        
        // Check URL
        const url = window.location.href;
        if (url.includes('media-kit') || 
            url.includes('guestify')) {
            return true;
        }
        
        // Check for Media Kit elements
        const mediaKitElements = document.querySelectorAll(
            '.media-kit-builder, #media-kit-preview, .media-kit__components'
        );
        
        return mediaKitElements.length > 0;
    }

    /**
     * Get WordPress data
     */
    getWordPressData() {
        return this.wordPressData;
    }

    /**
     * Get coordinator status
     */
    getStatus() {
        return {
            initialized: this.initialized,
            wordPressData: !!this.wordPressData,
            scriptsValidated: this.scriptsValidated,
            isolationActive: this.isolationActive,
            mediaKitPage: this.isMediaKitPage(),
            timestamp: Date.now()
        };
    }

    /**
     * WordPress compatibility diagnostic
     */
    diagnoseWordPressCompatibility() {
        console.group('🔍 WordPress Compatibility Diagnostic');
        
        const diagnostic = {
            environment: {
                isWordPress: !!window.wp,
                guestifyData: !!window.guestifyData,
                adminAjax: !!window.ajaxurl,
                wpNonce: !!this.wordPressData?.nonce
            },
            scripts: {
                jQuery: !!window.jQuery,
                jQueryVersion: window.jQuery?.fn?.jquery || 'not available',
                sortable: !!window.Sortable,
                customScripts: this.scriptsValidated
            },
            isolation: {
                active: this.isolationActive,
                bodyClasses: document.body.className,
                protectedNamespace: !!window.GMKB_ISOLATED
            },
            coordination: {
                initialized: this.initialized,
                mediaKitPage: this.isMediaKitPage(),
                eventsReady: true
            }
        };
        
        console.table(diagnostic.environment);
        console.table(diagnostic.scripts);
        console.table(diagnostic.isolation);
        console.table(diagnostic.coordination);
        
        const issues = [];
        
        if (!diagnostic.environment.guestifyData) {
            issues.push('guestifyData not available');
        }
        
        if (!diagnostic.scripts.sortable) {
            issues.push('SortableJS not available');
        }
        
        if (!diagnostic.coordination.mediaKitPage) {
            issues.push('Not detected as Media Kit page');
        }
        
        if (issues.length === 0) {
            console.log('🎉 WordPress compatibility: ALL CHECKS PASSED!');
        } else {
            console.warn('⚠️ WordPress compatibility issues:', issues);
        }
        
        console.groupEnd();
        return diagnostic;
    }
}

// Export for use
export default WordPressCoordinator;

// Make available globally for diagnostic use
window.WordPressCoordinator = WordPressCoordinator;

console.log('📦 WordPress Coordinator: Class loaded and ready');
