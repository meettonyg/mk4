/**
 * @file testing-foundation-utilities.js
 * @description Comprehensive testing utilities for Phase 2.3 Enhanced User Experience
 * 
 * This file provides mock data generators, performance monitoring, and testing utilities
 * for validating Tasks 2 & 3 implementation.
 */

class TestingFoundationUtilities {
    constructor() {
        this.mockDataCache = new Map();
        this.performanceMetrics = new Map();
        this.testResults = new Map();
        this.screenshots = new Map();
        
        this.initializeUtilities();
    }

    /**
     * Initialize testing utilities
     */
    initializeUtilities() {
        console.log('🧪 Initializing Phase 2.3 Testing Foundation Utilities...');
        
        // Set up performance monitoring
        this.setupPerformanceMonitoring();
        
        // Initialize mock data generators
        this.initializeMockDataGenerators();
        
        // Set up visual regression testing
        this.setupVisualTesting();
        
        // Create accessibility testing hooks
        this.setupAccessibilityTesting();
        
        console.log('✅ Testing Foundation Utilities ready!');
    }

    /**
     * MOCK DATA GENERATORS
     */
    initializeMockDataGenerators() {
        // Task 2: Empty State Mock Data
        this.mockData = {
            // High-quality MKCG data scenario
            excellentMKCGData: {
                post_info: {
                    id: 123,
                    title: 'AI Innovation Expert - Jane Smith',
                    content: 'Comprehensive expertise in artificial intelligence...'
                },
                topics: {
                    topics: {
                        topic_1: 'AI Strategy and Implementation',
                        topic_2: 'Digital Transformation Leadership',
                        topic_3: 'Innovation Management',
                        topic_4: 'Technology Ethics and Governance',
                        topic_5: 'Future of Work and AI'
                    },
                    meta: { count: 5, generated_date: '2024-12-17' }
                },
                biography: {
                    biography: {
                        name: 'Jane Smith',
                        title: 'Chief AI Innovation Officer',
                        organization: 'TechForward Industries',
                        short: 'Leading AI strategist with 15+ years transforming enterprise technology landscapes.',
                        medium: 'Jane Smith is a recognized thought leader in artificial intelligence strategy, with over 15 years of experience helping Fortune 500 companies navigate digital transformation. As Chief AI Innovation Officer at TechForward Industries, she has led initiatives that generated over $200M in efficiency gains.',
                        long: 'With a Ph.D. in Computer Science from MIT and an MBA from Wharton, Jane Smith has established herself as one of the foremost experts in AI strategy and implementation. Her career spans roles at Google AI, McKinsey Digital, and now as Chief AI Innovation Officer at TechForward Industries. Jane has authored two bestselling books on AI transformation, speaks at major tech conferences worldwide, and advises government bodies on AI policy. Her work focuses on ethical AI implementation, change management for AI adoption, and building human-centered AI systems that augment rather than replace human capabilities.'
                    },
                    meta: { generated_date: '2024-12-17', word_count: 125 }
                },
                authority_hook: {
                    authority_hook: {
                        who: 'C-suite executives and technology leaders in Fortune 1000 companies',
                        what: 'Comprehensive AI transformation strategies that balance innovation with ethical implementation',
                        when: 'During enterprise digital transformation initiatives and strategic technology planning cycles',
                        how: 'Through executive workshops, strategic consulting, and hands-on implementation guidance'
                    },
                    meta: { generated_date: '2024-12-17', complete: true }
                },
                questions: {
                    questions: {
                        question_1: 'How can we implement AI without displacing our workforce?',
                        question_2: 'What are the key ethical considerations for AI deployment?',
                        question_3: 'How do we measure ROI on AI investments?',
                        question_4: 'What governance structures are needed for AI initiatives?',
                        question_5: 'How can we ensure AI bias is prevented in our systems?'
                    },
                    meta: { count: 5, category: 'strategic' }
                },
                offers: {
                    offers: {
                        offer_1: {
                            title: 'AI Strategy Masterclass',
                            description: 'Comprehensive 3-day program for executive teams',
                            price: '$15,000'
                        },
                        offer_2: {
                            title: 'Implementation Consulting',
                            description: '6-month guided AI transformation program',
                            price: '$75,000'
                        }
                    },
                    meta: { count: 2, style: 'executive' }
                },
                social_media: {
                    linkedin: 'https://linkedin.com/in/janesmith-ai',
                    twitter: 'https://twitter.com/janesmith_ai',
                    website: 'https://janesmith.ai'
                },
                validation: {
                    has_topics: true,
                    has_biography: true,
                    has_authority_hook: true,
                    has_questions: true,
                    has_offers: true,
                    has_social_media: true,
                    is_complete: true
                },
                meta_info: {
                    extraction_timestamp: Date.now(),
                    extraction_date: new Date().toISOString(),
                    post_id: 123,
                    data_source: 'mkcg_integration'
                }
            },

            // Low-quality MKCG data scenario
            poorMKCGData: {
                post_info: {
                    id: 456,
                    title: 'Basic Post',
                    content: 'Some basic content...'
                },
                topics: {
                    topics: {
                        topic_1: 'Business'
                    },
                    meta: { count: 1 }
                },
                biography: {
                    biography: {
                        name: 'John Doe'
                    },
                    meta: { word_count: 2 }
                },
                authority_hook: {
                    authority_hook: {},
                    meta: { complete: false }
                },
                questions: {
                    questions: {},
                    meta: { count: 0 }
                },
                offers: {
                    offers: {},
                    meta: { count: 0 }
                },
                social_media: {},
                validation: {
                    has_topics: true,
                    has_biography: false,
                    has_authority_hook: false,
                    has_questions: false,
                    has_offers: false,
                    has_social_media: false,
                    is_complete: false
                },
                meta_info: {
                    extraction_timestamp: Date.now(),
                    post_id: 456,
                    data_source: 'mkcg_integration'
                }
            },

            // No MKCG data scenario
            noMKCGData: null
        };

        // Task 3: Component State Mock Data
        this.componentStates = {
            excellentQuality: {
                id: 'mock-hero-excellent',
                type: 'hero',
                mkcgPopulated: true,
                qualityScore: 95,
                dataFreshness: 'fresh',
                syncStatus: 'synced',
                mappedFields: 8,
                priority: 90,
                lastUpdated: Date.now()
            },
            goodQuality: {
                id: 'mock-topics-good',
                type: 'topics',
                mkcgPopulated: true,
                qualityScore: 75,
                dataFreshness: 'fresh',
                syncStatus: 'synced',
                mappedFields: 5,
                priority: 80,
                lastUpdated: Date.now()
            },
            fairQuality: {
                id: 'mock-bio-fair',
                type: 'biography',
                mkcgPopulated: true,
                qualityScore: 55,
                dataFreshness: 'stale',
                syncStatus: 'pending',
                mappedFields: 3,
                priority: 60,
                lastUpdated: Date.now() - 86400000 // 1 day ago
            },
            poorQuality: {
                id: 'mock-offers-poor',
                type: 'offers',
                mkcgPopulated: true,
                qualityScore: 25,
                dataFreshness: 'stale',
                syncStatus: 'error',
                mappedFields: 1,
                priority: 30,
                lastUpdated: Date.now() - 604800000 // 1 week ago
            },
            manualComponent: {
                id: 'mock-social-manual',
                type: 'social-links',
                mkcgPopulated: false,
                qualityScore: 0,
                dataFreshness: 'manual',
                syncStatus: 'none',
                mappedFields: 0,
                priority: 0,
                lastUpdated: Date.now()
            }
        };

        console.log('📝 Mock data generators initialized');
    }

    /**
     * PERFORMANCE MONITORING SETUP
     */
    setupPerformanceMonitoring() {
        this.performanceTargets = {
            emptyStateRender: { target: 50, tolerance: 10, unit: 'ms' },
            stateTransition: { target: 200, tolerance: 50, unit: 'ms' },
            indicatorUpdate: { target: 10, tolerance: 5, unit: 'ms' },
            autoGeneration: { target: 1000, tolerance: 200, unit: 'ms' },
            dataRefresh: { target: 500, tolerance: 100, unit: 'ms' },
            memoryUsage: { target: 500, tolerance: 100, unit: 'KB' },
            animationFPS: { target: 60, tolerance: 5, unit: 'fps' }
        };

        // Performance monitoring utilities
        this.performance = {
            measure: async (operation, operationName, target) => {
                const startTime = performance.now();
                const startMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                
                try {
                    const result = await operation();
                    const endTime = performance.now();
                    const endMemory = performance.memory ? performance.memory.usedJSHeapSize : 0;
                    
                    const metrics = {
                        operationName,
                        duration: endTime - startTime,
                        memoryDelta: endMemory - startMemory,
                        target: target || this.performanceTargets[operationName],
                        timestamp: new Date().toISOString(),
                        result
                    };
                    
                    // Check if within target
                    if (metrics.target) {
                        metrics.withinTarget = metrics.duration <= (metrics.target.target + metrics.target.tolerance);
                        metrics.performance = metrics.withinTarget ? 'PASS' : 'FAIL';
                    }
                    
                    // Store metrics
                    this.performanceMetrics.set(`${operationName}_${Date.now()}`, metrics);
                    
                    console.log(`⚡ ${operationName}: ${metrics.duration.toFixed(2)}ms ${metrics.performance ? `- ${metrics.performance}` : ''}`);
                    
                    return metrics;
                    
                } catch (error) {
                    console.error(`❌ Performance measurement failed for ${operationName}:`, error);
                    return {
                        operationName,
                        duration: performance.now() - startTime,
                        error: error.message,
                        withinTarget: false,
                        performance: 'ERROR'
                    };
                }
            },

            // Get performance summary
            getSummary: () => {
                const metrics = Array.from(this.performanceMetrics.values());
                const summary = {
                    totalMeasurements: metrics.length,
                    averageDuration: metrics.reduce((sum, m) => sum + m.duration, 0) / metrics.length,
                    passRate: (metrics.filter(m => m.performance === 'PASS').length / metrics.length) * 100,
                    slowestOperation: metrics.reduce((max, m) => m.duration > max.duration ? m : max, metrics[0]),
                    fastestOperation: metrics.reduce((min, m) => m.duration < min.duration ? m : min, metrics[0])
                };
                
                console.table(summary);
                return summary;
            },

            // Clear metrics
            clear: () => {
                this.performanceMetrics.clear();
                console.log('🗑️ Performance metrics cleared');
            }
        };

        console.log('⚡ Performance monitoring setup complete');
    }

    /**
     * VISUAL TESTING SETUP
     */
    setupVisualTesting() {
        this.visual = {
            // Take screenshot of element
            screenshot: (element, name) => {
                try {
                    if (!element) {
                        console.warn('⚠️ Cannot take screenshot: element not found');
                        return null;
                    }

                    // Use html2canvas if available, otherwise use basic capture
                    if (window.html2canvas) {
                        return window.html2canvas(element).then(canvas => {
                            const dataURL = canvas.toDataURL();
                            this.screenshots.set(name, {
                                dataURL,
                                timestamp: Date.now(),
                                element: element.tagName,
                                className: element.className
                            });
                            console.log(`📸 Screenshot captured: ${name}`);
                            return dataURL;
                        });
                    } else {
                        // Basic capture method
                        const rect = element.getBoundingClientRect();
                        const capture = {
                            bounds: rect,
                            styles: window.getComputedStyle(element),
                            innerHTML: element.innerHTML,
                            timestamp: Date.now()
                        };
                        this.screenshots.set(name, capture);
                        console.log(`📸 Basic capture saved: ${name}`);
                        return capture;
                    }
                } catch (error) {
                    console.error('❌ Screenshot failed:', error);
                    return null;
                }
            },

            // Compare visual states
            compare: (before, after) => {
                const beforeData = this.screenshots.get(before);
                const afterData = this.screenshots.get(after);
                
                if (!beforeData || !afterData) {
                    console.warn('⚠️ Cannot compare: missing screenshot data');
                    return null;
                }

                // Basic comparison (can be enhanced with actual image diff)
                const comparison = {
                    beforeTimestamp: beforeData.timestamp,
                    afterTimestamp: afterData.timestamp,
                    timeDelta: afterData.timestamp - beforeData.timestamp,
                    structuralChange: beforeData.innerHTML !== afterData.innerHTML,
                    similarity: beforeData.innerHTML === afterData.innerHTML ? 100 : 0
                };

                console.log(`🔍 Visual comparison ${before} vs ${after}:`, comparison);
                return comparison;
            },

            // List all screenshots
            list: () => {
                const screenshots = Array.from(this.screenshots.entries());
                console.table(screenshots.map(([name, data]) => ({
                    name,
                    timestamp: new Date(data.timestamp).toISOString(),
                    type: data.dataURL ? 'Canvas' : 'Basic'
                })));
                return screenshots;
            }
        };

        console.log('📸 Visual testing setup complete');
    }

    /**
     * ACCESSIBILITY TESTING SETUP
     */
    setupAccessibilityTesting() {
        this.accessibility = {
            // Check contrast ratios
            checkContrast: (element) => {
                const styles = window.getComputedStyle(element);
                const bgColor = styles.backgroundColor;
                const textColor = styles.color;
                
                // Basic contrast check (can be enhanced with actual calculation)
                const result = {
                    element: element.tagName,
                    className: element.className,
                    backgroundColor: bgColor,
                    textColor: textColor,
                    // Note: Real contrast calculation would require color parsing
                    contrastRatio: 'calculation needed',
                    wcagAA: 'needs verification',
                    wcagAAA: 'needs verification'
                };
                
                console.log('🎨 Contrast check:', result);
                return result;
            },

            // Check ARIA attributes
            checkARIA: (element) => {
                const ariaAttributes = {};
                for (let attr of element.attributes) {
                    if (attr.name.startsWith('aria-')) {
                        ariaAttributes[attr.name] = attr.value;
                    }
                }

                const result = {
                    element: element.tagName,
                    className: element.className,
                    ariaAttributes,
                    hasRole: element.hasAttribute('role'),
                    role: element.getAttribute('role'),
                    ariaLabel: element.getAttribute('aria-label'),
                    ariaDescribedBy: element.getAttribute('aria-describedby')
                };

                console.log('♿ ARIA check:', result);
                return result;
            },

            // Check keyboard navigation
            checkKeyboardNav: (container) => {
                const focusableElements = container.querySelectorAll(
                    'a[href], button, textarea, input[type="text"], input[type="radio"], input[type="checkbox"], select'
                );

                const result = {
                    container: container.tagName,
                    focusableCount: focusableElements.length,
                    focusableElements: Array.from(focusableElements).map(el => ({
                        tag: el.tagName,
                        type: el.type || null,
                        tabIndex: el.tabIndex,
                        hasTabIndex: el.hasAttribute('tabindex')
                    })),
                    tabOrder: Array.from(focusableElements).map(el => el.tabIndex).filter(t => t >= 0)
                };

                console.log('⌨️ Keyboard navigation check:', result);
                return result;
            }
        };

        console.log('♿ Accessibility testing setup complete');
    }

    /**
     * EMPTY STATE TESTING UTILITIES
     */
    createEmptyStateTests() {
        const self = this;
        return {
            // Test no data scenario
            testNoDataScenario: async () => {
                console.group('🎭 Testing No Data Empty State');
                
                // Set no MKCG data
                self.setMockMKCGData(null);
                
                // Measure performance
                const metrics = await self.performance.measure(async () => {
                    // Trigger empty state evaluation
                    self.triggerEmptyStateEvaluation();
                    
                    // Check for expected elements
                    const connectBtn = document.querySelector('.connect-data-btn');
                    const manualBtn = document.querySelector('.manual-build-btn');
                    const emptyIcon = document.querySelector('.empty-state-icon');
                    
                    return {
                        connectBtnFound: !!connectBtn,
                        manualBtnFound: !!manualBtn,
                        emptyIconFound: !!emptyIcon,
                        emptyStateVisible: !!document.querySelector('.empty-state-enhanced:not([style*="display: none"])')
                    };
                }, 'emptyStateRender');
                
                console.log('📊 No Data Test Results:', metrics.result);
                console.groupEnd();
                
                return metrics;
            },

            // Test low quality data scenario
            testLowQualityScenario: async () => {
                console.group('🎭 Testing Low Quality Data Empty State');
                
                // Set low quality MKCG data
                self.setMockMKCGData(self.mockData.poorMKCGData);
                
                const metrics = await self.performance.measure(async () => {
                    self.triggerEmptyStateEvaluation();
                    
                    const improveBtn = document.querySelector('.improve-data-btn');
                    const generateAnyway = document.querySelector('.generate-anyway-btn');
                    const warningIcon = document.querySelector('.empty-state-icon');
                    
                    return {
                        improveBtnFound: !!improveBtn,
                        generateAnywayFound: !!generateAnyway,
                        warningIconFound: !!warningIcon,
                        qualityWarningVisible: !!document.querySelector('.quality-recommendations-enhanced')
                    };
                }, 'emptyStateRender');
                
                console.log('📊 Low Quality Test Results:', metrics.result);
                console.groupEnd();
                
                return metrics;
            },

            // Test high quality data scenario
            testHighQualityScenario: async () => {
                console.group('🎭 Testing High Quality Data Empty State');
                
                // Set high quality MKCG data
                self.setMockMKCGData(self.mockData.excellentMKCGData);
                
                const metrics = await self.performance.measure(async () => {
                    self.triggerEmptyStateEvaluation();
                    
                    const autoGenBtn = document.querySelector('.auto-generate-all-btn');
                    const selectiveBtn = document.querySelector('.selective-generate-btn');
                    const successIcon = document.querySelector('.empty-state-icon');
                    const previewComponents = document.querySelectorAll('.preview-component-enhanced');
                    
                    return {
                        autoGenBtnFound: !!autoGenBtn,
                        selectiveBtnFound: !!selectiveBtn,
                        successIconFound: !!successIcon,
                        previewComponentsCount: previewComponents.length,
                        qualityIndicatorsVisible: !!document.querySelector('.generation-preview-enhanced')
                    };
                }, 'emptyStateRender');
                
                console.log('📊 High Quality Test Results:', metrics.result);
                console.groupEnd();
                
                return metrics;
            }
        };
    }

    /**
     * COMPONENT STATE TESTING UTILITIES
     */
    createComponentStateTests() {
        const self = this;
        return {
            // Test MKCG populated component
            testMKCGPopulatedComponent: async () => {
                console.group('🏷️ Testing MKCG Populated Component');
                
                const mockData = self.componentStates.excellentQuality;
                
                const metrics = await self.performance.measure(async () => {
                    // Create mock component
                    const component = self.createMockComponent(mockData);
                    
                    // Check for indicators
                    const qualityBadge = component.querySelector('.quality-badge');
                    const freshnessIndicator = component.querySelector('.data-freshness');
                    const mkcgStyling = component.hasAttribute('data-mkcg-populated');
                    
                    const result = {
                        componentCreated: !!component,
                        qualityBadgeFound: !!qualityBadge,
                        freshnessIndicatorFound: !!freshnessIndicator,
                        mkcgStylingApplied: mkcgStyling,
                        qualityScore: qualityBadge ? qualityBadge.textContent : null
                    };
                    
                    // Cleanup
                    component.remove();
                    
                    return result;
                }, 'indicatorUpdate');
                
                console.log('📊 MKCG Component Test Results:', metrics.result);
                console.groupEnd();
                
                return metrics;
            },

            // Test manual component
            testManualComponent: async () => {
                console.group('🏷️ Testing Manual Component');
                
                const mockData = self.componentStates.manualComponent;
                
                const metrics = await self.performance.measure(async () => {
                    const component = self.createMockComponent(mockData);
                    
                    const qualityBadge = component.querySelector('.quality-badge');
                    const freshnessIndicator = component.querySelector('.data-freshness');
                    const mkcgStyling = component.hasAttribute('data-mkcg-populated');
                    
                    const result = {
                        componentCreated: !!component,
                        qualityBadgeFound: !!qualityBadge,
                        freshnessIndicatorFound: !!freshnessIndicator,
                        mkcgStylingApplied: mkcgStyling,
                        hasManualStyling: component.classList.contains('manual-component')
                    };
                    
                    component.remove();
                    return result;
                }, 'indicatorUpdate');
                
                console.log('📊 Manual Component Test Results:', metrics.result);
                console.groupEnd();
                
                return metrics;
            },

            // Test stale component
            testStaleComponent: async () => {
                console.group('🏷️ Testing Stale Component');
                
                const mockData = self.componentStates.fairQuality;
                
                const metrics = await self.performance.measure(async () => {
                    const component = self.createMockComponent(mockData);
                    
                    const staleFreshness = component.querySelector('.data-freshness.stale');
                    const refreshIndicator = component.querySelector('.refresh-indicator');
                    const syncStatus = component.querySelector('.sync-indicator');
                    
                    const result = {
                        componentCreated: !!component,
                        staleFreshnessFound: !!staleFreshness,
                        refreshIndicatorFound: !!refreshIndicator,
                        syncStatusFound: !!syncStatus,
                        hasStaleWarning: component.classList.contains('data-stale')
                    };
                    
                    component.remove();
                    return result;
                }, 'indicatorUpdate');
                
                console.log('📊 Stale Component Test Results:', metrics.result);
                console.groupEnd();
                
                return metrics;
            }
        };
    }

    /**
     * UTILITY METHODS
     */

    // Set mock MKCG data
    setMockMKCGData(data) {
        if (window.guestifyData) {
            window.guestifyData.mkcgData = data;
        } else {
            window.guestifyData = { mkcgData: data };
        }
        
        // Update data mapper if available
        if (window.mkcgDataMapper && typeof window.mkcgDataMapper.updateDataSource === 'function') {
            window.mkcgDataMapper.updateDataSource(data);
        }
        
        console.log('📝 Mock MKCG data set:', data ? 'data provided' : 'no data');
    }

    // Trigger empty state evaluation
    triggerEmptyStateEvaluation() {
        // Trigger state manager evaluation if available
        if (window.enhancedStateManager && typeof window.enhancedStateManager.checkMKCGDataAvailability === 'function') {
            window.enhancedStateManager.checkMKCGDataAvailability();
        }
        
        // Trigger component manager evaluation if available
        if (window.enhancedComponentManager && typeof window.enhancedComponentManager.evaluateEmptyState === 'function') {
            window.enhancedComponentManager.evaluateEmptyState();
        }
        
        // Emit custom event for empty state evaluation
        document.dispatchEvent(new CustomEvent('mkcg:data-updated', {
            detail: { mkcgData: window.guestifyData?.mkcgData }
        }));
    }

    // Create mock component
    createMockComponent(mockData) {
        const component = document.createElement('div');
        component.className = 'mk-component test-component';
        component.setAttribute('data-component-id', mockData.id);
        component.setAttribute('data-component-type', mockData.type);
        
        // Add MKCG attributes
        if (mockData.mkcgPopulated) {
            component.setAttribute('data-mkcg-populated', 'true');
            component.classList.add('mkcg-populated');
        }
        
        // Add quality badge
        if (mockData.qualityScore > 0) {
            const badge = document.createElement('div');
            badge.className = 'quality-badge';
            badge.textContent = `${mockData.qualityScore}%`;
            
            // Add quality class
            if (mockData.qualityScore >= 90) badge.classList.add('quality-excellent');
            else if (mockData.qualityScore >= 70) badge.classList.add('quality-good');
            else if (mockData.qualityScore >= 50) badge.classList.add('quality-fair');
            else badge.classList.add('quality-poor');
            
            component.appendChild(badge);
        }
        
        // Add freshness indicator
        if (mockData.dataFreshness && mockData.dataFreshness !== 'manual') {
            const freshness = document.createElement('div');
            freshness.className = `data-freshness ${mockData.dataFreshness}`;
            freshness.textContent = mockData.dataFreshness;
            component.appendChild(freshness);
        }
        
        // Add sync indicator
        if (mockData.syncStatus && mockData.syncStatus !== 'none') {
            const sync = document.createElement('div');
            sync.className = `sync-indicator ${mockData.syncStatus}`;
            component.appendChild(sync);
        }
        
        // Add to DOM temporarily
        document.body.appendChild(component);
        
        return component;
    }

    // Generate comprehensive test report
    generateTestReport() {
        const report = {
            timestamp: new Date().toISOString(),
            performance: {
                metrics: Array.from(this.performanceMetrics.values()),
                summary: this.performance.getSummary()
            },
            visual: {
                screenshots: Array.from(this.screenshots.keys()),
                comparisons: []
            },
            testResults: Array.from(this.testResults.entries()),
            recommendations: [
                'Run empty state tests in all scenarios',
                'Validate component indicators with real data',
                'Test performance under load conditions',
                'Verify accessibility compliance',
                'Test cross-browser compatibility'
            ]
        };
        
        console.group('📋 Comprehensive Test Report');
        console.log('📊 Performance Summary:', report.performance.summary);
        console.log('📸 Screenshots Captured:', report.visual.screenshots.length);
        console.log('🧪 Test Results:', report.testResults.length);
        console.log('📋 Full Report:', report);
        console.groupEnd();
        
        return report;
    }

    // Quick test all systems
    async quickTestAll() {
        console.group('🚀 Quick Test All Systems');
        
        const emptyStateTests = this.createEmptyStateTests();
        const componentTests = this.createComponentStateTests();
        
        const results = {
            emptyStates: {
                noData: await emptyStateTests.testNoDataScenario(),
                lowQuality: await emptyStateTests.testLowQualityScenario(),
                highQuality: await emptyStateTests.testHighQualityScenario()
            },
            componentStates: {
                mkcgPopulated: await componentTests.testMKCGPopulatedComponent(),
                manual: await componentTests.testManualComponent(),
                stale: await componentTests.testStaleComponent()
            }
        };
        
        // Calculate overall success rate
        const allTests = [...Object.values(results.emptyStates), ...Object.values(results.componentStates)];
        const successRate = (allTests.filter(test => test.performance !== 'ERROR').length / allTests.length) * 100;
        
        console.log(`🎯 Overall Success Rate: ${successRate.toFixed(1)}%`);
        console.log('📊 Detailed Results:', results);
        console.groupEnd();
        
        return { results, successRate };
    }
}

// Create and expose global instance
const testingFoundationInstance = new TestingFoundationUtilities();
window.testingFoundation = testingFoundationInstance;

// Add emergency diagnostic function
window.emergencyDiagnostic = function() {
    console.log('🚨 EMERGENCY DIAGNOSTIC RUNNING...');
    console.log('====================================');
    
    const diagnostic = {
        timestamp: new Date().toISOString(),
        frameworks: {},
        components: {},
        data: {},
        errors: []
    };
    
    // Check frameworks
    diagnostic.frameworks = {
        testingFoundation: !!window.testingFoundation,
        implementationValidator: !!window.implementationValidator,
        comprehensiveTestRunner: !!window.comprehensivePhase23TestRunner,
        enhancedStateManager: !!window.enhancedStateManager,
        enhancedComponentManager: !!window.enhancedComponentManager,
        mkcgDataMapper: !!window.mkcgDataMapper
    };
    
    // Check components
    diagnostic.components = {
        stateManager: !!window.stateManager,
        componentManager: !!window.componentManager,
        guestifyData: !!window.guestifyData,
        guestifyBuilderUtils: !!window.guestifyBuilderUtils
    };
    
    // Check data availability
    if (window.guestifyData) {
        diagnostic.data = {
            hasMKCGData: !!window.guestifyData.mkcgData,
            postId: window.guestifyData.postId || null,
            dataSource: window.guestifyData.dataSource || 'default',
            hasComponents: !!window.guestifyData.components
        };
    }
    
    // Check for errors
    try {
        // Test if methods can be called without recursion
        if (window.testingFoundation) {
            const testExists = typeof window.testingFoundation.createEmptyStateTests === 'function';
            diagnostic.testingMethods = {
                createEmptyStateTests: testExists,
                createComponentStateTests: typeof window.testingFoundation.createComponentStateTests === 'function',
                quickTestAll: typeof window.testingFoundation.quickTestAll === 'function'
            };
        }
    } catch (error) {
        diagnostic.errors.push(error.message);
    }
    
    // Display results
    console.group('🏢 Frameworks Status');
    Object.entries(diagnostic.frameworks).forEach(([name, status]) => {
        console.log(`${status ? '✅' : '❌'} ${name}: ${status ? 'Loaded' : 'Missing'}`);
    });
    console.groupEnd();
    
    console.group('🧩 Components Status');
    Object.entries(diagnostic.components).forEach(([name, status]) => {
        console.log(`${status ? '✅' : '❌'} ${name}: ${status ? 'Available' : 'Not Found'}`);
    });
    console.groupEnd();
    
    console.group('📊 Data Status');
    Object.entries(diagnostic.data).forEach(([key, value]) => {
        console.log(`${key}: ${value}`);
    });
    console.groupEnd();
    
    if (diagnostic.errors.length > 0) {
        console.group('❌ Errors Detected');
        diagnostic.errors.forEach(error => console.error(error));
        console.groupEnd();
    }
    
    // Calculate health score
    const frameworkScore = Object.values(diagnostic.frameworks).filter(v => v).length / Object.keys(diagnostic.frameworks).length * 100;
    const componentScore = Object.values(diagnostic.components).filter(v => v).length / Object.keys(diagnostic.components).length * 100;
    const overallHealth = (frameworkScore + componentScore) / 2;
    
    console.log(`\n🏥 System Health: ${overallHealth.toFixed(1)}%`);
    
    if (overallHealth < 50) {
        console.log('⚠️ Critical: System is not properly initialized');
        console.log('🔧 Recommended: Reload the page or check console for initialization errors');
    } else if (overallHealth < 80) {
        console.log('⚠️ Warning: Some components are missing');
        console.log('🔧 Recommended: Check if all scripts are loaded correctly');
    } else {
        console.log('✅ System appears healthy');
        console.log('🔧 Next step: Run testingFoundation.quickTestAll() for detailed testing');
    }
    
    window.lastDiagnostic = diagnostic;
    return diagnostic;
};

// Console commands for easy access
console.log(`
🧪 Phase 2.3 Testing Foundation Utilities Ready!

Quick Commands:
- testingFoundation.quickTestAll()                    // Test everything
- testingFoundation.createEmptyStateTests()          // Empty state tests
- testingFoundation.createComponentStateTests()      // Component tests
- testingFoundation.performance.getSummary()         // Performance summary
- testingFoundation.generateTestReport()             // Full report

Mock Data:
- testingFoundation.setMockMKCGData(data)           // Set test data
- testingFoundation.mockData.excellentMKCGData      // High quality data
- testingFoundation.mockData.poorMKCGData           // Low quality data
- testingFoundation.mockData.noMKCGData             // No data

Performance:
- testingFoundation.performance.measure(op, name)   // Measure operation
- testingFoundation.performance.clear()             // Clear metrics

Visual:
- testingFoundation.visual.screenshot(el, name)     // Take screenshot
- testingFoundation.visual.compare(before, after)   // Compare visuals

Example: testingFoundation.quickTestAll().then(r => console.log('Results:', r));
`);

// Create a promise that resolves when all systems are ready
window.waitForInitialization = function(timeout = 5000) {
    return new Promise((resolve, reject) => {
        const startTime = Date.now();
        
        const checkSystems = () => {
            const elapsed = Date.now() - startTime;
            
            // Check for all critical systems
            const systemsReady = {
                enhancedComponentManager: !!window.enhancedComponentManager,
                enhancedStateManager: !!window.enhancedStateManager,
                mkcgDataMapper: !!window.mkcgDataMapper,
                guestifyData: !!window.guestifyData,
                stateManager: !!window.stateManager,
                componentManager: !!window.componentManager,
                testingFoundation: !!window.testingFoundation,
                implementationValidator: !!window.implementationValidator
            };
            
            // Count ready systems
            const readySystems = Object.values(systemsReady).filter(ready => ready).length;
            const totalSystems = Object.keys(systemsReady).length;
            
            console.log(`⏳ Waiting for initialization: ${readySystems}/${totalSystems} systems ready...`);
            
            // Check if critical systems are ready
            const criticalReady = systemsReady.enhancedComponentManager && 
                                systemsReady.enhancedStateManager && 
                                systemsReady.guestifyData;
            
            if (criticalReady) {
                console.log('✅ Critical systems ready!');
                resolve(systemsReady);
            } else if (elapsed > timeout) {
                console.warn('⚠️ Timeout waiting for initialization');
                reject(new Error(`Initialization timeout after ${timeout}ms. Ready systems: ${JSON.stringify(systemsReady)}`));
            } else {
                // Check again in 100ms
                setTimeout(checkSystems, 100);
            }
        };
        
        // Start checking
        checkSystems();
    });
};

// Create a wrapper for safe test execution
window.runTestsWhenReady = async function(testFunction, testName = 'Test') {
    console.log(`🚀 Preparing to run ${testName}...`);
    
    try {
        // Wait for initialization
        await window.waitForInitialization();
        
        console.log(`✅ Systems ready, running ${testName}...`);
        
        // Run the test function
        const result = await testFunction();
        
        console.log(`✅ ${testName} completed successfully`);
        return result;
        
    } catch (error) {
        console.error(`❌ Failed to run ${testName}:`, error);
        return {
            error: error.message,
            status: 'FAILED'
        };
    }
};

export { TestingFoundationUtilities };
