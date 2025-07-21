/**
 * TASK 0: TEST DATA STRATEGY - Enhanced Mock Data Management
 * Following Gemini's recommendation: "Formalize a Test Data Strategy"
 * 
 * This file provides comprehensive test data management for Phase 7 testing,
 * leveraging and expanding the existing test-task2-mock-data-generator.js
 * to create specific states needed for each test category.
 */

class Phase7TestDataStrategy {
    constructor() {
        this.dataStates = new Map();
        this.generators = new Map();
        this.currentState = null;
        
        this.initializeDataGenerators();
    }
    
    /**
     * Initialize all data generators for different test scenarios
     */
    initializeDataGenerators() {
        // Basic MKCG data generators
        this.generators.set('clean_mkcg_data', this.generateCleanMKCGData.bind(this));
        this.generators.set('minimal_mkcg_data', this.generateMinimalMKCGData.bind(this));
        this.generators.set('complete_mkcg_data', this.generateCompleteMKCGData.bind(this));
        
        // Error scenario generators
        this.generators.set('corrupted_data_state', this.setupCorruptedDataState.bind(this));
        this.generators.set('concurrent_edit_state', this.setupConcurrentEditState.bind(this));
        this.generators.set('network_failure_state', this.setupNetworkFailureState.bind(this));
        this.generators.set('validation_error_state', this.setupValidationErrorState.bind(this));
        
        // Performance testing generators
        this.generators.set('high_volume_data_state', this.setupHighVolumeDataState.bind(this));
        this.generators.set('slow_network_state', this.setupSlowNetworkState.bind(this));
        this.generators.set('memory_stress_state', this.setupMemoryStressState.bind(this));
        
        // Accessibility testing generators
        this.generators.set('screen_reader_state', this.setupScreenReaderState.bind(this));
        this.generators.set('keyboard_navigation_state', this.setupKeyboardNavigationState.bind(this));
        this.generators.set('high_contrast_state', this.setupHighContrastState.bind(this));
        
        // Cross-browser testing generators
        this.generators.set('browser_compatibility_state', this.setupBrowserCompatibilityState.bind(this));
        this.generators.set('mobile_device_state', this.setupMobileDeviceState.bind(this));
        
        console.log(`✅ Initialized ${this.generators.size} test data generators`);
    }
    
    /**
     * BASIC MKCG DATA GENERATORS
     */
    
    /**
     * Generate clean, valid MKCG data for standard testing
     */
    generateCleanMKCGData() {
        return {
            postId: 123,
            guestifyData: {
                mkcgData: {
                    topics: {
                        topics: {
                            topic_1: 'Digital Marketing Strategy',
                            topic_2: 'Social Media Management',
                            topic_3: 'Content Creation',
                            topic_4: 'SEO Optimization',
                            topic_5: 'Analytics and Reporting'
                        },
                        meta: {
                            generated_date: '2024-01-15T10:30:00Z',
                            quality_score: 85,
                            data_source: 'ai_generated'
                        }
                    },
                    biography: {
                        short: 'Digital marketing expert with 10+ years experience',
                        medium: 'Experienced digital marketing specialist helping businesses grow their online presence through strategic campaigns and data-driven insights.',
                        long: 'Award-winning digital marketing specialist with over 10 years of experience helping businesses of all sizes grow their online presence. Expertise includes strategic campaign development, social media management, content creation, SEO optimization, and analytics reporting. Proven track record of increasing client ROI by an average of 150% through data-driven marketing strategies.',
                        title: 'Senior Digital Marketing Strategist',
                        organization: 'Digital Growth Agency'
                    },
                    authority_hook: {
                        who: 'Small business owners and entrepreneurs',
                        what: 'Increase online visibility and drive qualified traffic',
                        when: 'Within 90 days of implementation',
                        how: 'Through proven digital marketing strategies and data-driven optimization'
                    }
                },
                postId: 123,
                ajaxUrl: '/wp-admin/admin-ajax.php',
                nonce: 'test_nonce_12345'
            },
            domState: 'clean',
            userContext: 'authenticated_admin'
        };
    }
    
    /**
     * Generate minimal MKCG data for edge case testing
     */
    generateMinimalMKCGData() {
        return {
            postId: 456,
            guestifyData: {
                mkcgData: {
                    topics: {
                        topics: {
                            topic_1: 'Basic Topic'
                        },
                        meta: {
                            generated_date: '2024-01-15T10:30:00Z',
                            quality_score: 45,
                            data_source: 'user_input'
                        }
                    }
                },
                postId: 456,
                ajaxUrl: '/wp-admin/admin-ajax.php',
                nonce: 'test_nonce_67890'
            },
            domState: 'minimal',
            userContext: 'authenticated_editor'
        };
    }
    
    /**
     * Generate complete MKCG data for comprehensive testing
     */
    generateCompleteMKCGData() {
        const baseData = this.generateCleanMKCGData();
        
        // Add additional components
        baseData.guestifyData.mkcgData.questions = {
            questions: {
                question_1: 'How can I improve my digital marketing ROI?',
                question_2: 'What social media platforms should I focus on?',
                question_3: 'How do I measure campaign effectiveness?'
            }
        };
        
        baseData.guestifyData.mkcgData.offers = {
            offers: {
                offer_1: 'Free Digital Marketing Audit',
                offer_2: '30-Day Strategy Consultation',
                offer_3: 'Custom Analytics Dashboard Setup'
            }
        };
        
        baseData.guestifyData.mkcgData.meta_info = {
            total_components: 5,
            completion_percentage: 100,
            last_updated: '2024-01-15T10:30:00Z',
            version: '2.1.0'
        };
        
        return baseData;
    }
    
    /**
     * ERROR SCENARIO GENERATORS
     */
    
    /**
     * Setup corrupted data state for error handling testing
     */
    setupCorruptedDataState() {
        const corruptedData = this.generateCleanMKCGData();
        
        // Introduce various data corruption scenarios
        corruptedData.guestifyData.mkcgData.topics.topics.topic_1 = null;
        corruptedData.guestifyData.mkcgData.topics.topics.topic_2 = '';
        corruptedData.guestifyData.mkcgData.topics.topics.topic_3 = '<script>alert("xss")</script>';
        corruptedData.guestifyData.mkcgData.topics.topics.topic_4 = 'A'.repeat(500); // Too long
        corruptedData.guestifyData.mkcgData.topics.topics.topic_5 = undefined;
        
        // Corrupt meta information
        corruptedData.guestifyData.mkcgData.topics.meta.quality_score = -1;
        corruptedData.guestifyData.mkcgData.topics.meta.generated_date = 'invalid_date';
        
        // Add corruption markers for test validation
        corruptedData.testMarkers = {
            dataState: 'corrupted',
            corruptionTypes: ['null_values', 'empty_strings', 'xss_attempts', 'length_violations', 'undefined_values'],
            expectedBehavior: 'auto_repair_and_validation'
        };
        
        return corruptedData;
    }
    
    /**
     * Setup concurrent editing state for conflict testing
     */
    setupConcurrentEditState() {
        const concurrentData = this.generateCleanMKCGData();
        
        // Add concurrent editing simulation
        concurrentData.concurrentEdits = {
            user1: {
                sessionId: 'session_user1_123',
                lastEdit: Date.now() - 1000,
                editingTopic: 'topic_1',
                changes: {
                    topic_1: 'Digital Marketing Strategy (Modified by User 1)'
                }
            },
            user2: {
                sessionId: 'session_user2_456',
                lastEdit: Date.now() - 500,
                editingTopic: 'topic_1',
                changes: {
                    topic_1: 'Digital Marketing Strategy (Modified by User 2)'
                }
            }
        };
        
        concurrentData.testMarkers = {
            dataState: 'concurrent_editing',
            conflictTypes: ['simultaneous_edits', 'version_conflicts', 'lock_conflicts'],
            expectedBehavior: 'conflict_resolution_ui'
        };
        
        return concurrentData;
    }
    
    /**
     * Setup network failure state for connectivity testing
     */
    setupNetworkFailureState() {
        const networkData = this.generateCleanMKCGData();
        
        // Simulate network issues
        networkData.networkConditions = {
            connectivity: 'offline',
            latency: 5000, // 5 second delay
            packetLoss: 0.3, // 30% packet loss
            bandwidth: 'slow-3g'
        };
        
        // Mock failing AJAX endpoints
        networkData.mockResponses = {
            saveTopics: {
                status: 500,
                response: { error: 'Internal Server Error' },
                delay: 10000
            },
            loadMKCGData: {
                status: 0, // Network error
                response: null,
                delay: 30000
            }
        };
        
        networkData.testMarkers = {
            dataState: 'network_failure',
            failureTypes: ['timeout', 'server_error', 'connection_lost'],
            expectedBehavior: 'retry_mechanism_and_offline_mode'
        };
        
        return networkData;
    }
    
    /**
     * Setup validation error state for validation testing
     */
    setupValidationErrorState() {
        const validationData = this.generateCleanMKCGData();
        
        // Create data that will trigger validation errors
        validationData.guestifyData.mkcgData.topics.topics = {
            topic_1: '', // Required field empty
            topic_2: 'ab', // Too short
            topic_3: 'A'.repeat(150), // Too long
            topic_4: 'Topic with <script>alert("xss")</script> tags', // HTML injection
            topic_5: '   Poorly   Formatted   Topic   ' // Whitespace issues
        };
        
        validationData.testMarkers = {
            dataState: 'validation_errors',
            errorTypes: ['required_field_empty', 'length_violations', 'format_issues', 'security_violations'],
            expectedBehavior: 'comprehensive_validation_feedback'
        };
        
        return validationData;
    }
    
    /**
     * PERFORMANCE TESTING GENERATORS
     */
    
    /**
     * Setup high volume data state for performance testing
     */
    setupHighVolumeDataState() {
        const highVolumeData = this.generateCleanMKCGData();
        
        // Create large dataset
        const topicsCount = 100;
        for (let i = 1; i <= topicsCount; i++) {
            highVolumeData.guestifyData.mkcgData.topics.topics[`topic_${i}`] = 
                `High Volume Topic ${i} with detailed description and extensive content for performance testing`;
        }
        
        // Add large biography content
        highVolumeData.guestifyData.mkcgData.biography.long = 'Long biography content. '.repeat(1000);
        
        // Add performance monitoring markers
        highVolumeData.performanceMarkers = {
            dataSize: 'large',
            expectedLoadTime: 500, // ms
            memoryFootprint: 'monitor',
            renderingComplexity: 'high'
        };
        
        return highVolumeData;
    }
    
    /**
     * Setup slow network state for performance testing
     */
    setupSlowNetworkState() {
        const slowNetworkData = this.generateCleanMKCGData();
        
        slowNetworkData.networkConditions = {
            connectivity: 'slow-3g',
            latency: 2000,
            bandwidth: '50kb/s',
            packetLoss: 0.1
        };
        
        slowNetworkData.testMarkers = {
            dataState: 'slow_network',
            expectedBehavior: 'progressive_loading_and_optimization'
        };
        
        return slowNetworkData;
    }
    
    /**
     * Setup memory stress state for memory testing
     */
    setupMemoryStressState() {
        const memoryStressData = this.generateHighVolumeDataState();
        
        // Add memory stress simulation
        memoryStressData.memoryStress = {
            simulateLeaks: true,
            createLargeObjects: true,
            retainReferences: true,
            maxMemoryUsage: '50MB'
        };
        
        return memoryStressData;
    }
    
    /**
     * ACCESSIBILITY TESTING GENERATORS
     */
    
    /**
     * Setup screen reader state for accessibility testing
     */
    setupScreenReaderState() {
        const screenReaderData = this.generateCleanMKCGData();
        
        screenReaderData.accessibilityContext = {
            assistiveTechnology: 'screen_reader',
            userAgent: 'NVDA/JAWS/VoiceOver',
            navigationMode: 'keyboard_only',
            announcements: 'verbose'
        };
        
        screenReaderData.testMarkers = {
            accessibilityFocus: 'screen_reader',
            expectedFeatures: ['aria_labels', 'live_regions', 'semantic_markup', 'keyboard_navigation']
        };
        
        return screenReaderData;
    }
    
    /**
     * Setup keyboard navigation state for accessibility testing
     */
    setupKeyboardNavigationState() {
        const keyboardData = this.generateCleanMKCGData();
        
        keyboardData.inputMethod = 'keyboard_only';
        keyboardData.testMarkers = {
            accessibilityFocus: 'keyboard_navigation',
            expectedFeatures: ['tab_order', 'focus_indicators', 'keyboard_shortcuts', 'skip_links']
        };
        
        return keyboardData;
    }
    
    /**
     * Setup high contrast state for accessibility testing
     */
    setupHighContrastState() {
        const highContrastData = this.generateCleanMKCGData();
        
        highContrastData.displaySettings = {
            colorScheme: 'high_contrast',
            contrastRatio: 'minimum_7_to_1',
            colorBlindnessSim: 'deuteranopia'
        };
        
        return highContrastData;
    }
    
    /**
     * CROSS-BROWSER TESTING GENERATORS
     */
    
    /**
     * Setup browser compatibility state for cross-browser testing
     */
    setupBrowserCompatibilityState() {
        const browserData = this.generateCleanMKCGData();
        
        browserData.browserContext = {
            userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            browserName: 'chrome',
            browserVersion: '120.0.0.0',
            platform: 'Windows',
            screenResolution: '1920x1080',
            devicePixelRatio: 1
        };
        
        return browserData;
    }
    
    /**
     * Setup mobile device state for mobile testing
     */
    setupMobileDeviceState() {
        const mobileData = this.generateCleanMKCGData();
        
        mobileData.deviceContext = {
            deviceType: 'mobile',
            deviceName: 'iPhone 13',
            screenSize: '390x844',
            touchInterface: true,
            orientation: 'portrait'
        };
        
        return mobileData;
    }
    
    /**
     * PUBLIC API METHODS
     */
    
    /**
     * Generate test data for specific scenario
     * @param {string} scenarioName - Name of the test scenario
     * @returns {Object} Generated test data
     */
    generateTestData(scenarioName) {
        const generator = this.generators.get(scenarioName);
        if (!generator) {
            throw new Error(`Unknown test scenario: ${scenarioName}`);
        }
        
        const data = generator();
        this.dataStates.set(scenarioName, data);
        
        console.log(`📊 Generated test data for scenario: ${scenarioName}`);
        return data;
    }
    
    /**
     * Setup global test environment with specific data state
     * @param {string} scenarioName - Test scenario to setup
     */
    setupTestEnvironment(scenarioName) {
        const data = this.generateTestData(scenarioName);
        
        // Setup global window state
        if (typeof window !== 'undefined') {
            window.guestifyData = data.guestifyData;
            
            // Add test markers for debugging
            window.testEnvironment = {
                scenario: scenarioName,
                dataState: data.testMarkers?.dataState || 'normal',
                markers: data.testMarkers || {}
            };
        }
        
        this.currentState = scenarioName;
        console.log(`🔧 Test environment setup complete for: ${scenarioName}`);
        
        return data;
    }
    
    /**
     * Clean up test environment
     */
    cleanupTestEnvironment() {
        if (typeof window !== 'undefined') {
            delete window.guestifyData;
            delete window.testEnvironment;
        }
        
        this.currentState = null;
        console.log('🧹 Test environment cleaned up');
    }
    
    /**
     * Get list of available test scenarios
     * @returns {Array} List of scenario names
     */
    getAvailableScenarios() {
        return Array.from(this.generators.keys());
    }
    
    /**
     * Validate test data integrity
     * @param {Object} data - Test data to validate
     * @returns {Object} Validation results
     */
    validateTestData(data) {
        const results = {
            isValid: true,
            errors: [],
            warnings: []
        };
        
        // Basic structure validation
        if (!data.guestifyData) {
            results.isValid = false;
            results.errors.push('Missing guestifyData object');
        }
        
        if (!data.postId) {
            results.warnings.push('Missing postId - may affect URL detection tests');
        }
        
        return results;
    }
}

/**
 * UTILITY FUNCTIONS FOR TEST SETUP
 */

/**
 * Quick setup function for common test scenarios
 */
function setupQuickTestData(scenario = 'clean_mkcg_data') {
    const testDataStrategy = new Phase7TestDataStrategy();
    return testDataStrategy.setupTestEnvironment(scenario);
}

/**
 * Cleanup function for test teardown
 */
function cleanupTestData() {
    const testDataStrategy = new Phase7TestDataStrategy();
    testDataStrategy.cleanupTestEnvironment();
}

/**
 * Generate mock AJAX responses for network testing
 */
function mockAjaxResponses(scenario) {
    const testData = new Phase7TestDataStrategy();
    const data = testData.generateTestData(scenario);
    
    if (data.mockResponses) {
        // Setup mock AJAX responses based on scenario
        return data.mockResponses;
    }
    
    return null;
}

// Export for module systems
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        Phase7TestDataStrategy,
        setupQuickTestData,
        cleanupTestData,
        mockAjaxResponses
    };
}

// Global access for browser testing
if (typeof window !== 'undefined') {
    window.Phase7TestDataStrategy = Phase7TestDataStrategy;
    window.setupQuickTestData = setupQuickTestData;
    window.cleanupTestData = cleanupTestData;
    window.mockAjaxResponses = mockAjaxResponses;
}

console.log('✅ PHASE 7: Test Data Strategy loaded');
console.log('📊 Available scenarios:', new Phase7TestDataStrategy().getAvailableScenarios().join(', '));
