/**
 * Central ID Generation Service
 * Single source of truth for all ID generation
 * 
 * @since 2.1.0
 */
(function() {
    'use strict';

    class IDGenerator {
        constructor() {
            this.counters = {};
            this.prefix = 'gmkb';
            this.logger = window.structuredLogger || console;
            this.usedIds = new Set();
        }

        /**
         * Generate a unique ID for any entity type
         * @param {string} type - Entity type (component, section, etc.)
         * @param {string} subtype - Optional subtype
         * @returns {string} Unique ID
         */
        generate(type, subtype = '') {
            const prefix = subtype || type;
            const timestamp = Date.now();
            const random = Math.random().toString(36).substr(2, 9);
            
            // Track ID generation for debugging
            if (!this.counters[type]) {
                this.counters[type] = 0;
            }
            this.counters[type]++;
            
            let id = `${prefix}-${timestamp}-${random}`;
            
            // Ensure uniqueness
            while (this.usedIds.has(id)) {
                const extraRandom = Math.random().toString(36).substr(2, 5);
                id = `${prefix}-${timestamp}-${random}-${extraRandom}`;
            }
            
            this.usedIds.add(id);
            
            this.logger.info('ID_GENERATOR', `Generated ${type} ID: ${id}`);
            
            return id;
        }

        /**
         * Generate a component ID
         * @param {string} componentType - Type of component
         * @returns {string} Unique component ID
         */
        generateComponentId(componentType) {
            return this.generate('component', componentType);
        }

        /**
         * Generate a section ID
         * @returns {string} Unique section ID
         */
        generateSectionId() {
            return this.generate('section');
        }

        /**
         * Check if an ID exists
         * @param {string} id - ID to check
         * @returns {boolean} Whether ID exists
         */
        hasId(id) {
            return this.usedIds.has(id);
        }

        /**
         * Register an existing ID (for loading saved state)
         * @param {string} id - ID to register
         */
        registerId(id) {
            this.usedIds.add(id);
            
            // Update counters based on registered IDs
            const parts = id.split('-');
            if (parts.length >= 2) {
                const type = parts[0];
                if (!this.counters[type]) {
                    this.counters[type] = 0;
                }
                this.counters[type]++;
            }
        }

        /**
         * Get generation statistics
         * @returns {Object} ID generation counts by type
         */
        getStats() {
            return { 
                counters: { ...this.counters },
                totalGenerated: Object.values(this.counters).reduce((a, b) => a + b, 0),
                uniqueIds: this.usedIds.size
            };
        }

        /**
         * Reset counters (for testing)
         */
        reset() {
            this.counters = {};
            this.usedIds.clear();
        }
    }

    // Singleton instance
    window.gmkbIDGenerator = window.gmkbIDGenerator || new IDGenerator();

    // Log initialization
    console.log('✅ ID Generator: Initialized and ready');
    if (window.structuredLogger) {
        window.structuredLogger.info('ID_GENERATOR', 'Central ID Generator initialized');
    }

    // Announce readiness
    document.dispatchEvent(new CustomEvent('gmkb:id-generator-ready', {
        detail: { generator: window.gmkbIDGenerator }
    }));

    // Export for module systems
    if (typeof module !== 'undefined' && module.exports) {
        module.exports = IDGenerator;
    }

    // Add test commands
    if (window.gmkbData?.debugMode || true) {
        window.testIDGenerator = () => {
            console.log('=== ID GENERATOR TEST ===');
            const componentId = window.gmkbIDGenerator.generateComponentId('test');
            const sectionId = window.gmkbIDGenerator.generateSectionId();
            const stats = window.gmkbIDGenerator.getStats();
            
            console.log('Generated component ID:', componentId);
            console.log('Generated section ID:', sectionId);
            console.log('Stats:', stats);
            console.log('========================');
            
            return { componentId, sectionId, stats };
        };
        
        console.log('ID Generator Commands:');
        console.log('  testIDGenerator() - Test ID generation');
        console.log('  gmkbIDGenerator.getStats() - Get generation statistics');
    }

})();