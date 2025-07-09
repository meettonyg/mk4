/**
 * AUTOMATED TEST EXECUTION: Test Orchestrator & Execution Framework
 * Following Gemini's recommendation for comprehensive test automation
 * 
 * Orchestrates execution of all test suites (functional, performance, accessibility, 
 * cross-browser, visual) with progress monitoring and results aggregation.
 */

import { spawn, exec } from 'child_process';
import { promisify } from 'util';
import fs from 'fs/promises';
import path from 'path';

const execAsync = promisify(exec);

class TestOrchestrator {
    constructor(options = {}) {
        this.options = {
            parallel: options.parallel || false,
            verbose: options.verbose || true,
            continueOnFailure: options.continueOnFailure || false,
            outputDir: options.outputDir || 'test-results',
            timeout: options.timeout || 1800000, // 30 minutes
            ...options
        };
        
        this.testSuites = new Map();
        this.results = new Map();
        this.startTime = null;
        this.isRunning = false;
        
        this.initializeTestSuites();
    }
    
    /**
     * Initialize all test suite configurations
     */
    initializeTestSuites() {
        // Functional tests (foundation)
        this.testSuites.set('functional', {
            name: 'Functional Tests',
            description: 'Core MKCG integration functionality',
            command: 'npx vitest run tests/functional/',
            timeout: 300000, // 5 minutes
            critical: true,
            dependencies: [],
            parallel: false,
            outputFile: 'functional-results.json'
        });
        
        // Error scenarios
        this.testSuites.set('error-scenarios', {
            name: 'Error Scenarios',
            description: 'Network failures, data corruption, edge cases',
            command: 'npx vitest run tests/error-scenarios/',
            timeout: 600000, // 10 minutes
            critical: true,
            dependencies: ['functional'],
            parallel: false,
            outputFile: 'error-scenarios-results.json'
        });
        
        // Performance tests
        this.testSuites.set('performance', {
            name: 'Performance Benchmarks',
            description: 'Performance benchmarking and optimization validation',
            command: 'npx vitest run tests/performance/',
            timeout: 600000, // 10 minutes
            critical: true,
            dependencies: ['functional'],
            parallel: false, // Performance tests need isolation
            outputFile: 'performance-results.json'
        });
        
        // Accessibility tests
        this.testSuites.set('accessibility', {
            name: 'Accessibility Compliance',
            description: 'WCAG 2.1 AA compliance and accessibility testing',
            command: 'npx vitest run tests/accessibility/',
            timeout: 450000, // 7.5 minutes
            critical: true,
            dependencies: ['functional'],
            parallel: true,
            outputFile: 'accessibility-results.json'
        });
        
        // Cross-browser tests
        this.testSuites.set('cross-browser', {
            name: 'Cross-Browser Compatibility',
            description: 'Chrome, Firefox, Safari, Edge compatibility testing',
            command: 'npx playwright test tests/cross-browser/',
            timeout: 900000, // 15 minutes
            critical: true,
            dependencies: ['functional', 'performance'],
            parallel: true,
            outputFile: 'cross-browser-results.json'
        });
        
        // Visual regression tests
        this.testSuites.set('visual', {
            name: 'Visual Regression',
            description: 'Screenshot comparison and visual consistency',
            command: 'npx playwright test tests/visual/',
            timeout: 600000, // 10 minutes
            critical: false, // Non-blocking for critical path
            dependencies: ['cross-browser'],
            parallel: true,
            outputFile: 'visual-results.json'
        });
        
        console.log(`✅ Test Orchestrator: ${this.testSuites.size} test suites configured`);
    }
    
    /**
     * Execute all test suites in proper order
     */
    async executeAll() {
        if (this.isRunning) {
            throw new Error('Test execution already in progress');
        }
        
        this.isRunning = true;
        this.startTime = Date.now();
        
        console.log('🚀 PHASE 7: Starting comprehensive test execution...');
        console.log(`📊 Test suites: ${this.testSuites.size}`);
        console.log(`⚙️ Parallel execution: ${this.options.parallel ? 'enabled' : 'disabled'}`);
        console.log(`📁 Output directory: ${this.options.outputDir}`);
        console.log('='.repeat(60));
        
        try {
            // Ensure output directory exists
            await this.ensureOutputDirectory();
            
            // Execute tests based on dependency graph
            await this.executeDependencyGraph();
            
            // Generate consolidated report
            await this.generateConsolidatedReport();
            
            const totalTime = Date.now() - this.startTime;
            console.log('\n' + '='.repeat(60));
            console.log('🎉 PHASE 7: Test execution completed successfully!');
            console.log(`⏱️ Total execution time: ${this.formatDuration(totalTime)}`);
            console.log(`📈 Success rate: ${this.calculateSuccessRate()}%`);
            console.log('='.repeat(60));
            
            return this.getExecutionSummary();
            
        } catch (error) {
            console.error('\n❌ PHASE 7: Test execution failed:', error.message);
            throw error;
        } finally {
            this.isRunning = false;
        }
    }
    
    /**
     * Execute specific test suite
     */
    async executeSuite(suiteId) {
        const suite = this.testSuites.get(suiteId);
        if (!suite) {
            throw new Error(`Test suite '${suiteId}' not found`);
        }
        
        console.log(`\n🔄 Executing: ${suite.name}`);
        console.log(`📝 Description: ${suite.description}`);
        console.log(`⏱️ Timeout: ${this.formatDuration(suite.timeout)}`);
        
        const startTime = Date.now();
        
        try {
            const result = await this.runCommand(suite.command, {
                timeout: suite.timeout,
                cwd: process.cwd()
            });
            
            const duration = Date.now() - startTime;
            
            const suiteResult = {
                suite: suiteId,
                name: suite.name,
                status: 'passed',
                duration,
                startTime,
                endTime: Date.now(),
                output: result.stdout,
                error: null,
                critical: suite.critical,
                outputFile: suite.outputFile
            };
            
            this.results.set(suiteId, suiteResult);
            
            console.log(`✅ ${suite.name}: PASSED (${this.formatDuration(duration)})`);
            
            // Save individual results
            await this.saveResults(suiteId, suiteResult);
            
            return suiteResult;
            
        } catch (error) {
            const duration = Date.now() - startTime;
            
            const suiteResult = {
                suite: suiteId,
                name: suite.name,
                status: 'failed',
                duration,
                startTime,
                endTime: Date.now(),
                output: error.stdout || '',
                error: error.message,
                critical: suite.critical,
                outputFile: suite.outputFile
            };
            
            this.results.set(suiteId, suiteResult);
            
            console.error(`❌ ${suite.name}: FAILED (${this.formatDuration(duration)})`);
            console.error(`🔍 Error: ${error.message}`);
            
            // Save failed results
            await this.saveResults(suiteId, suiteResult);
            
            if (suite.critical && !this.options.continueOnFailure) {
                throw new Error(`Critical test suite '${suite.name}' failed: ${error.message}`);
            }
            
            return suiteResult;
        }
    }
    
    /**
     * Execute tests based on dependency graph
     */
    async executeDependencyGraph() {
        const executed = new Set();
        const inProgress = new Set();
        
        async function executeSuiteWithDeps(orchestrator, suiteId) {
            if (executed.has(suiteId) || inProgress.has(suiteId)) {
                return;
            }
            
            const suite = orchestrator.testSuites.get(suiteId);
            if (!suite) {
                throw new Error(`Test suite '${suiteId}' not found`);
            }
            
            inProgress.add(suiteId);
            
            // Execute dependencies first
            for (const depId of suite.dependencies) {
                await executeSuiteWithDeps(orchestrator, depId);
            }
            
            // Execute this suite
            await orchestrator.executeSuite(suiteId);
            
            executed.add(suiteId);
            inProgress.delete(suiteId);
        }
        
        // Execute all suites respecting dependencies
        const suiteIds = Array.from(this.testSuites.keys());
        
        if (this.options.parallel) {
            // Execute suites in parallel where possible
            const promises = suiteIds.map(suiteId => 
                executeSuiteWithDeps(this, suiteId)
            );
            await Promise.allSettled(promises);
        } else {
            // Execute suites sequentially
            for (const suiteId of suiteIds) {
                await executeSuiteWithDeps(this, suiteId);
            }
        }
    }
    
    /**
     * Run shell command with timeout
     */
    async runCommand(command, options = {}) {
        return new Promise((resolve, reject) => {
            const timeout = options.timeout || 300000; // 5 minute default
            
            const process = spawn('cmd', ['/c', command], {
                cwd: options.cwd || process.cwd(),
                stdio: ['pipe', 'pipe', 'pipe'],
                shell: true
            });
            
            let stdout = '';
            let stderr = '';
            
            process.stdout.on('data', (data) => {
                stdout += data.toString();
                if (this.options.verbose) {
                    console.log(data.toString().trim());
                }
            });
            
            process.stderr.on('data', (data) => {
                stderr += data.toString();
                if (this.options.verbose) {
                    console.error(data.toString().trim());
                }
            });
            
            const timeoutId = setTimeout(() => {
                process.kill('SIGKILL');
                reject(new Error(`Command timed out after ${timeout}ms: ${command}`));
            }, timeout);
            
            process.on('close', (code) => {
                clearTimeout(timeoutId);
                
                if (code === 0) {
                    resolve({ stdout, stderr, code });
                } else {
                    const error = new Error(`Command failed with exit code ${code}: ${command}`);
                    error.stdout = stdout;
                    error.stderr = stderr;
                    error.code = code;
                    reject(error);
                }
            });
            
            process.on('error', (error) => {
                clearTimeout(timeoutId);
                reject(error);
            });
        });
    }
    
    /**
     * Ensure output directory exists
     */
    async ensureOutputDirectory() {
        try {
            await fs.mkdir(this.options.outputDir, { recursive: true });
            
            // Create subdirectories
            const subdirs = ['functional', 'performance', 'accessibility', 'cross-browser', 'visual', 'reports'];
            for (const subdir of subdirs) {
                await fs.mkdir(path.join(this.options.outputDir, subdir), { recursive: true });
            }
            
            console.log(`📁 Output directory prepared: ${this.options.outputDir}`);
        } catch (error) {
            console.error(`❌ Failed to create output directory: ${error.message}`);
            throw error;
        }
    }
    
    /**
     * Save individual test results
     */
    async saveResults(suiteId, result) {
        try {
            const outputPath = path.join(this.options.outputDir, result.outputFile);
            await fs.writeFile(outputPath, JSON.stringify(result, null, 2));
            
            // Also save as text summary
            const textPath = outputPath.replace('.json', '.txt');
            const textSummary = this.formatResultSummary(result);
            await fs.writeFile(textPath, textSummary);
            
        } catch (error) {
            console.error(`⚠️ Failed to save results for ${suiteId}: ${error.message}`);
        }
    }
    
    /**
     * Generate consolidated test report
     */
    async generateConsolidatedReport() {
        const totalTime = Date.now() - this.startTime;
        const results = Array.from(this.results.values());
        
        const report = {
            timestamp: new Date().toISOString(),
            execution: {
                totalTime,
                startTime: this.startTime,
                endTime: Date.now(),
                parallel: this.options.parallel,
                continueOnFailure: this.options.continueOnFailure
            },
            summary: {
                totalSuites: results.length,
                passed: results.filter(r => r.status === 'passed').length,
                failed: results.filter(r => r.status === 'failed').length,
                criticalFailed: results.filter(r => r.status === 'failed' && r.critical).length,
                successRate: this.calculateSuccessRate()
            },
            results: results,
            qualityGates: this.evaluateQualityGates(),
            recommendations: this.generateRecommendations()
        };
        
        // Save JSON report
        const reportPath = path.join(this.options.outputDir, 'consolidated-report.json');
        await fs.writeFile(reportPath, JSON.stringify(report, null, 2));
        
        // Save HTML report
        const htmlReport = this.generateHTMLReport(report);
        const htmlPath = path.join(this.options.outputDir, 'test-report.html');
        await fs.writeFile(htmlPath, htmlReport);
        
        console.log(`📊 Consolidated report saved: ${reportPath}`);
        console.log(`🌐 HTML report saved: ${htmlPath}`);
        
        return report;
    }
    
    /**
     * Evaluate quality gates
     */
    evaluateQualityGates() {
        const gates = {
            functionalTests: {
                required: true,
                passed: this.results.has('functional') && this.results.get('functional').status === 'passed',
                description: 'Core functionality must pass'
            },
            performanceTests: {
                required: true,
                passed: this.results.has('performance') && this.results.get('performance').status === 'passed',
                description: 'Performance benchmarks must be met'
            },
            accessibilityTests: {
                required: true,
                passed: this.results.has('accessibility') && this.results.get('accessibility').status === 'passed',
                description: 'WCAG 2.1 AA compliance required'
            },
            crossBrowserTests: {
                required: true,
                passed: this.results.has('cross-browser') && this.results.get('cross-browser').status === 'passed',
                description: 'Cross-browser compatibility required'
            },
            criticalTestsOnly: {
                required: true,
                passed: Array.from(this.results.values()).filter(r => r.critical && r.status === 'failed').length === 0,
                description: 'No critical test failures allowed'
            }
        };
        
        const allGatesPassed = Object.values(gates).every(gate => !gate.required || gate.passed);
        
        return {
            overall: allGatesPassed,
            gates,
            readyForProduction: allGatesPassed
        };
    }
    
    /**
     * Generate recommendations based on results
     */
    generateRecommendations() {
        const recommendations = [];
        const failedSuites = Array.from(this.results.values()).filter(r => r.status === 'failed');
        
        if (failedSuites.length > 0) {
            recommendations.push({
                type: 'critical',
                message: `${failedSuites.length} test suite(s) failed and need attention`,
                suites: failedSuites.map(s => s.name)
            });
        }
        
        // Performance recommendations
        const performanceResult = this.results.get('performance');
        if (performanceResult && performanceResult.status === 'passed') {
            recommendations.push({
                type: 'success',
                message: 'Performance benchmarks met - system ready for production'
            });
        }
        
        // Accessibility recommendations
        const accessibilityResult = this.results.get('accessibility');
        if (accessibilityResult && accessibilityResult.status === 'passed') {
            recommendations.push({
                type: 'success',
                message: 'WCAG 2.1 AA compliance achieved'
            });
        }
        
        // Cross-browser recommendations
        const crossBrowserResult = this.results.get('cross-browser');
        if (crossBrowserResult && crossBrowserResult.status === 'passed') {
            recommendations.push({
                type: 'success',
                message: 'Cross-browser compatibility verified across all target browsers'
            });
        }
        
        return recommendations;
    }
    
    /**
     * Calculate overall success rate
     */
    calculateSuccessRate() {
        const results = Array.from(this.results.values());
        if (results.length === 0) return 0;
        
        const passed = results.filter(r => r.status === 'passed').length;
        return Math.round((passed / results.length) * 100);
    }
    
    /**
     * Get execution summary
     */
    getExecutionSummary() {
        const totalTime = Date.now() - this.startTime;
        const results = Array.from(this.results.values());
        
        return {
            totalTime,
            totalSuites: results.length,
            passed: results.filter(r => r.status === 'passed').length,
            failed: results.filter(r => r.status === 'failed').length,
            successRate: this.calculateSuccessRate(),
            qualityGates: this.evaluateQualityGates(),
            isSuccess: this.evaluateQualityGates().overall
        };
    }
    
    /**
     * Format duration in human readable form
     */
    formatDuration(ms) {
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        
        if (hours > 0) {
            return `${hours}h ${minutes % 60}m ${seconds % 60}s`;
        } else if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    /**
     * Format individual result summary
     */
    formatResultSummary(result) {
        return `
TEST SUITE: ${result.name}
Status: ${result.status.toUpperCase()}
Duration: ${this.formatDuration(result.duration)}
Critical: ${result.critical ? 'YES' : 'NO'}
Start Time: ${new Date(result.startTime).toISOString()}
End Time: ${new Date(result.endTime).toISOString()}

${result.error ? `ERROR:\n${result.error}\n` : ''}
${result.output ? `OUTPUT:\n${result.output.slice(-1000)}\n` : ''}
`;
    }
    
    /**
     * Generate HTML report
     */
    generateHTMLReport(report) {
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MKCG Topics Integration - Test Report</title>
    <style>
        body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; margin: 0; padding: 20px; background: #f5f5f5; }
        .container { max-width: 1200px; margin: 0 auto; background: white; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); overflow: hidden; }
        .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; }
        .header h1 { margin: 0; font-size: 2.5rem; }
        .header p { margin: 10px 0 0; opacity: 0.9; }
        .summary { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; padding: 30px; }
        .metric { text-align: center; padding: 20px; background: #f8f9fa; border-radius: 8px; border-left: 4px solid #007bff; }
        .metric h3 { margin: 0 0 10px; color: #495057; font-size: 0.9rem; text-transform: uppercase; letter-spacing: 1px; }
        .metric .value { font-size: 2rem; font-weight: bold; color: #007bff; }
        .metric.success { border-left-color: #28a745; }
        .metric.success .value { color: #28a745; }
        .metric.danger { border-left-color: #dc3545; }
        .metric.danger .value { color: #dc3545; }
        .results { padding: 0 30px 30px; }
        .suite { margin: 20px 0; border: 1px solid #dee2e6; border-radius: 6px; overflow: hidden; }
        .suite-header { padding: 15px 20px; background: #f8f9fa; border-bottom: 1px solid #dee2e6; display: flex; justify-content: space-between; align-items: center; }
        .suite-title { font-weight: 600; }
        .status { padding: 4px 12px; border-radius: 20px; font-size: 0.8rem; font-weight: 600; text-transform: uppercase; }
        .status.passed { background: #d4edda; color: #155724; }
        .status.failed { background: #f8d7da; color: #721c24; }
        .suite-details { padding: 20px; background: white; }
        .quality-gates { margin: 30px 0; padding: 20px; background: #f8f9fa; border-radius: 6px; }
        .gate { display: flex; justify-content: space-between; align-items: center; padding: 10px 0; border-bottom: 1px solid #dee2e6; }
        .gate:last-child { border-bottom: none; }
        .gate-status { width: 20px; height: 20px; border-radius: 50%; }
        .gate-status.pass { background: #28a745; }
        .gate-status.fail { background: #dc3545; }
    </style>
</head>
<body>
    <div class="container">
        <div class="header">
            <h1>MKCG Topics Integration</h1>
            <p>Phase 7 Testing Framework - Comprehensive Test Report</p>
            <p>Generated on ${new Date(report.timestamp).toLocaleString()}</p>
        </div>
        
        <div class="summary">
            <div class="metric ${report.summary.successRate >= 95 ? 'success' : 'danger'}">
                <h3>Success Rate</h3>
                <div class="value">${report.summary.successRate}%</div>
            </div>
            <div class="metric">
                <h3>Total Duration</h3>
                <div class="value">${this.formatDuration(report.execution.totalTime)}</div>
            </div>
            <div class="metric success">
                <h3>Tests Passed</h3>
                <div class="value">${report.summary.passed}</div>
            </div>
            <div class="metric ${report.summary.failed > 0 ? 'danger' : 'success'}">
                <h3>Tests Failed</h3>
                <div class="value">${report.summary.failed}</div>
            </div>
        </div>
        
        <div class="results">
            <h2>Quality Gates</h2>
            <div class="quality-gates">
                ${Object.entries(report.qualityGates.gates).map(([name, gate]) => `
                    <div class="gate">
                        <span>${gate.description}</span>
                        <div class="gate-status ${gate.passed ? 'pass' : 'fail'}"></div>
                    </div>
                `).join('')}
            </div>
            
            <h2>Test Suite Results</h2>
            ${report.results.map(result => `
                <div class="suite">
                    <div class="suite-header">
                        <div class="suite-title">${result.name}</div>
                        <span class="status ${result.status}">${result.status}</span>
                    </div>
                    <div class="suite-details">
                        <p><strong>Duration:</strong> ${this.formatDuration(result.duration)}</p>
                        <p><strong>Critical:</strong> ${result.critical ? 'Yes' : 'No'}</p>
                        ${result.error ? `<p><strong>Error:</strong> <code>${result.error}</code></p>` : ''}
                    </div>
                </div>
            `).join('')}
        </div>
    </div>
</body>
</html>
        `;
    }
}

/**
 * EXECUTION MODES
 */

/**
 * Quick validation mode (essential tests only)
 */
class QuickValidationOrchestrator extends TestOrchestrator {
    initializeTestSuites() {
        this.testSuites.set('functional', {
            name: 'Functional Tests',
            command: 'npx vitest run tests/functional/',
            timeout: 180000, // 3 minutes
            critical: true,
            dependencies: [],
            outputFile: 'quick-functional-results.json'
        });
        
        this.testSuites.set('performance', {
            name: 'Performance Tests',
            command: 'npx vitest run tests/performance/benchmarks.test.js',
            timeout: 120000, // 2 minutes
            critical: true,
            dependencies: ['functional'],
            outputFile: 'quick-performance-results.json'
        });
    }
}

/**
 * Pre-deployment validation mode
 */
class PreDeploymentOrchestrator extends TestOrchestrator {
    initializeTestSuites() {
        super.initializeTestSuites();
        
        // Override timeouts for faster execution
        this.testSuites.forEach(suite => {
            suite.timeout = Math.min(suite.timeout, 300000); // Max 5 minutes per suite
        });
    }
}

export { TestOrchestrator, QuickValidationOrchestrator, PreDeploymentOrchestrator };

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
    const mode = process.argv[2] || 'full';
    
    let orchestrator;
    switch (mode) {
        case 'quick':
            orchestrator = new QuickValidationOrchestrator({ verbose: true });
            break;
        case 'pre-deploy':
            orchestrator = new PreDeploymentOrchestrator({ verbose: true });
            break;
        default:
            orchestrator = new TestOrchestrator({ verbose: true });
    }
    
    orchestrator.executeAll()
        .then(summary => {
            console.log('\n🎉 Test execution completed!');
            console.log(`📊 Final results: ${summary.passed}/${summary.totalSuites} suites passed`);
            process.exit(summary.isSuccess ? 0 : 1);
        })
        .catch(error => {
            console.error('\n❌ Test execution failed:', error.message);
            process.exit(1);
        });
}
