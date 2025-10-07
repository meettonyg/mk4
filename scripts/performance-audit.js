/**
 * Performance Audit Script
 * Comprehensive performance testing using Lighthouse
 */

import lighthouse from 'lighthouse';
import * as chromeLauncher from 'chrome-launcher';
import { writeFileSync } from 'fs';

const THRESHOLDS = {
  performance: 90,
  accessibility: 90,
  bestPractices: 85,
  seo: 85
};

class PerformanceAuditor {
  constructor(url) {
    this.url = url;
    this.results = null;
  }
  
  async audit() {
    console.log(`🚀 Starting performance audit for: ${this.url}\n`);
    
    // Launch Chrome
    const chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--disable-gpu', '--no-sandbox']
    });
    
    const options = {
      logLevel: 'info',
      output: ['html', 'json'],
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
      throttling: {
        rttMs: 150,
        throughputKbps: 1638.4,
        cpuSlowdownMultiplier: 4
      }
    };
    
    try {
      // Run Lighthouse
      const runnerResult = await lighthouse(this.url, options);
      this.results = runnerResult.lhr;
      
      // Save reports
      this.saveReports(runnerResult);
      
      // Analyze results
      this.analyzeResults();
      this.printReport();
      
      // Check thresholds
      const passed = this.checkThresholds();
      
      await chrome.kill();
      
      return passed;
      
    } catch (error) {
      console.error('❌ Audit failed:', error);
      await chrome.kill();
      throw error;
    }
  }
  
  saveReports(runnerResult) {
    // Save HTML report
    writeFileSync(
      './performance-report.html',
      runnerResult.report[0],
      'utf-8'
    );
    
    // Save JSON report
    writeFileSync(
      './performance-report.json',
      JSON.stringify(runnerResult.lhr, null, 2),
      'utf-8'
    );
    
    console.log('📄 Reports saved:');
    console.log('   - performance-report.html');
    console.log('   - performance-report.json\n');
  }
  
  analyzeResults() {
    const { categories, audits } = this.results;
    
    this.analysis = {
      scores: {
        performance: Math.round(categories.performance.score * 100),
        accessibility: Math.round(categories.accessibility.score * 100),
        bestPractices: Math.round(categories['best-practices'].score * 100),
        seo: Math.round(categories.seo.score * 100)
      },
      metrics: {
        fcp: audits['first-contentful-paint'].numericValue,
        lcp: audits['largest-contentful-paint'].numericValue,
        cls: audits['cumulative-layout-shift'].numericValue,
        tti: audits['interactive'].numericValue,
        tbt: audits['total-blocking-time'].numericValue,
        si: audits['speed-index'].numericValue
      },
      opportunities: [],
      diagnostics: []
    };
    
    // Collect opportunities (optimization suggestions)
    Object.values(audits).forEach(audit => {
      if (audit.details && audit.details.type === 'opportunity' && audit.score < 1) {
        this.analysis.opportunities.push({
          title: audit.title,
          description: audit.description,
          savings: audit.details.overallSavingsMs || 0
        });
      }
    });
    
    // Collect diagnostics (issues)
    Object.values(audits).forEach(audit => {
      if (audit.score !== null && audit.score < 0.9 && audit.score !== 1) {
        this.analysis.diagnostics.push({
          title: audit.title,
          description: audit.description,
          score: Math.round(audit.score * 100)
        });
      }
    });
    
    // Sort by impact
    this.analysis.opportunities.sort((a, b) => b.savings - a.savings);
  }
  
  printReport() {
    console.log('📊 Performance Audit Results');
    console.log('='.repeat(80));
    console.log('');
    
    // Scores
    console.log('🎯 Scores:');
    console.log('-'.repeat(80));
    Object.entries(this.analysis.scores).forEach(([category, score]) => {
      const threshold = THRESHOLDS[category];
      const status = score >= threshold ? '✅' : '❌';
      const label = category.charAt(0).toUpperCase() + category.slice(1).replace(/([A-Z])/g, ' $1');
      console.log(`${status} ${label}: ${score}/100 (threshold: ${threshold})`);
    });
    console.log('');
    
    // Core Web Vitals
    console.log('📈 Core Web Vitals:');
    console.log('-'.repeat(80));
    console.log(`LCP (Largest Contentful Paint): ${(this.analysis.metrics.lcp / 1000).toFixed(2)}s`);
    console.log(`   ${this.getVitalStatus('lcp', this.analysis.metrics.lcp)}`);
    console.log(`FCP (First Contentful Paint): ${(this.analysis.metrics.fcp / 1000).toFixed(2)}s`);
    console.log(`   ${this.getVitalStatus('fcp', this.analysis.metrics.fcp)}`);
    console.log(`CLS (Cumulative Layout Shift): ${this.analysis.metrics.cls.toFixed(3)}`);
    console.log(`   ${this.getVitalStatus('cls', this.analysis.metrics.cls)}`);
    console.log(`TTI (Time to Interactive): ${(this.analysis.metrics.tti / 1000).toFixed(2)}s`);
    console.log(`TBT (Total Blocking Time): ${this.analysis.metrics.tbt.toFixed(0)}ms`);
    console.log(`SI (Speed Index): ${(this.analysis.metrics.si / 1000).toFixed(2)}s`);
    console.log('');
    
    // Opportunities
    if (this.analysis.opportunities.length > 0) {
      console.log('💡 Optimization Opportunities:');
      console.log('-'.repeat(80));
      this.analysis.opportunities.slice(0, 5).forEach((opp, i) => {
        console.log(`${i + 1}. ${opp.title}`);
        console.log(`   Potential savings: ${(opp.savings / 1000).toFixed(2)}s`);
        console.log(`   ${opp.description}`);
        console.log('');
      });
    }
    
    // Diagnostics
    if (this.analysis.diagnostics.length > 0) {
      console.log('⚠️  Issues Found:');
      console.log('-'.repeat(80));
      this.analysis.diagnostics.slice(0, 5).forEach((diag, i) => {
        console.log(`${i + 1}. ${diag.title} (Score: ${diag.score}/100)`);
        console.log(`   ${diag.description}`);
        console.log('');
      });
    }
  }
  
  getVitalStatus(metric, value) {
    const thresholds = {
      lcp: { good: 2500, poor: 4000 },
      fcp: { good: 1800, poor: 3000 },
      cls: { good: 0.1, poor: 0.25 }
    };
    
    const t = thresholds[metric];
    if (!t) return '';
    
    if (value <= t.good) {
      return '✅ Good';
    } else if (value <= t.poor) {
      return '🟡 Needs Improvement';
    } else {
      return '❌ Poor';
    }
  }
  
  checkThresholds() {
    const failures = [];
    
    Object.entries(this.analysis.scores).forEach(([category, score]) => {
      const threshold = THRESHOLDS[category];
      if (score < threshold) {
        failures.push(`${category}: ${score}/100 (threshold: ${threshold})`);
      }
    });
    
    console.log('='.repeat(80));
    if (failures.length === 0) {
      console.log('✅ All performance thresholds passed!');
      return true;
    } else {
      console.log('❌ Performance thresholds not met:');
      failures.forEach(failure => console.log(`   - ${failure}`));
      return false;
    }
  }
}

// Run audit
const url = process.argv[2] || 'http://localhost:8080/wp-admin/post.php?post=1&action=edit';

const auditor = new PerformanceAuditor(url);
auditor.audit()
  .then(passed => {
    process.exit(passed ? 0 : 1);
  })
  .catch(error => {
    console.error('Fatal error:', error);
    process.exit(1);
  });
