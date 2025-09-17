/**
 * Architecture Validator
 * Detects and reports architecture violations in real-time
 * 
 * @since 2.1.0
 */
(function() {
    'use strict';

    class ArchitectureValidator {
        constructor() {
            this.violations = [];
            this.strictMode = false;
            this.logger = window.structuredLogger || console;
            this.monitoringEnabled = false;
            this.allowedCallers = new Set([
                'IDGenerator',
                'gmkbIDGenerator',
                'EnhancedComponentManager',
                'SectionLayoutManager',
                'EnhancedStateManager'
            ]);
        }

        /**
         * Enable strict mode (violations throw errors)
         */
        enableStrictMode() {
            this.strictMode = true;
            this.logger.warn('VALIDATOR', 'Strict mode enabled - violations will throw errors');
        }

        /**
         * Disable strict mode
         */
        disableStrictMode() {
            this.strictMode = false;
            this.logger.info('VALIDATOR', 'Strict mode disabled');
        }

        /**
         * Validate ID generation
         */
        validateIDGeneration(caller, id) {
            // Check if this is a proper caller
            const stack = new Error().stack;
            const isAuthorized = this.allowedCallers.has(caller) || 
                               stack.includes('IDGenerator') ||
                               stack.includes('generateComponentId') ||
                               stack.includes('generateSectionId');
            
            if (!isAuthorized && id && id.includes(Date.now().toString().substr(0, 10))) {
                const violation = `Unauthorized ID generation detected in ${caller}. IDs should be generated through gmkbIDGenerator only.`;
                this.reportViolation(violation, 'id_generation');
            }
        }

        /**
         * Validate component creation
         */
        validateComponentCreation(caller) {
            const authorizedCreators = ['EnhancedComponentManager', 'enhancedComponentManager'];
            
            if (!authorizedCreators.includes(caller)) {
                const violation = `Unauthorized component creation in ${caller}. Components should only be created through EnhancedComponentManager.`;
                this.reportViolation(violation, 'component_creation');
            }
        }

        /**
         * Validate state access
         */
        validateStateAccess(caller, operation) {
            const authorizedWriters = ['EnhancedStateManager', 'enhancedStateManager'];
            
            if (operation === 'write' && !authorizedWriters.includes(caller)) {
                const violation = `Direct state mutation in ${caller}. State should only be modified through EnhancedStateManager.dispatch()`;
                this.reportViolation(violation, 'state_mutation');
            }
        }

        /**
         * Validate DOM manipulation
         */
        validateDOMManipulation(caller, operation) {
            const authorizedRenderers = [
                'EnhancedComponentRenderer',
                'SectionRenderer',
                'ComponentControlsManager'
            ];
            
            if (!authorizedRenderers.some(name => caller.includes(name))) {
                const violation = `Unauthorized DOM manipulation in ${caller}. DOM operations should be handled by authorized renderers only.`;
                this.reportViolation(violation, 'dom_manipulation');
            }
        }

        /**
         * Report a violation
         */
        reportViolation(message, type = 'general') {
            const violation = {
                message,
                type,
                timestamp: Date.now(),
                stack: new Error().stack
            };
            
            this.violations.push(violation);

            if (this.strictMode) {
                throw new Error(`[ARCHITECTURE VIOLATION] ${message}`);
            } else {
                this.logger.error('ARCHITECTURE WARNING', message);
                
                // Emit violation event for monitoring
                document.dispatchEvent(new CustomEvent('gmkb:architecture-violation', {
                    detail: violation
                }));
            }
        }

        /**
         * Get violation report
         */
        getReport() {
            const summary = {};
            this.violations.forEach(v => {
                summary[v.type] = (summary[v.type] || 0) + 1;
            });
            
            return {
                count: this.violations.length,
                summary: summary,
                violations: [...this.violations],
                strictMode: this.strictMode
            };
        }

        /**
         * Clear violations
         */
        clearViolations() {
            this.violations = [];
            this.logger.info('VALIDATOR', 'Violations cleared');
        }

        /**
         * Install global interceptors for monitoring
         */
        installInterceptors() {
            if (this.monitoringEnabled) {
                this.logger.warn('VALIDATOR', 'Interceptors already installed');
                return;
            }
            
            this.monitoringEnabled = true;
            
            // Monitor Date.now() usage for ID generation
            const originalDateNow = Date.now;
            const validator = this;
            
            Date.now = function() {
                const result = originalDateNow.call(this);
                const stack = new Error().stack;
                
                // Check if this is being used for ID generation
                if (stack.includes('generateComponentId') || 
                    stack.includes('generateSectionId') || 
                    stack.includes('-id') ||
                    stack.includes('_id')) {
                    
                    // Check if it's from an authorized source
                    if (!stack.includes('IDGenerator') && 
                        !stack.includes('gmkbIDGenerator')) {
                        validator.logger.warn('VALIDATOR', 'Potential unauthorized ID generation detected', {
                            stack: stack.split('\n').slice(2, 5).join('\n')
                        });
                    }
                }
                
                return result;
            };
            
            // Monitor createElement for component creation
            const originalCreateElement = document.createElement;
            document.createElement = function(tagName) {
                const stack = new Error().stack;
                
                if ((tagName === 'div' || tagName === 'section') && 
                    (stack.includes('component') || stack.includes('Component'))) {
                    
                    const caller = stack.split('\n')[2]?.trim() || 'unknown';
                    
                    if (!caller.includes('Renderer') && 
                        !caller.includes('renderer') &&
                        !caller.includes('Controls') &&
                        !caller.includes('authorized')) {
                        validator.logger.debug('VALIDATOR', `Possible unauthorized component DOM creation in: ${caller}`);
                    }
                }
                
                return originalCreateElement.call(this, tagName);
            };
            
            this.logger.info('VALIDATOR', 'Architecture interceptors installed');
        }

        /**
         * Uninstall interceptors
         */
        uninstallInterceptors() {
            // Note: This is difficult to do cleanly with the current approach
            // In production, interceptors should be more sophisticated
            this.monitoringEnabled = false;
            this.logger.info('VALIDATOR', 'Interceptors disabled (partial - requires page reload for full removal)');
        }

        /**
         * Run architecture compliance tests
         */
        runComplianceTests() {
            const tests = [];
            
            // Test 1: ID Generation
            tests.push({
                name: 'ID Generation',
                passed: window.gmkbIDGenerator && typeof window.gmkbIDGenerator.generateComponentId === 'function',
                message: window.gmkbIDGenerator ? 'Central ID generator available' : 'Central ID generator NOT found'
            });
            
            // Test 2: Component Manager
            tests.push({
                name: 'Component Manager',
                passed: window.enhancedComponentManager && typeof window.enhancedComponentManager.createComponent === 'function',
                message: window.enhancedComponentManager ? 'Component manager available' : 'Component manager NOT found'
            });
            
            // Test 3: State Manager
            tests.push({
                name: 'State Manager',
                passed: window.enhancedStateManager && typeof window.enhancedStateManager.dispatch === 'function',
                message: window.enhancedStateManager ? 'State manager available' : 'State manager NOT found'
            });
            
            // Test 4: No duplicate components in DOM
            const componentElements = document.querySelectorAll('[data-component-id]');
            const componentIds = Array.from(componentElements).map(el => el.dataset.componentId);
            const duplicates = componentIds.filter((id, index) => componentIds.indexOf(id) !== index);
            
            tests.push({
                name: 'No Duplicate Components',
                passed: duplicates.length === 0,
                message: duplicates.length === 0 ? 'No duplicate components found' : `Found ${duplicates.length} duplicate components: ${duplicates.join(', ')}`
            });
            
            // Test 5: Check for violations
            tests.push({
                name: 'No Architecture Violations',
                passed: this.violations.length === 0,
                message: this.violations.length === 0 ? 'No violations detected' : `${this.violations.length} violations detected`
            });
            
            // Summary
            const allPassed = tests.every(t => t.passed);
            
            console.log('=== ARCHITECTURE COMPLIANCE TEST RESULTS ===');
            tests.forEach(test => {
                const icon = test.passed ? '✅' : '❌';
                console.log(`${icon} ${test.name}: ${test.message}`);
            });
            console.log('==========================================');
            console.log(allPassed ? '✅ ALL TESTS PASSED' : '❌ SOME TESTS FAILED');
            
            return {
                allPassed,
                tests,
                violations: this.getReport()
            };
        }
    }

    // Create global instance
    window.architectureValidator = new ArchitectureValidator();

    // Enable in debug mode
    if (window.gmkbData?.debugMode) {
        window.architectureValidator.installInterceptors();
        console.log('Architecture Validator: Initialized and monitoring enabled');
        
        // Add console commands
        window.gmkbValidate = () => window.architectureValidator.runComplianceTests();
        window.gmkbViolations = () => window.architectureValidator.getReport();
        window.gmkbStrictMode = (enable) => {
            if (enable) {
                window.architectureValidator.enableStrictMode();
            } else {
                window.architectureValidator.disableStrictMode();
            }
        };
        
        console.log('Architecture Validator Commands:');
        console.log('  gmkbValidate() - Run compliance tests');
        console.log('  gmkbViolations() - Get violation report');
        console.log('  gmkbStrictMode(true/false) - Enable/disable strict mode');
    }

})();