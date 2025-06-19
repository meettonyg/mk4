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
     * Start a step
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
        
        // Create timeout promise with cancellation
        let timeoutId;
        const timeoutPromise = new Promise((_, reject) => {
            timeoutId = setTimeout(() => {
                // Only reject if the step hasn't completed yet
                if (!this.completedSteps.has(name) && !this.failedSteps.has(name)) {
                    reject(new Error(`Timeout: ${name} took longer than ${step.timeout}ms`));
                }
            }, step.timeout);
        });
        
        // Store timeout ID for cancellation
        this.timeoutHandlers.set(name, timeoutId);
        
        return {
            startTime,
            timeoutPromise,
            step
        };
    }
    
    /**
     * Complete a step
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
        
        // Cancel timeout if it exists
        const timeoutId = this.timeoutHandlers.get(name);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.timeoutHandlers.delete(name);
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
     * Fail a step
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
        
        // Cancel timeout if it exists
        const timeoutId = this.timeoutHandlers.get(name);
        if (timeoutId) {
            clearTimeout(timeoutId);
            this.timeoutHandlers.delete(name);
        }
        
        // Log failure
        this.logger.logInitError(name, error, {
            attempts: step?.attempts || 0,
            critical: step?.critical
        });
        
        // If critical, mark overall as failed
        if (step?.critical) {
            this.status = 'failed';
            this.endTime = performance.now();
        }
        
        // Check if retry is possible
        if (step && step.attempts < step.retryCount + 1) {
            this.logger.info('INIT', `Retrying ${name} (attempt ${step.attempts + 1}/${step.retryCount + 1})`);
            return { retry: true };
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
     * Get initialization summary
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
                status: t.status
            }))
        };
    }
    
    /**
     * Reset tracker
     */
    reset() {
        this.completedSteps.clear();
        this.failedSteps.clear();
        this.stepTimings.clear();
        this.status = 'idle';
        this.startTime = null;
        this.endTime = null;
        
        // Cancel all pending timeouts
        this.timeoutHandlers.forEach((timeoutId) => {
            clearTimeout(timeoutId);
        });
        this.timeoutHandlers.clear();
        
        // Reset attempt counts
        this.steps.forEach(step => {
            step.attempts = 0;
        });
        
        this.logger.info('INIT', 'Initialization tracker reset');
    }
}

// Create singleton instance
const initializationTracker = new InitializationTracker();

// Export
export { initializationTracker, InitializationTracker };