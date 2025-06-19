/**
 * Structured Logging System for Media Kit Builder
 * Provides comprehensive logging with timing analysis, race condition detection, and error tracking
 */

class StructuredLogger {
    constructor() {
        this.logs = [];
        this.initSteps = new Map();
        this.raceConditions = [];
        this.errors = [];
        this.warnings = [];
        this.logLevel = this.getLogLevel();
        this.maxLogs = 1000;
        this.startTime = performance.now();
        this.moduleColors = {
            'INIT': '#2196F3',
            'PERF': '#4CAF50',
            'ERROR': '#F44336',
            'WARN': '#FF9800',
            'INFO': '#9C27B0',
            'DEBUG': '#757575',
            'RACE': '#E91E63',
            'STATE': '#00BCD4',
            'UI': '#8BC34A',
            'MODAL': '#FFC107',
            'TEMPLATE': '#3F51B5'
        };
        
        // Setup console styling
        this.setupConsoleStyles();
        
        // Track initialization state
        this.initializationComplete = false;
        this.initializationStartTime = null;
        
        // Performance integration
        this.performanceEntries = new Map();
    }
    
    /**
     * Get log level from environment or default
     */
    getLogLevel() {
        const level = (typeof mkConfig !== 'undefined' && mkConfig.logLevel) || 'info';
        const levels = ['debug', 'info', 'warn', 'error'];
        return levels.includes(level) ? level : 'info';
    }
    
    /**
     * Setup console styling methods
     */
    setupConsoleStyles() {
        this.styles = {
            title: 'font-size: 14px; font-weight: bold;',
            module: 'font-weight: bold; padding: 2px 6px; border-radius: 3px; color: white;',
            timestamp: 'color: #666; font-size: 11px;',
            message: 'color: #333;',
            data: 'color: #666; font-style: italic;',
            error: 'color: #F44336; font-weight: bold;',
            success: 'color: #4CAF50;',
            warning: 'color: #FF9800;'
        };
    }
    
    /**
     * Core logging method
     */
    log(level, module, message, data = {}) {
        const levels = { debug: 0, info: 1, warn: 2, error: 3 };
        if (levels[level] < levels[this.logLevel]) return;
        
        const timestamp = performance.now();
        const entry = {
            timestamp,
            level,
            module,
            message,
            data,
            relativeTime: timestamp - this.startTime
        };
        
        // Store log
        this.logs.push(entry);
        if (this.logs.length > this.maxLogs) {
            this.logs.shift();
        }
        
        // Console output
        this.consoleOutput(entry);
        
        // Special handling
        if (level === 'error') {
            this.errors.push(entry);
        } else if (level === 'warn') {
            this.warnings.push(entry);
        }
        
        return entry;
    }
    
    /**
     * Console output with styling
     */
    consoleOutput(entry) {
        const time = new Date().toLocaleTimeString('en-US', { 
            hour12: false, 
            hour: '2-digit', 
            minute: '2-digit', 
            second: '2-digit',
            fractionalSecondDigits: 3 
        });
        
        const moduleColor = this.moduleColors[entry.module] || '#666';
        const emoji = this.getEmoji(entry.level, entry.module);
        
        const args = [
            `%c[${time}] %c[${entry.module}]%c ${emoji} ${entry.message}`,
            this.styles.timestamp,
            `${this.styles.module} background: ${moduleColor};`,
            this.styles.message
        ];
        
        if (Object.keys(entry.data).length > 0) {
            args[0] += ' %c%o';
            args.push(this.styles.data);
            args.push(entry.data);
        }
        
        const method = entry.level === 'error' ? 'error' : 
                       entry.level === 'warn' ? 'warn' : 
                       entry.level === 'debug' ? 'debug' : 'log';
        
        console[method](...args);
    }
    
    /**
     * Get emoji for log type
     */
    getEmoji(level, module) {
        const emojis = {
            'error': '❌',
            'warn': '⚠️',
            'info': 'ℹ️',
            'debug': '🔍',
            'success': '✅',
            'INIT': '🚀',
            'PERF': '⚡',
            'RACE': '🏁',
            'STATE': '💾',
            'UI': '🎨',
            'MODAL': '📋',
            'TEMPLATE': '📄'
        };
        
        return emojis[module] || emojis[level] || '•';
    }
    
    // Convenience methods
    debug(module, message, data = {}) {
        return this.log('debug', module, message, data);
    }
    
    info(module, message, data = {}) {
        return this.log('info', module, message, data);
    }
    
    warn(module, message, data = {}) {
        return this.log('warn', module, message, data);
    }
    
    error(module, message, error, data = {}) {
        const errorData = {
            ...data,
            error: error instanceof Error ? {
                message: error.message,
                stack: error.stack,
                name: error.name
            } : error
        };
        return this.log('error', module, message, errorData);
    }
    
    /**
     * Log initialization start
     */
    logInitStart(step, dependencies = []) {
        const startTime = performance.now();
        
        this.initSteps.set(step, {
            name: step,
            startTime,
            dependencies,
            status: 'running',
            events: []
        });
        
        this.info('INIT', `Starting: ${step}`, { 
            dependencies,
            step 
        });
        
        return startTime;
    }
    
    /**
     * Log initialization complete
     */
    logInitComplete(step, startTime, result = {}) {
        const duration = performance.now() - startTime;
        const stepData = this.initSteps.get(step);
        
        if (stepData) {
            stepData.endTime = performance.now();
            stepData.duration = duration;
            stepData.status = 'complete';
            stepData.result = result;
        }
        
        this.info('INIT', `✅ Completed: ${step}`, {
            duration: `${duration.toFixed(2)}ms`,
            ...result
        });
        
        // Track performance
        if (window.mkPerf && window.mkPerf.track) {
            window.mkPerf.track(`init-${step}`, startTime, { step });
        }
        
        return duration;
    }
    
    /**
     * Log initialization error
     */
    logInitError(step, error, context = {}) {
        const stepData = this.initSteps.get(step);
        
        if (stepData) {
            stepData.status = 'error';
            stepData.error = error;
        }
        
        this.error('INIT', `Failed: ${step}`, error, context);
    }
    
    /**
     * Log race condition
     */
    logRaceCondition(module, expected, actual, context = {}) {
        const raceCondition = {
            timestamp: performance.now(),
            module,
            expected,
            actual,
            context,
            resolved: false
        };
        
        this.raceConditions.push(raceCondition);
        
        this.error('RACE', `Race condition detected in ${module}`, null, {
            expected,
            actual,
            ...context
        });
        
        return raceCondition;
    }
    
    /**
     * Check for race condition
     */
    async checkRaceCondition(module, checkFn, options = {}) {
        const {
            timeout = 5000,
            interval = 100,
            expectedValue = true
        } = options;
        
        const startTime = performance.now();
        let lastValue = null;
        
        while (performance.now() - startTime < timeout) {
            try {
                const value = await checkFn();
                if (value === expectedValue) {
                    this.debug(module, 'Race condition check passed', {
                        duration: performance.now() - startTime,
                        value
                    });
                    return { success: true, value, duration: performance.now() - startTime };
                }
                lastValue = value;
            } catch (error) {
                this.debug(module, 'Race condition check error', { error: error.message });
            }
            
            await new Promise(resolve => setTimeout(resolve, interval));
        }
        
        // Race condition detected
        this.logRaceCondition(module, expectedValue, lastValue, {
            timeout,
            duration: performance.now() - startTime
        });
        
        return { success: false, value: lastValue, duration: performance.now() - startTime };
    }
    
    /**
     * Generate initialization report
     */
    generateInitReport() {
        console.group('%c🚀 Initialization Report', this.styles.title + ' color: #2196F3;');
        console.log('%c' + '='.repeat(80), 'color: #666');
        
        const steps = Array.from(this.initSteps.values());
        const totalDuration = steps.reduce((sum, step) => sum + (step.duration || 0), 0);
        
        // Summary
        console.log('%cSummary:', 'font-weight: bold;');
        console.log(`Total Steps: ${steps.length}`);
        console.log(`Total Duration: ${totalDuration.toFixed(2)}ms`);
        console.log(`Status: ${this.initializationComplete ? '✅ Complete' : '⏳ In Progress'}`);
        
        // Timeline
        console.log('\n%cTimeline:', 'font-weight: bold;');
        steps.forEach(step => {
            const status = step.status === 'complete' ? '✅' : 
                          step.status === 'error' ? '❌' : '⏳';
            const duration = step.duration ? `${step.duration.toFixed(2)}ms` : 'N/A';
            
            console.log(`${status} ${step.name.padEnd(30)} ${duration.padStart(10)}`);
        });
        
        // Waterfall visualization
        this.generateWaterfall(steps);
        
        // Race conditions
        if (this.raceConditions.length > 0) {
            console.log('\n%c⚠️ Race Conditions:', 'font-weight: bold; color: #F44336;');
            this.raceConditions.forEach(rc => {
                console.log(`- ${rc.module}: Expected ${rc.expected}, got ${rc.actual}`);
            });
        }
        
        console.groupEnd();
    }
    
    /**
     * Generate waterfall visualization
     */
    generateWaterfall(steps) {
        if (steps.length === 0) return;
        
        console.log('\n%cWaterfall:', 'font-weight: bold;');
        
        const maxNameLength = Math.max(...steps.map(s => s.name.length));
        const scale = 50; // characters for visualization
        const maxDuration = Math.max(...steps.map(s => s.duration || 0));
        
        steps.forEach(step => {
            if (!step.duration) return;
            
            const barLength = Math.round((step.duration / maxDuration) * scale);
            const bar = '█'.repeat(barLength);
            const name = step.name.padEnd(maxNameLength);
            
            const color = step.status === 'error' ? '#F44336' : '#4CAF50';
            console.log(`%c${name} |%c${bar}%c| ${step.duration.toFixed(0)}ms`,
                'color: #666;',
                `color: ${color};`,
                'color: #666;'
            );
        });
    }
    
    /**
     * Generate error report
     */
    generateErrorReport() {
        console.group('%c❌ Error Report', this.styles.title + ' color: #F44336;');
        console.log('%c' + '='.repeat(80), 'color: #666');
        
        if (this.errors.length === 0) {
            console.log('✅ No errors recorded');
        } else {
            console.log(`Total Errors: ${this.errors.length}`);
            console.log(`Total Warnings: ${this.warnings.length}`);
            
            console.log('\n%cErrors:', 'font-weight: bold;');
            this.errors.forEach((entry, index) => {
                console.group(`Error #${index + 1}: ${entry.module} - ${entry.message}`);
                console.log('Time:', new Date(this.startTime + entry.relativeTime).toLocaleTimeString());
                if (entry.data.error) {
                    console.error(entry.data.error);
                }
                console.log('Context:', entry.data);
                console.groupEnd();
            });
        }
        
        console.groupEnd();
    }
    
    /**
     * Generate timing report
     */
    generateTimingReport() {
        console.group('%c⚡ Timing Report', this.styles.title + ' color: #4CAF50;');
        console.log('%c' + '='.repeat(80), 'color: #666');
        
        // Group logs by module
        const moduleTimings = new Map();
        
        this.logs.forEach(log => {
            if (!moduleTimings.has(log.module)) {
                moduleTimings.set(log.module, []);
            }
            moduleTimings.get(log.module).push(log);
        });
        
        // Display timings
        moduleTimings.forEach((logs, module) => {
            const color = this.moduleColors[module] || '#666';
            console.log(`%c${module}:`, `font-weight: bold; color: ${color};`);
            
            logs.slice(-10).forEach(log => {
                const time = log.relativeTime.toFixed(2);
                console.log(`  ${time.padStart(8)}ms - ${log.message}`);
            });
        });
        
        console.groupEnd();
    }
    
    /**
     * Export logs
     */
    exportLogs(format = 'json') {
        const data = {
            startTime: this.startTime,
            logs: this.logs,
            errors: this.errors,
            warnings: this.warnings,
            raceConditions: this.raceConditions,
            initSteps: Array.from(this.initSteps.values())
        };
        
        if (format === 'json') {
            return JSON.stringify(data, null, 2);
        } else if (format === 'csv') {
            // Simple CSV export
            const headers = ['timestamp', 'level', 'module', 'message'];
            const rows = this.logs.map(log => 
                [log.timestamp, log.level, log.module, log.message].join(',')
            );
            return [headers.join(','), ...rows].join('\n');
        }
        
        return data;
    }
    
    /**
     * Search logs
     */
    search(query) {
        const results = this.logs.filter(log => 
            log.message.toLowerCase().includes(query.toLowerCase()) ||
            log.module.toLowerCase().includes(query.toLowerCase()) ||
            JSON.stringify(log.data).toLowerCase().includes(query.toLowerCase())
        );
        
        console.group(`%c🔍 Search Results for "${query}"`, this.styles.title);
        console.log(`Found ${results.length} matches`);
        
        results.forEach(log => {
            this.consoleOutput(log);
        });
        
        console.groupEnd();
        
        return results;
    }
    
    /**
     * Clear logs
     */
    clear() {
        this.logs = [];
        this.errors = [];
        this.warnings = [];
        this.raceConditions = [];
        console.log('Logs cleared');
    }
    
    /**
     * Set log level
     */
    setLogLevel(level) {
        const levels = ['debug', 'info', 'warn', 'error'];
        if (levels.includes(level)) {
            this.logLevel = level;
            console.log(`Log level set to: ${level}`);
        }
    }
    
    /**
     * Performance integration
     */
    logPerformance(operation, duration, metadata = {}) {
        this.info('PERF', `${operation}: ${duration.toFixed(2)}ms`, metadata);
        
        // Store performance entry
        if (!this.performanceEntries.has(operation)) {
            this.performanceEntries.set(operation, []);
        }
        this.performanceEntries.get(operation).push({ duration, metadata, timestamp: performance.now() });
    }
}

// Create singleton instance
const structuredLogger = new StructuredLogger();

// Export for module usage
export { structuredLogger };