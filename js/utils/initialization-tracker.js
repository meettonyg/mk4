/**
 * Initialization Tracker
 * Tracks initialization steps, dependencies, and detects issues
 */

import { structuredLogger } from './structured-logger.js';

class InitializationTracker {
    constructor(logger = structuredLogger) {
        this.logger = logger;
        this.steps = new Map();
        this.dependencies = new Map();
        this.completedSteps = new Set();
        this.failedSteps = new Set();
        this.stepTimings = new Map();
        this.dependencyGraph = new Map();
        this.timeoutHandlers = new Map(); // Store timeout IDs for cancellation
        
        // Track initialization state
        this.startTime = null;
        this.endTime = null;
        this.status = 'idle'; // idle, running, complete, failed
    }
    
    /**
     * Register an initialization step
     */
    registerStep(name, config = {}) {
        const {
            dependencies = [],
            timeout = 10000,
            critical = true,
            retryCount = 0,
            description = ''
        } = config;
        
        this.steps.set(name, {
            name,
            dependencies,
            timeout,
            critical,
            retryCount,
            description,
            attempts: 0,
            registered: performance.now()
        });
        
        // Build dependency graph
        this.dependencies.set(name, new Set(dependencies));
        dependencies.forEach(dep => {
            if (!this.dependencyGraph.has(dep)) {
                this.dependencyGraph.set(dep, new Set());
            }
            this.dependencyGraph.get(dep).add(name);
        });
        
        this.logger.debug('INIT', `Registered step: ${name}`, {
            dependencies,
            timeout,
            critical
        });
    }
    
    /**
     * PHASE 2.3: ENHANCED STEP INITIALIZATION WITH TIMEOUT PROMISE MANAGEMENT
     * Fixes unhandled promise rejections and implements proper cleanup
     */
    async startStep(name) {
        const step = this.steps.get(name);
        if (!step) {
            throw new Error(`Unknown step: ${name}`);
        }
        
        // Check if already running or completed
        if (this.completedSteps.has(name)) {
            this.logger.warn('INIT', `Step already completed: ${name}`);
            return { skipped: true };
        }
        
        // Validate dependencies
        const validation = await this.validateDependencies(name);
        if (!validation.ready) {
            if (step.critical) {
                throw new Error(`Dependencies not met for ${name}: ${validation.missing.join(', ')}`);
            }
            this.logger.warn('INIT', `Skipping ${name} - dependencies not met`, {
                missing: validation.missing
            });
            return { skipped: true, reason: 'dependencies' };
        }
        
        // Track timing
        const startTime = performance.now();
        this.stepTimings.set(name, { startTime, status: 'running' });
        
        // Log start
        this.logger.logInitStart(name, step.dependencies);
        
        // Update status
        if (this.status === 'idle') {
            this.status = 'running';
            this.startTime = startTime;
        }
        
        step.attempts++;
        
        // PHASE 2.3: Enhanced timeout promise with proper rejection handling
        let timeoutId;
        let timeoutResolve, timeoutReject;
        
        const timeoutPromise = new Promise((resolve, reject) => {
            timeoutResolve = resolve;
            timeoutReject = reject;
            
            timeoutId = setTimeout(() => {
                // PHASE 2.3: Only reject if the step hasn't completed yet and cleanup properly
                if (!this.completedSteps.has(name) && !this.failedSteps.has(name)) {
                    this.logger.warn('INIT', `Phase 2.3: Step timeout triggered for ${name} after ${step.timeout}ms`);
                    
                    // Create timeout error with enhanced context
                    const timeoutError = new Error(`Timeout: ${name} took longer than ${step.timeout}ms`);
                    timeoutError.stepName = name;
                    timeoutError.timeout = step.timeout;
                    timeoutError.attempts = step.attempts;
                    timeoutError.isTimeout = true;
                    
                    reject(timeoutError);
                } else {
                    // Step completed/failed before timeout - resolve to prevent hanging
                    resolve({ timeoutCancelled: true, stepName: name });
                }
            }, step.timeout);
        });
        
        // PHASE 2.3: Store enhanced timeout information for cancellation
        this.timeoutHandlers.set(name, {
            timeoutId,
            timeoutResolve,
            timeoutReject,
            stepName: name,
            startTime,
            timeout: step.timeout
        });
        
        // PHASE 2.3: Add promise rejection handler to prevent unhandled rejections
        timeoutPromise.catch(error => {
            if (error.isTimeout) {
                this.logger.warn('INIT', `Phase 2.3: Timeout promise rejection handled for ${name}`, {
                    error: error.message,
                    attempts: error.attempts,
                    timeout: error.timeout
                });
            }
        });
        
        return {
            startTime,
            timeoutPromise,
            step,
            phase23Enhanced: true
        };
    }
    
    /**
     * PHASE 2.3: ENHANCED STEP COMPLETION WITH TIMEOUT CLEANUP
     * Properly handles timeout promise cleanup and prevents memory leaks
     */
    completeStep(name, result = {}) {
        const timing = this.stepTimings.get(name);
        if (!timing) {
            this.logger.error('INIT', `Cannot complete unstarted step: ${name}`);
            return;
        }
        
        const duration = performance.now() - timing.startTime;
        timing.endTime = performance.now();
        timing.duration = duration;
        timing.status = 'complete';
        timing.result = result;
        
        // Mark as completed
        this.completedSteps.add(name);
        
        // PHASE 2.3: Enhanced timeout cleanup with promise resolution
        const timeoutHandler = this.timeoutHandlers.get(name);
        if (timeoutHandler) {
            // Clear the timeout
            clearTimeout(timeoutHandler.timeoutId);
            
            // PHASE 2.3: Resolve the timeout promise to prevent hanging promises
            if (timeoutHandler.timeoutResolve) {
                timeoutHandler.timeoutResolve({ 
                    stepCompleted: true, 
                    stepName: name, 
                    duration,
                    completedBeforeTimeout: true 
                });
            }
            
            this.timeoutHandlers.delete(name);
            
            this.logger.debug('INIT', `Phase 2.3: Timeout cleaned up for completed step: ${name}`, {
                duration,
                timeoutWas: timeoutHandler.timeout
            });
        }
        
        // Log completion
        this.logger.logInitComplete(name, timing.startTime, result);
        
        // Check if all steps complete
        this.checkCompletion();
        
        // Notify dependent steps
        this.notifyDependents(name);
        
        return duration;
    }
    
    /**
     * PHASE 2.3: ENHANCED STEP FAILURE HANDLING WITH TIMEOUT CLEANUP
     * Properly handles timeout promise cleanup and enhanced error reporting
     */
    failStep(name, error) {
        const step = this.steps.get(name);
        const timing = this.stepTimings.get(name);
        
        if (timing) {
            timing.status = 'failed';
            timing.error = error;
            timing.endTime = performance.now();
            timing.duration = performance.now() - timing.startTime;
        }
        
        this.failedSteps.add(name);
        
        // PHASE 2.3: Enhanced timeout cleanup with promise resolution
        const timeoutHandler = this.timeoutHandlers.get(name);
        if (timeoutHandler) {
            // Clear the timeout
            clearTimeout(timeoutHandler.timeoutId);
            
            // PHASE 2.3: Resolve the timeout promise to prevent hanging promises
            if (timeoutHandler.timeoutResolve) {
                timeoutHandler.timeoutResolve({ 
                    stepFailed: true, 
                    stepName: name, 
                    error: error.message,
                    failedBeforeTimeout: true 
                });
            }
            
            this.timeoutHandlers.delete(name);
            
            this.logger.debug('INIT', `Phase 2.3: Timeout cleaned up for failed step: ${name}`, {
                error: error.message,
                timeoutWas: timeoutHandler.timeout
            });
        }
        
        // PHASE 2.3: Enhanced error logging with timeout context
        const errorContext = {
            attempts: step?.attempts || 0,
            critical: step?.critical,
            isTimeout: error.isTimeout || false,
            stepTimeout: step?.timeout,
            phase23Enhanced: true
        };
        
        // Log failure
        this.logger.logInitError(name, error, errorContext);
        
        // If critical, mark overall as failed
        if (step?.critical) {
            this.status = 'failed';
            this.endTime = performance.now();
        }
        
        // PHASE 2.3: Enhanced retry logic with timeout consideration
        if (step && step.attempts < step.retryCount + 1) {
            // Don't retry immediately on timeout errors - add delay
            const retryDelay = error.isTimeout ? 500 : 0;
            
            this.logger.info('INIT', `Phase 2.3: Retrying ${name} (attempt ${step.attempts + 1}/${step.retryCount + 1})`, {
                isTimeoutRetry: error.isTimeout,
                retryDelay
            });
            
            return { retry: true, retryDelay, isTimeoutRetry: error.isTimeout };
        }
        
        return { retry: false };
    }
    
    /**
     * Validate dependencies for a step
     */
    async validateDependencies(stepName) {
        const dependencies = this.dependencies.get(stepName) || new Set();
        const missing = [];
        const waiting = [];
        
        for (const dep of dependencies) {
            if (!this.completedSteps.has(dep)) {
                if (this.failedSteps.has(dep)) {
                    missing.push(`${dep} (failed)`);
                } else {
                    waiting.push(dep);
                }
            }
        }
        
        // Check for circular dependencies
        const circular = this.detectCircularDependency(stepName);
        if (circular) {
            this.logger.error('INIT', `Circular dependency detected`, {
                step: stepName,
                chain: circular
            });
            return { ready: false, missing: [`circular: ${circular.join(' -> ')}`], circular: true };
        }
        
        return {
            ready: missing.length === 0 && waiting.length === 0,
            missing,
            waiting
        };
    }
    
    /**
     * Detect circular dependencies
     */
    detectCircularDependency(startStep, visited = new Set(), path = []) {
        if (visited.has(startStep)) {
            const cycleStart = path.indexOf(startStep);
            return path.slice(cycleStart).concat(startStep);
        }
        
        visited.add(startStep);
        path.push(startStep);
        
        const deps = this.dependencies.get(startStep) || new Set();
        for (const dep of deps) {
            const result = this.detectCircularDependency(dep, visited, [...path]);
            if (result) return result;
        }
        
        visited.delete(startStep);
        return null;
    }
    
    /**
     * Check if initialization is complete
     */
    checkCompletion() {
        const allSteps = Array.from(this.steps.keys());
        const completed = allSteps.filter(step => this.completedSteps.has(step));
        const failed = allSteps.filter(step => this.failedSteps.has(step));
        
        if (completed.length + failed.length === allSteps.length) {
            this.status = failed.length > 0 ? 'partial' : 'complete';
            this.endTime = performance.now();
            
            this.logger.info('INIT', `Initialization ${this.status}`, {
                totalSteps: allSteps.length,
                completed: completed.length,
                failed: failed.length,
                duration: this.endTime - this.startTime
            });
        }
    }
    
    /**
     * Notify dependent steps that a dependency is complete
     */
    notifyDependents(completedStep) {
        const dependents = this.dependencyGraph.get(completedStep) || new Set();
        
        dependents.forEach(dependent => {
            this.logger.debug('INIT', `Notifying ${dependent} that ${completedStep} is complete`);
            // In a real implementation, this could trigger the dependent step
        });
    }
    
    /**
     * Generate dependency graph visualization
     */
    generateDependencyGraph() {
        console.group('%c📊 Dependency Graph', 'font-size: 14px; font-weight: bold; color: #2196F3');
        
        const allSteps = Array.from(this.steps.keys());
        
        allSteps.forEach(step => {
            const deps = Array.from(this.dependencies.get(step) || []);
            const dependents = Array.from(this.dependencyGraph.get(step) || []);
            const status = this.completedSteps.has(step) ? '✅' : 
                          this.failedSteps.has(step) ? '❌' : '⏳';
            
            console.group(`${status} ${step}`);
            if (deps.length > 0) {
                console.log('Dependencies:', deps.join(', '));
            }
            if (dependents.length > 0) {
                console.log('Dependents:', dependents.join(', '));
            }
            console.groupEnd();
        });
        
        console.groupEnd();
    }
    
    /**
     * Generate timeline visualization
     */
    generateTimeline() {
        console.group('%c⏱️ Initialization Timeline', 'font-size: 14px; font-weight: bold; color: #4CAF50');
        
        const timings = Array.from(this.stepTimings.entries())
            .map(([name, timing]) => ({ name, ...timing }))
            .sort((a, b) => a.startTime - b.startTime);
        
        if (timings.length === 0) {
            console.log('No timing data available');
            console.groupEnd();
            return;
        }
        
        const firstStart = Math.min(...timings.map(t => t.startTime));
        const lastEnd = Math.max(...timings.map(t => t.endTime || performance.now()));
        const totalDuration = lastEnd - firstStart;
        
        // Console timeline
        console.log(`Total duration: ${totalDuration.toFixed(2)}ms`);
        console.log('');
        
        timings.forEach(timing => {
            const relativeStart = timing.startTime - firstStart;
            const duration = timing.duration || 0;
            const barStart = Math.round((relativeStart / totalDuration) * 50);
            const barLength = Math.max(1, Math.round((duration / totalDuration) * 50));
            
            const bar = ' '.repeat(barStart) + '█'.repeat(barLength);
            const status = timing.status === 'complete' ? '✅' : 
                          timing.status === 'failed' ? '❌' : '⏳';
            
            console.log(
                `${status} ${timing.name.padEnd(25)} |${bar}| ${duration.toFixed(0)}ms`
            );
        });
        
        console.groupEnd();
    }
    
    /**
     * PHASE 2.3: ENHANCED INITIALIZATION SUMMARY WITH TIMEOUT ANALYSIS
     * Includes timeout handler status and promise resolution tracking
     */
    getSummary() {
        const allSteps = Array.from(this.steps.keys());
        const completed = allSteps.filter(step => this.completedSteps.has(step));
        const failed = allSteps.filter(step => this.failedSteps.has(step));
        const pending = allSteps.filter(step => 
            !this.completedSteps.has(step) && !this.failedSteps.has(step)
        );
        
        const timings = Array.from(this.stepTimings.values());
        const totalDuration = this.endTime && this.startTime ? 
            this.endTime - this.startTime : 
            performance.now() - (this.startTime || performance.now());
        
        // PHASE 2.3: Enhanced timeout handler analysis
        const timeoutAnalysis = {
            activeTimeouts: this.timeoutHandlers.size,
            timeoutDetails: Array.from(this.timeoutHandlers.entries()).map(([stepName, handler]) => ({
                stepName,
                timeout: handler.timeout,
                elapsed: performance.now() - handler.startTime,
                hasResolver: !!handler.timeoutResolve
            }))
        };
        
        // PHASE 2.3: Error analysis
        const errorAnalysis = {
            timeoutErrors: 0,
            criticalErrors: 0,
            retryableErrors: 0
        };
        
        timings.forEach(timing => {
            if (timing.error) {
                if (timing.error.isTimeout) errorAnalysis.timeoutErrors++;
                const step = this.steps.get(timing.name);
                if (step?.critical) errorAnalysis.criticalErrors++;
                if (step && step.attempts < step.retryCount + 1) errorAnalysis.retryableErrors++;
            }
        });
        
        return {
            status: this.status,
            totalSteps: allSteps.length,
            completed: completed.length,
            failed: failed.length,
            pending: pending.length,
            duration: totalDuration,
            steps: {
                completed,
                failed,
                pending
            },
            timings: timings.map(t => ({
                name: t.name,
                duration: t.duration,
                status: t.status,
                isTimeout: t.error?.isTimeout || false
            })),
            // PHASE 2.3: Enhanced analysis
            timeoutAnalysis,
            errorAnalysis,
            phase23Enhanced: true,
            lastUpdate: performance.now()
        };
    }
    
    /**
     * PHASE 2.3: ENHANCED TRACKER RESET WITH PROPER PROMISE CLEANUP
     * Ensures all timeout promises are properly resolved to prevent memory leaks
     */
    reset() {
        this.completedSteps.clear();
        this.failedSteps.clear();
        this.stepTimings.clear();
        this.status = 'idle';
        this.startTime = null;
        this.endTime = null;
        
        // PHASE 2.3: Enhanced timeout cleanup with promise resolution
        this.timeoutHandlers.forEach((timeoutHandler, stepName) => {
            // Clear the timeout
            clearTimeout(timeoutHandler.timeoutId);
            
            // PHASE 2.3: Resolve any pending timeout promises to prevent memory leaks
            if (timeoutHandler.timeoutResolve) {
                timeoutHandler.timeoutResolve({ 
                    trackerReset: true, 
                    stepName, 
                    resetTime: performance.now() 
                });
            }
        });
        this.timeoutHandlers.clear();
        
        // Reset attempt counts
        this.steps.forEach(step => {
            step.attempts = 0;
        });
        
        this.logger.info('INIT', 'Phase 2.3: Initialization tracker reset with enhanced cleanup');
    }
}

// Create singleton instance
const initializationTracker = new InitializationTracker();

// Export
export { initializationTracker, InitializationTracker };