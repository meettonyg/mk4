/**
 * Bundle Size Analysis and Optimization Script
 * Analyzes the production bundle and provides optimization recommendations
 */

import { readFileSync, statSync, readdirSync } from 'fs';
import { join, extname } from 'path';
import { gzipSync } from 'zlib';

const DIST_DIR = './dist';
const SIZE_LIMITS = {
  js: 500 * 1024, // 500KB
  css: 100 * 1024, // 100KB
  total: 600 * 1024 // 600KB
};

class BundleAnalyzer {
  constructor() {
    this.results = {
      files: [],
      totalSize: 0,
      totalGzipSize: 0,
      warnings: [],
      recommendations: []
    };
  }
  
  analyze() {
    console.log('🔍 Analyzing bundle size...\n');
    
    this.scanDirectory(DIST_DIR);
    this.calculateTotals();
    this.checkLimits();
    this.generateRecommendations();
    this.printReport();
    
    return this.results;
  }
  
  scanDirectory(dir, prefix = '') {
    const files = readdirSync(dir);
    
    files.forEach(file => {
      const fullPath = join(dir, file);
      const stat = statSync(fullPath);
      
      if (stat.isDirectory()) {
        this.scanDirectory(fullPath, `${prefix}${file}/`);
      } else {
        this.analyzeFile(fullPath, `${prefix}${file}`);
      }
    });
  }
  
  analyzeFile(fullPath, relativePath) {
    const ext = extname(fullPath).toLowerCase();
    
    // Only analyze JS and CSS
    if (!['.js', '.css'].includes(ext)) return;
    
    const content = readFileSync(fullPath);
    const size = content.length;
    const gzipSize = gzipSync(content).length;
    
    const fileInfo = {
      path: relativePath,
      size,
      gzipSize,
      sizeKB: (size / 1024).toFixed(2),
      gzipKB: (gzipSize / 1024).toFixed(2),
      compression: ((1 - gzipSize / size) * 100).toFixed(1),
      type: ext.replace('.', '')
    };
    
    this.results.files.push(fileInfo);
    this.results.totalSize += size;
    this.results.totalGzipSize += gzipSize;
  }
  
  calculateTotals() {
    this.results.totalSizeKB = (this.results.totalSize / 1024).toFixed(2);
    this.results.totalGzipKB = (this.results.totalGzipSize / 1024).toFixed(2);
    this.results.totalCompression = ((1 - this.results.totalGzipSize / this.results.totalSize) * 100).toFixed(1);
  }
  
  checkLimits() {
    // Check individual JS files
    const jsFiles = this.results.files.filter(f => f.type === 'js');
    jsFiles.forEach(file => {
      if (file.gzipSize > SIZE_LIMITS.js) {
        this.results.warnings.push({
          type: 'FILE_TOO_LARGE',
          file: file.path,
          size: file.gzipKB,
          limit: (SIZE_LIMITS.js / 1024).toFixed(0),
          message: `${file.path} exceeds 500KB gzipped`
        });
      }
    });
    
    // Check total size
    if (this.results.totalGzipSize > SIZE_LIMITS.total) {
      this.results.warnings.push({
        type: 'TOTAL_TOO_LARGE',
        size: this.results.totalGzipKB,
        limit: (SIZE_LIMITS.total / 1024).toFixed(0),
        message: `Total bundle size exceeds 600KB gzipped`
      });
    }
    
    // Check CSS size
    const cssFiles = this.results.files.filter(f => f.type === 'css');
    const totalCSS = cssFiles.reduce((sum, f) => sum + f.gzipSize, 0);
    if (totalCSS > SIZE_LIMITS.css) {
      this.results.warnings.push({
        type: 'CSS_TOO_LARGE',
        size: (totalCSS / 1024).toFixed(2),
        limit: (SIZE_LIMITS.css / 1024).toFixed(0),
        message: `CSS bundle exceeds 100KB gzipped`
      });
    }
  }
  
  generateRecommendations() {
    const { files, totalGzipSize } = this.results;
    
    // Find large dependencies
    const largeFiles = files
      .filter(f => f.gzipSize > 50 * 1024) // > 50KB
      .sort((a, b) => b.gzipSize - a.gzipSize);
    
    if (largeFiles.length > 0) {
      this.results.recommendations.push({
        priority: 'HIGH',
        title: 'Large files detected',
        files: largeFiles.map(f => `${f.path} (${f.gzipKB}KB)`),
        actions: [
          'Consider code splitting for large components',
          'Use dynamic imports for routes',
          'Check for duplicate dependencies',
          'Remove unused imports'
        ]
      });
    }
    
    // Check compression ratio
    files.forEach(file => {
      const compressionRatio = parseFloat(file.compression);
      if (compressionRatio < 50) {
        this.results.recommendations.push({
          priority: 'MEDIUM',
          title: 'Poor compression ratio',
          files: [`${file.path} (${file.compression}% compression)`],
          actions: [
            'File may contain already-compressed data',
            'Check for base64-encoded assets',
            'Consider moving images to separate files'
          ]
        });
      }
    });
    
    // Total size recommendations
    if (totalGzipSize > SIZE_LIMITS.total * 0.8) {
      this.results.recommendations.push({
        priority: 'HIGH',
        title: 'Approaching size limit',
        message: `Bundle is at ${((totalGzipSize / SIZE_LIMITS.total) * 100).toFixed(0)}% of limit`,
        actions: [
          'Audit npm dependencies for size',
          'Use import maps for shared dependencies',
          'Enable tree shaking',
          'Remove dev-only code'
        ]
      });
    }
    
    // Vue optimization
    const vueSize = files.find(f => f.path.includes('vue'))?.gzipSize || 0;
    if (vueSize > 100 * 1024) {
      this.results.recommendations.push({
        priority: 'MEDIUM',
        title: 'Vue bundle could be optimized',
        actions: [
          'Use vue.runtime.esm-bundler.js instead of full build',
          'Disable Vue devtools in production',
          'Set __VUE_OPTIONS_API__: false if not using Options API'
        ]
      });
    }
  }
  
  printReport() {
    console.log('📦 Bundle Analysis Report');
    console.log('='.repeat(60));
    console.log('');
    
    // Files table
    console.log('📄 Files:');
    console.log('-'.repeat(60));
    this.results.files.forEach(file => {
      const status = file.gzipSize > SIZE_LIMITS.js ? '⚠️ ' : '✅';
      console.log(`${status} ${file.path}`);
      console.log(`   Size: ${file.sizeKB}KB → ${file.gzipKB}KB (${file.compression}% compression)`);
    });
    console.log('');
    
    // Totals
    console.log('📊 Totals:');
    console.log('-'.repeat(60));
    console.log(`Total Size: ${this.results.totalSizeKB}KB`);
    console.log(`Gzipped: ${this.results.totalGzipKB}KB (${this.results.totalCompression}% compression)`);
    console.log(`Limit: ${(SIZE_LIMITS.total / 1024).toFixed(0)}KB`);
    console.log(`Usage: ${((this.results.totalGzipSize / SIZE_LIMITS.total) * 100).toFixed(1)}%`);
    console.log('');
    
    // Warnings
    if (this.results.warnings.length > 0) {
      console.log('⚠️  Warnings:');
      console.log('-'.repeat(60));
      this.results.warnings.forEach(warning => {
        console.log(`❌ ${warning.message}`);
        if (warning.file) {
          console.log(`   File: ${warning.file}`);
        }
        console.log(`   Size: ${warning.size}KB / Limit: ${warning.limit}KB`);
        console.log('');
      });
    }
    
    // Recommendations
    if (this.results.recommendations.length > 0) {
      console.log('💡 Recommendations:');
      console.log('-'.repeat(60));
      this.results.recommendations.forEach(rec => {
        const icon = rec.priority === 'HIGH' ? '🔴' : '🟡';
        console.log(`${icon} ${rec.title}`);
        if (rec.message) {
          console.log(`   ${rec.message}`);
        }
        if (rec.files) {
          console.log('   Files:');
          rec.files.forEach(file => console.log(`     - ${file}`));
        }
        if (rec.actions) {
          console.log('   Actions:');
          rec.actions.forEach(action => console.log(`     • ${action}`));
        }
        console.log('');
      });
    }
    
    // Pass/Fail
    console.log('='.repeat(60));
    if (this.results.warnings.length === 0) {
      console.log('✅ All checks passed!');
    } else {
      console.log(`❌ ${this.results.warnings.length} warning(s) found`);
      process.exit(1);
    }
  }
}

// Run analysis
const analyzer = new BundleAnalyzer();
analyzer.analyze();
