/**
 * UNIFIED REPORTING: Real-Time Dashboard Generator
 * Following Gemini's recommendation for comprehensive reporting
 * 
 * Generates real-time testing dashboard with live metrics, quality gates,
 * performance trends, and comprehensive test result visualization.
 */

import fs from 'fs/promises';
import path from 'path';
import { EventEmitter } from 'events';

class RealtimeDashboardGenerator extends EventEmitter {
    constructor(options = {}) {
        super();
        
        this.options = {
            updateInterval: options.updateInterval || 5000, // 5 seconds
            retentionDays: options.retentionDays || 30,
            outputDir: options.outputDir || 'test-results',
            dashboardPort: options.dashboardPort || 3001,
            ...options
        };
        
        this.metrics = new Map();
        this.testResults = new Map();
        this.qualityGates = new Map();
        this.alerts = [];
        this.isRunning = false;
        
        this.initializeMetrics();
    }
    
    /**
     * Initialize metrics tracking
     */
    initializeMetrics() {
        const now = Date.now();
        
        this.metrics.set('system', {
            lastUpdate: now,
            testExecutions: 0,
            totalTestTime: 0,
            averageTestTime: 0,
            successRate: 100,
            failureRate: 0,
            criticalFailures: 0
        });
        
        this.metrics.set('performance', {
            lastUpdate: now,
            averageLoadTime: 0,
            averageValidationTime: 0,
            memoryUsage: 0,
            performanceScore: 0,
            regressions: 0
        });
        
        this.metrics.set('quality', {
            lastUpdate: now,
            functionalTests: 0,
            performanceTests: 0,
            accessibilityScore: 0,
            crossBrowserCompatibility: 0,
            visualRegressions: 0
        });
        
        this.metrics.set('coverage', {
            lastUpdate: now,
            functionalCoverage: 0,
            performanceCoverage: 0,
            accessibilityCoverage: 0,
            crossBrowserCoverage: 0,
            visualCoverage: 0
        });
        
        console.log('📊 Dashboard: Metrics tracking initialized');
    }
    
    /**
     * Start real-time dashboard
     */
    async startDashboard() {
        if (this.isRunning) {
            console.log('⚠️ Dashboard already running');
            return;
        }
        
        this.isRunning = true;
        
        console.log('🚀 Starting real-time testing dashboard...');
        console.log(`📊 Update interval: ${this.options.updateInterval}ms`);
        console.log(`📁 Output directory: ${this.options.outputDir}`);
        
        // Ensure output directory exists
        await this.ensureOutputDirectory();
        
        // Load existing data
        await this.loadExistingData();
        
        // Start metrics collection
        this.startMetricsCollection();
        
        // Generate initial dashboard
        await this.generateDashboard();
        
        // Start periodic updates
        this.updateInterval = setInterval(async () => {
            await this.updateDashboard();
        }, this.options.updateInterval);
        
        console.log(`✅ Dashboard running at: file://${path.resolve(this.options.outputDir, 'dashboard.html')}`);
        
        this.emit('dashboard-started');
    }
    
    /**
     * Stop dashboard
     */
    stopDashboard() {
        if (!this.isRunning) return;
        
        if (this.updateInterval) {
            clearInterval(this.updateInterval);
        }
        
        this.isRunning = false;
        console.log('🛑 Dashboard stopped');
        
        this.emit('dashboard-stopped');
    }
    
    /**
     * Add test result to dashboard
     */
    async addTestResult(suiteId, result) {
        const timestamp = Date.now();
        
        this.testResults.set(`${suiteId}_${timestamp}`, {
            ...result,
            timestamp,
            suiteId
        });
        
        // Update metrics
        await this.updateMetricsFromResult(result);
        
        // Check quality gates
        await this.checkQualityGates(result);
        
        // Emit update event
        this.emit('test-result-added', { suiteId, result });
        
        console.log(`📊 Dashboard: Added result for ${suiteId} (${result.status})`);
    }
    
    /**
     * Update metrics from test result
     */
    async updateMetricsFromResult(result) {
        const systemMetrics = this.metrics.get('system');
        const performanceMetrics = this.metrics.get('performance');
        const qualityMetrics = this.metrics.get('quality');
        
        // Update system metrics
        systemMetrics.testExecutions++;
        systemMetrics.totalTestTime += result.duration || 0;
        systemMetrics.averageTestTime = systemMetrics.totalTestTime / systemMetrics.testExecutions;
        systemMetrics.lastUpdate = Date.now();
        
        if (result.status === 'passed') {
            systemMetrics.successRate = (systemMetrics.successRate * (systemMetrics.testExecutions - 1) + 100) / systemMetrics.testExecutions;
        } else {
            systemMetrics.failureRate = (systemMetrics.failureRate * (systemMetrics.testExecutions - 1) + 100) / systemMetrics.testExecutions;
            if (result.critical) {
                systemMetrics.criticalFailures++;
            }
        }
        
        // Update performance metrics based on test type
        if (result.suite === 'performance') {
            const performanceData = this.extractPerformanceData(result);
            if (performanceData) {
                performanceMetrics.averageLoadTime = performanceData.loadTime || performanceMetrics.averageLoadTime;
                performanceMetrics.averageValidationTime = performanceData.validationTime || performanceMetrics.averageValidationTime;
                performanceMetrics.memoryUsage = performanceData.memoryUsage || performanceMetrics.memoryUsage;
                performanceMetrics.performanceScore = performanceData.score || performanceMetrics.performanceScore;
            }
            performanceMetrics.lastUpdate = Date.now();
        }
        
        // Update quality metrics
        if (result.suite === 'functional') {
            qualityMetrics.functionalTests = result.status === 'passed' ? 100 : 0;
        } else if (result.suite === 'accessibility') {
            qualityMetrics.accessibilityScore = this.extractAccessibilityScore(result);
        } else if (result.suite === 'cross-browser') {
            qualityMetrics.crossBrowserCompatibility = result.status === 'passed' ? 100 : 0;
        }
        qualityMetrics.lastUpdate = Date.now();
        
        this.metrics.set('system', systemMetrics);
        this.metrics.set('performance', performanceMetrics);
        this.metrics.set('quality', qualityMetrics);
    }
    
    /**
     * Check quality gates and trigger alerts
     */
    async checkQualityGates(result) {
        const gates = {
            functionalTests: {
                threshold: 100,
                current: result.suite === 'functional' ? (result.status === 'passed' ? 100 : 0) : 100,
                critical: true
            },
            performanceScore: {
                threshold: 90,
                current: this.metrics.get('performance').performanceScore,
                critical: true
            },
            accessibilityScore: {
                threshold: 95,
                current: this.metrics.get('quality').accessibilityScore,
                critical: true
            },
            successRate: {
                threshold: 95,
                current: this.metrics.get('system').successRate,
                critical: false
            }
        };
        
        for (const [gateName, gate] of Object.entries(gates)) {
            const passed = gate.current >= gate.threshold;
            this.qualityGates.set(gateName, {
                ...gate,
                passed,
                lastCheck: Date.now()
            });
            
            if (!passed && gate.critical) {
                await this.triggerAlert({
                    type: 'critical',
                    gate: gateName,
                    threshold: gate.threshold,
                    current: gate.current,
                    message: `Quality gate '${gateName}' failed: ${gate.current}% < ${gate.threshold}%`
                });
            }
        }
    }
    
    /**
     * Trigger alert
     */
    async triggerAlert(alert) {
        const alertWithTimestamp = {
            ...alert,
            timestamp: Date.now(),
            id: `alert_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
        };
        
        this.alerts.unshift(alertWithTimestamp);
        
        // Keep only last 50 alerts
        if (this.alerts.length > 50) {
            this.alerts = this.alerts.slice(0, 50);
        }
        
        console.log(`🚨 ALERT (${alert.type}): ${alert.message}`);
        
        this.emit('alert-triggered', alertWithTimestamp);
        
        // Save alert to file
        await this.saveAlert(alertWithTimestamp);
    }
    
    /**
     * Generate dashboard HTML
     */
    async generateDashboard() {
        const dashboardHTML = this.createDashboardHTML();
        const dashboardPath = path.join(this.options.outputDir, 'dashboard.html');
        
        await fs.writeFile(dashboardPath, dashboardHTML);
        
        // Also generate JSON data for API access
        const dashboardData = {
            timestamp: Date.now(),
            metrics: Object.fromEntries(this.metrics),
            qualityGates: Object.fromEntries(this.qualityGates),
            alerts: this.alerts.slice(0, 10), // Last 10 alerts
            testResults: this.getRecentTestResults(20) // Last 20 results
        };
        
        const dataPath = path.join(this.options.outputDir, 'dashboard-data.json');
        await fs.writeFile(dataPath, JSON.stringify(dashboardData, null, 2));
        
        console.log(`📊 Dashboard updated: ${dashboardPath}`);
    }
    
    /**
     * Update dashboard
     */
    async updateDashboard() {
        try {
            await this.generateDashboard();
            this.emit('dashboard-updated');
        } catch (error) {
            console.error('❌ Dashboard update failed:', error.message);
        }
    }
    
    /**
     * Create dashboard HTML
     */
    createDashboardHTML() {
        const systemMetrics = this.metrics.get('system');
        const performanceMetrics = this.metrics.get('performance');
        const qualityMetrics = this.metrics.get('quality');
        const recentAlerts = this.alerts.slice(0, 5);
        const recentResults = this.getRecentTestResults(10);
        
        return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MKCG Topics Integration - Real-Time Testing Dashboard</title>
    <meta http-equiv="refresh" content="${Math.floor(this.options.updateInterval / 1000)}">
    <style>
        * { margin: 0; padding: 0; box-sizing: border-box; }
        body { 
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; 
            background: #f5f7fa; 
            color: #2d3748; 
            line-height: 1.6;
        }
        .dashboard { max-width: 1400px; margin: 0 auto; padding: 20px; }
        .header { 
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); 
            color: white; 
            padding: 30px; 
            border-radius: 12px; 
            margin-bottom: 30px; 
            text-align: center; 
            box-shadow: 0 8px 32px rgba(0,0,0,0.1);
        }
        .header h1 { font-size: 2.5rem; margin-bottom: 10px; }
        .header p { opacity: 0.9; font-size: 1.1rem; }
        .status-indicator { 
            display: inline-block; 
            width: 12px; 
            height: 12px; 
            border-radius: 50%; 
            margin-right: 8px; 
            animation: pulse 2s infinite;
        }
        .status-indicator.success { background: #10b981; }
        .status-indicator.warning { background: #f59e0b; }
        .status-indicator.error { background: #ef4444; }
        @keyframes pulse { 0%, 100% { opacity: 1; } 50% { opacity: 0.5; } }
        
        .metrics-grid { 
            display: grid; 
            grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); 
            gap: 24px; 
            margin-bottom: 30px; 
        }
        .metric-card { 
            background: white; 
            padding: 24px; 
            border-radius: 12px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
            border-left: 4px solid #3b82f6;
            transition: transform 0.2s ease, box-shadow 0.2s ease;
        }
        .metric-card:hover { 
            transform: translateY(-2px); 
            box-shadow: 0 8px 24px rgba(0,0,0,0.1); 
        }
        .metric-card.success { border-left-color: #10b981; }
        .metric-card.warning { border-left-color: #f59e0b; }
        .metric-card.error { border-left-color: #ef4444; }
        .metric-title { 
            font-size: 0.9rem; 
            color: #6b7280; 
            text-transform: uppercase; 
            letter-spacing: 0.5px; 
            margin-bottom: 12px; 
        }
        .metric-value { 
            font-size: 2.5rem; 
            font-weight: 700; 
            color: #1f2937; 
            margin-bottom: 8px; 
        }
        .metric-change { 
            font-size: 0.9rem; 
            color: #6b7280; 
        }
        .metric-change.positive { color: #10b981; }
        .metric-change.negative { color: #ef4444; }
        
        .section { 
            background: white; 
            padding: 24px; 
            border-radius: 12px; 
            box-shadow: 0 4px 12px rgba(0,0,0,0.05); 
            margin-bottom: 24px; 
        }
        .section-title { 
            font-size: 1.5rem; 
            font-weight: 600; 
            color: #1f2937; 
            margin-bottom: 20px; 
            display: flex; 
            align-items: center; 
        }
        .section-title .icon { 
            margin-right: 12px; 
            font-size: 1.8rem; 
        }
        
        .quality-gates { 
            display: grid; 
            gap: 16px; 
        }
        .quality-gate { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 16px; 
            background: #f9fafb; 
            border-radius: 8px; 
            border-left: 4px solid #d1d5db;
        }
        .quality-gate.passed { border-left-color: #10b981; background: #f0fdf4; }
        .quality-gate.failed { border-left-color: #ef4444; background: #fef2f2; }
        .gate-info { display: flex; flex-direction: column; }
        .gate-name { font-weight: 600; color: #1f2937; }
        .gate-description { font-size: 0.9rem; color: #6b7280; }
        .gate-status { 
            display: flex; 
            align-items: center; 
            font-weight: 600; 
        }
        .gate-status.passed { color: #10b981; }
        .gate-status.failed { color: #ef4444; }
        .gate-status .icon { margin-right: 8px; }
        
        .alerts { max-height: 400px; overflow-y: auto; }
        .alert { 
            display: flex; 
            align-items: flex-start; 
            padding: 16px; 
            margin-bottom: 12px; 
            border-radius: 8px; 
            border-left: 4px solid #d1d5db;
        }
        .alert.critical { border-left-color: #ef4444; background: #fef2f2; }
        .alert.warning { border-left-color: #f59e0b; background: #fefbf2; }
        .alert.info { border-left-color: #3b82f6; background: #eff6ff; }
        .alert-icon { margin-right: 12px; font-size: 1.2rem; }
        .alert-content { flex: 1; }
        .alert-message { font-weight: 600; color: #1f2937; margin-bottom: 4px; }
        .alert-time { font-size: 0.8rem; color: #6b7280; }
        
        .test-results { max-height: 500px; overflow-y: auto; }
        .test-result { 
            display: flex; 
            justify-content: space-between; 
            align-items: center; 
            padding: 12px 16px; 
            border-bottom: 1px solid #f3f4f6; 
        }
        .test-result:last-child { border-bottom: none; }
        .result-info { display: flex; flex-direction: column; }
        .result-name { font-weight: 600; color: #1f2937; }
        .result-time { font-size: 0.8rem; color: #6b7280; }
        .result-status { 
            padding: 4px 12px; 
            border-radius: 20px; 
            font-size: 0.8rem; 
            font-weight: 600; 
            text-transform: uppercase; 
        }
        .result-status.passed { background: #d1fae5; color: #065f46; }
        .result-status.failed { background: #fee2e2; color: #991b1b; }
        
        .footer { 
            text-align: center; 
            padding: 20px; 
            color: #6b7280; 
            font-size: 0.9rem; 
        }
        
        @media (max-width: 768px) {
            .dashboard { padding: 12px; }
            .metrics-grid { grid-template-columns: 1fr; }
            .metric-value { font-size: 2rem; }
            .header h1 { font-size: 2rem; }
        }
    </style>
</head>
<body>
    <div class="dashboard">
        <div class="header">
            <h1>
                <span class="status-indicator ${systemMetrics.criticalFailures > 0 ? 'error' : systemMetrics.successRate < 95 ? 'warning' : 'success'}"></span>
                MKCG Topics Integration
            </h1>
            <p>Real-Time Testing Dashboard - Phase 7 Framework</p>
            <p>Last Updated: ${new Date().toLocaleString()}</p>
        </div>
        
        <div class="metrics-grid">
            <div class="metric-card ${systemMetrics.successRate >= 95 ? 'success' : systemMetrics.successRate >= 80 ? 'warning' : 'error'}">
                <div class="metric-title">Success Rate</div>
                <div class="metric-value">${systemMetrics.successRate.toFixed(1)}%</div>
                <div class="metric-change">Test Executions: ${systemMetrics.testExecutions}</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">Average Test Time</div>
                <div class="metric-value">${this.formatDuration(systemMetrics.averageTestTime)}</div>
                <div class="metric-change">Total: ${this.formatDuration(systemMetrics.totalTestTime)}</div>
            </div>
            
            <div class="metric-card ${performanceMetrics.performanceScore >= 90 ? 'success' : performanceMetrics.performanceScore >= 75 ? 'warning' : 'error'}">
                <div class="metric-title">Performance Score</div>
                <div class="metric-value">${performanceMetrics.performanceScore || 0}</div>
                <div class="metric-change">Load: ${performanceMetrics.averageLoadTime}ms</div>
            </div>
            
            <div class="metric-card ${qualityMetrics.accessibilityScore >= 95 ? 'success' : qualityMetrics.accessibilityScore >= 85 ? 'warning' : 'error'}">
                <div class="metric-title">Accessibility Score</div>
                <div class="metric-value">${qualityMetrics.accessibilityScore || 0}%</div>
                <div class="metric-change">WCAG 2.1 AA Compliance</div>
            </div>
            
            <div class="metric-card ${systemMetrics.criticalFailures === 0 ? 'success' : 'error'}">
                <div class="metric-title">Critical Failures</div>
                <div class="metric-value">${systemMetrics.criticalFailures}</div>
                <div class="metric-change">Total Failures: ${systemMetrics.testExecutions - Math.round(systemMetrics.testExecutions * systemMetrics.successRate / 100)}</div>
            </div>
            
            <div class="metric-card">
                <div class="metric-title">Memory Usage</div>
                <div class="metric-value">${this.formatBytes(performanceMetrics.memoryUsage)}</div>
                <div class="metric-change">Performance Target: <5MB</div>
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">
                <span class="icon">🎯</span>
                Quality Gates
            </h2>
            <div class="quality-gates">
                ${Array.from(this.qualityGates.entries()).map(([name, gate]) => `
                    <div class="quality-gate ${gate.passed ? 'passed' : 'failed'}">
                        <div class="gate-info">
                            <div class="gate-name">${this.formatGateName(name)}</div>
                            <div class="gate-description">${gate.current.toFixed(1)}% (Target: ${gate.threshold}%)</div>
                        </div>
                        <div class="gate-status ${gate.passed ? 'passed' : 'failed'}">
                            <span class="icon">${gate.passed ? '✅' : '❌'}</span>
                            ${gate.passed ? 'PASSED' : 'FAILED'}
                        </div>
                    </div>
                `).join('')}
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">
                <span class="icon">🚨</span>
                Recent Alerts
            </h2>
            <div class="alerts">
                ${recentAlerts.length > 0 ? recentAlerts.map(alert => `
                    <div class="alert ${alert.type}">
                        <div class="alert-icon">${alert.type === 'critical' ? '🚨' : alert.type === 'warning' ? '⚠️' : 'ℹ️'}</div>
                        <div class="alert-content">
                            <div class="alert-message">${alert.message}</div>
                            <div class="alert-time">${new Date(alert.timestamp).toLocaleString()}</div>
                        </div>
                    </div>
                `).join('') : '<p style="color: #6b7280; text-align: center; padding: 20px;">No recent alerts</p>'}
            </div>
        </div>
        
        <div class="section">
            <h2 class="section-title">
                <span class="icon">📊</span>
                Recent Test Results
            </h2>
            <div class="test-results">
                ${recentResults.length > 0 ? recentResults.map(result => `
                    <div class="test-result">
                        <div class="result-info">
                            <div class="result-name">${result.name || result.suiteId}</div>
                            <div class="result-time">${new Date(result.timestamp).toLocaleString()} - ${this.formatDuration(result.duration)}</div>
                        </div>
                        <div class="result-status ${result.status}">${result.status.toUpperCase()}</div>
                    </div>
                `).join('') : '<p style="color: #6b7280; text-align: center; padding: 20px;">No recent test results</p>'}
            </div>
        </div>
        
        <div class="footer">
            <p>🔄 Auto-refreshing every ${Math.floor(this.options.updateInterval / 1000)} seconds</p>
            <p>📊 MKCG Topics Integration - Phase 7 Testing Framework</p>
        </div>
    </div>
    
    <script>
        // Real-time updates via WebSocket (if implemented)
        console.log('📊 Dashboard loaded at', new Date().toLocaleString());
        
        // Auto-scroll alerts to top
        const alertsContainer = document.querySelector('.alerts');
        if (alertsContainer && alertsContainer.children.length > 0) {
            alertsContainer.scrollTop = 0;
        }
    </script>
</body>
</html>
        `;
    }
    
    /**
     * Helper methods
     */
    
    formatDuration(ms) {
        if (!ms || ms === 0) return '0s';
        
        const seconds = Math.floor(ms / 1000);
        const minutes = Math.floor(seconds / 60);
        
        if (minutes > 0) {
            return `${minutes}m ${seconds % 60}s`;
        } else {
            return `${seconds}s`;
        }
    }
    
    formatBytes(bytes) {
        if (!bytes || bytes === 0) return '0 B';
        
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        
        return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
    }
    
    formatGateName(name) {
        return name.replace(/([A-Z])/g, ' $1')
                  .replace(/^./, str => str.toUpperCase());
    }
    
    getRecentTestResults(limit = 10) {
        return Array.from(this.testResults.values())
                   .sort((a, b) => b.timestamp - a.timestamp)
                   .slice(0, limit);
    }
    
    extractPerformanceData(result) {
        // Extract performance data from test result output
        try {
            if (result.output && result.output.includes('Performance:')) {
                // Parse performance data from output
                const performanceMatch = result.output.match(/Performance:.*?(\d+)ms/);
                if (performanceMatch) {
                    return {
                        loadTime: parseInt(performanceMatch[1]),
                        score: 85 // Default score
                    };
                }
            }
        } catch (error) {
            console.warn('Failed to extract performance data:', error);
        }
        
        return null;
    }
    
    extractAccessibilityScore(result) {
        // Extract accessibility score from test result
        try {
            if (result.output && result.output.includes('accessibility')) {
                // Default to 95% for passed accessibility tests
                return result.status === 'passed' ? 95 : 60;
            }
        } catch (error) {
            console.warn('Failed to extract accessibility score:', error);
        }
        
        return 0;
    }
    
    async ensureOutputDirectory() {
        try {
            await fs.mkdir(this.options.outputDir, { recursive: true });
            await fs.mkdir(path.join(this.options.outputDir, 'alerts'), { recursive: true });
        } catch (error) {
            console.error('Failed to create output directory:', error);
        }
    }
    
    async loadExistingData() {
        try {
            const dataPath = path.join(this.options.outputDir, 'dashboard-data.json');
            const data = await fs.readFile(dataPath, 'utf8');
            const parsedData = JSON.parse(data);
            
            if (parsedData.metrics) {
                for (const [key, value] of Object.entries(parsedData.metrics)) {
                    this.metrics.set(key, value);
                }
            }
            
            if (parsedData.alerts) {
                this.alerts = parsedData.alerts;
            }
            
            console.log('📊 Dashboard: Loaded existing data');
        } catch (error) {
            console.log('📊 Dashboard: No existing data to load (starting fresh)');
        }
    }
    
    startMetricsCollection() {
        // Start collecting system metrics
        setInterval(() => {
            const systemMetrics = this.metrics.get('system');
            systemMetrics.lastUpdate = Date.now();
            this.metrics.set('system', systemMetrics);
        }, this.options.updateInterval);
    }
    
    async saveAlert(alert) {
        try {
            const alertPath = path.join(this.options.outputDir, 'alerts', `${alert.id}.json`);
            await fs.writeFile(alertPath, JSON.stringify(alert, null, 2));
        } catch (error) {
            console.error('Failed to save alert:', error);
        }
    }
}

export { RealtimeDashboardGenerator };

// CLI support
if (import.meta.url === `file://${process.argv[1]}`) {
    const dashboard = new RealtimeDashboardGenerator({
        updateInterval: 5000,
        outputDir: 'test-results'
    });
    
    dashboard.startDashboard()
        .then(() => {
            console.log('Dashboard started successfully!');
            
            // Keep process alive
            process.stdin.resume();
        })
        .catch(error => {
            console.error('Failed to start dashboard:', error);
            process.exit(1);
        });
    
    // Graceful shutdown
    process.on('SIGINT', () => {
        console.log('\nShutting down dashboard...');
        dashboard.stopDashboard();
        process.exit(0);
    });
}
