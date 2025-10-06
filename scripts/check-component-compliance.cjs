#!/usr/bin/env node

/**
 * Component Theme Compliance Checker
 * 
 * Scans .vue component files to verify they use CSS variables
 * instead of hardcoded values for theming.
 */

const fs = require('fs');
const path = require('path');

class ComponentComplianceChecker {
  constructor() {
    this.results = {
      total: 0,
      compliant: 0,
      nonCompliant: 0,
      warnings: 0,
      components: []
    };
    
    // Patterns to detect hardcoded values
    this.patterns = {
      // Hardcoded colors (hex, rgb, rgba)
      colors: /(?:color|background|border-color|fill|stroke):\s*(?:#[0-9a-fA-F]{3,6}|rgb|rgba)\([^)]+\)/g,
      
      // Hardcoded fonts
      fonts: /font-family:\s*['"][^'"]+['"]/g,
      
      // Hardcoded spacing (px, rem, em values not in var())
      spacing: /(?:padding|margin|gap|width|height):\s*\d+(?:px|rem|em)(?!\s*;)/g,
      
      // Hardcoded border-radius
      radius: /border-radius:\s*\d+(?:px|rem|em)(?!\s*;)/g,
      
      // Hardcoded shadows
      shadows: /box-shadow:\s*[^;]+(?<!var\([^)]+\));/g
    };
    
    // Allowed hardcoded values (exceptions)
    this.exceptions = [
      '#fff',
      '#ffffff',
      '#000',
      '#000000',
      'white',
      'black',
      'transparent',
      'inherit',
      'none',
      '0',
      '0px',
      '100%',
      'auto'
    ];
  }
  
  /**
   * Check if a value is an allowed exception
   */
  isException(value) {
    return this.exceptions.some(exception => 
      value.toLowerCase().includes(exception.toLowerCase())
    );
  }
  
  /**
   * Scan a single component file
   */
  scanComponent(filePath) {
    const fileName = path.basename(filePath);
    console.log(`\n📄 Scanning: ${fileName}`);
    
    const content = fs.readFileSync(filePath, 'utf8');
    
    // Extract <style> section
    const styleMatch = content.match(/<style[^>]*>([\s\S]*?)<\/style>/);
    
    if (!styleMatch) {
      console.log('  ⚠️  No <style> section found');
      return {
        file: fileName,
        path: filePath,
        compliant: true,
        issues: [],
        warnings: ['No style section found']
      };
    }
    
    const styleContent = styleMatch[1];
    const issues = [];
    const warnings = [];
    
    // Check for hardcoded colors
    const colorMatches = styleContent.match(this.patterns.colors) || [];
    colorMatches.forEach(match => {
      if (!this.isException(match) && !match.includes('var(')) {
        issues.push({
          type: 'color',
          value: match.trim(),
          suggestion: 'Use var(--gmkb-color-*)'
        });
      }
    });
    
    // Check for hardcoded fonts
    const fontMatches = styleContent.match(this.patterns.fonts) || [];
    fontMatches.forEach(match => {
      if (!match.includes('var(')) {
        warnings.push({
          type: 'font',
          value: match.trim(),
          suggestion: 'Consider using var(--gmkb-font-primary) or var(--gmkb-font-heading)'
        });
      }
    });
    
    // Check for hardcoded spacing
    const spacingMatches = styleContent.match(this.patterns.spacing) || [];
    spacingMatches.forEach(match => {
      if (!this.isException(match) && !match.includes('var(')) {
        issues.push({
          type: 'spacing',
          value: match.trim(),
          suggestion: 'Use var(--gmkb-spacing-* or var(--gmkb-space-*)'
        });
      }
    });
    
    // Check for hardcoded border-radius
    const radiusMatches = styleContent.match(this.patterns.radius) || [];
    radiusMatches.forEach(match => {
      if (!this.isException(match) && !match.includes('var(')) {
        issues.push({
          type: 'radius',
          value: match.trim(),
          suggestion: 'Use var(--gmkb-border-radius*)'
        });
      }
    });
    
    // Check for hardcoded shadows
    const shadowMatches = styleContent.match(this.patterns.shadows) || [];
    shadowMatches.forEach(match => {
      if (!this.isException(match) && !match.includes('var(')) {
        warnings.push({
          type: 'shadow',
          value: match.trim(),
          suggestion: 'Use var(--gmkb-shadow-*)'
        });
      }
    });
    
    const compliant = issues.length === 0;
    
    if (compliant) {
      console.log('  ✅ Component is compliant!');
    } else {
      console.log(`  ❌ Found ${issues.length} compliance issue(s)`);
      issues.forEach(issue => {
        console.log(`    - ${issue.type}: ${issue.value}`);
        console.log(`      → ${issue.suggestion}`);
      });
    }
    
    if (warnings.length > 0) {
      console.log(`  ⚠️  ${warnings.length} warning(s)`);
      warnings.forEach(warning => {
        console.log(`    - ${warning.type}: ${warning.value}`);
      });
    }
    
    return {
      file: fileName,
      path: filePath,
      compliant,
      issues,
      warnings
    };
  }
  
  /**
   * Recursively find all .vue files in directory
   */
  findVueFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
      const filePath = path.join(dir, file);
      const stat = fs.statSync(filePath);
      
      if (stat.isDirectory()) {
        // Skip node_modules, dist, etc.
        if (!['node_modules', 'dist', '.git', 'ARCHIVE'].includes(file)) {
          this.findVueFiles(filePath, fileList);
        }
      } else if (file.endsWith('.vue')) {
        fileList.push(filePath);
      }
    });
    
    return fileList;
  }
  
  /**
   * Scan all components in directory
   */
  scanDirectory(dir) {
    console.log(`\n🔍 Scanning directory: ${dir}\n`);
    console.log('='.repeat(60));
    
    const vueFiles = this.findVueFiles(dir);
    
    console.log(`\nFound ${vueFiles.length} Vue component(s)\n`);
    
    vueFiles.forEach(file => {
      const result = this.scanComponent(file);
      this.results.components.push(result);
      this.results.total++;
      
      if (result.compliant) {
        this.results.compliant++;
      } else {
        this.results.nonCompliant++;
      }
      
      this.results.warnings += result.warnings.length;
    });
  }
  
  /**
   * Generate report
   */
  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('\n📊 COMPLIANCE REPORT\n');
    console.log('='.repeat(60));
    
    console.log(`\nTotal Components: ${this.results.total}`);
    console.log(`✅ Compliant: ${this.results.compliant}`);
    console.log(`❌ Non-Compliant: ${this.results.nonCompliant}`);
    console.log(`⚠️  Total Warnings: ${this.results.warnings}`);
    
    const complianceRate = this.results.total > 0 
      ? ((this.results.compliant / this.results.total) * 100).toFixed(1)
      : 0;
    
    console.log(`\n📈 Compliance Rate: ${complianceRate}%`);
    
    if (this.results.nonCompliant > 0) {
      console.log('\n❌ Non-Compliant Components:\n');
      this.results.components
        .filter(c => !c.compliant)
        .forEach(component => {
          console.log(`  ${component.file}`);
          console.log(`    Issues: ${component.issues.length}`);
          component.issues.forEach(issue => {
            console.log(`      - ${issue.type}: ${issue.value}`);
          });
        });
    }
    
    console.log('\n' + '='.repeat(60));
    
    return this.results;
  }
  
  /**
   * Save results to JSON file
   */
  saveReport(outputPath) {
    const report = {
      timestamp: new Date().toISOString(),
      summary: {
        total: this.results.total,
        compliant: this.results.compliant,
        nonCompliant: this.results.nonCompliant,
        warnings: this.results.warnings,
        complianceRate: this.results.total > 0 
          ? ((this.results.compliant / this.results.total) * 100).toFixed(1) + '%'
          : '0%'
      },
      components: this.results.components
    };
    
    fs.writeFileSync(outputPath, JSON.stringify(report, null, 2));
    console.log(`\n💾 Report saved to: ${outputPath}`);
  }
}

// CLI Usage
if (require.main === module) {
  const args = process.argv.slice(2);
  const dir = args[0] || './components';
  const outputFile = args[1] || './component-compliance-report.json';
  
  console.log(`
╔══════════════════════════════════════════════════════╗
║   Component Theme Compliance Checker                 ║
║   Verifies components use CSS variables for theming  ║
╚══════════════════════════════════════════════════════╝
  `);
  
  if (!fs.existsSync(dir)) {
    console.error(`❌ Directory not found: ${dir}`);
    process.exit(1);
  }
  
  const checker = new ComponentComplianceChecker();
  checker.scanDirectory(dir);
  const results = checker.generateReport();
  checker.saveReport(outputFile);
  
  // Exit with error code if non-compliant
  process.exit(results.nonCompliant > 0 ? 1 : 0);
}

module.exports = ComponentComplianceChecker;
