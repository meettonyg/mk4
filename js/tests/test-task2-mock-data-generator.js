/**
 * @file test-task2-mock-data-generator.js
 * @description Mock data generator for Task 2 Enhanced Empty States testing
 * @version 1.0.0
 * @date 2025-01-08
 * 
 * Generates comprehensive mock MKCG data scenarios for testing all empty state variations
 * Supports simulation of different data quality levels and component availability
 */

class Task2MockDataGenerator {
    constructor() {
        this.scenarios = new Map();
        this.dataQualityCalculator = new DataQualityCalculator();
        this.componentTypeMap = new Map([
            ['topics', { weight: 20, essential: false }],
            ['biography', { weight: 25, essential: true }],
            ['authority_hook', { weight: 20, essential: false }],
            ['questions', { weight: 15, essential: false }],
            ['offers', { weight: 10, essential: false }],
            ['social_media', { weight: 10, essential: false }]
        ]);
        
        this.generateAllScenarios();
        console.log('📊 Task 2 Mock Data Generator initialized with', this.scenarios.size, 'scenarios');
    }

    /**
     * Generate all mock data scenarios for testing
     */
    generateAllScenarios() {
        // Scenario 1: No MKCG Data Connected
        this.scenarios.set('no-data', this.generateNoDataScenario());
        
        // Scenario 2: Empty/Invalid Data
        this.scenarios.set('invalid-data', this.generateInvalidDataScenario());
        
        // Scenario 3: Very Low Quality Data (0-25%)
        this.scenarios.set('very-low-quality', this.generateVeryLowQualityScenario());
        
        // Scenario 4: Low Quality Data (25-40%)
        this.scenarios.set('low-quality', this.generateLowQualityScenario());
        
        // Scenario 5: Fair Quality Data (40-60%)
        this.scenarios.set('fair-quality', this.generateFairQualityScenario());
        
        // Scenario 6: Good Quality Data (60-80%)
        this.scenarios.set('good-quality', this.generateGoodQualityScenario());
        
        // Scenario 7: High Quality Data (80-95%)
        this.scenarios.set('high-quality', this.generateHighQualityScenario());
        
        // Scenario 8: Excellent Quality Data (95-100%)
        this.scenarios.set('excellent-quality', this.generateExcellentQualityScenario());
        
        // Scenario 9: Partial Data (Some components missing)
        this.scenarios.set('partial-data', this.generatePartialDataScenario());
        
        // Scenario 10: Stale Data (Old timestamps)
        this.scenarios.set('stale-data', this.generateStaleDataScenario());
        
        // Scenario 11: Loading State
        this.scenarios.set('loading', this.generateLoadingScenario());
        
        // Scenario 12: Error State
        this.scenarios.set('error-state', this.generateErrorScenario());
    }

    /**
     * No MKCG data connected scenario
     */
    generateNoDataScenario() {
        return {
            scenarioName: 'No MKCG Data Connected',
            postId: 0,
            mkcgData: null,
            dashboard: null,
            expectedState: 'no-mkcg-data',
            expectedUI: {
                icon: '🔗',
                title: 'Connect Your Content Data',
                description: 'Link to MKCG post data for intelligent auto-population',
                theme: 'default',
                actions: [
                    { text: 'Connect Data Source', type: 'primary', id: 'connect-data' },
                    { text: 'Build Manually', type: 'secondary', id: 'manual-build-fallback' }
                ],
                features: [
                    { name: 'Auto-generation', icon: '⚡', description: 'Instant component creation from your data' },
                    { name: 'Quality scoring', icon: '📊', description: 'Real-time data quality assessment' },
                    { name: 'Smart mapping', icon: '🎯', description: 'Intelligent field matching and optimization' }
                ]
            },
            testExpectations: {
                shouldShowFeatures: true,
                shouldShowDashboard: false,
                shouldShowPreviews: false,
                shouldShowRecommendations: false,
                primaryAction: 'connect-data',
                fallbackAction: 'manual-build'
            }
        };
    }

    /**
     * Invalid/corrupted data scenario
     */
    generateInvalidDataScenario() {
        return {
            scenarioName: 'Invalid/Corrupted Data',
            postId: 999,
            mkcgData: {
                corrupted: true,
                error: 'Data extraction failed',
                validation: null
            },
            dashboard: null,
            expectedState: 'error-state',
            expectedUI: {
                icon: '❌',
                title: 'Data Connection Error',
                description: 'Unable to load MKCG data. The data may be corrupted or inaccessible.',
                theme: 'error',
                actions: [
                    { text: 'Retry Connection', type: 'primary', id: 'retry-connection' },
                    { text: 'Build Manually', type: 'secondary', id: 'manual-build' }
                ]
            },
            testExpectations: {
                shouldShowError: true,
                shouldShowRetry: true,
                shouldShowFallback: true
            }
        };
    }

    /**
     * Very low quality data scenario (0-25%)
     */
    generateVeryLowQualityScenario() {
        const mockData = {
            topics: { topic_1: 'Incomplete topic' }, // Only 1 poor quality topic
            biography: null,
            authority_hook: null,
            questions: null,
            offers: null,
            social_media: null
        };

        const qualityScore = this.dataQualityCalculator.calculateQualityScore(mockData);

        return {
            scenarioName: 'Very Low Quality Data (0-25%)',
            postId: 111,
            mkcgData: {
                validation: {
                    has_topics: true,
                    has_biography: false,
                    has_authority_hook: false,
                    has_questions: false,
                    has_offers: false,
                    has_social_media: false
                },
                topics: mockData.topics,
                meta_info: {
                    extraction_date: new Date().toISOString(),
                    quality_assessment: 'very-poor'
                }
            },
            dashboard: this.generateDashboard(qualityScore, mockData, 1),
            expectedState: 'mkcg-critical',
            expectedUI: {
                icon: '🚨',
                title: 'Critical Data Quality Issues',
                description: `Your connected data has ${qualityScore}% quality score with severe limitations.`,
                theme: 'critical',
                actions: [
                    { text: 'Improve Data Quality', type: 'warning', id: 'improve-data' },
                    { text: 'Generate Anyway', type: 'secondary', id: 'generate-anyway' }
                ]
            },
            testExpectations: {
                shouldShowRecommendations: true,
                shouldShowQualityBreakdown: true,
                shouldWarnUser: true,
                recommendationCount: 3
            }
        };
    }

    /**
     * Low quality data scenario (25-40%)
     */
    generateLowQualityScenario() {
        const mockData = {
            topics: { 
                topic_1: 'Digital Marketing', 
                topic_2: 'Content Strategy' 
            },
            biography: { short: 'Basic bio text' },
            authority_hook: null,
            questions: null,
            offers: null,
            social_media: null
        };

        const qualityScore = this.dataQualityCalculator.calculateQualityScore(mockData);

        return {
            scenarioName: 'Low Quality Data (25-40%)',
            postId: 222,
            mkcgData: {
                validation: {
                    has_topics: true,
                    has_biography: true,
                    has_authority_hook: false,
                    has_questions: false,
                    has_offers: false,
                    has_social_media: false
                },
                topics: mockData.topics,
                biography: mockData.biography,
                meta_info: {
                    extraction_date: new Date().toISOString(),
                    quality_assessment: 'poor'
                }
            },
            dashboard: this.generateDashboard(qualityScore, mockData, 2),
            expectedState: 'mkcg-warning',
            expectedUI: {
                icon: '⚠️',
                title: 'Data Quality Needs Improvement',
                description: `Your connected data has ${qualityScore}% quality score with limited usability for auto-generation.`,
                theme: 'warning',
                actions: [
                    { text: 'Improve Data Quality', type: 'secondary', id: 'improve-data' },
                    { text: 'Generate Anyway', type: 'secondary', id: 'generate-anyway' }
                ]
            },
            testExpectations: {
                shouldShowRecommendations: true,
                shouldShowLimitedPreviews: true,
                recommendationCount: 4
            }
        };
    }

    /**
     * Fair quality data scenario (40-60%)
     */
    generateFairQualityScenario() {
        const mockData = {
            topics: { 
                topic_1: 'Digital Marketing Strategy',
                topic_2: 'Content Creation',
                topic_3: 'Social Media Management'
            },
            biography: { 
                short: 'Marketing professional with 5 years experience',
                medium: 'Experienced marketing professional specializing in digital strategy and content creation.'
            },
            authority_hook: {
                who: 'Marketing professionals',
                what: 'Digital strategy consulting'
            },
            questions: null,
            offers: null,
            social_media: { linkedin: 'https://linkedin.com/in/example' }
        };

        const qualityScore = this.dataQualityCalculator.calculateQualityScore(mockData);

        return {
            scenarioName: 'Fair Quality Data (40-60%)',
            postId: 333,
            mkcgData: {
                validation: {
                    has_topics: true,
                    has_biography: true,
                    has_authority_hook: true,
                    has_questions: false,
                    has_offers: false,
                    has_social_media: true
                },
                topics: mockData.topics,
                biography: mockData.biography,
                authority_hook: mockData.authority_hook,
                social_media: mockData.social_media,
                meta_info: {
                    extraction_date: new Date().toISOString(),
                    quality_assessment: 'fair'
                }
            },
            dashboard: this.generateDashboard(qualityScore, mockData, 4),
            expectedState: 'mkcg-fair',
            expectedUI: {
                icon: '📊',
                title: 'Fair Data Quality',
                description: `Your MKCG data has ${qualityScore}% quality score. Some components can be auto-generated.`,
                theme: 'fair',
                actions: [
                    { text: 'Generate Available Components', type: 'primary', id: 'auto-generate-available' },
                    { text: 'Improve Quality First', type: 'secondary', id: 'improve-data' }
                ]
            },
            testExpectations: {
                shouldShowComponentPreviews: true,
                shouldShowPartialGeneration: true,
                previewCount: 4
            }
        };
    }

    /**
     * Good quality data scenario (60-80%)
     */
    generateGoodQualityScenario() {
        const mockData = {
            topics: { 
                topic_1: 'Digital Marketing Strategy',
                topic_2: 'Content Creation & Management',
                topic_3: 'Social Media Marketing',
                topic_4: 'Email Marketing Automation'
            },
            biography: { 
                short: 'Senior marketing strategist with 8+ years experience',
                medium: 'Senior marketing strategist specializing in digital transformation and data-driven campaigns.',
                long: 'Accomplished senior marketing strategist with over 8 years of experience in digital transformation, data-driven campaign management, and strategic growth initiatives...'
            },
            authority_hook: {
                who: 'Marketing directors and CMOs',
                what: 'Strategic marketing consulting and training',
                when: 'During digital transformation initiatives',
                how: 'Through comprehensive audits and strategic planning'
            },
            questions: {
                q1: 'What are the key components of a successful digital marketing strategy?',
                q2: 'How do you measure marketing ROI effectively?',
                q3: 'What tools do you recommend for marketing automation?'
            },
            offers: null,
            social_media: { 
                linkedin: 'https://linkedin.com/in/example',
                twitter: 'https://twitter.com/example'
            }
        };

        const qualityScore = this.dataQualityCalculator.calculateQualityScore(mockData);

        return {
            scenarioName: 'Good Quality Data (60-80%)',
            postId: 444,
            mkcgData: {
                validation: {
                    has_topics: true,
                    has_biography: true,
                    has_authority_hook: true,
                    has_questions: true,
                    has_offers: false,
                    has_social_media: true
                },
                topics: mockData.topics,
                biography: mockData.biography,
                authority_hook: mockData.authority_hook,
                questions: mockData.questions,
                social_media: mockData.social_media,
                meta_info: {
                    extraction_date: new Date().toISOString(),
                    quality_assessment: 'good'
                }
            },
            dashboard: this.generateDashboard(qualityScore, mockData, 5),
            expectedState: 'mkcg-good',
            expectedUI: {
                icon: '✅',
                title: 'Good Data Connected',
                description: `Your MKCG data has ${qualityScore}% quality score. Some components can be auto-generated.`,
                theme: 'good',
                actions: [
                    { text: 'Generate Available Components', type: 'primary', id: 'auto-generate-available' },
                    { text: 'Build Manually', type: 'secondary', id: 'manual-build' }
                ]
            },
            testExpectations: {
                shouldShowComponentPreviews: true,
                shouldAllowFullGeneration: true,
                previewCount: 5
            }
        };
    }

    /**
     * High quality data scenario (80-95%)
     */
    generateHighQualityScenario() {
        const mockData = {
            topics: { 
                topic_1: 'Advanced Digital Marketing Strategy',
                topic_2: 'Content Creation & Management Systems',
                topic_3: 'Social Media Marketing & Community Building',
                topic_4: 'Email Marketing Automation & Personalization',
                topic_5: 'Data Analytics & Performance Optimization'
            },
            biography: { 
                short: 'Award-winning senior marketing strategist with 10+ years experience',
                medium: 'Award-winning senior marketing strategist specializing in digital transformation, data-driven campaigns, and strategic growth initiatives for Fortune 500 companies.',
                long: 'Accomplished senior marketing strategist with over 10 years of experience leading digital transformation initiatives, data-driven campaign management, and strategic growth programs for Fortune 500 companies. Recognized industry expert with multiple awards and speaking engagements...'
            },
            authority_hook: {
                who: 'Marketing directors, CMOs, and business leaders',
                what: 'Strategic marketing consulting, training, and digital transformation',
                when: 'During digital transformation initiatives and growth planning phases',
                how: 'Through comprehensive audits, strategic planning, and hands-on implementation support'
            },
            questions: {
                q1: 'What are the key components of a successful digital marketing strategy in 2024?',
                q2: 'How do you measure and optimize marketing ROI across multiple channels?',
                q3: 'What are the best tools and practices for marketing automation?',
                q4: 'How do you build and scale effective content marketing programs?',
                q5: 'What data analytics approaches drive the best marketing insights?'
            },
            offers: {
                offer_1: 'Free Digital Marketing Strategy Assessment',
                offer_2: 'Marketing Automation Setup Consultation'
            },
            social_media: { 
                linkedin: 'https://linkedin.com/in/example',
                twitter: 'https://twitter.com/example',
                website: 'https://marketingexpert.com'
            }
        };

        const qualityScore = this.dataQualityCalculator.calculateQualityScore(mockData);

        return {
            scenarioName: 'High Quality Data (80-95%)',
            postId: 555,
            mkcgData: {
                validation: {
                    has_topics: true,
                    has_biography: true,
                    has_authority_hook: true,
                    has_questions: true,
                    has_offers: true,
                    has_social_media: true
                },
                topics: mockData.topics,
                biography: mockData.biography,
                authority_hook: mockData.authority_hook,
                questions: mockData.questions,
                offers: mockData.offers,
                social_media: mockData.social_media,
                meta_info: {
                    extraction_date: new Date().toISOString(),
                    quality_assessment: 'excellent'
                }
            },
            dashboard: this.generateDashboard(qualityScore, mockData, 6),
            expectedState: 'mkcg-ready',
            expectedUI: {
                icon: '🎉',
                title: 'Excellent Data Connected!',
                description: `Your MKCG data has ${qualityScore}% quality score and can auto-generate 6 components.`,
                theme: 'excellent',
                actions: [
                    { text: 'Auto-Generate Media Kit', type: 'primary', id: 'auto-generate-all-empty' },
                    { text: 'Choose Components', type: 'secondary', id: 'selective-generate' }
                ]
            },
            testExpectations: {
                shouldShowFullPreviews: true,
                shouldShowQualityHighlights: true,
                previewCount: 6,
                shouldEnableFullAutoGen: true
            }
        };
    }

    /**
     * Excellent quality data scenario (95-100%)
     */
    generateExcellentQualityScenario() {
        const mockData = {
            topics: { 
                topic_1: 'Advanced Digital Marketing Strategy & Leadership',
                topic_2: 'Content Creation & Management Systems Excellence',
                topic_3: 'Social Media Marketing & Community Building Mastery',
                topic_4: 'Email Marketing Automation & Advanced Personalization',
                topic_5: 'Data Analytics, AI Integration & Performance Optimization'
            },
            biography: { 
                short: 'Internationally recognized marketing strategist and thought leader with 15+ years experience',
                medium: 'Internationally recognized marketing strategist and thought leader with 15+ years of experience driving digital transformation and strategic growth for global Fortune 100 companies.',
                long: 'Internationally recognized marketing strategist and thought leader with over 15 years of experience driving digital transformation, strategic growth initiatives, and innovative marketing programs for global Fortune 100 companies. TEDx speaker, bestselling author, and recipient of multiple industry awards including Marketing Executive of the Year. Regular contributor to Harvard Business Review and Forbes, with expertise spanning AI-driven marketing, customer experience optimization, and sustainable growth strategies...'
            },
            authority_hook: {
                who: 'C-suite executives, marketing leaders, and enterprise teams',
                what: 'Strategic marketing transformation, executive coaching, and organizational growth consulting',
                when: 'During major digital transformation initiatives, market expansion, and strategic pivots',
                how: 'Through comprehensive strategic assessments, executive workshops, hands-on implementation support, and ongoing performance optimization'
            },
            questions: {
                q1: 'What are the most critical components of a future-ready digital marketing strategy?',
                q2: 'How do you build and scale marketing organizations for sustainable growth?',
                q3: 'What AI and automation tools are revolutionizing marketing effectiveness?',
                q4: 'How do you create content marketing programs that drive measurable business impact?',
                q5: 'What data analytics and attribution models provide the clearest ROI insights?',
                q6: 'How do you balance personalization with privacy in modern marketing?',
                q7: 'What are the best practices for marketing team leadership and development?',
                q8: 'How do you optimize customer lifetime value through strategic marketing?'
            },
            offers: {
                offer_1: 'Comprehensive Digital Marketing Strategy Assessment (Normally $5,000)',
                offer_2: 'Executive Marketing Leadership Coaching Program',
                offer_3: 'Enterprise Marketing Transformation Workshop Series'
            },
            social_media: { 
                linkedin: 'https://linkedin.com/in/marketingleader',
                twitter: 'https://twitter.com/marketingexpert',
                website: 'https://strategicmarketingexpert.com',
                youtube: 'https://youtube.com/c/marketingstrategy'
            }
        };

        const qualityScore = this.dataQualityCalculator.calculateQualityScore(mockData);

        return {
            scenarioName: 'Excellent Quality Data (95-100%)',
            postId: 666,
            mkcgData: {
                validation: {
                    has_topics: true,
                    has_biography: true,
                    has_authority_hook: true,
                    has_questions: true,
                    has_offers: true,
                    has_social_media: true
                },
                topics: mockData.topics,
                biography: mockData.biography,
                authority_hook: mockData.authority_hook,
                questions: mockData.questions,
                offers: mockData.offers,
                social_media: mockData.social_media,
                meta_info: {
                    extraction_date: new Date().toISOString(),
                    quality_assessment: 'exceptional'
                }
            },
            dashboard: this.generateDashboard(qualityScore, mockData, 6),
            expectedState: 'mkcg-exceptional',
            expectedUI: {
                icon: '🏆',
                title: 'Exceptional Data Quality!',
                description: `Outstanding! Your MKCG data has ${qualityScore}% quality score with premium content ready for professional media kit generation.`,
                theme: 'exceptional',
                actions: [
                    { text: 'Generate Professional Media Kit', type: 'primary', id: 'auto-generate-premium' },
                    { text: 'Customize Generation', type: 'secondary', id: 'selective-generate' }
                ]
            },
            testExpectations: {
                shouldShowPremiumPreviews: true,
                shouldHighlightExcellence: true,
                shouldOfferPremiumGeneration: true,
                previewCount: 6
            }
        };
    }

    /**
     * Partial data scenario (missing key components)
     */
    generatePartialDataScenario() {
        const mockData = {
            topics: { 
                topic_1: 'Digital Marketing',
                topic_2: 'Content Strategy'
            },
            biography: null, // Missing essential component
            authority_hook: {
                who: 'Marketers',
                what: 'Marketing advice'
            },
            questions: {
                q1: 'How to start digital marketing?',
                q2: 'What are the best tools?'
            },
            offers: null,
            social_media: { linkedin: 'https://linkedin.com/in/example' }
        };

        const qualityScore = this.dataQualityCalculator.calculateQualityScore(mockData);

        return {
            scenarioName: 'Partial Data (Missing Biography)',
            postId: 777,
            mkcgData: {
                validation: {
                    has_topics: true,
                    has_biography: false, // Critical missing
                    has_authority_hook: true,
                    has_questions: true,
                    has_offers: false,
                    has_social_media: true
                },
                topics: mockData.topics,
                authority_hook: mockData.authority_hook,
                questions: mockData.questions,
                social_media: mockData.social_media,
                meta_info: {
                    extraction_date: new Date().toISOString(),
                    quality_assessment: 'partial'
                }
            },
            dashboard: this.generateDashboard(qualityScore, mockData, 4, ['Biography data is essential for professional media kits']),
            expectedState: 'mkcg-partial',
            expectedUI: {
                icon: '🧩',
                title: 'Partial Data Available',
                description: `Your MKCG data has ${qualityScore}% completeness but is missing essential components.`,
                theme: 'partial',
                actions: [
                    { text: 'Complete Missing Data', type: 'primary', id: 'complete-data' },
                    { text: 'Generate With Available', type: 'secondary', id: 'generate-partial' }
                ]
            },
            testExpectations: {
                shouldShowMissingComponents: true,
                shouldPrioritizeEssential: true,
                missingEssential: ['biography']
            }
        };
    }

    /**
     * Stale data scenario (old timestamps)
     */
    generateStaleDataScenario() {
        const staleDate = new Date();
        staleDate.setDate(staleDate.getDate() - 45); // 45 days old

        const mockData = {
            topics: { 
                topic_1: 'Digital Marketing',
                topic_2: 'Content Strategy',
                topic_3: 'Social Media'
            },
            biography: { 
                short: 'Marketing professional',
                medium: 'Experienced marketing professional with digital expertise.'
            },
            authority_hook: {
                who: 'Marketing teams',
                what: 'Marketing consulting'
            },
            questions: null,
            offers: null,
            social_media: { linkedin: 'https://linkedin.com/in/example' }
        };

        const qualityScore = this.dataQualityCalculator.calculateQualityScore(mockData);

        return {
            scenarioName: 'Stale Data (45 Days Old)',
            postId: 888,
            mkcgData: {
                validation: {
                    has_topics: true,
                    has_biography: true,
                    has_authority_hook: true,
                    has_questions: false,
                    has_offers: false,
                    has_social_media: true
                },
                topics: mockData.topics,
                biography: mockData.biography,
                authority_hook: mockData.authority_hook,
                social_media: mockData.social_media,
                meta_info: {
                    extraction_date: staleDate.toISOString(),
                    quality_assessment: 'stale'
                }
            },
            dashboard: this.generateDashboard(qualityScore, mockData, 4, ['Data is 45 days old - consider refreshing for current information']),
            expectedState: 'mkcg-stale',
            expectedUI: {
                icon: '🕐',
                title: 'Data May Be Outdated',
                description: `Your MKCG data was last updated 45 days ago. Consider refreshing for current information.`,
                theme: 'stale',
                actions: [
                    { text: 'Refresh Data', type: 'primary', id: 'refresh-data' },
                    { text: 'Use Current Data', type: 'secondary', id: 'use-stale-data' }
                ]
            },
            testExpectations: {
                shouldShowDataAge: true,
                shouldOfferRefresh: true,
                shouldWarnStaleness: true
            }
        };
    }

    /**
     * Loading state scenario
     */
    generateLoadingScenario() {
        return {
            scenarioName: 'Data Loading State',
            postId: 999,
            mkcgData: null,
            isLoading: true,
            dashboard: null,
            expectedState: 'loading',
            expectedUI: {
                icon: '⏳',
                title: 'Loading Data...',
                description: 'Connecting to MKCG data source and analyzing content quality.',
                theme: 'loading',
                actions: []
            },
            testExpectations: {
                shouldShowLoadingSpinner: true,
                shouldPreventInteraction: true,
                shouldShowProgress: true
            }
        };
    }

    /**
     * Error state scenario
     */
    generateErrorScenario() {
        return {
            scenarioName: 'Data Connection Error',
            postId: 404,
            mkcgData: null,
            error: {
                code: 'CONNECTION_FAILED',
                message: 'Unable to connect to MKCG data source',
                details: 'The requested post data could not be found or accessed'
            },
            dashboard: null,
            expectedState: 'error',
            expectedUI: {
                icon: '❌',
                title: 'Connection Error',
                description: 'Unable to connect to MKCG data source. Please check your connection and try again.',
                theme: 'error',
                actions: [
                    { text: 'Retry Connection', type: 'primary', id: 'retry-connection' },
                    { text: 'Report Issue', type: 'secondary', id: 'report-error' },
                    { text: 'Build Manually', type: 'secondary', id: 'manual-fallback' }
                ]
            },
            testExpectations: {
                shouldShowErrorDetails: true,
                shouldOfferRetry: true,
                shouldProvideFallback: true
            }
        };
    }

    /**
     * Generate dashboard data for a scenario
     */
    generateDashboard(qualityScore, mockData, componentCount, recommendations = []) {
        const components = [];
        
        // Add components based on available data
        if (mockData.topics) {
            components.push({
                type: 'topics',
                name: 'Topics',
                quality: this.getQualityLevel(Object.keys(mockData.topics).length * 20),
                count: Object.keys(mockData.topics).length
            });
        }
        
        if (mockData.biography) {
            const bioQuality = Object.keys(mockData.biography).length * 30;
            components.push({
                type: 'biography',
                name: 'Biography',
                quality: this.getQualityLevel(bioQuality),
                count: Object.keys(mockData.biography).length
            });
        }
        
        if (mockData.authority_hook) {
            const hookQuality = Object.keys(mockData.authority_hook).length * 25;
            components.push({
                type: 'authority-hook',
                name: 'Authority Hook',
                quality: this.getQualityLevel(hookQuality),
                count: Object.keys(mockData.authority_hook).length
            });
        }
        
        if (mockData.questions) {
            components.push({
                type: 'questions',
                name: 'Questions',
                quality: this.getQualityLevel(Object.keys(mockData.questions).length * 15),
                count: Object.keys(mockData.questions).length
            });
        }
        
        if (mockData.offers) {
            components.push({
                type: 'offers',
                name: 'Offers',
                quality: this.getQualityLevel(Object.keys(mockData.offers).length * 20),
                count: Object.keys(mockData.offers).length
            });
        }
        
        if (mockData.social_media) {
            components.push({
                type: 'social',
                name: 'Social Media',
                quality: this.getQualityLevel(Object.keys(mockData.social_media).length * 20),
                count: Object.keys(mockData.social_media).length
            });
        }

        // Auto-generate recommendations based on missing data
        const autoRecommendations = [];
        if (!mockData.biography) {
            autoRecommendations.push('Biography data is essential for professional media kits');
        }
        if (!mockData.authority_hook) {
            autoRecommendations.push('Authority hook establishes credibility and expertise');
        }
        if (!mockData.questions) {
            autoRecommendations.push('Interview questions help media professionals prepare');
        }
        if (componentCount < 4) {
            autoRecommendations.push('Consider adding more content types for a comprehensive media kit');
        }

        return {
            quality_score: qualityScore,
            quality_level: this.getQualityLevel(qualityScore),
            component_count: componentCount,
            total_possible: 6,
            last_update: 'Just now',
            post_title: `Test Post #${Math.floor(Math.random() * 1000)}`,
            components,
            recommendations: [...recommendations, ...autoRecommendations.slice(0, 3)] // Limit to 3 recommendations
        };
    }

    /**
     * Get quality level string from score
     */
    getQualityLevel(score) {
        if (score >= 95) return 'exceptional';
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        if (score >= 25) return 'poor';
        return 'critical';
    }

    /**
     * Get scenario by name
     */
    getScenario(scenarioName) {
        return this.scenarios.get(scenarioName);
    }

    /**
     * Get all scenarios
     */
    getAllScenarios() {
        return Object.fromEntries(this.scenarios);
    }

    /**
     * Get scenarios by quality level
     */
    getScenariosByQuality(qualityLevel) {
        const filtered = new Map();
        for (const [name, scenario] of this.scenarios) {
            if (scenario.dashboard?.quality_level === qualityLevel) {
                filtered.set(name, scenario);
            }
        }
        return Object.fromEntries(filtered);
    }

    /**
     * Simulate data state transition
     */
    simulateStateTransition(fromScenario, toScenario) {
        const from = this.getScenario(fromScenario);
        const to = this.getScenario(toScenario);
        
        if (!from || !to) {
            throw new Error('Invalid scenario names for transition');
        }

        return {
            from: from.expectedState,
            to: to.expectedState,
            changes: {
                qualityScore: {
                    from: from.dashboard?.quality_score || 0,
                    to: to.dashboard?.quality_score || 0
                },
                componentCount: {
                    from: from.dashboard?.component_count || 0,
                    to: to.dashboard?.component_count || 0
                },
                ui: {
                    icon: { from: from.expectedUI.icon, to: to.expectedUI.icon },
                    title: { from: from.expectedUI.title, to: to.expectedUI.title },
                    theme: { from: from.expectedUI.theme, to: to.expectedUI.theme }
                }
            },
            transitionType: this.determineTransitionType(from, to)
        };
    }

    /**
     * Determine transition type
     */
    determineTransitionType(from, to) {
        const fromScore = from.dashboard?.quality_score || 0;
        const toScore = to.dashboard?.quality_score || 0;
        
        if (toScore > fromScore) return 'improvement';
        if (toScore < fromScore) return 'degradation';
        return 'lateral';
    }

    /**
     * Generate random scenario for testing
     */
    generateRandomScenario() {
        const scenarios = Array.from(this.scenarios.keys());
        const randomIndex = Math.floor(Math.random() * scenarios.length);
        return this.getScenario(scenarios[randomIndex]);
    }

    /**
     * Test data validation
     */
    validateScenarioData(scenario) {
        const errors = [];
        
        if (!scenario.scenarioName) {
            errors.push('Missing scenario name');
        }
        
        if (!scenario.expectedState) {
            errors.push('Missing expected state');
        }
        
        if (!scenario.expectedUI) {
            errors.push('Missing expected UI configuration');
        } else {
            if (!scenario.expectedUI.icon) errors.push('Missing UI icon');
            if (!scenario.expectedUI.title) errors.push('Missing UI title');
            if (!scenario.expectedUI.theme) errors.push('Missing UI theme');
        }
        
        if (!scenario.testExpectations) {
            errors.push('Missing test expectations');
        }
        
        return {
            valid: errors.length === 0,
            errors
        };
    }
}

/**
 * Data Quality Calculator for mock scenarios
 */
class DataQualityCalculator {
    constructor() {
        this.weights = {
            topics: 20,
            biography: 25,
            authority_hook: 20,
            questions: 15,
            offers: 10,
            social_media: 10
        };
    }

    calculateQualityScore(data) {
        let totalScore = 0;
        let maxPossible = 100;

        // Topics scoring
        if (data.topics) {
            const topicsCount = Object.keys(data.topics).length;
            const topicsScore = Math.min((topicsCount / 5) * this.weights.topics, this.weights.topics);
            totalScore += topicsScore;
        }

        // Biography scoring
        if (data.biography) {
            const bioFields = Object.keys(data.biography).length;
            const bioScore = Math.min((bioFields / 3) * this.weights.biography, this.weights.biography);
            totalScore += bioScore;
        }

        // Authority hook scoring
        if (data.authority_hook) {
            const hookFields = Object.keys(data.authority_hook).length;
            const hookScore = Math.min((hookFields / 4) * this.weights.authority_hook, this.weights.authority_hook);
            totalScore += hookScore;
        }

        // Questions scoring
        if (data.questions) {
            const questionsCount = Object.keys(data.questions).length;
            const questionsScore = Math.min((questionsCount / 8) * this.weights.questions, this.weights.questions);
            totalScore += questionsScore;
        }

        // Offers scoring
        if (data.offers) {
            const offersCount = Object.keys(data.offers).length;
            const offersScore = Math.min((offersCount / 3) * this.weights.offers, this.weights.offers);
            totalScore += offersScore;
        }

        // Social media scoring
        if (data.social_media) {
            const socialCount = Object.keys(data.social_media).length;
            const socialScore = Math.min((socialCount / 4) * this.weights.social_media, this.weights.social_media);
            totalScore += socialScore;
        }

        return Math.round(totalScore);
    }
}

// Export for use in tests
export { Task2MockDataGenerator, DataQualityCalculator };

// Global exposure for browser console testing
window.Task2MockDataGenerator = Task2MockDataGenerator;
window.task2MockData = new Task2MockDataGenerator();

console.log('📊 Task 2 Mock Data Generator loaded!');
console.log('🎯 Commands:');
console.log('   task2MockData.getAllScenarios()         - Get all mock scenarios');
console.log('   task2MockData.getScenario("name")       - Get specific scenario');
console.log('   task2MockData.generateRandomScenario()  - Get random scenario');
console.log('   task2MockData.simulateStateTransition() - Test state transitions');
