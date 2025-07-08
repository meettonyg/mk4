/**
 * MKCG Data Mapper - Phase 2.1 Enhanced JavaScript Integration
 * 
 * PHASE 2.1 ENHANCEMENTS:
 * - Advanced field mapping intelligence with smart detection
 * - Enhanced component auto-population with priority scoring
 * - Performance optimization with intelligent caching
 * - Progressive field population and data quality analysis
 * - Batch processing for multiple components
 * 
 * @version 2.1.0-enhanced
 */

export class MKCGDataMapper {
    constructor() {
        this.componentSchemas = null;
        this.mkcgData = null;
        this.mappingCache = new Map();
        this.debugMode = false;
        
        // PHASE 2.1: Enhanced caching and performance
        this.performanceCache = new Map();
        this.batchCache = new Map();
        this.mappingStats = {
            totalMappings: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageMappingTime: 0,
            errorCount: 0
        };
        
        // PHASE 2.1: Advanced mapping intelligence
        this.fieldTypeAnalyzer = null;
        this.dataQualityScorer = null;
        this.priorityEngine = null;
        
        // PHASE 2.1: Enhanced initialization
        this.initializeEnhanced();
    }

    /**
     * PHASE 2.1: Enhanced initialization with performance monitoring
     */
    initializeEnhanced() {
        const initStart = performance.now();
        
        // Wait for guestifyData to be available with enhanced detection
        if (typeof window !== 'undefined' && window.guestifyData) {
            this.componentSchemas = window.guestifyData.componentSchemas || {};
            this.mkcgData = window.guestifyData.mkcgData || null;
            this.debugMode = window.guestifyData.systemConfig?.enableDebugMode || false;
            
            // PHASE 2.1: Initialize enhanced analyzers
            this.initializeAdvancedAnalyzers();
            
            const initDuration = performance.now() - initStart;
            
            if (this.debugMode) {
                console.log('🔗 Enhanced MKCG Data Mapper initialized:', {
                    hasSchemas: Object.keys(this.componentSchemas).length > 0,
                    hasMKCGData: !!this.mkcgData,
                    availableComponents: Object.keys(this.componentSchemas),
                    mkcgDataSources: this.mkcgData ? Object.keys(this.mkcgData) : [],
                    initTime: `${initDuration.toFixed(2)}ms`,
                    enhancedFeatures: {
                        fieldTypeAnalyzer: !!this.fieldTypeAnalyzer,
                        dataQualityScorer: !!this.dataQualityScorer,
                        priorityEngine: !!this.priorityEngine
                    }
                });
            }
        } else {
            // Enhanced retry with exponential backoff
            const retryDelay = Math.min(100 * Math.pow(1.5, this.initRetryCount || 0), 2000);
            this.initRetryCount = (this.initRetryCount || 0) + 1;
            
            if (this.initRetryCount < 10) {
                setTimeout(() => this.initializeEnhanced(), retryDelay);
            } else {
                console.warn('🔗 MKCG Data Mapper: Max initialization retries reached');
            }
        }
    }

    /**
     * PHASE 2.1: Initialize advanced analyzers for intelligent mapping
     */
    initializeAdvancedAnalyzers() {
        // Field Type Analyzer for smart detection
        this.fieldTypeAnalyzer = {
            analyzeFieldType: (value, fieldConfig) => {
                if (!value) return { type: 'empty', confidence: 1.0 };
                
                const stringValue = String(value).trim();
                
                // Enhanced type detection
                if (fieldConfig.type === 'image' || /\.(jpg|jpeg|png|gif|webp)$/i.test(stringValue)) {
                    return { type: 'image', confidence: 0.9 };
                }
                
                if (fieldConfig.type === 'color' || /^#[0-9A-F]{6}$/i.test(stringValue)) {
                    return { type: 'color', confidence: 0.95 };
                }
                
                if (fieldConfig.type === 'email' || /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) {
                    return { type: 'email', confidence: 0.9 };
                }
                
                if (fieldConfig.type === 'url' || /^https?:\/\/.+/.test(stringValue)) {
                    return { type: 'url', confidence: 0.85 };
                }
                
                if (stringValue.length > 200) {
                    return { type: 'textarea', confidence: 0.8 };
                }
                
                if (stringValue.length > 50) {
                    return { type: 'text-long', confidence: 0.7 };
                }
                
                return { type: 'text', confidence: 0.6 };
            },
            
            optimizeValue: (value, detectedType, fieldConfig) => {
                const stringValue = String(value).trim();
                
                switch (detectedType.type) {
                    case 'text-long':
                    case 'textarea':
                        return this.optimizeTextValue(stringValue, fieldConfig);
                    case 'image':
                        return this.optimizeImageValue(stringValue, fieldConfig);
                    case 'color':
                        return this.optimizeColorValue(stringValue, fieldConfig);
                    case 'email':
                    case 'url':
                        return stringValue; // Already validated
                    default:
                        return this.optimizeTextValue(stringValue, fieldConfig);
                }
            }
        };

        // Data Quality Scorer for intelligent prioritization
        this.dataQualityScorer = {
            scoreDataQuality: function(mappedProps, componentType) {
                let totalScore = 0;
                let maxPossibleScore = 0;
                const fieldScores = {};
                
                const schema = this.getComponentSchema(componentType);
                if (!schema?.settings) return { overallScore: 0, fieldScores: {} };
                
                for (const [fieldName, fieldConfig] of Object.entries(schema.settings)) {
                    maxPossibleScore += 100;
                    
                    if (mappedProps[fieldName]) {
                        const value = mappedProps[fieldName];
                        const fieldScore = this.scoreFieldQuality(value, fieldConfig);
                        fieldScores[fieldName] = fieldScore;
                        totalScore += fieldScore;
                    } else {
                        fieldScores[fieldName] = 0;
                    }
                }
                
                const overallScore = maxPossibleScore > 0 ? (totalScore / maxPossibleScore) * 100 : 0;
                
                return {
                    overallScore: Math.round(overallScore),
                    fieldScores,
                    completeness: Object.keys(mappedProps).length / Object.keys(schema.settings).length,
                    recommendation: this.getQualityRecommendation(overallScore)
                };
            }.bind(this),
            
            scoreFieldQuality: function(value, fieldConfig) {
                if (!value) return 0;
                
                const stringValue = String(value).trim();
                let score = 50; // Base score for having any value
                
                // Length appropriateness
                if (fieldConfig.minLength && stringValue.length >= fieldConfig.minLength) score += 20;
                if (fieldConfig.maxLength && stringValue.length <= fieldConfig.maxLength) score += 20;
                
                // Content quality
                if (stringValue.length > 10) score += 10; // Substantial content
                if (!/placeholder|example|sample/i.test(stringValue)) score += 10; // Not placeholder
                if (stringValue.split(' ').length > 3) score += 10; // Multiple words
                
                // Type-specific scoring
                switch (fieldConfig.type) {
                    case 'email':
                        if (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(stringValue)) score += 20;
                        break;
                    case 'url':
                        if (/^https?:\/\/.+/.test(stringValue)) score += 20;
                        break;
                    case 'image':
                        if (/\.(jpg|jpeg|png|gif|webp)$/i.test(stringValue)) score += 20;
                        break;
                }
                
                return Math.min(score, 100);
            }.bind(this),
            
            getQualityRecommendation: function(score) {
                if (score >= 80) return 'excellent';
                if (score >= 60) return 'good';
                if (score >= 40) return 'fair';
                if (score >= 20) return 'poor';
                return 'very-poor';
            }.bind(this)
        };

        // Priority Engine for intelligent component ordering
        this.priorityEngine = {
            calculateComponentPriority: (componentType, dataQuality, mkcgData) => {
                let priority = 0;
                
                // Base priority from schema
                const schema = this.getComponentSchema(componentType);
                if (schema?.mkcgIntegration?.priority === 'high') priority += 50;
                else if (schema?.mkcgIntegration?.priority === 'medium') priority += 30;
                else priority += 10;
                
                // Data quality bonus
                priority += dataQuality.overallScore * 0.3;
                
                // Completeness bonus
                priority += dataQuality.completeness * 20;
                
                // Essential components boost
                if (['hero', 'biography', 'topics'].includes(componentType)) {
                    priority += 25;
                }
                
                // Data freshness (if available)
                if (mkcgData?.meta_info?.extraction_timestamp) {
                    const hoursSinceExtraction = (Date.now() - mkcgData.meta_info.extraction_timestamp) / (1000 * 60 * 60);
                    if (hoursSinceExtraction < 24) priority += 15;
                    else if (hoursSinceExtraction < 168) priority += 5;
                }
                
                return Math.round(priority);
            },
            
            sortComponentsByPriority: (components) => {
                return components.sort((a, b) => b.priority - a.priority);
            }
        };
    }

    /**
     * PHASE 2.1: Enhanced map data to component with advanced intelligence
     * 
     * @param {string} componentType - The component type
     * @param {Object} mkcgData - The MKCG data object (optional)
     * @returns {Object} Enhanced mapped component props with metadata
     */
    mapDataToComponent(componentType, mkcgData = null) {
        const perfStart = performance.now();
        this.mappingStats.totalMappings++;
        
        try {
            // Use provided data or instance data
            const dataSource = mkcgData || this.mkcgData;
            
            if (!dataSource) {
                if (this.debugMode) {
                    console.log(`🔗 No MKCG data available for ${componentType}`);
                }
                return this.createEmptyMappingResult(componentType);
            }

            // PHASE 2.1: Enhanced cache check with performance tracking
            const cacheKey = `${componentType}_${this.getCacheKey(dataSource)}_v2.1`;
            if (this.mappingCache.has(cacheKey)) {
                this.mappingStats.cacheHits++;
                const cachedResult = this.mappingCache.get(cacheKey);
                
                if (this.debugMode) {
                    console.log(`🔗 Using enhanced cached mapping for ${componentType}`);
                }
                
                return {
                    ...cachedResult,
                    metadata: {
                        ...cachedResult.metadata,
                        cacheHit: true,
                        retrievalTime: performance.now() - perfStart
                    }
                };
            }

            this.mappingStats.cacheMisses++;

            // Get component schema
            const schema = this.getComponentSchema(componentType);
            if (!schema || !schema.settings) {
                if (this.debugMode) {
                    console.warn(`🔗 No schema found for component: ${componentType}`);
                }
                return this.createEmptyMappingResult(componentType, 'no-schema');
            }

            // PHASE 2.1: Enhanced mapping with intelligence
            const mappingResult = this.mapSchemaToDataEnhanced(schema.settings, dataSource, componentType);
            
            // PHASE 2.1: Calculate data quality score
            const dataQuality = this.dataQualityScorer.scoreDataQuality(mappingResult.props, componentType);
            
            // PHASE 2.1: Calculate component priority
            const priority = this.priorityEngine.calculateComponentPriority(componentType, dataQuality, dataSource);
            
            const duration = performance.now() - perfStart;
            this.updateAverageMappingTime(duration);
            
            // PHASE 2.1: Create enhanced result
            const enhancedResult = {
                props: mappingResult.props,
                metadata: {
                    componentType,
                    mappingVersion: '2.1.0-enhanced',
                    mappedFields: Object.keys(mappingResult.props).length,
                    totalFields: Object.keys(schema.settings).length,
                    mappingTime: duration,
                    cacheHit: false,
                    dataQuality,
                    priority,
                    fieldAnalysis: mappingResult.fieldAnalysis,
                    recommendations: this.generateRecommendations(mappingResult.props, dataQuality, componentType),
                    extractionTime: dataSource.meta_info?.extraction_timestamp || null
                }
            };
            
            // Cache with size limit
            if (this.mappingCache.size < 100) {
                this.mappingCache.set(cacheKey, enhancedResult);
            } else {
                // Remove oldest entry
                const firstKey = this.mappingCache.keys().next().value;
                this.mappingCache.delete(firstKey);
                this.mappingCache.set(cacheKey, enhancedResult);
            }
            
            if (this.debugMode) {
                console.log(`🔗 Enhanced mapping completed for ${componentType}:`, {
                    duration: `${duration.toFixed(2)}ms`,
                    mappedFields: Object.keys(mappingResult.props).length,
                    qualityScore: `${dataQuality.overallScore}%`,
                    priority: priority,
                    recommendation: dataQuality.recommendation,
                    props: mappingResult.props
                });
            }

            return enhancedResult;

        } catch (error) {
            this.mappingStats.errorCount++;
            console.error(`🔗 Error in enhanced mapping for ${componentType}:`, error);
            return this.createEmptyMappingResult(componentType, 'mapping-error', error.message);
        }
    }

    /**
     * PHASE 2.1: Enhanced schema mapping with advanced intelligence
     */
    mapSchemaToDataEnhanced(settings, dataSource, componentType) {
        const mappedProps = {};
        const fieldAnalysis = {};

        for (const [fieldName, fieldConfig] of Object.entries(settings)) {
            // Skip fields without MKCG mappings
            if (!fieldConfig.mkcgMapping) {
                continue;
            }

            // PHASE 2.1: Enhanced value extraction with multiple strategies
            const value = this.getNestedValueEnhanced(dataSource, fieldConfig.mkcgMapping);
            
            if (value !== null && value !== undefined && value !== '') {
                // PHASE 2.1: Advanced field analysis
                const typeAnalysis = this.fieldTypeAnalyzer.analyzeFieldType(value, fieldConfig);
                
                // PHASE 2.1: Optimized value processing
                const processedValue = this.fieldTypeAnalyzer.optimizeValue(value, typeAnalysis, fieldConfig);
                
                if (processedValue !== null) {
                    mappedProps[fieldName] = processedValue;
                    fieldAnalysis[fieldName] = {
                        originalValue: value,
                        processedValue: processedValue,
                        typeAnalysis: typeAnalysis,
                        mappingPath: fieldConfig.mkcgMapping,
                        confidence: typeAnalysis.confidence
                    };
                }
            }
        }

        return { props: mappedProps, fieldAnalysis };
    }

    /**
     * PHASE 2.1: Enhanced nested value extraction with fallback strategies
     */
    getNestedValueEnhanced(obj, path) {
        if (!obj || !path) {
            return null;
        }

        try {
            // Primary path extraction
            const primaryValue = path.split('.').reduce((current, key) => {
                return current && current[key] !== undefined ? current[key] : null;
            }, obj);

            if (primaryValue !== null && primaryValue !== '') {
                return primaryValue;
            }

            // PHASE 2.1: Fallback strategies for missing data
            return this.attemptFallbackExtraction(obj, path);

        } catch (error) {
            if (this.debugMode) {
                console.warn(`🔗 Error accessing path "${path}":`, error);
            }
            return null;
        }
    }

    /**
     * PHASE 2.1: Fallback extraction strategies for robust data retrieval
     */
    attemptFallbackExtraction(obj, originalPath) {
        // Strategy 1: Try case-insensitive matching
        const pathParts = originalPath.split('.');
        let caseInsensitiveResult = obj;
        
        for (const part of pathParts) {
            if (caseInsensitiveResult && typeof caseInsensitiveResult === 'object') {
                const keys = Object.keys(caseInsensitiveResult);
                const matchingKey = keys.find(key => key.toLowerCase() === part.toLowerCase());
                
                if (matchingKey) {
                    caseInsensitiveResult = caseInsensitiveResult[matchingKey];
                } else {
                    caseInsensitiveResult = null;
                    break;
                }
            } else {
                caseInsensitiveResult = null;
                break;
            }
        }
        
        if (caseInsensitiveResult !== null && caseInsensitiveResult !== '') {
            return caseInsensitiveResult;
        }

        // Strategy 2: Try partial path matching
        if (pathParts.length > 2) {
            const shortPath = pathParts.slice(-2).join('.');
            const partialResult = this.getNestedValue(obj, shortPath);
            if (partialResult !== null) {
                return partialResult;
            }
        }

        // Strategy 3: Search for similar field names
        const lastPart = pathParts[pathParts.length - 1];
        const similarFields = this.findSimilarFields(obj, lastPart);
        
        if (similarFields.length > 0) {
            return similarFields[0].value;
        }

        return null;
    }

    /**
     * PHASE 2.1: Find similar fields using fuzzy matching
     */
    findSimilarFields(obj, targetField, threshold = 0.7) {
        const results = [];
        
        const searchInObject = (current, path = '') => {
            if (!current || typeof current !== 'object') return;
            
            for (const [key, value] of Object.entries(current)) {
                const similarity = this.calculateStringSimilarity(key.toLowerCase(), targetField.toLowerCase());
                
                if (similarity >= threshold && value !== null && value !== '') {
                    results.push({
                        field: key,
                        path: path ? `${path}.${key}` : key,
                        value: value,
                        similarity: similarity
                    });
                }
                
                if (typeof value === 'object' && value !== null) {
                    const newPath = path ? `${path}.${key}` : key;
                    searchInObject(value, newPath);
                }
            }
        };
        
        searchInObject(obj);
        
        return results.sort((a, b) => b.similarity - a.similarity);
    }

    /**
     * PHASE 2.1: Calculate string similarity using Levenshtein distance
     */
    calculateStringSimilarity(str1, str2) {
        if (str1 === str2) return 1.0;
        
        const maxLength = Math.max(str1.length, str2.length);
        if (maxLength === 0) return 1.0;
        
        const distance = this.levenshteinDistance(str1, str2);
        return (maxLength - distance) / maxLength;
    }

    /**
     * PHASE 2.1: Levenshtein distance calculation
     */
    levenshteinDistance(str1, str2) {
        const matrix = [];
        
        for (let i = 0; i <= str2.length; i++) {
            matrix[i] = [i];
        }
        
        for (let j = 0; j <= str1.length; j++) {
            matrix[0][j] = j;
        }
        
        for (let i = 1; i <= str2.length; i++) {
            for (let j = 1; j <= str1.length; j++) {
                if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
                    matrix[i][j] = matrix[i - 1][j - 1];
                } else {
                    matrix[i][j] = Math.min(
                        matrix[i - 1][j - 1] + 1,
                        matrix[i][j - 1] + 1,
                        matrix[i - 1][j] + 1
                    );
                }
            }
        }
        
        return matrix[str2.length][str1.length];
    }

    /**
     * PHASE 2.1: Optimized text value processing
     */
    optimizeTextValue(value, fieldConfig) {
        let stringValue = String(value).trim();
        
        // Remove common placeholders
        if (/^(placeholder|example|sample|default|lorem ipsum|test)/i.test(stringValue)) {
            return null;
        }
        
        // Smart length limits with ellipsis
        if (fieldConfig.maxLength && stringValue.length > fieldConfig.maxLength) {
            // Try to cut at word boundary
            const words = stringValue.substring(0, fieldConfig.maxLength - 3).split(' ');
            words.pop(); // Remove potentially cut word
            stringValue = words.join(' ') + '...';
        }
        
        // Clean up formatting
        stringValue = stringValue
            .replace(/\s+/g, ' ') // Multiple spaces to single
            .replace(/\n\s*\n/g, '\n') // Multiple newlines to single
            .trim();
        
        return stringValue;
    }

    /**
     * PHASE 2.1: Optimized image value processing
     */
    optimizeImageValue(value, fieldConfig) {
        const stringValue = String(value).trim();
        
        // Enhanced URL validation
        if (stringValue.match(/^https?:\/\/.+\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i)) {
            return stringValue;
        }
        
        // Try to construct URL if it's a partial path
        if (stringValue.match(/^\/.*\.(jpg|jpeg|png|gif|webp|svg)$/i)) {
            return window.location.origin + stringValue;
        }
        
        return null;
    }

    /**
     * PHASE 2.1: Optimized color value processing
     */
    optimizeColorValue(value, fieldConfig) {
        const stringValue = String(value).trim();
        
        // Hex color validation and conversion
        if (stringValue.match(/^#[0-9A-F]{3}$/i)) {
            // Convert 3-digit to 6-digit
            return '#' + stringValue.slice(1).split('').map(c => c + c).join('');
        }
        
        if (stringValue.match(/^#[0-9A-F]{6}$/i)) {
            return stringValue.toUpperCase();
        }
        
        // RGB color conversion
        const rgbMatch = stringValue.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
        if (rgbMatch) {
            const [, r, g, b] = rgbMatch;
            return '#' + [r, g, b].map(x => parseInt(x).toString(16).padStart(2, '0')).join('').toUpperCase();
        }
        
        return fieldConfig.default || '#000000';
    }

    /**
     * PHASE 2.1: Create empty mapping result with metadata
     */
    createEmptyMappingResult(componentType, reason = 'no-data', details = '') {
        return {
            props: {},
            metadata: {
                componentType,
                mappingVersion: '2.1.0-enhanced',
                mappedFields: 0,
                totalFields: 0,
                mappingTime: 0,
                cacheHit: false,
                dataQuality: {
                    overallScore: 0,
                    fieldScores: {},
                    completeness: 0,
                    recommendation: 'no-data'
                },
                priority: 0,
                fieldAnalysis: {},
                recommendations: [`No MKCG data available for ${componentType}`],
                reason,
                details
            }
        };
    }

    /**
     * PHASE 2.1: Generate intelligent recommendations
     */
    generateRecommendations(mappedProps, dataQuality, componentType) {
        const recommendations = [];
        
        if (dataQuality.overallScore < 50) {
            recommendations.push(`Consider updating MKCG data for ${componentType} to improve quality`);
        }
        
        if (dataQuality.completeness < 0.5) {
            recommendations.push(`Only ${Math.round(dataQuality.completeness * 100)}% of fields populated - consider adding more data`);
        }
        
        // Field-specific recommendations
        for (const [field, score] of Object.entries(dataQuality.fieldScores)) {
            if (score < 30 && mappedProps[field]) {
                recommendations.push(`Field '${field}' has low quality score - consider improving content`);
            }
        }
        
        if (recommendations.length === 0) {
            recommendations.push(`${componentType} mapping looks great! All data quality checks passed.`);
        }
        
        return recommendations;
    }

    /**
     * PHASE 2.1: Enhanced batch processing for multiple components
     */
    batchMapComponents(componentTypes, mkcgData = null) {
        const batchStart = performance.now();
        const results = new Map();
        const dataSource = mkcgData || this.mkcgData;
        
        if (!dataSource) {
            componentTypes.forEach(type => {
                results.set(type, this.createEmptyMappingResult(type, 'no-data'));
            });
            return {
                results: Object.fromEntries(results),
                batchMetadata: {
                    totalComponents: componentTypes.length,
                    successfulMappings: 0,
                    batchTime: performance.now() - batchStart,
                    cacheHitRate: 0
                }
            };
        }

        let cacheHits = 0;
        let successfulMappings = 0;

        componentTypes.forEach(componentType => {
            try {
                const mappingResult = this.mapDataToComponent(componentType, dataSource);
                results.set(componentType, mappingResult);
                
                if (mappingResult.metadata.cacheHit) cacheHits++;
                if (mappingResult.metadata.mappedFields > 0) successfulMappings++;
                
            } catch (error) {
                results.set(componentType, this.createEmptyMappingResult(componentType, 'batch-error', error.message));
            }
        });

        const batchDuration = performance.now() - batchStart;
        
        return {
            results: Object.fromEntries(results),
            batchMetadata: {
                totalComponents: componentTypes.length,
                successfulMappings,
                batchTime: batchDuration,
                cacheHitRate: (cacheHits / componentTypes.length) * 100,
                averageTimePerComponent: batchDuration / componentTypes.length
            }
        };
    }

    /**
     * PHASE 2.1: Enhanced auto-populatable components with priority scoring
     */
    getAutoPopulatableComponentsEnhanced(mkcgData = null) {
        const dataSource = mkcgData || this.mkcgData;
        
        if (!dataSource || !this.componentSchemas) {
            return [];
        }

        const autoPopulatable = [];
        
        // ROOT FIX: Diagnostic logging for component schemas
        console.log('🔍 DIAGNOSTIC: Component schemas available:', Object.keys(this.componentSchemas));
        
        // ROOT FIX: Check for any "bio" entries in schemas
        const bioEntries = Object.keys(this.componentSchemas).filter(key => 
            key.includes('bio') || key === 'bio'
        );
        if (bioEntries.length > 0) {
            console.error('🚨 DIAGNOSTIC: Found bio-related entries in component schemas:', bioEntries);
        }

        for (const [componentType, schema] of Object.entries(this.componentSchemas)) {
            // ROOT FIX: Log each component being checked
            if (this.debugMode || componentType.includes('bio')) {
                console.log(`🔍 DIAGNOSTIC: Checking component "${componentType}" for auto-population`);
            }
            
            if (this.canAutoPopulate(componentType, dataSource)) {
                const mappingResult = this.mapDataToComponent(componentType, dataSource);
                
                // ROOT FIX: Extra validation for biography/bio mapping
                if (componentType === 'bio' || componentType.includes('bio')) {
                    console.error('🚨 DIAGNOSTIC: Processing bio-related component:', componentType);
                    console.error('Schema:', schema);
                    console.error('Mapping result:', mappingResult);
                }
                
                autoPopulatable.push({
                    type: componentType,
                    name: schema.name,
                    priority: mappingResult.metadata.priority,
                    dataQuality: mappingResult.metadata.dataQuality,
                    mappedFields: mappingResult.metadata.mappedFields,
                    totalFields: mappingResult.metadata.totalFields,
                    completeness: mappingResult.metadata.dataQuality.completeness,
                    recommendation: mappingResult.metadata.dataQuality.recommendation,
                    estimatedProps: mappingResult.props
                });
            }
        }

        // Sort by priority score
        const sortedResults = this.priorityEngine.sortComponentsByPriority(autoPopulatable);
        
        // ROOT FIX: Final validation check
        const bioResults = sortedResults.filter(comp => comp.type === 'bio' || comp.type.includes('bio'));
        if (bioResults.length > 0) {
            console.error('🚨 DIAGNOSTIC: Bio components found in final auto-populatable results:');
            console.error(bioResults);
        }
        
        console.log('✅ DIAGNOSTIC: Auto-populatable components:', sortedResults.map(c => c.type));
        
        return sortedResults;
    }

    /**
     * PHASE 2.1: Update average mapping time for performance monitoring
     */
    updateAverageMappingTime(duration) {
        const totalTime = this.mappingStats.averageMappingTime * (this.mappingStats.totalMappings - 1);
        this.mappingStats.averageMappingTime = (totalTime + duration) / this.mappingStats.totalMappings;
    }

    /**
     * PHASE 2.1: Enhanced performance statistics
     */
    getPerformanceStats() {
        return {
            ...this.mappingStats,
            cacheHitRate: this.mappingStats.totalMappings > 0 ? 
                (this.mappingStats.cacheHits / this.mappingStats.totalMappings) * 100 : 0,
            cacheSize: this.mappingCache.size,
            averageMappingTime: `${this.mappingStats.averageMappingTime.toFixed(2)}ms`,
            enhancedFeatures: {
                fieldTypeAnalyzer: !!this.fieldTypeAnalyzer,
                dataQualityScorer: !!this.dataQualityScorer,
                priorityEngine: !!this.priorityEngine
            }
        };
    }

    /**
     * PHASE 2.1: Enhanced cache management
     */
    optimizeCache() {
        const maxCacheSize = 50;
        
        if (this.mappingCache.size > maxCacheSize) {
            // Remove least recently used entries
            const entries = Array.from(this.mappingCache.entries());
            const sortedByTime = entries.sort((a, b) => 
                (a[1].metadata.mappingTime || 0) - (b[1].metadata.mappingTime || 0)
            );
            
            const keepCount = Math.floor(maxCacheSize * 0.8);
            const toKeep = sortedByTime.slice(-keepCount);
            
            this.mappingCache.clear();
            toKeep.forEach(([key, value]) => {
                this.mappingCache.set(key, value);
            });
            
            if (this.debugMode) {
                console.log(`🔗 Cache optimized: kept ${keepCount} entries`);
            }
        }
    }

    /**
     * PHASE 2.1: Legacy compatibility methods (keeping original API)
     */
    
    // Keep original getNestedValue for backward compatibility
    getNestedValue(obj, path) {
        return this.getNestedValueEnhanced(obj, path);
    }

    /**
     * CRITICAL FIX: scoreFieldQuality method at class level
     * Delegates to dataQualityScorer if available, provides fallback otherwise
     */
    scoreFieldQuality(value, fieldConfig) {
        // If the advanced analyzer is available, use it
        if (this.dataQualityScorer && typeof this.dataQualityScorer.scoreFieldQuality === 'function') {
            return this.dataQualityScorer.scoreFieldQuality(value, fieldConfig);
        }
        
        // Fallback implementation
        if (!value) return 0;
        
        const stringValue = String(value).trim();
        let score = 50; // Base score for having any value
        
        // Length appropriateness
        if (fieldConfig.minLength && stringValue.length >= fieldConfig.minLength) score += 20;
        if (fieldConfig.maxLength && stringValue.length <= fieldConfig.maxLength) score += 20;
        
        // Content quality
        if (stringValue.length > 10) score += 10; // Substantial content
        if (!/placeholder|example|sample/i.test(stringValue)) score += 10; // Not placeholder
        if (stringValue.split(' ').length > 3) score += 10; // Multiple words
        
        return Math.min(score, 100);
    }

    /**
     * CRITICAL FIX: getQualityRecommendation method at class level
     * Delegates to dataQualityScorer if available, provides fallback otherwise
     */
    getQualityRecommendation(score) {
        // If the advanced analyzer is available, use it
        if (this.dataQualityScorer && typeof this.dataQualityScorer.getQualityRecommendation === 'function') {
            return this.dataQualityScorer.getQualityRecommendation(score);
        }
        
        // Fallback implementation
        if (score >= 80) return 'excellent';
        if (score >= 60) return 'good';
        if (score >= 40) return 'fair';
        if (score >= 20) return 'poor';
        return 'very-poor';
    }

    // Keep original methods with enhanced versions
    canAutoPopulate(componentType, mkcgData = null) {
        const mappingResult = this.mapDataToComponent(componentType, mkcgData);
        return mappingResult.metadata.mappedFields > 0 && 
               mappingResult.metadata.dataQuality.overallScore > 30;
    }

    getAutoPopulatableComponents(mkcgData = null) {
        return this.getAutoPopulatableComponentsEnhanced(mkcgData);
    }

    // Enhanced debug and validation methods
    validateAllMappingsEnhanced() {
        const results = {
            total: 0,
            successful: 0,
            failed: 0,
            averageQuality: 0,
            details: []
        };

        if (!this.componentSchemas) {
            return { error: 'No component schemas available' };
        }

        let totalQuality = 0;

        for (const [componentType, schema] of Object.entries(this.componentSchemas)) {
            results.total++;
            
            try {
                const mappingResult = this.mapDataToComponent(componentType);
                const hasData = mappingResult.metadata.mappedFields > 0;
                
                results.details.push({
                    component: componentType,
                    success: true,
                    hasData,
                    mappedFields: mappingResult.metadata.mappedFields,
                    qualityScore: mappingResult.metadata.dataQuality.overallScore,
                    priority: mappingResult.metadata.priority,
                    recommendation: mappingResult.metadata.dataQuality.recommendation,
                    props: mappingResult.props
                });
                
                totalQuality += mappingResult.metadata.dataQuality.overallScore;
                results.successful++;
            } catch (error) {
                results.details.push({
                    component: componentType,
                    success: false,
                    error: error.message
                });
                
                results.failed++;
            }
        }

        results.averageQuality = results.successful > 0 ? totalQuality / results.successful : 0;

        return results;
    }

    // Keep original methods for backward compatibility
    processFieldValue(value, fieldConfig) {
        const typeAnalysis = this.fieldTypeAnalyzer.analyzeFieldType(value, fieldConfig);
        return this.fieldTypeAnalyzer.optimizeValue(value, typeAnalysis, fieldConfig);
    }

    processTextValue(value, fieldConfig) {
        return this.optimizeTextValue(value, fieldConfig);
    }

    processTextareaValue(value, fieldConfig) {
        const optimized = this.optimizeTextValue(value, fieldConfig);
        return optimized ? optimized.replace(/\n/g, '<br>') : null;
    }

    processSelectValue(value, fieldConfig) {
        if (!fieldConfig.options) {
            return String(value);
        }

        const matchingOption = fieldConfig.options.find(option => 
            option.value === value || option.label === value
        );

        return matchingOption ? matchingOption.value : fieldConfig.default;
    }

    processBooleanValue(value, fieldConfig) {
        if (typeof value === 'boolean') {
            return value;
        }
        
        const stringValue = String(value).toLowerCase();
        return ['true', '1', 'yes', 'on'].includes(stringValue);
    }

    processImageValue(value, fieldConfig) {
        return this.optimizeImageValue(value, fieldConfig);
    }

    processColorValue(value, fieldConfig) {
        return this.optimizeColorValue(value, fieldConfig);
    }

    // Keep other original methods unchanged
    getComponentSchema(componentType) {
        if (!this.componentSchemas) {
            return null;
        }

        if (this.componentSchemas[componentType]) {
            return this.componentSchemas[componentType];
        }

        const lowerType = componentType.toLowerCase();
        for (const [key, schema] of Object.entries(this.componentSchemas)) {
            if (key.toLowerCase() === lowerType) {
                return schema;
            }
        }

        return null;
    }

    getCacheKey(dataSource) {
        try {
            if (dataSource.meta_info && dataSource.meta_info.extraction_timestamp) {
                return String(dataSource.meta_info.extraction_timestamp);
            }
            
            return String(JSON.stringify(dataSource).length);
        } catch (error) {
            return 'default';
        }
    }

    clearCache() {
        this.mappingCache.clear();
        this.performanceCache.clear();
        this.batchCache.clear();
        
        // Reset stats
        this.mappingStats = {
            totalMappings: 0,
            cacheHits: 0,
            cacheMisses: 0,
            averageMappingTime: 0,
            errorCount: 0
        };
        
        if (this.debugMode) {
            console.log('🔗 Enhanced MKCG mapping cache cleared');
        }
    }

    getDataAvailabilitySummary() {
        if (!this.mkcgData) {
            return { hasData: false, components: [] };
        }

        const summary = {
            hasData: true,
            extractionTime: this.mkcgData.meta_info?.extraction_date,
            postId: this.mkcgData.meta_info?.post_id,
            components: []
        };

        for (const [componentType, schema] of Object.entries(this.componentSchemas)) {
            if (schema.mkcgIntegration) {
                const mappingResult = this.mapDataToComponent(componentType);
                
                summary.components.push({
                    type: componentType,
                    name: schema.name,
                    dataSource: schema.mkcgIntegration.dataSource,
                    canAutoPopulate: this.canAutoPopulate(componentType),
                    mappedFields: mappingResult.metadata.mappedFields,
                    availableFields: Object.keys(mappingResult.props),
                    qualityScore: mappingResult.metadata.dataQuality.overallScore,
                    priority: mappingResult.metadata.priority,
                    recommendation: mappingResult.metadata.dataQuality.recommendation
                });
            }
        }

        return summary;
    }

    validateAllMappings() {
        return this.validateAllMappingsEnhanced();
    }
}

// Create singleton instance
export const mkcgDataMapper = new MKCGDataMapper();

// PHASE 2.1: Enhanced global exposure
if (typeof window !== 'undefined') {
    window.mkcgDataMapper = mkcgDataMapper;
    
    // Enhanced console debugging commands
    window.mkcgDebug = {
        mapper: mkcgDataMapper,
        testMapping: (componentType) => mkcgDataMapper.mapDataToComponent(componentType),
        validateAll: () => mkcgDataMapper.validateAllMappingsEnhanced(),
        getAutoPopulatable: () => mkcgDataMapper.getAutoPopulatableComponentsEnhanced(),
        getSummary: () => mkcgDataMapper.getDataAvailabilitySummary(),
        clearCache: () => mkcgDataMapper.clearCache(),
        getPerformanceStats: () => mkcgDataMapper.getPerformanceStats(),
        batchMap: (components) => mkcgDataMapper.batchMapComponents(components),
        optimizeCache: () => mkcgDataMapper.optimizeCache(),
        
        // ROOT FIX: Bio component diagnostic tools
        diagnoseBioIssue: () => {
            console.group('🔍 BIO COMPONENT DIAGNOSTIC');
            
            // Check component schemas
            const schemas = window.guestifyData?.componentSchemas || {};
            console.log('1. Component schemas available:', Object.keys(schemas));
            
            const bioSchemas = Object.keys(schemas).filter(key => 
                key.includes('bio') || key === 'bio'
            );
            if (bioSchemas.length > 0) {
                console.error('🚨 Found bio-related schemas:', bioSchemas);
                bioSchemas.forEach(key => {
                    console.log(`Schema for "${key}":`, schemas[key]);
                });
            } else {
                console.log('✅ No problematic bio schemas found');
            }
            
            // Check auto-populatable components
            try {
                const autoPopulatable = mkcgDataMapper.getAutoPopulatableComponentsEnhanced();
                console.log('2. Auto-populatable components:', autoPopulatable.map(c => c.type));
                
                const bioComponents = autoPopulatable.filter(c => c.type === 'bio');
                if (bioComponents.length > 0) {
                    console.error('🚨 Found bio components in auto-populatable list:', bioComponents);
                } else {
                    console.log('✅ No bio components in auto-populatable list');
                }
            } catch (error) {
                console.error('Error getting auto-populatable components:', error);
            }
            
            // Check if enhanced component manager has bio references
            if (window.enhancedComponentManager) {
                console.log('3. Enhanced component manager status:', window.enhancedComponentManager.getStatus());
            }
            
            // Check browser storage for cached bio references
            try {
                const localStorageKeys = Object.keys(localStorage).filter(key => 
                    key.includes('bio') || localStorage[key].includes('bio')
                );
                if (localStorageKeys.length > 0) {
                    console.warn('⚠️ Found bio references in localStorage:', localStorageKeys);
                } else {
                    console.log('✅ No bio references in localStorage');
                }
            } catch (error) {
                console.log('Could not check localStorage:', error.message);
            }
            
            // Check current state
            if (window.enhancedStateManager) {
                const state = window.enhancedStateManager.getState();
                const bioComponents = Object.values(state.components || {}).filter(comp => comp.type === 'bio');
                if (bioComponents.length > 0) {
                    console.error('🚨 Found bio components in current state:', bioComponents);
                } else {
                    console.log('✅ No bio components in current state');
                }
            }
            
            console.groupEnd();
            
            return {
                schemas: Object.keys(schemas),
                bioSchemas,
                hasEnhancedComponentManager: !!window.enhancedComponentManager,
                hasStateManager: !!window.enhancedStateManager,
                hasMkcgDataMapper: !!mkcgDataMapper
            };
        },
        
        // ROOT FIX: Clear any cached bio references
        clearBioReferences: () => {
            console.log('🧹 Clearing potential bio references...');
            
            // Clear mapper cache
            if (mkcgDataMapper && typeof mkcgDataMapper.clearCache === 'function') {
                mkcgDataMapper.clearCache();
                console.log('✅ Cleared MKCG mapper cache');
            }
            
            // Clear localStorage keys that might contain bio references
            try {
                const keysToRemove = Object.keys(localStorage).filter(key => 
                    key.includes('bio') || key.includes('component') || key.includes('guestify')
                );
                keysToRemove.forEach(key => {
                    localStorage.removeItem(key);
                    console.log(`✅ Removed localStorage key: ${key}`);
                });
            } catch (error) {
                console.warn('Could not clear localStorage:', error.message);
            }
            
            console.log('🎉 Bio reference cleanup completed. Try refreshing the page.');
        },
        
        // PHASE 2.1: Enhanced debugging commands
        testComponentQuality: (componentType) => {
            const result = mkcgDataMapper.mapDataToComponent(componentType);
            console.log(`Quality Analysis for ${componentType}:`, result.metadata.dataQuality);
            return result;
        },
        
        compareComponents: (componentTypes) => {
            const comparison = {};
            componentTypes.forEach(type => {
                const result = mkcgDataMapper.mapDataToComponent(type);
                comparison[type] = {
                    quality: result.metadata.dataQuality.overallScore,
                    priority: result.metadata.priority,
                    fields: result.metadata.mappedFields
                };
            });
            console.table(comparison);
            return comparison;
        },
        
        runPerformanceTest: (iterations = 10) => {
            const componentTypes = Object.keys(mkcgDataMapper.componentSchemas || {});
            const startTime = performance.now();
            
            for (let i = 0; i < iterations; i++) {
                componentTypes.forEach(type => {
                    mkcgDataMapper.mapDataToComponent(type);
                });
            }
            
            const endTime = performance.now();
            const totalMappings = iterations * componentTypes.length;
            const avgTime = (endTime - startTime) / totalMappings;
            
            console.log(`Performance Test Results:
- Total mappings: ${totalMappings}
- Total time: ${(endTime - startTime).toFixed(2)}ms
- Average per mapping: ${avgTime.toFixed(2)}ms
- Cache hit rate: ${mkcgDataMapper.getPerformanceStats().cacheHitRate.toFixed(1)}%`);
            
            return {
                totalMappings,
                totalTime: endTime - startTime,
                averageTime: avgTime,
                cacheHitRate: mkcgDataMapper.getPerformanceStats().cacheHitRate
            };
        }
    };
    
    console.log('🔗 Enhanced MKCG Debug Tools Available:');
    console.log('Commands: mkcgDebug.testMapping(), mkcgDebug.validateAll(), mkcgDebug.testComponentQuality()');
    console.log('Performance: mkcgDebug.runPerformanceTest(), mkcgDebug.getPerformanceStats()');
    console.log('Batch: mkcgDebug.batchMap([...]), mkcgDebug.compareComponents([...])');  
    console.log('🔍 DIAGNOSTIC: mkcgDebug.diagnoseBioIssue(), mkcgDebug.clearBioReferences()');
    console.log('🔗 ROOT FIX: Run mkcgDebug.diagnoseBioIssue() to identify "bio" component issues');
}
