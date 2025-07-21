/**
 * Auto-Generation Service
 * 
 * ROOT FIX: Provides MKCG data-driven automatic component generation
 * ROOT FIX: Converted from ES6 modules to WordPress global namespace
 */

// ROOT FIX: Remove ES6 imports - use global namespace
// Dependencies will be available globally via WordPress enqueue system

class AutoGenerationService {
    constructor() {
        this.isGenerating = false;
        this.generationResults = [];
        
        // Initialize logging
        this.logger = window.structuredLogger || {
            info: (category, message, data) => console.log(`[${category}] ${message}`, data || ''),
            warn: (category, message, data) => console.warn(`[${category}] ${message}`, data || ''),
            error: (category, message, error, data) => console.error(`[${category}] ${message}`, error, data || ''),
            debug: (category, message, data) => console.debug(`[${category}] ${message}`, data || '')
        };
        this.qualityThresholds = {
            minimum: 20,
            good: 50,
            excellent: 80
        };
        
        // Component mapping for MKCG data fields
        this.componentMappings = {
            hero: {
                requiredFields: ['mkcg_biography_short', 'mkcg_authority_hook_who'],
                optionalFields: ['mkcg_topic_1', 'mkcg_headshot_url'],
                qualityWeight: 25
            },
            biography: {
                requiredFields: ['mkcg_biography_short'],
                optionalFields: ['mkcg_biography_long', 'mkcg_authority_hook_who', 'mkcg_headshot_url'],
                qualityWeight: 20
            },
            topics: {
                requiredFields: ['mkcg_topic_1'],
                optionalFields: ['mkcg_topic_2', 'mkcg_topic_3', 'mkcg_topic_4', 'mkcg_topic_5'],
                qualityWeight: 20
            },
            'authority-hook': {
                requiredFields: ['mkcg_authority_hook_who', 'mkcg_authority_hook_what'],
                optionalFields: ['mkcg_authority_hook_why', 'mkcg_authority_hook_how'],
                qualityWeight: 15
            },
            questions: {
                requiredFields: ['mkcg_question_1'],
                optionalFields: ['mkcg_question_2', 'mkcg_question_3', 'mkcg_question_4', 'mkcg_question_5'],
                qualityWeight: 10
            },
            offers: {
                requiredFields: ['mkcg_offer_1_title'],
                optionalFields: ['mkcg_offer_1_description', 'mkcg_offer_2_title', 'mkcg_offer_3_title'],
                qualityWeight: 10
            }
        };
        
        this.logger.info('AUTO_GEN', 'Auto-generation service initialized', {
            componentMappings: Object.keys(this.componentMappings).length,
            qualityThresholds: this.qualityThresholds
        });
    }
    
    /**
     * ROOT FIX: Auto-generate all available components from MKCG data
     * 
     * @param {boolean} forceGeneration - Force generation even for low-quality data
     * @param {Object} options - Generation options
     * @returns {Promise<Object>} Generation results
     */
    async autoGenerateFromMKCG(forceGeneration = false, options = {}) {
        if (this.isGenerating) {
            this.logger.warn('AUTO_GEN', 'Auto-generation already in progress');
            return { success: false, message: 'Generation already in progress' };
        }
        
        this.isGenerating = true;
        this.generationResults = [];
        
        try {
            this.logger.info('AUTO_GEN', 'Starting auto-generation from MKCG data', {
                forceGeneration,
                options
            });
            
            // Get MKCG data
            const mkcgData = await this.getMKCGData();
            if (!mkcgData) {
                throw new Error('No MKCG data available');
            }
            
            // Analyze data quality
            const qualityAnalysis = this.analyzeMKCGDataQuality(mkcgData);
            this.logger.info('AUTO_GEN', 'MKCG data quality analysis', qualityAnalysis);
            
            // Check if quality meets threshold
            if (!forceGeneration && qualityAnalysis.overallScore < this.qualityThresholds.minimum) {
                throw new Error(`Data quality too low (${qualityAnalysis.overallScore}%). Minimum required: ${this.qualityThresholds.minimum}%`);
            }
            
            // Generate components based on available data
            const componentsToGenerate = this.determineComponentsToGenerate(qualityAnalysis, options);
            this.logger.info('AUTO_GEN', 'Components selected for generation', {
                components: componentsToGenerate,
                count: componentsToGenerate.length
            });
            
            // Generate each component
            let successCount = 0;
            let errorCount = 0;
            
            for (const componentType of componentsToGenerate) {
                try {
                    const result = await this.generateComponent(componentType, mkcgData, qualityAnalysis);
                    if (result.success) {
                        successCount++;
                        this.generationResults.push({
                            component: componentType,
                            status: 'success',
                            data: result.data
                        });
                        this.logger.info('AUTO_GEN', `Component generated successfully: ${componentType}`);
                    } else {
                        errorCount++;
                        this.generationResults.push({
                            component: componentType,
                            status: 'error',
                            error: result.error
                        });
                        this.logger.warn('AUTO_GEN', `Component generation failed: ${componentType}`, result.error);
                    }
                } catch (error) {
                    errorCount++;
                    this.generationResults.push({
                        component: componentType,
                        status: 'error',
                        error: error.message
                    });
                    structuredLogger.error('AUTO_GEN', `Component generation error: ${componentType}`, error);
                }
            }
            
            // Update empty state UI
            this.updateEmptyStateAfterGeneration(successCount);
            
            const finalResult = {
                success: successCount > 0,
                generated: successCount,
                failed: errorCount,
                total: componentsToGenerate.length,
                qualityScore: qualityAnalysis.overallScore,
                results: this.generationResults,
                message: `Generated ${successCount}/${componentsToGenerate.length} components`
            };
            
            structuredLogger.info('AUTO_GEN', 'Auto-generation completed', finalResult);
            
            return finalResult;
            
        } catch (error) {
            structuredLogger.error('AUTO_GEN', 'Auto-generation failed', error);
            return {
                success: false,
                generated: 0,
                failed: 0,
                total: 0,
                error: error.message,
                results: this.generationResults
            };
        } finally {
            this.isGenerating = false;
        }
    }
    
    /**
     * ROOT FIX: Generate a specific component type from MKCG data
     * 
     * @param {string} componentType - Component type to generate
     * @param {Object} mkcgData - MKCG data object
     * @param {Object} qualityAnalysis - Quality analysis results
     * @returns {Promise<Object>} Generation result
     */
    async generateComponent(componentType, mkcgData, qualityAnalysis) {
        try {
            const mapping = this.componentMappings[componentType];
            if (!mapping) {
                throw new Error(`No mapping found for component type: ${componentType}`);
            }
            
            // Check if component manager is available
            if (!window.enhancedComponentManager || typeof window.enhancedComponentManager.addComponent !== 'function') {
                throw new Error('Enhanced component manager not available');
            }
            
            // Build component data from MKCG fields
            const componentData = this.buildComponentData(componentType, mkcgData, mapping);
            
            // Add component to builder
            const componentId = await window.enhancedComponentManager.addComponent(componentType, componentData);
            
            if (!componentId) {
                throw new Error('Component manager returned null/undefined component ID');
            }
            
            return {
                success: true,
                componentId,
                data: componentData,
                qualityScore: qualityAnalysis.components[componentType]?.score || 0
            };
            
        } catch (error) {
            return {
                success: false,
                error: error.message
            };
        }
    }
    
    /**
     * ROOT FIX: Build component data from MKCG fields
     * 
     * @param {string} componentType - Component type
     * @param {Object} mkcgData - MKCG data
     * @param {Object} mapping - Component mapping configuration
     * @returns {Object} Component data object
     */
    buildComponentData(componentType, mkcgData, mapping) {
        const data = {};
        
        // Add required fields
        mapping.requiredFields.forEach(field => {
            if (mkcgData[field]) {
                data[field] = mkcgData[field];
            }
        });
        
        // Add optional fields
        mapping.optionalFields.forEach(field => {
            if (mkcgData[field]) {
                data[field] = mkcgData[field];
            }
        });
        
        // Component-specific data transformation
        switch (componentType) {
            case 'hero':
                return {
                    title: mkcgData.mkcg_authority_hook_who || 'Professional',
                    subtitle: mkcgData.mkcg_biography_short || '',
                    primaryTopic: mkcgData.mkcg_topic_1 || '',
                    image: mkcgData.mkcg_headshot_url || '',
                    style: 'modern'
                };
                
            case 'biography':
                return {
                    shortBio: mkcgData.mkcg_biography_short || '',
                    longBio: mkcgData.mkcg_biography_long || mkcgData.mkcg_biography_short || '',
                    authorityHook: mkcgData.mkcg_authority_hook_who || '',
                    image: mkcgData.mkcg_headshot_url || '',
                    layout: 'side-by-side'
                };
                
            case 'topics':
                const topics = [];
                for (let i = 1; i <= 5; i++) {
                    const topicField = `mkcg_topic_${i}`;
                    if (mkcgData[topicField]) {
                        topics.push({
                            title: mkcgData[topicField],
                            description: `Expert insights on ${mkcgData[topicField]}`,
                            icon: this.getTopicIcon(mkcgData[topicField])
                        });
                    }
                }
                return {
                    topics,
                    title: 'Areas of Expertise',
                    layout: 'grid'
                };
                
            case 'authority-hook':
                return {
                    who: mkcgData.mkcg_authority_hook_who || '',
                    what: mkcgData.mkcg_authority_hook_what || '',
                    why: mkcgData.mkcg_authority_hook_why || '',
                    how: mkcgData.mkcg_authority_hook_how || '',
                    style: 'highlight'
                };
                
            case 'questions':
                const questions = [];
                for (let i = 1; i <= 5; i++) {
                    const questionField = `mkcg_question_${i}`;
                    if (mkcgData[questionField]) {
                        questions.push({
                            question: mkcgData[questionField],
                            category: 'General'
                        });
                    }
                }
                return {
                    questions,
                    title: 'Frequently Asked Questions',
                    layout: 'accordion'
                };
                
            case 'offers':
                const offers = [];
                for (let i = 1; i <= 3; i++) {
                    const titleField = `mkcg_offer_${i}_title`;
                    const descField = `mkcg_offer_${i}_description`;
                    if (mkcgData[titleField]) {
                        offers.push({
                            title: mkcgData[titleField],
                            description: mkcgData[descField] || `Learn more about ${mkcgData[titleField]}`,
                            type: 'service'
                        });
                    }
                }
                return {
                    offers,
                    title: 'Services & Offerings',
                    layout: 'cards'
                };
                
            default:
                return data;
        }
    }
    
    /**
     * ROOT FIX: Get appropriate icon for topic
     * 
     * @param {string} topic - Topic text
     * @returns {string} Icon name/class
     */
    getTopicIcon(topic) {
        const topicLower = topic.toLowerCase();
        
        if (topicLower.includes('business') || topicLower.includes('entrepreneur')) return '💼';
        if (topicLower.includes('tech') || topicLower.includes('digital')) return '💻';
        if (topicLower.includes('health') || topicLower.includes('wellness')) return '🏥';
        if (topicLower.includes('education') || topicLower.includes('teach')) return '📚';
        if (topicLower.includes('design') || topicLower.includes('creative')) return '🎨';
        if (topicLower.includes('finance') || topicLower.includes('money')) return '💰';
        if (topicLower.includes('marketing') || topicLower.includes('brand')) return '📈';
        if (topicLower.includes('travel') || topicLower.includes('adventure')) return '✈️';
        
        return '⭐'; // Default icon
    }
    
    /**
     * ROOT FIX: Analyze MKCG data quality for each component type
     * 
     * @param {Object} mkcgData - MKCG data object
     * @returns {Object} Quality analysis results
     */
    analyzeMKCGDataQuality(mkcgData) {
        const analysis = {
            components: {},
            overallScore: 0,
            recommendations: []
        };
        
        let totalWeight = 0;
        let weightedScore = 0;
        
        Object.entries(this.componentMappings).forEach(([componentType, mapping]) => {
            const componentAnalysis = this.analyzeComponentQuality(mkcgData, mapping);
            analysis.components[componentType] = componentAnalysis;
            
            totalWeight += mapping.qualityWeight;
            weightedScore += componentAnalysis.score * mapping.qualityWeight;
            
            // Add recommendations for low-quality components
            if (componentAnalysis.score < this.qualityThresholds.good) {
                analysis.recommendations.push({
                    component: componentType,
                    issue: 'Low data quality',
                    missing: componentAnalysis.missingRequired,
                    suggestion: `Add missing required fields: ${componentAnalysis.missingRequired.join(', ')}`
                });
            }
        });
        
        analysis.overallScore = Math.round(weightedScore / totalWeight);
        
        return analysis;
    }
    
    /**
     * ROOT FIX: Analyze quality for a specific component
     * 
     * @param {Object} mkcgData - MKCG data
     * @param {Object} mapping - Component mapping
     * @returns {Object} Component quality analysis
     */
    analyzeComponentQuality(mkcgData, mapping) {
        const requiredCount = mapping.requiredFields.length;
        const optionalCount = mapping.optionalFields.length;
        
        const presentRequired = mapping.requiredFields.filter(field => 
            mkcgData[field] && mkcgData[field].trim().length > 0
        );
        
        const presentOptional = mapping.optionalFields.filter(field => 
            mkcgData[field] && mkcgData[field].trim().length > 0
        );
        
        const missingRequired = mapping.requiredFields.filter(field => 
            !mkcgData[field] || mkcgData[field].trim().length === 0
        );
        
        // Calculate score: 70% weight for required fields, 30% for optional
        const requiredScore = requiredCount > 0 ? (presentRequired.length / requiredCount) * 70 : 70;
        const optionalScore = optionalCount > 0 ? (presentOptional.length / optionalCount) * 30 : 30;
        const totalScore = Math.round(requiredScore + optionalScore);
        
        return {
            score: totalScore,
            canGenerate: missingRequired.length === 0,
            quality: totalScore >= this.qualityThresholds.excellent ? 'excellent' :
                     totalScore >= this.qualityThresholds.good ? 'good' : 
                     totalScore >= this.qualityThresholds.minimum ? 'acceptable' : 'poor',
            requiredFields: {
                total: requiredCount,
                present: presentRequired.length,
                missing: missingRequired.length
            },
            optionalFields: {
                total: optionalCount,
                present: presentOptional.length
            },
            missingRequired,
            presentFields: [...presentRequired, ...presentOptional]
        };
    }
    
    /**
     * ROOT FIX: Determine which components can be generated
     * 
     * @param {Object} qualityAnalysis - Quality analysis results
     * @param {Object} options - Generation options
     * @returns {Array} Array of component types to generate
     */
    determineComponentsToGenerate(qualityAnalysis, options = {}) {
        const { maxComponents = 6, minQualityScore = this.qualityThresholds.minimum } = options;
        
        const candidates = Object.entries(qualityAnalysis.components)
            .filter(([_, analysis]) => 
                analysis.canGenerate && 
                analysis.score >= minQualityScore
            )
            .sort(([_, a], [__, b]) => b.score - a.score) // Sort by quality score descending
            .slice(0, maxComponents)
            .map(([componentType, _]) => componentType);
        
        structuredLogger.info('AUTO_GEN', 'Component generation candidates', {
            candidates,
            maxComponents,
            minQualityScore,
            totalAnalyzed: Object.keys(qualityAnalysis.components).length
        });
        
        return candidates;
    }
    
    /**
     * ROOT FIX: Get MKCG data from various sources
     * 
     * @returns {Promise<Object|null>} MKCG data or null
     */
    async getMKCGData() {
        try {
            // Try global data first
            if (window.guestifyData?.mkcgData) {
                structuredLogger.info('AUTO_GEN', 'Using global MKCG data');
                return window.guestifyData.mkcgData;
            }
            
            // Try dashboard data
            const dashboard = document.getElementById('mkcg-dashboard');
            if (dashboard && dashboard.dataset.postId) {
                const postId = dashboard.dataset.postId;
                structuredLogger.info('AUTO_GEN', `Loading MKCG data via AJAX for post ${postId}`);
                
                const response = await fetch(`${window.guestifyData.ajaxUrl}?action=gmkb_get_mkcg_data&post_id=${postId}&nonce=${window.guestifyData.nonce}`);
                const data = await response.json();
                
                if (data.success) {
                    structuredLogger.info('AUTO_GEN', 'MKCG data loaded via AJAX');
                    return data.data.data || data.data;
                }
            }
            
            // Try URL parameters
            const urlParams = new URLSearchParams(window.location.search);
            const postId = urlParams.get('post_id') || urlParams.get('p');
            
            if (postId) {
                structuredLogger.info('AUTO_GEN', `Loading MKCG data via URL parameter for post ${postId}`);
                
                const response = await fetch(`${window.guestifyData.ajaxUrl}?action=gmkb_get_mkcg_data&post_id=${postId}&nonce=${window.guestifyData.nonce}`);
                const data = await response.json();
                
                if (data.success) {
                    structuredLogger.info('AUTO_GEN', 'MKCG data loaded via URL parameter');
                    return data.data.data || data.data;
                }
            }
            
            structuredLogger.warn('AUTO_GEN', 'No MKCG data source available');
            return null;
            
        } catch (error) {
            structuredLogger.error('AUTO_GEN', 'Failed to get MKCG data', error);
            return null;
        }
    }
    
    /**
     * ROOT FIX: Update empty state UI after successful generation
     * 
     * @param {number} generatedCount - Number of components generated
     */
    updateEmptyStateAfterGeneration(generatedCount) {
        try {
            if (generatedCount > 0) {
                // Hide empty state
                const emptyState = document.getElementById('empty-state');
                if (emptyState) {
                    emptyState.style.display = 'none';
                    structuredLogger.info('AUTO_GEN', 'Empty state hidden after generation');
                }
                
                // Show drop zones if they exist
                const dropZones = document.querySelectorAll('.drop-zone');
                dropZones.forEach(zone => {
                    if (zone.style.display === 'none') {
                        zone.style.display = 'flex';
                    }
                });
                
                // Update any generation counters
                const dashboardPanel = document.getElementById('dashboard-panel');
                if (dashboardPanel) {
                    const generatedMetric = dashboardPanel.querySelector('.mkcg-metric:nth-child(3) .mkcg-metric-value');
                    if (generatedMetric) {
                        generatedMetric.textContent = generatedCount.toString();
                    }
                }
                
                structuredLogger.info('AUTO_GEN', 'Empty state UI updated', { generatedCount });
            }
        } catch (error) {
            structuredLogger.error('AUTO_GEN', 'Failed to update empty state UI', error);
        }
    }
    
    /**
     * ROOT FIX: Get generation status and results
     * 
     * @returns {Object} Current generation status
     */
    getStatus() {
        return {
            isGenerating: this.isGenerating,
            lastResults: this.generationResults,
            resultCount: this.generationResults.length,
            lastGenerationTime: this.lastGenerationTime || null
        };
    }
    
    /**
     * ROOT FIX: Reset generation state
     */
    reset() {
        this.isGenerating = false;
        this.generationResults = [];
        this.lastGenerationTime = null;
        structuredLogger.info('AUTO_GEN', 'Auto-generation service reset');
    }
}

// Create and expose globally
const autoGenerationService = new AutoGenerationService();

// ROOT FIX: Expose globally
window.autoGenerationService = autoGenerationService;

console.log('✅ Auto-Generation Service: Global namespace setup complete');
